import { AUTHENTIC_SCHOOL_MAJORS } from '../data/detailedSchoolsData';
import { canonicalizeSchoolName } from '../utils/imageUtils';

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
  logoUrl?: string;
}

/**
 * Official mapping of Target Schools to their respective Majors and Age Requirements
 */
export const SCHOOL_MAJORS_DATA: SchoolMajorEntry[] = [
  {
    school: "高雄市私立 中山高級工商職業學校",
    majors: ["資訊科", "電子科", "餐飲管理科", "汽車科", "商業經營科"],
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
    majors: ["資訊科", "觀光事業科", "餐飲管理科"],
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
    majors: ["資訊科", "餐飲管理科"],
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
    majors: ["資訊科", "烘焙食品科", "餐飲管理科", "電子商務科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "嘉義縣私立 萬能高級工商職業學校",
    majors: ["資訊科", "餐飲管理科"],
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
    school: "弘光科技大學",
    majors: ["食品科技系(烘培科技)", "老人福利與長期照顧事業系", "餐旅管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "中國科技大學",
    majors: ["觀光與休閒事業管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "龍華科技大學",
    majors: ["資訊網路工程系", "半導體工程系", "觀光休閒系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "亞東科技大學",
    majors: ["通訊工程系(智慧通訊科技應用與管理)", "工業管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  // --- New High Schools (Age 16 - 22) ---
  {
    school: "高雄市私立 三信高級家事商業職業學校",
    majors: ["資料處理科", "烘焙食品科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺北市私立 大同高級中學",
    majors: ["資料處理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "桃園市私立 方曙商工高級中等學校",
    majors: ["照顧服務科", "資訊科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "桃園市私立 永平工商高級中等學校",
    majors: ["資料處理科", "烘焙科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "高雄市 立志高級中學",
    majors: ["電子科", "資訊科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新竹縣私立 仰德高級中學",
    majors: ["電子商務科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "桃園市私立 光啟高級中等學校",
    majors: ["資訊科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新竹市私立 光復高級中學",
    majors: ["資訊科", "資料處理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺北市私立 育達高級中等學校",
    majors: ["烘焙科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺南市私立 育德工業家事職業學校",
    majors: ["烘焙食品科", "餐飲技術科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺中市私立 致用高級中學",
    majors: ["資訊科", "機械科", "烘焙食品科", "餐飲管理科", "照護服務科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "桃園市私立 啟英高級中等學校",
    majors: ["資訊科", "時尚造型科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "高雄市私立 華德高級工業家事職業學校",
    majors: ["資訊科", "烘焙科", "餐飲技術科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "高雄市 新光高級中學",
    majors: ["資訊科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "雲林縣私立 義峰高級中學",
    majors: ["照顧服務科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "臺北市私立 稻江高級商業職業學校",
    majors: ["商業經營科", "觀光事業科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新北市私立 樹人高級家事商業職業學校",
    majors: ["資訊科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "高雄市私立 樹德高級家事商業職業學校",
    majors: ["資料處理科", "烘焙食品科", "美容科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新北市私立 豫章高級工商職業學校",
    majors: ["資訊科", "餐飲管理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  {
    school: "新北市私立 醒吾高中",
    majors: ["資料處理科"],
    ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    ageRequirementEn: "Age 16 to 22 years old (For High School)",
    shortAgeKm: "អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
    shortAgeEn: "Age 16-22 (High School)"
  },
  // --- Partner Universities & Colleges (Age 25 & under - Born after July 1st) ---
  {
    school: "中信金學校財團法人中信科技大學",
    majors: ["半導體工程系(設備維護與資訊應用)", "機械工程系(傳統加工產業)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "中華學校財團法人中華科技大學",
    majors: ["電機與資訊工程系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "中臺科技大學",
    majors: ["環境與安全衛生工程科系", "高齡健康照護系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "元培醫事科技大學",
    majors: ["餐飲管理系", "資訊管理系(製造業資訊管理)", "高齡健康照護系(長照業高齡健康照護)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "台南應用科技大學",
    majors: ["資訊管理系", "餐飲系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "台鋼學校財團法人台鋼科技大學",
    majors: ["建築系(建築設備工程)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "正修科技大學",
    majors: ["機械工程系", "資訊工程系", "電機工程系", "資訊管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "吳鳳科技大學",
    majors: ["餐旅管理系", "數位科技與媒體設計系", "觀光休閒管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "宏國德霖科技大學",
    majors: ["餐旅管理系", "休閒事業管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "東南科技大學",
    majors: ["休閒事業管理系", "餐旅管理系", "室內設計系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "南開科技大學",
    majors: ["休閒事業管理系", "車輛工程系(車輛修護及零組件製造訓練)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "建國科技大學",
    majors: ["電子工程系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "美和科技大學",
    majors: ["觀光系(觀光產業服務)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "修平科技大學",
    majors: ["電子工程系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "國立高雄餐旅大學",
    majors: ["旅運管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "國立勤益科技大學",
    majors: ["人工智慧應用工程系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "崑山科技大學",
    majors: ["資訊管理系", "智慧機器人工程系", "機械工程系(機電整合製造技術實務)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "景文科技大學",
    majors: ["旅遊管理系", "資訊與通訊系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "萬能學校財團法人萬能科技大學",
    majors: ["室內設計與營建科技系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "僑光科技大學",
    majors: ["旅館與會展管理系", "行銷與流通管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "德育學校財團法人德育護理健康學院",
    majors: ["高齡照顧福祉系(高齡健康管理)", "觀光休閒與健康系(觀光健康休閒服務)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "德明財經科技大學",
    majors: ["流通管理系(智慧流通)"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  },
  {
    school: "樹德科技大學",
    majors: ["電子競技與電腦娛樂科學系", "會展行銷與活動管理系"],
    ageRequirementKm: "អាយុ ២៥ឆ្នាំចុះ (កើតក្រោយខែ៧ ថ្ងៃ១) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    ageRequirementEn: "Age 25 & under (Born after July 1st) (For College & University)",
    shortAgeKm: "អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
    shortAgeEn: "Age ≤25 (Born after Jul 1) (College & University)"
  }
];

export const TARGET_SCHOOLS: string[] = SCHOOL_MAJORS_DATA.map(item => item.school);

// Deduplicated list of all majors across all schools
export const MAJORS: string[] = Array.from(
  new Set(SCHOOL_MAJORS_DATA.flatMap(item => item.majors))
);

const cleanSpacing = (str: string) => str.replace(/\s+/g, ' ').trim();

/**
 * Returns age requirement for a given school
 */
export function getSchoolAgeRequirement(
  schoolName?: string, 
  language: 'km' | 'en' | 'zh-TW' = 'km'
): string | undefined {
  if (!schoolName || !schoolName.trim()) return undefined;
  const normalized = canonicalizeSchoolName(schoolName);

  // Check if school is University or High School
  const isUniversity = normalized.includes('大學') || normalized.includes('學院') || normalized.includes('專科') || normalized.includes('中信') || normalized.includes('中華') || normalized.includes('中臺') || normalized.includes('元培') || normalized.includes('正修') || normalized.includes('崑山') || normalized.includes('勤益') || normalized.includes('龍華');

  if (isUniversity) {
    if (language === 'zh-TW') return '年齡 25 歲以下 (7月1日後出生) (大專與大學部)';
    if (language === 'en') return 'Age 25 & under (Born after July 1st) for University / College';
    return 'អាយុ ២៥ឆ្នាំ ចុះក្រោម (កើតក្រោយថ្ងៃទី ០១ ខែកក្កដា) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
  } else {
    if (language === 'zh-TW') return '年齡 16 至 22 歲 (高中職)';
    if (language === 'en') return 'Age 16 to 22 years old (For High School)';
    return 'អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
  }
}

/**
 * Returns short age badge text for a given school
 */
export function getSchoolShortAgeBadge(
  schoolName?: string,
  language: 'km' | 'en' | 'zh-TW' = 'km'
): string | undefined {
  if (!schoolName || !schoolName.trim()) return undefined;
  const normalized = canonicalizeSchoolName(schoolName);
  const isUniversity = normalized.includes('大學') || normalized.includes('學院') || normalized.includes('專科') || normalized.includes('中信') || normalized.includes('中華') || normalized.includes('中臺') || normalized.includes('元培') || normalized.includes('正修') || normalized.includes('崑山') || normalized.includes('勤益') || normalized.includes('龍華');

  if (isUniversity) {
    if (language === 'zh-TW') return '≤25歲 (7/1後) (大專)';
    if (language === 'en') return 'Age ≤25 (Born after Jul 1)';
    return 'អាយុ ≤២៥ឆ្នាំ (កើតក្រោយ ១/៧) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)';
  } else {
    if (language === 'zh-TW') return '16-22歲 (高中)';
    if (language === 'en') return 'Age 16-22 (High School)';
    return 'អាយុ ១៦-២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)';
  }
}

/**
 * Returns the relevant majors for a given school name.
 * Uses the authentic, website-verified majors for each of the 60 Taiwan partner schools.
 */
export function getMajorsForSchool(schoolName?: string): string[] {
  if (!schoolName || !schoolName.trim()) return [];
  const trimmed = schoolName.trim();
  const normalized = canonicalizeSchoolName(schoolName);

  // 1. Check SCHOOL_MAJORS_DATA first (direct and substring match)
  const direct = SCHOOL_MAJORS_DATA.find(s => canonicalizeSchoolName(s.school) === normalized);
  if (direct) return direct.majors;

  const partial = SCHOOL_MAJORS_DATA.find(
    s => cleanSpacing(s.school).includes(normalized) || normalized.includes(cleanSpacing(s.school))
  );
  if (partial) return partial.majors;

  // 2. Check AUTHENTIC_SCHOOL_MAJORS dictionary
  if (AUTHENTIC_SCHOOL_MAJORS[trimmed]) {
    return AUTHENTIC_SCHOOL_MAJORS[trimmed];
  }
  if (AUTHENTIC_SCHOOL_MAJORS[normalized]) {
    return AUTHENTIC_SCHOOL_MAJORS[normalized];
  }

  for (const [key, majors] of Object.entries(AUTHENTIC_SCHOOL_MAJORS)) {
    const cleanKey = cleanSpacing(key);
    if (cleanKey === normalized || cleanKey.includes(normalized) || normalized.includes(cleanKey)) {
      return majors;
    }
  }

  // 3. Normalized key token match (strip geographic and legal prefixes)
  const coreKey = normalized
    .replace(/(高雄市|臺北市|臺南市|桃園市|嘉義市|新竹縣|新竹市|臺中市|新北市|嘉義縣|雲林縣|台湾|宜蘭縣|私立|市立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段|新市區|中華路49號|南港區|研究院路三段|245號|北屯區|廍子路666號|中信金學校財團法人|中華學校財團法人)/g, '')
    .trim();

  if (coreKey) {
    const schoolMatch = SCHOOL_MAJORS_DATA.find(
      s => cleanSpacing(s.school).includes(coreKey) || coreKey.includes(cleanSpacing(s.school).replace(/私立|市立/g, ''))
    );
    if (schoolMatch) return schoolMatch.majors;

    for (const [key, majors] of Object.entries(AUTHENTIC_SCHOOL_MAJORS)) {
      if (cleanSpacing(key).includes(coreKey) || coreKey.includes(cleanSpacing(key).replace(/私立|市立/g, ''))) {
        return majors;
      }
    }
  }

  return [];
}
