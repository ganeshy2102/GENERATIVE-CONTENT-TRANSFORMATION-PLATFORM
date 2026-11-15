import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Repeat,
  FileText,
  SpellCheck,
  Palette,
  Database,
  CheckCircle2,
  ChevronDown,
  Mail,
  Send,
  Zap,
  ShieldCheck,
  Clock,
  Layers,
  BookOpen
} from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export const LandingPage = ({ onNavigate }) => {
  const { notify } = useNotification();
  const [openFaq, setOpenFaq] = useState(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Features specification from section 6
  const features = [
    {
      title: 'AI Content Generation',
      desc: 'Craft original blogs, essays, emails, social media posts, and reports tailored to specific tones, lengths, and multiple languages.',
      icon: Sparkles,
      gradient: 'from-purple-500 to-indigo-600',
      action: 'generator'
    },
    {
      title: 'Smart Text Transformation',
      desc: 'Rewrite, simplify, expand, shorten, and convert paragraphs into bullet points with instant side-by-side comparison.',
      icon: Repeat,
      gradient: 'from-blue-500 to-cyan-600',
      action: 'transformer'
    },
    {
      title: 'Intelligent Summarization',
      desc: 'Compress lengthy academic papers, PDFs, and articles into concise summaries with key bullet points, main ideas, and keywords.',
      icon: FileText,
      gradient: 'from-emerald-500 to-teal-600',
      action: 'summarizer'
    },
    {
      title: 'Grammar Improvement',
      desc: 'Identify grammatical, spelling, and syntactic issues with detailed rule explanations and readability score improvements.',
      icon: SpellCheck,
      gradient: 'from-amber-500 to-orange-600',
      action: 'grammar'
    },
    {
      title: 'Tone Conversion',
      desc: 'Instantly shift writing between 8 tones: Professional, Academic, Friendly, Formal, Casual, Creative, Persuasive, and Simple.',
      icon: Palette,
      gradient: 'from-pink-500 to-rose-600',
      action: 'tone'
    },
    {
      title: 'Content Management',
      desc: 'Persistent history database with instant search, filtering, TXT downloads, and secure user-scoped access control.',
      icon: Database,
      gradient: 'from-violet-500 to-purple-600',
      action: 'history'
    }
  ];

  // How It Works specification
  const steps = [
    { step: '01', title: 'Enter Content or Prompt', desc: 'Type your topic, paste your draft, or upload document text.' },
    { step: '02', title: 'Select an AI Tool', desc: 'Choose from generation, transformation, summarizer, grammar, or tone.' },
    { step: '03', title: 'Customize Preferences', desc: 'Fine-tune tone, output length, target language, and format options.' },
    { step: '04', title: 'Generate Your Result', desc: 'Our AI engine processes the input and produces contextual results in seconds.' },
    { step: '05', title: 'Copy, Download or Save', desc: 'Export formatted text as TXT, copy to clipboard, or store in database.' }
  ];

  // FAQ specification
  const faqs = [
    {
      q: 'What is the Generative Content Transformation Platform?',
      a: 'GCTP is a modern full-stack web application designed for students, academics, and professionals to streamline writing, editing, summarization, and formatting using state-of-the-art NLP models.'
    },
    {
      q: 'Does the platform work offline for college presentations?',
      a: 'Yes! The platform includes a dedicated College Demo Engine that provides realistic, intelligent text transformations without requiring external paid API keys or active internet connections.'
    },
    {
      q: 'Is user data and content history private?',
      a: 'Absolutely. Every user account is authenticated using encrypted JWT tokens and password hashing. Content history records are strictly scoped to the authenticated user ID.'
    },
    {
      q: 'Which languages are supported?',
      a: 'GCTP supports English, Hindi, and Punjabi content generation and transformations, with modular architectural hooks for additional language models.'
    },
    {
      q: 'Can I export generated and transformed content?',
      a: 'Yes, every module features one-click copy-to-clipboard and direct text (.txt) file download capabilities.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      notify.error('Please complete all contact fields.');
      return;
    }
    setContactSubmitted(true);
    notify.success('Thank you! Your inquiry has been recorded.');
    setTimeout(() => {
      setContactName('');
      setContactEmail('');
      setContactMessage('');
      setContactSubmitted(false);
    }, 4000);
  };

  return (
    <div className="space-y-24 md:space-y-32 pb-20">
      {/* ------------------------------------------------------------- */}
      {/* HERO SECTION                                                  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-semibold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Next-Generation AI Content Transformation</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Transform Your Ideas Into{' '}
            <span className="bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
              Powerful Content
            </span>{' '}
            With AI
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Generate, rewrite, summarize, and improve your content using intelligent AI technology.
            Save time and unlock your creativity.
          </p>

          {/* Hero Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('register')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all transform hover:-translate-y-0.5"
            >
              <span>Start Creating</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-navy-900/60 backdrop-blur-md text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              Explore Features
            </button>
          </div>
        </div>

        {/* Hero Visual: Interactive Dashboard & AI Preview Simulator */}
        <div className="mt-14 relative max-w-5xl mx-auto">
          {/* Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-indigo-500/20 to-blue-500/20 rounded-3xl blur-2xl -z-10" />

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-navy-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            {/* Fake Browser Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-navy-950/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-400 ml-2">gctp-workspace-ai-v1.0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Engine Online
                </span>
              </div>
            </div>

            {/* Simulated Workspace Preview */}
            <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-5 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Input Prompt
                </span>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 font-mono">
                  "Explain the role of generative AI in modern college education and research."
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                    Type: Essay
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                    Tone: Academic
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                    Language: English
                  </span>
                </div>
              </div>

              <div className="md:col-span-7 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>AI Transformed Output</span>
                  <span className="text-slate-400 font-normal">248 words · 100% Quality</span>
                </span>
                <div className="p-4 rounded-xl bg-purple-50/40 dark:bg-navy-950/80 border border-purple-200 dark:border-purple-900/40 text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans space-y-2">
                  <p className="font-semibold text-purple-700 dark:text-purple-300">
                    # Generative AI in Academic Research: A Pedagogical Shift
                  </p>
                  <p>
                    Generative artificial intelligence has redefined the frontiers of scholarly investigation.
                    By accelerating hypothesis formulation, automating literature summarization, and enabling exploratory
                    cross-disciplinary analysis, AI serves as an intellectual co-pilot for modern researchers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FEATURE SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section id="features-section" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Comprehensive Tool Suite
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need To Master Digital Content
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Engineered with modern neural NLP pipelines to transform raw thoughts into refined, production-grade writing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                onClick={() => onNavigate(feat.action)}
                className="group relative bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between hover:-translate-y-1"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.gradient} flex items-center justify-center text-white mb-6 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2.5 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* HOW IT WORKS SECTION                                          */}
      {/* ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-100/50 dark:bg-navy-900/40 py-16 rounded-3xl border border-slate-200/60 dark:border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Intuitive Workflow
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How The Transformation Process Works
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            A frictionless five-step lifecycle taking your ideas from raw concepts to publication-ready artifacts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {steps.map((item, index) => (
            <div key={index} className="relative bg-white dark:bg-navy-950 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-2xl font-black text-purple-500/40 dark:text-purple-400/30 font-mono mb-3 block">
                  {item.step}
                </span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* ABOUT & BENEFITS SECTION                                      */}
      {/* ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Academic & Industry Standard
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            Designed To Eliminate Writing Fatigue & Elevate Productivity
          </h3>
          <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            The Generative Content Transformation Platform was conceived as a major college software engineering initiative.
            It addresses the growing cognitive burden of modern digital creation by synthesizing deep grammatical analysis,
            stylistic adaptation, and summarization into a single unified workspace.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">10x Workflow Speed</h5>
                <p className="text-xs text-slate-500">Draft full articles, emails, and outlines in seconds.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Strict Data Privacy</h5>
                <p className="text-xs text-slate-500">User histories are isolated through cryptographic tokens.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Multilingual Fluency</h5>
                <p className="text-xs text-slate-500">Seamlessly supports English, Hindi, and Punjabi.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-sm font-bold text-slate-900 dark:text-white">Continuous Retention</h5>
                <p className="text-xs text-slate-500">Instant access to all prior transformations and metrics.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Card Grid */}
        <div className="bg-gradient-to-tr from-purple-900/20 via-indigo-900/10 to-blue-900/20 p-8 rounded-3xl border border-purple-500/20 space-y-4">
          <h4 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-500" />
            Target User Personas
          </h4>
          <div className="space-y-3">
            {[
              { role: 'Students & Scholars', benefit: 'Structure essays, synthesize research papers, and audit grammatical precision.' },
              { role: 'Faculty & Educators', benefit: 'Formulate syllabus notes, generate discussion questions, and simplify complex pedagogy.' },
              { role: 'Writers & Bloggers', benefit: 'Break writer block, adapt tone for diverse demographics, and produce multi-channel copy.' },
              { role: 'Business Professionals', benefit: 'Compose executive memos, polish client communications, and compress lengthy reports.' }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white/70 dark:bg-navy-900/80 border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block mb-1">{item.role}</span>
                <p className="text-xs text-slate-600 dark:text-slate-300">{item.benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FAQ SECTION                                                   */}
      {/* ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Frequently Asked Questions
          </h2>
          <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Everything You Need To Know
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-semibold text-slate-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-purple-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CONTACT SECTION                                               */}
      {/* ------------------------------------------------------------- */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-navy-900 to-indigo-950 text-white rounded-3xl p-8 sm:p-12 shadow-2xl border border-purple-500/30">
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
              <Mail className="w-3.5 h-3.5" />
              <span>Get In Touch</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Have Questions or Feedback About GCTP?
            </h3>
            <p className="text-sm text-slate-300">
              Submit your inquiry or college evaluation remarks directly to our engineering team.
            </p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 max-w-xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Your Full Name</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="name@university.edu"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Message or Feedback</label>
              <textarea
                rows={4}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Share your thoughts, suggestions, or project evaluation remarks..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={contactSubmitted}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 font-bold text-sm shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
            >
              {contactSubmitted ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Message Sent Successfully</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
