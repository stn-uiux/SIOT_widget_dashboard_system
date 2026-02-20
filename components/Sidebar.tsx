import React from 'react';
import {
  X, Layers, BarChart3, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, LayoutGrid, Plus, Trash2, Database,
  Maximize2, AreaChart as AreaIcon, Palette, ChevronUp, ChevronDown,
  Heading, Activity, Palette as PaletteIcon, Check, Smile, BarChartHorizontal,
  Hexagon, Monitor, MoveVertical, CloudSun, Image, MapPin, Eye, EyeOff, Workflow
} from 'lucide-react';
import { Widget, WidgetType, LayoutConfig, ChartSeries, DashboardTheme, ThemeMode } from '../types';
import { BRAND_COLORS, TYPE_DEFAULT_DATA, WIDGET_METADATA } from '../constants';
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
          {isCyber ? <span className="glitch-text" data-text="GRID_CONTROL_v1">GRID_CONTROL_v1</span> : 'Grid Settings'}
        </h2>
        <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isCyber ? 'hover:bg-cyan-500/20 text-cyan-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-muted uppercase flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Layout Config
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted font-medium">Columns</span>
              <input
                type="number" min="1" max="6"
                value={layout.columns}
                onChange={(e) => onUpdateLayout({ columns: parseInt(e.target.value) || 1 })}
                className={`w-full p-2 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all rounded-[var(--radius-md)]`}
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted font-medium">Rows</span>
              <input
                type="number" min="1" max="8"
                value={layout.rows}
                onChange={(e) => onUpdateLayout({ rows: parseInt(e.target.value) || 1 })}
                className={`w-full p-2 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] outline-none focus:ring-1 focus:ring-[var(--primary-color)] transition-all rounded-[var(--radius-md)]`}
              />
            </div>
          </div>

          {/* Fit to Screen Option */}
          <div
            className={`flex items-center justify-between px-4 py-3 bg-[var(--surface-muted)] border border-[var(--border-base)] cursor-pointer hover:bg-[var(--border-muted)] transition-all group rounded-[var(--radius-xl)]`}
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-secondary">Fit to Screen</span>
            </div>
            <Switch
              checked={layout.fitToScreen}
              onChange={(checked) => onUpdateLayout({ fitToScreen: checked })}
            />
          </div>

          {/* Row Height Config (Active only when fitToScreen is FALSE) */}
          <div className={`space-y-1 pt-1 transition-opacity ${layout.fitToScreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <span className="text-[10px] uppercase font-bold text-muted ml-1 flex items-center gap-1.5">
              <MoveVertical className="w-3 h-3" /> Default Row Height (px)
            </span>
            <input
              type="number"
              min="100"
              max="800"
              step="10"
              value={layout.defaultRowHeight}
              onChange={(e) => onUpdateLayout({ defaultRowHeight: parseInt(e.target.value) || 100 })}
              className={`w-full p-2.5 bg-[var(--surface-muted)] text-[var(--text-main)] border border-[var(--border-base)] text-sm outline-none focus:ring-2 focus:ring-[var(--primary-subtle)] transition-all font-mono rounded-[var(--radius-xl)]`}
            />
          </div>

          <p className="text-[10px] text-muted italic px-1 leading-relaxed">
            * <strong>Fit ON</strong>: 위젯 크기가 화면 비율에 맞춰 자동 조절됨<br />
            * <strong>Fit OFF</strong>: 지정된 Row Height만큼 위젯 크기 고정 (스크롤 발생)
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

  const isSummary = [WidgetType.SUMMARY].includes(currentType);
  const isPremiumSummary = [WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS, WidgetType.DASH_RESOURCE_USAGE].includes(currentType);
  const isSummaryChart = currentType === WidgetType.SUMMARY_CHART;
  const isTable = currentType === WidgetType.TABLE;
  const isPie = currentType === WidgetType.CHART_PIE;
  const isImage = currentType === WidgetType.IMAGE;
  const isChart = currentType.includes('CHART') || isTable || [WidgetType.DASH_RANK_LIST, WidgetType.DASH_FAILURE_STATS, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

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
  const canShowLegend = isChart && !isTable && !isSummaryChart && ![WidgetType.DASH_FAILURE_STATUS, WidgetType.DASH_FACILITY_1, WidgetType.DASH_FACILITY_2, WidgetType.DASH_RANK_LIST, WidgetType.DASH_RESOURCE_USAGE, WidgetType.DASH_TRAFFIC_STATUS, WidgetType.DASH_NET_TRAFFIC, WidgetType.DASH_SECURITY_STATUS, WidgetType.DASH_VDI_STATUS].includes(currentType);

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
                  className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-700 ${isCyber ? 'rounded-md' : 'rounded-lg'} appearance-none cursor-pointer"
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
                      className="p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-lg'} text-[10px] font-bold outline-none"
                      placeholder="Left Label"
                    />
                    <input
                      type="text"
                      value={selectedWidget.subTitle2 || ''}
                      onChange={(e) => onUpdateWidget(selectedWidget.id, { subTitle2: e.target.value })}
                      className="p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-lg'} text-[10px] font-bold outline-none"
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
        isSummary && (
          <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Smile className="w-4 h-4" /> Icon Settings
            </label>
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Google Icon Name</span>
              <div className="relative group">
                <input
                  type="text"
                  value={(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || ''}
                  onChange={(e) => updateCurrentWidget({ icon: e.target.value })}
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                  placeholder="e.g. group, monitoring, star"
                />
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 text-lg">
                  {(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || 'star'}
                </span>
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
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:${isCyber ? 'rounded-md' : 'rounded-lg'} file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
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
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
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
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                  placeholder="Image description..."
                />
              </div>
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
              <button
                onClick={handleAddSeries}
                className="btn-base btn-surface"
                style={{ padding: '6px' }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {(currentConfig.series || []).map((s, idx) => (
                <div key={s.key} className="p-3 bg-gray-50 dark:bg-gray-800 ${isCyber ? 'rounded-md' : 'rounded-xl'} border border-[var(--border-base)] flex items-center gap-2 group transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm">
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
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
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
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g. 명, $, %"
            />
          </div>

          {(isSummary || isSummaryChart || isPremiumSummary) && (
            <>
              {!isImage && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Current Value</span>
                  <input
                    type="text"
                    value={currentMainValue || ''}
                    onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                  />
                </div>
              )}
              {!isImage && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Description</span>
                  <input
                    type="text"
                    value={currentSubValue || ''}
                    onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] ${isCyber ? 'rounded-md' : 'rounded-xl'} text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
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
