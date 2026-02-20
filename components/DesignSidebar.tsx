import React, { useState } from 'react';
import { X, Palette, Sparkles, Moon, Sun, CheckCircle2, BookOpen, Heading, Box, AlignLeft, AlignCenter, AlignRight, Layout } from 'lucide-react';
import { DashboardTheme, ThemeMode, HeaderConfig, HeaderPosition, TextAlignment, DashboardPage, ThemePreset } from '../types';
import { BRAND_COLORS } from '../constants';
import Switch from './Switch';
import ModeToggle from './ModeToggle';

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
}

type TabType = 'mode' | 'global' | 'header' | 'advanced';

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  theme, header, currentPage, presets,
  updateTheme, updateHeader, onUpdatePage,
  onSavePreset, onApplyPreset, onOpenDocs, onClose, onModeSwitch
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('mode');
  const [newPresetName, setNewPresetName] = useState('');

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName) return;
    onSavePreset(newPresetName);
    setNewPresetName('');
    setActiveTab('mode');
  };

  const isCyber = theme.mode === ThemeMode.CYBER;

  const tabs = [
    { id: 'mode', label: isCyber ? 'ARCHIVE' : 'Mode', icon: Sparkles },
    { id: 'global', label: isCyber ? 'SYSTEM' : 'Global', icon: Palette },
    { id: 'header', label: isCyber ? 'HUD CFG' : 'Header', icon: Heading },
    { id: 'advanced', label: isCyber ? 'CORE' : 'Advanced', icon: Box },
  ];

  return (
    <div className={`w-80 h-full flex flex-col overflow-hidden transition-all duration-500 ${isCyber ? 'bg-black/90 border-l border-cyan-500/50 shadow-[0_0_40px_rgba(0,229,255,0.15)]' : 'bg-[var(--surface)] border-l border-[var(--border-base)] shadow-2xl'}`}>
      <div className={`flex items-center justify-between p-6 border-b ${isCyber ? 'border-cyan-500/30 bg-cyan-950/20' : 'border-[var(--border-base)]'}`}>
        <div className="flex items-center gap-2">
          <Palette className={`w-5 h-5 ${isCyber ? 'text-cyan-400 animate-pulse' : 'text-primary'}`} />
          <h2 className={`text-lg font-bold tracking-tighter ${isCyber ? 'text-cyan-400 italic' : ''}`}>
            {isCyber ? <span className="glitch-text" data-text="DESIGN_ENGINE_v4">DESIGN_ENGINE_v4</span> : 'Design System'}
          </h2>
          <button
            onClick={onOpenDocs}
            className={`p-1.5 rounded-lg transition-colors ml-1 ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-500/60 hover:text-cyan-400' : 'hover:bg-[var(--border-muted)] text-muted hover:text-primary'}`}
            title="Open Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className={`p-1 rounded-full opacity-60 transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-400' : 'btn-ghost'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
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
            <section className="space-y-4 pb-4 border-b border-[var(--border-base)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-muted tracking-wider leading-none mb-1">Dual Mode Support</h3>
                  <p className="text-[9px] text-muted font-medium uppercase tracking-tight">Support system light/dark switching</p>
                </div>
                <Switch
                  checked={theme.dualModeSupport}
                  onChange={(checked) => updateTheme({ dualModeSupport: checked })}
                />
              </div>

              {theme.dualModeSupport && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-[var(--border-base)] animate-in slide-in-from-top-2 duration-300">
                  <span className="text-[10px] font-bold uppercase text-muted">Current Mode</span>
                  <ModeToggle mode={theme.mode} onChange={onModeSwitch} />
                </div>
              )}
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Select Mode</h3>
              <div className="grid grid-cols-1 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset)}
                    className="group relative p-4 rounded-2xl border border-[var(--border-base)] hover:border-primary bg-gray-50 dark:bg-gray-800/50 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-110 transition-transform" />
                    <div className="relative flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl shadow-lg border border-white/20 overflow-hidden flex flex-col">
                        <div className="flex-1" style={{ backgroundColor: preset.theme.primaryColor }} />
                        <div className="flex-1" style={{ backgroundColor: preset.theme.backgroundColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-main truncate">{preset.name}</p>
                        <p className="text-[10px] text-muted uppercase font-bold">{preset.theme.mode.toUpperCase()} • {preset.theme.borderRadius}px Radius</p>
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
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Brand Primary Color</h3>
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
              <div className="flex gap-1 h-3 rounded-full overflow-hidden opacity-80">
                {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95].map(step => (
                  <div key={step} className="flex-1" style={{ backgroundColor: `var(--primary-${step})` }} />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Grid & Radius</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Border Radius</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.borderRadius}px</span>
                  </div>
                  <input
                    type="range" min="0" max="40" step="4"
                    value={theme.borderRadius}
                    onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Chart Elements Radius</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.chartRadius}px</span>
                  </div>
                  <input
                    type="range" min="0" max="20" step="2"
                    value={theme.chartRadius}
                    onChange={(e) => updateTheme({ chartRadius: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Widget Spacing</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.spacing}px</span>
                  </div>
                  <input
                    type="range" min="0" max="32" step="2"
                    value={theme.spacing}
                    onChange={(e) => updateTheme({ spacing: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Dashboard Padding</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.dashboardPadding}px</span>
                  </div>
                  <input
                    type="range" min="0" max="80" step="4"
                    value={theme.dashboardPadding}
                    onChange={(e) => updateTheme({ dashboardPadding: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
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
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Dashboard Header</h3>
                <Switch
                  checked={header.show}
                  onChange={(checked) => updateHeader({ show: checked })}
                />
              </div>

              {header.show && (
                <div className="space-y-6 pt-4 border-t border-[var(--border-base)] animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Position</span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateHeader({ position: HeaderPosition.TOP })}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${header.position === HeaderPosition.TOP ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 dark:bg-gray-800 border-[var(--border-base)] text-muted hover:border-primary/50'}`}
                        >
                          Top
                        </button>
                        <button
                          onClick={() => updateHeader({ position: HeaderPosition.LEFT })}
                          className={`p-2 rounded-lg border text-xs font-bold transition-all ${header.position === HeaderPosition.LEFT ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 dark:bg-gray-800 border-[var(--border-base)] text-muted hover:border-primary/50'}`}
                        >
                          Left
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-gray-400">
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
                        className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Appearance</span>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Show {header.position === HeaderPosition.TOP ? 'Bottom' : 'Right'} Line
                        </span>
                        <Switch
                          checked={header.showDivider !== false}
                          onChange={(checked) => updateHeader({ showDivider: checked })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Title Content</span>
                      <input
                        type="text"
                        value={header.title}
                        onChange={(e) => updateHeader({ title: e.target.value })}
                        className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Alignment</span>
                      <div className="flex bg-gray-50 dark:bg-gray-800 rounded-lg p-1 border border-[var(--border-base)]">
                        {[TextAlignment.LEFT, TextAlignment.CENTER, TextAlignment.RIGHT].map((align) => (
                          <button
                            key={align}
                            onClick={() => updateHeader({ textAlignment: align })}
                            className={`flex-1 py-1.5 rounded transition-all flex justify-center ${header.textAlignment === align ? 'bg-[var(--surface)] text-primary shadow-sm font-bold' : 'text-muted hover:text-main'}`}
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
                      <span className="text-[10px] uppercase font-bold text-gray-400">Background Color</span>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[9px] font-bold uppercase text-muted group-hover:text-primary transition-colors">Transparent</span>
                        <Switch
                          checked={header.backgroundColor === 'transparent'}
                          onChange={(checked) => updateHeader({ backgroundColor: checked ? 'transparent' : (theme.mode === ThemeMode.DARK ? '#0f172a' : '#ffffff') })}
                        />
                      </label>
                    </div>
                    <div className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)] ${header.backgroundColor === 'transparent' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: header.backgroundColor }} />
                        <span className="text-[10px] font-bold uppercase text-muted">Pick Color</span>
                      </div>
                      <input
                        type="color"
                        value={header.backgroundColor !== 'transparent' && header.backgroundColor.startsWith('#') ? header.backgroundColor : '#ffffff'}
                        onChange={(e) => updateHeader({ backgroundColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Text Color</span>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: header.textColor }} />
                        <span className="text-[10px] font-bold uppercase text-muted">Pick Color</span>
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
                          <p className="text-[10px] font-bold uppercase text-main">Show Page Tabs</p>
                          <p className="text-[9px] text-muted">Hide for single page dashboards</p>
                        </div>
                        <Switch
                          checked={theme.showPageTabs !== false}
                          onChange={(checked) => updateTheme({ showPageTabs: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest leading-none mb-1">Design Mode</p>
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
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.backgroundColor }} />
                      <span className="text-[10px] font-bold uppercase text-muted">Background</span>
                    </div>
                    <input
                      type="color"
                      value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#f8fafc'}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.surfaceColor }} />
                    <span className="text-[10px] font-bold uppercase text-muted">Surface (Card)</span>
                  </div>
                  <input
                    type="color"
                    value={theme.surfaceColor.startsWith('#') ? theme.surfaceColor : '#ffffff'}
                    onChange={(e) => updateTheme({ surfaceColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.titleColor }} />
                    <span className="text-[10px] font-bold uppercase text-muted">Main Text</span>
                  </div>
                  <input
                    type="color"
                    value={theme.titleColor.startsWith('#') ? theme.titleColor : '#0f172a'}
                    onChange={(e) => updateTheme({ titleColor: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Typography Scale</h3>
              <div className="space-y-4">
                {[
                  { label: 'Title Size', key: 'titleSize', min: 12, max: 32 },
                  { label: 'Content (Base)', key: 'contentSize', min: 8, max: 24 },
                  { label: 'Tiny Scale', key: 'textTiny', min: 6, max: 16 },
                  { label: 'Small Scale', key: 'textSmall', min: 8, max: 20 },
                  { label: 'Medium Scale', key: 'textMd', min: 12, max: 32 },
                  { label: 'Large Scale', key: 'textLg', min: 20, max: 60 },
                  { label: 'Hero Scale', key: 'textHero', min: 30, max: 100 },
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
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-[var(--border-base)] bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase">
          <span>Current Active Style</span>
          <span className="text-primary">{theme.name || 'Custom'}</span>
        </div>
      </div>
    </div>
  );
};

export default DesignSidebar;
