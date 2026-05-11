import React, { useState, useCallback, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { GridLayout, ResponsiveGridLayout, useContainerWidth, getCompactor } from "react-grid-layout";
import type { LayoutItem } from "react-grid-layout";
import { Plus } from "lucide-react";
import { RESPONSIVE_BREAKPOINTS, RESPONSIVE_COLS } from "../../constants";
import { ThemeMode, type Widget, type DashboardTheme, type LayoutConfig } from "../../types";
import WidgetCard from "../WidgetCard";

/** Dashboard grid with its own useContainerWidth so it re-measures when we return from project_2. */
export const DashboardGrid: React.FC<{
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
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  userRole?: string;
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
    isPreviewMode,
    onTogglePreview,
    userRole,
  } = props;

  const [resizingId, setResizingId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const layoutRafRef = useRef<number | null>(null);
  const pendingLayoutRef = useRef<readonly LayoutItem[] | null>(null);
  const [localLayout, setLocalLayout] = useState<readonly LayoutItem[] | null>(null);
  const pendingResponsiveLayoutsRef = useRef<Record<string, LayoutItem[]> | null>(null);
  const [localResponsiveLayouts, setLocalResponsiveLayouts] = useState<Record<string, LayoutItem[]> | null>(null);

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

  const toGridLayout = useCallback((next: readonly LayoutItem[]) => {
    if (!usePixelGrid) return next;
    const cols = Math.max(1, layout.columns);
    const spacing = theme.spacing;
    const colWidth = (gridWidth - (cols - 1) * spacing) / cols;
    const unitX = gridWidth / rglCols;

    return next.map((item) => {
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
  }, [finite, gridWidth, layout.columns, rglCols, rglRowH, rglRowHeight, theme.spacing, usePixelGrid]);

  const handleLayoutChange = useCallback(
    (next: readonly LayoutItem[]) => {
      // 드래그/리사이즈 중 layout 변경이 매우 빈번하므로:
      // - Interaction 중: 상위 커밋을 미루고 로컬 프리뷰만 업데이트
      // - Interaction 아님: 기존처럼 커밋
      pendingLayoutRef.current = next;
      if (layoutRafRef.current) cancelAnimationFrame(layoutRafRef.current);
      layoutRafRef.current = requestAnimationFrame(() => {
        const latest = pendingLayoutRef.current;
        if (!latest) return;
        if (draggingId || resizingId) {
          setLocalLayout(latest);
          return;
        }
        onLayoutChange(toGridLayout(latest));
      });
    },
    [draggingId, resizingId, onLayoutChange, toGridLayout]
  );

  const commitPendingLayout = useCallback((explicitLayout?: readonly LayoutItem[]) => {
    const next = explicitLayout ?? pendingLayoutRef.current;
    if (!next) return;
    onLayoutChange(toGridLayout(next));
    pendingLayoutRef.current = null;
    setLocalLayout(null);
  }, [onLayoutChange, toGridLayout]);

  const handleResponsiveLayoutsChange = useCallback((layouts: Record<string, LayoutItem[]>) => {
    pendingResponsiveLayoutsRef.current = layouts;
    if (draggingId || resizingId) {
      setLocalResponsiveLayouts(layouts);
      return;
    }
    onResponsiveLayoutChange?.(layouts);
  }, [draggingId, resizingId, onResponsiveLayoutChange]);

  const commitPendingResponsiveLayouts = useCallback((explicitLayouts?: Record<string, LayoutItem[]>) => {
    const next = explicitLayouts ?? pendingResponsiveLayoutsRef.current;
    if (!next) return;
    onResponsiveLayoutChange?.(next);
    pendingResponsiveLayoutsRef.current = null;
    setLocalResponsiveLayouts(null);
  }, [onResponsiveLayoutChange]);

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
              className={`flex flex-col items-center justify-center border-2 border-dashed border-main bg-[var(--dashboard-empty-state-surface)] text-muted hover:bg-[var(--primary-subtle)] hover:border-[var(--primary-color)] transition-all group ${layout.backgroundGlobe ? "pointer-events-auto" : ""}`}
            >
              <div className="w-16 h-16 rounded-full bg-[var(--border-muted)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center">
                <span className="font-black uppercase tracking-widest block" style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--spacing-sm)' }}>
                  Create Your Dashboard
                </span>
                <p className="text-muted font-medium" style={{ fontSize: 'var(--text-small)' }}>
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
                ? getComputedStyle(document.documentElement).getPropertyValue(gridFillVar).trim() || "var(--grid-guide-fill-light)"
                : "var(--grid-guide-fill-light)";
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
                layouts={(draggingId || resizingId) ? (localResponsiveLayouts ?? responsiveLayouts) : responsiveLayouts}
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
                onLayoutChange={(_layout, layouts) => handleResponsiveLayoutsChange(layouts)}
                onDragStart={(layout, oldItem, newItem) => {
                  setDraggingId(newItem.i);
                  // 첫 프레임 드래그 시작 시점의 불필요한 대형 상태 업데이트를 피하기 위해
                  // 실제 레이아웃 변화가 들어올 때(onLayoutChange) 로컬 프리뷰를 채웁니다.
                }}
                onDragStop={(_layout, layouts) => {
                  setDraggingId(null);
                  commitPendingResponsiveLayouts(layouts);
                }}
                onResizeStart={(layout, oldItem, newItem) => {
                  setResizingId(newItem.i);
                  setLiveSize({ w: newItem.w, h: newItem.h });
                  // 로컬 프리뷰는 onLayoutChange에서 채웁니다.
                }}
                onResize={(layout, oldItem, newItem) => {
                  if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                  resizeRafRef.current = requestAnimationFrame(() => {
                    setLiveSize({ w: newItem.w, h: newItem.h });
                  });
                }}
                onResizeStop={(_layout, _oldItem, _newItem, layouts) => {
                  if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                  setResizingId(null);
                  setLiveSize(null);
                  commitPendingResponsiveLayouts(layouts);
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
                      data-widget-id={widget.id}
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
                        isPreviewMode={isPreviewMode}
                        onTogglePreview={onTogglePreview}
                        userRole={userRole}
                      />
                      {isEditMode && isThisResizing && liveSize && (
                        <div
                          className="absolute w-fit h-fit rounded backdrop-blur-sm shadow-2xl pointer-events-none overflow-hidden"
                          style={{
                            zIndex: 'var(--widget-resize-hint-z-index)',
                            bottom: 'var(--spacing-sm)',
                            right: 'var(--spacing-sm)',
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--overlay-strong)',
                            border: 'var(--widget-border-width) solid var(--overlay-border)',
                          }}
                        >
                          <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-xxs)' }}>
                            <span className="font-bold font-mono tracking-tighter leading-none" style={{ fontSize: 'var(--text-caption)', color: 'var(--overlay-text)' }}>
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
                  layout={(draggingId || resizingId) ? (localLayout ?? displayLayout) : displayLayout}
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
                    // 로컬 프리뷰는 첫 onLayoutChange에서 채웁니다.
                  }}
                  onDragStop={(layout) => {
                    setDraggingId(null);
                    commitPendingLayout(layout);
                  }}
                  onResizeStart={(layout, oldItem, newItem) => {
                    setResizingId(newItem.i);
                    setLiveSize({ w: newItem.w, h: newItem.h });
                    // 로컬 프리뷰는 첫 onLayoutChange에서 채웁니다.
                  }}
                  onResize={(layout, oldItem, newItem) => {
                    if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                    resizeRafRef.current = requestAnimationFrame(() => {
                      setLiveSize({ w: newItem.w, h: newItem.h });
                    });
                  }}
                  onResizeStop={(layout) => {
                    if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
                    setResizingId(null);
                    setLiveSize(null);
                    commitPendingLayout(layout);
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
                        data-widget-id={widget.id}
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
                          isPreviewMode={isPreviewMode}
                          onTogglePreview={onTogglePreview}
                          userRole={userRole}
                        />
                        {isEditMode && isThisResizing && liveSize && (
                          <div
                            className="absolute w-fit h-fit rounded backdrop-blur-sm shadow-2xl pointer-events-none overflow-hidden"
                            style={{
                              zIndex: 'var(--widget-resize-hint-z-index)',
                              bottom: 'var(--spacing-sm)',
                              right: 'var(--spacing-sm)',
                              padding: 'var(--spacing-xs) var(--spacing-sm)',
                              backgroundColor: 'var(--overlay-strong)',
                              border: 'var(--widget-border-width) solid var(--overlay-border)',
                            }}
                          >
                            <div className="flex items-center justify-center" style={{ gap: 'var(--spacing-xxs)' }}>
                              <span className="font-bold font-mono tracking-tighter leading-none" style={{ fontSize: 'var(--text-caption)', color: 'var(--overlay-text)' }}>
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

            {isEditMode && typeof document !== "undefined" && createPortal(
              <div
                className="fixed bottom-10 left-1/2 -translate-x-1/2 w-auto pointer-events-none flex flex-col items-center"
                style={{ zIndex: 'var(--add-widget-pill-z-index)' }}
              >
                {/* Dynamic Island Style Pill Button */}
                <div className="group pointer-events-auto relative">
                  <button
                    onClick={onOpenWidgetPicker}
                    className={`
                    relative flex items-center gap-3 px-6
                    rounded-full overflow-hidden transition-all duration-500
                    hover:scale-105 hover:px-8 active:scale-95
                    shadow-[var(--shadow-header-bar)]
                    before:absolute before:inset-0 before:bg-gradient-to-r before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:from-[var(--add-widget-pill-shimmer-from)]
                  `}
                  style={{
                    height: 'var(--add-widget-pill-height)',
                    backgroundColor: 'var(--add-widget-pill-bg)',
                    border: 'var(--widget-border-width) solid var(--add-widget-pill-border)',
                    backdropFilter: 'blur(var(--add-widget-pill-blur))',
                  }}
                  >
                    {/* Glowing Animated Ring */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                      <div className="absolute inset-[-100%] add-widget-pill-conic-ring" />
                    </div>

                    {/* Icon with hover rotation */}
                    <div
                      className="relative z-10 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-180 transition-transform duration-700"
                      style={{ width: 'var(--add-widget-icon-wrap-size)', height: 'var(--add-widget-icon-wrap-size)', backgroundColor: 'var(--primary-color)' }}
                    >
                      <Plus className="w-5 h-5" style={{ strokeWidth: 'var(--icon-stroke-bold)', color: 'var(--white)' }} />
                    </div>

                    {/* Text with letter spacing animation */}
                    <span
                      className="relative z-10 font-black uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all duration-500 whitespace-nowrap drop-shadow-md"
                      style={{ fontSize: 'var(--text-small)', color: theme.mode === ThemeMode.LIGHT ? 'var(--text-main)' : 'var(--white)' }}
                    >
                      Add Widget
                    </span>

                  </button>

                  {/* Subtle outer glow */}
                  <div className="absolute -inset-1 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundColor: 'var(--add-widget-glow)' }} />
                </div>

                {/* Hint under the button */}
                <div
                  className="mt-3 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500"
                  style={{
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    backgroundColor: 'var(--overlay-soft)',
                    border: 'var(--widget-border-width) solid var(--overlay-border-soft)',
                    backdropFilter: 'blur(var(--floating-panel-blur))',
                  }}
                >
                  <span className="uppercase tracking-widest font-bold" style={{ fontSize: 'var(--text-micro)', color: 'var(--overlay-text-dim)' }}>Pick analysis component</span>
                </div>
              </div>,
              document.body
            )}
          </>
        )}
      </div>
    </div>
  );
};
