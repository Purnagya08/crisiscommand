import React, { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, Boxes, Brain,
  BarChart3, Menu, X, Zap, Bell
} from 'lucide-react';
import { useAnalytics } from '../../hooks/useAnalytics';

const navItems = [
  { to: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/crises',    label: 'Crises',     icon: AlertTriangle   },
  { to: '/resources', label: 'Resources',  icon: Boxes           },
  { to: '/ai',        label: 'AI Command', icon: Brain           },
  { to: '/analytics', label: 'Analytics',  icon: BarChart3       },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { unreadCount } = useAnalytics();
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-900">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-800 border-r border-slate-700
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-lg bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/50">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">Crisis</h1>
            <span className="text-red-400 text-xs font-semibold tracking-widest">COMMAND</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                ${isActive
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'text-slate-400 hover:bg-slate-700 hover:text-slate-100'}
              `}
            >
              <Icon size={18} />
              {label}
              {label === 'AI Command' && (
                <span className="ml-auto text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">AI</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* System Status */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            System Operational
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost p-2"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          <div className="hidden lg:block">
            <span className="text-slate-400 text-sm">
              {navItems.find(n => n.to === location.pathname)?.label || 'CrisisCommand'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <div className="relative">
                <Bell size={20} className="text-slate-400" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </div>
            )}
            <div className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
