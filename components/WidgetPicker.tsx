import React from 'react';
import {
    X, BarChart3, Database, LayoutGrid, ChevronRight, Layers
} from 'lucide-react';
import { WidgetType } from '../types';
import { WIDGET_METADATA } from '../constants';

interface WidgetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: WidgetType) => void;
    isDark: boolean;
}

const CATEGORIES = [
    {
        id: 'viz',
        label: '시각화 차트',
        description: '데이터를 직관적으로 분석하기 위한 기본 차트들입니다.',
        icon: BarChart3,
        items: Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'viz')
            .map(([id, meta]) => ({ id: id as WidgetType, icon: meta.icon, label: meta.label }))
    },
    {
        id: 'premium',
        label: '프리미엄 템플릿',
        description: '특수 목적을 위해 디자인된 고급 통계 및 분석 템플릿입니다.',
        icon: LayoutGrid,
        items: Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'premium')
            .map(([id, meta]) => ({ id: id as WidgetType, icon: meta.icon, label: meta.label }))
    },
    {
        id: 'general',
        label: '일반 컴포넌트',
        description: '기본적인 정보 노출 및 외부 연동을 위한 컴포넌트입니다.',
        icon: Database,
        items: Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'general')
            .map(([id, meta]) => ({ id: id as WidgetType, icon: meta.icon, label: meta.label }))
    }
];

const WidgetPicker: React.FC<WidgetPickerProps> = ({ isOpen, onClose, onSelect, isDark }) => {
    const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0].id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className={`relative w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-base)] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col bg-[var(--surface)] text-[var(--text-main)]`}>

                {/* Header */}
                <div className="px-8 py-6 border-b border-[var(--border-muted)] flex items-center justify-between shrink-0">
                    <div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase">Add New Widget</h3>
                        <p className="text-sm text-muted font-medium">원하는 위젯의 타입을 선택하여 대시보드에 추가하세요.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-2xl transition-all"
                    >
                        <X className="w-6 h-6 text-muted" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Categories */}
                    <div className="w-64 border-r border-[var(--border-muted)] flex flex-col p-4 gap-2 bg-black/5 dark:bg-white/5">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex flex-col items-start p-4 rounded-[var(--radius-xl)] transition-all text-left group ${activeCategory === cat.id ? 'bg-[var(--primary-color)] text-white shadow-xl shadow-[var(--primary-subtle)]' : 'hover:bg-[var(--border-muted)] text-[var(--text-muted)]'}`}
                            >
                                <cat.icon className={`w-5 h-5 mb-2 ${activeCategory === cat.id ? 'text-white' : 'text-primary'}`} />
                                <span className="font-black text-xs uppercase tracking-widest">{cat.label}</span>
                                <span className={`text-[10px] opacity-60 font-medium leading-tight mt-1 ${activeCategory === cat.id ? 'text-blue-50' : ''}`}>
                                    {cat.items.length}개 항목
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Main Content - Items Grid */}
                    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[var(--background)]">
                        <div className="mb-6">
                            <h4 className="text-xl font-black tracking-tight flex items-center gap-2">
                                {CATEGORIES.find(c => c.id === activeCategory)?.label}
                            </h4>
                            <p className="text-sm text-muted mt-1">
                                {CATEGORIES.find(c => c.id === activeCategory)?.description}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {CATEGORIES.find(c => c.id === activeCategory)?.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item.id)}
                                    className={`group relative flex flex-col items-center justify-center p-6 rounded-[var(--radius-xl)] border transition-all duration-300 hover:scale-[1.03] hover:shadow-premium bg-[var(--surface-muted)] border-[var(--border-muted)] hover:border-[var(--primary-color)]`}
                                >
                                    <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--primary-subtle)] flex items-center justify-center mb-4 transition-colors group-hover:bg-[var(--primary-color)] group-hover:text-white">
                                        <item.icon className="w-7 h-7 text-[var(--primary-color)] group-hover:text-white transition-colors" />
                                    </div>
                                    <span className="font-black text-xs uppercase tracking-tight text-center">{item.label}</span>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4 text-[var(--primary-color)]" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-4 bg-black/5 dark:bg-white/5 border-t border-[var(--border-muted)] flex items-center justify-between shrink-0">
                    <p className="text-[10px] text-muted font-bold uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5" /> STN DESIGN SYSTEM OVERLAY
                    </p>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-xl text-sm font-bold text-muted hover:text-main transition-colors">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetPicker;
