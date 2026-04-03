import React, { useState } from 'react';
import { X, Palette, Sparkles, Moon, Sun, CheckCircle2, BookOpen, Heading, Box, AlignLeft, AlignCenter, AlignRight, Layout, Image, Clock, Activity, ToggleLeft, GripVertical, Check } from 'lucide-react';
import { DashboardTheme, ThemeMode, HeaderConfig, HeaderPosition, TextAlignment, DashboardPage, ThemePreset, HeaderWidgetType, HeaderWidget } from '../types';
import { BRAND_COLORS } from '../constants';
import Switch from './Switch';
import ModeToggle from './ModeToggle';

/** primary hex 기준 5~95 스케일 색 계산 (DesignSystem과 동일 공식) */
function shadeColor(hex: string, percent: number): string {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return hex;
  let R = parseInt(m[1], 16);
  let G = parseInt(m[2], 16);
  let B = parseInt(m[3], 16);
  R = Math.min(255, Math.max(0, Math.floor(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, Math.floor(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, Math.floor(B * (100 + percent) / 100)));
  return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
}

/** 배경 이미지: 화질 유지 위해 리사이즈만 하고 JPEG 품질 최대(0.98). 원본에 가깝게 저장 */
const MAX_BG_DIMENSION = 3840;
const JPEG_QUALITY = 0.98;
function compressImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const scale = Math.min(1, MAX_BG_DIMENSION / Math.max(w, h));
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement('canvas');
      canvas.width = cw;
      canvas.height = ch;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, cw, ch);
      try {
        const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
        resolve(dataUrl);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };
    img.src = url;
  });
}

interface DesignSidebarProps {
  theme: DashboardTheme;
  header: HeaderConfig;
  currentPage: DashboardPage;
  presets: ThemePreset[];
  updateTheme: (newTheme: Partial<DashboardTheme>) => void;
  updateHeader: (newHeader: Partial<HeaderConfig>) => void;
  onUpdatePage: (updates: Partial<DashboardPage>) => void;
  onSavePreset: (name: string) => void;
  onApplyPreset: (preset: ThemePreset) => void;
  onOpenDocs: () => void;
  onClose: () => void;
  onModeSwitch: (mode: ThemeMode) => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onSave?: () => void;
}

type TabType = 'mode' | 'global' | 'header' | 'advanced';

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  theme, header, currentPage, presets,
  updateTheme, updateHeader, onUpdatePage,
  onSavePreset, onApplyPreset, onOpenDocs, onClose, onModeSwitch, onDragStart, onSave
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mode');
  const [newPresetName, setNewPresetName] = useState('');

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName) return;
    onSavePreset(newPresetName);
    setNewPresetName('');
    setActiveTab('mode');
  };

  const tabs = [
    { id: 'mode', label: 'Mode', icon: Sparkles },
    { id: 'global', label: 'Global', icon: Palette },
    { id: 'header', label: 'Header', icon: Heading },
    { id: 'advanced', label: 'Advanced', icon: Box },
  ];

  return (
    <div className={`w-80 max-h-[85vh] flex flex-col panel-inner-container overflow-hidden transition-all duration-500 border ${
      theme.mode === ThemeMode.LIGHT ? "text-slate-800" : "text-slate-50"
    }`} style={{
      borderRadius: 'var(--radius-panel)',
      border: 'var(--floating-panel-border)',
    }}>
      <header className="flex items-center justify-between h-[68px] px-4 border-b border-[var(--border-base)] bg-transparent shrink-0 cursor-move" onMouseDown={onDragStart}>
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted/30" />
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tighter text-main leading-none">Design System</h2>
        </div>
        <div className="flex items-center gap-1.5">
          {onOpenDocs && (
            <button
              onClick={onOpenDocs}
              className="p-1.5 rounded-xl transition-all hover:bg-black/5 dark:hover:bg-white/5 text-muted hover:text-main"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          )}
          <button onClick={onSave} className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg" title="저장하기">
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-muted hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex shrink-0 border-b border-[var(--border-base)] bg-transparent">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-[var(--surface)]' : 'border-transparent text-muted hover:text-main'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-micro font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {activeTab === 'mode' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Select Mode</h3>
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset)}
                    className={`group relative p-4 rounded-2xl border transition-all text-left overflow-hidden glass-item ${
                      theme.name === preset.name 
                        ? 'border-primary ring-2 ring-primary/20 bg-primary/5' 
                        : 'hover:border-primary'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl shadow-lg border border-white/20 overflow-hidden flex flex-col">
                        <div className="flex-1" style={{ backgroundColor: preset.theme.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: preset.theme.backgroundColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-main truncate">{preset.name}</p>
                        <p className="text-caption text-muted uppercase font-bold">{preset.theme.mode.toUpperCase()} • {preset.theme.borderRadius} Radius</p>
                      </div>
                      {theme.name === preset.name && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Brand Primary Color</h3>
              <div className="flex flex-wrap items-center gap-2.5 py-2">
                {['#3b82f6', '#6366f1', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#64748b'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateTheme({ primaryColor: color })}
                    className={`w-8 h-8 shrink-0 rounded-[6px] flex items-center justify-center transition-all ${
                      theme.primaryColor === color ? 'ring-2 ring-[var(--primary-color)] ring-offset-2 ring-offset-[#040610] scale-110 shadow-[0_0_12px_rgba(var(--primary-rgb),0.3)]' : 'opacity-80 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {theme.primaryColor === color && <Check className="w-3.5 h-3.5 text-white drop-shadow-sm" />}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl mt-1 glass-item">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: theme.primaryColor }} />
                  <input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.startsWith('#')) updateTheme({ primaryColor: val });
                    }}
                    className="w-20 bg-transparent border-none p-0 text-caption font-bold uppercase text-main outline-none focus:ring-0"
                    placeholder="#HEX"
                  />
                </div>
                <div className="relative w-5 h-5 group">
                  <Palette className="w-4 h-4 text-muted group-hover:text-primary transition-colors" />
                  <input
                    type="color"
                    value={theme.primaryColor.startsWith('#') ? theme.primaryColor : (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim() : '')}
                    onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex gap-1 h-3 rounded-full overflow-hidden opacity-80 mt-3">
                {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95].map(step => {
                  const baseHex = theme.primaryColor.startsWith('#') && theme.primaryColor.length >= 7
                    ? theme.primaryColor.slice(0, 7)
                    : '#6366f1';
                  const shadeHex = shadeColor(baseHex, (step - 50) * -1.5);
                  return <div key={step} className="flex-1" style={{ backgroundColor: shadeHex }} />;
                })}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Grid & Radius</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption uppercase font-bold text-muted">Border Radius</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.borderRadius}px</span>
                  </div>
                  <input
                    type="range" min="0" max="40" step="4"
                    value={theme.borderRadius}
                    onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption uppercase font-bold text-muted">Widget Border Width</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.borderWidth ?? 1}px</span>
                  </div>
                  <input
                    type="range" min="0" max="8" step="1"
                    value={theme.borderWidth ?? 1}
                    onChange={(e) => updateTheme({ borderWidth: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption uppercase font-bold text-muted">Chart Elements Radius</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.chartRadius}px</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="2"
                    value={theme.chartRadius}
                    onChange={(e) => updateTheme({ chartRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption uppercase font-bold text-muted">Widget Spacing</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.spacing}px</span>
                  </div>
                  <input
                    type="range" min="0" max="32" step="2"
                    value={theme.spacing}
                    onChange={(e) => updateTheme({ spacing: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption uppercase font-bold text-muted">Dashboard Padding</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.dashboardPadding}px</span>
                  </div>
                  <input
                    type="range" min="0" max="80" step="4"
                    value={theme.dashboardPadding}
                    onChange={(e) => updateTheme({ dashboardPadding: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Typography Scale</h3>
              <div className="space-y-3">
                {[
                  { label: 'Title Size', key: 'titleSize', min: 12, max: 32 },
                  { label: 'Content (Base)', key: 'contentSize', min: 8, max: 24 },
                  { label: 'Tiny Scale', key: 'textTiny', min: 6, max: 16 },
                  { label: 'Small Scale', key: 'textSmall', min: 8, max: 20 },
                  { label: 'Medium Scale', key: 'textMd', min: 12, max: 32 },
                  { label: 'Large Scale', key: 'textLg', min: 20, max: 60 },
                  { label: 'Hero Scale', key: 'textHero', min: 0, max: 100 },
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-caption uppercase font-bold text-muted">{item.label}</span>
                      <span className="text-xs font-mono text-primary font-bold">{(theme as any)[item.key]}px</span>
                    </div>
                    <input
                      type="range" min={item.min} max={item.max} step="1"
                      value={(theme as any)[item.key]}
                      onChange={(e) => updateTheme({ [item.key]: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-300/40 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)] transition-all"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'header' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Dashboard Header</h3>
                <Switch
                  checked={header.show}
                  onChange={(checked) => updateHeader({ show: checked })}
                />
              </div>

              {header.show && (
                <div className="space-y-5 pt-4 border-t border-[var(--border-base)] animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-caption uppercase font-bold text-muted">Position</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateHeader({ position: HeaderPosition.TOP })}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all glass-item ${header.position === HeaderPosition.TOP ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]' : 'border-[var(--border-base)] text-muted hover:border-primary/50'}`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => updateHeader({ position: HeaderPosition.LEFT })}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all glass-item ${header.position === HeaderPosition.LEFT ? 'bg-[var(--primary-color)]/10 border-[var(--primary-color)] text-[var(--primary-color)] shadow-[0_0_12px_rgba(var(--primary-rgb),0.1)]' : 'border-[var(--border-base)] text-muted hover:border-primary/50'}`}
                        >
                          Left
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-caption uppercase font-bold text-muted">
                          {header.position === HeaderPosition.TOP ? 'Height' : 'Width'}
                        </span>
                        <span className="text-xs font-mono text-primary font-bold">
                          {header.position === HeaderPosition.TOP ? header.height : header.width}px
                        </span>
                      </div>
                      <input
                        type="range" min="40" max={header.position === HeaderPosition.TOP ? 120 : 400} step="4"
                        value={header.position === HeaderPosition.TOP ? header.height : header.width}
                        onChange={(e) => updateHeader(header.position === HeaderPosition.TOP ? { height: parseInt(e.target.value) } : { width: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-300/40 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-caption uppercase font-bold text-muted">Appearance</span>
                      <div className="flex items-center justify-between p-3 rounded-2xl glass-item">
                        <span className="text-caption font-bold text-muted uppercase">
                          Show {header.position === HeaderPosition.TOP ? 'Bottom' : 'Right'} Line
                        </span>
                        <Switch
                          checked={header.showDivider !== false}
                          onChange={(checked) => updateHeader({ showDivider: checked })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-caption uppercase font-bold text-muted">Title Content</span>
                      <input
                        type="text"
                        value={header.title}
                        onChange={(e) => updateHeader({ title: e.target.value })}
                        className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-caption uppercase font-bold text-muted">Alignment</span>
                      <div className="flex items-center gap-1.5 p-1.5 bg-transparent rounded-2xl border border-[var(--border-base)] glass-item w-fit">
                        {[TextAlignment.LEFT, TextAlignment.CENTER, TextAlignment.RIGHT].map((align) => (
                          <button
                            key={align}
                            onClick={() => updateHeader({ textAlignment: align })}
                            className={`w-9 h-8 rounded-lg transition-all flex items-center justify-center ${header.textAlignment === align ? 'bg-[var(--primary-color)]/20 text-[var(--primary-color)] border border-[var(--primary-color)] shadow-sm font-bold' : 'text-muted hover:text-main hover:bg-white/5'}`}
                          >
                            {align === TextAlignment.LEFT && <AlignLeft className="w-4 h-4" />}
                            {align === TextAlignment.CENTER && <AlignCenter className="w-4 h-4" />}
                            {align === TextAlignment.RIGHT && <AlignRight className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-caption uppercase font-bold text-muted">Background Color</span>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-micro font-bold uppercase text-muted group-hover:text-primary transition-colors">Transparent</span>
                        <Switch
                          checked={header.backgroundColor === 'transparent'}
                          onChange={(checked) => updateHeader({ backgroundColor: checked ? 'transparent' : theme.backgroundColor })}
                        />
                      </label>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-2xl glass-item ${header.backgroundColor === 'transparent' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: header.backgroundColor }} />
                        <input
                          type="text"
                          value={header.backgroundColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('#') || val === 'transparent') {
                              updateHeader({ backgroundColor: val });
                            }
                          }}
                          className="w-20 bg-transparent border-none p-0 text-xs font-bold uppercase text-main outline-none focus:ring-0"
                          title="HEX Color Code"
                        />
                      </div>
                      <input
                        type="color"
                        value={header.backgroundColor !== 'transparent' && header.backgroundColor.startsWith('#') ? header.backgroundColor : (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() : '')}
                        onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                      />
                    </div>
                  </div>

                  {/* Header Background Image */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-caption uppercase font-bold text-muted flex items-center gap-1.5">
                        <Image className="w-3.5 h-3.5" /> Background Image
                      </span>
                      {header.backgroundImage && (
                        <button
                          type="button"
                          onClick={() => updateHeader({ backgroundImage: undefined })}
                          className="px-2 py-1 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] text-micro font-bold uppercase tracking-wider hover:bg-[var(--border-muted)] transition-colors"
                        >
                          리셋
                        </button>
                      )}
                    </div>
                    {header.backgroundImage && (
                      <div className="relative w-full h-16 rounded-xl overflow-hidden border border-[var(--border-base)]">
                        <img
                          src={header.backgroundImage}
                          alt="Header BG"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                        <span className="absolute bottom-1 left-2 text-nano font-bold text-white/80 uppercase tracking-widest drop-shadow">Preview</span>
                      </div>
                    )}
                    <div className="p-3 rounded-xl border border-[var(--border-base)] glass-item flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        className="hidden"
                        id="header-bg-image-file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => {
                            updateHeader({ backgroundImage: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }}
                      />
                      <label htmlFor="header-bg-image-file" className="shrink-0 px-4 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] text-xs font-bold cursor-pointer hover:bg-[var(--border-muted)] transition-colors">파일 선택</label>
                      <span className={`text-xs truncate ${header.backgroundImage ? 'text-[var(--success)]' : 'text-muted'}`}>
                        {header.backgroundImage ? '이미지 적용됨' : '선택된 파일 없음'}
                      </span>
                    </div>
                    <input
                      type="text"
                      placeholder="URL (예: /assets/header-bg.png)"
                      value={header.backgroundImage?.startsWith('data:') ? '' : (header.backgroundImage ?? '')}
                      onChange={(e) => updateHeader({ backgroundImage: e.target.value.trim() || undefined })}
                      className="w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)] rounded-xl placeholder:text-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-caption uppercase font-bold text-muted">Text Color</span>
                    <div className="flex items-center justify-between p-3 rounded-2xl glass-item">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: header.textColor }} />
                        <input
                          type="text"
                          value={header.textColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('#')) {
                              updateHeader({ textColor: val });
                            }
                          }}
                          className="w-20 bg-transparent border-none p-0 text-caption font-bold uppercase text-main outline-none focus:ring-0"
                        />
                      </div>
                      <input
                        type="color"
                        value={header.textColor}
                        onChange={(e) => updateHeader({ textColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                    <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Page Tabs</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-caption font-bold uppercase text-main">Show Page Tabs</p>
                          <p className="text-micro text-muted">Hide for single page dashboards</p>
                        </div>
                        <Switch
                          checked={theme.showPageTabs !== false}
                          onChange={(checked) => updateTheme({ showPageTabs: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                    <h3 className="text-xs font-bold uppercase text-muted tracking-wider flex items-center gap-2">
                      Header Components
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: HeaderWidgetType.CLOCK, icon: Clock, label: 'Clock' },
                        { type: HeaderWidgetType.MONITOR, icon: Activity, label: 'Monitor' },
                        { type: HeaderWidgetType.THEME_TOGGLE, icon: ToggleLeft, label: 'Toggle' },
                      ].map((item) => (
                        <div
                          key={item.type}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('headerWidgetType', item.type);
                          }}
                          onClick={() => {
                            const currentWidgets = header.widgets || [];
                            const widgetWidth = item.type === HeaderWidgetType.CLOCK ? 6 : (item.type === HeaderWidgetType.MONITOR ? 5 : 4);

                            // 겹치지 않는 X 위치 찾기 (60칸 기준)
                            let nextX = 0;
                            const isOccupied = (x: number) => currentWidgets.some(w =>
                              w.y === 0 && (
                                (x >= w.x && x < w.x + w.w) ||
                                (x + widgetWidth > w.x && x + widgetWidth <= w.x + w.w)
                              )
                            );

                            while (isOccupied(nextX) && nextX < 54) {
                              nextX += 2;
                            }

                            const newWidget: HeaderWidget = {
                              id: `hw_${Date.now()}`,
                              type: item.type,
                              x: nextX,
                              y: 0,
                              w: widgetWidth,
                              h: 6,
                            };
                            updateHeader({
                              widgets: [...currentWidgets, newWidget]
                            });
                          }}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl border border-[var(--border-base)] bg-[var(--surface)] hover:border-primary hover:bg-primary/5 transition-all cursor-grab active:cursor-grabbing group"
                        >
                          <item.icon className="w-5 h-5 text-muted group-hover:text-primary transition-colors" />
                          <span className="text-nano font-bold uppercase text-muted group-hover:text-primary truncate w-full text-center">{item.label}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-micro text-muted italic text-center">Drag or click to add to header</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-caption font-bold uppercase text-primary tracking-widest leading-none mb-1">Design Mode</p>
                <p className="text-xs font-bold text-main uppercase">{theme.mode} Mode Styles</p>
              </div>
              <div className="p-2 bg-[var(--surface)] shadow-sm rounded-xl border border-[var(--border-base)]">
                {theme.mode === ThemeMode.LIGHT ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </div>
            </div>

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Custom Colors</h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-2xl glass-item">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.backgroundColor }} />
                      <input
                        type="text"
                        value={theme.backgroundColor}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val.startsWith('#')) updateTheme({ backgroundColor: val });
                        }}
                        className="w-20 bg-transparent border-none p-0 text-caption font-bold uppercase text-main outline-none focus:ring-0"
                      />
                    </div>
                    <input
                      type="color"
                      value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--background').trim() : '')}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl glass-item">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.surfaceColor }} />
                    <input
                      type="text"
                      value={theme.surfaceColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#')) updateTheme({ surfaceColor: val });
                      }}
                      className="w-20 bg-transparent border-none p-0 text-caption font-bold uppercase text-main outline-none focus:ring-0"
                    />
                  </div>
                  <input
                    type="color"
                    value={theme.surfaceColor.startsWith('#') ? theme.surfaceColor : (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() : '')}
                    onChange={(e) => updateTheme({ surfaceColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-2xl glass-item">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.titleColor }} />
                    <input
                      type="text"
                      value={theme.titleColor}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#')) updateTheme({ titleColor: val });
                      }}
                      className="w-20 bg-transparent border-none p-0 text-caption font-bold uppercase text-main outline-none focus:ring-0"
                    />
                  </div>
                  <input
                    type="color"
                    value={theme.titleColor.startsWith('#') ? theme.titleColor : (typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue('--text-main').trim() : '')}
                    onChange={(e) => updateTheme({ titleColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider flex items-center gap-2">
                  <Image className="w-3.5 h-3.5" /> Background Image
                </h3>
                {(currentPage.layout?.backgroundImage || currentPage.layout?.backgroundImageLight || currentPage.layout?.backgroundImageDark) && (
                  <button
                    type="button"
                    onClick={() => onUpdatePage({
                      layout: {
                        ...currentPage.layout,
                        backgroundImage: undefined,
                        backgroundImageLight: undefined,
                        backgroundImageDark: undefined,
                      },
                    })}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] text-caption font-bold uppercase tracking-wider hover:bg-[var(--border-muted)] transition-colors"
                  >
                    리셋
                  </button>
                )}
              </div>
              <p className="text-caption text-muted uppercase tracking-tight">라이트/다크 모드별로 다른 배경을 넣으면 테마 전환 시 자연스럽게 바뀝니다. (미설정 시 공통 배경 사용)</p>

              <div className="space-y-3">
                <p className="text-caption font-bold uppercase text-muted flex items-center gap-1.5"><Sun className="w-3 h-3" /> 라이트 모드 배경</p>
                <div className="p-3 rounded-xl border border-[var(--border-base)] glass-item flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden"
                    id="bg-image-file-light"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      compressImageToDataUrl(file).then((dataUrl) => {
                        onUpdatePage({ layout: { ...currentPage.layout, backgroundImageLight: dataUrl } });
                      }).catch(() => { /* 이미지 로드 실패 시 무시 */ });
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="bg-image-file-light" className="shrink-0 px-4 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] text-xs font-bold cursor-pointer hover:bg-[var(--border-muted)] transition-colors">파일 선택</label>
                  <span className={`text-xs ${currentPage.layout?.backgroundImageLight ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {currentPage.layout?.backgroundImageLight ? '이미지 적용됨' : '선택된 파일 없음'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="라이트 모드 URL (예: /assets/bg-light.png)"
                  value={currentPage.layout?.backgroundImageLight?.startsWith('data:') ? '' : (currentPage.layout?.backgroundImageLight ?? '')}
                  onChange={(e) => onUpdatePage({ layout: { ...currentPage.layout, backgroundImageLight: e.target.value.trim() || undefined } })}
                  className="w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)] rounded-xl placeholder:text-muted"
                />
              </div>

              <div className="space-y-3">
                <p className="text-caption font-bold uppercase text-muted flex items-center gap-1.5"><Moon className="w-3 h-3" /> 다크 모드 배경</p>
                <div className="p-3 rounded-xl border border-[var(--border-base)] glass-item flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    className="hidden"
                    id="bg-image-file-dark"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      compressImageToDataUrl(file).then((dataUrl) => {
                        onUpdatePage({ layout: { ...currentPage.layout, backgroundImageDark: dataUrl } });
                      }).catch(() => { /* 이미지 로드 실패 시 무시 */ });
                      e.target.value = '';
                    }}
                  />
                  <label htmlFor="bg-image-file-dark" className="shrink-0 px-4 py-2 rounded-lg border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-main)] text-xs font-bold cursor-pointer hover:bg-[var(--border-muted)] transition-colors">파일 선택</label>
                  <span className={`text-xs ${currentPage.layout?.backgroundImageDark ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                    {currentPage.layout?.backgroundImageDark ? '이미지 적용됨' : '선택된 파일 없음'}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="다크 모드 URL (예: /assets/bg-dark.png)"
                  value={currentPage.layout?.backgroundImageDark?.startsWith('data:') ? '' : (currentPage.layout?.backgroundImageDark ?? '')}
                  onChange={(e) => onUpdatePage({ layout: { ...currentPage.layout, backgroundImageDark: e.target.value.trim() || undefined } })}
                  className="w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-xs outline-none focus:ring-2 focus:ring-[var(--primary-color)] rounded-xl placeholder:text-muted"
                />
              </div>

              <p className="text-caption text-muted uppercase tracking-tight">공통 배경 (라이트/다크 미설정 시 사용)</p>
              <input
                type="text"
                placeholder="/assets/bg-project2.png 또는 URL"
                value={currentPage.layout?.backgroundImage?.startsWith('data:') ? '' : (currentPage.layout?.backgroundImage ?? '')}
                onChange={(e) => onUpdatePage({ layout: { ...currentPage.layout, backgroundImage: e.target.value.trim() || undefined } })}
                className="w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-xs outline-none focus:ring-2 focus:ring-[var(--primary-color)] rounded-xl placeholder:text-muted"
              />

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-base)] mt-3">
                <span className="text-caption font-bold uppercase text-muted">지구 배경 (Globe)</span>
                <Switch
                  checked={currentPage.layout?.backgroundGlobe ?? false}
                  onChange={(checked) => onUpdatePage({ layout: { ...currentPage.layout, backgroundGlobe: checked } })}
                />
              </div>
              <p className="text-micro text-muted uppercase tracking-tight">대시보드 배경에 회전하는 지구 표시. 빈 곳 드래그하면 지구가 돌아갑니다 (project3 등)</p>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-base)] mt-3">
                <span className="text-caption font-bold uppercase text-muted">Glassmorphism</span>
                <Switch
                  checked={currentPage.layout?.glassmorphism ?? false}
                  onChange={(checked) => onUpdatePage({ layout: { ...currentPage.layout, glassmorphism: checked } })}
                />
              </div>
              <p className="text-micro text-muted uppercase tracking-tight">위젯 카드를 반투명·블러·테두리 스타일로 (project2 등)</p>
              {currentPage.layout?.glassmorphism && (
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-caption font-bold uppercase text-muted">글래스 투명도</span>
                    <span className="text-xs font-mono text-[var(--primary-color)] font-bold">
                      {currentPage.layout?.glassmorphismOpacity ?? (theme.mode === ThemeMode.LIGHT ? 55 : 35)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={currentPage.layout?.glassmorphismOpacity ?? (theme.mode === ThemeMode.LIGHT ? 55 : 35)}
                    onChange={(e) => onUpdatePage({ layout: { ...currentPage.layout, glassmorphismOpacity: Number(e.target.value) } })}
                    className="w-full h-1.5 bg-gray-300/40 dark:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)] transition-all"
                  />
                  <p className="text-micro text-muted uppercase tracking-tight">왼쪽(0)=완전 투명, 오른쪽(100)=불투명. 슬라이더를 왼쪽으로 낮추면 훨씬 더 투명해집니다</p>
                </div>
              )}
              <p className="text-micro text-muted uppercase tracking-tight mt-2">해상도별 레이아웃·자유 배치는 <strong>Layout Settings</strong> 패널에서 설정할 수 있습니다.</p>
            </section>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[var(--border-base)] bg-transparent">
        <div className="flex items-center justify-between text-caption text-muted font-bold uppercase">
          <span>Current Active Style</span>
          <span className="text-primary">{theme.name || 'Custom'}</span>
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;
