import React, { useState, useMemo, useEffect } from 'react';
import {
  Printer,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Loader2,
  Users,
  User,
  FileText,
  ChevronLeft,
  ChevronRight,
  Search,
  Share2,
} from 'lucide-react';
import { Student, Language } from '../types';
import {
  GeneratedPdfResult,
  generateHighQualityPDF,
  executePrintDocument,
  downloadPrintableHtml,
  formatCurrentReportDateDot,
  getTrilingualReportTitles,
  TRILINGUAL_REPORT_COLUMNS,
} from '../utils/pdfRenderUtils';
import {
  buildIndividualStudentPageHtml,
  saveIndividualStudentPDF,
  printIndividualStudentDocument,
  buildBlankRegistrationFormPagesHtml,
  saveBlankFormAsPDF,
  printBlankRegistrationForm,
} from '../utils/studentFormPdfUtils';
import { getStudentPhotoDataUrl } from '../utils/documentUtils';
import { useInstitution } from '../services/institutionService';
import { schoolMajorService } from '../services/schoolMajorService';
import {
  canSharePdfFile,
  computeStudentNumbersList,
  formatConciseSchoolForReport,
  formatDobDot,
  formatGenderCode,
  sharePdfBlobNative,
} from '../utils/studentOrderUtils';

export type PrintModalMode = 'summary' | 'individual' | 'blank_form';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  language: Language;
  reportTitle?: string;
  initialMode?: PrintModalMode;
  initialStudentId?: string;
  onlyBlankForm?: boolean;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  students,
  language,
  reportTitle = 'តារាងរបាយការណ៍សិស្ស • 學生綜合報表 • STUDENT COMPREHENSIVE REPORT',
  initialMode = 'summary',
  initialStudentId,
  onlyBlankForm = false,
}) => {
  const institution = useInstitution();
  const [mode, setMode] = useState<PrintModalMode>(onlyBlankForm ? 'blank_form' : initialMode);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentQuery, setStudentQuery] = useState<string>('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [pdfProgress, setPdfProgress] = useState('');
  const [readyPdf, setReadyPdf] = useState<GeneratedPdfResult | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(null);
  const [docsTick, setDocsTick] = useState(0);

  const canNativeShare = useMemo(() => canSharePdfFile(), []);
  const numberedItems = useMemo(() => computeStudentNumbersList(students), [students]);

  useEffect(() => {
    const onDocsUpdated = () => setDocsTick((v) => v + 1);
    const unsubSchools = schoolMajorService.subscribe(() => setDocsTick((v) => v + 1));
    window.addEventListener('student_documents_updated', onDocsUpdated);
    return () => {
      unsubSchools();
      window.removeEventListener('student_documents_updated', onDocsUpdated);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setMode(onlyBlankForm ? 'blank_form' : initialMode);
    setStatusMessage(null);
    setReadyPdf(null);
    setStudentQuery('');
    if (initialStudentId && numberedItems.some((it) => it.student.studentId === initialStudentId)) {
      setSelectedStudentId(initialStudentId);
    } else if (numberedItems.length > 0) {
      setSelectedStudentId((prev) =>
        prev && numberedItems.some((it) => it.student.studentId === prev)
          ? prev
          : numberedItems[0].student.studentId
      );
    } else {
      setSelectedStudentId('');
    }
  }, [isOpen, initialMode, initialStudentId, numberedItems, onlyBlankForm]);

  const filteredNumberedItems = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return numberedItems;
    return numberedItems.filter(({ student: s, sequenceNo, schoolMajorNo }) => {
      return (
        String(sequenceNo).includes(q) ||
        String(schoolMajorNo).includes(q) ||
        (s.studentId || '').toLowerCase().includes(q) ||
        (s.nameKhmer || s.name || '').toLowerCase().includes(q) ||
        (s.nameLatin || '').toLowerCase().includes(q) ||
        (s.nameChinese || '').toLowerCase().includes(q) ||
        (s.targetSchool || '').toLowerCase().includes(q) ||
        (s.major || '').toLowerCase().includes(q)
      );
    });
  }, [numberedItems, studentQuery]);

  const selectedItemIndex = useMemo(() => {
    if (filteredNumberedItems.length === 0) return -1;
    const idx = filteredNumberedItems.findIndex((it) => it.student.studentId === selectedStudentId);
    return idx >= 0 ? idx : 0;
  }, [filteredNumberedItems, selectedStudentId]);

  const selectedItem =
    selectedItemIndex >= 0 ? filteredNumberedItems[selectedItemIndex] : undefined;

  const schoolLogo = institution.logoUrl || '/logo.jpg';
  const schoolNameKm = institution.nameKm || 'សាលារៀនចិនលិស៊ីងអន្តរជាតិ';
  const schoolNameZh = institution.nameZh || '日興國際學校';
  const schoolNameEn = institution.nameEn || 'LISING INTERNATIONAL CHINESE SCHOOL';

  const currentDateDot = formatCurrentReportDateDot();
  const titles = getTrilingualReportTitles(reportTitle);

  const individualPreviewHtml = useMemo(() => {
    if (!selectedItem) return '';
    return buildIndividualStudentPageHtml(selectedItem, {
      logoDataUrl: schoolLogo,
      studentPhotoDataUrl: getStudentPhotoDataUrl(selectedItem.student),
      reportDateDot: currentDateDot,
    });
  }, [selectedItem, schoolLogo, currentDateDot]);

  const blankFormPagesHtml = useMemo(() => {
    return buildBlankRegistrationFormPagesHtml(schoolLogo, language);
  }, [schoolLogo, language, docsTick]);

  if (!isOpen) return null;

  const showPrintReadyPdfDownloadedMessage = (docLabelKm: string) => {
    setStatusMessage({
      type: 'success',
      text:
        language === 'zh-TW'
          ? '此預覽視窗限制直接彈出列印對話框，系統已自動為您下載 A4 可列印 PDF 檔案，開啟即可直接列印！（正式網站連結將直接彈出列印視窗）'
          : language === 'en'
          ? 'Direct print dialog is restricted in this preview frame — your print-ready A4 PDF has been downloaded automatically! Open it to print immediately.'
          : `កម្មវិធីរុករកនេះបិទផ្ទាំង Print ផ្ទាល់ — ប្រព័ន្ធបានរៀបចំ និងទាញយកឯកសារ ${docLabelKm} (A4 PDF) រួចរាល់សម្រាប់បើក Print ភ្លាមៗ! (នៅលើ Link វេបសាយផ្ទាល់ ផ្ទាំង Print នឹងលោតឡើងដោយស្វ័យប្រវត្តិ)`,
    });
  };

  // --- SUMMARY HANDLERS ---
  const handleDirectPrintSummary = async () => {
    setStatusMessage(null);
    setIsPrinting(true);
    try {
      const res = await executePrintDocument(students, reportTitle, language);
      if (!res.success) {
        const pdfRes = await generateHighQualityPDF(
          students,
          reportTitle,
          'Student_Registration_Report',
          language,
          (msg) => setPdfProgress(msg)
        );
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('តារាងរបាយការណ៍សិស្ស');
      }
    } catch {
      try {
        const pdfRes = await generateHighQualityPDF(
          students,
          reportTitle,
          'Student_Registration_Report',
          language,
          (msg) => setPdfProgress(msg)
        );
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('តារាងរបាយការណ៍សិស្ស');
      } catch {
        setStatusMessage({
          type: 'error',
          text: language === 'km' ? 'មានបញ្ហាក្នុងការបោះពុម្ពរបាយការណ៍' : 'Error preparing printable report',
        });
      }
    } finally {
      setIsPrinting(false);
      setPdfProgress('');
    }
  };

  const handleDownloadSummaryPDF = async () => {
    setIsGeneratingPdf(true);
    setStatusMessage(null);
    try {
      const pdfRes = await generateHighQualityPDF(
        students,
        reportTitle,
        'Student_Registration_Report',
        language,
        (msg) => setPdfProgress(msg)
      );
      setReadyPdf(pdfRes);
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

  const handleDownloadSummaryHtml = async () => {
    await downloadPrintableHtml(students, reportTitle, 'Student_Report', language);
    setReadyPdf(null);
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

  // --- INDIVIDUAL STUDENT HANDLERS ---
  const handleSaveSingleStudentPdf = async () => {
    if (!selectedItem) return;
    setIsGeneratingPdf(true);
    setStatusMessage(null);
    try {
      const pdfRes = await saveIndividualStudentPDF(selectedItem, language, (msg) => setPdfProgress(msg));
      setReadyPdf(pdfRes);
      setStatusMessage({
        type: 'success',
        text:
          language === 'zh-TW'
            ? `已成功下載學生 #${selectedItem.sequenceNo} 個人詳細資料 PDF！`
            : language === 'en'
            ? `Saved Individual Student #${selectedItem.sequenceNo} PDF successfully!`
            : `បានរក្សាទុក PDF ព័ត៌មានសិស្សលេខរៀង #${selectedItem.sequenceNo} (${selectedItem.student.nameKhmer || selectedItem.student.nameLatin || ''}) ជោគជ័យ!`,
      });
    } catch (err) {
      console.error('Individual PDF error:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'km' ? 'មានបញ្ហាក្នុងការបង្កើត PDF ព័ត៌មានសិស្ស' : 'Failed to save student PDF',
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrintSingleStudent = async () => {
    if (!selectedItem) return;
    setStatusMessage(null);
    setIsPrinting(true);
    try {
      const res = await printIndividualStudentDocument(selectedItem, language);
      if (!res.success) {
        const pdfRes = await saveIndividualStudentPDF(selectedItem, language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ព័ត៌មានសិស្សម្នាក់នេះ');
      }
    } catch {
      try {
        const pdfRes = await saveIndividualStudentPDF(selectedItem, language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ព័ត៌មានសិស្សម្នាក់នេះ');
      } catch {
        setStatusMessage({
          type: 'error',
          text: language === 'km' ? 'មានបញ្ហាក្នុងការបោះពុម្ពព័ត៌មានសិស្ស' : 'Failed to print student info',
        });
      }
    } finally {
      setIsPrinting(false);
      setPdfProgress('');
    }
  };

  const handleSaveAllIndividualPdfs = async () => {
    if (numberedItems.length === 0) return;
    setIsGeneratingPdf(true);
    setStatusMessage(null);
    try {
      const pdfRes = await saveIndividualStudentPDF(numberedItems, language, (msg) => setPdfProgress(msg));
      setReadyPdf(pdfRes);
      setStatusMessage({
        type: 'success',
        text:
          language === 'zh-TW'
            ? `已成功下載全部 ${numberedItems.length} 位學生個人詳細資料 PDF (1人1頁)！`
            : language === 'en'
            ? `Saved all ${numberedItems.length} individual student profile sheets (1 student per page) as PDF!`
            : `បានរក្សាទុក PDF ព័ត៌មានសិស្សម្នាក់ៗទាំងអស់ (${numberedItems.length} នាក់ • ១នាក់ ១ទំព័រ A4) ជោគជ័យ!`,
      });
    } catch (err) {
      console.error('Batch individual PDF error:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'km' ? 'មានបញ្ហាក្នុងការបង្កើត PDF សិស្សទាំងអស់' : 'Failed to save batch student PDF',
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrintAllIndividual = async () => {
    if (numberedItems.length === 0) return;
    setStatusMessage(null);
    setIsPrinting(true);
    try {
      const res = await printIndividualStudentDocument(numberedItems, language);
      if (!res.success) {
        const pdfRes = await saveIndividualStudentPDF(numberedItems, language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ព័ត៌មានសិស្សម្នាក់ៗទាំងអស់');
      }
    } catch {
      try {
        const pdfRes = await saveIndividualStudentPDF(numberedItems, language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ព័ត៌មានសិស្សម្នាក់ៗទាំងអស់');
      } catch {
        setStatusMessage({
          type: 'error',
          text: language === 'km' ? 'មានបញ្ហាក្នុងការបោះពុម្ពសិស្សទាំងអស់' : 'Failed to print all students',
        });
      }
    } finally {
      setIsPrinting(false);
      setPdfProgress('');
    }
  };

  // --- BLANK FORM HANDLERS ---
  const handleSaveBlankForm = async () => {
    setIsGeneratingPdf(true);
    setStatusMessage(null);
    try {
      const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
      setReadyPdf(pdfRes);
      setStatusMessage({
        type: 'success',
        text:
          language === 'zh-TW'
            ? '已成功下載手寫空白入學報名表 PDF！'
            : language === 'en'
            ? 'Blank Student Registration Form PDF downloaded successfully!'
            : 'បានរក្សាទុកទម្រង់ពាក្យចុះឈ្មោះ (Save Form ជា PDF) សម្រាប់បំពេញដោយដៃ ជោគជ័យ!',
      });
    } catch (err) {
      console.error('Blank form PDF error:', err);
      setStatusMessage({
        type: 'error',
        text: language === 'km' ? 'មានបញ្ហាក្នុងការបង្កើត PDF ទម្រង់ទទេ' : 'Failed to generate blank form PDF',
      });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const handlePrintBlankForm = async () => {
    setStatusMessage(null);
    setIsPrinting(true);
    try {
      const res = await printBlankRegistrationForm(language);
      if (!res.success) {
        const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ទម្រង់បំពេញព័ត៌មានសិស្សដោយដៃ (Print Form)');
      } else {
        setReadyPdf(null);
        setStatusMessage({
          type: 'success',
          text:
            language === 'zh-TW'
              ? '已開啟列印視窗！'
              : language === 'en'
              ? 'Print dialog opened!'
              : 'បានបើកផ្ទាំងបោះពុម្ពទម្រង់បំពេញដោយដៃរួចរាល់!',
        });
      }
    } catch {
      try {
        const pdfRes = await saveBlankFormAsPDF(language, (msg) => setPdfProgress(msg));
        setReadyPdf(pdfRes);
        showPrintReadyPdfDownloadedMessage('ទម្រង់បំពេញព័ត៌មានសិស្សដោយដៃ (Print Form)');
      } catch {
        setStatusMessage({
          type: 'error',
          text: language === 'km' ? 'មានបញ្ហាក្នុងការរៀបចំឯកសារ Print Form' : 'Failed to prepare Print Form',
        });
      }
    } finally {
      setIsPrinting(false);
      setPdfProgress('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div
        className="bg-white rounded-2xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[#701014] text-white shadow-xs shrink-0">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 flex-wrap">
                <span>
                  {onlyBlankForm
                    ? language === 'zh-TW'
                      ? '空白手寫入學報名表 (Save Form & Print Form)'
                      : language === 'en'
                      ? 'Blank Registration Form (Save Form & Print Form)'
                      : 'ទម្រង់ពាក្យចុះឈ្មោះសម្រាប់បំពេញដោយដៃ (Save Form & Print Form)'
                    : language === 'zh-TW'
                    ? '列印與下載報表中心 (總表 • 學生個人資料 • 空白報名表)'
                    : language === 'en'
                    ? 'Print & PDF Export Center (Summary • Individual Student • Blank Form)'
                    : 'មជ្ឈមណ្ឌលបោះពុម្ព និង Save PDF (តារាងរួម • ព័ត៌មានសិស្សម្នាក់ៗ • ទម្រង់បំពេញដៃ)'}
                </span>
              </h3>
              <p className="text-xs text-slate-500 truncate tabular-nums">
                {onlyBlankForm
                  ? language === 'zh-TW'
                    ? `A4 直向 (${blankFormPagesHtml.length} 頁) · 日期：${currentDateDot}`
                    : language === 'en'
                    ? `A4 Portrait (${blankFormPagesHtml.length} pages) · Date: ${currentDateDot}`
                    : `ក្រដាសបញ្ឈរ A4 (${blankFormPagesHtml.length} ទំព័រ) · កាលបរិច្ឆេទ៖ ${currentDateDot}`
                  : language === 'zh-TW'
                  ? `學生總數 ${students.length} 人 · A4 直向 · 日期：${currentDateDot}`
                  : language === 'en'
                  ? `Total ${students.length} Students · A4 Portrait · Date: ${currentDateDot}`
                  : `សិស្សសរុប ${students.length} នាក់ · ក្រដាសបញ្ឈរ A4 · កាលបរិច្ឆេទ៖ ${currentDateDot}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Segmented Tabs (Hidden in registrant-only blank form mode) */}
        {!onlyBlankForm && (
          <div className="px-4 sm:px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <button
              type="button"
              onClick={() => {
                setMode('summary');
                setStatusMessage(null);
                setReadyPdf(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'summary'
                  ? 'bg-[#701014] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>
                {language === 'zh-TW'
                  ? '1. 學生綜合報表 (總表)'
                  : language === 'en'
                  ? '1. Summary Report Table'
                  : '១. តារាងរបាយការណ៍សិស្សរួម'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('individual');
                setStatusMessage(null);
                setReadyPdf(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'individual'
                  ? 'bg-[#701014] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>
                {language === 'zh-TW'
                  ? '2. 學生個人資料 (Save PDF & Print)'
                  : language === 'en'
                  ? '2. Individual Student Info (Save PDF & Print)'
                  : '២. ព័ត៌មានសិស្សម្នាក់ៗ (Save PDF & Print)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('blank_form');
                setStatusMessage(null);
                setReadyPdf(null);
              }}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                mode === 'blank_form'
                  ? 'bg-[#701014] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>
                {language === 'zh-TW'
                  ? '3. 空白手寫報名表 (Save & Print Form)'
                  : language === 'en'
                  ? '3. Blank Form for Manual Fill'
                  : '៣. ទម្រង់បំពេញដោយដៃ (Save & Print Form)'}
              </span>
            </button>
          </div>
        )}

        {/* Mode-Specific Export Controls */}
        {mode === 'summary' && (
          <div className="p-3.5 sm:px-6 bg-indigo-50/60 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleDownloadSummaryPDF}
                disabled={isGeneratingPdf || students.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{pdfProgress || (language === 'km' ? 'កំពុងបង្កើត PDF...' : 'Rendering PDF...')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>
                      {language === 'zh-TW'
                        ? '下載總表 PDF (A4 直向)'
                        : language === 'en'
                        ? 'Save Summary PDF (A4)'
                        : 'Save PDF តារាងរួម (A4 បញ្ឈរ)'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDirectPrintSummary}
                disabled={isGeneratingPdf || isPrinting || students.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isPrinting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{pdfProgress || (language === 'km' ? 'កំពុងរៀបចំ Print...' : 'Preparing Print...')}</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>
                      {language === 'zh-TW'
                        ? '列印總表 (Print)'
                        : language === 'en'
                        ? 'Print Summary'
                        : 'បោះពុម្ពតារាងរួម (Print)'}
                    </span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadSummaryHtml}
                disabled={students.length === 0}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-2xs"
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

            <div className="text-xs text-slate-600 flex items-center gap-2 tabular-nums">
              <Users className="w-4 h-4 text-slate-400" />
              <span>
                {students.length}{' '}
                {language === 'zh-TW'
                  ? '位學生 · 點擊任一列可檢視個人表'
                  : language === 'en'
                  ? 'students · click a row for individual sheet'
                  : 'នាក់ · ចុចលើឈ្មោះសិស្សណាមួយដើម្បីមើល/ព្រីនព័ត៌មានម្នាក់ៗ'}
              </span>
            </div>
          </div>
        )}

        {mode === 'individual' && (
          <div className="p-3.5 sm:px-6 bg-amber-50/70 border-b border-amber-200/80 space-y-2.5 shrink-0">
            {/* Row 1: Student Search + Dropdown + Prev/Next */}
            <div className="flex flex-col md:flex-row md:items-center gap-2">
              <div className="relative md:w-56 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                  placeholder={
                    language === 'zh-TW'
                      ? '搜尋姓名或序號...'
                      : language === 'en'
                      ? 'Filter student...'
                      : 'ស្វែងរកឈ្មោះ ឬលេខរៀង...'
                  }
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-800 focus:border-[#701014] outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <button
                  type="button"
                  disabled={selectedItemIndex <= 0}
                  onClick={() => {
                    if (selectedItemIndex > 0) {
                      setSelectedStudentId(filteredNumberedItems[selectedItemIndex - 1].student.studentId);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shrink-0 cursor-pointer"
                  title={language === 'km' ? 'សិស្សមុន' : 'Previous Student'}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <select
                  value={selectedItem?.student.studentId || ''}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:border-[#701014] outline-hidden tabular-nums"
                >
                  {filteredNumberedItems.length === 0 ? (
                    <option value="">
                      {language === 'km' ? '-- គ្មានទិន្នន័យសិស្ស --' : '-- No students found --'}
                    </option>
                  ) : (
                    filteredNumberedItems.map(({ student: s, sequenceNo, schoolMajorNo }) => (
                      <option key={s.studentId} value={s.studentId}>
                        #{sequenceNo} (No.{schoolMajorNo}) — {s.nameKhmer || s.name || '-'}
                        {s.nameLatin ? ` (${s.nameLatin})` : ''}
                        {s.nameChinese ? ` · ${s.nameChinese}` : ''}
                      </option>
                    ))
                  )}
                </select>

                <button
                  type="button"
                  disabled={selectedItemIndex < 0 || selectedItemIndex >= filteredNumberedItems.length - 1}
                  onClick={() => {
                    if (selectedItemIndex >= 0 && selectedItemIndex < filteredNumberedItems.length - 1) {
                      setSelectedStudentId(filteredNumberedItems[selectedItemIndex + 1].student.studentId);
                    }
                  }}
                  className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shrink-0 cursor-pointer"
                  title={language === 'km' ? 'សិស្សបន្ទាប់' : 'Next Student'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Row 2: Individual Student Save PDF & Print + Batch All Individual Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveSingleStudentPdf}
                  disabled={isGeneratingPdf || !selectedItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isGeneratingPdf ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'zh-TW'
                      ? 'Save PDF (此位學生)'
                      : language === 'en'
                      ? 'Save PDF (Selected Student)'
                      : 'Save PDF (ព័ត៌មានសិស្សម្នាក់នេះ)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintSingleStudent}
                  disabled={isGeneratingPdf || isPrinting || !selectedItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPrinting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4" />
                  )}
                  <span>
                    {language === 'zh-TW'
                      ? 'Print (列印此位學生)'
                      : language === 'en'
                      ? 'Print (Selected Student)'
                      : 'Print (បោះពុម្ពសិស្សម្នាក់នេះ)'}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSaveAllIndividualPdfs}
                  disabled={isGeneratingPdf || isPrinting || numberedItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>
                    {language === 'zh-TW'
                      ? `Save PDF 全部個人表 (${numberedItems.length}頁)`
                      : language === 'en'
                      ? `Save All Individual PDF (${numberedItems.length})`
                      : `Save PDF សិស្សទាំងអស់ (${numberedItems.length} ទំព័រ)`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintAllIndividual}
                  disabled={isGeneratingPdf || isPrinting || numberedItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {isPrinting ? (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                  ) : (
                    <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  )}
                  <span>
                    {language === 'zh-TW'
                      ? 'Print 全部個人表'
                      : language === 'en'
                      ? 'Print All Individual'
                      : 'Print សិស្សទាំងអស់ (១នាក់ ១ទំព័រ)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'blank_form' && (
          <div className="p-3.5 sm:px-6 bg-emerald-50/70 border-b border-emerald-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleSaveBlankForm}
                disabled={isGeneratingPdf || isPrinting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#701014] hover:bg-[#580c10] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>
                  {isGeneratingPdf && pdfProgress
                    ? pdfProgress
                    : language === 'zh-TW'
                    ? 'Save Form PDF (下載手寫空白表)'
                    : language === 'en'
                    ? 'Save Form as PDF'
                    : 'Save Form ជា PDF (ទម្រង់បំពេញដោយដៃ)'}
                </span>
              </button>

              <button
                type="button"
                onClick={handlePrintBlankForm}
                disabled={isGeneratingPdf || isPrinting}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isPrinting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4" />
                )}
                <span>
                  {isPrinting && pdfProgress
                    ? pdfProgress
                    : language === 'zh-TW'
                    ? 'Print Form (列印空白表)'
                    : language === 'en'
                    ? 'Print Form'
                    : 'Print Form (បោះពុម្ពទម្រង់បំពេញដោយដៃ)'}
                </span>
              </button>
            </div>

            <span className="text-xs text-slate-600 tabular-nums">
              {language === 'zh-TW'
                ? `A4 直向共 ${blankFormPagesHtml.length} 頁 · 含全部學校與各科系勾選欄 (☑)`
                : language === 'en'
                ? `A4 Portrait (${blankFormPagesHtml.length} pages) · Includes full School & Major checkboxes (☑)`
                : `ទម្រង់ក្រដាសបញ្ឈរ A4 (${blankFormPagesHtml.length} ទំព័រ) · រួមបញ្ចូលតារាងគូសធីក ☑ ឈ្មោះសាលារៀន និងមុខជំនាញទាំងអស់`}
            </span>
          </div>
        )}

        {/* Status Banner */}
        {statusMessage && (
          <div
            className={`px-4 sm:px-6 py-2.5 text-xs font-medium flex flex-wrap items-center justify-between gap-2 border-b shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : statusMessage.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border-amber-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              {statusMessage.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>

            {readyPdf && readyPdf.url && statusMessage.type === 'success' && (
              <div className="flex items-center gap-1.5 shrink-0">
                <a
                  href={readyPdf.url}
                  download={readyPdf.filename}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold shadow-2xs transition-colors whitespace-nowrap"
                >
                  <Download className="w-3 h-3" />
                  <span>
                    {language === 'zh-TW'
                      ? '直接下載 PDF'
                      : language === 'en'
                      ? 'Download PDF'
                      : 'ទាញយក PDF'}
                  </span>
                </a>
                {canNativeShare && (
                  <button
                    type="button"
                    onClick={() => {
                      void sharePdfBlobNative(readyPdf.blob, readyPdf.filename, readyPdf.filename);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>
                      {language === 'zh-TW'
                        ? '分享 / 列印'
                        : language === 'en'
                        ? 'Share / Print'
                        : 'Share / Print'}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Live A4 Portrait Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-200/70">
          {mode === 'summary' && (
            <div className="bg-white shadow-lg border border-slate-300 max-w-[810px] mx-auto p-5 sm:p-6 text-black">
              {/* Official Enlarged 3-Language Report Header */}
              <div className="pb-2.5 mb-2.5 border-b-2 border-slate-900">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-15 h-15 rounded-full bg-white p-0.5 border-2 border-indigo-950 shadow-2xs shrink-0 overflow-hidden flex items-center justify-center">
                      <img
                        src={schoolLogo}
                        alt={schoolNameKm}
                        referrerPolicy="no-referrer"
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
                      <div className="font-bold text-[11px] sm:text-[11.5px] text-slate-700 tracking-wide uppercase font-times mt-0.5 sm:whitespace-nowrap">
                        {schoolNameEn}
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right text-[12px] text-slate-900 shrink-0 font-battambang space-y-0.5 leading-snug tabular-nums">
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

              {/* Official 9-Column Size-14 Black-Bordered Table Preview */}
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
                        <th key={col.key} className="py-1.5 px-1 border border-black align-middle">
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
                        <tr
                          key={`${s.studentId}_${sequenceNo}`}
                          onClick={() => {
                            setSelectedStudentId(s.studentId);
                            setMode('individual');
                            setStatusMessage(null);
                          }}
                          title={
                            language === 'km'
                              ? 'ចុចដើម្បីមើល និងបោះពុម្ពព័ត៌មានលម្អិតរបស់សិស្សនេះ'
                              : 'Click to preview & print this student profile'
                          }
                          className="bg-white hover:bg-amber-50/70 cursor-pointer transition-colors"
                        >
                          <td className="py-1.5 px-1 border border-black text-center text-[14px] tabular-nums">
                            {sequenceNo}
                          </td>
                          <td className="py-1.5 px-1 border border-black text-center text-[14px] tabular-nums">
                            {schoolMajorNo}
                          </td>
                          <td className="py-1.5 px-1.5 border border-black text-center text-[14px] break-words">
                            {latinName}
                          </td>
                          <td className="py-1.5 px-1 border border-black text-center font-biaukai text-[14px] break-words">
                            {s.nameChinese || ''}
                          </td>
                          <td className="py-1.5 px-1 border border-black text-center font-times text-[14px] whitespace-nowrap tabular-nums">
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
          )}

          {mode === 'individual' && (
            <div className="bg-white shadow-lg border border-slate-300 max-w-[810px] mx-auto p-5 sm:p-6 text-black overflow-x-auto">
              {selectedItem ? (
                <div
                  className="min-w-[762px] font-battambang"
                  dangerouslySetInnerHTML={{ __html: individualPreviewHtml }}
                />
              ) : (
                <div className="py-16 text-center text-slate-500 text-sm">
                  {language === 'km'
                    ? 'មិនមានទិន្នន័យសិស្សសម្រាប់បង្ហាញទេ។'
                    : 'No student record available to preview.'}
                </div>
              )}
            </div>
          )}

          {mode === 'blank_form' && (
            <div className="space-y-6 max-w-[810px] mx-auto">
              {blankFormPagesHtml.map((pageHtml, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-600 px-1 tabular-nums">
                    {language === 'zh-TW'
                      ? `第 ${idx + 1} / ${blankFormPagesHtml.length} 頁`
                      : language === 'en'
                      ? `Page ${idx + 1} of ${blankFormPagesHtml.length}`
                      : `ទំព័រទី ${idx + 1} នៃ ${blankFormPagesHtml.length}${
                          idx === 0
                            ? ' — ព័ត៌មានសិស្ស ឪពុកម្ដាយ ឯកសារភ្ជាប់ និងហត្ថលេខា'
                            : ' — តារាងគូសធីកជ្រើសរើសឈ្មោះសាលារៀន និងមុខជំនាញនីមួយៗ'
                        }`}
                  </div>
                  <div className="bg-white shadow-lg border border-slate-300 p-5 sm:p-6 text-black overflow-x-auto">
                    <div
                      className="min-w-[762px] font-battambang"
                      dangerouslySetInnerHTML={{ __html: pageHtml }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between gap-2 bg-slate-50 text-xs shrink-0">
          <div className="text-slate-500">
            {language === 'zh-TW'
              ? '提示：所有報表與表單皆為 A4 直向設計，支援電腦與手機直接下載 PDF。'
              : language === 'en'
              ? 'Tip: All reports and forms are formatted in A4 Portrait and support PDF download on PC & Mobile.'
              : 'ចំណាំ៖ គ្រប់ទម្រង់ A4 បញ្ឈរ (តារាងរួម • ព័ត៌មានសិស្សម្នាក់ៗ • ទម្រង់បំពេញដៃ) អាច Save PDF និង Print បានគ្រប់កុំព្យូទ័រ និងទូរស័ព្ទ។'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-700 hover:bg-slate-100 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {language === 'zh-TW' ? '關閉' : language === 'en' ? 'Close' : 'បិទផ្ទាំង'}
          </button>
        </div>
      </div>
    </div>
  );
};
