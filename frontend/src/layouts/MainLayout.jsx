import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  User, 
  HelpCircle, 
  LogOut, 
  Sun, 
  Moon, 
  Menu, 
  X,
  FileText,
  Info,
  HeartPulse
} from 'lucide-react';

export default function MainLayout({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apply theme
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Detection', path: '/detection', icon: UploadCloud },
    { name: 'Scan History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
    { name: 'Scientific About', path: '/about', icon: Info },
    { name: 'Clinical Contact', path: '/contact', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <motion.aside 
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-300 z-20 shrink-0"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg animated-gradient flex items-center justify-center text-white shrink-0 shadow-md shadow-cyan-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            {isSidebarOpen && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-lg bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-cyan-300 whitespace-nowrap"
              >
                MedVision AI
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-600 text-white shadow-lg' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-medium text-sm"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Footer Profile in Sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          {isSidebarOpen ? (
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold border border-primary-200 dark:border-primary-800">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">{user?.name}</h4>
                  <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden fixed inset-0 bg-black z-30"
          />
        )}
      </AnimatePresence>
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ type: 'spring', damping: 20 }}
        className="md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col"
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg animated-gradient flex items-center justify-center text-white shrink-0 shadow-md">
              <HeartPulse className="w-4.5 h-4.5" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent dark:from-primary-400 dark:to-cyan-300">MedVision AI</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.name} to={item.path} onClick={() => setIsSidebarOpen(false)}>
                <div className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-primary-700'
                }`}>
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-sm">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-950/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-semibold text-sm truncate text-slate-800 dark:text-slate-200">{user?.name}</h4>
                <p className="text-xs text-slate-500 truncate dark:text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-slate-800 dark:text-slate-100 hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.name || 'Clinical Workspace'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Status Indicator */}
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Clinical Node Online</span>
            </div>

            {/* Dark Mode Switcher */}
            <button 
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
              title="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
