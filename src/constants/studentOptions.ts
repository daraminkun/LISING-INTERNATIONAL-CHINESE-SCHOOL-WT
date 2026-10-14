export const PLACES_OF_BIRTH: string[] = [
  "PHNOM PENH",
  "KANDAL",
  "BATTAMBANG",
  "SIEMREAP",
  "SIHANOUKVILLE",
  "KOMPOT",
  "KOMPONG CHAM",
  "KOMPONG CHHANG",
  "KOMPONG SPEU",
  "KOMPONG THOM",
  "PREY VENG",
  "SVAY RIENG",
  "TAKEO",
  "BANTEAY MEANCHEY",
  "KOH KONG",
  "KRATIE",
  "MONDUL KIRI",
  "ODDAR MEANCHEY",
  "PREAH VIHEAR",
  "PURSAT",
  "RATTANAK KIRI",
  "STUNG TRENG",
  "KRONG KEP",
  "KRONG PAILIN"
];

export interface SchoolMajorEntry {
  school: string;
  majors: string[];
  ageRequirementKm: string;
  ageRequirementEn: string;
  shortAgeKm: string;
  shortAgeEn: string;
}

/**
 * Official mapping of Target Schools to their respective Majors and Age Requirements
 */
export const SCHOOL_MAJORS_DATA: SchoolMajorEntry[] = [
  {
    school: "高雄市私立 中山高級工商職業學校",
    majors: ["資訊科", "電子科", "汽車科", "商業經營科", "烘焙食品科", "美容科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺南市私立 六信高級中學",
    majors: ["資訊科", "烘焙食品科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "桃園市私立 世紀綠能工商高級中等學校",
    majors: ["資訊科", "機械科", "資料處理科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺南市私立 亞洲高級餐旅職業學校",
    majors: ["電子商務科", "烘焙食品科", "餐飲技術科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "嘉義市私立 東吳高級工業家事職業學校",
    majors: ["資訊科", "烘焙科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新竹縣私立 東泰高級中學",
    majors: ["資訊科", "微電腦修護科", "餐飲管理科", "商用資訊科", "烘焙食品科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺中市私立 青年高級中學",
    majors: ["資訊科", "汽車科", "商用資訊科", "烘焙食品科", "觀光事業科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新北市私立 能仁高級家事商業職業學校",
    majors: ["資料處理科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "高雄市私立 高苑高級工業商業職業學校",
    majors: ["資訊科", "烘焙科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新北市私立 莊敬高級工業家事職業學校",
    majors: ["資訊科", "資料處理科", "餐飲管理科", "汽車科", "食品加工科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺中市私立 慈明高級中學",
    majors: ["資訊科", "烘焙食品科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "嘉義縣私立 萬能高級工商職業學校",
    majors: ["資訊科", "烘焙食品科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺中市私立 嶺東高級中學",
    majors: ["商業經營科", "觀光事業科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺中市沙鹿區臺灣大道六段 弘光科技大學",
    majors: ["食品科技系(烘培科技)", "老人福利與長期照顧事業系", "餐旅管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "新竹縣湖口鄉中山路三段 中國科技大學",
    majors: ["觀光與休閒事業管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "桃園市龜山區萬壽路一段 龍華科技大學",
    majors: ["資訊網路工程系", "半導體工程系", "觀光休閒系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "新北市板橋區四川路二段58號 亞東科技大學",
    majors: ["通訊工程系(智慧通訊科技應用與管理)", "工業管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "台灣高雄市大寮區 輔英科技大學",
    majors: ["護理系", "高齡及長期照護事業系", "醫學檢验生物技術系", "保健營養系", "物理治療系", "健康美容系", "應用化學及材料科學系", "職業安全衛生系"],
    ageRequirementKm: "អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 26 to 27 years old (For College & University)",
    shortAgeKm: "អាយុ ២៦-២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age 26-27 (College & University)"
  },
  {
    school: "台灣新北市泰山區 黎明技術學院",
    majors: ["表演藝術系", "影視傳播系", "戲劇系", "化妝品應用系", "服飾設計系", "數位多媒體系", "數位行銷管理系", "餐飲管理系", "觀光休閒系", "電機工程系", "機械工程系", "智慧製造工程系"],
    ageRequirementKm: "អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 26 to 27 years old (For College & University)",
    shortAgeKm: "អាយុ ២៦-២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age 26-27 (College & University)"
  },
  {
    school: "宜蘭縣三星鄉三星路二段 聖母醫護管理專科學校",
    majors: ["護理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ២៦ឆ្នាំ ដល់ ២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 26 to 27 years old (For College & University)",
    shortAgeKm: "អាយុ ២៦-២៧ឆ្នាំ (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age 26-27 (College & University)"
  }
];

export const TARGET_SCHOOLS: string[] = SCHOOL_MAJORS_DATA.map(item => item.school);

// Deduplicated list of all majors across all schools
export const MAJORS: string[] = Array.from(
  new Set(SCHOOL_MAJORS_DATA.flatMap(item => item.majors))
);

/**
 * Returns age requirement for a given school
 */
export function getSchoolAgeRequirement(
  schoolName?: string, 
  language: 'km' | 'en' | 'zh-TW' = 'km'
): string | undefined {
  if (!schoolName || !schoolName.trim()) return undefined;
  const normalized = schoolName.trim();
  const found = SCHOOL_MAJORS_DATA.find(
    s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school)
  );
  if (found) {
    if (language === 'zh-TW') {
      if (found.ageRequirementEn.includes('16 to 22')) {
        return '年齡 16 至 22 歲 (高中職)';
      }
      if (found.ageRequirementEn.includes('25 & under')) {
        return '年齡 25 歲以下 (7月1日後出生) (大專與大學部)';
      }
      if (found.ageRequirementEn.includes('26 to 27')) {
        return '年齡 26 至 27 歲 (大專與大學部)';
      }
      return found.ageRequirementEn;
    }
    return language === 'km' ? found.ageRequirementKm : found.ageRequirementEn;
  }
  return undefined;
}

/**
 * Returns short age badge text for a given school
 */
export function getSchoolShortAgeBadge(
  schoolName?: string,
  language: 'km' | 'en' | 'zh-TW' = 'km'
): string | undefined {
  if (!schoolName || !schoolName.trim()) return undefined;
  const normalized = schoolName.trim();
  const found = SCHOOL_MAJORS_DATA.find(
    s => s.school === normalized || s.school.includes(normalized) || normalized.includes(s.school)
  );
  if (found) {
    if (language === 'zh-TW') {
      if (found.shortAgeEn.includes('16-22')) return '16-22歲 (高中)';
      if (found.shortAgeEn.includes('≤25')) return '≤25歲 (7/1後) (大專)';
      if (found.shortAgeEn.includes('26-27')) return '26-27歲 (大專)';
      return found.shortAgeEn;
    }
    return language === 'km' ? found.shortAgeKm : found.shortAgeEn;
  }
  return undefined;
}

/**
 * Returns the relevant majors for a given school name.
 * Supports exact match and fuzzy/partial matching with short names.
 */
export function getMajorsForSchool(schoolName?: string): string[] {
  if (!schoolName || !schoolName.trim()) return [];
  const normalized = schoolName.trim();

  // 1. Direct exact match
  const direct = SCHOOL_MAJORS_DATA.find(s => s.school === normalized);
  if (direct) return direct.majors;

  // 2. Substring matching (e.g. user selected "東吳高級" or full name)
  const partial = SCHOOL_MAJORS_DATA.find(
    s => s.school.includes(normalized) || normalized.includes(s.school)
  );
  if (partial) return partial.majors;

  // 3. Normalized key token match (strip geographic prefixes)
  const coreKey = normalized
    .replace(/(高雄市|臺南市|桃園市|嘉義市|新竹縣|臺中市|新北市|嘉義縣|台灣|宜蘭縣|私立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段)/g, '')
    .trim();

  if (coreKey) {
    const matched = SCHOOL_MAJORS_DATA.find(s => s.school.includes(coreKey) || coreKey.includes(s.school.replace(/私立/g, '')));
    if (matched) return matched.majors;
  }

  return [];
}
