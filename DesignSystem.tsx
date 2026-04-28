
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
                root.style.setProperty('--gnb-btn-height', tokenValue(headerTokens.btn_height));
                root.style.setProperty('--gnb-btn-padding-x', tokenValue(headerTokens.btn_padding_x));
                root.style.setProperty('--gnb-btn-radius', tokenValue(headerTokens.btn_radius));
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

            // Login Screen
            const loginTokens = components.login;
            if (loginTokens) {
                root.style.setProperty('--login-bg', tokenValue(loginTokens.background));
                root.style.setProperty('--login-overlay-opacity', String(loginTokens.overlay_opacity?.value ?? 0.2));
                root.style.setProperty('--login-card-bg', tokenValue(loginTokens.card_bg));
                root.style.setProperty('--login-card-blur', tokenValue(loginTokens.card_blur));
                root.style.setProperty('--login-card-border', tokenValue(loginTokens.card_border));
                root.style.setProperty('--login-card-radius', tokenValue(loginTokens.card_radius));
                root.style.setProperty('--login-card-shadow', tokenValue(loginTokens.card_shadow));
                root.style.setProperty('--login-label-color', tokenValue(loginTokens.label_color));
                root.style.setProperty('--login-input-bg', tokenValue(loginTokens.input_bg));
                root.style.setProperty('--login-input-border', tokenValue(loginTokens.input_border));
                root.style.setProperty('--login-input-placeholder', tokenValue(loginTokens.input_placeholder));
                root.style.setProperty('--login-input-focus-ring', tokenValue(loginTokens.input_focus_ring));
                root.style.setProperty('--login-button-gradient', tokenValue(loginTokens.button_gradient));
                root.style.setProperty('--login-button-shadow', tokenValue(loginTokens.button_shadow));
                root.style.setProperty('--login-card-padding', tokenValue(loginTokens.card_padding));
                root.style.setProperty('--login-logo-margin-bottom', tokenValue(loginTokens.logo_margin_bottom));
                root.style.setProperty('--login-input-radius', tokenValue(loginTokens.input_radius));
                root.style.setProperty('--login-input-padding-y', tokenValue(loginTokens.input_padding_y));
                root.style.setProperty('--login-input-padding-x', tokenValue(loginTokens.input_padding_x));
                root.style.setProperty('--login-input-gap', tokenValue(loginTokens.input_gap));
                root.style.setProperty('--login-label-margin-bottom', tokenValue(loginTokens.label_margin_bottom));
                root.style.setProperty('--login-label-margin-left', tokenValue(loginTokens.label_margin_left));
                root.style.setProperty('--login-icon-color', tokenValue(loginTokens.icon_color));
                root.style.setProperty('--login-error-bg', tokenValue(loginTokens.error_bg));
                root.style.setProperty('--login-error-border', tokenValue(loginTokens.error_border));
                root.style.setProperty('--login-error-text', tokenValue(loginTokens.error_text));
                root.style.setProperty('--login-footer-text', tokenValue(loginTokens.footer_text));
                root.style.setProperty('--login-link-text', tokenValue(loginTokens.link_text));
                root.style.setProperty('--login-link-hover', tokenValue(loginTokens.link_hover));
                root.style.setProperty('--login-input-icon-size', tokenValue(loginTokens.input_icon_size));
                root.style.setProperty('--login-input-icon-left', tokenValue(loginTokens.input_icon_left));
                root.style.setProperty('--login-input-padding-with-icon', tokenValue(loginTokens.input_padding_with_icon));
            }

            // GNB Capsule
            const gnbTokens = components.gnb;
            if (gnbTokens) {
                root.style.setProperty('--gnb-height', tokenValue(gnbTokens.height));
                root.style.setProperty('--gnb-radius', tokenValue(gnbTokens.radius));
                root.style.setProperty('--gnb-padding-x', tokenValue(gnbTokens.padding_x));
                root.style.setProperty('--gnb-blur', tokenValue(gnbTokens.blur));
                root.style.setProperty('--gnb-bg', isDark ? tokenValue(gnbTokens.bg_dark) : tokenValue(gnbTokens.bg_light));
                root.style.setProperty('--gnb-btn-bg', isDark ? tokenValue(gnbTokens.btn_bg_dark) : tokenValue(gnbTokens.btn_bg_light));
                root.style.setProperty('--gnb-shadow', tokenValue(gnbTokens.shadow));
                root.style.setProperty('--gnb-logo-height', tokenValue(gnbTokens.logo_height));
                root.style.setProperty('--gnb-dropdown-width', tokenValue(gnbTokens.dropdown_width));
                root.style.setProperty('--gnb-dropdown-radius', tokenValue(gnbTokens.dropdown_radius));
                root.style.setProperty('--gnb-dropdown-padding', tokenValue(gnbTokens.dropdown_padding));
                root.style.setProperty('--gnb-item-height', tokenValue(gnbTokens.item_height));
                root.style.setProperty('--gnb-item-radius', tokenValue(gnbTokens.item_radius));
                root.style.setProperty('--gnb-item-padding-x', tokenValue(gnbTokens.item_padding_x));
                root.style.setProperty('--gnb-item-gap', tokenValue(gnbTokens.item_gap));
                root.style.setProperty('--gnb-item-font-size', tokenValue(gnbTokens.item_font_size));
                root.style.setProperty('--gnb-item-font-weight', tokenValue(gnbTokens.item_font_weight));
                root.style.setProperty('--gnb-header-font-size', tokenValue(gnbTokens.header_font_size));
                root.style.setProperty('--gnb-header-font-weight', tokenValue(gnbTokens.header_font_weight));
                root.style.setProperty('--gnb-header-sep-color', tokenValue(gnbTokens.header_sep_color));
                root.style.setProperty('--gnb-user-badge-bg', tokenValue(gnbTokens.user_badge_bg));
                root.style.setProperty('--gnb-user-badge-text', tokenValue(gnbTokens.user_badge_text));
                root.style.setProperty('--gnb-logout-bg', tokenValue(gnbTokens.logout_bg));
                root.style.setProperty('--gnb-logout-hover-bg', tokenValue(gnbTokens.logout_hover_bg));
                root.style.setProperty('--gnb-logout-hover-text', tokenValue(gnbTokens.logout_hover_text));
                root.style.setProperty('--gnb-import-hover-bg', tokenValue(gnbTokens.import_hover_bg));
                root.style.setProperty('--gnb-import-hover-border', tokenValue(gnbTokens.import_hover_border));
                root.style.setProperty('--gnb-import-text', tokenValue(gnbTokens.import_text));
                root.style.setProperty('--gnb-export-hover-bg', tokenValue(gnbTokens.export_hover_bg));
                root.style.setProperty('--gnb-export-hover-border', tokenValue(gnbTokens.export_hover_border));
                root.style.setProperty('--gnb-export-text', tokenValue(gnbTokens.export_text));
                root.style.setProperty('--gnb-icon-size', tokenValue(gnbTokens.icon_size));
                root.style.setProperty('--gnb-icon-color', tokenValue(gnbTokens.icon_color));
                root.style.setProperty('--gnb-icon-active-color', tokenValue(gnbTokens.icon_active_color));
                root.style.setProperty('--gnb-user-label-color', isDark ? tokenValue(gnbTokens.user_label_color_dark) : tokenValue(gnbTokens.user_label_color_light));
                root.style.setProperty('--gnb-user-id-color', isDark ? tokenValue(gnbTokens.user_id_color_dark) : tokenValue(gnbTokens.user_id_color_light));
            }

            // Global Panel
            const panelTokens = components.panel;
            if (panelTokens) {
                root.style.setProperty('--panel-width', tokenValue(panelTokens.width));
                root.style.setProperty('--panel-radius', tokenValue(panelTokens.radius));
                root.style.setProperty('--panel-header-height', tokenValue(panelTokens.header_height));
                root.style.setProperty('--panel-padding', tokenValue(panelTokens.padding));
                root.style.setProperty('--panel-header-padding-x', tokenValue(panelTokens.header_padding_x));
                root.style.setProperty('--panel-content-gap', tokenValue(panelTokens.content_gap));
                root.style.setProperty('--panel-item-gap', tokenValue(panelTokens.item_gap));
                root.style.setProperty('--panel-shadow', tokenValue(panelTokens.shadow));
                root.style.setProperty('--panel-glow-start', tokenValue(panelTokens.glow_start));
                root.style.setProperty('--panel-glow-end', tokenValue(panelTokens.glow_end));
            }

            // Mode Toggle
            const toggleTokens = components.mode_toggle;
            if (toggleTokens) {
                root.style.setProperty('--toggle-width', tokenValue(toggleTokens.width));
                root.style.setProperty('--toggle-height', tokenValue(toggleTokens.height));
                root.style.setProperty('--toggle-thumb-size', tokenValue(toggleTokens.thumb_size));
                root.style.setProperty('--toggle-track-bg', isDark ? tokenValue(toggleTokens.track_bg_dark) : tokenValue(toggleTokens.track_bg_light));
                root.style.setProperty('--toggle-thumb-bg', isDark ? tokenValue(toggleTokens.thumb_bg_dark) : tokenValue(toggleTokens.thumb_bg_light));
                root.style.setProperty('--toggle-glow', tokenValue(toggleTokens.glow_color));
                root.style.setProperty('--toggle-sun', tokenValue(toggleTokens.sun_color));
                root.style.setProperty('--toggle-moon', tokenValue(toggleTokens.moon_color));
                root.style.setProperty('--toggle-inactive', tokenValue(toggleTokens.inactive_color));
            }

            // Glassmorphism
            const glass = components.glassmorphism;
            if (glass) {
                const variant = isDark ? glass.dark : glass.light;
                const blur = glass.blur?.value ?? '12px';
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
        }

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
