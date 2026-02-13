import React from 'react';
import {
  X, Layers, BarChart3, TrendingUp, PieChart as PieIcon,
  Table as TableIcon, LayoutGrid, Plus, Trash2, Database,
  Maximize2, AreaChart as AreaIcon, Palette, ChevronUp, ChevronDown,
  Heading, Activity, Palette as PaletteIcon, Check, Smile, BarChartHorizontal,
  Hexagon, Monitor, MoveVertical, CloudSun, Image, MapPin, Eye, EyeOff
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
  const [activeDualTab, setActiveDualTab] = React.useState<0 | 1>(0);

  if (!selectedWidget) return (
    <div className="w-80 h-full bg-[var(--surface)] border-l border-[var(--border-base)] p-6 space-y-8 flex flex-col shadow-2xl transition-all">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Grid Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
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
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted font-medium">Rows</span>
              <input
                type="number" min="1" max="8"
                value={layout.rows}
                onChange={(e) => onUpdateLayout({ rows: parseInt(e.target.value) || 1 })}
                className="w-full p-2 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-lg outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Fit to Screen Option */}
          <div
            onClick={() => onUpdateLayout({ fitToScreen: !layout.fitToScreen })}
            className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-secondary">Fit to Screen</span>
            </div>
            <div className={`w-8 h-4 rounded-full relative transition-colors ${layout.fitToScreen ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
              <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${layout.fitToScreen ? 'right-0.5' : 'left-0.5'}`} />
            </div>
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
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
            />
          </div>

          <p className="text-[10px] text-muted italic px-1 leading-relaxed">
            * <strong>Fit ON</strong>: 위젯 크기가 화면 비율에 맞춰 자동 조절됨<br />
            * <strong>Fit OFF</strong>: 지정된 Row Height만큼 위젯 크기 고정 (스크롤 발생)
          </p>
        </div>
      </div>
    </div>
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
        data: defaultData.data,
        config: { ...currentConfig, ...defaultData.config },
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

  const isSummary = currentType === WidgetType.SUMMARY;
  const isSummaryChart = currentType === WidgetType.SUMMARY_CHART;
  const isTable = currentType === WidgetType.TABLE;
  const isPie = currentType === WidgetType.CHART_PIE;
  const isImage = currentType === WidgetType.IMAGE;
  const isChart = currentType.includes('CHART') || isTable;

  const isAxisChart = [
    WidgetType.CHART_BAR,
    WidgetType.CHART_BAR_HORIZONTAL,
    WidgetType.CHART_LINE,
    WidgetType.CHART_AREA,
    WidgetType.CHART_COMPOSED
  ].includes(currentType);

  const isGridChart = isAxisChart || currentType === WidgetType.CHART_RADAR;
  const canShowLegend = isChart && !isTable && !isSummaryChart;

  // 위젯 타입별 가용 옵션 필터링
  const appearanceOptions = [
    // 'Show Unit' 체크박스는 사용자의 요청에 의해 제거됨 (unit 텍스트 입력 유무로 판단)
    { key: 'showLegend', label: 'Show Legend', visible: canShowLegend },
    // Legend가 켜져있을 때만 Unit in Legend 옵션을 노출함
    { key: 'showUnitInLegend', label: 'Show Unit in Legend', visible: canShowLegend && currentConfig.showLegend },
    { key: 'showLabels', label: 'Show Labels', visible: isPie },
    { key: 'showGrid', label: 'Show Grid Lines', visible: isGridChart },
    { key: 'showXAxis', label: 'Show X-Axis', visible: isAxisChart },
    { key: 'showYAxis', label: 'Show Y-Axis', visible: isAxisChart },
    { key: 'noBezel', label: 'No Bezel', visible: currentType === WidgetType.MAP || currentType === WidgetType.IMAGE || currentType === WidgetType.WEATHER },
  ].filter(opt => opt.visible);

  const canShowNoBezel = [WidgetType.MAP, WidgetType.IMAGE, WidgetType.WEATHER].includes(currentType);

  return (
    <div className="w-80 h-full bg-[var(--surface)] border-l border-[var(--border-base)] p-6 space-y-8 overflow-y-auto custom-scrollbar shadow-2xl transition-all">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Widget Settings</h2>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
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
          className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
        >
          <div className="flex items-center gap-2">
            <LayoutGrid className={`w-4 h-4 ${selectedWidget.isDual ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className="text-sm font-black uppercase tracking-tighter">Dual Mode</span>
          </div>
          <div className={`w-10 h-6 rounded-full relative transition-colors ${selectedWidget.isDual ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${selectedWidget.isDual ? 'right-1' : 'left-1'}`} />
          </div>
        </div>

        {selectedWidget.isDual && (
          <div className="flex p-1 bg-gray-100 dark:bg-gray-900 rounded-xl">
            <button
              onClick={() => setActiveDualTab(0)}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDualTab === 0 ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Left Graph
            </button>
            <button
              onClick={() => setActiveDualTab(1)}
              className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeDualTab === 1 ? 'bg-white dark:bg-gray-800 text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Right Graph
            </button>
          </div>
        )}
      </div>

      {selectedWidget.isDual && (
        <section className="space-y-4 border-t border-[var(--border-base)] pt-6">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4" /> Dual Layout Config
          </label>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onUpdateWidget(selectedWidget.id, { dualLayout: 'horizontal' })}
                className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${selectedWidget.dualLayout === 'horizontal' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-[var(--border-base)] text-gray-400'}`}
              >
                Horizontal
              </button>
              <button
                onClick={() => onUpdateWidget(selectedWidget.id, { dualLayout: 'vertical' })}
                className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase transition-all ${selectedWidget.dualLayout === 'vertical' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-gray-50 border-[var(--border-base)] text-gray-400'}`}
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
                className="w-full accent-blue-600 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-[var(--border-muted)] space-y-3">
              <div
                onClick={() => onUpdateWidget(selectedWidget.id, { showSubTitles: !selectedWidget.showSubTitles })}
                className="flex items-center justify-between cursor-pointer group"
              >
                <span className="text-xs font-black text-muted uppercase tracking-tighter">Show Subtitles</span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedWidget.showSubTitles ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-gray-800 border-gray-300'}`}>
                  {selectedWidget.showSubTitles && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                </div>
              </div>

              {selectedWidget.showSubTitles && (
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={selectedWidget.subTitle1 || ''}
                    onChange={(e) => onUpdateWidget(selectedWidget.id, { subTitle1: e.target.value })}
                    className="p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] rounded-lg text-[10px] font-bold outline-none"
                    placeholder="Left Label"
                  />
                  <input
                    type="text"
                    value={selectedWidget.subTitle2 || ''}
                    onChange={(e) => onUpdateWidget(selectedWidget.id, { subTitle2: e.target.value })}
                    className="p-2 bg-white dark:bg-gray-800 border border-[var(--border-base)] rounded-lg text-[10px] font-bold outline-none"
                    placeholder="Right Label"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

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
              className={`p-2 flex flex-col items-center gap-1 rounded-xl border transition-all ${currentType === type.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] text-gray-400 hover:border-gray-300'
                }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{type.label}</span>
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
          {[
            { id: WidgetType.WEATHER, icon: CloudSun, label: 'Weather' },
            { id: WidgetType.IMAGE, icon: Image, label: 'Image' },
            { id: WidgetType.MAP, icon: MapPin, label: 'Map' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => handleTypeChange(type.id as WidgetType)}
              className={`p-2 flex flex-col items-center gap-1 rounded-xl border transition-all ${currentType === type.id
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 shadow-sm'
                : 'bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] text-gray-400 hover:border-gray-300'
                }`}
            >
              <type.icon className="w-4 h-4" />
              <span className="text-[9px] font-bold truncate w-full text-center uppercase tracking-tighter">{type.label}</span>
            </button>
          ))}
        </div>
      </section>


      {isSummary && (
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
                className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                placeholder="e.g. group, monitoring, star"
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 text-lg">
                {(isSec ? selectedWidget.secondaryIcon : selectedWidget.icon) || 'star'}
              </span>
            </div>
          </div>
        </section>
      )}

      {isImage && (
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
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
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
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
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
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold"
                placeholder="Image description..."
              />
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
                <div className={`w-5 h-5 rounded flex items-center justify-center transition-all ${(option.key === 'noBezel' ? (isSec ? selectedWidget.secondaryNoBezel : selectedWidget.noBezel) : (currentConfig as any)[option.key])
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600'
                  }`}>
                  {(option.key === 'noBezel' ? (isSec ? selectedWidget.secondaryNoBezel : selectedWidget.noBezel) : (currentConfig as any)[option.key]) && (
                    <Check className="w-3.5 h-3.5 text-white stroke-[3px]" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}



      {isChart && !isSummary && !isSummaryChart && (


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
              <div key={s.key} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-[var(--border-base)] flex items-center gap-2 group transition-all hover:border-gray-300 dark:hover:border-gray-600 shadow-sm">
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

                <div className="relative group/picker shrink-0">
                  <div
                    className="w-5 h-5 rounded-md border border-[var(--border-strong)] shadow-sm cursor-pointer"
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
                  value={currentConfig.xAxisLabel || ''}
                  onChange={(e) => updateCurrentWidget({ config: { ...currentConfig, xAxisLabel: e.target.value } })}
                  className="w-full p-2.5 pl-9 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
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
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="e.g. 명, $, %"
            />
          </div>

          {(isSummary || isSummaryChart) && (
            <>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Current Value</span>
                <input
                  type="text"
                  value={currentMainValue || ''}
                  onChange={(e) => updateCurrentWidget({ mainValue: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Description</span>
                <input
                  type="text"
                  value={currentSubValue || ''}
                  onChange={(e) => updateCurrentWidget({ subValue: e.target.value })}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </>
          )}
        </div>

        {!isSummary && (
          <div className="max-h-80 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {currentData.map((item, idx) => (
              <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-[var(--border-base)] space-y-2 group/row shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between border-b border-[var(--border-base)] pb-1.5 mb-1.5">
                  <input
                    type="text"
                    value={item[currentConfig.xAxisKey] || item.name}
                    onChange={(e) => handleDataChange(idx, currentConfig.xAxisKey || 'name', e.target.value)}
                    className="bg-transparent border-none p-0 text-xs font-black text-blue-600 dark:text-blue-400 focus:ring-0 w-full"
                    placeholder="Label..."
                  />
                  <button onClick={() => removeDataRow(idx)} className="opacity-0 group-hover/row:opacity-100 text-red-400 hover:text-red-500 transition-opacity"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
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
            <select value={selectedWidget.colSpan} onChange={(e) => onUpdateWidget(selectedWidget.id, { colSpan: parseInt(e.target.value) })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              {Array.from({ length: layout.columns }, (_, i) => i + 1).map(val => (<option key={val} value={val}>{val} Cols</option>))}
            </select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 ml-1">Height</span>
            <select value={selectedWidget.rowSpan} onChange={(e) => onUpdateWidget(selectedWidget.id, { rowSpan: parseInt(e.target.value) })} className="w-full p-2.5 bg-gray-50 dark:bg-gray-800 border border-[var(--border-base)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer">
              {[1, 2, 3, 4].map(val => (<option key={val} value={val}>{val} Rows</option>))}
            </select>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Sidebar;
