/**
 * 순수 차트 색 처리 유틸 — design-tokens.json을 폴백 소스로 사용 (코드 내 헥스 하드코딩 금지).
 */
import designTokens from '../../design-tokens.json';
import type { ChartSeries } from '../../types';

const TOKEN_PRIMARY_HEX = designTokens.tokens.colors.brand.primary.value as string;
const TOKEN_SEMANTIC_MUTED_HEX_LIGHT = designTokens.tokens.colors.semantic.light.text_muted
  .value as string;

export function chartPrimaryFallbackHex(): string {
  return TOKEN_PRIMARY_HEX;
}

export function chartMutedFallbackHex(): string {
  return TOKEN_SEMANTIC_MUTED_HEX_LIGHT;
}

/** amCharts 숫자 색 폴백 (토큰 text_muted light → RGB 정수) */
export function am5MutedFallbackRgb(): number {
  return Number.parseInt(TOKEN_SEMANTIC_MUTED_HEX_LIGHT.replace(/^#/, ''), 16);
}

export function shadeColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let R = Number.parseInt(hex.slice(1, 3), 16);
  let G = Number.parseInt(hex.slice(3, 5), 16);
  let B = Number.parseInt(hex.slice(5, 7), 16);
  R = Math.min(255, Math.max(0, Math.floor(R * ((100 + percent) / 100))));
  G = Math.min(255, Math.max(0, Math.floor(G * ((100 + percent) / 100))));
  B = Math.min(255, Math.max(0, Math.floor(B * ((100 + percent) / 100))));
  return `#${[R, G, B].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

export function resolveColor(
  colorStr: string | undefined,
  fallback: string,
  primaryHex?: string,
): string {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.match(/var\(([^)]+)\)/)?.[1]?.trim();
    if (varName && primaryHex && primaryHex.startsWith('#')) {
      if (varName === '--primary-color') return primaryHex;
      const primaryShade = varName.match(/^--primary-(\d+)$/)?.[1];
      if (primaryShade) {
        const step = Number.parseInt(primaryShade, 10);
        return shadeColor(primaryHex, (step - 50) * -1.5);
      }
    }
    if (varName && typeof document !== 'undefined') {
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return val || fallback;
    }
  }
  return colorStr;
}

export function getSeriesModeColors(series: ChartSeries, isDarkMode: boolean) {
  const color = isDarkMode ? (series.colorDark ?? series.color) : (series.colorLight ?? series.color);
  const endColor = isDarkMode
    ? (series.endColorDark ?? series.endColor)
    : (series.endColorLight ?? series.endColor);
  return { color, endColor };
}

export function parseToHex(colorStr: string, primaryHex: string = TOKEN_PRIMARY_HEX): string {
  if (!colorStr) return TOKEN_SEMANTIC_MUTED_HEX_LIGHT;
  if (colorStr.startsWith('#')) return colorStr;

  try {
    if (typeof document !== 'undefined' && colorStr.startsWith('var(')) {
      const varName = colorStr.replace('var(', '').replace(')', '').trim();
      const style = getComputedStyle(document.documentElement);
      const val = style.getPropertyValue(varName).trim();
      if (val) return parseToHex(val, primaryHex);
    }

    if (colorStr.startsWith('rgb')) {
      const vals = colorStr.match(/\d+/g);
      if (vals && vals.length >= 3) {
        const r = Number.parseInt(vals[0], 10).toString(16).padStart(2, '0');
        const g = Number.parseInt(vals[1], 10).toString(16).padStart(2, '0');
        const b = Number.parseInt(vals[2], 10).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
      }
    }
  } catch (e) {
    console.error('parseToHex failed', e);
  }

  return colorStr.includes('primary') ? primaryHex : TOKEN_SEMANTIC_MUTED_HEX_LIGHT;
}

export function getGradientEndColor(
  startColor: string,
  endColorRaw: string | undefined,
  isDarkMode: boolean,
): string {
  if (endColorRaw) return parseToHex(endColorRaw);
  const base = parseToHex(startColor);
  return shadeColor(base, isDarkMode ? 22 : -22);
}
