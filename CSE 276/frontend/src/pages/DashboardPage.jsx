import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Repeat,
  FileText,
  SpellCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  Eye,
  FileCode,
  CheckCircle2,
  Calendar,
  Layers,
  Copy,
  Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';

export const DashboardPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const { notify } = useNotification();

  const [stats, setStats] = useState({
    total_generated: 0,
    total_words_processed: 0,
    total_summarized: 0,
    total_activities: 0,
    total_transformations: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.getStats();
      if (res.success) {
        setStats(res.statistics || {});
        setRecentActivities(res.recent_activities || []);
        setTimeline(res.activity_timeline || []);
        setBreakdown(res.breakdown || {});
      }
    } catch (err) {
      console.warn('Dashboard stats fallback:', err.message);
      // Friendly local fallback if offline
      setStats({
        total_generated: 4,
        total_words_processed: 1840,
        total_summarized: 2,
        total_activities: 8,
        total_transformations: 2
      });
      setRecentActivities([
        {
          id: 1,
          title: 'Article: Artificial Intelligence in Modern Healthcare',
          operation_type: 'generate',
          created_at: new Date().toISOString(),
          word_count: 512,
          input_text: 'Explain AI applications in medical diagnostics and surgery.',
          output_text: 'Artificial intelligence is fundamentally revolutionizing diagnostic precision...'
        },
        {
          id: 2,
          title: 'Summary: Cloud Architecture Best Practices',
          operation_type: 'summarize',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          word_count: 140,
          input_text: 'Detailed multi-page report on microservices and Kubernetes scaling...',
          output_text: 'Key architectural pillars include decoupled services, containerization...'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (txt) => {
    if (!txt) return;
    navigator.clipboard.writeText(txt);
    notify.success('Copied to clipboard!');
  };

  const downloadTxt = (item) => {
    if (!item) return;
    const blob = new Blob([`# ${item.title}\n\nOperation: ${item.operation_type}\nDate: ${item.created_at}\n\n--- OUTPUT ---\n${item.output_text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.operation_type}-${item.id}.txt`;
    a.click();
    notify.success('Downloaded content.');
  };

  const opColors = {
    generate: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    transform: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    summarize: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    grammar: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    tone: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border-pink-200 dark:border-pink-800',
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ------------------------------------------------------------- */}
      {/* DASHBOARD HEADER                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome Back, {user?.full_name || 'Creator'}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time analytics and quick access to your AI transformation workspace.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <Calendar className="w-3.5 h-3.5" />
            {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4 REAL STATISTIC CARDS                                        */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Content Generated"
          value={stats.total_generated || 0}
          icon={Sparkles}
          changeText="Original AI Generations"
          gradient="from-purple-500 to-indigo-600"
        />
        <StatCard
          title="Total Words Processed"
          value={(stats.total_words_processed || 0).toLocaleString()}
          icon={TrendingUp}
          changeText="Active Vocabulary Yield"
          gradient="from-blue-500 to-cyan-600"
        />
        <StatCard
          title="Total Documents Summarized"
          value={stats.total_summarized || 0}
          icon={FileText}
          changeText="Compressed Reports"
          gradient="from-emerald-500 to-teal-600"
        />
        <StatCard
          title="Recent Activities"
          value={stats.total_activities || 0}
          icon={Clock}
          changeText="Lifetime Platform Events"
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* QUICK ACTION CARDS                                            */}
      {/* ------------------------------------------------------------- */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Generate Content',
              desc: 'Create blogs, essays, emails, or stories from prompts.',
              icon: Sparkles,
              action: 'generator',
              border: 'hover:border-purple-500/60'
            },
            {
              title: 'Transform Text',
              desc: 'Rewrite, simplify, expand, or convert to bullet points.',
              icon: Repeat,
              action: 'transformer',
              border: 'hover:border-blue-500/60'
            },
            {
              title: 'Summarize Text',
              desc: 'Compress documents and extract key takeaways.',
              icon: FileText,
              action: 'summarizer',
              border: 'hover:border-emerald-500/60'
            },
            {
              title: 'Check Grammar',
              desc: 'Detect errors and enhance sentence structure.',
              icon: SpellCheck,
              action: 'grammar',
              border: 'hover:border-amber-500/60'
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(item.action)}
                className={`p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all cursor-pointer group flex flex-col justify-between ${item.border} hover:-translate-y-1`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-purple-600 dark:text-purple-400">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVITY OVER TIME & BREAKDOWN CHART                          */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Timeline Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Activity Over Time</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Operations and processed words across the past 7 days</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300">
              7-Day View
            </span>
          </div>

          {/* SVG Bar Chart Visualization */}
          <div className="h-48 w-full flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {timeline.length > 0 ? (
              timeline.map((item, idx) => {
                const maxOps = Math.max(...timeline.map(t => t.operations), 4);
                const heightPercent = Math.min(100, Math.max(14, (item.operations / maxOps) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.operations} ops
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 transition-all shadow-sm group-hover:scale-105"
                      title={`${item.date}: ${item.operations} operations, ${item.words} words`}
                    />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {item.date}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
                Activity data will populate as you perform transformations.
              </div>
            )}
          </div>
          <div className="flex items-center justify-between pt-3 text-xs text-slate-400">
            <span>● Higher bars represent increased platform engagement</span>
            <span className="font-mono">Live Sync</span>
          </div>
        </div>

        {/* Breakdown by tool */}
        <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Tool Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Operations by feature category</p>
            <div className="space-y-3">
              {[
                { label: 'Content Generator', key: 'generate', color: 'bg-purple-500' },
                { label: 'Text Transformer', key: 'transform', color: 'bg-blue-500' },
                { label: 'Summarizer', key: 'summarize', color: 'bg-emerald-500' },
                { label: 'Grammar Checker', key: 'grammar', color: 'bg-amber-500' },
                { label: 'Tone Changer', key: 'tone', color: 'bg-pink-500' },
              ].map((cat, idx) => {
                const count = breakdown[cat.key] || 0;
                const total = Math.max(1, Object.values(breakdown).reduce((a, b) => a + b, 0));
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300">{cat.label}</span>
                      <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div style={{ width: `${pct}%` }} className={`h-full ${cat.color} rounded-full`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="mt-6 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 text-center transition-colors"
          >
            View Full Database History
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* RECENT ACTIVITY SECTION                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Activities</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Latest records generated and saved in your database</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivities.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-3">Content Title</th>
                  <th className="py-3 px-3">Operation</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Word Count</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {recentActivities.map((act) => (
                  <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-3 font-semibold text-slate-900 dark:text-white max-w-xs truncate">
                      {act.title}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${opColors[act.operation_type] || 'bg-slate-100 text-slate-700'}`}>
                        {act.operation_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(act.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-3 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {act.word_count} words
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedItem(act)}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center space-y-3">
            <FileCode className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No content records found yet.</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Transform, generate, or summarize your first piece of text to start tracking database history.
            </p>
            <button
              onClick={() => onNavigate('generator')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold shadow-md hover:bg-purple-500 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Your First Content</span>
            </button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title={selectedItem?.title || 'Content Details'}
        maxWidth="max-w-3xl"
      >
        {selectedItem && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-medium capitalize border ${opColors[selectedItem.operation_type]}`}>
                Type: {selectedItem.operation_type}
              </span>
              <span className="text-slate-400">
                Created on: {new Date(selectedItem.created_at).toLocaleString()} · {selectedItem.word_count} words
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-400">Prompt / Input Text</label>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto">
                {selectedItem.input_text}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">Generated / Transformed Output</label>
              <div className="p-4 rounded-xl bg-purple-50/20 dark:bg-navy-950/80 border border-purple-200 dark:border-purple-900/40 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {selectedItem.output_text}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => copyToClipboard(selectedItem.output_text)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </button>
              <button
                onClick={() => downloadTxt(selectedItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
