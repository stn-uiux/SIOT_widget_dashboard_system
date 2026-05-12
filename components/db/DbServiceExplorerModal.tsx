import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Database,
  Layers,
  Server,
  Table,
  X,
} from "lucide-react";
import type { DashboardTheme, Widget } from "../../types";
import { WidgetType } from "../../types";
const WidgetCardPreview = React.lazy(() => import("../WidgetCard"));

type Status = "Open" | "In progress" | "Closed";

type ExplorerNodeType = "connection" | "database" | "schema" | "table";

type ExplorerNode = {
  id: string;
  name: string;
  type: ExplorerNodeType;
  status: Status;
  parents?: readonly string[];
};

type ExplorerColumn = {
  id: string;
  title: string;
  count: number;
  nodes: readonly ExplorerNode[];
};

type TableColumnType = "number" | "string" | "boolean" | "datetime";

type TableColumnMeta = {
  name: string;
  type: TableColumnType;
  nullable?: boolean;
};

type TablePreviewData = {
  columns: readonly TableColumnMeta[];
  rows: readonly Record<string, string | number | boolean | null>[];
};

const NODE_TYPE_META: Record<
  ExplorerNodeType,
  { icon: React.ComponentType<{ className?: string }>; activeBg: string; activeFg: string; idleBg: string; idleFg: string }
> = {
  connection: {
    icon: Server,
    activeBg: "var(--primary-color)",
    activeFg: "var(--white)",
    idleBg: "var(--widget-picker-pill-tint)",
    idleFg: "var(--text-muted)",
  },
  database: {
    icon: Database,
    activeBg: "var(--secondary-color)",
    activeFg: "var(--white)",
    idleBg: "var(--widget-picker-pill-tint)",
    idleFg: "var(--text-muted)",
  },
  schema: {
    icon: Layers,
    activeBg: "var(--info)",
    activeFg: "var(--white)",
    idleBg: "var(--widget-picker-pill-tint)",
    idleFg: "var(--text-muted)",
  },
  table: {
    icon: Table,
    activeBg: "var(--premium-start)",
    activeFg: "var(--white)",
    idleBg: "var(--widget-picker-pill-tint)",
    idleFg: "var(--text-muted)",
  },
};

// UI 뼈대/동작 확인용 mock 데이터 (DB 연결은 추후 붙임)
const MOCK_COLUMNS: readonly ExplorerColumn[] = [
  {
    id: "connections",
    title: "Connections",
    count: 2,
    nodes: [
      { id: "conn-prod", name: "Maple Prod", type: "connection", status: "Open" },
      { id: "conn-dev", name: "Maple Dev", type: "connection", status: "Open" },
    ],
  },
  {
    id: "databases",
    title: "Databases",
    count: 3,
    nodes: [
      { id: "db-core", name: "Core DB", type: "database", status: "Open", parents: ["conn-dev"] },
      { id: "db-analytics", name: "Analytics DB", type: "database", status: "In progress", parents: ["conn-dev"] },
      { id: "db-audit", name: "Audit DB", type: "database", status: "Closed", parents: ["conn-prod"] },
    ],
  },
  {
    id: "schemas",
    title: "Schemas",
    count: 4,
    nodes: [
      { id: "schema-public", name: "public", type: "schema", status: "Open", parents: ["db-core"] },
      { id: "schema-iam", name: "iam", type: "schema", status: "Open", parents: ["db-core"] },
      { id: "schema-metrics", name: "metrics", type: "schema", status: "In progress", parents: ["db-analytics"] },
      { id: "schema-log", name: "log", type: "schema", status: "Closed", parents: ["db-audit"] },
    ],
  },
  {
    id: "tables",
    title: "Tables",
    count: 4,
    nodes: [
      { id: "tbl-users", name: "users", type: "table", status: "Open", parents: ["schema-iam"] },
      { id: "tbl-sessions", name: "sessions", type: "table", status: "In progress", parents: ["schema-iam"] },
      { id: "tbl-events", name: "events", type: "table", status: "Open", parents: ["schema-metrics"] },
      { id: "tbl-audit", name: "audit_logs", type: "table", status: "Closed", parents: ["schema-log"] },
    ],
  },
];

const MOCK_TABLE_DATA: Record<string, TablePreviewData> = {
  "tbl-users": {
    columns: [
      { name: "user_id", type: "number" },
      { name: "name", type: "string" },
      { name: "role", type: "string" },
      { name: "last_login", type: "datetime", nullable: true },
      { name: "is_active", type: "boolean" },
    ],
    rows: [
      { user_id: 1001, name: "Kim", role: "admin", last_login: "2026-05-11 08:30", is_active: true },
      { user_id: 1002, name: "Park", role: "operator", last_login: "2026-05-11 08:24", is_active: true },
      { user_id: 1003, name: "Lee", role: "viewer", last_login: null, is_active: false },
    ],
  },
  "tbl-sessions": {
    columns: [
      { name: "session_id", type: "string" },
      { name: "user_id", type: "number" },
      { name: "duration_sec", type: "number" },
      { name: "created_at", type: "datetime" },
    ],
    rows: [
      { session_id: "S-11", user_id: 1001, duration_sec: 552, created_at: "2026-05-11 08:01" },
      { session_id: "S-12", user_id: 1002, duration_sec: 231, created_at: "2026-05-11 08:15" },
      { session_id: "S-13", user_id: 1001, duration_sec: 734, created_at: "2026-05-11 08:22" },
    ],
  },
  "tbl-events": {
    columns: [
      { name: "event_id", type: "number" },
      { name: "service", type: "string" },
      { name: "severity", type: "string" },
      { name: "count", type: "number" },
      { name: "recorded_at", type: "datetime" },
    ],
    rows: [
      { event_id: 1, service: "auth", severity: "high", count: 12, recorded_at: "2026-05-11 08:00" },
      { event_id: 2, service: "api", severity: "medium", count: 5, recorded_at: "2026-05-11 08:10" },
      { event_id: 3, service: "db", severity: "low", count: 2, recorded_at: "2026-05-11 08:20" },
    ],
  },
  "tbl-audit": {
    columns: [
      { name: "audit_id", type: "number" },
      { name: "action", type: "string" },
      { name: "actor", type: "string" },
      { name: "created_at", type: "datetime" },
    ],
    rows: [
      { audit_id: 8801, action: "update", actor: "system", created_at: "2026-05-11 08:18" },
      { audit_id: 8802, action: "delete", actor: "admin", created_at: "2026-05-11 08:26" },
    ],
  },
};

type NodePosition = { x: number; y: number; left: number; right: number };

function buildChain(rootId: string): string[] {
  const chain: string[] = [rootId];
  const allNodes = MOCK_COLUMNS.flatMap((c) => c.nodes);

  const findChildren = (parentId: string) => {
    MOCK_COLUMNS.forEach((col) => {
      col.nodes.forEach((node) => {
        if (node.parents?.includes(parentId)) {
          if (!chain.includes(node.id)) {
            chain.push(node.id);
            findChildren(node.id);
          }
        }
      });
    });
  };

  const findParents = (nodeId: string) => {
    const node = allNodes.find((n) => n.id === nodeId);
    if (!node?.parents) return;
    node.parents.forEach((pId) => {
      if (!chain.includes(pId)) {
        chain.push(pId);
        findParents(pId);
      }
    });
  };

  findChildren(rootId);
  findParents(rootId);
  return chain;
}

export function DbServiceExplorerModal(props: {
  open: boolean;
  onClose: () => void;
  widgetTitle?: string;
  widgetType?: string;
  widget?: Widget;
  theme?: DashboardTheme;
}) {
  const { open, onClose, widgetTitle, widgetType, widget, theme } = props;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>("tbl-users");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [activeChain, setActiveChain] = useState<readonly string[]>([]);
  const [positions, setPositions] = useState<Record<string, NodePosition>>({});

  useEffect(() => {
    if (!open) return;
    // 기본 포커스 노드
    setHoveredId((prev) => prev ?? "conn-dev");
    setSelectedTableId((prev) => prev || "tbl-users");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!hoveredId) {
      setActiveChain([]);
      return;
    }
    setActiveChain(buildChain(hoveredId));
  }, [hoveredId, open]);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const root = containerRef.current;
      if (!root) return;
      const rootRect = root.getBoundingClientRect();
      const next: Record<string, NodePosition> = {};

      MOCK_COLUMNS.forEach((col) => {
        col.nodes.forEach((node) => {
          const el = document.getElementById(`db-explorer-node-${node.id}`);
          if (!el) return;
          const rect = el.getBoundingClientRect();
          next[node.id] = {
            x: rect.left - rootRect.left,
            y: rect.top - rootRect.top + rect.height / 2,
            left: rect.left - rootRect.left,
            right: rect.left - rootRect.left + rect.width,
          };
        });
      });

      setPositions(next);
    };

    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
    };
  }, [open, activeChain]);

  const lines = useMemo(() => {
    const out: Array<{ start: { x: number; y: number }; end: { x: number; y: number }; active: boolean }> = [];
    MOCK_COLUMNS.forEach((col) => {
      col.nodes.forEach((node) => {
        node.parents?.forEach((parentId) => {
          const parentPos = positions[parentId];
          const nodePos = positions[node.id];
          if (!parentPos || !nodePos) return;
          out.push({
            start: { x: parentPos.right - 6, y: parentPos.y },
            end: { x: nodePos.left + 6, y: nodePos.y },
            active: activeChain.includes(parentId) && activeChain.includes(node.id),
          });
        });
      });
    });
    return out;
  }, [positions, activeChain]);

  const selectedTable = useMemo(() => MOCK_TABLE_DATA[selectedTableId], [selectedTableId]);

  const allowOnlyNumeric = useMemo(() => {
    const t = String(widgetType || "").toUpperCase();
    return (
      t.includes("CHART") ||
      t.includes("SUMMARY") ||
      t.includes("KPI") ||
      t.includes("EARNING") ||
      t.includes("TRAFFIC") ||
      t.includes("STATUS")
    );
  }, [widgetType]);

  /** VDI 접속 현황 등: 행마다 표시할 수치는 하나의 DB 숫자 컬럼에만 매핑 */
  const singleNumericMeasure = widget?.type === WidgetType.DASH_VDI_STATUS;

  useEffect(() => {
    if (!selectedTable) return;
    const compatible = selectedTable.columns
      .filter((c) => (allowOnlyNumeric ? c.type === "number" : true))
      .map((c) => c.name);
    const maxPick =
      singleNumericMeasure && allowOnlyNumeric ? 1 : Math.min(2, compatible.length);
    setSelectedColumns(compatible.slice(0, maxPick));
  }, [selectedTableId, allowOnlyNumeric, selectedTable, singleNumericMeasure]);

  const tableRowsToShow = useMemo(() => selectedTable?.rows.slice(0, 5) ?? [], [selectedTable]);
  const tableColumnsToShow = useMemo(() => {
    if (!selectedTable) return [];
    if (selectedColumns.length === 0) return selectedTable.columns;
    return selectedTable.columns.filter((c) => selectedColumns.includes(c.name));
  }, [selectedTable, selectedColumns]);

  const previewRows = useMemo(() => {
    if (!selectedTable) return [];
    const rows = selectedTable.rows.slice(0, 7);
    const numericColumns = selectedColumns.length > 0
      ? selectedColumns
      : selectedTable.columns.filter((c) => c.type === "number").map((c) => c.name);
    const labelColumn = selectedTable.columns.find((c) => c.type === "string")?.name ?? selectedTable.columns[0]?.name;
    return rows.map((r, idx) => {
      const base: Record<string, string | number> = { name: String(r[labelColumn] ?? `Row ${idx + 1}`) };
      numericColumns.forEach((k) => {
        const n = Number(r[k]);
        base[k] = Number.isFinite(n) ? n : 0;
      });
      return base;
    });
  }, [selectedTable, selectedColumns]);

  const previewSeriesKeys = useMemo(() => {
    if (!selectedTable) return [];
    const selectedNumeric = selectedColumns.filter((k) => selectedTable.columns.some((c) => c.name === k && c.type === "number"));
    const tableNumeric = selectedTable.columns.filter((c) => c.type === "number").map((c) => c.name);

    if (widget?.config?.series?.length) {
      const configured = widget.config.series
        .map((s) => s.key)
        .filter((k) => selectedTable.columns.some((c) => c.name === k && c.type === "number"));
      if (configured.length > 0) {
        return configured;
      }
      // 위젯 series key와 테이블 컬럼명이 다를 때, 선택된 숫자 컬럼으로 자동 폴백
      if (selectedNumeric.length > 0) {
        return selectedNumeric.slice(0, Math.max(1, Math.min(3, widget.config.series.length)));
      }
      return tableNumeric.slice(0, Math.max(1, Math.min(3, widget.config.series.length)));
    }

    return selectedNumeric.length > 0 ? selectedNumeric : tableNumeric.slice(0, 3);
  }, [selectedTable, selectedColumns, widget]);

  const previewColors = ["var(--primary-color)", "var(--secondary-color)", "var(--info)", "var(--premium-start)"];

  const previewWidget = useMemo<Widget>(() => {
    const fallbackType = ((widgetType as WidgetType) || WidgetType.SUMMARY) as WidgetType;
    const base =
      widget ??
      ({
        id: "db-preview-widget",
        type: fallbackType,
        title: widgetTitle || "Selected Widget",
        config: {
          xAxisKey: "name",
          yAxisKey: "value",
          series: [{ key: "value", label: "value", color: "var(--primary-color)" }],
          showLegend: true,
          showGrid: true,
          showXAxis: true,
          showYAxis: true,
          showUnit: false,
          showUnitInLegend: false,
          showLabels: true,
          unit: "",
        },
        data: [],
        colSpan: 4,
        rowSpan: 3,
      } as Widget);

    const previewType = (base.type || fallbackType) as WidgetType;
    const isChartWidget = String(previewType).includes("CHART");
    const labelKey = "name";
    const previewSeries = (base.config.series?.length ? base.config.series : [{ key: "value", label: "value" }]).map((s, idx) => {
      const matched = previewSeriesKeys.find((k) => k === s.key);
      const mappedKey = matched || previewSeriesKeys[idx] || previewSeriesKeys[0] || "value";
      return {
        ...s,
        key: mappedKey,
        color: s.color || previewColors[idx % previewColors.length],
      };
    });

    const hasSeriesData = previewSeriesKeys.length > 0 && previewRows.length > 0;
    const dataForPreview = hasSeriesData ? previewRows : [{ name: "No Data", value: 0 }];
    const mainFromData = hasSeriesData ? String(dataForPreview[0]?.[previewSeries[0]?.key || "value"] ?? "-") : "-";

    return {
      ...base,
      id: `${base.id}-db-preview`,
      type: previewType,
      title: base.title || widgetTitle || "Selected Widget",
      config: {
        ...base.config,
        xAxisKey: labelKey,
        yAxisKey: previewSeries[0]?.key || base.config.yAxisKey,
        series: previewSeries,
      },
      data: dataForPreview,
      mainValue: isChartWidget ? base.mainValue : mainFromData,
      subValue: base.subValue ?? `Source: ${selectedTableId}`,
    };
  }, [previewRows, previewSeriesKeys, previewColors, selectedTableId, widget, widgetTitle, widgetType]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal((
    <div className="fixed inset-0 z-[var(--widget-picker-z-index)] flex items-center justify-center p-4">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--export-overlay-backdrop-bg)",
          backdropFilter: `blur(var(--export-overlay-backdrop-blur))`,
          WebkitBackdropFilter: `blur(var(--export-overlay-backdrop-blur))`,
        }}
        onClick={onClose}
      />

      <div
        className="relative w-full overflow-hidden border flex flex-col"
        style={{
          width: "calc(100vw - var(--spacing-xl) * 2)",
          height: "calc(100vh - var(--spacing-xl) * 2)",
          maxWidth: "1600px",
          maxHeight: "960px",
          borderRadius: "var(--radius-modal)",
          backgroundColor: "var(--modal-bg)",
          borderColor: "var(--modal-border)",
          boxShadow: "var(--modal-shadow)",
        }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--modal-border)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border"
              style={{ backgroundColor: "var(--widget-picker-icon-bg)", borderColor: "var(--widget-picker-icon-border)" }}
            >
              <Database className="w-5 h-5" style={{ color: "var(--primary-color)" }} />
            </div>
            <div>
              <div className="font-black uppercase tracking-widest" style={{ fontSize: "var(--text-small)" }}>
                DB SERVICE EXPLORER
              </div>
              <div className="font-bold" style={{ fontSize: "var(--text-micro)", color: "var(--modal-subtext)" }}>
                MOCK UI (연결은 추후)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: "transparent" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--widget-picker-close-hover-bg)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <X className="w-5 h-5" style={{ color: "var(--text-muted)" }} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <div ref={containerRef} className="relative h-full px-10 py-10">
            <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 0 }}>
              {lines.map((l, idx) => {
                const dx = l.end.x - l.start.x;
                const c1x = l.start.x + dx / 2;
                const c2x = l.start.x + dx / 2;
                const d = `M ${l.start.x} ${l.start.y} C ${c1x} ${l.start.y}, ${c2x} ${l.end.y}, ${l.end.x} ${l.end.y}`;
                return (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={l.active ? "var(--overlay-text-dim)" : "var(--border-muted)"}
                    strokeWidth={l.active ? 1.5 : 1}
                    opacity={l.active ? 1 : 0.6}
                  />
                );
              })}
            </svg>

            <div className="relative z-10 flex items-start justify-between gap-8 h-full">
              {MOCK_COLUMNS.map((col) => (
                <div key={col.id} className="flex flex-col" style={{ width: col.id === "connections" ? "12rem" : "18rem" }}>
                  <div className="flex items-center justify-between px-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="font-black uppercase tracking-widest" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                        {col.title}
                      </div>
                      <div
                        className="flex items-center gap-1 px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: "color-mix(in srgb, var(--surface-muted) 40%, transparent)",
                          borderColor: "var(--border-base)",
                        }}
                      >
                        <span className="font-bold" style={{ fontSize: "var(--text-micro)", color: "var(--text-secondary)" }}>
                          {col.count}
                        </span>
                        <ChevronDown className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6">
                    {col.nodes.map((node) => {
                      const meta = NODE_TYPE_META[node.type];
                      const active = activeChain.includes(node.id);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={node.id}
                          id={`db-explorer-node-${node.id}`}
                          onMouseEnter={() => setHoveredId(node.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => {
                            setHoveredId(node.id);
                            if (node.type === "table") {
                              setSelectedTableId(node.id);
                            }
                          }}
                          className="flex items-center p-3 rounded-xl transition-colors border"
                          style={{
                            cursor: "pointer",
                            backgroundColor: active ? "var(--surface)" : "transparent",
                            borderColor: active ? "var(--widget-picker-pill-border-active)" : "transparent",
                            boxShadow: active ? "var(--shadow-premium)" : "none",
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: active ? meta.activeBg : meta.idleBg,
                              color: active ? meta.activeFg : meta.idleFg,
                            }}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="ml-3 min-w-0 flex-1">
                            <div
                              className="font-bold truncate"
                              style={{ fontSize: "var(--text-small)", color: active ? "var(--text-main)" : "var(--text-secondary)" }}
                            >
                              {node.name}
                            </div>
                            <div className="font-bold" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                              {node.status}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4" style={{ color: active ? "var(--primary-color)" : "var(--text-muted)" }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: "var(--modal-border)", backgroundColor: "color-mix(in srgb, var(--surface-muted) 30%, transparent)" }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border-base)", backgroundColor: "var(--surface)" }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--border-base)" }}>
                <div>
                  <div className="font-black uppercase tracking-widest" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                    Selected Table
                  </div>
                  <div className="font-bold" style={{ fontSize: "var(--text-small)", color: "var(--text-main)" }}>
                    {selectedTableId}
                  </div>
                </div>
                <span className="font-bold" style={{ fontSize: "var(--text-micro)", color: "var(--text-secondary)" }}>
                  {singleNumericMeasure
                    ? "숫자형 컬럼 1개만 연결 (행 라벨 + 수치)"
                    : allowOnlyNumeric
                      ? "숫자형 컬럼만 선택 가능"
                      : "모든 컬럼 선택 가능"}
                </span>
              </div>
              <div className="overflow-auto" style={{ maxHeight: "220px" }}>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left px-3 py-2" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>컬럼</th>
                      <th className="text-left px-3 py-2" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>타입</th>
                      <th className="text-left px-3 py-2" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>사용</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTable?.columns ?? []).map((c) => {
                      const enabled = allowOnlyNumeric ? c.type === "number" : true;
                      const checked = selectedColumns.includes(c.name);
                      return (
                        <tr key={c.name} style={{ borderTop: "1px solid var(--border-muted)" }}>
                          <td className="px-3 py-2" style={{ fontSize: "var(--text-small)" }}>{c.name}</td>
                          <td className="px-3 py-2" style={{ fontSize: "var(--text-small)", color: "var(--text-secondary)" }}>{c.type}</td>
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={!enabled}
                              onChange={() => {
                                if (!enabled) return;
                                setSelectedColumns((prev) => {
                                  if (prev.includes(c.name)) {
                                    return prev.filter((k) => k !== c.name);
                                  }
                                  if (singleNumericMeasure) {
                                    return [c.name];
                                  }
                                  return [...prev, c.name];
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 border-t" style={{ borderColor: "var(--border-base)" }}>
                <div className="font-bold mb-1" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>샘플 데이터</div>
                <div className="overflow-auto" style={{ maxHeight: "120px" }}>
                  <table className="w-full">
                    <tbody>
                      {tableRowsToShow.map((r, idx) => (
                        <tr key={idx} style={{ borderTop: "1px solid var(--border-muted)" }}>
                          {tableColumnsToShow.map((col) => (
                            <td key={col.name} className="px-2 py-1" style={{ fontSize: "var(--text-micro)" }}>
                              {String(r[col.name] ?? "-")}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="rounded-xl border p-4 flex flex-col" style={{ borderColor: "var(--border-base)", backgroundColor: "var(--surface)" }}>
              <div className="font-black uppercase tracking-widest mb-3" style={{ fontSize: "var(--text-micro)", color: "var(--text-muted)" }}>
                예상 위젯 적용 미리보기
              </div>
              <div className="rounded-xl border p-3 flex-1 min-h-0" style={{ borderColor: "var(--project-picker-row-active-border)", backgroundColor: "var(--project-picker-row-active-bg)" }}>
                <Suspense
                  fallback={
                    <div className="h-full rounded-lg border flex items-center justify-center" style={{ borderColor: "var(--border-base)" }}>
                      <span style={{ fontSize: "var(--text-small)", color: "var(--text-muted)" }}>Loading widget preview...</span>
                    </div>
                  }
                >
                  <div className="h-[320px]">
                    <WidgetCardPreview
                      widget={previewWidget}
                      theme={
                        theme ?? {
                          primaryColor: "var(--primary-color)",
                          backgroundColor: "var(--bg-main)",
                          surfaceColor: "var(--surface)",
                          mode: "dark" as const,
                          chartLibrary: "recharts" as const,
                          borderRadius: 12,
                          chartRadius: 8,
                          borderWidth: 1,
                          borderColor: "var(--border-base)",
                          spacing: 12,
                          dashboardPadding: 16,
                          titleSize: 18,
                          titleWeight: "700",
                          contentSize: 14,
                          textTiny: 10,
                          textSmall: 12,
                          textMd: 14,
                          textLg: 18,
                          textHero: 36,
                          cardShadow: "var(--shadow-base)",
                          titleColor: "var(--text-main)",
                          textColor: "var(--text-muted)",
                        }
                      }
                      isEditMode={false}
                      isPreviewMode={true}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      onOpenExcel={() => {}}
                      onUpdate={() => {}}
                      userRole="user"
                    />
                  </div>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ), document.body);
}

