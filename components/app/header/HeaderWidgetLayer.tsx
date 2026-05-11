import React, { useState, useEffect, useRef } from "react";
import { GridLayout, getCompactor } from "react-grid-layout";
import { X } from "lucide-react";
import designTokens from "../../../design-tokens.json";
import ModeToggle from "../../ModeToggle";
import {
  HeaderWidgetType,
  HeaderPosition,
  type HeaderConfig,
  type HeaderWidget,
  type DashboardTheme,
  type ThemeMode,
} from "../../../types";

/** Header-specific widget cells */
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
    <div className="w-full h-full flex items-center justify-center gap-2 px-3 py-1 font-mono whitespace-nowrap overflow-hidden" style={{ color: 'var(--h-clock-color)' }}>
      <span className="font-bold tracking-tighter shrink-0" style={{ fontSize: 'var(--h-clock-time-size)' }}>{h}:{m}</span>
      <div className="flex flex-col leading-none shrink-0">
        <span className="font-bold opacity-70 uppercase" style={{ fontSize: 'var(--h-clock-day-size)' }}>{day}</span>
        <span className="font-black" style={{ fontSize: 'var(--h-clock-date-size)' }}>{datePart?.replace(/\//g, "-")}</span>
      </div>
    </div>
  );
};

const HeaderMonitor = () => (
  <div
    className="w-full h-full flex items-center justify-center gap-2 px-3 py-1 border whitespace-nowrap overflow-hidden shadow-sm"
    style={{
      backgroundColor: 'var(--h-monitor-bg)',
      borderColor: 'var(--h-monitor-border)',
      borderRadius: 'var(--h-monitor-radius)'
    }}
  >
    <span className="font-bold tracking-tight uppercase" style={{ fontSize: 'var(--h-monitor-text-size)', color: 'var(--text-main)' }}>시스템 감시</span>
    <div
      className="w-2 h-2 rounded-full animate-pulse shrink-0"
      style={{
        backgroundColor: 'var(--h-monitor-dot-color)',
        boxShadow: 'var(--h-monitor-dot-glow)'
      }}
    />
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

export interface HeaderWidgetLayerProps {
  header: HeaderConfig;
  isEditMode: boolean;
  onUpdate: (updates: Partial<HeaderConfig>) => void;
  theme: DashboardTheme;
  onModeSwitch: (m: ThemeMode) => void;
  isPreviewMode: boolean;
}

export const HeaderWidgetLayer: React.FC<HeaderWidgetLayerProps> = ({
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

  const onLayoutChange = (newLayout: { i: string; x: number; y: number; w: number; h: number }[]) => {
    const updatedWidgets = widgets.map((w) => {
      const l = newLayout.find((item) => item.i === w.id);
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

    const layoutTokens = (designTokens as any).tokens?.layout;
    const hGrid = layoutTokens?.header_grid;
    const gridCols = hGrid?.cols?.value ?? 60;
    const gridRows = hGrid?.rows?.value ?? 12;
    const gapX = hGrid?.gap_x?.value ?? 4;
    const gapY = hGrid?.gap_y?.value ?? 2;

    const colWidth = rect.width / gridCols;
    const rowHeight = header.position === HeaderPosition.TOP ? (header.height / gridRows) : 40;

    const x = Math.floor(xPx / colWidth);
    const y = Math.floor(yPx / rowHeight);

    const newWidget: HeaderWidget = {
      id: `hw_${Date.now()}`,
      type,
      x: Math.max(0, Math.min(x, gridCols - 6)),
      y: Math.max(0, Math.min(y, gridRows - 1)),
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

  const layoutTokens = (designTokens as any).tokens?.layout;
  const hGrid = layoutTokens?.header_grid;
  const gridCols = hGrid?.cols?.value ?? 60;
  const gridRows = hGrid?.rows?.value ?? 12;
  const gapX = hGrid?.gap_x?.value ?? 4;
  const gapY = hGrid?.gap_y?.value ?? 2;

  return (
    <div
      ref={containerRef}
      className={`header-widget-layer absolute inset-0 z-20 ${(isEditMode || isPreviewMode) ? "pointer-events-auto" : "pointer-events-none"}`}
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
          cols: gridCols,
          rowHeight: header.position === HeaderPosition.TOP ? (header.height / gridRows - (gapY)) : 40,
          margin: [gapX, gapY],
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
                type="button"
                onClick={() => onUpdate({ widgets: widgets.filter((item) => item.id !== w.id) })}
                className="absolute -top-2 -right-2 w-5 h-5 bg-[var(--error)] text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-sm"
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
