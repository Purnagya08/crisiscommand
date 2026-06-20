import React from 'react';

export default function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {badge && (
            <span className="text-xs font-semibold bg-red-600/20 text-red-400 border border-red-600/30 px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
