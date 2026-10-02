import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  GraduationCap, 
  Layers, 
  Video, 
  HelpCircle,
  Award, 
  Info, 
  Mail, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronRight,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Language } from '../../types';

export const Header: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Prevent body scrolling when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  // Close drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Main navigation items:
  // Classes, Study Materials, Video Corner, Olympiad, About, Contact
  const primaryNavItems = [
    { 
      to: '/classes', 
      label: t('classes') || 'Classes', 
      desc: 'Class 1 to 12 & Pre-primary learning',
      icon: GraduationCap, 
      color: 'bg-emerald-500/20 text-emerald-300' 
    },
    { 
      to: '/study-materials', 
      label: t('studyMaterials') || 'Study Materials', 
      desc: 'Notes, NCERT books, question papers',
      icon: Layers, 
      color: 'bg-blue-500/20 text-blue-300' 
    },
    { 
      to: '/video-corner', 
      label: t('videoCorner') || 'Video Corner', 
      desc: 'Chapter-wise video lessons & tutorials',
      icon: Video, 
      color: 'bg-rose-500/20 text-rose-300' 
    },
    { 
      to: '/quizzes', 
      label: t('quiz') || 'Quiz', 
      desc: 'Interactive chapter practice quizzes',
      icon: HelpCircle, 
      color: 'bg-purple-500/20 text-purple-300' 
    },
    { 
      to: '/olympiad', 
      label: t('olympiad') || 'Olympiad', 
      desc: 'IMO, NSO, IEO, NCO & Reasoning prep',
      icon: Award, 
      color: 'bg-amber-500/20 text-amber-300' 
    },
    { 
      to: '/about', 
      label: t('about') || 'About', 
      desc: 'About Dakshya Shiksha initiative',
      icon: Info, 
      color: 'bg-sky-500/20 text-sky-300' 
    },
    { 
      to: '/contact', 
      label: t('contact') || 'Contact', 
      desc: 'Get in touch & academic assistance',
      icon: Mail, 
      color: 'bg-orange-500/20 text-orange-300' 
    },
  ];

  const languages: { code: Language; label: string; nativeName: string }[] = [
    { code: 'en', label: 'English', nativeName: 'English' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ' }
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-red-900 text-white shadow-md border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Portal Identity */}
            <Link 
              to="/" 
              className="flex items-center space-x-2.5 sm:space-x-3 group text-left cursor-pointer shrink-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {/* India Post inspired Emblem Stamp */}
              <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-lg bg-amber-400 p-1 flex items-center justify-center shadow-md border-2 border-amber-300 group-hover:scale-105 transition-transform duration-200">
                <div className="w-full h-full bg-red-900 rounded flex flex-col items-center justify-center text-amber-300">
                  <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 -mb-0.5" />
                  <span className="text-[7px] sm:text-[8px] font-black tracking-widest text-amber-200 uppercase">SHIKSHA</span>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-lg sm:text-2xl font-black tracking-tight text-white drop-shadow-xs leading-none">
                    {t('brandName')}
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 bg-amber-400 text-red-950 text-[10px] font-extrabold uppercase rounded tracking-wider shadow-xs">
                    PORTAL
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200/90 font-medium tracking-wide mt-0.5">
                  {t('brandSubtitle')}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation (visible on large screens 1200px+) */}
            <nav className="hidden xl:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-2.5 py-2 rounded-md text-xs font-semibold tracking-wide transition ${
                  isActive('/') ? 'bg-amber-400 text-red-950 font-bold shadow-xs' : 'text-amber-100 hover:bg-red-800 hover:text-white'
                }`}
              >
                <span>{t('home')}</span>
              </Link>

              {primaryNavItems.map((link) => {
                const active = isActive(link.to);
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`px-2.5 py-2 rounded-md text-xs font-semibold tracking-wide transition ${
                      active
                        ? 'bg-amber-400 text-red-950 font-bold shadow-xs'
                        : 'text-amber-100 hover:bg-red-800 hover:text-white'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}

              {/* Admin Button */}
              <div className="pl-2 border-l border-red-700/60 ml-1">
                <Link
                  to={isAdmin ? '/admin' : '/admin/login'}
                  className="px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-red-950 text-xs font-bold transition shadow-xs flex items-center space-x-1 cursor-pointer"
                  title="Admin Control Center"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-red-900" />
                  <span>{isAdmin ? t('adminDashboard') : t('adminLogin')}</span>
                </Link>
              </div>
            </nav>

            {/* Mobile / Tablet Controls: Prominent Three Lines (Menu) Button */}
            <div className="flex items-center space-x-2">
              {/* Quick Admin Icon for mobile */}
              <Link
                to={isAdmin ? '/admin' : '/admin/login'}
                className="p-2 rounded-lg bg-red-950/80 hover:bg-red-800 text-amber-300 border border-red-800 transition xl:hidden flex items-center"
                title="Admin Login"
              >
                <ShieldCheck className="w-4 h-4" />
              </Link>

              {/* THREE LINES (MENU) BUTTON */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-2 bg-amber-400 hover:bg-amber-300 active:scale-95 text-red-950 rounded-lg font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer border border-amber-300"
                aria-label="Open Navigation Menu"
              >
                {/* Crisp Three Lines (Hamburger) Icon */}
                <Menu className="w-5 h-5 text-red-950 stroke-[2.8]" />
                <span className="uppercase tracking-wider font-extrabold text-red-950">Menu</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* FULL-FEATURED MOBILE DRAWER / OVERLAY SHEET */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out Drawer Panel */}
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-slate-900 text-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 border-l border-amber-400/40">
            {/* Drawer Header */}
            <div className="p-4 bg-red-900 border-b-2 border-amber-400 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-md bg-amber-400 p-0.5 flex items-center justify-center shadow-xs">
                  <div className="w-full h-full bg-red-900 rounded flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-amber-300" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-black text-white leading-tight">
                    {t('brandName')}
                  </h2>
                  <p className="text-[10px] text-amber-200 uppercase tracking-wider font-bold">
                    Navigation Menu
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-red-950/80 hover:bg-red-800 text-amber-200 hover:text-white transition cursor-pointer border border-red-800"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Navigation List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {/* Home Link */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between p-3 rounded-xl transition ${
                  isActive('/') 
                    ? 'bg-amber-400 text-red-950 font-bold shadow-md' 
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isActive('/') ? 'bg-red-900 text-amber-300' : 'bg-slate-700 text-amber-400'
                  }`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{t('home')}</div>
                    <div className={`text-[11px] ${isActive('/') ? 'text-red-900/80' : 'text-slate-400'}`}>
                      Return to portal homepage
                    </div>
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isActive('/') ? 'text-red-950' : 'text-slate-500'}`} />
              </Link>

              {/* All Requested Items: Classes, Study Materials, Video Corner, Quiz, Olympiad, Subjects, About, Contact */}
              {primaryNavItems.map((item) => {
                const active = isActive(item.to);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl transition cursor-pointer ${
                      active
                        ? 'bg-amber-400 text-red-950 font-bold shadow-md'
                        : 'bg-slate-800/80 hover:bg-slate-800 text-slate-100 hover:text-white border border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                        active ? 'bg-red-900 text-amber-300' : item.color
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold flex items-center space-x-1.5">
                          <span>{item.label}</span>
                          {item.to === '/olympiad' && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/20 text-amber-300 rounded font-bold uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                        <div className={`text-[11px] ${active ? 'text-red-900/80' : 'text-slate-400'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${active ? 'text-red-950' : 'text-slate-500'}`} />
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer with Quick Utilities & Admin */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
              {/* Language and Theme Switcher Row */}
              <div className="flex items-center justify-between gap-2">
                {/* Language Switch */}
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
                  <Globe className="w-3.5 h-3.5 text-amber-400 ml-1.5 mr-0.5" />
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => setLanguage(l.code)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                        language === l.code
                          ? 'bg-amber-400 text-red-950 shadow-xs'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>

                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-800 transition flex items-center space-x-1 text-xs font-semibold cursor-pointer"
                  title="Toggle Theme"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      <span className="text-[11px] text-slate-200">Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-amber-300" />
                      <span className="text-[11px] text-slate-200">Dark</span>
                    </>
                  )}
                </button>
              </div>

              {/* Admin Portal Button */}
              <Link
                to={isAdmin ? '/admin' : '/admin/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs sm:text-sm shadow-md transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-red-900" />
                <span>{isAdmin ? t('adminDashboard') : t('adminLogin')}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR (FIXED FOR SMARTPHONES) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-red-950/95 backdrop-blur-md border-t-2 border-amber-400 shadow-2xl px-2 py-1.5 flex items-center justify-around text-white">
        <Link
          to="/"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/') ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Home</span>
        </Link>

        <Link
          to="/classes"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/classes') ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Classes</span>
        </Link>

        <Link
          to="/study-materials"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/study-materials') ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Materials</span>
        </Link>

        <Link
          to="/olympiad"
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition ${
            isActive('/olympiad') ? 'text-amber-300 font-bold' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-none">Olympiad</span>
        </Link>

        {/* Dedicated Three Lines (Menu) trigger in Bottom Bar */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className={`flex flex-col items-center py-1 px-2 rounded-lg transition cursor-pointer ${
            mobileMenuOpen ? 'text-amber-300 font-bold' : 'text-amber-400 hover:text-amber-300'
          }`}
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5 mb-0.5 stroke-[2.8]" />
          <span className="text-[10px] font-black uppercase tracking-wider leading-none">Menu</span>
        </button>
      </div>
    </>
  );
};
