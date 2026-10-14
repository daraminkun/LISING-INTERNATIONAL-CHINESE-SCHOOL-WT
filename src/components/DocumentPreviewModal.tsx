import React, { useState, useEffect } from 'react';
import { X, Download, FileText, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { UploadedDocument, Language } from '../types';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: UploadedDocument | null;
  allPages?: UploadedDocument[];
  initialPageIndex?: number;
  title: string;
  language: Language;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  allPages,
  initialPageIndex = 0,
  title,
  language,
}) => {
  const pages = allPages && allPages.length > 0 ? allPages : (document ? [document] : []);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(initialPageIndex);

  useEffect(() => {
    if (initialPageIndex >= 0 && initialPageIndex < pages.length) {
      setCurrentPageIndex(initialPageIndex);
    } else {
      setCurrentPageIndex(0);
    }
  }, [initialPageIndex, isOpen, pages.length]);

  if (!isOpen || pages.length === 0) return null;

  const currentDoc = pages[currentPageIndex] || document;
  if (!currentDoc) return null;

  const isImage = currentDoc.type?.startsWith('image/') || currentDoc.dataUrl?.startsWith('data:image/');
  const isPdf = currentDoc.type?.includes('pdf') || currentDoc.name?.toLowerCase().endsWith('.pdf');
  const totalPages = pages.length;

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 truncate">
                  {title}
                </h3>
                {totalPages > 1 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-100 text-indigo-800 shrink-0">
                    {language === 'km' ? `ទំព័រទី ${currentPageIndex + 1}/${totalPages}` : `Page ${currentPageIndex + 1} of ${totalPages}`}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 truncate">
                {currentDoc.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentDoc.dataUrl && (
              <a
                href={currentDoc.dataUrl}
                download={currentDoc.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ទាញយក' : 'Download'}</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Multi-page Navigation Bar (if > 1 page) */}
        {totalPages > 1 && (
          <div className="px-5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentPageIndex === 0}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{language === 'km' ? 'ទំព័រមុន' : language === 'zh-TW' ? '上一頁' : 'Prev'}</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={currentPageIndex === totalPages - 1}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>{language === 'km' ? 'ទំព័របន្ទាប់' : language === 'zh-TW' ? '下一頁' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Page selection pills */}
            <div className="flex items-center gap-1 overflow-x-auto">
              {pages.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentPageIndex(idx)}
                  className={`px-2.5 py-0.5 text-xs rounded-md transition-colors font-medium ${
                    currentPageIndex === idx
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {language === 'km' ? `ទំព័រ ${idx + 1}` : language === 'zh-TW' ? `第 ${idx + 1} 頁` : `Page ${idx + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Viewer */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center min-h-[350px]">
          {isImage && currentDoc.dataUrl ? (
            <img 
              src={currentDoc.dataUrl} 
              alt={`${title} - Page ${currentPageIndex + 1}`}
              className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-sm border border-slate-200" 
            />
          ) : isPdf && currentDoc.dataUrl ? (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200 p-6 text-center shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{currentDoc.name}</h4>
              <p className="text-xs text-slate-500 mb-4 max-w-sm">
                {language === 'km' 
                  ? 'ឯកសារទម្រង់ PDF អាចទាញយក ឬបើកក្នុង Tab ថ្មីដើម្បីអាន' 
                  : language === 'zh-TW'
                  ? 'PDF 文件可直接下載或於新分頁開啟檢視'
                  : 'PDF document can be downloaded or opened in a new tab'}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={currentDoc.dataUrl}
                  download={currentDoc.name}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {language === 'km' ? 'ទាញយក PDF' : language === 'zh-TW' ? '下載 PDF' : 'Download PDF'}
                </a>
                <a
                  href={currentDoc.dataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  {language === 'km' ? 'បើកមើល' : language === 'zh-TW' ? '新分頁開啟' : 'Open in New Tab'}
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 shadow-xs max-w-sm">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">{currentDoc.name}</p>
              {currentDoc.dataUrl && (
                <a
                  href={currentDoc.dataUrl}
                  download={currentDoc.name}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-medium"
                >
                  <Download className="w-4 h-4" />
                  {language === 'km' ? 'ទាញយកឯកសារ' : 'Download File'}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
