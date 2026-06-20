import React from 'react';
import { NavLink } from 'react-router-dom';
import { AlertTriangle, BarChart3, Boxes, Brain, LayoutDashboard, Plus, ShieldAlert, X, Zap } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/crises', label: 'Crises', icon: AlertTriangle },
  { to: '/crises/new', label: 'Create Crisis', icon: Plus },
  { to: '/resources', label: 'Resources', icon: Boxes },
  { to: '/ai', label: 'AI Command', icon: Brain },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        aria-label="Close sidebar overlay"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/8 bg-slate-950/95 backdrop-blur-xl shadow-2xl shadow-black/40 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/8 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/30">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-red-300/80">CrisisCommand</p>
              <h1 className="text-base font-semibold text-white">Operations Center</h1>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-white/5 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-white/8 px-5 py-4">
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-red-200/70">
              <ShieldAlert size={14} />
              Emergency Mode
            </div>
            <p className="text-sm text-slate-200">
              Command, monitor, and coordinate active incidents from one secure console.
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'border border-red-500/20 bg-red-500/12 text-red-100 shadow-lg shadow-red-500/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/8 p-5">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-200">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              System Operational
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Backend and frontend channels are ready for incident intake.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
