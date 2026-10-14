import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserCheck, 
  KeyRound, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Lock, 
  User, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  ShieldAlert
} from 'lucide-react';
import { authService, UserAccount, UserRole } from '../services/authService';
import { Language } from '../types';

interface UserManagementProps {
  language: Language;
  onNavigateToDashboard: () => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  language,
  onNavigateToDashboard,
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
  
  // Feedback alert
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
          មិនមានសិទ្ធិចូលប្រើប្រាស់ទំព័រនេះឡើយ (Admin Only)
        </div>
        <p className="text-xs text-slate-500">
          ទំព័រគ្រប់គ្រងអ្នកប្រើប្រាស់ត្រូវបានចាក់សោសម្រាប់តែគណនី Admin ប៉ុណ្ណោះ។
        </p>
        <button
          onClick={onNavigateToDashboard}
          className="px-6 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          ត្រឡប់ទៅ Dashboard វិញ
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formPassword.trim()) {
      setFeedback({ type: 'error', message: 'សូមបញ្ចូល Username និង Password' });
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
        setFeedback({ type: 'success', message: res.message });
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
        setFeedback({ type: 'success', message: res.message });
        setIsModalOpen(false);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  const handleDelete = (user: UserAccount) => {
    if (user.username.toLowerCase() === 'hdara') {
      alert('មិនអាចលុបគណនីមេ Hdara (Admin) បានទេ!');
      return;
    }
    const confirmed = window.confirm(`តើអ្នកពិតជាចង់លុបគណនី "${user.username}" មែនទេ?`);
    if (!confirmed) return;

    const res = authService.deleteUser(user.id);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
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
                {language === 'km' ? 'គ្រប់គ្រងអ្នកប្រើប្រាស់ (Manage Users)' : 'User Management'}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                Admin Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'km' 
                ? 'កំណត់សិទ្ធិ Role (Admin, User), ឈ្មោះគណនី (Username) និងលេខសម្ងាត់ (Password)' 
                : 'Manage user credentials, roles, and administrative permissions'}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : 'Add New User'}</span>
        </button>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-medium animate-in fade-in ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button 
            onClick={() => setFeedback(null)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
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
                <th className="py-3.5 px-4">ល.រ (No.)</th>
                <th className="py-3.5 px-4">Admin / ឈ្មោះបង្ហាញ</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Password</th>
                <th className="py-3.5 px-4">Role (សិទ្ធិ)</th>
                <th className="py-3.5 px-4">កាលបរិច្ឆេទបង្កើត</th>
                <th className="py-3.5 px-4 text-center">សកម្មភាព</th>
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
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-1 rounded">Primary Admin</span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {u.username}
                    </td>

                    {/* Masked Password with toggle for Admin */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-1 rounded bg-slate-100 border border-slate-200 min-w-[70px] inline-block text-center select-all">
                          {isRevealed ? u.password : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordReveal(u.id)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                          title={isRevealed ? 'លាក់លេខសម្ងាត់' : 'បង្ហាញលេខសម្ងាត់'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        u.role === 'Admin'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {u.role === 'Admin' ? (
                          <ShieldCheck className="w-3 h-3 text-red-600" />
                        ) : (
                          <UserCheck className="w-3 h-3 text-blue-600" />
                        )}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US')}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                          title="កែប្រែគណនី (Edit)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {!isMainAdmin && (
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-rose-50 transition-colors"
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
                  ? (language === 'km' ? 'កែប្រែព័ត៌មានអ្នកប្រើប្រាស់' : 'Edit User') 
                  : (language === 'km' ? 'បន្ថែមអ្នកប្រើប្រាស់ថ្មី' : 'Add New User')}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              
              {/* Admin / Display Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Admin / ឈ្មោះបង្ហាញ (Display Name)
                </label>
                <input
                  type="text"
                  value={formAdminName}
                  onChange={e => setFormAdminName(e.target.value)}
                  placeholder="ឧ. លោក ហេង តារា"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-medium"
                />
              </div>

              {/* Username */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Username *
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
                  Password *
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showFormPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Role (សិទ្ធិប្រើប្រាស់) *
                </label>
                <select
                  value={formRole}
                  onChange={e => setFormRole(e.target.value as UserRole)}
                  disabled={editingUser?.username.toLowerCase() === 'hdara'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600 text-xs font-semibold bg-white disabled:bg-slate-100"
                >
                  <option value="Admin">Admin (សិទ្ធិពេញលេញ / Add, Edit, Delete, Export, Settings)</option>
                  <option value="User">User (សិទ្ធិចុះឈ្មោះផ្ទាល់ខ្លួន តែប៉ុណ្ណោះ / No Export)</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
                >
                  បោះបង់
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-md transition-colors"
                >
                  រក្សាទុក
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
