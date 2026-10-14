import React from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Plus, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { TabType, Language, ConnectionStatus } from '../types';
import { translations } from '../translations';

interface NavbarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  onLanguageToggle: () => void;
  connectionStatus: ConnectionStatus;
  onOpenSettings: () => void;
  onAddStudent: () => void;
  onSync: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageToggle,
  connectionStatus,
  onOpenSettings,
  onAddStudent,
  onSync,
  isSyncing
}) => {
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-sm ring-2 ring-indigo-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
                  {t.appName}
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  Google Sheets Backend
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.appSub}
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div className="hidden sm:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onTabChange('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              {t.dashboard}
            </button>
            <button
              onClick={() => onTabChange('students')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'students'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              {t.studentTable}
            </button>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Status Button */}
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80'
                  : connectionStatus === 'syncing'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/80'
              }`}
              title={t.setupScript}
            >
              {connectionStatus === 'connected' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline">{t.connected}</span>
                  <FileSpreadsheet className="w-3.5 h-3.5 ml-0.5 opacity-80" />
                </>
              ) : connectionStatus === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span className="hidden md:inline">{t.syncing}</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">{t.disconnected}</span>
                  <span className="md:hidden">Sheets</span>
                </>
              )}
            </button>

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1.5"
              title={t.syncNow}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-600' : 'text-slate-500'}`} />
              <span className="hidden lg:inline">{t.syncNow}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={onLanguageToggle}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Change Language & Font (🇰🇭 Battambang / 🇬🇧 Times New Roman / 🇹🇼 標楷體)"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {language === 'km' ? '🇰🇭 ខ្មែរ (Battambang)' : language === 'zh-TW' ? '🇹🇼 繁中 (標楷體)' : '🇬🇧 EN (Times)'}
              </span>
            </button>

            {/* Add Student CTA */}
            <button
              onClick={onAddStudent}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addStudent}</span>
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex sm:hidden border-t border-slate-200 py-2 gap-2">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === 'dashboard'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            {t.dashboard}
          </button>
          <button
            onClick={() => onTabChange('students')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium ${
              currentTab === 'students'
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-slate-600'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.studentTable}
          </button>
        </div>

      </div>
    </header>
  );
};
