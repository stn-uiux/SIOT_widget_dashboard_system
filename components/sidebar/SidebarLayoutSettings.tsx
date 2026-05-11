import React from 'react';
import {
  X, LayoutGrid, Check, MoveVertical, Layers, Workflow, CheckCircle2, GripVertical,
} from 'lucide-react';
import { DashboardTheme, LayoutConfig, ThemeMode, Widget } from '../../types';
import Switch from '../Switch';

export interface SidebarLayoutSettingsProps {
  theme: DashboardTheme;
  layout: LayoutConfig;
  onUpdateLayout: (updates: Partial<LayoutConfig>) => void;
  onUpdateTheme?: (updates: Partial<DashboardTheme>) => void;
  onBatchUpdateWidgets?: (updates: Partial<Widget>) => void;
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
  onSave?: () => void;
}

const SidebarLayoutSettings: React.FC<SidebarLayoutSettingsProps> = ({
  theme,
  layout,
  onUpdateLayout,
  onUpdateTheme,
  onBatchUpdateWidgets,
  onClose,
  onDragStart,
  onSave,
}) => {
  const [batchW, setBatchW] = React.useState<number>(6);
  const [batchH, setBatchH] = React.useState<number>(10);

  return (
    <div className={`flex flex-col overflow-hidden transition-all duration-500 border ${theme.mode === ThemeMode.LIGHT ? "text-slate-800" : "text-slate-50"
      }`} style={{
        width: 'var(--panel-width)',
        maxHeight: '100%',
        borderRadius: 'var(--panel-radius)',
        border: 'var(--floating-panel-border)',
      }}>
      <header className="flex items-center justify-between border-b border-[var(--border-base)] bg-transparent shrink-0 cursor-move"
        style={{
          height: 'var(--panel-header-height)',
          paddingLeft: 'var(--panel-header-padding-x)',
          paddingRight: 'var(--panel-header-padding-x)'
        }}
        onMouseDown={onDragStart}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-muted/30 cursor-move" />
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold tracking-tighter text-main leading-none">Layout Settings</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={onSave} className="p-1.5 rounded-xl transition-all hover:scale-110 active:scale-95 bg-[var(--success)] text-[var(--white)] hover:brightness-110 shadow-lg" style={{ boxShadow: 'var(--success-button-glow)' }} title="저장하기">
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-all text-muted hover:text-main"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--action-hover-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar" style={{
        padding: 'var(--panel-padding)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--panel-content-gap)',
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
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-70"><rect x="1" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="6" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="11" y="1" width="4" height="14" fill="currentColor" opacity="0.5" rx="0.5" /></svg>
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
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 opacity-70"><rect x="1" y="1" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="1" y="6" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="1" y="11" width="14" height="4" fill="currentColor" opacity="0.5" rx="0.5" /></svg>
                Rows (Auto)
              </span>
              <div className="relative group">
                <input
                  type="text"
                  value="AUTO"
                  disabled
                  className="w-full p-2 text-[var(--text-muted)] border border-[var(--border-base)] rounded-[var(--radius-md)] cursor-not-allowed font-bold text-center text-xs tracking-widest opacity-60"
                  style={{ backgroundColor: 'var(--surface-muted)' }}
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
                  <svg viewBox="0 0 20 20" className="w-full h-full text-primary"><rect x="1" y="1" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5" /><rect x="7" y="1" width="5" height="5" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="13" y="1" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5" /><rect x="1" y="7" width="5" height="5" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="7" y="7" width="5" height="5" fill="currentColor" opacity="0.6" rx="0.5" /><rect x="13" y="7" width="5" height="5" fill="currentColor" opacity="0.4" rx="0.5" /></svg>
                ) : (
                  <svg viewBox="0 0 20 20" className="w-full h-full text-primary"><rect x="2" y="2" width="5" height="4" fill="currentColor" opacity="0.4" rx="0.5" /><rect x="8" y="2" width="6" height="7" fill="currentColor" opacity="0.5" rx="0.5" /><rect x="15" y="2" width="3" height="3" fill="currentColor" opacity="0.35" rx="0.5" /><rect x="2" y="7" width="4" height="5" fill="currentColor" opacity="0.45" rx="0.5" /><rect x="7" y="10" width="6" height="4" fill="currentColor" opacity="0.5" rx="0.5" /></svg>
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

                <div className="w-px h-8 shrink-0" style={{ backgroundColor: 'var(--border-muted)' }} />

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
                type="button"
                onClick={() => onBatchUpdateWidgets?.({ colSpan: batchW, rowSpan: batchH })}
                className={`w-full group/btn relative overflow-hidden py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 shadow-lg bg-[var(--primary-color)] text-white text-xs font-bold hover:brightness-110 hover:shadow-[var(--primary-color)]/25`}
              >
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

          <div
            className={`flex items-center justify-between px-4 py-3 border border-[var(--border-base)] cursor-pointer transition-all group rounded-[var(--radius-xl)] glass-item`}
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 shrink-0 rounded-lg bg-transparent border border-[var(--border-muted)] flex items-center justify-center p-1" title="위로 쏠리지 않고 고정">
                <svg viewBox="0 0 20 20" className="w-full h-full text-primary/70"><rect x="1" y="2" width="18" height="5" fill="currentColor" opacity="0.4" rx="0.5" /><rect x="3" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5" /><rect x="11" y="9" width="6" height="5" fill="currentColor" opacity="0.35" rx="0.5" /></svg>
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
};

export default SidebarLayoutSettings;
