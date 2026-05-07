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
  DASH_FACILITY_2_FIGMA = "DASH_FACILITY_2_FIGMA",
  DASH_EQUIP_PERF_TOP5 = "DASH_EQUIP_PERF_TOP5",
  DASH_RANK_LIST = "DASH_RANK_LIST",
  DASH_FAILURE_STATS = "DASH_FAILURE_STATS",
  DASH_RESOURCE_USAGE = "DASH_RESOURCE_USAGE",
  DASH_TRAFFIC_STATUS = "DASH_TRAFFIC_STATUS",
  DASH_NET_TRAFFIC = "DASH_NET_TRAFFIC",
  /** 업무망 트래픽 사용량 TOP5 (Figma 위젯 컨테이너) */
  DASH_TRAFFIC_TOP5 = "DASH_TRAFFIC_TOP5",
  DASH_SECURITY_STATUS = "DASH_SECURITY_STATUS",
  DASH_SECURITY_STATUS_V2 = "DASH_SECURITY_STATUS_V2",
  DASH_VDI_STATUS = "DASH_VDI_STATUS",
  /** 빈 위젯 — 플레이스홀더/여백용 */
  BLANK = "BLANK",
  /** 텍스트 전용 — 글자만 표시, 크기·굵기 설정 가능 */
  TEXT_BLOCK = "TEXT_BLOCK",
  /** 세로형 네비게이션 카드 (프로젝트 요약/링크용) */
  VERTICAL_NAV_CARD = "VERTICAL_NAV_CARD",
}

export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
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
  barWidth?: number;
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
  iconSize?: number;
  noBezel?: boolean;
  noBorder?: boolean;
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
  /** Navigation items for VERTICAL_NAV_CARD. */
  navItems?: { id: string; label: string; active?: boolean }[];
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

export enum HeaderWidgetType {
  CLOCK = "CLOCK",
  MONITOR = "MONITOR",
  THEME_TOGGLE = "THEME_TOGGLE",
  IMAGE = "IMAGE",
  LOGO = "LOGO",
}

export interface HeaderWidget {
  id: string;
  type: HeaderWidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  url?: string;
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
  textColorLight?: string;
  textColorDark?: string;
  textAlignment: TextAlignment;
  title: string;
  logo?: string;
  showDivider?: boolean;
  /** 헤더 배경 이미지 URL 또는 data URI (공통/Fallback) */
  backgroundImage?: string;
  /** 라이트 모드 전용 헤더 배경 이미지 */
  backgroundImageLight?: string;
  /** 다크 모드 전용 헤더 배경 이미지 */
  backgroundImageDark?: string;
  /** 헤더 내부에 배치된 위젯들 */
  widgets?: HeaderWidget[];
  /** 라이트/다크 개별 디자인 설정 */
  modeStyles?: {
    [ThemeMode.LIGHT]?: { textColor: string; backgroundColor: string; };
    [ThemeMode.DARK]?: { textColor: string; backgroundColor: string; };
  };
  headerTitleSize?: number;
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
  modeStyles?: {
    light?: Partial<DashboardTheme>;
    dark?: Partial<DashboardTheme>;
  };
  showPageTabs?: boolean;
  /** 프로젝트별 커스텀 차트 팔레트(hex). 생키/파이 등에서 theme.primaryColor 대신 사용 */
  chartPalette?: string[];
  /** 테마별 개별 설정(light/dark 개별값) 사용 여부 */
  dualModeSupport?: boolean;
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
  /** 배경 이미지 URL (공통 fallback). 라이트/다크 미설정 시 사용 */
  backgroundImage?: string;
  /** 라이트 모드 전용 배경 이미지 URL */
  backgroundImageLight?: string;
  /** 다크 모드 전용 배경 이미지 URL */
  backgroundImageDark?: string;

  /** 지구(Globe) 배경 사용 — 마우스 드래그로 회전 */
  backgroundGlobe?: boolean;
  /** project2 등 위젯 카드를 글래스모피즘(반투명·블러·테두리) 스타일로 표시 */
  glassmorphism?: boolean;
  /** 글래스모피즘 배경 투명도 (0–100). 미설정 시 테마 기본값(다크 35, 라이트 55) 사용 */
  glassmorphismOpacity?: number;
  /**
   * breakpoint 기반 반응형 그리드 사용 (lg/md/sm/xs).
   * true면 화면 너비에 따라 컬럼 수·레이아웃이 전환됩니다.
   */
  useResponsive?: boolean;
  /** 위젯을 중력(Gravity) 없이 자유롭게 배치할 수 있도록 설정 (verticalCompact=false) */
  freePosition?: boolean;
  /** false면 그리드 칸 단위 대신 픽셀 단위(리사이즈 단계)로 위젯 크기 조절 */
  useGrid?: boolean;
  /** 그리드 미사용 시 리사이즈 단위(px). 예: 5면 5px 간격으로 늘었다 줄었다 */
  resizeStepPx?: number;
  /** 배경 이미지 숨쉬기(페이드 인/아웃) 애니메이션 설정 */
  backgroundAnimation?: boolean;
}
