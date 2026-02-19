import React from 'react';

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, label, disabled }) => {
    return (
        <label className={`stn-switch-container ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {label && <span className="mr-3 text-sm font-medium text-main">{label}</span>}
            <input
                type="checkbox"
                className="stn-switch-input"
                checked={checked}
                onChange={(e) => !disabled && onChange(e.target.checked)}
                disabled={disabled}
            />
            <div className="stn-switch-track">
                <div className="stn-switch-thumb" />
            </div>
        </label>
    );
};

export default Switch;
