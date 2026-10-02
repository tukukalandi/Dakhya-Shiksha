import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Video, 
  HelpCircle, 
  Layers, 
  GraduationCap, 
  Users, 
  Settings, 
  LogOut, 
  ArrowLeft, 
  Menu, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Award,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/admin/study-materials', label: 'Study Materials', icon: FileText },
    { to: '/admin/study-materials/add', label: 'Add Material', icon: PlusCircle },
    { to: '/admin/videos', label: 'Video Corner', icon: Video },
    { to: '/admin/quizzes', label: 'Quiz Management', icon: HelpCircle },
    { to: '/admin/categories', label: 'Classes & Subjects', icon: Layers },
    { to: '/admin/admins', label: 'Admins Management', icon: Users },
    { to: '/admin/settings', label: 'Portal Settings', icon: Settings },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <ShieldCheck className="w-16 h-16 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Administrator Access Required</h2>
          <p className="text-xs text-slate-400 mb-6">
            Only authorized administrators can access the Dakshya Shiksha management portal.
          </p>
          <div className="space-y-3">
            <Link
              to="/admin/login"
              className="block w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-red-950 font-bold text-xs rounded-xl transition"
            >
              Sign In to Admin Portal
            </Link>
            <Link
              to="/"
              className="block w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-xl transition"
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col">
      {/* Admin Top Navigation Bar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-4 py-3 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/admin" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-red-900 text-amber-400 flex items-center justify-center font-black text-xs border border-amber-400 shadow-xs">
              DS
            </div>
            <div>
              <span className="font-black text-sm text-white tracking-wide">
                DAKSHYA ADMIN
              </span>
              <span className="hidden sm:inline-block ml-2 px-1.5 py-0.2 bg-red-900 text-amber-300 text-[10px] font-bold rounded uppercase">
                Control Center
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {/* Return to Public Website */}
          <Link
            to="/"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold rounded-lg border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('returnToWebsite')}</span>
            <span className="sm:hidden">Website</span>
          </Link>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-2 border-l border-slate-700 pl-3">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-slate-200 truncate max-w-[160px]">
                {user?.email || 'tukukalandi@gmail.com'}
              </p>
              <p className="text-[10px] text-amber-400 font-medium">Super Administrator</p>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-red-100 transition cursor-pointer"
              title="Logout from Admin Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 pt-16 lg:pt-0 z-20 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Content Management
            </div>

            {navItems.map((item) => {
              const active = isActive(item.to, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    active
                      ? 'bg-red-900 text-amber-300 shadow-sm border border-red-800'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-400">
              Storage Repositories
            </div>

            <a
              href="https://drive.google.com/drive/folders/1IS3GnAqnkU7hxW3Q3rlAtBuHlZ7VQ7fO?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition"
            >
              <span>Google Drive Folder</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            </a>
          </div>

          <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
            Dakshya Shiksha v2.6 • Firebase Secure
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-50 dark:bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
