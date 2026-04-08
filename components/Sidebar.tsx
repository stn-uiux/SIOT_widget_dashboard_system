import React from 'react';
import {
  X, Layers, BarChart3, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, LayoutGrid, Plus, Trash2, Database,
  Maximize2, AreaChart as AreaIcon, Palette, ChevronUp, ChevronDown,
  Heading, Activity, Palette as PaletteIcon, Check, Smile, BarChartHorizontal,
  Hexagon, Monitor, MoveVertical, CloudSun, Image, MapPin, Eye, EyeOff, Workflow,
  RotateCcw, GripVertical, CheckCircle2, Minus, Settings
} from 'lucide-react';
import { Widget, WidgetType, LayoutConfig, ChartSeries, DashboardTheme, ThemeMode, ChartLibrary } from '../types';
import { BRAND_COLORS, TYPE_DEFAULT_DATA, WIDGET_METADATA, GENERAL_KPI_ICON_OPTIONS } from '../constants';
import Switch from './Switch';

function shadeColor(hex: string, percent: number): string {
  if (!hex || !hex.startsWith('#')) return hex;
  let R = parseInt(hex.slice(1, 3), 16);
  let G = parseInt(hex.slice(3, 5), 16);
  let B = parseInt(hex.slice(5, 7), 16);
  R = Math.min(255, Math.max(0, Math.floor(R * (100 + percent) / 100)));
  G = Math.min(255, Math.max(0, Math.floor(G * (100 + percent) / 100)));
  B = Math.min(255, Math.max(0, Math.floor(B * (100 + percent) / 100)));
  return '#' + [R, G, B].map(x => x.toString(16).padStart(2, '0')).join('');
}

const resolveColor = (colorStr: string | undefined, fallback: string, primaryHex?: string) => {
  if (!colorStr) return fallback;
  if (colorStr.startsWith('var(')) {
    const varName = colorStr.match(/var\(([^)]+)\)/)?.[1]?.trim();
    if (varName && primaryHex && primaryHex.startsWith('#')) {
      if (varName === '--primary-color') return primaryHex;
      const primaryShade = varName.match(/^--primary-(\d+)$/)?.[1];
      if (primaryShade) {
        const step = parseInt(primaryShade, 10);
        return shadeColor(primaryHex, (step - 50) * -1.5);
      }
    }
    return primaryHex || fallback;
  }
  return colorStr;
};

interface SidebarProps {
  theme: DashboardTheme;
  selectedWidget: Widget | null;
  layout: LayoutConfig;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateLayout: (updates: Partial<LayoutConfig>) => void;
  onUpdateTheme?: (updates: Partial<DashboardTheme>) => void;
  onBatchUpdateWidgets?: (updates: Partial<Widget>) => void;
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onSave?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ theme, selectedWidget, layout, onUpdateWidget, onUpdateLayout, onUpdateTheme, onBatchUpdateWidgets, onClose, onDragStart, onSave }) => {
  const [activeDualTab, setActiveDualTab] = React.useState<0 | 1>(0);
  const [batchW, setBatchW] = React.useState<number>(6);
  const [batchH, setBatchH] = React.useState<number>(10);
  if (!selectedWidget) return (
    <div className={`w-[var(--panel-width)] max-h-[var(--panel-max-height)] flex flex-col overflow-hidden transition-all duration-500 border ${
      theme.mode === ThemeMode.LIGHT ? "text-slate-800" : "text-slate-50"
    }`} style={{
      borderRadius: 'var(--radius-panel)',
      border: 'var(--floating-panel-border)',
    }}>
      <header className="flex items-center justify-between h-[68px] px-4 border-b border-[var(--border-base)] bg-transparent shrink-0 cursor-move" onMouseDown={onDragStart}>
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted/30 cursor-move" />
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tighter text-main leading-none">Layout Settings</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onSave} className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg" title="저장하기">
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-muted hover:text-main"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 p-5 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)'
      }}>
        <div className="space-y-4">
          <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
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
                className={`w-full p-2 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all rounded-[var(--radius-md)] glass-item`}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted font-medium flex items-center gap-1.5 grayscale opacity-50">
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-70"><rect x="1" y="1" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="1" y="6" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/><rect x="1" y="11" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5"/></svg>
                Rows (Auto)
              </span>
              <div className="relative group">
                <input
                  type="text"
                  value="AUTO"
                  disabled
                  className="w-full p-2 bg-gray-100/50 dark:bg-white/5 text-[var(--text-muted)] border border-[var(--border-base)] rounded-[var(--radius-md)] cursor-not-allowed font-bold text-center text-xs tracking-widest opacity-60"
                />
                <div className="absolute inset-0 bg-transparent" title="Layout rows are currently calculated automatically." />
              </div>
            </div>
          </div>


          {/* Row Height Config */}
          <div className="space-y-1 pt-1">
            <span className="text-caption uppercase font-bold text-muted ml-1 flex items-center gap-1.5">
              <MoveVertical className="w-3 h-3" /> Default Row Height (px)
            </span>
            <input
              type="number"
              min="10"
              max="200"
              step="5"
              value={layout.defaultRowHeight}
              onChange={(e) => onUpdateLayout({ defaultRowHeight: Math.max(10, parseInt(e.target.value, 10) || 20) })}
              className={`w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] transition-all font-mono rounded-[var(--radius-xl)] glass-item`}
            />
          </div>

          {/* Widget Gaps */}
          {onUpdateTheme && (
            <div className="space-y-1 pt-1">
              <span className="text-caption uppercase font-bold text-muted ml-1 flex items-center gap-1.5">
                Default Widget Gap (px)
              </span>
              <input
                type="number"
                min={0}
                max={40}
                step={1}
                value={theme.spacing ?? 16}
                onChange={(e) => onUpdateTheme({ spacing: Math.max(0, Math.min(40, parseInt(e.target.value, 10) || 0)) })}
                className={`w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] transition-all font-mono rounded-[var(--radius-xl)] glass-item`}
              />
            </div>
          )}

          {/* 그리드 사용 */}
          <div
            className="flex items-center justify-between px-4 py-3 border border-[var(--border-base)] rounded-[var(--radius-xl)] transition-all cursor-pointer glass-item"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-transparent border border-[var(--border-muted)] flex items-center justify-center p-1" title={layout.useGrid !== false ? '칸 단위 스냅' : '픽셀 자유'}>
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
              onChange={(checked) => onUpdateLayout({ useGrid: checked })}
            />
          </div>

          {/* 위젯 일괄 적용 (Grid Only) */}
          {layout.useGrid !== false && (
            <div className={`p-4 mt-2 space-y-4 rounded-[1.25rem] border overflow-hidden relative group transition-all duration-300 bg-transparent border-[var(--primary-color)]/10 shadow-sm glass-item`}>
              {/* Subtle accent line */}
              <div className={`absolute top-0 left-0 w-1 h-full bg-[var(--primary-color)]/40`} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-[var(--primary-color)]/10 text-primary`}>
                    <Workflow className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-caption font-black uppercase tracking-[0.15em] text-primary`}>Batch Size Sync</span>
                </div>
                <div className={`px-1.5 py-0.5 rounded text-nano font-bold uppercase tracking-tight glass-item`}>
                  Grid Only
                </div>
              </div>

              <div className="flex items-center gap-2 p-1 bg-transparent rounded-xl border border-white/10 glass-item">
                {/* Width Input Group */}
                <div className="flex-1 flex flex-col gap-1 px-2 py-1.5 group/input transition-all">
                  <span className="text-nano font-black text-muted uppercase tracking-widest pl-0.5">Width (Cols)</span>
                  <div className="flex items-center gap-1.5">
                    <LayoutGrid className="w-3 h-3 text-muted/60" />
                    <input
                      type="number" min="1" max={layout.columns}
                      value={batchW}
                      onChange={(e) => setBatchW(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-transparent text-sm font-mono font-bold text-main outline-none placeholder:text-muted/30"
                      placeholder="W"
                    />
                  </div>
                </div>

                <div className="w-px h-8 bg-black/10 dark:bg-white/10 shrink-0" />

                {/* Height Input Group */}
                <div className="flex-1 flex flex-col gap-1 px-2 py-1.5 group/input transition-all">
                  <span className="text-nano font-black text-muted uppercase tracking-widest pl-0.5">Height (Rows)</span>
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-muted/60" />
                    <input
                      type="number" min="1" max={100}
                      value={batchH}
                      onChange={(e) => setBatchH(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-transparent text-sm font-mono font-bold text-main outline-none placeholder:text-muted/30"
                      placeholder="H"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => onBatchUpdateWidgets?.({ colSpan: batchW, rowSpan: batchH })}
                className={`w-full group/btn relative overflow-hidden py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg bg-[var(--primary-color)] text-white text-xs font-bold hover:brightness-110 hover:shadow-[var(--primary-color)]/25`}
              >
                {/* Hover shine effect */}
                <div className="absolute inset-0 w-full h-full transform -translate-x-full group-hover/btn:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                
                <CheckCircle2 className={`w-4 h-4 transition-transform group-hover/btn:scale-110 text-white`} />
                <span>일괄 적용하기</span>
              </button>

              <div className="flex items-start gap-1.5 px-1 py-0.5">
                <div className={`w-1 h-1 rounded-full mt-1.5 shrink-0 bg-primary/40`} />
                <p className="text-micro text-muted font-medium leading-[1.3] italic">
                  현재 페이지의 모든 위젯 규격을 {batchW}×{batchH} 그리드 칸으로 정렬합니다.
                </p>
              </div>
            </div>
          )}

          {/* 자유 배치 (Free Position) */}
          <div
            className={`flex items-center justify-between px-4 py-3 border border-[var(--border-base)] cursor-pointer transition-all group rounded-[var(--radius-xl)] glass-item`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-transparent border border-[var(--border-muted)] flex items-center justify-center p-1" title="위로 쏠리지 않고 고정">
                <svg viewBox="0 0 20 20" className="w-full h-full text-primary/70"><rect x="1" y="2" width="18" height="5" fill="currentColor" opacity="0.4" rx="0.5"/><rect x="3" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5"/><rect x="11" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5"/></svg>
              </div>
              <span className="text-xs font-bold text-secondary">자유 배치 (FREE POSITION)</span>
            </div>
            <Switch
              checked={layout.freePosition ?? false}
              onChange={(checked) => onUpdateLayout({ freePosition: checked })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const isSec = false;

  const currentType = selectedWidget.type;
  const currentConfig = selectedWidget.config;
  const currentData = selectedWidget.data || [];
  const currentMainValue = selectedWidget.mainValue || '0';
  const currentSubValue = selectedWidget.subValue || '';

  const updateCurrentWidget = (updates: Partial<Widget>) => {
    onUpdateWidget(selectedWidget.id, updates);
  };

  const toggleConfig = (key: string) => {
    if (key === 'noBezel' || key === 'noBorder') {
      const updates = { [key]: !(selectedWidget as any)[key] };
      onUpdateWidget(selectedWidget.id, updates);
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
    const oldType = selectedWidget.type;

    // 데이터 구조가 호환되는 시각화 타입들 (차트, 테이블, 랭킹 리스트 등)
    const vizTypes = [
      WidgetType.CHART_BAR,
      WidgetType.CHART_BAR_HORIZONTAL,
      WidgetType.CHART_LINE,
      WidgetType.CHART_AREA,
      WidgetType.CHART_PIE,
      WidgetType.CHART_RADAR,
      WidgetType.CHART_TREEMAP,
      WidgetType.CHART_COMPOSED,
      WidgetType.TABLE,
      WidgetType.DASH_RANK_LIST,
      WidgetType.DASH_FAILURE_STATS,
      WidgetType.DASH_TRAFFIC_STATUS,
      WidgetType.DASH_NET_TRAFFIC,
      WidgetType.DASH_TRAFFIC_TOP5
    ];

    const isOldViz = vizTypes.includes(oldType);
    const isNewViz = vizTypes.includes(newType);

    if (defaultData) {
      const updates: any = { type: newType };

      // 호환되는 타입 간의 전환이라면 데이터와 기존 설정을 보존
      if (isOldViz && isNewViz && selectedWidget.data && selectedWidget.data.length > 0) {
        updates.data = selectedWidget.data;
        // 기존 설정을 유지하되, 새 타입의 기본 설정 중 누락된 것만 보충
        updates.config = {
          ...JSON.parse(JSON.stringify(defaultData.config)),
          ...currentConfig
        };
      } else {
        // 완전히 다른 타입으로의 전환은 기본값으로 리셋
        updates.data = JSON.parse(JSON.stringify(defaultData.data));
        updates.config = {
          ...currentConfig,
          ...JSON.parse(JSON.stringify(defaultData.config))
        };
        updates.mainValue = defaultData.mainValue;
        updates.subValue = defaultData.subValue;
      }

      updateCurrentWidget(updates);
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
  const isMap = currentType === WidgetType.MAP || currentType === WidgetType.MAP_GOOGLE || currentType === WidgetType.MAP_NAVER;
  const isWeather = currentType === WidgetType.WEATHER;
  
  const isChart = String(currentType).includes('CHART') || isTable || [WidgetType.DASH_RANK_LIST, WidgetType.DASH_FAILURE_STATS, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_TRAFFIC_TOP5, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

  const hasDataRows = isChart || isSummaryChart || isEarningTrend || isPremiumSummary;

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

  // amCharts를 전용으로 사용하거나, 현재 라이브러리 설정상 amCharts로 렌더링되는 경우
  const isReallyAmCharts = [
    WidgetType.CHART_PIE,
    WidgetType.CHART_RADAR,
    WidgetType.CHART_SANKEY,
    WidgetType.DASH_TRAFFIC_STATUS,
    WidgetType.DASH_FAILURE_STATS,
    WidgetType.DASH_NET_TRAFFIC,
    WidgetType.DASH_RANK_LIST
  ].includes(currentType as WidgetType) || (theme.chartLibrary === ChartLibrary.AMCHARTS && [
    WidgetType.CHART_BAR,
    WidgetType.CHART_BAR_HORIZONTAL,
    WidgetType.CHART_LINE,
    WidgetType.CHART_AREA,
    WidgetType.CHART_COMPOSED
  ].includes(currentType as WidgetType));

  const isGridChart = isAxisChart || currentType === WidgetType.CHART_RADAR;
  const isFacility2 = currentType === WidgetType.DASH_FACILITY_2;
  const isIconResizable = isSummary || isGeneralKpi || isSummaryChart || currentType === WidgetType.DASH_RANK_LIST || isFacility2 || isWeather;
  const isBarResizable = [WidgetType.CHART_BAR, WidgetType.CHART_BAR_HORIZONTAL, WidgetType.CHART_COMPOSED, WidgetType.DASH_FAILURE_STATS, WidgetType.DASH_RANK_LIST, WidgetType.DASH_TRAFFIC_TOP5, WidgetType.DASH_RESOURCE_USAGE].includes(currentType);

  const canShowLegend = isChart && !isTable && !isSummaryChart && ![WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_RANK_LIST, WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_TRAFFIC_TOP5, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

  // 위젯 타입별 가용 옵션 필터링
  const appearanceOptions = [
    { key: 'showLegend', label: 'Show Legend', visible: canShowLegend || currentType === WidgetType.DASH_NET_TRAFFIC },
    { key: 'showUnitInLegend', label: 'Show Unit in Legend', visible: canShowLegend && currentConfig.showLegend },
    { key: 'showLabels', label: 'Show Labels', visible: isPie },
    { key: 'showGrid', label: 'Show Grid Lines', visible: isGridChart },
    { key: 'showXAxis', label: 'Show X-Axis', visible: isAxisChart },
    { key: 'showYAxis', label: 'Show Y-Axis', visible: isAxisChart },
    { key: 'useGradient', label: 'Gradient Fill', visible: (isAxisChart || currentType === WidgetType.SUMMARY) && !isReallyAmCharts },
    { key: 'hideHeader', label: 'Hide Header', visible: true },
    { key: 'noBorder', label: 'No Border', visible: true },
    { key: 'noBezel', label: 'No Bezel (Hide Card)', visible: true },
  ].filter(opt => opt.visible);


  return (
    <div className={`w-[var(--panel-width)] max-h-[var(--panel-max-height)] flex flex-col panel-inner-container overflow-hidden transition-all duration-500 border ${
      theme.mode === ThemeMode.LIGHT ? "text-slate-800" : "text-slate-50"
    }`} style={{
      borderRadius: 'var(--radius-panel)',
      border: 'var(--floating-panel-border)',
    }}>
      <header className="flex items-center justify-between h-[68px] px-4 border-b border-[var(--border-base)] bg-transparent shrink-0 cursor-move" onMouseDown={onDragStart}>
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted/30 cursor-move" />
          <Settings className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tighter text-main leading-none">Widget Settings</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onSave} className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg" title="저장하기" onMouseDown={(e) => e.stopPropagation()}>
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all text-muted hover:text-main"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 p-5 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--scrollbar-thumb) var(--scrollbar-track)'
      }}>
      <section className="space-y-4">
        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400`}>
          <Layers className="w-4 h-4" /> Visualization
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'viz')
            .map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id as WidgetType)}
                className={`p-2 flex flex-col items-center gap-1 min-w-0 rounded-xl transition-all border glass-item ${currentType === id
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-[var(--border-base)] text-muted hover:border-primary/50'
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-micro font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
              </button>
            ))}
        </div>
      </section>

      {/* Premium Dashboard Templates */}
      <section className="space-y-4">
        <label className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-gray-400`}>
          <PaletteIcon className="w-4 h-4" /> Premium Templates
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(WIDGET_METADATA)
            .filter(([_, meta]) => meta.category === 'premium')
            .map(([id, meta]) => (
              <button
                key={id}
                onClick={() => handleTypeChange(id as WidgetType)}
                className={`p-2 flex flex-col items-center gap-1 min-w-0 rounded-xl transition-all border glass-item ${currentType === id
                    ? 'border-primary bg-primary/10 text-primary shadow-sm'
                    : 'border-[var(--border-base)] text-muted hover:border-primary/50'
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-micro font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
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
                className={`p-2 flex flex-col items-center gap-1 min-w-0 rounded-xl border transition-all glass-item ${currentType === id
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-[var(--border-base)] text-muted hover:border-primary/50'
                  }`}
              >
                <meta.icon className="w-4 h-4" />
                <span className="text-micro font-bold truncate w-full text-center uppercase tracking-tighter">{meta.label}</span>
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block mb-1">큰 숫자 크기 (px)</span>
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={selectedWidget.titleSize ?? 48}
                  onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                  className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 glass-item"
                />
              </div>
              <div>
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Google Icon Name</span>
                <div className="relative group mt-1">
                  <input
                    type="text"
                    value={(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || ''}
                    onChange={(e) => updateCurrentWidget({ icon: e.target.value })}
                    className="w-full p-2.5 pl-9 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 transition-all font-semibold glass-item"
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block mb-1">내용</span>
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
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1 block mb-1">글자 크기 (px)</span>
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
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1 block mb-1">굵기</span>
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Progress (%)</span>
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block mb-1">큰 숫자 크기 (px)</span>
                <input
                  type="number"
                  min={12}
                  max={96}
                  value={selectedWidget.titleSize ?? 48}
                  onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                  className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 glass-item"
                />
              </div>
              <div className="space-y-1">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Comparison text</span>
                <input
                  type="text"
                  value={selectedWidget.comparisonText ?? ''}
                  onChange={(e) => updateCurrentWidget({ comparisonText: e.target.value })}
                  className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 glass-item"
                  placeholder="Compared of $11,750 last year"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="space-y-1 flex-1">
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1">Trend %</span>
                  <input
                    type="number"
                    value={selectedWidget.trendPercent ?? 21}
                    onChange={(e) => updateCurrentWidget({ trendPercent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs glass-item"
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <span className="text-caption uppercase font-bold text-gray-400">Direction</span>
                  <Switch
                    checked={selectedWidget.trendUp !== false}
                    onChange={(checked) => updateCurrentWidget({ trendUp: checked })}
                  />
                  <span className="text-xs text-[var(--text-muted)]">{selectedWidget.trendUp !== false ? '▲ Up' : '▼ Down'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block">Category bars</span>
                {(selectedWidget.categoryItems ?? [{ label: 'Sales', value: 8 }, { label: 'Product', value: 68, color: 'var(--warning)' }, { label: 'Marketing', value: 12 }]).map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center p-2 rounded-lg border border-[var(--border-base)] glass-item">
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = [...(selectedWidget.categoryItems ?? [])];
                        if (!next[idx]) next[idx] = { label: '', value: 0 };
                        next[idx] = { ...next[idx], label: e.target.value };
                        updateCurrentWidget({ categoryItems: next });
                      }}
                      className="flex-1 min-w-0 p-1.5 text-xs rounded border border-[var(--border-base)] bg-transparent glass-item"
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
                      className="w-14 p-1.5 text-xs rounded border border-[var(--border-base)] bg-transparent glass-item"
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
                      className="w-20 p-1.5 text-xs rounded border border-[var(--border-base)] bg-transparent glass-item"
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
              <span className="text-caption uppercase font-bold text-gray-400 ml-1">Icon</span>
              <select
                value={(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || 'User'}
                onChange={(e) => updateCurrentWidget({ icon: e.target.value })}
                className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold glass-item"
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
        currentType === WidgetType.VERTICAL_NAV_CARD && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4" /> 세로 네비 카드
            </label>
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block">카드 개수 (1~8)</span>
                <div
                  className="inline-flex items-center rounded-[9999px] border border-[var(--border-base)] overflow-hidden"
                  style={{
                    background: 'transparent',
                    padding: 'var(--spacing-xs) var(--spacing-sm)',
                    gap: 'var(--spacing-sm)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const items = selectedWidget.navItems ?? [];
                      if (items.length <= 1) return;
                      const next = items.slice(0, -1);
                      const removedWasActive = items[items.length - 1]?.active;
                      if (removedWasActive && next.length > 0 && !next.some((it) => it.active)) {
                        next[0] = { ...next[0], active: true };
                      }
                      onUpdateWidget(selectedWidget.id, { navItems: next });
                    }}
                    disabled={((selectedWidget.navItems ?? []).length) <= 1}
                    className="flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--action-hover-bg)]"
                    style={{
                      width: 'var(--spacing-lg)',
                      height: 'var(--spacing-lg)',
                      color: 'var(--text-main)',
                    }}
                    title="카드 줄이기"
                  >
                    <Minus className="w-4 h-4" style={{ width: 'var(--content-size)', height: 'var(--content-size)' }} />
                  </button>
                  <span
                    className="tabular-nums font-semibold min-w-[1.25rem] text-center"
                    style={{ color: 'var(--text-main)', fontSize: 'var(--content-size)' }}
                  >
                    {(selectedWidget.navItems ?? []).length}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const items = selectedWidget.navItems ?? [];
                      if (items.length >= 8) return;
                      onUpdateWidget(selectedWidget.id, {
                        navItems: [...items, { id: `nav_${Date.now()}`, label: '새 메뉴', active: false }],
                      });
                    }}
                    disabled={((selectedWidget.navItems ?? []).length) >= 8}
                    className="flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--action-hover-bg)]"
                    style={{
                      width: 'var(--spacing-lg)',
                      height: 'var(--spacing-lg)',
                      color: 'var(--text-main)',
                    }}
                    title="카드 추가 (최대 8개)"
                  >
                    <Plus className="w-4 h-4" style={{ width: 'var(--content-size)', height: 'var(--content-size)' }} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1 block">메뉴 문구</span>
                {((selectedWidget.navItems ?? []) as { id: string; label: string; active?: boolean }[]).map((item, idx) => (
                  <div key={item.id} className="flex gap-2 items-center">
                    <span className="text-xs text-[var(--text-muted)] w-6 tabular-nums">{idx + 1}.</span>
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => {
                        const next = (selectedWidget.navItems ?? []).map((it, j) =>
                          j === idx ? { ...it, label: e.target.value } : it
                        );
                        onUpdateWidget(selectedWidget.id, { navItems: next });
                      }}
                      className="flex-1 min-w-0 p-2 bg-transparent border border-[var(--border-base)] rounded-[var(--radius-md)] text-xs outline-none focus:ring-1 focus:ring-[var(--primary-color)] glass-item"
                      placeholder="메뉴 이름"
                    />
                  </div>
                ))}
              </div>
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Upload Image</span>
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
                    className={`w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 glass-item`}
                  />
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Or Image URL</span>
                <input
                  type="text"
                  value={currentMainValue || ''}
                  onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                  className={`w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold glass-item`}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Caption */}
              <div className="space-y-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Caption (Optional)</span>
                <input
                  type="text"
                  value={currentSubValue || ''}
                  onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                  className={`w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold glass-item`}
                  placeholder="Image description..."
                />
              </div>
            </div>
          </section>
        )
      }

      {
        isIconResizable && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <PaletteIcon className="w-4 h-4" /> Icon Size
            </label>
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <span className="text-caption uppercase font-bold text-gray-400">Size (px)</span>
                <span className="text-xs font-bold text-blue-500">{selectedWidget.iconSize || 48}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="128"
                step="4"
                value={selectedWidget.iconSize || 48}
                onChange={(e) => updateCurrentWidget({ iconSize: parseInt(e.target.value, 10) })}
                className="w-full accent-blue-500 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </section>
        )
      }

      {
        isBarResizable && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <BarChartHorizontal className="w-4 h-4" /> Bar Settings (Graph Width)
            </label>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Graph Width (%)</span>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{currentConfig.barWidth ?? 60}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={currentConfig.barWidth ?? 60}
                onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, barWidth: parseInt(e.target.value, 10) } })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[var(--primary-color)]"
              />
              <p className="text-micro text-muted italic px-1 mt-1">* 수치를 낮추면 더 얇은 그래프가 됩니다.</p>
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
                <span className="text-caption uppercase font-bold text-gray-400 ml-1">Background opacity</span>
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
                  <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {option.label}
                  </span>
                  <div className="pointer-events-none">
                    <Switch
                      checked={
                        option.key === 'noBezel' ? (selectedWidget.noBezel || false) :
                          option.key === 'noBorder' ? (selectedWidget.noBorder || false) :
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
                  <span className="text-caption font-bold uppercase">Reset</span>
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
                <div key={s.key} className={`p-3 rounded-xl border border-[var(--border-base)] flex items-center gap-2 group transition-all hover:border-[var(--primary-color)]/30 shadow-sm glass-item`}>
                  <div className="flex flex-col gap-0.5 mr-1">
                    <button
                      disabled={idx === 0}
                      onClick={() => moveSeries(idx, 'up')}
                      className="p-0.5 rounded hover:bg-[var(--primary-subtle)] disabled:opacity-0 transition-all"
                    >
                      <ChevronUp className="w-3 h-3 text-gray-500" />
                    </button>
                    <button
                      disabled={idx === (currentConfig.series?.length || 0) - 1}
                      onClick={() => moveSeries(idx, 'down')}
                      className="p-0.5 rounded hover:bg-white/10 disabled:opacity-0 transition-all glass-item"
                    >
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex gap-1 shrink-0 items-center">
                    <div className="relative group/picker">
                      <div
                        className="w-5 h-5 rounded-md border border-[var(--border-strong)] shadow-sm cursor-pointer"
                        style={{ backgroundColor: resolveColor(s.color, theme.primaryColor, theme.primaryColor) }}
                        title="Start Color"
                      />
                      <input
                        type="color"
                        value={resolveColor(s.color, theme.primaryColor, theme.primaryColor)}
                        onChange={(e) => handleUpdateSeries(s.key, { color: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    {currentConfig.useGradient && !isReallyAmCharts && (
                      <div className="relative group/picker">
                        <div
                          className="w-5 h-5 rounded-md border border-[var(--border-strong)] shadow-sm cursor-pointer"
                          style={{ backgroundColor: resolveColor(s.endColor || s.color, theme.primaryColor, theme.primaryColor) }}
                          title="End Color"
                        />
                        <input
                          type="color"
                          value={resolveColor(s.endColor || s.color, theme.primaryColor, theme.primaryColor)}
                          onChange={(e) => handleUpdateSeries(s.key, { endColor: e.target.value })}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </div>
                    )}
                    <input
                      type="text"
                      value={s.color?.startsWith('var') ? '' : s.color}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.startsWith('#')) handleUpdateSeries(s.key, { color: val });
                      }}
                      placeholder="#HEX"
                      className="w-14 bg-transparent border-none p-0 text-caption font-medium uppercase text-muted outline-none focus:ring-0 ml-1"
                      title="Direct HEX input"
                    />
                  </div>

                  <div className="flex-1">
                    <input
                      type="text"
                      value={s.label}
                      onChange={(e) => handleUpdateSeries(s.key, { label: e.target.value })}
                      className="w-full bg-transparent border-none p-0 text-xs font-bold focus:ring-0 outline-none dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => handleRemoveSeries(s.key)}
                    className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg text-[var(--action-danger)] hover:bg-[var(--action-danger-subtle)] transition-all ml-1"
                    title="계열 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        )
      }

      <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2">
          <Database className="w-4 h-4" /> Data Config
        </label>

        <div className="space-y-3">
          {hasDataRows && !isSummary && !isGeneralKpi && !isEarningProgress && (
            <div className="space-y-1">
              <span className="text-caption uppercase font-bold text-muted ml-1">Header (Axis Label)</span>
              <div className="relative group">
                <input
                  type="text"
                  value={currentConfig.xAxisLabel || ''}
                  onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, xAxisLabel: e.target.value } })}
                  className={`w-full p-2.5 pl-9 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold glass-item`}
                  placeholder="e.g. Month, Project Name"
                />
                <Heading className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary" />
              </div>
            </div>
          )}

          {!isImage && !isMap && !isWeather && (
            <div className="space-y-1">
              <span className="text-caption uppercase font-bold text-muted ml-1">Unit</span>
              <input
                type="text"
                value={currentConfig.unit || ''}
                onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, unit: e.target.value } })}
                className={`w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all glass-item`}
                placeholder="e.g. 명, $, %"
              />
            </div>
          )}

          {(isSummary || isSummaryChart || isPremiumSummary || isGeneralKpi || isEarningProgress || isEarningTrend) && (
            <>
              {isSummaryChart && (
                <div className="space-y-1">
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1">큰 숫자 크기 (px)</span>
                  <input
                    type="number"
                    min={12}
                    max={96}
                    value={selectedWidget.titleSize ?? 48}
                    onChange={(e) => updateCurrentWidget({ titleSize: parseInt(e.target.value, 10) || 48 })}
                    className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-xs outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 glass-item"
                  />
                </div>
              )}
              {!isImage && !isMap && !isWeather && (
                <div className="space-y-1">
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1">Current Value</span>
                  <input
                    type="text"
                    value={currentMainValue || ''}
                    onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                    className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono font-bold glass-item"
                  />
                </div>
              )}
              {!isImage && !isEarningTrend && !isMap && !isWeather && (
                <div className="space-y-1">
                  <span className="text-caption uppercase font-bold text-gray-400 ml-1">Description</span>
                  <input
                    type="text"
                    value={currentSubValue || ''}
                    onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                    className="w-full p-2.5 bg-transparent border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all glass-item"
                  />
                </div>
              )}
            </>
          )}
        </div>

        {hasDataRows && (
          <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {currentData.map((item, idx) => {
              const isSankey = currentType === WidgetType.CHART_SANKEY;

              return (
                <div key={idx} className="p-3 bg-transparent rounded-2xl border border-[var(--border-base)] space-y-2 group/row shadow-sm hover:shadow-md transition-all glass-item">
                  <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-1.5 mb-1.5">
                    <div className="w-full flex items-center gap-2">
                      {/* Primary Label (Source for Sankey) */}
                      <div className="flex-1">
                        <span className="text-micro uppercase font-bold text-gray-400 mb-0.5 block">
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
                      {isSankey && (
                        <>
                          <span className="text-gray-400">→</span>
                          <div className="flex-1">
                            <span className="text-micro uppercase font-bold text-gray-400 mb-0.5 block">
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
                    <button 
                      onClick={() => removeDataRow(idx)} 
                      className="flex shrink-0 items-center justify-center w-7 h-7 rounded-lg text-[var(--action-danger)] hover:bg-[var(--action-danger-subtle)] transition-all ml-2" 
                      title="데이터 행 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Series Values */}
                  {(currentConfig.series || [{ key: 'value', label: 'Value' }]).map((s) => (
                    <div key={s.key} className="flex items-center justify-between gap-4">
                      <span className="text-micro font-bold text-gray-400 uppercase truncate flex-1">{s.label}</span>
                      <input
                        type="number"
                        value={item[s.key] ?? 0}
                        onChange={(e) => handleDataChange(idx, s.key, parseFloat(e.target.value) || 0)}
                        className="w-20 p-1 bg-transparent border border-[var(--border-base)] rounded text-xs text-right font-mono font-bold dark:text-white glass-item"
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

      <section className="space-y-4 border-t border-[var(--border-base)] p-4">
        <label className="text-xs font-bold text-muted uppercase tracking-widest flex items-center gap-2"><Maximize2 className="w-4 h-4" /> Layout Size</label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-caption uppercase font-bold text-[var(--text-muted)] ml-1">Width</span>
            <select
              value={selectedWidget.colSpan}
              onChange={(e) => onUpdateWidget(selectedWidget.id, { colSpan: parseInt(e.target.value) })}
              className={`w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] rounded-[var(--radius-xl)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] cursor-pointer glass-item`}
            >
              {Array.from({ length: layout.columns }, (_, i) => i + 1).map(val => (<option key={val} value={val} className="bg-[var(--surface)]">{val} Cols</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-caption uppercase font-bold text-[var(--text-muted)] ml-1">Height</span>
            <select
              value={selectedWidget.rowSpan}
              onChange={(e) => onUpdateWidget(selectedWidget.id, { rowSpan: parseInt(e.target.value) })}
              className={`w-full p-2.5 bg-transparent text-[var(--text-main)] border border-[var(--border-base)] rounded-[var(--radius-xl)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] cursor-pointer glass-item`}
            >
              {[1, 2, 3, 4].map(val => (<option key={val} value={val} className="bg-[var(--surface)]">{val} Rows</option>))}
            </select>
          </div>
        </div>
      </section>
    </div>
    </div>
  );
};

export default React.memo(Sidebar);
