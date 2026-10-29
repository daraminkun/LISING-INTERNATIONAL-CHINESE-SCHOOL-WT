import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Student, Language } from '../types';
import { translations } from '../translations';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  student: Student | null;
  bulkCount?: number;
  schoolMajorNo?: number;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
  language: Language;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  student,
  bulkCount = 0,
  schoolMajorNo,
  onClose,
  onConfirm,
  isDeleting,
  language,
}) => {
  const t = translations[language];

  if (!isOpen || (!student && bulkCount <= 0)) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t.confirmDelete}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {bulkCount > 0
                ? language === 'km'
                  ? `តើអ្នកពិតជាចង់លុបសិស្សទាំង ${bulkCount} នាក់នេះមែនទេ? លេខរៀង និង No នឹងរៀបតាមលំដាប់ស្វ័យប្រវត្តិឡើងវិញ។`
                  : language === 'zh-TW'
                  ? `您確定要刪除這 ${bulkCount} 位學生嗎？系統將自動重新排序編號。`
                  : `Are you sure you want to delete these ${bulkCount} students? Order numbers will automatically re-sequence.`
                : t.deleteWarning}
            </p>
          </div>

          {/* Student or Bulk Summary */}
          {student ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs sm:text-sm">
              <div>
                <span className="font-bold text-slate-900 block">{student.nameKhmer || student.nameLatin || student.nameChinese || student.name || '-'}</span>
                <span className="font-mono text-slate-500 text-xs">
                  #{student.studentId}{schoolMajorNo ? ` (No. ${schoolMajorNo})` : ''} {student.targetSchool ? `• ${student.targetSchool}` : ''}
                </span>
              </div>
              <span className="font-mono text-slate-600 text-xs">{student.phone}</span>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-center text-xs sm:text-sm font-bold text-rose-800">
              {language === 'km'
                ? `ជ្រើសរើសសិស្សចំនួន ${bulkCount} នាក់ សម្រាប់លុបចេញ`
                : language === 'zh-TW'
                ? `已選擇 ${bulkCount} 位學生進行刪除`
                : `${bulkCount} students selected for deletion`}
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={isDeleting}
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-60 transition-colors shadow-xs"
            >
              {isDeleting ? 'Deleting...' : t.delete}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
