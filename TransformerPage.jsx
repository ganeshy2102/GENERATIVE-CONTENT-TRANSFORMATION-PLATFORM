import React, { useState } from 'react';
import {
  Repeat,
  Sparkles,
  Trash2,
  FileText,
  RotateCw,
  Copy,
  Download,
  Check,
  Columns
} from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { ComparisonView } from '../components/ComparisonView';

export const TransformerPage = () => {
  const { notify } = useNotification();

  const [inputText, setInputText] = useState('');
  const [selectedOp, setSelectedOp] = useState('Rewrite Text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // 9 exact transformation options from Section 10
  const transformationOptions = [
    'Rewrite Text',
    'Improve Writing',
    'Simplify Language',
    'Expand Content',
    'Shorten Content',
    'Convert to Bullet Points',
    'Convert to Paragraph',
    'Professional Rewrite',
    'Academic Rewrite'
  ];

  const sampleTexts = {
    standard: "Our team has decided to leverage next-generation artificial intelligence algorithms in order to facilitate optimal throughput and subsequently terminate redundant workflows across the operational pipeline.",
    bullets: "• Initial requirement analysis completed.\n• Backend REST endpoints implemented.\n• Frontend React views connected with Tailwind CSS styling.\n• SQLite database tables seeded with test data."
  };

  const handleTransform = async () => {
    if (!inputText.trim()) {
      notify.error('Please enter or paste text to transform.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.transformText({
        text: inputText.trim(),
        transformation_type: selectedOp,
        save_to_history: true
      });

      if (res.success) {
        setResult(res.data);
        notify.success('Text transformed successfully!');
      }
    } catch (err) {
      console.warn('API error, falling back locally:', err.message);
      // Fallback
      setResult({
        transformed_text: `[${selectedOp}] ${inputText.trim()}`,
        original_word_count: inputText.trim().split(/\s+/).length,
        transformed_word_count: inputText.trim().split(/\s+/).length + 4,
        transformation_type: selectedOp,
        is_demo: true
      });
      notify.info('Transformed using local fallback.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    notify.info('Cleared input and transformed result.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Repeat className="w-7 h-7 text-blue-500" />
          <span>Smart Text Transformer</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Restructure, simplify, expand, or stylize existing content with side-by-side comparison.
        </p>
      </div>

      {/* 9 Transformation Selector Pills */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
          Select Transformation Engine:
        </span>
        <div className="flex flex-wrap gap-2">
          {transformationOptions.map((op) => (
            <button
              key={op}
              onClick={() => setSelectedOp(op)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedOp === op
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-700'
              }`}
            >
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Input Text
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0} words · {inputText.length} chars)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInputText(sampleTexts.standard)}
              className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:underline"
            >
              Load Sample Text
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setInputText(sampleTexts.bullets)}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Load Bullets
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-medium text-rose-500 hover:text-rose-600 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste or type your text here to transform..."
          className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-sans"
        />

        <div className="flex justify-end">
          <button
            onClick={handleTransform}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Transforming with AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Execute: {selectedOp}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Comparison View Component */}
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Columns className="w-4 h-4 text-purple-500" />
          <span>Before & After Comparison</span>
        </h3>
        <ComparisonView
          originalText={inputText}
          transformedText={result?.transformed_text || ''}
          originalTitle="Original Input Text"
          transformedTitle={`Output (${selectedOp})`}
          isDemo={result?.is_demo}
        />
      </div>
    </div>
  );
};
