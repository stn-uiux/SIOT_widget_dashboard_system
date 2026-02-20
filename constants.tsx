import { WidgetType, ThemeMode, ChartLibrary, DashboardTheme, ThemePreset, LayoutConfig, Project, DashboardPage, HeaderConfig, HeaderPosition, TextAlignment, Widget } from './types';

export const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400, secondary: 240 },
  { name: 'Feb', value: 300, secondary: 139 },
  { name: 'Mar', value: 200, secondary: 980 },
  { name: 'Apr', value: 278, secondary: 390 },
  { name: 'May', value: 189, secondary: 480 },
  { name: 'Jun', value: 239, secondary: 380 },
  { name: 'Jul', value: 349, secondary: 430 },
];

export const DEFAULT_THEME: DashboardTheme = {
  name: 'Default',
  primaryColor: '#6366f1',
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
  showPageTabs: true
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'preset_light',
    name: 'Light Mode',
    theme: {
      ...DEFAULT_THEME,
      name: 'Light Mode',
      mode: ThemeMode.LIGHT,
      backgroundColor: '#f8fafc',
      surfaceColor: '#ffffff',
      primaryColor: '#3b82f6',
      titleColor: '#0f172a',
      textColor: '#334155',
      cardShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      borderColor: '#e2e8f0',
      widgetHeaderColor: undefined,
      dualModeSupport: true
    }
  },
  {
    id: 'preset_dark',
    name: 'Dark Mode',
    theme: {
      ...DEFAULT_THEME,
      name: 'Dark Mode',
      dualModeSupport: true
    }
  }
];

export const DEFAULT_HEADER: HeaderConfig = {
  show: true,
  position: HeaderPosition.TOP,
  height: 64,
  width: 240,
  margin: 0,
  padding: 16,
  backgroundColor: 'var(--background)',
  textColor: 'var(--text-main)',
  textAlignment: TextAlignment.LEFT,
  title: 'My Custom Dashboard',
  showDivider: true
};

export const DEFAULT_PAGE: DashboardPage = {
  id: 'page_1',
  name: 'Main Page',
  layout: {
    columns: 24,
    rows: 12,
    defaultRowHeight: 20,
    fitToScreen: false
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
};

export const TYPE_DEFAULT_DATA: Record<string, { data: any[], config: any, mainValue?: string, subValue?: string, icon?: string }> = {
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
  [WidgetType.DASH_TRAFFIC_STATUS]: {
    data: Array.from({ length: 24 }, (_, i) => ({ name: `${i}:00`, value: 100 + Math.random() * 100 })),
    config: {
      xAxisKey: 'name',
      yAxisKey: 'value',
      unit: 'bps',
      showLegend: false,
      showGrid: true,
      showXAxis: true,
      showYAxis: true,
      showUnit: true,
      showUnitInLegend: false,
      showLabels: false,
      series: [{ key: 'value', label: '트래픽', color: '#06b6d4' }]
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
  }

};

// Examples page: visualization + premium + general (one each)
const EXAMPLES_WIDGET_TYPES: WidgetType[] = [
  // 시각화 차트
  WidgetType.CHART_BAR,
  WidgetType.CHART_BAR_HORIZONTAL,
  WidgetType.CHART_LINE,
  WidgetType.CHART_AREA,
  WidgetType.CHART_PIE,
  WidgetType.CHART_SANKEY,
  WidgetType.CHART_RADAR,
  WidgetType.CHART_COMPOSED,
  WidgetType.SUMMARY_CHART,
  // 프리미엄 템플릿
  WidgetType.DASH_FAILURE_STATUS,
  WidgetType.DASH_FACILITY_1,
  WidgetType.DASH_FACILITY_2,
  WidgetType.DASH_RANK_LIST,
  WidgetType.DASH_RESOURCE_USAGE,
  WidgetType.DASH_TRAFFIC_STATUS,
  WidgetType.DASH_SECURITY_STATUS,
  WidgetType.DASH_VDI_STATUS,
  // 일반 컴포넌트
  WidgetType.SUMMARY,
  WidgetType.TABLE,
  WidgetType.IMAGE,
  WidgetType.MAP,
  WidgetType.WEATHER,
];

const EXAMPLES_LABELS: Record<string, string> = {
  [WidgetType.CHART_BAR]: '세로 막대',
  [WidgetType.CHART_BAR_HORIZONTAL]: '가로 막대',
  [WidgetType.CHART_LINE]: '선형 차트',
  [WidgetType.CHART_AREA]: '영역 차트',
  [WidgetType.CHART_PIE]: '파이 차트',
  [WidgetType.CHART_SANKEY]: '생키 다이어그램',
  [WidgetType.CHART_RADAR]: '방사형 차트',
  [WidgetType.CHART_COMPOSED]: '혼합형 차트',
  [WidgetType.SUMMARY_CHART]: '트렌드 요약',
  [WidgetType.DASH_FAILURE_STATUS]: '장애 현황',
  [WidgetType.DASH_FACILITY_1]: '시설 현황 1',
  [WidgetType.DASH_FACILITY_2]: '시설 현황 2',
  [WidgetType.DASH_RANK_LIST]: '순위 리스트',
  [WidgetType.DASH_RESOURCE_USAGE]: '리소스 사용량',
  [WidgetType.DASH_TRAFFIC_STATUS]: '트래픽 통계',
  [WidgetType.DASH_SECURITY_STATUS]: '보안 현황',
  [WidgetType.DASH_VDI_STATUS]: 'VDI 접속 현황',
  [WidgetType.SUMMARY]: '단일 수치',
  [WidgetType.TABLE]: '데이터 테이블',
  [WidgetType.IMAGE]: '이미지 박스',
  [WidgetType.MAP]: '지도 위젯',
  [WidgetType.WEATHER]: '날씨 정보',
};

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

// rowHeight 20 → height 200 = 10 rows
const EXAMPLES_ROW_SPAN = 10;

export const EXAMPLES_PAGE_WIDGETS: Widget[] = EXAMPLES_WIDGET_TYPES.map((type, idx) => {
  const def = TYPE_DEFAULT_DATA[type];
  return {
    id: `ex_${idx + 1}`,
    type,
    title: EXAMPLES_LABELS[type] || type,
    colSpan: 6,
    rowSpan: EXAMPLES_ROW_SPAN,
    config: def?.config ? JSON.parse(JSON.stringify(def.config)) : defaultChartConfig,
    data: def?.data ? JSON.parse(JSON.stringify(def.data)) : [],
    mainValue: def?.mainValue,
    subValue: def?.subValue,
    icon: def?.icon,
    noBezel: false,
  };
});

export const INITIAL_PROJECT_LIST: Project[] = [
  {
    id: 'project_1',
    name: 'My Dashboard',
    pages: [{
      ...DEFAULT_PAGE,
      id: 'page_1',
      name: 'Examples',
      widgets: EXAMPLES_PAGE_WIDGETS
    }],
    activePageId: 'page_1',
    theme: DEFAULT_THEME
  }
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
