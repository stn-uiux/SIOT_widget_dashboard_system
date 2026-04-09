/**
 * 프로젝트 내보내기/불러오기 — ZIP (manifest.json + 이미지 + 미리보기)
 */
import JSZip from "jszip";
import type { Project, LayoutConfig, HeaderConfig } from "../types";

const MANIFEST_FILENAME = "manifest.json";
const PREVIEW_FILENAME = "preview.png";
const IMAGES_DIR = "images";

type LayoutItemExport = { i: string; x: number; y: number; w: number; h: number };

export interface ExportManifest {
  version: number;
  exportedAt: string;
  project: Project;
  /** pageId -> LayoutItem[] | pageId -> { lg, md, ... } */
  layoutPositions: Record<string, LayoutItemExport[] | Record<string, LayoutItemExport[]>>;
  /** 이미지 URL을 ZIP 내 파일명으로 매핑 (manifest 내에서는 이 키로 참조) */
  imageMap: Record<string, string>;
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const res = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!res) return null;
    const mime = res[1];
    const bin = atob(res[2]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch {
    return null;
  }
}

async function urlToBlob(url: string): Promise<Blob | null> {
  if (url.startsWith("data:")) return dataUrlToBlob(url);
  try {
    const r = await fetch(url, { mode: "cors" });
    if (!r.ok) return null;
    return await r.blob();
  } catch {
    return null;
  }
}

function getExtensionFromMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
}

/** 프로젝트/페이지/헤더 등 전체 객체에서 이미지 (Data URL 또는 이미지 경로) 수집 */
function collectImageUrls(project: Project): string[] {
  const set = new Set<string>();
  const list: string[] = [];
  
  function scan(obj: any) {
    if (!obj || typeof obj !== "object") {
      if (typeof obj === "string" && (obj.startsWith("data:image") || obj.startsWith("images/"))) {
        if (!set.has(obj)) {
          set.add(obj);
          list.push(obj);
        }
      }
      return;
    }
    
    if (Array.isArray(obj)) {
      obj.forEach(scan);
    } else {
      for (const key in obj) {
        // 배경 이미지, 로고, 아이콘 등 이미지 관련 키 명시적 체크 (권장) + 일반 문자열 스캔
        const val = obj[key];
        if (typeof val === "string") {
          if (val.startsWith("data:image") || val.startsWith("blob:") || (typeof val === 'string' && val.includes('base64'))) {
            if (!set.has(val)) {
              set.add(val);
              list.push(val);
            }
          }
        } else if (typeof val === "object") {
          scan(val);
        }
      }
    }
  }

  scan(project);
  return list;
}

/** 객체 내 이미지 URL을 파일 참조 키로 치환하고, blob 목록 반환 */
async function cloneProjectAndCollectImages(
  project: Project,
  layoutPositions: Record<string, LayoutItemExport[] | Record<string, LayoutItemExport[]>>
): Promise<{ manifest: ExportManifest; imageEntries: { key: string; blob: Blob }[] }> {
  const imageUrls = collectImageUrls(project);
  const imageMap: Record<string, string> = {};
  const imageEntries: { key: string; blob: Blob }[] = [];
  let idx = 0;
  for (const url of imageUrls) {
    const blob = await urlToBlob(url);
    if (!blob) continue;
    const ext = getExtensionFromMime(blob.type);
    const key = `${IMAGES_DIR}/img_${idx}.${ext}`;
    imageMap[url] = key;
    imageEntries.push({ key, blob });
    idx++;
  }

  function replaceUrl(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === "string") {
      return imageMap[obj] ?? obj;
    }
    if (Array.isArray(obj)) return obj.map(replaceUrl);
    if (typeof obj === "object") {
      const out: Record<string, any> = {};
      for (const key in obj) {
        out[key] = replaceUrl(obj[key]);
      }
      return out;
    }
    return obj;
  }

  const clonedProject = replaceUrl(JSON.parse(JSON.stringify(project))) as Project;
  const manifest: ExportManifest = {
    version: 1,
    exportedAt: new Date().toISOString(),
    project: clonedProject,
    layoutPositions: JSON.parse(JSON.stringify(layoutPositions)),
    // Remove imageMap from manifest as it is not used in import and leads to large file sizes
  } as any;

  return { manifest, imageEntries };
}

/** ZIP 생성 후 다운로드 */
export async function exportProjectToZip(
  project: Project,
  layoutPositions: Record<string, LayoutItemExport[] | Record<string, LayoutItemExport[]>>,
  previewBlob: Blob | null
): Promise<void> {
  const { manifest, imageEntries } = await cloneProjectAndCollectImages(project, layoutPositions);
  const zip = new JSZip();
  zip.file(MANIFEST_FILENAME, JSON.stringify(manifest, null, 2), { binary: false });
  for (const { key, blob } of imageEntries) {
    zip.file(key, blob, { binary: true });
  }
  if (previewBlob) {
    zip.file(PREVIEW_FILENAME, previewBlob, { binary: true });
  }
  const blob = await zip.generateAsync({ type: "blob" });
  const safeName = project.name.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
  const today = new Date().toISOString().slice(0, 10);
  const name = `${safeName}_${today}.zip`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/** ZIP 파일 파싱 후 프로젝트 + 레이아웃 + 이미지 URL 복원 */
export async function importProjectFromZip(
  file: File
): Promise<{ project: Project; layoutPositions: Record<string, LayoutItemExport[] | Record<string, LayoutItemExport[]>> }> {
  const zip = await JSZip.loadAsync(file);
  const manifestRaw = await zip.file(MANIFEST_FILENAME)?.async("string");
  if (!manifestRaw) throw new Error("ZIP에 manifest.json이 없습니다.");
  const manifest = JSON.parse(manifestRaw) as ExportManifest;
  if (!manifest.project || !manifest.layoutPositions) throw new Error("manifest 형식이 올바르지 않습니다.");

  const urlByKey: Record<string, string> = {};
  const files = zip.files;
  for (const path of Object.keys(files)) {
    if (files[path].dir || (!path.startsWith(IMAGES_DIR + "/") && path !== PREVIEW_FILENAME)) continue;
    const entry = files[path];
    const blob = await entry.async("blob");
    // URL.createObjectURL is temporary and breaks on refresh. Use DataUrl for persistence in storage.
    urlByKey[path] = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  function resolveRef(val: unknown): unknown {
    if (typeof val === "string" && (val.startsWith(IMAGES_DIR + "/") || val === PREVIEW_FILENAME)) {
      return urlByKey[val] ?? val;
    }
    if (Array.isArray(val)) return val.map(resolveRef);
    if (val !== null && typeof val === "object") {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) out[k] = resolveRef(v);
      return out;
    }
    return val;
  }

  const project = resolveRef(manifest.project) as Project;
  const layoutPositions = manifest.layoutPositions;
  return { project, layoutPositions };
}
