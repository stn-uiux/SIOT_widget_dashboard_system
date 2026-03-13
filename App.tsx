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
import { dbSave, dbLoad } from "./lib/storage";
import { exportProjectToZip, importProjectFromZip } from "./lib/exportImport";

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

/** 동기 로드 — 앱 최초 렌더 시 localStorage에서 빠르게 불러옴 (legacy 호환) */
function loadProjectsStateSync(initial: Project[]): ProjectsState {
  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) return { projects: initial, activeProjectId: initial[0]?.id ?? "project_1" };
    const parsed = JSON.parse(raw) as ProjectsState;
    if (!parsed?.projects?.length || !Array.isArray(parsed.projects))
      return { projects: initial, activeProjectId: initial[0]?.id ?? "project_1" };
    const id = parsed.activeProjectId && parsed.projects.some((p: Project) => p.id === parsed.activeProjectId)
      ? parsed.activeProjectId
      : parsed.projects[0].id;

    // ── 스키마 마이그레이션: 저장된 데이터에 없는 새 필드를 기본값으로 채움 ──
    // 이렇게 하면 새 테마 필드 추가 시 저장된 데이터가 undefined로 남아 리셋되는 현상을 방지
    const migratedProjects: Project[] = parsed.projects.map((p) => ({
      ...p,
      theme: { ...DEFAULT_THEME, ...p.theme },
      pages: (p.pages || []).map((pg) => ({
        ...pg,
        // 레이아웃: DEFAULT_PAGE.layout를 base로 하고, 저장된 값을 덮어씀
        layout: { ...DEFAULT_PAGE.layout, ...(pg.layout || {}) },
        // 헤더: DEFAULT_HEADER를 base로 하고, 저장된 값을 덮어씀
        header: { ...DEFAULT_HEADER, ...(pg.header || {}) },
      })),
    }));

    return { projects: migratedProjects, activeProjectId: id };
  } catch {
    return { projects: initial, activeProjectId: initial[0]?.id ?? "project_1" };
  }
}

/** 비동기 저장 — IndexedDB (용량 제한 없음) */
async function saveProjectsState(projects: Project[], activeProjectId: string): Promise<boolean> {
  const ok = await dbSave(PROJECTS_STORAGE_KEY, { projects, activeProjectId });
  if (!ok) console.error("[SIOT] Failed to save project state to IndexedDB");
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
  return (
    <div
      className="h-full min-h-0"
      style={{ padding: "var(--dashboard-padding)", background: hasLayoutBackground ? "transparent" : "var(--background)" }}
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
              maxWidth: "800px",
              minHeight: "320px",
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
            const colAlpha = 0.05; // 5% 투명도
            const rowAlpha = 0.05;
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
                    `<rect x='${c.x}' y='0' width='${c.width}' height='${totalH}' fill='rgba(255,255,255,${colAlpha})'/>`,
                )
                .join(""),
              rows
                .map(
                  (r) =>
                    `<rect x='0' y='${r.y}' width='${gridWidth}' height='${r.height}' fill='rgba(255,255,255,${rowAlpha})'/>`,
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
                    className={`h-full relative ${isThisInteracting ? "" : "transition-[background,border,box-shadow,transform] duration-200"} ${selectedWidgetId === widget.id || isThisInteracting ? "widget-selected" : ""}`}
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
                          <span className="text-[10px] font-bold text-white/90 font-mono tracking-tighter leading-none">
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
                        className={`h-full relative ${isThisInteracting ? "" : "transition-[background,border,box-shadow,transform] duration-200"} ${selectedWidgetId === widget.id || isThisInteracting ? "widget-selected" : ""}`}
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
                            <span className="text-[10px] font-bold text-white/90 font-mono tracking-tighter leading-none">
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
                    shadow-[0_20px_50px_rgba(0,0,0,0.3)]
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

                  {/* Cyber Sparkle (if cyber mode) */}
                  {theme.mode === ThemeMode.CYBER && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                      <div className="absolute bottom-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    </div>
                  )}
                </button>

                {/* Subtle outer glow */}
                <div className="absolute -inset-1 bg-primary/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
              
              {/* Hint under the button */}
              <div className="mt-3 px-3 py-1 rounded-full bg-black/20 backdrop-blur-sm border border-white/5 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
                <span className="text-[9px] text-white/70 uppercase tracking-widest font-bold">Pick analysis component</span>
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
  isCyber?: boolean;
  isDark?: boolean;
  primaryColor?: string;
}> = ({ isCyber, isDark, primaryColor = "#3b82f6" }) => {
  const color = isCyber ? "#00e5ff" : primaryColor;
  const isLight = !isCyber && !isDark;
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
              stopColor={
                isCyber ? "var(--primary-90)" : "var(--secondary-color)"
              }
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
        <g className={isCyber ? "animate-pulse" : ""}>
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
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16) / 255;
    g = parseInt(hex[2] + hex[2], 16) / 255;
    b = parseInt(hex[3] + hex[3], 16) / 255;
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16) / 255;
    g = parseInt(hex.substring(3, 5), 16) / 255;
    b = parseInt(hex.substring(5, 7), 16) / 255;
  }
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
  const toHex = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
};

const getSmartColorForMode = (
  hex: string,
  mode: ThemeMode,
  type: "bg" | "surface" | "text",
): string => {
  const { h, s, l } = hexToHsl(hex);
  if (mode === ThemeMode.DARK || mode === ThemeMode.CYBER) {
    const isCyber = mode === ThemeMode.CYBER;
    if (type === "bg") return hslToHex(h, Math.min(s, isCyber ? 40 : 20), isCyber ? 2 : 5); 
    if (type === "surface") return hslToHex(h, Math.min(s, isCyber ? 35 : 15), isCyber ? 6 : 12); 
    return hslToHex(h, Math.min(s, 10), 90); 
  } else {
    if (type === "bg") return "#ffffff"; 
    if (type === "surface") return "#ffffff"; 
    return "#1e293b"; 
  }
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
        <span className="text-[8px] font-bold opacity-70 uppercase">{day}</span>
        <span className="text-[9px] font-black">{datePart?.replace(/\//g, "-")}</span>
      </div>
    </div>
  );
};

const HeaderMonitor = () => (
  <div className="w-full h-full flex items-center justify-center gap-2 px-3 py-1 bg-white dark:bg-[var(--surface-elevated)] border border-[var(--border-base)] dark:border-white/5 shadow-sm rounded-full text-[var(--text-main)] whitespace-nowrap overflow-hidden">
    <span className="text-[10px] font-bold tracking-tight uppercase">시스템 감시</span>
    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)] shrink-0" />
  </div>
);

const HeaderImage = ({ url }: { url?: string }) => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden">
    {url ? (
      <img src={url} alt="Header Widget" className="max-w-full max-h-full object-contain" />
    ) : (
      <div className="text-[10px] font-bold text-muted uppercase">No Image</div>
    )}
  </div>
);

const HeaderLogo = ({ url }: { url?: string }) => (
  <div className="w-full h-full flex items-center justify-center overflow-hidden">
    {url ? (
      <img src={url} alt="Logo" className="max-w-full max-h-full object-contain" />
    ) : (
      <div className="text-[10px] font-bold text-muted uppercase">No Logo</div>
    )}
  </div>
);

const HeaderThemeToggle = ({
  mode,
  onSwitch,
}: {
  mode: ThemeMode;
  onSwitch: (m: ThemeMode) => void;
}) => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ModeToggle mode={mode} onChange={onSwitch} />
    </div>
  );
};

interface HeaderWidgetLayerProps {
  header: HeaderConfig;
  isEditMode: boolean;
  onUpdate: (updates: Partial<HeaderConfig>) => void;
  theme: DashboardTheme;
  onModeSwitch: (m: ThemeMode) => void;
}

const HeaderWidgetLayer: React.FC<HeaderWidgetLayerProps> = ({
  header,
  isEditMode,
  onUpdate,
  theme,
  onModeSwitch,
}) => {
  const isCyber = theme.mode === ThemeMode.CYBER;
  const widgets = header.widgets || [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // 헤더 실제 컨테이너 너비 사용 (edit 모드에서 사이드바 열림 여부와 무관하게 동일 레이아웃 유지)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0]?.contentRect ?? {};
      if (typeof width === "number" && width > 0) setContainerWidth(width);
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
      className={`absolute inset-0 z-20 ${isEditMode ? "pointer-events-auto" : "pointer-events-none"}`}
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
          <div key={w.id} className="relative group flex items-stretch">
            {w.type === HeaderWidgetType.CLOCK && <HeaderClock />}
            {w.type === HeaderWidgetType.MONITOR && <HeaderMonitor />}
            {w.type === HeaderWidgetType.THEME_TOGGLE && (
              <HeaderThemeToggle
                mode={theme.mode}
                onSwitch={onModeSwitch}
              />
            )}
            {w.type === HeaderWidgetType.IMAGE && <HeaderImage url={w.url} />}
            {w.type === HeaderWidgetType.LOGO && <HeaderLogo url={w.url} />}
            {isEditMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ widgets: widgets.filter(v => v.id !== w.id) });
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors z-30"
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

const App: React.FC = () => {
  // Navigation & Project State (저장된 값이 있으면 새로고침 후에도 유지)
  const [projects, setProjects] = useState<Project[]>(() => getInitialProjectsState().projects);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    () => getInitialProjectsState().activeProjectId,
  );

  const currentProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];
  const currentPage =
    currentProject.pages.find((p) => p.id === currentProject.activePageId) ||
    currentProject.pages[0];

  const [isEditMode, setIsEditMode] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDesignSidebarOpen, setIsDesignSidebarOpen] = useState(false);
  const [isLayoutSidebarOpen, setIsLayoutSidebarOpen] = useState(false);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(null);

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
      if (typeof height === "number" && height > 0) setMainAreaHeight(height);
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

  const [panelPos, setPanelPos] = useState({ x: 20, y: 100 });
  const [isDraggingPanel, setIsDraggingPanel] = useState(false);
  const dragStartOffset = useRef({ x: 0, y: 0 });

  const handleDragStart = (e: React.MouseEvent) => {
    setIsDraggingPanel(true);
    dragStartOffset.current = {
      x: e.clientX + panelPos.x, // right position
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

  // ── IndexedDB hydration (최초 마운트 시 비동기 로드) ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 프로젝트 데이터
      const saved = await dbLoad<ProjectsState>(PROJECTS_STORAGE_KEY);
      if (!cancelled && saved?.projects?.length) {
        // 스키마 마이그레이션: IndexedDB 데이터도 새 필드 누락 방지
        const migratedProjects: Project[] = saved.projects.map((p) => ({
          ...p,
          theme: { ...DEFAULT_THEME, ...p.theme },
          pages: (p.pages || []).map((pg) => ({
            ...pg,
            layout: { ...DEFAULT_PAGE.layout, ...(pg.layout || {}) },
            header: { ...DEFAULT_HEADER, ...(pg.header || {}) },
          })),
        }));
        setProjects(migratedProjects);
        if (saved.activeProjectId) setActiveProjectId(saved.activeProjectId);
      }
      // 레이아웃 데이터
      const savedLayout = await dbLoad<LayoutStore>(LAYOUT_STORAGE_KEY);
      if (!cancelled && savedLayout && typeof savedLayout === "object") {
        setLayoutStore(savedLayout);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Shortcuts to current state for components
  const { theme } = currentProject;
  const { widgets, layout, header: pageHeader } = currentPage;
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
    };

    // Explicitly update RGL layout to place new widget at bottom
    applyLayoutUpdate((byProject) => {
      const cur = byProject[currentPage.id];
      const newItem = { i: newId, x: 0, y: bottomY, w: 4, h: 10 } as LayoutItem;
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
    setIsDesignSidebarOpen(!isDesignSidebarOpen);
    setSelectedWidgetId(null);
  };

  const [presets, setPresets] = useState<ThemePreset[]>(() => loadPresetsSync(THEME_PRESETS));

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
    const isDefaultModePreset = preset.name === "Light Mode" || preset.name === "Dark Mode" || preset.name === "Cyber Mode";
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
    if (saved.length === 0)
      return computeInitialLayout(widgets, cols);
    return widgets.map((w): LayoutItem => {
      const s = savedMap.get(w.id);
      const wVal = sane(roundSize(Number(w.colSpan)), 4);
      const hVal = sane(roundSize(Number(w.rowSpan)), 4);
      const xVal = s ? sane(Number(s.x), 0) : 0;
      const yVal = s ? sane(Number(s.y), 0) : 0;
      if (s) return { i: s.i, x: xVal, y: yVal, w: wVal, h: hVal };
      return { i: w.id, x: 0, y: 0, w: wVal, h: hVal };
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

  const handleImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setIsProjectDropdownOpen(false);
    try {
      const { project: importedProject, layoutPositions } = await importProjectFromZip(file);
      const projectToApply = { ...importedProject, id: activeProjectId };
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
        // 현재 활성 페이지의 헤더를 기준으로 병합 (없으면 DEFAULT_HEADER fallback)
        const effectivePageId = p.activePageId || p.pages[0]?.id;
        const activePage = p.pages.find(pg => pg.id === effectivePageId) || p.pages[0];
        const baseHeader = activePage?.header || DEFAULT_HEADER;
        const mergedHeader = { ...baseHeader, ...newHeader };
        return {
          ...p,
          pages: p.pages.map((pg) => ({ ...pg, header: mergedHeader })),
        };
      }),
    );
  };

  const handleExcelUpload = (id: string, newData: any[]) => {
    updateWidget(id, { data: newData });
  };

  const showSidebar =
    !isPreviewMode &&
    (isLayoutSidebarOpen || isDesignSidebarOpen || selectedWidgetId !== null);

  const libraryOptions = [
    {
      value: ChartLibrary.RECHARTS,
      label: "Recharts",
      icon: BarChart3,
      color: "#3b82f6",
    },
    {
      value: ChartLibrary.APEXCHARTS,
      label: "ApexCharts",
      icon: TrendingUp,
      color: "#10b981",
    },
    {
      value: ChartLibrary.AMCHARTS,
      label: "amCharts",
      icon: Activity,
      color: "#8b5cf6",
    },
  ];

  const currentLibrary =
    libraryOptions.find((opt) => opt.value === theme.chartLibrary) ||
    libraryOptions[0];

  const isCyber = theme.mode === ThemeMode.CYBER;

  return (
    <div
      ref={appRootRef}
      className={`h-screen flex flex-col transition-colors duration-300 overflow-hidden ${
        theme.mode === ThemeMode.LIGHT 
          ? "bg-[#f1f5f9] text-[#1e293b]" 
          : "bg-[#020617] text-[#f8fafc] dark"
      }`}
    >
      <DesignSystem theme={theme} targetRef={projectScopeRef} />
      {isCyber && <div className="cyber-hud-line" />}

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

      {!isPreviewMode && (
        <header
          className={`z-50 px-6 py-3 flex items-center justify-between shrink-0 transition-all duration-500 border-b backdrop-blur-md ${
            theme.mode === ThemeMode.LIGHT
              ? "bg-white/80 border-gray-200"
              : "bg-[#0f172a]/80 border-[#1e293b]"
          }`}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <IsometricLogo
                isCyber={false}
                isDark={true}
                primaryColor={theme.primaryColor}
              />
              <div>
                <h1
                  className={`font-bold leading-tight flex items-center ${isCyber ? "text-[var(--primary-color)] neon-glow uppercase tracking-widest italic" : "text-main"}`}
                >
                  {isCyber ? (
                    <span>STN INFOTECH CORE</span>
                  ) : (
                    <>
                      STN infotech{" "}
                      <span className="badge-pro">PRO</span>
                    </>
                  )}
                  {isCyber && (
                    <span className="text-[8px] bg-[var(--secondary-color)] text-white px-1.5 py-0.5 ml-2 font-black rounded-sm animate-pulse">
                      HUD v3.0
                    </span>
                  )}
                </h1>
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsProjectDropdownOpen(!isProjectDropdownOpen)
                    }
                    className="flex items-center gap-1.5 group"
                  >
                    <span
                      className={`text-[10px] uppercase font-bold transition-colors ${isCyber ? "text-cyan-400 group-hover:text-white" : "text-muted group-hover:text-primary"}`}
                    >
                      {currentProject.name}
                    </span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform ${isProjectDropdownOpen ? "rotate-180" : ""} ${isCyber ? "text-cyan-400" : "text-muted"}`}
                    />
                  </button>

                  {isProjectDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProjectDropdownOpen(false)}
                      />
                      <div
                        className={`absolute top-full left-0 mt-2 w-64 p-2 shadow-premium z-50 animate-in fade-in slide-in-from-top-2 duration-200 bg-[var(--surface)] border border-[var(--border-base)] ${isCyber ? "rounded-md" : "rounded"}`}
                      >
                        <div className="px-3 py-2 mb-1 border-b border-[var(--border-muted)]">
                          <p className="text-[10px] uppercase font-bold text-muted tracking-widest">
                            Select Project
                          </p>
                        </div>
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                          {projects.map((p) => (
                            <div
                              key={p.id}
                              className={`flex items-center gap-2 w-full px-4 py-2.5 mb-1 rounded-sm border transition-colors ${activeProjectId === p.id ? "bg-[var(--primary-color)]/10 border-[var(--primary-color)]/30" : "border-transparent hover:bg-[var(--border-muted)]/50"}`}
                            >
                              <button
                                onClick={() => {
                                  setActiveProjectId(p.id);
                                  setIsProjectDropdownOpen(false);
                                }}
                                className="flex-1 min-w-0 text-left flex items-center gap-2"
                              >
                                {editingProjectId === p.id ? (
                                  <input
                                    type="text"
                                    value={editingProjectName}
                                    onChange={(e) => setEditingProjectName(e.target.value)}
                                    onBlur={() => renameProject(p.id, editingProjectName)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") renameProject(p.id, editingProjectName);
                                      if (e.key === "Escape") {
                                        setEditingProjectId(null);
                                        setEditingProjectName("");
                                      }
                                    }}
                                    className="flex-1 min-w-0 px-2 py-1 text-xs font-bold bg-[var(--surface)] border border-[var(--border-base)] rounded focus:ring-2 focus:ring-[var(--primary-color)] outline-none"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-xs uppercase tracking-tight truncate">
                                        {p.name}
                                      </p>
                                      <p className="text-[8px] text-muted uppercase font-bold">
                                        {p.pages.length} Pages
                                      </p>
                                    </div>
                                    {activeProjectId === p.id && (
                                      <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
                                    )}
                                  </>
                                )}
                              </button>
                              {editingProjectId !== p.id && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingProjectId(p.id);
                                      setEditingProjectName(p.name);
                                    }}
                                    className="p-1.5 rounded hover:bg-[var(--border-muted)] text-muted hover:text-primary shrink-0"
                                    title="프로젝트 이름 수정"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDeleteProjectId(p.id);
                                    }}
                                    className="p-1.5 rounded hover:bg-red-500/10 text-muted hover:text-red-500 shrink-0"
                                    title="프로젝트 삭제"
                                    disabled={projects.length <= 1}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="p-1 mt-1 border-t border-[var(--border-muted)] space-y-1">
                          <button
                            onClick={handleExportClick}
                            disabled={capturingForExport}
                            className={`btn-base btn-ghost w-full px-4 py-2.5 ${isCyber ? "rounded-md" : "rounded-sm"} flex items-center justify-center gap-2`}
                          >
                            <Upload className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-bold uppercase">
                              내보내기
                            </span>
                          </button>
                          <button
                            onClick={() => importInputRef.current?.click()}
                            className={`btn-base btn-ghost w-full px-4 py-2.5 ${isCyber ? "rounded-md" : "rounded-sm"} flex items-center justify-center gap-2`}
                          >
                            <Download className="w-4 h-4 shrink-0" />
                            <span className="text-[10px] font-bold uppercase">
                              내려받기
                            </span>
                          </button>
                          <input
                            ref={importInputRef}
                            type="file"
                            accept=".zip"
                            className="hidden"
                            onChange={handleImportChange}
                          />
                          <button
                            onClick={addProject}
                            className={`btn-base btn-ghost w-full px-4 py-2.5 text-primary ${isCyber ? "rounded-md" : "rounded-sm"}`}
                          >
                            <Plus className="w-4 h-4" />{" "}
                            <span className="text-[10px] font-bold uppercase">
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsLibraryDropdownOpen(!isLibraryDropdownOpen)}
                className={`btn-base ${isCyber ? "btn-premium" : "btn-surface"} ${isLibraryDropdownOpen ? "active" : ""}`}
              >
                <div
                  className="icon-box w-5 h-5 rounded-md flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${currentLibrary.color}20` }}
                >
                  <currentLibrary.icon
                    className="w-3.5 h-3.5 underline-offset-2"
                    style={{ color: currentLibrary.color }}
                  />
                </div>
                <span>{currentLibrary.label}</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 opacity-50 ${isLibraryDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isLibraryDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsLibraryDropdownOpen(false)}
                  />
                  <div
                    className={`absolute top-full right-0 mt-2 w-52 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${isCyber ? "bg-black/90 border border-cyan-500/50 shadow-[0_0_30px_rgba(0,229,255,0.2)] rounded-md" : "bg-[var(--surface)] border border-[var(--border-base)] rounded shadow-premium"}`}
                  >
                    <div className="px-3 py-2 mb-1">
                      <p
                        className={`text-[10px] uppercase font-bold tracking-widest ${isCyber ? "text-cyan-400/60 glitch-text" : "text-muted"}`}
                        data-text="SELECT_CORE_ENGINE"
                      >
                        {isCyber ? "SELECT_CORE_ENGINE" : "Select Engine"}
                      </p>
                    </div>
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
                        className={`w-full justify-between px-3 py-2.5 flex items-center transition-all ${isCyber
                          ? `hover:bg-cyan-500/10 ${theme.chartLibrary === opt.value ? "bg-cyan-500/20 text-cyan-400" : "text-cyan-600"}`
                          : `btn-base btn-ghost rounded-sm ${theme.chartLibrary === opt.value ? "active" : ""}`
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${isCyber ? "bg-cyan-900/40 border border-cyan-500/30" : ""}`}
                            style={
                              !isCyber
                                ? { backgroundColor: `${opt.color}15` }
                                : {}
                            }
                          >
                            <opt.icon
                              className="w-4 h-4"
                              style={{ color: isCyber ? "#00e5ff" : opt.color }}
                            />
                          </div>
                          <span
                            className={`font-bold text-xs uppercase tracking-tight ${isCyber ? "italic" : ""}`}
                          >
                            {opt.label}
                          </span>
                        </div>
                        {theme.chartLibrary === opt.value && (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCyber ? "text-cyan-400" : "text-primary"}`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-[var(--border-base)] mx-1" />

            <button
              onClick={handleToggleDesignSidebar}
              className={`btn-base ${isCyber ? "btn-premium" : "btn-surface"} ${isDesignSidebarOpen ? "active" : ""}`}
            >
              <Palette className="w-4 h-4" /> <span>Design</span>
            </button>
            <button
              onClick={() => {
                setIsLayoutSidebarOpen(true);
                setSelectedWidgetId(null);
                setIsDesignSidebarOpen(false);
              }}
              className={`btn-base ${isCyber ? "btn-premium" : "btn-surface"} ${isLayoutSidebarOpen ? "active" : ""}`}
            >
              <LayoutGrid className="w-4 h-4" /> <span>Layout</span>
            </button>
            <button
              onClick={handleProjectSave}
              className={`btn-base ${isCyber ? "btn-premium" : "btn-surface"} ${isEditMode ? "active" : ""}`}
            >
              <Edit3 className="w-4 h-4" />{" "}
              <span>Edit Project</span>
            </button>
            <button
              disabled={isEditMode}
              onClick={() => setIsPreviewMode(true)}
              className={`btn-base ${isCyber ? "btn-premium" : "btn-surface"} ${isEditMode ? "opacity-40 grayscale pointer-events-none" : ""}`}
            >
              <Eye className="w-4 h-4" /> <span>Preview</span>
            </button>
          </div>
        </header>
      )}

      {/* Main Workspace — sidebars are OUTSIDE the project theme scope now */}
      <div className={`flex-1 flex overflow-hidden relative transition-colors duration-300 ${
        theme.mode === ThemeMode.LIGHT ? "bg-[#f1f5f9] text-[#1e293b]" : "bg-[#020617] text-[#f8fafc]"
      }`}>
        {/* Unified Page Background (Image or Globe) — now placed here to cover both header and main content */}
        {showUnifiedBg && (
          <div className="absolute inset-0 z-0 overflow-hidden fade-in pointer-events-auto" aria-hidden>
            {layout?.backgroundGlobe ? <GlobeBackground mode={theme.mode} /> : null}
            {pageBgUrl && (
              <div
                className={`absolute inset-0 z-0 ${layout?.backgroundFlicker ? "bg-neon-flicker" : ""}`}
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
              backgroundColor: header.backgroundColor === 'transparent' ? 'transparent' : header.backgroundColor,
              color: header.textColor,
              padding: `${header.padding}px`,
              margin: `${header.margin}px`,
              position: 'relative',
              ...(header.backgroundImage ? { backgroundImage: `url(${header.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}),
            }}
            className={`flex flex-col transition-all h-full shrink-0 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false ? "border-r border-[var(--border-base)]" : ""}`}
          >
            <HeaderWidgetLayer
              header={header}
              isEditMode={isEditMode}
              onUpdate={updateHeader}
              theme={theme}
              onModeSwitch={handleModeSwitch}
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
              <h2 className="text-lg font-black tracking-tighter uppercase">
                {header.title}
              </h2>
            </div>


          </aside>
        )}

        {/* Central Area: Dashboard grid (ref for export preview capture) */}
        <div
          ref={(el) => {
            // @ts-ignore
            projectScopeRef.current = el;
            // @ts-ignore
            exportPreviewRef.current = el;
          }}
          className={`flex-1 flex flex-col relative overflow-hidden text-[var(--text-main)] transition-colors duration-300 ${
            showUnifiedBg ? "bg-transparent" : "bg-[var(--background)]"
          }`}
        >
            {/* Top Header (if positioned TOP) */}
            {header.show && header.position === HeaderPosition.TOP && (
              <header
                style={{
                  height: `${header.height}px`,
                  backgroundColor: header.backgroundColor === 'transparent' ? 'transparent' : header.backgroundColor,
                  color: header.textColor,
                  padding: `0 ${header.padding}px`,
                  margin: `${header.margin}px`,
                  position: 'relative',
                  ...(header.backgroundImage ? { backgroundImage: `url(${header.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}),
                }}
                className={`flex items-center transition-all shrink-0 ${header.backgroundColor !== "transparent" ? "shadow-sm" : ""} ${header.showDivider !== false ? "border-b border-[var(--border-base)]" : ""} ${layout?.backgroundGlobe ? "pointer-events-auto" : ""}`}
              >
                <HeaderWidgetLayer
                  header={header}
                  isEditMode={isEditMode}
                  onUpdate={updateHeader}
                  theme={theme}
                  onModeSwitch={handleModeSwitch}
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
                      {header.logo && (
                        <img
                          src={header.logo}
                          alt="Logo"
                          className="h-6 w-auto object-contain"
                        />
                      )}
                      <h2 className="text-lg font-black tracking-tighter whitespace-nowrap">
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
              className={`flex-1 relative custom-scrollbar transition-all ${layout.fitToScreen ? "h-full overflow-hidden" : "overflow-y-auto"} ${layout?.backgroundGlobe ? "globe-background-active" : ""}`}
              style={layout?.glassmorphism ? (() => {
                const p = (layout.glassmorphismOpacity ?? (theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER ? 35 : 55)) / 100;
                const alpha = Math.pow(p, 0.72);
                const blurPx = Math.round(alpha * 12);
                return {
                  ['--glass-opacity' as string]: String(alpha),
                  ['--glass-bg' as string]: `rgba(var(--glass-bg-rgb), ${alpha})`,
                  ['--glass-blur' as string]: `${blurPx}px`,
                };
              })() : undefined}
            >
              <div className="relative z-10 h-full min-h-0">
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
              width: '320px',
              cursor: isDraggingPanel ? 'move' : 'default'
            }}
          >
            <div className="pointer-events-auto overflow-hidden rounded">
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

      {/* Exit Preview — shown in both project_1 and project_2 */}
      {isPreviewMode && (
        <button
          onClick={() => setIsPreviewMode(false)}
          className="fixed bottom-8 right-8 z-50 btn-base btn-surface active px-8 py-4 rounded shadow-premium hover:scale-105 transition-transform"
        >
          <EyeOff className="w-5 h-5" /> Exit Preview
        </button>
      )}

      {/* Excel Integration Modal */}
      <ExcelModal
        isOpen={excelWidgetId !== null}
        onClose={() => setExcelWidgetId(null)}
        widget={widgets.find((w) => w.id === excelWidgetId) || null}
        onUpload={handleExcelUpload}
        isDark={true}
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
        isDark={true}
      />
      <ConfirmModal
        isOpen={deleteProjectId !== null}
        title="프로젝트 삭제"
        message="이 프로젝트를 정말로 삭제하시겠습니까? 삭제된 프로젝트와 위젯은 복구할 수 없습니다."
        confirmText="삭제하기"
        cancelText="취소"
        onConfirm={confirmDeleteProject}
        onCancel={() => setDeleteProjectId(null)}
        isDark={true}
      />
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-3 px-6 py-4 bg-[var(--surface)] border border-[var(--border-base)] shadow-premium rounded min-w-[320px]">
            <div
              className={`w-10 h-10 rounded-sm flex items-center justify-center ${toast.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Activity className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-[10px] uppercase font-bold text-muted tracking-widest mb-0.5">
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
        <DesignDocs onClose={() => setIsDesignDocsOpen(false)} />
      )}

      <WidgetPicker
        isOpen={isWidgetPickerOpen}
        onClose={() => setIsWidgetPickerOpen(false)}
        onSelect={addWidgetWithType}
        isDark={true}
      />
    </div>
  );
};

export default App;
