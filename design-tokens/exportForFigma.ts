/**
 * design-tokens.json → Figma Variables 호환 JSON 생성
 * Figma 플러그인에서 이 JSON을 읽어 VariableCollection / Variable 생성 시 사용할 수 있습니다.
 * 색상: Figma는 0~1 범위의 r, g, b, a 사용.
 */
import designTokens from '../design-tokens.json';

type TokenObj = { value: string; type?: string; description?: string };

function getValue(obj: TokenObj | Record<string, TokenObj> | undefined): string {
  if (!obj) return '';
  if (obj && 'value' in obj && typeof (obj as TokenObj).value === 'string') return (obj as TokenObj).value;
  return '';
}

/** hex (#rrggbb) 또는 rgba(r,g,b,a) → Figma COLOR { r,g,b,a } (0~1) */
function parseColorToFigma(value: string): { r: number; g: number; b: number; a: number } | null {
  if (!value || typeof value !== 'string') return null;
  const v = value.trim();
  const hexMatch = v.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16) / 255,
      g: parseInt(hexMatch[2], 16) / 255,
      b: parseInt(hexMatch[3], 16) / 255,
      a: 1,
    };
  }
  const rgbaMatch = v.match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10) / 255,
      g: parseInt(rgbaMatch[2], 10) / 255,
      b: parseInt(rgbaMatch[3], 10) / 255,
      a: rgbaMatch[4] != null ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  return null;
}

/** px/rem 값에서 숫자만 추출 (Figma FLOAT로 내보낼 때 사용) */
function parseNumber(value: string): number | null {
  if (!value) return null;
  const num = parseFloat(String(value).replace(/px|rem|em/g, '').trim());
  return isNaN(num) ? null : num;
}

export interface FigmaVariableColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface FigmaVariableSpec {
  name: string;
  type: 'COLOR' | 'FLOAT' | 'STRING';
  valuesByMode: Record<string, FigmaVariableColor | number | string>;
  description?: string;
}

export interface FigmaCollectionSpec {
  name: string;
  modes: string[];
  variables: FigmaVariableSpec[];
}

export interface FigmaExportPayload {
  format: 'figma-variables-import';
  version: string;
  source: string;
  collections: FigmaCollectionSpec[];
  /** Figma 플러그인 사용 시 참고용 스크립트 예시 */
  pluginHint?: string;
}

/**
 * design-tokens.json 기준으로 Figma 변수용 JSON 생성
 */
export function buildFigmaVariablesFromTokens(): FigmaExportPayload {
  const t = (designTokens as { tokens?: Record<string, unknown> }).tokens;
  if (!t) {
    return { format: 'figma-variables-import', version: '1.0', source: 'design-tokens.json', collections: [] };
  }

  const collections: FigmaCollectionSpec[] = [];

  // 1) Semantic (Light / Dark)
  const semantic = t.colors as Record<string, Record<string, Record<string, TokenObj>>> | undefined;
  const semanticLight = semantic?.semantic?.light;
  const semanticDark = semantic?.semantic?.dark;
  if (semanticLight || semanticDark) {
    const modeNames = ['Light', 'Dark'];
    const modeKeys = ['light', 'dark'];
    const varNames = ['background', 'surface', 'text_main', 'text_secondary', 'text_muted', 'border_base', 'border_muted', 'border_strong', 'surface_elevated'];
    const variables: FigmaVariableSpec[] = [];
    for (const name of varNames) {
      const valuesByMode: Record<string, FigmaVariableColor> = {};
      modeKeys.forEach((key, i) => {
        const src = key === 'light' ? semanticLight : semanticDark;
        const val = src && getValue(src[name]);
        const figmaColor = val ? parseColorToFigma(val) : null;
        if (figmaColor) valuesByMode[modeNames[i]] = figmaColor;
      });
      if (Object.keys(valuesByMode).length > 0) {
        variables.push({ name, type: 'COLOR', valuesByMode });
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Design Tokens - Semantic', modes: modeNames, variables });
    }
  }

  // 2) Brand colors (단일 모드)
  const brand = t.colors as Record<string, Record<string, TokenObj>> | undefined;
  const brandColors = brand?.brand;
  if (brandColors && typeof brandColors === 'object') {
    const variables: FigmaVariableSpec[] = [];
    const names = ['primary', 'secondary', 'premium_start', 'premium_end'] as const;
    for (const name of names) {
      const val = getValue(brandColors[name]);
      const figmaColor = val ? parseColorToFigma(val) : null;
      if (figmaColor) {
        variables.push({ name, type: 'COLOR', valuesByMode: { Default: figmaColor } });
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Design Tokens - Brand', modes: ['Default'], variables });
    }
  }

  // 3) Status colors
  const status = brand?.status as Record<string, TokenObj> | undefined;
  if (status) {
    const variables: FigmaVariableSpec[] = [];
    for (const name of ['success', 'error', 'warning', 'info']) {
      const val = getValue(status[name]);
      const figmaColor = val ? parseColorToFigma(val) : null;
      if (figmaColor) {
        variables.push({ name, type: 'COLOR', valuesByMode: { Default: figmaColor } });
      }
    }
    if (variables.length > 0) {
      collections.push({ name: 'Design Tokens - Status', modes: ['Default'], variables });
    }
  }

  // 4) Layout (FLOAT/STRING) - 단일 모드
  const layout = t.layout as Record<string, unknown> | undefined;
  if (layout) {
    const variables: FigmaVariableSpec[] = [];
    const radius = layout.borderRadius as Record<string, TokenObj> | undefined;
    if (radius?.lg) {
      const v = parseNumber(getValue(radius.lg));
      if (v != null) variables.push({ name: 'borderRadius_lg', type: 'FLOAT', valuesByMode: { Default: v } });
    }
    const dashPadding = layout.dashboardPadding as TokenObj | undefined;
    if (dashPadding) {
      const v = parseNumber(getValue(dashPadding));
      if (v != null) variables.push({ name: 'dashboardPadding', type: 'FLOAT', valuesByMode: { Default: v } });
    }
    const spacing = layout.spacing as Record<string, TokenObj> | undefined;
    if (spacing?.md) {
      const v = parseNumber(getValue(spacing.md));
      if (v != null) variables.push({ name: 'spacing_md', type: 'FLOAT', valuesByMode: { Default: v } });
    }
    if (variables.length > 0) {
      collections.push({ name: 'Design Tokens - Layout', modes: ['Default'], variables });
    }
  }

  return {
    format: 'figma-variables-import',
    version: '1.0',
    source: 'design-tokens.json',
    collections,
    pluginHint: `// Figma plugin: create collection, add modes, then for each variable:\n// variable.setValueForMode(modeId, value); // COLOR: {r,g,b,a}, FLOAT: number, STRING: string`,
  };
}

/**
 * JSON 문자열로 직렬화 후 Blob으로 다운로드용 반환
 */
export function downloadFigmaVariablesJson(filename = 'design-tokens-figma.json'): void {
  const payload = buildFigmaVariablesFromTokens();
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
