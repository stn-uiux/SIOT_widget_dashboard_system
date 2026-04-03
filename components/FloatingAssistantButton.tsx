
import React from 'react';
import { Sparkles as SparklesIcon } from 'lucide-react';

interface FloatingAssistantButtonProps {
    onClick?: () => void;
}

/**
 * FloatingAssistantButton Component
 * A premium, glowing AI assistant button that follows the Aurora design system.
 */
const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({ onClick }) => {
    return (
        <div 
            className="fixed z-[100] group"
            style={{ 
                bottom: 'var(--spacing-xl)', 
                right: 'var(--spacing-xl)' 
            }}
        >
            {/* Outer Glow & Breathing Effect */}
            <div 
                className="absolute inset-0 bg-primary/20 rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" 
                style={{ filter: 'blur(calc(var(--ai-fab-blur) * 2))' }}
            />
            
            <button
                onClick={onClick}
                className="relative flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl"
                style={{
                    width: 'var(--ai-fab-size)',
                    height: 'var(--ai-fab-size)',
                    borderRadius: 'var(--layout-borderRadius-full, 9999px)',
                    background: 'var(--ai-fab-gradient)',
                    boxShadow: 'var(--ai-fab-glow)',
                }}
            >
                {/* Glassmorphism layer */}
                <div 
                    className="absolute rounded-full border border-white/30"
                    style={{
                        inset: '2px', // Very small spacing for border effect
                        backdropFilter: 'blur(var(--ai-fab-blur))',
                        background: 'rgba(255, 255, 255, 0.1)',
                        boxShadow: 'var(--ai-fab-inner-glow)',
                    }}
                />

                {/* Abstract Swirls (Decorative) */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-cyan-400/0 via-cyan-400/50 to-cyan-400/0 rotate-45 transform -translate-x-1/2 scale-150 animate-[spin_8s_linear_infinite]" />
                    <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-bl from-purple-500/0 via-purple-500/50 to-purple-500/0 -rotate-45 transform translate-x-1/2 scale-150 animate-[spin_12s_linear_infinite_reverse]" />
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex items-center justify-center">
                    <SparklesIcon 
                        className="text-white drop-shadow-lg scale-110 transition-transform group-hover:rotate-12" 
                        style={{ width: 'calc(var(--ai-fab-size) * 0.45)', height: 'calc(var(--ai-fab-size) * 0.45)' }}
                    />
                </div>

                {/* Hover Highlight Ring */}
                <div className="absolute inset-0 border-2 border-white/0 group-hover:border-white/40 rounded-full transition-all duration-500 scale-90 group-hover:scale-100" />
            </button>
            
            {/* Tooltip Label Removed */}
        </div>
    );
};

export default FloatingAssistantButton;
