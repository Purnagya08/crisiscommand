import React from 'react';

export default function PageHeader({ title, description, actions, badge }) {
  return (
    <div className="flex flex-col gap-4 rounded-[2rem] border border-white/8 bg-slate-950/55 p-5 shadow-2xl shadow-black/20 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
          {badge && (
            <span className="inline-flex items-center rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-rose-100">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
