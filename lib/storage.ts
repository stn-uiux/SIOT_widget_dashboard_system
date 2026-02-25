/**
 * storage.ts — IndexedDB 기반 프로젝트 저장소
 *
 * localStorage (5 MB)를 대신하여 IndexedDB (수백 MB+)를 사용합니다.
 * 서버 불필요 — 브라우저 내장 DB입니다.
 *
 * API:
 *   await dbSave(key, value)  — 저장
 *   await dbLoad<T>(key)      — 불러오기 (없으면 null)
 *   await dbDelete(key)       — 삭제
 */

const DB_NAME = "siot_dashboard_db";
const DB_VERSION = 1;
const STORE_NAME = "kv";

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
                console.error("[SIOT] IndexedDB write error:", tx.error);
                db.close();
                resolve(false);
            };
        });
    } catch (e) {
        console.error("[SIOT] IndexedDB open error:", e);
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
