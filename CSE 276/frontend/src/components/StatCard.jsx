import React from 'react';

export const StatCard = ({ title, value, icon: Icon, changeText, gradient = 'from-purple-500 to-indigo-600' }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <h4 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{value}</h4>
          {changeText && (
            <p className="text-xs font-semibold text-emerald-500 dark:text-emerald-400 mt-2 flex items-center gap-1">
              <span>●</span> {changeText}
            </p>
          )}
        </div>
        <div className={`p-3.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {/* Decorative gradient corner glow */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-xl group-hover:opacity-10 transition-opacity`} />
    </div>
  );
};
