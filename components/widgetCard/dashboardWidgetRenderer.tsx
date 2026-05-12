import React from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import chartLayoutTokens from '../../chart-layout-tokens.json';
import { DashboardTheme, Widget, WidgetType, ChartConfig, ChartSeries } from '../../types';
import { resolveColor } from './chartColorUtils';
import { RechartsNumericYAxisMeasure } from './chartAxisMeasureComponents';
import { PIE_COLORS } from './chartPalette';
import { TrafficStatusChart } from './TrafficStatusChart';
import {
  FACILITY_SERVER_ICON_SRC,
  FACILITY_NETWORK_ICON_SRC,
  FACILITY_SERVER_ICON_DARK_SRC,
  FACILITY_NETWORK_ICON_DARK_SRC,
  FACILITY_CARD_DARK_SRC,
  FACILITY_BG_LIGHT_SRC,
  FACILITY_BG_DARK_SRC,
} from './facilityAssetUrls';

interface DashboardWidgetRendererProps {
  currentType: WidgetType;
  currentData: any[];
  currentConfig: ChartConfig;
  localSeries: ChartSeries[];
  currentMainValue?: string;
  currentSubValue?: string;
  currentIcon?: string;
  contentSize: number;
  labelColor: string;
  strokeColor: string;
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showLegend: boolean;
  xAxisKey: string;
  unit?: string;
  commonProps: any;
  tooltipStyle: React.CSSProperties;
  theme: DashboardTheme;
  isDark: boolean;
  widget: Widget;
  /** Used so embedded titles stay in sync when the card chrome header is hidden in view mode. */
  isEditMode?: boolean;
  renderLegend: (props: any) => React.ReactElement | null;
  renderSymbolIcon: (iconName: string | undefined, opts?: { className?: string; size?: string; style?: React.CSSProperties }) => React.ReactNode;
  renderGoogleIcon: (iconName?: string) => React.ReactNode;
}

export const renderDashboardWidget = (props: DashboardWidgetRendererProps): React.ReactNode => {
  const {
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
    isEditMode = false,
    renderLegend,
    renderSymbolIcon,
    renderGoogleIcon,
  } = props;

  switch (currentType) {
    case WidgetType.DASH_FAILURE_STATUS:
      return (
        <div className="h-full flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-2">
            {currentData.slice(0, 4).map((d: any, idx: number) => (
              <div key={idx} className="flex flex-col items-center p-2 bg-[var(--surface-muted)] border border-[var(--border-base)] transition-all hover:scale-105 group" style={{ borderRadius: theme.chartRadius }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="font-bold text-muted uppercase tracking-tighter" style={{ fontSize: 'var(--text-tiny)' }}>{d.name}</span>
                </div>
                <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-lg)' }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="relative h-12 overflow-hidden bg-gradient-to-r from-[var(--primary-color)] to-[var(--secondary-color)] p-px shadow-lg shadow-[var(--primary-subtle)] group cursor-pointer transition-all hover:shadow-[var(--primary-color)]/40" style={{ borderRadius: 'var(--border-radius)' }}>
              <div className="absolute inset-x-0 h-1/2 bottom-0 bg-[var(--white-alpha-10)] group-hover:h-full transition-all" />
              <div className="relative h-full w-full flex items-center justify-between px-6 text-white font-black" style={{ fontSize: 'var(--text-base)' }}>
                <div className="flex items-center gap-3">
                  <span className="opacity-80">처리중</span>
                  <span style={{ fontSize: 'var(--text-md)' }}>{currentMainValue}</span>
                </div>
                <div className="w-px h-4 bg-[var(--white-alpha-30)]" />
                <div className="flex items-center gap-3">
                  <span className="opacity-80">대기중</span>
                  <span style={{ fontSize: 'var(--text-md)' }}>{currentSubValue}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    case WidgetType.DASH_FACILITY_1:
      return (
        <div className="h-full flex items-center justify-center">
          <div className="flex items-center w-full max-w-md">
            {currentData.map((d: any, idx: number) => (
              <React.Fragment key={idx}>
                <div className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="font-bold text-muted uppercase tracking-widest" style={{ fontSize: 'var(--text-tiny)' }}>{d.name}</span>
                  <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-hero)' }}>{d.value}</span>
                </div>
                {idx < currentData.length - 1 && <div className="w-px h-16 bg-[var(--border-muted)] mx-4" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    case WidgetType.DASH_FACILITY_2:
      return (
        <div className="h-full flex flex-col justify-center gap-6 px-4">
          {currentData.map((d: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className={`bg-gradient-to-br transition-all group-hover:scale-110 shadow-lg ${idx === 0 ? 'from-[var(--surface-elevated)] to-[var(--surface-muted)] shadow-[var(--black-alpha-10)]' : 'from-[var(--primary-color)] to-[var(--secondary-color)] shadow-[var(--primary-subtle)]'}`} style={{ borderRadius: 'var(--border-radius)', width: widget.iconSize ? `${widget.iconSize}px` : undefined, height: widget.iconSize ? `${widget.iconSize}px` : undefined, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: widget.iconSize ? 0 : undefined }}>
                  {renderSymbolIcon(d.icon, { className: 'text-white', size: widget.iconSize ? `${widget.iconSize * 0.6}px` : '1.5rem' })}
                </div>
                <span className="font-bold text-muted uppercase tracking-tight" style={{ fontSize: 'var(--text-md)' }}>{d.name}</span>
              </div>
              <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-hero)' }}>{d.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    case WidgetType.DASH_FACILITY_2_FIGMA: {
      const isDarkFacility = theme.mode === 'dark';
      const facilityBgSrc = isDarkFacility ? FACILITY_BG_DARK_SRC : FACILITY_BG_LIGHT_SRC;
      const showEmbeddedTitle = Boolean(widget.hideHeader && !isEditMode);
      return (
        <div className="h-full flex flex-col" style={{ gap: 'calc(var(--spacing-sm) + var(--spacing-xs))', padding: 'calc(var(--spacing-sm) + var(--spacing-xs))' }}>
          {showEmbeddedTitle && (
            <div className="text-main" style={{ fontSize: 'var(--title-size)', fontWeight: 'var(--title-weight)' }}>
              {widget.title}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center border-main rounded-md" style={{ padding: 'var(--spacing-lg)', gap: 'var(--spacing-lg)', backgroundColor: 'var(--surface)', backgroundImage: isDarkFacility ? `url("${FACILITY_CARD_DARK_SRC}")` : `url("${facilityBgSrc}")`, backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
            {currentData.map((d: any, idx: number) => {
              const isServer = String(d?.icon ?? d?.name ?? '').toLowerCase().includes('database') || String(d?.name ?? '').includes('서버');
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <img alt="" src={isDarkFacility ? (isServer ? FACILITY_SERVER_ICON_DARK_SRC : FACILITY_NETWORK_ICON_DARK_SRC) : (isServer ? FACILITY_SERVER_ICON_SRC : FACILITY_NETWORK_ICON_SRC)} style={{ width: 'var(--spacing-md)', height: 'var(--spacing-md)' }} />
                    <span className={isDarkFacility ? 'fw-medium text-[var(--white)]' : 'text-main fw-medium'} style={{ fontSize: 'calc(var(--text-md) + var(--spacing-xs))' }}>{d.name}</span>
                  </div>
                  <span className={isDarkFacility ? 'fw-medium text-[var(--white)]' : 'text-main fw-medium'} style={{ fontSize: 'calc(var(--text-lg) + var(--spacing-sm))' }}>{Number(d.value).toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    case WidgetType.DASH_RANK_LIST:
      return (
        <div className="h-full flex items-center gap-8 px-4 overflow-hidden">
          <div className="flex-shrink-0 flex items-center justify-center">
            {renderSymbolIcon(currentIcon || 'schema', { className: 'text-muted opacity-40 select-none', size: widget.iconSize ? `${widget.iconSize}px` : 'min(90px, 10vh)' })}
          </div>
          <div className="flex-1 flex flex-col gap-3 py-1 overflow-y-auto no-scrollbar justify-center h-full">
            {currentData.map((d: any, idx: number) => {
              const maxVal = Math.max(...currentData.map((i: any) => i.value)) || 1;
              const widthPercent = (d.value / maxVal) * 100;
              return (
                <div key={idx} className="flex flex-col gap-1 group cursor-pointer">
                  <div className="bg-[var(--surface-muted)] overflow-hidden relative shadow-inner" style={{ height: `${Math.max(4, (currentConfig.barWidth ?? 60) * 0.5)}px`, borderRadius: '999px' }}>
                    <div className="h-full transition-all duration-1000 group-hover:brightness-110 shadow-lg relative" style={{ width: `${widthPercent}%`, background: 'linear-gradient(to right, var(--premium-start), var(--premium-end))', borderRadius: '999px' }}>
                      <div className="absolute inset-0 flex items-center px-4 whitespace-nowrap">
                        <span className="text-white font-black tracking-tight drop-shadow-md" style={{ fontSize: 'var(--text-small)' }}>{d.name} : {d.value.toLocaleString()}{unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    case WidgetType.DASH_TRAFFIC_TOP5:
      return (
        <div className="h-full flex flex-col gap-1.5 min-h-0 overflow-y-auto py-1 justify-center">
          {currentData.map((d: any, idx: number) => {
            const maxVal = Math.max(...currentData.map((i: any) => i.value)) || 1;
            const widthPercent = (d.value / maxVal) * 100;
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0" style={{ minHeight: 28 }}>
                <div className="flex-shrink-0 text-left font-bold text-main whitespace-nowrap" style={{ fontSize: 'var(--text-small)', minWidth: 0 }}>{d.name}</div>
                <div className="flex-1 bg-[var(--surface-muted)] overflow-hidden min-w-0" style={{ height: `${(currentConfig.barWidth ?? 60) * 0.16}px`, borderRadius: `${theme.chartRadius}px` }}>
                  <div className="h-full transition-all duration-500" style={{ width: `${widthPercent}%`, background: 'var(--chart-gradient-multi)', borderRadius: `${theme.chartRadius}px` }} />
                </div>
                <div className="flex-shrink-0 text-right font-bold text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-small)' }}>{Number(d.value).toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      );
    case WidgetType.DASH_FAILURE_STATS:
      return (
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={currentData} margin={commonProps.margin}>
              <defs>
                {localSeries.map((s, idx) => (
                  <linearGradient key={`grad-stats-${idx}`} id={`grad-stats-${idx}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.6} />
                    <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} opacity={0.5} />
              <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} stroke={labelColor} fontSize={parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--text-tiny')) || 10} fontWeight="600" height={24} />
              <YAxis hide />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
              {localSeries.map((s, idx) => (
                <Area key={s.key} type="monotone" dataKey={s.key} stroke={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} strokeWidth={currentConfig.barWidth != null ? Math.max(1, currentConfig.barWidth * 0.12) : 4} fillOpacity={1} fill={`url(#grad-stats-${idx})`} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6, strokeWidth: 0, fill: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    case WidgetType.DASH_RESOURCE_USAGE:
      return (
        <div className="h-full flex items-center gap-6 px-2">
          {currentIcon && <div className="flex-shrink-0 transition-transform hover:scale-110">{renderGoogleIcon(currentIcon)}</div>}
          <div className="flex-1 flex flex-col gap-4 justify-center py-2">
            {currentData.map((d: any, idx: number) => (
              <div key={idx} className="flex flex-col gap-1.5 group">
                <div className="flex justify-between items-center px-1">
                  <div className="font-black text-muted uppercase tracking-tight group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-tiny)' }}>{d.name}</div>
                  <div className="font-mono font-black text-main" style={{ fontSize: 'var(--text-tiny)' }}>{d.value}%</div>
                </div>
                <div className="h-3 bg-[var(--surface-muted)] overflow-hidden rounded-full p-[2px]">
                  <div className="h-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${d.value}%`, background: `linear-gradient(to right, ${resolveColor(d.color, theme.primaryColor, theme.primaryColor)}, ${resolveColor(d.color, theme.primaryColor, theme.primaryColor)}88)` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    case WidgetType.DASH_TRAFFIC_STATUS:
      return (
        <div className="h-full relative">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <TrafficStatusChart currentData={currentData} valueKey={currentConfig.series[0]?.key || 'value'} contentSize={contentSize} labelColor={labelColor} strokeColor={strokeColor} showGrid={showGrid} showXAxis={showXAxis} showYAxis={showYAxis} showLegend={showLegend} xAxisKey={xAxisKey} localSeries={localSeries} theme={theme} tooltipStyle={tooltipStyle} renderLegend={renderLegend as any} resolveColor={resolveColor} />
          </ResponsiveContainer>
        </div>
      );
    case WidgetType.DASH_NET_TRAFFIC:
      return (
        <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
          {(yAxisWidth) => (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={currentData} margin={{ ...commonProps.margin, left: -24, right: -10 }}>
                  <defs>
                    {localSeries.map((s, idx) => (
                      <linearGradient key={idx} id={`gradNet-${idx}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} opacity={0.2} />}
                  <XAxis dataKey={xAxisKey} hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} height={24} padding={{ left: 0, right: 0 }} />
                  <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {showLegend && <Legend content={renderLegend} verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                  {localSeries.map((s, idx) => (
                    <Area key={idx} type="natural" dataKey={s.key} stroke={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} strokeWidth={2} fill={`url(#gradNet-${idx})`} dot={false} stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? '1' : undefined} />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </RechartsNumericYAxisMeasure>
      );
    case WidgetType.DASH_SECURITY_STATUS:
      return (
        <div className="h-full flex items-center gap-6">
          <div className="flex flex-col items-center gap-3">
            <div
              className="relative rounded-full border-4 border-dashed border-[var(--primary-color)]/30 flex items-center justify-center group cursor-pointer transition-all hover:border-[var(--primary-color)] hover:rotate-12"
              style={{
                width: widget.iconSize ? `${widget.iconSize}px` : '8rem',
                height: widget.iconSize ? `${widget.iconSize}px` : '8rem'
              }}
            >
              <div className="absolute inset-2 rounded-full bg-[var(--primary-color)]/5 group-hover:bg-[var(--primary-color)]/10 transition-colors" />
              {renderSymbolIcon('verified_user', {
                className: 'text-[var(--primary-color)]',
                size: widget.iconSize ? `${widget.iconSize * 0.4}px` : '2.25rem',
              })}
              <div className="absolute -bottom-2 bg-[var(--primary-color)] text-white px-3 py-1 rounded-full font-black shadow-lg shadow-[var(--primary-color)]/40" style={{ fontSize: 'var(--text-tiny)' }}>{currentMainValue}</div>
            </div>
            <span className="font-black text-muted uppercase tracking-widest" style={{ fontSize: 'var(--text-tiny)' }}>보안성공/탐지</span>
          </div>
          <div className="flex-1 h-full overflow-hidden py-2">
            <table className="w-full h-full font-bold border-collapse" style={{ fontSize: 'var(--text-base)' }}>
              <thead className="text-muted uppercase tracking-tighter border-b border-[var(--border-base)]" style={{ fontSize: 'var(--text-tiny)' }}>
                <tr>
                  <th className="text-left pb-2">유형</th>
                  {widget.config?.series?.map((s: any) => (
                    <th key={s.key} className="text-right pb-2">{s.label}</th>
                  )) || (
                    <>
                      <th className="text-right pb-2">오늘</th>
                      <th className="text-right pb-2">주간</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-muted)]">
                {currentData.map((d: any, idx: number) => (
                  <tr key={idx} className="group hover:bg-[var(--primary-subtle)] transition-colors">
                    <td className="py-2.5 text-secondary">{d.name}</td>
                    {widget.config?.series?.map((s: any, sIdx: number) => (
                      <td
                        key={s.key}
                        className={`py-2.5 text-right font-mono ${sIdx === 0 ? 'text-main group-hover:text-primary' : 'text-muted'}`}
                      >
                        {d[s.key]?.toLocaleString() ?? '-'}
                      </td>
                    )) || (
                      <>
                        <td className="py-2.5 text-right font-mono text-main group-hover:text-primary">{d.today}</td>
                        <td className="py-2.5 text-right font-mono text-muted">{d.weekly}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    case WidgetType.DASH_SECURITY_STATUS_V2: {
      const v2Main = currentMainValue ?? '0';
      const v2Rows = Array.isArray(currentData) ? currentData : [];
      const headerBg = 'var(--primary-gradient)';
      const rowAltBg = 'color-mix(in srgb, var(--border-muted) 70%, transparent)';
      const rowBaseBg = 'color-mix(in srgb, var(--surface) 50%, transparent)';
      return (
        <div className="h-full flex items-center" style={{ gap: 'var(--spacing-xs)' }}>
          <div
            className="flex flex-col items-center justify-center shrink-0"
            style={{
              width: 'calc(var(--spacing-sm) * 15)',
              gap: 'var(--spacing-xs)',
              height: '100%',
            }}
          >
            <div className="flex flex-col items-center" style={{ gap: 'var(--spacing-nano)' }}>
              <div className="text-muted fw-bold" style={{ fontSize: 'var(--text-small)' }}>
                보안침해/탐지
              </div>
              <div className="text-main fw-bold" style={{ fontSize: 'var(--text-lg)' }}>
                {v2Main}
              </div>
            </div>

            <svg
              width="76"
              height="76"
              viewBox="0 0 76 76"
              aria-hidden="true"
              style={{ color: 'var(--primary-color)' }}
            >
              <circle
                cx="38"
                cy="38"
                r="30"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray="4 10"
                opacity="0.85"
              />
              <path
                d="M38 20c7 4 12 4 12 4v14c0 10-8 16-12 18-4-2-12-8-12-18V24s5 0 12-4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinejoin="round"
              />
              <circle cx="44.5" cy="41.5" r="6" fill="none" stroke="currentColor" strokeWidth="3" />
              <path d="M49 46l6 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>

          <div className="flex-1 h-full min-w-0 flex flex-col justify-center">
            <div
              className="w-full flex items-center text-white fw-bold"
              style={{
                height: '28px',
                borderTopLeftRadius: `${theme.chartRadius}px`,
                borderTopRightRadius: `${theme.chartRadius}px`,
                background: headerBg,
              }}
            >
              <div className="flex-1 flex items-center justify-center" style={{ fontSize: 'var(--text-small)' }}>유형</div>
              <div className="flex items-center justify-center" style={{ width: '72px', fontSize: 'var(--text-small)' }}>오늘</div>
              <div className="flex items-center justify-center" style={{ width: '72px', fontSize: 'var(--text-small)' }}>주간</div>
            </div>

            <div
              className="w-full overflow-hidden"
              style={{
                borderBottomLeftRadius: `${theme.chartRadius}px`,
                borderBottomRightRadius: `${theme.chartRadius}px`,
                border: '1px solid var(--border-base)',
                borderTop: 'none',
              }}
            >
              {v2Rows.map((r: any, idx: number) => {
                const bg = idx % 2 === 1 ? rowAltBg : rowBaseBg;
                return (
                  <div key={idx} className="flex items-stretch" style={{ background: bg }}>
                    <div
                      className="flex-1 flex items-center justify-center"
                      style={{
                        padding: 'calc(var(--spacing-xs) + var(--spacing-nano))',
                        borderRight: '1px solid var(--border-base)',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--text-small)',
                      }}
                    >
                      {r.name}
                    </div>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: '72px',
                        padding: 'calc(var(--spacing-xs) + var(--spacing-nano))',
                        borderRight: '1px solid var(--border-base)',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-bold)',
                      }}
                    >
                      {Number(r.today ?? 0).toLocaleString()}
                    </div>
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: '72px',
                        padding: 'calc(var(--spacing-xs) + var(--spacing-nano))',
                        color: 'var(--text-secondary)',
                        fontSize: 'var(--text-base)',
                        fontWeight: 'var(--font-bold)',
                      }}
                    >
                      {Number(r.weekly ?? 0).toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }
    case WidgetType.DASH_VDI_STATUS: {
      const vdiMeasureKey = currentConfig.yAxisKey || localSeries[0]?.key || 'value';
      const vdiNameKey = xAxisKey || 'name';
      const vdiLabel = (d: any) => String(d?.[vdiNameKey] ?? d?.name ?? '');
      const vdiMeasure = (d: any) => {
        const raw = d?.[vdiMeasureKey] ?? d?.value;
        const n = Number(raw);
        return Number.isFinite(n) ? n : 0;
      };
      return (
        <div className="h-full flex flex-col justify-center gap-4">
          {currentData.map((d: any, idx: number) => (
            <div key={idx} className="relative group overflow-hidden bg-[var(--surface-muted)] border border-[var(--border-base)] p-4 flex items-center justify-between transition-all hover:bg-[var(--surface)] hover:shadow-premium cursor-pointer" style={{ borderRadius: theme.chartRadius }}>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative z-10 font-bold text-secondary uppercase tracking-tight" style={{ fontSize: 'var(--text-base)' }}>{vdiLabel(d)}</span>
              <div className="relative z-10 flex items-baseline gap-1">
                <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-lg)' }}>{vdiMeasure(d).toLocaleString()}</span>
                <span className="font-black text-muted uppercase" style={{ fontSize: 'var(--text-tiny)' }}>건</span>
              </div>
            </div>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
};
