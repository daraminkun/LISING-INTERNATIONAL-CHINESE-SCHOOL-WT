import React from 'react';
import { 
  GraduationCap, 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  LogOut,
  Building2,
  FileCheck2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Language } from '../types';
import { UserAccount } from '../services/authService';
import { translations } from '../translations';

interface StudentPortalViewProps {
  onAddStudent: () => void;
  language: Language;
  currentUser: UserAccount | null;
  onLogout: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onAddStudent,
  language,
  currentUser,
  onLogout,
}) => {
  const t = translations[language];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Hero Welcome Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden"
        style={{ backgroundColor: '#991b1b' }}
      >
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold backdrop-blur-xs border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {language === 'km' 
                  ? 'ប្រព័ន្ធចុះឈ្មោះចូលរៀនអនឡាញ' 
                  : language === 'zh-TW' 
                  ? '線上入學登記系統' 
                  : 'Online Student Registration Portal'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight font-battambang">
              {language === 'km'
                ? 'សូមស្វាគមន៍មកកាន់ការចុះឈ្មោះចូលរៀន'
                : language === 'zh-TW'
                ? '歡迎來到入學登記'
                : 'Welcome to Student Enrollment'}
            </h1>

            <p className="text-sm sm:text-base text-red-100 max-w-xl font-battambang leading-relaxed">
              {language === 'km'
                ? 'សាលារៀនចិនលីស៊ីងអន្តរជាតិ (日興國際學校) ផ្តល់ឱកាសសិក្សានៅសាធារណរដ្ឋចិន (តៃវ៉ាន់) ទាំងថ្នាក់វិទ្យាល័យ និងថ្នាក់បរិញ្ញាបត្រ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបំពេញពាក្យចុះឈ្មោះ។'
                : language === 'zh-TW'
                ? '日興國際學校提供赴台留學機會（高中職及大專院校）。請點選下方按鈕填寫入學登記資料。'
                : 'Lising International School provides study abroad opportunities in Taiwan. Please click the button below to complete your registration.'}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-amber-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'km' 
                  ? `គណនីសិស្ស៖ ${currentUser?.username || 'student'} (សិទ្ធិចុះឈ្មោះចូលរៀន)`
                  : `Logged in as: ${currentUser?.username || 'student'} (Student Role)`}
              </span>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="shrink-0 flex flex-col gap-2">
            <button
              type="button"
              onClick={onAddStudent}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-base text-red-900 bg-white hover:bg-amber-50 active:scale-[0.98] shadow-lg shadow-black/20 hover:shadow-xl transition-all font-battambang group"
            >
              <UserPlus className="w-5 h-5 text-red-700 transition-transform group-hover:scale-110" />
              <span>
                {language === 'km' 
                  ? 'ចុះឈ្មោះចូលរៀន (Add Student)' 
                  : language === 'zh-TW' 
                  ? '填寫入學登記' 
                  : 'Add Student Registration'}
              </span>
              <ArrowRight className="w-4 h-4 text-red-700 transition-transform group-hover:translate-x-1" />
            </button>
            
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ចាកចេញពីប្រព័ន្ធ (Logout)' : 'Logout'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enrollment Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-sm">
            ១
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'បំពេញព័ត៌មានផ្ទាល់ខ្លួន' : 'Personal Information'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'បញ្ចូលឈ្មោះខ្មែរ ឈ្មោះអង់គ្លេស ឈ្មោះចិន (បើមាន) ភេទ ថ្ងៃខែឆ្នាំកំណើត និងលេខទូរស័ព្ទទំនាក់ទំនង។'
              : 'Enter your Khmer, English, and Chinese names, gender, date of birth, and phone number.'}
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
            ២
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'ព័ត៌មានឳពុកម្តាយ & អាសយដ្ឋាន' : 'Parent & Address Details'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'បំពេញព័ត៌មានឳពុក ព័ត៌មានម្តាយ លេខទូរស័ព្ទ និងអាសយដ្ឋានបច្ចុប្បន្នរបស់សាមីខ្លួន។'
              : 'Provide father, mother, and guardian contact details and current residential address.'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
            ៣
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'ជ្រើសរើសសាលា & ជំនាញ' : 'Choose School & Major'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'ជ្រើសរើសសាលារៀន និងជំនាញដែលអ្នកចង់សិក្សានៅតៃវ៉ាន់ ព្រមទាំងភ្ជាប់ឯកសារចាំបាច់ (សំបុត្រកំណើត អត្តសញ្ញាណប័ណ្ណ...)។'
              : 'Select your preferred school and major in Taiwan, and upload required documents.'}
          </p>
        </div>
      </div>

      {/* Quick Launch CTA Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base font-battambang">
              {language === 'km' 
                ? 'ត្រៀមខ្លួនចុះឈ្មោះចូលរៀនហើយឬនៅ?' 
                : 'Ready to submit your enrollment?'}
            </h3>
            <p className="text-xs text-slate-300 font-battambang">
              {language === 'km'
                ? 'ទិន្នន័យរបស់អ្នកនឹងត្រូវបញ្ជូនទៅកាន់ប្រព័ន្ធគ្រប់គ្រងរបស់សាលាដោយសុវត្ថិភាព។'
                : 'Your submission will be securely saved and transmitted to school administration.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddStudent}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-xs font-battambang shrink-0"
        >
          {language === 'km' ? '+ បើកទម្រង់ចុះឈ្មោះ' : '+ Open Registration Form'}
        </button>
      </div>
    </div>
  );
};
