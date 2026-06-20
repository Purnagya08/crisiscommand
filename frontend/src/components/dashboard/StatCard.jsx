import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'red', description, trend }) {
  const colorMap = {
    red:    'text-red-400 bg-red-900/30',
    orange: 'text-orange-400 bg-orange-900/30',
    blue:   'text-blue-400 bg-blue-900/30',
    green:  'text-green-400 bg-green-900/30',
    purple: 'text-purple-400 bg-purple-900/30',
    yellow: 'text-yellow-400 bg-yellow-900/30',
  };

  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-400 text-sm font-medium">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-lg ${colorMap[color] || colorMap.red}`}>
            <Icon size={18} className={colorMap[color]?.split(' ')[0] || 'text-red-400'} />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white">{value ?? '—'}</div>
      {description && <p className="text-slate-500 text-xs mt-1">{description}</p>}
      {trend !== undefined && (
        <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)} from last hour
        </p>
      )}
    </div>
  );
}
