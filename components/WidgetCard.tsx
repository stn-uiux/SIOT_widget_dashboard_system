
import React from 'react';
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Sankey
} from 'recharts';
import Chart from 'react-apexcharts';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import * as am5radar from "@amcharts/amcharts5/radar";
import * as am5flow from "@amcharts/amcharts5/flow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import { Settings, GripVertical, FileSpreadsheet, X, MapPin, Image, Trash2 } from 'lucide-react';
import { Widget, WidgetType, DashboardTheme, ThemeMode, ChartLibrary, ChartConfig } from '../types';
import MapWidget from './MapWidget';

const resolveColor = (colorStr: string | undefined, fallback: string) => {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.match(/var\(([^)]+)\)/)?.[1];
    if (varName) {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return val || fallback;
    }
  }
  return colorStr;
};

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
    root._logo?.dispose();

    const localResolve = (c: string | undefined) => resolveColor(c, theme.primaryColor);

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
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
      }));
      xAxis.data.setAll(widget.data);

      const yRenderer = am5radar.AxisRendererRadial.new(root, {});
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

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
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}"
          })
        }));

        series.get("tooltip")?.get("background")?.setAll({
          fill: am5.color(resolveColor(s.color, theme.primaryColor)),
          fillOpacity: 0.8
        });

        series.strokes.template.setAll({
          strokeWidth: 2,
          stroke: am5.color(resolveColor(s.color, theme.primaryColor))
        });

        series.data.setAll(widget.data);
        series.appear(1000);
      });
    } else if (widget.type === WidgetType.CHART_SANKEY) {
      const series = root.container.children.push(am5flow.Sankey.new(root, {
        sourceIdField: xAxisKey || "from",
        targetIdField: widget.config.yAxisKey || "to",
        valueField: widget.config.series[0]?.key || "value",
        paddingRight: 50,
        paddingLeft: 10,
        nodePadding: 20
      }));

      series.nodes.get("colors")?.set("step", 2);
      series.nodes.rectangles.template.setAll({
        fillOpacity: 0.8,
        strokeOpacity: 0,
        cornerRadiusTL: theme.borderRadius,
        cornerRadiusTR: theme.borderRadius,
        cornerRadiusBL: theme.borderRadius,
        cornerRadiusBR: theme.borderRadius
      });
      series.nodes.labels.template.setAll({
        fontSize: contentSize,
        fill: am5.color(resolveColor(labelColor, '#888888')),
        paddingLeft: 5,
        paddingRight: 5
      });

      series.links.template.setAll({
        fillOpacity: 0.3,
        strokeStyle: "solid"
      });

      series.data.setAll(widget.data);
      series.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_BAR || widget.type === WidgetType.CHART_BAR_HORIZONTAL || widget.type === WidgetType.DASH_RANK_LIST) {
      const isHorizontal = widget.type === WidgetType.CHART_BAR_HORIZONTAL || widget.type === WidgetType.DASH_RANK_LIST;

      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout
      }));

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      let xAxis, yAxis;
      if (isHorizontal) {
        xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
          renderer: xRenderer
        }));
        yAxis = chart.yAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: xAxisKey,
          renderer: yRenderer,
          tooltip: am5.Tooltip.new(root, {})
        }));
        yAxis.data.setAll(widget.data);
      } else {
        xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: xAxisKey,
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {})
        }));
        xAxis.data.setAll(widget.data);
        yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
          renderer: yRenderer
        }));
      }

      widget.config.series.forEach(s => {
        const series = chart.series.push(am5xy.ColumnSeries.new(root, {
          name: s.label,
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: isHorizontal ? s.key : undefined,
          valueYField: isHorizontal ? undefined : s.key,
          categoryXField: isHorizontal ? undefined : xAxisKey,
          categoryYField: isHorizontal ? xAxisKey : undefined,
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueX}{valueY}"
          })
        }));

        series.columns.template.setAll({
          cornerRadiusTL: theme.chartRadius,
          cornerRadiusTR: isHorizontal ? 0 : theme.chartRadius,
          cornerRadiusBR: isHorizontal ? theme.chartRadius : 0,
          cornerRadiusBL: 0,
          strokeOpacity: 0,
          fill: am5.color(resolveColor(s.color, theme.primaryColor))
        });

        series.data.setAll(widget.data);
        series.appear(1000);
      });
    } else if (widget.type === WidgetType.CHART_LINE || widget.type === WidgetType.CHART_AREA || widget.type === WidgetType.DASH_TRAFFIC_STATUS || widget.type === WidgetType.DASH_FAILURE_STATS || widget.type === WidgetType.DASH_NET_TRAFFIC) {
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout
      }));

      const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));
      xAxis.data.setAll(widget.data);

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      widget.config.series.forEach(s => {
        const series = chart.series.push(am5xy.LineSeries.new(root, {
          name: s.label,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: s.key,
          categoryXField: xAxisKey,
          stroke: am5.color(localResolve(s.color)),
          fill: am5.color(localResolve(s.color)),
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}"
          })
        }));
        series.bullets.push(() => am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 4,
            fill: series.get("stroke")
          })
        }));
        if (widget.type === WidgetType.CHART_AREA || widget.type === WidgetType.DASH_TRAFFIC_STATUS || widget.type === WidgetType.DASH_FAILURE_STATS || widget.type === WidgetType.DASH_NET_TRAFFIC) {
          series.fills.template.setAll({
            fillOpacity: 0.5,
            visible: true,
            fillGradient: am5.LinearGradient.new(root, {
              stops: [
                { opacity: 0.6 },
                { opacity: 0 }
              ]
            })
          });
        }
        if (widget.type === WidgetType.DASH_TRAFFIC_STATUS) {
          series.set("tensionX", 0.77);
        }
        series.data.setAll(widget.data);
        series.appear(1000);
      });
      chart.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_COMPOSED) {
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout
      }));

      const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));
      xAxis.data.setAll(widget.data);

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: 0.1,
        stroke: am5.color(resolveColor(strokeColor, '#444444'))
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: am5.color(resolveColor(labelColor, '#888888')) });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      widget.config.series.forEach((s, idx) => {
        if (idx === 0) {
          const series = chart.series.push(am5xy.ColumnSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: s.key,
            categoryXField: xAxisKey,
            tooltip: am5.Tooltip.new(root, {
              labelText: "{valueY}"
            })
          }));

          series.columns.template.setAll({
            cornerRadiusTL: theme.chartRadius,
            cornerRadiusTR: theme.chartRadius,
            strokeOpacity: 0,
            fill: am5.color(resolveColor(s.color, theme.primaryColor))
          });

          series.data.setAll(widget.data);
          series.appear(1000);
        } else {
          const series = chart.series.push(am5xy.LineSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: s.key,
            categoryXField: xAxisKey,
            stroke: am5.color(localResolve(s.color)),
            fill: am5.color(localResolve(s.color)),
            tooltip: am5.Tooltip.new(root, {
              labelText: "{valueY}"
            })
          }));

          series.strokes.template.setAll({ strokeWidth: 3 });

          series.bullets.push(() => am5.Bullet.new(root, {
            sprite: am5.Circle.new(root, {
              radius: 4,
              fill: series.get("stroke")
            })
          }));

          series.data.setAll(widget.data);
          series.appear(1000);
        }
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
  const isDark = theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER;
  const isCyber = theme.mode === ThemeMode.CYBER;

  const contentSize = theme.contentSize;
  const titleSize = theme.titleSize;
  const titleWeight = theme.titleWeight;

  const strokeColor = isCyber ? 'rgba(0, 229, 255, 0.2)' : 'var(--border-base)';
  const labelColor = isCyber ? '#00e5ff' : 'var(--text-muted)';

  const series = widget.config.series && widget.config.series.length > 0
    ? widget.config.series
    : [{ key: widget.config.yAxisKey || 'value', label: widget.title, color: isCyber ? '#00e5ff' : 'var(--primary-color)' }];

  const chartKey = `chart-${widget.id}-${widget.type}-${series.map(s => s.key).join('-')}`;

  const renderGoogleIcon = (iconName?: string) => {
    const icon = iconName || widget.icon;
    if (!icon) return null;
    return (
      <div className={`p-3 rounded-2xl flex items-center justify-center transition-all ${isCyber ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'bg-[var(--border-muted)] text-[var(--text-main)] border border-[var(--border-base)]'}`}>
        <span className={`material-symbols-outlined ${isCyber ? 'neon-glow' : ''}`} style={{ fontSize: `calc(var(--content-size) * 2.5)` }}>
          {icon}
        </span>
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
      ? currentConfig.series
      : [{ key: currentConfig.yAxisKey || 'value', label: widget.title, color: theme.primaryColor }];

    const commonProps = {
      data: currentData,
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
      // Fallback for Sankey since ApexCharts doesn't support it natively
      if (currentType === WidgetType.CHART_SANKEY) {
        return renderAmChart();
      }

      const { xAxisKey, showLegend, showGrid, showXAxis, showYAxis, unit } = currentConfig;

      const categories = currentData.map(d => String(d[xAxisKey] || ''));
      const apexSeries = localSeries.map(s => ({
        name: s.label,
        data: currentData.map(d => d[s.key])
      }));

      const colors = localSeries.map(s => resolveColor(s.color, theme.primaryColor));

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
            borderRadius: theme.chartRadius,
            columnWidth: '60%',
          }
        }
      };

      let type: any = 'line';
      let chartData: any = apexSeries;
      let legendItems = localSeries.map(s => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor) }));

      switch (currentType) {
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
        case WidgetType.DASH_TRAFFIC_STATUS:
          type = 'area';
          options.stroke.curve = 'smooth';
          options.fill = {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.6,
              opacityTo: 0.1,
              stops: [0, 90, 100]
            }
          };
          break;
        case WidgetType.DASH_NET_TRAFFIC:
          type = 'area';
          options.chart.stacked = true;
          break;
        case WidgetType.DASH_FAILURE_STATS:
          type = 'area';
          break;
        case WidgetType.DASH_RANK_LIST:
          type = 'bar';
          options.plotOptions.bar.horizontal = true;
          options.plotOptions.bar.borderRadius = theme.chartRadius;
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
      const { showLegend, xAxisKey } = currentConfig;
      let legendItems = localSeries.map(s => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor) }));

      if (currentType === WidgetType.CHART_PIE) {
        legendItems = (currentData || []).map((d, idx) => ({
          value: String(d[xAxisKey] || ''),
          color: PIE_COLORS[idx % PIE_COLORS.length]
        }));
      }

      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden">
            <AmChartComponent
              widget={{ ...widget, type: currentType, config: currentConfig, data: currentData }}
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

    const isGeneralWidget = [
      WidgetType.WEATHER, WidgetType.IMAGE, WidgetType.MAP, WidgetType.SUMMARY, WidgetType.SUMMARY_CHART, WidgetType.TABLE,
      WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2,
      WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_SECURITY_STATUS,
      WidgetType.DASH_VDI_STATUS, WidgetType.DASH_RANK_LIST
    ].includes(currentType);

    if (theme.chartLibrary === ChartLibrary.APEXCHARTS && !isGeneralWidget) {
      return renderApexChart();
    }

    if (theme.chartLibrary === ChartLibrary.AMCHARTS && !isGeneralWidget) {
      return renderAmChart();
    }

    switch (currentType) {
      case WidgetType.SUMMARY:
        return (
          <div className="h-full flex flex-col justify-center px-2">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-baseline gap-2">
                {isEditMode && !isSec ? (
                  <input
                    type="text"
                    value={currentMainValue || '0'}
                    onChange={(e) => onUpdate?.(widget.id, { mainValue: e.target.value })}
                    className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${isCyber ? 'font-mono text-cyan-400' : 'text-main'}`}
                    style={{ fontSize: 'var(--text-hero)' }}
                  />
                ) : (
                  <span className={`font-black tracking-tighter leading-tight ${isCyber ? 'font-mono text-cyan-400 neon-glow' : 'text-main'}`} style={{ fontSize: 'var(--text-hero)' }}>
                    {currentMainValue}
                  </span>
                )}
                {unit && (
                  <span className={`font-bold ${isCyber ? 'text-cyan-400/60' : 'text-muted'}`} style={{ fontSize: 'var(--text-md)' }}>
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

      case WidgetType.SUMMARY_CHART:
        const summaryColor = isCyber ? '#00e5ff' : theme.primaryColor;
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
                      className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${isCyber ? 'font-mono text-cyan-400' : (isDark ? 'text-white' : 'text-gray-800')}`}
                      style={{ fontSize: `${contentSize * 3.8}px` }}
                    />
                  ) : (
                    <span className={`font-black tracking-tighter leading-tight ${isCyber ? 'font-mono text-cyan-400 neon-glow' : (isDark ? 'text-white' : 'text-gray-800')}`} style={{ fontSize: 'var(--text-hero)' }}>
                      {currentMainValue}
                    </span>
                  )}
                  {unit && (
                    <span className={`font-bold mb-2 ${isCyber ? 'text-cyan-400/60' : (isDark ? 'text-slate-500' : 'text-gray-400')}`} style={{ fontSize: 'var(--text-md)' }}>
                      {unit}
                    </span>
                  )}
                </div>
              </div>
              <p className={`font-bold leading-tight ${isCyber ? 'text-cyan-400/40' : (isDark ? 'text-slate-300' : 'text-gray-400')}`} style={{ fontSize: 'var(--text-md)' }}>
                {currentSubValue}
              </p>
            </div>
            <div className="absolute bottom-[-24px] left-[-24px] right-[-24px] h-[55%] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id={`grad-${widget.id}-${isSec ? 'sec' : 'main'}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={summaryColor} stopOpacity={isCyber ? 0.8 : 0.4} />
                      <stop offset="50%" stopColor={summaryColor} stopOpacity={isCyber ? 0.3 : 0.1} />
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

      case WidgetType.WEATHER:
        return (
          <div className="h-full flex flex-col justify-center items-center gap-4 text-center">
            <div className="flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 'calc(var(--content-size) * 6)' }}>
                {widget.icon || 'partly_cloudy_day'}
              </span>
              <div className="space-y-1">
                <h4 className="font-black text-main tracking-tighter" style={{ fontSize: 'calc(var(--content-size) * 4)' }}>{currentMainValue}</h4>
                <p className="text-muted font-bold" style={{ fontSize: 'calc(var(--content-size) * 1.2)' }}>{currentSubValue}</p>
              </div>
            </div>
          </div>
        );

      case WidgetType.IMAGE:
        return (
          <div className="h-full w-full relative group overflow-hidden rounded-[var(--radius-md)] bg-[var(--border-muted)]">
            <img
              src={currentMainValue}
              alt={currentSubValue}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {currentSubValue && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="font-bold uppercase tracking-wider" style={{ fontSize: 'var(--text-tiny)' }}>{currentSubValue}</p>
              </div>
            )}
            {isEditMode && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
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
              <MapWidget lat={lat || 37.5665} lng={lng || 126.9780} zoom={13} provider="osm" />
            </div>
            {!widget.noBezel && (
              <div className="absolute top-2 left-2 z-[1000] bg-white/90 dark:bg-black/80 px-2 py-1 rounded font-bold shadow-sm pointer-events-none" style={{ fontSize: 'var(--text-tiny)' }}>
                {currentMainValue}
              </div>
            )}
          </div>
        );



      case WidgetType.CHART_BAR:
        return (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={chartKey} {...commonProps}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {localSeries.map((s) => (
                  <Bar
                    key={s.key}
                    name={s.label}
                    dataKey={s.key}
                    fill={resolveColor(s.color, isCyber ? '#00e5ff' : theme.primaryColor)}
                    radius={[theme.chartRadius, theme.chartRadius, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_BAR_HORIZONTAL:
        return (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={chartKey} layout="vertical" data={currentData} margin={{ top: 5, right: 10, left: 30, bottom: 0 }}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />}
                {showXAxis && <XAxis type="number" stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis dataKey={xAxisKey} type="category" stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} width={65} />}
                <Tooltip cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {localSeries.map((s) => (
                  <Bar
                    key={s.key}
                    name={s.label}
                    dataKey={s.key}
                    fill={resolveColor(s.color, isCyber ? '#00e5ff' : theme.primaryColor)}
                    radius={[0, theme.chartRadius, theme.chartRadius, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_LINE:
        return (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={chartKey} {...commonProps}>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {localSeries.map((s) => (
                  <Line
                    key={s.key}
                    name={s.label}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor)}
                    strokeWidth={isCyber ? 4 : 3}
                    dot={{
                      r: isCyber ? 5 : 4,
                      strokeWidth: 2,
                      fill: isCyber ? 'var(--background)' : (isDark ? '#1e293b' : '#fff'),
                      stroke: resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor)
                    }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_AREA:
        return (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={chartKey} {...commonProps}>
                <defs>
                  {localSeries.map(s => (
                    <linearGradient key={`grad-${s.key}`} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor)} stopOpacity={isCyber ? 0.8 : 0.4} />
                      <stop offset="50%" stopColor={isCyber ? 'var(--secondary-color)' : resolveColor(s.color, theme.primaryColor)} stopOpacity={isCyber ? 0.3 : 0.1} />
                      <stop offset="100%" stopColor={isCyber ? 'var(--secondary-color)' : resolveColor(s.color, theme.primaryColor)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                {showYAxis && <YAxis stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {localSeries.map((s) => (
                  <Area
                    key={s.key}
                    name={s.label}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor)}
                    strokeWidth={isCyber ? 4 : 3}
                    fillOpacity={1}
                    fill={`url(#grad-${s.key})`}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.CHART_PIE:
        return (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currentData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="70%"
                  paddingAngle={5}
                  dataKey={localSeries[0]?.key || 'value'}
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
                        fill={isCyber ? '#00e5ff' : 'var(--text-secondary)'}
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        style={{ fontSize: `${contentSize}px`, fontWeight: 'var(--title-weight)' }}
                      >
                        {labelText}
                      </text>
                    );
                  } : false}
                >
                  {currentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={isCyber ? (index === 0 ? '#00e5ff' : index === 1 ? '#008cff' : index === 2 ? '#6366f1' : PIE_COLORS[index % PIE_COLORS.length]) : PIE_COLORS[index % PIE_COLORS.length]}
                      stroke={isCyber ? 'rgba(0, 229, 255, 0.2)' : 'var(--surface)'}
                      strokeWidth={2}
                    />
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
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={currentData}>
                <PolarGrid stroke={strokeColor} />
                <PolarAngleAxis dataKey={xAxisKey} tick={{ fill: labelColor, fontSize: contentSize }} />
                <PolarRadiusAxis stroke={strokeColor} tick={{ fill: labelColor, fontSize: contentSize }} />
                {localSeries.map(s => (
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

      case WidgetType.CHART_SANKEY:
        const sankeyData = (() => {
          const nodes: { name: string }[] = [];
          const links: { source: number; target: number; value: number }[] = [];
          const nodeMap = new Map<string, number>();

          const sKey = xAxisKey || 'source';
          const tKey = currentConfig.yAxisKey || 'target';
          const vKey = localSeries[0]?.key || 'value';

          currentData.forEach(item => {
            // Flexible key resolution: Configured -> source/target -> from/to
            const sName = item[sKey] || item['source'] || item['from'];
            const tName = item[tKey] || item['target'] || item['to'];
            const val = Number(item[vKey] || item['value']) || 0;

            if (sName && tName) {
              if (!nodeMap.has(sName)) {
                nodeMap.set(sName, nodes.length);
                nodes.push({ name: sName });
              }
              if (!nodeMap.has(tName)) {
                nodeMap.set(tName, nodes.length);
                nodes.push({ name: tName });
              }
              links.push({
                source: nodeMap.get(sName)!,
                target: nodeMap.get(tName)!,
                value: val
              });
            }
          });
          return { nodes, links };
        })();

        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                node={({ x, y, width, height, index, payload, containerWidth }) => {
                  const isOut = x + width + 6 > containerWidth;
                  return (
                    <g>
                      <rect
                        x={x} y={y} width={width} height={height}
                        fill={resolveColor(localSeries[0]?.color, theme.primaryColor)}
                        fillOpacity={0.8}
                        rx={theme.chartRadius}
                      />
                      <text
                        x={x + width / 2}
                        y={y + height / 2}
                        dy={contentSize / 2 - 2}
                        fontSize={contentSize}
                        fill={isDark ? "#fff" : "#000"}
                        textAnchor="middle"
                        pointerEvents="none"
                        style={{ textShadow: isDark ? '0 1px 2px rgba(0,0,0,0.8)' : '0 1px 2px rgba(255,255,255,0.8)' }}
                      >
                        {payload.name}
                      </text>
                    </g>
                  );
                }}
                link={{
                  stroke: resolveColor(localSeries[0]?.color, theme.primaryColor),
                  strokeOpacity: 0.2,
                  fill: "none"
                }}
              >
                <Tooltip contentStyle={tooltipStyle} />
              </Sankey>
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
                {localSeries.map((s, idx) => (
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
                    {localSeries.map(s => (
                      <th key={s.key} className={`pb-3 pt-3 px-3 font-bold text-right uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-100' : 'bg-gray-50 text-gray-500'}`} style={{ borderBottom: `2px solid ${theme.primaryColor}aa` }}>
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
              <div className="relative h-12 overflow-hidden bg-gradient-to-r from-blue-500 to-sky-400 p-px shadow-lg shadow-blue-500/20 group cursor-pointer transition-all hover:shadow-blue-500/40" style={{ borderRadius: theme.chartRadius }}>
                <div className="absolute inset-x-0 h-1/2 bottom-0 bg-white/10 group-hover:h-full transition-all" />
                <div className="relative h-full w-full flex items-center justify-between px-6 text-white font-black" style={{ fontSize: 'var(--text-base)' }}>
                  <div className="flex items-center gap-3">
                    <span className="opacity-80">처리중</span>
                    <span style={{ fontSize: 'var(--text-md)' }}>{currentMainValue}</span>
                  </div>
                  <div className="w-px h-4 bg-white/30" />
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
                  <div className={`p-3 bg-gradient-to-br transition-all group-hover:scale-110 shadow-lg ${isCyber ? (idx === 0 ? 'from-indigo-600 to-violet-600 shadow-indigo-500/40 neon-glow' : 'from-pink-600 to-orange-500 shadow-pink-500/40 neon-glow') : (idx === 0 ? 'from-slate-700 to-slate-800 shadow-slate-500/20' : 'from-blue-600 to-indigo-600 shadow-blue-500/20')}`} style={{ borderRadius: theme.chartRadius }}>
                    <span className="material-symbols-outlined text-white text-2xl">{d.icon}</span>
                  </div>
                  <span className="font-bold text-muted uppercase tracking-tight" style={{ fontSize: 'var(--text-md)' }}>{d.name}</span>
                </div>
                <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-hero)' }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        );

      case WidgetType.DASH_RANK_LIST:
        return (
          <div className="h-full flex items-center gap-8 px-4 overflow-hidden">
            <div className="flex-shrink-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-muted opacity-40 select-none" style={{ fontSize: 'min(90px, 10vh)' }}>
                {currentIcon || 'schema'}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 py-1 overflow-y-auto no-scrollbar justify-center h-full">
              {currentData.map((d: any, idx: number) => {
                const maxVal = Math.max(...currentData.map((i: any) => i.value)) || 1;
                const widthPercent = (d.value / maxVal) * 100;

                return (
                  <div key={idx} className="flex flex-col gap-1 group cursor-pointer">
                    <div className="h-8 bg-[var(--surface-muted)] overflow-hidden relative shadow-inner" style={{ borderRadius: '999px' }}>
                      <div
                        className="h-full transition-all duration-1000 group-hover:brightness-110 shadow-lg relative"
                        style={{
                          width: `${widthPercent}%`,
                          background: `linear-gradient(to right, var(--premium-start), var(--premium-end))`,
                          borderRadius: '999px'
                        }}
                      >
                        <div className="absolute inset-0 flex items-center px-4 whitespace-nowrap">
                          <span className="text-white font-black tracking-tight drop-shadow-md" style={{ fontSize: 'var(--text-small)' }}>
                            {d.name} : {d.value.toLocaleString()}{unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case WidgetType.DASH_FAILURE_STATS:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  {localSeries.map((s, idx) => (
                    <linearGradient key={`grad-stats-${idx}`} id={`grad-stats-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} opacity={0.5} />
                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} stroke={labelColor} fontSize={parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--text-tiny')) || 10} fontWeight="600" />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: '5px' }} />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, theme.primaryColor)}
                    strokeWidth={4}
                    fillOpacity={1}
                    fill={`url(#grad-stats-${idx})`}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: resolveColor(s.color, theme.primaryColor) }}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.DASH_RESOURCE_USAGE:
        return (
          <div className="h-full flex items-center gap-6 px-2">
            {currentIcon && (
              <div className="flex-shrink-0 transition-transform hover:scale-110">
                {renderGoogleIcon(currentIcon)}
              </div>
            )}
            <div className="flex-1 flex flex-col gap-4 justify-center py-2">
              {currentData.map((d: any, idx: number) => (
                <div key={idx} className="flex flex-col gap-1.5 group">
                  <div className="flex justify-between items-center px-1">
                    <div className="font-black text-muted uppercase tracking-tight group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-tiny)' }}>{d.name}</div>
                    <div className="font-mono font-black text-main" style={{ fontSize: 'var(--text-tiny)' }}>{d.value}%</div>
                  </div>
                  <div className="h-2.5 bg-[var(--surface-muted)] overflow-hidden relative shadow-inner" style={{ borderRadius: theme.chartRadius }}>
                    <div
                      className="h-full transition-all duration-1000 group-hover:brightness-110"
                      style={{
                        width: `${d.value}%`,
                        background: `linear-gradient(to right, ${resolveColor(d.color, theme.primaryColor)}, ${resolveColor(d.color, theme.primaryColor)}88)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );


      case WidgetType.DASH_TRAFFIC_STATUS:
        return (
          <div className="h-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  {localSeries.map((s, idx) => (
                    <linearGradient key={`gradTraffic-${idx}`} id={`gradTraffic-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} opacity={0.3} />}
                <XAxis dataKey={xAxisKey} hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <YAxis hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="top" align="right" />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={s.key}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, theme.primaryColor)}
                    strokeWidth={isCyber ? 4 : 3}
                    fillOpacity={1}
                    fill={`url(#gradTraffic-${idx})`}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.DASH_NET_TRAFFIC:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData}>
                <defs>
                  {localSeries.map((s, idx) => (
                    <linearGradient key={idx} id={`gradNet-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} opacity={0.2} />}
                <XAxis dataKey={xAxisKey} hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <YAxis hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="top" align="right" />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={idx}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, theme.primaryColor)}
                    strokeWidth={isCyber ? 3 : 2}
                    fill={`url(#gradNet-${idx})`}
                    dot={false}
                    stackId="1"
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.DASH_SECURITY_STATUS:
        return (
          <div className="h-full flex items-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-32 h-32 rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center group cursor-pointer transition-all hover:border-blue-500 hover:rotate-12">
                <div className="absolute inset-2 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <span className="material-symbols-outlined text-4xl text-blue-500">verified_user</span>
                <div className="absolute -bottom-2 bg-blue-600 text-white px-3 py-1 rounded-full font-black shadow-lg shadow-blue-500/40" style={{ fontSize: 'var(--text-tiny)' }}>{currentMainValue}</div>
              </div>
              <span className="font-black text-muted uppercase tracking-widest" style={{ fontSize: 'var(--text-tiny)' }}>보안성공/탐지</span>
            </div>
            <div className="flex-1 h-full overflow-hidden py-2">
              <table className="w-full h-full font-bold border-collapse" style={{ fontSize: 'var(--text-base)' }}>
                <thead className="text-muted uppercase tracking-tighter border-b border-[var(--border-base)]" style={{ fontSize: 'var(--text-tiny)' }}>
                  <tr>
                    <th className="text-left pb-2">유형</th>
                    <th className="text-right pb-2">오늘</th>
                    <th className="text-right pb-2">주간</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-muted)]">
                  {currentData.map((d: any, idx: number) => (
                    <tr key={idx} className="group hover:bg-[var(--primary-subtle)] transition-colors">
                      <td className="py-2.5 text-secondary">{d.name}</td>
                      <td className="py-2.5 text-right font-mono text-main group-hover:text-primary">{d.today}</td>
                      <td className="py-2.5 text-right font-mono text-muted">{d.weekly}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );


      case WidgetType.DASH_VDI_STATUS:
        return (
          <div className="h-full flex flex-col justify-center gap-4 px-2">
            {currentData.map((d: any, idx: number) => (
              <div key={idx} className="relative group overflow-hidden bg-[var(--surface-muted)] border border-[var(--border-base)] p-4 flex items-center justify-between transition-all hover:bg-[var(--surface)] hover:shadow-premium cursor-pointer" style={{ borderRadius: theme.chartRadius }}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <span className="relative z-10 font-bold text-secondary uppercase tracking-tight" style={{ fontSize: 'var(--text-base)' }}>{d.name}</span>
                <div className="relative z-10 flex items-baseline gap-1">
                  <span className="font-black text-main group-hover:text-primary transition-colors" style={{ fontSize: 'var(--text-lg)' }}>{d.value.toLocaleString()}</span>
                  <span className="font-black text-muted uppercase" style={{ fontSize: 'var(--text-tiny)' }}>건</span>
                </div>
              </div>
            ))}
          </div>
        );

      default:
        return <div className="flex items-center justify-center h-full text-gray-400 italic text-sm">No Preview</div>;
    }
  };

  return (
    <div className={`h-full flex flex-col group relative ${isCyber ? 'cyber-frame' : ''}`}>
      {isCyber && <div className="cyber-frame-inner absolute inset-0 pointer-events-none z-10" />}
      <div className={`flex-1 flex flex-col overflow-hidden bg-surface transition-all duration-300 ${!widget.noBezel ? 'rounded-design border-main shadow-base p-design' : ''} ${isEditMode ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : ''}`}>
        {!widget.hideHeader && (
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-2 overflow-hidden">
              {isEditMode && (
                <div className="drag-handle cursor-grab opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 p-1">
                  <GripVertical className="w-4 h-4 text-muted" />
                </div>
              )}
              {isEditMode ? (
                <input
                  type="text"
                  value={widget.title}
                  onChange={(e) => onUpdate?.(widget.id, { title: e.target.value })}
                  className={`bg-transparent border-none p-0 font-bold focus:ring-0 outline-none w-full truncate ${isCyber ? 'text-cyan-400' : 'text-main'}`}
                  style={{ fontSize: `${titleSize}px`, fontWeight: titleWeight }}
                />
              ) : (
                <h3 className={`font-bold truncate ${isCyber ? 'text-cyan-400 uppercase tracking-wider' : 'text-main'}`} style={{ fontSize: `${titleSize}px`, fontWeight: titleWeight }}>
                  {widget.title}
                  {isCyber && <span className="ml-2 inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
                </h3>
              )}
            </div>

            {isEditMode && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => onEdit(widget.id)}
                  className={`p-1.5 hover:bg-muted text-muted transition-colors ${isCyber ? 'rounded-md' : 'rounded-lg'}`}
                  title="Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onOpenExcel(widget.id)}
                  className={`p-1.5 hover:bg-muted text-muted transition-colors ${isCyber ? 'rounded-md' : 'rounded-lg'}`}
                  title="Open Data"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(widget.id)}
                  className={`p-1.5 hover:bg-red-500/10 hover:text-red-500 text-muted transition-colors ${isCyber ? 'rounded-md' : 'rounded-lg'}`}
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-h-0 relative">
          {isCyber && <div className="widget-scan" />}
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
  );
};

export default WidgetCard;
