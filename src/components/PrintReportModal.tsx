import React, { useState, useMemo } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Loader2,
  Users,
} from 'lucide-react';
import { Student, Language } from '../types';
import {
  generateHighQualityPDF,
  executePrintDocument,
  downloadPrintableHtml,
  formatCurrentReportDateDot,
  getTrilingualReportTitles,
  TRILINGUAL_REPORT_COLUMNS,
} from '../utils/pdfRenderUtils';
import { useInstitution } from '../services/institutionService';
import {
  computeStudentNumbersList,
  formatConciseSchoolForReport,
  formatDobDot,
  formatGenderCode,
} from '../utils/studentOrderUtils';

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
  reportTitle = 'តារាងរបាយការណ៍សិស្ស • 學生綜合報表 • STUDENT COMPREHENSIVE REPORT',
}) => {
  const institution = useInstitution();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const numberedItems = useMemo(() => computeStudentNumbersList(students), [students]);

  if (!isOpen) return null;

  const schoolLogo = institution.logoUrl || '/logo.jpg';
  const schoolNameKm = institution.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = institution.nameZh || '日興國際學校';
  const schoolNameEn = institution.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';

  const currentDateDot = formatCurrentReportDateDot();
  const titles = getTrilingualReportTitles(reportTitle);

  const handleDirectPrint = async () => {
    setStatusMessage(null);
    try {
      const res = await executePrintDocument(students, reportTitle, language);
      if (!res.success) {
        setStatusMessage({
          type: 'warning',
          text:
            language === 'zh-TW'
              ? '此瀏覽器環境限制直接列印視窗，請點擊紅色按鈕「下載 PDF (A4 直向)」以獲得完整清晰報表！'
              : language === 'en'
              ? 'Direct print dialog is restricted in this browser view. Please click "Download PDF (A4 Portrait)" instead!'
              : 'កម្មវិធីរុករកនៅលើឧបករណ៍នេះមិនគាំទ្រផ្ទាំង Print ផ្ទាល់ទេ។ សូមចុចប៊ូតុងពណ៌ក្រហម «ទាញយកជា PDF (ក្រដាសបញ្ឈរ A4)» ដើម្បីបើក ឬបោះពុម្ពបានច្បាស់ ១០០%!',
        });
      }
    } catch {
      setStatusMessage({
        type: 'warning',
        text:
          language === 'zh-TW'
            ? '請點擊「下載 PDF (A4 直向)」以取得清晰報表！'
            : language === 'en'
            ? 'Please click "Download PDF" to get the fully rendered A4 Portrait document!'
            : 'សូមចុចប៊ូតុង «ទាញយកជា PDF (ក្រដាសបញ្ឈរ A4)» ដើម្បីទទួលបានឯកសារបោះពុម្ពច្បាស់ ១០០%!',
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
        text:
          language === 'zh-TW'
            ? '已成功下載 A4 直向三語 PDF 報表 (14號字)！'
            : language === 'en'
            ? 'A4 Portrait Trilingual PDF (Font Size 14) downloaded successfully!'
            : 'បានទាញយកឯកសារ PDF ៣ភាសា (ក្រដាសបញ្ឈរ A4 • ទំហំអក្សរ ១៤) ជោគជ័យ!',
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      setStatusMessage({
        type: 'error',
        text:
          language === 'zh-TW'
            ? '產出 PDF 檔案時發生錯誤'
            : language === 'en'
            ? 'Error generating PDF file'
            : 'មានបញ្ហាក្នុងការបង្កើត PDF',
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handleDownloadHtml = async () => {
    await downloadPrintableHtml(students, reportTitle, 'Student_Report', language);
    setStatusMessage({
      type: 'success',
      text:
        language === 'zh-TW'
          ? '已下載離線列印檔案 (.html)，可於任何電腦或手機開啟列印！'
          : language === 'en'
          ? 'Downloaded printable A4 Portrait HTML file!'
          : 'បានទាញយកឯកសារបោះពុម្ព (.html) ជោគជ័យ! អាចបើក Print លើកុំព្យូទ័រ ឬទូរស័ព្ទបានគ្រប់ពេល។',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>
                  {language === 'zh-TW'
                    ? '列印與下載學生三語報表 (A4 直向)'
                    : language === 'en'
                    ? 'Print & PDF Export Center (A4 Portrait • 3 Languages)'
                    : 'បោះពុម្ព និងទាញយករបាយការណ៍សិស្ស ៣ភាសា (A4 ក្រដាសបញ្ឈរ)'}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {language === 'zh-TW'
                    ? 'A4 直向 • 14號字 • 三語'
                    : language === 'en'
                    ? 'A4 Portrait • Size 14 • 3 Languages'
                    : 'A4 បញ្ឈរ • ទំហំ ១៤ • ៣ភាសា'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 truncate">
                {language === 'zh-TW'
                  ? `學生總數 ${students.length} 人 | 日期：${currentDateDot}`
                  : language === 'en'
                  ? `Total ${students.length} Students | Date: ${currentDateDot}`
                  : `សិស្សសរុប ${students.length} នាក់ | កាលបរិច្ឆេទ៖ ${currentDateDot}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Controls */}
        <div className="p-3.5 sm:p-5 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {pdfProgress ||
                      (language === 'zh-TW'
                        ? '正在建立 PDF...'
                        : language === 'en'
                        ? 'Rendering PDF...'
                        : 'កំពុងបង្កើត PDF...')}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>
                    {language === 'zh-TW'
                      ? '下載 PDF (A4 直向)'
                      : language === 'en'
                      ? 'Download PDF (A4 Portrait)'
                      : 'ទាញយកជា PDF (ក្រដាសបញ្ឈរ A4)'}
                  </span>
                </>
              )}
            </button>

            <button
              onClick={handleDirectPrint}
              disabled={isGeneratingPdf}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>
                {language === 'zh-TW'
                  ? '直接列印 (Print)'
                  : language === 'en'
                  ? 'Print Document'
                  : 'បោះពុម្ព (Print Now)'}
              </span>
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title={
                language === 'zh-TW'
                  ? '下載離線列印 HTML 檔案'
                  : language === 'en'
                  ? 'Download offline printable HTML file'
                  : 'ទាញយកឯកសារបោះពុម្ព .html'
              }
            >
              <FileCode className="w-4 h-4 text-emerald-600" />
              <span>
                {language === 'zh-TW'
                  ? '下載列印檔 (.html)'
                  : language === 'en'
                  ? 'Download Print HTML'
                  : 'ឯកសារបោះពុម្ព (.html)'}
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-600 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>
              {students.length}{' '}
              {language === 'zh-TW'
                ? '位學生於報表中'
                : language === 'en'
                ? 'students in report'
                : 'នាក់ក្នុងរបាយការណ៍'}
            </span>
          </div>
        </div>

        {/* Status Banner */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-medium flex items-center gap-2 border-b shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            {statusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
            {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="flex-1">{statusMessage.text}</span>
          </div>
        )}

        {/* Live A4 Portrait Sheet Preview (Full 3-Language Official Layout) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/70">
          <div className="bg-white shadow-lg border border-slate-300 max-w-[810px] mx-auto p-5 sm:p-6 text-black">
            {/* Official Enlarged 3-Language Report Header */}
            <div className="pb-2.5 mb-2.5 border-b-2 border-slate-900">
              {/* Centered 3-Language Motto */}
              <div className="text-center mb-2.5">
                <div className="font-black text-[18px] sm:text-[18.5px] text-black font-battambang leading-snug">
                  ព្រះរាជាណាចក្រកម្ពុជា
                </div>
                <div className="font-bold text-[15.5px] sm:text-[16px] text-slate-900 font-battambang mt-0.5 leading-snug">
                  ជាតិ សាសនា ព្រះមហាក្សត្រ
                </div>
                <div className="font-bold text-[14.5px] sm:text-[15px] text-slate-900 font-biaukai mt-0.5 leading-snug">
                  柬埔寨王國 • 民族 宗教 國王
                </div>
                <div className="font-bold text-[11px] sm:text-[11.5px] text-slate-800 font-times tracking-wider uppercase mt-0.5">
                  KINGDOM OF CAMBODIA • NATION RELIGION KING
                </div>
              </div>

              {/* School Logo + 3-Language School Name + 3-Language Date & Total Students Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-300">
                <div className="flex items-center gap-2.5">
                  <div className="w-15 h-15 rounded-full bg-white p-0.5 border-2 border-indigo-950 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={schoolLogo}
                      alt={schoolNameKm}
                      className="w-full h-full object-contain rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.jpg';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-black text-[16.5px] sm:text-[17px] text-slate-950 font-battambang leading-snug">
                      {schoolNameKm}
                    </div>
                    <div className="font-bold text-[15px] sm:text-[15.5px] text-indigo-950 font-biaukai mt-0.5">
                      {schoolNameZh}
                    </div>
                    <div className="font-bold text-[11px] sm:text-[11.5px] text-slate-700 tracking-wide uppercase font-times mt-0.5">
                      {schoolNameEn}
                    </div>
                  </div>
                </div>

                {/* 3-Language Metadata Block */}
                <div className="text-left sm:text-right text-[12px] text-slate-900 shrink-0 font-battambang space-y-0.5 leading-snug">
                  <div>
                    <strong>កាលបរិច្ឆេទ / 日期 / Date:</strong>{' '}
                    <span className="font-times font-bold">{currentDateDot}</span>
                  </div>
                  <div>
                    <strong>ចំនួនសិស្សសរុប / 學生總數 / Total:</strong>{' '}
                    <span className="font-extrabold text-black">
                      {students.length} នាក់ / 人 / Students
                    </span>
                  </div>
                </div>
              </div>

              {/* Centered 3-Language Report Title */}
              <div className="text-center mt-2.5">
                <h2 className="font-black text-[16.5px] sm:text-[17px] text-slate-950 font-battambang leading-snug">
                  {titles.km}
                </h2>
                <div className="font-bold text-[14.5px] sm:text-[15px] text-indigo-950 font-biaukai mt-0.5 leading-snug">
                  {titles.zh}
                </div>
                <div className="font-bold text-[11px] sm:text-[11.5px] text-slate-800 font-times tracking-wider uppercase mt-0.5">
                  {titles.en}
                </div>
              </div>
            </div>

            {/* Official 9-Column Size-14 Black-Bordered Table Preview with 3-Language Headers */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[754px] table-fixed border-collapse border border-black text-[14px] text-black">
                <colgroup>
                  {TRILINGUAL_REPORT_COLUMNS.map((col) => (
                    <col key={col.key} style={{ width: `${col.widthPx}px` }} />
                  ))}
                </colgroup>
                <thead>
                  <tr className="bg-slate-50 font-bold text-center">
                    {TRILINGUAL_REPORT_COLUMNS.map((col) => (
                      <th
                        key={col.key}
                        className="py-1.5 px-1 border border-black align-middle"
                      >
                        <div className="font-battambang font-bold text-[13.5px] text-black leading-tight">
                          {col.km}
                        </div>
                        <div className="font-biaukai font-bold text-[12.5px] text-slate-900 leading-tight mt-0.5">
                          {col.zh}
                        </div>
                        <div className="font-times font-bold text-[10.5px] text-slate-800 leading-tight mt-0.5">
                          {col.en}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {numberedItems.map(({ student: s, sequenceNo, schoolMajorNo }) => {
                    const latinName = (s.nameLatin || s.nameKhmer || s.name || '').trim().toUpperCase();
                    return (
                      <tr key={`${s.studentId}_${sequenceNo}`} className="bg-white">
                        <td className="py-1.5 px-1 border border-black text-center text-[14px]">
                          {sequenceNo}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center text-[14px]">
                          {schoolMajorNo}
                        </td>
                        <td className="py-1.5 px-1.5 border border-black text-center text-[14px] break-words">
                          {latinName}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center font-biaukai text-[14px] break-words">
                          {s.nameChinese || ''}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center font-times text-[14px] whitespace-nowrap">
                          {formatDobDot(s.dob)}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center text-[14px]">
                          {formatGenderCode(s.gender)}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center font-biaukai text-[14px] break-words">
                          {formatConciseSchoolForReport(s.targetSchool)}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center font-biaukai text-[14px] break-words">
                          {(s.major || '').trim()}
                        </td>
                        <td className="py-1.5 px-1 border border-black text-center font-biaukai text-[14px] break-words leading-tight">
                          {(s.referrerName || '').trim()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official 3-Language Signatures Section */}
            <div className="mt-5 pt-3.5 border-t border-dashed border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center text-slate-800">
              {/* Left Column: Approver / Administration */}
              <div>
                <div className="font-battambang text-[12.5px] text-slate-800 leading-snug">
                  បានឃើញ និងពិនិត្យត្រឹមត្រូវ
                </div>
                <div className="font-biaukai text-[12px] text-slate-700 leading-snug mt-0.5">
                  已審閱並核對無誤
                </div>
                <div className="font-times text-[10.5px] text-slate-600 leading-snug mt-0.5">
                  Seen and Verified Correct
                </div>

                <div className="mt-1.5">
                  <div className="font-battambang font-bold text-[13.5px] text-black leading-snug">
                    ប្រធានការិយាល័យ / រដ្ឋបាល
                  </div>
                  <div className="font-biaukai font-bold text-[12.5px] text-slate-900 leading-snug mt-0.5">
                    辦公室主任 / 行政主管
                  </div>
                  <div className="font-times font-bold text-[11px] text-slate-800 leading-snug mt-0.5">
                    Head of Office / Administration
                  </div>
                </div>

                <div className="h-11" />

                <div className="text-[11px] text-slate-500 font-battambang">
                  ( ហត្ថលេខា និងត្រា / 簽名及蓋章 / Signature &amp; Stamp )
                </div>
              </div>

              {/* Right Column: Location, Date & Report Preparer */}
              <div>
                <div className="font-battambang text-[12.5px] text-slate-800 leading-snug">
                  រាជធានីភ្នំពេញ, ថ្ងៃទី....... ខែ....... ឆ្នាំ២០២...
                </div>
                <div className="font-biaukai text-[12px] text-slate-700 leading-snug mt-0.5">
                  金邊市，202...年......月......日
                </div>
                <div className="font-times text-[10.5px] text-slate-600 leading-snug mt-0.5">
                  Phnom Penh, Date: ....... / ....... / 202...
                </div>

                <div className="mt-1.5">
                  <div className="font-battambang font-bold text-[13.5px] text-black leading-snug">
                    អ្នករៀបចំរបាយការណ៍
                  </div>
                  <div className="font-biaukai font-bold text-[12.5px] text-slate-900 leading-snug mt-0.5">
                    報表編製人
                  </div>
                  <div className="font-times font-bold text-[11px] text-slate-800 leading-snug mt-0.5">
                    Report Preparer
                  </div>
                </div>

                <div className="h-11" />

                <div className="text-[11px] text-slate-500 font-battambang">
                  ( ហត្ថលេខា / 簽名 / Signature )
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50 text-xs">
          <div className="text-slate-500">
            {language === 'zh-TW'
              ? '提示：A4 直向三語報表 (14號字) 支援所有電腦與手機瀏覽器下載 PDF。'
              : language === 'en'
              ? 'Tip: A4 Portrait trilingual PDF download (Size 14) works across all desktop and mobile browsers.'
              : 'ចំណាំ៖ ទម្រង់ក្រដាសបញ្ឈរ A4 ៣ភាសា (ទំហំអក្សរ និងលេខ ១៤) អាចទាញយកជា PDF បានទាំងលើកុំព្យូទ័រ និងទូរស័ព្ទ។'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 shrink-0"
          >
            {language === 'zh-TW' ? '關閉' : language === 'en' ? 'Close' : 'បិទផ្ទាំង'}
          </button>
        </div>
      </div>
    </div>
  );
};
