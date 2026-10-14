import { UploadedDocument, StudentDocuments } from '../types';

/**
 * Normalizes a document entry into an array of UploadedDocument pages.
 * Supports backward compatibility with single UploadedDocument objects.
 */
export function getDocPages(doc?: UploadedDocument | UploadedDocument[]): UploadedDocument[] {
  if (!doc) return [];
  if (Array.isArray(doc)) return doc.filter(Boolean);
  if (typeof doc === 'object' && (doc.name || doc.dataUrl)) {
    return [doc];
  }
  return [];
}

/**
 * Checks if at least one page has been uploaded for this document entry.
 */
export function hasDocUploaded(doc?: UploadedDocument | UploadedDocument[]): boolean {
  return getDocPages(doc).length > 0;
}

/**
 * Gets the first page of a document entry (e.g. for primary thumbnail).
 */
export function getFirstDocPage(doc?: UploadedDocument | UploadedDocument[]): UploadedDocument | undefined {
  const pages = getDocPages(doc);
  return pages.length > 0 ? pages[0] : undefined;
}

/**
 * Formats bytes to readable size string (KB, MB).
 */
export function formatDocSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const formatDocFileSize = formatDocSize;

/**
 * The 6 mandatory documents that MUST be uploaded before registration succeeds.
 */
export const REQUIRED_DOCUMENT_KEYS: {
  key: keyof StudentDocuments;
  labelKm: string;
  labelEn: string;
  labelZh: string;
}[] = [
  { key: 'idCard', labelKm: 'អត្តសញ្ញាបណ្ណ', labelEn: 'National ID Card', labelZh: '身分證' },
  { key: 'birthCert', labelKm: 'សំបុត្រកំណើត', labelEn: 'Birth Certificate', labelZh: '出生證明書' },
  { key: 'familyBook', labelKm: 'សៀវភៅគ្រួសារ', labelEn: 'Family Book', labelZh: '戶口名簿' },
  { key: 'residenceBook', labelKm: 'សៀវភៅស្នាក់នៅ', labelEn: 'Residence Book', labelZh: '居住證明簿' },
  {
    key: 'academicCert',
    labelKm: 'វិញ្ញាបនបត្រមធ្យមសិក្សា បឋមភូមិ (សំរាប់ថ្នាក់វិទ្យាល័យ) ឬ វិញ្ញាបនបត្រមធ្យមសិក្សា ទុតិយភូមិ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)',
    labelEn: 'Lower Secondary Certificate (For High School) or Upper Secondary Certificate (For College & University)',
    labelZh: '初中畢業證書 (高中部) 或 高中畢業證書 (大專與大學部)',
  },
  {
    key: 'traineeBook',
    labelKm: 'សៀវភៅសិក្ខាគារិក',
    labelEn: 'Trainee Record Book',
    labelZh: '學員紀錄手冊',
  },
];

/**
 * Validates that all 6 required documents are uploaded.
 */
export function areAllRequiredDocumentsUploaded(documents?: StudentDocuments): {
  isValid: boolean;
  missingDocs: { key: keyof StudentDocuments; labelKm: string; labelEn: string; labelZh: string }[];
  completedCount: number;
  totalRequired: number;
} {
  const missingDocs = REQUIRED_DOCUMENT_KEYS.filter(
    item => !documents || !hasDocUploaded(documents[item.key])
  );

  const completedCount = REQUIRED_DOCUMENT_KEYS.length - missingDocs.length;

  return {
    isValid: missingDocs.length === 0,
    missingDocs,
    completedCount,
    totalRequired: REQUIRED_DOCUMENT_KEYS.length,
  };
}

/**
 * Counts total categories uploaded (including traineeBook and passport).
 */
export function countUploadedCategories(documents?: StudentDocuments): number {
  if (!documents) return 0;
  const allKeys: (keyof StudentDocuments)[] = [
    'idCard',
    'birthCert',
    'familyBook',
    'residenceBook',
    'academicCert',
    'traineeBook',
    'passport',
  ];
  return allKeys.filter(k => hasDocUploaded(documents[k])).length;
}

/**
 * Counts total individual pages across all documents.
 */
export function countTotalPages(documents?: StudentDocuments): number {
  if (!documents) return 0;
  const allKeys: (keyof StudentDocuments)[] = [
    'idCard',
    'birthCert',
    'familyBook',
    'residenceBook',
    'academicCert',
    'traineeBook',
    'passport',
  ];
  return allKeys.reduce((acc, k) => acc + getDocPages(documents[k]).length, 0);
}
