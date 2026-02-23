export enum WidgetType {
  CHART_BAR = "CHART_BAR",
  CHART_BAR_HORIZONTAL = "CHART_BAR_HORIZONTAL",
  CHART_LINE = "CHART_LINE",
  CHART_AREA = "CHART_AREA",
  CHART_PIE = "CHART_PIE",
  CHART_RADAR = "CHART_RADAR",
  CHART_TREEMAP = "CHART_TREEMAP",
  CHART_COMPOSED = "CHART_COMPOSED",
  CHART_FUNNEL = "CHART_FUNNEL",
  CHART_SANKEY = "CHART_SANKEY",
  WEATHER = "WEATHER",
  IMAGE = "IMAGE",
  MAP = "MAP",
  MAP_GOOGLE = "MAP_GOOGLE",
  MAP_NAVER = "MAP_NAVER",
  TABLE = "TABLE",
  SUMMARY = "SUMMARY",
  SUMMARY_CHART = "SUMMARY_CHART",
  // General KPI (card: icon + label + value; icon selectable in sidebar)
  GENERAL_KPI = "GENERAL_KPI",
  // Earning / progress card (circular progress + title + value + trend)
  EARNING_PROGRESS = "EARNING_PROGRESS",
  // Earning trend card (value + trend % + comparison + line chart + category progress bars)
  EARNING_TREND = "EARNING_TREND",
  // Premium Dashboard Widgets
  DASH_FAILURE_STATUS = "DASH_FAILURE_STATUS",
  DASH_FACILITY_1 = "DASH_FACILITY_1",
  DASH_FACILITY_2 = "DASH_FACILITY_2",
  DASH_RANK_LIST = "DASH_RANK_LIST",
  DASH_FAILURE_STATS = "DASH_FAILURE_STATS",
  DASH_RESOURCE_USAGE = "DASH_RESOURCE_USAGE",
  DASH_TRAFFIC_STATUS = "DASH_TRAFFIC_STATUS",
  DASH_NET_TRAFFIC = "DASH_NET_TRAFFIC",
  DASH_SECURITY_STATUS = "DASH_SECURITY_STATUS",
  DASH_VDI_STATUS = "DASH_VDI_STATUS",
  /** 빈 위젯 — 플레이스홀더/여백용 */
  BLANK = "BLANK",
}

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  CYBER = "cyber",
}

export enum ChartLibrary {
  RECHARTS = "recharts",
  APEXCHARTS = "apexcharts",
  AMCHARTS = "amcharts",
}

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  endColor?: string;
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
  useGradient?: boolean;
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
  hideHeader?: boolean;
  /** Background opacity 0–100 (default 100 = opaque). */
  backgroundOpacity?: number;
  /** Progress 0–100 for EARNING_PROGRESS (circular gauge). */
  progressValue?: number;
  /** Trend percentage for EARNING_TREND (e.g. 21). */
  trendPercent?: number;
  /** Trend direction for EARNING_TREND (true = up, false = down). */
  trendUp?: boolean;
  /** Comparison text for EARNING_TREND (e.g. "Compared of $11,750 last year"). */
  comparisonText?: string;
  /** Category items for EARNING_TREND: label + progress 0–100, optional color. */
  categoryItems?: { label: string; value: number; color?: string }[];
  // Dual Chart Support
  isDual?: boolean;
  dualLayout?: "horizontal" | "vertical";
  dualGap?: number;
  secondaryType?: WidgetType;
  secondaryConfig?: ChartConfig;
  secondaryData?: any[];
  showSubTitles?: boolean;
  subTitle1?: string;
  subTitle2?: string;
  secondaryMainValue?: string;
  secondarySubValue?: string;
  secondaryIcon?: string;
  secondaryNoBezel?: boolean;
}

export enum HeaderPosition {
  TOP = "top",
  LEFT = "left",
}

export enum TextAlignment {
  LEFT = "left",
  CENTER = "center",
  RIGHT = "right",
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
  showDivider?: boolean;
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
  name?: string;
  primaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  widgetHeaderColor?: string;
  mode: ThemeMode;
  chartLibrary: ChartLibrary;
  borderRadius: number;
  chartRadius: number;
  borderWidth: number;
  borderColor: string;
  spacing: number;
  dashboardPadding: number;
  titleSize: number;
  titleWeight: string;
  contentSize: number;
  textTiny: number;
  textSmall: number;
  textMd: number;
  textLg: number;
  textHero: number;
  cardShadow: string;
  // Typography Colors
  titleColor: string;
  textColor: string;
  // Multi-Mode Support
  dualModeSupport?: boolean;
  modeStyles?: {
    light?: Partial<DashboardTheme>;
    dark?: Partial<DashboardTheme>;
  };
  showPageTabs?: boolean;
  /** 프로젝트별 커스텀 차트 팔레트(hex). 생키/파이 등에서 theme.primaryColor 대신 사용 */
  chartPalette?: string[];
}

export interface ThemePreset {
  id: string;
  name: string;
  theme: DashboardTheme;
}

export interface LayoutConfig {
  columns: number;
  rows: number;
  fitToScreen: boolean;
  defaultRowHeight: number;
  /** 배경 이미지 URL (project2 등). 예: '/bg-project2.png' 또는 전체 URL */
  backgroundImage?: string;
  /** 배경 이미지 위에 네온 불빛 번쩍임 효과 */
  backgroundFlicker?: boolean;
  /** project2 등 위젯 카드를 글래스모피즘(반투명·블러·테두리) 스타일로 표시 */
  glassmorphism?: boolean;
  /**
   * breakpoint 기반 반응형 그리드 사용 (lg/md/sm/xs).
   * true면 화면 너비에 따라 컬럼 수·레이아웃이 전환됩니다.
   */
  useResponsive?: boolean;
}
