/**
 * design-tokens.json을 단일 소스로 사용해 DashboardTheme을 만듭니다.
 * 토큰 구조가 바뀌어도 여기 매핑만 수정하면 됩니다.
 */
import { ThemeMode, ChartLibrary, DashboardTheme } from '../types';

// Vite/TS는 JSON import 가능. 빌드 실패 시 아래 주석의 fallback 사용.
import designTokens from '../design-tokens.json';

type TokenObj = { value: string; type?: string; description?: string };
type Tokens = typeof designTokens;

function getValue(obj: TokenObj | Record<string, TokenObj> | undefined): string {
  if (!obj) return '';
  if ('value' in obj && typeof (obj as TokenObj).value === 'string') return (obj as TokenObj).value;
  return '';
}

function parsePx(val: string): number {
  if (!val) return 0;
  const num = parseFloat(String(val).replace(/px|rem|em/g, '').trim());
  return isNaN(num) ? 0 : num;
}

function semanticForMode(tokens: Tokens['tokens'], mode: 'light' | 'dark'): Record<string, string> {
  const semantic = (tokens.colors?.semantic as Record<string, Record<string, TokenObj>>)?.[mode];
  if (!semantic) return {};
  return {
    background: getValue(semantic.background),
    surface: getValue(semantic.surface),
    text_main: getValue(semantic.text_main),
    text_secondary: getValue(semantic.text_secondary),
    text_muted: getValue(semantic.text_muted),
    border_base: getValue(semantic.border_base),
  };
}

/**
 * design-tokens.json → DashboardTheme 변환
 * (앱 전용 필드: chartLibrary, mode, showPageTabs 등은 인자/기본값으로 채움)
 */
export function tokensToDashboardTheme(
  tokens: Tokens = designTokens as Tokens,
  mode: ThemeMode = ThemeMode.DARK,
  overrides: Partial<DashboardTheme> = {}
): DashboardTheme {
  const t = tokens.tokens;
  const isDark = mode === ThemeMode.DARK || mode === ThemeMode.CYBER;
  const semantic = semanticForMode(t, isDark ? 'dark' : 'light');

  const primaryHex = getValue(t.colors?.brand?.primary as TokenObj) || '#3b82f6';
  const borderRadius = parsePx(getValue((t.layout?.borderRadius as Record<string, TokenObj>)?.lg)) || 16;
  const spacing = parsePx(getValue((t.layout?.spacing as Record<string, TokenObj>)?.md)) || 16;
  const dashboardPadding = parsePx(getValue(t.layout?.dashboardPadding as TokenObj)) || 32;
  const shadowDark = getValue(t.layout?.shadowBaseDark as TokenObj);
  const shadowLight = getValue(t.layout?.shadowBaseLight as TokenObj);
  const widgetBorderWidth = parsePx(getValue(t.layout?.widgetBorderWidth as TokenObj)) || 1;

  const theme: DashboardTheme = {
    name: isDark ? 'Dark Mode' : 'Light Mode',
    primaryColor: primaryHex,
    backgroundColor: semantic.background || (isDark ? '#020617' : '#f8fafc'),
    surfaceColor: semantic.surface || (isDark ? '#0f172a' : '#ffffff'),
    titleColor: semantic.text_main || (isDark ? '#f8fafc' : '#0f172a'),
    textColor: semantic.text_secondary || semantic.text_muted || (isDark ? '#94a3b8' : '#334155'),
    borderColor: semantic.border_base || (isDark ? '#1e293b' : '#e2e8f0'),
    widgetHeaderColor: 'transparent',
    mode,
    chartLibrary: ChartLibrary.RECHARTS,
    borderRadius,
    chartRadius: Math.max(4, Math.round(borderRadius * 0.375)),
    borderWidth: widgetBorderWidth,
    spacing,
    dashboardPadding,
    titleSize: parsePx(getValue(t.typography?.titleSize as TokenObj)) || 18,
    titleWeight: getValue(t.typography?.titleWeight as TokenObj) || '700',
    contentSize: parsePx(getValue(t.typography?.contentSize as TokenObj)) || 14,
    textTiny: parsePx(getValue(t.typography?.textTiny as TokenObj)) || 12,
    textSmall: parsePx(getValue(t.typography?.textSmall as TokenObj)) || 13,
    textMd: parsePx(getValue(t.typography?.textMd as TokenObj)) || 18,
    textLg: parsePx(getValue(t.typography?.textLg as TokenObj)) || 30,
    textHero: parsePx(getValue(t.typography?.textHero as TokenObj)) || 48,
    cardShadow: isDark ? (shadowDark || '0 10px 15px -3px rgb(0 0 0 / 0.5)') : (shadowLight || '0 4px 6px -1px rgb(0 0 0 / 0.1)'),
    showPageTabs: true,
    ...overrides,
  };

  return theme;
}

/**
 * 앱 기본 테마 (Dark). design-tokens.json 기준.
 */
export function getDefaultThemeFromTokens(overrides: Partial<DashboardTheme> = {}): DashboardTheme {
  return tokensToDashboardTheme(designTokens as Tokens, ThemeMode.DARK, { ...overrides });
}

/**
 * Light 프리셋용 테마 (토큰 semantic.light 기준)
 */
export function getLightThemeFromTokens(overrides: Partial<DashboardTheme> = {}): DashboardTheme {
  return tokensToDashboardTheme(designTokens as Tokens, ThemeMode.LIGHT, overrides);
}

export { designTokens };
