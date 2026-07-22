import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HeartPulse, Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';

export default function PublicLayout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Scientific About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <header className="h-16 flex items-center justify-between px-6 sm:px-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/40 fixed top-0 w-full z-30 transition-colors duration-300">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg animated-gradient flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <HeartPulse className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-cyan-300">
            MedVision AI
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path} 
              className={`text-sm font-semibold hover:text-primary-500 transition-colors ${
                location.pathname === link.path 
                  ? 'text-primary-500 dark:text-primary-400' 
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          
          {isLoggedIn ? (
            <Link 
              to="/dashboard"
              className="bg-primary-500 text-white hover:bg-primary-600 px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-primary-500/10"
            >
              Go to Workspace <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link 
                to="/login"
                className="text-slate-700 dark:text-slate-300 hover:text-primary-500 font-semibold text-sm px-4 py-2"
              >
                Log In
              </Link>
              <Link 
                to="/register"
                className="bg-gradient-to-r from-primary-500 to-cyan-500 text-white hover:opacity-90 px-5 py-2 rounded-xl text-sm font-semibold transition-all shadow-md shadow-cyan-500/15"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-xl"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-white dark:bg-slate-950 z-20 flex flex-col p-6 border-t border-slate-200/50 dark:border-slate-850 md:hidden">
          <nav className="flex flex-col gap-6 mb-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-semibold text-slate-700 dark:text-slate-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="flex flex-col gap-4 mt-auto">
            {isLoggedIn ? (
              <Link 
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full bg-primary-500 text-white text-center py-3 rounded-xl font-semibold shadow-md"
              >
                Go to Workspace
              </Link>
            ) : (
              <>
                <Link 
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-350 text-center py-3 rounded-xl font-semibold"
                >
                  Log In
                </Link>
                <Link 
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-primary-500 text-white text-center py-3 rounded-xl font-semibold shadow-md"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center text-white">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-slate-850 dark:text-slate-200">MedVision AI</span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center md:max-w-lg leading-relaxed">
            Disclaimer: This application uses artificial intelligence to perform preliminary screening of brain MRI scans.
            It is designed strictly for educational, informational, and research purposes.
            Always consult a licensed neuroradiologist for formal diagnoses.
          </p>

          <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
            © {new Date().getFullYear()} MedVision AI Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
