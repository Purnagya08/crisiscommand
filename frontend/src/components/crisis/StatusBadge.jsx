import React from 'react';
import { severityConfig, statusConfig } from '../../utils/helpers';

export const SeverityBadge = ({ severity }) => {
  const cfg = severityConfig[severity] || severityConfig.low;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.active;

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
};
