import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// v1.1.5 - Forced reload for HMR sync
import { 
  Project, 
  DashboardPage, 
  Widget, 
  WidgetType, 
  DashboardTheme, 
  ThemePreset,
  LayoutItem,
  LayoutStore,
  LayoutConfig,
  ThemeMode
} from '../types';
import { 
  PROJECTS_STORAGE_KEY,
  LAYOUT_STORAGE_KEY,
  saveProjectsState,
  getInitialProjectsState,
  saveLayoutStore,
  loadLayoutStoreSync,
  migrateProjects,
  savePresets,
  loadPresetsSync,
  dbLoad
} from '../lib/storage';
import { 
  DEFAULT_PAGE,
  DEFAULT_THEME,
  THEME_PRESETS,
  TYPE_DEFAULT_DATA,
  MOCK_CHART_DATA
} from '../constants';
import { getSmartColorForMode } from '../design-tokens/themeFromTokens';
import { importProjectFromZip, exportProjectToZip } from '../lib/exportImport';
// Static assets for onboarding
const proj1Zip = new URL("../assets/New_Project_1_2026-04-08.zip", import.meta.url).href;
const proj2Zip = new URL("../assets/new_project_2_2026-04-08.zip", import.meta.url).href;
const proj3Zip = new URL("../assets/New_Project_3_2026-04-08.zip", import.meta.url).href;
const proj4Zip = new URL("../assets/New_Project_4_2026-04-09.zip", import.meta.url).href;

export const useDashboard = () => {
  const [projects, setProjects] = useState<Project[]>(() => getInitialProjectsState().projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => getInitialProjectsState().activeProjectId);
  const [excelWidgetId, setExcelWidgetId] = useState<string | null>(null);
  const [layoutStore, setLayoutStore] = useState<LayoutStore>(loadLayoutStoreSync);
  const [isHydrated, setIsHydrated] = useState(false);
  const [presets, setPresets] = useState<ThemePreset[]>(() => loadPresetsSync(THEME_PRESETS));

  // ── I/O 관련 상태 (Export / Import) ──
  const [capturingForExport, setCapturingForExport] = useState(false);
  const [exportPhase, setExportPhase] = useState<"waiting" | "capturing" | "packing" | null>(null);
  const [exportTarget, setExportTarget] = useState<"full" | "base" | null>(null);
  const [importTarget, setImportTarget] = useState<"full" | "base" | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [hideBarForCapture, setHideBarForCapture] = useState(false);

  const layoutStoreRef = useRef<LayoutStore>(layoutStore);
  layoutStoreRef.current = layoutStore;
  const projectsRef = useRef<Project[]>(projects);
  projectsRef.current = projects;

  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const theme = currentProject?.theme || DEFAULT_THEME;
  const currentPage = currentProject?.pages?.find((p) => p.id === currentProject?.activePageId) || currentProject?.pages?.[0];
  const { widgets = [], layout = DEFAULT_PAGE.layout } = currentPage ?? { widgets: [], layout: DEFAULT_PAGE.layout };

  // Hydration logic
  useEffect(() => {
    let cancelled = false;
    const hydrateAndOnboard = async () => {
      try {
        const saved = await dbLoad<any>(PROJECTS_STORAGE_KEY);
        const projectsRaw = localStorage.getItem(PROJECTS_STORAGE_KEY);

        if (!cancelled && saved?.projects?.length > 0) {
          const migrated = migrateProjects(saved.projects);
          setProjects(migrated);
          if (saved.activeProjectId) setActiveProjectId(saved.activeProjectId);
        } else if (!cancelled && !projectsRaw) {
          const zipUrls = [proj1Zip, proj2Zip, proj3Zip, proj4Zip];
          const loadedProjects: Project[] = [];
          const loadedLayouts: LayoutStore = {};

          for (const url of zipUrls) {
            try {
              const res = await fetch(url);
              if (!res.ok) continue;
              const blob = await res.blob();
              const file = new File([blob], "initial_project.zip", { type: "application/zip" });
              const { project, layoutPositions } = await importProjectFromZip(file);
              loadedProjects.push(project);
              loadedLayouts[project.id] = layoutPositions;
            } catch (e) {
              console.error("[STN] Onboarding failed:", url, e);
            }
          }

          if (!cancelled && loadedProjects.length > 0) {
            const migrated = migrateProjects(loadedProjects);
            setProjects(migrated);
            setActiveProjectId(migrated[0].id);
            setLayoutStore(prev => ({ ...prev, ...loadedLayouts }));
            saveProjectsState(migrated, migrated[0].id);
            saveLayoutStore(loadedLayouts);
          }
        }

        const savedLayout = await dbLoad<LayoutStore>(LAYOUT_STORAGE_KEY);
        if (!cancelled && savedLayout) {
          setLayoutStore(prev => ({ ...prev, ...savedLayout }));
        }

        setIsHydrated(true);
      } catch (err) {
        console.error("[STN] Initialization error:", err);
        setIsHydrated(true);
      }
    };
    hydrateAndOnboard();
    return () => { cancelled = true; };
  }, []);

  // Sync with IndexedDB
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProjectsState(projects, activeProjectId);
    }, 400);

    const handleBeforeUnload = () => {
      saveProjectsState(projects, activeProjectId);
      savePresets(presets);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [projects, activeProjectId, presets]);

  const applyLayoutUpdate = useCallback(
    (updater: (prev: any) => any) => {
      setLayoutStore((prev) => {
        const byProject = prev[activeProjectId] ?? {};
        const nextByProject = updater(byProject);
        const next = { ...prev, [activeProjectId]: nextByProject };
        layoutStoreRef.current = next;
        saveLayoutStore(next);
        return next;
      });
    },
    [activeProjectId],
  );

  const updateCurrentPage = useCallback((updates: Partial<DashboardPage>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            pages: p.pages.map((pg) => {
              const effectiveActivePageId = p.activePageId || p.pages[0]?.id;
              return pg.id === effectiveActivePageId ? { ...pg, ...updates } : pg;
            }),
          };
        }
        return p;
      }),
    );
  }, [activeProjectId]);

  const updateProjectTheme = useCallback((newTheme: Partial<DashboardTheme>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            theme: { ...p.theme, ...newTheme },
          };
        }
        return p;
      }),
    );
  }, [activeProjectId]);

  const replaceActiveProject = useCallback((newProject: Project) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? newProject : p))
    );
  }, [activeProjectId]);

  const handlePageChange = (pageId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, activePageId: pageId } : p,
      ),
    );
  };

  const handleApplyPreset = (preset: ThemePreset) => {
    const currentTheme = currentProject.theme;
    const currentSnapshot = {
      backgroundColor: currentTheme.backgroundColor,
      surfaceColor: currentTheme.surfaceColor,
      primaryColor: currentTheme.primaryColor,
      titleColor: currentTheme.titleColor,
      textColor: currentTheme.textColor,
    };
    const newModeStyles = {
      ...(currentTheme.modeStyles || {}),
      [currentTheme.mode]: currentSnapshot,
    };
    const {
      mode,
      backgroundColor,
      surfaceColor,
      primaryColor,
      titleColor,
      textColor,
      chartPalette,
      cardShadow,
      borderColor
    } = preset.theme;

    const updates: Partial<DashboardTheme> = {
      name: preset.name,
      mode,
      modeStyles: newModeStyles,
      backgroundColor,
      surfaceColor,
      primaryColor,
      titleColor,
      textColor,
      chartPalette,
      cardShadow,
      borderColor
    };
    const isDefaultModePreset = preset.name === "Light Mode" || preset.name === "Dark Mode";
    const targetSaved = (newModeStyles as any)[mode];
    if (isDefaultModePreset && targetSaved && Object.keys(targetSaved).length > 0) {
      Object.assign(updates, targetSaved);
    }
    updateProjectTheme(updates);
  };

  const handleSavePreset = (name: string) => {
    const newPreset: ThemePreset = {
      id: `preset_${Date.now()}`,
      name,
      theme: { ...currentProject.theme, name },
    };
    setPresets((prev) => {
      const next = [...prev, newPreset];
      savePresets(next);
      return next;
    });
  };

  const handleThemeChange = useCallback((newTheme: Partial<DashboardTheme>) => {
    updateProjectTheme(newTheme);
  }, [updateProjectTheme]);

  const updateHeader = useCallback((updates: Partial<any>) => {
    updateCurrentPage({ header: { ...(currentPage?.header || {}), ...updates } });
  }, [currentPage?.header, updateCurrentPage]);

  const handleModeSwitch = (mode: ThemeMode) => {
    const currentTheme = currentProject.theme;
    if (currentTheme.mode === mode) return;
    const currentSnapshot = {
      backgroundColor: currentTheme.backgroundColor,
      surfaceColor: currentTheme.surfaceColor,
      primaryColor: currentTheme.primaryColor,
      titleColor: currentTheme.titleColor,
      textColor: currentTheme.textColor,
    };
    const newModeStyles = {
      ...(currentTheme.modeStyles || {}),
      [currentTheme.mode]: currentSnapshot,
    };
    const updates: Partial<DashboardTheme> = {
      mode,
      name: mode === ThemeMode.DARK ? "Dark Mode" : mode === ThemeMode.LIGHT ? "Light Mode" : currentTheme.name,
      modeStyles: newModeStyles
    };
    const targetSaved = (newModeStyles as any)[mode];
    if (targetSaved && Object.keys(targetSaved).length > 0) {
      Object.assign(updates, targetSaved);
    } else {
      updates.backgroundColor = getSmartColorForMode(currentTheme.backgroundColor, mode, "bg");
      updates.surfaceColor = getSmartColorForMode(currentTheme.surfaceColor, mode, "surface");
      updates.titleColor = getSmartColorForMode(currentTheme.titleColor, mode, "text");
    }
    const h = currentPage.header;
    if (h && h.modeStyles) {
      const hTarget = h.modeStyles[mode];
      if (hTarget) {
        updateHeader(hTarget);
      } else {
        const newHTextColor = getSmartColorForMode(h.textColor, mode, "text");
        const newHBgColor = h.backgroundColor !== 'transparent' ? getSmartColorForMode(h.backgroundColor, mode, "bg") : 'transparent';
        updateHeader({ textColor: newHTextColor, backgroundColor: newHBgColor });
      }
    } else if (h) {
      const newHTextColor = getSmartColorForMode(h.textColor, mode, "text");
      const newHBgColor = h.backgroundColor !== 'transparent' ? getSmartColorForMode(h.backgroundColor, mode, "bg") : 'transparent';
      updateHeader({ textColor: newHTextColor, backgroundColor: newHBgColor });
    }
    updateProjectTheme(updates);
  };

  const handleUpdateLayout = (updates: Partial<LayoutConfig>) => {
    updateCurrentPage({ layout: { ...layout, ...updates } });
  };

  const currentRglLayout = useMemo<LayoutItem[]>(() => {
    const raw = (layoutStore[activeProjectId] ?? {})[currentPage?.id || ''];
    const saved: LayoutItem[] = !raw ? [] : Array.isArray(raw) ? raw : (raw as Record<string, LayoutItem[]>).lg ?? [];
    const savedMap = new Map<string, LayoutItem>(saved.map((l) => [l.i, l]));
    const usePixelGrid = layout.useGrid === false;
    const roundSize = (v: number) => (usePixelGrid ? v : Math.round(v));
    const cols = Math.max(1, layout.columns);

    if (saved.length === 0) return computeInitialLayout(widgets, cols);

    let nextY = 0;
    saved.forEach(l => {
      const bottom = (Number(l.y) || 0) + (Number(l.h) || 0);
      if (bottom > nextY) nextY = bottom;
    });

    let nextX = 0;
    let maxHInRow = 0;

    return widgets.map((w): LayoutItem => {
      const s = savedMap.get(w.id);
      const wVal = sane(roundSize(Number(w.colSpan)), 4);
      const hVal = sane(roundSize(Number(w.rowSpan)), 4);

      if (s) {
        return { i: s.i, x: sane(Number(s.x), 0), y: sane(Number(s.y), 0), w: wVal, h: hVal };
      }

      if (nextX + wVal > cols) {
        nextX = 0;
        nextY += maxHInRow || hVal;
        maxHInRow = 0;
      }
      const item = { i: w.id, x: nextX, y: nextY, w: wVal, h: hVal };
      nextX += wVal;
      maxHInRow = Math.max(maxHInRow, hVal);
      return item;
    });
  }, [layoutStore, activeProjectId, currentPage?.id, widgets, layout.columns, layout.useGrid]);

  const handleRglLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      const widgetIds = new Set(widgets.map((w) => w.id));
      const filtered = Array.from(newLayout).filter((l) => widgetIds.has(l.i));
      applyLayoutUpdate((byProject: any) => ({ ...byProject, [currentPage.id]: filtered }));
      updateCurrentPage({
        widgets: widgets.map((w) => {
          const item = filtered.find((l) => l.i === w.id);
          if (!item) return w;
          return { ...w, colSpan: saneNum(Number(item.w), w.colSpan ?? 4), rowSpan: saneNum(Number(item.h), w.rowSpan ?? 4) };
        }),
      });
    },
    [widgets, currentPage?.id, applyLayoutUpdate, updateCurrentPage],
  );

  const handleResponsiveLayoutChange = useCallback(
    (layouts: Record<string, LayoutItem[]>) => {
      const widgetIds = new Set(widgets.map((w) => w.id));
      const filteredLayouts: Record<string, LayoutItem[]> = {};
      for (const bp of Object.keys(layouts)) {
        filteredLayouts[bp] = layouts[bp].filter((l) => widgetIds.has(l.i));
      }
      applyLayoutUpdate((byProject: any) => ({ ...byProject, [currentPage.id]: filteredLayouts }));
      const lg = filteredLayouts.lg ?? [];
      updateCurrentPage({
        widgets: widgets.map((w) => {
          const item = lg.find((l) => l.i === w.id);
          if (!item) return w;
          return { ...w, colSpan: saneNum(Number(item.w), w.colSpan ?? 4), rowSpan: saneNum(Number(item.h), w.rowSpan ?? 4) };
        }),
      });
    },
    [widgets, currentPage?.id, applyLayoutUpdate, updateCurrentPage],
  );

  const addWidgetWithType = (type: WidgetType) => {
    const defaultData = TYPE_DEFAULT_DATA[type];
    const newId = `widget_${Date.now()}`;
    const bottomY = currentRglLayout.length > 0 ? Math.max(...currentRglLayout.map((l) => l.y + l.h)) : 0;

    const newWidget: Widget = {
      id: newId,
      type: type,
      title: (defaultData as any)?.title ?? "New Analysis",
      colSpan: 4,
      rowSpan: 10,
      config: defaultData?.config ? JSON.parse(JSON.stringify(defaultData.config)) : {
        xAxisKey: "name",
        yAxisKey: "value",
        series: [{ key: "value", label: "Value", color: "var(--primary-color)" }],
        showLegend: true, showGrid: true, showXAxis: true, showYAxis: true, showUnit: false, showUnitInLegend: false, showLabels: false, unit: "",
      },
      data: defaultData?.data ? JSON.parse(JSON.stringify(defaultData.data)) : JSON.parse(JSON.stringify(MOCK_CHART_DATA)),
      mainValue: defaultData?.mainValue,
      subValue: defaultData?.subValue,
      icon: defaultData?.icon,
      progressValue: defaultData?.progressValue,
      titleSize: (defaultData as any)?.titleSize,
      titleWeight: (defaultData as any)?.titleWeight,
      noBezel: false,
      navItems: (defaultData as any)?.navItems ? JSON.parse(JSON.stringify((defaultData as any).navItems)) : undefined,
    };

    if (type === WidgetType.VERTICAL_NAV_CARD) {
      newWidget.colSpan = 3;
      newWidget.rowSpan = 14;
    }

    applyLayoutUpdate((byProject: any) => {
      const cur = byProject[currentPage.id];
      const newItem = { i: newId, x: 0, y: bottomY, w: newWidget.colSpan, h: newWidget.rowSpan } as LayoutItem;
      if (layout.useResponsive) {
        const layouts = (cur && !Array.isArray(cur) ? cur : { lg: Array.isArray(cur) ? (cur as LayoutItem[]) : [] }) as Record<string, LayoutItem[]>;
        return { ...byProject, [currentPage.id]: { ...layouts, lg: [...(layouts.lg || []), newItem] } };
      }
      return { ...byProject, [currentPage.id]: [...(Array.isArray(cur) ? cur : []), newItem] };
    });

    updateCurrentPage({ widgets: [...widgets, newWidget] });
  };

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    updateCurrentPage({
      widgets: widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    });
  }, [widgets, updateCurrentPage]);

  const deleteWidget = useCallback((id: string, keepIds: Set<string>) => {
    updateCurrentPage({
      widgets: widgets.filter((w) => w.id !== id),
    });
    applyLayoutUpdate((byProject: any) => {
      const cur = byProject[currentPage.id];
      if (!cur) return byProject;
      if (Array.isArray(cur)) return { ...byProject, [currentPage.id]: cur.filter((l) => keepIds.has(l.i)) };
      const filtered: Record<string, LayoutItem[]> = {};
      for (const bp of Object.keys(cur)) filtered[bp] = (cur as Record<string, LayoutItem[]>)[bp].filter((l) => keepIds.has(l.i));
      return { ...byProject, [currentPage.id]: filtered };
    });
  }, [widgets, currentPage?.id, applyLayoutUpdate, updateCurrentPage]);

  const addPage = () => {
    const newId = `page_${Date.now()}`;
    const newPage: DashboardPage = {
      ...DEFAULT_PAGE,
      id: newId,
      name: `New Page ${currentProject.pages.length + 1}`,
      header: { ...currentPage.header },
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? { ...p, pages: [...p.pages, newPage], activePageId: newId }
          : p,
      ),
    );
  };

  const deletePage = (pageId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const newPages = p.pages.filter((pg) => pg.id !== pageId);
        if (newPages.length === 0) return p; // Don't delete the last page
        return {
          ...p,
          pages: newPages,
          activePageId: p.activePageId === pageId ? newPages[0].id : p.activePageId,
        };
      }),
    );
    // Also clean up layout store for this page
    setLayoutStore((prev) => {
      const byProject = prev[activeProjectId] ?? {};
      const nextByProject = { ...byProject };
      delete nextByProject[pageId];
      const next = { ...prev, [activeProjectId]: nextByProject };
      saveLayoutStore(next);
      return next;
    });
  };

  const addProject = () => {
    const newId = `project_${Date.now()}`;
    const newProject: Project = {
      id: newId,
      name: `New Project ${projects.length + 1}`,
      pages: [{ ...DEFAULT_PAGE, id: "page_1", name: "Dashboard" }],
      activePageId: "page_1",
      theme: DEFAULT_THEME,
    };
    setProjects((prev) => [...prev, newProject]);
    setActiveProjectId(newId);
  };

  const deleteProject = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setLayoutStore((prev) => {
      const next = { ...prev };
      delete next[projectId];
      saveLayoutStore(next);
      return next;
    });
    if (activeProjectId === projectId) {
      const remaining = projects.filter((p) => p.id !== projectId);
      setActiveProjectId(remaining[0]?.id ?? "project_1");
    }
  };

  const renameProject = (projectId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: trimmed } : p)),
    );
  };

  const save = async () => {
    const savedProjects = await saveProjectsState(projectsRef.current, activeProjectId);
    await saveLayoutStore(layoutStoreRef.current);
    return !!savedProjects;
  };

  const responsiveLayoutsForGrid = useMemo(() => {
    if (!layout.useResponsive) return undefined;
    const raw = (layoutStore[activeProjectId] ?? {})[currentPage?.id || ''];
    if (!raw) return { lg: currentRglLayout, md: currentRglLayout, sm: currentRglLayout, xs: currentRglLayout };
    if (Array.isArray(raw)) return { lg: raw, md: raw, sm: raw, xs: raw };
    const obj = raw as Record<string, LayoutItem[]>;
    return { lg: obj.lg ?? [], md: obj.md ?? [], sm: obj.sm ?? [], xs: obj.xs ?? [] };
  }, [layout.useResponsive, layoutStore, activeProjectId, currentPage?.id, currentRglLayout]);

  const handleExcelUpload = useCallback((id: string, newData: any[]) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) {
      updateWidget(id, { data: newData });
      return;
    }

    if (newData.length > 0 && widget.config) {
      const { data, series, xAxisKey } = normalizeChartData(newData, widget.config);

      updateWidget(id, {
        data,
        config: {
          ...widget.config,
          xAxisKey,
          series
        }
      });
      // Note: Toast notification should be handled by the caller or a global toast hook
      return;
    }

    updateWidget(id, { data: newData });
  }, [widgets, updateWidget]);

  const executeImport = useCallback(async (file: File, target: 'full' | 'base') => {
    setIsImporting(true);
    try {
      const { project: importedProject, layoutPositions } = await importProjectFromZip(file);

      if (target === "full") {
        const projectToApply = normalizeImportedProject(
          { ...importedProject, id: activeProjectId }, 
          { page: DEFAULT_PAGE, header: currentPage?.header || DEFAULT_HEADER, theme }
        );
        replaceActiveProject(projectToApply);
        setLayoutStore((prev) => ({ ...prev, [activeProjectId]: layoutPositions }));
      } else {
        // Base Layout Only (테마와 레이아웃만 가져오고 위젯은 유지)
        const projectToApply: Project = {
          ...currentProject,
          theme: { ...importedProject.theme },
          pages: currentProject.pages.map((pg, idx) => {
            const importedPage = importedProject.pages[idx] || importedProject.pages[0];
            return {
              ...pg,
              layout: { ...importedPage.layout },
              header: { ...importedPage.header, widgets: pg.header.widgets }
            };
          })
        };
        replaceActiveProject(projectToApply);
        setLayoutStore((prev) => ({ ...prev, [activeProjectId]: layoutPositions }));
      }
      return true;
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsImporting(false);
      setImportTarget(null);
      setPendingImportFile(null);
    }
  }, [activeProjectId, currentPage?.header, currentProject, theme, replaceActiveProject, setLayoutStore]);

  const handleImportChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !importTarget) return;

    if (importTarget === 'full') {
      setPendingImportFile(file);
      setShowImportConfirm(true);
      return;
    }

    await executeImport(file, 'base');
  }, [importTarget, executeImport]);

  const performExportCapture = useCallback(async (rootEl: HTMLElement | null) => {
    if (!rootEl || !capturingForExport) return;

    // 즉시 상태를 false로 변경하여 useEffect 중복 트리거를 방지합니다.
    setCapturingForExport(false);

    console.log("[STN] Export started: Phase = waiting");
    setExportPhase("waiting");
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      console.log("[STN] Export phase: capturing");
      setExportPhase("capturing");
      setHideBarForCapture(true);

      const mod = await import("html-to-image");
      let fullBlob: Blob | null = null;
      let baseBlob: Blob | null = null;

      const captureOptions = {
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
        preferredFontFormat: 'woff2' as const,
      };

      if (exportTarget === "full") {
        fullBlob = await mod.toBlob(rootEl, captureOptions);
        console.log("[STN] Full screenshot captured, blob size:", fullBlob?.size);
      } else {
        baseBlob = await mod.toBlob(rootEl, {
          ...captureOptions,
          filter: (node: any) => {
            if (
              node.classList?.contains('react-grid-layout') ||
              node.classList?.contains('header-widget-layer') ||
              (node.textContent && node.textContent.includes('Add Widget') && node.tagName === 'BUTTON')
            ) {
              return false;
            }
            if (node.classList?.contains('widget-card')) {
              return false;
            }
            return true;
          }
        });
        console.log("[STN] Base screenshot captured, blob size:", baseBlob?.size);
      }

      console.log("[STN] Export phase: packing");
      setExportPhase("packing");
      const layoutPositions = (layoutStore[activeProjectId] ?? {}) as Record<string, Record<string, LayoutItem[]>>;

      if (exportTarget === "full") {
        await exportProjectToZip(currentProject, layoutPositions, fullBlob);
      } else if (exportTarget === "base") {
        const cleanProject: Project = {
          ...currentProject,
          pages: currentProject.pages.map(pg => ({
            ...pg,
            widgets: [],
            header: pg.header ? { ...pg.header, widgets: [] } : pg.header
          }))
        };
        await exportProjectToZip(cleanProject, {}, baseBlob, "_Base_Layout");
      }
      
      console.log("[STN] Export completed successfully.");
      return true;
    } catch (err) {
      console.error("[STN] Export failed:", err);
      throw err;
    } finally {
      setExportPhase(null);
      setCapturingForExport(false);
      setHideBarForCapture(false);
    }
  }, [capturingForExport, exportTarget, activeProjectId, currentProject, layoutStore]);

  return {
    projects,
    setProjects,
    activeProjectId,
    setActiveProjectId,
    currentProject,
    currentPage,
    theme,
    widgets,
    layout,
    layoutStore,
    setLayoutStore,
    isHydrated,
    presets,
    setPresets,
    currentRglLayout,
    responsiveLayoutsForGrid,
    applyLayoutUpdate,
    updateCurrentPage,
    updateProjectTheme,
    handlePageChange,
    handleRglLayoutChange,
    handleResponsiveLayoutChange,
    replaceActiveProject,
    addWidgetWithType,
    updateWidget,
    deleteWidget,
    updateHeader,
    handleApplyPreset,
    handleSavePreset,
    handleThemeChange,
    handleModeSwitch,
    handleUpdateLayout,
    addPage,
    deletePage,
    addProject,
    deleteProject,
    renameProject,
    onExcelUpload: handleExcelUpload,
    handleImportChange,
    executeImport,
    performExportCapture,

    excelWidgetId,
    openExcelModal: (id: string) => setExcelWidgetId(id),
    closeExcelModal: () => setExcelWidgetId(null),
    
    // I/O 상태 및 세터 노출
    capturingForExport, setCapturingForExport,
    exportPhase, setExportPhase,
    exportTarget, setExportTarget,
    importTarget, setImportTarget,
    isImporting, setIsImporting,
    showImportConfirm, setShowImportConfirm,
    pendingImportFile, setPendingImportFile,
    hideBarForCapture, setHideBarForCapture,

    save
  };
};

export const sane = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);
export const saneNum = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);

/** 차트 데이터 정규화 및 시리즈 자동 감지 알고리즘 */
export const normalizeChartData = (
  rawData: any[], 
  existingConfig?: Widget['config']
): { data: any[], series: any[], xAxisKey: string } => {
  if (!rawData || rawData.length === 0) {
    return { data: [], series: [], xAxisKey: 'name' };
  }

  // 1. 데이터 클리닝 (Key 공백 제거 등)
  const cleanedData = rawData.map(row => {
    const cleaned: any = {};
    Object.keys(row).forEach(k => {
      cleaned[String(k).trim()] = row[k];
    });
    return cleaned;
  });

  const firstRow = cleanedData[0];
  const excelKeys = Object.keys(firstRow);
  
  // 2. X축 키 결정 (기존 설정 우선, 없으면 첫 번째 열)
  const xAxisKey = (existingConfig?.xAxisKey || 'name').trim();
  let excelXKey = excelKeys.find(k => k.toLowerCase() === xAxisKey.toLowerCase()) || excelKeys[0];

  // 3. 시리즈 키 추출 (X축 제외 모든 열)
  const dataKeys = excelKeys.filter(k => k !== excelXKey);

  // 4. 시리즈 리스트 및 색상 배정
  const newSeriesList = dataKeys.map((key, idx) => {
    const existing = existingConfig?.series?.find(s => s.label.trim() === key || s.key.trim() === key);
    return {
      key: key,
      label: key,
      color: existing?.color || `var(--chart-palette-${(idx % 6) + 1})`
    };
  });

  // 5. 최종 데이터 매핑
  const normalizedData = cleanedData.map(row => {
    const newRow: any = { [xAxisKey]: row[excelXKey] };
    newSeriesList.forEach(s => {
      newRow[s.key] = row[s.key];
    });
    return newRow;
  });

  return {
    data: normalizedData,
    series: newSeriesList,
    xAxisKey
  };
};

/** ZIP에서 불러온 프로젝트 데이터 보정 (페이지 유무, ID 정합성 등) */
export const normalizeImportedProject = (
  project: Project, 
  defaults: { page: DashboardPage, header: any, theme: DashboardTheme }
): Project => {
  let pages = Array.isArray(project.pages) ? project.pages : [];
  pages = pages.map((pg) => ({
    ...defaults.page,
    ...pg,
    layout: { ...defaults.page.layout, ...(pg.layout || {}) },
    header: { ...defaults.header, ...(pg.header || {}) },
  }));

  if (pages.length === 0) {
    pages = [{ ...defaults.page, id: "page_1", name: "Main Page" }];
  }

  const activePageId =
    project.activePageId && pages.some((p) => p.id === project.activePageId)
      ? project.activePageId
      : pages[0].id;

  return { 
    ...project, 
    theme: { ...defaults.theme, ...project.theme }, 
    pages, 
    activePageId 
  };
};

function computeInitialLayout(widgets: Widget[], cols: number): LayoutItem[] {
  let nextX = 0;
  let nextY = 0;
  let maxHInRow = 0;
  return widgets.map((w) => {
    const wVal = sane(Number(w.colSpan), 4);
    const hVal = sane(Number(w.rowSpan), 4);
    if (nextX + wVal > cols) {
      nextX = 0;
      nextY += maxHInRow;
      maxHInRow = 0;
    }
    const item = { i: w.id, x: nextX, y: nextY, w: wVal, h: hVal };
    nextX += wVal;
    maxHInRow = Math.max(maxHInRow, hVal);
    return item;
  });
}
