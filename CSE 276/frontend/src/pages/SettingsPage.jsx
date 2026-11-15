import React, { useState } from 'react';
import {
  Settings,
  Sun,
  Moon,
  Globe,
  Palette,
  Shield,
  LogOut,
  Save,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export const SettingsPage = ({ onNavigate }) => {
  const { settings, updateUserSettings, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { notify } = useNotification();

  const [preferredLanguage, setPreferredLanguage] = useState(settings?.preferred_language || 'English');
  const [preferredTone, setPreferredTone] = useState(settings?.preferred_tone || 'Professional');
  const [saving, setSaving] = useState(false);

  const languages = ['English', 'Hindi', 'Punjabi'];
  const tones = [
    'Professional', 'Academic', 'Friendly', 'Casual',
    'Creative', 'Persuasive', 'Informative'
  ];

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserSettings({
        preferred_language: preferredLanguage,
        preferred_tone: preferredTone,
        theme: theme
      });
      notify.success('Platform preferences saved successfully!');
    } catch (err) {
      notify.error(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      logout();
      onNavigate('home');
      notify.info('Signed out successfully.');
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-7 h-7 text-purple-600" />
          <span>Platform Settings</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure default language targets, writing tones, appearance themes, and account sessions.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Appearance Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Sun className="w-5 h-5 text-amber-500" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Interface Appearance</h4>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Color Theme
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  theme === 'dark'
                    ? 'border-purple-600 bg-purple-500/10 text-white shadow-sm ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-purple-400" />
                  <div>
                    <span className="text-sm font-bold block">Dark Navy Mode</span>
                    <span className="text-[11px] text-slate-400">Low-glare SaaS aesthetic</span>
                  </div>
                </div>
                {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                  theme === 'light'
                    ? 'border-purple-600 bg-purple-500/10 text-slate-900 shadow-sm ring-2 ring-purple-500/30'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Sun className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="text-sm font-bold block">Light Mode</span>
                    <span className="text-[11px] text-slate-400">Crisp daytime readability</span>
                  </div>
                </div>
                {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-purple-500" />}
              </button>
            </div>
          </div>
        </div>

        {/* Content Defaults Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Palette className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Content Generation Defaults</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-500" />
                <span>Default Writing Language</span>
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-pink-500" />
                <span>Default Writing Tone</span>
              </label>
              <select
                value={preferredTone}
                onChange={(e) => setPreferredTone(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* AI Engine Status Card */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">AI Engine Status</h4>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Pipeline</span>
              <p className="text-[11px] text-slate-500">
                Operating with modular OpenAI / Gemini connector & deterministic College Major Demo Engine.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              ● Ready & Certified
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Preferences'}</span>
          </button>
        </div>
      </form>

      {/* Danger Zone / Logout */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h5 className="text-sm font-bold text-rose-700 dark:text-rose-400">Account Session</h5>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Sign out of this computer to clear your active authorization token.
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md transition-all flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
