import React from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Label,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Sankey,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { WidgetType, DashboardTheme, ChartConfig, ChartSeries } from '../../types';
import chartLayoutTokens from '../../chart-layout-tokens.json';
import { HorizontalBarChartYAxisMeasure, RechartsNumericYAxisMeasure } from './chartAxisMeasureComponents';
import { getGradientEndColor, parseToHex, resolveColor } from './chartColorUtils';
import { PIE_COLORS } from './chartPalette';

interface RechartsCoreRendererProps {
  currentType: WidgetType;
  currentData: any[];
  currentConfig: ChartConfig;
  localSeries: ChartSeries[];
  theme: DashboardTheme;
  isDark: boolean;
  contentSize: number;
  labelColor: string;
  strokeColor: string;
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showLegend: boolean;
  xAxisKey: string;
  xAxisLabel?: string;
  chartKey: string;
  commonProps: any;
  tooltipStyle: React.CSSProperties;
  tooltipItemStyle: React.CSSProperties;
  tooltipLabelStyle: React.CSSProperties;
  renderLegend: (props: any) => React.ReactElement | null;
  renderCustomLegend: (items: { value: string; color: string }[]) => React.ReactNode;
  widgetId: string;
  isPreviewMode?: boolean;
}

export const renderRechartsCoreChart = (props: RechartsCoreRendererProps): React.ReactNode => {
  const {
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
    widgetId,
    isPreviewMode,
  } = props;

  switch (currentType) {
    case WidgetType.CHART_BAR:
    case WidgetType.DASH_EQUIP_PERF_TOP5:
      return (
        <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
          {(yAxisWidth) => (
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
                  <BarChart {...commonProps}>
                    {currentConfig.useGradient && (
                      <defs>
                        {localSeries.map((s, idx) => {
                          const rawColor = resolveColor(s.color, theme.primaryColor, theme.primaryColor);
                          const color = parseToHex(rawColor);
                          const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                          const stopEndColor = getGradientEndColor(color, endColorRaw, isDark);
                          const stopEndOpacity = endColorRaw ? 1 : 0.2;
                          const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                          const gradId = `g-bar-${idx}-${safeWidgetId}`;
                          return (
                            <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="95%" stopColor={stopEndColor} stopOpacity={stopEndOpacity} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                    )}
                    {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                    {showXAxis && (
                      <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} height={24}>
                        {xAxisLabel && (
                          <Label value={xAxisLabel} position="insideBottom" offset={-10} style={{ fontSize: 'var(--text-tiny)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fill: 'var(--text-muted)' }} />
                        )}
                      </XAxis>
                    )}
                    <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: isDark ? 'var(--white-alpha-05)' : 'var(--black-alpha-03)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    {localSeries.map((s, idx) => {
                      const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                      const fbColor = parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor));
                      return (
                        <Bar key={s.key} name={s.label} dataKey={s.key} stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? 'stack1' : undefined} fill={currentConfig.useGradient ? `url(#g-bar-${idx}-${safeWidgetId})` : fbColor} radius={[theme.chartRadius, theme.chartRadius, 0, 0]} barSize={currentConfig.barWidth ? currentConfig.barWidth * 1 : undefined} />
                      );
                    })}
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {showLegend && <div style={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }}>{renderCustomLegend(localSeries.map((s) => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor, theme.primaryColor) })))}</div>}
            </div>
          )}
        </RechartsNumericYAxisMeasure>
      );
    case WidgetType.CHART_BAR_HORIZONTAL:
      return (
        <HorizontalBarChartYAxisMeasure currentData={currentData} xAxisKey={xAxisKey} contentSize={contentSize}>
          {(yAxisWidth) => (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
                <BarChart layout="vertical" data={currentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  {currentConfig.useGradient && (
                    <defs>
                      {localSeries.map((s, idx) => {
                        const rawColor = resolveColor(s.color, theme.primaryColor, theme.primaryColor);
                        const color = parseToHex(rawColor);
                        const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                        const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                        const gradId = `g-hbar-${idx}-${safeWidgetId}`;
                        return (
                          <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="95%" stopColor={getGradientEndColor(color, endColorRaw, isDark)} stopOpacity={1} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                  )}
                  {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />}
                  <XAxis type="number" hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                  <YAxis dataKey={xAxisKey} type="category" hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} width={showYAxis ? yAxisWidth : 0} tick={{ style: { whiteSpace: 'nowrap' } }} />
                  <Tooltip cursor={{ fill: isDark ? 'var(--white-alpha-05)' : 'var(--black-alpha-03)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                  {localSeries.map((s, idx) => {
                    const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                    return (
                      <Bar key={s.key} name={s.label} dataKey={s.key} stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? 'stack1' : undefined} fill={currentConfig.useGradient ? `url(#g-hbar-${idx}-${safeWidgetId})` : resolveColor(s.color, theme.primaryColor, theme.primaryColor)} radius={[0, theme.chartRadius, theme.chartRadius, 0]} barSize={currentConfig.barWidth != null ? Math.max(2, currentConfig.barWidth * 0.4) : undefined} />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </HorizontalBarChartYAxisMeasure>
      );
    case WidgetType.CHART_LINE:
      return (
        <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
          {(yAxisWidth) => (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
                <LineChart {...commonProps}>
                  {currentConfig.useGradient && (
                    <defs>
                      {localSeries.map((s, idx) => {
                        const color = parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor));
                        const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                        const stopEndColor = getGradientEndColor(color, endColorRaw, isDark);
                        const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                        const gradId = `g-ln-${idx}-${safeWidgetId}`;
                        return (
                          <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={stopEndColor} stopOpacity={1} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                  )}
                  {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                  {showXAxis && (
                    <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} height={24}>
                      {xAxisLabel && <Label value={xAxisLabel} position="insideBottom" offset={-10} style={{ fontSize: 'var(--text-tiny)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fill: 'var(--text-muted)' }} />}
                    </XAxis>
                  )}
                  <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                  {localSeries.map((s, idx) => {
                    const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                    return (
                      <Line
                        key={s.key}
                        name={s.label}
                        type="natural"
                        dataKey={s.key}
                        stroke={currentConfig.useGradient ? `url(#g-ln-${idx}-${safeWidgetId})` : parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor))}
                        strokeWidth={currentConfig.barWidth != null ? Math.max(1, currentConfig.barWidth * 0.1) : 3}
                        dot={{ r: 4, strokeWidth: 2, fill: isDark ? 'var(--surface-elevated)' : 'var(--surface)', stroke: parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor)) }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </RechartsNumericYAxisMeasure>
      );
    case WidgetType.CHART_AREA:
      return (
        <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
          {(yAxisWidth) => (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
                <AreaChart {...commonProps}>
                  {currentConfig.useGradient && (
                    <defs>
                      {localSeries.map((s, idx) => {
                        const color = parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor));
                        const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                        const stopEndColor = getGradientEndColor(color, endColorRaw, isDark);
                        const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                        const gradId = `g-ar-${idx}-${safeWidgetId}`;
                        return (
                          <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                            <stop offset="100%" stopColor={stopEndColor} stopOpacity={0.05} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                  )}
                  {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                  {showXAxis && (
                    <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} height={24}>
                      {xAxisLabel && <Label value={xAxisLabel} position="insideBottom" offset={-10} style={{ fontSize: 'var(--text-tiny)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fill: 'var(--text-muted)' }} />}
                    </XAxis>
                  )}
                  <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                  {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                  {localSeries.map((s, idx) => {
                    const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                    return (
                      <Area
                        key={s.key}
                        name={s.label}
                        type="natural"
                        dataKey={s.key}
                        stroke={parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor))}
                        strokeWidth={currentConfig.barWidth != null ? Math.max(1, currentConfig.barWidth * 0.1) : 3}
                        fillOpacity={currentConfig.useGradient ? 1 : 0.3}
                        fill={currentConfig.useGradient ? `url(#g-ar-${idx}-${safeWidgetId})` : parseToHex(resolveColor(s.color, theme.primaryColor, theme.primaryColor))}
                      />
                    );
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </RechartsNumericYAxisMeasure>
      );
    case WidgetType.CHART_PIE:
      return (
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
            <PieChart>
              <Pie
                data={currentData}
                cx="50%"
                cy="50%"
                innerRadius="50%"
                outerRadius="60%"
                paddingAngle={5}
                minAngle={15}
                dataKey={localSeries[0]?.key || 'value'}
                nameKey={xAxisKey}
                label={({ cx, cy, midAngle, outerRadius, percent }) => {
                  const RADIAN = Math.PI / 180;
                  const radius = outerRadius + 20;
                  const x = cx + radius * Math.cos(-midAngle * RADIAN);
                  const y = cy + radius * Math.sin(-midAngle * RADIAN);
                  const pct = Math.max(0, Math.round((Number(percent) || 0) * 100));
                  return (
                    <text x={x} y={y} fill="var(--text-secondary)" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: `${contentSize}px`, fontWeight: 'var(--title-weight)' }}>
                      {`${pct}%`}
                    </text>
                  );
                }}
              >
                {currentData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="var(--surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    case WidgetType.CHART_RADAR:
      return (
        <div className="h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={currentData}>
              <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: labelColor, fontSize: contentSize }} />
              <PolarRadiusAxis stroke={strokeColor} tick={{ fill: labelColor, fontSize: contentSize }} />
              {localSeries.map((s) => (
                <Radar key={s.key} name={s.label} dataKey={s.key} stroke={s.color || theme.primaryColor} fill={s.color || theme.primaryColor} fillOpacity={0.6} />
              ))}
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
              {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      );
    case WidgetType.CHART_SANKEY: {
      const sankeyData = (() => {
        const nodes: { name: string }[] = [];
        const links: { source: number; target: number; value: number }[] = [];
        const nodeMap = new Map<string, number>();
        const sKey = xAxisKey || 'source';
        const tKey = currentConfig.yAxisKey || 'target';
        const vKey = localSeries[0]?.key || 'value';
        currentData.forEach((item) => {
          const sName = item[sKey] || item.source || item.from;
          const tName = item[tKey] || item.target || item.to;
          const val = Number(item[vKey] || item.value) || 0;
          if (sName && tName) {
            if (!nodeMap.has(sName)) {
              nodeMap.set(sName, nodes.length);
              nodes.push({ name: sName });
            }
            if (!nodeMap.has(tName)) {
              nodeMap.set(tName, nodes.length);
              nodes.push({ name: tName });
            }
            links.push({ source: nodeMap.get(sName)!, target: nodeMap.get(tName)!, value: val });
          }
        });
        return { nodes, links };
      })();
      const sankeyPalette = theme.chartPalette?.length ? theme.chartPalette : PIE_COLORS.map((c) => resolveColor(c, theme.primaryColor, theme.primaryColor));
      const sankeyNodeColorByName = new Map<string, string>();
      sankeyData.nodes.forEach((n, i) => {
        const raw = sankeyPalette[i % sankeyPalette.length];
        sankeyNodeColorByName.set(n.name, raw.startsWith('var(') ? resolveColor(raw, theme.primaryColor, theme.primaryColor) : raw);
      });
      const getNodeColor = (name: string) => sankeyNodeColorByName.get(name) ?? theme.primaryColor;
      return (
        <div className="h-full">
          <ResponsiveContainer key={`${chartKey}-${isPreviewMode ? 'preview' : 'edit'}`} width="100%" height="100%" minWidth={0} minHeight={0}>
            <Sankey
              data={sankeyData}
              nodePadding={Math.max(8, Math.round(contentSize * 0.8))}
              node={({ x, y, width, height, payload }) => (
                <g>
                  <rect x={x} y={y} width={width} height={height} fill={getNodeColor(payload.name)} fillOpacity={1} stroke={isDark ? 'var(--white-alpha-20)' : 'var(--black-alpha-08)'} strokeWidth={1} rx={theme.chartRadius} />
                  <text x={x + width / 2} y={y + height / 2} dy={contentSize / 2 - 2} fontSize={contentSize} fill={isDark ? 'var(--white)' : 'var(--black)'} textAnchor="middle" pointerEvents="none" style={{ textShadow: isDark ? 'var(--shadow-dark-text)' : 'var(--shadow-light-text)' }}>
                    {payload.name}
                  </text>
                </g>
              )}
              link={({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload }: any) => {
                const sourceName = payload?.source?.name ?? payload?.source;
                const linkColor = typeof sourceName === 'string' ? getNodeColor(sourceName) : theme.primaryColor;
                const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
                return <path key={`${payload?.source?.name ?? payload?.source ?? 's'}->${payload?.target?.name ?? payload?.target ?? 't'}-${String(payload?.value ?? '')}`} d={path} fill="none" stroke={linkColor} strokeOpacity={isDark ? 0.82 : 0.75} strokeWidth={Math.max(1.5, linkWidth ?? 2)} strokeLinecap="round" />;
              }}
            >
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
            </Sankey>
          </ResponsiveContainer>
        </div>
      );
    }
    case WidgetType.CHART_COMPOSED:
      return (
        <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
          {(yAxisWidth) => (
            <div className="h-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0} key={chartKey}>
                <ComposedChart {...commonProps}>
                  {currentConfig.useGradient && (
                    <defs>
                      {localSeries.map((s, idx) => {
                        const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                        const color = resolveColor(s.color, theme.primaryColor, theme.primaryColor);
                        const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                        const stopEndColor = getGradientEndColor(color, endColorRaw, isDark);
                        if (idx === 0) {
                          const stopEndOpacity = endColorRaw ? 1 : 0.2;
                          const gradId = `g-cbar-${idx}-${safeWidgetId}`;
                          return (
                            <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="95%" stopColor={stopEndColor} stopOpacity={stopEndOpacity} />
                            </linearGradient>
                          );
                        }
                        const gradId = `g-cln-${idx}-${safeWidgetId}`;
                        return (
                          <linearGradient key={gradId} id={gradId} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={stopEndColor} stopOpacity={1} />
                          </linearGradient>
                        );
                      })}
                    </defs>
                  )}
                  {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                  {showXAxis && (
                    <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} height={24}>
                      {xAxisLabel && <Label value={xAxisLabel} position="insideBottom" offset={-10} style={{ fontSize: 'var(--text-tiny)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', fill: 'var(--text-muted)' }} />}
                    </XAxis>
                  )}
                  <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                  {localSeries.map((s, idx) => {
                    const safeWidgetId = widgetId.replace(/[^a-zA-Z0-9]/g, '_');
                    return idx === 0 ? (
                      <Bar key={s.key} name={s.label} dataKey={s.key} fill={currentConfig.useGradient ? `url(#g-cbar-${idx}-${safeWidgetId})` : s.color || theme.primaryColor} radius={[theme.chartRadius, theme.chartRadius, 0, 0]} barSize={currentConfig.barWidth != null ? Math.max(2, currentConfig.barWidth * 0.4) : undefined} />
                    ) : (
                      <Line key={s.key} name={s.label} type="monotone" dataKey={s.key} stroke={currentConfig.useGradient ? `url(#g-cln-${idx}-${safeWidgetId})` : s.color || 'var(--red-500)'} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: theme.surfaceColor, stroke: s.color || 'var(--red-500)' }} />
                    );
                  })}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </RechartsNumericYAxisMeasure>
      );
    default:
      return null;
  }
};
