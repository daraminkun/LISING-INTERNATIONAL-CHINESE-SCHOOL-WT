export type Gender = 'Male' | 'Female' | 'Other';

export interface UploadedDocument {
  name: string;
  size?: number; // size in bytes
  type?: string; // MIME type or extension
  dataUrl?: string; // Base64 data URL
  uploadedAt?: string;
  pageNumber?: number; // Optional page index (1 to 5)
}

export type DocumentPages = UploadedDocument[];

export interface StudentDocuments {
  idCard?: UploadedDocument | UploadedDocument[];         // អត្តសញ្ញាបណ្ណ * (១ ដល់ ៥ ទំព័រ)
  birthCert?: UploadedDocument | UploadedDocument[];      // សំបុត្រកំណើត * (១ ដល់ ៥ ទំព័រ)
  familyBook?: UploadedDocument | UploadedDocument[];     // សៀវភៅគ្រួសារ * (១ ដល់ ៥ ទំព័រ)
  residenceBook?: UploadedDocument | UploadedDocument[];  // សៀវភៅស្នាក់នៅ * (១ ដល់ ៥ ទំព័រ)
  academicCert?: UploadedDocument | UploadedDocument[];   // វិញ្ញាបនបត្រមធ្យមសិក្សា បឋមភូមិ ឬ វិញ្ញាបនបត្រមធ្យមសិក្សា ទុតិយភូមិ * (១ ដល់ ៥ ទំព័រ)
  traineeBook?: UploadedDocument | UploadedDocument[];    // សៀវភៅសិក្ខាគារិក (១ ដល់ ៥ ទំព័រ)
  passport?: UploadedDocument | UploadedDocument[];       // លិខិតឆ្លងដែន (១ ដល់ ៥ ទំព័រ)
}

export type DocumentKey = keyof StudentDocuments;

export interface Student {
  studentId: string;           // លេខរៀង (No. / Order Number)
  nameKhmer: string;           // ឈ្មោះខ្មែរ
  nameLatin: string;           // ឈ្មោះអង់គ្លេស
  nameChinese?: string;        // ឈ្មោះសិស្ស(ភាសាចិន)
  gender: Gender;              // ភេទ
  dob?: string;                // ថ្ងៃខែឆ្នាំកំណើត(សាមីខ្លួន)
  age?: string | number;       // អាយុ (សាមីខ្លួន)
  placeOfBirth?: string;       // ទីកន្លែងកំណើត
  referrerName?: string;       // ឈ្មោះអ្នកណែនាំ
  idCardNumber?: string;       // លេខអត្តសញ្ញាបណ្ណ
  passportNumber?: string;     // លេខលិខិតឆ្លងដែន
  
  // Father details (បំបែកព័ត៌មានឪពុក)
  fatherNameEnglish?: string;  // ឈ្មោះឪពុក (ភាសាអង់គ្លេស)
  fatherNameChinese?: string;  // ឈ្មោះឪពុក (ភាសាចិន)
  fatherDob?: string;          // ថ្ងៃខែឆ្នាំកំណើតឪពុក
  fatherAge?: string | number; // អាយុឪពុក
  fatherPhone?: string;        // លេខទូរស័ព្ទឪពុក

  // Mother details (បំបែកព័ត៌មានម្ដាយ)
  motherNameEnglish?: string;  // ឈ្មោះម្ដាយ (ភាសាអង់គ្លេស)
  motherNameChinese?: string;  // ឈ្មោះម្ដាយ (ភាសាចិន)
  motherDob?: string;          // ថ្ងៃខែឆ្នាំកំណើតម្ដាយ
  motherAge?: string | number; // អាយុម្ដាយ
  motherPhone?: string;        // លេខទូរស័ព្ទម្ដាយ

  previousSchoolKhmer?: string;       // ឈ្មោះសាលារៀន(នៅខ្មែរ) *
  previousSchoolAddressKhmer?: string;// អាសយ័ដ្ឋានសាលារៀន (នៅខ្មែរ) *
  targetSchool?: string;              // ឈ្មោះសាលារៀនដែលជ្រើសរើសសិក្សា
  major?: string;              // ជំនាញដែលជ្រើសរើសសិក្សា
  currentAddress?: string;     // អាស័យដ្ឋានបច្ចុប្បន្ន
  phone: string;               // លេខទូរស័ព្ទសិស្ស
  email?: string;              // E-mail សិស្ស
  
  // Uploaded Documents (ឯកសារ upload ទាំង ៥)
  documents?: StudentDocuments;

  notes?: string;              // កំណត់សម្គាល់
  createdAt?: string;          // កាលបរិច្ឆេទបង្កើត
  name?: string;               // Backward compatibility
  classId?: string;            // Backward compatibility
  parentNameEnglish?: string;  // Backward compatibility
  parentNameChinese?: string;  // Backward compatibility
  parentDob?: string;          // Backward compatibility
}

export type TabType = 'dashboard' | 'students' | 'reports' | 'users';

export type UserRole = 'Admin' | 'User';

export interface UserAccount {
  id: string;
  adminName: string;
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export type Language = 'km' | 'en' | 'zh-TW';

export interface FilterState {
  search: string;
  gender: string;
  major?: string;
  targetSchool?: string;
}

export interface ReportFilterState {
  search: string;
  gender: string;
  major?: string;
  targetSchool?: string;
  hasDocuments?: 'all' | 'yes' | 'no';
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
  startDate?: string;
  endDate?: string;
  hasNotes?: 'all' | 'yes' | 'no';
}

export type SortField = 
  | 'studentId' 
  | 'nameKhmer' 
  | 'nameLatin' 
  | 'nameChinese' 
  | 'gender' 
  | 'dob' 
  | 'phone' 
  | 'targetSchool' 
  | 'major' 
  | 'createdAt';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}

export interface AppScriptConfig {
  webAppUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}

export type ConnectionStatus = 'disconnected' | 'connected' | 'syncing' | 'error';
