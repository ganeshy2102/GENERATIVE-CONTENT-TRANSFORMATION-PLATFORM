import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Calendar,
  Lock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  KeyRound,
  RotateCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';

export const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();
  const { notify } = useNotification();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [profileStats, setProfileStats] = useState({
    total_generated_content: 0,
    total_words_processed: 0,
    total_transformations: 0
  });

  // Password update form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchProfileStats();
  }, []);

  const fetchProfileStats = async () => {
    try {
      const res = await api.getProfile();
      if (res.success && res.user) {
        setProfileStats({
          total_generated_content: res.user.total_generated_content || 0,
          total_words_processed: res.user.total_words_processed || 0,
          total_transformations: res.user.total_transformations || 0
        });
      }
    } catch (err) {
      console.warn('Profile fetch error:', err.message);
    }
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      notify.error('Full name cannot be blank.');
      return;
    }

    setUpdatingProfile(true);
    try {
      await updateUserProfile(fullName.trim());
      notify.success('Profile name updated successfully!');
    } catch (err) {
      notify.error(err.message || 'Failed to update profile.');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      notify.error('Please complete all password fields.');
      return;
    }

    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword, confirmPassword);
      if (res.success) {
        notify.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to change password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <User className="w-7 h-7 text-purple-600" />
          <span>My Profile</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your account credentials, security preferences, and review your productivity metrics.
        </p>
      </div>

      {/* User Hero Identity Card */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center gap-6">
        {/* Dynamic Avatar */}
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-purple-500/25 flex-shrink-0">
          {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user?.full_name || 'Active User'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-1.5">
            <Mail className="w-4 h-4 text-purple-500" />
            <span>{user?.email || 'user@university.edu'}</span>
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Member Since: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
            </span>
            <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Token Authenticated
            </span>
          </div>
        </div>
      </div>

      {/* Profile Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs uppercase font-bold text-slate-400">Total Content Generated</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
            {profileStats.total_generated_content}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs uppercase font-bold text-slate-400">Total Words Processed</span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
            {profileStats.total_words_processed.toLocaleString()}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
          <span className="text-xs uppercase font-bold text-slate-400">Total Transformations</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
            {profileStats.total_transformations}
          </p>
        </div>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Update Profile Name */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <User className="w-5 h-5 text-purple-600" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Profile Details</h4>
          </div>

          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address (Read-only)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-navy-950/40 text-slate-400 text-sm cursor-not-allowed"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Email addresses cannot be modified to preserve cryptographic history ownership.
              </span>
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {updatingProfile ? 'Saving Changes...' : 'Update Name'}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-5 h-5 text-indigo-500" />
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Security & Password</h4>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {updatingPassword ? 'Updating Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
