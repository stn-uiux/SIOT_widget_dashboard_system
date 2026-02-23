import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GridLayout, useContainerWidth } from 'react-grid-layout';
import type { LayoutItem } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Search, Bell, Plus } from 'lucide-react';
import { HeaderPosition, Widget, WidgetType, DashboardTheme, LayoutConfig, ThemeMode } from '../../types';
import WidgetCard from '../WidgetCard';
import ModeToggle from '../ModeToggle';

/** 왼쪽 2개도 그리드(리사이즈 가능), 오른쪽 4개 그리드 */
const PROJECT2_LEFT_IDS = ['proj2_earning_1', 'proj2_earning_trend_1'];
const PROJECT2_RIGHT_IDS = ['proj2_sankey_1', 'proj2_kpi_1', 'proj2_kpi_2', 'proj2_kpi_3'];

/* layout.defaultRowHeight 없을 때 fallback (리사이즈 단위) */
const PROJECT2_ROW_HEIGHT_DEFAULT = 40;

function getProject2LeftDefaultLayout(): LayoutItem[] {
  return [
    { i: 'proj2_earning_1', x: 0, y: 0, w: 1, h: 8 },
    { i: 'proj2_earning_trend_1', x: 0, y: 8, w: 1, h: 8 },
  ];
}

function getProject2RightDefaultLayout(): LayoutItem[] {
  return [
    { i: 'proj2_sankey_1', x: 0, y: 0, w: 12, h: 12 },
    { i: 'proj2_kpi_1', x: 0, y: 12, w: 4, h: 6 },
    { i: 'proj2_kpi_2', x: 4, y: 12, w: 4, h: 6 },
    { i: 'proj2_kpi_3', x: 8, y: 12, w: 4, h: 6 },
  ];
}

const defaultKpiConfig = {
  xAxisKey: 'name' as const,
  yAxisKey: 'value' as const,
  series: [] as any[],
  showLegend: false,
  showGrid: false,
  showXAxis: false,
  showYAxis: false,
  showUnit: false,
  showUnitInLegend: false,
  showLabels: false,
  unit: '',
};

/** Default KPI widgets for New Project2 bottom row (same as General KPI widget; no header for card-only look). */
const PROJECT2_KPI_WIDGETS: Widget[] = [
  { id: 'proj2_kpi_1', type: WidgetType.GENERAL_KPI, title: 'Active User', config: defaultKpiConfig, data: [], colSpan: 1, rowSpan: 1, mainValue: '204', subValue: 'ACTIVE USER', icon: 'TrendingDown', hideHeader: true },
  { id: 'proj2_kpi_2', type: WidgetType.GENERAL_KPI, title: 'All Time User', config: defaultKpiConfig, data: [], colSpan: 1, rowSpan: 1, mainValue: '65,540', subValue: 'ALL TIME USER', icon: 'User', hideHeader: true },
  { id: 'proj2_kpi_3', type: WidgetType.GENERAL_KPI, title: 'Total Projects', config: defaultKpiConfig, data: [], colSpan: 1, rowSpan: 1, mainValue: '325', subValue: 'TOTAL PROJECTS', icon: 'Repeat', hideHeader: true },
];

/** Project2 layout: left column = 2 widgets 고정, right = timeline + 그리드(4개). */

/** Same ORION bar content; layout differs by position (inline vs vertical). */
function OrionBarContent({ isLeft }: { isLeft: boolean }) {
  return (
    <>
      <div className={isLeft ? 'flex flex-col items-center gap-4 mb-6' : 'flex items-center gap-2'}>
        <div className="w-8 h-8 rounded-lg bg-[var(--primary-gradient)] flex items-center justify-center shrink-0">
          <div className="w-4 h-4 rounded-full border-2 border-[var(--white)]" />
        </div>
        <span className="text-xl font-semibold text-[var(--text-main)]">ORION</span>
      </div>
      <div className={isLeft ? 'w-full' : 'relative'}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        <input
          type="text"
          placeholder=""
          className={`bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)] ${isLeft ? 'w-full' : 'w-[300px]'}`}
        />
      </div>
      <nav className={isLeft ? 'flex flex-col gap-2 w-full' : 'flex items-center gap-8'}>
        <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Statistics</a>
        <a href="#" className="text-[var(--text-main)] text-sm font-medium border-b-2 border-[var(--primary-color)] pb-1">Overview</a>
        <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Dashboard</a>
        <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Analytics</a>
      </nav>
      <div className={isLeft ? 'flex flex-col gap-2 mt-auto' : 'flex items-center gap-4'}>
        <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    </>
  );
}

export interface DuplicateDesignContentProps {
  theme: DashboardTheme;
  layout?: LayoutConfig;
  headerPosition?: HeaderPosition;
  headerWidth?: number;
  isEditMode?: boolean;
  selectedWidgetId?: string | null;
  kpiWidgets?: Widget[];
  onEditWidget?: (id: string) => void;
  onUpdateWidget?: (id: string, updates: Partial<Widget>) => void;
  onDeleteWidget?: (id: string) => void;
  onOpenExcel?: (id: string) => void;
  /** project2 편집 시 위젯 추가 버튼으로 피커 열기 */
  onOpenWidgetPicker?: () => void;
  /** project2에서 Dual Mode 전환 (라이트/다크) */
  onModeSwitch?: (mode: ThemeMode) => void;
}

/**
 * Duplicate Design project UI — header + main content. Bottom row uses General KPI widgets (WidgetCard); edit mode shows gear/delete and selection state.
 */
export function DuplicateDesignContent({
  theme,
  layout,
  headerPosition = HeaderPosition.TOP,
  headerWidth = 260,
  isEditMode = false,
  selectedWidgetId = null,
  kpiWidgets = PROJECT2_KPI_WIDGETS,
  onEditWidget,
  onUpdateWidget,
  onDeleteWidget,
  onOpenExcel,
  onOpenWidgetPicker,
  onModeSwitch,
}: DuplicateDesignContentProps) {
  const isLeft = headerPosition === HeaderPosition.LEFT;
  const fitToScreen = layout?.fitToScreen ?? false;
  const allWidgets = kpiWidgets?.length ? kpiWidgets : [];

  /* Timeline 섹션 문구 (edit 모드에서 수정 가능) */
  const [timelineLabel, setTimelineLabel] = useState('TIMELINE');
  const [timelineTitle, setTimelineTitle] = useState('Data visualisation');
  const [timeframeOptions, setTimeframeOptions] = useState(['5W', '1M', '3M', '6Y', 'ALL']);
  const [selectedTimeframeIndex, setSelectedTimeframeIndex] = useState(2);

  /* project2: 왼쪽 2개 그리드(리사이즈) + 오른쪽 4개 그리드(드래그/리사이즈) */
  const widgetById = new Map(allWidgets.map((w) => [w.id, w]));
  const { containerRef: leftGridContainerRef, width: leftGridWidth } = useContainerWidth({ initialWidth: 340 });
  const { containerRef: gridContainerRef, width: gridWidth } = useContainerWidth({ initialWidth: 1280 });
  const [leftRglLayout, setLeftRglLayout] = useState<LayoutItem[]>(getProject2LeftDefaultLayout);
  const [rglLayout, setRglLayout] = useState<LayoutItem[]>(getProject2RightDefaultLayout);

  /* 오른쪽 그리드 위젯 ID (왼쪽 2개 제외). 새로 추가된 위젯이 있으면 rglLayout에 반영 */
  const rightWidgetIds = useMemo(
    () => allWidgets.filter((w) => !PROJECT2_LEFT_IDS.includes(w.id)).map((w) => w.id),
    [allWidgets]
  );
  useEffect(() => {
    setRglLayout((prev) => {
      const existingIds = new Set(prev.map((l) => l.i));
      const toAdd = rightWidgetIds.filter((id) => !existingIds.has(id));
      if (toAdd.length === 0) return prev;
      const maxY = prev.length ? Math.max(...prev.map((l) => l.y + l.h)) : 0;
      const newItems: LayoutItem[] = toAdd.map((id, i) => ({
        i: id,
        x: 0,
        y: maxY + i * 6,
        w: 4,
        h: 6,
      }));
      return [...prev, ...newItems];
    });
  }, [rightWidgetIds.join(',')]);

  const leftGridWidgets = useMemo(() => leftRglLayout.map((item) => widgetById.get(item.i)).filter(Boolean) as Widget[], [allWidgets, leftRglLayout]);
  const rightGridWidgets = useMemo(() => rglLayout.map((item) => widgetById.get(item.i)).filter(Boolean) as Widget[], [allWidgets, rglLayout]);
  const rowHeight = Math.max(10, layout?.defaultRowHeight ?? PROJECT2_ROW_HEIGHT_DEFAULT);
  const handleLeftLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      setLeftRglLayout(Array.from(newLayout));
      Array.from(newLayout).forEach((item) => {
        const w = widgetById.get(item.i);
        if (w) onUpdateWidget?.(item.i, { colSpan: item.w, rowSpan: item.h });
      });
    },
    [widgetById, onUpdateWidget]
  );
  const handleLayoutChange = useCallback(
    (newLayout: readonly LayoutItem[]) => {
      setRglLayout(Array.from(newLayout));
      Array.from(newLayout).forEach((item) => {
        const w = widgetById.get(item.i);
        if (w) onUpdateWidget?.(item.i, { colSpan: item.w, rowSpan: item.h });
      });
    },
    [widgetById, onUpdateWidget]
  );
  const leftCurrentLayout = useMemo(() => {
    const byId = new Map(leftRglLayout.map((l) => [l.i, l]));
    return leftGridWidgets.map((w): LayoutItem => {
      const item = byId.get(w.id);
      const h = item?.h ?? w.rowSpan;
      return { i: w.id, x: item?.x ?? 0, y: item?.y ?? 0, w: item?.w ?? w.colSpan, h, minH: 4 };
    });
  }, [leftRglLayout, leftGridWidgets]);
  const currentLayout = useMemo(() => {
    const byId = new Map(rglLayout.map((l) => [l.i, l]));
    return rightGridWidgets.map((w): LayoutItem => {
      const item = byId.get(w.id);
      const h = item?.h ?? w.rowSpan;
      const isSankey = w.id === 'proj2_sankey_1';
      return { i: w.id, x: item?.x ?? 0, y: item?.y ?? 0, w: item?.w ?? w.colSpan, h, minH: isSankey ? 6 : 3 };
    });
  }, [rglLayout, rightGridWidgets]);

  return (
    <div className={`flex-1 flex overflow-hidden min-h-0 w-full bg-[var(--background)] text-[var(--text-main)] ${isLeft ? 'flex-row' : 'flex-col'}`}>
      {/* ORION bar: top (w-full px-6 py-4) or left sidebar */}
      {isLeft ? (
        <aside
          className="shrink-0 h-full flex flex-col border-r border-[var(--border-base)] bg-[var(--surface)] px-4 py-4"
          style={{ width: headerWidth }}
        >
          {theme.dualModeSupport && onModeSwitch && (
            <div className="mb-4 flex items-center justify-center">
              <ModeToggle key={theme.mode} mode={theme.mode} onChange={onModeSwitch} />
            </div>
          )}
          <OrionBarContent isLeft />
        </aside>
      ) : (
        <header className="shrink-0 border-b border-[var(--border-base)] bg-[var(--surface)]">
          <div className="w-full px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-gradient)] flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full border-2 border-[var(--white)]" />
                  </div>
                  <span className="text-xl font-semibold text-[var(--text-main)]">ORION</span>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    placeholder=""
                    className="bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-lg pl-10 pr-4 py-2 w-[300px] text-sm text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-color)]"
                  />
                </div>
              </div>
              <nav className="flex items-center gap-8">
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Statistics</a>
                <a href="#" className="text-[var(--text-main)] text-sm font-medium border-b-2 border-[var(--primary-color)] pb-1">Overview</a>
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Dashboard</a>
                <a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-main)] text-sm transition-colors">Analytics</a>
              </nav>
              <div className="flex items-center gap-4">
                {theme.dualModeSupport && onModeSwitch && (
                  <ModeToggle key={theme.mode} mode={theme.mode} onChange={onModeSwitch} />
                )}
                <button type="button" className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content — 왼쪽 2개 위젯 | 오른쪽(타임라인 + 그리드 4개). layout.backgroundImage 있으면 배경 이미지, backgroundFlicker 시 네온 번쩍임 */}
      <main
        className={`flex-1 min-h-0 flex flex-col min-w-0 relative ${fitToScreen ? 'overflow-hidden h-full' : 'overflow-auto'} ${layout?.backgroundImage && layout?.backgroundFlicker ? 'bg-neon-flicker' : ''}`}
        style={
          layout?.backgroundImage
            ? {
                backgroundImage: `url(${layout.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }
            : undefined
        }
      >
        <div className="flex gap-8 w-full max-w-[1920px] mx-auto min-h-0 flex-1 relative z-0" style={{ padding: 'var(--dashboard-padding)' }}>
          {/* 왼쪽 컬럼: 2개 위젯 — edit 모드에서 리사이즈 가능 (1열 그리드) */}
          <div
            ref={leftGridContainerRef as React.RefObject<HTMLDivElement>}
            className="shrink-0 w-full max-w-[340px] min-h-[200px]"
          >
            <GridLayout
              layout={leftCurrentLayout}
              width={leftGridWidth > 0 ? leftGridWidth : 340}
              gridConfig={{
                cols: 1,
                rowHeight,
                margin: [16, 16] as [number, number],
                containerPadding: [0, 0] as [number, number],
                maxRows: Infinity,
              }}
              dragConfig={{ enabled: false }}
              resizeConfig={{
                enabled: isEditMode,
                handles: ['s', 'n', 'se', 'ne', 'sw', 'nw'] as const,
              }}
              autoSize
              onLayoutChange={handleLeftLayoutChange}
              style={{ minHeight: '100%' }}
            >
              {leftGridWidgets.map((w) => (
                <div
                  key={w.id}
                  className={`h-full transition-all duration-200 ${isEditMode && selectedWidgetId === w.id ? 'widget-selected' : ''}`}
                  style={isEditMode && selectedWidgetId === w.id ? { zIndex: 50 } : undefined}
                >
                  <WidgetCard
                    widget={w}
                    theme={theme}
                    isEditMode={isEditMode}
                    onEdit={(id) => onEditWidget?.(id)}
                    onUpdate={(id, updates) => onUpdateWidget?.(id, updates)}
                    onDelete={(id) => onDeleteWidget?.(id)}
                    onOpenExcel={(id) => onOpenExcel?.(id)}
                    glassStyle={layout?.glassmorphism ?? false}
                  />
                </div>
              ))}
            </GridLayout>
          </div>

          {/* 오른쪽: 타임라인 섹션 + 그리드(생키 + KPI 3개, edit 모드에서 드래그/리사이즈) */}
          <div className={`relative flex-1 min-w-0 flex flex-col min-h-0 ${fitToScreen ? 'overflow-hidden' : ''}`}>
            {/* Timeline — 왼쪽 위젯 옆(원래 위치) */}
            <div className="shrink-0 mb-6">
              {isEditMode ? (
                <input
                  type="text"
                  value={timelineLabel}
                  onChange={(e) => setTimelineLabel(e.target.value)}
                  className="block w-full max-w-xs bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-lg px-3 py-1.5 text-sm text-[var(--text-muted)] tracking-wider mb-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  placeholder="예: TIMELINE"
                />
              ) : (
                <div className="text-[var(--text-muted)] text-sm mb-2 tracking-wider">{timelineLabel}</div>
              )}
              {isEditMode ? (
                <input
                  type="text"
                  value={timelineTitle}
                  onChange={(e) => setTimelineTitle(e.target.value)}
                  className="block w-full max-w-md bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-lg px-4 py-2 text-2xl md:text-3xl font-bold text-[var(--text-main)] mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
                  placeholder="예: Data visualisation"
                />
              ) : (
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[var(--text-main)]">{timelineTitle}</h1>
              )}
              <div className="flex flex-wrap gap-2">
                {timeframeOptions.map((label, idx) =>
                  isEditMode ? (
                    <input
                      key={idx}
                      type="text"
                      value={label}
                      onChange={(e) => {
                        const next = [...timeframeOptions];
                        next[idx] = e.target.value;
                        setTimeframeOptions(next);
                      }}
                      className="min-w-[2.5rem] px-4 py-1 rounded-full text-sm bg-[var(--surface-muted)] border border-[var(--border-base)] text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-center"
                    />
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedTimeframeIndex(idx)}
                      className={`px-4 py-1 rounded-full text-sm transition-colors ${selectedTimeframeIndex === idx ? 'bg-[var(--primary-color)] text-white font-medium' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 오른쪽 그리드: 생키 + KPI 3개 — edit 모드에서 드래그/리사이즈 */}
            <div
              ref={gridContainerRef as React.RefObject<HTMLDivElement>}
              className={`flex-1 min-h-0 ${fitToScreen ? 'min-h-[280px]' : ''}`}
            >
              <GridLayout
                layout={currentLayout}
                width={gridWidth > 0 ? gridWidth : 1280}
                gridConfig={{
                  cols: 12,
                  rowHeight,
                  margin: [16, 16] as [number, number],
                  containerPadding: [0, 0] as [number, number],
                  maxRows: Infinity,
                }}
                dragConfig={{
                  enabled: isEditMode,
                  handle: '.drag-handle',
                }}
                resizeConfig={{
                  enabled: isEditMode,
                  handles: ['se', 'sw', 'ne', 'nw', 'e', 'w', 'n', 's'] as const,
                }}
                autoSize
                onLayoutChange={handleLayoutChange}
                style={{ minHeight: fitToScreen ? '100%' : 'auto' }}
              >
                {rightGridWidgets.map((w) => (
                  <div
                    key={w.id}
                    className={`h-full transition-all duration-200 ${isEditMode && selectedWidgetId === w.id ? 'widget-selected' : ''}`}
                    style={isEditMode && selectedWidgetId === w.id ? { zIndex: 50 } : undefined}
                  >
                    <WidgetCard
                      widget={w}
                      theme={theme}
                      isEditMode={isEditMode}
                      onEdit={(id) => onEditWidget?.(id)}
                      onUpdate={(id, updates) => onUpdateWidget?.(id, updates)}
                      onDelete={(id) => onDeleteWidget?.(id)}
                      onOpenExcel={(id) => onOpenExcel?.(id)}
                      glassStyle={layout?.glassmorphism ?? false}
                    />
                  </div>
                ))}
              </GridLayout>
            </div>

            {/* project2 편집 모드: 위젯 추가 버튼 */}
            {isEditMode && onOpenWidgetPicker && (
              <button
                type="button"
                onClick={onOpenWidgetPicker}
                className="mt-4 w-full min-h-[120px] flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border-base)] bg-[var(--surface-muted)]/50 text-[var(--text-muted)] hover:bg-[var(--primary-subtle)] hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm font-semibold uppercase tracking-tight">위젯 추가</span>
              </button>
            )}
          </div>

          {/* Right Action Button */}
          <div className="flex flex-col justify-end shrink-0">
            <button type="button" className="bg-[var(--surface)] border border-[var(--border-base)] hover:bg-[var(--surface-muted)] rounded-full p-4 transition-colors text-[var(--text-main)]">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
