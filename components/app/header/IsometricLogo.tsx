import React from "react";

export const IsometricLogo: React.FC<{
  isDark?: boolean;
  primaryColor?: string;
}> = ({ isDark, primaryColor }) => {
  const color = primaryColor ?? (typeof document !== "undefined" ? getComputedStyle(document.documentElement).getPropertyValue("--primary-color").trim() : "");
  const isLight = !isDark;
  const accentColor = isLight ? color : "white";
  return (
    <div className="relative w-10 h-10 group flex items-center justify-center">
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-9 h-9 drop-shadow-xl transition-transform duration-500 group-hover:scale-110"
      >
        <defs>
          <linearGradient id="baseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop
              offset="100%"
              stopColor="var(--secondary-color)"
            />
          </linearGradient>
          <linearGradient id="panelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor={accentColor}
              stopOpacity={isLight ? 0.6 : 0.8}
            />
            <stop
              offset="100%"
              stopColor={accentColor}
              stopOpacity={isLight ? 0.1 : 0.2}
            />
          </linearGradient>
        </defs>

        {/* Shadow/Glow under the base */}
        <path
          d="M50 85 L15 65 L50 45 L85 65 Z"
          fill={color}
          fillOpacity="0.2"
        />

        {/* Main Isometric Base */}
        <path d="M50 82 L15 62 L50 42 L85 62 Z" fill="url(#baseGrad)" />
        <path
          d="M15 62 L15 68 L50 88 L50 82 Z"
          fill={color}
          fillOpacity="0.8"
          filter="brightness(0.7)"
        />
        <path
          d="M50 82 L50 88 L85 68 L85 62 Z"
          fill={color}
          fillOpacity="0.8"
          filter="brightness(0.5)"
        />

        {/* Vertical Panels */}
        <g>
          {/* Back Panel */}
          <path
            d="M55 42 L55 12 L75 22 L75 52 Z"
            fill="url(#panelGrad)"
            stroke={accentColor}
            strokeOpacity={isLight ? 0.4 : 0.3}
            strokeWidth="0.5"
          />
          {/* Front Panel */}
          <path
            d="M30 52 L30 22 L50 32 L50 62 Z"
            fill="url(#panelGrad)"
            stroke={accentColor}
            strokeOpacity={isLight ? 0.5 : 0.4}
            strokeWidth="0.5"
          />

          {/* Mini Data Bars inside panels (isometric) */}
          <rect
            x="35"
            y="45"
            width="2"
            height="8"
            fill={accentColor}
            fillOpacity={isLight ? 0.5 : 0.6}
            transform="skew-y(-25)"
          />
          <rect
            x="42"
            y="48"
            width="2"
            height="12"
            fill={accentColor}
            fillOpacity={isLight ? 0.7 : 0.8}
            transform="skew-y(-25)"
          />
          <rect
            x="60"
            y="32"
            width="2"
            height="6"
            fill={accentColor}
            fillOpacity={isLight ? 0.4 : 0.5}
            transform="skew-y(-25)"
          />
        </g>
      </svg>
      <div className="absolute inset-0 bg-[var(--primary-subtle)] blur-xl rounded-full scale-110 -z-10" />
    </div>
  );
};
