import React from 'react';
import {
    X, BarChart3, Database, LayoutGrid, ChevronRight, Layers,
    BarChartHorizontal, LineChart, AreaChart, PieChart, Hexagon,
    Workflow, Activity, Monitor, Image as ImageIcon, MapPin,
    CloudSun, TrendingUp, Type
} from 'lucide-react';
import { WidgetType } from '../types';
import { DEFAULT_WIDGET_PREVIEW, WIDGET_PREVIEW_ASSETS } from '../lib/widgetPreviewAssets';

interface WidgetPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (type: WidgetType) => void;
    isDark: boolean;
}

const getPreview = (type: WidgetType) => WIDGET_PREVIEW_ASSETS[type] ?? DEFAULT_WIDGET_PREVIEW;

const CATEGORIES = [
    {
        id: 'viz',
        label: '시각화 차트',
        description: '데이터 분석용 기본 차트',
        icon: BarChart3,
        items: [
            { id: WidgetType.CHART_BAR, icon: BarChart3, label: '세로 막대', preview: getPreview(WidgetType.CHART_BAR) },
            { id: WidgetType.CHART_BAR_HORIZONTAL, icon: BarChartHorizontal, label: '가로 막대', preview: getPreview(WidgetType.CHART_BAR_HORIZONTAL) },
            { id: WidgetType.CHART_LINE, icon: LineChart, label: '선형 차트', preview: getPreview(WidgetType.CHART_LINE) },
            { id: WidgetType.CHART_AREA, icon: AreaChart, label: '영역 차트', preview: getPreview(WidgetType.CHART_AREA) },
            { id: WidgetType.CHART_PIE, icon: PieChart, label: '파이 차트', preview: getPreview(WidgetType.CHART_PIE) },
            { id: WidgetType.CHART_RADAR, icon: Hexagon, label: '방사형 차트', preview: getPreview(WidgetType.CHART_RADAR) },
            { id: WidgetType.CHART_COMPOSED, icon: Layers, label: '혼합형 차트', preview: getPreview(WidgetType.CHART_COMPOSED) },
            { id: WidgetType.CHART_SANKEY, icon: Workflow, label: '생키 다이어그램', preview: getPreview(WidgetType.CHART_SANKEY) },
            { id: WidgetType.DASH_EQUIP_PERF_TOP5, icon: BarChart3, label: '전체 장비 성능 Top5', preview: getPreview(WidgetType.DASH_EQUIP_PERF_TOP5) }
        ]
    },
    {
        id: 'premium',
        label: '프리미엄 템플릿',
        description: '고용량 데이터 최적화 템플릿',
        icon: LayoutGrid,
        items: [
            { id: WidgetType.SUMMARY, icon: Database, label: '단일 수치 (STAT)', preview: getPreview(WidgetType.SUMMARY) },
            { id: WidgetType.SUMMARY_CHART, icon: Activity, label: '트렌드 요약', preview: getPreview(WidgetType.SUMMARY_CHART) },
            { id: WidgetType.DASH_FAILURE_STATUS, icon: Activity, label: '장애 현황 (KPI)', preview: getPreview(WidgetType.DASH_FAILURE_STATUS) },
            { id: WidgetType.DASH_NET_TRAFFIC, icon: Activity, label: '네트워크 트래픽', preview: getPreview(WidgetType.DASH_NET_TRAFFIC) },
            { id: WidgetType.DASH_SECURITY_STATUS, icon: Hexagon, label: '보안 탐지 현황 (V1)', preview: getPreview(WidgetType.DASH_SECURITY_STATUS) },
            { id: WidgetType.DASH_SECURITY_STATUS_V2, icon: Hexagon, label: '보안 침해 현황 (V2)', preview: getPreview(WidgetType.DASH_SECURITY_STATUS_V2) },
            { id: WidgetType.DASH_RESOURCE_USAGE, icon: BarChart3, label: '리소스 사용률', preview: getPreview(WidgetType.DASH_RESOURCE_USAGE) },
            { id: WidgetType.DASH_FACILITY_1, icon: Database, label: '시설 현황', preview: getPreview(WidgetType.DASH_FACILITY_1) },
            { id: WidgetType.DASH_FACILITY_2, icon: Monitor, label: '시설 상태', preview: getPreview(WidgetType.DASH_FACILITY_2) },
            { id: WidgetType.DASH_FACILITY_2_FIGMA, icon: Monitor, label: '시설 현황 (Type 3)', preview: getPreview(WidgetType.DASH_FACILITY_2_FIGMA) },
            { id: WidgetType.DASH_RANK_LIST, icon: BarChartHorizontal, label: '순위 리스트', preview: getPreview(WidgetType.DASH_RANK_LIST) },
            { id: WidgetType.DASH_TRAFFIC_TOP5, icon: Activity, label: '업무망 상태', preview: getPreview(WidgetType.DASH_TRAFFIC_TOP5) },
            { id: WidgetType.DASH_VDI_STATUS, icon: LayoutGrid, label: 'VDI 접속 현황', preview: getPreview(WidgetType.DASH_VDI_STATUS) }
        ]
    },
    {
        id: 'general',
        label: '일반 컴포넌트',
        description: '기본 정보 노출용 컴포넌트',
        icon: Database,
        items: [
            { id: WidgetType.TABLE, icon: LayoutGrid, label: '데이터 테이블', preview: getPreview(WidgetType.TABLE) },
            { id: WidgetType.IMAGE, icon: ImageIcon, label: '이미지 박스', preview: getPreview(WidgetType.IMAGE) },
            { id: WidgetType.MAP, icon: MapPin, label: '지도 위젯', preview: getPreview(WidgetType.MAP) },
            { id: WidgetType.WEATHER, icon: CloudSun, label: '날씨 정보', preview: getPreview(WidgetType.WEATHER) },
            { id: WidgetType.GENERAL_KPI, icon: Activity, label: 'KPI (GENERAL)', preview: getPreview(WidgetType.GENERAL_KPI) },
            { id: WidgetType.EARNING_PROGRESS, icon: TrendingUp, label: 'TOTAL EARNING (PROGRESS)', preview: getPreview(WidgetType.EARNING_PROGRESS) },
            { id: WidgetType.EARNING_TREND, icon: Activity, label: 'EARNING TREND (CHART + KPI)', preview: getPreview(WidgetType.EARNING_TREND) },
            { id: WidgetType.TEXT_BLOCK, icon: Type, label: '텍스트 (글자만)', preview: getPreview(WidgetType.TEXT_BLOCK) },
            { id: WidgetType.VERTICAL_NAV_CARD, icon: Layers, label: '세로 네비 카드', preview: getPreview(WidgetType.VERTICAL_NAV_CARD) }
        ]
    }
];

const WidgetPicker: React.FC<WidgetPickerProps> = ({ isOpen, onClose, onSelect, isDark }) => {
    const [activeCategory, setActiveCategory] = React.useState(CATEGORIES[0].id);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[var(--widget-picker-z-index)] flex items-center justify-center p-4">
            {/* Glass Backdrop */}
            <div
                className="absolute inset-0 animate-in fade-in duration-500"
                style={{
                    backgroundColor: 'var(--widget-picker-backdrop-bg)',
                    backdropFilter: `blur(var(--widget-picker-backdrop-blur))`,
                    WebkitBackdropFilter: `blur(var(--widget-picker-backdrop-blur))`,
                }}
                onClick={onClose}
            />

            {/* Modal Body: Slim-Sharp & Bezelless Preview V2.0 */}
            <div
                className="relative w-full overflow-hidden rounded-[var(--radius-modal)] border animate-in zoom-in-95 duration-500 flex flex-col"
                style={{
                    maxWidth: 'var(--widget-picker-modal-max-width)',
                    height: 'var(--widget-picker-modal-height)',
                    backgroundColor: 'var(--modal-bg)',
                    borderColor: 'var(--modal-border)',
                    boxShadow: 'var(--modal-shadow), var(--widget-picker-modal-glow)',
                    backdropFilter: `blur(var(--widget-picker-modal-blur))`,
                    WebkitBackdropFilter: `blur(var(--widget-picker-modal-blur))`,
                    color: 'var(--modal-text)'
                }}
            >
                {/* Aurora Neon Top Highlight Line */}
                <div
                    className="absolute top-0 left-0 right-0 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent z-20"
                    style={{
                        height: 'var(--widget-picker-top-accent-height)',
                        opacity: 'var(--widget-picker-top-accent-opacity)',
                        boxShadow: 'var(--widget-picker-top-accent-shadow)',
                    }}
                />

                {/* Header Section: Tightened */}
                <div className="px-6 py-4 border-b flex items-center justify-between shrink-0 z-10" style={{ borderColor: 'var(--modal-border)' }}>
                    <div className="flex items-center gap-3.5">
                        <div className="relative w-9 h-9 rounded-xl bg-[var(--widget-picker-icon-bg)] flex items-center justify-center border border-[var(--widget-picker-icon-border)] shadow-inner">
                            <Layers className="w-5 h-5 text-[var(--primary-color)]" />
                        </div>
                        <div>
                            <h3 className="font-bold tracking-tight uppercase leading-none" style={{ fontSize: 'var(--text-ultra-heading)' }}>ADD NEW WIDGET</h3>
                            <p className="font-medium mt-1.5 uppercase" style={{ fontSize: 'var(--text-micro)', letterSpacing: '0.5em', color: 'var(--modal-subtext)' }}>AURORA SYSTEM CONFIG</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center hover:bg-[var(--widget-picker-close-hover-bg)] rounded-full transition-all group"
                    >
                        <X className="w-5 h-5 opacity-30 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar: Sharp Sidebar */}
                    <div className="w-64 border-r flex flex-col p-4 gap-2 z-10" style={{ borderColor: 'var(--modal-border)', backgroundColor: 'var(--modal-sidebar-bg)' }}>
                        <span className="font-bold uppercase px-3 mb-3 opacity-20" style={{ fontSize: 'var(--text-micro)', letterSpacing: '0.6em' }}>M O D U L E S</span>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`relative flex items-center p-2.5 px-4 rounded-xl transition-all duration-300 group ${activeCategory === cat.id
                                    ? 'border shadow-sm'
                                    : 'border border-transparent opacity-40 hover:opacity-80'}`}
                                style={activeCategory === cat.id
                                    ? { backgroundColor: 'var(--widget-picker-pill-tint-active)', borderColor: 'var(--widget-picker-pill-border-active)' }
                                    : { backgroundColor: 'transparent' }}
                            >
                                {activeCategory === cat.id && (
                                    <div className="absolute left-0 w-1 h-5 bg-[var(--primary-color)] rounded-full" style={{ boxShadow: 'var(--widget-picker-pill-shadow-active)' }} />
                                )}

                                <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all" style={{ backgroundColor: activeCategory === cat.id ? 'var(--primary-color)' : 'var(--widget-picker-pill-tint)' }}>
                                    <cat.icon className={`w-4 h-4 ${activeCategory === cat.id ? 'text-[var(--white)]' : 'opacity-40'}`} />
                                </div>

                                <div className="ml-4 flex flex-col items-start leading-tight">
                                    <span className="font-bold uppercase tracking-tight" style={{ fontSize: activeCategory === cat.id ? 'var(--text-small)' : 'var(--text-base)' }}>{cat.label}</span>
                                    <span className="font-medium tracking-widest mt-1" style={{ fontSize: 'var(--text-micro)', color: activeCategory === cat.id ? 'var(--primary-color)' : 'currentColor', opacity: activeCategory === cat.id ? 1 : 0.15 }}>
                                        {cat.items.length} MODULES
                                    </span>
                                </div>
                                <ChevronRight className={`ml-auto w-3.5 h-3.5 transition-all duration-300 ${activeCategory === cat.id ? 'text-[var(--primary-color)] translate-x-1' : 'opacity-0 -translate-x-3'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Main Content: Slim Bezelless Card Grid */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar" style={{ backgroundColor: 'var(--widget-picker-sidebar-tint)' }}>
                        <div className="mb-5 border-l-[3.5px] border-[var(--primary-color)] pl-4 ml-1">
                            <h4 className="font-bold tracking-tight uppercase opacity-90" style={{ fontSize: 'var(--text-compact-heading)' }}>
                                {CATEGORIES.find(c => c.id === activeCategory)?.label}
                            </h4>
                            <p className="mt-1.5 font-medium" style={{ fontSize: 'var(--text-ultra-label)', color: 'var(--modal-subtext)' }}>
                                {CATEGORIES.find(c => c.id === activeCategory)?.description}
                            </p>
                        </div>

                        {/* Grid optimized for immersive cards: Slimmer gap */}
                        <div className="grid grid-cols-2 gap-4 px-1 pb-6">
                            {CATEGORIES.find(c => c.id === activeCategory)?.items.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => onSelect(item.id as WidgetType)}
                                    className="group relative flex flex-col h-40 overflow-hidden rounded-xl border transition-all duration-500 hover:-translate-y-1"
                                    style={{
                                        borderColor: 'var(--widget-picker-card-border)',
                                        boxShadow: 'var(--widget-picker-card-shadow-base)',
                                        backgroundColor: 'var(--widget-picker-pill-tint)',
                                    }}
                                >
                                    {/* Bezelless Preview Content */}
                                    {(item as any).preview ? (
                                        /* Full Bleed Image */
                                        <div className="absolute inset-0">
                                            <img
                                                src={isDark ? (item as any).preview.dark : (item as any).preview.light}
                                                alt={item.label}
                                                className="w-full h-full object-cover filter transition-all duration-700 group-hover:scale-105"
                                                onError={(e) => {
                                                    const img = e.currentTarget;
                                                    img.onerror = null;
                                                    img.src = isDark ? DEFAULT_WIDGET_PREVIEW.dark : DEFAULT_WIDGET_PREVIEW.light;
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        /* Minimal Icon Placeholder */
                                        <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-10 group-hover:opacity-30 group-hover:text-[var(--primary-color)] transition-all duration-500">
                                            <item.icon className="w-10 h-10" />
                                        </div>
                                    )}

                                    {/* Text Overlay: Ultra-Clear Translucent Glass Blur */}
                                    <div className="absolute bottom-2 inset-x-2 h-10 flex items-center px-4 z-10 rounded-lg transition-all duration-500 border"
                                        style={{
                                            background: isDark ? 'var(--widget-picker-pill-tint)' : 'var(--widget-picker-pill-tint)',
                                            backdropFilter: 'blur(2px) saturate(160%)',
                                            WebkitBackdropFilter: 'blur(2px) saturate(160%)',
                                            borderColor: 'var(--widget-picker-card-border)',
                                            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.2)' : '0 4px 20px rgba(0,0,0,0.03)'
                                        }}>
                                        <div className="flex-1">
                                            <span className="font-bold uppercase group-hover:opacity-100 transition-opacity drop-shadow-sm"
                                                style={{ fontSize: 'var(--text-ultra-label)', letterSpacing: '0.14em', color: isDark ? 'var(--white)' : 'var(--widget-picker-label-light)' }}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                        <ChevronRight
                                            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0"
                                            style={{ color: isDark ? 'var(--white)' : 'var(--widget-picker-label-light)' }}
                                        />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer Bar: Slim Padding */}
                <div className="px-8 py-3.5 border-t flex items-center justify-between shrink-0 z-10" style={{ borderColor: 'var(--modal-border)', backgroundColor: 'var(--modal-sidebar-bg)' }}>
                    <p className="font-bold uppercase opacity-15" style={{ fontSize: 'var(--text-caption)', letterSpacing: '0.6em' }}>
                        AURORA CORE V2.0
                    </p>
                    <button
                        onClick={onClose}
                        className="font-bold uppercase opacity-25 hover:opacity-100 transition-all underline underline-offset-4 decoration-current/20 hover:decoration-current"
                        style={{ fontSize: 'var(--text-ultra-label)', letterSpacing: '0.2em' }}
                    >
                        TERMINAL EXIT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WidgetPicker;
