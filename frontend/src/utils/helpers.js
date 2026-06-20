import { formatDistanceToNow, format } from 'date-fns';

export const severityConfig = {
  critical: { label: 'Critical', color: 'text-red-400',    bg: 'bg-red-900/50',    border: 'border-red-700',    badge: 'badge-critical', dot: 'bg-red-500'    },
  high:     { label: 'High',     color: 'text-orange-400', bg: 'bg-orange-900/50', border: 'border-orange-700', badge: 'badge-high',     dot: 'bg-orange-500' },
  medium:   { label: 'Medium',   color: 'text-yellow-400', bg: 'bg-yellow-900/50', border: 'border-yellow-700', badge: 'badge-medium',   dot: 'bg-yellow-500' },
  low:      { label: 'Low',      color: 'text-green-400',  bg: 'bg-green-900/50',  border: 'border-green-700',  badge: 'badge-low',      dot: 'bg-green-500'  },
};

export const statusConfig = {
  active:     { label: 'Active',     color: 'text-red-400',   bg: 'bg-red-900/50',   badge: 'badge-active'    },
  contained:  { label: 'Contained',  color: 'text-blue-400',  bg: 'bg-blue-900/50',  badge: 'badge-contained' },
  resolved:   { label: 'Resolved',   color: 'text-green-400', bg: 'bg-green-900/50', badge: 'badge-resolved'  },
};

export const categoryLabels = {
  natural_disaster: 'Natural Disaster',
  infrastructure:   'Infrastructure',
  public_health:    'Public Health',
  security:         'Security',
  environmental:    'Environmental',
  other:            'Other',
};

export const resourceStatusConfig = {
  available:   { label: 'Available',   color: 'text-green-400', badge: 'bg-green-900/50 text-green-400 border-green-700' },
  deployed:    { label: 'Deployed',    color: 'text-blue-400',  badge: 'bg-blue-900/50 text-blue-400 border-blue-700'   },
  on_standby:  { label: 'On Standby',  color: 'text-yellow-400',badge: 'bg-yellow-900/50 text-yellow-400 border-yellow-700' },
  unavailable: { label: 'Unavailable', color: 'text-slate-400', badge: 'bg-slate-700/50 text-slate-400 border-slate-600' },
};

export const formatTime = (dateStr) => {
  try { return formatDistanceToNow(new Date(dateStr), { addSuffix: true }); }
  catch { return 'Unknown time'; }
};

export const formatDate = (dateStr) => {
  try { return format(new Date(dateStr), 'MMM d, yyyy HH:mm'); }
  catch { return 'Unknown date'; }
};

export const formatNumber = (n) => {
  if (!n && n !== 0) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000)    return `${(n / 1000).toFixed(1)}K`;
  return n.toLocaleString();
};

export const getCategoryIcon = (category) => {
  const icons = {
    natural_disaster: '🌊',
    infrastructure:   '⚡',
    public_health:    '🏥',
    security:         '🔒',
    environmental:    '☣️',
    other:            '⚠️',
  };
  return icons[category] || '⚠️';
};
