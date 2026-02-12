import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout, Edit3, Eye, Plus, Palette, Settings2, BookOpen,
  BarChart3, TrendingUp, Activity, ChevronDown, EyeOff, CheckCircle2
} from 'lucide-react';
import {
  Widget, WidgetType, DashboardTheme, LayoutConfig, ThemeMode, ChartLibrary,
  Project, DashboardPage, HeaderConfig, HeaderPosition, TextAlignment
} from './types';
import {
  INITIAL_PROJECT_LIST, MOCK_CHART_DATA, DEFAULT_PAGE, DEFAULT_HEADER, DEFAULT_THEME
} from './constants';
import WidgetCard from './components/WidgetCard';
import DesignSidebar from './components/DesignSidebar';
import Sidebar from './components/Sidebar';
import ExcelModal from './components/ExcelModal';
import ConfirmModal from './components/ConfirmModal';
import DesignDocs from './components/DesignDocs';
import DesignSystem from './DesignSystem';

const App: React.FC = () => {
  // Navigation & Project State
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECT_LIST);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECT_LIST[0].id);

  const currentProject = projects.find(p => p.id === activeProjectId) || projects[0];
  const currentPage = currentProject.pages.find(p => p.id === currentProject.activePageId) || currentProject.pages[0];

  const [isEditMode, setIsEditMode] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

  // Excel Modal State
  const [excelWidgetId, setExcelWidgetId] = useState<string | null>(null);

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);
  const [isDesignDocsOpen, setIsDesignDocsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

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
    setProjects(prev => prev.map(p =>
      p.id === activeProjectId ? { ...p, theme: { ...p.theme, ...newTheme } } : p
    ));
  };


  const addWidget = () => {
    const newWidget: Widget = {
      id: `widget_${Date.now()}`,
      type: WidgetType.CHART_BAR,
      title: 'New Analysis',
      colSpan: 4,
      rowSpan: 2,
      config: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        showLegend: true,
        showGrid: true,
        showXAxis: true,
        showYAxis: true,
        showUnit: false,
        showUnitInLegend: false,
        showLabels: false,
        unit: '',
        series: [{ key: 'value', label: 'Revenue', color: 'var(--primary-color)' }]
      },
      data: MOCK_CHART_DATA
    };
    updateCurrentPage({ widgets: [...widgets, newWidget] });
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
    if (!id) setIsDesignSidebarOpen(false);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedWidgetId(null);
  };

  const handleToggleDesignSidebar = () => {
    setIsDesignSidebarOpen(!isDesignSidebarOpen);
    setSelectedWidgetId(null);
  };

  const handleThemeChange = (newTheme: Partial<DashboardTheme>) => {
    updateProjectTheme(newTheme);
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
    updateCurrentPage({ widgets: newWidgets });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

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

  return (
    <div className="h-screen flex flex-col transition-colors duration-300 bg-[var(--background)] text-[var(--text-main)] overflow-hidden">
      <DesignSystem theme={theme} />

      {/* 1. Global Navigation Bar (Brand, Project Switcher, and Main Actions) */}
      {!isPreviewMode && (
        <header className="z-50 border-b px-6 py-3 flex items-center justify-between backdrop-blur-md bg-[var(--surface)]/80 border-[var(--border-base)] shrink-0">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-xl shadow-lg bg-primary">
                <Layout className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold leading-tight text-main flex items-center">
                  STN infotech <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded ml-2 font-black">PRO</span>
                </h1>
                <div className="relative">
                  <button
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="text-[10px] uppercase font-bold text-muted transition-colors group-hover:text-primary">{currentProject.name}</span>
                    <ChevronDown className={`w-3 h-3 text-muted group-hover:text-primary transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProjectDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setIsProjectDropdownOpen(false)} />
                      <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl p-2 shadow-premium z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-[var(--surface)] border border-[var(--border-base)]">
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
                              className={`btn-base btn-ghost w-full justify-start px-4 py-2.5 rounded-xl mb-1 ${activeProjectId === p.id ? 'active' : ''}`}
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
                          <button onClick={addProject} className="btn-base btn-ghost w-full px-4 py-2.5 rounded-xl text-primary">
                            <Plus className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase">New Project</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
            <button onClick={handleProjectSave} className={`btn-base btn-surface ${isEditMode ? 'active' : ''}`}>
              <Edit3 className="w-4 h-4" /> <span>{isEditMode ? 'Save Project' : 'Edit Project'}</span>
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
            className="h-full border-r border-[var(--border-base)] flex flex-col z-20 transition-all shadow-sm shrink-0"
          >
            <div className={`mb-8 flex flex-col items-${header.textAlignment === TextAlignment.CENTER ? 'center' : header.textAlignment === TextAlignment.RIGHT ? 'end' : 'start'} ${header.textAlignment === TextAlignment.CENTER ? 'text-center' : header.textAlignment === TextAlignment.RIGHT ? 'text-right' : 'text-left'}`}>
              {header.logo && (
                <img src={header.logo} alt="Logo" className="h-8 w-auto mb-4 object-contain" />
              )}
              <h2 className="text-lg font-black tracking-tighter uppercase">{header.title}</h2>
            </div>

            <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar">
              {currentProject.pages.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePageChange(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-tight transition-all ${currentPage.id === p.id ? 'bg-primary text-white shadow-lg' : 'hover:bg-[var(--border-muted)] text-secondary'}`}
                >
                  {p.name}
                </button>
              ))}
              {isEditMode && (
                <button onClick={addPage} className="w-full text-left px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-tight border-2 border-dashed border-[var(--border-base)] text-muted hover:border-primary hover:text-primary transition-all flex items-center gap-2">
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
              className="flex items-center border-b border-[var(--border-base)] z-20 transition-all shadow-sm shrink-0"
            >
              <div className={`flex-1 flex items-center gap-8 ${header.textAlignment === TextAlignment.CENTER ? 'justify-center' : header.textAlignment === TextAlignment.RIGHT ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-center gap-3">
                  {header.logo && (
                    <img src={header.logo} alt="Logo" className="h-6 w-auto object-contain" />
                  )}
                  <h2 className="text-lg font-black tracking-tighter uppercase whitespace-nowrap">{header.title}</h2>
                </div>

                <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                  {currentProject.pages.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePageChange(p.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${currentPage.id === p.id ? 'bg-primary text-white shadow-md' : 'hover:bg-[var(--border-muted)] text-secondary'}`}
                    >
                      {p.name}
                    </button>
                  ))}
                  {isEditMode && (
                    <button onClick={addPage} className="p-2 rounded-xl text-muted hover:bg-[var(--border-muted)] transition-all">
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </nav>
              </div>
            </header>
          )}

          {/* Widgets Grid Container */}
          <main className={`flex-1 p-8 relative custom-scrollbar transition-all ${layout.fitToScreen ? 'h-full overflow-hidden' : 'overflow-y-auto'}`}>
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
              className="grid transition-all duration-300 min-h-full"
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
              {(widgets || []).map((widget, index) => (
                <div
                  key={widget.id}
                  draggable={isEditMode}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`transition-all duration-200 ${selectedWidgetId === widget.id ? 'ring-2 ring-blue-500 rounded-[inherit]' : ''} ${draggedIndex === index ? 'opacity-30 scale-95 cursor-grabbing' : 'opacity-100'} ${dragOverIndex === index ? 'scale-[1.02] ring-2 ring-dashed ring-blue-300' : ''}`}
                  style={{ gridColumn: `span ${Math.min(widget.colSpan, layout.columns)}`, gridRow: `span ${widget.rowSpan}` }}
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

              {isEditMode && (
                <button
                  onClick={addWidget}
                  style={{ borderRadius: 'var(--border-radius)' }}
                  className="h-full flex flex-col items-center justify-center border-2 border-dashed border-main bg-surface/30 text-muted hover:bg-[var(--primary-subtle)] hover:border-primary transition-all group min-h-[150px]"
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <span className="font-semibold text-xs uppercase tracking-tighter">Add Widget</span>
                </button>
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
                onOpenDocs={() => setIsDesignDocsOpen(true)}
                onClose={() => setIsDesignSidebarOpen(false)}
              />
            ) : selectedWidgetId ? (
              <Sidebar selectedWidget={widgets.find(w => w.id === selectedWidgetId) || null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setSelectedWidgetId(null)} />
            ) : isEditMode ? (
              <Sidebar selectedWidget={null} layout={layout} onUpdateWidget={updateWidget} onUpdateLayout={handleUpdateLayout} onClose={() => setIsEditMode(false)} />
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
        isDark={theme.mode === ThemeMode.DARK}
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
        isDark={theme.mode === ThemeMode.DARK}
      />
      {toast && (
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
      )}

      {isDesignDocsOpen && (
        <DesignDocs onClose={() => setIsDesignDocsOpen(false)} />
      )}
    </div>
  );
};

export default App;
