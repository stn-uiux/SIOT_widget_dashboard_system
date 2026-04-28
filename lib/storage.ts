/**
 * storage.ts — IndexedDB 및 LocalStorage 기반 프로젝트 저장소
 */
import { Project, LayoutStore, ThemePreset, DashboardTheme, ThemeMode, DashboardPage } from "../types";
import { DEFAULT_THEME, DEFAULT_PAGE, DEFAULT_HEADER, INITIAL_PROJECT_LIST } from "../constants";

const DB_NAME = "siot_dashboard_db";
const DB_VERSION = 1;
const STORE_NAME = "kv";

export const PROJECTS_STORAGE_KEY = "siot_dashboard_projects";
export const LAYOUT_STORAGE_KEY = "siot_dashboard_layouts";
export const PRESETS_STORAGE_KEY = "siot_theme_presets";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

export async function dbSave(key: string, value: unknown): Promise<boolean> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readwrite");
            const store = tx.objectStore(STORE_NAME);
            store.put(value, key);
            tx.oncomplete = () => { db.close(); resolve(true); };
            tx.onerror = () => {
                console.error("[STN] IndexedDB write error:", tx.error);
                db.close();
                resolve(false);
            };
        });
    } catch (e) {
        console.error("[STN] IndexedDB open error:", e);
        return false;
    }
}

export async function dbLoad<T = unknown>(key: string): Promise<T | null> {
    try {
        const db = await openDB();
        return new Promise((resolve) => {
            const tx = db.transaction(STORE_NAME, "readonly");
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(key);
            req.onsuccess = () => { db.close(); resolve((req.result as T) ?? null); };
            req.onerror = () => { db.close(); resolve(null); };
        });
    } catch {
        return null;
    }
}

export async function dbDelete(key: string): Promise<void> {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete(key);
        tx.oncomplete = () => db.close();
    } catch { /* ignore */ }
}

// --- High-level storage helpers ---

export type ProjectsState = { projects: Project[]; activeProjectId: string };

export function saveLayoutStore(layoutStore: LayoutStore) {
    dbSave(LAYOUT_STORAGE_KEY, layoutStore);
    try {
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutStore));
    } catch (e) {
        console.error("Failed to save layout store to localStorage", e);
    }
}

export function loadLayoutStoreSync(): LayoutStore {
    try {
        const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export async function saveProjectsState(projects: Project[], activeProjectId: string): Promise<boolean> {
    const ok = await dbSave(PROJECTS_STORAGE_KEY, { projects, activeProjectId });
    try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify({ projects, activeProjectId }));
    } catch { /* ignore quota */ }
    return ok;
}

export function savePresets(presets: ThemePreset[]) {
    try {
        localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
        console.error("Failed to save presets", e);
    }
}

export function loadPresetsSync(fallback: ThemePreset[]): ThemePreset[] {
    try {
        const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

/** 저장된 프로젝트 데이터를 현재 스키마에 맞춰 보정하고 테마 설정을 검증 (Self-Healing 포함) */
export function migrateProjects(projects: Project[]): Project[] {
    if (!Array.isArray(projects)) return [];

    return projects.map((p) => {
        // 1. 테마 보정 및 자가 치유
        let theme = { ...DEFAULT_THEME, ...(p.theme || {}) };

        // 테마 자가 교정: 배경색이 밝거나 모드가 라이트인 경우 강제로 다크 모드 동기화
        const isLightBackground = theme.backgroundColor && (theme.backgroundColor.toLowerCase() === '#f8fafc' || theme.backgroundColor.toLowerCase() === '#ffffff');
        if (theme.mode === ThemeMode.LIGHT || isLightBackground) {
            console.log(`[STN] Theme mismatch detected for project ${p.id}. Forcing Dark Mode.`);
            theme = {
                ...theme,
                name: "Dark Mode",
                mode: ThemeMode.DARK,
                backgroundColor: '#020617',
                surfaceColor: '#0f172a',
                titleColor: '#f8fafc',
                textColor: '#94a3b8'
            };
        }

        // 2. 페이지 및 헤더 마이그레이션
        const mappedPages = (p.pages || []).map((pg) => {
            const mergedHeader = { ...DEFAULT_HEADER, ...(pg.header || {}) };
            // 배경색이 레거시 변수 형태면 투명으로 교정
            if (mergedHeader.backgroundColor === 'var(--background)') {
                mergedHeader.backgroundColor = 'transparent';
            }
            return {
                ...pg,
                layout: { ...DEFAULT_PAGE.layout, ...(pg.layout || {}) },
                header: mergedHeader,
            };
        });

        const pages = mappedPages.length > 0
            ? mappedPages
            : [{ ...DEFAULT_PAGE, id: "page_1", name: "Main Page" }];

        const activePageId = p.activePageId && pages.some((pg) => pg.id === p.activePageId)
            ? p.activePageId
            : pages[0].id;

        return {
            ...p,
            theme,
            pages,
            activePageId,
        };
    });
}

/** 동기 로드 — 앱 최초 렌더 시 localStorage에서 불러옴 */
export function loadProjectsStateSync(initial: Project[]): ProjectsState {
    try {
        const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
        if (!raw) return { projects: migrateProjects(initial), activeProjectId: initial[0]?.id ?? "project_1" };
        const parsed = JSON.parse(raw) as ProjectsState;

        const projects = migrateProjects(parsed.projects || initial);
        const activeProjectId = (parsed.activeProjectId && projects.some(p => p.id === parsed.activeProjectId))
            ? parsed.activeProjectId
            : (projects[0]?.id ?? "project_1");

        return { projects, activeProjectId };
    } catch {
        return { projects: migrateProjects(initial), activeProjectId: initial[0]?.id ?? "project_1" };
    }
}

let _cachedProjectsState: ProjectsState | null = null;
export function getInitialProjectsState(): ProjectsState {
    // 항상 최신 localStorage에서 읽음 (HMR 시 캐시로 인한 오래된 값 사용 방지)
    if (!_cachedProjectsState) {
        _cachedProjectsState = loadProjectsStateSync(INITIAL_PROJECT_LIST);
    }
    return _cachedProjectsState;
}

// HMR(핫 리로드) 또는 재시작 시 캐시 초기화 (항상 최신 localStorage 반영)
if (typeof (import.meta as any).hot !== 'undefined') {
    (import.meta as any).hot.on('vite:beforeUpdate', () => {
        _cachedProjectsState = null;
    });
}
