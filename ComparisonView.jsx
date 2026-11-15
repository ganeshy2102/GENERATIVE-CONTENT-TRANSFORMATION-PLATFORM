import React, { useState } from 'react';
import { Copy, Download, Check, Columns, SquareSplitVertical } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const ComparisonView = ({
  originalText = '',
  transformedText = '',
  originalTitle = 'Original Content',
  transformedTitle = 'Transformed Result',
  onSave,
  isDemo = false
}) => {
  const [viewMode, setViewMode] = useState('split'); // 'split' or 'tabs'
  const [activeTab, setActiveTab] = useState('transformed');
  const [copiedTransformed, setCopiedTransformed] = useState(false);
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const { notify } = useNotification();

  const getWordCount = (txt) => txt ? txt.trim().split(/\s+/).filter(Boolean).length : 0;
  const getCharCount = (txt) => txt ? txt.length : 0;

  const copyToClipboard = (text, isTransformed = true) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (isTransformed) {
      setCopiedTransformed(true);
      setTimeout(() => setCopiedTransformed(false), 2000);
    } else {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    }
    notify.success('Copied to clipboard!');
  };

  const downloadTxt = (text, filename = 'transformed-content.txt') => {
    if (!text) return;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    notify.success('Download started!');
  };

  return (
    <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      {/* Action Toolbar Header */}
      <div className="flex flex-wrap items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-navy-850/50 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display View:</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-navy-900">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'split'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split View</span>
            </button>
            <button
              onClick={() => setViewMode('tabs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'tabs'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <SquareSplitVertical className="w-3.5 h-3.5" />
              <span>Tabbed</span>
            </button>
          </div>
          {isDemo && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
              Demo Simulation Mode
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <button
              onClick={onSave}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700 transition-colors"
            >
              Save to History
            </button>
          )}
          <button
            onClick={() => copyToClipboard(transformedText, true)}
            disabled={!transformedText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 transition-colors disabled:opacity-50"
          >
            {copiedTransformed ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTransformed ? 'Copied' : 'Copy Result'}</span>
          </button>
          <button
            onClick={() => downloadTxt(transformedText, 'gctp-transformed-content.txt')}
            disabled={!transformedText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download TXT</span>
          </button>
        </div>
      </div>

      {/* Main Content Areas */}
      {viewMode === 'split' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
          {/* Left: Original */}
          <div className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{originalTitle}</span>
                <span className="text-xs text-slate-400">
                  {getWordCount(originalText)} words · {getCharCount(originalText)} chars
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans min-h-[220px]">
                {originalText || <span className="italic text-slate-400">Original text will appear here...</span>}
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/40 flex justify-end">
              <button
                onClick={() => copyToClipboard(originalText, false)}
                disabled={!originalText}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors disabled:opacity-30"
              >
                {copiedOriginal ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy Original</span>
              </button>
            </div>
          </div>

          {/* Right: Transformed */}
          <div className="p-5 bg-purple-50/20 dark:bg-purple-950/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-purple-100 dark:border-purple-900/30">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                  {transformedTitle}
                </span>
                <span className="text-xs text-purple-600/70 dark:text-purple-400/70 font-mono">
                  {getWordCount(transformedText)} words · {getCharCount(transformedText)} chars
                </span>
              </div>
              <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap font-sans leading-relaxed min-h-[220px]">
                {transformedText || <span className="italic text-slate-400">Click generate or transform to produce output...</span>}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Tabbed View */
        <div className="p-5">
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
            <button
              onClick={() => setActiveTab('transformed')}
              className={`pb-2.5 px-4 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'transformed'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {transformedTitle} ({getWordCount(transformedText)} words)
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`pb-2.5 px-4 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === 'original'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {originalTitle} ({getWordCount(originalText)} words)
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[220px]">
            {activeTab === 'transformed'
              ? (transformedText || <span className="italic text-slate-400">No output yet.</span>)
              : (originalText || <span className="italic text-slate-400">No original text provided.</span>)}
          </div>
        </div>
      )}
    </div>
  );
};
