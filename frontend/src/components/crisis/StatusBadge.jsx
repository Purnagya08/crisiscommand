import React from 'react';
import { severityConfig, statusConfig } from '../../utils/helpers';

export const SeverityBadge = ({ severity }) => {
  const cfg = severityConfig[severity] || severityConfig.low;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.active;
  return (
    <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
};
