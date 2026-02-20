import React, { useState, useCallback, useMemo, useRef } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import {
  Layout, Edit3, Eye, Plus, Palette,
  BarChart3, TrendingUp, Activity, ChevronDown, EyeOff, CheckCircle2, Sun, Moon
} from 'lucide-react';
import {
  INITIAL_PROJECT_LIST, MOCK_CHART_DATA, DEFAULT_PAGE, DEFAULT_THEME, THEME_PRESETS
} from './constants';
import {
  Widget, WidgetType, DashboardTheme, ThemePreset, LayoutConfig, ThemeMode, ChartLibrary,
  Project, DashboardPage, HeaderConfig, HeaderPosition, TextAlignment
} from './types';
import WidgetCard from './components/WidgetCard';
import DesignSidebar from './components/DesignSidebar';
import Sidebar from './components/Sidebar';
import ExcelModal from './components/ExcelModal';
import ConfirmModal from './components/ConfirmModal';
import DesignDocs from './components/DesignDocs';
import DesignSystem from './DesignSystem';
import WidgetPicker from './components/WidgetPicker';
import { TYPE_DEFAULT_DATA } from './constants';
import ModeToggle from './components/ModeToggle';

/** 위젯 배열에서 순차 배치 초기 레이아웃을 계산 */
const computeInitialLayout = (pageWidgets: Widget[], cols: number): LayoutItem[] => {
  let curX = 0, curY = 0, rowH = 0;
  return pageWidgets.map((w) => {
    const wCols = Math.min(w.colSpan, cols);
    if (curX + wCols > cols) { curX = 0; curY += rowH; rowH = 0; }
    rowH = Math.max(rowH, w.rowSpan);
    const item: LayoutItem = { i: w.id, x: curX, y: curY, w: wCols, h: w.rowSpan };
    curX += wCols;
    return item;
  });
};

const IsometricLogo: React.FC<{ isCyber?: boolean; isDark?: boolean; primaryColor?: string }> = ({ isCyber, isDark, primaryColor = '#3b82f6' }) => {
  const color = isCyber ? '#00e5ff' : primaryColor;
  const isLight = !isCyber && !isDark;
  const accentColor = isLight ? color : 'white';
  return (
    <div className="relative w-10 h-10 group flex items-center justify-center">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9 drop-shadow-xl transition-transform duration-500 group-hover:scale-110">
        <defs>
          <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={isCyber ? 'var(--primary-90)' : 'var(--secondary-color)'} />
          </linearGradient>
          <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={accentColor} stopOpacity={isLight ? 0.6 : 0.8} />
            <stop offset="100%" stopColor={accentColor} stopOpacity={isLight ? 0.1 : 0.2} />
          </linearGradient>
        </defs>

        {/* Shadow/Glow under the base */}
        <path d="M50 85 L15 65 L50 45 L85 65 Z" fill={color} fillOpacity="0.2" />

        {/* Main Isometric Base */}
        <path d="M50 82 L15 62 L50 42 L85 62 Z" fill="url(#baseGrad)" />
        <path d="M15 62 L15 68 L50 88 L50 82 Z" fill={color} fillOpacity="0.8" filter="brightness(0.7)" />
        <path d="M50 82 L50 88 L85 68 L85 62 Z" fill={color} fillOpacity="0.8" filter="brightness(0.5)" />

        {/* Vertical Panels */}
        <g className={isCyber ? 'animate-pulse' : ''}>
          {/* Back Panel */}
          <path d="M55 42 L55 12 L75 22 L75 52 Z" fill="url(#panelGrad)" stroke={accentColor} strokeOpacity={isLight ? 0.4 : 0.3} strokeWidth="0.5" />
          {/* Front Panel */}
          <path d="M30 52 L30 22 L50 32 L50 62 Z" fill="url(#panelGrad)" stroke={accentColor} strokeOpacity={isLight ? 0.5 : 0.4} strokeWidth="0.5" />

          {/* Mini Data Bars inside panels (isometric) */}
          <rect x="35" y="45" width="2" height="8" fill={accentColor} fillOpacity={isLight ? 0.5 : 0.6} transform="skew-y(-25)" />
          <rect x="42" y="48" width="2" height="12" fill={accentColor} fillOpacity={isLight ? 0.7 : 0.8} transform="skew-y(-25)" />
          <rect x="60" y="32" width="2" height="6" fill={accentColor} fillOpacity={isLight ? 0.4 : 0.5} transform="skew-y(-25)" />
        </g>
      </svg>
      {isCyber ? (
        <div className="absolute inset-0 bg-[var(--cyber-bg-alpha)] blur-xl rounded-full scale-110 -z-10 animate-pulse" />
      ) : (
        <div className="absolute inset-0 bg-[var(--primary-subtle)] blur-xl rounded-full scale-110 -z-10" />
      )}
    </div>
  );
};

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

const App: React.FC = () => {
  // Navigation & Project State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECT_LIST);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECT_LIST[0].id);

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const currentPage = currentProject.pages.find(p => p.id === currentProject.activePageId) || currentProject.pages[0];

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Excel Modal State
  const [excelWidgetId, setExcelWidgetId] = useState<string | null>(null);

  // react-grid-layout state (pageId → LayoutItem[])
  const [rglLayouts, setRglLayouts] = useState<Record<string, LayoutItem[]>>({});

  // useContainerWidth: container ref + measured width
  const { containerRef: gridContainerRef, width: gridWidth } = useContainerWidth({ initialWidth: 1280 });
  // separate ref for height measurement (fitToScreen)
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const [mainAreaHeight, setMainAreaHeight] = useState(600);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);
  const [isDesignDocsOpen, setIsDesignDocsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Shortcuts to current state for components
  const { theme } = currentProject;
  const { widgets, layout, header } = currentPage;

  const updateCurrentPage = (updates: Partial<DashboardPage>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        return {
          ...p,
          pages: p.pages.map(pg => pg.id === p.activePageId ? { ...pg, ...updates } : pg)
        };
      }
      return p;
    }));
  };

  const updateProjectTheme = (newTheme: Partial<DashboardTheme>) => {
    setProjects(prev => prev.map(p => {
      if (p.id === activeProjectId) {
        const theme = p.theme;
        const currentMode = theme.mode;

        // If dualModeSupport is ON, we sync changes to the current mode's persistent storage
        let updatedModeStyles = { ...(theme.modeStyles || {}) };

        // We sync if we are NOT performing a mode switch (i.e., newTheme doesn't contain 'mode')
        if (theme.dualModeSupport && !('mode' in newTheme)) {
          updatedModeStyles[currentMode] = {
            ...(updatedModeStyles[currentMode] || {}),
            ...newTheme
          };
        }

        return {
          ...p,
          theme: {
            ...theme,
            ...newTheme,
            modeStyles: updatedModeStyles
          }
        };
      }
      return p;
    }));
  };


  const handleOpenWidgetPicker = () => {
    setIsWidgetPickerOpen(true);
  };

  const addWidgetWithType = (type: WidgetType) => {
    const defaultData = TYPE_DEFAULT_DATA[type];
    const newId = `widget_${Date.now()}`;

    // Find the bottom-most position in current layout
    const bottomY = currentRglLayout.length > 0
      ? Math.max(...currentRglLayout.map(l => l.y + l.h))
      : 0;

    const newWidget: Widget = {
      id: newId,
      type: type,
      title: 'New Analysis',
      colSpan: 4,
      rowSpan: 10, // Default to 200px (10 * 20px rowHeight)
      config: defaultData?.config
        ? JSON.parse(JSON.stringify(defaultData.config))
        : {
          xAxisKey: 'name',
          yAxisKey: 'value',
          series: [{ key: 'value', label: 'Value', color: 'var(--primary-color)' }],
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          showUnit: false,
          showUnitInLegend: false,
          showLabels: false,
          unit: ''
        },
      data: defaultData?.data
        ? JSON.parse(JSON.stringify(defaultData.data))
        : JSON.parse(JSON.stringify(MOCK_CHART_DATA)),
      mainValue: defaultData?.mainValue,
      subValue: defaultData?.subValue,
      icon: defaultData?.icon,
      noBezel: false,
    };

    // Explicitly update RGL layout to place new widget at bottom
    setRglLayouts(prev => ({
      ...prev,
      [currentPage.id]: [
        ...(prev[currentPage.id] || []),
        { i: newId, x: 0, y: bottomY, w: 4, h: 10 }
      ]
    }));

    updateCurrentPage({ widgets: [...widgets, newWidget] });
    setIsWidgetPickerOpen(false);
    showToast(`Added ${type} widget`);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    updateCurrentPage({
      widgets: widgets.map(w => w.id === id ? { ...w, ...updates } : w)
    });
  };

  const deleteWidget = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteWidget = () => {
    if (!deleteConfirmId) return;
    updateCurrentPage({
      widgets: widgets.filter(w => w.id !== deleteConfirmId)
    });
    setDeleteConfirmId(null);
    showToast('Widget removed successfully', 'success');
  };

  const handleWidgetSelect = (id: string | null) => {
    setSelectedWidgetId(id);
    // Explicitly close design sidebar when selecting a widget or deselecting
    setIsDesignSidebarOpen(false);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedWidgetId(null);
  };

  const handleToggleDesignSidebar = () => {
    setIsDesignSidebarOpen(!isDesignSidebarOpen);
    setSelectedWidgetId(null);
  };

  const [presets, setPresets] = useState<ThemePreset[]>(THEME_PRESETS);

  const handleApplyPreset = (preset: ThemePreset) => {
    updateProjectTheme(preset.theme);
    showToast(`Applied preset: ${preset.name}`);
  };

  const handleSavePreset = (name: string) => {
    const newPreset: ThemePreset = {
      id: `preset_${Date.now()}`,
      name,
      theme: { ...currentProject.theme, name }
    };
    setPresets(prev => [...prev, newPreset]);
    showToast(`Saved new preset: ${name}`);
  };

  const handleThemeChange = (newTheme: Partial<DashboardTheme>) => {
    updateProjectTheme(newTheme);
  };

  const handleModeSwitch = (newMode: ThemeMode) => {
    const prevMode = theme.mode;
    if (prevMode === newMode) return;

    // 1. Save critical style properties for the previous mode
    const currentStyles = {
      backgroundColor: theme.backgroundColor,
      surfaceColor: theme.surfaceColor,
      titleColor: theme.titleColor,
      textColor: theme.textColor,
      cardShadow: theme.cardShadow,
      borderColor: theme.borderColor,
      widgetHeaderColor: theme.widgetHeaderColor
    };

    const updatedModeStyles = {
      ...(theme.modeStyles || {}),
      [prevMode]: currentStyles
    };

    // 2. Load colors for the new mode if they exist
    // FIX: Must use updatedModeStyles which contains the most recent save of prevMode
    const savedNewModeStyles = updatedModeStyles[newMode];

    if (savedNewModeStyles) {
      handleThemeChange({
        mode: newMode,
        modeStyles: updatedModeStyles,
        ...savedNewModeStyles
      });
    } else {
      // Default fallback using smart shift
      handleThemeChange({
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

  const handleUpdateLayout = (updates: Partial<LayoutConfig>) => {
    updateCurrentPage({ layout: { ...layout, ...updates } });
  };

  const handlePageChange = (pageId: string) => {
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, activePageId: pageId } : p
    ));
    setSelectedWidgetId(null);
  };

  const addPage = () => {
    const newId = `page_${Date.now()}`;
    const newPage: DashboardPage = {
      ...DEFAULT_PAGE,
      id: newId,
      name: `New Page ${currentProject.pages.length + 1}`
    };
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, pages: [...p.pages, newPage], activePageId: newId } : p
    ));
  };


  // ── react-grid-layout helpers ─────────────────────────────────────────
  const currentRglLayout = useMemo<LayoutItem[]>(() => {
    const saved = rglLayouts[currentPage.id] ?? [];
    const savedMap = new Map<string, LayoutItem>(saved.map(l => [l.i, l]));
    if (saved.length === 0) return computeInitialLayout(widgets, layout.columns);
    return widgets.map((w): LayoutItem => {
      const s = savedMap.get(w.id);
      // x,y from saved; w,h always from widget (sidebar edits take effect immediately)
      if (s) return { i: s.i, x: s.x, y: s.y, w: w.colSpan, h: w.rowSpan };
      return { i: w.id, x: 0, y: 0, w: w.colSpan, h: w.rowSpan };
    });
  }, [rglLayouts, currentPage.id, widgets, layout.columns]);

  const rglRowHeight = useMemo(() => {
    if (layout.fitToScreen) {
      const gap = (layout.rows - 1) * theme.spacing;
      return Math.max(30, (mainAreaHeight - gap) / layout.rows);
    }
    return layout.defaultRowHeight;
  }, [layout.fitToScreen, layout.rows, layout.defaultRowHeight, mainAreaHeight, theme.spacing]);

  const handleRglLayoutChange = useCallback((newLayout: readonly LayoutItem[]) => {
    const widgetIds = new Set(widgets.map(w => w.id));
    const filtered = Array.from(newLayout).filter(l => widgetIds.has(l.i));
    setRglLayouts(prev => ({ ...prev, [currentPage.id]: filtered }));
    // sync colSpan/rowSpan back to widget state
    updateCurrentPage({
      widgets: widgets.map(w => {
        const item = filtered.find(l => l.i === w.id);
        if (!item) return w;
        return { ...w, colSpan: item.w, rowSpan: item.h };
      })
    });
  }, [widgets, currentPage.id]);
  // ─────────────────────────────────────────────────────────────────────

  const addProject = () => {
    const newId = `project_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: `New Project ${projects.length + 1}`,
      pages: [{ ...DEFAULT_PAGE, id: 'page_1', name: 'Dashboard' }],
      activePageId: 'page_1',
      theme: DEFAULT_THEME
    };
    setProjects(prev => [...prev, newProject]);
    setActiveProjectId(newId);
    setIsProjectDropdownOpen(false);
  };

  const handleProjectSave = () => {
    if (isEditMode) {
      showToast('Project configuration saved successfully');
      setIsEditMode(false);
      setIsDesignSidebarOpen(false);
      setSelectedWidgetId(null);
    } else {
      setIsEditMode(true);
    }
  };

  const updateHeader = (newHeader: Partial<HeaderConfig>) => {
    updateCurrentPage({ header: { ...header, ...newHeader } });
  };

  const handleExcelUpload = (id: string, newData: any[]) => {
    updateWidget(id, { data: newData });
  };

  const showSidebar = !isPreviewMode && (isEditMode || isDesignSidebarOpen || selectedWidgetId !== null);

  const libraryOptions = [
    { value: ChartLibrary.RECHARTS, label: 'Recharts', icon: BarChart3, color: '#3b82f6' },
    { value: ChartLibrary.APEXCHARTS, label: 'ApexCharts', icon: TrendingUp, color: '#10b981' },
    { value: ChartLibrary.AMCHARTS, label: 'amCharts', icon: Activity, color: '#8b5cf6' },
  ];

  const currentLibrary = libraryOptions.find(opt => opt.value === theme.chartLibrary) || libraryOptions[0];

  const isCyber = theme.mode === ThemeMode.CYBER;

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text-main)] overflow-hidden ${isCyber ? 'cyber' : ''}`}>
      <DesignSystem theme={theme} />
      {isCyber && <div className="cyber-hud-line" />}

      {!isPreviewMode && (
        <header className={`z-50 px-6 py-3 flex items-center justify-between shrink-0 transition-all duration-500 ${isCyber ? 'bg-black/40 border-b border-cyan-500/30' : 'border-b backdrop-blur-md bg-[var(--surface)]/80 border-[var(--border-base)]'}`}>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <IsometricLogo isCyber={isCyber} isDark={theme.mode === ThemeMode.DARK} primaryColor={theme.primaryColor} />
              <div>
                <h1 className={`font-bold leading-tight flex items-center ${isCyber ? 'text-[var(--primary-color)] neon-glow uppercase tracking-widest italic' : 'text-main'}`}>
                  {isCyber ? (
                    <span>STN INFOTECH CORE</span>
                  ) : (
                    <>STN infotech <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded ml-2 font-black">PRO</span></>
                  )}
                  {isCyber && <span className="text-[8px] bg-[var(--secondary-color)] text-white px-1.5 py-0.5 ml-2 font-black rounded-sm animate-pulse">HUD v3.0</span>}
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className={`text-[10px] uppercase font-bold transition-colors ${isCyber ? 'text-cyan-400 group-hover:text-white' : 'text-muted group-hover:text-primary'}`}>{currentProject.name}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''} ${isCyber ? 'text-cyan-400' : 'text-muted'}`} />
                  </button>

                  {isProjectDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)} />
                      <div className={`absolute top-full left-0 mt-2 w-64 p-2 shadow-premium z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-[var(--surface)] border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-2xl'}`}>
                        <div className="px-3 py-2 mb-1 border-b border-[var(--border-muted)]">
                          <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Select Project</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {projects.map(p => (
                            <button
                              key={p.id}
                              onClick={() => {
                                setActiveProjectId(p.id);
                                setIsProjectDropdownOpen(false);
                              }}
                              className={`btn-base btn-ghost w-full justify-start px-4 py-2.5 mb-1 ${isCyber ? 'rounded-md' : 'rounded-xl'} ${activeProjectId === p.id ? 'active' : ''}`}
                            >
                              <div className="flex-1 text-left">
                                <p className="font-bold text-xs uppercase tracking-tight">{p.name}</p>
                                <p className="text-[8px] text-muted uppercase font-bold">{p.pages.length} Pages</p>
                              </div>
                              {activeProjectId === p.id && <CheckCircle2 className="w-4 h-4 text-primary" />}
                            </button>
                          ))}
                        </div>
                        <div className="p-1 mt-1 border-t border-[var(--border-muted)]">
                          <button onClick={addProject} className={`btn-base btn-ghost w-full px-4 py-2.5 text-primary ${isCyber ? 'rounded-md' : 'rounded-xl'}`}>
                            <Plus className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase">New Project</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div >

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                className={`btn-base ${isCyber ? 'btn-premium' : 'btn-surface'} ${isLibraryDropdownOpen ? 'active' : ''}`}
              >
                <div className="icon-box w-5 h-5 rounded-md flex items-center justify-center shadow-sm" style={{ backgroundColor: `${currentLibrary.color}20` }}>
                  <currentLibrary.icon className="w-3.5 h-3.5 underline-offset-2" style={{ color: currentLibrary.color }} />
                </div>
                <span>{currentLibrary.label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 opacity-50 ${isLibraryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLibraryDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLibraryDropdownOpen(false)} />
                  <div className={`absolute top-full right-0 mt-2 w-52 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isCyber ? 'bg-black/90 border border-cyan-500/50 shadow-[0_0_30px_rgba(0,229,255,0.2)] rounded-md' : 'bg-[var(--surface)] border border-[var(--border-base)] rounded-2xl shadow-premium'}`}>
                    <div className="px-3 py-2 mb-1">
                      <p className={`text-[10px] uppercase font-bold tracking-widest ${isCyber ? 'text-cyan-400/60 glitch-text' : 'text-muted'}`} data-text="SELECT_CORE_ENGINE">
                        {isCyber ? 'SELECT_CORE_ENGINE' : 'Select Engine'}
                      </p>
                    </div>
                    {libraryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleThemeChange({ ...theme, chartLibrary: opt.value as ChartLibrary });
                          setIsLibraryDropdownOpen(false);
                        }}
                        className={`w-full justify-between px-3 py-2.5 flex items-center transition-all ${isCyber
                          ? `hover:bg-cyan-500/10 ${theme.chartLibrary === opt.value ? 'bg-cyan-500/20 text-cyan-400' : 'text-cyan-600'}`
                          : `btn-base btn-ghost rounded-xl ${theme.chartLibrary === opt.value ? 'active' : ''}`
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isCyber ? 'bg-cyan-900/40 border border-cyan-500/30' : ''}`} style={!isCyber ? { backgroundColor: `${opt.color}15` } : {}}>
                            <opt.icon className="w-4 h-4" style={{ color: isCyber ? '#00e5ff' : opt.color }} />
                          </div>
                          <span className={`font-bold text-xs uppercase tracking-tight ${isCyber ? 'italic' : ''}`}>{opt.label}</span>
                        </div>
                        {theme.chartLibrary === opt.value && (
                          <CheckCircle2 className={`w-4 h-4 ${isCyber ? 'text-cyan-400' : 'text-primary'}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>


            <div className="h-6 w-px bg-[var(--border-base)] mx-1" />

            <button onClick={handleToggleDesignSidebar} className={`btn-base ${isCyber ? 'btn-premium' : 'btn-surface'} ${isDesignSidebarOpen ? 'active' : ''}`}>
              <Palette className="w-4 h-4" /> <span>Design</span>
            </button>
            <button onClick={handleProjectSave} className={`btn-base ${isCyber ? 'btn-premium' : 'btn-surface'} ${isEditMode ? 'active' : ''}`}>
              <Edit3 className="w-4 h-4" /> <span>{isEditMode ? 'Save Project' : 'Edit Project'}</span>
            </button>
            <button
              disabled={isEditMode}
              onClick={() => setIsPreviewMode(true)}
              className={`btn-base ${isCyber ? 'btn-premium' : 'btn-surface'} ${isEditMode ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <Eye className="w-4 h-4" /> <span>Preview</span>
            </button>
          </div>
        </header >
      )}

      {/* 2. Main Workspace (Flex-Row for Left Sidebar / Content / Right Sidebar) */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left Side Header (if positioned LEFT) */}
        {header.show && header.position === HeaderPosition.LEFT && (
          <aside
            style={{
              width: `${header.width}px`,
              backgroundColor: header.backgroundColor,
              color: header.textColor,
              padding: `${header.padding}px`,
              margin: `${header.margin}px`,
            }}
            className={`h-full flex flex-col z-20 transition-all shrink-0 ${header.backgroundColor !== 'transparent' ? 'shadow-sm' : ''} ${header.showDivider !== false && header.backgroundColor !== 'transparent' ? 'border-r border-[var(--border-base)]' : ''}`}
          >
            <div className={`mb-8 flex flex-col items-${header.textAlignment === TextAlignment.CENTER ? 'center' : header.textAlignment === TextAlignment.RIGHT ? 'end' : 'start'} ${header.textAlignment === TextAlignment.CENTER ? 'text-center' : header.textAlignment === TextAlignment.RIGHT ? 'text-right' : 'text-left'}`}>
              {/* Dual Mode Support Toggle (LEFT) */}
              {theme.dualModeSupport && (
                <div className="mb-6">
                  <ModeToggle mode={theme.mode} onChange={handleModeSwitch} />
                </div>
              )}
              {header.logo && (
                <img src={header.logo} alt="Logo" className="h-8 w-auto mb-4 object-contain" />
              )}
              <h2 className="text-lg font-black tracking-tighter uppercase">{header.title}</h2>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar">
              {currentProject.pages.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePageChange(p.id)}
                  className={`btn-base w-full justify-start py-3 px-4 ${isCyber ? 'btn-premium' : 'btn-surface'} ${currentPage.id === p.id ? 'active' : ''}`}
                >
                  <Layout className="w-4 h-4" />
                  <span>{p.name}</span>
                </button>
              ))}
              {isEditMode && (
                <button onClick={addPage} className="w-full mt-4 p-3 border-2 border-dashed border-[var(--border-base)] rounded-xl text-muted hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Plus className="w-4 h-4" /> New Page
                </button>
              )}
            </nav>
          </aside>
        )}

        {/* Central Dashboard Area (Top Fixed Header + Scrollable Content) */}
        <div className="flex-1 flex flex-col relative overflow-hidden bg-[var(--background)]">
          {/* Top Header (if positioned TOP) */}
          {header.show && header.position === HeaderPosition.TOP && (
            <header
              style={{
                height: `${header.height}px`,
                backgroundColor: header.backgroundColor,
                color: header.textColor,
                padding: `0 ${header.padding}px`,
                margin: `${header.margin}px`,
              }}
              className={`flex items-center z-20 transition-all shrink-0 ${header.backgroundColor !== 'transparent' ? 'shadow-sm' : ''} ${header.showDivider !== false && header.backgroundColor !== 'transparent' ? 'border-b border-[var(--border-base)]' : ''}`}
            >
              <div className={`flex items-center gap-8 w-full relative ${header.textAlignment === TextAlignment.CENTER ? 'justify-between' :
                header.textAlignment === TextAlignment.RIGHT ? 'flex-row-reverse' : 'justify-between'
                }`}>
                {/* Title & Toggle Section */}
                <div className={`flex items-center gap-6 ${header.textAlignment === TextAlignment.RIGHT ? 'flex-row-reverse' : ''}`}>
                  {/* Dual Mode Support Toggle (TOP) */}
                  {theme.dualModeSupport && (
                    <ModeToggle mode={theme.mode} onChange={handleModeSwitch} />
                  )}

                  <div className={`flex items-center gap-3 ${header.textAlignment === TextAlignment.CENTER ? 'absolute left-1/2 -translate-x-1/2 px-4' : ''
                    } ${header.textAlignment === TextAlignment.RIGHT ? 'flex-row-reverse' : ''}`}>
                    {header.logo && (
                      <img src={header.logo} alt="Logo" className="h-6 w-auto object-contain" />
                    )}
                    <h2 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap">{header.title}</h2>
                  </div>
                </div>

                {/* Navigation Tabs */}
                {theme.showPageTabs !== false && (
                  <nav className={`flex items-center gap-2 overflow-x-auto no-scrollbar p-1 z-10 ${isCyber ? 'bg-transparent' : 'rounded-xl bg-[var(--surface-muted)]'}`}>
                    {currentProject.pages.map(p => (
                      <button
                        key={p.id}
                        onClick={() => handlePageChange(p.id)}
                        className={`btn-base ${isCyber ? 'btn-premium' : 'btn-surface'} ${currentPage.id === p.id ? 'active' : ''}`}
                      >
                        {p.name}
                      </button>
                    ))}
                    {isEditMode && (
                      <button onClick={addPage} className={`p-2 text-muted hover:text-primary transition-all ${isCyber ? 'rounded-md' : 'rounded-xl'}`}>
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </nav>
                )}
              </div>
            </header>
          )}

          {/* Widgets Grid Container */}
          <main
            ref={mainAreaRef}
            className={`flex-1 relative custom-scrollbar transition-all ${layout.fitToScreen ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}
          >
            {isPreviewMode && (
              <button
                onClick={() => setIsPreviewMode(false)}
                className="fixed bottom-8 right-8 z-50 btn-base btn-surface active px-8 py-4 rounded-full shadow-premium hover:scale-105 transition-transform"
                style={{ borderRadius: '999px' }}
              >
                <EyeOff className="w-5 h-5" /> Exit Preview
              </button>
            )}

            {/* RGL container wrapper — useContainerWidth attaches ref here */}
            <div
              ref={gridContainerRef as React.RefObject<HTMLDivElement>}
              className={`${layout.fitToScreen ? 'h-full' : 'h-auto'}`}
              style={{ padding: 'var(--dashboard-padding)' }}
            >
              {widgets.length === 0 && isEditMode ? (
                <div className="w-full flex justify-center py-10">
                  <button
                    onClick={handleOpenWidgetPicker}
                    style={{
                      borderRadius: 'var(--border-radius)',
                      width: '100%',
                      maxWidth: '800px',
                      minHeight: '320px'
                    }}
                    className="flex flex-col items-center justify-center border-2 border-dashed border-main bg-surface/30 text-muted hover:bg-[var(--primary-subtle)] hover:border-primary transition-all group"
                  >
                    <div className="w-16 h-16 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <span className="font-black text-lg uppercase tracking-widest block mb-2">Create Your Dashboard</span>
                      <p className="text-xs text-muted font-medium">Click to add your first analysis widget</p>
                    </div>
                  </button>
                </div>
              ) : (
                <>
                  <GridLayout
                    layout={currentRglLayout}
                    width={gridWidth}
                    gridConfig={{
                      cols: layout.columns,
                      rowHeight: rglRowHeight,
                      margin: [theme.spacing, theme.spacing] as [number, number],
                      containerPadding: [0, 0] as [number, number],
                      maxRows: layout.fitToScreen ? layout.rows : Infinity,
                    }}
                    dragConfig={{
                      enabled: isEditMode,
                      handle: '.drag-handle',
                    }}
                    resizeConfig={{ enabled: isEditMode, handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's'] as const }}
                    autoSize={!layout.fitToScreen}
                    onLayoutChange={handleRglLayoutChange}
                    style={{ minHeight: (layout.fitToScreen && widgets.length > 0) ? '100%' : 'auto' }}
                  >
                    {(widgets || []).map((widget) => (
                      <div
                        key={widget.id}
                        className={`h-full transition-all duration-200 ${selectedWidgetId === widget.id
                          ? 'widget-selected'
                          : ''
                          }`}
                        style={selectedWidgetId === widget.id ? { zIndex: 50 } : {}}
                      >
                        <WidgetCard
                          widget={widget}
                          theme={theme}
                          isEditMode={isEditMode}
                          onEdit={handleWidgetSelect}
                          onUpdate={updateWidget}
                          onDelete={deleteWidget}
                          onOpenExcel={(id) => setExcelWidgetId(id)}
                        />
                      </div>
                    ))}
                  </GridLayout>

                  {isEditMode && (
                    <button
                      onClick={handleOpenWidgetPicker}
                      style={{
                        borderRadius: 'var(--border-radius)',
                        marginTop: 'var(--spacing)',
                        width: '100%',
                        minHeight: '150px'
                      }}
                      className="flex flex-col items-center justify-center border-2 border-dashed border-main bg-surface/30 text-muted hover:bg-[var(--primary-subtle)] hover:border-primary transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-primary" />
                      </div>
                      <span className="font-semibold text-xs uppercase tracking-tighter">Add Widget</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </main>
        </div>

        {/* 3. Right Sidebar (Design or Settings) */}
        {showSidebar && (
          <div className="h-full shadow-2xl transition-all duration-300 z-30 shrink-0 border-l border-[var(--border-base)] bg-[var(--surface)]">
            {isDesignSidebarOpen ? (
              <DesignSidebar
                theme={theme}
                header={header}
                currentPage={currentPage}
                updateTheme={handleThemeChange}
                updateHeader={updateHeader}
                onUpdatePage={updateCurrentPage}
                presets={presets}
                onSavePreset={handleSavePreset}
                onApplyPreset={handleApplyPreset}
                onOpenDocs={() => setIsDesignDocsOpen(true)}
                onClose={() => setIsDesignSidebarOpen(false)}
                onModeSwitch={handleModeSwitch}
              />
            ) : selectedWidgetId ? (
              <Sidebar theme={theme} selectedWidget={widgets.find(w => w.id === selectedWidgetId) || null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setSelectedWidgetId(null)} />
            ) : isEditMode ? (
              <Sidebar theme={theme} selectedWidget={null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setIsEditMode(false)} />
            ) : null}
          </div>
        )}
      </div>

      {/* Excel Integration Modal */}
      <ExcelModal
        isOpen={excelWidgetId !== null}
        onClose={() => setExcelWidgetId(null)}
        widget={widgets.find(w => w.id === excelWidgetId) || null}
        onUpload={handleExcelUpload}
        isDark={theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER}
      />

      {/* Premium Toast Notification */}
      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        title="Widget 삭제"
        message="이 위젯을 정말로 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDeleteWidget}
        onCancel={() => setDeleteConfirmId(null)}
        isDark={theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER}
      />
      {
        toast && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 px-6 py-4 bg-[var(--surface)] border border-[var(--border-base)] shadow-premium rounded-2xl min-w-[320px]">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-0.5">System Notification</p>
                <p className="text-sm font-bold text-main">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Plus className="w-4 h-4 rotate-45 text-muted" />
              </button>
            </div>
          </div>
        )
      }

      {
        isDesignDocsOpen && (
          <DesignDocs onClose={() => setIsDesignDocsOpen(false)} />
        )
      }

      <WidgetPicker
        isOpen={isWidgetPickerOpen}
        onClose={() => setIsWidgetPickerOpen(false)}
        onSelect={addWidgetWithType}
        isDark={theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER}
      />
    </div >
  );
};

export default App;
