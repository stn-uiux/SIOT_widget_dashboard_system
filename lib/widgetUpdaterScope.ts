import type { Widget } from '../types';

export type UpdateWidgetFn = (id: string, updates: Partial<Widget>) => void;

/** Applies partial updates to exactly one widget id (no-op if id missing). */
export type ScopedWidgetUpdater = (updates: Partial<Widget>) => void;

/**
 * Binds dashboard `onUpdateWidget` to a fixed widget id.
 * Use for modals, async callbacks, or debounced commits so a late patch cannot
 * land on whatever widget is currently selected in the shell.
 */
export function createWidgetUpdater(
  onUpdateWidget: UpdateWidgetFn,
  widgetId: string | null | undefined
): ScopedWidgetUpdater {
  return (updates) => {
    if (widgetId == null || widgetId === '') return;
    onUpdateWidget(widgetId, updates);
  };
}
