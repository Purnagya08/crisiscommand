import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-slate-600 mb-4" />}
      <h3 className="text-slate-300 font-semibold text-lg mb-1">{title}</h3>
      {description && <p className="text-slate-500 text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
