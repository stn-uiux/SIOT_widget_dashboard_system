import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const [layoutStore, setLayoutStore] = useState<LayoutStore>(loadLayoutStoreSync);
  const [isHydrated, setIsHydrated] = useState(false);
  const [presets, setPresets] = useState<ThemePreset[]>(() => loadPresetsSync(THEME_PRESETS));

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
    save
  };
};

const sane = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);
const saneNum = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);

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
