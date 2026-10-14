import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  LogIn,
  Globe
} from 'lucide-react';
import { authService, UserAccount } from '../services/authService';
import { Language } from '../types';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
  language: Language;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  language,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        language === 'km' 
          ? 'សូមបញ្ចូលឈ្មោះគណនី (Username) និងលេខសម្ងាត់ (Password)' 
          : 'Please enter both Username and Password'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.login(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          onLoginSuccess(res.user!);
          onClose();
        }, 600);
      } else {
        setErrorMsg(res.message);
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with School Branding */}
        <div 
          className="relative px-6 pt-7 pb-6 text-white text-center overflow-hidden"
          style={{ backgroundColor: '#991b1b' }}
        >
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-950/40 rounded-full blur-xl" />

          {/* Close button */}
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* School Badge */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white p-1 shadow-lg ring-4 ring-amber-300/60 mb-3 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.jpg" 
              alt="Logo" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug">
            {language === 'km' ? 'ចូលប្រើប្រាស់ប្រព័ន្ធ' : language === 'zh-TW' ? '系統登入' : 'System Login'}
          </h3>
          <p className="text-xs text-red-100 font-medium mt-1">
            សាលារៀនចិនលីស៊ីងអន្តរជាតិ (日興國際學校)
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'km' ? 'ឈ្មោះគណនី (Username)' : 'Username'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={language === 'km' ? 'ឈ្មោះគណនី...' : 'Username...'}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'km' ? 'លេខសម្ងាត់ (Password)' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 active:bg-red-900 shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? (language === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Logging in...') : (language === 'km' ? 'ចូលប្រព័ន្ធ (Login)' : 'Sign In')}</span>
          </button>
        </form>

        {/* Footer Note */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          {language === 'km' 
            ? 'Admin: មានសិទ្ធិគ្រប់គ្រងពេញលេញ | User: មានសិទ្ធិចុះឈ្មោះផ្ទាល់ខ្លួន' 
            : 'Admin: Full Management Access | User: Self-Enrollment Only'}
        </div>
      </div>
    </div>
  );
};

export interface LoginScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  language: Language;
  onLanguageToggle: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  language,
  onLanguageToggle,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!username.trim() || !password.trim()) {
      setErrorMsg(
        language === 'km' 
          ? 'សូមបញ្ចូលឈ្មោះគណនី (Username) និងលេខសម្ងាត់ (Password)' 
          : 'Please enter both Username and Password'
      );
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = authService.login(username, password);
      setIsLoading(false);

      if (res.success && res.user) {
        setSuccessMsg(
          language === 'km' 
            ? `ស្វាគមន៍! បានចូលប្រព័ន្ធជោគជ័យជា ${res.user.adminName}` 
            : `Welcome! Successfully logged in as ${res.user.adminName}`
        );
        setTimeout(() => {
          onLoginSuccess(res.user!);
        }, 500);
      } else {
        setErrorMsg(res.message);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-red-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Bar with Language Toggle */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={onLanguageToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 transition-all shadow-sm"
        >
          <Globe className="w-3.5 h-3.5 text-amber-300" />
          <span>{language === 'km' ? '🇰🇭 ខ្មែរ' : language === 'zh-TW' ? '🇹🇼 繁中' : '🇬🇧 EN'}</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with School Branding */}
        <div 
          className="relative px-6 pt-8 pb-7 text-white text-center overflow-hidden"
          style={{ backgroundColor: '#991b1b' }}
        >
          {/* Subtle glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-red-950/40 rounded-full blur-xl pointer-events-none" />

          {/* School Badge & Logo */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white p-1 shadow-xl ring-4 ring-amber-300/60 mb-3.5 flex items-center justify-center overflow-hidden">
            <img 
              src="/logo.jpg" 
              alt="Logo សាលារៀនចិនលីស៊ីងអន្តរជាតិ" 
              className="w-full h-full object-contain rounded-xl"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
            {language === 'km' ? 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ' : 'Li Hsing International Chinese School'}
          </h1>
          <p className="text-xs text-red-100 font-medium mt-0.5 tracking-wide">
            日興國際學校 • Student Information System
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2.5 animate-in fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Username Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'km' ? 'ឈ្មោះគណនី (Username)' : 'Username'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder={language === 'km' ? 'ឈ្មោះគណនី...' : 'Username...'}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium transition-all bg-white"
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">
              {language === 'km' ? 'លេខសម្ងាត់ (Password)' : 'Password'} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 focus:border-red-600 text-sm font-medium transition-all bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-3 py-3 px-4 rounded-xl font-bold text-sm text-white bg-red-700 hover:bg-red-800 active:bg-red-900 shadow-lg shadow-red-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{language === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់...' : 'Authenticating...'}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>{language === 'km' ? 'ចូលប្រើប្រាស់ប្រព័ន្ធ (Login)' : 'Sign In to System'}</span>
              </>
            )}
          </button>
        </form>

        {/* Protected Access Security Section */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col items-center justify-center gap-1.5 text-center">
          <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs">
            {language === 'km' 
              ? '🔒 ប្រព័ន្ធការពារព័ត៌មានផ្ទាល់ខ្លួនរបស់សិស្សយ៉ាងតឹងរ៉ឹង។ មិនអនុញ្ញាតឱ្យចូលប្រើប្រាស់ដោយគ្មានគណនីឡើយ។' 
              : '🔒 Protected access strictly prevents unauthorized entry into the student system.'}
          </p>
        </div>

      </div>

      {/* Footer Branding */}
      <div className="mt-6 text-center text-xs text-slate-400">
        © 2026 សាលារៀនចិនលីស៊ីងអន្តរជាតិ (日興國際學校). All rights reserved.
      </div>

    </div>
  );
};

export default LoginScreen;
