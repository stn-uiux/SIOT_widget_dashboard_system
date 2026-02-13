import React, { useState } from 'react';
import { X, Palette, Sparkles, Moon, Sun, CheckCircle2, Type, Settings2, Heading, Layers, Image as ImageIcon, BookOpen, Droplets, Box, Maximize, Save, Trash2, AlignLeft, AlignCenter, AlignRight, Layout } from 'lucide-react';
import { DashboardTheme, ThemeMode, HeaderConfig, HeaderPosition, TextAlignment, DashboardPage, ThemePreset, ChartLibrary } from '../types';
import { BRAND_COLORS } from '../constants';
import { getAIGeneratedThemes } from '../services/geminiService';

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
}

type TabType = 'presets' | 'global' | 'header' | 'advanced' | 'ai';

// --- Color Utilities for Smart Mode Shifting ---
const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const getSmartColorForMode = (hex: string, mode: ThemeMode, type: 'bg' | 'surface' | 'text'): string => {
  const { h, s, l } = hexToHsl(hex);
  if (mode === ThemeMode.DARK) {
    if (type === 'bg') return hslToHex(h, Math.min(s, 20), 5); // Very dark, low saturation
    if (type === 'surface') return hslToHex(h, Math.min(s, 15), 12); // Slightly lighter than bg
    return hslToHex(h, Math.min(s, 10), 90); // Near white text
  } else {
    if (type === 'bg') return hslToHex(h, Math.min(s, 10), 98); // Near white
    if (type === 'surface') return hslToHex(h, Math.min(s, 5), 100); // Pure white
    return hslToHex(h, Math.max(s, 40), 15); // Dark text with some saturation
  }
};

const DesignSidebar: React.FC<DesignSidebarProps> = ({
  theme, header, currentPage, presets,
  updateTheme, updateHeader, onUpdatePage,
  onSavePreset, onApplyPreset, onOpenDocs, onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('presets');
  const [siteInfo, setSiteInfo] = useState('');
  const [aiThemes, setAiThemes] = useState<DashboardTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleAiGeneration = async () => {
    if (!siteInfo) return;
    setIsLoading(true);
    try {
      const themes = await getAIGeneratedThemes(siteInfo);
      setAiThemes(themes);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCurrentAsPreset = () => {
    if (!newPresetName) return;
    onSavePreset(newPresetName);
    setNewPresetName('');
    setActiveTab('presets');
  };

  const handleModeSwitch = (newMode: ThemeMode) => {
    const prevMode = theme.mode;
    if (prevMode === newMode) return;

    // 1. Save current colors for the previous mode
    const currentStyles = {
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      titleColor: theme.titleColor,
      textColor: theme.textColor,
      cardShadow: theme.cardShadow,
      glassmorphism: theme.glassmorphism,
      glassBlur: theme.glassBlur,
      glassOpacity: theme.glassOpacity,
      borderColor: theme.borderColor,
      widgetHeaderColor: theme.widgetHeaderColor
    };

    const updatedModeStyles = {
      ...(theme.modeStyles || {}),
      [prevMode]: currentStyles
    };

    // 2. Load colors for the new mode if they exist
    const savedNewModeStyles = theme.modeStyles?.[newMode];

    if (savedNewModeStyles) {
      updateTheme({
        mode: newMode,
        modeStyles: updatedModeStyles,
        ...savedNewModeStyles
      });
    } else {
      // Default fallback using smart shift
      updateTheme({
        mode: newMode,
        modeStyles: updatedModeStyles,
        backgroundColor: getSmartColorForMode(theme.primaryColor, newMode, 'bg'),
        surfaceColor: getSmartColorForMode(theme.primaryColor, newMode, 'surface'),
        titleColor: getSmartColorForMode(theme.primaryColor, newMode, 'text'),
        textColor: getSmartColorForMode(theme.primaryColor, newMode, 'text'),
        borderColor: newMode === ThemeMode.DARK ? '#1e293b' : '#e2e8f0',
        widgetHeaderColor: 'transparent'
      });
    }
  };

  const tabs = [
    { id: 'presets', label: 'Presets', icon: Sparkles },
    { id: 'global', label: 'Global', icon: Palette },
    { id: 'header', label: 'Header', icon: Heading },
    { id: 'advanced', label: 'Advanced', icon: Box },
    { id: 'ai', label: 'AI Gen', icon: Sparkles },
  ];

  return (
    <div className="w-80 h-full bg-[var(--surface)] border-l border-[var(--border-base)] flex flex-col overflow-hidden shadow-2xl transition-all">
      <div className="flex items-center justify-between p-6 border-b border-[var(--border-base)]">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Design System</h2>
          <button
            onClick={onOpenDocs}
            className="p-1.5 hover:bg-[var(--border-muted)] rounded-lg transition-colors text-muted hover:text-primary ml-1"
            title="Open Documentation"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
        <button onClick={onClose} className="p-1 btn-ghost rounded-full opacity-60 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[var(--border-base)] bg-gray-50/50 dark:bg-gray-900/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex-1 py-3 flex flex-col items-center gap-1 transition-all border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-[var(--surface)]' : 'border-transparent text-muted hover:text-main'}`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-[9px] font-bold uppercase tracking-tighter">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {activeTab === 'presets' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-3">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Themes Presets</h3>
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

            <section className="space-y-3 pt-4 border-t border-[var(--border-base)]">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Save Current Style</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Style Name (e.g. My Custom)"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <button
                  onClick={handleSaveCurrentAsPreset}
                  disabled={!newPresetName}
                  className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20"
                >
                  <Save className="w-4 h-4" /> Save as New Preset
                </button>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'global' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Mode Support Toggle */}
            <section className="space-y-3 pb-4 border-b border-[var(--border-base)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase text-muted tracking-wider leading-none mb-1">Dual Mode Support</h3>
                  <p className="text-[9px] text-muted font-medium uppercase tracking-tight">Support system light/dark switching</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.dualModeSupport}
                    onChange={(e) => updateTheme({ dualModeSupport: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
            </section>

            {/* Appearance Mode */}
            <section className={`space-y-3 transition-opacity ${!theme.dualModeSupport ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Appearance Mode</h3>
                {!theme.dualModeSupport && <span className="text-[10px] text-primary font-bold uppercase">Fixed Mode</span>}
              </div>
              <div className="flex p-1 bg-[var(--border-muted)] rounded-xl relative">
                <button
                  onClick={() => theme.dualModeSupport && handleModeSwitch(ThemeMode.LIGHT)}
                  className={`btn-base btn-ghost flex-1 ${theme.mode === ThemeMode.LIGHT ? 'active' : ''} ${!theme.dualModeSupport ? 'pointer-events-none' : ''}`}
                >
                  <Sun className="w-4 h-4" /> Light
                </button>
                <button
                  onClick={() => theme.dualModeSupport && handleModeSwitch(ThemeMode.DARK)}
                  className={`btn-base btn-ghost flex-1 ${theme.mode === ThemeMode.DARK ? 'active' : ''} ${!theme.dualModeSupport ? 'pointer-events-none' : ''}`}
                >
                  <Moon className="w-4 h-4" /> Dark
                </button>
              </div>
            </section>

            {/* Brand Primary Colors */}
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
                <div className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Card Border Width</span>
                      <span className="text-xs font-mono text-primary font-bold">{theme.borderWidth}px</span>
                    </div>
                    <input
                      type="range" min="0" max="10" step="1"
                      value={theme.borderWidth}
                      onChange={(e) => updateTheme({ borderWidth: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-white/20 shadow-sm" style={{ backgroundColor: theme.borderColor }} />
                      <span className="text-[10px] font-bold uppercase text-muted">Border Color</span>
                    </div>
                    <input
                      type="color"
                      value={theme.borderColor?.startsWith('#') ? theme.borderColor : '#e2e8f0'}
                      onChange={(e) => updateTheme({ borderColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md border border-white/20 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} />
                        <div className="absolute inset-0" style={{ backgroundColor: theme.widgetHeaderColor || 'transparent' }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-muted">Header Background</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateTheme({ widgetHeaderColor: 'transparent' })}
                        className="text-[8px] font-bold uppercase text-muted hover:text-primary px-2 py-1 bg-white dark:bg-black rounded border border-[var(--border-base)]"
                      >
                        Clear
                      </button>
                      <input
                        type="color"
                        value={theme.widgetHeaderColor?.startsWith('#') ? theme.widgetHeaderColor : '#f8fafc'}
                        onChange={(e) => updateTheme({ widgetHeaderColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}


        {activeTab === 'advanced' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Editing Mode Context */}
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase text-primary tracking-widest leading-none mb-1">Design Mode</p>
                <p className="text-xs font-bold text-main uppercase">{theme.mode} Mode Styles</p>
              </div>
              <div className="p-2 bg-[var(--surface)] shadow-sm rounded-xl border border-[var(--border-base)]">
                {theme.mode === ThemeMode.LIGHT ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </div>
            </div>

            {/* Color Palette Controls */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Custom Colors</h3>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className="text-[10px] font-bold uppercase text-muted group-hover:text-primary transition-colors">Gradient Mode</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={theme.useGradient}
                      onChange={(e) => updateTheme({ useGradient: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.backgroundColor }} />
                      <span className="text-[10px] font-bold uppercase text-muted">{theme.useGradient ? 'Start Color' : 'Background'}</span>
                    </div>
                    <input
                      type="color"
                      value={theme.backgroundColor.startsWith('#') ? theme.backgroundColor : '#f8fafc'}
                      onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                    />
                  </div>
                  {theme.useGradient && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)] animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg shadow-sm border border-white/20" style={{ backgroundColor: theme.backgroundGradientColor || theme.primaryColor }} />
                        <span className="text-[10px] font-bold uppercase text-muted">End Color</span>
                      </div>
                      <input
                        type="color"
                        value={theme.backgroundGradientColor?.startsWith('#') ? theme.backgroundGradientColor : theme.primaryColor}
                        onChange={(e) => updateTheme({ backgroundGradientColor: e.target.value })}
                        className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                      />
                    </div>
                  )}
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

            {/* Glassmorphism */}
            <section className="space-y-6 pt-4 border-t border-[var(--border-base)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Glassmorphism</h3>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme.glassmorphism}
                    onChange={(e) => updateTheme({ glassmorphism: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {theme.glassmorphism && (
                <div className="space-y-5 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Blur Intensity</span>
                      <span className="text-xs font-mono text-primary font-bold">{theme.glassBlur}px</span>
                    </div>
                    <input
                      type="range" min="0" max="40" step="1"
                      value={theme.glassBlur}
                      onChange={(e) => updateTheme({ glassBlur: parseInt(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Opacity</span>
                      <span className="text-xs font-mono text-primary font-bold">{Math.round(theme.glassOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.05"
                      value={theme.glassOpacity}
                      onChange={(e) => updateTheme({ glassOpacity: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-[10px] leading-relaxed text-primary/80 italic">
                      Tip: Use a semi-transparent surface color (e.g. RGBA) for the best glass effect.
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Typography Depth */}
            <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
              <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Typography Scale</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Title Size</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.titleSize}px</span>
                  </div>
                  <input
                    type="range" min="12" max="32" step="1"
                    value={theme.titleSize}
                    onChange={(e) => updateTheme({ titleSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Content Size</span>
                    <span className="text-xs font-mono text-primary font-bold">{theme.contentSize}px</span>
                  </div>
                  <input
                    type="range" min="8" max="20" step="1"
                    value={theme.contentSize}
                    onChange={(e) => updateTheme({ contentSize: parseInt(e.target.value) })}
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md border border-white/20 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gray-200" style={{ backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px' }} />
                    <div className="absolute inset-0" style={{ backgroundColor: theme.widgetHeaderColor || 'transparent' }} />
                  </div>
                  <span className="text-[10px] font-bold uppercase text-muted">Header Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer group mr-2">
                    <span className="text-[9px] font-bold uppercase text-muted group-hover:text-primary transition-colors">Transp.</span>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={theme.widgetHeaderColor === 'transparent'}
                        onChange={(e) => updateTheme({ widgetHeaderColor: e.target.checked ? 'transparent' : (theme.mode === ThemeMode.DARK ? '#1e293b' : '#f8fafc') })}
                        className="sr-only peer"
                      />
                      <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                    </div>
                  </label>
                  <input
                    type="color"
                    disabled={theme.widgetHeaderColor === 'transparent'}
                    value={theme.widgetHeaderColor?.startsWith('#') ? theme.widgetHeaderColor : '#f8fafc'}
                    onChange={(e) => updateTheme({ widgetHeaderColor: e.target.value })}
                    className={`w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none appearance-none ${theme.widgetHeaderColor === 'transparent' ? 'opacity-30 pointer-events-none' : ''}`}
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {
          activeTab === 'ai' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" /> AI Style Generator
                </div>
                <div className="space-y-3">
                  <textarea
                    value={siteInfo}
                    onChange={(e) => setSiteInfo(e.target.value)}
                    placeholder="Modern tech company focused on sustainability..."
                    className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl resize-none focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                    rows={3}
                  />
                  <button
                    onClick={handleAiGeneration}
                    disabled={isLoading || !siteInfo}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-500/10"
                  >
                    {isLoading ? 'Generating...' : 'Generate AI Styles'}
                  </button>
                </div>

                {aiThemes.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {aiThemes.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => updateTheme(t)}
                        className="p-3 border border-[var(--border-base)] rounded-xl hover:border-blue-500 transition-colors bg-gray-50 dark:bg-gray-800 group text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-6 rounded-md shadow-inner" style={{ backgroundColor: t.primaryColor }} />
                          <div className="flex-1">
                            <div className="text-[10px] font-bold uppercase opacity-60">Variation {idx + 1}</div>
                            <div className="text-[9px] opacity-80">{t.mode.toUpperCase()} • R:{t.borderRadius}px • T:{t.titleSize}px</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )
        }

        {activeTab === 'header' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Header Visibility */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Dashboard Header</h3>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={header.show}
                    onChange={(e) => updateHeader({ show: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>

              {header.show && (
                <div className="space-y-6 pt-4 border-t border-[var(--border-base)] animate-in slide-in-from-top-2 duration-200">

                  {/* Position & Height */}
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

                  {/* Content & Alignment */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Appearance</span>
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-[var(--border-base)]">
                        <span className="text-[10px] font-bold text-muted uppercase">
                          Show {header.position === HeaderPosition.TOP ? 'Bottom' : 'Right'} Line
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={header.showDivider !== false}
                            onChange={(e) => updateHeader({ showDivider: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
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

                  {/* Background & Transparency */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Background Color</span>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <span className="text-[9px] font-bold uppercase text-muted group-hover:text-primary transition-colors">Transparent</span>
                        <div className="relative inline-flex items-center">
                          <input
                            type="checkbox"
                            checked={header.backgroundColor === 'transparent'}
                            onChange={(e) => updateHeader({ backgroundColor: e.target.checked ? 'transparent' : (theme.mode === ThemeMode.DARK ? '#0f172a' : '#ffffff') })}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </div>
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

                  {/* Text Color */}
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

                  {/* Page Tabs Configuration */}
                  <div className="space-y-4 pt-4 border-t border-[var(--border-base)]">
                    <h3 className="text-xs font-bold uppercase text-muted tracking-wider">Page Tabs</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase text-main">Show Page Tabs</p>
                          <p className="text-[9px] text-muted">Hide for single page dashboards</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={theme.showPageTabs !== false}
                            onChange={(e) => updateTheme({ showPageTabs: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>

                      {theme.showPageTabs !== false && (
                        <div className="flex items-center justify-between animate-in slide-in-from-top-1 duration-200">
                          <div>
                            <p className="text-[10px] font-bold uppercase text-main">Transparent Tabs</p>
                            <p className="text-[9px] text-muted">Blend tabs with background</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={theme.transparentTabs}
                              onChange={(e) => updateTheme({ transparentTabs: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )
        }
      </div >

      <div className="p-6 border-t border-[var(--border-base)] bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-between text-[10px] text-muted font-bold uppercase">
          <span>Current Active Style</span>
          <span className="text-primary">{theme.name || 'Custom'}</span>
        </div>
      </div>
    </div >
  );
};

export default DesignSidebar;
