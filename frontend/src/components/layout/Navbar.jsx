import React from 'react';
import { Bell, Menu, Radar } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '../../hooks/useAnalytics';

const routeLabels = {
  '/': 'Dashboard',
  '/crises': 'Crises',
  '/crises/new': 'Create Crisis',
  '/resources': 'Resources',
  '/ai': 'AI Command',
  '/analytics': 'Analytics'
};

export default function Navbar({ onMenuClick }) {
  const location = useLocation();
  const { unreadCount } = useAnalytics();
  const title = routeLabels[location.pathname] || 'CrisisCommand';

  return (
    <header className="sticky top-0 z-20 border-b border-white/8 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-xl border border-white/8 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-red-200/70">
              <Radar size={13} />
              Emergency Operations Center
            </div>
            <h2 className="truncate text-lg font-semibold text-white">{title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden rounded-2xl border border-white/8 bg-white/5 px-3 py-2 text-right sm:block">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500">Local Time</p>
            <p className="text-sm text-slate-200">
              {new Date().toLocaleString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short'
              })}
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/8 bg-white/5 p-3 text-slate-200">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
