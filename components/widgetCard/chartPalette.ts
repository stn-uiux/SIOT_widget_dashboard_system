/**
 * 차트 색 순환 목록 — UI 색상은 CSS 변수(디자인 토큰)만 참조합니다.
 */

export const PIE_COLORS = [
  'var(--primary-color)',
  'var(--secondary-color)',
  'var(--success)',
  'var(--warning)',
  'var(--purple-500)',
  'var(--pink-500)',
  'var(--red-500)',
] as const;

/** 헤더·차트 공통 좌 패딩(0): 카드 콘텐츠 좌측과 정렬 */
export const CHART_LEFT_INSET = 0;
