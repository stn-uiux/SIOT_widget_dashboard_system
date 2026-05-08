import React from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import * as am5percent from '@amcharts/amcharts5/percent';
import * as am5radar from '@amcharts/amcharts5/radar';
import * as am5flow from '@amcharts/amcharts5/flow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from '@amcharts/amcharts5/themes/Dark';
import { Widget, WidgetType, DashboardTheme } from '../../types';
import chartLayoutTokens from '../../chart-layout-tokens.json';
import {
  resolveColor,
  getSeriesModeColors,
  parseToHex,
  chartPrimaryFallbackHex,
  am5MutedFallbackRgb,
} from './chartColorUtils';
import { PIE_COLORS } from './chartPalette';

export const AmChartComponent = React.memo<{
  widget: Widget,
  theme: DashboardTheme,
  isDark: boolean,
  contentSize: number,
  labelColor: string,
  strokeColor: string
}>(({ widget, theme, isDark, contentSize, labelColor, strokeColor }) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<am5.Root | null>(null);
  const updateDataRef = React.useRef<((nextWidget: Widget) => void) | null>(null);

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
        updateDataRef.current = null;
      } catch {
        return;
      }
      root._logo?.dispose();

      const toAm5Color = (colorStr: string | undefined): am5.Color => {
        const fb =
          typeof theme.primaryColor === 'string' && theme.primaryColor.trim().length > 0
            ? theme.primaryColor
            : chartPrimaryFallbackHex();
        let resolved = resolveColor(colorStr || fb, fb, theme.primaryColor);
        const hex = parseToHex(resolved, theme.primaryColor?.trim()
          ? theme.primaryColor
          : chartPrimaryFallbackHex());
        const num = Number.parseInt(hex.replace('#', ''), 16);
        return am5.color(Number.isFinite(num) ? num : am5MutedFallbackRgb());
      };

      const labelFill = toAm5Color(isDark ? 'var(--text-muted)' : labelColor);
      const axisStroke = toAm5Color(isDark ? 'var(--text-muted)' : strokeColor);

      root.setThemes([
        am5themes_Animated.new(root),
        ...(isDark ? [am5themes_Dark.new(root)] : [])
      ]);

      const safeConfig = widget.config || {};
      const seriesList = safeConfig.series && safeConfig.series.length > 0
        ? safeConfig.series.map((s) => {
            const modeColors = getSeriesModeColors(s, isDark);
            return { ...s, color: modeColors.color, endColor: modeColors.endColor };
          })
        : [{ key: safeConfig.yAxisKey || 'value', label: 'Value', color: 'var(--primary-color)' }];

      const {
        xAxisKey = 'name',
        xAxisLabel = '',
        showGrid = true,
        showXAxis = true,
        showYAxis = true
      } = safeConfig;

      root.container.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
      if (root.tooltipContainer) {
        root.tooltipContainer.setAll({ paddingTop: 0, paddingBottom: 0, paddingLeft: 0, paddingRight: 0 });
      }

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

        series.get("colors").set("colors", PIE_COLORS.map(c => toAm5Color(c)));
        series.labels.template.setAll({ fill: labelFill, fontSize: contentSize });
        series.ticks.template.setAll({ stroke: axisStroke });

        series.data.setAll(data);
        series.appear(1000, 100);
        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          series.data.setAll(next);
        };
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

        const radarSeries: any[] = [];
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
          radarSeries.push(series);
        });
        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          xAxis.data.setAll(next);
          radarSeries.forEach((s) => s.data.setAll(next));
        };
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
        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          series.data.setAll(next);
        };
      } else if (widget.type === WidgetType.CHART_BAR || widget.type === WidgetType.DASH_EQUIP_PERF_TOP5 || widget.type === WidgetType.CHART_BAR_HORIZONTAL || widget.type === WidgetType.DASH_RANK_LIST) {
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

        const xySeries: any[] = [];
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
            // IMPORTANT: amCharts expects gradients via `fillGradient`, not `fill`
            fill: toAm5Color(s.color),
            fillGradient: safeConfig.useGradient
              ? am5.LinearGradient.new(root, {
                stops: [
                  { color: toAm5Color(s.color), opacity: 1 },
                  { color: toAm5Color(s.endColor || s.color), opacity: 1 }
                ],
                rotation: isHorizontal ? 0 : 90
              })
              : undefined,
            fillOpacity: 1,
            visible: true,
            [isHorizontal ? "height" : "width"]: am5.percent(safeConfig.barWidth ?? 60)
          });

          series.data.setAll(data);
          series.appear(1000);
          xySeries.push(series);
        });

        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          if (isHorizontal) {
            yAxis.data.setAll(next);
          } else {
            xAxis.data.setAll(next);
          }
          xySeries.forEach((s) => s.data.setAll(next));
        };
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

        if (xAxisLabel) {
          xAxis.children.push(am5.Label.new(root, {
            text: xAxisLabel,
            fontWeight: "900",
            fontSize: 10,
            fill: labelFill,
            x: am5.percent(50),
            centerX: am5.percent(50),
            paddingTop: 10
          }));
        }
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

        const lineSeries: any[] = [];
        seriesList.forEach(s => {
          const series = chart.series.push(am5xy.LineSeries.new(root, {
            name: s.label,
            xAxis: xAxis,
            yAxis: yAxis,
            valueYField: s.key,
            categoryXField: xAxisKey,
            stroke: toAm5Color(s.color),
            fill: toAm5Color(s.color),
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
                  { color: toAm5Color(s.color), opacity: 0.6 },
                  { color: toAm5Color(s.endColor || s.color), opacity: 0 }
                ]
              })
            });
          }
          if (widget.type === WidgetType.DASH_TRAFFIC_STATUS) {
            (series as any).set("tensionX", 0.77);
          }
          series.data.setAll(data);
          series.appear(1000);
          lineSeries.push(series);
        });
        chart.appear(1000, 100);

        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          xAxis.data.setAll(next);
          lineSeries.forEach((s) => s.data.setAll(next));
        };
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

        if (xAxisLabel) {
          xAxis.children.push(am5.Label.new(root, {
            text: xAxisLabel,
            fontWeight: "900",
            fontSize: 10,
            fill: labelFill,
            x: am5.percent(50),
            centerX: am5.percent(50),
            paddingTop: 10
          }));
        }
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

        const composedSeries: any[] = [];
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
              fill: toAm5Color(s.color),
              fillGradient: safeConfig.useGradient
                ? am5.LinearGradient.new(root, {
                  stops: [
                    { color: toAm5Color(s.color), opacity: 1 },
                    { color: toAm5Color(s.endColor || s.color), opacity: 1 }
                  ],
                  rotation: 90
                })
                : undefined
            });

            series.data.setAll(data);
            series.appear(1000);
            composedSeries.push(series);
          } else {
            const series = chart.series.push(am5xy.LineSeries.new(root, {
              name: s.label,
              xAxis: xAxis,
              yAxis: yAxis,
              valueYField: s.key,
              categoryXField: xAxisKey,
              stroke: toAm5Color(s.color),
              fill: toAm5Color(s.color),
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
            composedSeries.push(series);
          }
        });
        chart.appear(1000, 100);
        updateDataRef.current = (nextWidget) => {
          const next = Array.isArray(nextWidget.data) ? nextWidget.data : [];
          xAxis.data.setAll(next);
          composedSeries.forEach((s) => s.data.setAll(next));
        };
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
        updateDataRef.current = null;
      } catch { /* ignore */ }
    };
  }, [
    widget.id,
    widget.type,
    theme.primaryColor,
    theme.borderRadius,
    isDark,
    contentSize,
    labelColor,
    strokeColor
  ]);

  // Update data without recreating chart (prevents flicker in preview mode)
  React.useEffect(() => {
    updateDataRef.current?.(widget);
  }, [widget.data, widget.config]);

  return <div ref={chartRef} className="w-full h-full min-h-[120px]" style={{ minHeight: 120 }} />;
});
