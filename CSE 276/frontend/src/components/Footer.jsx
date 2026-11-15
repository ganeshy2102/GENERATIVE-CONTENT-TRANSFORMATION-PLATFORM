import React from 'react';
import { Sparkles, Heart, Shield, Cpu, Code2 } from 'lucide-react';

export const Footer = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-navy-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                GCTP
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
              Generative Content Transformation Platform is an AI-powered web platform designed to empower students,
              teachers, bloggers, and professionals by automating writing, summarization, proofreading, and stylistic conversion.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-purple-500" /> Secure Token Auth</span>
              <span className="flex items-center gap-1.5"><Cpu className="w-4 h-4 text-blue-500" /> Modular AI Architecture</span>
              <span className="flex items-center gap-1.5"><Code2 className="w-4 h-4 text-indigo-500" /> SQLite + SQLAlchemy</span>
            </div>
          </div>

          {/* Platform Tools */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              AI Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigate('generator')} className="hover:text-purple-600 transition-colors">AI Content Generator</button></li>
              <li><button onClick={() => onNavigate('transformer')} className="hover:text-purple-600 transition-colors">Smart Text Transformer</button></li>
              <li><button onClick={() => onNavigate('summarizer')} className="hover:text-purple-600 transition-colors">Intelligent Summarizer</button></li>
              <li><button onClick={() => onNavigate('grammar')} className="hover:text-purple-600 transition-colors">Grammar & Spell Checker</button></li>
              <li><button onClick={() => onNavigate('tone')} className="hover:text-purple-600 transition-colors">Multi-Tone Converter</button></li>
            </ul>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li><button onClick={() => onNavigate('home')} className="hover:text-purple-600 transition-colors">Home Page</button></li>
              <li><button onClick={() => onNavigate('features')} className="hover:text-purple-600 transition-colors">Platform Features</button></li>
              <li><button onClick={() => onNavigate('how-it-works')} className="hover:text-purple-600 transition-colors">How It Works</button></li>
              <li><button onClick={() => onNavigate('login')} className="hover:text-purple-600 transition-colors">User Sign In</button></li>
              <li><button onClick={() => onNavigate('register')} className="hover:text-purple-600 transition-colors">Register Account</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Generative Content Transformation Platform. College Major Project Demonstration.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" /> for Academic Excellence & Scalability.
          </p>
        </div>
      </div>
    </footer>
  );
};
