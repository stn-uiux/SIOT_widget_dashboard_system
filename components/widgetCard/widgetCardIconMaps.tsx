import React from 'react';
import {
  TrendingDown,
  User,
  Repeat,
  Activity,
  BarChart3,
  TrendingUp,
  Database,
  Users,
  Clock,
  CloudSun,
  ShieldCheck,
  Workflow,
  Server,
  Network,
} from 'lucide-react';

export const GENERAL_KPI_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  TrendingDown,
  User,
  Repeat,
  Activity,
  BarChart3,
  TrendingUp,
  Database,
  Users,
  Clock,
};

export const MATERIAL_SYMBOL_ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  partly_cloudy_day: CloudSun,
  verified_user: ShieldCheck,
  schema: Workflow,
  dns: Server,
  lan: Network,
  database: Database,
};
