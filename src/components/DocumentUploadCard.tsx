import React, { useRef, useState } from 'react';
import { 
  Upload, 
  CheckCircle2, 
  X, 
  FileText, 
  Eye, 
  Download, 
  AlertCircle,
  Plus,
  Files
} from 'lucide-react';
import { UploadedDocument, Language } from '../types';
import { getDocPages, formatDocSize } from '../utils/documentUtils';
import { generateStandardDocFilename, downloadDocumentWithStandardName } from '../utils/documentDownloadUtils';

interface DocumentUploadCardProps {
  id: string;
  title: string;
  subtitle?: string;
  required?: boolean;
  document?: UploadedDocument | UploadedDocument[];
  onUploadPages: (pages: UploadedDocument[]) => void;
  onRemovePage: (pageIndex: number) => void;
  onRemoveAll: () => void;
  onPreview?: (doc: UploadedDocument, title: string, pageIndex?: number, allPages?: UploadedDocument[]) => void;
  language: Language;
  showRequiredError?: boolean;
  maxPages?: number;
  studentId?: string;
  studentName?: string;
  categoryKey?: string;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  id,
  title,
  subtitle,
  required = false,
  document,
  onUploadPages,
  onRemovePage,
  onRemoveAll,
  onPreview,
  language,
  showRequiredError = false,
  maxPages = 5,
  studentId,
  studentName,
  categoryKey,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pages = getDocPages(document);
  const isUploaded = pages.length > 0;
  const isMaxReached = pages.length >= maxPages;
  const isError = showRequiredError && !isUploaded;

  const handleProcessFiles = (fileList: FileList | File[]) => {
    setErrorMsg(null);
    const files = Array.from(fileList);
    if (files.length === 0) return;

    const remainingSlots = maxPages - pages.length;
    if (remainingSlots <= 0) {
      setErrorMsg(language === 'km' ? `អាច Upload អតិបរមាត្រឹម ${maxPages} ទំព័រប៉ុណ្ណោះ` : `Maximum of ${maxPages} pages allowed`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setErrorMsg(language === 'km' ? `ជ្រើសរើសបានត្រឹម ${remainingSlots} ទំព័របន្ថែមទៀត (អតិបរមា ${maxPages})` : `Only ${remainingSlots} slots remaining (Max ${maxPages})`);
    }

    // Check size on all files (8MB limit per file)
    for (const f of filesToProcess) {
      if (f.size > 8 * 1024 * 1024) {
        setErrorMsg(language === 'km' ? `ឯកសារ "${f.name}" ធំពេក (អតិបរមា 8MB ក្នុងមួយឯកសារ)` : `File "${f.name}" is too large (Max 8MB per file)`);
        return;
      }
    }

    // Read all files asynchronously
    const targetCat = categoryKey || id.replace('doc-', '').replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    const readers = filesToProcess.map((file, idx) => {
      return new Promise<UploadedDocument>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const stdName = generateStandardDocFilename(
            { studentId, nameKhmer: studentName },
            targetCat,
            pages.length + idx,
            file.name,
            file.type
          );
          resolve({
            name: stdName,
            size: file.size,
            type: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
            dataUrl: e.target?.result as string,
            uploadedAt: new Date().toISOString(),
            pageNumber: pages.length + idx + 1,
          });
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers)
      .then(newPages => {
        const updated = [...pages, ...newPages];
        onUploadPages(updated);
      })
      .catch(() => {
        setErrorMsg(language === 'km' ? 'មានបញ្ហាក្នុងការអានឯកសារ' : 'Failed to process files');
      });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleProcessFiles(e.target.files);
      // Reset input value so same files can be re-selected if needed
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleProcessFiles(e.dataTransfer.files);
    }
  };

  return (
    <div 
      id={id}
      className={`relative rounded-xl border transition-all duration-150 overflow-hidden ${
        isError
          ? 'bg-rose-50/40 border-rose-400 ring-2 ring-rose-400/20'
          : isUploaded 
            ? 'bg-slate-50/80 border-emerald-300 ring-1 ring-emerald-400/20 shadow-2xs' 
            : isDragging 
              ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.pdf"
        multiple
        className="hidden"
      />

      <div className="p-3.5 flex flex-col justify-between h-full space-y-2.5">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isUploaded ? 'bg-emerald-100 text-emerald-700' : isError ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {isUploaded ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Files className="w-4 h-4 text-slate-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h5 className="font-bold text-slate-800 text-xs sm:text-sm leading-tight">
                  {title}
                </h5>
                {required && (
                  <span className="text-rose-500 font-bold text-sm leading-none" title={language === 'km' ? 'ចាំបាច់' : 'Required'}>
                    *
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-1 shrink-0">
            {isUploaded ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <span>{pages.length}/{maxPages} {language === 'km' ? 'ទំព័រ' : 'pages'}</span>
              </span>
            ) : required ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                {language === 'km' ? 'ចាំបាច់ *' : 'Required *'}
              </span>
            ) : null}
          </div>
        </div>

        {/* Required validation warning if submitted without uploading */}
        {isError && (
          <div className="px-2.5 py-1 rounded-md bg-rose-100/70 border border-rose-200 text-rose-700 text-[11px] font-medium flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'km' ? `សូម Upload ឯកសារនេះ (១ ដល់ ${maxPages} ទំព័រ)` : `Please upload this document (1-${maxPages} pages)`}</span>
          </div>
        )}

        {/* Uploaded Pages List */}
        {isUploaded ? (
          <div className="space-y-1.5">
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {pages.map((p, idx) => {
                const isImage = p.type?.startsWith('image/') || p.dataUrl?.startsWith('data:image/');
                return (
                  <div 
                    key={idx}
                    className="bg-white rounded-lg p-2 border border-slate-200 flex items-center justify-between gap-2 hover:border-slate-300 transition-colors shadow-2xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Page number badge */}
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {language === 'km' ? `ទំព័រ ${idx + 1}` : `P.${idx + 1}`}
                      </span>

                      {/* Thumbnail or icon */}
                      {isImage && p.dataUrl ? (
                        <img 
                          src={p.dataUrl} 
                          alt={`Page ${idx + 1}`} 
                          className="w-8 h-8 rounded object-cover border border-slate-200 shrink-0 bg-slate-100"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                            #{studentId || 'New'} • P{idx + 1}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDocSize(p.size)}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 truncate" title={p.name}>
                          {p.name}
                        </p>
                      </div>
                    </div>

                    {/* Actions per page */}
                    <div className="flex items-center gap-0.5 shrink-0">
                      {onPreview && p.dataUrl && (
                        <button
                          type="button"
                          onClick={() => onPreview(p, title, idx, pages)}
                          className="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title={language === 'km' ? 'មើលទំព័រនេះ' : 'View page'}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {p.dataUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            const cat = categoryKey || id.replace('doc-', '');
                            downloadDocumentWithStandardName(p, { studentId, nameKhmer: studentName }, cat, idx);
                          }}
                          className="p-1 rounded-md text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                          title={language === 'km' ? `ទាញយកឯកសារ (${p.name})` : `Download (${p.name})`}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemovePage(idx)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={language === 'km' ? 'លុបទំព័រនេះ' : 'Remove page'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Controls: Add more pages or Clear All */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
              {!isMaxReached ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>{language === 'km' ? `+ បន្ថែមទំព័រ (${pages.length}/${maxPages})` : `+ Add Page (${pages.length}/${maxPages})`}</span>
                </button>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{language === 'km' ? `គ្រប់ ${maxPages} ទំព័រហើយ` : `Max ${maxPages} pages reached`}</span>
                </span>
              )}

              <button
                type="button"
                onClick={onRemoveAll}
                className="text-[11px] text-slate-400 hover:text-rose-600 hover:underline transition-colors"
              >
                {language === 'km' ? 'សម្អាតទាំងអស់' : 'Clear all'}
              </button>
            </div>
          </div>
        ) : (
          /* Empty state - Click or Drag & Drop */
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-3.5 px-3 rounded-lg border border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/60 hover:bg-indigo-50/40 text-center transition-colors flex flex-col items-center justify-center gap-1"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <p className="text-[11px] font-semibold text-slate-700">
              {language === 'km' ? `ចុច ឬអូសទម្លាក់ឯកសារ (១ ដល់ ${maxPages} ទំព័រ)` : `Click or drop files (1 to ${maxPages} pages)`}
            </p>
            <span className="text-[10px] text-slate-400">
              {language === 'km' ? 'JPG, PNG, WEBP ឬ PDF (អតិបរមា 8MB)' : 'JPG, PNG, WEBP or PDF (Max 8MB)'}
            </span>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="text-[11px] text-rose-600 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};
