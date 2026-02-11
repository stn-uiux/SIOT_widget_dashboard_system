import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Edit3, Eye, Plus, Palette, Settings2,
  BarChart3, TrendingUp, Activity, ChevronDown, EyeOff, CheckCircle2
} from 'lucide-react';
import {
  Widget, WidgetType, DashboardTheme, LayoutConfig, ThemeMode, ChartLibrary
} from './types';
import {
  DEFAULT_THEME, DEFAULT_LAYOUT, MOCK_CHART_DATA
} from './constants';
import WidgetCard from './components/WidgetCard';
import DesignSidebar from './components/DesignSidebar';
import Sidebar from './components/Sidebar';
import ExcelModal from './components/ExcelModal';
import DesignSystem from './DesignSystem';

const App: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [theme, setTheme] = useState<DashboardTheme>(DEFAULT_THEME);
  const [layout, setLayout] = useState<LayoutConfig>(DEFAULT_LAYOUT);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Excel Modal State
  const [excelWidgetId, setExcelWidgetId] = useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    const initialWidgets: Widget[] = [
      {
        id: '1',
        type: WidgetType.CHART_BAR,
        title: 'Global Revenue',
        titleSize: 18,
        titleWeight: '700',
        contentSize: 12,
        colSpan: 2,
        rowSpan: 1,
        config: {
          xAxisKey: 'name',
          xAxisLabel: 'Month',
          yAxisKey: 'value',
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          showUnit: true,
          showUnitInLegend: true,
          showLabels: false,
          unit: '$',
          series: [
            { key: 'value', label: 'Europe', color: 'var(--primary-color)' },
            { key: 'secondary', label: 'North America', color: 'var(--primary-70)' },
            { key: 'asia', label: 'Asia', color: 'var(--primary-30)' }
          ]
        },
        data: MOCK_CHART_DATA.map(d => ({ ...d, asia: Math.floor(Math.random() * 500) }))
      },
      {
        id: '3',
        type: WidgetType.SUMMARY,
        title: 'Total Sales',
        titleSize: 14,
        titleWeight: '500',
        contentSize: 14,
        colSpan: 1,
        rowSpan: 1,
        mainValue: '$45,231',
        subValue: '+18.2% since last month',
        config: {
          xAxisKey: '',
          yAxisKey: '',
          showLegend: false,
          showGrid: false,
          showXAxis: false,
          showYAxis: false,
          showUnit: false,
          showUnitInLegend: false,
          showLabels: false,
          unit: '',
          series: []
        },
        data: []
      },
      {
        id: '4',
        type: WidgetType.TABLE,
        title: 'Project Status',
        titleSize: 16,
        titleWeight: '700',
        contentSize: 12,
        colSpan: 3,
        rowSpan: 1,
        config: {
          xAxisKey: 'name',
          xAxisLabel: 'Project Name',
          yAxisKey: 'value',
          showLegend: false,
          showGrid: false,
          showXAxis: true,
          showYAxis: true,
          showUnit: false,
          showUnitInLegend: false,
          showLabels: false,
          unit: '',
          series: [
            { key: 'value', label: 'Progress (%)', color: 'var(--primary-color)' },
            { key: 'secondary', label: 'Score', color: 'var(--secondary-color)' }
          ]
        },
        data: [
          { name: 'Alpha', value: 85, secondary: 92 },
          { name: 'Beta', value: 60, secondary: 78 },
          { name: 'Gamma', value: 30, secondary: 45 },
        ]
      }
    ];
    setWidgets(initialWidgets);
  }, []);

  const addWidget = () => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type: WidgetType.SUMMARY,
      title: 'New Widget',
      titleSize: 16,
      titleWeight: '600',
      contentSize: 14,
      colSpan: 1,
      rowSpan: 1,
      mainValue: '0',
      subValue: 'New Label',
      config: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        showLegend: false,
        showGrid: true,
        showXAxis: true,
        showYAxis: true,
        showUnit: false,
        showUnitInLegend: false,
        showLabels: false,
        unit: '',
        series: [{ key: 'value', label: 'Series 1', color: 'var(--primary-color)' }]
      },
      data: [{ name: 'Jan', value: 10 }]
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidgetId(newWidget.id);
  };

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    setWidgets(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const handleThemeChange = useCallback((newTheme: DashboardTheme) => {
    setTheme(newTheme);
  }, []);

  const handleUpdateLayout = useCallback((updates: Partial<LayoutConfig>) => {
    setLayout(prev => ({ ...prev, ...updates }));
  }, []);

  const handleExcelUpload = (id: string, newData: any[]) => {
    updateWidget(id, { data: newData });
  };

  const handleWidgetSelect = (id: string) => {
    setSelectedWidgetId(id);
    setIsDesignSidebarOpen(false);
  };

  const handleToggleDesignSidebar = () => {
    const nextState = !isDesignSidebarOpen;
    setIsDesignSidebarOpen(nextState);
    if (nextState) {
      setIsEditMode(false);
      setSelectedWidgetId(null);
    }
  };

  const handleToggleEditMode = () => {
    const nextState = !isEditMode;
    setIsEditMode(nextState);
    if (nextState) {
      setIsDesignSidebarOpen(false);
      setSelectedWidgetId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    e.preventDefault();
    if (draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    if (!isEditMode || draggedIndex === null) return;
    e.preventDefault();
    const newWidgets = [...widgets];
    const draggedItem = newWidgets[draggedIndex];
    newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, draggedItem);
    setWidgets(newWidgets);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const showSidebar = !isPreviewMode && (isEditMode || isDesignSidebarOpen || selectedWidgetId !== null);

  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);

  const libraryOptions = [
    { value: ChartLibrary.RECHARTS, label: 'Recharts', icon: BarChart3, color: '#3b82f6' },
    { value: ChartLibrary.APEXCHARTS, label: 'ApexCharts', icon: TrendingUp, color: '#10b981' },
    { value: ChartLibrary.AMCHARTS, label: 'amCharts', icon: Activity, color: '#8b5cf6' },
  ];

  const currentLibrary = libraryOptions.find(opt => opt.value === theme.chartLibrary) || libraryOptions[0];

  return (
    <div className="h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text-main)]">
      <DesignSystem theme={theme} />
      {!isPreviewMode && (
        <header className="z-50 border-b px-6 py-3 flex items-center justify-between backdrop-blur-md bg-[var(--surface)]/80 border-[var(--border-base)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-lg bg-primary">
              <Layout className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold leading-tight text-main">
                STN infotech <span className="text-[10px] bg-[var(--primary-subtle)] text-primary px-1.5 py-0.5 rounded ml-2 font-black">PRO</span>
              </h1>
              <p className="text-[10px] text-muted uppercase tracking-widest font-semibold">Custom Widget Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Custom Premium Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                className={`btn-base btn-surface ${isLibraryDropdownOpen ? 'active' : ''}`}
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
                  <div className="absolute top-full right-0 mt-2 w-52 rounded-2xl p-2 shadow-premium z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-[var(--surface)] border border-[var(--border-base)]">
                    <div className="px-3 py-2 mb-1">
                      <p className="text-[10px] uppercase font-bold text-muted tracking-widest">Select Engine</p>
                    </div>
                    {libraryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleThemeChange({ ...theme, chartLibrary: opt.value as ChartLibrary });
                          setIsLibraryDropdownOpen(false);
                        }}
                        className={`btn-base btn-ghost w-full justify-between px-3 py-2.5 rounded-xl ${theme.chartLibrary === opt.value ? 'active' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="icon-box w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110" style={{ backgroundColor: `${opt.color}15` }}>
                            <opt.icon className="w-4 h-4" style={{ color: opt.color }} />
                          </div>
                          <span className="font-bold text-xs uppercase tracking-tight">{opt.label}</span>
                        </div>
                        {theme.chartLibrary === opt.value && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button onClick={handleToggleDesignSidebar} className={`btn-base btn-surface ${isDesignSidebarOpen ? 'active' : ''}`}>
              <Palette className="w-4 h-4" /> <span>Design</span>
            </button>
            <button onClick={handleToggleEditMode} className={`btn-base btn-surface ${isEditMode ? 'active' : ''}`}>
              <Edit3 className="w-4 h-4" /> <span>{isEditMode ? 'Save Layout' : 'Edit Layout'}</span>
            </button>
            <button
              disabled={isEditMode}
              onClick={() => setIsPreviewMode(true)}
              className={`btn-base btn-surface ${isEditMode ? 'opacity-40 grayscale pointer-events-none' : ''}`}
            >
              <Eye className="w-4 h-4" /> <span>Preview</span>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 flex overflow-hidden">
        <div className={`flex-1 p-8 relative custom-scrollbar transition-all ${layout.fitToScreen ? 'h-full overflow-hidden' : 'overflow-y-auto'
          }`}>
          {isPreviewMode && (
            <button
              onClick={() => setIsPreviewMode(false)}
              className="fixed bottom-8 right-8 z-50 btn-base btn-surface active px-8 py-4 rounded-full shadow-premium hover:scale-105 transition-transform"
              style={{ borderRadius: '999px' }}
            >
              <EyeOff className="w-5 h-5" /> Exit Preview
            </button>
          )}

          <div
            className="grid transition-all duration-300"
            style={{
              gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
              gridTemplateRows: layout.fitToScreen
                ? `repeat(${layout.rows}, 1fr)`
                : `repeat(${layout.rows}, ${layout.defaultRowHeight}px)`,
              height: layout.fitToScreen ? '100%' : 'auto',
              minHeight: layout.fitToScreen ? '0' : 'auto',
              gridAutoRows: layout.fitToScreen ? '1fr' : `${layout.defaultRowHeight}px`,
              gap: 'var(--spacing)'
            }}
          >
            {widgets.map((widget, index) => (
              <div key={widget.id} draggable={isEditMode} onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} className={`transition-all duration-200 ${selectedWidgetId === widget.id ? 'ring-2 ring-blue-500 rounded-[inherit]' : ''} ${draggedIndex === index ? 'opacity-30 scale-95 cursor-grabbing' : 'opacity-100'} ${dragOverIndex === index ? 'scale-[1.02] ring-2 ring-dashed ring-blue-300' : ''}`} style={{ gridColumn: `span ${Math.min(widget.colSpan, layout.columns)}`, gridRow: `span ${widget.rowSpan}` }}>
                <WidgetCard
                  widget={widget}
                  theme={theme}
                  isEditMode={isEditMode}
                  onEdit={handleWidgetSelect}
                  onUpdate={updateWidget}
                  onOpenExcel={(id) => setExcelWidgetId(id)}
                />
              </div>
            ))}

            {isEditMode && (
              <button
                onClick={addWidget}
                style={{ borderRadius: 'var(--border-radius)' }}
                className="h-full flex flex-col items-center justify-center border-2 border-dashed border-main bg-surface/30 text-muted hover:bg-[var(--primary-subtle)] hover:border-primary transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 text-primary" />
                </div>
                <span className="font-semibold text-xs uppercase tracking-tighter">Add Widget</span>
              </button>
            )}
          </div>
        </div>

        {showSidebar && (
          <div className="flex h-full shadow-2xl transition-all duration-300 z-30">
            {isDesignSidebarOpen ? (
              <DesignSidebar isOpen={isDesignSidebarOpen} onClose={() => setIsDesignSidebarOpen(false)} theme={theme} setTheme={handleThemeChange} />
            ) : selectedWidgetId ? (
              <Sidebar selectedWidget={widgets.find(w => w.id === selectedWidgetId) || null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setSelectedWidgetId(null)} />
            ) : isEditMode ? (
              <Sidebar selectedWidget={null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setIsEditMode(false)} />
            ) : null}
          </div>
        )}
      </main>

      {/* Excel Integration Modal */}
      <ExcelModal
        isOpen={excelWidgetId !== null}
        onClose={() => setExcelWidgetId(null)}
        widget={widgets.find(w => w.id === excelWidgetId) || null}
        onUpload={handleExcelUpload}
        isDark={theme.mode === ThemeMode.DARK}
      />
    </div>
  );
};

export default App;
