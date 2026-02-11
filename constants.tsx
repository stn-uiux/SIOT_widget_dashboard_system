
import { WidgetType, ThemeMode, ChartLibrary, DashboardTheme, LayoutConfig } from './types';

export const DEFAULT_THEME: DashboardTheme = {
  primaryColor: '#3b82f6',
  mode: ThemeMode.LIGHT,
  chartLibrary: ChartLibrary.RECHARTS,
  borderRadius: 24,
  spacing: 16,
  titleSize: 18,
  titleWeight: '700',
  contentSize: 12,
};

export const DEFAULT_LAYOUT: LayoutConfig = {
  columns: 3,
  rows: 4,
  fitToScreen: false,
  defaultRowHeight: 300,
};

export const MOCK_CHART_DATA = [
  { name: 'Jan', value: 400, secondary: 240 },
  { name: 'Feb', value: 300, secondary: 139 },
  { name: 'Mar', value: 200, secondary: 980 },
  { name: 'Apr', value: 278, secondary: 390 },
  { name: 'May', value: 189, secondary: 480 },
  { name: 'Jun', value: 239, secondary: 380 },
  { name: 'Jul', value: 349, secondary: 430 },
];

export const TYPE_DEFAULT_DATA: Record<string, { data: any[], config: any, mainValue?: string, subValue?: string }> = {
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
  }

};

export const BRAND_COLORS = [
  { name: 'Blue', hex: '#3b82f6' },
  { name: 'Indigo', hex: '#6366f1' },
  { name: 'Purple', hex: '#a855f7' },
  { name: 'Green', hex: '#10b981' },
  { name: 'Orange', hex: '#f59e0b' },
  { name: 'Red', hex: '#ef4444' },
  { name: 'Slate', hex: '#64748b' },
];
