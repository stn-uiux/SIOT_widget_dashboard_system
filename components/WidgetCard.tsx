
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
import { Settings, GripVertical, FileSpreadsheet, Maximize2, X, MapPin, Image, Trash2, TrendingDown, User, Repeat, Activity, BarChart3, TrendingUp, Database, Users, Clock } from 'lucide-react';
import { Widget, WidgetType, DashboardTheme, ThemeMode, ChartLibrary, ChartConfig } from '../types';
import { GENERAL_KPI_ICON_OPTIONS } from '../constants';
import MapWidget from './MapWidget';
import chartLayoutTokens from '../chart-layout-tokens.json';


const GENERAL_KPI_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingDown, User, Repeat, Activity, BarChart3, TrendingUp, Database, Users, Clock,
};

/** hex 색상으로 ±percent 밝기 조절 (DesignSystem과 동일 로직, 브랜드 변경 시 즉시 반영용) */
function shadeColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let R = parseInt(hex.slice(1, 3), 16);
  let G = parseInt(hex.slice(3, 5), 16);
  let B = parseInt(hex.slice(5, 7), 16);
  R = Math.min(255, Math.max(0, Math.floor(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, Math.floor(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, Math.floor(B * (100 + percent) / 100)));
  return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
}

/**
 * colorStr을 실제 hex로 반환. primaryHex를 넘기면 var(--primary-color), var(--primary-50) 등은
 * 브랜드 색에서 바로 계산해 써서 디자인에서 primary 바꿔도 즉시 반영됨.
 */
const resolveColor = (colorStr: string | undefined, fallback: string, primaryHex?: string) => {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.match(/var\(([^)]+)\)/)?.[1]?.trim();
    if (varName && primaryHex && primaryHex.startsWith('#')) {
      if (varName === '--primary-color') return primaryHex;
      const primaryShade = varName.match(/^--primary-(\d+)$/)?.[1];
      if (primaryShade) {
        const step = parseInt(primaryShade, 10);
        return shadeColor(primaryHex, (step - 50) * -1.5);
      }
    }
    if (varName) {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return val || fallback;
    }
  }
  return colorStr;
};

const PIE_COLORS = [
  'var(--primary-color)',
  'var(--secondary-color)',
  'var(--success)',
  'var(--warning)',
  'var(--purple-500)',
  'var(--pink-500)',
  'var(--red-500)'
];

/** 헤더·차트 공통 좌우 패딩 (0 = 카드 콘텐츠와 맞춤) */
const CHART_LEFT_INSET = 0;

/** 가로 막대 차트: 가장 긴 Y축(카테고리) 텍스트 길이에 맞춰 동적으로 너비 계산 */
const HorizontalBarChartYAxisMeasure: React.FC<{
  currentData: any[];
  xAxisKey: string;
  contentSize: number;
  children: (yAxisWidth: number) => React.ReactNode;
}> = (props) => {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [yAxisWidth, setYAxisWidth] = React.useState(28);
  const longestLabel = React.useMemo(() => {
    const strs = (props.currentData || []).map((d: any) => String(d[props.xAxisKey] ?? ''));
    return strs.length ? strs.reduce((a, b) => (a.length >= b.length ? a : b), '') : '';
  }, [props.currentData, props.xAxisKey]);

  React.useLayoutEffect(() => {
    if (!measureRef.current) {
      setYAxisWidth(28);
      return;
    }
    const w = measureRef.current.offsetWidth;
    setYAxisWidth(Math.max(24, Math.min(220, w + 8)));
  }, [longestLabel, props.contentSize]);

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: props.contentSize,
          fontWeight: 500,
        }}
      >
        {longestLabel || '0'}
      </span>
      {props.children(yAxisWidth)}
    </>
  );
};

/** Recharts 선형/영역/세로막대/혼합: Y축 숫자 레이블 길이에 맞춰 동적으로 너비 계산. showYAxis false면 0 전달해 플롯이 헤더와 정렬 */
const RechartsNumericYAxisMeasure: React.FC<{
  currentData: any[];
  localSeries: { key: string; label: string; color?: string }[];
  contentSize: number;
  showYAxis?: boolean;
  children: (yAxisWidth: number) => React.ReactNode;
}> = (props) => {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [yAxisWidth, setYAxisWidth] = React.useState(28);
  const maxVal = React.useMemo(() => {
    if (!props.currentData?.length || !props.localSeries?.length) return 0;
    let m = 0;
    for (const d of props.currentData) {
      for (const s of props.localSeries) {
        const v = Number(d[s.key]);
        if (!Number.isNaN(v)) m = Math.max(m, v);
      }
    }
    return m;
  }, [props.currentData, props.localSeries]);

  React.useLayoutEffect(() => {
    if (!measureRef.current) {
      setYAxisWidth(28);
      return;
    }
    const w = measureRef.current.offsetWidth;
    setYAxisWidth(Math.max(24, Math.min(120, w + 8)));
  }, [maxVal, props.contentSize]);

  const effectiveWidth = props.showYAxis !== false ? yAxisWidth : 0;
  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: props.contentSize,
          fontWeight: 500,
        }}
      >
        {maxVal.toLocaleString()}
      </span>
      {props.children(effectiveWidth)}
    </>
  );
};

/** Y축 레이블 길이에 맞춰 margin.left를 잡는 실시간 트래픽 차트 */
const TrafficStatusChart: React.FC<{
  currentData: any[];
  valueKey: string;
  contentSize: number;
  labelColor: string;
  strokeColor: string;
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showLegend: boolean;
  xAxisKey: string;
  localSeries: { key: string; label: string; color?: string }[];
  theme: DashboardTheme;
  isCyber: boolean;
  tooltipStyle: React.CSSProperties;
  renderLegend: () => React.ReactNode;
  resolveColor: (c: string | undefined, a: string, b: string) => string;
  leftInset?: number;
}> = (props) => {
  const measureRef = React.useRef<HTMLSpanElement>(null);
  const [yAxisWidth, setYAxisWidth] = React.useState(() => 0);
  const maxVal = React.useMemo(() => {
    if (!props.currentData?.length) return 0;
    return Math.max(...props.currentData.map((d: any) => Number(d[props.valueKey]) ?? 0));
  }, [props.currentData, props.valueKey]);

  React.useLayoutEffect(() => {
    if (!measureRef.current || !props.showYAxis) {
      setYAxisWidth(0);
      return;
    }
    const w = measureRef.current.offsetWidth;
    setYAxisWidth(w + 6);
  }, [maxVal, props.contentSize, props.showYAxis]);

  return (
    <>
      <span
        ref={measureRef}
        aria-hidden
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontSize: props.contentSize,
          fontWeight: 600,
        }}
      >
        {maxVal.toLocaleString()}
      </span>
      <AreaChart data={props.currentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          {props.localSeries.map((s, idx) => (
            <linearGradient key={`gradTraffic-${idx}`} id={`gradTraffic-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={props.resolveColor(s.color, props.theme.primaryColor, props.theme.primaryColor)} stopOpacity={0.4} />
              <stop offset="95%" stopColor={props.resolveColor(s.color, props.theme.primaryColor, props.theme.primaryColor)} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {props.showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={props.strokeColor} opacity={0.3} />}
        <XAxis dataKey={props.xAxisKey} hide={!props.showXAxis} stroke={props.labelColor} fontSize={props.contentSize} tickLine={false} axisLine={false} />
        <YAxis width={yAxisWidth} hide={!props.showYAxis} stroke={props.labelColor} fontSize={props.contentSize} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
        <Tooltip contentStyle={props.tooltipStyle} />
        {props.showLegend && <Legend content={props.renderLegend} verticalAlign="top" align="right" />}
        {props.localSeries.map((s, idx) => (
          <Area
            key={s.key}
            type="natural"
            dataKey={s.key}
            stroke={props.resolveColor(s.color, props.theme.primaryColor, props.theme.primaryColor)}
            strokeWidth={props.isCyber ? 4 : 3}
            fillOpacity={1}
            fill={`url(#gradTraffic-${idx})`}
            dot={false}
          />
        ))}
      </AreaChart>
    </>
  );
};

const AmChartComponent = React.memo<{
  widget: Widget,
  theme: DashboardTheme,
  isDark: boolean,
  contentSize: number,
  labelColor: string,
  strokeColor: string
}>(({ widget, theme, isDark, contentSize, labelColor, strokeColor }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<am5.Root | null>(null);

  React.useLayoutEffect(() => {
    const container = chartRef.current;
    if (!container || !(container instanceof HTMLElement) || !container.isConnected) return;

    let cancelled = false;
    let root: am5.Root | null = null;

    const initChart = () => {
      if (cancelled) return;
      const el = chartRef.current;
      if (!el || !el.isConnected) return;
      try {
        root = am5.Root.new(el);
        rootRef.current = root;
      } catch {
        return;
      }
      root._logo?.dispose();

    const localResolve = (c: string | undefined) => resolveColor(c, theme.primaryColor, theme.primaryColor);
    const toHex = (cssOrHex: string): string => {
      if (!cssOrHex || cssOrHex.startsWith('#')) return cssOrHex || '#64748b';
      if (cssOrHex.startsWith('var(')) {
        const varName = cssOrHex.replace(/var\(|\)$/g, '').trim();
        const computed = typeof document !== 'undefined' ? getComputedStyle(document.documentElement).getPropertyValue(varName).trim() : '';
        return computed || '#64748b';
      }
      return cssOrHex;
    };
    const labelFill = am5.color(toHex(isDark ? 'var(--text-muted)' : resolveColor(labelColor, 'var(--text-muted)')));
    const axisStroke = am5.color(toHex(isDark ? 'var(--text-muted)' : resolveColor(strokeColor, 'var(--text-secondary)')));

    root.setThemes([
      am5themes_Animated.new(root),
      ...(isDark ? [am5themes_Dark.new(root)] : [])
    ]);

    root.container.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
    if (root.tooltipContainer) {
      root.tooltipContainer.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
    }

    const config = widget.config || {};
    const seriesList = config.series && config.series.length > 0
      ? config.series
      : [{ key: 'value', label: 'Value', color: 'var(--primary-color)' }];
    const safeConfig = { ...config, series: seriesList };
    const { xAxisKey = 'name', showGrid = true, showXAxis = true, showYAxis = true } = safeConfig;
    const data = Array.isArray(widget.data) ? widget.data : [];

    if (widget.type === WidgetType.CHART_PIE) {
      const chart = root.container.children.push(am5percent.PieChart.new(root, {
        radius: am5.percent(70),
        innerRadius: am5.percent(50)
      }));

      const series = chart.series.push(am5percent.PieSeries.new(root, {
        name: "Series",
        categoryField: xAxisKey,
        valueField: seriesList[0]?.key || 'value'
      }));

      series.get("colors").set("colors", PIE_COLORS.map(c => am5.color(localResolve(c))));
      series.labels.template.setAll({ fill: labelFill, fontSize: contentSize });
      series.ticks.template.setAll({ stroke: axisStroke });

      series.data.setAll(data);
      series.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_RADAR) {
      const chart = root.container.children.push(am5radar.RadarChart.new(root, {
        panX: false,
        panY: false,
        startAngle: -90,
        endAngle: 270
      }));

      const xRenderer = am5radar.AxisRendererCircular.new(root, {});
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
      }));
      xAxis.data.setAll(data);

      const yRenderer = am5radar.AxisRendererRadial.new(root, {});
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      seriesList.forEach(s => {
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
          fill: am5.color(resolveColor(s.color, theme.primaryColor, theme.primaryColor)),
          fillOpacity: 0.8
        });

        series.strokes.template.setAll({
          strokeWidth: 2,
          stroke: am5.color(resolveColor(s.color, theme.primaryColor, theme.primaryColor))
        });

        series.fills.template.setAll({
          visible: true,
          fillOpacity: 0.3,
          fill: am5.color(resolveColor(s.color, theme.primaryColor, theme.primaryColor))
        });

        series.data.setAll(data);
        series.appear(1000);
      });
    } else if (widget.type === WidgetType.CHART_SANKEY) {
      const series = root.container.children.push(am5flow.Sankey.new(root, {
        sourceIdField: xAxisKey || "from",
        targetIdField: safeConfig.yAxisKey || "to",
        valueField: seriesList[0]?.key || "value",
        paddingRight: 12,
        paddingLeft: 12,
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
        fill: labelFill,
        paddingLeft: 5,
        paddingRight: 5
      });

      series.links.template.setAll({
        fillOpacity: 0.3,
        strokeStyle: "solid"
      });

      series.data.setAll(data);
      series.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_BAR || widget.type === WidgetType.CHART_BAR_HORIZONTAL || widget.type === WidgetType.DASH_RANK_LIST) {
      const isHorizontal = widget.type === WidgetType.CHART_BAR_HORIZONTAL || widget.type === WidgetType.DASH_RANK_LIST;

      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingLeft: 0,
        paddingRight: 12,
        paddingTop: showYAxis ? 12 : 0,
        paddingBottom: 0
      }));
      chart.leftAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.rightAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.bottomAxesContainer.setAll({ paddingTop: 0, paddingBottom: 0 });
      chart.topAxesContainer.setAll({ paddingTop: 0, paddingBottom: 0 });

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
        strokeOpacity: showXAxis ? 0.1 : 0,
        stroke: axisStroke
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showXAxis });
      xRenderer.grid.template.setAll({ visible: showGrid });

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: showYAxis ? 0.1 : 0,
        stroke: axisStroke,
        minWidth: showYAxis ? 40 : 0,
        maxWidth: showYAxis ? undefined : 0,
        marginLeft: showYAxis ? undefined : 0,
        marginRight: showYAxis ? undefined : 0
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showYAxis });
      yRenderer.grid.template.setAll({ visible: showGrid });

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
        yAxis.data.setAll(data);
      } else {
        xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
          categoryField: xAxisKey,
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {})
        }));
        xAxis.data.setAll(data);
        yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
          renderer: yRenderer
        }));
      }

      const isStacked = chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked';
      if (isStacked) {
        if (isHorizontal) {
          xAxis.set("stacked", true);
        } else {
          yAxis.set("stacked", true);
        }
      }

      seriesList.forEach(s => {
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
          fill: am5.color(resolveColor(s.color, theme.primaryColor, theme.primaryColor)),
          [isHorizontal ? "height" : "width"]: am5.percent(safeConfig.barWidth ?? 60)
        });

        series.data.setAll(data);
        series.appear(1000);
      });
    } else if (widget.type === WidgetType.CHART_LINE || widget.type === WidgetType.CHART_AREA || widget.type === WidgetType.DASH_TRAFFIC_STATUS || widget.type === WidgetType.DASH_FAILURE_STATS || widget.type === WidgetType.DASH_NET_TRAFFIC) {
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingLeft: 0,
        paddingRight: 12,
        paddingTop: showYAxis ? 12 : 0,
        paddingBottom: 0
      }));
      chart.leftAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.rightAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.bottomAxesContainer.setAll({ paddingTop: 0, paddingBottom: 0 });
      chart.topAxesContainer.setAll({ paddingTop: showYAxis ? 12 : 0, paddingBottom: 0 });

      const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: showXAxis ? 0.1 : 0,
        stroke: axisStroke
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showXAxis });
      xRenderer.grid.template.setAll({ visible: showGrid });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));
      xAxis.data.setAll(data);

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: showYAxis ? 0.1 : 0,
        stroke: axisStroke,
        minWidth: showYAxis ? 40 : 0,
        maxWidth: showYAxis ? undefined : 0,
        marginLeft: showYAxis ? undefined : 0,
        marginRight: showYAxis ? undefined : 0
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showYAxis });
      yRenderer.grid.template.setAll({ visible: showGrid });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      seriesList.forEach(s => {
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
          (series as any).set("tensionX", 0.77);
        }
        series.data.setAll(data);
        series.appear(1000);
      });
      chart.appear(1000, 100);
    } else if (widget.type === WidgetType.CHART_COMPOSED) {
      const chart = root.container.children.push(am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingLeft: 0,
        paddingRight: 12,
        paddingTop: showYAxis ? 12 : 0,
        paddingBottom: 0
      }));
      chart.leftAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.rightAxesContainer.setAll({ paddingLeft: 0, paddingRight: 0 });
      chart.bottomAxesContainer.setAll({ paddingTop: 0, paddingBottom: 0 });
      chart.topAxesContainer.setAll({ paddingTop: showYAxis ? 12 : 0, paddingBottom: 0 });

      const xRenderer = am5xy.AxisRendererX.new(root, {
        strokeOpacity: showXAxis ? 0.1 : 0,
        stroke: axisStroke
      });
      xRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showXAxis });
      xRenderer.grid.template.setAll({ visible: showGrid });

      const xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {})
      }));
      xAxis.data.setAll(data);

      const yRenderer = am5xy.AxisRendererY.new(root, {
        strokeOpacity: showYAxis ? 0.1 : 0,
        stroke: axisStroke,
        minWidth: showYAxis ? 40 : 0,
        maxWidth: showYAxis ? undefined : 0,
        marginLeft: showYAxis ? undefined : 0,
        marginRight: showYAxis ? undefined : 0
      });
      yRenderer.labels.template.setAll({ fontSize: contentSize, fill: labelFill, visible: showYAxis });
      yRenderer.grid.template.setAll({ visible: showGrid });

      const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
        renderer: yRenderer
      }));

      seriesList.forEach((s, idx) => {
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
            fill: am5.color(resolveColor(s.color, theme.primaryColor, theme.primaryColor))
          });

          series.data.setAll(data);
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

          series.data.setAll(data);
          series.appear(1000);
        }
      });
      chart.appear(1000, 100);
    } else {
      const label = root.container.children.push(am5.Label.new(root, {
        text: 'Unsupported in amCharts',
        fontSize: contentSize,
        fill: labelFill,
        x: am5.percent(50),
        y: am5.percent(50),
        centerX: am5.percent(50),
        centerY: am5.percent(50),
      }));
      label.appear(100);
    }

    }; // end initChart — 차트 생성은 다음 프레임으로 미뤄서 가져오기 직후 DOM/ref 타이밍 이슈 방지
    const rafId = requestAnimationFrame(() => {
      initChart();
      if (cancelled) return;
      const r = rootRef.current;
      if (r) {
        requestAnimationFrame(() => { try { r.resize(); } catch { /* ignore */ } });
        setTimeout(() => { try { r.resize(); } catch { /* ignore */ } }, 50);
        setTimeout(() => { try { r.resize(); } catch { /* ignore */ } }, 300);
      }
    });

    const ro = typeof ResizeObserver !== 'undefined' && container
      ? new ResizeObserver(() => {
          if (cancelled) return;
          try { rootRef.current?.resize(); } catch { /* ignore */ }
        })
      : null;
    if (ro && container) ro.observe(container);

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro?.disconnect();
      try {
        rootRef.current?.dispose();
        rootRef.current = null;
      } catch { /* ignore */ }
    };
  }, [
    widget.id, 
    widget.type, 
    widget.data, 
    widget.config, 
    theme.primaryColor, 
    theme.borderRadius, 
    isDark, 
    contentSize, 
    labelColor, 
    strokeColor
  ]);

  return <div ref={chartRef} className="w-full h-full min-h-[120px]" style={{ minHeight: 120 }} />;
});

/** ApexCharts 선택 시 Sankey 전용. wrapper 크기를 관찰해 위젯 폭에 맞춰 다시 그립니다. */
const ApexSankeyWidget: React.FC<{
  data: { nodes: { id: string; title: string }[]; edges: { source: string; target: string; value: number }[] };
  fontColor?: string;
  nodeWidth?: number;
}> = ({ data, fontColor = 'var(--text-main)', nodeWidth = 20 }) => {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mountedRef = React.useRef(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  React.useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    let rafId: number | null = null;
    const updateSize = () => {
      if (!wrapper) return;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = wrapper.getBoundingClientRect();
        const w = Math.round(rect.width) || 0;
        const h = Math.round(rect.height) || 0;
        if (w > 0 && h > 0) {
          setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
        }
      });
    };
    const ro = new ResizeObserver(updateSize);
    ro.observe(wrapper);
    updateSize();
    const t2 = setTimeout(updateSize, 150);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      ro.disconnect();
      clearTimeout(t2);
    };
  }, []);

  React.useEffect(() => {
    setLoadError(null);
    mountedRef.current = true;
    const el = containerRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !data.nodes.length) return;
    const w = size.w > 0 ? size.w : (wrapper ? Math.round(wrapper.getBoundingClientRect().width) : 0) || el.offsetWidth || 400;
    const h = size.h > 0 ? size.h : (wrapper ? Math.round(wrapper.getBoundingClientRect().height) : 0) || el.offsetHeight || 300;
    if (w <= 0 || h <= 0) return;

    (async () => {
      try {
        const mod = await import('apexsankey');
        if (!mountedRef.current || !el) return;
        const ApexSankeyLib = (mod as any).default ?? mod;
        if (!ApexSankeyLib) return;
        const licenseKey = (import.meta as any).env?.VITE_APEXSANKEY_LICENSE;
        if (typeof ApexSankeyLib.setLicense === 'function' && licenseKey) {
          ApexSankeyLib.setLicense(licenseKey);
        }
        el.style.width = '';
        el.style.height = '';
        el.style.minWidth = '';
        el.style.minHeight = '';
        const sankey = new ApexSankeyLib(el, {
          width: w,
          height: h,
          fontColor,
          nodeWidth,
          enableTooltip: true,
          edgeOpacity: 0.5,
          canvasStyle: 'border: none; background: transparent;',
          enableToolbar: false,
        });
        sankey.render(data);
        if (!licenseKey && mountedRef.current && el) {
          const hideWatermark = (node: HTMLElement) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            const elem = node as HTMLElement;
            const text = elem.textContent?.trim().replace(/\s+/g, ' ') ?? '';
            const onlyApex = /^(APEXCHARTS\s*)+$/i.test(text) || text === 'APEXCHARTS';
            if (elem.children.length === 0 && onlyApex) {
              elem.style.display = 'none';
              return;
            }
            Array.from(elem.children).forEach((c) => hideWatermark(c as HTMLElement));
          };
          const run = () => {
            if (!mountedRef.current || !el) return;
            hideWatermark(el);
          };
          requestAnimationFrame(run);
          setTimeout(run, 150);
        }
      } catch (err) {
        if (mountedRef.current) {
          setLoadError('apexsankey 로드 실패. 터미널에서 npm install 후 dev 서버를 다시 실행하세요.');
          if (el) el.innerHTML = '';
        }
      }
    })();

    return () => {
      mountedRef.current = false;
      if (el) el.innerHTML = '';
    };
    // Avoid re-running on every slight size change if possible, or throttle
  }, [data, fontColor, nodeWidth, size.w, size.h]);

  if (loadError) {
    return (
      <div className="w-full h-full min-h-[200px] flex items-center justify-center p-4 text-center text-sm text-red-400 bg-red-950/20 rounded">
        {loadError}
      </div>
    );
  }
  return (
    <div ref={wrapperRef} className="w-full h-full min-w-0 min-h-[200px]" style={{ minHeight: '200px' }}>
      <div ref={containerRef} className="apex-sankey-container w-full h-full" />
    </div>
  );
};

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
  isDragging
}) => {
  const isDark = theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER;
  const isCyber = false; // Cyber styling removed; always use normal/dark styling

  const contentSize = theme.contentSize;
  const titleSize = widget.titleSize ?? theme.titleSize;
  const titleWeight = widget.titleWeight ?? theme.titleWeight;

  const strokeColor = 'var(--border-base)';
  const labelColor = isDark ? 'var(--text-muted)' : 'var(--text-muted)';

  const series = widget.config.series && widget.config.series.length > 0
    ? widget.config.series
    : [{ key: widget.config.yAxisKey || 'value', label: widget.title, color: 'var(--primary-color)' }];

  const chartKey = `chart-${widget.id}-${widget.type}-${series.map(s => s.key).join('-')}`;

  const renderGoogleIcon = (iconName?: string) => {
    const icon = iconName || widget.icon;
    if (!icon) return null;
    const customIconSize = widget.iconSize;
    return (
      <div 
        className="p-3 rounded-2xl flex items-center justify-center transition-all bg-[var(--border-muted)] text-[var(--text-main)] border border-[var(--border-base)]"
        style={customIconSize ? { width: `${customIconSize}px`, height: `${customIconSize}px`, padding: 0 } : {}}
      >
        <span 
          className="material-symbols-outlined" 
          style={{ fontSize: customIconSize ? `${customIconSize * 0.6}px` : `calc(var(--content-size) * 2.5)` }}
        >
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
      margin: { top: 6, right: 6, left: 6, bottom: 0 }
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
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1 px-2">
        {items.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="font-bold whitespace-nowrap" style={{ fontSize: 'var(--content-size)', color: isDark ? 'var(--text-muted)' : 'var(--text-muted)' }}>
              {entry.value}
            </span>
          </div>
        ))}
        {showUnitInLegend && unit && (
          <div className="flex items-center gap-1.5 border-l pl-4 border-[var(--border-base)]">
            <span className="font-bold tracking-tight uppercase opacity-80" style={{ fontSize: 'calc(var(--content-size) * 0.85)', color: isDark ? 'var(--text-secondary)' : 'var(--text-muted)' }}>
              단위: {unit}
            </span>
          </div>
        )}
      </div>
    );

    const renderLegend = (props: any) => {
      const { payload } = props;
      return renderCustomLegend(payload.map((p: any, index: number) => {
        let color = p.color || p.payload?.fill || '';
        if (!color || String(color).startsWith('url(')) {
          const s = localSeries[index];
          color = s ? resolveColor(s.color, theme.primaryColor, theme.primaryColor) : (theme.primaryColor || 'var(--primary-color)');
        }
        return { value: p.value, color };
      }));
    };

    const PIE_COLORS_LOCAL = PIE_COLORS;

    const renderApexChart = () => {
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
        const resolvedFontColor = isDark ? 'var(--text-secondary)' : 'var(--text-secondary)';
        return (
          <div className="w-full h-full min-w-0 min-h-0 flex flex-col border-0 outline-none [&_*]:outline-none" style={{ border: 'none', boxShadow: 'none' }}>
            <ApexSankeyWidget data={{ nodes, edges }} fontColor={resolvedFontColor} nodeWidth={Math.max(14, theme.chartRadius * 2)} />
          </div>
        );
      }

      const categories = currentData.map(d => String(d[xAxisKey] || ''));
      const apexSeries = localSeries.map(s => ({
        name: s.label,
        data: currentData.map(d => d[s.key])
      }));

      const colors = localSeries.map(s => resolveColor(s.color, theme.primaryColor, theme.primaryColor));
      const resolvedLabelColor = resolveColor(labelColor, 'var(--text-muted)');
      const resolvedStrokeColor = resolveColor(strokeColor, 'var(--text-secondary)');

      const options: any = {
        chart: {
          toolbar: { show: false },
          parentHeightOffset: 0,
          background: 'transparent',
          foreColor: resolvedLabelColor,
          fontFamily: 'inherit',
          stacked: chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked',
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
          borderColor: resolvedStrokeColor,
          strokeDashArray: 4,
          opacity: chartLayoutTokens.tokens.charts.common.gridOpacity.value,
          padding: { top: 0, right: 0, bottom: 0, left: 0 }
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
            columnWidth: currentConfig.barWidth ? `${currentConfig.barWidth}%` : '60%',
          },
          pie: {
            expandOnClick: false,
            dataLabels: { offset: -5 },
            customScale: 1.05 // Increase internal pie/donut size
          }
        }
      };

      let type: any = 'line';
      let chartData: any = apexSeries;
      let legendItems = localSeries.map(s => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }));

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
          options.colors = PIE_COLORS.map(c => resolveColor(c, theme.primaryColor, theme.primaryColor));
          legendItems = categories.map((cat, idx) => ({
            value: cat,
            color: resolveColor(PIE_COLORS[idx % PIE_COLORS.length], theme.primaryColor, theme.primaryColor)
          }));
          delete options.xaxis;
          delete options.yaxis;
          delete options.grid;
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

      if (currentType === WidgetType.CHART_RADAR) {
        options.grid = { ...options.grid, show: false };
      }
      if (currentType === WidgetType.CHART_BAR || currentType === WidgetType.CHART_BAR_HORIZONTAL || currentType === WidgetType.CHART_LINE || currentType === WidgetType.CHART_AREA || currentType === WidgetType.CHART_COMPOSED || currentType === WidgetType.DASH_TRAFFIC_STATUS || currentType === WidgetType.DASH_RANK_LIST) {
        const pad = options.grid?.padding || {};
        options.grid = { ...options.grid, padding: { ...pad, top: 0, left: 10, right: 10, bottom: 0 } };
        options.yaxis = { ...options.yaxis, labels: { ...(options.yaxis?.labels || {}), offsetX: 0 } };
      }
      if (currentType === WidgetType.CHART_BAR) {
        let apexMaxVal = 0;
        for (const d of currentData || []) {
          for (const s of localSeries) {
            const v = Number(d[s.key]);
            if (!Number.isNaN(v)) apexMaxVal = Math.max(apexMaxVal, v);
          }
        }
        const formattedLen = apexMaxVal.toLocaleString().length;
        const yAxisMaxWidth = Math.max(32, Math.min(100, Math.ceil(formattedLen * (contentSize * 0.55)) + 8));
        options.yaxis = { ...options.yaxis, labels: { ...(options.yaxis?.labels || {}), maxWidth: yAxisMaxWidth } };
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

    const renderAmChart = () => {
      const { showLegend, xAxisKey } = currentConfig;
      let legendItems = localSeries.map(s => ({ value: s.label, color: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }));

      if (currentType === WidgetType.CHART_PIE) {
        legendItems = (currentData || []).map((d, idx) => ({
          value: String(d[xAxisKey] || ''),
          color: PIE_COLORS[idx % PIE_COLORS.length]
        }));
      }

      const amChartLabelColor = isDark ? 'var(--text-main)' : labelColor;
      const isAmXY = [WidgetType.CHART_LINE, WidgetType.CHART_AREA, WidgetType.CHART_BAR, WidgetType.CHART_BAR_HORIZONTAL, WidgetType.CHART_COMPOSED].includes(currentType);
      return (
        <div className="h-full flex flex-col">
          <div className={`flex-1 min-h-0 overflow-hidden`}>
            <AmChartComponent
              widget={{ ...widget, type: currentType, config: currentConfig, data: currentData }}
              theme={theme}
              isDark={isDark}
              contentSize={contentSize}
              labelColor={amChartLabelColor}
              strokeColor={strokeColor}
            />
          </div>
          {showLegend && renderCustomLegend(legendItems)}
        </div>
      );
    };

    const isGeneralWidget = [
      WidgetType.WEATHER, WidgetType.IMAGE, WidgetType.MAP, WidgetType.SUMMARY, WidgetType.SUMMARY_CHART, WidgetType.TABLE,
      WidgetType.GENERAL_KPI,
      WidgetType.EARNING_PROGRESS,
      WidgetType.EARNING_TREND,
      WidgetType.BLANK,
      WidgetType.TEXT_BLOCK,
      WidgetType.VERTICAL_NAV_CARD,
      WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2,
      WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_SECURITY_STATUS,
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
                    className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${isCyber ? 'font-mono text-[var(--cyber-text)]' : 'text-main'}`}
                    style={{ fontSize: heroFontSize }}
                  />
                ) : (
                  <span className={`font-black tracking-tighter leading-tight ${isCyber ? 'font-mono text-[var(--cyber-text)] neon-glow' : 'text-main'}`} style={{ fontSize: heroFontSize }}>
                    {currentMainValue}
                  </span>
                )}
                {unit && (
                  <span className={`font-bold ${isCyber ? 'text-[var(--cyber-text-alpha)]' : 'text-muted'}`} style={{ fontSize: 'var(--text-md)' }}>
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
        const summaryColor = isCyber ? 'var(--cyber-text)' : theme.primaryColor;
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
                      className={`bg-transparent border-none p-0 font-black tracking-tighter focus:ring-0 outline-none w-full ${isCyber ? 'font-mono text-[var(--cyber-text)]' : (isDark ? 'text-white' : 'text-[var(--text-main)]')}`}
                      style={{ fontSize: summaryHeroFontSize }}
                    />
                  ) : (
                    <span className={`font-black tracking-tighter leading-tight ${isCyber ? 'font-mono text-[var(--cyber-text)] neon-glow' : (isDark ? 'text-white' : 'text-[var(--text-main)]')}`} style={{ fontSize: summaryHeroFontSize }}>
                      {currentMainValue}
                    </span>
                  )}
                  {unit && (
                    <span className={`font-bold mb-2 ${isCyber ? 'text-[var(--cyber-text-alpha)]' : (isDark ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]')}`} style={{ fontSize: 'var(--text-md)' }}>
                      {unit}
                    </span>
                  )}
                </div>
              </div>
              <p className={`font-bold leading-tight ${isCyber ? 'text-[var(--cyber-text-alpha)]' : (isDark ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]')}`} style={{ fontSize: 'var(--text-md)' }}>
                {currentSubValue}
              </p>
            </div>
            <div className="absolute bottom-[-24px] left-[-24px] right-[-24px] h-[55%] pointer-events-none">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
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
      }

      case WidgetType.WEATHER:
        return (
          <div className="h-full flex flex-col justify-center items-center gap-2 text-center" style={{ contain: 'layout style' }}>
            <div className="flex flex-col items-center gap-3">
              <span className="material-symbols-outlined text-primary leading-none" style={{ fontSize: widget.iconSize ? `${widget.iconSize}px` : 'var(--text-hero)', opacity: 0.9 }}>
                {widget.icon || 'partly_cloudy_day'}
              </span>
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
                className={`bg-transparent border-none p-0 w-full text-center focus:ring-0 outline-none ${isCyber ? 'font-mono text-[var(--cyber-text)]' : 'text-[var(--text-main)]'}`}
                style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}
              />
            ) : (
              <div className={`leading-tight ${isCyber ? 'font-mono text-[var(--cyber-text)]' : 'text-[var(--text-main)]'}`} style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--title-weight)' }}>
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
          <div className="h-full flex items-center min-h-0" style={{ gap: 'var(--spacing)', padding: 'var(--spacing)' }}>
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
            <div className="flex-1 min-w-0 flex flex-col justify-center" style={{ gap: '2px' }}>
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
                <ResponsiveContainer width="100%" height="100%">
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
                        style={{ width: `${pct}%`, backgroundColor: barColor, borderRadius: 'var(--border-radius)' }}
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
              <MapWidget lat={lat || 37.5665} lng={lng || 126.9780} zoom={13} provider="osm" />
            </div>
            {!widget.noBezel && (
              <div className="absolute top-2 left-2 z-[1000] bg-[var(--white-alpha-90)] dark:bg-[var(--black-alpha-80)] px-2 py-1 rounded font-bold shadow-sm pointer-events-none" style={{ fontSize: 'var(--text-tiny)' }}>
                {currentMainValue}
              </div>
            )}
          </div>
        );



      case WidgetType.CHART_BAR:
        return (
          <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
            {(yAxisWidth) => (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart key={chartKey} {...commonProps}>
                {currentConfig.useGradient && (
                  <defs>
                    {localSeries.map((s, idx) => {
                      const color = resolveColor(s.color, isCyber ? 'var(--cyber-text)' : theme.primaryColor, theme.primaryColor);
                      const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                      const stopEndColor = endColorRaw || color;
                      const stopEndOpacity = endColorRaw ? 1 : 0.2;

                      return (
                        <linearGradient key={`grad-bar-${s.key}-${idx}`} id={`grad-bar-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="95%" stopColor={stopEndColor} stopOpacity={stopEndOpacity} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                )}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: isDark ? 'var(--white-alpha-05)' : 'var(--black-alpha-03)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                {localSeries.map((s, idx) => (
                    <Bar
                      key={s.key}
                      name={s.label}
                      dataKey={s.key}
                      stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? 'stack1' : undefined}
                      fill={currentConfig.useGradient ? `url(#grad-bar-${s.key}-${idx})` : resolveColor(s.color, isCyber ? 'var(--cyber-text)' : theme.primaryColor, theme.primaryColor)}
                      radius={[theme.chartRadius, theme.chartRadius, 0, 0]}
                      barSize={currentConfig.barWidth != null ? Math.max(2, (currentConfig.barWidth * 0.4)) : undefined}
                    />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
            )}
          </RechartsNumericYAxisMeasure>
        );

      case WidgetType.CHART_BAR_HORIZONTAL: {
        return (
          <HorizontalBarChartYAxisMeasure currentData={currentData} xAxisKey={xAxisKey} contentSize={contentSize}>
            {(yAxisWidth) => (
              <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart key={chartKey} layout="vertical" data={currentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    {currentConfig.useGradient && (
                      <defs>
                        {localSeries.map((s, idx) => {
                          const color = resolveColor(s.color, isCyber ? 'var(--cyber-text)' : theme.primaryColor, theme.primaryColor);
                          const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                          const stopEndColor = endColorRaw || color;
                          const stopEndOpacity = endColorRaw ? 1 : 0.2;

                          return (
                            <linearGradient key={`grad-hbar-${s.key}-${idx}`} id={`grad-hbar-${s.key}-${idx}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={color} stopOpacity={1} />
                              <stop offset="95%" stopColor={stopEndColor} stopOpacity={stopEndOpacity} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                    )}
                    {showGrid && <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={strokeColor} />}
                    <XAxis type="number" hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey={xAxisKey}
                      type="category"
                      hide={!showYAxis}
                      stroke={labelColor}
                      fontSize={contentSize}
                      tickLine={false}
                      axisLine={false}
                      width={showYAxis ? yAxisWidth : 0}
                      tick={{ style: { whiteSpace: 'nowrap' } }}
                    />
                    <Tooltip cursor={{ fill: isDark ? 'var(--white-alpha-05)' : 'var(--black-alpha-03)' }} contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                    {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                    {localSeries.map((s, idx) => (
                      <Bar
                        key={s.key}
                        name={s.label}
                        dataKey={s.key}
                        stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? 'stack1' : undefined}
                        fill={currentConfig.useGradient ? `url(#grad-hbar-${s.key}-${idx})` : resolveColor(s.color, isCyber ? 'var(--cyber-text)' : theme.primaryColor, theme.primaryColor)}
                        radius={[0, theme.chartRadius, theme.chartRadius, 0]}
                        barSize={currentConfig.barWidth != null ? Math.max(2, (currentConfig.barWidth * 0.4)) : undefined}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </HorizontalBarChartYAxisMeasure>
        );
      }

      case WidgetType.CHART_LINE:
        return (
          <RechartsNumericYAxisMeasure currentData={currentData} localSeries={localSeries} contentSize={contentSize} showYAxis={showYAxis}>
            {(yAxisWidth) => (
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart key={chartKey} {...commonProps}>
                {currentConfig.useGradient && (
                  <defs>
                    {localSeries.map((s, idx) => {
                      const color = resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor);
                      const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                      const stopEndColor = endColorRaw || color;

                      return (
                        <linearGradient key={`grad-line-${s.key}-${idx}`} id={`grad-line-${s.key}-${idx}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={color} stopOpacity={1} />
                          <stop offset="100%" stopColor={stopEndColor} stopOpacity={1} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                )}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                {localSeries.map((s, idx) => (
                    <Line
                      key={s.key}
                      name={s.label}
                      type="natural"
                      dataKey={s.key}
                      stroke={currentConfig.useGradient ? `url(#grad-line-${s.key}-${idx})` : resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor)}
                      strokeWidth={currentConfig.barWidth != null ? Math.max(1, (currentConfig.barWidth * 0.1)) : (isCyber ? 4 : 3)}
                    dot={{
                      r: isCyber ? 5 : 4,
                      strokeWidth: 2,
                      fill: isCyber ? 'var(--background)' : (isDark ? 'var(--surface-elevated)' : 'var(--surface)'),
                      stroke: resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor)
                    }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                ))}
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
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart key={chartKey} {...commonProps}>
                {currentConfig.useGradient ? (
                  <defs>
                    {localSeries.map((s, idx) => {
                      const color = resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor);
                      const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                      const stopEndColor = endColorRaw || (isCyber ? 'var(--secondary-color)' : color);

                      return (
                        <linearGradient key={`grad-area-${s.key}-${idx}`} id={`grad-area-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={isCyber ? 0.8 : 0.6} />
                          <stop offset="100%" stopColor={stopEndColor} stopOpacity={isCyber ? 0.1 : 0.05} />
                        </linearGradient>
                      );
                    })}
                  </defs>
                ) : null}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={s.key}
                    name={s.label}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor)}
                    strokeWidth={currentConfig.barWidth != null ? Math.max(1, (currentConfig.barWidth * 0.1)) : (isCyber ? 4 : 3)}
                    fillOpacity={currentConfig.useGradient ? 1 : 0.3}
                    fill={currentConfig.useGradient ? `url(#grad-area-${s.key}-${idx})` : resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor)}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
            )}
          </RechartsNumericYAxisMeasure>
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
                        fill={isCyber ? 'var(--cyber-text)' : 'var(--text-secondary)'}
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
                      fill={isCyber ? (index === 0 ? 'var(--cyber-text)' : index === 1 ? 'var(--cyber-blue)' : index === 2 ? 'var(--indigo-500)' : PIE_COLORS[index % PIE_COLORS.length]) : PIE_COLORS[index % PIE_COLORS.length]}
                      stroke={isCyber ? 'var(--cyber-border-alpha)' : 'var(--surface)'}
                      strokeWidth={2}
                    />
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
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={currentData}>
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

          currentData.forEach(item => {
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

        /* 노드별 색상 (theme.chartPalette 있으면 커스텀 팔레트, 없으면 PIE_COLORS 기반) */
        const sankeyPalette = theme.chartPalette?.length ? theme.chartPalette : PIE_COLORS.map(c => resolveColor(c, theme.primaryColor, theme.primaryColor));
        const sankeyNodeColorByName = new Map<string, string>();
        sankeyData.nodes.forEach((n, i) => {
          const raw = sankeyPalette[i % sankeyPalette.length];
          sankeyNodeColorByName.set(n.name, raw.startsWith('var(') ? resolveColor(raw, theme.primaryColor, theme.primaryColor) : raw);
        });
        const getNodeColor = (name: string) => sankeyNodeColorByName.get(name) ?? theme.primaryColor;

        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankeyData}
                node={({ x, y, width, height, payload }) => (
                  <g>
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={getNodeColor(payload.name)}
                      fillOpacity={1}
                      stroke={isDark ? 'var(--white-alpha-20)' : 'var(--black-alpha-08)'}
                      strokeWidth={1}
                      rx={theme.chartRadius}
                    />
                    <text
                      x={x + width / 2}
                      y={y + height / 2}
                      dy={contentSize / 2 - 2}
                      fontSize={contentSize}
                      fill={isDark ? 'var(--white)' : 'var(--black)'}
                      textAnchor="middle"
                      pointerEvents="none"
                      style={{ textShadow: isDark ? 'var(--shadow-dark-text)' : 'var(--shadow-light-text)' }}
                    >
                      {payload.name}
                    </text>
                  </g>
                )}
                link={({ sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, payload }: any) => {
                  const sourceName = payload?.source?.name ?? payload?.source;
                  const linkColor = typeof sourceName === 'string' ? getNodeColor(sourceName) : theme.primaryColor;
                  const path = `M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`;
                  return (
                    <path
                      d={path}
                      fill="none"
                      stroke={linkColor}
                      strokeOpacity={isDark ? 0.82 : 0.75}
                      strokeWidth={Math.max(1.5, linkWidth ?? 2)}
                    />
                  );
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
          <div className={`h-full ${isCyber ? 'neon-glow' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart key={chartKey} {...commonProps}>
                {currentConfig.useGradient && (
                  <defs>
                    {localSeries.map((s, idx) => {
                      const color = resolveColor(s.color, isCyber ? 'var(--primary-color)' : theme.primaryColor, theme.primaryColor);
                      const endColorRaw = s.endColor ? resolveColor(s.endColor, theme.primaryColor, theme.primaryColor) : undefined;
                      const stopEndColor = endColorRaw || color;

                      if (idx === 0) {
                        // Bar Gradient (Vertical)
                        const stopEndOpacity = endColorRaw ? 1 : 0.2;
                        return (
                          <linearGradient key={`grad-comp-bar-${s.key}-${idx}`} id={`grad-comp-bar-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="95%" stopColor={stopEndColor} stopOpacity={stopEndOpacity} />
                          </linearGradient>
                        );
                      } else {
                        // Line Gradient (Horizontal)
                        return (
                          <linearGradient key={`grad-comp-line-${s.key}-${idx}`} id={`grad-comp-line-${s.key}-${idx}`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={color} stopOpacity={1} />
                            <stop offset="100%" stopColor={stopEndColor} stopOpacity={1} />
                          </linearGradient>
                        );
                      }
                    })}
                  </defs>
                )}
                {showGrid && <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} />}
                {showXAxis && <XAxis dataKey={xAxisKey} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />}
                <YAxis width={yAxisWidth} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                {localSeries.map((s, idx) => (
                  idx === 0 ? (
                    <Bar
                      key={s.key}
                      name={s.label}
                      dataKey={s.key}
                      fill={currentConfig.useGradient ? `url(#grad-comp-bar-${s.key}-${idx})` : (s.color || theme.primaryColor)}
                      radius={[theme.chartRadius, theme.chartRadius, 0, 0]}
                      barSize={currentConfig.barWidth != null ? Math.max(2, (currentConfig.barWidth * 0.4)) : undefined}
                    />
                  ) : (
                    <Line
                      key={s.key}
                      name={s.label}
                      type="monotone"
                      dataKey={s.key}
                      stroke={currentConfig.useGradient ? `url(#grad-comp-line-${s.key}-${idx})` : (s.color || 'var(--red-500)')}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: theme.surfaceColor, stroke: s.color || 'var(--red-500)' }}
                    />
                  )
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
            )}
          </RechartsNumericYAxisMeasure>
        );

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
                  <div 
                    className={`bg-gradient-to-br transition-all group-hover:scale-110 shadow-lg ${isCyber ? (idx === 0 ? 'from-[var(--primary-color)] to-[var(--secondary-color)] shadow-[var(--primary-subtle)] neon-glow' : 'from-[var(--secondary-color)] to-[var(--premium-end)] shadow-[var(--secondary-color-alpha-40)] neon-glow') : (idx === 0 ? 'from-[var(--surface-elevated)] to-[var(--surface-muted)] shadow-[var(--black-alpha-10)]' : 'from-[var(--primary-color)] to-[var(--secondary-color)] shadow-[var(--primary-subtle)]')}`} 
                    style={{ 
                      borderRadius: 'var(--border-radius)',
                      width: widget.iconSize ? `${widget.iconSize}px` : undefined,
                      height: widget.iconSize ? `${widget.iconSize}px` : undefined,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: widget.iconSize ? 0 : undefined
                    }}
                  >
                    <span className="material-symbols-outlined text-white" style={{ fontSize: widget.iconSize ? `${widget.iconSize * 0.6}px` : '1.5rem' }}>{d.icon}</span>
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
              <span className="material-symbols-outlined text-muted opacity-40 select-none" style={{ fontSize: widget.iconSize ? `${widget.iconSize}px` : 'min(90px, 10vh)' }}>
                {currentIcon || 'schema'}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-3 py-1 overflow-y-auto no-scrollbar justify-center h-full">
              {currentData.map((d: any, idx: number) => {
                const maxVal = Math.max(...currentData.map((i: any) => i.value)) || 1;
                const widthPercent = (d.value / maxVal) * 100;

                return (
                  <div key={idx} className="flex flex-col gap-1 group cursor-pointer">
                    <div 
                      className="bg-[var(--surface-muted)] overflow-hidden relative shadow-inner" 
                      style={{ height: `${Math.max(4, (currentConfig.barWidth ?? 60) * 0.5)}px`, borderRadius: '999px' }}
                    >
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

      case WidgetType.DASH_TRAFFIC_TOP5:
        return (
          <div className="h-full flex flex-col gap-1.5 min-h-0 overflow-y-auto py-1">
            {currentData.map((d: any, idx: number) => {
              const maxVal = Math.max(...currentData.map((i: any) => i.value)) || 1;
              const widthPercent = (d.value / maxVal) * 100;
              return (
                <div key={idx} className="flex items-center gap-2 flex-shrink-0" style={{ minHeight: 28 }}>
                  <div className="flex-shrink-0 text-left font-bold text-main whitespace-nowrap" style={{ fontSize: 'var(--text-small)', minWidth: 0 }}>
                    {d.name}
                  </div>
                  <div 
                    className="flex-1 bg-[var(--surface-muted)] rounded-full overflow-hidden min-w-0"
                    style={{ height: `${(currentConfig.barWidth ?? 60) * 0.16}px` }}
                  >
                    <div
                      className="h-full rounded transition-all duration-500"
                      style={{
                        width: `${widthPercent}%`,
                        background: 'var(--chart-gradient-multi)'
                      }}
                    />
                  </div>
                  <div className="flex-shrink-0 text-right font-bold text-muted whitespace-nowrap" style={{ fontSize: 'var(--text-small)' }}>
                    {Number(d.value).toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case WidgetType.DASH_FAILURE_STATS:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  {localSeries.map((s, idx) => (
                    <linearGradient key={`grad-stats-${idx}`} id={`grad-stats-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.05} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={strokeColor} opacity={0.5} />
                <XAxis dataKey={xAxisKey} axisLine={false} tickLine={false} stroke={labelColor} fontSize={parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--text-tiny')) || 10} fontWeight="600" />
                <YAxis hide />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="bottom" wrapperStyle={{ paddingTop: `${chartLayoutTokens.tokens.charts.common.legendPadding.value}px` }} />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, theme.primaryColor, theme.primaryColor)}
                    strokeWidth={currentConfig.barWidth != null ? Math.max(1, (currentConfig.barWidth * 0.12)) : 4}
                    fillOpacity={1}
                    fill={`url(#grad-stats-${idx})`}
                    dot={{ r: 4, strokeWidth: 2, fill: 'white' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }}
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
                  <div 
                    className="bg-[var(--surface-muted)] overflow-hidden relative shadow-inner" 
                    style={{ height: `${(currentConfig.barWidth ?? 60) * 0.166}px`, borderRadius: theme.chartRadius }}
                  >
                    <div
                      className="h-full transition-all duration-1000 group-hover:brightness-110"
                      style={{
                        width: `${d.value}%`,
                        background: `linear-gradient(to right, ${resolveColor(d.color, theme.primaryColor, theme.primaryColor)}, ${resolveColor(d.color, theme.primaryColor, theme.primaryColor)}88)`
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
          <div className="h-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <TrafficStatusChart
                currentData={currentData}
                valueKey={currentConfig.series[0]?.key || 'value'}
                contentSize={contentSize}
                labelColor={labelColor}
                strokeColor={strokeColor}
                showGrid={showGrid}
                showXAxis={showXAxis}
                showYAxis={showYAxis}
                showLegend={showLegend}
                xAxisKey={xAxisKey}
                localSeries={localSeries}
                theme={theme}
                isCyber={isCyber}
                tooltipStyle={tooltipStyle}
                renderLegend={renderLegend}
                resolveColor={resolveColor}
                leftInset={0}
              />
            </ResponsiveContainer>
          </div>
        );

      case WidgetType.DASH_NET_TRAFFIC:
        return (
          <div className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  {localSeries.map((s, idx) => (
                    <linearGradient key={idx} id={`gradNet-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={resolveColor(s.color, theme.primaryColor, theme.primaryColor)} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                {showGrid && <CartesianGrid strokeDasharray="3 3" stroke={strokeColor} opacity={0.2} />}
                <XAxis dataKey={xAxisKey} hide={!showXAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <YAxis width={showYAxis ? 40 : 0} hide={!showYAxis} stroke={labelColor} fontSize={contentSize} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend content={renderLegend} verticalAlign="top" align="right" />}
                {localSeries.map((s, idx) => (
                  <Area
                    key={idx}
                    type="natural"
                    dataKey={s.key}
                    stroke={resolveColor(s.color, theme.primaryColor, theme.primaryColor)}
                    strokeWidth={isCyber ? 3 : 2}
                    fill={`url(#gradNet-${idx})`}
                    dot={false}
                    stackId={chartLayoutTokens.tokens.charts.bar.mode.value === 'stacked' ? '1' : undefined}
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
              <div 
                className="relative rounded-full border-4 border-dashed border-blue-500/30 flex items-center justify-center group cursor-pointer transition-all hover:border-blue-500 hover:rotate-12"
                style={{ 
                  width: widget.iconSize ? `${widget.iconSize}px` : '8rem', 
                  height: widget.iconSize ? `${widget.iconSize}px` : '8rem' 
                }}
              >
                <div className="absolute inset-2 rounded-full bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                <span className="material-symbols-outlined text-blue-500" style={{ fontSize: widget.iconSize ? `${widget.iconSize * 0.4}px` : '2.25rem' }}>verified_user</span>
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
          <div className="h-full flex flex-col justify-center gap-4">
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
        const navIndicatorSrc = '/assets/nav-indicator.png';
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
              style={{ gap: 'var(--nav-card-gap)', marginLeft: 'calc(-1 * var(--spacing-lg))' }}
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
                        className="w-full max-w-[80%] bg-transparent border-none p-0 text-center font-medium focus:ring-0 outline-none placeholder:opacity-60"
                        style={{ color: 'var(--white)', fontSize: 'var(--content-size)' }}
                        placeholder="텍스트"
                      />
                    ) : (
                      <span
                        className="font-medium"
                        style={{ color: 'var(--white)', fontSize: 'var(--content-size)' }}
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
    <div className={`h-full flex flex-col group relative ${isCyber ? 'cyber-frame' : ''}`}>
      {isEditMode && (
        <div
          className="drag-handle absolute left-0 top-0 z-20 h-14 w-2 rounded-r-md cursor-default shrink-0"
          style={{
            background: `linear-gradient(180deg, var(--primary-color) 0%, color-mix(in srgb, var(--primary-color) 75%, transparent) 100%)`,
            boxShadow: `0 0 14px 3px color-mix(in srgb, var(--primary-color) 55%, transparent), 0 0 28px 6px color-mix(in srgb, var(--primary-color) 25%, transparent)`,
          }}
          title="드래그하여 이동"
        />
      )}
      {isCyber && <div className="cyber-frame-inner absolute inset-0 pointer-events-none z-10" />}
      <div
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
        {(!widget.hideHeader || isEditMode) && (
          <div className="flex items-center justify-between mb-0 flex-shrink-0 gap-2 widget-header-row" style={{ ['--header-title-size' as string]: `${titleSize}px` }}>
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
                {isEditMode ? (
                  <input
                    type="text"
                    value={widget.title}
                    onChange={(e) => onUpdate?.(widget.id, { title: e.target.value })}
                    className={`widget-header-title-input bg-transparent border-none p-0 font-bold focus:ring-0 outline-none w-full truncate ${isCyber ? 'text-cyan-400' : 'text-main'}`}
                    style={{ fontSize: `${titleSize}px`, fontWeight: titleWeight }}
                  />
                ) : (
                  <h3 className={`font-bold truncate ${isCyber ? 'text-cyan-400 uppercase tracking-wider' : 'text-main'}`} style={{ fontSize: `${titleSize}px`, fontWeight: titleWeight }}>
                    {widget.title}
                    {isCyber && <span className="ml-2 inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />}
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
              </div>
            )}
          </div>
        )}

        <div className="flex-1 min-h-0 min-w-0 relative overflow-hidden mt-0" style={{ paddingLeft: 'var(--spacing)', paddingRight: 'var(--spacing)' }}>
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
    </div>
  );
};

export default React.memo(WidgetCard);
