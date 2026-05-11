import React, { useEffect, useRef } from "react";
import LoadingScreen from "./LoadingScreen";

const DB_NAME = "siot_dashboard_db";

/**
 * URL `?reset=true` 전용: localStorage + IndexedDB 대시보드 DB를 비우고 쿼리 없이 같은 경로로 이동.
 * App 밖에서 마운트해 조건부 훅 호출을 피합니다.
 */
const QueryStorageReset: React.FC = () => {
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const run = () => {
      try {
        localStorage.clear();
      } catch {
        /* ignore */
      }
      const req = indexedDB.deleteDatabase(DB_NAME);
      const go = () => {
        window.location.href = window.location.pathname;
      };
      req.onsuccess = go;
      req.onerror = go;
      req.onblocked = go;
    };

    run();
  }, []);

  return <LoadingScreen message="Resetting System..." />;
};

export default QueryStorageReset;
