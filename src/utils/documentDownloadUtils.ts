/**
 * Document Download and Naming Utilities
 * Formats standardized, student-branded filenames for all document uploads and downloads.
 * Prevents file mix-ups when multiple students register simultaneously.
 */

import { Student, UploadedDocument, StudentDocuments } from '../types';
import { getDocPages } from './documentUtils';
import { formatDobOnly } from './ageUtils';

export const CATEGORY_NAMES: Record<string, { km: string; en: string; short: string }> = {
  idCard: { km: 'អត្តសញ្ញាបណ្ណ', en: 'National_ID_Card', short: 'ID_Card' },
  birthCert: { km: 'សំបុត្រកំណើត', en: 'Birth_Certificate', short: 'Birth_Cert' },
  familyBook: { km: 'សៀវភៅគ្រួសារ', en: 'Family_Book', short: 'Family_Book' },
  residenceBook: { km: 'សៀវភៅស្នាក់នៅ', en: 'Residence_Book', short: 'Residence_Book' },
  academicCert: { km: 'វិញ្ញាបនបត្រមធ្យមសិក្សា', en: 'Academic_Certificate', short: 'Academic_Cert' },
  traineeBook: { km: 'សៀវភៅសិក្ខាគារិក', en: 'Trainee_Record_Book', short: 'Trainee_Book' },
  passport: { km: 'លិខិតឆ្លងដែន', en: 'Passport', short: 'Passport' },
};

/**
 * Clean student name for safe cross-platform file naming
 */
export function getSafeStudentName(student?: Partial<Student>): string {
  if (!student) return 'Student';
  const raw = student.nameLatin || student.nameKhmer || student.name || 'Student';
  return raw
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_');
}

/**
 * Generates an unmistakable, standardized filename for a student's document:
 * e.g. [No.1]_Meas_Piseth_National_ID_Card_p1.jpg
 */
export function generateStandardDocFilename(
  student: Partial<Student> | undefined,
  categoryKey: string,
  pageIndex: number = 0,
  originalFilename?: string,
  docType?: string
): string {
  const idStr = student?.studentId ? `[No.${student.studentId}]` : '[No.New]';
  const nameStr = getSafeStudentName(student);
  const cat = CATEGORY_NAMES[categoryKey]?.short || categoryKey;
  const pageStr = `p${pageIndex + 1}`;

  let ext = '.jpg';
  if (originalFilename && originalFilename.includes('.')) {
    ext = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
  } else if (docType) {
    if (docType.includes('pdf')) ext = '.pdf';
    else if (docType.includes('png')) ext = '.png';
    else if (docType.includes('webp')) ext = '.webp';
    else if (docType.includes('jpeg') || docType.includes('jpg')) ext = '.jpg';
  }

  return `${idStr}_${nameStr}_${cat}_${pageStr}${ext}`;
}

/**
 * Downloads a single document page with the official student-branded filename
 */
export function downloadDocumentWithStandardName(
  doc: UploadedDocument,
  student: Partial<Student> | undefined,
  categoryKey: string,
  pageIndex: number = 0
): void {
  if (!doc.dataUrl) return;

  const fileName = generateStandardDocFilename(
    student,
    categoryKey,
    pageIndex,
    doc.name,
    doc.type
  );

  const a = document.createElement('a');
  a.href = doc.dataUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Downloads all uploaded documents for a student in one organized batch,
 * along with a student profile summary manifest.
 */
export async function downloadAllDocumentsForStudent(student: Student): Promise<{ count: number }> {
  const docs = student.documents || {};
  const categories: (keyof StudentDocuments)[] = [
    'idCard',
    'birthCert',
    'familyBook',
    'residenceBook',
    'academicCert',
    'traineeBook',
    'passport',
  ];

  let downloadedCount = 0;
  const manifestLines: string[] = [
    '========================================================================',
    ` ព័ត៌មានឯកសារសិស្ស (STUDENT DOCUMENTS RECORD)`,
    '========================================================================',
    `លេខរៀង (No.): #${student.studentId || '-'}`,
    `ឈ្មោះខ្មែរ (Khmer): ${student.nameKhmer || '-'}`,
    `ឈ្មោះអង់គ្លេស (Latin): ${student.nameLatin || '-'}`,
    `ឈ្មោះចិន (Chinese): ${student.nameChinese || '-'}`,
    `ភេទ (Gender): ${student.gender || '-'}`,
    `ថ្ងៃកំណើត (DOB): ${formatDobOnly(student.dob) || '-'} (អាយុ: ${student.age || '-'})`,
    `ឈ្មោះអ្នកណែនាំ (Referrer): ${student.referrerName || '-'}`,
    `លេខទូរស័ព្ទ (Phone): ${student.phone || '-'}`,
    `អ៊ីមែល (Email): ${student.email || '-'}`,
    `អត្តសញ្ញាបណ្ណ (ID Card): ${student.idCardNumber || '-'}`,
    `លិខិតឆ្លងដែន (Passport): ${student.passportNumber || '-'}`,
    `សាលារៀនដែលជ្រើសរើស (Target School): ${student.targetSchool || '-'}`,
    `ជំនាញដែលជ្រើសរើស (Major): ${student.major || '-'}`,
    `សាលារៀននៅខ្មែរ (School in KH): ${student.previousSchoolKhmer || '-'}`,
    `អាសយដ្ឋានសាលានៅខ្មែរ (School Address in KH): ${student.previousSchoolAddressKhmer || '-'}`,
    `អាសយដ្ឋាន (Address): ${student.currentAddress || '-'}`,
    '------------------------------------------------------------------------',
    `ព័ត៌មានឪពុក: ${student.fatherNameEnglish || '-'} (${student.fatherPhone || '-'})`,
    `ព័ត៌មានម្ដាយ: ${student.motherNameEnglish || '-'} (${student.motherPhone || '-'})`,
    '========================================================================',
    'បញ្ជីឯកសារភ្ជាប់ (ATTACHED FILES LIST):',
  ];

  for (const cat of categories) {
    const pages = getDocPages(docs[cat]);
    const catLabel = CATEGORY_NAMES[cat]?.km || cat;

    if (pages.length > 0) {
      manifestLines.push(`\n[+] ${catLabel} (${pages.length} ទំព័រ):`);
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const stdName = generateStandardDocFilename(student, cat, i, page.name, page.type);
        manifestLines.push(`    - ទំព័រ ${i + 1}: ${stdName} (${Math.round((page.size || 0) / 1024)} KB)`);

        if (page.dataUrl) {
          // Trigger download with a slight delay between items so the browser doesn't block them
          await new Promise(r => setTimeout(r, 180));
          const link = document.createElement('a');
          link.href = page.dataUrl;
          link.download = stdName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloadedCount++;
        }
      }
    } else {
      manifestLines.push(`[-] ${catLabel}: មិនទាន់ Upload`);
    }
  }

  manifestLines.push('\n========================================================================');
  manifestLines.push(`កាលបរិច្ឆេទបង្កើតឯកសារ: ${new Date().toLocaleString('km-KH')}`);
  manifestLines.push('ប្រព័ន្ធគ្រប់គ្រងសិស្ស Student Management System (SMS)');
  manifestLines.push('========================================================================');

  // Also download the text manifest file
  await new Promise(r => setTimeout(r, 200));
  const blob = new Blob(['\uFEFF' + manifestLines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const manifestUrl = URL.createObjectURL(blob);
  const manifestLink = document.createElement('a');
  manifestLink.href = manifestUrl;
  manifestLink.download = `[No.${student.studentId || 'X'}]_${getSafeStudentName(student)}_INFO_MANIFEST.txt`;
  document.body.appendChild(manifestLink);
  manifestLink.click();
  document.body.removeChild(manifestLink);
  URL.revokeObjectURL(manifestUrl);

  return { count: downloadedCount };
}
