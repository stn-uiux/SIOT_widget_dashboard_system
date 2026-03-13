import React, { useState } from 'react';
import { X, Palette, Sparkles, Moon, Sun, CheckCircle2, BookOpen, Heading, Box, AlignLeft, AlignCenter, AlignRight, Layout, Image, Clock, Activity, ToggleLeft, GripVertical, Check } from 'lucide-react';
import { DashboardTheme, ThemeMode, HeaderConfig, HeaderPosition, TextAlignment, DashboardPage, ThemePreset, HeaderWidgetType, HeaderWidget } from '../types';
import { BRAND_COLORS } from '../constants';
import Switch from './Switch';
import ModeToggle from './ModeToggle';

/** 배경 이미지: 품질 유지 위해 리사이즈 수행하고 JPEG 품질 최대(0.98). 원본에 가깝게 유지 */
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
        const isTransparentFormat = file.type === 'image/png' || file.type === 'image/webp' || file.type === 'image/gif';
        const outputType = isTransparentFormat ? file.type : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, isTransparentFormat ? undefined : JPEG_QUALITY);
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

  const isCyber = theme.mode === ThemeMode.CYBER;

  const tabs = [
    { id: 'mode', label: isCyber ? 'ARCHIVE' : '모드', icon: Sparkles },
    { id: 'global', label: isCyber ? 'SYSTEM' : '전체 설정', icon: Palette },
    { id: 'header', label: isCyber ? 'HUD CFG' : '헤더', icon: Heading },
    { id: 'advanced', label: isCyber ? 'CORE' : '고급 설정', icon: Box },
  ];

  return (
    <div className={`w-80 max-h-[85vh] flex flex-col overflow-hidden transition-all duration-500 rounded ${isCyber ? 'bg-black/95 border border-cyan-500/50 shadow-[0_0_40px_rgba(0,229,255,0.25)]' : 'bg-[var(--surface)] border border-[var(--border-base)] shadow-2xl'}`}>
      <div className={`flex items-center justify-between p-6 border-b cursor-grab active:cursor-grabbing ${isCyber ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-[var(--border-base)]'}`} onMouseDown={onDragStart}>
        <div className="flex items-center gap-2">
          <GripVertical className={`w-4 h-4 ${isCyber ? 'text-cyan-500/50' : 'text-gray-300'}`} />
          <Palette className={`w-5 h-5 ${isCyber ? 'text-cyan-400 animate-pulse' : 'text-primary'}`} />
          <h2 className={`text-lg font-bold tracking-tighter ${isCyber ? 'text-cyan-400 italic' : ''}`}>
             {isCyber ? <span className="glitch-text" data-text="DESIGN_ENGINE_v4">DESIGN_ENGINE_v4</span> : 'Design System'}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onOpenDocs} onMouseDown={(e) => e.stopPropagation()} className={`p-1.5 rounded transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-500/60 hover:text-cyan-400' : 'hover:bg-[var(--border-muted)] text-muted hover:text-primary'}`} title="문서 열기">
            <BookOpen className="w-4 h-4" />
          </button>
          <button onClick={onSave} onMouseDown={(e) => e.stopPropagation()} className={`p-1 rounded transition-all hover:scale-110 active:scale-95 ${isCyber ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'}`} title="저장하기">
            <Check className="w-4 h-4" />
          </button>
          <button onClick={onClose} onMouseDown={(e) => e.stopPropagation()} className={`p-1 rounded-full opacity-60 transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-400' : 'btn-ghost'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={`flex shrink-0 ${isCyber ? 'bg-black border-b border-cyan-500/30 p-1 gap-1' : 'border-b border-[var(--border-base)] bg-gray-50/50 dark:bg-gray-900/50'}`}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all ${isCyber
              ? `btn-surface ${activeTab === tab.id ? 'active' : ''}`
              : `border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-[var(--surface)]' : 'border-transparent text-muted hover:text-main'}`
              }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className={`text-[9px] font-bold uppercase tracking-tighter ${isCyber ? 'italic' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'mode' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">모드 선택</h3>
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset)}
                    className="group relative p-4 rounded border border-[var(--border-base)] hover:border-primary bg-gray-50 dark:bg-gray-800/50 transition-all text-left overflow-hidden"
                  >
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl shadow-lg border border-white/20 overflow-hidden flex flex-col">
                        <div className="flex-1" style={{ backgroundColor: preset.theme.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: preset.theme.backgroundColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--text-main)] truncate">{preset.name}</p>
                        <p className="text-[10px] text-muted uppercase font-bold">{preset.theme.mode.toUpperCase()} 모드 / {preset.theme.borderRadius}px Radius</p>
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
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">브랜드 색상 (Primary)</h3>
              <div className="grid grid-cols-4 gap-2">
                {BRAND_COLORS.map(color => (
                  <button
                    key={color.hex}
                    onClick={() => updateTheme({ primaryColor: color.hex })}
                    className="w-full aspect-square rounded-full border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: color.hex }}
                  >
                    {theme.primaryColor === color.hex && <CheckCircle2 className="w-4 h-4 text-white drop-shadow-md" />}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">기본 그리드 및 라운드</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">모서리 곡률 (Radius)</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.borderRadius}px</span>
                  </div>
                  <input
                    type="range" min="0" max="40" step="4"
                    value={theme.borderRadius}
                    onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">위젯 간격 (Spacing)</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.spacing}px</span>
                  </div>
                  <input
                    type="range" min="0" max="32" step="2"
                    value={theme.spacing}
                    onChange={(e) => updateTheme({ spacing: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-[var(--primary-color)]"
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'header' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">대시보드 헤더</h3>
                <Switch
                  checked={header.show}
                  onChange={(checked) => updateHeader({ show: checked })}
                />
              </div>

              {header.show && (
                <div className="space-y-6 pt-4 border-t border-[var(--border-base)]">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Title Content</span>
                    <input
                      type="text"
                      value={header.title}
                      onChange={(e) => updateHeader({ title: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Alignment</span>
                    <div className="flex bg-gray-50 dark:bg-gray-800 rounded p-1">
                      {[TextAlignment.LEFT, TextAlignment.CENTER, TextAlignment.RIGHT].map((align) => (
                        <button
                          key={align}
                          onClick={() => updateHeader({ textAlignment: align })}
                          className={`flex-1 py-1.5 rounded transition-all flex justify-center ${header.textAlignment === align ? 'bg-white shadow-sm text-primary' : 'text-muted'}`}
                        >
                          {align === TextAlignment.LEFT && <AlignLeft className="w-4 h-4" />}
                          {align === TextAlignment.CENTER && <AlignCenter className="w-4 h-4" />}
                          {align === TextAlignment.RIGHT && <AlignRight className="w-4 h-4" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">대시보드 커스텀 배경</h3>
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-muted">라이트 모드 배경</p>
                <div className="p-3 rounded-xl border border-[var(--border-base)] bg-[var(--surface-muted)] flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="bg-image-file-light"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      compressImageToDataUrl(file).then((dataUrl) => {
                        onUpdatePage({ layout: { ...currentPage.layout, backgroundImageLight: dataUrl } });
                      });
                    }}
                  />
                  <label htmlFor="bg-image-file-light" className="shrink-0 px-4 py-2 rounded border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-bold cursor-pointer">파일 선택</label>
                  <span className="text-xs text-muted">{currentPage.layout?.backgroundImageLight ? '이미지 적용됨' : '선택된 파일 없음'}</span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase text-muted">다크 모드 배경</p>
                <div className="p-3 rounded-xl border border-[var(--border-base)] bg-[var(--surface-muted)] flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="bg-image-file-dark"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      compressImageToDataUrl(file).then((dataUrl) => {
                        onUpdatePage({ layout: { ...currentPage.layout, backgroundImageDark: dataUrl } });
                      });
                    }}
                  />
                  <label htmlFor="bg-image-file-dark" className="shrink-0 px-4 py-2 rounded border border-[var(--border-strong)] bg-[var(--surface)] text-xs font-bold cursor-pointer">파일 선택</label>
                  <span className="text-xs text-muted">{currentPage.layout?.backgroundImageDark ? '이미지 적용됨' : '선택된 파일 없음'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-base)] mt-3">
                <span className="text-[10px] font-bold uppercase text-muted">지구 배경 (Globe)</span>
                <Switch
                  checked={currentPage.layout?.backgroundGlobe ?? false}
                  onChange={(checked) => onUpdatePage({ layout: { ...currentPage.layout, backgroundGlobe: checked } })}
                />
              </div>

              <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Layout & Borders</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Widget Rounded', key: 'borderRadius', min: 0, max: 40 },
                    { label: 'Widget Border', key: 'borderWidth', min: 0, max: 8 },
                    { label: 'Widget Spacing', key: 'spacing', min: 0, max: 40 },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">{item.label}</span>
                        <span className="text-xs font-mono text-primary font-bold">{(theme as any)[item.key]}px</span>
                      </div>
                      <input
                        type="range" min={item.min} max={item.max} step="1"
                        value={(theme as any)[item.key]}
                        onChange={(e) => updateTheme({ [item.key]: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-[var(--primary-color)]"
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Typography Scale</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Title Size', key: 'titleSize', min: 12, max: 32 },
                    { label: 'Content (Base)', key: 'contentSize', min: 8, max: 24 },
                  ].map((item) => (
                    <div key={item.key} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">{item.label}</span>
                        <span className="text-xs font-mono text-primary font-bold">{(theme as any)[item.key]}px</span>
                      </div>
                      <input
                        type="range" min={item.min} max={item.max} step="1"
                        value={(theme as any)[item.key]}
                        onChange={(e) => updateTheme({ [item.key]: parseInt(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded appearance-none cursor-pointer accent-[var(--primary-color)]"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </section>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[var(--border-base)] bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase">
          <span>현재 적용 중인 스타일</span>
          <span className="text-primary">{theme.name || 'Custom'}</span>
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;
