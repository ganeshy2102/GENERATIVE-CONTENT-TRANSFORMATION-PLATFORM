import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Repeat,
  FileText,
  SpellCheck,
  Palette,
  History,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = ({ activeTab, onSelectTab, isMobileOpen, setIsMobileOpen }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generator', label: 'AI Content Generator', icon: Sparkles },
    { id: 'transformer', label: 'Text Transformer', icon: Repeat },
    { id: 'summarizer', label: 'AI Summarizer', icon: FileText },
    { id: 'grammar', label: 'Grammar Checker', icon: SpellCheck },
    { id: 'tone', label: 'Tone Changer', icon: Palette },
    { id: 'history', label: 'Content History', icon: History },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleMenuClick = (id) => {
    onSelectTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      onSelectTab('home');
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-navy-900 border-r border-slate-200 dark:border-slate-800 transition-colors">
      {/* Platform Branding */}
      <div 
        onClick={() => handleMenuClick('dashboard')}
        className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/25">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
              GCTP
            </h1>
            <p className="text-[10px] uppercase font-bold tracking-wider text-purple-600 dark:text-purple-400">
              AI Transformation
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu (Items 1 through 9) */}
      <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Navigation
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800/80 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-500'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white/80" />}
            </button>
          );
        })}
      </nav>

      {/* User Card, Theme Toggle & Item 10: Logout */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/40 space-y-3">
        {/* User Mini Profile */}
        <div 
          onClick={() => handleMenuClick('profile')}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-navy-800/60 cursor-pointer transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow">
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {user?.full_name || 'Active User'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {user?.email || 'user@example.com'}
            </p>
          </div>
        </div>

        {/* Quick controls: Theme switch and Logout */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            title="Toggle Light/Dark Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 h-screen sticky top-0 z-30 flex-shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
