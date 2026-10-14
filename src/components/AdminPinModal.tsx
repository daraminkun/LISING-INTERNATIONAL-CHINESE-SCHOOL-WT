import React, { useState } from 'react';
import { ShieldAlert, KeyRound, Lock, Unlock, X, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../services/authService';
import { Language } from '../types';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
  title?: string;
  description?: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language,
  title,
  description,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [changeSuccess, setChangeSuccess] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) {
      setError(language === 'km' ? 'សូមបញ្ចូលលេខសម្ងាត់ PIN' : 'Please enter PIN');
      return;
    }

    if (authService.verifyPin(pin)) {
      setPin('');
      setError('');
      onSuccess();
      onClose();
    } else {
      setError(language === 'km' ? 'លេខសម្ងាត់ PIN មិនត្រឹមត្រូវទេ (សាកល្បង: 1234)' : 'Incorrect PIN (Default: 1234)');
      setPin('');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'backspace') {
      setPin(prev => prev.slice(0, -1));
    } else if (val === 'clear') {
      setPin('');
    } else if (pin.length < 8) {
      const next = pin + val;
      setPin(next);
      setError('');
      if (next.length === 4) {
        // Auto-check on 4 digits
        if (authService.verifyPin(next)) {
          setPin('');
          setError('');
          onSuccess();
          onClose();
        }
      }
    }
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setChangeSuccess('');

    if (newPin !== confirmPin) {
      setError(language === 'km' ? 'លេខកូដថ្មី និងលេខកូដបញ្ជាក់មិនដូចគ្នាទេ' : 'New PIN and confirm PIN do not match');
      return;
    }

    const res = authService.changePin(oldPin, newPin);
    if (res.success) {
      setChangeSuccess(res.message);
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => {
        setIsChangingPin(false);
        setChangeSuccess('');
      }, 1500);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {title || (language === 'km' ? 'ផ្ទៀងផ្ទាត់សិទ្ធិ Admin' : 'Admin Verification')}
              </h3>
              <p className="text-[11px] text-amber-700 font-medium">
                {language === 'km' ? 'សម្រាប់តែ Admin ដែលអាច កែ ប្ដូរ បាន' : 'Admin only authorization required'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice */}
        <p className="text-xs text-slate-600 mt-3 leading-relaxed">
          {description || (language === 'km' 
            ? 'មុខងារបន្ថែម (Add), កែប្រែ (Edit), និងលុប (Delete) ឈ្មោះសាលារៀន និងជំនាញ ត្រូវបានកំណត់សម្រាប់តែ Admin ប៉ុណ្ណោះ។'
            : 'Adding, editing, or deleting schools and majors is restricted to Admins only.')}
        </p>

        {!isChangingPin ? (
          <form onSubmit={handleVerify} className="mt-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{language === 'km' ? 'បញ្ចូលលេខកូដសម្ងាត់ Admin PIN:' : 'Enter Admin PIN:'}</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">
                  (Default: <strong>1234</strong>)
                </span>
              </div>

              {/* PIN Display Input */}
              <input
                type="password"
                maxLength={8}
                value={pin}
                onChange={e => {
                  setPin(e.target.value);
                  setError('');
                }}
                placeholder="••••"
                autoFocus
                className="w-full text-center tracking-[0.5em] font-mono font-bold text-lg py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Touch Keypad for phone/tablet */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleKeypadPress(n.toString())}
                  className="py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-300 font-bold text-slate-800 text-sm active:scale-95 transition-all"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleKeypadPress('clear')}
                className="py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50 hover:border-indigo-300 font-bold text-slate-800 text-sm active:scale-95 transition-all"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('backspace')}
                className="py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200 active:scale-95 transition-all"
              >
                ⌫
              </button>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(true);
                  setError('');
                }}
                className="text-[11px] text-slate-500 hover:text-indigo-600 hover:underline"
              >
                {language === 'km' ? 'ប្តូរលេខកូដ PIN ថ្មី' : 'Change Admin PIN'}
              </button>
              <div className="flex-1" />
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                {language === 'km' ? 'បោះបង់' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
              >
                {language === 'km' ? 'ផ្ទៀងផ្ទាត់' : 'Unlock Admin'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePin} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'លេខកូដចាស់ (Current PIN):' : 'Current PIN:'}
              </label>
              <input
                type="password"
                value={oldPin}
                onChange={e => setOldPin(e.target.value)}
                placeholder="1234"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'លេខកូដថ្មី (New PIN, យ៉ាងតិច ៤ ខ្ទង់):' : 'New PIN (at least 4 digits):'}
              </label>
              <input
                type="password"
                value={newPin}
                onChange={e => setNewPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {language === 'km' ? 'បញ្ជាក់លេខកូដថ្មី (Confirm New PIN):' : 'Confirm New PIN:'}
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={e => setConfirmPin(e.target.value)}
                placeholder="••••"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300"
              />
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            {changeSuccess && (
              <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{changeSuccess}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsChangingPin(false);
                  setError('');
                }}
                className="text-xs text-slate-500 hover:underline"
              >
                ← {language === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back'}
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                {language === 'km' ? 'រក្សាទុក PIN ថ្មី' : 'Save PIN'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
