import { format, formatDistanceToNow } from 'date-fns';

export const severityConfig = {
  critical: {
    label: 'Critical',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    dot: 'bg-rose-400'
  },
  high: {
    label: 'High',
    color: 'text-orange-300',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot: 'bg-orange-400'
  },
  medium: {
    label: 'Medium',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    dot: 'bg-amber-400'
  },
  low: {
    label: 'Low',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    dot: 'bg-emerald-400'
  }
};

export const statusConfig = {
  active: {
    label: 'Active',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20'
  },
  contained: {
    label: 'Contained',
    color: 'text-sky-300',
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/20'
  },
  resolved: {
    label: 'Resolved',
    color: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  }
};

export const categoryLabels = {
  natural_disaster: 'Natural Disaster',
  infrastructure: 'Infrastructure',
  public_health: 'Public Health',
  security: 'Security',
  environmental: 'Environmental',
  other: 'Other'
};

export const resourceStatusConfig = {
  available: {
    label: 'Available',
    badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
  },
  deployed: {
    label: 'Deployed',
    badge: 'bg-sky-500/10 text-sky-300 border-sky-500/20'
  },
  on_standby: {
    label: 'On Standby',
    badge: 'bg-amber-500/10 text-amber-300 border-amber-500/20'
  },
  unavailable: {
    label: 'Unavailable',
    badge: 'bg-slate-500/10 text-slate-300 border-slate-500/20'
  }
};

export const formatTime = (dateStr) => {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return 'Unknown time';
  }
};

export const formatDate = (dateStr) => {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a');
  } catch {
    return 'Unknown date';
  }
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—';
  const n = Number(value);
  if (Math.abs(n) >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

export const getCategoryIcon = (category) => {
  const icons = {
    natural_disaster: '🌊',
    infrastructure: '⚡',
    public_health: '🏥',
    security: '🔒',
    environmental: '☣️',
    other: '⚠️'
  };

  return icons[category] || '⚠️';
};
