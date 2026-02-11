
import React from 'react';
import {
  X, Layers, BarChart3, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, LayoutGrid, Plus, Trash2, Database,
  Maximize2, AreaChart as AreaIcon, Palette, ChevronUp, ChevronDown,
  Heading, Activity, Palette as PaletteIcon, Check, Smile, BarChartHorizontal,
  Hexagon, Monitor, MoveVertical
} from 'lucide-react';
import { Widget, WidgetType, LayoutConfig, ChartSeries } from '../types';
import { BRAND_COLORS, TYPE_DEFAULT_DATA } from '../constants';

interface SidebarProps {
  selectedWidget: Widget | null;
  layout: LayoutConfig;
  onUpdateWidget: (id: string, updates: Partial<Widget>) => void;
  onUpdateLayout: (updates: Partial<LayoutConfig>) => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ selectedWidget, layout, onUpdateWidget, onUpdateLayout, onClose }) => {
  if (!selectedWidget) return (
    <div className="w-80 h-full bg-[var(--card-bg)] border-l border-[var(--border-color)] p-6 space-y-8 flex flex-col shadow-2xl text-[var(--text-color)] transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Grid Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-6">
        <div className="space-y-4">
          <label className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
            <LayoutGrid className="w-4 h-4" /> Layout Config
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Columns</span>
              <input
                type="number" min="1" max="6"
                value={layout.columns}
                onChange={(e) => onUpdateLayout({ columns: parseInt(e.target.value) || 1 })}
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-medium">Rows</span>
              <input
                type="number" min="1" max="8"
                value={layout.rows}
                onChange={(e) => onUpdateLayout({ rows: parseInt(e.target.value) || 1 })}
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Fit to Screen Option */}
          <div
            onClick={() => onUpdateLayout({ fitToScreen: !layout.fitToScreen })}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Fit to Screen</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${layout.fitToScreen ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${layout.fitToScreen ? 'right-0.5' : 'left-0.5'}`} />
            </div>
          </div>

          {/* Row Height Config (Active only when fitToScreen is FALSE) */}
          <div className={`space-y-1 pt-1 transition-opacity ${layout.fitToScreen ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1 flex items-center gap-1.5">
              <MoveVertical className="w-3 h-3" /> Default Row Height (px)
            </span>
            <input
              type="number"
              min="100"
              max="800"
              step="10"
              value={layout.defaultRowHeight}
              onChange={(e) => onUpdateLayout({ defaultRowHeight: parseInt(e.target.value) || 100 })}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
            />
          </div>

          <p className="text-[10px] text-gray-400 italic px-1 leading-relaxed">
            * <strong>Fit ON</strong>: 위젯 크기가 화면 비율에 맞춰 자동 조절됨<br />
            * <strong>Fit OFF</strong>: 지정된 Row Height만큼 위젯 크기 고정 (스크롤 발생)
          </p>
        </div>
      </div>
    </div>
  );

  const toggleConfig = (key: keyof typeof selectedWidget.config) => {
    const currentValue = selectedWidget.config[key];
    const updates: any = { [key]: !currentValue };

    // "Show Legend"를 끌 때 "Show Unit in Legend"도 함께 끄도록 처리
    if (key === 'showLegend' && currentValue === true) {
      updates.showUnitInLegend = false;
    }

    onUpdateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, ...updates }
    });
  };

  const handleTypeChange = (newType: WidgetType) => {
    const defaultData = TYPE_DEFAULT_DATA[newType];
    if (defaultData) {
      onUpdateWidget(selectedWidget.id, {
        type: newType,
        data: defaultData.data,
        config: { ...selectedWidget.config, ...defaultData.config },
        mainValue: defaultData.mainValue || selectedWidget.mainValue,
        subValue: defaultData.subValue || selectedWidget.subValue
      });
    } else {
      onUpdateWidget(selectedWidget.id, { type: newType });
    }
  };

  const handleDataChange = (index: number, key: string, value: any) => {
    const newData = [...selectedWidget.data];
    newData[index] = { ...newData[index], [key]: value };
    onUpdateWidget(selectedWidget.id, { data: newData });
  };

  const addDataRow = () => {
    const xAxisKey = selectedWidget.config.xAxisKey || 'name';
    const defaultObj: any = { [xAxisKey]: `Item ${selectedWidget.data.length + 1}` };
    const seriesKeys = selectedWidget.config.series?.length > 0 ? selectedWidget.config.series.map(s => s.key) : ['value'];
    seriesKeys.forEach(k => defaultObj[k] = 0);
    onUpdateWidget(selectedWidget.id, { data: [...selectedWidget.data, defaultObj] });
  };

  const removeDataRow = (index: number) => {
    onUpdateWidget(selectedWidget.id, { data: selectedWidget.data.filter((_, i) => i !== index) });
  };

  const handleAddSeries = () => {
    const newKey = `value_${Date.now()}`;
    const shades = [50, 70, 30, 90, 10, 60, 40, 80, 20];
    const currentLen = selectedWidget.config.series?.length || 0;
    const shadeStep = shades[currentLen % shades.length];

    const newSeries: ChartSeries = {
      key: newKey,
      label: `Series ${currentLen + 1}`,
      color: currentLen === 0 ? 'var(--primary-color)' : `var(--primary-${shadeStep})`
    };
    onUpdateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, series: [...(selectedWidget.config.series || []), newSeries] },
      data: selectedWidget.data.map(d => ({ ...d, [newKey]: 0 }))
    });
  };

  const handleUpdateSeries = (key: string, updates: Partial<ChartSeries>) => {
    onUpdateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, series: selectedWidget.config.series.map(s => s.key === key ? { ...s, ...updates } : s) }
    });
  };

  const handleRemoveSeries = (key: string) => {
    onUpdateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, series: selectedWidget.config.series.filter(s => s.key !== key) }
    });
  };

  const moveSeries = (index: number, direction: 'up' | 'down') => {
    const newSeries = [...(selectedWidget.config.series || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSeries.length) return;

    [newSeries[index], newSeries[targetIndex]] = [newSeries[targetIndex], newSeries[index]];
    onUpdateWidget(selectedWidget.id, {
      config: { ...selectedWidget.config, series: newSeries }
    });
  };

  const isSummary = selectedWidget.type === WidgetType.SUMMARY;
  const isSummaryChart = selectedWidget.type === WidgetType.SUMMARY_CHART;
  const isTable = selectedWidget.type === WidgetType.TABLE;
  const isPie = selectedWidget.type === WidgetType.CHART_PIE;
  const isChart = selectedWidget.type.includes('CHART') || isTable;

  const isAxisChart = [
    WidgetType.CHART_BAR,
    WidgetType.CHART_BAR_HORIZONTAL,
    WidgetType.CHART_LINE,
    WidgetType.CHART_AREA,
    WidgetType.CHART_COMPOSED
  ].includes(selectedWidget.type);

  const isGridChart = isAxisChart || selectedWidget.type === WidgetType.CHART_RADAR;
  const canShowLegend = !isSummary && !isSummaryChart && !isTable;

  // 위젯 타입별 가용 옵션 필터링
  const appearanceOptions = [
    // 'Show Unit' 체크박스는 사용자의 요청에 의해 제거됨 (unit 텍스트 입력 유무로 판단)
    { key: 'showLegend', label: 'Show Legend', visible: canShowLegend },
    // Legend가 켜져있을 때만 Unit in Legend 옵션을 노출함
    { key: 'showUnitInLegend', label: 'Show Unit in Legend', visible: canShowLegend && selectedWidget.config.showLegend },
    { key: 'showLabels', label: 'Show Labels', visible: isPie },
    { key: 'showGrid', label: 'Show Grid Lines', visible: isGridChart },
    { key: 'showXAxis', label: 'Show X-Axis', visible: isAxisChart },
    { key: 'showYAxis', label: 'Show Y-Axis', visible: isAxisChart },
  ].filter(opt => opt.visible);

  return (
    <div className="w-80 h-full bg-[var(--card-bg)] border-l border-[var(--border-color)] p-6 space-y-8 overflow-y-auto custom-scrollbar shadow-2xl text-[var(--text-color)] transition-all">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Widget Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <section className="space-y-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <Layers className="w-4 h-4" /> Visualization
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: WidgetType.SUMMARY_CHART, icon: Activity, label: 'Trend' },
            { id: WidgetType.CHART_BAR, icon: BarChart3, label: 'Bar' },
            { id: WidgetType.CHART_BAR_HORIZONTAL, icon: BarChartHorizontal, label: 'H-Bar' },
            { id: WidgetType.CHART_LINE, icon: TrendingUp, label: 'Line' },
            { id: WidgetType.CHART_COMPOSED, icon: AreaIcon, label: 'Mix' },
            { id: WidgetType.CHART_RADAR, icon: Hexagon, label: 'Radar' },
            { id: WidgetType.CHART_PIE, icon: PieIcon, label: 'Pie' },
            { id: WidgetType.TABLE, icon: TableIcon, label: 'Table' },
            { id: WidgetType.SUMMARY, icon: Database, label: 'Stat' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id as WidgetType)}
              className={`p-2 flex flex-col items-center gap-1 rounded-xl border transition-all ${selectedWidget.type === type.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{type.label}</span>
            </button>
          ))}
        </div>
      </section>

      {isSummary && (
        <section className="space-y-4 border-t dark:border-gray-800 pt-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Smile className="w-4 h-4" /> Icon Settings
          </label>
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Google Icon Name</span>
            <div className="relative group">
              <input
                type="text"
                value={selectedWidget.icon || ''}
                onChange={(e) => onUpdateWidget(selectedWidget.id, { icon: e.target.value })}
                className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                placeholder="e.g. group, monitoring, star"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 text-lg">
                {selectedWidget.icon || 'star'}
              </span>
            </div>
          </div>
        </section>
      )}

      {appearanceOptions.length > 0 && (
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
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${selectedWidget.config[option.key as keyof typeof selectedWidget.config]
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}>
                  {selectedWidget.config[option.key as keyof typeof selectedWidget.config] && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {isChart && !isSummary && !isSummaryChart && (
        <section className="space-y-4 border-t dark:border-gray-800 pt-6">
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
            {(selectedWidget.config.series || []).map((s, idx) => (
              <div key={s.key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border dark:border-gray-700 flex items-center gap-2 group transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm">
                <div className="flex flex-col gap-0.5 mr-1">
                  <button
                    disabled={idx === 0}
                    onClick={() => moveSeries(idx, 'up')}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-0 transition-all"
                  >
                    <ChevronUp className="w-3 h-3 text-gray-500" />
                  </button>
                  <button
                    disabled={idx === (selectedWidget.config.series?.length || 0) - 1}
                    onClick={() => moveSeries(idx, 'down')}
                    className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-0 transition-all"
                  >
                    <ChevronDown className="w-3 h-3 text-gray-500" />
                  </button>
                </div>

                <div className="relative group/picker shrink-0">
                  <div
                    className="w-5 h-5 rounded-md border border-white/20 shadow-sm cursor-pointer"
                    style={{ backgroundColor: s.color?.startsWith('var') ? `var(${s.color.match(/var\(([^)]+)\)/)?.[1] || s.color})` : s.color }}
                  />
                  <input
                    type="color"
                    value={s.color?.startsWith('var') ? '#3b82f6' : s.color || '#3b82f6'}
                    onChange={(e) => handleUpdateSeries(s.key, { color: e.target.value })}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
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
      )}

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
                  value={selectedWidget.config.xAxisLabel || ''}
                  onChange={(e) => onUpdateWidget(selectedWidget.id, { config: { ...selectedWidget.config, xAxisLabel: e.target.value } })}
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
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
              value={selectedWidget.config.unit || ''}
              onChange={(e) => onUpdateWidget(selectedWidget.id, { config: { ...selectedWidget.config, unit: e.target.value } })}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g. 명, $, %"
            />
          </div>

          {(isSummary || isSummaryChart) && (
            <>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Current Value</span>
                <input
                  type="text"
                  value={selectedWidget.mainValue || ''}
                  onChange={(e) => onUpdateWidget(selectedWidget.id, { mainValue: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Description</span>
                <input
                  type="text"
                  value={selectedWidget.subValue || ''}
                  onChange={(e) => onUpdateWidget(selectedWidget.id, { subValue: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </>
          )}
        </div>

        {!isSummary && (
          <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {selectedWidget.data.map((item, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 space-y-2 group/row shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between border-b dark:border-gray-700 pb-1.5 mb-1.5">
                  <input
                    type="text"
                    value={item[selectedWidget.config.xAxisKey] || item.name}
                    onChange={(e) => handleDataChange(idx, selectedWidget.config.xAxisKey || 'name', e.target.value)}
                    className="bg-transparent border-none p-0 text-xs font-black text-blue-600 dark:text-blue-400 focus:ring-0 w-full"
                    placeholder="Label..."
                  />
                  <button onClick={() => removeDataRow(idx)} className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-500 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
                {(selectedWidget.config.series || [{ key: 'value', label: 'Value' }]).map((s) => (
                  <div key={s.key} className="flex items-center justify-between gap-4">
                    <span className="text-[9px] font-bold text-gray-400 uppercase truncate flex-1">{s.label}</span>
                    <input
                      type="number"
                      value={item[s.key] ?? 0}
                      onChange={(e) => handleDataChange(idx, s.key, parseFloat(e.target.value) || 0)}
                      className="w-20 p-1 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded text-xs text-right font-mono font-bold dark:text-white"
                    />
                  </div>
                ))}
              </div>
            ))}
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
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Width</span>
            <select value={selectedWidget.colSpan} onChange={(e) => onUpdateWidget(selectedWidget.id, { colSpan: parseInt(e.target.value) })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              {Array.from({ length: layout.columns }, (_, i) => i + 1).map(val => (<option key={val} value={val}>{val} Cols</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Height</span>
            <select value={selectedWidget.rowSpan} onChange={(e) => onUpdateWidget(selectedWidget.id, { rowSpan: parseInt(e.target.value) })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              {[1, 2, 3, 4].map(val => (<option key={val} value={val}>{val} Rows</option>))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
