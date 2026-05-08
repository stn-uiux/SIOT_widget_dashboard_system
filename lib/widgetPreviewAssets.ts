/**
 * 위젯 타입별 정적 프리뷰 이미지 (public/assets/widget/...).
 * Add New Widget, 설정 패널 호버 미리보기 등에서 단일 소스로 사용합니다.
 */
import { WidgetType } from "../types";

export type WidgetPreviewMode = "light" | "dark";

export const WIDGET_PREVIEW_ASSETS: Record<string, { light: string; dark: string }> = {
  [WidgetType.CHART_BAR]: {
    light: "/assets/widget/light/graph/bar_graph_light.png",
    dark: "/assets/widget/dark/graph/bar_graph_dark.png",
  },
  [WidgetType.CHART_BAR_HORIZONTAL]: {
    light: "/assets/widget/light/graph/bar_horizontal_graph_light.png",
    dark: "/assets/widget/dark/graph/bar_horizontal_graph_dark.png",
  },
  [WidgetType.CHART_LINE]: {
    light: "/assets/widget/light/graph/line_graph_light.png",
    dark: "/assets/widget/dark/graph/line_graph_dark.png",
  },
  [WidgetType.CHART_AREA]: {
    light: "/assets/widget/light/graph/area_graph_light.png",
    dark: "/assets/widget/dark/graph/area_graph_dark.png",
  },
  [WidgetType.CHART_PIE]: {
    light: "/assets/widget/light/graph/pie_chart_light.png",
    dark: "/assets/widget/dark/graph/pie_chart_dark.png",
  },
  [WidgetType.CHART_COMPOSED]: {
    light: "/assets/widget/light/graph/composed_chart_light.png",
    dark: "/assets/widget/dark/graph/composed_chart_dark.png",
  },
  [WidgetType.CHART_SANKEY]: {
    light: "/assets/widget/light/graph/sankey_diagram_light.png",
    dark: "/assets/widget/dark/graph/sankey_diagram_dark.png",
  },
  [WidgetType.SUMMARY]: {
    light: "/assets/widget/light/premium/stat_summary_light.png",
    dark: "/assets/widget/dark/premium/stat_summary_dark.png",
  },
  [WidgetType.SUMMARY_CHART]: {
    light: "/assets/widget/light/premium/trend_summary_light.png",
    dark: "/assets/widget/dark/premium/trend_summary_dark.png",
  },
  [WidgetType.DASH_FAILURE_STATUS]: {
    light: "/assets/widget/light/premium/failure_status_kpi_light.png",
    dark: "/assets/widget/dark/premium/failure_status_kpi_dark.png",
  },
  [WidgetType.DASH_RESOURCE_USAGE]: {
    light: "/assets/widget/light/premium/resource_usage_light.png",
    dark: "/assets/widget/dark/premium/resource_usage_dark.png",
  },
  [WidgetType.DASH_NET_TRAFFIC]: {
    light: "/assets/widget/light/premium/network_traffic_light.png",
    dark: "/assets/widget/dark/premium/network_traffic_dark.png",
  },
  [WidgetType.DASH_SECURITY_STATUS]: {
    light: "/assets/widget/light/premium/security_status_v1_light.png",
    dark: "/assets/widget/dark/premium/security_status_v1_dark.png",
  },
  [WidgetType.DASH_SECURITY_STATUS_V2]: {
    light: "/assets/widget/light/premium/security_status_v2_light.png",
    dark: "/assets/widget/dark/premium/security_status_v2_dark.png",
  },
  [WidgetType.DASH_FACILITY_1]: {
    light: "/assets/widget/light/premium/facility_type1_light.png",
    dark: "/assets/widget/dark/premium/facility_type1_dark.png",
  },
  [WidgetType.DASH_FACILITY_2]: {
    light: "/assets/widget/light/premium/facility_type2_light.png",
    dark: "/assets/widget/dark/premium/facility_type2_dark.png",
  },
  [WidgetType.DASH_FACILITY_2_FIGMA]: {
    light: "/assets/widget/light/premium/facility_type3_light.png",
    dark: "/assets/widget/dark/premium/facility_type3_dark.png",
  },
  [WidgetType.DASH_RANK_LIST]: {
    light: "/assets/widget/light/premium/rank_list_light.png",
    dark: "/assets/widget/dark/premium/rank_list_dark.png",
  },
  [WidgetType.DASH_TRAFFIC_TOP5]: {
    light: "/assets/widget/light/premium/traffic_top5_light.png",
    dark: "/assets/widget/dark/premium/traffic_top5_dark.png",
  },
  [WidgetType.DASH_VDI_STATUS]: {
    light: "/assets/widget/light/premium/vdi_status_light.png",
    dark: "/assets/widget/dark/premium/vdi_status_dark.png",
  },
  [WidgetType.DASH_EQUIP_PERF_TOP5]: {
    light: "/assets/widget/light/graph/equip_perf_top5_light.png",
    dark: "/assets/widget/dark/graph/equip_perf_top5_dark.png",
  },
  [WidgetType.TABLE]: {
    light: "/assets/widget/light/general/data_table_light.png",
    dark: "/assets/widget/dark/general/data_table_dark.png",
  },
  [WidgetType.IMAGE]: {
    light: "/assets/widget/light/general/image_box_light.png",
    dark: "/assets/widget/dark/general/image_box_dark.png",
  },
  [WidgetType.MAP]: {
    light: "/assets/widget/light/general/map_widget_light.png",
    dark: "/assets/widget/dark/general/map_widget_dark.png",
  },
  [WidgetType.WEATHER]: {
    light: "/assets/widget/light/general/weather_info_light.png",
    dark: "/assets/widget/dark/general/weather_info_dark.png",
  },
  [WidgetType.GENERAL_KPI]: {
    light: "/assets/widget/light/general/kpi_general_light.png",
    dark: "/assets/widget/dark/general/kpi_general_dark.png",
  },
  [WidgetType.EARNING_PROGRESS]: {
    light: "/assets/widget/light/general/earning_progress_light.png",
    dark: "/assets/widget/dark/general/earning_progress_dark.png",
  },
  [WidgetType.EARNING_TREND]: {
    light: "/assets/widget/light/general/earning_trend_light.png",
    dark: "/assets/widget/dark/general/earning_trend_dark.png",
  },
  [WidgetType.TEXT_BLOCK]: {
    light: "/assets/widget/light/general/text_block_light.png",
    dark: "/assets/widget/dark/general/text_block_dark.png",
  },
  [WidgetType.VERTICAL_NAV_CARD]: {
    light: "/assets/widget/light/general/vertical_nav_card_light.png",
    dark: "/assets/widget/dark/general/vertical_nav_card_dark.png",
  },
  [WidgetType.CHART_RADAR]: {
    light: "/assets/widget/light/graph/radar_chart_light.png",
    dark: "/assets/widget/dark/graph/radar_chart_dark.png",
  },
};

export const DEFAULT_WIDGET_PREVIEW = {
  light: "/assets/widget/light/graph/bar_graph_light.png",
  dark: "/assets/widget/dark/graph/bar_graph_dark.png",
};

export function getWidgetPreviewPaths(type: WidgetType): { light: string; dark: string } {
  return WIDGET_PREVIEW_ASSETS[type] ?? DEFAULT_WIDGET_PREVIEW;
}

export function getWidgetPreviewSrc(type: WidgetType, mode: WidgetPreviewMode): string {
  const p = getWidgetPreviewPaths(type);
  return mode === "dark" ? p.dark : p.light;
}
