
import React, { useEffect } from 'react';
import { DashboardTheme, ThemeMode } from './types';

interface DesignSystemProps {
    theme: DashboardTheme;
}

/**
 * DesignSystem Component
 * Dynamically generates color palettes (shades/tints) from the primary base color.
 */
const DesignSystem: React.FC<DesignSystemProps> = ({ theme }) => {
    useEffect(() => {
        const root = document.documentElement;

        // Apply Primary Palette
        applyColorPalette(root, 'primary', theme.primaryColor);

        // Core Colors
        if (theme.useGradient && theme.backgroundGradientColor) {
            root.style.setProperty('--background', `linear-gradient(135deg, ${theme.backgroundColor}, ${theme.backgroundGradientColor})`);
        } else {
            root.style.setProperty('--background', theme.backgroundColor);
        }
        root.style.setProperty('--surface', theme.surfaceColor);
        root.style.setProperty('--surface-rgb', hexToRgb(theme.surfaceColor));
        root.style.setProperty('--text-main', theme.titleColor);
        root.style.setProperty('--text-secondary', theme.textColor);
        root.style.setProperty('--shadow-base', theme.cardShadow);

        // Glassmorphism
        if (theme.glassmorphism) {
            root.style.setProperty('--surface-blur', `${theme.glassBlur}px`);
            root.style.setProperty('--surface-opacity', `${theme.glassOpacity}`);
            root.classList.add('glass-enabled');
        } else {
            root.style.setProperty('--surface-blur', '0px');
            root.style.setProperty('--surface-opacity', '1');
            root.classList.remove('glass-enabled');
        }

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

        // Dark Mode Class
        if (theme.mode === ThemeMode.DARK) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

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
