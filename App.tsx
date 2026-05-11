import React, { useState, useCallback, useMemo, useRef, useEffect, useTransition } from "react";
// v1.1.5 - Forced reload for HMR sync
import "react-grid-layout/css/styles.css";
import { BarChart3, TrendingUp, Activity } from "lucide-react";
import { DEFAULT_HEADER } from "./constants";
import { WidgetType, ThemeMode, ChartLibrary } from "./types";
import { useAuth } from "./hooks/useAuth";
import LoadingScreen from "./components/app/LoadingScreen";
import LoginPage from "./components/LoginPage";
import { exportWidgetsToZip } from "./lib/exportWidgetScreenshots";
import { useDashboard } from "./hooks/useDashboard";
import { DashboardShell } from "./components/app/DashboardShell";

const App: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const dashboard = useDashboard();
  const performDeleteWidget = dashboard.deleteWidget;
  const { deleteWidget: _omitDeleteWidgetFromShellSpread, ...dashboardApi } = dashboard;
  void _omitDeleteWidgetFromShellSpread;
  const {
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
    updateHeader,
    handleApplyPreset,
    handleSavePreset,
    handleThemeChange,
    handleModeSwitch,
    handleUpdateLayout,
    addPage,
    addProject,
    deleteProject,
    renameProject,
    excelWidgetId,
    openExcelModal,
    closeExcelModal,
    onExcelUpload,
    capturingForExport, setCapturingForExport,
    exportPhase, setExportPhase,
    exportTarget, setExportTarget,
    importTarget, setImportTarget,
    isImporting, setIsImporting,
    showImportConfirm, setShowImportConfirm,
    pendingImportFile, setPendingImportFile,
    hideBarForCapture, setHideBarForCapture,
    handleImportChange,
    executeImport,
    performExportCapture,
    save,
    reloadSampleProjects,
  } = dashboard;

  const isAdmin = profile?.role === 'admin' || user?.email?.toLowerCase().startsWith('admin');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // User role logic: profile.role is the source of truth, but fallback to email prefix for development/demo convenience
  const userRole = profile?.role || (user?.email?.startsWith('admin') ? 'admin' : 'user');

  // ── RBAC: Force Preview Mode for non-admin users ──
  useEffect(() => {
    if (user && !isAdmin) {
      setIsPreviewMode(true);
    }
  }, [user, isAdmin]);

  // Navigation & Project State (저장된 값이 있으면 새로고침 후에도 유지)
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [isLayoutSidebarOpen, setIsLayoutSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode((prev) => !prev);
  }, []);
  const [pendingPanelSwitch, setPendingPanelSwitch] = useState<'design' | 'layout' | 'close' | null>(null);
  const previewTickRef = useRef(0);
  const previewBaseDataRef = useRef<Record<string, any[]>>({});

  useEffect(() => {
    if (!isPreviewMode) {
      previewBaseDataRef.current = {};
      return;
    }
    // Preview 시작 시점의 데이터를 기준값으로 저장 (누적 floor로 한쪽 방향 드리프트 방지)
    const base: Record<string, any[]> = {};
    for (const w of widgets || []) {
      base[w.id] = Array.isArray(w.data) ? w.data.map((d: any) => ({ ...d })) : [];
    }
    previewBaseDataRef.current = base;
  }, [isPreviewMode, widgets]);

  // ── 2. Real-time Preview Simulation (optimized updates) ──
  useEffect(() => {
    if (!isPreviewMode) return;
    const interval = setInterval(() => {
      previewTickRef.current += 1;
      const tickGroup = previewTickRef.current % 2;
      // Preview simulation updates can be heavy; run them as a low-priority transition
      // so hover/cursor interactions stay responsive.
      startTransition(() => {
        setProjects((prev) => {
          return prev.map((p) => {
            if (p.id !== activeProjectId) return p;
            let projectChanged = false;
            const updatedPages = p.pages.map((pg) => {
              if (pg.id !== p.activePageId) return pg;
              let pageChanged = false;
              const updatedWidgets = pg.widgets.map((w, idx) => {
                // Update only half of widgets per tick to reduce heavy chart rerenders.
                if (idx % 2 !== tickGroup) return w;
                const newData = (w.data || []).map((d: any, rowIdx: number) => {
                  const baseRow = previewBaseDataRef.current[w.id]?.[rowIdx] ?? null;
                  const nextD = { ...d };
                  if (w.config?.series) {
                    w.config.series.forEach((s) => {
                      const baseVal = baseRow ? Number((baseRow as any)[s.key]) : Number(nextD[s.key]);
                      const val = Number.isFinite(baseVal) ? baseVal : Number(nextD[s.key]);
                      if (!isNaN(val)) {
                        // Preview 시뮬레이션: 일반 차트는 정수로 내려도 무방하지만,
                        // Sankey는 링크 value가 0이 많아지면 레이아웃이 깨지므로 최소 1을 보장합니다.
                        const isSankey = w.type === WidgetType.CHART_SANKEY;
                        const variation = (Math.random() - 0.5) * (isSankey ? 0.08 : 0.1);
                        const next = val * (1 + variation);
                        const isPercent = w.type === WidgetType.DASH_RESOURCE_USAGE;
                        if (isSankey) {
                          nextD[s.key] = Math.max(1, Math.round(next));
                        } else if (isPercent) {
                          nextD[s.key] = Math.max(0, Math.min(100, Math.round(next)));
                        } else {
                          nextD[s.key] = Math.max(0, Math.round(next));
                        }
                      }
                    });
                  }
                  return nextD;
                });
                let newMainValue = w.mainValue;
                if (w.mainValue) {
                  const mainValNum = parseFloat(w.mainValue.replace(/[^0-9.-]/g, ""));
                  if (!isNaN(mainValNum)) {
                    const variation = (Math.random() - 0.5) * 2;
                    const unit = w.mainValue.replace(/[0-9.-]/g, "");
                    newMainValue = (mainValNum + variation).toFixed(1) + unit;
                  }
                }
                pageChanged = true;
                return { ...w, data: newData, mainValue: newMainValue };
              });
              if (!pageChanged) return pg;
              projectChanged = true;
              return { ...pg, widgets: updatedWidgets };
            });
            if (!projectChanged) return p;
            return { ...p, pages: updatedPages };
          });
        });
      });
    }, 1600);
    return () => clearInterval(interval);
  }, [isPreviewMode, activeProjectId, setProjects]);

  // Excel Modal State


  // separate ref for height measurement (fitToScreen)
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const projectScopeRef = useRef<HTMLDivElement>(null);
  const appRootRef = useRef<HTMLDivElement>(null);
  const [mainAreaHeight, setMainAreaHeight] = useState(600);

  // Fit to Screen 시 행 높이 계산에 쓰일 실제 메인 영역 높이 측정
  useEffect(() => {
    const el = mainAreaRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { height } = entries[0]?.contentRect ?? {};
      if (typeof height === "number" && height > 0) {
        setMainAreaHeight(prev => (Math.abs(prev - height) < 0.1 ? prev : height));
      }
    });
    ro.observe(el);
    const h = el.getBoundingClientRect().height;
    if (h > 0) setMainAreaHeight(h);
    return () => ro.disconnect();
  }, []);

  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isLibraryDropdownOpen, setIsLibraryDropdownOpen] = useState(false);
  const [isDesignDocsOpen, setIsDesignDocsOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingProjectName, setEditingProjectName] = useState("");
  const [isFloatingGnbOpen, setIsFloatingGnbOpen] = useState(false);

  const [panelPos, setPanelPos] = useState({ x: 20, y: 100 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDraggingPanel(true);
    dragStartOffset.current = {
      x: e.clientX + panelPos.x,
      y: e.clientY - panelPos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPanel) return;
      setPanelPos({
        x: dragStartOffset.current.x - e.clientX,
        y: e.clientY - dragStartOffset.current.y
      });
    };
    const handleMouseUp = () => setIsDraggingPanel(false);

    if (isDraggingPanel) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPanel]);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [widgetExportNonce, setWidgetExportNonce] = useState(0);
  const [isCapturingWidgets, setIsCapturingWidgets] = useState(false);
  const [widgetCaptureProgress, setWidgetCaptureProgress] = useState<{ index: number; total: number; title: string } | null>(null);
  const [isWidgetCapturePickerOpen, setIsWidgetCapturePickerOpen] = useState(false);
  const [selectedCaptureWidgetIds, setSelectedCaptureWidgetIds] = useState<string[]>([]);
  const [widgetCaptureThumbs, setWidgetCaptureThumbs] = useState<Record<string, string>>({});
  const [widgetThumbRefreshProgress, setWidgetThumbRefreshProgress] = useState<{ done: number; total: number } | null>(null);
  const widgetExportPayloadRef = useRef<{ list: { id: string; title: string; type: string }[]; projectName: string } | null>(null);
  const widgetExportRestoreRef = useRef<{ preview: boolean; edit: boolean } | null>(null);

  const handleOpenWidgetCapturePicker = useCallback(() => {
    if (!widgets.length) {
      showToast("캡처할 위젯이 없습니다.", "error");
      return;
    }
    if (isCapturingWidgets || capturingForExport || exportPhase) return;
    setSelectedCaptureWidgetIds(widgets.map((w) => w.id));
    setIsProjectDropdownOpen(false);
    setIsWidgetCapturePickerOpen(true);
  }, [widgets, isCapturingWidgets, capturingForExport, exportPhase]);

  const handleConfirmWidgetScreensExport = useCallback(() => {
    const selected = widgets.filter((w) => selectedCaptureWidgetIds.includes(w.id));
    if (!selected.length) {
      showToast("최소 1개 이상 선택해주세요.", "error");
      return;
    }
    if (isCapturingWidgets || capturingForExport || exportPhase) return;
    setIsWidgetCapturePickerOpen(false);
    showToast(`위젯 PNG 캡처 시작… (${selected.length}개)`, "success");
    widgetExportRestoreRef.current = { preview: isPreviewMode, edit: isEditMode };
    widgetExportPayloadRef.current = {
      list: selected.map((w) => ({ id: w.id, title: w.title || String(w.type), type: String(w.type) })),
      projectName: currentProject?.name || "export",
    };
    setIsPreviewMode(true);
    setIsEditMode(false);
    setSelectedWidgetId(null);
    setIsProjectDropdownOpen(false);
    setIsCapturingWidgets(true);
    setWidgetCaptureProgress({ index: 0, total: selected.length, title: selected[0]?.title || String(selected[0]?.type || '') });
    setWidgetExportNonce((n) => n + 1);
  }, [widgets, selectedCaptureWidgetIds, isCapturingWidgets, capturingForExport, exportPhase, isPreviewMode, isEditMode, currentProject?.name]);

  const allCaptureSelected = widgets.length > 0 && selectedCaptureWidgetIds.length === widgets.length;
  const someCaptureSelected = selectedCaptureWidgetIds.length > 0 && selectedCaptureWidgetIds.length < widgets.length;
  const captureMode: "light" | "dark" = theme.mode === ThemeMode.DARK ? "dark" : "light";
  const widgetCaptureIdsKey = useMemo(() => widgets.map((w) => w.id).join("|"), [widgets]);

  const resolveWidgetNodeForThumb = useCallback((id: string): HTMLElement | null => {
    const esc = (raw: string) => {
      if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(raw);
      return raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    };
    const safeId = esc(id);
    const inner = document.querySelector(`[data-widget-capture-id="${safeId}"]`) as HTMLElement | null;
    if (inner) return inner;
    return document.querySelector(`[data-widget-id="${safeId}"]`) as HTMLElement | null;
  }, []);

  const clearLiveCaptureThumbs = useCallback(() => {
    setWidgetCaptureThumbs({});
    setWidgetThumbRefreshProgress(null);
  }, []);

  useEffect(() => {
    if (!isWidgetCapturePickerOpen) {
      clearLiveCaptureThumbs();
      return;
    }
    let cancelled = false;
    const run = async () => {
      await new Promise((r) => setTimeout(r, 80));
      if (cancelled) return;
      try {
        const mod = await import("html-to-image");
        const currentWidgetIds = widgetCaptureIdsKey ? widgetCaptureIdsKey.split("|") : [];
        setWidgetThumbRefreshProgress({ done: 0, total: currentWidgetIds.length });
        const firstNode = currentWidgetIds.length > 0 ? resolveWidgetNodeForThumb(currentWidgetIds[0]) : null;
        let fontCSS = "";
        try {
          if (firstNode && (mod as any).getFontEmbedCSS) {
            fontCSS = await (mod as any).getFontEmbedCSS(firstNode);
          }
        } catch {
          fontCSS = "";
        }
        for (const id of currentWidgetIds) {
          if (cancelled) return;
          const node = resolveWidgetNodeForThumb(id);
          if (!node) {
            setWidgetThumbRefreshProgress((prev) =>
              prev ? { ...prev, done: Math.min(prev.done + 1, prev.total) } : prev
            );
            continue;
          }
          try {
            const rect = node.getBoundingClientRect();
            const srcW = Math.max(1, Math.round(rect.width));
            const srcH = Math.max(1, Math.round(rect.height));
            const dataUrl = await mod.toPng(node, {
              pixelRatio: 1,
              cacheBust: true,
              backgroundColor: "transparent",
              skipFonts: !fontCSS,
              preferredFontFormat: "woff2",
              ...(fontCSS ? { fontEmbedCSS: fontCSS } : {}),
              width: srcW,
              height: srcH,
              style: {
                width: `${srcW}px`,
                height: `${srcH}px`,
                transform: "none",
              } as Partial<CSSStyleDeclaration>,
            });
            if (!dataUrl || cancelled) continue;
            setWidgetCaptureThumbs((prev) => ({ ...prev, [id]: dataUrl }));
          } catch {
            // 정적 asset fallback 사용
          } finally {
            setWidgetThumbRefreshProgress((prev) =>
              prev ? { ...prev, done: Math.min(prev.done + 1, prev.total) } : prev
            );
          }
          await new Promise((r) => setTimeout(r, 12));
        }
      } catch {
        // html-to-image 로드 실패 시 정적 asset fallback 사용
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [isWidgetCapturePickerOpen, widgetCaptureIdsKey, resolveWidgetNodeForThumb, clearLiveCaptureThumbs, captureMode]);

  const thumbRefreshPercent = useMemo(() => {
    if (!widgetThumbRefreshProgress || widgetThumbRefreshProgress.total <= 0) return 0;
    return Math.min(100, Math.round((widgetThumbRefreshProgress.done / widgetThumbRefreshProgress.total) * 100));
  }, [widgetThumbRefreshProgress]);
  const isThumbRefreshing = !!widgetThumbRefreshProgress && widgetThumbRefreshProgress.done < widgetThumbRefreshProgress.total;

  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false);

  const exportPreviewRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── 내보내기: Preview 전환 → 훅 호출하여 캡처 및 ZIP 다운로드 ──
  useEffect(() => {
    if (capturingForExport && isPreviewMode) {
      performExportCapture(appRootRef.current)
        .then(() => {
          showToast(`프로젝트를 성공적으로 내보냈습니다. (${exportTarget === "full" ? "전체" : "레이아웃"})`);
          setIsPreviewMode(false);
        })
        .catch((err) => {
          showToast(err instanceof Error ? err.message : "내보내기 실패", "error");
          setIsPreviewMode(false);
        });
    }
  }, [capturingForExport, isPreviewMode, performExportCapture]);

  useEffect(() => {
    if (widgetExportNonce === 0) return;
    let cancelled = false;
    const run = async () => {
      try {
        await new Promise((r) => setTimeout(r, 750));
        if (cancelled) return;
        const payload = widgetExportPayloadRef.current;
        if (!payload) return;
        const { zipBlob, capturedCount } = await exportWidgetsToZip(payload.list, {
          targetWidth: 900,
          targetHeight: 610,
          onProgress: (p) => {
            setWidgetCaptureProgress({ index: p.index, total: p.total, title: p.title });
          },
        });
        if (cancelled) return;
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement("a");
        a.href = url;
        const safe = payload.projectName.replace(/[^\w\-가-힣]+/g, "_").slice(0, 56) || "export";
        a.download = `widget-screenshots_${safe}.zip`;
        a.click();
        URL.revokeObjectURL(url);
        showToast(`위젯 ${capturedCount}개 PNG를 ZIP으로 저장했습니다.`, "success");
      } catch (e) {
        if (!cancelled) {
          showToast(e instanceof Error ? e.message : "위젯 캡처 실패", "error");
        }
      } finally {
        const r = widgetExportRestoreRef.current;
        if (!cancelled && r) {
          if (isAdmin) {
            setIsPreviewMode(r.preview);
            setIsEditMode(r.edit);
          } else {
            setIsPreviewMode(true);
            setIsEditMode(false);
          }
          widgetExportRestoreRef.current = null;
        }
        widgetExportPayloadRef.current = null;
        setIsCapturingWidgets(false);
        setWidgetCaptureProgress(null);
      }
    };
    void run();
    return () => {
      cancelled = true;
      const r = widgetExportRestoreRef.current;
      if (r) {
        if (isAdmin) {
          setIsPreviewMode(r.preview);
          setIsEditMode(r.edit);
        } else {
          setIsPreviewMode(true);
          setIsEditMode(false);
        }
        widgetExportRestoreRef.current = null;
      }
      widgetExportPayloadRef.current = null;
      setIsCapturingWidgets(false);
      setWidgetCaptureProgress(null);
    };
  }, [widgetExportNonce, isAdmin]);

  // Shortcuts to current state for components (페이지 없을 때 fallback으로 빈 화면 방지)
  const _page = currentPage ?? (currentProject?.pages?.[0]);
  const pageHeader = _page?.header ?? DEFAULT_HEADER;
  const header = pageHeader || DEFAULT_HEADER;

  const pageBgUrl = layout && (theme.mode === ThemeMode.LIGHT
    ? (layout.backgroundImageLight || layout.backgroundImage)
    : (layout.backgroundImageDark || layout.backgroundImage));
  const showUnifiedBg = !!(layout?.backgroundGlobe || pageBgUrl);

  // updateCurrentPage and updateProjectTheme are now in useDashboard

  const handleOpenWidgetPicker = () => {
    setIsWidgetPickerOpen(true);
  };

  // addWidgetWithType is now in useDashboard

  const deleteWidget = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDeleteWidget = () => {
    if (!deleteConfirmId) return;
    const keepIds = new Set(widgets.filter((w) => w.id !== deleteConfirmId).map((w) => w.id));
    performDeleteWidget(deleteConfirmId, keepIds);
    setDeleteConfirmId(null);
    showToast("Widget removed successfully", "success");
  };

  const handleWidgetSelect = useCallback((id: string | null) => {
    // Sidebar 첫 렌더가 무거워 클릭이 끊기는 것을 완화
    startTransition(() => {
      setSelectedWidgetId(id);
      // Explicitly close design sidebar when selecting a widget or deselecting
      setIsDesignSidebarOpen(false);
    });
  }, []);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedWidgetId(null);
  };

  const handleOpenDesignSidebar = () => {
    if (isEditMode) {
      if (!isDesignSidebarOpen && isLayoutSidebarOpen) {
        setPendingPanelSwitch('design');
        return;
      }
    }
    setIsDesignSidebarOpen(!isDesignSidebarOpen);
    if (!isDesignSidebarOpen) {
      setIsLayoutSidebarOpen(false);
    }
    setSelectedWidgetId(null);
  };

  const handleOpenLayoutSidebar = () => {
    if (isEditMode && !isLayoutSidebarOpen && isDesignSidebarOpen) {
      setPendingPanelSwitch('layout');
      return;
    }
    setIsLayoutSidebarOpen(true);
    setIsDesignSidebarOpen(false);
    setSelectedWidgetId(null);
  };


  const handleLogout = async () => {
    setShowLogoutModal(false);
    showToast("Logging out...", "info");
    const result = await logout();
    if (result.success) {
      showToast("Successfully logged out", "success");
    } else {
      showToast("Logout failed. Please try again.", "error");
    }
  };

  // sync logic moved to useDashboard

  // Theme and Layout management now via useDashboard hooks/functions

  // Layout handlers and state moved to useDashboard
  // ─────────────────────────────────────────────────────────────────────

  const confirmDeleteProject = () => {
    if (!deleteProjectId) return;
    deleteProject(deleteProjectId);
    setDeleteProjectId(null);
    setIsProjectDropdownOpen(false);
    showToast("Project deleted successfully.");
  };

  const handleExportClick = (target: "full" | "base") => {
    setIsProjectDropdownOpen(false);
    setExportTarget(target);
    setCapturingForExport(true);
    setIsPreviewMode(true);
  };





  const handleProjectSave = async () => {
    if (isEditMode) {
      await save();
      setIsEditMode(false);
      setIsDesignSidebarOpen(false);
      setIsLayoutSidebarOpen(false);
      setSelectedWidgetId(null);
    } else {
      setIsEditMode(true);
    }
  };

  // updateHeader is now in useDashboard



  const showSidebar =
    !isPreviewMode &&
    (isLayoutSidebarOpen || isDesignSidebarOpen || selectedWidgetId !== null);

  const libraryOptions = [
    { value: ChartLibrary.RECHARTS, label: "Recharts", icon: BarChart3, colorVar: "--primary-color" },
    { value: ChartLibrary.APEXCHARTS, label: "ApexCharts", icon: TrendingUp, colorVar: "--success" },
    { value: ChartLibrary.AMCHARTS, label: "amCharts", icon: Activity, colorVar: "--purple-500" },
  ] as const;

  const currentLibrary =
    libraryOptions.find((opt) => opt.value === theme.chartLibrary) ||
    libraryOptions[0];

  if (!isHydrated) {
    return <LoadingScreen message="Initializing core systems..." />;
  }

  // 로그인이 되어 있지 않으면 로그인 페이지 표시
  if (!user) {
    return <LoginPage onLoginSuccess={() => {}} />;
  }

  return (
    <DashboardShell
      {...dashboardApi}
      user={user}
      isAdmin={isAdmin}
      userRole={userRole}
      showLogoutModal={showLogoutModal}
      setShowLogoutModal={setShowLogoutModal}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
      isPreviewMode={isPreviewMode}
      setIsPreviewMode={setIsPreviewMode}
      isDesignSidebarOpen={isDesignSidebarOpen}
      setIsDesignSidebarOpen={setIsDesignSidebarOpen}
      isLayoutSidebarOpen={isLayoutSidebarOpen}
      setIsLayoutSidebarOpen={setIsLayoutSidebarOpen}
      selectedWidgetId={selectedWidgetId}
      setSelectedWidgetId={setSelectedWidgetId}
      handleTogglePreview={handleTogglePreview}
      pendingPanelSwitch={pendingPanelSwitch}
      setPendingPanelSwitch={setPendingPanelSwitch}
      appRootRef={appRootRef}
      mainAreaRef={mainAreaRef}
      projectScopeRef={projectScopeRef}
      exportPreviewRef={exportPreviewRef}
      importInputRef={importInputRef}
      mainAreaHeight={mainAreaHeight}
      isProjectDropdownOpen={isProjectDropdownOpen}
      setIsProjectDropdownOpen={setIsProjectDropdownOpen}
      isLibraryDropdownOpen={isLibraryDropdownOpen}
      setIsLibraryDropdownOpen={setIsLibraryDropdownOpen}
      isDesignDocsOpen={isDesignDocsOpen}
      setIsDesignDocsOpen={setIsDesignDocsOpen}
      editingProjectId={editingProjectId}
      setEditingProjectId={setEditingProjectId}
      editingProjectName={editingProjectName}
      setEditingProjectName={setEditingProjectName}
      deleteConfirmId={deleteConfirmId}
      setDeleteConfirmId={setDeleteConfirmId}
      deleteProjectId={deleteProjectId}
      setDeleteProjectId={setDeleteProjectId}
      isFloatingGnbOpen={isFloatingGnbOpen}
      setIsFloatingGnbOpen={setIsFloatingGnbOpen}
      panelPos={panelPos}
      setPanelPos={setPanelPos}
      isDraggingPanel={isDraggingPanel}
      setIsDraggingPanel={setIsDraggingPanel}
      handleDragStart={handleDragStart}
      toast={toast}
      setToast={setToast}
      showToast={showToast}
      isCapturingWidgets={isCapturingWidgets}
      widgetCaptureProgress={widgetCaptureProgress}
      isWidgetCapturePickerOpen={isWidgetCapturePickerOpen}
      setIsWidgetCapturePickerOpen={setIsWidgetCapturePickerOpen}
      selectedCaptureWidgetIds={selectedCaptureWidgetIds}
      setSelectedCaptureWidgetIds={setSelectedCaptureWidgetIds}
      widgetCaptureThumbs={widgetCaptureThumbs}
      handleOpenWidgetCapturePicker={handleOpenWidgetCapturePicker}
      handleConfirmWidgetScreensExport={handleConfirmWidgetScreensExport}
      allCaptureSelected={allCaptureSelected}
      someCaptureSelected={someCaptureSelected}
      captureMode={captureMode}
      isThumbRefreshing={isThumbRefreshing}
      thumbRefreshPercent={thumbRefreshPercent}
      isWidgetPickerOpen={isWidgetPickerOpen}
      setIsWidgetPickerOpen={setIsWidgetPickerOpen}
      handleOpenWidgetPicker={handleOpenWidgetPicker}
      deleteWidget={deleteWidget}
      confirmDeleteWidget={confirmDeleteWidget}
      handleWidgetSelect={handleWidgetSelect}
      handleToggleEditMode={handleToggleEditMode}
      handleOpenDesignSidebar={handleOpenDesignSidebar}
      handleOpenLayoutSidebar={handleOpenLayoutSidebar}
      handleLogout={handleLogout}
      confirmDeleteProject={confirmDeleteProject}
      handleExportClick={handleExportClick}
      handleProjectSave={handleProjectSave}
      showSidebar={showSidebar}
      libraryOptions={libraryOptions}
      currentLibrary={currentLibrary}
      header={header}
      pageBgUrl={pageBgUrl}
      showUnifiedBg={showUnifiedBg}
    />
  );
};

export default App;
