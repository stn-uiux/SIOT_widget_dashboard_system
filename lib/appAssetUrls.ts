/**
 * Bundled static asset URLs (Vite resolves relative to this file — keep paths in sync with /assets).
 */

export const STN_LOGO_LIGHT_SRC = new URL("../assets/logo-b-1 1.png", import.meta.url).href;
export const STN_LOGO_DARK_SRC = new URL("../assets/logo-w-1 1.png", import.meta.url).href;

/** Onboarding / “샘플 프로젝트 4개로 리셋” ZIP 순서 */
export const BUNDLED_SAMPLE_PROJECT_ZIP_URLS: readonly string[] = [
  new URL("../assets/New_Project_1_2026-04-08.zip", import.meta.url).href,
  new URL("../assets/new_project_2_2026-04-08.zip", import.meta.url).href,
  new URL("../assets/New_Project_3_2026-04-08.zip", import.meta.url).href,
  new URL("../assets/New_Project_4_2026-04-09.zip", import.meta.url).href,
];
