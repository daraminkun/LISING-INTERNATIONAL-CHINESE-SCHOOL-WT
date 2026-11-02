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
  ArrowRight,
  Printer,
  Download,
  Loader2,
  AlertCircle,
  Eye,
  Share2
} from 'lucide-react';
import { Language } from '../types';
import { UserAccount } from '../services/authService';
import { translations } from '../translations';
import { formatNumberByLanguage } from '../utils/numberUtils';
import {
  GeneratedPdfResult,
  saveBlankFormAsPDF,
  printBlankRegistrationForm,
} from '../utils/studentFormPdfUtils';
import { canSharePdfFile, sharePdfBlobNative } from '../utils/studentOrderUtils';
import { PrintReportModal } from './PrintReportModal';

interface StudentPortalViewProps {
  onAddStudent: () => void;
  language: Language;
  currentUser: UserAccount | null;
  onLogout: () => void;
  onOpenSchoolInfo?: () => void;
}

export const StudentPortalView: React.FC<StudentPortalViewProps> = ({
  onAddStudent,
  language,
  currentUser,
  onLogout,
  onOpenSchoolInfo
}) => {
  const t = translations[language];
  const [isSavingBlankPdf, setIsSavingBlankPdf] = React.useState(false);
  const [isPrintingBlankPdf, setIsPrintingBlankPdf] = React.useState(false);
  const [pdfProgress, setPdfProgress] = React.useState('');
  const [readyPdf, setReadyPdf] = React.useState<GeneratedPdfResult | null>(null);
  const [isBlankFormModalOpen, setIsBlankFormModalOpen] = React.useState(false);
  const [portalNotice, setPortalNotice] = React.useState<{ type: 'success' | 'warning'; text: string } | null>(null);
  const canNativeShare = React.useMemo(() => canSharePdfFile(), []);

  const handleSaveBlankForm = async () => {
    setIsSavingBlankPdf(true);
    setPortalNotice(null);
    setPdfProgress('');
    try {
      const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
      setReadyPdf(pdfRes);
      setPortalNotice({
        type: 'success',
        text:
          language === 'km'
            ? 'បានទាញយកទម្រង់ពាក្យចុះឈ្មោះ (A4 PDF) រួចរាល់! (ប្រសិនបើទូរស័ព្ទមិនទាន់លោត សូមចុចប៊ូតុង "ទាញយក PDF" ខាងស្ដាំ)'
            : language === 'zh-TW'
            ? '已產出手寫空白報名表 (A4 PDF)！（若手機未自動下載，請點選右側下載按鈕）'
            : 'Blank registration form (A4 PDF) is ready!',
      });
    } catch (err) {
      console.error('Portal blank form PDF error:', err);
      setPortalNotice({
        type: 'warning',
        text:
          language === 'km'
            ? 'មិនអាចទាញយក PDF បានទេ សូមព្យាយាមម្ដងទៀត។'
            : 'Failed to download blank form PDF.',
      });
    } finally {
      setIsSavingBlankPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrintBlankForm = async () => {
    setPortalNotice(null);
    setIsPrintingBlankPdf(true);
    setPdfProgress('');
    try {
      const res = await printBlankRegistrationForm(language);
      if (!res.success) {
        setIsBlankFormModalOpen(true);
        const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        setPortalNotice({
          type: 'success',
          text:
            language === 'km'
              ? 'បានបើកទម្រង់ A4 និងទាញយកឯកសារ Print Form (PDF) រួចរាល់សម្រាប់បើក Print ភ្លាមៗ!'
              : language === 'zh-TW'
              ? '已開啟預覽並下載可列印之空白報名表 (A4 PDF)，開啟即可列印！'
              : 'Opened A4 preview and downloaded print-ready Blank Form PDF!',
        });
      }
    } catch {
      try {
        setIsBlankFormModalOpen(true);
        const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        setPortalNotice({
          type: 'success',
          text:
            language === 'km'
              ? 'បានទាញយកឯកសារ Print Form (A4 PDF) រួចរាល់សម្រាប់បើក Print!'
              : 'Print-ready Blank Form PDF downloaded!',
        });
      } catch {
        setPortalNotice({
          type: 'warning',
          text:
            language === 'km'
              ? 'មានបញ្ហាក្នុងការរៀបចំឯកសារ Print Form សូមព្យាយាមម្ដងទៀត។'
              : 'Failed to prepare printable form.',
        });
      }
    } finally {
      setIsPrintingBlankPdf(false);
      setPdfProgress('');
    }
  };

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
                ? 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ (日興國際學校) ផ្តល់ឱកាសសិក្សានៅសាធារណរដ្ឋចិន (តៃវ៉ាន់) ទាំងថ្នាក់វិទ្យាល័យ និងថ្នាក់បរិញ្ញាបត្រ។ សូមចុចប៊ូតុងខាងក្រោមដើម្បីបំពេញពាក្យចុះឈ្មោះ ឬពិនិត្យព័ត៌មានអំពីសាលារៀន។'
                : language === 'zh-TW'
                ? '日興國際學校提供赴台留學機會（高中職及大專院校）。請點選下方按鈕填寫入學登記資料或查看合作學校簡介。'
                : 'Lising International School provides study abroad opportunities in Taiwan. Please click the button below to complete your registration or view school details.'}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs text-amber-200 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>
                {language === 'km' 
                  ? `គណនីសិស្ស៖ ${currentUser?.username || 'student'} (សិទ្ធិចុះឈ្មោះចូលរៀន)`
                  : language === 'zh-TW'
                  ? `學生帳號：${currentUser?.username || 'student'} (入學登記權限)`
                  : `Logged in as: ${currentUser?.username || 'student'} (Student Role)`}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="shrink-0 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={() => onAddStudent()}
              className="inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black text-base text-red-900 bg-white hover:bg-amber-50 active:scale-[0.98] shadow-lg shadow-black/20 hover:shadow-xl transition-all font-battambang group cursor-pointer"
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

            {/* Button: <<ព័ត៌មានអំពីសាលារៀន>> directly under Add Student */}
            {onOpenSchoolInfo && (
              <button
                type="button"
                onClick={onOpenSchoolInfo}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-amber-950 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] shadow-lg shadow-black/20 hover:shadow-xl transition-all font-battambang group"
              >
                <Building2 className="w-5 h-5 text-amber-900 group-hover:scale-110 transition-transform" />
                <span>
                  {language === 'km' 
                    ? '<<ព័ត៌មានអំពីសាលារៀន>>' 
                    : language === 'zh-TW' 
                    ? '《學校資訊與最新動態》' 
                    : '<< School Information >>'}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-900 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
            
            {/* Blank Handwritten Form: Save Form as PDF & Print Form */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={handleSaveBlankForm}
                disabled={isSavingBlankPdf || isPrintingBlankPdf}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                title={language === 'km' ? 'ទាញយកទម្រង់ពាក្យចុះឈ្មោះសម្រាប់បំពេញដោយដៃ (PDF)' : 'Save Blank Form as PDF'}
              >
                {isSavingBlankPdf ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isSavingBlankPdf
                    ? pdfProgress || (language === 'km' ? 'កំពុងបង្កើត PDF...' : 'Saving PDF...')
                    : language === 'km'
                    ? 'Save Form ជា PDF'
                    : language === 'zh-TW'
                    ? '空白表 PDF'
                    : 'Save Form PDF'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrintBlankForm}
                disabled={isSavingBlankPdf || isPrintingBlankPdf}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl font-bold text-xs text-white bg-white/15 hover:bg-white/25 border border-white/25 transition-all whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                title={language === 'km' ? 'បោះពុម្ពទម្រង់ពាក្យចុះឈ្មោះសម្រាប់បំពេញដោយដៃ' : 'Print Blank Form'}
              >
                {isPrintingBlankPdf ? (
                  <Loader2 className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                ) : (
                  <Printer className="w-3.5 h-3.5 text-amber-300" />
                )}
                <span>
                  {isPrintingBlankPdf
                    ? pdfProgress || (language === 'km' ? 'កំពុង Print...' : 'Printing...')
                    : language === 'km'
                    ? 'Print Form'
                    : language === 'zh-TW'
                    ? '列印空白表'
                    : 'Print Form'}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-red-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer mt-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'km' ? 'ចាកចេញពីប្រព័ន្ធ' : language === 'zh-TW' ? '登出系統' : 'Logout'}</span>
            </button>
          </div>
        </div>

        {portalNotice && (
          <div className="relative z-10 mt-4 px-4 py-3 rounded-xl bg-black/30 border border-white/25 text-xs text-amber-100 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {portalNotice.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
              )}
              <span>{portalNotice.text}</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap shrink-0">
              {readyPdf && readyPdf.url && portalNotice.type === 'success' && (
                <>
                  <a
                    href={readyPdf.url}
                    download={readyPdf.filename}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>
                      {language === 'km'
                        ? 'ទាញយក PDF'
                        : language === 'zh-TW'
                        ? '下載 PDF'
                        : 'Download PDF'}
                    </span>
                  </a>

                  {canNativeShare && (
                    <button
                      type="button"
                      onClick={() => {
                        void sharePdfBlobNative(readyPdf.blob, readyPdf.filename, readyPdf.filename);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-xs transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share / Print</span>
                    </button>
                  )}
                </>
              )}

              <button
                type="button"
                onClick={() => setIsBlankFormModalOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/20 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>
                  {language === 'km'
                    ? 'មើលទម្រង់ A4'
                    : language === 'zh-TW'
                    ? '預覽 A4 表格'
                    : 'Preview A4'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPortalNotice(null)}
                className="text-white/70 hover:text-white text-xs font-bold px-1.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Enrollment Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-[#b3b9ba] border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-black text-base font-battambang">
            {formatNumberByLanguage(1, language)}
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'បំពេញព័ត៌មានផ្ទាល់ខ្លួន' : language === 'zh-TW' ? '填寫個人基本資料' : 'Personal Information'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'ថតរូប ស្គេនមុខ ឬ Upload រូបថតសិស្ស និងបញ្ចូលឈ្មោះខ្មែរ អង់គ្លេស ចិន ភេទ ថ្ងៃខែឆ្នាំកំណើត និងលេខទូរស័ព្ទទំនាក់ទំនង។'
              : language === 'zh-TW'
              ? '拍攝照片、人臉掃描或上傳學生相片，並輸入高棉、英文、中文姓名、性別、生日與聯絡電話。'
              : 'Take photo, face scan, or upload a portrait, and enter Khmer, English, Chinese names, DOB, and phone.'}
          </p>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-[#b3b9ba] border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-base font-battambang">
            {formatNumberByLanguage(2, language)}
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'ព័ត៌មានឳពុកម្តាយ & អាសយដ្ឋាន' : language === 'zh-TW' ? '父母資料與現居地址' : 'Parent & Address Details'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'បំពេញព័ត៌មានឳពុក ព័ត៌មានម្តាយ លេខទូរស័ព្ទ និងអាសយដ្ឋានបច្ចុប្បន្នរបស់សាមីខ្លួន។'
              : language === 'zh-TW'
              ? '填寫父親與母親資料、聯絡電話及個人現居地址。'
              : 'Provide father, mother, and guardian contact details and current residential address.'}
          </p>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-[#b3b9ba] border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base font-battambang">
            {formatNumberByLanguage(3, language)}
          </div>
          <h2 className="font-bold text-slate-900 text-sm font-battambang">
            {language === 'km' ? 'ជ្រើសរើសសាលា & ជំនាញ' : language === 'zh-TW' ? '選讀學校與專業科系' : 'Choose School & Major'}
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-battambang">
            {language === 'km'
              ? 'ជ្រើសរើសសាលារៀន និងជំនាញដែលអ្នកចង់សិក្សានៅតៃវ៉ាន់ ព្រមទាំងភ្ជាប់ឯកសារចាំបាច់ (សំបុត្រកំណើត អត្តសញ្ញាណប័ណ្ណ...)។'
              : language === 'zh-TW'
              ? '選擇赴台就讀之學校與專業科系，並上傳必要附件 (出生證明、身分證等)。'
              : 'Select your preferred school and major in Taiwan, and upload required documents.'}
          </p>
        </div>
      </div>

      {/* Registrant-Only Blank Form A4 Preview & Export Modal (strictly hides Admin reports/counts) */}
      {isBlankFormModalOpen && (
        <PrintReportModal
          isOpen={isBlankFormModalOpen}
          onClose={() => setIsBlankFormModalOpen(false)}
          students={[]}
          language={language}
          initialMode="blank_form"
          onlyBlankForm={true}
        />
      )}
    </div>
  );
};
