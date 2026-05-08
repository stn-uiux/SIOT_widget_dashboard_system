
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey, Label
} from 'recharts';
import { Settings, GripVertical, FileSpreadsheet, Maximize2, X, MapPin, Image, Trash2, TrendingUp, User, CircleHelp } from 'lucide-react';
import { Widget, WidgetType, DashboardTheme, ThemeMode, ChartLibrary, ChartConfig, ChartSeries } from '../types';
import { GENERAL_KPI_ICON_OPTIONS } from '../constants';
import MapWidget from './MapWidget';
import chartLayoutTokens from '../chart-layout-tokens.json';
import {
  shadeColor,
  resolveColor,
  getSeriesModeColors,
  parseToHex,
  getGradientEndColor,
} from './widgetCard/chartColorUtils';
import { PIE_COLORS, CHART_LEFT_INSET } from './widgetCard/chartPalette';
import {
} from './widgetCard/facilityAssetUrls';
import { GENERAL_KPI_ICON_MAP, MATERIAL_SYMBOL_ICON_MAP } from './widgetCard/widgetCardIconMaps';
import {
} from './widgetCard/chartAxisMeasureComponents';
import { renderApexChart as renderApexLibraryChart, renderAmChart as renderAmLibraryChart } from './widgetCard/chartLibraryRenderers';
import { renderRechartsCoreChart } from './widgetCard/rechartsCoreRenderer';
import { renderDashboardWidget } from './widgetCard/dashboardWidgetRenderer';

interface WidgetCardProps {
  widget: Widget;
  theme: DashboardTheme;
  isEditMode: boolean;
  onEdit: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Widget>) => void;
  onDelete: (id: string) => void;
  onOpenExcel: (id: string) => void;
  /** 글래스모피즘 스타일(반투명·블러·테두리) 적용 */
  glassStyle?: boolean;
  /** Whether the widget is currently selected in edit mode */
  selected?: boolean;
  /** Whether the widget is currently being resized */
  isResizing?: boolean;
  /** Whether the widget is currently being dragged */
  isDragging?: boolean;
  isPreviewMode?: boolean;
  onTogglePreview?: () => void;
  userRole?: string;
}

const WidgetCard: React.FC<WidgetCardProps> = ({
  widget,
  theme,
  isEditMode,
  onEdit,
  onUpdate,
  onDelete,
  onOpenExcel,
  glassStyle,
  selected,
  isResizing,
  isDragging,
  isPreviewMode,
  onTogglePreview,
  userRole
}) => {
  const isDark = theme.mode === ThemeMode.DARK;

  const contentSize = theme.contentSize;
  const titleSize = widget.titleSize ?? theme.titleSize;
  const titleWeight = widget.titleWeight ?? theme.titleWeight;

  const strokeColor = 'var(--border-base)';
  const labelColor = theme.textColor || 'var(--text-muted)';

  const series = widget.config.series && widget.config.series.length > 0
    ? widget.config.series
    : [{ key: widget.config.yAxisKey || 'value', label: widget.title, color: 'var(--primary-color)' }];

  const chartKey = `chart-${widget.id}-${widget.type}-${series.map(s => s.key).join('-')}`;

  const renderSymbolIcon = (iconName: string | undefined, opts?: { className?: string; size?: string; style?: React.CSSProperties }) => {
    const raw = String(iconName || '').trim();
    const key = raw.toLowerCase();
    const IconComp = MATERIAL_SYMBOL_ICON_MAP[key];
    const style: React.CSSProperties = {
      width: opts?.size,
      height: opts?.size,
      ...opts?.style,
    };
    if (IconComp) {
      return <IconComp className={opts?.className} style={style} />;
    }
    // 폰트 글리프 캡처 실패 시 텍스트로 떨어지는 문제를 피하기 위해, 미매핑 아이콘도 SVG fallback으로 처리
    return <CircleHelp className={opts?.className} style={style} />;
  };

  const renderGoogleIcon = (iconName?: string) => {
    const icon = iconName || widget.icon;
    if (!icon) return null;
    const customIconSize = widget.iconSize;
    return (
      <div
        className="p-3 rounded-2xl flex items-center justify-center transition-all bg-[var(--border-muted)] text-[var(--text-main)] border border-[var(--border-base)]"
        style={customIconSize ? { width: `${customIconSize}px`, height: `${customIconSize}px`, padding: 0 } : {}}
      >
        {renderSymbolIcon(icon, {
          className: "text-[var(--text-main)]",
          size: customIconSize ? `${customIconSize * 0.6}px` : `calc(var(--content-size) * 2.5)`,
        })}
      </div>
    );
  };

  const renderChart = (overrides?: { type?: WidgetType, config?: ChartConfig, data?: any[], mainValue?: string, subValue?: string, icon?: string, noBezel?: boolean, isSecondary?: boolean }) => {
    const currentType = overrides?.type || widget.type;
    const currentConfig = overrides?.config || widget.config;
    const currentData = overrides?.data || widget.data || [];
    const currentMainValue = overrides?.mainValue || widget.mainValue;
    const currentSubValue = overrides?.subValue || widget.subValue;
    const currentIcon = overrides?.icon || (overrides?.isSecondary ? widget.secondaryIcon : widget.icon);
    const currentNoBezel = overrides?.noBezel ?? (overrides?.isSecondary ? widget.secondaryNoBezel : widget.noBezel);
    const isSec = overrides?.isSecondary || false;

    const { xAxisKey, xAxisLabel, showLegend, showGrid, showXAxis, showYAxis, showLabels, unit, showUnitInLegend } = currentConfig;

    // Calculate local series inside renderChart to handle secondary overrides correctly
    const localSeries = currentConfig.series && currentConfig.series.length > 0
      ? currentConfig.series.map((s) => {
          const modeColors = getSeriesModeColors(s, isDark);
          return { ...s, color: modeColors.color, endColor: modeColors.endColor };
        })
      : [{ key: currentConfig.yAxisKey || 'value', label: widget.title, color: theme.primaryColor }];

    const yAxisGutter = chartLayoutTokens.tokens.charts.common.yAxisGutter.value;
    const commonProps = {
      data: currentData,
      margin: { top: 6, right: 6, left: 0, bottom: xAxisLabel ? 26 : 4 }
    };

    const tooltipStyle = {
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border-base)',
      borderRadius: '12px',
      boxShadow: 'var(--shadow-premium)',
      fontSize: 'var(--content-size)',
      color: 'var(--text-main)',
      padding: '12px'
    };

    const tooltipLabelStyle = {
      color: 'var(--text-main)',
      fontWeight: 'bold',
      marginBottom: '4px',
      fontSize: 'var(--content-size)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.025em'
    };

    const tooltipItemStyle = {
      color: 'var(--text-secondary)',
      fontSize: 'var(--content-size)',
      fontWeight: '500',
      padding: '2px 0'
    };

    const renderCustomLegend = (items: { value: string, color: string }[]) => (
      <div
        className="flex flex-nowrap items-center justify-center whitespace-nowrap overflow-x-auto no-scrollbar"
        style={{ columnGap: 'var(--spacing-sm)', rowGap: '0', paddingInline: 'var(--spacing-xs)' }}
      >
        {items.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-bold whitespace-nowrap" style={{ fontSize: 'var(--content-size)', color: theme.textColor || 'var(--text-muted)' }}>
              {entry.value}
            </span>
          </div>
        ))}
        {showUnitInLegend && unit && (
          <div
            className="flex items-center border-l border-[var(--border-base)]"
            style={{ gap: 'var(--spacing-xs)', paddingLeft: 'var(--spacing-xs)', marginLeft: 'var(--spacing-xs)' }}
          >
            <span className="font-bold tracking-tight uppercase opacity-80" style={{ fontSize: 'calc(var(--content-size) * 0.85)', color: theme.textColor || 'var(--text-muted)' }}>
              단위: {unit}
            </span>
          </div>
        )}
      </div>
    );

    const renderLegend = (props: any) => {
      const { payload } = props;
      if (!payload) return null;

      // For Pie charts, we want to show all segments (categories)
      if (currentType === WidgetType.CHART_PIE) {
        const pieItems = payload.map((entry: any, index: number) => {
          let color = entry.color || entry.payload?.fill || '';
          if (!color || String(color).startsWith('url(')) {
            // Fallback to PIE_COLORS if no color found
            const rawPieColor = PIE_COLORS[index % PIE_COLORS.length];
            color = resolveColor(rawPieColor, theme.primaryColor, theme.primaryColor);
          }
          return { value: entry.value, color };
        });
        return renderCustomLegend(pieItems);
      }

      if (!localSeries) return null;

      // Force legend items to follow the exact order defined in the Sidebar (localSeries)
      // This ensures the custom reordering via arrows is properly reflected in the legend.
      const orderedItems = localSeries.map(s => {
        const p = payload.find((item: any) =>
          item.dataKey === s.key ||
          item.value === s.label ||
          item.payload?.dataKey === s.key
        );
        if (!p) return null;

        let color = p.color || p.payload?.fill || '';
        if (!color || String(color).startsWith('url(')) {
          color = resolveColor(s.color, theme.primaryColor, theme.primaryColor);
        }
        return { value: s.label, color };
      }).filter(Boolean) as { value: string, color: string }[];

      return renderCustomLegend(orderedItems);
    };

    const renderApexChart = () => {
      return renderApexLibraryChart({
        currentType,
        currentConfig,
        currentData,
        localSeries,
        theme,
        isDark,
        contentSize,
        labelColor,
        strokeColor,
        widget,
        renderCustomLegend,
      });
    };

    const renderAmChart = () => {
      return renderAmLibraryChart({
        currentType,
        currentConfig,
        currentData,
        localSeries,
        theme,
        isDark,
        contentSize,
        labelColor,
        strokeColor,
        widget,
        renderCustomLegend,
      });
    };

    const isGeneralWidget = [
      WidgetType.WEATHER, WidgetType.IMAGE, WidgetType.MAP, WidgetType.SUMMARY, WidgetType.SUMMARY_CHART, WidgetType.TABLE,
      WidgetType.GENERAL_KPI,
      WidgetType.EARNING_PROGRESS,
      WidgetType.EARNING_TREND,
      WidgetType.BLANK,
      WidgetType.TEXT_BLOCK,
      WidgetType.VERTICAL_NAV_CARD,
      WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_FACILITY_2_FIGMA,
      WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_SECURITY_STATUS_V2,
      WidgetType.DASH_VDI_STATUS, WidgetType.DASH_RANK_LIST, WidgetType.DASH_TRAFFIC_TOP5
    ].includes(currentType);

    if (theme.chartLibrary === ChartLibrary.APEXCHARTS && !isGeneralWidget) {
      return renderApexChart();
    }

    if (theme.chartLibrary === ChartLibrary.AMCHARTS && !isGeneralWidget) {
      return renderAmChart();
    }

    switch (currentType) {
      case WidgetType.SUMMARY: {
        const heroFontSize = widget.titleSize != null ? `${widget.titleSize}px` : 'var(--text-hero)';
        return (
          <div className="h-full flex flex-col justify-center px-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-baseline gap-2">
                {isEditMode && !isSec ? (
                  <input
                    type="text"
                    value={currentMainValue || '0'}
                    onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                    className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full text-main`}
                    style={{ fontSize: heroFontSize }}
                  />
                ) : (
                  <span className={`font-black tracking-tighter leading-tight text-main`} style={{ fontSize: heroFontSize }}>
                    {currentMainValue}
                  </span>
                )}
                {unit && (
                  <span className={`font-bold text-muted`} style={{ fontSize: 'var(--text-md)' }}>
                    {unit}
                  </span>
                )}
              </div>
              {renderGoogleIcon(currentIcon)}
            </div>
            {isEditMode && !isSec ? (
              <input
                type="text"
                value={currentSubValue || ''}
                onChange={(e) => onUpdate?.(widget.id, { subValue: e.target.value })}
                className="bg-transparent border-none p-0 w-full font-bold focus:ring-0 outline-none text-muted"
                style={{ fontSize: 'var(--text-md)' }}
              />
            ) : (
              <p className="font-bold leading-tight text-muted" style={{ fontSize: 'var(--text-md)' }}>
                {currentSubValue}
              </p>
            )}
          </div>
        );
      }

      case WidgetType.SUMMARY_CHART: {
        const summaryHeroFontSize = widget.titleSize != null ? `${widget.titleSize}px` : 'var(--text-hero)';
        const summaryColor = theme.primaryColor;
        return (
          <div className="relative h-full w-full flex flex-col justify-start pt-2">
            <div className="z-10 px-2 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-2">
                  {isEditMode && !isSec ? (
                    <input
                      type="text"
                      value={currentMainValue || '0'}
                      onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                      className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${(isDark ? 'text-white' : 'text-[var(--text-main)]')}`}
                      style={{ fontSize: summaryHeroFontSize }}
                    />
                  ) : (
                    <span className={`font-black tracking-tighter leading-tight ${(isDark ? 'text-white' : 'text-[var(--text-main)]')}`} style={{ fontSize: summaryHeroFontSize }}>
                      {currentMainValue}
                    </span>
                  )}
                  {unit && (
                    <span className={`font-bold mb-2 ${(isDark ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]')}`} style={{ fontSize: 'var(--text-md)' }}>
                      {unit}
                    </span>
                  )}
                </div>
              </div>
              <p className={`font-bold leading-tight ${(isDark ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]')}`} style={{ fontSize: 'var(--text-md)' }}>
                {currentSubValue}
              </p>
            </div>
            <div className="absolute bottom-[-24px] left-[-24px] right-[-24px] h-[55%] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={currentData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id={`grad-${widget.id}-${isSec ? 'sec' : 'main'}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={summaryColor} stopOpacity={0.4} />
                      <stop offset="50%" stopColor={summaryColor} stopOpacity={0.1} />
                      <stop offset="100%" stopColor={summaryColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={localSeries[0]?.key || 'value'}
                    stroke={summaryColor}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill={`url(#grad-${widget.id}-${isSec ? 'sec' : 'main'})`}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case WidgetType.WEATHER:
        return (
          <div className="h-full flex flex-col justify-center items-center gap-2 text-center" style={{ contain: 'layout style' }}>
            <div className="flex flex-col items-center gap-3">
              {renderSymbolIcon(widget.icon || 'partly_cloudy_day', {
                className: 'text-primary leading-none',
                size: widget.iconSize ? `${widget.iconSize}px` : 'var(--text-hero)',
                style: { opacity: 0.9 },
              })}
              <div className="space-y-1">
                <h4 className="font-black text-main tracking-tighter leading-tight m-0" style={{ fontSize: 'var(--text-hero)' }}>{currentMainValue}</h4>
                <p className="text-muted font-bold m-0" style={{ fontSize: 'var(--text-md)', opacity: 0.8 }}>{currentSubValue}</p>
              </div>
            </div>
          </div>
        );

      case WidgetType.GENERAL_KPI: {
        const iconKey = (widget.icon || 'User') as string;
        const GeneralIcon = GENERAL_KPI_ICON_MAP[iconKey] || User;
        const colorVar = GENERAL_KPI_ICON_OPTIONS.find((o) => o.value === iconKey)?.colorVar || '--primary-color';
        const customSize = widget.iconSize;
        return (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-6" style={{ gap: 'var(--spacing)' }}>
            <div
              className="rounded-full bg-[var(--surface-muted)] flex items-center justify-center shrink-0"
              style={{
                width: customSize ? `${customSize}px` : 'var(--content-size)',
                height: customSize ? `${customSize}px` : 'var(--content-size)',
                minWidth: customSize ? 'auto' : 48,
                minHeight: customSize ? 'auto' : 48
              }}
            >
              <GeneralIcon
                className="shrink-0"
                style={{
                  color: `var(${colorVar})`,
                  width: customSize ? `${customSize * 0.5}px` : 'var(--text-md)',
                  height: customSize ? `${customSize * 0.5}px` : 'var(--text-md)'
                }}
              />
            </div>
            {isEditMode && !isSec ? (
              <input
                type="text"
                value={currentSubValue || ''}
                onChange={(e) => onUpdate?.(widget.id, { subValue: e.target.value })}
                className="bg-transparent border-none p-0 w-full text-center focus:ring-0 outline-none text-[var(--text-muted)] uppercase tracking-wider"
                style={{ fontSize: 'var(--text-tiny)', fontWeight: 'var(--title-weight)' }}
              />
            ) : (
              <div className="text-[var(--text-muted)] uppercase tracking-wider" style={{ fontSize: 'var(--text-tiny)', fontWeight: 'var(--title-weight)' }}>
                {currentSubValue}
              </div>
            )}
            {isEditMode && !isSec ? (
              <input
                type="text"
                value={currentMainValue || '0'}
                onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                className="bg-transparent border-none p-0 w-full text-center focus:ring-0 outline-none text-[var(--text-main)]"
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}
              />
            ) : (
              <div className="leading-tight text-[var(--text-main)]" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}>
                {currentMainValue}
              </div>
            )}
          </div>
        );
      }

      case WidgetType.EARNING_PROGRESS: {
        const progress = Math.min(100, Math.max(0, widget.progressValue ?? 89));
        const circumference = 2 * Math.PI * 40;
        const strokeDash = (progress / 100) * circumference;
        const isTrendUp = !currentSubValue?.startsWith('-');
        return (
          <div className="h-full min-h-0 flex items-center justify-center" style={{ padding: 'var(--spacing)' }}>
            <div className="inline-flex items-center" style={{ gap: 'var(--spacing)' }}>
              <div className="shrink-0 relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={`earning-progress-grad-${widget.id}-${isSec ? 'sec' : 'main'}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-color)" />
                    <stop offset="100%" stopColor="var(--secondary-color)" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--surface-muted)" strokeWidth="10" />
                <circle cx="50" cy="50" r="40" fill="none" stroke={`url(#earning-progress-grad-${widget.id}-${isSec ? 'sec' : 'main'})`} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${strokeDash} ${circumference}`} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                {isEditMode && !isSec ? (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={progress}
                    onChange={(e) => onUpdate?.(widget.id, { progressValue: parseInt(e.target.value, 10) || 0 })}
                    className="w-12 bg-transparent border-none p-0 text-center focus:ring-0 outline-none text-[var(--text-main)]"
                    style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--title-weight)' }}
                  />
                ) : (
                  <span className="text-[var(--text-main)]" style={{ fontSize: 'var(--text-md)', fontWeight: 'var(--title-weight)' }}>{progress}</span>
                )}
                </div>
              </div>
              <div className="min-w-0 flex flex-col items-start justify-center text-left" style={{ gap: '2px' }}>
              {isEditMode && !isSec ? (
                <input
                  type="text"
                  value={widget.title}
                  onChange={(e) => onUpdate?.(widget.id, { title: e.target.value })}
                  className="bg-transparent border-none p-0 focus:ring-0 outline-none text-[var(--text-muted)] w-full truncate"
                  style={{ fontSize: 'var(--text-small)' }}
                  placeholder="Title"
                />
              ) : (
                <div className="text-[var(--text-muted)] truncate" style={{ fontSize: 'var(--text-small)' }}>{widget.title}</div>
              )}
              {isEditMode && !isSec ? (
                <input
                  type="text"
                  value={currentMainValue || ''}
                  onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                  className="bg-transparent border-none p-0 focus:ring-0 outline-none text-[var(--text-main)] w-full"
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}
                />
              ) : (
                <div className="text-[var(--text-main)] truncate" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}>{currentMainValue}</div>
              )}
              <div className="flex items-center gap-1 mt-0.5" style={{ gap: 'var(--spacing-xs)' }}>
                <TrendingUp className={`w-4 h-4 shrink-0 ${isTrendUp ? 'text-[var(--success)]' : 'text-[var(--error)] rotate-180'}`} />
                {isEditMode && !isSec ? (
                  <input
                    type="text"
                    value={currentSubValue || ''}
                    onChange={(e) => onUpdate?.(widget.id, { subValue: e.target.value })}
                    className="bg-transparent border-none p-0 focus:ring-0 outline-none w-16"
                    style={{ fontSize: 'var(--text-small)' }}
                  />
                ) : (
                  <span className={isTrendUp ? 'text-[var(--success)]' : 'text-[var(--error)]'} style={{ fontSize: 'var(--text-small)' }}>{currentSubValue}</span>
                )}
              </div>
            </div>
            </div>
          </div>
        );
      }

      case WidgetType.EARNING_TREND: {
        const trendPct = widget.trendPercent ?? 21;
        const trendUp = widget.trendUp !== false;
        const comparison = widget.comparisonText ?? 'Compared of $11,750 last year';
        const items = (widget.categoryItems && widget.categoryItems.length > 0)
          ? widget.categoryItems
          : [{ label: 'Sales', value: 8 }, { label: 'Product', value: 68, color: 'var(--warning)' }, { label: 'Marketing', value: 12 }];
        const chartData = (currentData?.length ? currentData : (widget.data?.length ? widget.data : [])) as { name: string; value: number }[];
        const series = currentConfig?.series?.[0];
        const strokeColor = series?.color ? resolveColor(series.color, theme.primaryColor, theme.primaryColor) : theme.primaryColor;
        const endColor = series?.endColor ? resolveColor(series.endColor, theme.primaryColor, theme.primaryColor) : strokeColor;
        const gradId = `earning-trend-grad-${widget.id}-${isSec ? 'sec' : 'main'}`;
        const heroWeight = theme.titleWeight;
        const trendHeroVar = widget.titleSize != null ? `${widget.titleSize}px` : undefined;
        return (
          <div className="h-full flex flex-col min-h-0" style={{ padding: 'var(--spacing)', gap: 'var(--spacing)' }}>
            <div
              className="shrink-0 trend-summary-hero-wrapper"
              style={{
                ...(trendHeroVar ? { ['--text-hero' as string]: trendHeroVar } : {}),
                ['--trend-hero-weight' as string]: heroWeight,
              }}
            >
              {isEditMode && !isSec ? (
                <input
                  type="text"
                  value={currentMainValue || ''}
                  onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                  className="trend-summary-hero w-full bg-transparent border-none p-0 focus:ring-0 outline-none text-[var(--text-main)] font-black tracking-tighter"
                />
              ) : (
                <div className="trend-summary-hero text-[var(--text-main)] font-black tracking-tighter leading-tight">{currentMainValue}</div>
              )}
              <div className="flex items-center gap-1 mt-0.5" style={{ gap: 'var(--spacing-xs)' }}>
                <span className={trendUp ? 'text-[var(--success)]' : 'text-[var(--error)]'} style={{ fontSize: 'var(--text-small)' }}>
                  {trendUp ? '▲' : '▼'} {trendPct}%
                </span>
              </div>
              {isEditMode && !isSec ? (
                <input
                  type="text"
                  value={comparison}
                  onChange={(e) => onUpdate?.(widget.id, { comparisonText: e.target.value })}
                  className="w-full mt-0.5 bg-transparent border-none p-0 text-[var(--text-muted)] focus:ring-0 outline-none"
                  style={{ fontSize: 'var(--text-tiny)' }}
                />
              ) : (
                <div className="text-[var(--text-muted)] mt-0.5" style={{ fontSize: 'var(--text-tiny)' }}>{comparison}</div>
              )}
            </div>
            <div className="flex-1 min-h-[80px] flex flex-col overflow-hidden">
              {chartData.length > 0 && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor={strokeColor} stopOpacity={1} />
                        <stop offset="100%" stopColor={endColor} stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <Line
                      type="natural"
                      dataKey={currentConfig?.series?.[0]?.key || 'value'}
                      stroke={`url(#${gradId})`}
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="shrink-0 flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
              {items.map((item, idx) => {
                const pct = Math.min(100, Math.max(0, item.value));
                const barColor = item.color ? resolveColor(item.color, 'var(--primary-color)', theme.primaryColor) : (theme.primaryColor || 'var(--primary-color)');
                return (
                  <div key={idx} className="flex items-center gap-2" style={{ gap: 'var(--spacing-sm)' }}>
                    <span className="text-[var(--text-muted)] shrink-0 w-20 truncate" style={{ fontSize: 'var(--text-small)' }}>{item.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden" style={{ borderRadius: 'var(--border-radius)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background: `linear-gradient(to right, ${barColor}, ${item.endColor ? resolveColor(item.endColor, 'var(--primary-color)', theme.primaryColor) : shadeColor(parseToHex(barColor), -20)})`,
                          borderRadius: 'var(--border-radius)'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case WidgetType.IMAGE:
        return (
          <div className="h-full w-full relative group overflow-hidden rounded-[var(--radius-md)] bg-[var(--border-muted)]">
            <img
              src={currentMainValue}
              alt={currentSubValue}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {currentSubValue && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-[var(--black-alpha-60)] to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-tiny)' }}>{currentSubValue}</p>
              </div>
            )}
            {isEditMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--black-alpha-40)] opacity-0 group-hover:opacity-100 transition-opacity">
                <label className="btn-base btn-surface p-2.5 rounded-xl cursor-pointer">
                  <Image className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          onUpdate?.(widget.id, { mainValue: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        );


      case WidgetType.MAP:
        // Parse lat, lng from subValue (e.g. "37.5665, 126.9780")
        const [lat, lng] = (widget.subValue || '37.5665, 126.9780').split(',').map(s => parseFloat(s.trim()));
        return (
          <div className={`h-full w-full relative bg-[var(--border-muted)] overflow-hidden ${widget.noBezel ? '' : 'rounded-[var(--radius-md)]'}`}
            style={{
              borderWidth: widget.noBezel ? '0' : 'var(--widget-border-width)',
              borderColor: 'var(--widget-border-color)',
              borderStyle: 'solid'
            }}
          >
            {/* Dynamic Import or standard import if possible. Here we use standard import but wrapped */}
            <div className="h-full w-full z-0">
              <MapWidget lat={lat || 37.5665} lng={lng || 126.9780} zoom={13} provider="osm" isDark={isDark} />
            </div>
            {!widget.noBezel && (
              <div className="absolute top-2 left-2 z-[1000] bg-[var(--white-alpha-90)] dark:bg-[var(--black-alpha-80)] px-2 py-1 rounded font-bold shadow-sm pointer-events-none" style={{ fontSize: 'var(--text-tiny)' }}>
                {currentMainValue}
              </div>
            )}
          </div>
        );



      case WidgetType.CHART_BAR:
      case WidgetType.DASH_EQUIP_PERF_TOP5:
      case WidgetType.CHART_BAR_HORIZONTAL:
        return renderRechartsCoreChart({
          currentType,
          currentData,
          currentConfig,
          localSeries,
          theme,
          isDark,
          contentSize,
          labelColor,
          strokeColor,
          showGrid,
          showXAxis,
          showYAxis,
          showLegend,
          xAxisKey,
          xAxisLabel,
          chartKey,
          commonProps,
          tooltipStyle,
          tooltipItemStyle,
          tooltipLabelStyle,
          renderLegend,
          renderCustomLegend,
          widgetId: widget.id,
          isPreviewMode,
        });

      case WidgetType.CHART_LINE:
      case WidgetType.CHART_AREA:
      case WidgetType.CHART_PIE:
      case WidgetType.CHART_RADAR:
      case WidgetType.CHART_SANKEY:
      case WidgetType.CHART_COMPOSED:
        return renderRechartsCoreChart({
          currentType,
          currentData,
          currentConfig,
          localSeries,
          theme,
          isDark,
          contentSize,
          labelColor,
          strokeColor,
          showGrid,
          showXAxis,
          showYAxis,
          showLegend,
          xAxisKey,
          xAxisLabel,
          chartKey,
          commonProps,
          tooltipStyle,
          tooltipItemStyle,
          tooltipLabelStyle,
          renderLegend,
          renderCustomLegend,
          widgetId: widget.id,
          isPreviewMode,
        });

      case WidgetType.TABLE:
        return (
          <div className="h-full flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse" style={{ fontSize: `${contentSize}px` }}>
                <thead>
                  <tr className="sticky top-0 z-10">
                    <th className={`pb-3 pt-3 px-3 font-bold uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--text-main)]`} style={{ borderBottom: `2px solid var(--primary-color)` }}>
                      {xAxisLabel || 'Item'}
                    </th>
                    {localSeries.map(s => (
                      <th key={s.key} className={`pb-3 pt-3 px-3 font-bold text-right uppercase tracking-wider bg-[var(--surface-muted)] text-[var(--text-main)]`} style={{ borderBottom: `2px solid var(--primary-color)` }}>
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-muted)] last:border-0 transition-colors hover:bg-[var(--border-muted)] text-secondary">
                      <td className="py-3 px-3 font-semibold text-main">{row[xAxisKey] || row.name}</td>
                      {localSeries.map(s => (
                        <td key={s.key} className="py-3 px-3 text-right font-mono font-bold text-primary">
                          {row[s.key]?.toLocaleString()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {unit && (
              <div className="flex justify-center mt-2 px-2">
                <span className="font-bold tracking-tight uppercase opacity-60 text-muted" style={{ fontSize: 'calc(var(--content-size) * 0.85)' }}>
                  단위: {unit}
                </span>
              </div>
            )}
          </div>
        );

      /* Premium Widget Implementations */

      case WidgetType.DASH_FAILURE_STATUS:
      case WidgetType.DASH_FACILITY_1:
      case WidgetType.DASH_FACILITY_2:
      case WidgetType.DASH_FACILITY_2_FIGMA:
      case WidgetType.DASH_RANK_LIST:
      case WidgetType.DASH_TRAFFIC_TOP5:
      case WidgetType.DASH_FAILURE_STATS:
      case WidgetType.DASH_RESOURCE_USAGE:
      case WidgetType.DASH_TRAFFIC_STATUS:
      case WidgetType.DASH_NET_TRAFFIC:
        return renderDashboardWidget({
          currentType,
          currentData,
          currentConfig,
          localSeries,
          currentMainValue,
          currentSubValue,
          currentIcon,
          contentSize,
          labelColor,
          strokeColor,
          showGrid,
          showXAxis,
          showYAxis,
          showLegend,
          xAxisKey,
          unit,
          commonProps,
          tooltipStyle,
          theme,
          isDark,
          widget,
          renderLegend,
          renderSymbolIcon,
          renderGoogleIcon,
        });

      case WidgetType.DASH_SECURITY_STATUS:
      case WidgetType.DASH_SECURITY_STATUS_V2:
      case WidgetType.DASH_VDI_STATUS:
        return renderDashboardWidget({
          currentType,
          currentData,
          currentConfig,
          localSeries,
          currentMainValue,
          currentSubValue,
          currentIcon,
          contentSize,
          labelColor,
          strokeColor,
          showGrid,
          showXAxis,
          showYAxis,
          showLegend,
          xAxisKey,
          unit,
          commonProps,
          tooltipStyle,
          theme,
          isDark,
          widget,
          renderLegend,
          renderSymbolIcon,
          renderGoogleIcon,
        });

      case WidgetType.TEXT_BLOCK: {
        const textContent = widget.mainValue ?? '';
        const fontSize = widget.titleSize ?? theme.contentSize ?? 16;
        const fontWeight = widget.titleWeight ?? '400';
        return (
          <div className="h-full flex flex-col justify-center p-2 overflow-hidden">
            {isEditMode ? (
              <textarea
                value={textContent}
                onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                placeholder="텍스트 입력..."
                className="w-full h-full min-h-[80px] bg-transparent border-none p-0 resize-none focus:ring-0 outline-none text-[var(--text-main)] placeholder:text-[var(--text-muted)]"
                style={{ fontSize: `${fontSize}px`, fontWeight }}
              />
            ) : (
              <div
                className="text-[var(--text-main)] break-words whitespace-pre-wrap overflow-auto"
                style={{ fontSize: `${fontSize}px`, fontWeight }}
              >
                {textContent || <span className="text-[var(--text-muted)] italic">텍스트를 입력하세요</span>}
              </div>
            )}
          </div>
        );
      }

      case WidgetType.VERTICAL_NAV_CARD: {
        const items = widget.navItems ?? [];
        const navIndicatorSrc = new URL('../assets/nav-indicator.png', import.meta.url).href;
        const updateItemLabel = (index: number, label: string) => {
          const next = (widget.navItems ?? []).map((it, j) => (j === index ? { ...it, label } : it));
          onUpdate?.(widget.id, { navItems: next });
        };
        return (
          <div className="h-full flex overflow-hidden">
            <div
              className="flex-shrink-0 flex items-center overflow-hidden"
              style={{
                minWidth: '80px',
                width: '80px',
                paddingLeft: 'var(--spacing-xs)',
                paddingRight: 0,
              }}
            >
              <img
                src={navIndicatorSrc}
                alt=""
                className="max-h-full w-auto max-w-full object-contain object-left"
                style={{ display: 'block' }}
              />
            </div>
            <div
              className="flex-1 flex flex-col min-w-0 overflow-auto justify-center"
              style={{ gap: 'var(--nav-card-gap)', marginLeft: '8px' }}
            >
              {items.map((item, index) => {
                const isActive = item.active;
                return (
                  <div
                    key={item.id}
                    className={`nav-card-item ${isActive ? 'nav-card-item--active' : ''}`}
                  >
                    {isEditMode ? (
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateItemLabel(index, e.target.value)}
                        className="w-full max-w-[80%] bg-transparent border-none p-0 text-center font-bold focus:ring-0 outline-none placeholder:opacity-60"
                        style={{ color: 'var(--text-main)', fontSize: 'var(--content-size)' }}
                        placeholder="텍스트"
                      />
                    ) : (
                      <span
                        className="font-bold tracking-tight"
                        style={{ color: 'var(--text-main)', fontSize: 'var(--content-size)' }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      case WidgetType.BLANK:

      default:
        return <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">No Preview</div>;
    }
  };

  const bgOpacity = widget.backgroundOpacity ?? 100;
  const cardStyle: React.CSSProperties | undefined = glassStyle
    ? undefined
    : (bgOpacity >= 100
      ? { backgroundColor: 'var(--surface)' }
      : { backgroundColor: `color-mix(in srgb, var(--surface) ${bgOpacity}%, transparent)` });
  const glassStyleInline: React.CSSProperties | undefined = glassStyle
    ? {
      background: bgOpacity >= 100
        ? 'var(--glass-bg)'
        : `rgba(var(--glass-bg-rgb), calc(var(--glass-opacity) * ${bgOpacity / 100}))`,
      backdropFilter: `blur(var(--glass-blur, 12px))`,
      WebkitBackdropFilter: `blur(var(--glass-blur, 12px))`,
      border: (bgOpacity > 0 && !widget.noBorder) ? 'var(--glass-border)' : 'none',
      boxShadow: bgOpacity > 0 ? 'var(--glass-shadow)' : 'none',
    }
    : undefined;

  const isInteracting = isResizing || isDragging;

  // Trigger ApexCharts resize on mount or theme change
  React.useEffect(() => {
    if (theme.chartLibrary === ChartLibrary.APEXCHARTS) {
      const timer = setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [theme.chartLibrary, widget.id]);

  return (
    <div className="h-full flex flex-col group relative">
      {isEditMode && (
        <div
          className="drag-handle absolute left-0 top-0 z-20 h-14 w-2 rounded-r-md cursor-pointer shrink-0"
          style={{
            background: `linear-gradient(180deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 75%, transparent) 100%)`,
            boxShadow: `0 0 14px 3px color-mix(in srgb, var(--primary-color) 55%, transparent), 0 0 28px 6px color-mix(in srgb, var(--primary-color) 25%, transparent)`,
          }}
          title="드래그하여 이동"
        />
      )}
      <div
        data-widget-capture-id={widget.id}
        className={`flex-1 flex flex-col overflow-hidden ${isInteracting ? '' : 'transition-all duration-300'} 
          ${!widget.noBezel && !glassStyle ? `rounded-design shadow-base p-design ${bgOpacity >= 100 ? 'bg-surface' : ''}` : ''} 
          ${glassStyle ? 'rounded-design p-design widget-glass' : ''} 
          ${isEditMode ? 'edit-mode-indicator' : ''} 
          ${widget.noBezel && !glassStyle ? (bgOpacity >= 100 ? 'bg-surface p-design' : 'p-design') : ''}
          ${widget.noBorder ? 'no-border' : 'border-main'}
        `}
        style={glassStyleInline ?? cardStyle}
      >
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ paddingLeft: CHART_LEFT_INSET, paddingRight: CHART_LEFT_INSET }}>
          {(widget.type !== WidgetType.DASH_FACILITY_2_FIGMA) && (!widget.hideHeader || isEditMode) && (
            <div className="flex items-center justify-between mb-0 flex-shrink-0 gap-2 widget-header-row" style={{ ['--header-title-size' as string]: `${titleSize}px` }}>
              <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                {isEditMode ? (
                  <input
                    type="text"
                    value={widget.title}
                    onChange={(e) => onUpdate?.(widget.id, { title: e.target.value })}
                    className="widget-header-title-input bg-transparent border-none p-0 font-bold focus:ring-0 outline-none w-full truncate text-main"
                    style={{ fontSize: widget.titleSize ? `${widget.titleSize}px` : 'var(--title-size)', fontWeight: widget.titleWeight || 'var(--title-weight)' }}
                  />
                ) : (
                  <h3 className="font-bold truncate text-main" style={{ fontSize: widget.titleSize ? `${widget.titleSize}px` : 'var(--title-size)', fontWeight: widget.titleWeight || 'var(--title-weight)' }}>
                    {widget.title}
                  </h3>
                )}
                {isEditMode && widget.hideHeader && (
                  <span className="text-[10px] uppercase tracking-tighter font-black px-1.5 py-0.5 rounded border border-muted/30 text-muted/50 flex-shrink-0 ml-1">
                    Hidden in View
                  </span>
                )}
              </div>



              {isEditMode && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  {userRole === 'admin' ? (
                    <>
                      <button
                        onClick={() => onEdit(widget.id)}
                        className="widget-action-btn"
                        title="Settings"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenExcel(widget.id)}
                        className="widget-action-btn"
                        title="Open Data"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(widget.id)}
                        className="widget-action-btn widget-action-btn-danger"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="px-2 py-1 rounded bg-[var(--surface-muted)] border border-[var(--border-base)]">
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-40">View Only</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden mt-0" style={{ paddingLeft: 'var(--spacing)', paddingRight: 'var(--spacing)' }}>
            {widget.isDual ? (
              <div
                className="w-full h-full flex flex-col md:flex-row"
                style={{
                  flexDirection: widget.dualLayout === 'vertical' ? 'column' : 'row',
                  gap: `${widget.dualGap || 16}px`
                }}
              >
                <div className="flex-1 min-h-0 overflow-hidden">
                  {widget.showSubTitles && widget.subTitle1 && (
                    <div className="text-[10px] font-black uppercase text-muted mb-2 tracking-widest">{widget.subTitle1}</div>
                  )}
                  {renderChart()}
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {widget.showSubTitles && widget.subTitle2 && (
                    <div className="text-[10px] font-black uppercase text-muted mb-2 tracking-widest">{widget.subTitle2}</div>
                  )}
                  {renderChart({
                    type: widget.secondaryType,
                    config: widget.secondaryConfig,
                    data: widget.secondaryData,
                    mainValue: widget.secondaryMainValue,
                    subValue: widget.secondarySubValue,
                    icon: widget.secondaryIcon,
                    noBezel: widget.secondaryNoBezel,
                    isSecondary: true
                  })}
                </div>
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WidgetCard);
