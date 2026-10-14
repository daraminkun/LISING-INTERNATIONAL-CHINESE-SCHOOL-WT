import React, { useState } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  Users, 
  FileSpreadsheet, 
  Plus, 
  Globe, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Menu,
  X,
  Database,
  ExternalLink,
  ChevronRight,
  FileText,
  ShieldCheck,
  UserCheck,
  LogIn,
  LogOut,
  Lock,
  User as UserIcon
} from 'lucide-react';
import { TabType, Language, ConnectionStatus } from '../types';
import { translations } from '../translations';
import { UserAccount } from '../services/authService';

interface SidebarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  language: Language;
  onLanguageToggle: () => void;
  onSelectLanguage?: (lang: Language) => void;
  connectionStatus: ConnectionStatus;
  onOpenSettings: () => void;
  onAddStudent: () => void;
  onSync: () => void;
  isSyncing: boolean;
  studentCount: number;
  isAdmin?: boolean;
  currentUser?: UserAccount | null;
  onOpenLogin?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  language,
  onLanguageToggle,
  onSelectLanguage,
  connectionStatus,
  onOpenSettings,
  onAddStudent,
  onSync,
  isSyncing,
  studentCount,
  isAdmin = false,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const t = translations[language];
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleTabSelect = (tab: TabType) => {
    onTabChange(tab);
    setIsMobileOpen(false);
  };

  const handleAddClick = () => {
    onAddStudent();
    setIsMobileOpen(false);
  };

  const handleSettingsClick = () => {
    onOpenSettings();
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200 active:bg-slate-200 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xs">
              <GraduationCap className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm tracking-tight truncate max-w-[170px]">
              {t.appName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Mobile Language & Font Cycle */}
          <button
            onClick={onLanguageToggle}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Switch Language & Font (Battambang / Times / 標楷體)"
          >
            <span>{language === 'km' ? '🇰🇭 ខ្មែរ' : language === 'zh-TW' ? '🇹🇼 繁中' : '🇬🇧 EN'}</span>
          </button>

          {/* User Account Button */}
          <button
            type="button"
            onClick={onOpenLogin}
            className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
              currentUser?.role === 'Admin'
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-blue-50 text-blue-900 border-blue-300'
            }`}
            title="Account / Login"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="font-mono text-[11px] hidden xs:inline">{currentUser?.username || 'Login'}</span>
          </button>

          {/* Quick Sync */}
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            title={t.syncNow}
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-indigo-600' : ''}`} />
          </button>

          {/* Quick Add CTA */}
          <button
            onClick={handleAddClick}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.addStudent}</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-2xs md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Left Sidebar (Desktop Fixed + Mobile Slide-over Drawer) */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 z-40 w-64 lg:w-72 bg-white border-r border-slate-200 
          flex flex-col transition-transform duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Sidebar Brand Header */}
        <div 
          className="p-5 border-b border-red-700/50 flex items-center justify-between"
          style={{ backgroundColor: '#991b1b', color: '#ffffff' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-md ring-2 ring-amber-300/80 shrink-0 overflow-hidden flex items-center justify-center">
              <img 
                src="/logo.jpg" 
                alt="Logo សាលារៀនចិនលីស៊ីងអន្តរជាតិ" 
                className="w-full h-full object-contain rounded-full"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-black text-white tracking-tight leading-tight truncate font-battambang" title="សាលារៀនចិនលីស៊ីងអន្តរជាតិ">
                សាលារៀនចិនលីស៊ីងអន្តរជាតិ
              </h1>
              <div className="text-[11px] font-bold text-amber-200 truncate font-kai">
                日興國際學校
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-medium text-red-100 leading-none truncate uppercase">
                  Lising Int'l School
                </span>
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-red-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Session Widget */}
        <div 
          className="px-4 py-2.5 border-b border-red-950/40 flex items-center justify-between text-xs"
          style={{ backgroundColor: '#701014' }}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
              currentUser?.role === 'Admin'
                ? 'bg-amber-400 text-red-950 ring-2 ring-amber-300/40'
                : 'bg-blue-400 text-blue-950 ring-2 ring-blue-300/40'
            }`}>
              {currentUser?.role === 'Admin' ? 'A' : 'U'}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-white text-xs truncate block leading-tight">
                {currentUser ? currentUser.username : 'Guest'}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full inline-block ${
                  currentUser?.role === 'Admin'
                    ? 'bg-amber-400 text-red-950'
                    : 'bg-blue-500 text-white'
                }`}>
                  {currentUser?.role || 'Guest'}
                </span>
                {!isAdmin && (
                  <span className="text-[10px] text-rose-200 truncate">
                    (ចុះឈ្មោះ)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenLogin}
              className="p-1.5 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
              title="ប្តូរគណនី / ចូលប្រព័ន្ធ (Login / Switch User)"
            >
              <LogIn className="w-4 h-4" />
            </button>
            {currentUser && onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 rounded-lg text-rose-300 hover:text-rose-100 hover:bg-rose-950/50 transition-colors"
                title="ចាកចេញ (Logout)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Primary Action: Add Student */}
        <div className="p-4 pb-2" style={{ backgroundColor: '#b91c1c' }}>
          <button
            type="button"
            onClick={handleAddClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-red-900 bg-white hover:bg-red-50 active:bg-red-100 shadow-md shadow-red-950/20 transition-all group"
          >
            <Plus className="w-4 h-4 text-red-700 transition-transform group-hover:rotate-90 duration-200" />
            <span>{t.addStudent}</span>
          </button>
        </div>

        {/* Navigation Menu */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-3 space-y-6"
          style={{ backgroundColor: '#881337' }}
        >
          
          {/* Main Navigation Group */}
          <div>
            <div className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-200/90">
              {language === 'km' ? 'ម៉ឺនុយមេ' : 'Main Menu'}
            </div>
            <nav className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleTabSelect('dashboard')}
                style={{ backgroundColor: currentTab === 'dashboard' ? '#dc2626' : '#9f1239' }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all border ${
                  currentTab === 'dashboard'
                    ? 'border-white/50 text-white shadow-md'
                    : 'border-white/10 text-rose-100 hover:border-white/30 hover:bg-red-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5 text-white shrink-0" />
                  <span className="text-white font-semibold">{t.dashboard}</span>
                </div>
                {currentTab === 'dashboard' && (
                  <div className="w-2 h-5 rounded-full bg-white shadow-xs" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTabSelect('students')}
                style={{ backgroundColor: currentTab === 'students' ? '#dc2626' : '#9f1239' }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all border ${
                  currentTab === 'students'
                    ? 'border-white/50 text-white shadow-md'
                    : 'border-white/10 text-rose-100 hover:border-white/30 hover:bg-red-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-white shrink-0" />
                  <span className="text-white font-semibold">{t.studentTable}</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-white text-red-900 shadow-xs">
                  {studentCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleTabSelect('reports')}
                style={{ backgroundColor: currentTab === 'reports' ? '#dc2626' : '#9f1239' }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all border ${
                  currentTab === 'reports'
                    ? 'border-white/50 text-white shadow-md'
                    : 'border-white/10 text-rose-100 hover:border-white/30 hover:bg-red-700/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-white shrink-0" />
                  <span className="text-white font-semibold">{t.studentReport}</span>
                </div>
                {currentTab === 'reports' && (
                  <div className="w-2 h-5 rounded-full bg-white shadow-xs" />
                )}
              </button>

              {/* Users Management: Visible to Admin only */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleTabSelect('users')}
                  style={{ backgroundColor: currentTab === 'users' ? '#dc2626' : '#9f1239' }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-bold transition-all border ${
                    currentTab === 'users'
                      ? 'border-white/50 text-white shadow-md'
                      : 'border-white/10 text-rose-100 hover:border-white/30 hover:bg-red-700/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-white shrink-0" />
                    <span className="text-white font-semibold">
                      {language === 'km' ? 'អ្នកប្រើប្រាស់ (Users)' : 'Users'}
                    </span>
                  </div>
                  {currentTab === 'users' ? (
                    <div className="w-2 h-5 rounded-full bg-white shadow-xs" />
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400 text-red-950">
                      Admin
                    </span>
                  )}
                </button>
              )}
            </nav>
          </div>

          {/* Database & Google Sheets Status Widget */}
          <div>
            <div 
              className="px-2 mb-2 text-xs font-bold uppercase tracking-wider text-rose-200/90"
            >
              {language === 'km' ? 'ប្រព័ន្ធផ្ទុកទិន្នន័យ' : language === 'zh-TW' ? '雲端資料庫與同步' : 'Database & Sync'}
            </div>
            
            <div className="p-3.5 rounded-xl bg-white/95 border border-red-200/60 space-y-3 shadow-xs">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    connectionStatus === 'connected' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      Google Sheets
                    </span>
                    <span className="text-[11px] flex items-center gap-1 font-medium text-slate-500">
                      {connectionStatus === 'connected' ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-semibold">{t.connected}</span>
                        </>
                      ) : connectionStatus === 'syncing' ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                          <span className="text-blue-700 font-semibold">{t.syncing}</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          <span className="text-amber-700 font-semibold">{t.disconnected}</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onSync}
                  disabled={isSyncing}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  title={t.syncNow}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-red-600' : ''}`} />
                </button>
              </div>

              {/* Sync Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-slate-200/60">
                <button
                  type="button"
                  onClick={onSync}
                  disabled={isSyncing}
                  className="flex-1 py-1.5 px-2 rounded-lg text-[11px] font-semibold text-slate-700 bg-slate-50 hover:bg-red-50 hover:text-red-700 border border-slate-200 transition-colors flex items-center justify-center gap-1 shadow-2xs"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-red-600' : 'text-slate-400'}`} />
                  <span>{t.syncNow}</span>
                </button>
                <button
                  type="button"
                  onClick={handleSettingsClick}
                  className="py-1.5 px-2 rounded-lg text-[11px] font-semibold text-red-700 hover:bg-red-50 border border-red-200/60 transition-colors flex items-center justify-center gap-1 bg-white shadow-2xs"
                >
                  <span>{language === 'km' ? 'រៀបចំ' : language === 'zh-TW' ? '設定' : 'Config'}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-red-900/60 space-y-3" style={{ backgroundColor: '#701014' }}>
          
          {/* Modern Language & Font Selector */}
          <div 
            className="p-3 rounded-2xl bg-white/95 border border-red-200/80 shadow-2xs space-y-2"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-red-600" />
                <span>{language === 'km' ? 'ភាសា & ពុម្ពអក្សរ' : language === 'zh-TW' ? '語言與字體' : 'Language & Font'}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => onSelectLanguage ? onSelectLanguage('km') : (language !== 'km' && onLanguageToggle())}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center transition-all ${
                  language === 'km'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Khmer - Font Battambang"
              >
                <span className="text-xs">🇰🇭 ខ្មែរ</span>
                <span className={`text-[10px] ${language === 'km' ? 'text-red-100' : 'text-slate-400'} font-normal`}>Battambang</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage ? onSelectLanguage('en') : (language !== 'en' && onLanguageToggle())}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center transition-all ${
                  language === 'en'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="English - Font Times New Roman"
              >
                <span className="text-xs">🇬🇧 English</span>
                <span className={`text-[10px] ${language === 'en' ? 'text-red-100' : 'text-slate-400'} font-normal font-times`}>Times</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectLanguage ? onSelectLanguage('zh-TW') : (language !== 'zh-TW' && onLanguageToggle())}
                className={`flex flex-col items-center py-1.5 px-1 rounded-lg text-center transition-all ${
                  language === 'zh-TW'
                    ? 'bg-red-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 font-medium'
                }`}
                title="Traditional Chinese - 標楷體"
              >
                <span className="text-xs">🇹🇼 繁中</span>
                <span className={`text-[10px] ${language === 'zh-TW' ? 'text-red-100' : 'text-slate-400'} font-normal font-biaukai`}>標楷體</span>
              </button>
            </div>
          </div>

          {/* Subtitle & Credits */}
          <div className="text-center">
            <p className="text-[11px] text-slate-400">
              {t.appSub}
            </p>
          </div>

        </div>

      </aside>
    </>
  );
};
