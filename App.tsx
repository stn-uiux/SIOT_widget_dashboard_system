import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { GridLayout, ResponsiveGridLayout, useContainerWidth, getCompactor } from "react-grid-layout";
import type { LayoutItem } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import {
  Layout,
  LayoutGrid,
  Edit3,
  Eye,
  Plus,
  Palette,
  BarChart3,
  TrendingUp,
  Activity,
  ChevronDown,
  EyeOff,
  CheckCircle2,
  Sun,
  Moon,
  Trash2,
  X,
  Download,
  Upload,
} from "lucide-react";
import { getSemanticColorForMode } from "./design-tokens/themeFromTokens";
import {
  INITIAL_PROJECT_LIST,
  MOCK_CHART_DATA,
  DEFAULT_PAGE,
  DEFAULT_THEME,
  DEFAULT_HEADER,
  THEME_PRESETS,
  RESPONSIVE_BREAKPOINTS,
  RESPONSIVE_COLS,
  TYPE_DEFAULT_DATA,
} from "./constants";
import {
  Widget,
  WidgetType,
  DashboardTheme,
  ThemePreset,
  LayoutConfig,
  ThemeMode,
  ChartLibrary,
  Project,
  DashboardPage,
  HeaderConfig,
  HeaderPosition,
  TextAlignment,
  HeaderWidget,
  HeaderWidgetType,
} from "./types";
import WidgetCard from "./components/WidgetCard";
import DesignSidebar from "./components/DesignSidebar";
import Sidebar from "./components/Sidebar";
import ExcelModal from "./components/ExcelModal";
import ConfirmModal from "./components/ConfirmModal";
import DesignDocs from "./components/DesignDocs";
import DesignSystem from "./DesignSystem";
import WidgetPicker from "./components/WidgetPicker";
import ModeToggle from "./components/ModeToggle";
import GlobeBackground from "./components/GlobeBackground";
import FloatingAssistantButton from "./components/FloatingAssistantButton";
import { dbSave, dbLoad } from "./lib/storage";
import { exportProjectToZip, importProjectFromZip } from "./lib/exportImport";
// Assets - Use safer path references to avoid Vite module transformation issues with spaces/special chars
const logoB = new URL("./assets/logo-b-1 1.png", import.meta.url).href;
const logoW = new URL("./assets/logo-w-1 1.png", import.meta.url).href;

const proj1Zip = new URL("./assets/New_Project_1_2026-04-08.zip", import.meta.url).href;
const proj2Zip = new URL("./assets/new_project_2_2026-04-08.zip", import.meta.url).href;
const proj3Zip = new URL("./assets/New_Project_3_2026-04-08.zip", import.meta.url).href;
const proj4Zip = new URL("./assets/New_Project_4_2026-04-09.zip", import.meta.url).href;

const LAYOUT_STORAGE_KEY = "siot_dashboard_rgl_layouts";
const PROJECTS_STORAGE_KEY = "siot_dashboard_projects";

type LayoutStore = Record<string, Record<string, LayoutItem[] | Record<string, LayoutItem[]>>>;

/** 동기 로드 — 앱 최초 렌더 시 localStorage에서 빠르게 불러옴 (legacy 호환) */
function loadLayoutStoreSync(): LayoutStore {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as LayoutStore;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

/** 비동기 저장 — IndexedDB + localStorage 백업 (새로고침 시 초기 로드에서 바로 복원) */
async function saveLayoutStore(store: LayoutStore) {
  await dbSave(LAYOUT_STORAGE_KEY, store);
  try {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(store));
  } catch {
    /* quota or size ok */
  }
}

type ProjectsState = { projects: Project[]; activeProjectId: string };

/** 저장된 프로젝트 데이터를 현재 스키마에 맞춰 보정하고 테마 설정을 검증 (Self-Healing 포함) */
function migrateProjects(projects: Project[]): Project[] {
  if (!Array.isArray(projects)) return [];
  
  return projects.map((p) => {
    // 1. 테마 보정 및 자가 치유
    const isDefaultProject = p.id && String(p.id).startsWith('project_');
    let theme = { ...DEFAULT_THEME, ...(p.theme || {}) };
    
    // 테마 자가 교정: 배경색이 밝거나 모드가 라이트인 경우 강제로 다크 모드 동기화
    const isLightBackground = theme.backgroundColor && (theme.backgroundColor.toLowerCase() === '#f8fafc' || theme.backgroundColor.toLowerCase() === '#ffffff');
    if (theme.mode === ThemeMode.LIGHT || isLightBackground) {
      console.log(`[STN] Theme mismatch detected for project ${p.id}. Forcing Dark Mode.`);
      theme = { 
        ...theme, 
        name: "Dark Mode",
        mode: ThemeMode.DARK, 
        backgroundColor: '#020617', 
        surfaceColor: '#0f172a', 
        titleColor: '#f8fafc',
        textColor: '#94a3b8'
      };
    }

    // 2. 페이지 및 헤더 마이그레이션
    const mappedPages = (p.pages || []).map((pg) => {
      const mergedHeader = { ...DEFAULT_HEADER, ...(pg.header || {}) };
      // 배경색이 레거시 변수 형태면 투명으로 교정
      if (mergedHeader.backgroundColor === 'var(--background)') {
        mergedHeader.backgroundColor = 'transparent';
      }
      return {
        ...pg,
        layout: { ...DEFAULT_PAGE.layout, ...(pg.layout || {}) },
        header: mergedHeader,
      };
    });

    const pages = mappedPages.length > 0
      ? mappedPages
      : [{ ...DEFAULT_PAGE, id: "page_1", name: "Main Page" }];
      
    const activePageId = p.activePageId && pages.some((pg) => pg.id === p.activePageId)
      ? p.activePageId
      : pages[0].id;

    return {
      ...p,
      theme,
      pages,
      activePageId,
    };
  });
}

/** 동기 로드 — 앱 최초 렌더 시 localStorage에서 불러옴 */
function loadProjectsStateSync(initial: Project[]): ProjectsState {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return { projects: migrateProjects(initial), activeProjectId: initial[0]?.id ?? "project_1" };
    const parsed = JSON.parse(raw) as ProjectsState;
    
    const projects = migrateProjects(parsed.projects || initial);
    const activeProjectId = (parsed.activeProjectId && projects.some(p => p.id === parsed.activeProjectId))
      ? parsed.activeProjectId
      : (projects[0]?.id ?? "project_1");
      
    return { projects, activeProjectId };
  } catch {
    return { projects: migrateProjects(initial), activeProjectId: initial[0]?.id ?? "project_1" };
  }
}

/** 비동기 저장 — IndexedDB (용량 제한 없음) */
async function saveProjectsState(projects: Project[], activeProjectId: string): Promise<boolean> {
  const ok = await dbSave(PROJECTS_STORAGE_KEY, { projects, activeProjectId });
  if (!ok) console.error("[STN] Failed to save project state to IndexedDB");
  // also try localStorage as fallback (may fail for large data, that's ok)
  try { localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify({ projects, activeProjectId })); } catch { /* quota ok */ }
  return ok;
}

let _cachedProjectsState: ProjectsState | null = null;
function getInitialProjectsState(): ProjectsState {
  // 항상 최신 localStorage에서 읽음 (HMR 시 캐시로 인한 오래된 값 사용 방지)
  if (!_cachedProjectsState) {
    _cachedProjectsState = loadProjectsStateSync(INITIAL_PROJECT_LIST);
  }
  return _cachedProjectsState;
}

// HMR(핫 리로드) 또는 재시작 시 캐시 초기화 (항상 최신 localStorage 반영)
(import.meta as any).hot?.on?.('vite:beforeUpdate', () => {
  _cachedProjectsState = null;
});

const PRESETS_STORAGE_KEY = "siot_theme_presets";

function loadPresetsSync(fallback: ThemePreset[]): ThemePreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function savePresets(presets: ThemePreset[]) {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error("Failed to save presets", e);
  }
}

/** 위젯 배열에서 순차 배치 초기 레이아웃을 계산 */
const computeInitialLayout = (
  pageWidgets: Widget[],
  cols: number,
): LayoutItem[] => {
  let curX = 0,
    curY = 0,
    rowH = 0;
  return pageWidgets.map((w) => {
    const wCols = Math.min(w.colSpan, cols);
    if (curX + wCols > cols) {
      curX = 0;
      curY += rowH;
      rowH = 0;
    }
    rowH = Math.max(rowH, w.rowSpan);
    const item: LayoutItem = {
      i: w.id,
      x: curX,
      y: curY,
      w: wCols,
      h: w.rowSpan,
    };
    curX += wCols;
    return item;
  });
};

/** Dashboard grid with its own useContainerWidth so it re-measures when we return from project_2. */
const DashboardGrid: React.FC<{
  layout: LayoutConfig;
  theme: DashboardTheme;
  widgets: Widget[];
  currentRglLayout: LayoutItem[];
  mainAreaHeight: number;
  isEditMode: boolean;
  selectedWidgetId: string | null;
  onLayoutChange: (layout: readonly LayoutItem[]) => void;
  onWidgetSelect: (id: string) => void;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onDeleteWidget: (id: string) => void;
  onOpenExcel: (id: string) => void;
  onOpenWidgetPicker: () => void;
  responsiveLayouts?: Record<string, LayoutItem[]>;
  onResponsiveLayoutChange?: (layouts: Record<string, LayoutItem[]>) => void;
}> = (props) => {
  const {
    layout,
    theme,
    widgets,
    currentRglLayout,
    mainAreaHeight,
    isEditMode,
    selectedWidgetId,
    onLayoutChange,
    onWidgetSelect,
    onUpdateWidget,
    onDeleteWidget,
    onOpenExcel,
    onOpenWidgetPicker,
    responsiveLayouts,
    onResponsiveLayoutChange,
  } = props;

  const [resizingId, setResizingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);
  const resizeRafRef = useRef<number | null>(null);

  const { containerRef: gridContainerRef, width: gridWidth } = useContainerWidth({
    initialWidth: 1280,
  });

  const rglRowHeight = useMemo(() => {
    if (layout.fitToScreen) {
      const padding = theme.dashboardPadding ?? 24;
      const availableH = Math.max(0, mainAreaHeight - padding * 2);
      const gap = (layout.rows - 1) * theme.spacing;
      return Math.max(30, (availableH - gap) / layout.rows);
    }
    return layout.defaultRowHeight;
  }, [
    layout.fitToScreen,
    layout.rows,
    layout.defaultRowHeight,
    mainAreaHeight,
    theme.spacing,
    theme.dashboardPadding,
  ]);

  const usePixelGrid = layout.useGrid === false;
  // 픽셀 모드: 1px = 1단위가 되도록. RGL이 width를 절반으로 쓰는 경우가 있어 cols 2배로 보정
  const pixelStep = 1;
  const fineCols = useMemo(() => {
    if (!usePixelGrid) return layout.columns;
    return Math.max(1, Math.floor(gridWidth));
  }, [usePixelGrid, gridWidth, layout.columns]);
  const fineRowHeight = usePixelGrid ? pixelStep : rglRowHeight;
  const rglCols = usePixelGrid ? fineCols * 2 : fineCols;
  const rglRowH = usePixelGrid ? fineRowHeight * 2 : fineRowHeight;

  const finite = (n: number, d: number) => (typeof n === "number" && Number.isFinite(n) ? n : d);
  const displayLayout = useMemo(() => {
    if (!usePixelGrid) return currentRglLayout;
    const cols = Math.max(1, layout.columns);
    const spacing = theme.spacing;
    const colWidth = (gridWidth - (cols - 1) * spacing) / cols;
    const rowH = rglRowHeight;
    const unitX = gridWidth / rglCols;
    const unitY = rglRowH / rglRowH; // 1 unit in RGL units

    return currentRglLayout.map((item) => {
      // In Grid mode, pos = x * (colWidth + spacing)
      // In Pixel mode, pos = xPx * unitX
      // So xPx = (x * (colWidth + spacing)) / unitX
      const left = finite(Number(item.x), 0) * (colWidth + spacing);
      const top = finite(Number(item.y), 0) * (rowH + spacing);
      const width = finite(Number(item.w), 4) * (colWidth + spacing) - spacing;
      const height = finite(Number(item.h), 4) * (rowH + spacing) - spacing;

      return {
        ...item,
        x: finite(left / unitX, 0),
        y: finite(top / rglRowH, 0),
        w: Math.max(2, finite(width / unitX, 4)),
        h: Math.max(2, finite(height / rglRowH, 4)),
      };
    });
  }, [usePixelGrid, currentRglLayout, layout.columns, rglCols, rglRowH, rglRowHeight, gridWidth, theme.spacing]);

  const handleLayoutChange = useCallback(
    (next: readonly LayoutItem[]) => {
      if (!usePixelGrid) {
        onLayoutChange(next);
        return;
      }
      const cols = Math.max(1, layout.columns);
      const spacing = theme.spacing;
      const colWidth = (gridWidth - (cols - 1) * spacing) / cols;
      const unitX = gridWidth / rglCols;

      const gridLayout = next.map((item) => {
        // In Pixel mode, left = x * unitX
        // In Grid mode, left = xGrid * (colWidth + spacing)
        // so xGrid = (x * unitX) / (colWidth + spacing)
        const left = finite(Number(item.x), 0) * unitX;
        const top = finite(Number(item.y), 0) * rglRowH;
        const width = finite(Number(item.w), 4) * unitX;
        const height = finite(Number(item.h), 4) * rglRowH;

        const xGrid = left / (colWidth + spacing);
        const yGrid = top / (rglRowHeight + spacing);
        const wGrid = (width + spacing) / (colWidth + spacing);
        const hGrid = (height + spacing) / (rglRowHeight + spacing);

        return {
          ...item,
          x: Math.max(0, finite(Math.round(xGrid * 100) / 100, 0)),
          y: Math.max(0, finite(Math.round(yGrid * 100) / 100, 0)),
          w: Math.max(0.5, finite(Math.round(wGrid * 100) / 100, 4)),
          h: Math.max(0.5, finite(Math.round(hGrid * 100) / 100, 4)),
        };
      });
      onLayoutChange(gridLayout);
    },
    [usePixelGrid, layout.columns, rglCols, rglRowH, rglRowHeight, gridWidth, theme.spacing, onLayoutChange]
  );

  const hasLayoutBackground = !!(layout?.backgroundGlobe || layout?.backgroundImage || layout?.backgroundImageLight || layout?.backgroundImageDark);
  const gridAreaBg = hasLayoutBackground
    ? "transparent"
    : "var(--background)";
  return (
    <div
      className="h-full min-h-0"
      style={{ padding: "var(--dashboard-padding)", background: gridAreaBg }}
    >
      <div
        ref={gridContainerRef as React.RefObject<HTMLDivElement>}
        className={`relative ${layout.fitToScreen ? "h-full" : "h-auto"} ${layout.backgroundGlobe ? "pointer-events-none" : ""}`}
        style={{ width: "100%" }}
      >
        {widgets.length === 0 && isEditMode ? (
        <div className="w-full flex justify-center py-10">
          <button
            onClick={onOpenWidgetPicker}
            style={{
              borderRadius: "var(--border-radius)",
              width: "100%",
              maxWidth: "var(--empty-state-max-width)",
              minHeight: "var(--empty-state-min-height)",
            }}
            className={`flex flex-col items-center justify-center border-2 border-dashed border-main bg-surface/30 text-muted hover:bg-[var(--primary-subtle)] hover:border-primary transition-all group ${layout.backgroundGlobe ? "pointer-events-auto" : ""}`}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <span className="font-black text-lg uppercase tracking-widest block mb-2">
                Create Your Dashboard
              </span>
              <p className="text-xs text-muted font-medium">
                Click to add your first analysis widget
              </p>
            </div>
          </button>
        </div>
      ) : (
        <>
          {(() => {
            // 그리드 가이드라인: Edit 모드 + 그리드 사용 ON일 때, 일반/반응형 둘 다 표시
            if (usePixelGrid || !isEditMode) return null;
            const margin = theme.spacing;
            const cols = layout.columns;
            if (!cols || gridWidth <= 0) return null;
            const colWidth = (gridWidth - (cols - 1) * margin) / cols;
            const rowH = rglRowHeight;
            const hPeriod = rowH + margin;
            const totalH = 3000;
            const gridFillVar = theme.mode === ThemeMode.LIGHT ? "--grid-guide-fill-light" : "--grid-guide-fill-dark";
            const gridFill = typeof document !== "undefined"
              ? getComputedStyle(document.documentElement).getPropertyValue(gridFillVar).trim() || "rgba(0,0,0,0.06)"
              : "rgba(0,0,0,0.06)";
            const columns = Array.from({ length: cols }, (_, i) => ({
              x: i * (colWidth + margin),
              width: colWidth,
            }));
            const rowCount = Math.ceil(totalH / hPeriod);
            const rows = Array.from({ length: rowCount }, (_, j) => ({
              y: j * hPeriod,
              height: rowH,
            }));
            const svg = [
              "<svg xmlns='http://www.w3.org/2000/svg' width='",
              gridWidth,
              "' height='",
              totalH,
              "'>",
              columns
                .map(
                  (c) =>
                    `<rect x='${c.x}' y='0' width='${c.width}' height='${totalH}' fill='${gridFill}'/>`,
                )
                .join(""),
              rows
                .map(
                  (r) =>
                    `<rect x='0' y='${r.y}' width='${gridWidth}' height='${r.height}' fill='${gridFill}'/>`,
                )
                .join(""),
              "</svg>",
            ].join("");
            const dataUri = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
            return (
              <div
                aria-hidden
                className="grid-neon-overlay pointer-events-none absolute inset-0 z-0"
                style={{
                  backgroundImage: dataUri,
                  backgroundSize: `${gridWidth}px ${totalH}px`,
                  backgroundPosition: "0 0",
                  backgroundRepeat: "repeat-y",
                }}
              />
            );
          })()}
          {layout.useResponsive && responsiveLayouts && onResponsiveLayoutChange ? (
            <ResponsiveGridLayout
              className={resizingId || draggingId ? "is-interacting" : ""}
              width={gridWidth}
              breakpoints={RESPONSIVE_BREAKPOINTS}
              cols={RESPONSIVE_COLS}
              layouts={responsiveLayouts}
              rowHeight={rglRowHeight}
              margin={[theme.spacing, theme.spacing] as [number, number]}
              containerPadding={[0, 0] as [number, number]}
              maxRows={layout.fitToScreen ? layout.rows : Infinity}
              compactor={getCompactor((layout.useGrid === false || layout.freePosition) ? null : "vertical", (layout.useGrid === false || layout.freePosition))}
              dragConfig={{ enabled: isEditMode, handle: ".drag-handle" }}
              resizeConfig={{
                enabled: isEditMode,
                handles: ["se", "sw", "ne", "nw", "e", "w", "n", "s"] as const,
              }}
              autoSize={!layout.fitToScreen}
              onLayoutChange={(_layout, layouts) => onResponsiveLayoutChange(layouts)}
              onDragStart={(layout, oldItem, newItem) => {
                setDraggingId(newItem.i);
              }}
              onDragStop={() => {
                setDraggingId(null);
              }}
              onResizeStart={(layout, oldItem, newItem) => {
                setResizingId(newItem.i);
                setLiveSize({ w: newItem.w, h: newItem.h });
              }}
              onResize={(layout, oldItem, newItem) => {
                if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                resizeRafRef.current = requestAnimationFrame(() => {
                  setLiveSize({ w: newItem.w, h: newItem.h });
                });
              }}
              onResizeStop={() => {
                if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                setResizingId(null);
                setLiveSize(null);
              }}
              style={{
                position: "relative",
                zIndex: 1,
                minHeight: layout.fitToScreen && widgets.length > 0 ? "100%" : "auto",
              }}
            >
              {(widgets || []).map((widget) => {
                const isThisInteracting = resizingId === widget.id || draggingId === widget.id;
                const isThisResizing = resizingId === widget.id;
                return (
                  <div
                    key={widget.id}
                    className={`h-full relative ${layout?.backgroundGlobe ? "pointer-events-auto" : ""} ${isThisInteracting ? "" : "transition-[background,border,box-shadow,transform] duration-200"} ${selectedWidgetId === widget.id || isThisInteracting ? "widget-selected" : ""}`}
                    style={selectedWidgetId === widget.id || isThisInteracting ? { zIndex: 50 } : {}}
                  >
                    <WidgetCard
                      widget={widget}
                      theme={theme}
                      isEditMode={isEditMode}
                      onEdit={onWidgetSelect}
                      onUpdate={onUpdateWidget}
                      onDelete={onDeleteWidget}
                      onOpenExcel={onOpenExcel}
                      glassStyle={layout?.glassmorphism ?? false}
                      selected={selectedWidgetId === widget.id}
                      isResizing={isThisResizing}
                      isDragging={draggingId === widget.id}
                    />
                    {isEditMode && isThisResizing && liveSize && (
                      <div className="absolute bottom-3 right-3 z-[100] w-fit h-fit px-2.5 py-1 rounded bg-black/90 backdrop-blur-sm border border-white/20 shadow-2xl pointer-events-none overflow-hidden">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="font-bold text-white/90 font-mono tracking-tighter leading-none" style={{ fontSize: 'var(--text-caption)' }}>
                            {liveSize.w} × {liveSize.h}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          ) : (
            <>
              <GridLayout
                className={resizingId || draggingId ? "is-interacting" : ""}
                layout={displayLayout}
                width={gridWidth}
                gridConfig={{
                  cols: rglCols,
                  rowHeight: rglRowH,
                  margin: (usePixelGrid ? [0, 0] : [theme.spacing, theme.spacing]) as [number, number],
                  containerPadding: [0, 0] as [number, number],
                  maxRows: usePixelGrid ? Infinity : layout.fitToScreen ? layout.rows : Infinity,
                }}
                compactor={getCompactor((usePixelGrid || layout.freePosition) ? null : "vertical", (usePixelGrid || layout.freePosition))}
                dragConfig={{ enabled: isEditMode, handle: ".drag-handle" }}
                resizeConfig={{
                  enabled: isEditMode,
                  handles: ["se", "sw", "ne", "nw", "e", "w", "n", "s"] as const,
                }}
                autoSize={!layout.fitToScreen}
                onLayoutChange={handleLayoutChange}
                onDragStart={(layout, oldItem, newItem) => {
                  setDraggingId(newItem.i);
                }}
                onDragStop={() => {
                  setDraggingId(null);
                }}
                onResizeStart={(layout, oldItem, newItem) => {
                  setResizingId(newItem.i);
                  setLiveSize({ w: newItem.w, h: newItem.h });
                }}
                onResize={(layout, oldItem, newItem) => {
                  if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                  resizeRafRef.current = requestAnimationFrame(() => {
                    setLiveSize({ w: newItem.w, h: newItem.h });
                  });
                }}
                onResizeStop={() => {
                  if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                  setResizingId(null);
                  setLiveSize(null);
                }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: layout.fitToScreen && widgets.length > 0 ? "100%" : "auto",
                }}
              >
                {(widgets || []).map((widget) => {
                    const isThisInteracting = resizingId === widget.id || draggingId === widget.id;
                    const isThisResizing = resizingId === widget.id;
                    return (
                      <div
                        key={widget.id}
                        className={`h-full relative ${layout?.backgroundGlobe ? "pointer-events-auto" : ""} ${isThisInteracting ? "" : "transition-[background,border,box-shadow,transform] duration-200"} ${selectedWidgetId === widget.id || isThisInteracting ? "widget-selected" : ""}`}
                        style={selectedWidgetId === widget.id || isThisInteracting ? { zIndex: 50 } : {}}
                      >
                      <WidgetCard
                        widget={widget}
                        theme={theme}
                        isEditMode={isEditMode}
                        onEdit={onWidgetSelect}
                        onUpdate={onUpdateWidget}
                        onDelete={onDeleteWidget}
                        onOpenExcel={onOpenExcel}
                        glassStyle={layout?.glassmorphism ?? false}
                        selected={selectedWidgetId === widget.id}
                        isResizing={isThisResizing}
                        isDragging={draggingId === widget.id}
                      />
                      {isEditMode && isThisResizing && liveSize && (
                        <div className="absolute bottom-3 right-3 z-[100] w-fit h-fit px-2.5 py-1 rounded bg-black/90 backdrop-blur-sm border border-white/20 shadow-2xl pointer-events-none overflow-hidden">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-bold text-white/90 font-mono tracking-tighter leading-none" style={{ fontSize: 'var(--text-caption)' }}>
                              {liveSize.w} × {liveSize.h}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </GridLayout>
            </>
          )}

          {isEditMode && (
            <div 
              className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-auto pointer-events-none flex flex-col items-center"
            >
              {/* Dynamic Island Style Pill Button */}
              <div className="group pointer-events-auto relative">
                <button
                  onClick={onOpenWidgetPicker}
                  className={`
                    relative flex items-center gap-3 px-6 h-[52px]
                    bg-white/10 dark:bg-black/40 backdrop-blur-2xl
                    border border-white/20 dark:border-white/10
                    rounded-full overflow-hidden transition-all duration-500
                    hover:scale-105 hover:px-8 active:scale-95
                    shadow-[var(--shadow-header-bar)]
                    before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity
                  `}
                >
                  {/* Glowing Animated Ring */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent,var(--primary-color),transparent)] animate-[spin_4s_linear_infinite] opacity-40" />
                  </div>

                  {/* Icon with hover rotation */}
                  <div className="relative z-10 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-700">
                    <Plus className="w-5 h-5 text-white stroke-[3px]" />
                  </div>

                  {/* Text with letter spacing animation */}
                  <span className={`relative z-10 font-black text-[13px] uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500 whitespace-nowrap drop-shadow-md ${theme.mode === ThemeMode.LIGHT ? "text-slate-700" : "text-white"}`}>
                    Add Widget
                  </span>

                </button>

                {/* Subtle outer glow */}
                <div className="absolute -inset-1 bg-primary/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Hint under the button */}
              <div className="mt-3 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                <span className="text-white/70 uppercase tracking-widest font-bold" style={{ fontSize: 'var(--text-micro)' }}>Pick analysis component</span>
              </div>
            </div>
          )}
        </>
      )}
      </div>
    </div>
  );
};

const IsometricLogo: React.FC<{
  isDark?: boolean;
  primaryColor?: string;
}> = ({ isDark, primaryColor }) => {
  const color = primaryColor ?? (typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim() : "");
  const isLight = !isDark;
  const accentColor = isLight ? color : "white";
  return (
    <div className="relative w-10 h-10 group flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-9 h-9 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop
              offset="100%"
              stopColor="var(--secondary-color)"
            />
          </linearGradient>
          <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={accentColor}
              stopOpacity={isLight ? 0.6 : 0.8}
            />
            <stop
              offset="100%"
              stopColor={accentColor}
              stopOpacity={isLight ? 0.1 : 0.2}
            />
          </linearGradient>
        </defs>

        {/* Shadow/Glow under the base */}
        <path
          d="M50 85 L15 65 L50 45 L85 65 Z"
          fill={color}
          fillOpacity="0.2"
        />

        {/* Main Isometric Base */}
        <path d="M50 82 L15 62 L50 42 L85 62 Z" fill="url(#baseGrad)" />
        <path
          d="M15 62 L15 68 L50 88 L50 82 Z"
          fill={color}
          fillOpacity="0.8"
          filter="brightness(0.7)"
        />
        <path
          d="M50 82 L50 88 L85 68 L85 62 Z"
          fill={color}
          fillOpacity="0.8"
          filter="brightness(0.5)"
        />

        {/* Vertical Panels */}
        <g>
          {/* Back Panel */}
          <path
            d="M55 42 L55 12 L75 22 L75 52 Z"
            fill="url(#panelGrad)"
            stroke={accentColor}
            strokeOpacity={isLight ? 0.4 : 0.3}
            strokeWidth="0.5"
          />
          {/* Front Panel */}
          <path
            d="M30 52 L30 22 L50 32 L50 62 Z"
            fill="url(#panelGrad)"
            stroke={accentColor}
            strokeOpacity={isLight ? 0.5 : 0.4}
            strokeWidth="0.5"
          />

          {/* Mini Data Bars inside panels (isometric) */}
          <rect
            x="35"
            y="45"
            width="2"
            height="8"
            fill={accentColor}
            fillOpacity={isLight ? 0.5 : 0.6}
            transform="skew-y(-25)"
          />
          <rect
            x="42"
            y="48"
            width="2"
            height="12"
            fill={accentColor}
            fillOpacity={isLight ? 0.7 : 0.8}
            transform="skew-y(-25)"
          />
          <rect
            x="60"
            y="32"
            width="2"
            height="6"
            fill={accentColor}
            fillOpacity={isLight ? 0.4 : 0.5}
            transform="skew-y(-25)"
          />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[var(--primary-subtle)] blur-xl rounded-full scale-110 -z-10" />
    </div>
  );
};

const getSmartColorForMode = (
  hex: string,
  mode: ThemeMode,
  type: "bg" | "surface" | "text",
): string => {
  return getSemanticColorForMode(mode, type === "bg" ? "bg" : type === "surface" ? "surface" : "text");
};

/** Header-specific Widget Components */
const HeaderClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  const h = time.getHours().toString().padStart(2, "0");
  const m = time.getMinutes().toString().padStart(2, "0");
  const dateStr = time.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [day, datePart] = dateStr.split(", ");
  return (
    <div className="w-full h-full flex items-center justify-center gap-2 px-3 py-1 text-[var(--text-main)] font-mono whitespace-nowrap overflow-hidden">
      <span className="text-lg font-bold tracking-tighter shrink-0">{h}:{m}</span>
      <div className="flex flex-col leading-none shrink-0">
        <span className="font-bold opacity-70 uppercase" style={{ fontSize: 'var(--text-nano)' }}>{day}</span>
        <span className="font-black" style={{ fontSize: 'var(--text-micro)' }}>{datePart?.replace(/\//g, "-")}</span>
      </div>
    </div>
  );
};

const HeaderMonitor = () => (
  <div className="w-full h-full flex items-center justify-center gap-2 px-3 py-1 bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-base)] dark:border-white/5 shadow-sm rounded-full text-[var(--text-main)] whitespace-nowrap overflow-hidden">
    <span className="font-bold tracking-tight uppercase" style={{ fontSize: 'var(--text-caption)' }}>시스템 감시</span>
    <div className="w-2 h-2 rounded-full bg-[var(--error)] animate-pulse shadow-[var(--shadow-error-glow)] shrink-0" />
  </div>
);

const HeaderImage = ({ url }: { url?: string }) => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden">
    {url ? (
      <img src={url} alt="Header Widget" className="max-w-full max-h-full object-contain" />
    ) : (
      <div className="font-bold text-muted uppercase" style={{ fontSize: 'var(--text-caption)' }}>No Image</div>
    )}
  </div>
);

const HeaderLogo = ({ url }: { url?: string }) => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden">
    {url ? (
      <img src={url} alt="Logo" className="max-w-full max-h-full object-contain" />
    ) : (
      <div className="font-bold text-muted uppercase" style={{ fontSize: 'var(--text-caption)' }}>No Logo</div>
    )}
  </div>
);

const HeaderThemeToggle = ({
  mode,
  onSwitch,
  isEditMode,
  isPreviewMode
}: {
  mode: ThemeMode;
  onSwitch: (m: ThemeMode) => void;
  isEditMode?: boolean;
  isPreviewMode?: boolean;
}) => {
  const disabled = isEditMode || !isPreviewMode;
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ModeToggle 
        mode={mode} 
        onChange={onSwitch} 
        disabled={disabled} 
        isEditMode={isEditMode}
        isPreviewMode={isPreviewMode}
      />
    </div>
  );
};

interface HeaderWidgetLayerProps {
  header: HeaderConfig;
  isEditMode: boolean;
  onUpdate: (updates: Partial<HeaderConfig>) => void;
  theme: DashboardTheme;
  onModeSwitch: (m: ThemeMode) => void;
  isPreviewMode: boolean;
}

const HeaderWidgetLayer: React.FC<HeaderWidgetLayerProps> = ({
  header,
  isEditMode,
  onUpdate,
  theme,
  onModeSwitch,
  isPreviewMode,
}) => {
  const widgets = header.widgets || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 헤더 실제 컨테이너 너비 사용 (edit 모드에서 사이드바 열림 여부와 무관하게 동일 레이아웃 유지)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) {
        setContainerWidth(prev => (Math.abs(prev - width) < 0.1 ? prev : width));
      }
    });
    ro.observe(el);
    const w = el.getBoundingClientRect().width;
    if (w > 0) setContainerWidth(w);
    return () => ro.disconnect();
  }, []);

  const gridWidth =
    header.position === HeaderPosition.TOP
      ? (containerWidth > 0 ? containerWidth : window.innerWidth - (header.margin * 2) - (header.padding * 2))
      : header.width - (header.padding * 2);

  const onLayoutChange = (newLayout: any[]) => {
    const updatedWidgets = widgets.map((w) => {
      const l = newLayout.find((item: any) => item.i === w.id);
      if (l) {
        return { ...w, x: l.x, y: l.y, w: l.w, h: l.h };
      }
      return w;
    });
    onUpdate({ widgets: updatedWidgets });
  };

  const handleManualDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("headerWidgetType") as HeaderWidgetType;
    if (!type || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const colWidth = rect.width / 60;
    const rowHeight = header.position === HeaderPosition.TOP ? (header.height / 12) : 40;

    const x = Math.floor(xPx / colWidth);
    const y = Math.floor(yPx / rowHeight);

    const newWidget: HeaderWidget = {
      id: `hw_${Date.now()}`,
      type,
      x: Math.max(0, Math.min(x, 54)),
      y: Math.max(0, Math.min(y, 11)),
      w: type === HeaderWidgetType.CLOCK 
        ? 4 
        : (type === HeaderWidgetType.MONITOR 
          ? 5 
          : type === HeaderWidgetType.THEME_TOGGLE 
            ? 3 
            : type === HeaderWidgetType.IMAGE || type === HeaderWidgetType.LOGO
              ? 6
              : 4),
      h: 6,
      url: (type === HeaderWidgetType.IMAGE || type === HeaderWidgetType.LOGO) ? 'https://via.placeholder.com/150' : undefined,
    };

    onUpdate({ widgets: [...widgets, newWidget] });
  };

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 z-20 ${(isEditMode || isPreviewMode) ? "pointer-events-auto" : "pointer-events-none"}`}
      onDragOver={(e) => isEditMode && e.preventDefault()}
      onDrop={(e) => isEditMode && handleManualDrop(e)}
    >
      <GridLayout
        className="layout"
        layout={widgets.map((w) => ({ 
          i: w.id, 
          x: w.x, 
          y: w.y, 
          w: w.type === HeaderWidgetType.CLOCK ? Math.min(w.w, 4) : w.type === HeaderWidgetType.THEME_TOGGLE ? Math.min(w.w, 3) : w.w, 
          h: w.h 
        }))}
        width={gridWidth}
        gridConfig={{
          cols: 60,
          rowHeight: header.position === HeaderPosition.TOP ? (header.height / 12 - 2) : 40,
          margin: [4, 2],
          containerPadding: [0, 0],
        }}
        dragConfig={{ enabled: isEditMode }}
        resizeConfig={{ enabled: isEditMode }}
        compactor={getCompactor(null, true)}
        onLayoutChange={onLayoutChange}
      >
        {widgets.map((w) => (
          <div key={w.id} className="relative group flex items-stretch pointer-events-auto">
            {w.type === HeaderWidgetType.CLOCK && <HeaderClock />}
            {w.type === HeaderWidgetType.MONITOR && <HeaderMonitor />}
            {w.type === HeaderWidgetType.THEME_TOGGLE && (
              <HeaderThemeToggle 
                mode={theme.mode} 
                onSwitch={onModeSwitch} 
                isEditMode={isEditMode}
                isPreviewMode={isPreviewMode} 
              />
            )}
            {w.type === HeaderWidgetType.IMAGE && <HeaderImage url={w.url} />}
            {w.type === HeaderWidgetType.LOGO && <HeaderLogo url={w.url} />}
            {isEditMode && (
              <button
                onClick={() => onUpdate({ widgets: widgets.filter((item) => item.id !== w.id) })}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </GridLayout>
    </div>
  );
};

// Loading UI Component (Reusable)
const LoadingScreen = ({ message }: { message: string }) => (
  <div className="fixed inset-0 bg-[#020617] flex items-center justify-center z-[9999]">
    <div className="relative flex flex-col items-center">
      <div className="absolute -inset-20 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute -inset-10 bg-indigo-500/10 blur-[60px] rounded-full animate-pulse [animation-delay:700ms]" />
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-8" />
        <div className="text-center">
          <span className="text-sm uppercase tracking-[0.4em] font-black text-white animate-pulse">
            STN Dashboard
          </span>
          <p className="text-[10px] text-slate-400 mt-2 tracking-widest uppercase">
            {message}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  // 1. Immediate Reset Check (Pre-render)
  if (typeof window !== 'undefined' && window.location.search.includes("reset=true")) {
    // Schedule reset
    useEffect(() => {
      const doReset = async () => {
        localStorage.clear();
        const req = indexedDB.deleteDatabase("siot_dashboard_db");
        req.onsuccess = () => {
          window.location.href = window.location.pathname;
        };
        req.onerror = () => {
          window.location.href = window.location.pathname;
        };
        req.onblocked = () => {
          window.location.href = window.location.pathname;
        };
      };
      
      doReset();
    }, []);

    return <LoadingScreen message="Resetting System..." />;
  }

  const [isHydrated, setIsHydrated] = useState(false);
  // Navigation & Project State (저장된 값이 있으면 새로고침 후에도 유지)
  const [projects, setProjects] = useState<Project[]>(() => getInitialProjectsState().projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(() => getInitialProjectsState().activeProjectId);

  const currentProject = projects.find((p) => p.id === activeProjectId) || projects[0];
  const theme = currentProject?.theme || DEFAULT_THEME;
  const currentPage = currentProject?.pages?.find((p) => p.id === currentProject?.activePageId) || currentProject?.pages?.[0];

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [isLayoutSidebarOpen, setIsLayoutSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);
  const [pendingPanelSwitch, setPendingPanelSwitch] = useState<'design' | 'layout' | 'close' | null>(null);
  const [presets, setPresets] = useState<ThemePreset[]>(() => loadPresetsSync(THEME_PRESETS));

  // Excel Modal State
  const [excelWidgetId, setExcelWidgetId] = useState<string | null>(null);

  // 레이아웃: projectId → pageId → LayoutItem[] (재시작 후에도 유지되도록 저장)
  const [layoutStore, setLayoutStore] = useState<LayoutStore>(loadLayoutStoreSync);
  const rglLayouts = useMemo(
    () => layoutStore[activeProjectId] ?? {},
    [layoutStore, activeProjectId],
  );
  const layoutStoreRef = useRef<LayoutStore>(layoutStore);
  layoutStoreRef.current = layoutStore;
  const projectsRef = useRef<Project[]>(projects);
  projectsRef.current = projects;

  const applyLayoutUpdate = useCallback(
    (updater: (prev: Record<string, LayoutItem[] | Record<string, LayoutItem[]>>) => Record<string, LayoutItem[] | Record<string, LayoutItem[]>>) => {
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

  // Consolidated Hydration & Onboarding
  useEffect(() => {
    let cancelled = false;
    const hydrateAndOnboard = async () => {
      try {
        // 1. IndexedDB에서 최근 프로젝트 로드
        const saved = await dbLoad<ProjectsState>(PROJECTS_STORAGE_KEY);
        const projectsRaw = localStorage.getItem(PROJECTS_STORAGE_KEY);

        if (!cancelled && saved?.projects?.length > 0) {
          const migrated = migrateProjects(saved.projects);
          setProjects(migrated);
          if (saved.activeProjectId) setActiveProjectId(saved.activeProjectId);
        } 
        // 2. 데이터가 아예 없으면 초기 온보딩 (ZIP 로드)
        else if (!cancelled && !projectsRaw) {
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

        // 3. 레이아웃 스토리지 복구
        const savedLayout = await dbLoad<LayoutStore>(LAYOUT_STORAGE_KEY);
        if (!cancelled && savedLayout) {
          setLayoutStore(prev => ({ ...prev, ...savedLayout }));
        }

        setIsHydrated(true);
      } catch (err) {
        console.error("[STN] Initialization error:", err);
        setIsHydrated(true); // 에러가 나더라도 일단 화면은 보여줌
      }
    };
    hydrateAndOnboard();
    return () => { cancelled = true; };
  }, []);

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
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [isWidgetPickerOpen, setIsWidgetPickerOpen] = useState(false);
  const [capturingForExport, setCapturingForExport] = useState(false);
  const [exportPhase, setExportPhase] = useState<"waiting" | "capturing" | "packing" | null>(null);
  const [hideBarForCapture, setHideBarForCapture] = useState(false);
  const exportPreviewRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // ── 내보내기: Preview 전환 → 로딩 표시 → 렌더 대기 → (로딩바 숨김) → 전체 화면 캡처 → ZIP 다운로드 ──
  useEffect(() => {
    if (!capturingForExport || !isPreviewMode) return;
    setExportPhase("waiting");
    const waitTimer = setTimeout(() => {
      const rootEl = appRootRef.current;
      if (!rootEl) {
        setExportPhase(null);
        setCapturingForExport(false);
        setIsPreviewMode(false);
        return;
      }
      setExportPhase("capturing");
      setHideBarForCapture(true);
      const capture = () =>
        import("html-to-image")
          .then((mod) => mod.toBlob(rootEl, { pixelRatio: 1, cacheBust: true }))
          .then((blob) => {
            setExportPhase("packing");
            const layoutPositions = (layoutStore[activeProjectId] ?? {}) as Record<string, Record<string, LayoutItem[]>>;
            return exportProjectToZip(currentProject, layoutPositions, blob);
          })
          .then(() => showToast("내보내기 완료."))
          .catch((err) => {
            console.error(err);
            showToast("미리보기 캡처 실패", "error");
          })
          .finally(() => {
            setHideBarForCapture(false);
            setExportPhase(null);
            setCapturingForExport(false);
            setIsPreviewMode(false);
          });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          capture();
        });
      });
    }, 2500);
    return () => clearTimeout(waitTimer);
  }, [capturingForExport, isPreviewMode, currentProject, layoutStore, activeProjectId]);

  // Shortcuts to current state for components (페이지 없을 때 fallback으로 빈 화면 방지)
  // theme shortcuts are already initialized at the top 
  const _page = currentPage ?? (currentProject?.pages?.[0]);
  const { widgets = [], layout = DEFAULT_PAGE.layout, header: pageHeader } = _page ?? { widgets: [], layout: DEFAULT_PAGE.layout, header: DEFAULT_HEADER };
  const header = pageHeader || DEFAULT_HEADER;

  const pageBgUrl = layout && (theme.mode === ThemeMode.LIGHT 
    ? (layout.backgroundImageLight || layout.backgroundImage) 
    : (layout.backgroundImageDark || layout.backgroundImage));
  const showUnifiedBg = !!(layout?.backgroundGlobe || pageBgUrl);

  const updateCurrentPage = (updates: Partial<DashboardPage>) => {
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
  };

  const updateProjectTheme = (newTheme: Partial<DashboardTheme>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id === activeProjectId) {
          return {
            ...p,
            theme: {
              ...p.theme,
              ...newTheme,
            },
          };
        }
        return p;
      }),
    );
  };

  const handleOpenWidgetPicker = () => {
    setIsWidgetPickerOpen(true);
  };

  const addWidgetWithType = (type: WidgetType) => {
    const defaultData = TYPE_DEFAULT_DATA[type];
    const newId = `widget_${Date.now()}`;

    // Find the bottom-most position in current layout
    const bottomY =
      currentRglLayout.length > 0
        ? Math.max(...currentRglLayout.map((l) => l.y + l.h))
        : 0;

    const newWidget: Widget = {
      id: newId,
      type: type,
      title: (defaultData as any)?.title ?? "New Analysis",
      colSpan: 4,
      rowSpan: 10, // Default to 200px (10 * 20px rowHeight)
      config: defaultData?.config
        ? JSON.parse(JSON.stringify(defaultData.config))
        : {
          xAxisKey: "name",
          yAxisKey: "value",
          series: [
            { key: "value", label: "Value", color: "var(--primary-color)" },
          ],
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          showUnit: false,
          showUnitInLegend: false,
          showLabels: false,
          unit: "",
        },
      data: defaultData?.data
        ? JSON.parse(JSON.stringify(defaultData.data))
        : JSON.parse(JSON.stringify(MOCK_CHART_DATA)),
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

    // Explicitly update RGL layout to place new widget at bottom
    applyLayoutUpdate((byProject) => {
      const cur = byProject[currentPage.id];
      const newItem = { i: newId, x: 0, y: bottomY, w: newWidget.colSpan, h: newWidget.rowSpan } as LayoutItem;
      if (layout.useResponsive) {
        const layouts = (cur && !Array.isArray(cur) ? cur : { lg: Array.isArray(cur) ? (cur as LayoutItem[]) : [] }) as Record<string, LayoutItem[]>;
        return { ...byProject, [currentPage.id]: { ...layouts, lg: [...(layouts.lg || []), newItem] } };
      }
      return { ...byProject, [currentPage.id]: [...(Array.isArray(cur) ? cur : []), newItem] };
    });

    updateCurrentPage({ widgets: [...widgets, newWidget] });
    setIsWidgetPickerOpen(false);
    showToast(`Added ${type} widget`);
  };

  const updateWidget = useCallback((id: string, updates: Partial<Widget>) => {
    updateCurrentPage({
      widgets: widgets.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    });
  }, [widgets, updateCurrentPage]);

  const deleteWidget = useCallback((id: string) => {
    setDeleteConfirmId(id);
  }, []);

  const confirmDeleteWidget = () => {
    if (!deleteConfirmId) return;
    const keepIds = new Set(widgets.filter((w) => w.id !== deleteConfirmId).map((w) => w.id));
    updateCurrentPage({
      widgets: widgets.filter((w) => w.id !== deleteConfirmId),
    });
    applyLayoutUpdate((byProject) => {
      const cur = byProject[currentPage.id];
      if (!cur) return byProject;
      if (Array.isArray(cur)) return { ...byProject, [currentPage.id]: cur.filter((l) => keepIds.has(l.i)) };
      const filtered: Record<string, LayoutItem[]> = {};
      for (const bp of Object.keys(cur)) filtered[bp] = (cur as Record<string, LayoutItem[]>)[bp].filter((l) => keepIds.has(l.i));
      return { ...byProject, [currentPage.id]: filtered };
    });
    setDeleteConfirmId(null);
    showToast("Widget removed successfully", "success");
  };

  const handleWidgetSelect = useCallback((id: string | null) => {
    setSelectedWidgetId(id);
    // Explicitly close design sidebar when selecting a widget or deselecting
    setIsDesignSidebarOpen(false);
  }, []);

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedWidgetId(null);
  };

  const handleToggleDesignSidebar = () => {
    if (isEditMode) {
      // If we are opening, ask for save? Actually let's just toggle normally for now 
      // but user specifically asked for confirmation when switching.
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


  // 프로젝트·위젯 내용 변경 시 IndexedDB에 저장 (새로고침 후에도 유지)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProjectsState(projects, activeProjectId);
    }, 400); // 0.4초 후 저장 (저장 누락 방지를 위해 단축)
    
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

  const handleApplyPreset = (preset: ThemePreset) => {
    const currentTheme = currentProject.theme;
    
    // 1. Snapshot CURRENT colors before overwriting
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

    // 2. Prepare updates from preset
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

    // 3. If target mode has a saved custom config, AND we are essentially 
    // just switching to that mode via a default preset, we might want to restore it.
    // However, if the user explicitly clicks a preset, they usually want that preset's colors.
    // BUT! For the default "Light Mode" / "Dark Mode" presets, they act like mode switches.
    const isDefaultModePreset = preset.name === "Light Mode" || preset.name === "Dark Mode";
    const targetSaved = (newModeStyles as any)[mode];
    if (isDefaultModePreset && targetSaved && Object.keys(targetSaved).length > 0) {
      Object.assign(updates, targetSaved);
    }

    updateProjectTheme(updates);
    showToast(`Applied ${preset.name}`);
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
    showToast(`Saved new preset: ${name}`);
  };

  const handleThemeChange = useCallback((newTheme: Partial<DashboardTheme>) => {
    updateProjectTheme(newTheme);
  }, [updateProjectTheme]);

  const handleModeSwitch = (mode: ThemeMode) => {
    const currentTheme = currentProject.theme;
    if (currentTheme.mode === mode) return;

    // Current snapshot to save
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

    // If target mode already has a saved custom config, restore it
    const targetSaved = (newModeStyles as any)[mode];
    if (targetSaved && Object.keys(targetSaved).length > 0) {
      Object.assign(updates, targetSaved);
    } else {
      // Otherwise, fallback to smart conversion
      updates.backgroundColor = getSmartColorForMode(currentTheme.backgroundColor, mode, "bg");
      updates.surfaceColor = getSmartColorForMode(currentTheme.surfaceColor, mode, "surface");
      updates.titleColor = getSmartColorForMode(currentTheme.titleColor, mode, "text");
    }

    // Header Mode Sync: If current page has mode-specific header styles, apply them
    const h = currentPage.header;
    if (h && h.modeStyles) {
      const hTarget = h.modeStyles[mode];
      if (hTarget) {
        updateHeader(hTarget);
      } else {
        // Smart adjust header colors if no snapshot
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


  const handlePageChange = (pageId: string) => {
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId ? { ...p, activePageId: pageId } : p,
      ),
    );
    setSelectedWidgetId(null);
  };

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

  // ── react-grid-layout helpers ─────────────────────────────────────────
  const sane = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);
  const currentRglLayout = useMemo<LayoutItem[]>(() => {
    const raw = rglLayouts[currentPage.id];
    const saved: LayoutItem[] = !raw ? [] : Array.isArray(raw) ? raw : (raw as Record<string, LayoutItem[]>).lg ?? [];
    const savedMap = new Map<string, LayoutItem>(saved.map((l) => [l.i, l]));
    const usePixelGrid = layout.useGrid === false;
    const roundSize = (v: number) => (usePixelGrid ? v : Math.round(v));
    const cols = Math.max(1, layout.columns);

    if (saved.length === 0) return computeInitialLayout(widgets, cols);

    // Some widgets have saved positions, others might not. 
    // We need to keep saved ones and place the rest without overlapping (simple flow).
    let nextX = 0;
    let nextY = 0;
    let maxHInRow = 0;

    // Find the current "bottom" to avoid placing new items on top of old ones if possible
    // simplified: just find max Y + H
    saved.forEach(l => {
      const bottom = (Number(l.y) || 0) + (Number(l.h) || 0);
      if (bottom > nextY) nextY = bottom;
    });

    return widgets.map((w): LayoutItem => {
      const s = savedMap.get(w.id);
      const wVal = sane(roundSize(Number(w.colSpan)), 4);
      const hVal = sane(roundSize(Number(w.rowSpan)), 4);
      
      if (s) {
        return { i: s.i, x: sane(Number(s.x), 0), y: sane(Number(s.y), 0), w: wVal, h: hVal };
      }

      // Fallback for new widgets: Flow positioning
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
  }, [rglLayouts, currentPage.id, widgets, layout.columns, layout.useGrid]);

  const saneNum = (n: number, def: number) => (typeof n === "number" && Number.isFinite(n) ? n : def);
  const handleRglLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      const widgetIds = new Set(widgets.map((w) => w.id));
      const filtered = Array.from(newLayout).filter((l) => widgetIds.has(l.i));
      applyLayoutUpdate((byProject) => ({ ...byProject, [currentPage.id]: filtered }));
      updateCurrentPage({
        widgets: widgets.map((w) => {
          const item = filtered.find((l) => l.i === w.id);
          if (!item) return w;
          return { ...w, colSpan: saneNum(Number(item.w), w.colSpan ?? 4), rowSpan: saneNum(Number(item.h), w.rowSpan ?? 4) };
        }),
      });
    },
    [widgets, currentPage.id, applyLayoutUpdate],
  );

  const handleResponsiveLayoutChange = useCallback(
    (layouts: Record<string, LayoutItem[]>) => {
      const widgetIds = new Set(widgets.map((w) => w.id));
      const filteredLayouts: Record<string, LayoutItem[]> = {};
      for (const bp of Object.keys(layouts)) {
        filteredLayouts[bp] = layouts[bp].filter((l) => widgetIds.has(l.i));
      }
      applyLayoutUpdate((byProject) => ({ ...byProject, [currentPage.id]: filteredLayouts }));
      const lg = filteredLayouts.lg ?? [];
      updateCurrentPage({
        widgets: widgets.map((w) => {
          const item = lg.find((l) => l.i === w.id);
          if (!item) return w;
          return { ...w, colSpan: saneNum(Number(item.w), w.colSpan ?? 4), rowSpan: saneNum(Number(item.h), w.rowSpan ?? 4) };
        }),
      });
    },
    [widgets, currentPage.id, applyLayoutUpdate],
  );

  const responsiveLayoutsForGrid = useMemo(() => {
    if (!layout.useResponsive) return undefined;
    const raw = rglLayouts[currentPage.id];
    if (!raw) return { lg: currentRglLayout, md: currentRglLayout, sm: currentRglLayout, xs: currentRglLayout };
    if (Array.isArray(raw)) return { lg: raw, md: raw, sm: raw, xs: raw };
    const obj = raw as Record<string, LayoutItem[]>;
    return { lg: obj.lg ?? [], md: obj.md ?? [], sm: obj.sm ?? [], xs: obj.xs ?? [] };
  }, [layout.useResponsive, rglLayouts, currentPage.id, currentRglLayout]);
  // ─────────────────────────────────────────────────────────────────────

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
    setIsProjectDropdownOpen(false);
  };

  const confirmDeleteProject = () => {
    if (!deleteProjectId) return;
    if (projects.length <= 1) {
      showToast("마지막 프로젝트는 삭제할 수 없습니다.", "error");
      setDeleteProjectId(null);
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
    setLayoutStore((prev) => {
      const next = { ...prev };
      delete next[deleteProjectId];
      layoutStoreRef.current = next;
      saveLayoutStore(next);
      return next;
    });
    if (activeProjectId === deleteProjectId) {
      const remaining = projects.filter((p) => p.id !== deleteProjectId);
      setActiveProjectId(remaining[0]?.id ?? "project_1");
    }
    setDeleteProjectId(null);
    setIsProjectDropdownOpen(false);
    showToast("프로젝트가 삭제되었습니다.");
  };

  const renameProject = (projectId: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, name: trimmed } : p)),
    );
    setEditingProjectId(null);
    setEditingProjectName("");
  };

  const handleExportClick = () => {
    setIsProjectDropdownOpen(false);
    setCapturingForExport(true);
    setIsPreviewMode(true);
  };

  /** ZIP에서 불러온 프로젝트: 페이지 없음/깨진 activePageId 보정 (흰 화면 방지) */
  const normalizeImportedProject = (project: Project): Project => {
    let pages = Array.isArray(project.pages) ? project.pages : [];
    pages = pages.map((pg) => ({
      ...DEFAULT_PAGE,
      ...pg,
      layout: { ...DEFAULT_PAGE.layout, ...(pg.layout || {}) },
      header: { ...DEFAULT_HEADER, ...(pg.header || {}) },
    }));
    if (pages.length === 0) {
      pages = [{ ...DEFAULT_PAGE, id: "page_1", name: "Main Page" }];
    }
    const activePageId =
      project.activePageId && pages.some((p) => p.id === project.activePageId)
        ? project.activePageId
        : pages[0].id;
    return { ...project, theme: { ...DEFAULT_THEME, ...project.theme }, pages, activePageId };
  };

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsProjectDropdownOpen(false);
    try {
      const { project: importedProject, layoutPositions } = await importProjectFromZip(file);
      const projectToApply = normalizeImportedProject({ ...importedProject, id: activeProjectId });
      const nextProjects = projects.map((p) => (p.id === activeProjectId ? projectToApply : p));
      setProjects(nextProjects);
      setLayoutStore((prev) => {
        const next = { ...prev, [activeProjectId]: layoutPositions };
        layoutStoreRef.current = next;
        saveLayoutStore(next);
        return next;
      });
      await saveProjectsState(nextProjects, activeProjectId);
      showToast("불러오기 완료.");
    } catch (err) {
      console.error(err);
      showToast(err instanceof Error ? err.message : "불러오기 실패", "error");
    }
  };

  const persistActiveProject = async (showNotification = true) => {
    const latestProjects = projectsRef.current;
    const latestLayoutStore = layoutStoreRef.current;
    const savedProjects = await saveProjectsState(latestProjects, activeProjectId);
    await saveLayoutStore(latestLayoutStore);
    if (showNotification) {
      if (savedProjects) {
        showToast("Project configuration saved successfully");
      } else {
        showToast("Failed to save — please check browser storage.", "error");
      }
    }
    return savedProjects;
  };

  const handleProjectSave = async () => {
    if (isEditMode) {
      await persistActiveProject();
      setIsEditMode(false);
      setIsDesignSidebarOpen(false);
      setIsLayoutSidebarOpen(false);
      setSelectedWidgetId(null);
    } else {
      setIsEditMode(true);
    }
  };

  /** 헤더(포지션 등)는 프로젝트 단위: 변경 시 해당 프로젝트의 모든 탭(페이지)에 동일 적용 */
  const updateHeader = (newHeader: Partial<HeaderConfig>) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== activeProjectId) return p;
        const mode = p.theme.mode;

        // 현재 페이지 헤더 기준으로 머지
        const effectivePageId = p.activePageId || p.pages[0]?.id;
        const activePage = p.pages.find(pg => pg.id === effectivePageId) || p.pages[0];
        const baseHeader = activePage?.header || DEFAULT_HEADER;
        const mergedHeader = { ...baseHeader, ...newHeader };

        // 라이트/다크 모드별 색상 스냅샷 업데이트 (하나 바꾸면 다 적용되게)
        // 단, backgroundColor가 transparent면 modeStyles에 저장하지 않음 (나중에 덮어쓰는 버그 방지)
        if (newHeader.textColor || (newHeader.backgroundColor && newHeader.backgroundColor !== 'transparent')) {
          mergedHeader.modeStyles = {
            ...(mergedHeader.modeStyles || {}),
            [mode]: {
              textColor: mergedHeader.textColor,
              backgroundColor: mergedHeader.backgroundColor === 'transparent' ? 'transparent' : mergedHeader.backgroundColor
            }
          };
        }

        return {
          ...p,
          pages: p.pages.map((pg) => ({ ...pg, header: mergedHeader })),
        };
      }),
    );
  };

  const handleExcelUpload = (id: string, newData: any[]) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) {
      updateWidget(id, { data: newData });
      return;
    }

    // Direct Series Overwrite & Data Mapping
    if (newData.length > 0 && widget.config) {
      const cleanRow = (row: any) => {
        const cleaned: any = {};
        Object.keys(row).forEach(k => {
          cleaned[String(k).trim()] = row[k];
        });
        return cleaned;
      };
      
      const cleanedData = newData.map(cleanRow);
      const firstRow = cleanedData[0];
      const excelKeys = Object.keys(firstRow);
      
      const xAxisKey = (widget.config.xAxisKey || 'name').trim();
      let excelXKey = excelKeys.find(k => k.toLowerCase() === xAxisKey.toLowerCase()) || excelKeys[0];

      // Any column that is NOT the X-Axis and has numeric data (or just any other column) becomes a series
      const dataKeys = excelKeys.filter(k => k !== excelXKey);
      
      // Build new series list from scratch based on Excel headers to be safe
      const newSeriesList = dataKeys.map((key, idx) => {
        // Try to preserve existing color if possible, else use palette
        const existing = widget.config?.series?.find(s => s.label.trim() === key || s.key.trim() === key);
        return {
          key: key,
          label: key,
          color: existing?.color || `var(--chart-palette-${(idx % 6) + 1})`
        };
      });

      const normalizedData = cleanedData.map(row => {
        const newRow: any = { [xAxisKey]: row[excelXKey] };
        newSeriesList.forEach(s => {
          newRow[s.key] = row[s.key];
        });
        return newRow;
      });

      updateWidget(id, { 
        data: normalizedData, 
        config: { 
          ...widget.config, 
          xAxisKey: xAxisKey,
          series: newSeriesList 
        } 
      });

      showToast(`Imported ${newSeriesList.length} data series: ${newSeriesList.map(s => s.label).join(', ')}`, "success");
      return;
    }

    updateWidget(id, { data: newData });
  };

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

  return (
    <div
      ref={appRootRef}
      className={`h-screen flex flex-col transition-colors duration-300 overflow-hidden bg-[var(--background)] text-[var(--text-main)] ${theme.mode !== ThemeMode.LIGHT ? "dark" : ""}`}
    >
      <DesignSystem theme={theme} />

      {/* 내보내기 중 로딩 바 (캡처 순간에는 숨겨서 스크린샷에 안 나오게) */}
      {capturingForExport && !hideBarForCapture && (
        <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col bg-[var(--surface)] border-b border-[var(--border-base)] shadow-lg">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-[var(--text-main)]">
              {exportPhase === "waiting" && "내보내기 중… Preview 화면 렌더링 대기"}
              {exportPhase === "capturing" && "내보내기 중… 미리보기 캡처"}
              {exportPhase === "packing" && "내보내기 중… ZIP 파일 생성"}
              {!exportPhase && "내보내기 중…"}
            </span>
          </div>
          <div className="h-1 w-full bg-[var(--border-muted)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary-color)] transition-all duration-500 ease-out"
              style={{
                width:
                  exportPhase === "waiting"
                    ? "33%"
                    : exportPhase === "capturing"
                      ? "66%"
                      : exportPhase === "packing"
                        ? "95%"
                        : "10%",
              }}
            />
          </div>
        </div>
      )}

      {/* Exit Preview — Premium Floating Icon Button */}
      {isPreviewMode && (
        <button
          onClick={() => {
            // Exit preview and ensure theme is consistent
            setIsPreviewMode(false);
            // If the user toggled the mode in preview, make sure the project theme reflects it fully
            const currentMode = theme.mode;
            const currentName = theme.name;
            updateProjectTheme({ 
               mode: currentMode,
               name: currentMode === ThemeMode.DARK ? "Dark Mode" : currentMode === ThemeMode.LIGHT ? "Light Mode" : currentName 
            });
          }}
          className="fixed z-[100] flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-95 shadow-premium group border-2 border-[var(--primary-color)]"
          style={{ 
            bottom: 'var(--spacing-xl)', 
            right: 'var(--spacing-xl)',
            width: 'var(--ai-fab-size)',
            height: 'var(--ai-fab-size)',
            backgroundColor: 'var(--gnb-bg)',
            backdropFilter: 'blur(24px)',
            borderRadius: '9999px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.3), 0 0 20px var(--primary-color-20)',
          }}
          title="Exit Preview"
        >
          <div className="absolute inset-0 bg-[var(--primary-color)]/5 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300" />
          <EyeOff 
            className="w-7 h-7 text-[var(--primary-color)] drop-shadow-md" 
          />
        </button>
      )}

      {/* Floating GNB Capsule (Triggered by AI FAB) */}
      {!isPreviewMode && (
        <div 
          className={`fixed z-[99] transition-all duration-500 flex items-center ${isFloatingGnbOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}
          style={{ 
            bottom: 'var(--spacing-xl)', 
            right: 'calc(var(--ai-fab-size) + var(--spacing-xl) + var(--spacing-md))',
            height: 'var(--ai-fab-size)',
            backgroundColor: 'var(--gnb-bg)',
            backdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            padding: '0 24px',
            border: '1px solid var(--border-base)',
            boxShadow: 'var(--shadow-premium), 0 10px 40px rgba(0,0,0,0.2)',
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <img 
                src={theme.mode === ThemeMode.DARK ? logoW : logoB} 
                className="h-7 w-auto object-contain" 
                alt="STN Logo" 
              />
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsProjectDropdownOpen(!isProjectDropdownOpen)
                    }
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="uppercase font-bold transition-colors whitespace-nowrap" style={{ fontSize: 'var(--text-caption)', color: theme.titleColor }}>
                      {currentProject.name}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""} text-muted`}
                    />
                  </button>

                  {isProjectDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProjectDropdownOpen(false)}
                      />
                      <div
                        className="absolute bottom-full left-0 mb-4 w-64 p-2 shadow-premium z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 floating-panel-glow"
                        style={{ borderRadius: 'var(--radius-panel)' }}
                      >
                        <div className="px-3 py-2 mb-1 border-b border-[var(--border-muted)]">
                          <p className="uppercase font-bold text-muted tracking-widest" style={{ fontSize: 'var(--text-caption)' }}>
                            Select Project
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {projects.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center group/proj gap-2 w-full px-4 py-2.5 mb-1 rounded-sm border transition-colors ${activeProjectId === p.id ? "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/30" : "border-transparent hover:bg-[var(--border-muted)]/50"}`}
                            >
                              {editingProjectId === p.id ? (
                                <div className="flex-1 flex items-center gap-2 min-w-0">
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingProjectName}
                                    onChange={(e) => setEditingProjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") renameProject(p.id, editingProjectName);
                                      if (e.key === "Escape") setEditingProjectId(null);
                                    }}
                                    onBlur={() => renameProject(p.id, editingProjectName)}
                                    className="flex-1 min-w-0 bg-transparent border-b border-[var(--primary-color)] text-xs font-bold outline-none uppercase tracking-tight text-[var(--text-main)] w-full"
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveProjectId(p.id);
                                    setIsProjectDropdownOpen(false);
                                  }}
                                  className="flex-1 min-w-0 text-left"
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-xs uppercase tracking-tight truncate">
                                      {p.name}
                                    </p>
                                  </div>
                                </button>
                              )}
                              
                              <div className="hidden group-hover/proj:flex items-center gap-1 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingProjectId(p.id);
                                    setEditingProjectName(p.name);
                                  }}
                                  className="p-1 text-muted hover:text-[var(--primary-color)] transition-colors inline-block"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteProjectId(p.id);
                                  }}
                                  className="p-1 text-muted hover:text-[var(--error)] transition-colors inline-block"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {activeProjectId === p.id && editingProjectId !== p.id && (
                                <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--primary-color)] group-hover/proj:hidden" />
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="p-1 mt-1 border-t border-[var(--border-muted)] space-y-1">
                          <button
                            onClick={handleExportClick}
                            disabled={capturingForExport}
                            className="btn-base btn-ghost w-full px-4 py-2.5 rounded-sm flex items-center justify-center gap-2"
                          >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span className="font-bold uppercase" style={{ fontSize: 'var(--text-caption)' }}>
                              Export
                            </span>
                          </button>
                          <button
                            onClick={() => importInputRef.current?.click()}
                            className="btn-base btn-ghost w-full px-4 py-2.5 rounded-sm flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            <span className="font-bold uppercase" style={{ fontSize: 'var(--text-caption)' }}>
                              Import
                            </span>
                          </button>
                          <button
                            onClick={addProject}
                            className="btn-base btn-ghost w-full px-4 py-2.5 text-primary rounded-sm"
                          >
                            <Plus className="w-4 h-4" />{" "}
                            <span className="font-bold uppercase" style={{ fontSize: 'var(--text-caption)' }}>
                              New Project
                            </span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-[var(--border-base)] mx-4" />

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                className={`btn-base btn-surface h-10 px-4 rounded-full ${isLibraryDropdownOpen ? "active" : ""}`}
                style={{ backgroundColor: isLibraryDropdownOpen ? undefined : 'var(--gnb-btn-bg)' }}
              >
                <div
                  className="icon-box w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `color-mix(in srgb, var(${currentLibrary.colorVar}) 12%, transparent)`, color: `var(${currentLibrary.colorVar})` }}
                >
                  <currentLibrary.icon
                    className="w-3.5 h-3.5"
                  />
                </div>
                <span className="text-xs font-bold">{currentLibrary.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isLibraryDropdownOpen ? 'rotate-180' : ''} text-muted/60 group-hover:text-primary`} />
              </button>

              {isLibraryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLibraryDropdownOpen(false)}
                  />
                  <div
                    className="absolute bottom-full right-0 mb-4 w-52 p-2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 floating-panel-glow shadow-premium"
                    style={{ borderRadius: 'var(--radius-panel)' }}
                  >
                    {libraryOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleThemeChange({
                            ...theme,
                            chartLibrary: opt.value as ChartLibrary,
                          });
                          setIsLibraryDropdownOpen(false);
                        }}
                        className={`w-full justify-between px-3 py-2.5 flex items-center transition-all btn-base btn-ghost rounded-sm ${theme.chartLibrary === opt.value ? "active" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <opt.icon className="w-4 h-4" style={{ color: `var(${opt.colorVar})` }} />
                          <span className="font-bold text-xs uppercase tracking-tight">{opt.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleToggleDesignSidebar}
              className={`btn-base btn-surface h-10 px-4 rounded-full ${isDesignSidebarOpen ? "active" : ""}`}
              style={{ backgroundColor: isDesignSidebarOpen ? undefined : 'var(--gnb-btn-bg)' }}
            >
              <Palette className="w-4 h-4" /> <span className="text-xs">Design</span>
            </button>
            <button
              onClick={handleOpenLayoutSidebar}
              className={`btn-base btn-surface h-10 px-4 rounded-full ${isLayoutSidebarOpen ? "active" : ""}`}
              style={{ backgroundColor: isLayoutSidebarOpen ? undefined : 'var(--gnb-btn-bg)' }}
            >
              <LayoutGrid className="w-4 h-4" /> <span className="text-xs">Layout</span>
            </button>
            <button
              onClick={handleProjectSave}
              className={`btn-base btn-surface h-10 px-4 rounded-full ${isEditMode ? "active" : ""}`}
              style={{ backgroundColor: isEditMode ? undefined : 'var(--gnb-btn-bg)' }}
            >
              <Edit3 className="w-4 h-4" /> <span className="text-xs">Edit</span>
            </button>
            <button
              disabled={isEditMode}
              onClick={() => {
                setIsPreviewMode(true);
                setIsFloatingGnbOpen(false);
              }}
              className={`btn-base btn-surface h-10 px-4 rounded-full ${isEditMode ? "opacity-40 grayscale pointer-events-none" : ""}`}
              style={{ backgroundColor: 'var(--gnb-btn-bg)' }}
            >
              <Eye className="w-4 h-4" /> <span className="text-xs">Preview</span>
            </button>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={importInputRef}
        onChange={handleImportChange}
        style={{ display: "none" }}
        accept=".zip"
      />

      {/* Main Workspace — sidebars are OUTSIDE the project theme scope now */}
      <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${showUnifiedBg ? 'bg-transparent' : 'bg-[var(--background)]'} text-[var(--text-main)]`}>
        {/* Unified Page Background (Image or Globe) — now placed here to cover both header and main content */}
        {showUnifiedBg && (
          <div
            key={layout?.backgroundGlobe ? 'bg-globe' : 'bg-image'}
            className={`absolute inset-0 z-0 overflow-hidden fade-in pointer-events-auto ${layout?.backgroundAnimation ? 'animate-pulse' : ''}`}
            aria-hidden
            onWheel={layout?.backgroundGlobe ? (e) => {
              const main = mainAreaRef.current;
              if (main) {
                main.scrollTop += e.deltaY;
                e.preventDefault();
              }
            } : undefined}
          >
            {layout?.backgroundGlobe ? <GlobeBackground mode={theme.mode} /> : null}
            {pageBgUrl && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${pageBgUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            )}
          </div>
        )}

        {/* Left Side Header (if positioned LEFT) */}
        {header.show && header.position === HeaderPosition.LEFT && (
          <aside
            style={{
              width: `${header.width}px`,
              backgroundColor: (theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage)) ? 'transparent' : (header.backgroundColor === 'transparent' || (showUnifiedBg && header.backgroundColor === 'var(--background)') ? 'transparent' : header.backgroundColor),
              color: header.textColor,
              padding: `${header.padding}px`,
              margin: `${header.margin}px`,
              position: 'relative',
              overflow: 'visible',
            }}
            className={`flex flex-col transition-all h-full shrink-0 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false && header.backgroundColor !== "transparent" ? "border-r border-[var(--border-base)]" : ""}`}
          >
            {(() => {
              const hBg = theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage);
              if (!hBg) return null;
              return (
                <div 
                  className="absolute inset-0 z-0 pointer-events-none"
                  style={{
                    backgroundImage: `url(${hBg})`,
                    backgroundPosition: 'top left',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    width: '200%',
                    height: '100%',
                  }}
                />
              );
            })()}
            <HeaderWidgetLayer
              header={header}
              isEditMode={isEditMode}
              onUpdate={updateHeader}
              theme={theme}
              onModeSwitch={handleModeSwitch}
              isPreviewMode={isPreviewMode}
            />
            <div
              className={`mb-8 flex flex-col items-${header.textAlignment === TextAlignment.CENTER ? "center" : header.textAlignment === TextAlignment.RIGHT ? "end" : "start"} ${header.textAlignment === TextAlignment.CENTER ? "text-center" : header.textAlignment === TextAlignment.RIGHT ? "text-right" : "text-left"}`}
            >
              {header.logo && (
                <img
                  src={header.logo}
                  alt="Logo"
                  className="h-8 w-auto mb-4 object-contain"
                />
              )}
              <h2 className="font-black tracking-tighter uppercase" style={{ fontSize: header.headerTitleSize ? `${header.headerTitleSize}px` : `${DEFAULT_HEADER.headerTitleSize}px` }}>
                {header.title}
              </h2>
            </div>


          </aside>
        )}

        {/* Central Area: Dashboard grid (ref for export preview capture). 지구 배경 시 pointer-events-none으로 빈 공간 클릭이 지구로 전달되게 함 */}
        <div
          ref={(el) => {
            // @ts-ignore
            projectScopeRef.current = el;
            // @ts-ignore
            exportPreviewRef.current = el;
          }}
          className={`flex-1 flex flex-col relative text-[var(--text-main)] transition-colors duration-300 ${
            showUnifiedBg ? "bg-transparent" : "bg-[var(--background)]"
          } ${layout?.backgroundGlobe ? "pointer-events-none" : ""}`}
        >
            {/* Top Header (if positioned TOP) */}
            {header.show && header.position === HeaderPosition.TOP && (
              <header
                style={{
                  height: `${header.height}px`,
                  backgroundColor: (theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage)) ? 'transparent' : (header.backgroundColor === 'transparent' || (showUnifiedBg && header.backgroundColor === 'var(--background)') ? 'transparent' : header.backgroundColor),
                  color: header.textColor,
                  padding: `0 ${header.padding}px`,
                  margin: `${header.margin}px`,
                  position: 'relative',
                  overflow: 'visible',
                }}
                className={`flex items-center transition-all shrink-0 z-30 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false && header.backgroundColor !== "transparent" ? "border-b border-[var(--border-base)]" : ""} ${layout?.backgroundGlobe ? "pointer-events-auto" : ""}`}
              >
                {(() => {
                  const hBg = theme.mode === ThemeMode.LIGHT ? (header.backgroundImageLight || header.backgroundImage) : (header.backgroundImageDark || header.backgroundImage);
                  if (!hBg) return null;
                  return (
                    <img 
                      src={hBg}
                      className="absolute top-0 left-0 w-full h-auto z-0 pointer-events-none"
                      alt="Header Background"
                    />
                  );
                })()}
                <HeaderWidgetLayer
                  header={header}
                  isEditMode={isEditMode}
                  onUpdate={updateHeader}
                  theme={theme}
                  onModeSwitch={handleModeSwitch}
                  isPreviewMode={isPreviewMode}
                />
                <div
                  className={`flex items-center gap-8 w-full relative ${header.textAlignment === TextAlignment.CENTER
                    ? "justify-between"
                    : header.textAlignment === TextAlignment.RIGHT
                      ? "flex-row-reverse"
                      : "justify-between"
                    }`}
                >
                  {/* Title & Toggle Section */}
                  <div
                    className={`flex items-center gap-6 ${header.textAlignment === TextAlignment.RIGHT ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`flex items-center gap-3 ${header.textAlignment === TextAlignment.CENTER
                        ? "absolute left-1/2 -translate-x-1/2 px-4"
                        : ""
                        } ${header.textAlignment === TextAlignment.RIGHT ? "flex-row-reverse" : ""}`}
                    >
                      {/* Logo removed as requested to restore layout */}

                      <h2 
                        className="font-black tracking-tighter whitespace-nowrap"
                        style={{ 
                          fontSize: header.headerTitleSize ? `${header.headerTitleSize}px` : `${DEFAULT_HEADER.headerTitleSize}px`,
                          color: theme.mode === ThemeMode.LIGHT ? (header.textColorLight || header.textColor) : (header.textColorDark || header.textColor) 
                        }}
                      >
                        {header.title}
                      </h2>
                    </div>
                  </div>


                </div>
              </header>
            )}

            {/* Widgets Grid Container — 배경만 플리커, 위젯은 고정. backgroundGlobe 시 지구 배경 + 마우스 드래그 회전 */}
            <main
              ref={mainAreaRef}
              className={`flex-1 relative custom-scrollbar transition-all ${layout.fitToScreen ? "h-full overflow-hidden" : "overflow-y-auto"} ${layout?.backgroundGlobe ? "globe-background-active pointer-events-none" : ""}`}
              style={layout?.glassmorphism ? (() => {
                const p = (layout.glassmorphismOpacity ?? (theme.mode === ThemeMode.DARK ? 35 : 55)) / 100;
                const alpha = Math.pow(p, 0.72);
                const blurPx = Math.round(alpha * 12);
                return {
                  ['--glass-opacity' as string]: String(alpha),
                  ['--glass-bg' as string]: `rgba(var(--glass-bg-rgb), ${alpha})`,
                  ['--glass-blur' as string]: `${blurPx}px`,
                };
              })() : undefined}
            >
              <div className={`relative z-10 h-full min-h-0 ${layout?.backgroundGlobe ? "pointer-events-none" : ""}`}>
                <DashboardGrid
                  layout={layout}
                  theme={theme}
                  widgets={widgets}
                  currentRglLayout={currentRglLayout}
                  mainAreaHeight={mainAreaHeight}
                  isEditMode={isEditMode}
                  selectedWidgetId={selectedWidgetId}
                  onLayoutChange={handleRglLayoutChange}
                  responsiveLayouts={responsiveLayoutsForGrid}
                  onResponsiveLayoutChange={handleResponsiveLayoutChange}
                  onWidgetSelect={handleWidgetSelect}
                  onUpdateWidget={updateWidget}
                  onDeleteWidget={deleteWidget}
                  onOpenExcel={(id) => setExcelWidgetId(id)}
                  onOpenWidgetPicker={handleOpenWidgetPicker}
                />
              </div>
            </main>
          </div>

        {/* 3. Floating Panel (Design or Settings) */}
        {showSidebar && (
          <div 
            className={`fixed z-50 transition-[transform,opacity,shadow] duration-200 ${isDraggingPanel ? 'transition-none pointer-events-none' : ''}`}
            style={{ 
              top: `${panelPos.y}px`, 
              right: `${panelPos.x}px`,
              width: 'var(--panel-width)',
              cursor: isDraggingPanel ? 'move' : 'default'
            }}
          >
            <div className={`pointer-events-auto overflow-hidden shadow-2xl floating-panel-glow`} style={{ borderRadius: 'var(--radius-panel)' }}>
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
                  onDragStart={handleDragStart}
                  onSave={() => persistActiveProject()}
                />
              ) : selectedWidgetId ? (
                <Sidebar
                  theme={theme}
                  selectedWidget={(() => {
                    const w = widgets.find((w) => w.id === selectedWidgetId) || null;
                    if (!w) return null;
                    return { ...w, colSpan: saneNum(Number(w.colSpan), 4), rowSpan: saneNum(Number(w.rowSpan), 4) };
                  })()}
                  layout={layout}
                  onUpdateWidget={updateWidget}
                  onUpdateLayout={handleUpdateLayout}
                  onUpdateTheme={handleThemeChange}
                  onBatchUpdateWidgets={(updates) => {
                    updateCurrentPage({
                      widgets: widgets.map((w) => ({ ...w, ...updates })),
                    });
                    showToast("모든 위젯에 설정이 적용되었습니다.");
                  }}
                  onClose={() => setSelectedWidgetId(null)}
                  onDragStart={handleDragStart}
                  onSave={() => persistActiveProject()}
                />
              ) : isLayoutSidebarOpen ? (
                <Sidebar
                  theme={theme}
                  selectedWidget={null}
                  layout={layout}
                  onUpdateWidget={updateWidget}
                  onUpdateLayout={handleUpdateLayout}
                  onUpdateTheme={handleThemeChange}
                  onBatchUpdateWidgets={(updates) => {
                    updateCurrentPage({
                      widgets: widgets.map((w) => ({ ...w, ...updates })),
                    });
                    showToast("모든 위젯에 설정이 적용되었습니다.");
                  }}
                  onClose={() => setIsLayoutSidebarOpen(false)}
                  onDragStart={handleDragStart}
                  onSave={() => persistActiveProject()}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Excel Integration Modal */}
      <ExcelModal
        isOpen={excelWidgetId !== null}
        onClose={() => setExcelWidgetId(null)}
        widget={widgets.find((w) => w.id === excelWidgetId) || null}
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
      <ConfirmModal
        isOpen={deleteProjectId !== null}
        title="프로젝트 삭제"
        message="이 프로젝트를 정말로 삭제하시겠습니까? 삭제된 프로젝트와 위젯은 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectId(null)}
        isDark={theme.mode === ThemeMode.DARK}
      />

      {/* 패널 전환 저장 확인 모달 */}
      <ConfirmModal
        isOpen={pendingPanelSwitch !== null}
        title="변경 사항 저장"
        message="다른 패널로 전환하기 전에 지금까지의 변경 사항을 저장하시겠습니까?"
        confirmText="저장 후 전환"
        cancelText="그냥 전환"
        onConfirm={async () => {
          await persistActiveProject();
          if (pendingPanelSwitch === 'design') {
            setIsDesignSidebarOpen(true);
            setIsLayoutSidebarOpen(false);
          } else if (pendingPanelSwitch === 'layout') {
            setIsLayoutSidebarOpen(true);
            setIsDesignSidebarOpen(false);
          }
          setPendingPanelSwitch(null);
          setSelectedWidgetId(null);
        }}
        onCancel={() => {
          if (pendingPanelSwitch === 'design') {
            setIsDesignSidebarOpen(true);
            setIsLayoutSidebarOpen(false);
          } else if (pendingPanelSwitch === 'layout') {
            setIsLayoutSidebarOpen(true);
            setIsDesignSidebarOpen(false);
          }
          setPendingPanelSwitch(null);
          setSelectedWidgetId(null);
        }}
        isDark={theme.mode === ThemeMode.DARK}
      />
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 bg-[var(--surface)] border border-[var(--border-base)] shadow-premium rounded min-w-[var(--panel-min-width)]">
            <div
              className="w-10 h-10 rounded-sm flex items-center justify-center"
              style={toast.type === "success" ? { backgroundColor: 'color-mix(in srgb, var(--success) 10%, transparent)', color: 'var(--success)' } : { backgroundColor: 'var(--action-danger-hover-bg)', color: 'var(--error)' }}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="uppercase font-bold text-muted tracking-widest mb-0.5" style={{ fontSize: 'var(--text-caption)' }}>
                System Notification
              </p>
              <p className="text-sm font-bold text-main">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 rotate-45 text-muted" />
            </button>
          </div>
        </div>
      )}

      {isDesignDocsOpen && (
        <DesignDocs theme={theme} onClose={() => setIsDesignDocsOpen(false)} />
      )}

      <WidgetPicker
        isOpen={isWidgetPickerOpen}
        onClose={() => setIsWidgetPickerOpen(false)}
        onSelect={addWidgetWithType}
        isDark={theme.mode === 'dark'}
      />

      {!isPreviewMode && (
        <FloatingAssistantButton onClick={() => setIsFloatingGnbOpen(!isFloatingGnbOpen)} />
      )}
    </div>
  );
};

export default App;
