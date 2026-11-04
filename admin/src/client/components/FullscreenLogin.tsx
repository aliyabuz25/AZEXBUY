import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { UiLanguage, AdminUser } from '../types';

interface FullscreenLoginProps {
  onLoginSuccess: (token: string, user: AdminUser, expiresIn: number, isDefaultCredentials?: boolean) => void;
  uiLang?: UiLanguage;
}

export const FullscreenLogin: React.FC<FullscreenLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!username.trim()) { setErrorMsg('İstifadəçi adını daxil edin'); return; }
    if (!password) { setErrorMsg('Şifrəni daxil edin'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.data?.token) {
        onLoginSuccess(data.data.token, data.data.user, data.data.expiresIn || 600, data.isDefaultCredentials);
      } else {
        setErrorMsg(data.error || 'İstifadəçi adı və ya şifrə yanlışdır');
      }
    } catch (err: any) {
      setErrorMsg('Server cavab vermir');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999999] bg-white flex items-center justify-center">
      <div className="w-full max-w-sm px-8">

        {/* Brand */}
        <div className="mb-10">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Admin Panel</div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">AZEXBUY</h1>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              İstifadəçi Adı
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
              <input
                type="text"
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full h-10 pl-9 pr-3 text-sm text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Şifrə
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 pl-9 pr-10 text-sm text-slate-900 bg-white border border-slate-200 focus:outline-none focus:border-slate-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#0f3156] hover:bg-[#081c33] text-white text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span>Daxil Ol</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-[10px] text-slate-300 text-center">
          Octotech Universal Controller
        </div>

      </div>
    </div>
  );
};
