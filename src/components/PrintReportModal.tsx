import React, { useState } from 'react';
import { 
  Printer, 
  Download, 
  FileText, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  FileCode,
  Loader2,
  Calendar,
  Users
} from 'lucide-react';
import { Student, Language } from '../types';
import { generateHighQualityPDF, executePrintDocument, downloadPrintableHtml } from '../utils/pdfRenderUtils';
import { areAllRequiredDocumentsUploaded } from '../utils/documentUtils';
import { calculateAge, formatDobOnly } from '../utils/ageUtils';
import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  language: Language;
  reportTitle?: string;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  students,
  language,
  reportTitle = 'តារាងរបាយការណ៍សិស្ស (Student Registration Report)',
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const currentDateFormatted = new Date().toLocaleDateString(language === 'km' ? 'km-KH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleDirectPrint = async () => {
    setStatusMessage(null);
    try {
      const res = await executePrintDocument(students, reportTitle, language);
      if (!res.success) {
        setStatusMessage({
          type: 'warning',
          text: language === 'km'
            ? 'ផ្ទាំង Print មិនអាចបើកបានដោយសារកម្រិតសុវត្ថិភាព iFrame របស់កម្មវិធីរុករក។ សូមចុចប៊ូតុង «ទាញយកជា PDF (Font ខ្មែរ/ចិន)» ឬ «ទាញយកឯកសារបោះពុម្ព (.html)» ជំនួសវិញ!'
            : 'Print dialog could not be shown due to browser iframe security. Please use "Download PDF" or "Download Print HTML" instead!',
        });
      }
    } catch (e: any) {
      setStatusMessage({
        type: 'warning',
        text: language === 'km'
          ? 'សូមចុចប៊ូតុង «ទាញយកជា PDF (Font ខ្មែរ/ចិន)» ដើម្បីទទួលបានឯកសារបោះពុម្ពច្បាស់ ១០០%!'
          : 'Please click "Download PDF" to get the fully rendered printable document!',
      });
    }
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    setStatusMessage(null);
    try {
      await generateHighQualityPDF(
        students,
        reportTitle,
        'Student_Registration_Report',
        language,
        (msg) => setPdfProgress(msg)
      );
      setStatusMessage({
        type: 'success',
        text: language === 'km' ? 'បានទាញយកឯកសារ PDF ជោគជ័យ (Font ខ្មែរ និង ចិន ត្រឹមត្រូវ ១០០%)!' : 'PDF downloaded successfully with Khmer and Chinese fonts!',
      });
    } catch (err: any) {
      console.error('PDF generation error:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'km' ? 'មានបញ្ហាក្នុងការបង្កើត PDF' : 'Error generating PDF file',
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handleDownloadHtml = () => {
    downloadPrintableHtml(students, reportTitle, 'Student_Report', language);
    setStatusMessage({
      type: 'success',
      text: language === 'km' ? 'បានទាញយកឯកសារបោះពុម្ព (.html) ជោគជ័យ! អ្នកអាចបើកលើកុំព្យូទ័រដើម្បី Print បានភ្លាមៗ' : 'Downloaded printable HTML file!',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>{language === 'km' ? 'មជ្ឈមណ្ឌលបោះពុម្ព និងទាញយករបាយការណ៍ (Print & PDF Center)' : 'Print & PDF Export Center'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Font ខ្មែរ & ចិន ១០០%
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'km' 
                  ? `របាយការណ៍សិស្សសរុប ${students.length} នាក់ | កាលបរិច្ឆេទ៖ ${currentDateFormatted}`
                  : `Total ${students.length} Students | Date: ${currentDateFormatted}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Control Bar with 3 Export Options */}
        <div className="p-4 sm:p-5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Action 1: Download High-Res PDF (Font 100%) */}
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{pdfProgress || (language === 'km' ? 'កំពុងបង្កើត PDF...' : 'Rendering PDF...')}</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{language === 'km' ? 'ទាញយកជា PDF (Font ខ្មែរ & ចិន)' : 'Download PDF (Khmer & Chinese)'}</span>
                </>
              )}
            </button>

            {/* Action 2: Direct Print */}
            <button
              onClick={handleDirectPrint}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>{language === 'km' ? 'បោះពុម្ព (Print Now)' : 'Print Document'}</span>
            </button>

            {/* Action 3: Download Printable HTML */}
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={language === 'km' ? 'ទាញយកឯកសារបោះពុម្ព .html សម្រាប់បើក Print ក្រៅបណ្តាញ' : 'Download offline printable HTML file'}
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>{language === 'km' ? 'ឯកសារបោះពុម្ព (.html)' : 'Download Print HTML'}</span>
            </button>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>{students.length} {language === 'km' ? 'សិស្សក្នុងរបាយការណ៍' : 'students in report'}</span>
          </div>
        </div>

        {/* Status Alert Banner if needed */}
        {statusMessage && (
          <div className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 border-b shrink-0 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : statusMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {statusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Live Printable Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/70">
          <div className="bg-white rounded-xl shadow-md border border-slate-300 max-w-4xl mx-auto p-6 sm:p-8 font-battambang text-slate-900">
            {/* Official Report Header with School Emblem */}
            <div className="pb-4 mb-4 border-b-2 border-indigo-600">
              {/* National Motto Centered in 3 Languages */}
              <div className="text-center mb-3">
                <div className="font-black text-sm sm:text-base text-slate-900 font-battambang leading-tight">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </div>
                <div className="font-bold text-xs sm:text-sm text-slate-700 font-battambang mt-0.5">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </div>
                <div className="font-bold text-xs text-slate-700 font-kai mt-1">
                  柬埔寨王國 • 民族 宗教 國王
                </div>
                <div className="font-semibold text-[10px] sm:text-[11px] text-slate-600 font-sans tracking-wider uppercase mt-0.5">
                  KINGDOM OF CAMBODIA • NATION RELIGION KING
                </div>
              </div>

              {/* School Info & Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-13 h-13 rounded-full bg-white p-0.5 border-2 border-indigo-600 shadow-xs shrink-0 overflow-hidden flex items-center justify-center">
                    <img src="/logo.jpg" alt="Logo" className="w-full h-full object-contain rounded-full" />
                  </div>
                  <div>
                    <div className="font-black text-xs sm:text-sm text-indigo-950 font-battambang leading-tight">
                      សាលារៀនចិនលីស៊ីងអន្តរជាតិ
                    </div>
                    <div className="font-bold text-[11px] text-indigo-900 font-kai">
                      日興國際學校
                    </div>
                    <div className="font-semibold text-[9px] text-indigo-800 tracking-wider uppercase font-sans">
                      LISING INTERNATIONAL CHINESE SCHOOL
                    </div>
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-600 shrink-0">
                  <div><strong>កាលបរិច្ឆេទ៖</strong> {currentDateFormatted}</div>
                  <div><strong>ចំនួនសរុប៖</strong> <span className="font-bold text-indigo-700">{students.length} នាក់</span></div>
                  <div><strong>ប្រព័ន្ធ៖</strong> Student Management System (SMS)</div>
                </div>
              </div>

              <h2 className="font-black text-base sm:text-lg text-indigo-950 text-center mt-3">
                {reportTitle}
              </h2>
            </div>

            {/* Table Preview */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-indigo-600 text-white font-bold text-center">
                    <th className="p-2 border border-indigo-700 text-center w-8">
                      <div>ល.រ</div>
                      <div className="text-[10px] font-normal opacity-90">No. / 編號</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ឈ្មោះខ្មែរ</div>
                      <div className="text-[10px] font-normal opacity-90">Khmer / 高棉名</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center font-times">
                      <div>ឈ្មោះឡាតាំង</div>
                      <div className="text-[10px] font-normal opacity-90">Latin / 英文名</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center font-biaukai">
                      <div>ឈ្មោះចិន</div>
                      <div className="text-[10px] font-normal opacity-90">Chinese / 中文名</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ភេទ</div>
                      <div className="text-[10px] font-normal opacity-90">Sex / 性別</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ថ្ងៃកំណើត</div>
                      <div className="text-[10px] font-normal opacity-90">DOB / 生日</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center font-mono">
                      <div>អត្តសញ្ញាបណ្ណ</div>
                      <div className="text-[10px] font-normal opacity-90">ID Card / 身分證</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center font-mono">
                      <div>លិខិតឆ្លងដែន</div>
                      <div className="text-[10px] font-normal opacity-90">Passport / 護照</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>អ្នកណែនាំ</div>
                      <div className="text-[10px] font-normal opacity-90">Referrer / 推薦人</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ទូរស័ព្ទ</div>
                      <div className="text-[10px] font-normal opacity-90">Phone / 電話</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>សាលានៅខ្មែរ</div>
                      <div className="text-[10px] font-normal opacity-90">School KH / 原校</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>សាលារៀន</div>
                      <div className="text-[10px] font-normal opacity-90">School / 學校</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ជំនាញ</div>
                      <div className="text-[10px] font-normal opacity-90">Major / 科系</div>
                    </th>
                    <th className="p-2 border border-indigo-700 text-center">
                      <div>ឯកសារ*</div>
                      <div className="text-[10px] font-normal opacity-90">Docs / 文件</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {students.slice(0, 15).map((s, idx) => {
                    const docVal = areAllRequiredDocumentsUploaded(s.documents);
                    const studentAge = s.age || calculateAge(s.dob);
                    const schoolTrans = getSchoolTranslation(s.targetSchool);
                    const majorTrans = getMajorTranslation(s.major);

                    return (
                      <tr key={s.studentId || idx} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                        <td className="p-2 border border-slate-300 text-center font-mono font-bold text-slate-600 text-[11px]">
                          {s.studentId || (idx + 1)}
                        </td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">
                          {s.nameKhmer || s.name || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 font-times font-semibold text-slate-800">
                          {s.nameLatin || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 font-biaukai font-semibold text-slate-900 text-sm">
                          {s.nameChinese || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-[11px]">
                          {s.gender === 'Male' ? 'ប្រុស' : s.gender === 'Female' ? 'ស្រី' : (s.gender || '-')}
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {formatDobOnly(s.dob) || '-'} {studentAge ? <span className="text-slate-400">({studentAge}ឆ្នាំ)</span> : ''}
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">
                          {s.idCardNumber || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">
                          {s.passportNumber || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 text-[11px] font-battambang">
                          {s.referrerName || '-'}
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[11px]">
                          {s.phone || '-'}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-bold text-slate-800 text-xs font-battambang">{s.previousSchoolKhmer || '-'}</div>
                          {s.previousSchoolAddressKhmer && (
                            <div className="text-[10px] text-slate-500 font-battambang">{s.previousSchoolAddressKhmer}</div>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-biaukai font-bold text-indigo-950 text-xs">{s.targetSchool || '-'}</div>
                          {schoolTrans?.km && schoolTrans.km !== s.targetSchool && (
                            <div className="text-[10px] text-slate-500 font-battambang">{schoolTrans.km}</div>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-biaukai font-bold text-emerald-950 text-xs">{s.major || '-'}</div>
                          {majorTrans?.km && majorTrans.km !== s.major && (
                            <div className="text-[10px] text-emerald-600 font-battambang">{majorTrans.km}</div>
                          )}
                        </td>
                        <td className="p-2 border border-slate-300 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            docVal.isValid 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {docVal.completedCount}/{docVal.totalRequired}*
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {students.length > 15 && (
                <div className="p-2 text-center text-xs text-slate-400 italic bg-slate-50 border-x border-b border-slate-200">
                  {language === 'km' 
                    ? `...និងសិស្សចំនួន ${students.length - 15} នាក់ទៀត (នឹងបង្ហាញពេញលេញក្នុងឯកសារ PDF ឬពេលបោះពុម្ព)` 
                    : `...and ${students.length - 15} more students (will appear in full in PDF and Print)`}
                </div>
              )}
            </div>

            {/* Official Signatures Section */}
            <div className="mt-8 pt-4 border-t border-slate-300 grid grid-cols-2 text-center text-xs text-slate-600">
              <div>
                <div>បានឃើញ និងពិនិត្យត្រឹមត្រូវ</div>
                <div className="font-bold text-slate-800 mt-1">ប្រធានការិយាល័យ / រដ្ឋបាល</div>
                <div className="h-14"></div>
                <div className="text-[10px] text-slate-400">( ហត្ថលេខា និងត្រា )</div>
              </div>
              <div>
                <div>រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...</div>
                <div className="font-bold text-slate-800 mt-1">អ្នករៀបចំរបាយការណ៍</div>
                <div className="h-14"></div>
                <div className="text-[10px] text-slate-400">( ហត្ថលេខា )</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between bg-slate-50 text-xs">
          <div className="text-slate-500">
            {language === 'km' 
              ? 'ចំណាំ៖ ប្រសិនបើផ្ទាំង Print មិនលោតឡើង សូមចុចប៊ូតុងពណ៌ក្រហម «ទាញយកជា PDF»' 
              : 'Tip: If browser print dialog does not appear, click "Download PDF"'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100"
          >
            {language === 'km' ? 'បិទផ្ទាំង' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
