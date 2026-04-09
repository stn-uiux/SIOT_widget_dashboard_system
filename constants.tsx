import { WidgetType, ThemeMode, ChartLibrary, DashboardTheme, ThemePreset, LayoutConfig, Project, DashboardPage, HeaderConfig, HeaderPosition, TextAlignment, Widget } from './types';
import { getDefaultThemeFromTokens, getLightThemeFromTokens, getHeaderDefaultsFromTokens } from './design-tokens/themeFromTokens';

export const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400, secondary: 240 },
  { name: 'Feb', value: 300, secondary: 139 },
  { name: 'Mar', value: 200, secondary: 980 },
  { name: 'Apr', value: 278, secondary: 390 },
  { name: 'May', value: 189, secondary: 480 },
  { name: 'Jun', value: 239, secondary: 380 },
  { name: 'Jul', value: 349, secondary: 430 },
];

/** design-tokens.json 기준 기본 테마(Dark). JSON 없거나 오류 시 fallback 사용 */
function getDefaultTheme(): DashboardTheme {
  try {
    return getDefaultThemeFromTokens();
  } catch {
    return {
      name: 'Dark Mode',
      primaryColor: '#3b82f6',
      backgroundColor: '#020617',
      surfaceColor: '#0f172a',
      mode: ThemeMode.DARK,
      chartLibrary: ChartLibrary.RECHARTS,
      borderRadius: 16,
      chartRadius: 6,
      borderWidth: 1,
      borderColor: '#1e293b',
      spacing: 16,
      dashboardPadding: 32,
      titleSize: 18,
      titleWeight: '700',
      contentSize: 14,
      textTiny: 12,
      textSmall: 13,
      textMd: 18,
      textLg: 30,
      textHero: 48,
      cardShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
      titleColor: '#f8fafc',
      textColor: '#94a3b8',
      widgetHeaderColor: 'transparent',
      showPageTabs: true,
    };
  }
}

export const DEFAULT_THEME: DashboardTheme = getDefaultTheme();

/** Light/Dark 프리셋 — design-tokens.json semantic.light / semantic.dark 기준 */
export const THEME_PRESETS: ThemePreset[] = (() => {
  let lightTheme: DashboardTheme;
  try {
    lightTheme = getLightThemeFromTokens({ name: 'Light Mode', widgetHeaderColor: undefined });
  } catch {
    lightTheme = { ...DEFAULT_THEME, name: 'Light Mode', mode: ThemeMode.LIGHT, backgroundColor: '#f8fafc', surfaceColor: '#ffffff', primaryColor: '#3b82f6', titleColor: '#0f172a', textColor: '#334155', cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', borderColor: '#e2e8f0' };
  }
  return [
    { id: 'preset_light', name: 'Light Mode', theme: lightTheme },
    { id: 'preset_dark', name: 'Dark Mode', theme: { ...DEFAULT_THEME, name: 'Dark Mode' } },
  ];
})();

/** new project2 전용 커스텀 테마 — design-tokens 기준 + 이미지(Data visualisation) 블루 악센트, 생키 팔레트 */
export const PROJECT2_CUSTOM_THEME: DashboardTheme = (() => {
  const base = getDefaultThemeFromTokens();
  return {
    ...base,
    name: 'Custom (Data visualisation)',
    primaryColor: '#3b82f6',
    chartPalette: ['#4f46e5', '#0d9488', '#c2410c', '#ec4899', '#a855f7', '#f97316'],
  };
})();

const headerDefaults = getHeaderDefaultsFromTokens();

export const DEFAULT_HEADER: HeaderConfig = {
  show: true,
  position: HeaderPosition.TOP,
  height: headerDefaults.height,
  width: 240,
  margin: 0,
  padding: 16,
  backgroundColor: 'transparent',
  textColor: 'var(--text-main)',
  textAlignment: TextAlignment.LEFT,
  title: 'My Dashboard',
  logo: '',
  showDivider: true,
  backgroundImage: undefined,
  backgroundImageLight: undefined,
  backgroundImageDark: undefined,
  widgets: [],
  headerTitleSize: headerDefaults.titleSize,
};

export const DEFAULT_PAGE: DashboardPage = {
  id: 'page_1',
  name: 'Main Page',
  layout: {
    columns: 24,
    rows: 12,
    defaultRowHeight: 20,
    fitToScreen: false,
    freePosition: false
  },
  widgets: [], // Initial widgets can be populated later
  header: DEFAULT_HEADER,
  tabs: []
};

export const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 24,
  rows: 12,
  fitToScreen: false,
  defaultRowHeight: 20,
  useGrid: true,
  resizeStepPx: 5,
};

/** breakpoint 이름 → 최소 너비(px). 화면 너비가 이 값 미만이면 다음 breakpoint로 전환 */
export const RESPONSIVE_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480 } as const;
/** breakpoint별 그리드 컬럼 수 (lg=데스크톱 24열, md=태블릿 12열, sm=모바일 가로 6열, xs=작은 모바일 2열) */
export const RESPONSIVE_COLS = { lg: 24, md: 12, sm: 6, xs: 2 } as const;

export const TYPE_DEFAULT_DATA: Record<string, {
  data: any[];
  config: any;
  mainValue?: string;
  subValue?: string;
  icon?: string;
  progressValue?: number;
  title?: string;
  titleSize?: number;
  titleWeight?: string;
  trendPercent?: number;
  trendUp?: boolean;
  comparisonText?: string;
  categoryItems?: { label: string; value: number; color?: string }[];
  navItems?: { id: string; label: string; active?: boolean }[];
}> = {
  [WidgetType.SUMMARY]: {
    mainValue: '1,234',
    subValue: '평균 활성 사용자',
    icon: 'monitoring',
    data: [],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: []
    }
  },
  [WidgetType.SUMMARY_CHART]: {
    mainValue: '2,345,678',
    subValue: '행사 기간 누적 방문',
    data: [
      { name: '1', value: 30 }, { name: '2', value: 45 }, { name: '3', value: 35 },
      { name: '4', value: 55 }, { name: '5', value: 40 }, { name: '6', value: 70 },
      { name: '7', value: 45 }, { name: '8', value: 85 }, { name: '9', value: 65 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '명',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [{ key: 'value', label: '방문자', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_BAR]: {
    data: MOCK_CHART_DATA,
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      useGradient: true,
      series: [{ key: 'value', label: '수치', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_LINE]: {
    data: MOCK_CHART_DATA,
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [{ key: 'value', label: '수치', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_AREA]: {
    data: MOCK_CHART_DATA,
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [{ key: 'value', label: '수치', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_BAR_HORIZONTAL]: {
    data: [
      { name: 'Category A', value: 400 },
      { name: 'Category B', value: 300 },
      { name: 'Category C', value: 200 },
      { name: 'Category D', value: 278 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: false,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [{ key: 'value', label: '수치', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_COMPOSED]: {
    data: MOCK_CHART_DATA,
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '개',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [
        { key: 'value', label: '실적', color: 'var(--primary-color)' },
        { key: 'secondary', label: '목표', color: 'var(--primary-70)' }
      ]
    }
  },
  [WidgetType.CHART_RADAR]: {
    data: [
      { name: 'Strength', value: 120, secondary: 110 },
      { name: 'Speed', value: 98, secondary: 130 },
      { name: 'Stamina', value: 86, secondary: 130 },
      { name: 'Range', value: 99, secondary: 100 },
      { name: 'Precision', value: 85, secondary: 90 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: 'pt',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [
        { key: 'value', label: 'Player A', color: 'var(--primary-color)' },
        { key: 'secondary', label: 'Player B', color: 'var(--primary-30)' }
      ]
    }
  },
  [WidgetType.CHART_SANKEY]: {
    data: [
      { source: 'Source A', target: 'Target A', value: 10 },
      { source: 'Source A', target: 'Target B', value: 15 },
      { source: 'Source B', target: 'Target B', value: 8 },
      { source: 'Target A', target: 'End X', value: 8 },
      { source: 'Target A', target: 'End Y', value: 2 },
      { source: 'Target B', target: 'End Y', value: 20 },
      { source: 'Target B', target: 'End Z', value: 3 }
    ],
    config: {
      xAxisKey: 'source',
      yAxisKey: 'target',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: true,
      series: [{ key: 'value', label: 'Flow', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.CHART_PIE]: {
    data: [
      { name: 'Mobile', value: 400 },
      { name: 'Desktop', value: 300 },
      { name: 'Tablet', value: 150 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '%',
      showLegend: true,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: true,
      series: [{ key: 'value', label: 'Device Share', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.TABLE]: {
    data: [
      { name: 'Alpha Project', value: 85, status: 'Active' },
      { name: 'Beta System', value: 62, status: 'Pending' },
      { name: 'Gamma Tools', value: 91, status: 'Done' }
    ],
    config: {
      xAxisKey: 'name',
      xAxisLabel: 'Project Name',
      showLegend: false,
      showGrid: false,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: true,
      showLabels: false,
      series: [{ key: 'value', label: 'Progress', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.WEATHER]: {
    mainValue: '24°C',
    subValue: 'Seoul, Partly Cloudy',
    icon: 'partly_cloudy_day',
    data: [],
    config: {
      xAxisKey: '',
      yAxisKey: '',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: []
    }
  },
  [WidgetType.IMAGE]: {
    mainValue: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop',
    subValue: 'Dash Image Preview',
    data: [],
    config: {
      xAxisKey: '',
      yAxisKey: '',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: []
    }
  },
  [WidgetType.MAP]: {
    mainValue: 'Seoul, South Korea',
    subValue: '37.5665, 126.9780',
    data: [],
    config: {
      xAxisKey: '',
      yAxisKey: '',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: []
    }
  },
  [WidgetType.DASH_FAILURE_STATUS]: {
    mainValue: '8',
    subValue: '4354',
    data: [
      { name: 'Critical', value: 1443, color: '#ef4444' },
      { name: 'Major', value: 1179, color: '#f59e0b' },
      { name: 'Minor', value: 963, color: '#eab308' },
      { name: 'Warning', value: 727, color: '#06b6d4' }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '상태', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_FACILITY_1]: {
    data: [
      { name: 'IP-MPLS', value: 6 },
      { name: '미등록', value: 0 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '개',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '수량', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_FACILITY_2]: {
    data: [
      { name: '서버', value: 123, icon: 'database' },
      { name: '네트워크', value: 23456, icon: 'wifi' }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '수치', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_RANK_LIST]: {
    data: [
      { name: '그랑시아', value: 80 },
      { name: '연립주택 15세대', value: 74 },
      { name: '영동고등학교', value: 69 },
      { name: '리오빌딩', value: 69 },
      { name: 'PRADA', value: 68 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '건수', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_FAILURE_STATS]: {
    data: [
      { name: 'Mon', value: 20 }, { name: 'Tue', value: 45 }, { name: 'Wed', value: 28 },
      { name: 'Thu', value: 35 }, { name: 'Fri', value: 48 }, { name: 'Sat', value: 30 }, { name: 'Sun', value: 40 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: false,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '통계', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_RESOURCE_USAGE]: {
    mainValue: 'GMG-CDEFG...',
    data: [
      { name: 'CPU', value: 30 },
      { name: 'MEM', value: 40 },
      { name: 'DISK', value: 30 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '%',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '사용률', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_NET_TRAFFIC]: {
    data: Array.from({ length: 10 }, (_, i) => ({
      name: `Time ${i}`,
      dmz: 20 + Math.random() * 20,
      vdi: 30 + Math.random() * 20,
      biz: 40 + Math.random() * 20,
      gov: 10 + Math.random() * 20
    })),
    config: {
      xAxisKey: 'name',
      yAxisKey: 'dmz',
      unit: 'bps',
      showLegend: true,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [
        { key: 'dmz', label: 'DMZ', color: '#3b82f6' },
        { key: 'vdi', label: 'VDI', color: '#ec4899' },
        { key: 'biz', label: '업무망', color: '#22c55e' },
        { key: 'gov', label: '5G정부망', color: '#06b6d4' }
      ]
    }
  },
  [WidgetType.DASH_TRAFFIC_TOP5]: {
    title: '업무망 트래픽 사용량 TOP5',
    data: [
      { name: '서버1', value: 2130 },
      { name: '서버2', value: 1970 },
      { name: '서버3', value: 1700 },
      { name: '서버4', value: 1412 },
      { name: '서버5', value: 996 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '트래픽', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_SECURITY_STATUS]: {
    mainValue: '545',
    data: [
      { name: 'DDoS', today: 24, weekly: 186 },
      { name: 'IPS', today: 12, weekly: 448 },
      { name: 'Anti-Virus', today: 6, weekly: 30 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'today',
      unit: '건',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'today', label: '오늘', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_VDI_STATUS]: {
    data: [
      { name: '사용 준비중', value: 251 },
      { name: '사용대기', value: 583 },
      { name: '사용중', value: 1430 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '건',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '수량', color: 'var(--primary-color)' }]
    }
  },
  [WidgetType.DASH_TRAFFIC_STATUS]: {
    data: [
      { name: 'Time 1', dmz: 25, vdi: 35, biz: 45, gov: 15 },
      { name: 'Time 2', dmz: 28, vdi: 32, biz: 48, gov: 12 },
      { name: 'Time 3', dmz: 22, vdi: 38, biz: 42, gov: 18 },
      { name: 'Time 4', dmz: 30, vdi: 30, biz: 50, gov: 10 },
      { name: 'Time 5', dmz: 25, vdi: 35, biz: 45, gov: 15 }
    ],
    config: {
      xAxisKey: 'name', yAxisKey: 'dmz', unit: 'bps',
      showLegend: true, showGrid: true, showXAxis: true, showYAxis: true, showUnit: true, showUnitInLegend: false, showLabels: false,
      series: [
        { key: 'dmz', label: 'DMZ', color: '#3b82f6' },
        { key: 'vdi', label: 'VDI', color: '#ec4899' },
        { key: 'biz', label: '업무망', color: '#22c55e' },
        { key: 'gov', label: '5G정부망', color: '#06b6d4' }
      ]
    }
  },

  [WidgetType.GENERAL_KPI]: {
    mainValue: '204',
    subValue: 'ACTIVE USER',
    icon: 'TrendingDown',
    data: [],
    config: { xAxisKey: 'name', yAxisKey: 'value', unit: '', showLegend: false, showGrid: false, showXAxis: false, showYAxis: false, showUnit: false, showUnitInLegend: false, showLabels: false, series: [] }
  },
  [WidgetType.EARNING_PROGRESS]: {
    title: 'Total earning',
    mainValue: '$12,875',
    subValue: '11%',
    progressValue: 89,
    data: [],
    config: { xAxisKey: 'name', yAxisKey: 'value', unit: '', showLegend: false, showGrid: false, showXAxis: false, showYAxis: false, showUnit: false, showUnitInLegend: false, showLabels: false, series: [] }
  },
  [WidgetType.BLANK]: {
    data: [],
    config: {}
  },
  [WidgetType.TEXT_BLOCK]: {
    title: '텍스트',
    mainValue: '여기에 글자를 입력하세요.',
    titleSize: 18,
    titleWeight: '400',
    data: [],
    config: {}
  },
  [WidgetType.VERTICAL_NAV_CARD]: {
    title: '메뉴',
    data: [],
    config: {},
    navItems: [
      { id: 'nav_1', label: '가나다라', active: true },
      { id: 'nav_2', label: '가나다라', active: false },
      { id: 'nav_3', label: '가나다라', active: false },
      { id: 'nav_4', label: '가나다라', active: false },
      { id: 'nav_5', label: '가나다라', active: false },
    ],
  },
  [WidgetType.EARNING_TREND]: {
    mainValue: '$12,875',
    subValue: '21',
    trendPercent: 21,
    trendUp: true,
    comparisonText: 'Compared of $11,750 last year',
    data: [
      { name: 'Jan', value: 8200 },
      { name: 'Feb', value: 9100 },
      { name: 'Mar', value: 8700 },
      { name: 'Apr', value: 9500 },
      { name: 'May', value: 10200 },
      { name: 'Jun', value: 11200 },
      { name: 'Jul', value: 11800 },
      { name: 'Aug', value: 12400 },
      { name: 'Sep', value: 12100 },
      { name: 'Oct', value: 12875 }
    ],
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: '',
      showLegend: false,
      showGrid: false,
      showXAxis: false,
      showYAxis: false,
      showUnit: false,
      showUnitInLegend: false,
      showLabels: false,
      useGradient: true,
      series: [
        { key: 'value', label: 'Revenue', color: '#ec4899', endColor: '#8b5cf6' }
      ]
    },
    categoryItems: [
      { label: 'Sales', value: 8 },
      { label: 'Product', value: 68, color: '#f97316' },
      { label: 'Marketing', value: 12 }
    ]
  }
};

import {
  BarChart3, TrendingUp, PieChart, Table, Database,
  Activity, Monitor, LayoutGrid, CloudSun, Image as ImageIcon, MapPin,
  Hexagon, BarChartHorizontal, AreaChart, Layers, Workflow, Info, Square, Type
} from 'lucide-react';

export const WIDGET_METADATA: Partial<Record<WidgetType, { label: string, icon: any, category: 'viz' | 'premium' | 'general' }>> = {
  [WidgetType.CHART_BAR]: { label: '세로 막대', icon: BarChart3, category: 'viz' },
  [WidgetType.CHART_BAR_HORIZONTAL]: { label: '가로 막대', icon: BarChartHorizontal, category: 'viz' },
  [WidgetType.CHART_LINE]: { label: '선형 차트', icon: TrendingUp, category: 'viz' },
  [WidgetType.CHART_AREA]: { label: '영역 차트', icon: AreaChart, category: 'viz' },
  [WidgetType.CHART_PIE]: { label: '파이 차트', icon: PieChart, category: 'viz' },
  [WidgetType.CHART_RADAR]: { label: '방사형 차트', icon: Hexagon, category: 'viz' },
  [WidgetType.CHART_COMPOSED]: { label: '혼합형 차트', icon: Layers, category: 'viz' },
  [WidgetType.CHART_SANKEY]: { label: '생키 다이어그램', icon: Workflow, category: 'viz' },

  [WidgetType.SUMMARY]: { label: '단일 수치 (Stat)', icon: Database, category: 'premium' },
  [WidgetType.SUMMARY_CHART]: { label: '트렌드 요약', icon: Activity, category: 'premium' },
  [WidgetType.DASH_FAILURE_STATUS]: { label: '장애 현황 (KPI)', icon: Activity, category: 'premium' },
  [WidgetType.DASH_NET_TRAFFIC]: { label: '네트워크 트래픽 (Stacked)', icon: Activity, category: 'premium' },
  [WidgetType.DASH_SECURITY_STATUS]: { label: '보안 탐지 현황', icon: Hexagon, category: 'premium' },
  [WidgetType.DASH_RESOURCE_USAGE]: { label: '리소스 사용량', icon: BarChart3, category: 'premium' },
  [WidgetType.DASH_FACILITY_1]: { label: '시설 현황 (Type 1)', icon: Database, category: 'premium' },
  [WidgetType.DASH_FACILITY_2]: { label: '시설 현황 (Type 2)', icon: Monitor, category: 'premium' },
  [WidgetType.DASH_RANK_LIST]: { label: '순위 리스트', icon: BarChartHorizontal, category: 'premium' },
  [WidgetType.DASH_TRAFFIC_TOP5]: { label: '업무망 트래픽 TOP5', icon: Activity, category: 'premium' },
  [WidgetType.DASH_VDI_STATUS]: { label: 'VDI 접속 현황', icon: Table, category: 'premium' },

  [WidgetType.TABLE]: { label: '데이터 테이블', icon: Table, category: 'general' },
  [WidgetType.IMAGE]: { label: '이미지 박스', icon: ImageIcon, category: 'general' },
  [WidgetType.MAP]: { label: '지도 위젯', icon: MapPin, category: 'general' },
  [WidgetType.WEATHER]: { label: '날씨 정보', icon: CloudSun, category: 'general' },
  [WidgetType.GENERAL_KPI]: { label: 'KPI (General)', icon: Activity, category: 'general' },
  [WidgetType.EARNING_PROGRESS]: { label: 'Total Earning (Progress)', icon: TrendingUp, category: 'general' },
  [WidgetType.EARNING_TREND]: { label: 'Earning Trend (Chart + KPI)', icon: Activity, category: 'general' },
  [WidgetType.TEXT_BLOCK]: { label: '텍스트 (글자만)', icon: Type, category: 'general' },
  [WidgetType.VERTICAL_NAV_CARD]: { label: '세로 네비 카드', icon: Layers, category: 'general' },
};

/** Icon options for General KPI widget (value = Lucide icon name stored in widget.icon) */
export const GENERAL_KPI_ICON_OPTIONS: { value: string; label: string; colorVar: string }[] = [
  { value: 'TrendingDown', label: 'Trending Down', colorVar: '--info' },
  { value: 'User', label: 'User', colorVar: '--primary-color' },
  { value: 'Repeat', label: 'Repeat', colorVar: '--secondary-color' },
  { value: 'Activity', label: 'Activity', colorVar: '--primary-color' },
  { value: 'BarChart3', label: 'Bar Chart', colorVar: '--primary-color' },
  { value: 'TrendingUp', label: 'Trending Up', colorVar: '--success' },
  { value: 'Database', label: 'Database', colorVar: '--primary-color' },
];

export const EXAMPLES_LABELS: Record<string, string> = Object.keys(WIDGET_METADATA).reduce((acc, key) => {
  acc[key] = WIDGET_METADATA[key as WidgetType].label;
  return acc;
}, {} as Record<string, string>);

const defaultChartConfig = {
  xAxisKey: 'name',
  yAxisKey: 'value',
  series: [{ key: 'value', label: 'Value', color: 'var(--primary-color)' }],
  showLegend: true,
  showGrid: true,
  showXAxis: true,
  showYAxis: true,
  showUnit: false,
  showUnitInLegend: false,
  showLabels: false,
  unit: ''
};

const EXAMPLES_WIDGET_TYPES: WidgetType[] = [
  WidgetType.CHART_BAR,
  WidgetType.CHART_BAR_HORIZONTAL,
  WidgetType.CHART_LINE,
  WidgetType.CHART_AREA,
  WidgetType.CHART_PIE,
  WidgetType.CHART_SANKEY,
  WidgetType.CHART_RADAR,
  WidgetType.CHART_COMPOSED,
  WidgetType.SUMMARY_CHART,
  WidgetType.DASH_FAILURE_STATUS,
  WidgetType.DASH_FACILITY_1,
  WidgetType.DASH_FACILITY_2,
  WidgetType.DASH_RANK_LIST,
  WidgetType.DASH_RESOURCE_USAGE,
  WidgetType.DASH_TRAFFIC_TOP5,
  WidgetType.DASH_SECURITY_STATUS,
  WidgetType.DASH_VDI_STATUS,
  WidgetType.SUMMARY,
  WidgetType.TABLE,
  WidgetType.IMAGE,
  WidgetType.MAP,
  WidgetType.WEATHER,
  WidgetType.GENERAL_KPI,
  WidgetType.EARNING_PROGRESS,
  WidgetType.EARNING_TREND,
  WidgetType.TEXT_BLOCK,
  WidgetType.VERTICAL_NAV_CARD,
];

// rowHeight 20 → height 200 = 10 rows
const EXAMPLES_ROW_SPAN = 10;

/** Figma 선택(층별 스택 막대) 기반 스택 막대 차트 위젯 — Y 0~100%, X 지하1층~5층 */
const FLOOR_STACK_CHART_WIDGET: Widget = {
  id: 'ex_figma_floor_stack',
  type: WidgetType.CHART_BAR,
  title: '층별 공간 현황',
  colSpan: 6,
  rowSpan: EXAMPLES_ROW_SPAN,
  config: {
    xAxisKey: 'name',
    yAxisKey: 'value',
    unit: '%',
    showLegend: true,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showUnit: true,
    showUnitInLegend: false,
    showLabels: false,
    useGradient: false,
    series: [
      { key: 's1', label: '엑티브 스튜디오', color: '#62cdff' },
      { key: 's2', label: '힙 플레이스 + 전시홀', color: '#5ea9ff' },
      { key: 's3', label: '커뮤니티 룸', color: '#7c87ff' },
      { key: 's4', label: 'AI 스튜디오 + 다목적홀', color: '#bb8bff' },
      { key: 's5', label: 'LED 스튜디오 + 책공방', color: '#e09cff' },
    ],
  },
  data: [
    { name: '지하 1층', s1: 14, s2: 19, s3: 28, s4: 11, s5: 9 },
    { name: '1층', s1: 8, s2: 19, s3: 23, s4: 20, s5: 8 },
    { name: '2층', s1: 6, s2: 22, s3: 13, s4: 22, s5: 7 },
    { name: '3층', s1: 12, s2: 9, s3: 13, s4: 8, s5: 5 },
    { name: '4층', s1: 8, s2: 9, s3: 11, s4: 7, s5: 8 },
    { name: '5층', s1: 9, s2: 9, s3: 11, s4: 8, s5: 8 },
  ],
  noBezel: false,
};

export const EXAMPLES_PAGE_WIDGETS: Widget[] = [
  ...EXAMPLES_WIDGET_TYPES.map((type, idx) => {
    const def = TYPE_DEFAULT_DATA[type];
    return {
      id: `ex_${idx + 1}`,
      type,
      title: (def as any)?.title ?? EXAMPLES_LABELS[type] ?? type,
      colSpan: 6,
      rowSpan: EXAMPLES_ROW_SPAN,
      config: def?.config ? JSON.parse(JSON.stringify(def.config)) : defaultChartConfig,
      data: def?.data ? JSON.parse(JSON.stringify(def.data)) : [],
      mainValue: def?.mainValue,
      subValue: def?.subValue,
      icon: def?.icon,
      progressValue: def?.progressValue,
      noBezel: false,
    };
  }),
  FLOOR_STACK_CHART_WIDGET,
];

/** Sankey data: Finance → Sales/Investments/Salary → Main projects/Development/Outsourcing (image flow). */
const PROJECT2_SANKEY_DATA = [
  { source: 'Finance', target: 'Sales', value: 84430 },
  { source: 'Finance', target: 'Investments', value: 78655 },
  { source: 'Finance', target: 'Salary', value: 23987 },
  { source: 'Sales', target: 'Main projects', value: 2500 },
  { source: 'Sales', target: 'Development', value: 45000 },
  { source: 'Sales', target: 'Outsourcing', value: 36930 },
  { source: 'Investments', target: 'Main projects', value: 2000 },
  { source: 'Investments', target: 'Development', value: 45000 },
  { source: 'Investments', target: 'Outsourcing', value: 31655 },
  { source: 'Salary', target: 'Main projects', value: 1373 },
  { source: 'Salary', target: 'Development', value: 3989 },
  { source: 'Salary', target: 'Outsourcing', value: 18625 },
];

/** Widgets for New Project2: left (EARNING_PROGRESS, EARNING_TREND) + center (CHART_SANKEY) + bottom (3 GENERAL_KPI). */
const PROJECT2_PAGE_WIDGETS: Widget[] = (() => {
  const kpiBase = TYPE_DEFAULT_DATA[WidgetType.GENERAL_KPI];
  const earningBase = TYPE_DEFAULT_DATA[WidgetType.EARNING_PROGRESS];
  const trendBase = TYPE_DEFAULT_DATA[WidgetType.EARNING_TREND] as any;
  const sankeyBase = TYPE_DEFAULT_DATA[WidgetType.CHART_SANKEY];
  const kpiConfig = kpiBase?.config ? JSON.parse(JSON.stringify(kpiBase.config)) : defaultChartConfig;
  const earningConfig = earningBase?.config ? JSON.parse(JSON.stringify(earningBase.config)) : defaultChartConfig;
  const trendConfig = trendBase?.config ? JSON.parse(JSON.stringify(trendBase.config)) : defaultChartConfig;
  const sankeyConfig = sankeyBase?.config ? JSON.parse(JSON.stringify(sankeyBase.config)) : defaultChartConfig;
  const trendData = trendBase?.data ? JSON.parse(JSON.stringify(trendBase.data)) : [];
  const trendCategoryItems = trendBase?.categoryItems ? JSON.parse(JSON.stringify(trendBase.categoryItems)) : [];
  /** new project2 커스텀 컬러: 이미지 기준 Sales=다크오렌지, Product=미디엄오렌지, Marketing=뮤트블루 */
  const project2CategoryItems = [
    { label: 'Sales', value: 8, color: '#ea580c' },
    { label: 'Product', value: 68, color: '#f97316' },
    { label: 'Marketing', value: 12, color: '#64748b' },
  ];
  return [
    { id: 'proj2_earning_1', type: WidgetType.EARNING_PROGRESS, title: 'Total earning', config: earningConfig, data: [], colSpan: 1, rowSpan: 1, mainValue: '$12,875', subValue: '11%', progressValue: 89, hideHeader: true },
    {
      id: 'proj2_earning_trend_1',
      type: WidgetType.EARNING_TREND,
      title: '',
      config: { ...trendConfig, series: [{ key: 'value', label: 'Revenue', color: '#ec4899', endColor: '#8b5cf6' }] },
      data: trendData,
      colSpan: 1,
      rowSpan: 1,
      mainValue: trendBase?.mainValue ?? '$12,875',
      trendPercent: trendBase?.trendPercent ?? 21,
      trendUp: trendBase?.trendUp !== false,
      comparisonText: trendBase?.comparisonText ?? 'Compared of $11,750 last year',
      categoryItems: project2CategoryItems,
      hideHeader: true,
    },
    {
      id: 'proj2_sankey_1',
      type: WidgetType.CHART_SANKEY,
      title: 'Data visualisation',
      config: sankeyConfig,
      data: JSON.parse(JSON.stringify(PROJECT2_SANKEY_DATA)),
      colSpan: 1,
      rowSpan: 1,
      hideHeader: true,
      backgroundOpacity: 0,
    },
    { id: 'proj2_kpi_1', type: WidgetType.GENERAL_KPI, title: 'Active User', config: kpiConfig, data: [], colSpan: 1, rowSpan: 1, mainValue: '204', subValue: 'ACTIVE USER', icon: 'TrendingDown', hideHeader: true },
    { id: 'proj2_kpi_2', type: WidgetType.GENERAL_KPI, title: 'All Time User', config: JSON.parse(JSON.stringify(kpiConfig)), data: [], colSpan: 1, rowSpan: 1, mainValue: '65,540', subValue: 'ALL TIME USER', icon: 'User', hideHeader: true },
    { id: 'proj2_kpi_3', type: WidgetType.GENERAL_KPI, title: 'Total Projects', config: JSON.parse(JSON.stringify(kpiConfig)), data: [], colSpan: 1, rowSpan: 1, mainValue: '325', subValue: 'TOTAL PROJECTS', icon: 'Repeat', hideHeader: true },
  ];
})();

/** new project 3: 2x2 다크 대시보드 — 가로 막대(AMR), Earning Trend, 단일 수치(평균 활성 사용자), 트렌드 요약(누적 방문) */
const PROJECT3_PAGE_WIDGETS: Widget[] = (() => {
  const barData = [
    { name: 'AMR1', value: 2130 },
    { name: 'AMR2', value: 1970 },
    { name: 'AMR3', value: 1700 },
    { name: 'AMR4', value: 1452 },
    { name: 'AMR5', value: 995 },
  ];
  const barConfig = {
    xAxisKey: 'name',
    yAxisKey: 'value',
    unit: '',
    showLegend: false,
    showGrid: true,
    showXAxis: true,
    showYAxis: true,
    showUnit: false,
    showUnitInLegend: false,
    showLabels: false,
    useGradient: true,
    series: [{ key: 'value', label: '수치', color: '#7dd3fc', endColor: '#ec4899' }],
  };
  const trendBase = TYPE_DEFAULT_DATA[WidgetType.EARNING_TREND] as any;
  const trendConfig = trendBase?.config ? JSON.parse(JSON.stringify(trendBase.config)) : defaultChartConfig;
  const trendData = trendBase?.data ? JSON.parse(JSON.stringify(trendBase.data)) : [];
  const trendCategoryItems = [
    { label: 'Sales', value: 8, color: '#7dd3fc' },
    { label: 'Product', value: 68, color: '#fb923c' },
    { label: 'Marketing', value: 12, color: '#7dd3fc' },
  ];
  const summaryConfig = TYPE_DEFAULT_DATA[WidgetType.SUMMARY]?.config ? JSON.parse(JSON.stringify(TYPE_DEFAULT_DATA[WidgetType.SUMMARY].config)) : defaultChartConfig;
  const summaryChartConfig = TYPE_DEFAULT_DATA[WidgetType.SUMMARY_CHART]?.config ? JSON.parse(JSON.stringify(TYPE_DEFAULT_DATA[WidgetType.SUMMARY_CHART].config)) : defaultChartConfig;
  const summaryChartData = TYPE_DEFAULT_DATA[WidgetType.SUMMARY_CHART]?.data ? JSON.parse(JSON.stringify(TYPE_DEFAULT_DATA[WidgetType.SUMMARY_CHART].data)) : [];

  return [
    {
      id: 'proj3_bar_1',
      type: WidgetType.CHART_BAR_HORIZONTAL,
      title: 'New Analysis',
      config: barConfig,
      data: barData,
      colSpan: 12,
      rowSpan: 8,
    },
    {
      id: 'proj3_summary_1',
      type: WidgetType.SUMMARY,
      title: 'New Analysis',
      config: summaryConfig,
      data: [],
      colSpan: 12,
      rowSpan: 8,
      mainValue: '1,234',
      subValue: '평균 활성 사용자',
      icon: 'monitoring',
    },
    {
      id: 'proj3_trend_1',
      type: WidgetType.EARNING_TREND,
      title: 'New Analysis',
      config: { ...trendConfig, series: [{ key: 'value', label: 'Revenue', color: '#ec4899', endColor: '#8b5cf6' }] },
      data: trendData,
      colSpan: 12,
      rowSpan: 8,
      mainValue: '$12,875',
      trendPercent: 2.7,
      trendUp: true,
      comparisonText: 'Compared of $11,750 last year',
      categoryItems: trendCategoryItems,
    },
    {
      id: 'proj3_summary_chart_1',
      type: WidgetType.SUMMARY_CHART,
      title: 'New Analysis',
      config: summaryChartConfig,
      data: summaryChartData,
      colSpan: 12,
      rowSpan: 8,
      mainValue: '2,345,678',
      subValue: '행사 기간 누적 방문',
    },
  ];
})();



export const INITIAL_PROJECT_LIST: Project[] = [
  {
    id: 'project_1',
    name: 'New Project 1',
    pages: [{
      ...DEFAULT_PAGE,
      id: 'page_1',
      name: 'Examples',
      widgets: EXAMPLES_PAGE_WIDGETS
    }],
    activePageId: 'page_1',
    theme: DEFAULT_THEME
  },
  {
    id: 'project_2',
    name: 'New Project 2',
    pages: [{
      ...DEFAULT_PAGE,
      id: 'page_1',
      name: 'Data visualisation',
      widgets: PROJECT2_PAGE_WIDGETS,
      layout: {
        ...DEFAULT_PAGE.layout,
        columns: 1, // Full width stacked for this specific design
        rows: 6
      }
    }],
    activePageId: 'page_1',
    theme: PROJECT2_CUSTOM_THEME
  },
  {
    id: 'project_3',
    name: 'New Project 3',
    pages: [{
      ...DEFAULT_PAGE,
      id: 'page_1',
      name: 'Dashboard',
      widgets: PROJECT3_PAGE_WIDGETS,
      header: DEFAULT_HEADER,
      layout: {
        ...DEFAULT_PAGE.layout,
        backgroundGlobe: true,
      },
    }],
    activePageId: 'page_1',
    theme: DEFAULT_THEME,
  },
];

export const BRAND_COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Orange', hex: '#f59e0b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Slate', hex: '#64748b' },
];
