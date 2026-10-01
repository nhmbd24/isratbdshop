import React, { useState } from 'react';
import { useAuth, PRIMARY_ADMIN_EMAIL } from '../../context/AuthContext';
import { Lock, ShieldCheck, X, AlertCircle, LogIn, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  if (!isOpen) return null;

  const { loginWithGoogle, currentUser, isAdmin, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'লগইন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            এডমিন লগইন প্যানেল
          </h3>
          <p className="text-xs text-slate-300 mt-1 bengali-font">
            Israt BD Shop এর সুরক্ষিত কন্ট্রোল প্যানেলে প্রবেশ করুন
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {currentUser ? (
            <div className="text-center space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-500">বর্তমান লগইন অ্যাকাউন্ট:</p>
              <div className="font-bold text-sm text-slate-800 truncate">{currentUser.email}</div>
              {isAdmin ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>অনুমোদিত এডমিন</span>
                </div>
              ) : (
                <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  ⚠️ এই ইমেইলটি এডমিন অনুমোদিত নয়। প্রধান এডমিন ইমেইল: <strong>{PRIMARY_ADMIN_EMAIL}</strong>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                {isAdmin ? (
                  <button
                    onClick={onLoginSuccess}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all"
                  >
                    ড্যাশবোর্ডে প্রবেশ করুন
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer transition-all"
                  >
                    অন্য গুগল অ্যাকাউন্ট দিয়ে লগইন
                  </button>
                )}
                <button
                  onClick={() => logout()}
                  className="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  লগআউট
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center space-x-1 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>নিরাপদ ফায়ারবেস অথেন্টিকেশন:</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  এডমিন লগইন করতে আপনার অনুমোদিত গুগল অ্যাকাউন্ট ব্যবহার করুন।
                </p>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center space-x-2.5 text-sm transition-all cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center space-x-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>লগইন হচ্ছে...</span>
                  </span>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>গুগল অ্যাকাউন্ট দিয়ে লগইন করুন</span>
                  </>
                )}
              </button>
            </div>
          )}

          <div className="pt-2 text-center text-[11px] text-slate-400">
            🔒 ফায়ারবেস সিকিউরিটি রুলস দ্বারা সম্পূর্ণ সুরক্ষিত
          </div>
        </div>
      </div>
    </div>
  );
};
