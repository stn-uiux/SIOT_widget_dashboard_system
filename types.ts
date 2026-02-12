
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
  IMAGE = 'IMAGE',
  MAP = 'MAP',
  MAP_GOOGLE = 'MAP_GOOGLE',
  MAP_NAVER = 'MAP_NAVER',
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
  noBezel?: boolean;
}

export enum HeaderPosition {
  TOP = 'top',
  LEFT = 'left'
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right'
}

export interface HeaderConfig {
  show: boolean;
  position: HeaderPosition;
  height: number;
  width: number; // For vertical header
  margin: number;
  padding: number;
  backgroundColor: string;
  textColor: string;
  textAlignment: TextAlignment;
  title: string;
  logo?: string;
}

export interface TabConfig {
  id: string;
  label: string;
}

export interface DashboardPage {
  id: string;
  name: string;
  layout: LayoutConfig;
  widgets: Widget[];
  header: HeaderConfig;
  tabs: TabConfig[];
}

export interface Project {
  id: string;
  name: string;
  pages: DashboardPage[];
  activePageId: string;
  theme: DashboardTheme;
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
