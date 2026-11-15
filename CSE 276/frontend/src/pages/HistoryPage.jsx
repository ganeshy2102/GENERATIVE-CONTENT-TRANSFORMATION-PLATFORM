import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Trash2,
  Download,
  Eye,
  FileCode,
  Calendar,
  Layers,
  Copy,
  AlertTriangle,
  RotateCw
} from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Modal } from '../components/Modal';

export const HistoryPage = () => {
  const { notify } = useNotification();

  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOp, setSelectedOp] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [search, selectedOp]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getHistory(search, selectedOp);
      if (res.success) {
        setHistoryList(res.history || []);
      }
    } catch (err) {
      console.warn('History fetch fallback:', err.message);
      // Local demo fallback
      setHistoryList([
        {
          id: 101,
          title: 'Article: Artificial Intelligence in Modern Healthcare',
          operation_type: 'generate',
          created_at: new Date().toISOString(),
          word_count: 512,
          input_text: 'Explain AI applications in medical diagnostics and surgery.',
          output_text: 'Artificial intelligence is fundamentally revolutionizing diagnostic precision, robotic surgical operations, and patient triage pipelines across global healthcare institutions.'
        },
        {
          id: 102,
          title: 'Rewrite Text: Corporate Workflow Simplification',
          operation_type: 'transform',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          word_count: 85,
          input_text: 'Our team will utilize systematic algorithmic optimization to terminate latency.',
          output_text: 'Our team will use smart optimization to eliminate delays across the system.'
        },
        {
          id: 103,
          title: 'Summary: Cloud Computing Architecture Analysis',
          operation_type: 'summarize',
          created_at: new Date(Date.now() - 18000000).toISOString(),
          word_count: 120,
          input_text: 'Comprehensive whitepaper evaluating cloud multi-tenancy and microservice scalability...',
          output_text: 'Key architectural pillars include decoupled services, container orchestration, and automated fault tolerance.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this history record?')) return;
    try {
      await api.deleteHistoryItem(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
      notify.success('Record deleted.');
      if (selectedRecord?.id === id) setSelectedRecord(null);
    } catch (err) {
      notify.error(err.message || 'Failed to delete record.');
    }
  };

  const handleClearAll = async () => {
    try {
      await api.clearHistory();
      setHistoryList([]);
      setConfirmClearOpen(false);
      notify.success('All history records cleared.');
    } catch (err) {
      notify.error(err.message || 'Failed to clear history.');
    }
  };

  const downloadRecordTxt = (rec) => {
    const text = `# ${rec.title}\nOperation: ${rec.operation_type}\nCreated: ${rec.created_at}\nWord Count: ${rec.word_count}\n\n--- PROMPT ---\n${rec.input_text}\n\n--- GENERATED RESULT ---\n${rec.output_text}`;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gctp-history-${rec.operation_type}-${rec.id}.txt`;
    a.click();
    notify.success('Downloaded text file.');
  };

  const exportAllJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historyList, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "gctp-history-export.json");
    dlAnchorElem.click();
    notify.success('Full database history exported.');
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-purple-600" />
            <span>Content History</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, view, download, or clear your stored AI generation activities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {historyList.length > 0 && (
            <>
              <button
                onClick={exportAllJson}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={() => setConfirmClearOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved content by title, prompt keywords, or output..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Filter */}
        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <select
            value={selectedOp}
            onChange={(e) => setSelectedOp(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 capitalize"
          >
            <option value="all">All Operations</option>
            <option value="generate">AI Generator</option>
            <option value="transform">Text Transformer</option>
            <option value="summarize">Summarizer</option>
            <option value="grammar">Grammar Checker</option>
            <option value="tone">Tone Changer</option>
          </select>
        </div>
      </div>

      {/* History Table / Records */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RotateCw className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading history records...</p>
          </div>
        ) : historyList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-navy-950/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Title / Snippet</th>
                  <th className="py-3 px-4">Tool</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Word Count</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {historyList.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/60 dark:hover:bg-navy-800/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">{rec.title}</p>
                      <p className="text-xs text-slate-400 truncate max-w-xs">{rec.output_text.replace(/\n+/g, ' ')}</p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${opColors[rec.operation_type] || 'bg-slate-100 text-slate-700'}`}>
                        {rec.operation_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(rec.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                      {rec.word_count} words
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => setSelectedRecord(rec)}
                          className="p-1.5 rounded-lg text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadRecordTxt(rec)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Download TXT"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(rec.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center space-y-3">
            <FileCode className="w-12 h-12 text-slate-400 mx-auto stroke-1" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No content records found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || selectedOp !== 'all'
                ? 'Try adjusting your search query or operation filter.'
                : 'Generated and transformed content will automatically appear in your private database history.'}
            </p>
          </div>
        )}
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord?.title || 'Saved Content Details'}
        maxWidth="max-w-3xl"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs pb-3 border-b border-slate-200 dark:border-slate-800 gap-2">
              <span className={`px-2.5 py-0.5 rounded-full font-medium capitalize border ${opColors[selectedRecord.operation_type]}`}>
                {selectedRecord.operation_type}
              </span>
              <span className="text-slate-400">
                Created: {new Date(selectedRecord.created_at).toLocaleString()} · {selectedRecord.word_count} words
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">Input / Prompt</label>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 max-h-36 overflow-y-auto">
                {selectedRecord.input_text}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-purple-600 dark:text-purple-400">Generated Result</label>
              <div className="p-4 rounded-xl bg-purple-50/20 dark:bg-navy-950/80 border border-purple-200 dark:border-purple-900/40 text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {selectedRecord.output_text}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedRecord.output_text);
                  notify.success('Copied output to clipboard!');
                }}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 hover:bg-purple-100 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Output</span>
              </button>
              <button
                onClick={() => downloadRecordTxt(selectedRecord)}
                className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-300 hover:bg-blue-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TXT</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Clear All Modal */}
      <Modal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Confirm Clear All History"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>
              This action will permanently delete all your saved content transformations and cannot be undone. Are you sure you wish to proceed?
            </p>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setConfirmClearOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleClearAll}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-500 shadow-md"
            >
              Yes, Clear All
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
