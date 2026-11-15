import React, { useState } from 'react';
import {
  Sparkles,
  Copy,
  Download,
  RotateCw,
  Check,
  Globe,
  Sliders,
  Type,
  AlignLeft,
  FileText,
  BookmarkCheck,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

export const GeneratorPage = () => {
  const { notify } = useNotification();
  const { settings } = useAuth();

  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('Article');
  const [tone, setTone] = useState(settings?.preferred_tone || 'Professional');
  const [length, setLength] = useState('Medium');
  const [language, setLanguage] = useState(settings?.preferred_language || 'English');
  const [instructions, setInstructions] = useState('');
  
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  // Content type options specified in section 9
  const contentTypes = [
    'Blog', 'Article', 'Essay', 'Assignment', 'Email',
    'Social Media Post', 'Product Description', 'Story', 'Professional Report'
  ];

  // Writing tones specified
  const tones = [
    'Professional', 'Academic', 'Friendly', 'Casual',
    'Creative', 'Persuasive', 'Informative'
  ];

  const lengths = [
    { id: 'Short', desc: '150-250 words' },
    { id: 'Medium', desc: '400-600 words' },
    { id: 'Long', desc: '800-1200 words' }
  ];

  const languages = ['English', 'Hindi', 'Punjabi'];

  const samplePrompts = [
    'Explain the importance of artificial intelligence in education.',
    'Write a project proposal for a renewable energy management system.',
    'Compose a professional email requesting feedback on a quarterly audit report.',
    'Social media launch announcement for an eco-friendly smart gadget.'
  ];

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      notify.error('Please enter a content topic or prompt.');
      return;
    }

    setGenerating(true);
    setCopied(false);
    setSaved(false);

    try {
      const res = await api.generateContent({
        topic: topic.trim(),
        content_type: contentType,
        tone: tone,
        length: length,
        language: language,
        instructions: instructions.trim(),
        save_to_history: true
      });

      if (res.success) {
        setResult(res.data);
        setSaved(true);
        notify.success('Content generated successfully!');
      }
    } catch (err) {
      console.warn('API error, using client generator fallback:', err.message);
      // Client-side fallback if backend disconnected
      const fallbackText = `# ${topic}\n\n*Type: ${contentType} | Tone: ${tone} | Language: ${language}*\n\n` +
        `Artificial intelligence is transforming how ideas are synthesized and developed. Regarding "${topic}", ` +
        `modern methodologies emphasize high efficiency, qualitative depth, and structured execution. ` +
        `By integrating clear frameworks, students and professionals can consistently produce impactful results.`;
      
      setResult({
        content: fallbackText,
        word_count: fallbackText.split(/\s+/).length,
        is_demo: true,
        provider: 'Offline Fallback'
      });
      notify.info('Generated in offline presentation mode.');
    } finally {
      setGenerating(false);
    }
  };

  const copyContent = () => {
    if (!result?.content) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    notify.success('Copied to clipboard!');
  };

  const downloadTxt = () => {
    if (!result?.content) return;
    const cleanName = topic.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_');
    const blob = new Blob([result.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gctp-${cleanName}.txt`;
    a.click();
    notify.success('TXT file downloaded.');
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-purple-600" />
          <span>AI Content Generator</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Synthesize high-caliber blogs, essays, emails, assignments, and reports with deep customization.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form & Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
            {/* A. Content Topic */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-purple-500" />
                  <span>Content Topic or Prompt *</span>
                </label>
                <span className="text-[11px] text-slate-400">{topic.length} chars</span>
              </div>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Explain the importance of artificial intelligence in education."
                className="w-full p-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all"
              />
              {/* Sample Chips */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400 self-center mr-1">Suggestions:</span>
                {samplePrompts.slice(0, 2).map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setTopic(prompt)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors truncate max-w-[260px]"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {/* B. Content Type & C. Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {contentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Writing Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {tones.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* D. Content Length & E. Language */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Target Length
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {lengths.map((len) => (
                    <button
                      key={len.id}
                      type="button"
                      onClick={() => setLength(len.id)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold transition-all border ${
                        length === len.id
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800'
                      }`}
                    >
                      <div>{len.id}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue-500" />
                  <span>Language</span>
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* F. Additional Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                <span>Additional Instructions (Optional)</span>
              </label>
              <input
                type="text"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Include 3 bullet points, use active voice, cite future trends..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Generating Intelligent Content...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Content</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output Panel */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full min-h-[480px]">
            {/* Output Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-navy-950/50">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Generated Output
                </span>
                {result?.is_demo && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    College Demo Mode
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={downloadTxt}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </button>
                  <button
                    onClick={() => handleGenerate()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
                    title="Regenerate"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Output Text Area */}
            <div className="p-6 flex-1 overflow-y-auto">
              {generating ? (
                <div className="h-full flex flex-col items-center justify-center space-y-4 py-16 text-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-600 animate-spin" />
                    <Sparkles className="w-5 h-5 text-purple-600 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Synthesizing Content...</h4>
                    <p className="text-xs text-slate-400 mt-1">Applying {tone} style in {language} format</p>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span>{result.word_count || 0} words processed</span>
                    <span>Provider: {result.provider || 'AI Engine'}</span>
                  </div>
                  <div className="prose dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                    {result.content}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-16 text-center text-slate-400">
                  <FileText className="w-12 h-12 stroke-1" />
                  <p className="text-sm font-semibold">Your generated output will appear here</p>
                  <p className="text-xs max-w-xs text-slate-500">
                    Enter a prompt and select your configuration on the left to begin content creation.
                  </p>
                </div>
              )}
            </div>

            {/* Output Footer */}
            {result && (
              <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-navy-950/40 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <BookmarkCheck className="w-4 h-4" />
                  <span>Saved automatically to Content History</span>
                </span>
                <span className="font-mono">{result.content.length} characters</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
