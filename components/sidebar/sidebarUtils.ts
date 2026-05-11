import { ChartSeries, ThemeMode } from '../../types';

/** 루트 CSS 변수(px) 해석 — arbitrary 숫자 하드코딩 대신 변수 계산용 */
export function readCssLengthPx(cssVarName: string, fallbackPx: number): number {
  if (typeof document === 'undefined') return fallbackPx;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : fallbackPx;
}

export function computeWidgetPreviewPopoverPosition(rect: DOMRect): { top: number; left: number } {
  const gap = readCssLengthPx('--spacing-sm', 8);
  const popoverW = readCssLengthPx('--widget-settings-preview-popover-width', 168);
  const thumbMax = readCssLengthPx('--widget-settings-preview-thumb-max-height', 132);
  const estH =
    thumbMax + readCssLengthPx('--spacing-xl', 24) + readCssLengthPx('--spacing-md', 16) + gap * 4;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 720;

  let left = rect.right + gap;
  if (left + popoverW > vw - gap) {
    left = Math.max(gap, rect.left - popoverW - gap);
  }
  if (left < gap) left = gap;

  let top = rect.top;
  if (top + estH > vh - gap) {
    top = Math.max(gap, vh - estH - gap);
  }
  if (top < gap) top = gap;

  return { top, left };
}

export function shadeColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let R = parseInt(hex.slice(1, 3), 16);
  let G = parseInt(hex.slice(3, 5), 16);
  let B = parseInt(hex.slice(5, 7), 16);
  R = Math.min(255, Math.max(0, Math.floor(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, Math.floor(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, Math.floor(B * (100 + percent) / 100)));
  return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
}

export const resolveColor = (colorStr: string | undefined, fallback: string, primaryHex?: string) => {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.match(/var\(([^)]+)\)/)?.[1]?.trim();
    if (varName && primaryHex && primaryHex.startsWith('#')) {
      if (varName === '--primary-color') return primaryHex;
      const primaryShade = varName.match(/^--primary-(\d+)$/)?.[1];
      if (primaryShade) {
        const step = parseInt(primaryShade, 10);
        return shadeColor(primaryHex, (step - 50) * -1.5);
      }
    }
    return primaryHex || fallback;
  }
  return colorStr;
};

export const getSeriesColorsForMode = (series: ChartSeries, mode: ThemeMode) => {
  const isDark = mode === ThemeMode.DARK;
  const color = isDark ? (series.colorDark ?? series.color) : (series.colorLight ?? series.color);
  const endColor = isDark ? (series.endColorDark ?? series.endColor) : (series.endColorLight ?? series.endColor);
  return { color, endColor };
};
