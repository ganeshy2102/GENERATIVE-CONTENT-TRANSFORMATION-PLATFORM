import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ToastContainer } from './components/Toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { GeneratorPage } from './pages/GeneratorPage';
import { TransformerPage } from './pages/TransformerPage';
import { SummarizerPage } from './pages/SummarizerPage';
import { GrammarPage } from './pages/GrammarPage';
import { TonePage } from './pages/TonePage';
import { HistoryPage } from './pages/HistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';

import { Menu, Sparkles, User, LogIn } from 'lucide-react';

export function App() {
  const { isAuthenticated, user } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If user logs in and was on auth page, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && (currentPage === 'login' || currentPage === 'register')) {
      setCurrentPage('dashboard');
    }
  }, [isAuthenticated]);

  // Determine whether current view should show the dashboard layout (Sidebar)
  const isDashboardRoute = [
    'dashboard', 'generator', 'transformer', 'summarizer',
    'grammar', 'tone', 'history', 'profile', 'settings'
  ].includes(currentPage);

  const handleNavigate = (pageId) => {
    // If attempting to access private profile or settings without authentication, route to login
    if (['profile', 'settings', 'history'].includes(pageId) && !isAuthenticated) {
      setCurrentPage('login');
      return;
    }
    setCurrentPage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <ToastContainer />

      {isDashboardRoute ? (
        /* ------------------------------------------------------------- */
        /* DASHBOARD LAYOUT (WITH SIDEBAR)                               */
        /* ------------------------------------------------------------- */
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <Sidebar
            activeTab={currentPage}
            onSelectTab={handleNavigate}
            isMobileOpen={isMobileSidebarOpen}
            setIsMobileOpen={setIsMobileSidebarOpen}
          />

          {/* Main Dashboard Canvas */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Top Dashboard Bar for Mobile / Quick Info */}
            <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMobileSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div 
                  onClick={() => handleNavigate('home')} 
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <span className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors">
                    ← Back to Landing Page
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <div 
                    onClick={() => handleNavigate('profile')}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-800 cursor-pointer hover:border-purple-500/50 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 text-white text-xs font-bold flex items-center justify-center">
                      {user?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                      {user?.full_name || 'Active User'}
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleNavigate('login')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </header>

            {/* Page Content View */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
              {currentPage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
              {currentPage === 'generator' && <GeneratorPage />}
              {currentPage === 'transformer' && <TransformerPage />}
              {currentPage === 'summarizer' && <SummarizerPage />}
              {currentPage === 'grammar' && <GrammarPage />}
              {currentPage === 'tone' && <TonePage />}
              {currentPage === 'history' && <HistoryPage />}
              {currentPage === 'profile' && <ProfilePage />}
              {currentPage === 'settings' && <SettingsPage onNavigate={handleNavigate} />}
            </main>
          </div>
        </div>
      ) : (
        /* ------------------------------------------------------------- */
        /* PUBLIC LANDING & AUTH LAYOUT (NAVBAR + FOOTER)               */
        /* ------------------------------------------------------------- */
        <div className="flex flex-col min-h-screen">
          <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

          <main className="flex-1">
            {currentPage === 'home' && <LandingPage onNavigate={handleNavigate} />}
            {currentPage === 'features' && <LandingPage onNavigate={handleNavigate} />}
            {currentPage === 'how-it-works' && <LandingPage onNavigate={handleNavigate} />}
            {currentPage === 'about' && <LandingPage onNavigate={handleNavigate} />}
            {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
            {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
          </main>

          <Footer onNavigate={handleNavigate} />
        </div>
      )}
    </div>
  );
}

export default App;
