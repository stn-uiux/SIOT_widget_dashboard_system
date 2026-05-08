import React from 'react';
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartSeries, DashboardTheme } from '../../types';

export interface TrafficStatusChartProps {
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
  localSeries: ChartSeries[];
  theme: DashboardTheme;
  tooltipStyle: React.CSSProperties;
  renderLegend: (props: any) => React.ReactElement;
  resolveColor: (colorStr: string | undefined, fallback: string, primaryHex?: string) => string;
}

export const TrafficStatusChart: React.FC<TrafficStatusChartProps> = (props) => {
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
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#gradTraffic-${idx})`}
            dot={false}
          />
        ))}
      </AreaChart>
    </>
  );
};
