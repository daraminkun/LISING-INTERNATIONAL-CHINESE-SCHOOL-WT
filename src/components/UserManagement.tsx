import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  X, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2,
  ShieldAlert,
  RefreshCw,
  Share2,
  Copy,
  Check,
  Globe,
  Info,
  ShieldCheck,
  CheckCheck
} from 'lucide-react';
import { authService, UserAccount, UserRole } from '../services/authService';
import { AppsScriptService } from '../services/appsScriptService';
import { Language } from '../types';

interface UserManagementProps {
  language: Language;
  onNavigateToDashboard: () => void;
  webAppUrl?: string;
  onSyncUsers?: () => Promise<void>;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  language,
  onNavigateToDashboard,
  webAppUrl,
  onSyncUsers,
}) => {
  const [users, setUsers] = useState<UserAccount[]>(() => authService.getUsers());
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  
  // Modal for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [formAdminName, setFormAdminName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('User');
  const [showFormPassword, setShowFormPassword] = useState(false);
  
  // Delete confirm state (avoiding window.alert/window.confirm)
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);

  // Syncing state
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Feedback alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const isAdmin = authService.isAdmin();

  // Subscribe to changes in authService
  useEffect(() => {
    const unsub = authService.subscribe(() => {
      setUsers(authService.getUsers());
    });
    return unsub;
  }, []);

  // Check access restriction: If not Admin, restrict immediately!
  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 shadow-xl max-w-lg mx-auto text-center space-y-4 my-12 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-rose-950">
          Access Restricted
        </h2>
        <div className="text-sm font-semibold text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
          {language === 'km' 
            ? 'មិនមានសិទ្ធិចូលប្រើប្រាស់ទំព័រនេះឡើយ (Admin Only)' 
            : language === 'zh-TW'
            ? '權限受限：僅限管理員 (Admin) 存取'
            : 'Access Restricted (Admin Only)'}
        </div>
        <p className="text-xs text-slate-500">
          {language === 'km'
            ? 'ទំព័រគ្រប់គ្រងអ្នកប្រើប្រាស់ត្រូវបានចាក់សោសម្រាប់តែគណនី Admin ប៉ុណ្ណោះ។'
            : language === 'zh-TW'
            ? '使用者帳號管理頁面受安全政策保護，僅限系統管理員登入查看與修改。'
            : 'The user management page is strictly restricted to administrator accounts.'}
        </p>
        <button
          onClick={onNavigateToDashboard}
          className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          {language === 'km' ? 'ត្រឡប់ទៅ Dashboard វិញ' : language === 'zh-TW' ? '返回儀表板' : 'Back to Dashboard'}
        </button>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormAdminName('');
    setFormUsername('');
    setFormPassword('');
    setFormRole('User');
    setShowFormPassword(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setFormAdminName(user.adminName);
    setFormUsername(user.username);
    setFormPassword(user.password);
    setFormRole(user.role);
    setShowFormPassword(false);
    setFeedback(null);
    setIsModalOpen(true);
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formPassword.trim()) {
      setFeedback({ 
        type: 'error', 
        message: language === 'km' 
          ? 'សូមបញ្ចូលឈ្មោះគណនី និងលេខសម្ងាត់' 
          : language === 'zh-TW'
          ? '請輸入帳號與密碼'
          : 'Please enter both Username and Password' 
      });
      return;
    }

    if (editingUser) {
      const res = authService.updateUser(editingUser.id, {
        adminName: formAdminName.trim() || formUsername.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        role: formRole,
      });
      if (res.success) {
        setFeedback({ 
          type: 'success', 
          message: language === 'km' 
            ? `✅ បានកែប្រែគណនី ${formUsername} និងបានសមកាលកម្មទៅ Google Sheets ដោយជោគជ័យ!` 
            : language === 'zh-TW'
            ? `✅ 帳號 ${formUsername} 修改成功，並已同步至雲端資料庫！`
            : `✅ Successfully updated account ${formUsername} and synced to cloud!` 
        });
        setIsModalOpen(false);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else {
      const res = authService.addUser({
        adminName: formAdminName.trim() || formUsername.trim(),
        username: formUsername.trim(),
        password: formPassword.trim(),
        role: formRole,
      });
      if (res.success) {
        setFeedback({ 
          type: 'success', 
          message: language === 'km' 
            ? `✅ បានបង្កើតគណនី ${formUsername} និងបានសមកាលកម្មទៅ Google Sheets ដោយជោគជ័យ!` 
            : language === 'zh-TW'
            ? `✅ 新增帳號 ${formUsername} 成功，並已同步至雲端資料庫！`
            : `✅ Successfully created user ${formUsername} and synced to cloud!` 
        });
        setIsModalOpen(false);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  const confirmDelete = () => {
    if (!userToDelete) return;
    if (userToDelete.username.toLowerCase() === 'hdara') {
      setFeedback({ 
        type: 'error', 
        message: language === 'km' 
          ? 'មិនអាចលុបគណនីមេ Hdara (Admin) បានទេ!' 
          : language === 'zh-TW'
          ? '系統主管理員帳號 (Hdara) 無法被刪除！'
          : 'Cannot delete primary admin account (Hdara)!' 
      });
      setUserToDelete(null);
      return;
    }

    const res = authService.deleteUser(userToDelete.id);
    if (res.success) {
      setFeedback({ 
        type: 'success', 
        message: language === 'km' 
          ? `✅ បានលុបគណនី "${userToDelete.username}" ដោយជោគជ័យ!` 
          : language === 'zh-TW'
          ? `✅ 已成功刪除帳號 "${userToDelete.username}"！`
          : `✅ Successfully deleted account "${userToDelete.username}"!` 
      });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
    setUserToDelete(null);
  };

  // Manual Trigger: Sync all users to Google Sheets right now
  const handleManualSyncUsers = async () => {
    if (!webAppUrl) {
      setFeedback({
        type: 'error',
        message: language === 'km'
          ? 'មិនទាន់មាន Web App URL សម្រាប់ Google Sheets ឡើយ'
          : language === 'zh-TW'
          ? '尚未設定 Google Sheets Web App URL'
          : 'Google Sheets Web App URL is not configured'
      });
      return;
    }

    setIsSyncing(true);
    try {
      if (onSyncUsers) {
        await onSyncUsers();
      } else {
        await AppsScriptService.syncUsers(webAppUrl, authService.getUsers());
      }
      setFeedback({
        type: 'success',
        message: language === 'km'
          ? `✨ បានសមកាលកម្មគណនីទាំងអស់ (${users.length} គណនី) ទៅកាន់ Google Sheets រួចរាល់!`
          : language === 'zh-TW'
          ? `✨ 已成功將所有帳號 (${users.length} 個帳號) 同步至 Google 試算表！`
          : `✨ Successfully synced all ${users.length} accounts to Google Sheets!`
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: `Sync failed: ${err.message || 'Network error'}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Generate Universal Share & Sync Link
  const getUniversalSyncLink = () => {
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    if (webAppUrl) {
      return `${origin}${pathname}?sheetUrl=${encodeURIComponent(webAppUrl)}&autoSync=true`;
    }
    return window.location.href;
  };

  const handleCopySyncLink = () => {
    const link = getUniversalSyncLink();
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    setFeedback({
      type: 'info',
      message: language === 'km'
        ? '📋 បានចម្លងតំណភ្ជាប់សមកាលកម្ម! បើកតំណនេះនៅលើ Chrome, Edge, Firefox ឬទូរស័ព្ទ ដើម្បីសមកាលកម្មគណនីភ្លាមៗ។'
        : language === 'zh-TW'
        ? '📋 已複製萬用同步連結！在 Chrome、Edge、Firefox 或手機開啟此連結即可自動同步帳號與密碼。'
        : '📋 Copied Universal Sync Link! Open this link on Chrome, Edge, Firefox, or Mobile to auto-sync accounts.'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-950/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                {language === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់' : language === 'zh-TW' ? '使用者帳號與權限管理' : 'User Management'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'km' 
                ? 'កំណត់សិទ្ធិ Role (Admin, User), ឈ្មោះគណនី (Username) និងលេខសម្ងាត់ (Password) ភ្ជាប់ Cloud ស្វ័យប្រវត្ត' 
                : language === 'zh-TW'
                ? '管理使用者登入帳號、密碼、權限角色 (Admin / User)，並自動與雲端試算表雙向同步'
                : 'Manage user credentials, roles, and administrative permissions synced with cloud'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleManualSyncUsers}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Sync Accounts to Google Sheets"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-red-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? (language === 'km' ? 'កំពុងសមកាលកម្ម...' : language === 'zh-TW' ? '同步中...' : 'Syncing...') : (language === 'km' ? 'សមកាលកម្មគណនីឥឡូវ' : language === 'zh-TW' ? '立即同步帳號' : 'Sync Accounts Now')}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : language === 'zh-TW' ? '新增使用者帳號' : 'Add New User'}</span>
          </button>
        </div>
      </div>

      {/* Cross-Browser & Cloud Sync Explanation Banner */}
      <div className="bg-linear-to-r from-red-950 via-slate-900 to-slate-900 rounded-2xl p-5 border border-red-800/40 text-white shadow-md relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <Share2 className="w-4 h-4" />
              <span>
                {language === 'km' 
                  ? '🌐 ហេតុអ្វីបានជាត្រូវសមកាលកម្មគណនីរវាងកម្មវិធីផ្សេងៗ (Chrome, Edge, Firefox, ទូរស័ព្ទ)?' 
                  : language === 'zh-TW'
                  ? '🌐 跨瀏覽器與跨裝置帳號同步說明 (Chrome, Edge, Firefox, 手機)' 
                  : '🌐 Cross-Browser & Multi-Device Cloud Sync Guide'}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'km'
                ? 'កម្មវិធីអ៊ីនធឺណិតនីមួយៗ (Chrome, Edge, Firefox ឬកម្មវិធីលើទូរស័ព្ទ) មានកន្លែងផ្ទុក LocalStorage ដាច់ដោយឡែកពីគ្នា។ ប្រព័ន្ធបានភ្ជាប់មុខងារសមកាលកម្មទៅកាន់ Google Sheets រួចរាល់៖ នៅពេលអ្នកផ្លាស់ប្តូរ Username ឬ Password លើកម្មវិធីមួយ វានឹងរក្សាទុកក្នុង Google Sheets ស្វ័យប្រវត្ត។ នៅលើកម្មវិធីផ្សេងទៀត គ្រាន់តែបើកមើល វានឹងទាញយកគណនីថ្មីដោយស្វ័យប្រវត្ត!'
                : language === 'zh-TW'
                ? '因各瀏覽器 (Chrome、Edge、Firefox 及手機 App) 的本機儲存空間 (LocalStorage) 彼此獨立隔離。系統已全面串接 Google 試算表雲端同步：當您在一處修改帳號或密碼，系統會自動備份至雲端，其他瀏覽器或手機只需開啟頁面即可自動載入最新帳號！'
                : 'Each browser (Chrome, Edge, Firefox, or Mobile apps) has isolated local storage. The system automatically syncs user accounts to Google Sheets cloud backend so any credential change is instantly reflected across all browsers and devices.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopySyncLink}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-red-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              {isCopied ? <CheckCheck className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
              <span>
                {isCopied 
                  ? (language === 'km' ? 'បានចម្លង!' : language === 'zh-TW' ? '已複製！' : 'Copied!') 
                  : (language === 'km' ? 'ចម្លងតំណភ្ជាប់សមកាលកម្ម' : language === 'zh-TW' ? '複製萬用同步連結' : 'Copy Sync Link')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : feedback.type === 'info'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {feedback.type === 'info' && <Info className="w-4 h-4 text-blue-600 shrink-0" />}
            {feedback.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">{language === 'km' ? 'ល.រ' : language === 'zh-TW' ? '序號' : 'No.'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ឈ្មោះបង្ហាញ' : language === 'zh-TW' ? '姓名 / 顯示名稱' : 'Display Name'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'ឈ្មោះគណនី (Username)' : language === 'zh-TW' ? '使用者帳號 (Username)' : 'Username'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'លេខសម្ងាត់ (Password)' : language === 'zh-TW' ? '登入密碼 (Password)' : 'Password'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'សិទ្ធិប្រើប្រាស់' : language === 'zh-TW' ? '權限角色 (Role)' : 'Role'}</th>
                <th className="py-3.5 px-4">{language === 'km' ? 'កាលបរិច្ឆេទបង្កើត' : language === 'zh-TW' ? '建立日期' : 'Created Date'}</th>
                <th className="py-3.5 px-4 text-center">{language === 'km' ? 'សកម្មភាព' : language === 'zh-TW' ? '操作' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.map((u, idx) => {
                const isRevealed = !!revealedPasswords[u.id];
                const isMainAdmin = u.username.toLowerCase() === 'hdara';

                return (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          u.role === 'Admin' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {u.role === 'Admin' ? 'A' : 'U'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{u.adminName}</span>
                          {isMainAdmin && (
                            <span className="text-[10px] text-amber-600 font-bold">
                              ★ Primary System Admin
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-800 font-bold">
                      {u.username}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {isRevealed ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(u.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                          title={isRevealed ? 'Hide Password' : 'Show Password'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-red-700" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                        u.role === 'Admin'
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-blue-50 text-blue-900 border-blue-300'
                      }`}>
                        {u.role === 'Admin' ? <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> : <User className="w-3.5 h-3.5 text-blue-600" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString(language === 'km' ? 'km-KH' : language === 'zh-TW' ? 'zh-TW' : 'en-US')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                          title="កែប្រែគណនី (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isMainAdmin && (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="លុបគណនី (Delete)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900">
                {editingUser 
                  ? (language === 'km' ? 'កែប្រែព័ត៌មានអ្នកប្រើប្រាស់' : language === 'zh-TW' ? '修改使用者帳號資料' : 'Edit User') 
                  : (language === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : language === 'zh-TW' ? '新增使用者帳號' : 'Add New User')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Admin / Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'km' ? 'ឈ្មោះបង្ហាញ (Display Name)' : language === 'zh-TW' ? '姓名 / 顯示名稱' : 'Display Name'}
                </label>
                <input
                  type="text"
                  value={formAdminName}
                  onChange={e => setFormAdminName(e.target.value)}
                  placeholder={language === 'km' ? 'ឧ. លោក ហេង តារា' : language === 'zh-TW' ? '例如：王小明' : 'e.g. John Doe'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-medium"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'km' ? 'ឈ្មោះគណនី (Username)' : language === 'zh-TW' ? '使用者帳號 (Username)' : 'Username'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={e => setFormUsername(e.target.value)}
                  placeholder="Username"
                  disabled={editingUser?.username.toLowerCase() === 'hdara'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-medium disabled:bg-slate-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'km' ? 'លេខសម្ងាត់ (Password)' : language === 'zh-TW' ? '登入密碼 (Password)' : 'Password'} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showFormPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowFormPassword(!showFormPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-red-700" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {language === 'km' ? 'សិទ្ធិប្រើប្រាស់ (Role)' : language === 'zh-TW' ? '權限角色 (Role)' : 'Role'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  disabled={editingUser?.username.toLowerCase() === 'hdara'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-semibold bg-white disabled:bg-slate-100"
                >
                  <option value="Admin">Admin ({language === 'km' ? 'សិទ្ធិពេញលេញ / Add, Edit, Delete, Export' : language === 'zh-TW' ? '完整管理員權限' : 'Full Admin Access'})</option>
                  <option value="User">User ({language === 'km' ? 'សិទ្ធិចុះឈ្មោះផ្ទាល់ខ្លួន តែប៉ុណ្ណោះ' : language === 'zh-TW' ? '僅具備個人註冊權限' : 'Self-Registration Only'})</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                >
                  {language === 'km' ? 'បោះបង់' : language === 'zh-TW' ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  {language === 'km' ? 'រក្សាទុក' : language === 'zh-TW' ? '儲存帳號' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Safe In-App Delete Confirmation Modal (Replaces window.confirm) */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-slate-900 text-base">
                {language === 'km' ? 'បញ្ជាក់ការលុបគណនី' : language === 'zh-TW' ? '確認刪除帳號' : 'Confirm Account Deletion'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'km' 
                  ? `តើអ្នកពិតជាចង់លុបគណនី "${userToDelete.username}" មែនទេ?` 
                  : language === 'zh-TW'
                  ? `您確定要刪除帳號「${userToDelete.username}」嗎？此動作將同步至雲端。`
                  : `Are you sure you want to delete account "${userToDelete.username}"?`}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'km' ? 'បោះបង់' : language === 'zh-TW' ? '取消' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                {language === 'km' ? 'លុបគណនី' : language === 'zh-TW' ? '確認刪除' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
