import { Student } from '../types';

// Sample clean SVG data URLs for instant preview testing
const sampleIdCardSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" rx="12" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><rect x="20" y="20" width="80" height="100" rx="8" fill="%23e2e8f0"/><circle cx="60" cy="55" r="22" fill="%2394a3b8"/><path d="M35 110 C35 85 85 85 85 110" fill="%2394a3b8"/><text x="120" y="50" font-family="sans-serif" font-size="14" font-weight="bold" fill="%231e293b">KINGDOM OF CAMBODIA</text><text x="120" y="70" font-family="sans-serif" font-size="12" fill="%2364748b">NATIONAL ID CARD</text><rect x="120" y="90" width="240" height="8" rx="4" fill="%23cbd5e1"/><rect x="120" y="110" width="180" height="8" rx="4" fill="%23e2e8f0"/><rect x="120" y="130" width="210" height="8" rx="4" fill="%23e2e8f0"/><rect x="20" y="170" width="360" height="60" rx="6" fill="%23f1f5f9" stroke="%23e2e8f0"/><text x="35" y="205" font-family="monospace" font-size="14" fill="%23334155">ID: 020456789 | EXP: 2030</text></svg>`;

const samplePassportSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="260" viewBox="0 0 400 260"><rect width="400" height="260" rx="12" fill="%231e1b4b"/><rect x="15" y="15" width="370" height="230" rx="8" fill="%23312e81" stroke="%23d4af37" stroke-width="1.5"/><circle cx="200" cy="90" r="45" fill="none" stroke="%23d4af37" stroke-width="2"/><text x="200" y="95" font-family="serif" font-size="13" font-weight="bold" fill="%23d4af37" text-anchor="middle">PASSPORT</text><text x="200" y="165" font-family="sans-serif" font-size="15" font-weight="bold" fill="%23f8fafc" text-anchor="middle">KINGDOM OF CAMBODIA</text><text x="200" y="190" font-family="sans-serif" font-size="11" fill="%23cbd5e1" text-anchor="middle">PASSEPORT / PASSPORT</text><text x="200" y="225" font-family="monospace" font-size="13" fill="%23fbbf24" text-anchor="middle">N01234567</text></svg>`;

export const INITIAL_STUDENTS: Student[] = [
  {
    studentId: '1',
    nameKhmer: 'សុខ ពិសិដ្ឋ',
    nameLatin: 'Sok Piseth',
    nameChinese: '苏比瑟',
    gender: 'Male',
    dob: '2004-05-12',
    placeOfBirth: 'ខេត្តបាត់ដំបង (Battambang)',
    idCardNumber: '020456789',
    passportNumber: 'N01234567',
    
    // Father
    fatherNameEnglish: 'Sok Vichea',
    fatherNameChinese: '苏维查',
    fatherDob: '1975-03-20',
    fatherPhone: '012 334 455',

    // Mother
    motherNameEnglish: 'Chhay Lin',
    motherNameChinese: '蔡琳',
    motherDob: '1978-08-14',
    motherPhone: '092 667 788',

    previousSchoolKhmer: 'វិទ្យាល័យ នេត យ៉ង់ (Net Yang High School)',
    targetSchool: 'Tsinghua University',
    major: 'Computer Science & AI',
    currentAddress: 'សង្កាត់ទួលទំពូង១ ខណ្ឌចំការមន រាជធានីភ្នំពេញ',
    phone: '012 889 900',
    createdAt: '2026-09-15T08:30:00.000Z',
    notes: 'Awarded Full Scholarship candidate for AI track',
    name: 'សុខ ពិសិដ្ឋ (Sok Piseth)',
    documents: {
      idCard: {
        name: 'National_ID_Sok_Piseth.png',
        size: 145000,
        type: 'image/png',
        dataUrl: sampleIdCardSvg,
        uploadedAt: '2026-09-15T08:35:00.000Z',
      },
      passport: {
        name: 'Passport_Sok_Piseth.png',
        size: 210000,
        type: 'image/png',
        dataUrl: samplePassportSvg,
        uploadedAt: '2026-09-15T08:36:00.000Z',
      },
      birthCert: {
        name: 'Birth_Certificate_Piseth.pdf',
        size: 320000,
        type: 'application/pdf',
        uploadedAt: '2026-09-15T08:38:00.000Z',
      },
    },
  },
  {
    studentId: '2',
    nameKhmer: 'មាស បុប្ផា',
    nameLatin: 'Meas Bopha',
    nameChinese: '梅波帕',
    gender: 'Female',
    dob: '2005-08-24',
    placeOfBirth: 'ខេត្តសៀមរាប (Siem Reap)',
    idCardNumber: '030876543',
    passportNumber: 'N01987654',

    // Father
    fatherNameEnglish: 'Meas Sambath',
    fatherNameChinese: '梅桑巴',
    fatherDob: '1976-05-10',
    fatherPhone: '011 223 344',

    // Mother
    motherNameEnglish: 'Kem Sreyneang',
    motherNameChinese: '琴斯雷娘',
    motherDob: '1979-11-15',
    motherPhone: '088 554 433',

    previousSchoolKhmer: 'វិទ្យាល័យ អង្គរ (Angkor High School)',
    targetSchool: 'Peking University',
    major: 'International Business & Trade',
    currentAddress: 'សង្កាត់បឹងកក់២ ខណ្ឌទួលគោក រាជធានីភ្នំពេញ',
    phone: '098 776 655',
    createdAt: '2026-09-15T09:15:00.000Z',
    notes: 'Class Representative & HSK 5 Certificate',
    name: 'មាស បុប្ផា (Meas Bopha)',
    documents: {
      idCard: {
        name: 'ID_Card_Meas_Bopha.png',
        size: 152000,
        type: 'image/png',
        dataUrl: sampleIdCardSvg,
        uploadedAt: '2026-09-15T09:20:00.000Z',
      },
      passport: {
        name: 'Passport_Meas_Bopha.png',
        size: 205000,
        type: 'image/png',
        dataUrl: samplePassportSvg,
        uploadedAt: '2026-09-15T09:22:00.000Z',
      },
      familyBook: {
        name: 'Family_Book_Meas.pdf',
        size: 480000,
        type: 'application/pdf',
        uploadedAt: '2026-09-15T09:25:00.000Z',
      },
      residenceBook: {
        name: 'Residence_Stay_Book_Meas.pdf',
        size: 390000,
        type: 'application/pdf',
        uploadedAt: '2026-09-15T09:26:00.000Z',
      },
    },
  },
  {
    studentId: '3',
    nameKhmer: 'ចាន់ រតនា',
    nameLatin: 'Chan Rathana',
    nameChinese: '陈拉塔纳',
    gender: 'Male',
    dob: '2004-12-05',
    placeOfBirth: 'ខេត្តកំពង់ចាម (Kampong Cham)',
    idCardNumber: '040332211',
    passportNumber: 'N02345678',

    // Father
    fatherNameEnglish: 'Chan Bunna',
    fatherNameChinese: '陈文纳',
    fatherDob: '1972-02-14',
    fatherPhone: '097 889 911',

    // Mother
    motherNameEnglish: 'Ly Chanthy',
    motherNameChinese: '李占蒂',
    motherDob: '1974-07-08',
    motherPhone: '096 443 322',

    previousSchoolKhmer: 'វិទ្យាល័យ ព្រះសីហនុ (Preah Sihanouk High School)',
    targetSchool: 'Zhejiang University',
    major: 'Software Engineering',
    currentAddress: 'សង្កាត់ចោមចៅ ខណ្ឌពោធិ៍សែនជ័យ រាជធានីភ្នំពេញ',
    phone: '077 456 123',
    createdAt: '2026-09-16T10:00:00.000Z',
    notes: 'Advanced English Level B2 & Python Developer',
    name: 'ចាន់ រតនា (Chan Rathana)',
    documents: {
      idCard: {
        name: 'NationalID_Chan_Rathana.png',
        size: 160000,
        type: 'image/png',
        dataUrl: sampleIdCardSvg,
        uploadedAt: '2026-09-16T10:05:00.000Z',
      },
    },
  },
  {
    studentId: '4',
    nameKhmer: 'កែវ ធីតា',
    nameLatin: 'Keo Thida',
    nameChinese: '高蒂达',
    gender: 'Female',
    dob: '2005-02-18',
    placeOfBirth: 'រាជធានីភ្នំពេញ (Phnom Penh)',
    idCardNumber: '010112233',
    passportNumber: 'N03456789',

    // Father
    fatherNameEnglish: 'Keo Sophal',
    fatherNameChinese: '高索法',
    fatherDob: '1973-10-12',
    fatherPhone: '017 334 556',

    // Mother
    motherNameEnglish: 'Noun Mary',
    motherNameChinese: '农玛莉',
    motherDob: '1976-09-14',
    motherPhone: '015 667 889',

    previousSchoolKhmer: 'វិទ្យាល័យ បាក់ទូក (Bak Touk High School)',
    targetSchool: 'Fudan University',
    major: 'Data Science & Big Data',
    currentAddress: 'សង្កាត់វាលវង់ ខណ្ឌ៧មករា រាជធានីភ្នំពេញ',
    phone: '016 332 211',
    createdAt: '2026-09-16T11:20:00.000Z',
    notes: 'Debate Club Champion, IELTS 7.0',
    name: 'កែវ ធីតា (Keo Thida)',
    documents: {
      passport: {
        name: 'Passport_Keo_Thida.png',
        size: 215000,
        type: 'image/png',
        dataUrl: samplePassportSvg,
        uploadedAt: '2026-09-16T11:25:00.000Z',
      },
      birthCert: {
        name: 'Birth_Certificate_Keo_Thida.pdf',
        size: 340000,
        type: 'application/pdf',
        uploadedAt: '2026-09-16T11:28:00.000Z',
      },
    },
  },
  {
    studentId: '5',
    nameKhmer: 'សេង វិបុល',
    nameLatin: 'Seng Vibol',
    nameChinese: '成威宝',
    gender: 'Male',
    dob: '2003-09-30',
    placeOfBirth: 'ខេត្តកណ្តាល (Kandal)',
    idCardNumber: '050778899',
    passportNumber: 'N04567890',

    // Father
    fatherNameEnglish: 'Seng Kimsan',
    fatherNameChinese: '成金森',
    fatherDob: '1969-12-05',
    fatherPhone: '012 998 877',

    // Mother
    motherNameEnglish: 'Ros Sokha',
    motherNameChinese: '罗索卡',
    motherDob: '1971-01-25',
    motherPhone: '093 112 233',

    previousSchoolKhmer: 'វិទ្យាល័យ ហ៊ុន សែន តាខ្មៅ (Ta Khmau High School)',
    targetSchool: 'Shanghai Jiao Tong University',
    major: 'Mechanical & Robotics Engineering',
    currentAddress: 'ក្រុងតាខ្មៅ ខេត្តកណ្តាល',
    phone: '089 998 877',
    createdAt: '2026-09-17T08:45:00.000Z',
    notes: 'Gold Medal in National Math Olympiad',
    name: 'សេង វិបុល (Seng Vibol)',
  },
  {
    studentId: '6',
    nameKhmer: 'លី ស្រីមុំ',
    nameLatin: 'Ly Sreymom',
    nameChinese: '李斯雷蒙',
    gender: 'Female',
    dob: '2004-07-14',
    placeOfBirth: 'ខេត្តកំពត (Kampot)',
    idCardNumber: '060223344',
    passportNumber: 'N05678901',

    // Father
    fatherNameEnglish: 'Ly Bunheng',
    fatherNameChinese: '李文亨',
    fatherDob: '1975-06-18',
    fatherPhone: '097 556 677',

    // Mother
    motherNameEnglish: 'Sim Navy',
    motherNameChinese: '沈娜维',
    motherDob: '1978-04-22',
    motherPhone: '070 334 455',

    previousSchoolKhmer: 'វិទ្យាល័យ ព្រះរាជសម្ភារ (Kampot)',
    targetSchool: 'Wuhan University',
    major: 'Civil & Architectural Engineering',
    currentAddress: 'សង្កាត់ទួលសង្កែ ខណ្ឌឫស្សីកែវ រាជធានីភ្នំពេញ',
    phone: '070 123 456',
    createdAt: '2026-09-17T09:30:00.000Z',
    notes: 'Awarded Architecture Project of the Year 2025',
    name: 'លី ស្រីមុំ (Ly Sreymom)',
  },
  {
    studentId: '7',
    nameKhmer: 'អ៊ុំ វ៉ាន់ដា',
    nameLatin: 'Oum Vanda',
    nameChinese: '翁万达',
    gender: 'Male',
    dob: '2004-11-03',
    placeOfBirth: 'ខេត្តព្រៃវែង (Prey Veng)',
    idCardNumber: '070334455',
    passportNumber: 'N06789012',

    // Father
    fatherNameEnglish: 'Oum Pisey',
    fatherNameChinese: '翁比塞',
    fatherDob: '1974-09-12',
    fatherPhone: '092 112 334',

    // Mother
    motherNameEnglish: 'Kao Mom',
    motherNameChinese: '高蒙',
    motherDob: '1977-03-30',
    motherPhone: '087 665 443',

    previousSchoolKhmer: 'វិទ្យាល័យ ហ៊ុន សែន កំពង់លាវ (Prey Veng)',
    targetSchool: 'Nanjing University',
    major: 'Applied Physics & Nanotechnology',
    currentAddress: 'សង្កាត់ទឹកថ្លា ខណ្ឌសែនសុខ រាជធានីភ្នំពេញ',
    phone: '085 456 789',
    createdAt: '2026-09-18T10:15:00.000Z',
    notes: 'Physics Olympiad top 5 national contestant',
    name: 'អ៊ុំ វ៉ាន់ដា (Oum Vanda)',
  },
  {
    studentId: '8',
    nameKhmer: 'ឃឹម ស្រីនិច',
    nameLatin: 'Khim Sreynich',
    nameChinese: '琴斯雷尼奇',
    gender: 'Female',
    dob: '2005-04-20',
    placeOfBirth: 'ខេត្តតាកែវ (Takeo)',
    idCardNumber: '080445566',
    passportNumber: 'N07890123',

    // Father
    fatherNameEnglish: 'Khim Saroeun',
    fatherNameChinese: '琴萨伦',
    fatherDob: '1972-11-20',
    fatherPhone: '010 445 566',

    // Mother
    motherNameEnglish: 'Men Sophany',
    motherNameChinese: '门索潘妮',
    motherDob: '1975-08-15',
    motherPhone: '098 332 211',

    previousSchoolKhmer: 'វិទ្យាល័យ ១មករា តាកែវ (1 January High School)',
    targetSchool: 'Harbin Institute of Technology',
    major: 'Aerospace & Aeronautical Engineering',
    currentAddress: 'សង្កាត់ទួលសង្កែ២ ខណ្ឌឫស្សីកែវ រាជធានីភ្នំពេញ',
    phone: '093 321 654',
    createdAt: '2026-09-18T14:40:00.000Z',
    notes: 'Robotics team flight controller lead designer',
    name: 'ឃឹម ស្រីនិច (Khim Sreynich)',
  }
];
