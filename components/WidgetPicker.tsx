import React from 'react';
import {
    X, BarChart3, Database, LayoutGrid, ChevronRight, Layers,
    BarChartHorizontal, LineChart, AreaChart, PieChart, Hexagon,
    Workflow, Activity, Monitor, Image as ImageIcon, MapPin,
    CloudSun, TrendingUp, Type
} from 'lucide-react';
import { WidgetType } from '../types';

interface WidgetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: WidgetType) => void;
    isDark: boolean;
}

// Preview Assets Configuration
const PREVIEW_ASSETS = {
    CHART_BAR: {
        light: '/assets/widget/light/graph/bar_graph_light.png',
        dark: '/assets/widget/dark/graph/bar_graph_dark.png'
    }
};

const CATEGORIES = [
    {
        id: 'viz',
        label: '시각화 차트',
        description: '데이터 분석용 기본 차트',
        icon: BarChart3,
        items: [
            { 
                id: WidgetType.CHART_BAR, 
                icon: BarChart3, 
                label: '세로 막대',
                preview: PREVIEW_ASSETS.CHART_BAR
            },
            { id: WidgetType.CHART_BAR_HORIZONTAL, icon: BarChartHorizontal, label: '가로 막대' },
            { id: WidgetType.CHART_LINE, icon: LineChart, label: '선형 차트' },
            { id: WidgetType.CHART_AREA, icon: AreaChart, label: '영역 차트' },
            { id: WidgetType.CHART_PIE, icon: PieChart, label: '파이 차트' },
            { id: WidgetType.CHART_RADAR, icon: Hexagon, label: '방사형 차트' },
            { id: WidgetType.CHART_COMPOSED, icon: Layers, label: '혼합형 차트' },
            { id: WidgetType.CHART_SANKEY, icon: Workflow, label: '생키 다이어그램' }
        ]
    },
    {
        id: 'premium',
        label: '프리미엄 템플릿',
        description: '고용량 데이터 최적화 템플릿',
        icon: LayoutGrid,
        items: [
            { id: WidgetType.SUMMARY, icon: Database, label: '단일 수치 (STAT)' },
            { id: WidgetType.EARNING_TREND, icon: Activity, label: '트렌드 요약' },
            { id: WidgetType.DASH_FAILURE_STATUS, icon: Activity, label: '장애 현황 (KPI)' },
            { id: WidgetType.DASH_FAILURE_STATS, icon: AreaChart, label: '장애 통계 (STATS)' },
            { id: WidgetType.DASH_TRAFFIC_STATUS, icon: Activity, label: '네트워크 트래픽' },
            { id: WidgetType.DASH_SECURITY_STATUS, icon: Hexagon, label: '보안 탐지 현황' },
            { id: WidgetType.DASH_RESOURCE_USAGE, icon: BarChart3, label: '리소스 사용률' },
            { id: WidgetType.DASH_FACILITY_1, icon: Database, label: '시설 현황' },
            { id: WidgetType.DASH_FACILITY_2, icon: Monitor, label: '시설 상태' },
            { id: WidgetType.DASH_RANK_LIST, icon: BarChartHorizontal, label: '순위 리스트' },
            { id: WidgetType.DASH_TRAFFIC_TOP5, icon: Activity, label: '업무망 상태' },
            { id: WidgetType.DASH_VDI_STATUS, icon: LayoutGrid, label: 'VDI 접속 현황' }
        ]
    },
    {
        id: 'general',
        label: '일반 컴포넌트',
        description: '기본 정보 노출용 컴포넌트',
        icon: Database,
        items: [
            { id: WidgetType.TABLE, icon: LayoutGrid, label: '데이터 테이블' },
            { id: WidgetType.IMAGE, icon: ImageIcon, label: '이미지 박스' },
            { id: WidgetType.MAP, icon: MapPin, label: '지도 위젯' },
            { id: WidgetType.WEATHER, icon: CloudSun, label: '날씨 정보' },
            { id: WidgetType.GENERAL_KPI, icon: Activity, label: 'KPI (GENERAL)' },
            { id: WidgetType.EARNING_PROGRESS, icon: TrendingUp, label: 'TOTAL EARNING (PROGRESS)' },
            { id: WidgetType.EARNING_TREND, icon: Activity, label: 'EARNING TREND (CHART + KPI)' },
            { id: WidgetType.TEXT_BLOCK, icon: Type, label: '텍스트 (글자만)' },
            { id: WidgetType.VERTICAL_NAV_CARD, icon: Layers, label: '세로 네비 카드' }
        ]
    }
];

const WidgetPicker: React.FC<WidgetPickerProps> = ({ isOpen, onClose, onSelect, isDark }) => {
    const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0].id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Glass Backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-[10px] animate-in fade-in duration-500"
                onClick={onClose}
            />

            {/* Modal Body: Slim-Sharp & Bezelless Preview V2.0 */}
            <div 
                className="relative w-full max-w-3xl h-[660px] overflow-hidden rounded-[var(--radius-modal,24px)] border animate-in zoom-in-95 duration-500 flex flex-col backdrop-blur-[40px]"
                style={{
                    backgroundColor: 'var(--modal-bg)',
                    borderColor: 'var(--modal-border)',
                    boxShadow: 'var(--modal-shadow), 0 0 30px rgba(59, 130, 246, 0.1)',
                    color: 'var(--modal-text)'
                }}
            >
                {/* Aurora Neon Top Highlight Line */}
                <div className="absolute top-0 left-0 right-0 h-[1.2px] bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-60 z-20 shadow-[0_0_10px_var(--primary-color)]" />
                
                {/* Header Section: Tightened */}
                <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 z-10" style={{ borderColor: 'var(--modal-border)' }}>
                    <div className="flex items-center gap-3.5">
                        <div className="relative w-9 h-9 rounded-xl bg-[var(--primary-color)]/10 flex items-center justify-center border border-white/10 shadow-inner">
                            <Layers className="w-5 h-5 text-[var(--primary-color)]" />
                        </div>
                        <div>
                            <h3 className="text-[15px] font-bold tracking-tight uppercase leading-none">ADD NEW WIDGET</h3>
                            <p className="text-[9px] font-medium tracking-[0.5em] mt-1.5 uppercase text-primary/40" style={{ color: 'var(--modal-subtext)' }}>AURORA SYSTEM CONFIG</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all group"
                    >
                        <X className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Sharp Sidebar */}
                    <div className="w-64 border-r flex flex-col p-4 gap-2 z-10" style={{ borderColor: 'var(--modal-border)', backgroundColor: 'var(--modal-sidebar-bg)' }}>
                        <span className="text-[9px] font-bold tracking-[0.6em] uppercase px-3 mb-3 opacity-20">M O D U L E S</span>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`relative flex items-center p-2.5 px-4 rounded-xl transition-all duration-300 group ${activeCategory === cat.id 
                                    ? 'bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 shadow-sm' 
                                    : 'hover:bg-black/5 dark:hover:bg-white/[0.03] border border-transparent opacity-40 hover:opacity-80'}`}
                            >
                                {activeCategory === cat.id && (
                                    <div className="absolute left-0 w-1 h-5 bg-[var(--primary-color)] rounded-full shadow-[0_0_12px_var(--primary-color)]" />
                                )}
                                
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${activeCategory === cat.id ? 'bg-[var(--primary-color)] shadow-inner' : 'bg-black/5 dark:bg-white/5'}`}>
                                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-white' : 'opacity-40'}`} />
                                </div>
                                
                                <div className="ml-4 flex flex-col items-start leading-tight">
                                    <span className={`font-bold uppercase tracking-tight ${activeCategory === cat.id ? 'text-[13.5px]' : 'text-[12.5px]'}`}>{cat.label}</span>
                                    <span className={`text-[9px] font-medium tracking-widest mt-1 ${activeCategory === cat.id ? 'text-[var(--primary-color)]' : 'opacity-15'}`}>
                                        {cat.items.length} MODULES
                                    </span>
                                </div>
                                <ChevronRight className={`ml-auto w-3.5 h-3.5 transition-all duration-300 ${activeCategory === cat.id ? 'text-[var(--primary-color)] translate-x-1' : 'opacity-0 -translate-x-3'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Main Content: Slim Bezelless Card Grid */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/[0.01]">
                        <div className="mb-5 border-l-[3.5px] border-[var(--primary-color)] pl-4 ml-1">
                            <h4 className="text-[17px] font-bold tracking-tight uppercase opacity-90">
                                {CATEGORIES.find(c => c.id === activeCategory)?.label}
                            </h4>
                            <p className="text-[11.5px] mt-1.5 font-medium" style={{ color: 'var(--modal-subtext)' }}>
                                {CATEGORIES.find(c => c.id === activeCategory)?.description}
                            </p>
                        </div>

                        {/* Grid optimized for immersive cards: Slimmer gap */}
                        <div className="grid grid-cols-2 gap-4 px-1 pb-6">
                            {CATEGORIES.find(c => c.id === activeCategory)?.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item.id as WidgetType)}
                                    className="group relative flex flex-col h-40 overflow-hidden rounded-xl border border-white/20 hover:border-[var(--primary-color)]/30 transition-all duration-500 hover:-translate-y-1 shadow-[0_6px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] bg-black/5 dark:bg-white/5"
                                >
                                    {/* Bezelless Preview Content */}
                                    {(item as any).preview ? (
                                        /* Full Bleed Image */
                                        <div className="absolute inset-0">
                                            <img 
                                                src={isDark ? (item as any).preview.dark : (item as any).preview.light} 
                                                alt={item.label}
                                                className="w-full h-full object-cover filter transition-all duration-700 group-hover:scale-105"
                                            />
                                        </div>
                                    ) : (
                                        /* Minimal Icon Placeholder */
                                        <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-[0.1] group-hover:opacity-30 group-hover:text-[var(--primary-color)] transition-all duration-500">
                                            <item.icon className="w-10 h-10" />
                                        </div>
                                    )}

                                    {/* Text Overlay: Ultra-Clear Translucent Glass Blur */}
                                    <div className="absolute bottom-2 inset-x-2 h-10 flex items-center px-4 z-10 rounded-lg transition-all duration-500 border border-white/40"
                                        style={{ 
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(40px) saturate(180%) webkit-backdrop-filter: blur(40px) saturate(180%)',
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.03)'
                                        }}>
                                        <div className="flex-1">
                                            <span className="font-bold text-[11px] uppercase tracking-[0.14em] text-[#050a1a] dark:text-white group-hover:opacity-100 transition-opacity drop-shadow-sm">
                                                {item.label}
                                            </span>
                                        </div>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-all duration-500 text-[#050a1a] dark:text-white transform translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Bar: Slim Padding */}
                <div className="px-8 py-3.5 border-t flex items-center justify-between shrink-0 z-10" style={{ borderColor: 'var(--modal-border)', backgroundColor: 'var(--modal-sidebar-bg)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.6em] opacity-15">
                        AURORA CORE V2.0
                    </p>
                    <button 
                        onClick={onClose} 
                        className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-25 hover:opacity-100 transition-all underline underline-offset-4 decoration-current/20 hover:decoration-current"
                    >
                        TERMINAL EXIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetPicker;
