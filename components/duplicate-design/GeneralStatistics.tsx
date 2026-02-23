import type { Widget, DashboardTheme } from '../../types';
import WidgetCard from '../WidgetCard';

const categoryData = [
  { name: 'Business', value1: 334, value2: 1340 },
  { name: 'Finance', value1: 911, value2: 1300 },
  { name: 'Travel', value1: 360, value2: 1279 },
  { name: 'Presentation', value1: 288, value2: 993 },
  { name: 'Startup', value1: 276, value2: 898 },
  { name: 'Development', value1: 373, value2: 885 },
  { name: 'Design', value1: 251, value2: 734 },
  { name: 'Product', value1: 185, value2: 696 },
  { name: 'Research', value1: 134, value2: 512 },
  { name: 'Other', value1: 160, value2: 390 },
];

export interface GeneralStatisticsProps {
  theme: DashboardTheme;
  earningWidget?: Widget | null;
  earningTrendWidget?: Widget | null;
  isEditMode?: boolean;
  selectedWidgetId?: string | null;
  onEditWidget?: (id: string) => void;
  onUpdateWidget?: (id: string, updates: Partial<Widget>) => void;
  onDeleteWidget?: (id: string) => void;
  onOpenExcel?: (id: string) => void;
}

export function GeneralStatistics({
  theme,
  earningWidget = null,
  earningTrendWidget = null,
  isEditMode = false,
  selectedWidgetId = null,
  onEditWidget,
  onUpdateWidget,
  onDeleteWidget,
  onOpenExcel,
}: GeneralStatisticsProps) {
  return (
    <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-[340px] border border-[var(--border-base)]">
      <h2 className="text-[var(--text-main)] text-xl mb-6">General statistics</h2>

      {/* Total Earning — EARNING_PROGRESS widget or placeholder */}
      {earningWidget ? (
        <div
          className={`mb-4 min-h-[100px] transition-all duration-200 ${isEditMode && selectedWidgetId === earningWidget.id ? 'widget-selected rounded-xl' : ''}`}
          style={isEditMode && selectedWidgetId === earningWidget.id ? { zIndex: 50 } : undefined}
        >
          <WidgetCard
            widget={earningWidget}
            theme={theme}
            isEditMode={isEditMode}
            onEdit={(id) => onEditWidget?.(id)}
            onUpdate={(id, updates) => onUpdateWidget?.(id, updates)}
            onDelete={(id) => onDeleteWidget?.(id)}
            onOpenExcel={(id) => onOpenExcel?.(id)}
          />
        </div>
      ) : (
        <div className="bg-[var(--surface-muted)] rounded-xl p-4 mb-4 border border-[var(--border-base)]">
          <div className="text-[var(--text-muted)] text-sm">Total earning widget</div>
        </div>
      )}

      {/* Earning Trend — EARNING_TREND widget (replaces static chart section) or placeholder */}
      {earningTrendWidget ? (
        <div
          className={`mb-4 min-h-[180px] transition-all duration-200 ${isEditMode && selectedWidgetId === earningTrendWidget.id ? 'widget-selected rounded-xl' : ''}`}
          style={isEditMode && selectedWidgetId === earningTrendWidget.id ? { zIndex: 50 } : undefined}
        >
          <WidgetCard
            widget={earningTrendWidget}
            theme={theme}
            isEditMode={isEditMode}
            onEdit={(id) => onEditWidget?.(id)}
            onUpdate={(id, updates) => onUpdateWidget?.(id, updates)}
            onDelete={(id) => onDeleteWidget?.(id)}
            onOpenExcel={(id) => onOpenExcel?.(id)}
          />
        </div>
      ) : (
        <div className="bg-[var(--surface-muted)] rounded-xl p-4 mb-4 border border-[var(--border-base)]">
          <div className="text-[var(--text-muted)] text-sm">Earning trend widget</div>
        </div>
      )}

      {/* Category Table */}
      <div className="space-y-2">
        {categoryData.map((item, index) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <div className="w-1 h-1 bg-[var(--border-strong)] rounded-full"></div>
              <span>{item.name}</span>
            </div>
            <div className="flex gap-6">
              <span className="text-[var(--text-muted)] w-8 text-right">{item.value1}</span>
              <span className="text-[var(--text-secondary)] w-12 text-right">{item.value2.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
