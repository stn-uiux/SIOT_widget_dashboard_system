
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import Chart from 'react-apexcharts';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { Settings, GripVertical, FileSpreadsheet, X, MapPin, Image as ImageIcon } from 'lucide-react';
import { Widget, WidgetType, DashboardTheme, ThemeMode, ChartLibrary } from '../types';
import MapWidget from './MapWidget';

const AmChartComponent: React.FC<{
  widget: Widget,
  theme: DashboardTheme,
  isDark: boolean,
  contentSize: number,
  labelColor: string,
  strokeColor: string
}> = ({ widget, theme, isDark, contentSize, labelColor, strokeColor }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);
    root._logo?.dispose(); // amCharts license reminder, though technically should stay for free version

    const resolveColor = (colorStr: string) => {
      if (!colorStr) return theme.primaryColor;
      if (colorStr.startsWith('var(')) {
        const varName = colorStr.match(/var\(([^)]+)\)/)?.[1];
        if (varName) {
          const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
          return val || theme.primaryColor;
        }
      }
      return colorStr;
    };

    root.setThemes([
      am5themes_Animated.new(root),
      ...(isDark ? [am5themes_Dark.new(root)] : [])
    ]);

    const { xAxisKey, showGrid, showXAxis, showYAxis } = widget.config;

    if (widget.type === WidgetType.CHART_PIE) {
      const chart = root.container.children.push(am5percent.PieChart.new(root, {
        radius: am5.percent(70),
        innerRadius: am5.percent(50)
      }));

      const series = chart.series.push(am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: xAxisKey,
        valueField: widget.config.series[0]?.key || 'value'
      }));

      series.data.setAll(widget.data);
      series.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_RADAR) {
      const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: -90,
        endAngle: 270
      }));

      const xRenderer = am5radar.AxisRendererCircular.new(root, {});
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor)) });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
      }));
      xAxis.data.setAll(widget.data);

      const yRenderer = am5radar.AxisRendererRadial.new(root, {});
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor)) });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      widget.config.series.forEach(s => {
        const series = chart.series.push(am5radar.RadarLineSeries.new(root, {
          name: s.label,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: s.key,
          categoryXField: xAxisKey,
          stroke: am5.color(resolveColor(s.color)),
          fill: am5.color(resolveColor(s.color))
        }));
        series.fills.template.setAll({ fillOpacity: 0.3, visible: true });
        series.data.setAll(widget.data);
      });
    } else {
      const isHorizontal = widget.type === WidgetType.CHART_BAR_HORIZONTAL;
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        layout: root.verticalLayout,
        paddingBottom: 0,
        paddingTop: 5
      }));

      // Renderers
      const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
      xRenderer.grid.template.setAll({
        stroke: am5.color(resolveColor(strokeColor)),
        strokeOpacity: 1,
        strokeWidth: 1,
        visible: showGrid
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor)), visible: showXAxis });

      const yRenderer = am5xy.AxisRendererY.new(root, { inversed: isHorizontal });
      yRenderer.grid.template.setAll({
        stroke: am5.color(resolveColor(strokeColor)),
        strokeOpacity: 1,
        strokeWidth: 1,
        visible: showGrid
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor)), visible: showYAxis });

      // Axes
      let xAxis, yAxis;
      if (isHorizontal) {
        xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, { renderer: xRenderer }));
        yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: xAxisKey,
          renderer: yRenderer
        }));
        yAxis.data.setAll(widget.data);
      } else {
        xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: xAxisKey,
          renderer: xRenderer
        }));
        xAxis.data.setAll(widget.data);
        yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: yRenderer }));
      }

      // Series
      widget.config.series.forEach((s) => {
        let series;
        if (isHorizontal) {
          series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueXField: s.key,
            categoryYField: xAxisKey,
            fill: am5.color(resolveColor(s.color)),
            stroke: am5.color(resolveColor(s.color))
          }));
          series.columns.template.setAll({ cornerRadiusBR: 5, cornerRadiusTR: 5 });
        } else if (widget.type === WidgetType.CHART_BAR) {
          series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: s.key,
            categoryXField: xAxisKey,
            fill: am5.color(resolveColor(s.color)),
            stroke: am5.color(resolveColor(s.color))
          }));
          series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5 });
        } else {
          series = chart.series.push(am5xy.LineSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: s.key,
            categoryXField: xAxisKey,
            stroke: am5.color(resolveColor(s.color))
          }));
          series.bullets.push(() => am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 4,
              fill: series.get("stroke")
            })
          }));
          if (widget.type === WidgetType.CHART_AREA) {
            series.fills.template.setAll({ fillOpacity: 0.3, visible: true });
          }
        }
        series.data.setAll(widget.data);
        series.appear(1000);
      });
      chart.appear(1000, 100);
    }

    return () => {
      root.dispose();
    };
  }, [widget, theme, isDark, contentSize, labelColor, strokeColor]);

  return <div ref={chartRef} className="w-full h-full" />;
};

interface WidgetCardProps {
  widget: Widget;
  theme: DashboardTheme;
  isEditMode: boolean;
  onEdit: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<Widget>) => void;
  onDelete: (id: string) => void;
  onOpenExcel: (id: string) => void;
}

const WidgetCard: React.FC<WidgetCardProps> = ({ widget, theme, isEditMode, onEdit, onUpdate, onDelete, onOpenExcel }) => {
  const isDark = theme.mode === ThemeMode.DARK;

  const contentSize = theme.contentSize;
  const titleSize = theme.titleSize;
  const titleWeight = theme.titleWeight;

  const strokeColor = 'var(--border-base)';
  const labelColor = 'var(--text-muted)';

  const series = widget.config.series && widget.config.series.length > 0
    ? widget.config.series
    : [{ key: widget.config.yAxisKey || 'value', label: widget.title, color: 'var(--primary-color)' }];

  const chartKey = `chart-${widget.id}-${widget.type}-${series.map(s => s.key).join('-')}`;

  const renderGoogleIcon = () => {
    if (!widget.icon) return null;
    return (
      <div className="p-3 rounded-2xl flex items-center justify-center transition-all bg-[var(--border-muted)] text-[var(--text-main)] border border-[var(--border-base)]">
        <span className="material-symbols-outlined" style={{ fontSize: `calc(var(--content-size) * 2.5)` }}>
          {widget.icon}
        </span>
      </div>
    );
  };

  const renderChart = () => {
    const { xAxisKey, xAxisLabel, showLegend, showGrid, showXAxis, showYAxis, showLabels, unit, showUnitInLegend } = widget.config;
    const commonProps = {
      data: widget.data || [],
      margin: { top: 5, right: 10, left: -10, bottom: 0 }
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

    const renderCustomLegend = (items: { value: string, color: string }[]) => (
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1 px-2">
        {items.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-bold whitespace-nowrap text-muted" style={{ fontSize: 'var(--content-size)' }}>
              {entry.value}
            </span>
          </div>
        ))}
        {showUnitInLegend && unit && (
          <div className="flex items-center gap-1.5 border-l pl-4 border-[var(--border-base)]">
            <span className="font-bold tracking-tight uppercase opacity-60 text-muted" style={{ fontSize: 'calc(var(--content-size) * 0.85)' }}>
              단위: {unit}
            </span>
          </div>
        )}
      </div>
    );

    const renderLegend = (props: any) => {
      const { payload } = props;
      return renderCustomLegend(payload.map((p: any) => ({
        value: p.value,
        color: p.color || p.payload?.fill || 'var(--primary-color)'
      })));
    };

    const PIE_COLORS = [
      'var(--primary-color)',
      'var(--secondary-color)',
      'var(--success)',
      'var(--warning)',
      '#8b5cf6',
      '#ec4899',
      '#f43f5e'
    ];

    const renderApexChart = () => {
      const { xAxisKey, showLegend, showGrid, showXAxis, showYAxis, unit } = widget.config;

      const categories = widget.data.map(d => String(d[xAxisKey] || ''));
      const apexSeries = series.map(s => ({
        name: s.label,
        data: widget.data.map(d => d[s.key])
      }));

      const colors = series.map(s => s.color || theme.primaryColor);

      const options: any = {
        chart: {
          toolbar: { show: false },
          parentHeightOffset: 0,
          background: 'transparent',
          foreColor: labelColor,
          fontFamily: 'inherit',
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
          }
        },
        theme: {
          mode: isDark ? 'dark' : 'light',
        },
        colors: colors,
        grid: {
          show: showGrid,
          borderColor: strokeColor,
          strokeDashArray: 4,
          padding: { top: 4, right: 0, bottom: 0, left: 10 }
        },
        xaxis: {
          categories: categories,
          axisBorder: { show: false },
          axisTicks: { show: false },
          labels: {
            show: showXAxis,
            style: { fontSize: `${contentSize}px`, fontWeight: 500 }
          }
        },
        yaxis: {
          show: showYAxis,
          labels: {
            style: { fontSize: `${contentSize}px`, fontWeight: 500 },
            formatter: (val: number) => `${val.toLocaleString()}${unit}`
          }
        },
        legend: {
          show: false // We use our custom legend
        },
        tooltip: {
          theme: isDark ? 'dark' : 'light',
          style: { fontSize: `${contentSize}px` },
          y: {
            formatter: (val: number) => `${val.toLocaleString()} ${unit}`
          }
        },
        stroke: {
          show: true,
          width: 3,
          curve: 'smooth'
        },
        dataLabels: { enabled: false },
        plotOptions: {
          bar: {
            borderRadius: 6,
            columnWidth: '60%',
          }
        }
      };

      let type: any = 'line';
      let chartData: any = apexSeries;
      let legendItems = series.map(s => ({ value: s.label, color: s.color || theme.primaryColor }));

      switch (widget.type) {
        case WidgetType.CHART_BAR: type = 'bar'; break;
        case WidgetType.CHART_BAR_HORIZONTAL:
          type = 'bar';
          options.plotOptions.bar.horizontal = true;
          break;
        case WidgetType.CHART_AREA: type = 'area'; break;
        case WidgetType.CHART_PIE:
          type = 'pie';
          options.labels = categories;
          chartData = apexSeries[0].data;
          options.colors = PIE_COLORS;
          legendItems = categories.map((cat, idx) => ({
            value: cat,
            color: PIE_COLORS[idx % PIE_COLORS.length]
          }));
          delete options.xaxis;
          break;
        case WidgetType.CHART_RADAR:
          type = 'radar';
          options.xaxis = { categories };
          break;
        case WidgetType.CHART_COMPOSED:
          type = 'line';
          break;
      }

      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            <Chart options={options} series={chartData} type={type} height="100%" />
          </div>
          {showLegend && renderCustomLegend(legendItems)}
        </div>
      );
    };

    const renderAmChart = () => {
      const { showLegend, xAxisKey } = widget.config;
      let legendItems = series.map(s => ({ value: s.label, color: s.color || theme.primaryColor }));

      if (widget.type === WidgetType.CHART_PIE) {
        legendItems = (widget.data || []).map((d, idx) => ({
          value: String(d[xAxisKey] || ''),
          color: PIE_COLORS[idx % PIE_COLORS.length]
        }));
      }

      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <AmChartComponent
              widget={widget}
              theme={theme}
              isDark={isDark}
              contentSize={contentSize}
              labelColor={labelColor}
              strokeColor={strokeColor}
            />
          </div>
          {showLegend && renderCustomLegend(legendItems)}
        </div>
      );
    };

    const isGeneralWidget = [WidgetType.WEATHER, WidgetType.IMAGE, WidgetType.MAP, WidgetType.SUMMARY, WidgetType.SUMMARY_CHART, WidgetType.TABLE].includes(widget.type);

    if (theme.chartLibrary === ChartLibrary.APEXCHARTS && !isGeneralWidget) {
      return renderApexChart();
    }

    if (theme.chartLibrary === ChartLibrary.AMCHARTS && !isGeneralWidget) {
      return renderAmChart();
    }

    switch (widget.type) {
      case WidgetType.SUMMARY:
        return (
          <div className="h-full flex flex-col justify-center px-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-baseline gap-2">
                {isEditMode ? (
                  <input
                    type="text"
                    value={widget.mainValue || '0'}
                    onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                    className="bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full text-main"
                    style={{ fontSize: 'calc(var(--content-size) * 3.5)' }}
                  />
                ) : (
                  <span className="font-black tracking-tighter leading-tight text-main" style={{ fontSize: 'calc(var(--content-size) * 3.5)' }}>
                    {widget.mainValue}
                  </span>
                )}
                {unit && (
                  <span className="font-bold text-muted" style={{ fontSize: 'calc(var(--content-size) * 1.5)' }}>
                    {unit}
                  </span>
                )}
              </div>
              {renderGoogleIcon()}
            </div>
            {isEditMode ? (
              <input
                type="text"
                value={widget.subValue || ''}
                onChange={(e) => onUpdate?.(widget.id, { subValue: e.target.value })}
                className="bg-transparent border-none p-0 w-full font-bold focus:ring-0 outline-none text-muted"
                style={{ fontSize: 'calc(var(--content-size) * 1.4)' }}
              />
            ) : (
              <p className="font-bold leading-tight text-muted" style={{ fontSize: 'calc(var(--content-size) * 1.4)' }}>
                {widget.subValue}
              </p>
            )}
          </div>
        );

      case WidgetType.SUMMARY_CHART:
        return (
          <div className="relative h-full w-full flex flex-col justify-start pt-2">
            <div className="z-10 px-2 flex flex-col gap-1">
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-2">
                  {isEditMode ? (
                    <input
                      type="text"
                      value={widget.mainValue || '0'}
                      onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                      className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${isDark ? 'text-white' : 'text-gray-800'}`}
                      style={{ fontSize: `${contentSize * 3.8}px` }}
                    />
                  ) : (
                    <span className={`font-black tracking-tighter leading-tight ${isDark ? 'text-white' : 'text-gray-800'}`} style={{ fontSize: `${contentSize * 3.8}px` }}>
                      {widget.mainValue}
                    </span>
                  )}
                  {unit && (
                    <span className={`font-bold mb-2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} style={{ fontSize: `${contentSize * 1.6}px` }}>
                      {unit}
                    </span>
                  )}
                </div>
              </div>
              <p className={`font-bold leading-tight ${isDark ? 'text-slate-300' : 'text-gray-400'}`} style={{ fontSize: `${contentSize * 1.4}px` }}>
                {widget.subValue}
              </p>
            </div>
            <div className="absolute bottom-[-24px] left-[-24px] right-[-24px] h-[55%] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={widget.data}>
                  <defs>
                    <linearGradient id={`grad-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={theme.primaryColor} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={theme.primaryColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey={series[0]?.key || 'value'}
                    stroke={theme.primaryColor}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill={`url(#grad-${widget.id})`}
                    isAnimationActive={true}
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );

      case WidgetType.WEATHER:
        return (
          <div className="h-full flex flex-col justify-center items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 'calc(var(--content-size) * 6)' }}>
                {widget.icon || 'partly_cloudy_day'}
              </span>
              <div className="space-y-1">
                <h4 className="font-black text-main tracking-tighter" style={{ fontSize: 'calc(var(--content-size) * 4)' }}>{widget.mainValue}</h4>
                <p className="text-muted font-bold" style={{ fontSize: 'calc(var(--content-size) * 1.2)' }}>{widget.subValue}</p>
              </div>
            </div>
          </div>
        );

      case WidgetType.IMAGE:
        return (
          <div className="h-full w-full relative group overflow-hidden rounded-[var(--radius-md)] bg-[var(--border-muted)]">
            {isEditMode ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 cursor-pointer relative" onClick={() => document.getElementById(`file-upload-${widget.id}`)?.click()}>
                {widget.mainValue ? (
                  <img
                    src={widget.mainValue}
                    alt="Preview"
                    className="w-full h-full object-cover opacity-50"
                  />
                ) : (
                  <div className="flex flex-col items-center text-muted">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs font-bold">Click to Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  id={`file-upload-${widget.id}`}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        onUpdate?.(widget.id, { mainValue: reader.result as string, subValue: file.name });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/30 transition-opacity">
                  <span className="text-white font-bold text-xs uppercase border border-white px-3 py-1 rounded-full">Change Image</span>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={widget.mainValue}
                  alt={widget.subValue}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                {widget.subValue && (
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] font-bold uppercase tracking-wider">{widget.subValue}</p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case WidgetType.MAP:
        // Parse lat, lng from subValue (e.g. "37.5665, 126.9780")
        const [lat, lng] = (widget.subValue || '37.5665, 126.9780').split(',').map(s => parseFloat(s.trim()));
        return (
          <div className="h-full w-full relative bg-[var(--border-muted)] rounded-[var(--radius-md)] overflow-hidden border border-[var(--border-base)]">
            {/* Dynamic Import or standard import if possible. Here we use standard import but wrapped */}
            <div className="h-full w-full z-0 pointer-events-none group-hover:pointer-events-auto">
              <MapWidget lat={lat || 37.5665} lng={lng || 126.9780} zoom={13} provider="osm" />
            </div>
            <div className="absolute top-2 left-2 z-[1000] bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-[10px] font-bold shadow-sm pointer-events-none">
              {widget.mainValue}
            </div>
          </div>
        );

      case WidgetType.CHART_BAR:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={chartKey} {...commonProps}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {series.map((s) => (
                  <Bar key={s.key} name={s.label} dataKey={s.key} fill={s.color || theme.primaryColor} radius={[6, 6, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_BAR_HORIZONTAL:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={chartKey} layout="vertical" data={widget.data} margin={{ top: 5, right: 30, left: 40, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />}
                {showXAxis && <XAxis type="number" stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis dataKey={xAxisKey} type="category" stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} width={80} />}
                <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {series.map((s) => (
                  <Bar key={s.key} name={s.label} dataKey={s.key} fill={s.color || theme.primaryColor} radius={[0, 6, 6, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_LINE:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={chartKey} {...commonProps}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {series.map((s) => (
                  <Line key={s.key} name={s.label} type="monotone" dataKey={s.key} stroke={s.color || theme.primaryColor} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#1e293b' : '#fff' }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_AREA:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={chartKey} {...commonProps}>
                <defs>
                  {series.map(s => (
                    <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={s.color || theme.primaryColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={s.color || theme.primaryColor} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {series.map((s) => (
                  <Area key={s.key} name={s.label} type="monotone" dataKey={s.key} stroke={s.color || theme.primaryColor} fillOpacity={1} fill={`url(#grad-${s.key})`} strokeWidth={3} />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_PIE:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={widget.data}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="70%"
                  paddingAngle={5}
                  dataKey={series[0]?.key || 'value'}
                  nameKey={xAxisKey}
                  label={showLabels ? ({
                    cx, cy, midAngle, innerRadius, outerRadius, value, name
                  }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 20;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
                    const labelText = `${formattedValue}${unit ? unit : ''}`;

                    return (
                      <text
                        x={x}
                        y={y}
                        fill="var(--text-secondary)"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: `${contentSize}px`, fontWeight: 'var(--title-weight)' }}
                      >
                        {labelText}
                      </text>
                    );
                  } : false}
                >
                  {widget.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="var(--surface)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_RADAR:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={widget.data}>
                <PolarGrid stroke={strokeColor} />
                <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: labelColor, fontSize: contentSize }} />
                <PolarRadiusAxis stroke={strokeColor} tick={{ fill: labelColor, fontSize: contentSize }} />
                {series.map(s => (
                  <Radar
                    key={s.key}
                    name={s.label}
                    dataKey={s.key}
                    stroke={s.color || theme.primaryColor}
                    fill={s.color || theme.primaryColor}
                    fillOpacity={0.6}
                  />
                ))}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_COMPOSED:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart key={chartKey} {...commonProps}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {series.map((s, idx) => (
                  idx === 0 ? (
                    <Bar key={s.key} name={s.label} dataKey={s.key} fill={s.color || theme.primaryColor} radius={[6, 6, 0, 0]} />
                  ) : (
                    <Line key={s.key} name={s.label} type="monotone" dataKey={s.key} stroke={s.color || '#ef4444'} strokeWidth={3} />
                  )
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.TABLE:
        return (
          <div className="h-full flex flex-col">
            <div className="overflow-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse" style={{ fontSize: `${contentSize}px` }}>
                <thead>
                  <tr className="sticky top-0 z-10">
                    <th className={`pb-3 pt-3 px-3 font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-gray-50 text-gray-500'}`} style={{ borderBottom: `2px solid ${theme.primaryColor}aa` }}>
                      {xAxisLabel || 'Item'}
                    </th>
                    {series.map(s => (
                      <th key={s.key} className={`pb-3 pt-3 px-3 font-bold text-right uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-gray-50 text-gray-500'}`} style={{ borderBottom: `2px solid ${theme.primaryColor}aa` }}>
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {widget.data.map((row, idx) => (
                    <tr key={idx} className="border-b border-[var(--border-muted)] last:border-0 transition-colors hover:bg-[var(--border-muted)] text-secondary">
                      <td className="py-3 px-3 font-semibold text-main">{row[xAxisKey] || row.name}</td>
                      {series.map(s => (
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

      default:
        return <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">No Preview</div>;
    }
  };

  return (
    <div className="relative h-full flex flex-col p-5 shadow-base border transition-all duration-300 group overflow-hidden rounded-design bg-surface text-main border-main hover:shadow-premium hover:shadow-[var(--primary-color)]/5">
      <div className="flex items-center justify-between mb-2 shrink-0 z-20">
        <div className="flex items-center gap-2 overflow-hidden flex-1">
          {isEditMode && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-blue-500 transition-colors shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <div className="flex items-center gap-2 overflow-hidden">
            {isEditMode ? (
              <input
                type="text"
                value={widget.title}
                onChange={(e) => onUpdate?.(widget.id, { title: e.target.value })}
                className="bg-transparent border-none p-0 title-text tracking-tight leading-tight focus:ring-0 outline-none rounded px-1 transition-colors min-w-[50px] text-primary hover:bg-[var(--primary-subtle)]"
              />
            ) : (
              <h3 className="truncate select-none title-text tracking-tight leading-tight transition-opacity text-primary">
                {widget.title}
              </h3>
            )}
          </div>
        </div>
        {isEditMode && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onOpenExcel(widget.id)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-emerald-400' : 'hover:bg-gray-100 text-green-600'}`}
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(widget.id)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(widget.id)}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-red-900/40 text-red-400' : 'hover:bg-red-50 text-red-500'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 select-none">
        {renderChart()}
      </div>
    </div>
  );
};

export default WidgetCard;
