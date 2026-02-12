
import React, { useState } from 'react';
import { X, Palette, Sparkles, Moon, Sun, CheckCircle2, Type, Settings2, Heading, Layers, Image as ImageIcon } from 'lucide-react';
import { DashboardTheme, ThemeMode, HeaderConfig, HeaderPosition, TextAlignment, DashboardPage } from '../types';
import { BRAND_COLORS } from '../constants';
import { getAIGeneratedThemes } from '../services/geminiService';

interface DesignSidebarProps {
  theme: DashboardTheme;
  header: HeaderConfig;
  currentPage: DashboardPage;
  updateTheme: (newTheme: Partial<DashboardTheme>) => void;
  updateHeader: (newHeader: Partial<HeaderConfig>) => void;
  updatePage: (updates: Partial<DashboardPage>) => void;
  onClose: () => void;
}

const DesignSidebar: React.FC<DesignSidebarProps> = ({ theme, header, currentPage, updateTheme, updateHeader, updatePage, onClose }) => {
  const [siteInfo, setSiteInfo] = useState('');
  const [aiThemes, setAiThemes] = useState<DashboardTheme[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // if (!isOpen) return null; // Controlled by parent

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


  return (
    <div className="w-80 h-full bg-[var(--surface)] border-l border-[var(--border-base)] flex flex-col overflow-hidden shadow-2xl transition-all">
      <div className="flex items-center justify-between p-6 border-b border-[var(--border-base)]">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">Design System</h2>
        </div>
        <button onClick={onClose} className="p-1 btn-ghost rounded-full opacity-60 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {/* Appearance Mode */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Appearance Mode</h3>
          <div className="flex p-1 bg-[var(--border-muted)] rounded-xl">
            <button
              onClick={() => updateTheme({ mode: ThemeMode.LIGHT })}
              className={`btn-base btn-ghost flex-1 ${theme.mode === ThemeMode.LIGHT ? 'active' : ''}`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => updateTheme({ mode: ThemeMode.DARK })}
              className={`btn-base btn-ghost flex-1 ${theme.mode === ThemeMode.DARK ? 'active' : ''}`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
        </section>

        {/* Brand Primary Colors */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Brand Primary Color</h3>
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
          {/* Palette Preview */}
          <div className="flex gap-1 h-3 rounded-full overflow-hidden opacity-80">
            {[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95].map(step => (
              <div key={step} className="flex-1" style={{ backgroundColor: `var(--primary-${step})` }} />
            ))}
          </div>
        </section>

        {/* Header Settings */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-base)]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Header Settings</h3>
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

          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Dashboard Title</span>
              <div className="relative group">
                <input
                  type="text"
                  value={header.title}
                  onChange={(e) => updateHeader({ title: e.target.value })}
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  placeholder="Enter header title..."
                />
                <Heading className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Current Page Name</span>
              <div className="relative group">
                <input
                  type="text"
                  value={currentPage.name}
                  onChange={(e) => updatePage({ name: e.target.value })}
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  placeholder="Enter page name..."
                />
                <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Header Logo</span>
              <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-[var(--border-base)] border-dashed hover:border-primary transition-all group overflow-hidden">
                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 border border-[var(--border-base)] relative overflow-hidden">
                  {header.logo ? (
                    <img src={header.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-gray-500 uppercase truncate">Brand Identity</p>
                  <label className="text-xs font-bold text-primary hover:underline cursor-pointer">
                    {header.logo ? 'Change Logo' : 'Upload Logo'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (re) => {
                            updateHeader({ logo: re.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
                {header.logo && (
                  <button
                    onClick={() => updateHeader({ logo: undefined })}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateHeader({ position: HeaderPosition.TOP })}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${header.position === HeaderPosition.TOP ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
              >Top</button>
              <button
                onClick={() => updateHeader({ position: HeaderPosition.LEFT })}
                className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border-2 transition-all ${header.position === HeaderPosition.LEFT ? 'border-primary bg-primary/10 text-primary' : 'border-transparent bg-gray-50 dark:bg-gray-800 text-gray-400'}`}
              >Left</button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[10px] uppercase font-bold text-gray-400">Height / Width</span>
                <span className="text-[10px] font-mono font-bold text-primary">{header.position === HeaderPosition.TOP ? header.height : header.width}px</span>
              </div>
              <input
                type="range" min="40" max="400" step="4"
                value={header.position === HeaderPosition.TOP ? header.height : header.width}
                onChange={(e) => updateHeader(header.position === HeaderPosition.TOP ? { height: parseInt(e.target.value) } : { width: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400">Title Alignment</span>
              <div className="flex bg-gray-50 dark:bg-gray-800 p-1 rounded-xl">
                {[TextAlignment.LEFT, TextAlignment.CENTER, TextAlignment.RIGHT].map(align => (
                  <button
                    key={align}
                    onClick={() => updateHeader({ textAlignment: align })}
                    className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${header.textAlignment === align ? 'bg-white dark:bg-gray-700 shadow-sm text-primary' : 'text-gray-400'}`}
                  >{align}</button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global Typography */}
        <section className="space-y-5 pt-4 border-t border-[var(--border-base)]">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <Settings2 className="w-4 h-4" /> Typography System
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Title Size</span>
                <span className="text-xs font-mono font-bold text-primary">{theme.titleSize}px</span>
              </div>
              <input
                type="range" min="10" max="32" step="1"
                value={theme.titleSize}
                onChange={(e) => updateTheme({ titleSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400">Title Weight</span>
              <select
                value={theme.titleWeight}
                onChange={(e) => updateTheme({ titleWeight: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="400">Normal (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semi-Bold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra-Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Content Size</span>
                <span className="text-xs font-mono font-bold text-primary">{theme.contentSize}px</span>
              </div>
              <input
                type="range" min="8" max="24" step="1"
                value={theme.contentSize}
                onChange={(e) => updateTheme({ contentSize: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        </section>

        {/* Layout Constants */}
        <section className="space-y-6 pt-4 border-t border-[var(--border-base)]">
          <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Grid & Radius</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Border Radius</span>
                <span className="text-xs font-mono dark:text-blue-400">{theme.borderRadius}px</span>
              </div>
              <input
                type="range" min="0" max="24" step="4"
                value={theme.borderRadius}
                onChange={(e) => updateTheme({ borderRadius: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-400">Widget Spacing</span>
                <span className="text-xs font-mono dark:text-blue-400">{theme.spacing}px</span>
              </div>
              <input
                type="range" min="2" max="16" step="2"
                value={theme.spacing}
                onChange={(e) => updateTheme({ spacing: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </div>
        </section>

        {/* AI Style Generator Section */}
        <section className="space-y-4 pt-4 border-t border-[var(--border-base)]">
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
      </div >

      <div className="p-6 border-t border-[var(--border-base)] bg-gray-50 dark:bg-opacity-10">
        <div className="text-[10px] text-gray-500 text-center italic">
          Design System affects all widgets globally.
        </div>
      </div>
    </div >
  );
};

export default DesignSidebar;
