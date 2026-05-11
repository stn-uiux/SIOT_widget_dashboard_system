import { WidgetType } from '../types';

/** Types whose manual `data` / `config` rows stay compatible when switching in the sidebar. */
export const VIZ_DATA_COMPATIBLE_TYPES: readonly WidgetType[] = [
  WidgetType.CHART_BAR,
  WidgetType.CHART_BAR_HORIZONTAL,
  WidgetType.CHART_LINE,
  WidgetType.CHART_AREA,
  WidgetType.CHART_PIE,
  WidgetType.CHART_RADAR,
  WidgetType.CHART_TREEMAP,
  WidgetType.CHART_COMPOSED,
  WidgetType.TABLE,
];

export function isVizDataCompatibleType(t: WidgetType): boolean {
  return VIZ_DATA_COMPATIBLE_TYPES.includes(t);
}

const DASHBOARD_ROW_CHART_TYPES: readonly WidgetType[] = [
  WidgetType.DASH_EQUIP_PERF_TOP5,
  WidgetType.DASH_RANK_LIST,
  WidgetType.DASH_FAILURE_STATS,
  WidgetType.DASH_TRAFFIC_STATUS,
  WidgetType.DASH_NET_TRAFFIC,
  WidgetType.DASH_TRAFFIC_TOP5,
  WidgetType.DASH_SECURITY_STATUS,
  WidgetType.DASH_SECURITY_STATUS_V2,
  WidgetType.DASH_VDI_STATUS,
];

const PREMIUM_SUMMARY_ROW_TYPES: readonly WidgetType[] = [
  WidgetType.DASH_FAILURE_STATUS,
  WidgetType.DASH_FACILITY_1,
  WidgetType.DASH_FACILITY_2,
  WidgetType.DASH_FACILITY_2_FIGMA,
  WidgetType.DASH_SECURITY_STATUS,
  WidgetType.DASH_SECURITY_STATUS_V2,
  WidgetType.DASH_VDI_STATUS,
  WidgetType.DASH_RESOURCE_USAGE,
];

/** Mirrors sidebar “tabular manual data” detection — single source for grid editors + future DB binding. */
export function widgetSupportsManualDataGrid(type: WidgetType): boolean {
  const isTable = type === WidgetType.TABLE;
  const isChart = String(type).includes('CHART') || isTable || DASHBOARD_ROW_CHART_TYPES.includes(type);
  const isSummaryChart = type === WidgetType.SUMMARY_CHART;
  const isEarningTrend = type === WidgetType.EARNING_TREND;
  const isPremiumSummary = PREMIUM_SUMMARY_ROW_TYPES.includes(type);
  return isChart || isSummaryChart || isEarningTrend || isPremiumSummary;
}

/** DB / API scalar families (extend when drivers land). */
export type DbScalarKind = 'number' | 'text' | 'boolean' | 'date' | 'json' | 'unknown';

export interface WidgetBindingSlots {
  /** Row/column grid like charts, tables, trend blocks. */
  supportsRowTable: boolean;
  /** Label / category / axis column. */
  dimensionKinds: readonly DbScalarKind[];
  /** Series values / measures. */
  measureKinds: readonly DbScalarKind[];
  /** Single KPI number (summary cards). */
  supportsScalarMeasure: boolean;
  /** Free text body (TEXT_BLOCK). */
  supportsTextBody: boolean;
}

const NONE: WidgetBindingSlots = {
  supportsRowTable: false,
  dimensionKinds: [],
  measureKinds: [],
  supportsScalarMeasure: false,
  supportsTextBody: false,
};

const CHART_LIKE_ROWS: WidgetBindingSlots = {
  supportsRowTable: true,
  dimensionKinds: ['text', 'date', 'boolean', 'unknown'],
  measureKinds: ['number', 'unknown'],
  supportsScalarMeasure: false,
  supportsTextBody: false,
};

const TABLE_ROWS: WidgetBindingSlots = {
  supportsRowTable: true,
  dimensionKinds: ['text', 'number', 'boolean', 'date', 'json', 'unknown'],
  measureKinds: ['text', 'number', 'boolean', 'date', 'json', 'unknown'],
  supportsScalarMeasure: false,
  supportsTextBody: false,
};

const KPI_SCALAR: WidgetBindingSlots = {
  supportsRowTable: false,
  dimensionKinds: [],
  measureKinds: ['number', 'unknown'],
  supportsScalarMeasure: true,
  supportsTextBody: false,
};

const TEXT_BODY: WidgetBindingSlots = {
  supportsRowTable: false,
  dimensionKinds: [],
  measureKinds: [],
  supportsScalarMeasure: false,
  supportsTextBody: true,
};

/**
 * Policy for which DB column kinds can bind to which widget roles.
 * UI layers (sidebar, future DB browser) should consult this instead of ad-hoc checks.
 */
export function getWidgetBindingSlots(type: WidgetType): WidgetBindingSlots {
  if (type === WidgetType.TABLE) return TABLE_ROWS;
  if (widgetSupportsManualDataGrid(type)) return CHART_LIKE_ROWS;

  if (
    type === WidgetType.SUMMARY ||
    type === WidgetType.GENERAL_KPI ||
    type === WidgetType.EARNING_PROGRESS
  ) {
    return KPI_SCALAR;
  }

  if (type === WidgetType.TEXT_BLOCK) return TEXT_BODY;

  return NONE;
}

export function isDbKindAllowedForWidgetMeasure(type: WidgetType, kind: DbScalarKind): boolean {
  const s = getWidgetBindingSlots(type);
  return s.measureKinds.includes(kind);
}

export function isDbKindAllowedForWidgetDimension(type: WidgetType, kind: DbScalarKind): boolean {
  const s = getWidgetBindingSlots(type);
  return s.dimensionKinds.includes(kind);
}
