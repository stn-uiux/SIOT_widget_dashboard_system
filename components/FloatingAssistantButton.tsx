
import React from 'react';
import { Sparkles as SparklesIcon, Eye } from 'lucide-react';

interface FloatingAssistantButtonProps {
    onClick?: () => void;
    isPreview?: boolean;
}

/**
 * FloatingAssistantButton Component
 * A premium, glowing AI assistant button that follows the Aurora design system.
 */
const FloatingAssistantButton: React.FC<FloatingAssistantButtonProps> = ({ onClick, isPreview }) => {
    return (
        <div 
            className="fixed z-[var(--ai-fab-z-index)] group"
            style={{ 
                bottom: 'var(--spacing-xl)', 
                right: 'var(--spacing-xl)' 
            }}
        >
            {/* Outer Glow & Breathing Effect */}
            <div 
                className="absolute inset-0 rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse"
                style={{ backgroundColor: 'var(--ai-fab-outer-glow-bg)', filter: 'blur(calc(var(--ai-fab-blur) * 2))' }}
            />
            
            <button
                onClick={onClick}
                className="relative flex items-center justify-center overflow-hidden transition-all duration-500 hover:scale-110 active:scale-95 shadow-2xl"
                style={{
                    width: 'var(--ai-fab-size)',
                    height: 'var(--ai-fab-size)',
                    borderRadius: 'var(--radius-pill)',
                    background: isPreview ? 'var(--primary-gradient)' : 'var(--ai-fab-gradient)',
                    boxShadow: 'var(--ai-fab-glow)',
                }}
            >
                {/* Glassmorphism layer */}
                <div 
                    className="absolute rounded-full border"
                    style={{
                        inset: '2px', // Very small spacing for border effect
                        backdropFilter: 'blur(var(--ai-fab-blur))',
                        background: 'var(--ai-fab-glass-bg)',
                        borderColor: 'var(--ai-fab-glass-border)',
                        boxShadow: 'var(--ai-fab-inner-glow)',
                    }}
                />

                {/* Abstract Swirls (Decorative) */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute top-0 left-0 w-full h-full ai-fab-swirl-a rotate-45 transform -translate-x-1/2 scale-150 ai-fab-spin-8" />
                    <div className="absolute bottom-0 right-0 w-full h-full ai-fab-swirl-b -rotate-45 transform translate-x-1/2 scale-150 ai-fab-spin-12-reverse" />
                </div>

                {/* Center Icon */}
                <div className="relative z-10 flex items-center justify-center">
                    {isPreview ? (
                        <Eye 
                            className="text-[var(--white)] drop-shadow-lg scale-110 transition-transform group-hover:scale-125" 
                            style={{ width: 'calc(var(--ai-fab-size) * 0.45)', height: 'calc(var(--ai-fab-size) * 0.45)' }}
                        />
                    ) : (
                        <SparklesIcon 
                            className="text-[var(--white)] drop-shadow-lg scale-110 transition-transform group-hover:rotate-12" 
                            style={{ width: 'calc(var(--ai-fab-size) * 0.45)', height: 'calc(var(--ai-fab-size) * 0.45)' }}
                        />
                    )}
                </div>

                {/* Hover Highlight Ring */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--ai-fab-hover-ring-border)] rounded-full transition-all duration-500 scale-90 group-hover:scale-100" />
            </button>
            
            {/* Tooltip Label Removed */}
        </div>
    );
};

export default FloatingAssistantButton;
