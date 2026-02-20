import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeMode } from '../types';
import './ModeToggle.css';

interface ModeToggleProps {
    mode: ThemeMode;
    onChange: (mode: ThemeMode) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
    const isDark = mode === ThemeMode.DARK;

    return (
        <button
            onClick={() => onChange(isDark ? ThemeMode.LIGHT : ThemeMode.DARK)}
            className={`premium-mode-toggle ${isDark ? 'dark' : 'light'}`}
            aria-label="Toggle Theme Mode"
        >
            <div className="toggle-track">
                <div className="toggle-thumb">
                    <div className="icon-wrapper">
                        {isDark ? (
                            <Moon className="w-4 h-4 text-cyan-400" />
                        ) : (
                            <Sun className="w-4 h-4 text-amber-500" />
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
