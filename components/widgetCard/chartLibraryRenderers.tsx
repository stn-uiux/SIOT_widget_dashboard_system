import React from 'react';
import Chart from 'react-apexcharts';
import { Widget, WidgetType, DashboardTheme, ChartConfig, ChartSeries } from '../../types';
import chartLayoutTokens from '../../chart-layout-tokens.json';
import { resolveColor, getGradientEndColor } from './chartColorUtils';
import { PIE_COLORS } from './chartPalette';
import { AmChartComponent } from './AmChartComponent';
import { ApexSankeyWidget } from './ApexSankeyWidget';

interface ChartLibraryRendererProps {
  currentType: WidgetType;
  currentConfig: ChartConfig;
  currentData: any[];
  localSeries: ChartSeries[];
  theme: DashboardTheme;
  isDark: boolean;
  contentSize: number;
  labelColor: string;
  strokeColor: string;
  widget: Widget;
  renderCustomLegend: (items: { value: string; color: string }[]) => React.ReactNode;
}

export const renderApexChart = (props: ChartLibraryRendererProps): React.ReactNode => {
  const { currentType, currentConfig, currentData, localSeries, theme, isDark, contentSize, labelColor, strokeColor, renderCustomLegend } = props;
  const { xAxisKey, showLegend, showGrid, showXAxis, showYAxis, unit } = currentConfig;
  if (currentType === WidgetType.CHART_SANKEY) {
    const sKey = xAxisKey || 'source';
    const tKey = currentConfig.yAxisKey || 'target';
    const vKey = localSeries[0]?.key || 'value';
    const nodeIds = new Set<string>();
    const edges: { source: string; target: string; value: number }[] = [];
    currentData.forEach((item: any) => {
      const sName = String(item[sKey] ?? item.source ?? item.from ?? '');
      const tName = String(item[tKey] ?? item.target ?? item.to ?? '');
      const val = Number(item[vKey] ?? item.value ?? 0);
      if (sName && tName) {
        nodeIds.add(sName);
        nodeIds.add(tName);
        edges.push({ source: sName, target: tName, value: val });
      }
    });
    const nodes = Array.from(nodeIds).map((id) => ({ id, title: id }));
    const resolvedFontColor = theme.textColor || 'var(--text-secondary)';
    return (
      <div className="w-full h-full min-w-0 min-h-0 flex flex-col border-0 outline-none [&_*]:outline-none" style={{ border: 'none', boxShadow: 'none' }}>
        <ApexSankeyWidget data={{ nodes, edges }} fontColor={resolvedFontColor} nodeWidth={Math.max(14, theme.chartRadius * 2)} />
      </div>
    );
  }

  const categories = currentData.map((d) => String(d[xAxisKey] || ''));
  const apexSeries = localSeries.map((s) => ({ name: s.label, data: currentData.map((d) => d[s.key]) }));
  const colors = localSeries.map((s) => resolveColor(s.color, theme.primaryColor, theme.primaryColor));
  const options: any = {
    chart: { toolbar: { show: false }, parentHeightOffset: 0, background: 'transparent', foreColor: resolveColor(labelColor, 'var(--text-muted)'), fontFamily: 'inherit', stacked: chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked', animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    theme: { mode: isDark ? 'dark' : 'light' },
    colors,
    grid: { show: showGrid, borderColor: resolveColor(strokeColor, 'var(--text-secondary)'), strokeDashArray: 4, opacity: chartLayoutTokens.tokens.charts.common.gridOpacity.value, padding: { top: 0, right: 0, bottom: 0, left: 0 } },
    xaxis: { categories, axisBorder: { show: false }, axisTicks: { show: false }, labels: { show: showXAxis, style: { fontSize: `${contentSize}px`, fontWeight: 500 } } },
    yaxis: { show: showYAxis, labels: { style: { fontSize: `${contentSize}px`, fontWeight: 500 }, formatter: (val: number) => `${val.toLocaleString()}${unit}` } },
    legend: { show: false },
    tooltip: { theme: isDark ? 'dark' : 'light', style: { fontSize: `${contentSize}px` }, y: { formatter: (val: number) => `${val.toLocaleString()} ${unit}` } },
    stroke: { show: true, width: 3, curve: 'smooth' },
    dataLabels: { enabled: false },
    plotOptions: { bar: { borderRadius: theme.chartRadius, columnWidth: currentConfig.barWidth ? `${currentConfig.barWidth}%` : '60%' }, pie: { expandOnClick: false, dataLabels: { offset: -5 }, customScale: 1.05 } },
  };
  let type: any = 'line';
  let chartData: any = apexSeries;
  let legendItems = localSeries.map((s) => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }));
  switch (currentType) {
    case WidgetType.CHART_BAR:
    case WidgetType.DASH_EQUIP_PERF_TOP5: type = 'bar'; break;
    case WidgetType.CHART_BAR_HORIZONTAL: type = 'bar'; options.plotOptions.bar.horizontal = true; break;
    case WidgetType.CHART_AREA: type = 'area'; break;
    case WidgetType.CHART_PIE:
      type = 'pie'; options.labels = categories; chartData = apexSeries[0].data; options.colors = PIE_COLORS.map((c) => resolveColor(c, theme.primaryColor, theme.primaryColor));
      legendItems = categories.map((cat, idx) => ({ value: cat, color: resolveColor(PIE_COLORS[idx % PIE_COLORS.length], theme.primaryColor, theme.primaryColor) }));
      delete options.xaxis; delete options.yaxis; delete options.grid; break;
    case WidgetType.CHART_RADAR: type = 'radar'; options.xaxis = { categories }; break;
    case WidgetType.CHART_COMPOSED:
      type = 'line'; chartData = apexSeries.map((s, idx) => ({ ...s, type: idx === 0 ? 'column' : 'line' }));
      options.stroke = { ...options.stroke, width: apexSeries.map((_, idx) => (idx === 0 ? 0 : 3)), curve: 'smooth' }; break;
    case WidgetType.DASH_TRAFFIC_STATUS:
      type = 'area'; options.stroke.curve = 'smooth'; options.fill = { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.6, opacityTo: 0.1, stops: [0, 90, 100] } }; break;
    case WidgetType.DASH_NET_TRAFFIC: type = 'area'; options.chart.stacked = true; break;
    case WidgetType.DASH_FAILURE_STATS: type = 'area'; break;
    case WidgetType.DASH_RANK_LIST: type = 'bar'; options.plotOptions.bar.horizontal = true; options.plotOptions.bar.borderRadius = theme.chartRadius; break;
  }
  if (currentType === WidgetType.CHART_RADAR) options.grid = { ...options.grid, show: false };
  if (currentConfig.useGradient) {
    options.fill = { type: 'gradient', gradient: { shade: isDark ? 'dark' : 'light', type: currentType === WidgetType.CHART_BAR_HORIZONTAL ? 'horizontal' : 'vertical', shadeIntensity: 0.5, gradientToColors: localSeries.map((s) => getGradientEndColor(resolveColor(s.color, theme.primaryColor, theme.primaryColor), s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined, isDark)), inverseColors: false, opacityFrom: 1, opacityTo: 1, stops: [0, 100] } };
  }
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0">
        <Chart options={options} series={chartData} type={type} height="100%" width="100%" />
      </div>
      {showLegend && renderCustomLegend(legendItems)}
    </div>
  );
};

export const renderAmChart = (props: ChartLibraryRendererProps): React.ReactNode => {
  const { currentType, currentConfig, currentData, localSeries, theme, isDark, contentSize, labelColor, strokeColor, widget, renderCustomLegend } = props;
  const { showLegend, xAxisKey } = currentConfig;
  let legendItems = localSeries.map((s) => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }));
  if (currentType === WidgetType.CHART_PIE) {
    legendItems = (currentData || []).map((d, idx) => ({ value: String(d[xAxisKey] || ''), color: PIE_COLORS[idx % PIE_COLORS.length] }));
  }
  const amChartLabelColor = isDark ? 'var(--text-main)' : labelColor;
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 min-h-0 overflow-hidden">
        <AmChartComponent widget={{ ...widget, type: currentType, config: currentConfig, data: currentData }} theme={theme} isDark={isDark} contentSize={contentSize} labelColor={amChartLabelColor} strokeColor={strokeColor} />
      </div>
      {showLegend && renderCustomLegend(legendItems)}
    </div>
  );
};
