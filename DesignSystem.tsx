
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
        const isDark = theme.mode === ThemeMode.DARK;

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
        root.style.setProperty('--text-hero', `${theme.textHero ?? 48}px`);

        // Extra Typography Tokens from JSON
        const typography = (designTokens as any).tokens?.typography;
        if (typography) {
            Object.entries(typography).forEach(([key, data]: [string, any]) => {
                const cssVarName = `--${key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}`;
                // Only set if not already set by theme props to avoid overriding manual panel adjustments
                if (!root.style.getPropertyValue(cssVarName)) {
                    root.style.setProperty(cssVarName, tokenValue(data));
                }
            });
        }

        // Header & Component Tokens (from design-tokens.json)
        const components = (designTokens as any).tokens?.components;
        if (components) {
            // Header
            const headerTokens = components.header;
            if (headerTokens) {
                root.style.setProperty('--header-height', tokenValue(headerTokens.height));
                root.style.setProperty('--header-bg-position', tokenValue(headerTokens.background_position));
                root.style.setProperty('--header-bg-size', tokenValue(headerTokens.background_size));
                root.style.setProperty('--header-bg-repeat', tokenValue(headerTokens.background_repeat));
            }

            // Header Grid
            const layoutTokens = (designTokens as any).tokens?.layout;
            const hGrid = layoutTokens?.header_grid;
            if (hGrid) {
                root.style.setProperty('--header-grid-cols', String(hGrid.cols?.value ?? 60));
                root.style.setProperty('--header-grid-rows', String(hGrid.rows?.value ?? 12));
                root.style.setProperty('--header-row-height', `${tokenValue(hGrid.rowHeight)}px`);
                root.style.setProperty('--header-grid-gap-x', `${hGrid.gap_x?.value ?? 4}px`);
                root.style.setProperty('--header-grid-gap-y', `${hGrid.gap_y?.value ?? 2}px`);
            }

            // Loading Screen
            const loadingTokens = components.loading_screen;
            if (loadingTokens) {
                root.style.setProperty('--loading-bg', tokenValue(loadingTokens.background));
                root.style.setProperty('--loading-z', String(loadingTokens.z_index?.value ?? 9999));
                root.style.setProperty('--loading-glow-1', tokenValue(loadingTokens.glow_primary));
                root.style.setProperty('--loading-glow-2', tokenValue(loadingTokens.glow_secondary));
                root.style.setProperty('--loading-blur-1', tokenValue(loadingTokens.blur_primary));
                root.style.setProperty('--loading-blur-2', tokenValue(loadingTokens.blur_secondary));
                root.style.setProperty('--loading-spinner-size', tokenValue(loadingTokens.spinner_size));
                root.style.setProperty('--loading-spinner-color', tokenValue(loadingTokens.spinner_color));
                root.style.setProperty('--loading-text-1', tokenValue(loadingTokens.text_primary));
                root.style.setProperty('--loading-text-2', tokenValue(loadingTokens.text_secondary));
            }

            // Header Widgets
            const hWidgetTokens = components.header_widgets;
            if (hWidgetTokens) {
                // Clock
                const clock = hWidgetTokens.clock;
                root.style.setProperty('--h-clock-time-size', tokenValue(clock?.time_size));
                root.style.setProperty('--h-clock-date-size', tokenValue(clock?.date_size));
                root.style.setProperty('--h-clock-day-size', tokenValue(clock?.day_size));
                root.style.setProperty('--h-clock-color', tokenValue(clock?.color));

                // Monitor
                const monitor = hWidgetTokens.monitor;
                root.style.setProperty('--h-monitor-bg', isDark ? tokenValue(monitor?.bg_dark) : tokenValue(monitor?.bg_light));
                root.style.setProperty('--h-monitor-border', isDark ? tokenValue(monitor?.border_color_dark) : tokenValue(monitor?.border_color_light));
                root.style.setProperty('--h-monitor-radius', tokenValue(monitor?.radius));
                root.style.setProperty('--h-monitor-text-size', tokenValue(monitor?.text_size));
                root.style.setProperty('--h-monitor-dot-color', tokenValue(monitor?.dot_color));
                root.style.setProperty('--h-monitor-dot-glow', tokenValue(monitor?.dot_glow));
            }

            // Glassmorphism
            const glass = components.glassmorphism;
            const variant = glass && isDark ? glass.dark : glass?.light;
            const blur = glass?.blur?.value ?? '12px';
            const defOpacity = isDark ? 0.35 : 0.55;
            const glassRgb = hexToRgb(theme.surfaceColor);
            const tokenBg = variant && tokenValue(variant.background);
            const parsed = tokenBg ? parseRgba(tokenBg) : null;
            const glassOpacity = parsed?.opacity ?? defOpacity;
            
            root.style.setProperty('--glass-bg-rgb', glassRgb);
            root.style.setProperty('--glass-opacity', String(glassOpacity));
            root.style.setProperty('--glass-bg', `rgba(${glassRgb}, ${glassOpacity})`);
            root.style.setProperty('--glass-border', (variant && tokenValue(variant.border)) || (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.6)'));
            root.style.setProperty('--glass-blur', blur);
        }

        // Dedicated GNB background to decouple it from widgets
        const gnbBg = isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)';
        const gnbBtnBg = isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241, 245, 249, 0.7)';
        root.style.setProperty('--gnb-bg', gnbBg);
        root.style.setProperty('--gnb-btn-bg', gnbBtnBg);

        // Mode Classes (on the same element we're theming)
        root.classList.remove('dark', 'midnight-pro');
        if (theme.mode === ThemeMode.DARK) {
            root.classList.add('dark');
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
