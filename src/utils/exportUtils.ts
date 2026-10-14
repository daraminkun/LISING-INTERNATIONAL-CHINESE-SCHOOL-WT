import * as XLSX from 'xlsx';
import { Student, Language } from '../types';
import { areAllRequiredDocumentsUploaded } from './documentUtils';
import { calculateAge, formatDobOnly } from './ageUtils';
import { generateHighQualityPDF } from './pdfRenderUtils';

export interface ExportColumn {
  header: string;
  accessor: (student: Student) => string;
}

export function getExportColumns(language: Language = 'km'): ExportColumn[] {
  if (language === 'zh-TW') {
    return [
      { header: '編號 (No.)', accessor: s => s.studentId || '' },
      { header: '高棉姓名 (Name Khmer)', accessor: s => s.nameKhmer || s.name || '' },
      { header: '英文姓名 (Name Latin)', accessor: s => s.nameLatin || '' },
      { header: '中文姓名 (Name Chinese)', accessor: s => s.nameChinese || '' },
      { header: '性別 (Gender)', accessor: s => (s.gender === 'Male' ? '男 (Male)' : s.gender === 'Female' ? '女 (Female)' : '其他') },
      { header: '出生日期 (Student DOB)', accessor: s => formatDobOnly(s.dob) || '' },
      { header: '年齡 (Age)', accessor: s => (s.age ? `${s.age} 歲` : (calculateAge(s.dob) !== null ? `${calculateAge(s.dob)} 歲` : '')) },
      { header: '出生地 (Place of Birth)', accessor: s => s.placeOfBirth || '' },
      { header: '推薦人 / 介紹人 (Referrer)', accessor: s => s.referrerName || '' },
      { header: '身分證號 (ID Card)', accessor: s => s.idCardNumber || '' },
      { header: '護照號碼 (Passport)', accessor: s => s.passportNumber || '' },
      { header: '學生電話 (Student Phone)', accessor: s => s.phone || '' },
      { header: '電子郵件 (E-mail)', accessor: s => s.email || '' },
      { header: '現居地址 (Current Address)', accessor: s => s.currentAddress || '' },
      { header: '父親英文姓名 (Father Name EN)', accessor: s => s.fatherNameEnglish || '' },
      { header: '父親中文姓名 (Father Name CN)', accessor: s => s.fatherNameChinese || '' },
      { header: '父親出生日期 (Father DOB)', accessor: s => formatDobOnly(s.fatherDob) || '' },
      { header: '父親年齡 (Father Age)', accessor: s => (s.fatherAge ? `${s.fatherAge} 歲` : (calculateAge(s.fatherDob) !== null ? `${calculateAge(s.fatherDob)} 歲` : '')) },
      { header: '父親電話 (Father Phone)', accessor: s => s.fatherPhone || '' },
      { header: '母親英文姓名 (Mother Name EN)', accessor: s => s.motherNameEnglish || '' },
      { header: '母親中文姓名 (Mother Name CN)', accessor: s => s.motherNameChinese || '' },
      { header: '母親出生日期 (Mother DOB)', accessor: s => formatDobOnly(s.motherDob) || '' },
      { header: '母親年齡 (Mother Age)', accessor: s => (s.motherAge ? `${s.motherAge} 歲` : (calculateAge(s.motherDob) !== null ? `${calculateAge(s.motherDob)} 歲` : '')) },
      { header: '母親電話 (Mother Phone)', accessor: s => s.motherPhone || '' },
      { header: '柬埔寨原校 (School in Cambodia)', accessor: s => s.previousSchoolKhmer || '' },
      { header: '柬埔寨原校地址 (School Address in Cambodia)', accessor: s => s.previousSchoolAddressKhmer || '' },
      { header: '選讀學校 (Target School)', accessor: s => s.targetSchool || '' },
      { header: '選讀專業 (Major)', accessor: s => s.major || '' },
      { header: '必要附件數量 (Attached Docs)', accessor: s => {
        const val = areAllRequiredDocumentsUploaded(s.documents);
        return `${val.completedCount}/${val.totalRequired}`;
      }},
      { header: '備註 (Notes)', accessor: s => s.notes || '' },
      { header: '登記日期 (Created At)', accessor: s => (s.createdAt ? s.createdAt.split('T')[0] : '') },
    ];
  }

  if (language === 'en') {
    return [
      { header: 'No.', accessor: s => s.studentId || '' },
      { header: 'Khmer Name', accessor: s => s.nameKhmer || s.name || '' },
      { header: 'English Name', accessor: s => s.nameLatin || '' },
      { header: 'Chinese Name', accessor: s => s.nameChinese || '' },
      { header: 'Gender', accessor: s => s.gender || '' },
      { header: 'Date of Birth', accessor: s => formatDobOnly(s.dob) || '' },
      { header: 'Age', accessor: s => (s.age ? `${s.age} yrs` : (calculateAge(s.dob) !== null ? `${calculateAge(s.dob)} yrs` : '')) },
      { header: 'Place of Birth', accessor: s => s.placeOfBirth || '' },
      { header: 'Referrer Name', accessor: s => s.referrerName || '' },
      { header: 'National ID', accessor: s => s.idCardNumber || '' },
      { header: 'Passport No.', accessor: s => s.passportNumber || '' },
      { header: 'Student Phone', accessor: s => s.phone || '' },
      { header: 'E-mail', accessor: s => s.email || '' },
      { header: 'Current Address', accessor: s => s.currentAddress || '' },
      { header: "Father's Name (EN)", accessor: s => s.fatherNameEnglish || '' },
      { header: "Father's Name (CN)", accessor: s => s.fatherNameChinese || '' },
      { header: "Father's DOB", accessor: s => formatDobOnly(s.fatherDob) || '' },
      { header: "Father's Age", accessor: s => (s.fatherAge ? `${s.fatherAge} yrs` : (calculateAge(s.fatherDob) !== null ? `${calculateAge(s.fatherDob)} yrs` : '')) },
      { header: "Father's Phone", accessor: s => s.fatherPhone || '' },
      { header: "Mother's Name (EN)", accessor: s => s.motherNameEnglish || '' },
      { header: "Mother's Name (CN)", accessor: s => s.motherNameChinese || '' },
      { header: "Mother's DOB", accessor: s => formatDobOnly(s.motherDob) || '' },
      { header: "Mother's Age", accessor: s => (s.motherAge ? `${s.motherAge} yrs` : (calculateAge(s.motherDob) !== null ? `${calculateAge(s.motherDob)} yrs` : '')) },
      { header: "Mother's Phone", accessor: s => s.motherPhone || '' },
      { header: 'School in Cambodia', accessor: s => s.previousSchoolKhmer || '' },
      { header: 'School Address in Cambodia', accessor: s => s.previousSchoolAddressKhmer || '' },
      { header: 'Target School', accessor: s => s.targetSchool || '' },
      { header: 'Major', accessor: s => s.major || '' },
      { header: 'Required Docs (*)', accessor: s => {
        const val = areAllRequiredDocumentsUploaded(s.documents);
        return `${val.completedCount}/${val.totalRequired}`;
      }},
      { header: 'Notes', accessor: s => s.notes || '' },
      { header: 'Created Date', accessor: s => (s.createdAt ? s.createdAt.split('T')[0] : '') },
    ];
  }

  // Default Khmer headers
  return [
    { header: 'លេខរៀង (No.)', accessor: s => s.studentId || '' },
    { header: 'ឈ្មោះខ្មែរ (Name Khmer)', accessor: s => s.nameKhmer || s.name || '' },
    { header: 'ឈ្មោះអង់គ្លេស (Name Latin)', accessor: s => s.nameLatin || '' },
    { header: 'ឈ្មោះចិន (Name Chinese)', accessor: s => s.nameChinese || '' },
    { header: 'ភេទ (Gender)', accessor: s => (s.gender === 'Male' ? 'ប្រុស' : s.gender === 'Female' ? 'ស្រី' : 'ផ្សេងៗ') },
    { header: 'ថ្ងៃកំណើតសិស្ស (Student DOB)', accessor: s => formatDobOnly(s.dob) || '' },
    { header: 'អាយុ (Age)', accessor: s => (s.age ? `${s.age} ឆ្នាំ` : (calculateAge(s.dob) !== null ? `${calculateAge(s.dob)} ឆ្នាំ` : '')) },
    { header: 'ទីកន្លែងកំណើត (Place of Birth)', accessor: s => s.placeOfBirth || '' },
    { header: 'ឈ្មោះអ្នកណែនាំ (Referrer Name)', accessor: s => s.referrerName || '' },
    { header: 'អត្តសញ្ញាបណ្ណ (ID Card)', accessor: s => s.idCardNumber || '' },
    { header: 'លិខិតឆ្លងដែន (Passport)', accessor: s => s.passportNumber || '' },
    { header: 'ទូរស័ព្ទសិស្ស (Student Phone)', accessor: s => s.phone || '' },
    { header: 'អ៊ីមែល (E-mail)', accessor: s => s.email || '' },
    { header: 'អាសយដ្ឋានបច្ចុប្បន្ន (Current Address)', accessor: s => s.currentAddress || '' },
    { header: 'ឈ្មោះឪពុកអង់គ្លេស (Father Name EN)', accessor: s => s.fatherNameEnglish || '' },
    { header: 'ឈ្មោះឪពុកចិន (Father Name CN)', accessor: s => s.fatherNameChinese || '' },
    { header: 'ថ្ងៃកំណើតឪពុក (Father DOB)', accessor: s => formatDobOnly(s.fatherDob) || '' },
    { header: 'អាយុឪពុក (Father Age)', accessor: s => (s.fatherAge ? `${s.fatherAge} ឆ្នាំ` : (calculateAge(s.fatherDob) !== null ? `${calculateAge(s.fatherDob)} ឆ្នាំ` : '')) },
    { header: 'ទូរស័ព្ទឪពុក (Father Phone)', accessor: s => s.fatherPhone || '' },
    { header: 'ឈ្មោះម្ដាយអង់គ្លេស (Mother Name EN)', accessor: s => s.motherNameEnglish || '' },
    { header: 'ឈ្មោះម្ដាយចិន (Mother Name CN)', accessor: s => s.motherNameChinese || '' },
    { header: 'ថ្ងៃកំណើតម្ដាយ (Mother DOB)', accessor: s => formatDobOnly(s.motherDob) || '' },
    { header: 'អាយុម្ដាយ (Mother Age)', accessor: s => (s.motherAge ? `${s.motherAge} ឆ្នាំ` : (calculateAge(s.motherDob) !== null ? `${calculateAge(s.motherDob)} ឆ្នាំ` : '')) },
    { header: 'ទូរស័ព្ទម្ដាយ (Mother Phone)', accessor: s => s.motherPhone || '' },
    { header: 'សាលានៅខ្មែរ (School in Cambodia)', accessor: s => s.previousSchoolKhmer || '' },
    { header: 'អាសយដ្ឋានសាលានៅខ្មែរ (School Address in Cambodia)', accessor: s => s.previousSchoolAddressKhmer || '' },
    { header: 'សាលាដែលជ្រើសរើស (Target School)', accessor: s => s.targetSchool || '' },
    { header: 'ជំនាញដែលជ្រើសរើស (Major)', accessor: s => s.major || '' },
    { header: 'ចំនួនឯកសារភ្ជាប់ (Attached Docs)', accessor: s => {
      const val = areAllRequiredDocumentsUploaded(s.documents);
      return `${val.completedCount}/${val.totalRequired}`;
    }},
    { header: 'កំណត់សម្គាល់ (Notes)', accessor: s => s.notes || '' },
    { header: 'កាលបរិច្ឆេទចុះឈ្មោះ (Created At)', accessor: s => (s.createdAt ? s.createdAt.split('T')[0] : '') },
  ];
}

/**
 * Export data to Microsoft Excel (.xlsx) file
 */
export function exportToExcel(
  students: Student[], 
  filenamePrefix: string = 'Students_Data', 
  language: Language = 'km'
): void {
  if (students.length === 0) return;

  const columns = getExportColumns(language);
  const headers = columns.map(c => c.header);
  const rows = students.map(s => columns.map(c => c.accessor(s)));

  // Combine into worksheet data
  const data = [headers, ...rows];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths based on longest content
  const colWidths = headers.map((h, i) => {
    let maxLen = h.length;
    for (let r = 0; r < Math.min(rows.length, 50); r++) {
      const cell = String(rows[r][i] || '');
      if (cell.length > maxLen) maxLen = cell.length;
    }
    return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  const sheetTitle = language === 'zh-TW' ? '學生名單' : language === 'en' ? 'Students' : 'បញ្ជីសិស្ស';
  XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `${filenamePrefix}_${dateStr}.xlsx`);
}

/**
 * Export data to Adobe PDF (.pdf) file
 */
export async function exportToPDF(
  students: Student[], 
  title: string = 'Student Registration Report', 
  filenamePrefix: string = 'Students_Report', 
  language: Language = 'km',
  onProgress?: (status: string) => void
): Promise<void> {
  if (students.length === 0) return;

  const pageTitle = language === 'zh-TW' 
    ? (title.includes('Report') ? '學生註冊名單與報表' : title)
    : language === 'en'
    ? title
    : (title || 'តារាងរបាយការណ៍សិស្ស (Student Registration Report)');

  await generateHighQualityPDF(students, pageTitle, filenamePrefix, language, onProgress);
}
