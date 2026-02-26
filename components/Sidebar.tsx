import React from 'react';
import {
  X, Layers, BarChart3, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, LayoutGrid, Plus, Trash2, Database,
  Maximize2, AreaChart as AreaIcon, Palette, ChevronUp, ChevronDown,
  Heading, Activity, Palette as PaletteIcon, Check, Smile, BarChartHorizontal,
  Hexagon, Monitor, MoveVertical, CloudSun, Image, MapPin, Eye, EyeOff, Workflow,
  RotateCcw
} from 'lucide-react';
import { Widget, WidgetType, LayoutConfig, ChartSeries, DashboardTheme, ThemeMode } from '../types';
import { BRAND_COLORS, TYPE_DEFAULT_DATA, WIDGET_METADATA, GENERAL_KPI_ICON_OPTIONS } from '../constants';
import Switch from './Switch';

interface SidebarProps {
  theme: DashboardTheme;
  selectedWidget: Widget | null;
  layout: LayoutConfig;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateLayout: (updates: Partial<LayoutConfig>) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, selectedWidget, layout, onUpdateWidget, onUpdateLayout, onClose }) => {
  const [activeDualTab, setActiveDualTab] = React.useState<0 | 1>(0);
  const isCyber = theme.mode === ThemeMode.CYBER;

  if (!selectedWidget) return (
    <div className={`w-80 h-full flex flex-col p-6 space-y-8 overflow-hidden transition-all duration-500 ${isCyber ? 'bg-black/95 border-l border-cyan-500/50 shadow-[0_0_40px_rgba(0,229,255,0.15)]' : 'bg-[var(--surface)] border-l border-[var(--border-base)] shadow-2xl'}`}>
      <div className={`flex items-center justify-between mb-4 border-b ${isCyber ? 'border-cyan-500/30 pb-4' : 'border-transparent'}`}>
        <h2 className={`text-xl font-bold tracking-tighter ${isCyber ? 'text-cyan-400 italic' : ''}`}>
          {isCyber ? <span className="glitch-text" data-text="LAYOUT_CTRL">LAYOUT_CTRL</span> : 'Layout Settings'}
        </h2>
        <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-6 overflow-y-auto custom-scrollbar pr-1">
        {/* 시나리오 카드: 어떤 레이아웃으로 할까? */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">어떤 레이아웃으로 할까?</span>
          <div className="grid grid-cols-1 gap-2">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-base)]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--background)] border border-[var(--border-muted)] flex items-center justify-center p-1" title="픽셀 단위로 세밀하게">
                <svg viewBox="0 0 24 24" className="w-full h-full text-primary/70"><rect x="2" y="2" width="6" height="5" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="9" y="2" width="6" height="8" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="16" y="2" width="6" height="4" fill="currentColor" opacity="0.35" rx="0.5"/><rect x="2" y="8" width="5" height="6" fill="currentColor" opacity="0.45" rx="0.5"/><rect x="8" y="11" width="7" height="5" fill="currentColor" opacity="0.5" rx="0.5"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--text-main)]">픽셀 단위로 세밀하게</p>
                <p className="text-[9px] text-muted">그리드 OFF. 위젯 크기를 마우스까지 자유롭게</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border-base)]">
              <div className="w-10 h-10 shrink-0 rounded-lg bg-[var(--background)] border border-[var(--border-muted)] flex items-center justify-center p-1" title="고정 높이 + 스크롤">
                <svg viewBox="0 0 24 24" className="w-full h-full text-primary/70"><rect x="1" y="1" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.2" rx="1"/><rect x="3" y="3" width="18" height="4" fill="currentColor" opacity="0.25" rx="0.5"/><rect x="3" y="8" width="18" height="4" fill="currentColor" opacity="0.2" rx="0.5"/><rect x="3" y="13" width="18" height="4" fill="currentColor" opacity="0.15" rx="0.5"/><line x1="20" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/><circle cx="20" cy="18" r="1.2" fill="currentColor" opacity="0.5"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-[var(--text-main)]">고정 높이 + 스크롤</p>
                <p className="text-[9px] text-muted">Fit OFF. Row Height(px) 고정, 내용 많으면 스크롤</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-semibold text-muted uppercase flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Layout Config
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-70"><rect x="1" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="6" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="11" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5"/></svg>
                Columns
              </span>
              <input
                type="number" min="1" max="96"
                value={layout.columns}
                onChange={(e) => onUpdateLayout({ columns: parseInt(e.target.value) || 1 })}
                className={`w-full p-2 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all rounded-[var(--radius-md)]`}
              />
            </div>
            <div className={`space-y-1 ${!layout.fitToScreen ? 'opacity-50 pointer-events-none' : ''}`} title={!layout.fitToScreen ? 'Fit to Screen ON일 때만 적용됩니다' : undefined}>
              <span className="text-xs text-muted font-medium flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-70"><rect x="1" y="1" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="1" y="6" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="1" y="11" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/></svg>
                Rows {!layout.fitToScreen && <span className="text-[9px]">(Fit ON일 때)</span>}
              </span>
              <input
                type="number" min="1" max="200"
                value={layout.rows}
                onChange={(e) => onUpdateLayout({ rows: parseInt(e.target.value) || 1 })}
                className={`w-full p-2 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all rounded-[var(--radius-md)]`}
              />
            </div>
          </div>

          {/* Fit to Screen — 그리드 사용과 둘 중 하나만 ON */}
          <div
            className={`flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-[var(--radius-xl)] transition-all ${layout.useGrid !== false ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--border-muted)]'}`}
            title={layout.useGrid !== false ? '그리드 사용을 OFF로 하면 선택할 수 있습니다' : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--background)] border border-[var(--border-muted)] flex items-center justify-center p-1" title={layout.fitToScreen ? '화면에 꽉 참' : '스크롤 가능'}>
                {layout.fitToScreen ? (
                  <svg viewBox="0 0 20 20" className="w-full h-full text-blue-500"><rect x="0.5" y="0.5" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1" rx="1"/><line x1="0.5" y1="6" x2="19.5" y2="6" stroke="currentColor" strokeWidth="0.6" opacity="0.8"/><line x1="0.5" y1="13" x2="19.5" y2="13" stroke="currentColor" strokeWidth="0.6" opacity="0.8"/><line x1="6" y1="0.5" x2="6" y2="19.5" stroke="currentColor" strokeWidth="0.6" opacity="0.8"/><line x1="13" y1="0.5" x2="13" y2="19.5" stroke="currentColor" strokeWidth="0.6" opacity="0.8"/></svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="w-full h-full text-muted"><rect x="0.5" y="0.5" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1" rx="1"/><rect x="2" y="2" width="16" height="5" fill="currentColor" opacity="0.2" rx="0.5"/><rect x="2" y="8" width="16" height="5" fill="currentColor" opacity="0.15" rx="0.5"/><line x1="18" y1="2" x2="18" y2="18" stroke="currentColor" strokeWidth="0.6" opacity="0.6"/><circle cx="18" cy="16" r="1" fill="currentColor" opacity="0.5"/></svg>
                )}
              </div>
              <span className="text-xs font-bold text-secondary">Fit to Screen</span>
            </div>
            <Switch
              checked={layout.fitToScreen}
              onChange={(checked) => onUpdateLayout(checked ? { fitToScreen: true, useGrid: false } : { fitToScreen: false })}
              disabled={layout.useGrid !== false}
            />
          </div>

          {/* Row Height Config (Active only when fitToScreen is FALSE) */}
          <div className={`space-y-1 pt-1 transition-opacity ${layout.fitToScreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <span className="text-[10px] uppercase font-bold text-muted ml-1 flex items-center gap-1.5">
              <MoveVertical className="w-3 h-3" /> Default Row Height (px) {layout.fitToScreen && <span className="normal-case font-normal">(Fit OFF일 때만)</span>}
            </span>
            <input
              type="number"
              min="10"
              max="200"
              step="5"
              value={layout.defaultRowHeight}
              onChange={(e) => onUpdateLayout({ defaultRowHeight: Math.max(10, parseInt(e.target.value, 10) || 20) })}
              className={`w-full p-2.5 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] transition-all font-mono rounded-[var(--radius-xl)]`}
            />
          </div>

          {/* 그리드 사용 — Fit to Screen과 둘 중 하나만 ON */}
          <div
            className={`flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-[var(--radius-xl)] transition-all ${layout.fitToScreen ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer hover:bg-[var(--border-muted)]'}`}
            title={layout.fitToScreen ? 'Fit to Screen을 OFF로 하면 선택할 수 있습니다' : undefined}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--background)] border border-[var(--border-muted)] flex items-center justify-center p-1" title={layout.useGrid !== false ? '칸 단위 스냅' : '픽셀 자유'}>
                {layout.useGrid !== false ? (
                  <svg viewBox="0 0 20 20" className="w-full h-full text-primary"><rect x="1" y="1" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="7" y="1" width="5" height="5" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="13" y="1" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="1" y="7" width="5" height="5" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="7" y="7" width="5" height="5" fill="currentColor" opacity="0.6" rx="0.5"/><rect x="13" y="7" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5"/></svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="w-full h-full text-primary"><rect x="2" y="2" width="5" height="4" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="8" y="2" width="6" height="7" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="15" y="2" width="3" height="3" fill="currentColor" opacity="0.35" rx="0.5"/><rect x="2" y="7" width="4" height="5" fill="currentColor" opacity="0.45" rx="0.5"/><rect x="7" y="10" width="6" height="4" fill="currentColor" opacity="0.5" rx="0.5"/></svg>
                )}
              </div>
              <span className="text-xs font-bold text-secondary">그리드 사용</span>
            </div>
            <Switch
              checked={layout.useGrid !== false}
              onChange={(checked) => onUpdateLayout(checked ? { useGrid: true, fitToScreen: false } : { useGrid: false })}
              disabled={layout.fitToScreen}
            />
          </div>
          <div className={`space-y-1 pt-1 transition-opacity ${layout.useGrid !== false ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <p className="text-[10px] text-muted px-1">
              그리드 OFF일 때 위젯 크기를 <strong>마우스 위치까지</strong> 자유롭게 늘렸다 줄였다 할 수 있습니다.
            </p>
          </div>

          {/* 해상도별 레이아웃 (Breakpoints) */}
          <div
            className={`flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] cursor-pointer hover:bg-[var(--border-muted)] transition-all group rounded-[var(--radius-xl)]`}
          >
            <span className="text-xs font-bold text-secondary">해상도별 레이아웃 (BREAKPOINTS)</span>
            <Switch
              checked={layout.useResponsive ?? false}
              onChange={(checked) => onUpdateLayout({ useResponsive: checked })}
            />
          </div>
          <p className="text-[10px] text-muted px-1">LG(1200px) / MD(996px) / SM(768px) / XS(480px) 구간별로 컬럼·레이아웃 전환</p>

          {/* 자유 배치 (Free Position) */}
          <div
            className={`flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] cursor-pointer hover:bg-[var(--border-muted)] transition-all group rounded-[var(--radius-xl)]`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-[var(--background)] border border-[var(--border-muted)] flex items-center justify-center p-1" title="위로 쏠리지 않고 고정">
                <svg viewBox="0 0 20 20" className="w-full h-full text-primary/70"><rect x="1" y="2" width="18" height="5" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="3" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5"/><rect x="11" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5"/></svg>
              </div>
              <span className="text-xs font-bold text-secondary">자유 배치 (FREE POSITION)</span>
            </div>
            <Switch
              checked={layout.freePosition ?? false}
              onChange={(checked) => onUpdateLayout({ freePosition: checked })}
            />
          </div>
          <p className="text-[10px] text-muted px-1">위젯이 위로 쏠리지 않고 원하는 위치(정중앙 등)에 고정되도록 합니다.</p>

          <p className="text-[10px] text-muted italic px-1 leading-relaxed border-t border-[var(--border-muted)] pt-3 mt-2">
            * <strong>Fit to Screen</strong>과 <strong>그리드 사용</strong>은 둘 중 하나만 켤 수 있습니다.<br />
            * <strong>Fit ON</strong>: 화면 높이를 Rows만큼 나누어 스크롤 없이 꽉 차게 표시<br />
            * <strong>Fit OFF</strong>: 지정된 Row Height(px)만큼 고정, 내용이 많으면 스크롤 발생
          </p>
        </div>
      </div>
    </div >
  );

  const isSec = selectedWidget.isDual && activeDualTab === 1;

  const currentType = isSec ? (selectedWidget.secondaryType || selectedWidget.type) : selectedWidget.type;
  const currentConfig = isSec ? (selectedWidget.secondaryConfig || selectedWidget.config) : selectedWidget.config;
  const currentData = isSec ? (selectedWidget.secondaryData || selectedWidget.data || []) : (selectedWidget.data || []);
  const currentMainValue = isSec ? (selectedWidget.secondaryMainValue || '0') : (selectedWidget.mainValue || '0');
  const currentSubValue = isSec ? (selectedWidget.secondarySubValue || '') : (selectedWidget.subValue || '');

  const updateCurrentWidget = (updates: Partial<Widget>) => {
    if (!isSec) {
      onUpdateWidget(selectedWidget.id, updates);
    } else {
      const secUpdates: any = {};
      if (updates.type) secUpdates.secondaryType = updates.type;
      if (updates.config) secUpdates.secondaryConfig = { ...selectedWidget.secondaryConfig, ...updates.config };
      if (updates.data) secUpdates.secondaryData = updates.data;
      if (updates.mainValue !== undefined) secUpdates.secondaryMainValue = updates.mainValue;
      if (updates.subValue !== undefined) secUpdates.secondarySubValue = updates.subValue;
      onUpdateWidget(selectedWidget.id, secUpdates);
    }
  };

  const toggleConfig = (key: string) => {
    if (key === 'noBezel') {
      onUpdateWidget(selectedWidget.id, { noBezel: !selectedWidget.noBezel });
      return;
    }

    if (key === 'hideHeader') {
      onUpdateWidget(selectedWidget.id, { hideHeader: !selectedWidget.hideHeader });
      return;
    }

    const currentValue = (currentConfig as any)[key];
    const updates: any = { [key]: !currentValue };

    if (key === 'showLegend' && currentValue === true) {
      updates.showUnitInLegend = false;
    }

    updateCurrentWidget({
      config: { ...currentConfig, ...updates }
    });
  };

  const handleTypeChange = (newType: WidgetType) => {
    const defaultData = TYPE_DEFAULT_DATA[newType];
    if (defaultData) {
      updateCurrentWidget({
        type: newType,
        data: JSON.parse(JSON.stringify(defaultData.data)),
        config: { ...currentConfig, ...JSON.parse(JSON.stringify(defaultData.config)) },
        mainValue: defaultData.mainValue,
        subValue: defaultData.subValue
      });
    } else {
      updateCurrentWidget({ type: newType });
    }
  };

  const handleDataChange = (index: number, key: string, value: any) => {
    const newData = [...currentData];
    newData[index] = { ...newData[index], [key]: value };
    updateCurrentWidget({ data: newData });
  };

  const addDataRow = () => {
    const xAxisKey = currentConfig.xAxisKey || 'name';
    const defaultObj: any = { [xAxisKey]: `Item ${currentData.length + 1}` };
    const seriesKeys = currentConfig.series?.length > 0 ? currentConfig.series.map(s => s.key) : ['value'];

    // Initialize yAxisKey if it exists and is not a series key (e.g. for Sankey 'target')
    if (currentConfig.yAxisKey && !seriesKeys.includes(currentConfig.yAxisKey)) {
      defaultObj[currentConfig.yAxisKey] = `Target ${currentData.length + 1}`;
    }

    seriesKeys.forEach(k => defaultObj[k] = 0);
    updateCurrentWidget({ data: [...currentData, defaultObj] });
  };

  const removeDataRow = (index: number) => {
    updateCurrentWidget({ data: currentData.filter((_, i) => i !== index) });
  };

  const handleAddSeries = () => {
    const newKey = `value_${Date.now()}`;
    const shades = [50, 70, 30, 90, 10, 60, 40, 80, 20];
    const currentLen = currentConfig.series?.length || 0;
    const shadeStep = shades[currentLen % shades.length];

    const newSeries: ChartSeries = {
      key: newKey,
      label: `Series ${currentLen + 1}`,
      color: currentLen === 0 ? 'var(--primary-color)' : `var(--primary-${shadeStep})`
    };
    updateCurrentWidget({
      config: { ...currentConfig, series: [...(currentConfig.series || []), newSeries] },
      data: currentData.map(d => ({ ...d, [newKey]: 0 }))
    });
  };

  const handleUpdateSeries = (key: string, updates: Partial<ChartSeries>) => {
    updateCurrentWidget({
      config: { ...currentConfig, series: currentConfig.series.map(s => s.key === key ? { ...s, ...updates } : s) }
    });
  };

  const handleRemoveSeries = (key: string) => {
    updateCurrentWidget({
      config: { ...currentConfig, series: currentConfig.series.filter(s => s.key !== key) }
    });
  };

  const moveSeries = (index: number, direction: 'up' | 'down') => {
    const newSeries = [...(currentConfig.series || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSeries.length) return;

    [newSeries[index], newSeries[targetIndex]] = [newSeries[targetIndex], newSeries[index]];
    updateCurrentWidget({
      config: { ...currentConfig, series: newSeries }
    });
  };

  /** Data Series 색상을 브랜드/테마 색으로 초기화 (디자인에서 primary 바꾸면 다시 반영되도록) */
  const handleResetSeriesColors = () => {
    const shades = [50, 70, 30, 90, 10, 60, 40, 80, 20];
    const series = currentConfig.series || [];
    const newSeries = series.map((s, i) => ({
      ...s,
      color: i === 0 ? 'var(--primary-color)' : `var(--primary-${shades[(i - 1) % shades.length]})`,
      endColor: undefined
    }));
    updateCurrentWidget({ config: { ...currentConfig, series: newSeries } });
  };

  const isSummary = [WidgetType.SUMMARY].includes(currentType);
  const isGeneralKpi = currentType === WidgetType.GENERAL_KPI;
  const isEarningProgress = currentType === WidgetType.EARNING_PROGRESS;
  const isEarningTrend = currentType === WidgetType.EARNING_TREND;
  const isTextBlock = currentType === WidgetType.TEXT_BLOCK;
  const isPremiumSummary = [WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS, WidgetType.DASH_RESOURCE_USAGE].includes(currentType);
  const isSummaryChart = currentType === WidgetType.SUMMARY_CHART;
  const isTable = currentType === WidgetType.TABLE;
  const isPie = currentType === WidgetType.CHART_PIE;
  const isImage = currentType === WidgetType.IMAGE;
  const isChart = String(currentType).includes('CHART') || isTable || [WidgetType.DASH_RANK_LIST, WidgetType.DASH_FAILURE_STATS, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_TRAFFIC_TOP5, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

  const isAxisChart = [
    WidgetType.CHART_BAR,
    WidgetType.CHART_BAR_HORIZONTAL,
    WidgetType.CHART_LINE,
    WidgetType.CHART_AREA,
    WidgetType.CHART_COMPOSED,
    WidgetType.DASH_FAILURE_STATS,
    WidgetType.DASH_TRAFFIC_STATUS,
    WidgetType.DASH_NET_TRAFFIC
  ].includes(currentType);

  const isGridChart = isAxisChart || currentType === WidgetType.CHART_RADAR;
  const canShowLegend = isChart && !isTable && !isSummaryChart && ![WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_RANK_LIST, WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_TRAFFIC_TOP5, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

  // 위젯 타입별 가용 옵션 필터링
  const appearanceOptions = [
    { key: 'showLegend', label: 'Show Legend', visible: canShowLegend || currentType === WidgetType.DASH_NET_TRAFFIC },
    { key: 'showUnitInLegend', label: 'Show Unit in Legend', visible: canShowLegend && currentConfig.showLegend },
    { key: 'showLabels', label: 'Show Labels', visible: isPie },
    { key: 'showGrid', label: 'Show Grid Lines', visible: isGridChart },
    { key: 'showXAxis', label: 'Show X-Axis', visible: isAxisChart },
    { key: 'showYAxis', label: 'Show Y-Axis', visible: isAxisChart },
    { key: 'useGradient', label: 'Gradient Fill', visible: isAxisChart || currentType === WidgetType.SUMMARY },
    { key: 'hideHeader', label: 'Hide Header', visible: true },
    { key: 'noBezel', label: 'No Bezel', visible: true },
  ].filter(opt => opt.visible);


  return (
    <div className={`w-80 h-full flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar transition-all duration-500 ${isCyber ? 'bg-black/95 border-l border-cyan-500/50 shadow-[0_0_40px_rgba(0,229,255,0.15)]' : 'bg-[var(--surface)] border-l border-[var(--border-base)] shadow-2xl'}`}>
      <div className={`flex items-center justify-between border-b ${isCyber ? 'border-cyan-500/30 pb-4 mb-2' : 'border-transparent mb-4'}`}>
        <h2 className={`text-xl font-bold tracking-tighter ${isCyber ? 'text-cyan-400 italic' : ''}`}>
          {isCyber ? <span className="glitch-text" data-text="WIDGET_CONFIG_v2">WIDGET_CONFIG_v2</span> : 'Widget Settings'}
        </h2>
        <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 pt-2 pb-2">
        <div
          onClick={() => {
            const isDual = !selectedWidget.isDual;
            onUpdateWidget(selectedWidget.id, {
              isDual,
              dualLayout: selectedWidget.dualLayout || 'horizontal',
              dualGap: selectedWidget.dualGap ?? 16,
              secondaryType: selectedWidget.secondaryType || selectedWidget.type,
              secondaryConfig: selectedWidget.secondaryConfig || selectedWidget.config,
              secondaryData: selectedWidget.secondaryData || selectedWidget.data,
              showSubTitles: selectedWidget.showSubTitles ?? false,
              subTitle1: selectedWidget.subTitle1 || 'Primary',
              subTitle2: selectedWidget.subTitle2 || 'Secondary'
            });
          }}
          className="flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-2xl cursor-pointer hover:bg-[var(--border-muted)] transition-all group"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className={`w-4 h-4 ${selectedWidget.isDual ? 'text-[var(--primary-color)]' : 'text-[var(--text-muted)]'}`} />
            <span className="text-sm font-black uppercase tracking-tighter">Dual Mode</span>
          </div>
          <Switch
            checked={selectedWidget.isDual || false}
            onChange={(checked) => {
              onUpdateWidget(selectedWidget.id, {
                isDual: checked,
                dualLayout: selectedWidget.dualLayout || 'horizontal',
                dualGap: selectedWidget.dualGap ?? 16,
                secondaryType: selectedWidget.secondaryType || selectedWidget.type,
                secondaryConfig: selectedWidget.secondaryConfig || selectedWidget.config,
                secondaryData: selectedWidget.secondaryData || selectedWidget.data,
                showSubTitles: selectedWidget.showSubTitles ?? false,
                subTitle1: selectedWidget.subTitle1 || 'Primary',
                subTitle2: selectedWidget.subTitle2 || 'Secondary'
              });
            }}
          />
        </div>

        {selectedWidget.isDual && (
          <div className="flex p-1 bg-[var(--surface-muted)] rounded-[var(--radius-xl)]">
            <button
              onClick={() => setActiveDualTab(0)}
              className={`flex-1 py-2 px-3 rounded-[var(--radius-lg)] text-[10px] font-black uppercase tracking-widest transition-all ${activeDualTab === 0 ? 'bg-[var(--surface)] text-[var(--primary-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              Left Graph
            </button>
            <button
              onClick={() => setActiveDualTab(1)}
              className={`flex-1 py-2 px-3 rounded-[var(--radius-lg)] text-[10px] font-black uppercase tracking-widest transition-all ${activeDualTab === 1 ? 'bg-[var(--surface)] text-[var(--primary-color)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
            >
              Right Graph
            </button>
          </div>
        )}
      </div>

      {
        selectedWidget.isDual && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> Dual Layout Config
            </label>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onUpdateWidget(selectedWidget.id, { dualLayout: 'horizontal' })}
                  className={`p-2.5 ${isCyber ? 'rounded-md' : 'rounded-xl'} border text-[10px] font-bold uppercase transition-all ${selectedWidget.dualLayout === 'horizontal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-[var(--border-base)] text-gray-400'}`}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => onUpdateWidget(selectedWidget.id, { dualLayout: 'vertical' })}
                  className={`p-2.5 ${isCyber ? 'rounded-md' : 'rounded-xl'} border text-[10px] font-bold uppercase transition-all ${selectedWidget.dualLayout === 'vertical' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-[var(--border-base)] text-gray-400'}`}
                >
                  Vertical
                </button>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex justify-between">
                  Gap (Spacing) <span>{selectedWidget.dualGap ?? 16}px</span>
                </span>
                <input
                  type="range" min="0" max="64" step="4"
                  value={selectedWidget.dualGap ?? 16}
                  onChange={(e) => onUpdateWidget(selectedWidget.id, { dualGap: parseInt(e.target.value) })}
                  className={`w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-700 ${isCyber ? 'rounded-md' : 'rounded-lg'} appearance-none cursor-pointer`}
                />
              </div>

              <div className="pt-2 border-t border-[var(--border-muted)] space-y-3">
                <div className="flex items-center justify-between group">
                  <span className="text-xs font-black text-muted uppercase tracking-tighter">Show Subtitles</span>
                  <Switch
                    checked={selectedWidget.showSubTitles || false}
                    onChange={(checked) => onUpdateWidget(selectedWidget.id, { showSubTitles: checked })}
                  />
                </div>

                {selectedWidget.showSubTitles && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={selectedWidget.subTitle1 || ''}
                      onChange={(e) => onUpdateWidget(selectedWidget.id, { subTitle1: e.target.value })}
                      className={`p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-lg'} text-[10px] font-bold outline-none`}
                      placeholder="Left Label"
                    />
                    <input
                      type="text"
                      value={selectedWidget.subTitle2 || ''}
                      onChange={(e) => onUpdateWidget(selectedWidget.id, { subTitle2: e.target.value })}
                      className={`p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-lg'} text-[10px] font-bold outline-none`}
                      placeholder="Right Label"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )
      }

      <section className="space-y-4">
        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isCyber ? 'text-cyan-400/60 glitch-text' : 'text-gray-400'}`} data-text="VISUAL_MODULES">
          <Layers className="w-4 h-4" /> {isCyber ? 'VISUAL_MODULES' : 'Visualization'}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'viz')
            .map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id as WidgetType)}
                className={`p-2 flex flex-col items-center gap-1 ${isCyber ? 'rounded-md' : 'rounded-xl'} transition-all ${isCyber
                  ? `btn-surface ${currentType === id ? 'active' : ''}`
                  : `border ${currentType === id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] text-gray-400 hover:border-gray-300'
                  }`
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
              </button>
            ))}
        </div>
      </section>

      {/* Premium Dashboard Templates */}
      <section className="space-y-4">
        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${isCyber ? 'text-cyan-400/60 glitch-text' : 'text-gray-400'}`} data-text="TACTICAL_TEMPLATES">
          <PaletteIcon className="w-4 h-4" /> {isCyber ? 'TACTICAL_TEMPLATES' : 'Premium Templates'}
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'premium')
            .map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id as WidgetType)}
                className={`p-2 flex flex-col items-center gap-1 ${isCyber ? 'rounded-md' : 'rounded-xl'} transition-all ${isCyber
                  ? `btn-surface ${currentType === id ? 'active' : ''}`
                  : `border ${currentType === id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                    : 'bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] text-gray-400 hover:border-gray-300'
                  }`
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
              </button>
            ))}
        </div>
      </section>

      {/* General Widgets Section */}
      <section className="space-y-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <LayoutGrid className="w-4 h-4" /> General Components
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'general')
            .map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id as WidgetType)}
                className={`p-2 flex flex-col items-center gap-1 ${isCyber ? 'rounded-md' : 'rounded-xl'} border transition-all ${currentType === id
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                  : 'bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] text-gray-400 hover:border-gray-300'
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
              </button>
            ))}
        </div>
      </section>


      {
        isSummary && !isGeneralKpi && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Smile className="w-4 h-4" /> 트렌드 요약
            </label>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block mb-1">큰 숫자 크기 (px)</span>
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={selectedWidget.titleSize ?? 48}
                  onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Google Icon Name</span>
                <div className="relative group mt-1">
                  <input
                    type="text"
                    value={(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || ''}
                    onChange={(e) => updateCurrentWidget({ icon: e.target.value })}
                    className="w-full p-2.5 pl-9 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all font-semibold"
                    placeholder="e.g. group, monitoring, star"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 text-lg">
                    {(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || 'star'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {
        isTextBlock && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Smile className="w-4 h-4" /> 텍스트 설정
            </label>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block mb-1">내용</span>
                <textarea
                  value={selectedWidget.mainValue ?? ''}
                  onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                  rows={4}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
                  placeholder="여기에 글자를 입력하세요."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block mb-1">글자 크기 (px)</span>
                  <input
                    type="number"
                    min={8}
                    max={72}
                    value={selectedWidget.titleSize ?? 18}
                    onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 18 })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block mb-1">굵기</span>
                  <select
                    value={selectedWidget.titleWeight ?? '400'}
                    onChange={(e) => updateCurrentWidget({ titleWeight: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="100">100 (Thin)</option>
                    <option value="200">200 (Extra Light)</option>
                    <option value="300">300 (Light)</option>
                    <option value="400">400 (Normal)</option>
                    <option value="500">500 (Medium)</option>
                    <option value="600">600 (Semi Bold)</option>
                    <option value="700">700 (Bold)</option>
                    <option value="800">800 (Extra Bold)</option>
                    <option value="900">900 (Black)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>
        )
      }

      {
        isEarningProgress && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" /> Progress
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Progress (%)</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{selectedWidget.progressValue ?? 89}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selectedWidget.progressValue ?? 89}
                onChange={(e) => updateCurrentWidget({ progressValue: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
              />
            </div>
          </section>
        )
      }

      {
        isEarningTrend && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Earning Trend
            </label>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block mb-1">큰 숫자 크기 (px)</span>
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={selectedWidget.titleSize ?? 48}
                  onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Comparison text</span>
                <input
                  type="text"
                  value={selectedWidget.comparisonText ?? ''}
                  onChange={(e) => updateCurrentWidget({ comparisonText: e.target.value })}
                  className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                  placeholder="Compared of $11,750 last year"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Trend %</span>
                  <input
                    type="number"
                    value={selectedWidget.trendPercent ?? 21}
                    onChange={(e) => updateCurrentWidget({ trendPercent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Direction</span>
                  <Switch
                    checked={selectedWidget.trendUp !== false}
                    onChange={(checked) => updateCurrentWidget({ trendUp: checked })}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{selectedWidget.trendUp !== false ? '▲ Up' : '▼ Down'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 block">Category bars</span>
                {(selectedWidget.categoryItems ?? [{ label: 'Sales', value: 8 }, { label: 'Product', value: 68, color: '#f97316' }, { label: 'Marketing', value: 12 }]).map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)]">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...(selectedWidget.categoryItems ?? [])];
                        if (!next[idx]) next[idx] = { label: '', value: 0 };
                        next[idx] = { ...next[idx], label: e.target.value };
                        updateCurrentWidget({ categoryItems: next });
                      }}
                      className="flex-1 min-w-0 p-1.5 text-sm rounded border border-[var(--border-base)] bg-white dark:bg-gray-900"
                      placeholder="Label"
                    />
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={item.value}
                      onChange={(e) => {
                        const next = [...(selectedWidget.categoryItems ?? [])];
                        if (!next[idx]) next[idx] = { label: '', value: 0 };
                        next[idx] = { ...next[idx], value: parseInt(e.target.value, 10) || 0 };
                        updateCurrentWidget({ categoryItems: next });
                      }}
                      className="w-14 p-1.5 text-sm rounded border border-[var(--border-base)] bg-white dark:bg-gray-900"
                    />
                    <input
                      type="text"
                      value={item.color ?? ''}
                      onChange={(e) => {
                        const next = [...(selectedWidget.categoryItems ?? [])];
                        if (!next[idx]) next[idx] = { label: '', value: 0 };
                        next[idx] = { ...next[idx], color: e.target.value || undefined };
                        updateCurrentWidget({ categoryItems: next });
                      }}
                      className="w-20 p-1.5 text-sm rounded border border-[var(--border-base)] bg-white dark:bg-gray-900"
                      placeholder="Color"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )
      }

      {
        isGeneralKpi && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" /> KPI Icon
            </label>
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Icon</span>
              <select
                value={(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || 'User'}
                onChange={(e) => updateCurrentWidget({ icon: e.target.value })}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
              >
                {GENERAL_KPI_ICON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </section>
        )
      }

      {
        isImage && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Image className="w-4 h-4" /> Image Settings
            </label>

            <div className="space-y-4">
              {/* File Upload */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Upload Image</span>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          updateCurrentWidget({ mainValue: reader.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className={`w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:${isCyber ? 'rounded-md' : 'rounded-lg'} file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90`}
                  />
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Or Image URL</span>
                <input
                  type="text"
                  value={currentMainValue || ''}
                  onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                  className={`w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Caption (Optional)</span>
                <input
                  type="text"
                  value={currentSubValue || ''}
                  onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                  className={`w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold`}
                  placeholder="Image description..."
                />
              </div>
            </div>
          </section>
        )
      }

      {
        !isSec && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" /> Background
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Background opacity</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{selectedWidget.backgroundOpacity ?? 100}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={selectedWidget.backgroundOpacity ?? 100}
                onChange={(e) => updateCurrentWidget({ backgroundOpacity: parseInt(e.target.value, 10) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
              />
            </div>
          </section>
        )
      }

      {
        appearanceOptions.length > 0 && (
          <section className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" /> Appearance & Display
            </label>
            <div className="space-y-2">
              {appearanceOptions.map((option) => (
                <div
                  key={option.key}
                  onClick={() => toggleConfig(option.key as any)}
                  className="flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group"
                >
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {option.label}
                  </span>
                  <div className="pointer-events-none">
                    <Switch
                      checked={
                        option.key === 'noBezel' ? (isSec ? selectedWidget.secondaryNoBezel : selectedWidget.noBezel) || false :
                          option.key === 'hideHeader' ? (selectedWidget.hideHeader || false) :
                            (currentConfig as any)[option.key] || false
                      }
                      onChange={() => { }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      }



      {
        isChart && !isSummary && !isSummaryChart && (


          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
                <Palette className="w-4 h-4" /> Data Series
              </label>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleResetSeriesColors}
                  className="btn-base btn-surface flex items-center gap-1"
                  style={{ padding: '6px 8px' }}
                  title="Reset series colors to brand/theme"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">Reset</span>
                </button>
                <button
                  onClick={handleAddSeries}
                  className="btn-base btn-surface"
                  style={{ padding: '6px' }}
                  title="Add series"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {(currentConfig.series || []).map((s, idx) => (
                <div key={s.key} className={`p-3 bg-gray-50 dark:bg-gray-800 ${isCyber ? 'rounded-md' : 'rounded-xl'} border border-[var(--border-base)] flex items-center gap-2 group transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm`}>
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveSeries(idx, 'up')}
                      className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-0 transition-all"
                    >
                      <ChevronUp className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      disabled={idx === (currentConfig.series?.length || 0) - 1}
                      onClick={() => moveSeries(idx, 'down')}
                      className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-0 transition-all"
                    >
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex gap-1 shrink-0">
                    <div className="relative group/picker">
                      <div
                        className="w-5 h-5 rounded-md border border-[var(--border-strong)] shadow-sm cursor-pointer"
                        style={{ backgroundColor: s.color?.startsWith('var') ? `var(${s.color.match(/var\(([^)]+)\)/)?.[1] || s.color})` : s.color }}
                        title="Start Color"
                      />
                      <input
                        type="color"
                        value={s.color?.startsWith('var') ? '#3b82f6' : s.color || '#3b82f6'}
                        onChange={(e) => handleUpdateSeries(s.key, { color: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    {currentConfig.useGradient && (
                      <div className="relative group/picker">
                        <div
                          className="w-5 h-5 rounded-md border border-[var(--border-strong)] shadow-sm cursor-pointer"
                          style={{ backgroundColor: s.endColor?.startsWith('var') ? `var(${s.endColor.match(/var\(([^)]+)\)/)?.[1] || s.endColor})` : s.endColor || s.color }}
                          title="End Color"
                        />
                        <input
                          type="color"
                          value={s.endColor?.startsWith('var') ? '#3b82f6' : s.endColor || s.color || '#3b82f6'}
                          onChange={(e) => handleUpdateSeries(s.key, { endColor: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={s.label}
                    onChange={(e) => handleUpdateSeries(s.key, { label: e.target.value })}
                    className="flex-1 bg-transparent border-none p-0 text-sm font-bold focus:ring-0 outline-none dark:text-white"
                  />
                  <button
                    onClick={() => handleRemoveSeries(s.key)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      }

      <section className="space-y-4 border-t dark:border-gray-800 pt-6">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Database className="w-4 h-4" /> Data Config
        </label>

        <div className="space-y-3">
          {!isSummary && (
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Header (Axis Label)</span>
              <div className="relative group">
                <input
                  type="text"
                  value={currentConfig.xAxisLabel || ''}
                  onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, xAxisLabel: e.target.value } })}
                  className={`w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold`}
                  placeholder="e.g. Month, Project Name"
                />
                <Heading className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Unit</span>
            <input
              type="text"
              value={currentConfig.unit || ''}
              onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, unit: e.target.value } })}
              className={`w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all`}
              placeholder="e.g. 명, $, %"
            />
          </div>

          {(isSummary || isSummaryChart || isPremiumSummary || isGeneralKpi || isEarningProgress || isEarningTrend) && (
            <>
              {isSummaryChart && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">큰 숫자 크기 (px)</span>
                  <input
                    type="number"
                    min={12}
                    max={96}
                    value={selectedWidget.titleSize ?? 48}
                    onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                    className="w-full p-2.5 bg-[var(--surface-muted)] border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20"
                  />
                </div>
              )}
              {!isImage && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Current Value</span>
                  <input
                    type="text"
                    value={currentMainValue || ''}
                    onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                  />
                </div>
              )}
              {!isImage && !isEarningTrend && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Description</span>
                  <input
                    type="text"
                    value={currentSubValue || ''}
                    onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {(!isSummary || isPremiumSummary) && (
          <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {currentData.map((item, idx) => {
              const isSankey = currentType === WidgetType.CHART_SANKEY;

              return (
                <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-[var(--border-base)] space-y-2 group/row shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-1.5 mb-1.5">
                    <div className="w-full flex items-center gap-2">
                      {/* Primary Label (Source for Sankey) */}
                      <div className="flex-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">
                          {isSankey ? 'Source' : (currentConfig.xAxisLabel || 'Label')}
                        </span>
                        <input
                          type="text"
                          value={item[currentConfig.xAxisKey] || item.name || ''}
                          onChange={(e) => handleDataChange(idx, currentConfig.xAxisKey || 'name', e.target.value)}
                          className="bg-transparent border-none p-0 text-xs font-black text-blue-600 dark:text-blue-400 focus:ring-0 w-full"
                          placeholder={isSankey ? "Source Node" : "Label..."}
                        />
                      </div>

                      {/* Secondary Label (Target for Sankey) */}
                      {(isSankey || (currentConfig.yAxisKey && !currentConfig.series?.some(s => s.key === currentConfig.yAxisKey))) && (
                        <>
                          <span className="text-gray-400">→</span>
                          <div className="flex-1">
                            <span className="text-[9px] uppercase font-bold text-gray-400 mb-0.5 block">
                              {isSankey ? 'Target' : 'Category'}
                            </span>
                            <input
                              type="text"
                              value={item[currentConfig.yAxisKey] || ''}
                              onChange={(e) => handleDataChange(idx, currentConfig.yAxisKey, e.target.value)}
                              className="bg-transparent border-none p-0 text-xs font-black text-purple-600 dark:text-purple-400 focus:ring-0 w-full text-right"
                              placeholder={isSankey ? "Target Node" : "Value..."}
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <button onClick={() => removeDataRow(idx)} className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-500 transition-opacity ml-2"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>

                  {/* Series Values */}
                  {(currentConfig.series || [{ key: 'value', label: 'Value' }]).map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-4">
                      <span className="text-[9px] font-bold text-gray-400 uppercase truncate flex-1">{s.label}</span>
                      <input
                        type="number"
                        value={item[s.key] ?? 0}
                        onChange={(e) => handleDataChange(idx, s.key, parseFloat(e.target.value) || 0)}
                        className="w-20 p-1 bg-gray-50 dark:bg-gray-900 border border-[var(--border-base)] rounded text-xs text-right font-mono font-bold dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              )
            })}
            <button onClick={addDataRow} className="btn-base btn-surface w-full mt-4 border-dashed border-2">
              <Plus className="w-4 h-4" /> Add Data Row
            </button>
          </div>
        )}
      </section>

      <section className="space-y-4 border-t dark:border-gray-800 pt-6">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2"><Maximize2 className="w-4 h-4" /> Layout Size</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] ml-1">Width</span>
            <select
              value={selectedWidget.colSpan}
              onChange={(e) => onUpdateWidget(selectedWidget.id, { colSpan: parseInt(e.target.value) })}
              className={`w-full p-2.5 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] rounded-[var(--radius-xl)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] cursor-pointer`}
            >
              {Array.from({ length: layout.columns }, (_, i) => i + 1).map(val => (<option key={val} value={val}>{val} Cols</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] ml-1">Height</span>
            <select
              value={selectedWidget.rowSpan}
              onChange={(e) => onUpdateWidget(selectedWidget.id, { rowSpan: parseInt(e.target.value) })}
              className={`w-full p-2.5 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] rounded-[var(--radius-xl)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] cursor-pointer`}
            >
              {[1, 2, 3, 4].map(val => (<option key={val} value={val}>{val} Rows</option>))}
            </select>
          </div>
        </div>
      </section>
    </div >
  );
};

export default Sidebar;
