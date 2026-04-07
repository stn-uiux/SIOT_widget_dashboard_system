import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';
import './ModeToggle.css';

interface ModeToggleProps {
    mode: ThemeMode;
    onChange: (mode: ThemeMode) => void;
    disabled?: boolean;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange, disabled }) => {
    const [displayMode, setDisplayMode] = useState(mode);
    useEffect(() => setDisplayMode(mode), [mode]);

    const isDark = displayMode === ThemeMode.DARK;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return; // Prevent changing theme while in edit mode
        const nextMode = isDark ? ThemeMode.LIGHT : ThemeMode.DARK;
        setDisplayMode(nextMode);
        onChange(nextMode);
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`premium-mode-toggle ${isDark ? 'dark' : 'light'} ${disabled ? 'cursor-grab' : ''}`}
            aria-label="Toggle Theme Mode"
            title={disabled ? "Edit Mode - Drag to move" : "Toggle Theme"}
        >
            <div className="toggle-track">
                <div className="toggle-thumb">
                    <div className="icon-wrapper">
                        {isDark ? (
                            <Moon className="w-3.5 h-3.5 text-cyan-400" />
                        ) : (
                            <Sun className="w-3.5 h-3.5 text-amber-500" />
                        )}
                    </div>
                    <div className="glow-effect" />
                </div>
                <div className="track-icons">
                    <Sun className={`w-3 h-3 sun-bg ${!isDark ? 'active' : ''}`} />
                    <Moon className={`w-3 h-3 moon-bg ${isDark ? 'active' : ''}`} />
                </div>
            </div>
        </button>
    );
};

export default ModeToggle;
