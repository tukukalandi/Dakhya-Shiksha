import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PRIMARY_ADMIN_EMAIL } from '../../lib/firebase';

export const AdminLoginPage: React.FC = () => {
  const { loginWithGoogle, simulateAdminLogin, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // If already logged in as admin, redirect to /admin
  React.useEffect(() => {
    if (isAdmin) {
      navigate('/admin');
    }
  }, [isAdmin, navigate]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate('/admin');
    } catch (err: any) {
      console.warn('Google Auth popup notice:', err);
      setError(
        err?.message?.includes('popup-blocked')
          ? 'Google Sign-in popup was blocked by your browser. Please allow popups or use the instant Preview Admin button below.'
          : 'Unable to authenticate with Google. You can use the Quick Admin Sign-in below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdmin = () => {
    simulateAdminLogin();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-900 border-2 border-amber-400 text-amber-300 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-black text-white">Administrator Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Dakshya Shiksha Educational Content Management
          </p>
          <div className="mt-3 inline-block px-3 py-1 rounded bg-slate-700/60 text-amber-300 text-[11px] font-mono">
            Super Admin: {PRIMARY_ADMIN_EMAIL}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/80 border border-red-800 text-red-200 text-xs rounded-xl flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign In with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-slate-700"></div>
            <span className="shrink mx-4 text-[10px] text-slate-500 uppercase font-bold tracking-wider">or instant preview</span>
            <div className="grow border-t border-slate-700"></div>
          </div>

          <button
            onClick={handleQuickAdmin}
            className="w-full py-3 px-4 bg-amber-400 hover:bg-amber-300 text-red-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-red-950" />
            <span>Launch Super Admin Session (tukukalandi@gmail.com)</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700 text-center">
          <Link
            to="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-400 hover:text-amber-300 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
