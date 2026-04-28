
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDark: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDark
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                style={{ backgroundColor: 'var(--login-overlay-opacity)' }}
                onClick={onCancel}
            />

            <div 
                className="relative w-full max-w-sm shadow-premium overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                style={{ 
                    backgroundColor: 'var(--surface)', 
                    borderColor: 'var(--border-base)',
                    borderWidth: '1px',
                    borderRadius: 'var(--radius-modal)'
                }}
            >
                <div className="p-6 text-center space-y-4">
                    <div 
                        className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-2"
                        style={{ backgroundColor: 'var(--action-danger-subtle)', color: 'var(--error)' }}
                    >
                        <AlertTriangle size={32} />
                    </div>

                    <div className="space-y-1">
                        <h2 className="text-xl font-black tracking-tight text-main">
                            {title}
                        </h2>
                        <p className="text-sm font-medium text-muted">
                            {message}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={onCancel}
                            className="py-3.5 px-6 font-bold text-xs uppercase tracking-widest transition-all"
                            style={{ 
                                backgroundColor: 'var(--border-muted)', 
                                color: 'var(--text-muted)',
                                borderRadius: 'var(--radius-md)'
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="py-3.5 px-6 text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 transition-all"
                            style={{ 
                                backgroundColor: 'var(--error)', 
                                borderRadius: 'var(--radius-md)',
                                boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.25)' 
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 hover:bg-[var(--border-muted)] rounded-full transition-colors text-muted"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmModal;
