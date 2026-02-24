
import React, { useEffect } from 'react';
import { DashboardTheme, ThemeMode } from './types';
import designTokens from './design-tokens.json';

type TokenObj = { value: string; type?: string };
function tokenValue(obj: TokenObj | Record<string, TokenObj> | undefined): string {
  if (!obj) return '';
  if (obj && 'value' in obj && typeof (obj as TokenObj).value === 'string') return (obj as TokenObj).value;
  return '';
}
/** "rgba(15, 23, 42, 0.35)" -> { rgb: "15, 23, 42", opacity: 0.35 } */
function parseRgba(rgba: string): { rgb: string; opacity: number } | null {
  const m = rgba.trim().match(/rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/);
  if (!m) return null;
  return { rgb: `${m[1]}, ${m[2]}, ${m[3]}`, opacity: Number(m[4]) };
}

interface DesignSystemProps {
    theme: DashboardTheme;
    /** When set, theme is applied to this element (per-project scope). When unset, applied to document.documentElement. */
    targetRef?: React.RefObject<HTMLElement | null>;
}

/**
 * DesignSystem Component
 * Applies theme to a target element so each project has its own design system scope.
 */
const DesignSystem: React.FC<DesignSystemProps> = ({ theme, targetRef }) => {
    useEffect(() => {
        const root = targetRef?.current ?? document.documentElement;

        // Apply Primary Palette
        applyColorPalette(root, 'primary', theme.primaryColor);

        // Core Colors
        root.style.setProperty('--background', theme.backgroundColor);
        root.style.setProperty('--surface', theme.surfaceColor);
        root.style.setProperty('--surface-rgb', hexToRgb(theme.surfaceColor));
        root.style.setProperty('--text-main', theme.titleColor);
        root.style.setProperty('--text-secondary', theme.textColor);
        root.style.setProperty('--shadow-base', theme.cardShadow);

        // Layout & Surface Variables
        root.style.setProperty('--border-radius', `${theme.borderRadius}px`);
        root.style.setProperty('--spacing', `${theme.spacing}px`);
        root.style.setProperty('--dashboard-padding', `${theme.dashboardPadding}px`);
        root.style.setProperty('--widget-border-width', `${theme.borderWidth}px`);
        root.style.setProperty('--widget-border-color', theme.borderColor);
        root.style.setProperty('--widget-header-color', theme.widgetHeaderColor || 'transparent');

        // Typography
        root.style.setProperty('--title-size', `${theme.titleSize}px`);
        root.style.setProperty('--title-weight', theme.titleWeight);
        root.style.setProperty('--content-size', `${theme.contentSize}px`);
        root.style.setProperty('--text-tiny', `${theme.textTiny}px`);
        root.style.setProperty('--text-small', `${theme.textSmall}px`);
        root.style.setProperty('--text-base', `${theme.contentSize}px`);
        root.style.setProperty('--text-md', `${theme.textMd}px`);
        root.style.setProperty('--text-lg', `${theme.textLg}px`);
        root.style.setProperty('--text-hero', `${theme.textHero}px`);

        // Glassmorphism (from design-tokens.json by theme mode)
        type GlassVariant = { background?: TokenObj; border?: TokenObj; shadow?: TokenObj };
        const components = (designTokens as { tokens?: { components?: { glassmorphism?: { blur?: TokenObj; light?: GlassVariant; dark?: GlassVariant } } } }).tokens?.components;
        const glass = components?.glassmorphism;
        const isDark = theme.mode === ThemeMode.DARK || theme.mode === ThemeMode.CYBER;
        const variant: GlassVariant | undefined = glass && isDark ? glass.dark : glass?.light;
        const blur = glass?.blur?.value ?? '12px';
        const defBg = isDark ? 'rgba(15, 23, 42, 0.35)' : 'rgba(255, 255, 255, 0.55)';
        const defOpacity = isDark ? 0.35 : 0.55;
        const defBorder = isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.6)';
        const defShadow = isDark ? '0 4px 24px -1px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.06)' : '0 8px 32px rgba(0, 0, 0, 0.08)';
        const tokenBg = variant && tokenValue(variant.background);
        const parsed = tokenBg ? parseRgba(tokenBg) : null;
        const glassRgb = parsed?.rgb ?? (isDark ? '15, 23, 42' : '255, 255, 255');
        const glassOpacity = parsed?.opacity ?? defOpacity;
        root.style.setProperty('--glass-bg-rgb', glassRgb);
        root.style.setProperty('--glass-opacity', String(glassOpacity));
        root.style.setProperty('--glass-bg', 'rgba(var(--glass-bg-rgb), var(--glass-opacity))');
        root.style.setProperty('--glass-border', (variant && tokenValue(variant.border)) || defBorder);
        root.style.setProperty('--glass-shadow', (variant && tokenValue(variant.shadow)) || defShadow);
        root.style.setProperty('--glass-blur', blur);

        // Mode Classes (on the same element we're theming)
        root.classList.remove('dark', 'cyber', 'midnight-pro');
        if (theme.mode === ThemeMode.DARK) {
            root.classList.add('dark');
        } else if (theme.mode === ThemeMode.CYBER) {
            root.classList.add('dark', 'cyber');
        }
    }, [theme, targetRef]);

    return null;
};

function applyColorPalette(root: HTMLElement, name: string, baseHex: string) {
    const shades = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];

    root.style.setProperty(`--${name}-color`, baseHex);
    root.style.setProperty(`--${name}-color-rgb`, hexToRgb(baseHex));
    root.style.setProperty(`--${name}-subtle`, `${baseHex}15`);

    shades.forEach(step => {
        const variantHex = shadeColor(baseHex, (step - 50) * -1.5);
        root.style.setProperty(`--${name}-${step}`, variantHex);
    });
}

function shadeColor(color: string, percent: number) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.floor(R * (100 + percent) / 100);
    G = Math.floor(G * (100 + percent) / 100);
    B = Math.floor(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    R = (R > 0) ? R : 0;
    G = (G > 0) ? G : 0;
    B = (B > 0) ? B : 0;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
}

function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '59, 130, 246';
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `${r}, ${g}, ${b}`;
}

export default DesignSystem;
