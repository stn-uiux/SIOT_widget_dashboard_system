
export enum WidgetType {
  CHART_BAR = 'CHART_BAR',
  CHART_BAR_HORIZONTAL = 'CHART_BAR_HORIZONTAL',
  CHART_LINE = 'CHART_LINE',
  CHART_AREA = 'CHART_AREA',
  CHART_PIE = 'CHART_PIE',
  CHART_RADAR = 'CHART_RADAR',
  CHART_TREEMAP = 'CHART_TREEMAP',
  CHART_COMPOSED = 'CHART_COMPOSED',
  CHART_FUNNEL = 'CHART_FUNNEL',
  WEATHER = 'WEATHER',
  TABLE = 'TABLE',
  SUMMARY = 'SUMMARY',
  SUMMARY_CHART = 'SUMMARY_CHART'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum ChartLibrary {
  RECHARTS = 'recharts',
  APEXCHARTS = 'apexcharts',
  AMCHARTS = 'amcharts'
}

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
}

export interface ChartConfig {
  xAxisKey: string;
  xAxisLabel?: string;
  yAxisKey: string;
  series: ChartSeries[];
  showLegend: boolean;
  showGrid: boolean;
  showXAxis: boolean;
  showYAxis: boolean;
  showUnit: boolean;
  showUnitInLegend: boolean;
  showLabels: boolean;
  unit: string;
}

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  titleSize?: number;
  titleWeight?: string;
  contentSize?: number;
  config: ChartConfig;
  data: any[];
  colSpan: number;
  rowSpan: number;
  mainValue?: string;
  subValue?: string;
  icon?: string;
}

export interface DashboardTheme {
  primaryColor: string;
  mode: ThemeMode;
  chartLibrary: ChartLibrary;
  borderRadius: number;
  spacing: number;
  titleSize: number;
  titleWeight: string;
  contentSize: number;
}

export interface LayoutConfig {
  columns: number;
  rows: number;
  fitToScreen: boolean;
  defaultRowHeight: number;
}
