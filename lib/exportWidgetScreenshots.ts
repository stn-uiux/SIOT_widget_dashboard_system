/**
 * 대시보드 그리드 위젯 루트([data-widget-id])마다 PNG 캡처 후 ZIP으로 묶습니다.
 */
import JSZip from "jszip";

export type WidgetCaptureMeta = { id: string; title: string; type?: string };

function escapeAttr(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function sanitizeFilenamePart(raw: string): string {
  const trimmed = raw
    .replace(/[^\p{L}\p{N}\s\-_()]/gu, "")
    .replace(/\s+/g, "_")
    .slice(0, 72);
  return trimmed || "widget";
}

const TYPE_FILENAME_SLUG: Record<string, string> = {
  CHART_BAR: "bar_graph",
  CHART_BAR_HORIZONTAL: "bar_horizontal_graph",
  CHART_LINE: "line_graph",
  CHART_AREA: "area_graph",
  CHART_PIE: "pie_chart",
  CHART_RADAR: "radar_chart",
  CHART_COMPOSED: "composed_chart",
  CHART_SANKEY: "sankey_diagram",
  SUMMARY: "stat_summary",
  SUMMARY_CHART: "trend_summary",
  DASH_FAILURE_STATUS: "failure_status_kpi",
  DASH_NET_TRAFFIC: "network_traffic",
  DASH_SECURITY_STATUS: "security_status_v1",
  DASH_SECURITY_STATUS_V2: "security_status_v2",
  DASH_RESOURCE_USAGE: "resource_usage",
  DASH_FACILITY_1: "facility_type1",
  DASH_FACILITY_2: "facility_type2",
  DASH_FACILITY_2_FIGMA: "facility_type3",
  DASH_RANK_LIST: "rank_list",
  DASH_TRAFFIC_TOP5: "traffic_top5",
  DASH_VDI_STATUS: "vdi_status",
  DASH_EQUIP_PERF_TOP5: "equip_perf_top5",
  TABLE: "data_table",
  IMAGE: "image_box",
  MAP: "map_widget",
  WEATHER: "weather_info",
  GENERAL_KPI: "kpi_general",
  EARNING_PROGRESS: "earning_progress",
  EARNING_TREND: "earning_trend",
  TEXT_BLOCK: "text_block",
  VERTICAL_NAV_CARD: "vertical_nav_card",
};

const TYPE_CATEGORY_DIR: Record<string, "graph" | "premium" | "general"> = {
  CHART_BAR: "graph",
  CHART_BAR_HORIZONTAL: "graph",
  CHART_LINE: "graph",
  CHART_AREA: "graph",
  CHART_PIE: "graph",
  CHART_RADAR: "graph",
  CHART_COMPOSED: "graph",
  CHART_SANKEY: "graph",
  DASH_EQUIP_PERF_TOP5: "graph",

  SUMMARY: "premium",
  SUMMARY_CHART: "premium",
  DASH_FAILURE_STATUS: "premium",
  DASH_NET_TRAFFIC: "premium",
  DASH_SECURITY_STATUS: "premium",
  DASH_SECURITY_STATUS_V2: "premium",
  DASH_RESOURCE_USAGE: "premium",
  DASH_FACILITY_1: "premium",
  DASH_FACILITY_2: "premium",
  DASH_FACILITY_2_FIGMA: "premium",
  DASH_RANK_LIST: "premium",
  DASH_TRAFFIC_TOP5: "premium",
  DASH_VDI_STATUS: "premium",

  TABLE: "general",
  IMAGE: "general",
  MAP: "general",
  WEATHER: "general",
  GENERAL_KPI: "general",
  EARNING_PROGRESS: "general",
  EARNING_TREND: "general",
  TEXT_BLOCK: "general",
  VERTICAL_NAV_CARD: "general",
};

export type WidgetCategoryDir = "graph" | "premium" | "general";

function resolveBaseFilename(meta: WidgetCaptureMeta): string {
  const byType = meta.type ? TYPE_FILENAME_SLUG[meta.type] : "";
  if (byType) return byType;
  return sanitizeFilenamePart(meta.title || "widget").toLowerCase();
}

function resolveCategoryDir(meta: WidgetCaptureMeta): WidgetCategoryDir {
  if (meta.type && TYPE_CATEGORY_DIR[meta.type]) return TYPE_CATEGORY_DIR[meta.type];
  return "general";
}

export function getWidgetCaptureFileInfo(meta: WidgetCaptureMeta, mode: "light" | "dark") {
  const category = resolveCategoryDir(meta);
  const base = resolveBaseFilename(meta);
  return {
    category,
    base,
    filename: `${base}_${mode}.png`,
    // WidgetPicker가 참조하는 정적 경로와 동일한 규칙
    previewSrc: `/assets/widget/${mode}/${category}/${base}_${mode}.png`,
  };
}

function findWidgetRoot(id: string): HTMLElement | null {
  // Prefer WidgetCard 내부 루트(차트 캔버스/SVG 포함) — grid transform 영향 최소화
  const inner = document.querySelector(`[data-widget-capture-id="${escapeAttr(id)}"]`) as HTMLElement | null;
  if (inner) return inner;
  // Fallback: grid item wrapper
  return document.querySelector(`[data-widget-id="${escapeAttr(id)}"]`) as HTMLElement | null;
}

/** html-to-image는 뷰포트 밖 노드를 검은 이미지로 뽑는 경우가 많아, 캡처 직전에 스크롤·리페인트를 강제합니다. */
function waitPaintFrames(msAfter: number): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.setTimeout(resolve, msAfter);
      });
    });
  });
}

function resolveExportBackgroundColor(): string {
  const htmlBg = getComputedStyle(document.documentElement).backgroundColor;
  const bodyBg = getComputedStyle(document.body).backgroundColor;
  for (const c of [htmlBg, bodyBg]) {
    if (c && c !== "rgba(0, 0, 0, 0)" && c !== "transparent") {
      return c;
    }
  }
  return document.documentElement.classList.contains("dark") ? "#0f172a" : "#f8fafc";
}

async function prepareWidgetNodeForCapture(el: HTMLElement): Promise<{ w: number; h: number }> {
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "auto" });
  // resize 이벤트를 매번 쏘면 차트 재계산 비용이 커집니다. 캡처 속도 우선으로 대기만 짧게 수행.
  await waitPaintFrames(120);
  const rect = el.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width));
  const h = Math.max(1, Math.round(rect.height));
  return { w, h };
}

async function fitBlobToCanvasContain(
  srcBlob: Blob,
  targetWidth: number,
  targetHeight: number,
  backgroundColor: string,
): Promise<Blob> {
  const bmp = await createImageBitmap(srcBlob);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return srcBlob;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    const scale = Math.min(targetWidth / bmp.width, targetHeight / bmp.height);
    const dw = Math.max(1, Math.round(bmp.width * scale));
    const dh = Math.max(1, Math.round(bmp.height * scale));
    const dx = Math.round((targetWidth - dw) / 2);
    const dy = Math.round((targetHeight - dh) / 2);
    ctx.drawImage(bmp, dx, dy, dw, dh);

    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    return out ?? srcBlob;
  } finally {
    bmp.close();
  }
}

export async function exportWidgetsToZip(
  widgets: WidgetCaptureMeta[],
  options?: {
    pixelRatio?: number;
    interCaptureDelayMs?: number;
    /** Output image size (px). If set, every widget exports to this size. */
    targetWidth?: number;
    targetHeight?: number;
    onProgress?: (p: { index: number; total: number; id: string; title: string }) => void;
  },
): Promise<{ zipBlob: Blob; capturedCount: number; attempted: number }> {
  const mod = await import("html-to-image");
  const pixelRatio = options?.pixelRatio ?? 1;
  const delayMs = options?.interCaptureDelayMs ?? 40;
  const backgroundColor = resolveExportBackgroundColor();
  const targetWidth = options?.targetWidth;
  const targetHeight = options?.targetHeight;

  const zip = new JSZip();
  let capturedCount = 0;
  const usedNames = new Map<string, number>();
  document.documentElement.setAttribute("data-widget-capture", "1");
  const modeSuffix = document.documentElement.classList.contains("dark") ? "dark" : "light";
  let fontCSS = "";

  // 가장 큰 병목: 위젯마다 getFontEmbedCSS 호출(반복) → 1회만 계산해 재사용
  try {
    const firstEl = widgets.length > 0 ? findWidgetRoot(widgets[0].id) : null;
    if (firstEl && (mod as any).getFontEmbedCSS) {
      fontCSS = await (mod as any).getFontEmbedCSS(firstEl);
    }
  } catch {
    fontCSS = "";
  }

  try {
    for (let i = 0; i < widgets.length; i++) {
      const w = widgets[i];
      options?.onProgress?.({ index: i, total: widgets.length, id: w.id, title: w.title });
      const el = findWidgetRoot(w.id);
      if (!el) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      try {
        const { w: nodeW, h: nodeH } = await prepareWidgetNodeForCapture(el);

        const captureOptions = {
          pixelRatio,
          cacheBust: true,
          // Material Symbols(예: verified_user, partly_cloudy) 같은 폰트 아이콘이 글자로 캡처되는 문제 방지
          skipFonts: !fontCSS,
          preferredFontFormat: "woff2" as const,
          backgroundColor,
          width: nodeW,
          height: nodeH,
          style: {
            width: `${nodeW}px`,
            height: `${nodeH}px`,
            // react-grid-layout의 transform 컨텍스트에서 일부 차트/SVG가 캡처에서 비는 문제 완화
            transform: "none",
            opacity: "1",
            visibility: "visible",
          } as Partial<CSSStyleDeclaration>,
        };
        if (fontCSS) (captureOptions as any).fontEmbedCSS = fontCSS;
        const blob = await mod.toBlob(el, captureOptions);
        if (blob && blob.size > 0) {
          const outputBlob =
            targetWidth && targetHeight
              ? await fitBlobToCanvasContain(blob, targetWidth, targetHeight, backgroundColor)
              : blob;
          const base = `${resolveBaseFilename(w)}_${modeSuffix}`;
          const count = (usedNames.get(base) ?? 0) + 1;
          usedNames.set(base, count);
          const leaf = count > 1 ? `${base}_${count}.png` : `${base}.png`;
          const name = `${resolveCategoryDir(w)}/${leaf}`;
          zip.file(name, outputBlob);
          capturedCount++;
        }
      } catch (err) {
        console.warn("[STN] widget screenshot failed:", w.id, err);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  } finally {
    document.documentElement.removeAttribute("data-widget-capture");
  }

  if (capturedCount === 0) {
    throw new Error("위젯을 캡처하지 못했습니다. 대시보드가 보이는 화면에서 다시 시도하세요.");
  }

  const zipBlob = await zip.generateAsync({ type: "blob" });
  return { zipBlob, capturedCount, attempted: widgets.length };
}
