
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
                onClick={onCancel}
            />

            <div className="relative w-full max-w-sm rounded-[var(--border-radius)] shadow-premium overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 bg-[var(--surface)] border border-[var(--border-base)]">
                <div className="p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center text-[var(--error)] mb-2">
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
                            className="py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-widest transition-all bg-[var(--border-muted)] text-muted hover:bg-[var(--border-base)]"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className="py-3.5 px-6 rounded-xl bg-[var(--error)] text-white font-bold text-xs uppercase tracking-widest hover:brightness-110 shadow-lg shadow-red-500/25 transition-all"
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
