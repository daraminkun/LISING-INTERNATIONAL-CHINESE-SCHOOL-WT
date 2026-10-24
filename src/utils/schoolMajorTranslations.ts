/**
 * School and Major Translation Dictionary
 * Provides complete Khmer (ភាសាខ្មែរ) and English translations for all
 * target schools and vocational / university majors in Taiwan.
 */

import { dbStorage } from '../services/dbStorage';

export interface SchoolTranslation {
  zh: string;
  shortZh?: string;
  en: string;
  km: string;
  locationEn: string;
  locationKm: string;
  levelEn: string;
  levelKm: string;
  logoUrl?: string;
}

export interface MajorTranslation {
  zh: string;
  en: string;
  km: string;
  categoryEn?: string;
  categoryKm?: string;
}

/**
 * 20 Target Schools in Taiwan with accurate Khmer & English translations
 */
export const SCHOOL_TRANSLATIONS: Record<string, SchoolTranslation> = {
  // Lising International Chinese School / សាលារៀនចិនលិស៊ីងអន្តរជាតិ / 日興國際學校
  "日興國際學校": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលិស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  "សាលារៀនចិនលិស៊ីងអន្តរជាតិ": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលិស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  "សាលារៀនចិនលីស៊ីងអន្តរជាតិ": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលិស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  "LISING INTERNATIONAL CHINESE SCHOOL": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលិស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  // 1. 中山高級工商職業學校
  "高雄市私立 中山高級工商職業學校": {
    zh: "高雄市私立 中山高級工商職業學校",
    shortZh: "中山工商",
    en: "Chung Shan Industrial & Commercial School (Kaohsiung)",
    km: "វិទ្យាល័យបច្ចេកទេស និងពាណិជ្ជកម្ម ជុងសាន (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 2. 六信高級中學
  "臺南市私立 六信高級中學": {
    zh: "臺南市私立 六信高級中學",
    shortZh: "六信高中",
    en: "Liou Hsin Senior High School (Tainan)",
    km: "វិទ្យាល័យ លីវស៊ីន (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 3. 世紀綠能工商高級中等學校
  "桃園市私立 世紀綠能工商高級中等學校": {
    zh: "桃園市私立 世紀綠能工商高級中等學校",
    shortZh: "世紀綠能工商",
    en: "Century Green Energy Vocational High School (Taoyuan)",
    km: "វិទ្យាល័យបច្ចេកវិទ្យាថាមពលបៃតង សេនឈឺរី (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 4. 亞洲高級餐旅職業學校
  "臺南市私立 亞洲高級餐旅職業學校": {
    zh: "臺南市私立 亞洲高級餐旅職業學校",
    shortZh: "亞洲餐旅",
    en: "Asia Culinary & Hospitality Vocational High School (Tainan)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈបដិសណ្ឋារកិច្ច និងម្ហូបអាហារ អាស៊ី (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 5. 東吳高級工業家事職業學校
  "嘉義市私立 東吳高級工業家事職業學校": {
    zh: "嘉義市私立 東吳高級工業家事職業學校",
    shortZh: "東吳高職",
    en: "Dong Wu Industrial & Home Economics Vocational High School (Chiayi)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈឧស្សាហកម្ម និងសេដ្ឋកិច្ចគេហដ្ឋាន ដុងវូ (ក្រុងជាយី)",
    locationEn: "Chiayi City, Taiwan",
    locationKm: "ក្រុងជាយី ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 6. 東泰高級中學
  "新竹縣私立 東泰高級中學": {
    zh: "新竹縣私立 東泰高級中學",
    shortZh: "東泰高中",
    en: "Dong Tai Senior High School (Hsinchu)",
    km: "វិទ្យាល័យ ដុងថាយ (ខេត្តស៊ីនជូ)",
    locationEn: "Hsinchu County, Taiwan",
    locationKm: "ខេត្តស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 7. 青年高級中學
  "臺中市私立 青年高級中學": {
    zh: "臺中市私立 青年高級中學",
    shortZh: "青年高中",
    en: "Ching Sheng / Youth Senior High School (Taichung)",
    km: "វិទ្យាល័យយុវជន ឈីងយៀន (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 8. 能仁高級家事商業職業學校
  "新北市私立 能仁高級家事商業職業學校": {
    zh: "新北市私立 能仁高級家事商業職業學校",
    shortZh: "能仁家商",
    en: "Neng Ren Home Economics & Commercial Vocational High School (New Taipei)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈពាណិជ្ជកម្ម និងគេហកិច្ច ណឹងរិន (ក្រុងញូវតៃប៉ិ)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងញូវតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 9. 高苑高級工業商業職業學校
  "高雄市私立 高苑高級工業商業職業學校": {
    zh: "高雄市私立 高苑高級工業商業職業學校",
    shortZh: "高苑工商",
    en: "Kao Yuan Vocational High School of Technology & Commerce (Kaohsiung)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈបច្ចេកវិទ្យា និងពាណិជ្ជកម្ម កៅយាន (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 10. 莊敬高級工業家事職業學校
  "新北市私立 莊敬高級工業家事職業學校": {
    zh: "新北市私立 莊敬高級工業家事職業學校",
    shortZh: "莊敬高職",
    en: "Juang Jing Vocational High School (New Taipei)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈឧស្សាហកម្ម និងគេហកិច្ច ច័ងជិន (ក្រុងញូវតៃប៉ិ)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងញូវតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 11. 慈明高級中學
  "臺中市私立 慈明高級中學": {
    zh: "臺中市私立 慈明高級中學",
    shortZh: "慈明高中",
    en: "Tzu Ming High School (Taichung)",
    km: "វិទ្យាល័យ ស៊ឺមីង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 12. 萬能高級工商職業學校
  "嘉義縣私立 萬能高級工商職業學校": {
    zh: "嘉義縣私立 萬能高級工商職業學校",
    shortZh: "萬能工商",
    en: "Wan Neng Vocational High School of Commerce and Industry (Chiayi)",
    km: "វិទ្យាល័យពាណិជ្ជកម្ម និងឧស្សាហកម្ម វ៉ាន់ណឹង (ខេត្តជាយី)",
    locationEn: "Chiayi County, Taiwan",
    locationKm: "ខេត្តជាយី ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 13. 嶺東高級中學
  "臺中市私立 嶺東高級中學": {
    zh: "臺中市私立 嶺東高級中學",
    shortZh: "嶺東高中",
    en: "Ling Tung High School (Taichung)",
    km: "វិទ្យាល័យ លីងទុង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 14. 弘光科技大學
  "臺中市沙鹿區臺灣大道六段 弘光科技大學": {
    zh: "臺中市沙鹿區臺灣大道六段 弘光科技大學",
    shortZh: "弘光科大",
    en: "Hungkuang University (Taichung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ហុងក្វាង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University / College (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ / មហាវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 15. 中國科技大學
  "新竹縣湖口鄉中山路三段 中國科技大學": {
    zh: "新竹縣湖口鄉中山路三段 中國科技大學",
    shortZh: "中國科大",
    en: "China University of Technology (CUTe, Hsinchu)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យាចិន CUTe (ខេត្តស៊ីនជូ)",
    locationEn: "Hsinchu County, Taiwan",
    locationKm: "ខេត្តស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "University / College (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ / មហាវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 16. 龍華科技大學
  "桃園市龜山區萬壽路一段 龍華科技大學": {
    zh: "桃園市龜山區萬壽路一段 龍華科技大學",
    shortZh: "龍華科大",
    en: "Lunghwa University of Science and Technology (Taoyuan)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ឡុងហ័រ (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University / College (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ / មហាវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 17. 亞東科技大學
  "新北市板橋區四川路二段58號 亞東科技大學": {
    zh: "新北市板橋區四川路二段58號 亞東科技大學",
    shortZh: "亞東科大",
    en: "Asia Eastern University of Science and Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា អាស៊ីបូព៌ា យ៉ាតុន (ក្រុងញូវតៃប៉ិ)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងញូវតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "University / College (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ / មហាវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 18. 三信高級家事商業職業學校
  "高雄市私立 三信高級家事商業職業學校": {
    zh: "高雄市私立 三信高級家事商業職業學校",
    shortZh: "三信家商",
    en: "San Shin High School of Home Economics and Commerce (Kaohsiung)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈសេដ្ឋកិច្ចគេហដ្ឋាន និងពាណិជ្ជកម្ម សានស៊ីន (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 19. 大同高級中學
  "臺北市私立 大同高級中學": {
    zh: "臺北市私立 大同高級中學",
    shortZh: "大同高中",
    en: "Tatung Senior High School (Taipei)",
    km: "វិទ្យាល័យ តាតុង (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 20. 方曙商工高級中等學校
  "桃園市私立 方曙商工高級中等學校": {
    zh: "桃園市私立 方曙商工高級中等學校",
    shortZh: "方曙商工",
    en: "Fang Shu Commercial & Industrial Vocational High School (Taoyuan)",
    km: "វិទ្យាល័យពាណិជ្ជកម្ម និងឧស្សាហកម្ម ហ្វាងស៊ូ (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 21. 永平工商高級中等學校
  "桃園市私立 永平工商高級中等學校": {
    zh: "桃園市私立 永平工商高級中等學校",
    shortZh: "永平工商",
    en: "Yung Ping Vocational High School (Taoyuan)",
    km: "វិទ្យាល័យពាណិជ្ជកម្ម និងឧស្សាហកម្ម យ៉ុងពីង (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 22. 志高級中學 / 立志中學
  "高雄市立 志高級中學": {
    zh: "高雄市立 志高級中學",
    shortZh: "立志中學",
    en: "Li-Chih Senior High School (Kaohsiung)",
    km: "វិទ្យាល័យ លីជី (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 23. 仰德高級中學
  "新竹縣私立 仰德高級中學": {
    zh: "新竹縣私立 仰德高級中學",
    shortZh: "仰德高中",
    en: "Yang-Teh Senior High School (Hsinchu)",
    km: "វិទ្យាល័យ យ៉ាងទឺ (ខេត្តស៊ីនជូ)",
    locationEn: "Hsinchu County, Taiwan",
    locationKm: "ខេត្តស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 24. 光啟高級中等學校
  "桃園市私立 光啟高級中等學校": {
    zh: "桃園市私立 光啟高級中等學校",
    shortZh: "光啟高中",
    en: "Kuang Chi Senior High School (Taoyuan)",
    km: "វិទ្យាល័យ គ័ងឈី (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 25. 光復高級中學
  "新竹市私立 光復高級中學": {
    zh: "新竹市私立 光復高級中學",
    shortZh: "光復高中",
    en: "Kuang Fu Senior High School (Hsinchu)",
    km: "វិទ្យាល័យ គ័ងហ្វូ (ក្រុងស៊ីនជូ)",
    locationEn: "Hsinchu City, Taiwan",
    locationKm: "ក្រុងស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 26. 育達高級中等學校
  "臺北市私立 育達高級中等學校": {
    zh: "臺北市私立 育達高級中等學校",
    shortZh: "育達高中",
    en: "Yu Da High School of Commerce and Home Economics (Taipei)",
    km: "វិទ្យាល័យ យូដា (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 27. 育德工業家事職業學校
  "臺南市私立 育德工業家事職業學校": {
    zh: "臺南市私立 育德工業家事職業學校",
    shortZh: "育德工家",
    en: "Yu Teh Industrial & Home Economics Vocational High School (Tainan)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈឧស្សាហកម្ម និងសេដ្ឋកិច្ចគេហដ្ឋាន យូតឺ (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 28. 致用高級中學
  "臺中市私立 致用高級中學": {
    zh: "臺中市私立 致用高級中學",
    shortZh: "致用高中",
    en: "Chih Yung Senior High School (Taichung)",
    km: "វិទ្យាល័យ ជឺយ៉ុង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 29. 啟英高級中等學校
  "桃園市私立 啟英高級中等學校": {
    zh: "桃園市私立 啟英高級中等學校",
    shortZh: "啟英高中",
    en: "Chi Ying Senior High School (Taoyuan)",
    km: "វិទ្យាល័យ ឈីយីង (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 30. 華德高級工業家事職業學校
  "高雄市私立 華德高級工業家事職業學校": {
    zh: "高雄市私立 華德高級工業家事職業學校",
    shortZh: "華德工家",
    en: "Hwa Teh Industrial & Home Economics Vocational High School (Kaohsiung)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈឧស្សាហកម្ម និងសេដ្ឋកិច្ចគេហដ្ឋាន ហ័រទឺ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 31. 新光高級中學
  "高雄市 新光高級中學": {
    zh: "高雄市 新光高級中學",
    shortZh: "新光高中",
    en: "Shin Kwang Senior High School (Kaohsiung)",
    km: "វិទ្យាល័យ ស៊ិនក្វាង (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 32. 義峰高級中學
  "雲林縣私立 義峰高級中學": {
    zh: "雲林縣私立 義峰高級中學",
    shortZh: "義峰高中",
    en: "Yi Feng Senior High School (Yunlin)",
    km: "វិទ្យាល័យ យីហ្វឹង (ខេត្តយុនលីន)",
    locationEn: "Yunlin County, Taiwan",
    locationKm: "ខេត្តយុនលីន ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 33. 稻江高級商業職業學校
  "臺北市私立 稻江高級商業職業學校": {
    zh: "臺北市私立 稻江高級商業職業學校",
    shortZh: "稻江高商",
    en: "Dao Jiang High School of Commerce (Taipei)",
    km: "វិទ្យាល័យពាណិជ្ជកម្ម ដាវជាំង (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 34. 樹人高級家事商業職業學校
  "新北市私立 樹人高級家事商業職業學校": {
    zh: "新北市私立 樹人高級家事商業職業學校",
    shortZh: "樹人家商",
    en: "Shu Jen High School of Home Economics and Commerce (New Taipei)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈសេដ្ឋកិច្ចគេហដ្ឋាន និងពាណិជ្ជកម្ម ស៊ូរិន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 35. 樹德高級家事商業職業學校
  "高雄市私立 樹德高級家事商業職業學校": {
    zh: "高雄市私立 樹德高級家事商業職業學校",
    shortZh: "樹德家商",
    en: "Shu Te High School of Home Economics and Commerce (Kaohsiung)",
    km: "វិទ្យាល័យវិជ្ជាជីវៈសេដ្ឋកិច្ចគេហដ្ឋាន និងពាណិជ្ជកម្ម ស៊ូទឺ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 36. 豫章高級工商職業學校
  "新北市私立 豫章高級工商職業學校": {
    zh: "新北市私立 豫章高級工商職業學校",
    shortZh: "豫章工商",
    en: "Yu Chang Industrial & Commercial Vocational High School (New Taipei)",
    km: "វិទ្យាល័យពាណិជ្ជកម្ម និងឧស្សាហកម្ម យូចាង (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "Vocational High School (Age 16-22)",
    levelKm: "កម្រិតវិទ្យាល័យវិជ្ជាជីវៈ (អាយុ ១៦-២២ឆ្នាំ)",
  },
  // 37. 中信科技大學
  "臺南市新市區中華路49號 中信金學校財團法人中信科技大學": {
    zh: "臺南市新市區中華路49號 中信金學校財團法人中信科技大學",
    shortZh: "中信科大",
    en: "CTBC University of Science and Technology (Tainan)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជុងស៊ីន (CTBC) (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "中信科技大學": {
    zh: "中信科技大學",
    shortZh: "中信科大",
    en: "CTBC University of Science and Technology (Tainan)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជុងស៊ីន (CTBC) (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 38. 中華科技大學
  "臺北市南港區研究院路三段 245號 中華學校財團法人中華科技大學": {
    zh: "臺北市南港區研究院路三段 245號 中華學校財團法人中華科技大學",
    shortZh: "中華科大",
    en: "China University of Science and Technology (Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជុងហ័រ (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "中華科技大學": {
    zh: "中華科技大學",
    shortZh: "中華科大",
    en: "China University of Science and Technology (Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជុងហ័រ (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 39. 中臺科技大學
  "臺中市北屯區廍子路666號 中臺科技大學": {
    zh: "臺中市北屯區廍子路666號 中臺科技大學",
    shortZh: "中臺科大",
    en: "Central Taiwan University of Science and Technology (Taichung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ចុងតៃ (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "中臺科技大學": {
    zh: "中臺科技大學",
    shortZh: "中臺科大",
    en: "Central Taiwan University of Science and Technology (Taichung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ចុងតៃ (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 40. 元培醫事科技大學
  "新竹市元培街306號 元培醫事科技大學": {
    zh: "新竹市元培街306號 元培醫事科技大學",
    shortZh: "元培醫事科大",
    en: "Yuanpei University of Medical Technology (Hsinchu)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យាវេជ្ជសាស្ត្រ យានភើយ (ក្រុងស៊ីនជូ)",
    locationEn: "Hsinchu City, Taiwan",
    locationKm: "ក្រុងស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "元培醫事科技大學": {
    zh: "元培醫事科技大學",
    shortZh: "元培醫事科大",
    en: "Yuanpei University of Medical Technology (Hsinchu)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យាវេជ្ជសាស្ត្រ យានភើយ (ក្រុងស៊ីនជូ)",
    locationEn: "Hsinchu City, Taiwan",
    locationKm: "ក្រុងស៊ីនជូ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 41. 台南應用科技大學
  "臺南市永康區中正路529號 台南應用科技大學": {
    zh: "臺南市永康區中正路529號 台南應用科技大學",
    shortZh: "台南應科大",
    en: "Tainan University of Technology (Tainan)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យាអនុវត្តតៃណាន (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "台南應用科技大學": {
    zh: "台南應用科技大學",
    shortZh: "台南應科大",
    en: "Tainan University of Technology (Tainan)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យាអនុវត្តតៃណាន (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 42. 台鋼科技大學
  "高雄市路竹區中山路1821號 台鋼學校財團法人台鋼科技大學": {
    zh: "高雄市路竹區中山路1821號 台鋼學校財團法人台鋼科技大學",
    shortZh: "台鋼科大",
    en: "Taiwan Steel University of Science and Technology (Kaohsiung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា តៃកាង (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "台鋼科技大學": {
    zh: "台鋼科技大學",
    shortZh: "台鋼科大",
    en: "Taiwan Steel University of Science and Technology (Kaohsiung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា តៃកាង (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 43. 正修科技大學
  "高雄市鳥松區澄清路840號 正修科技大學": {
    zh: "高雄市鳥松區澄清路840號 正修科技大學",
    shortZh: "正修科大",
    en: "Cheng Shiu University (Kaohsiung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ចឹងស៊ីវ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "正修科技大學": {
    zh: "正修科技大學",
    shortZh: "正修科大",
    en: "Cheng Shiu University (Kaohsiung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ចឹងស៊ីវ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 44. 吳鳳科技大學
  "嘉義縣民雄鄉建國路二段117號 吳鳳科技大學": {
    zh: "嘉義縣民雄鄉建國路二段117號 吳鳳科技大學",
    shortZh: "吳鳳科大",
    en: "Wufeng University of Science and Technology (Chiayi)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា អ៊ូហ្វុង (ខេត្តជាយី)",
    locationEn: "Chiayi County, Taiwan",
    locationKm: "ខេត្តជាយី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "吳鳳科技大學": {
    zh: "吳鳳科技大學",
    shortZh: "吳鳳科大",
    en: "Wufeng University of Science and Technology (Chiayi)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា អ៊ូហ្វុង (ខេត្តជាយី)",
    locationEn: "Chiayi County, Taiwan",
    locationKm: "ខេត្តជាយី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 45. 宏國德霖科技大學
  "臺灣新北市土城區青雲路380巷1號 宏國德霖科技大學": {
    zh: "臺灣新北市土城區青雲路380巷1號 宏國德霖科技大學",
    shortZh: "德霖科大",
    en: "Hungkuo Delin University of Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ហុងគ័រតេលីន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "宏國德霖科技大學": {
    zh: "宏國德霖科技大學",
    shortZh: "德霖科大",
    en: "Hungkuo Delin University of Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ហុងគ័រតេលីន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 49. 東南科技大學
  "新北市深坑區北深路三段 152 號 東南科技大學": {
    zh: "新北市深坑區北深路三段 152 號 東南科技大學",
    shortZh: "東南科大",
    en: "Tungnan University of Science and Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ទុងណាន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "東南科技大學": {
    zh: "東南科技大學",
    shortZh: "東南科大",
    en: "Tungnan University of Science and Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ទុងណាន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 50. 南開科技大學
  "南投縣草屯鎮中正路568號 南開科技大學": {
    zh: "南投縣草屯鎮中正路568號 南開科技大學",
    shortZh: "南開科大",
    en: "Nan Kai University of Technology (Nantou)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ណានខាយ (ខេត្តណានថូវ)",
    locationEn: "Nantou County, Taiwan",
    locationKm: "ខេត្តណានថូវ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "南開科技大學": {
    zh: "南開科技大學",
    shortZh: "南開科大",
    en: "Nan Kai University of Technology (Nantou)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ណានខាយ (ខេត្តណានថូវ)",
    locationEn: "Nantou County, Taiwan",
    locationKm: "ខេត្តណានថូវ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 51. 建國科技大學
  "中華民國 臺灣50094彰化縣彰化市介壽北路1號 建國科技大學": {
    zh: "中華民國 臺灣50094彰化縣彰化市介壽北路1號 建國科技大學",
    shortZh: "建國科大",
    en: "Chienkuo Technology University (Changhua)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ជានគ័រ (ខេត្តចាងហ័រ)",
    locationEn: "Changhua City, Taiwan",
    locationKm: "ខេត្តចាងហ័រ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "建國科技大學": {
    zh: "建國科技大學",
    shortZh: "建國科大",
    en: "Chienkuo Technology University (Changhua)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ជានគ័រ (ខេត្តចាងហ័រ)",
    locationEn: "Changhua City, Taiwan",
    locationKm: "ខេត្តចាងហ័រ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 52. 美和科技大學
  "屏東縣內埔鄉美和村屏光路23號 美和科技大學": {
    zh: "屏東縣內埔鄉美和村屏光路23號 美和科技大學",
    shortZh: "美和科大",
    en: "Meiho University (Pingtung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា មីហ័រ (ខេត្តភិងទុង)",
    locationEn: "Pingtung County, Taiwan",
    locationKm: "ខេត្តភិងទុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "美和科技大學": {
    zh: "美和科技大學",
    shortZh: "美和科大",
    en: "Meiho University (Pingtung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា មីហ័រ (ខេត្តភិងទុង)",
    locationEn: "Pingtung County, Taiwan",
    locationKm: "ខេត្តភិងទុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 53. 修平科技大學
  "臺中市大里區工業路11號 修平科技大學": {
    zh: "臺中市大里區工業路11號 修平科技大學",
    shortZh: "修平科大",
    en: "Hsiuping University of Science and Technology (Taichung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា សៀវភីង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "修平科技大學": {
    zh: "修平科技大學",
    shortZh: "修平科大",
    en: "Hsiuping University of Science and Technology (Taichung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា សៀវភីង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 54. 國立高雄餐旅大學
  "高雄市小港區松和路一號 國立高雄餐旅大學": {
    zh: "高雄市小港區松和路一號 國立高雄餐旅大學",
    shortZh: "高餐大",
    en: "National Kaohsiung University of Hospitality and Tourism (Kaohsiung)",
    km: "សាកលវិទ្យាល័យជាតិបដិសណ្ឋារកិច្ច និងទេសចរណ៍កៅសុង (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "National University (Age ≤25)",
    levelKm: "សាកលវិទ្យាល័យរដ្ឋ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "國立高雄餐旅大學": {
    zh: "國立高雄餐旅大學",
    shortZh: "高餐大",
    en: "National Kaohsiung University of Hospitality and Tourism (Kaohsiung)",
    km: "សាកលវិទ្យាល័យជាតិបដិសណ្ឋារកិច្ច និងទេសចរណ៍កៅសុង (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "National University (Age ≤25)",
    levelKm: "សាកលវិទ្យាល័យរដ្ឋ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 55. 國立勤益科技大學
  "臺中市太平區坪林里中山路二段57號 國立勤益科技大學": {
    zh: "臺中市太平區坪林里中山路二段57號 國立勤益科技大學",
    shortZh: "勤益科大",
    en: "National Chin-Yi University of Technology (Taichung)",
    km: "សាកលវិទ្យាល័យជាតិបច្ចេកវិទ្យា ឈីនយី (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "National University (Age ≤25)",
    levelKm: "សាកលវិទ្យាល័យរដ្ឋ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "國立勤益科技大學": {
    zh: "國立勤益科技大學",
    shortZh: "勤益科大",
    en: "National Chin-Yi University of Technology (Taichung)",
    km: "សាកលវិទ្យាល័យជាតិបច្ចេកវិទ្យា ឈីនយី (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "National University (Age ≤25)",
    levelKm: "សាកលវិទ្យាល័យរដ្ឋ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 56. 崑山科技大學
  "臺南市永康區崑大路 195 號 崑山科技大學": {
    zh: "臺南市永康區崑大路 195 號 崑山科技大學",
    shortZh: "崑山科大",
    en: "Kun Shan University (Tainan)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ឃុនសាន (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "崑山科技大學": {
    zh: "崑山科技大學",
    shortZh: "崑山科大",
    en: "Kun Shan University (Tainan)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ឃុនសាន (ក្រុងតៃណាន)",
    locationEn: "Tainan City, Taiwan",
    locationKm: "ក្រុងតៃណាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 57. 景文科技大學
  "新北市新店區安忠路 99 號 景文科技大學": {
    zh: "新北市新店區安忠路 99 號 景文科技大學",
    shortZh: "景文科大",
    en: "Jinwen University of Science and Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជិងវិន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "景文科技大學": {
    zh: "景文科技大學",
    shortZh: "景文科大",
    en: "Jinwen University of Science and Technology (New Taipei)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ជិងវិន (ក្រុងតៃប៉ិថ្មី)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងតៃប៉ិថ្មី ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 58. 萬能科技大學
  "桃園市中壢區萬能路1號 萬能學校財團法人萬能科技大學": {
    zh: "桃園市中壢區萬能路1號 萬能學校財團法人萬能科技大學",
    shortZh: "萬能科大",
    en: "Vanung University (Taoyuan)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា វ៉ាន់ណឹង (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "萬能科技大學": {
    zh: "萬能科技大學",
    shortZh: "萬能科大",
    en: "Vanung University (Taoyuan)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា វ៉ាន់ណឹង (ក្រុងតាវយាន)",
    locationEn: "Taoyuan City, Taiwan",
    locationKm: "ក្រុងតាវយាន ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 59. 僑光科技大學
  "臺中市西屯區僑光路 100 號 僑光科技大學": {
    zh: "臺中市西屯區僑光路 100 號 僑光科技大學",
    shortZh: "僑光科大",
    en: "Overseas Chinese University (Taichung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ឆាវគ័ង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "僑光科技大學": {
    zh: "僑光科技大學",
    shortZh: "僑光科大",
    en: "Overseas Chinese University (Taichung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ឆាវគ័ង (ក្រុងតៃចុង)",
    locationEn: "Taichung City, Taiwan",
    locationKm: "ក្រុងតៃចុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 60. 德育護理健康學院
  "基隆市中山區復興路 336 號 德育學校財團法人德育護理健康學院": {
    zh: "基隆市中山區復興路 336 號 德育學校財團法人德育護理健康學院",
    shortZh: "德育健康學院",
    en: "Deyu Health and Nursing College (Keelung)",
    km: "វិទ្យាស្ថានសុខភាព និងថែទាំ ទេយូ (ក្រុងជីឡុង)",
    locationEn: "Keelung City, Taiwan",
    locationKm: "ក្រុងជីឡុង ប្រទេសតៃវ៉ាន់",
    levelEn: "College / University (Age ≤25)",
    levelKm: "កម្រិតមហាវិទ្យាល័យ/សាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "德育護理健康學院": {
    zh: "德育護理健康學院",
    shortZh: "德育健康學院",
    en: "Deyu Health and Nursing College (Keelung)",
    km: "វិទ្យាស្ថានសុខភាព និងថែទាំ ទេយូ (ក្រុងជីឡុង)",
    locationEn: "Keelung City, Taiwan",
    locationKm: "ក្រុងជីឡុង ប្រទេសតៃវ៉ាន់",
    levelEn: "College / University (Age ≤25)",
    levelKm: "កម្រិតមហាវិទ្យាល័យ/សាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 61. 德明財經科技大學
  "臺北市內湖區環山路一段56號 德明財經科技大學": {
    zh: "臺北市內湖區環山路一段56號 德明財經科技大學",
    shortZh: "德明財經科大",
    en: "Takming University of Science and Technology (Taipei)",
    km: "សាកលវិទ្យាល័យហិរញ្ញវត្ថុ និងបច្ចេកវិទ្យា តាក់មីង (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "德明財經科技大學": {
    zh: "德明財經科技大學",
    shortZh: "德明財經科大",
    en: "Takming University of Science and Technology (Taipei)",
    km: "សាកលវិទ្យាល័យហិរញ្ញវត្ថុ និងបច្ចេកវិទ្យា តាក់មីង (ក្រុងតៃប៉ិ)",
    locationEn: "Taipei City, Taiwan",
    locationKm: "រាជធានីតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // 62. 樹德科技大學
  "高雄市燕巢區橫山路59號 樹德科技大學": {
    zh: "高雄市燕巢區橫山路59號 樹德科技大學",
    shortZh: "樹德科大",
    en: "Shu-Te University (Kaohsiung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ស៊ូទឺ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  "樹德科技大學": {
    zh: "樹德科技大學",
    shortZh: "樹德科大",
    en: "Shu-Te University (Kaohsiung)",
    km: "សាកលវិទ្យាល័យវិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យា ស៊ូទឺ (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "ក្រុងកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University (Age ≤25)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ (អាយុ ≤២៥ឆ្នាំ)",
  },
  // Common universities in mock data
  "Tsinghua University": {
    zh: "清華大學",
    shortZh: "清大",
    en: "Tsinghua University",
    km: "សាកលវិទ្យាល័យ ឈីងហួរ (Tsinghua University)",
    locationEn: "Beijing / Hsinchu",
    locationKm: "ប៉េកាំង / ស៊ីនជូ",
    levelEn: "Top University",
    levelKm: "សាកលវិទ្យាល័យលំដាប់កំពូល",
  },
  "National Taiwan University": {
    zh: "國立臺灣大學",
    shortZh: "台大",
    en: "National Taiwan University (NTU)",
    km: "សាកលវិទ្យាល័យជាតិ តៃវ៉ាន់ (NTU)",
    locationEn: "Taipei, Taiwan",
    locationKm: "ទីក្រុងតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "National University",
    levelKm: "សាកលវិទ្យាល័យជាតិ",
  },
};

/**
 * 44 Majors with accurate Khmer & English translations
 */
export const MAJOR_TRANSLATIONS: Record<string, MajorTranslation> = {
  // 1. 資訊科
  "資訊科": {
    zh: "資訊科",
    en: "Information Technology (IT) Department",
    km: "ផ្នែកព័ត៌មានវិទ្យា (IT)",
    categoryEn: "Technology & Engineering",
    categoryKm: "បច្ចេកវិទ្យា និងព័ត៌មាន",
  },
  // 2. 電子科
  "電子科": {
    zh: "電子科",
    en: "Electronics Engineering Department",
    km: "ផ្នែកអេឡិចត្រូនិច",
    categoryEn: "Engineering",
    categoryKm: "វិស្វកម្មអេឡិចត្រូនិច",
  },
  // 3. 汽車科
  "汽車科": {
    zh: "汽車科",
    en: "Automobile Technology Department",
    km: "ផ្នែកមេកានិកយានយន្ត",
    categoryEn: "Automotive",
    categoryKm: "មេកានិក និងយានយន្ត",
  },
  // 4. 商業經營科
  "商業經營科": {
    zh: "商業經營科",
    en: "Business Management Department",
    km: "ផ្នែកគ្រប់គ្រងពាណិជ្ជកម្ម",
    categoryEn: "Business & Commerce",
    categoryKm: "ពាណិជ្ជកម្ម និងគ្រប់គ្រង",
  },
  // 5. 烘焙食品科
  "烘焙食品科": {
    zh: "烘焙食品科",
    en: "Baking & Pastry Food Science Department",
    km: "ផ្នែកធ្វើនំប៉័ង និងកែច្នៃម្ហូបអាហារ",
    categoryEn: "Food & Culinary Arts",
    categoryKm: "ម្ហូបអាហារ និងធ្វើនំ",
  },
  // 6. 美容科
  "美容科": {
    zh: "美容科",
    en: "Cosmetology & Beauty Care Department",
    km: "ផ្នែកកែសម្ផស្ស និងថែរក្សាសម្រស់",
    categoryEn: "Beauty & Fashion",
    categoryKm: "កែសម្ផស្ស និងសម្រស់",
  },
  // 7. 機械科
  "機械科": {
    zh: "機械科",
    en: "Mechanical Engineering Department",
    km: "ផ្នែកវិស្វកម្មមេកានិក",
    categoryEn: "Engineering",
    categoryKm: "វិស្វកម្មមេកានិក",
  },
  // 8. 資料處理科
  "資料處理科": {
    zh: "資料處理科",
    en: "Data Processing Department",
    km: "ផ្នែកដំណើរការទិន្នន័យកុំព្យូទ័រ",
    categoryEn: "Information Systems",
    categoryKm: "ប្រព័ន្ធទិន្នន័យកុំព្យូទ័រ",
  },
  // 9. 餐飲管理科
  "餐飲管理科": {
    zh: "餐飲管理科",
    en: "Food & Beverage / Restaurant Management Department",
    km: "ផ្នែកគ្រប់គ្រងសេវាកម្មម្ហូបអាហារ និងភោជនីយដ្ឋាន",
    categoryEn: "Hospitality & Dining",
    categoryKm: "ភោជនីយដ្ឋាន និងបដិសណ្ឋារកិច្ច",
  },
  // 10. 電子商務科
  "電子商務科": {
    zh: "電子商務科",
    en: "E-Commerce Department",
    km: "ផ្នែកពាណិជ្ជកម្មអេឡិចត្រូនិក (E-Commerce)",
    categoryEn: "Digital Commerce",
    categoryKm: "ពាណិជ្ជកម្មឌីជីថល",
  },
  // 11. 餐飲技術科
  "餐飲技術科": {
    zh: "餐飲技術科",
    en: "Culinary Arts & Cooking Technique Department",
    km: "ផ្នែកបច្ចេកទេសធ្វើម្ហូប និងភោជនីយដ្ឋាន",
    categoryEn: "Culinary Skills",
    categoryKm: "វិជ្ជាជីវៈចម្អិនម្ហូប",
  },
  // 12. 烘焙科
  "烘焙科": {
    zh: "烘焙科",
    en: "Baking & Pastry Department",
    km: "ផ្នែកធ្វើនំប៉័ង និងនំខេក",
    categoryEn: "Baking & Confectionery",
    categoryKm: "ជំនាញធ្វើនំ និងបង្អែម",
  },
  // 13. 微電腦修護科
  "微電腦修護科": {
    zh: "微電腦修護科",
    en: "Microcomputer Repair & Maintenance Department",
    km: "ផ្នែកជួសជុល និងថែទាំមីក្រូកុំព្យូទ័រ",
    categoryEn: "Computer Hardware",
    categoryKm: "ផ្នែករឹងកុំព្យូទ័រ និងជួសជុល",
  },
  // 14. 商用資訊科
  "商用資訊科": {
    zh: "商用資訊科",
    en: "Commercial Informatics / Business Information Department",
    km: "ផ្នែកព័ត៌មានវិទ្យាពាណិជ្ជកម្ម",
    categoryEn: "Business & IT",
    categoryKm: "ព័ត៌មានវិទ្យាពាណិជ្ជកម្ម",
  },
  // 15. 觀光事業科
  "觀光事業科": {
    zh: "觀光事業科",
    en: "Tourism & Travel Industry Department",
    km: "ផ្នែកទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
    categoryEn: "Tourism & Travel",
    categoryKm: "វិស័យទេសចរណ៍ និងសេវាកម្ម",
  },
  // 16. 食品加工科
  "食品加工科": {
    zh: "食品加工科",
    en: "Food Processing Technology Department",
    km: "ផ្នែកកែច្នៃចំណីអាហារ",
    categoryEn: "Food Industry",
    categoryKm: "បច្ចេកវិទ្យាកែច្នៃអាហារ",
  },
  // 17. 食品科技系(烘培科技)
  "食品科技系(烘培科技)": {
    zh: "食品科技系(烘培科技)",
    en: "Dept. of Food Science & Technology (Baking Science)",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រម្ហូបអាហារ (បច្ចេកវិទ្យាធ្វើនំ)",
    categoryEn: "University Degree",
    categoryKm: "កម្រិតសាកលវិទ្យាល័យ",
  },
  // 18. 老人福利與長期照顧事業系
  "老人福利與長期照顧事業系": {
    zh: "老人福利與長期照顧事業系",
    en: "Dept. of Senior Citizen Welfare & Long-Term Care",
    km: "ដេប៉ាតឺម៉ង់សុខុមាលភាពមនុស្សចាស់ និងការថែទាំរយៈពេលវែង",
    categoryEn: "Healthcare & Social Welfare",
    categoryKm: "សុខុមាលភាពសង្គម និងការថែទាំ",
  },
  // 19. 餐旅管理系
  "餐旅管理系": {
    zh: "餐旅管理系",
    en: "Dept. of Hospitality & Restaurant Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងសណ្ឋាគារ និងភោជនីយដ្ឋាន",
    categoryEn: "Hospitality Management",
    categoryKm: "គ្រប់គ្រងសណ្ឋាគារ",
  },
  // 19b. 餐飲管理系
  "餐飲管理系": {
    zh: "餐飲管理系",
    en: "Dept. of Restaurant & Food and Beverage Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងសេវាកម្មម្ហូបអាហារ និងភោជនីយដ្ឋាន",
    categoryEn: "Food & Beverage Management",
    categoryKm: "គ្រប់គ្រងសេវាកម្មម្ហូបអាហារ និងភោជនីយដ្ឋាន",
  },
  // 20. 觀光與休閒事業管理系
  "觀光與休閒事業管理系": {
    zh: "觀光與休閒事業管理系",
    en: "Dept. of Tourism & Recreation Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងការកម្សាន្ត",
    categoryEn: "Tourism Management",
    categoryKm: "ទេសចរណ៍ និងកម្សាន្ត",
  },
  // 21. 資訊網路工程系
  "資訊網路工程系": {
    zh: "資訊網路工程系",
    en: "Dept. of Information & Network Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មបណ្តាញ និងព័ត៌មានវិទ្យា",
    categoryEn: "Network & IT Engineering",
    categoryKm: "បណ្តាញកុំព្យូទ័រ និង IT",
  },
  // 22. 半導體工程系
  "半導體工程系": {
    zh: "半導體工程系",
    en: "Dept. of Semiconductor Engineering (Microchips)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មបន្ទះឈីបពាក់កណ្តាលចម្លង (Semiconductor)",
    categoryEn: "High-Tech Engineering",
    categoryKm: "បច្ចេកវិទ្យាបន្ទះឈីប",
  },
  // 23. 觀光休閒系
  "觀光休閒系": {
    zh: "觀光休閒系",
    en: "Dept. of Tourism & Leisure",
    km: "ដេប៉ាតឺម៉ង់ទេសចរណ៍ និងការលំហែកម្សាន្ត",
    categoryEn: "Tourism & Leisure",
    categoryKm: "ទេសចរណ៍ និងលំហែកាយ",
  },
  // 24. 通訊工程系(智慧通訊科技應用與管理)
  "通訊工程系(智慧通訊科技應用與管理)": {
    zh: "通訊工程系(智慧通訊科技應用與管理)",
    en: "Dept. of Communications Engineering (Smart Comm Tech & Management)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មទូរគមនាគមន៍ (បច្ចេកវិទ្យាទូរគមនាគមន៍ឆ្លាតវៃ)",
    categoryEn: "Telecommunications",
    categoryKm: "វិស្វកម្មទូរគមនាគមន៍",
  },
  // 25. 工業管理系
  "工業管理系": {
    zh: "工業管理系",
    en: "Dept. of Industrial Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងឧស្សាហកម្ម",
    categoryEn: "Industrial Engineering",
    categoryKm: "គ្រប់គ្រងឧស្សាហកម្ម",
  },
  // 26. 護理系
  "護理系": {
    zh: "護理系",
    en: "Dept. of Nursing",
    km: "ដេប៉ាតឺម៉ង់គិលានុបដ្ឋាក (ថែទាំវេជ្ជសាស្ត្រ)",
    categoryEn: "Medical & Nursing",
    categoryKm: "វេជ្ជសាស្ត្រ និងថែទាំ",
  },
  // 27. 高齡及長期照護事業系
  "高齡及長期照護事業系": {
    zh: "高齡及長期照護事業系",
    en: "Dept. of Aging & Long-Term Care Management",
    km: "ដេប៉ាតឺម៉ង់ការថែទាំមនុស្សចាស់ និងការថែទាំរយៈពេលវែង",
    categoryEn: "Gerontological Healthcare",
    categoryKm: "ថែទាំសុខភាពមនុស្សចាស់",
  },
  // 28. 醫學檢验生物技術系
  "醫學檢验生物技術系": {
    zh: "醫學檢验生物技術系",
    en: "Dept. of Medical Laboratory Science & Biotechnology",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រមន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ និងជីវបច្ចេកវិទ្យា",
    categoryEn: "Medical Biotech",
    categoryKm: "មន្ទីរពិសោធន៍ និងជីវបច្ចេកវិទ្យា",
  },
  // 29. 保健營養系
  "保健營養系": {
    zh: "保健營養系",
    en: "Dept. of Health & Nutrition Science",
    km: "ដេប៉ាតឺម៉ង់សុខភាព និងអាហារូបត្ថម្ភ",
    categoryEn: "Health Sciences",
    categoryKm: "សុខភាព និងអាហារូបត្ថម្ភ",
  },
  // 30. 物理治療系
  "物理治療系": {
    zh: "物理治療系",
    en: "Dept. of Physical Therapy (Physiotherapy)",
    km: "ដេប៉ាតឺម៉ង់ចលនាសម្ព័ន្ធ និងព្យាបាលដោយចលនា (Physical Therapy)",
    categoryEn: "Rehabilitation Medicine",
    categoryKm: "ព្យាបាលដោយចលនា",
  },
  // 31. 健康美容系
  "健康美容系": {
    zh: "健康美容系",
    en: "Dept. of Health & Cosmetology",
    km: "ដេប៉ាតឺម៉ង់សុខភាព និងកែសម្ផស្ស",
    categoryEn: "Beauty & Health",
    categoryKm: "សុខភាព និងសម្រស់",
  },
  // 32. 應用化學及材料科學系
  "應用化學及材料科學系": {
    zh: "應用化學及材料科學系",
    en: "Dept. of Applied Chemistry & Materials Science",
    km: "ដេប៉ាតឺម៉ង់គីមីអនុវត្តន៍ និងវិទ្យាសាស្ត្រសម្ភារៈ",
    categoryEn: "Materials Science",
    categoryKm: "គីមីវិទ្យា និងសម្ភារៈ",
  },
  // 33. 職業安全衛生系
  "職業安全衛生系": {
    zh: "職業安全衛生系",
    en: "Dept. of Occupational Safety & Health",
    km: "ដេប៉ាតឺម៉ង់សុវត្ថិភាព និងអនាម័យការងារ",
    categoryEn: "Safety & Health",
    categoryKm: "សុវត្ថិភាពការងារ",
  },
  // 34. 表演藝術系
  "表演藝術系": {
    zh: "表演藝術系",
    en: "Dept. of Performing Arts",
    km: "ដេប៉ាតឺម៉ង់សិល្បៈសម្តែង",
    categoryEn: "Arts & Entertainment",
    categoryKm: "សិល្បៈសម្តែង",
  },
  // 35. 影視傳播系
  "影視傳播系": {
    zh: "影視傳播系",
    en: "Dept. of Motion Picture & Television Broadcasting",
    km: "ដេប៉ាតឺម៉ង់ប្រព័ន្ធផ្សព្វផ្សាយភាពយន្ត និងទូរទស្សន៍",
    categoryEn: "Media & Broadcasting",
    categoryKm: "ភាពយន្ត និងទូរទស្សន៍",
  },
  // 36. 戲劇系
  "戲劇系": {
    zh: "戲劇系",
    en: "Dept. of Drama & Theatre",
    km: "ដេប៉ាតឺម៉ង់សិល្បៈល្ខោន និងភាពយន្ត",
    categoryEn: "Drama & Theatre",
    categoryKm: "ល្ខោន និងភាពយន្ត",
  },
  // 37. 化妝品應用系
  "化妝品應用系": {
    zh: "化妝品應用系",
    en: "Dept. of Cosmetic Science & Applications",
    km: "ដេប៉ាតឺម៉ង់ការអនុវត្តគ្រឿងសម្អាង និងថែសម្ផស្ស",
    categoryEn: "Cosmetic Sciences",
    categoryKm: "វិទ្យាសាស្ត្រគ្រឿងសម្អាង",
  },
  // 38. 服飾設計系
  "服飾設計系": {
    zh: "服飾設計系",
    en: "Dept. of Fashion & Apparel Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដសម្លៀកបំពាក់",
    categoryEn: "Fashion Design",
    categoryKm: "រចនាម៉ូដសម្លៀកបំពាក់",
  },
  // 39. 數位多媒體系
  "數位多媒體系": {
    zh: "數位多媒體系",
    en: "Dept. of Digital Multimedia Design",
    km: "ដេប៉ាតឺម៉ង់ពហុមេឌាឌីជីថល (Digital Multimedia)",
    categoryEn: "Digital Media",
    categoryKm: "ពហុមេឌាឌីជីថល",
  },
  // 40. 數位行銷管理系
  "數位行銷管理系": {
    zh: "數位行銷管理系",
    en: "Dept. of Digital Marketing Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទីផ្សារឌីជីថល (Digital Marketing)",
    categoryEn: "Digital Marketing",
    categoryKm: "ទីផ្សារឌីជីថល",
  },
  // 41. 電機工程系
  "電機工程系": {
    zh: "電機工程系",
    en: "Dept. of Electrical Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មអគ្គិសនី",
    categoryEn: "Electrical Engineering",
    categoryKm: "វិស្វកម្មអគ្គិសនី",
  },
  // 42. 機械工程系
  "機械工程系": {
    zh: "機械工程系",
    en: "Dept. of Mechanical Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក",
    categoryEn: "Mechanical Engineering",
    categoryKm: "វិស្វកម្មមេកានិក",
  },
  // 43. 智慧製造工程系
  "智慧製造工程系": {
    zh: "智慧製造工程系",
    en: "Dept. of Smart Manufacturing Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មផលិតកម្មឆ្លាតវៃ",
    categoryEn: "Smart Manufacturing",
    categoryKm: "ផលិតកម្មឆ្លាតវៃ",
  },
  // 44. 護理科
  "護理科": {
    zh: "護理科",
    en: "Nursing Section (Medical Care)",
    km: "ផ្នែកគិលានុបដ្ឋាក (ថែទាំវេជ្ជសាស្ត្រ)",
    categoryEn: "Nursing",
    categoryKm: "គិលានុបដ្ឋាក",
  },
  // Common majors in mock data
  "Computer Science & AI": {
    zh: "資訊工程與人工智慧",
    en: "Computer Science & Artificial Intelligence (AI)",
    km: "វិទ្យាសាស្ត្រកុំព្យូទ័រ និងបញ្ញាសិប្បនិម្មិត (AI)",
    categoryEn: "Computer Science",
    categoryKm: "វិទ្យាសាស្ត្រកុំព្យូទ័រ",
  },
  "International Business Management": {
    zh: "國際企業管理",
    en: "International Business Management",
    km: "គ្រប់គ្រងពាណិជ្ជកម្មអន្តរជាតិ",
    categoryEn: "Business",
    categoryKm: "ពាណិជ្ជកម្មអន្តរជាតិ",
  },
  // New Majors requested
  "照顧服務科": {
    zh: "照顧服務科",
    en: "Care Services Division",
    km: "ផ្នែកសេវាថែទាំសុខភាព និងមនុស្សចាស់",
    categoryEn: "Healthcare Services",
    categoryKm: "សេវាថែទាំសុខភាព",
  },
  "時尚造型科": {
    zh: "時尚造型科",
    en: "Fashion Styling & Design Division",
    km: "ផ្នែករចនាម៉ូត និងតុបតែងកាយ",
    categoryEn: "Fashion & Beauty",
    categoryKm: "ម៉ូដ និងសម្រស់",
  },
  "半導體工程系(設備維護與資訊應用)": {
    zh: "半導體工程系(設備維護與資訊應用)",
    en: "Dept. of Semiconductor Engineering (Equipment Maintenance & IT Application)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មឧបករណ៍ពាក់កណ្តាលចម្លង (ថែទាំឧបករណ៍ និងអនុវត្ត IT)",
    categoryEn: "Semiconductor",
    categoryKm: "បច្ចេកវិទ្យាបន្ទះឈីប",
  },
  "機械工程系(傳統加工產業)": {
    zh: "機械工程系(傳統加工產業)",
    en: "Dept. of Mechanical Engineering (Traditional Processing Industry)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក (ឧស្សាហកម្មកែច្នៃប្រពៃណី)",
    categoryEn: "Mechanical Engineering",
    categoryKm: "វិស្វកម្មមេកានិក",
  },
  "電機與資訊工程系": {
    zh: "電機與資訊工程系",
    en: "Dept. of Electrical & Information Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មអគ្គិសនី និងព័ត៌មានវិទ្យា",
    categoryEn: "Electrical & IT",
    categoryKm: "អគ្គិសនី និងព័ត៌មានវិទ្យា",
  },
  "環境與安全衛生工程科系": {
    zh: "環境與安全衛生工程科系",
    en: "Dept. of Environmental & Safety Health Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មបរិស្ថាន និងសុវត្ថិភាពអនាម័យ",
    categoryEn: "Environmental Safety",
    categoryKm: "បរិស្ថាន និងសុវត្ថិភាព",
  },
  "高齡健康照護系": {
    zh: "高齡健康照護系",
    en: "Dept. of Senior Healthcare & Gerontological Care",
    km: "ដេប៉ាតឺម៉ង់ថែទាំសុខភាពមនុស្សចាស់",
    categoryEn: "Elderly Healthcare",
    categoryKm: "ថែទាំមនុស្សចាស់",
  },
  "資訊管理系(製造業資訊管理)": {
    zh: "資訊管理系(製造業資訊管理)",
    en: "Dept. of Information Management (Manufacturing Information Management)",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងព័ត៌មានវិទ្យា (ការគ្រប់គ្រងព័ត៌មានវិស័យកម្មន្តសាល)",
    categoryEn: "Information Management",
    categoryKm: "គ្រប់គ្រងព័ត៌មានវិទ្យា",
  },
  "高齡健康照護系(長照業高齡健康照護)": {
    zh: "高齡健康照護系(長照業高齡健康照護)",
    en: "Dept. of Senior Healthcare (Long-term Care Senior Healthcare)",
    km: "ដេប៉ាតឺម៉ង់ថែទាំសុខភាពមនុស្សចាស់ (សេវាថែទាំសុខភាពមនុស្សចាស់រយៈពេលវែង)",
    categoryEn: "Elderly Healthcare",
    categoryKm: "ថែទាំមនុស្សចាស់",
  },
  "資訊管理系": {
    zh: "資訊管理系",
    en: "Dept. of Information Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងព័ត៌មានវិទ្យា",
    categoryEn: "Information Management",
    categoryKm: "គ្រប់គ្រងព័ត៌មានវិទ្យា",
  },
  "餐飲系": {
    zh: "餐飲系",
    en: "Dept. of Food & Beverage / Culinary",
    km: "ដេប៉ាតឺម៉ង់ម្ហូបអាហារ និងភេសជ្ជៈ",
    categoryEn: "Hospitality & Culinary",
    categoryKm: "ម្ហូបអាហារ និងភេសជ្ជៈ",
  },
  "建築系(建築設備工程)": {
    zh: "建築系(建築設備工程)",
    en: "Dept. of Architecture (Building Equipment Engineering)",
    km: "ដេប៉ាតឺម៉ង់ស្ថាបត្យកម្ម (វិស្វកម្មបរិក្ខារសំណង់)",
    categoryEn: "Architecture",
    categoryKm: "ស្ថាបត្យកម្ម",
  },
  "資訊工程系": {
    zh: "資訊工程系",
    en: "Dept. of Computer Science and Information Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មព័ត៌មានវិទ្យា",
    categoryEn: "Computer Science",
    categoryKm: "វិស្វកម្មព័ត៌មានវិទ្យា",
  },
  "數位科技與媒體設計系": {
    zh: "數位科技與媒體設計系",
    en: "Dept. of Digital Technology and Media Design",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាឌីជីថល និងរចនាប្រព័ន្ធផ្សព្វផ្សាយ",
    categoryEn: "Digital Media",
    categoryKm: "បច្ចេកវិទ្យាឌីជីថល",
  },
  "觀光休閒管理系": {
    zh: "觀光休閒管理系",
    en: "Dept. of Tourism and Leisure Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងកម្សាន្ត",
    categoryEn: "Tourism & Leisure",
    categoryKm: "ទេសចរណ៍ និងកម្សាន្ត",
  },
  "休閒事業管理系": {
    zh: "休閒事業管理系",
    en: "Dept. of Leisure Industry Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងអាជីវកម្មកម្សាន្ត និងលំហែកាយ",
    categoryEn: "Leisure Management",
    categoryKm: "គ្រប់គ្រងអាជីវកម្មកម្សាន្ត",
  },
  "室內設計系": {
    zh: "室內設計系",
    en: "Dept. of Interior Design",
    km: "ដេប៉ាតឺម៉ង់រចនាផ្ទៃខាងក្នុង",
    categoryEn: "Interior Design",
    categoryKm: "រចនាផ្ទៃខាងក្នុង",
  },
  "車輛工程系(車輛修護及零組件製造訓練)": {
    zh: "車輛工程系(車輛修護及零組件製造訓練)",
    en: "Dept. of Vehicle Engineering (Vehicle Repair & Parts Manufacturing)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មយានយន្ត (ការជួសជុល និងផលិតគ្រឿងបន្លាស់យានយន្ត)",
    categoryEn: "Automotive Engineering",
    categoryKm: "វិស្វកម្មយានយន្ត",
  },
  "電子工程系": {
    zh: "電子工程系",
    en: "Dept. of Electronic Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មអេឡិចត្រូនិក",
    categoryEn: "Electronic Engineering",
    categoryKm: "វិស្វកម្មអេឡិចត្រូនិក",
  },
  "觀光系(觀光產業服務)": {
    zh: "觀光系(觀光產業服務)",
    en: "Dept. of Tourism (Tourism Industry Services)",
    km: "ដេប៉ាតឺម៉ង់ទេសចរណ៍ (សេវាកម្មឧស្សាហកម្មទេសចរណ៍)",
    categoryEn: "Tourism",
    categoryKm: "ទេសចរណ៍",
  },
  "旅運管理系": {
    zh: "旅運管理系",
    en: "Dept. of Travel and Transportation Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងការធ្វើដំណើរ និងដឹកជញ្ជូន",
    categoryEn: "Transportation Management",
    categoryKm: "ការធ្វើដំណើរ និងដឹកជញ្ជូន",
  },
  "人工智慧應用工程系": {
    zh: "人工智慧應用工程系",
    en: "Dept. of Applied Artificial Intelligence Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មអនុវត្តបញ្ញាសិប្បនិម្មិត (AI)",
    categoryEn: "Artificial Intelligence",
    categoryKm: "បញ្ញាសិប្បនិម្មិត (AI)",
  },
  "智慧機器人工程系": {
    zh: "智慧機器人工程系",
    en: "Dept. of Intelligent Robotics Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមនុស្សយន្តឆ្លាតវៃ (Robotics)",
    categoryEn: "Robotics",
    categoryKm: "មនុស្សយន្តឆ្លាតវៃ",
  },
  "機械工程系(機電整合製造技術實務)": {
    zh: "機械工程系(機電整合製造技術實務)",
    en: "Dept. of Mechanical Engineering (Mechatronics & Manufacturing Practice)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក (បច្ចេកវិទ្យារួមបញ្ចូលមេកាត្រូនិក និងការផលិត)",
    categoryEn: "Mechanical & Mechatronics",
    categoryKm: "វិស្វកម្មមេកាត្រូនិក",
  },
  "旅遊管理系": {
    zh: "旅遊管理系",
    en: "Dept. of Travel Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងដំណើរកម្សាន្ត",
    categoryEn: "Travel Management",
    categoryKm: "គ្រប់គ្រងទេសចរណ៍",
  },
  "資訊與通訊系": {
    zh: "資訊與通訊系",
    en: "Dept. of Information and Communication",
    km: "ដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យា និងទូរគមនាគមន៍",
    categoryEn: "Information & Communication",
    categoryKm: "ព័ត៌មានវិទ្យា និងទូរគមនាគមន៍",
  },
  "室內設計與營建科技系": {
    zh: "室內設計與營建科技系",
    en: "Dept. of Interior Design and Construction Technology",
    km: "ដេប៉ាតឺម៉ង់រចនាផ្ទៃខាងក្នុង និងបច្ចេកវិទ្យាសំណង់",
    categoryEn: "Construction & Interior",
    categoryKm: "សំណង់ និងរចនាផ្ទៃខាងក្នុង",
  },
  "旅館與會展管理系": {
    zh: "旅館與會展管理系",
    en: "Dept. of Hotel and MICE (Convention & Exhibition) Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងសណ្ឋាគារ និងការរៀបចំព្រឹត្តិការណ៍ពិព័រណ៍ (MICE)",
    categoryEn: "Hospitality & Events",
    categoryKm: "សណ្ឋាគារ និងពិព័រណ៍",
  },
  "行銷與流通管理系": {
    zh: "行銷與流通管理系",
    en: "Dept. of Marketing and Logistics / Distribution Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទីផ្សារ និងខ្សែសង្វាក់ចែកចាយ",
    categoryEn: "Marketing & Logistics",
    categoryKm: "ទីផ្សារ និងការចែកចាយ",
  },
  "高齡照顧福祉系(高齡健康管理)": {
    zh: "高齡照顧福祉系(高齡健康管理)",
    en: "Dept. of Senior Welfare & Care (Senior Health Management)",
    km: "ដេប៉ាតឺម៉ង់សុខុមាលភាព និងថែទាំមនុស្សចាស់ (គ្រប់គ្រងសុខភាពមនុស្សចាស់)",
    categoryEn: "Senior Welfare",
    categoryKm: "សុខុមាលភាពមនុស្សចាស់",
  },
  "觀光休閒與健康系(觀光健康休閒服務)": {
    zh: "觀光休閒與健康系(觀光健康休閒服務)",
    en: "Dept. of Tourism, Leisure and Health (Tourism Health & Leisure Services)",
    km: "ដេប៉ាតឺម៉ង់ទេសចរណ៍ កម្សាន្ត និងសុខភាព (សេវាកម្មសុខភាព និងលំហែកាយទេសចរណ៍)",
    categoryEn: "Tourism & Wellness",
    categoryKm: "ទេសចរណ៍ និងសុខភាព",
  },
  "流通管理系(智慧流通)": {
    zh: "流通管理系(智慧流通)",
    en: "Dept. of Distribution Management (Smart Logistics & Distribution)",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងការចែកចាយ (ការចែកចាយ និងភស្តុភារឆ្លាតវៃ)",
    categoryEn: "Smart Logistics",
    categoryKm: "ការចែកចាយឆ្លាតវៃ",
  },
  "電子競技與電腦娛樂科學系": {
    zh: "電子競技與電腦娛樂科學系",
    en: "Dept. of Esports and Computer Entertainment Science",
    km: "ដេប៉ាតឺម៉ង់កីឡាអេឡិចត្រូនិក (Esports) និងវិទ្យាសាស្ត្រកម្សាន្តកុំព្យូទ័រ",
    categoryEn: "Esports & Gaming",
    categoryKm: "កីឡាអេឡិចត្រូនិក Esports",
  },
  "會展行銷與活動管理系": {
    zh: "會展行銷與活動管理系",
    en: "Dept. of Exhibition Marketing and Event Management",
    km: "ដេប៉ាតឺម៉ង់ទីផ្សារពិព័រណ៍ និងគ្រប់គ្រងព្រឹត្តិការណ៍",
    categoryEn: "Event & Exhibition",
    categoryKm: "ទីផ្សារពិព័រណ៍ និងព្រឹត្តិការណ៍",
  },
  // Authentic University & Vocational Majors
  "財務金融學系": {
    zh: "財務金融學系",
    en: "Dept. of Financial Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងហិរញ្ញវត្ថុ",
    categoryEn: "Finance & Economics",
    categoryKm: "ហិរញ្ញវត្ថុ និងសេដ្ឋកិច្ច",
  },
  "財經法律學系": {
    zh: "財經法律學系",
    en: "Dept. of Financial & Economic Law",
    km: "ដេប៉ាតឺម៉ង់ច្បាប់ហិរញ្ញវត្ថុ និងសេដ្ឋកិច្ច",
    categoryEn: "Law & Business",
    categoryKm: "ច្បាប់ និងពាណិជ្ជកម្ម",
  },
  "企業管理學系": {
    zh: "企業管理學系",
    en: "Dept. of Business Administration",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងពាណិជ្ជកម្ម និងសហគ្រាស",
    categoryEn: "Business Management",
    categoryKm: "គ្រប់គ្រងពាណិជ្ជកម្ម",
  },
  "人工智慧學系": {
    zh: "人工智慧學系",
    en: "Dept. of Artificial Intelligence",
    km: "ដេប៉ាតឺម៉ង់បញ្ញាសិប្បនិម្មិត (AI)",
    categoryEn: "Computer Science",
    categoryKm: "បញ្ញាសិប្បនិម្មិត AI",
  },
  "運動產業管理學系": {
    zh: "運動產業管理學系",
    en: "Dept. of Sports Industry Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងឧស្សាហកម្មកីឡា",
    categoryEn: "Sports & Recreation",
    categoryKm: "ឧស្សាហកម្មកីឡា",
  },
  "金融科技學系": {
    zh: "金融科技學系",
    en: "Dept. of Financial Technology (FinTech)",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាហិរញ្ញវត្ថុ (FinTech)",
    categoryEn: "FinTech",
    categoryKm: "បច្ចេកវិទ្យាហិរញ្ញវត្ថុ",
  },
  "航空機械系": {
    zh: "航空機械系",
    en: "Dept. of Aviation Mechanical Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិកអាកាសចរណ៍",
    categoryEn: "Aviation Engineering",
    categoryKm: "មេកានិកអាកាសចរណ៍",
  },
  "航空電子系": {
    zh: "航空電子系",
    en: "Dept. of Aviation Electronics",
    km: "ដេប៉ាតឺម៉ង់អេឡិចត្រូនិចអាកាសចរណ៍",
    categoryEn: "Aviation Engineering",
    categoryKm: "អេឡិចត្រូនិចអាកាសចរណ៍",
  },
  "航空電子科": {
    zh: "航空電子科",
    en: "Aviation Electronics Division",
    km: "ផ្នែកអេឡិចត្រូនិចអាកាសចរណ៍",
    categoryEn: "Aviation",
    categoryKm: "អេឡិចត្រូនិចអាកាសចរណ៍",
  },
  "航空服務管理系": {
    zh: "航空服務管理系",
    en: "Dept. of Aviation Service & Flight Attendant Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងសេវាកម្មអាកាសចរណ៍ និងបដិសណ្ឋារកិច្ចលើយន្តហោះ",
    categoryEn: "Aviation & Service",
    categoryKm: "សេវាកម្មអាកាសចរណ៍",
  },
  "航空暨運輸服務管理系": {
    zh: "航空暨運輸服務管理系",
    en: "Dept. of Aviation and Transportation Service Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងសេវាកម្មអាកាសចរណ៍ និងដឹកជញ្ជូន",
    categoryEn: "Aviation & Logistics",
    categoryKm: "អាកាសចរណ៍ និងដឹកជញ្ជូន",
  },
  "航空光機電系": {
    zh: "航空光機電系",
    en: "Dept. of Aviation Optomechatronics Engineering",
    km: "ដេប៉ាតឺម៉ង់អុបទិក និងមេកាត្រូនិកអាកាសចរណ៍",
    categoryEn: "Aviation Engineering",
    categoryKm: "មេកាត្រូនិកអាកាសចរណ៍",
  },
  "飛機修護科": {
    zh: "飛機修護科",
    en: "Aircraft Maintenance Technology Division",
    km: "ផ្នែកជួសជុល និងថែទាំយន្តហោះ",
    categoryEn: "Aviation Maintenance",
    categoryKm: "ជួសជុល និងថែទាំយន្តហោះ",
  },
  "土木與防災工程系": {
    zh: "土木與防災工程系",
    en: "Dept. of Civil & Disaster Prevention Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មសំណង់ស៊ីវិល និងការពារគ្រោះមហន្តរាយ",
    categoryEn: "Civil Engineering",
    categoryKm: "សំណង់ស៊ីវិល",
  },
  "土木與空間資訊系": {
    zh: "土木與空間資訊系",
    en: "Dept. of Civil Engineering & Spatial Information",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មសំណង់ស៊ីវិល និងព័ត៌មានលំហ",
    categoryEn: "Civil & Geomatics",
    categoryKm: "សំណង់ និងព័ត៌មានលំហ",
  },
  "土木工程系": {
    zh: "土木工程系",
    en: "Dept. of Civil Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មសំណង់ស៊ីវិល",
    categoryEn: "Civil Engineering",
    categoryKm: "វិស្វកម្មសំណង់ស៊ីវិល",
  },
  "建築與室內設計系": {
    zh: "建築與室內設計系",
    en: "Dept. of Architecture and Interior Design",
    km: "ដេប៉ាតឺម៉ង់ស្ថាបត្យកម្ម និងរចនាផ្ទៃក្នុង",
    categoryEn: "Architecture & Design",
    categoryKm: "ស្ថាបត្យកម្ម និងផ្ទៃក្នុង",
  },
  "食品科學系": {
    zh: "食品科學系",
    en: "Dept. of Food Science",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រម្ហូបអាហារ",
    categoryEn: "Food Sciences",
    categoryKm: "វិទ្យាសាស្ត្រម្ហូបអាហារ",
  },
  "食品科技系": {
    zh: "食品科技系",
    en: "Dept. of Food Science and Technology",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យា និងវិទ្យាសាស្ត្រម្ហូបអាហារ",
    categoryEn: "Food Technology",
    categoryKm: "បច្ចេកវិទ្យាម្ហូបអាហារ",
  },
  "生物科技系": {
    zh: "生物科技系",
    en: "Dept. of Biotechnology",
    km: "ដេប៉ាតឺម៉ង់ជីវបច្ចេកវិទ្យា",
    categoryEn: "Biotechnology",
    categoryKm: "ជីវបច្ចេកវិទ្យា",
  },
  "醫學檢驗生物技術系": {
    zh: "醫學檢驗生物技術系",
    en: "Dept. of Medical Laboratory Science and Biotechnology",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រមន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ និងជីវបច្ចេកវិទ្យា",
    categoryEn: "Medical Laboratory",
    categoryKm: "មន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ",
  },
  "醫事檢驗生物技術系": {
    zh: "醫事檢驗生物技術系",
    en: "Dept. of Medical Laboratory Science and Biotechnology",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រមន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ និងជីវបច្ចេកវិទ្យា",
    categoryEn: "Medical Laboratory",
    categoryKm: "មន្ទីរពិសោធន៍វេជ្ជសាស្ត្រ",
  },
  "醫學影像暨放射科學系": {
    zh: "醫學影像暨放射科學系",
    en: "Dept. of Medical Imaging and Radiological Sciences",
    km: "ដេប៉ាតឺម៉ង់រូបភាពវេជ្ជសាស្ត្រ និងវិទ្យុសកម្ម (X-Ray/MRI)",
    categoryEn: "Radiological Sciences",
    categoryKm: "រូបភាពវេជ្ជសាស្ត្រ និងវិទ្យុសកម្ម",
  },
  "醫學影像暨放射技術系": {
    zh: "醫學影像暨放射技術系",
    en: "Dept. of Medical Imaging and Radiological Technology",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យារូបភាពវេជ្ជសាស្ត្រ និងវិទ្យុសកម្ម",
    categoryEn: "Radiological Technology",
    categoryKm: "រូបភាពវេជ្ជសាស្ត្រ និងវិទ្យុសកម្ម",
  },
  "牙體技術暨材料系": {
    zh: "牙體技術暨材料系",
    en: "Dept. of Dental Technology and Materials",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យា និងសម្ភារៈធ្មេញ (Dental Tech)",
    categoryEn: "Dental Technology",
    categoryKm: "បច្ចេកវិទ្យាធ្មេញ",
  },
  "視光系": {
    zh: "視光系",
    en: "Dept. of Optometry",
    km: "ដេប៉ាតឺម៉ង់វាស់ភ្នែក និងកែវភ្នែក (Optometry)",
    categoryEn: "Optometry",
    categoryKm: "វាស់ភ្នែក និងកែវភ្នែក",
  },
  "寵物保健系": {
    zh: "寵物保健系",
    en: "Dept. of Pet Healthcare and Grooming",
    km: "ដេប៉ាតឺម៉ង់ថែទាំសុខភាព និងសម្ផស្សសត្វចិញ្ចឹម",
    categoryEn: "Pet Healthcare",
    categoryKm: "ថែទាំសុខភាពសត្វចិញ្ចឹម",
  },
  "環境工程衛生系": {
    zh: "環境工程衛生系",
    en: "Dept. of Environmental Engineering and Health",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មបរិស្ថាន និងអនាម័យ",
    categoryEn: "Environmental Health",
    categoryKm: "វិស្វកម្មបរិស្ថាន",
  },
  "老人照顧系": {
    zh: "老人照顧系",
    en: "Dept. of Eldercare Management",
    km: "ដេប៉ាតឺម៉ង់ថែទាំសុខភាពមនុស្សចាស់",
    categoryEn: "Elderly Care",
    categoryKm: "ថែទាំមនុស្សចាស់",
  },
  "醫療暨健康產業管理系": {
    zh: "醫療暨健康產業管理系",
    en: "Dept. of Healthcare and Medical Industry Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងឧស្សាហកម្មវេជ្ជសាស្ត្រ និងសុខាភិបាល",
    categoryEn: "Healthcare Administration",
    categoryKm: "គ្រប់គ្រងសុខាភិបាល",
  },
  "醫務管理系": {
    zh: "醫務管理系",
    en: "Dept. of Healthcare Administration and Hospital Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងមន្ទីរពេទ្យ និងសេវាសុខាភិបាល",
    categoryEn: "Healthcare Administration",
    categoryKm: "គ្រប់គ្រងមន្ទីរពេទ្យ",
  },
  "健康事業管理系": {
    zh: "健康事業管理系",
    en: "Dept. of Health Business Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងអាជីវកម្មសុខាភិបាល",
    categoryEn: "Health Management",
    categoryKm: "គ្រប់គ្រងសុខាភិបាល",
  },
  "生物醫學工程系": {
    zh: "生物醫學工程系",
    en: "Dept. of Biomedical Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មជីវវេជ្ជសាស្ត្រ (Biomedical Engineering)",
    categoryEn: "Biomedical Engineering",
    categoryKm: "វិស្វកម្មជីវវេជ្ជសាស្ត្រ",
  },
  "食品營養系": {
    zh: "食品營養系",
    en: "Dept. of Food Science and Nutrition",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រម្ហូបអាហារ និងអាហារូបត្ថម្ភ",
    categoryEn: "Food & Nutrition",
    categoryKm: "ម្ហូបអាហារ និងអាហារូបត្ថម្ភ",
  },
  "食品保健系": {
    zh: "食品保健系",
    en: "Dept. of Food and Health Sciences",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រអាហារបំប៉ន និងសុខភាព",
    categoryEn: "Health Sciences",
    categoryKm: "អាហារបំប៉ន និងសុខភាព",
  },
  "服裝設計系": {
    zh: "服裝設計系",
    en: "Dept. of Fashion Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដសម្លៀកបំពាក់ (Fashion Design)",
    categoryEn: "Fashion Design",
    categoryKm: "រចនាម៉ូដសម្លៀកបំពាក់",
  },
  "流行設計系": {
    zh: "流行設計系",
    en: "Dept. of Fashion and Trend Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដទាន់សម័យ",
    categoryEn: "Fashion Design",
    categoryKm: "រចនាម៉ូដទាន់សម័យ",
  },
  "美容造型設計系": {
    zh: "美容造型設計系",
    en: "Dept. of Cosmetic Styling and Aesthetic Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដ និងតុបតែងកាយកែសម្ផស្ស",
    categoryEn: "Cosmetics & Styling",
    categoryKm: "កែសម្ផស្ស និងម៉ូដសក់",
  },
  "商品設計系": {
    zh: "商品設計系",
    en: "Dept. of Product and Industrial Design",
    km: "ដេប៉ាតឺម៉ង់រចនាផលិតផល និងទំនិញ",
    categoryEn: "Product Design",
    categoryKm: "រចនាផលិតផល",
  },
  "幼兒保育系": {
    zh: "幼兒保育系",
    en: "Dept. of Early Childhood Care and Education",
    km: "ដេប៉ាតឺម៉ង់គរុកោសល្យ និងថែទាំកុមារតូច",
    categoryEn: "Education",
    categoryKm: "គរុកោសល្យ និងកុមារ",
  },
  "幼兒保育科": {
    zh: "幼兒保育科",
    en: "Early Childhood Care Division",
    km: "ផ្នែកគរុកោសល្យ និងថែទាំកុមារតូច",
    categoryEn: "Education",
    categoryKm: "ថែទាំកុមារតូច",
  },
  "音樂系": {
    zh: "音樂系",
    en: "Dept. of Music",
    km: "ដេប៉ាតឺម៉ង់តន្ត្រី និងសិល្បៈចម្រៀង",
    categoryEn: "Music & Arts",
    categoryKm: "តន្ត្រី និងសិល្បៈ",
  },
  "舞蹈系": {
    zh: "舞蹈系",
    en: "Dept. of Dance",
    km: "ដេប៉ាតឺម៉ង់សិល្បៈរបាំ",
    categoryEn: "Performing Arts",
    categoryKm: "សិល្បៈរបាំ",
  },
  "機械與自動化工程系": {
    zh: "機械與自動化工程系",
    en: "Dept. of Mechanical and Automation Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក និងស្វ័យប្រវត្តិកម្ម",
    categoryEn: "Automation Engineering",
    categoryKm: "មេកានិក និងស្វ័យប្រវត្តិកម្ម",
  },
  "自動化工程系": {
    zh: "自動化工程系",
    en: "Dept. of Automation Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មស្វ័យប្រវត្តិកម្ម",
    categoryEn: "Automation Engineering",
    categoryKm: "វិស្វកម្មស្វ័យប្រវត្តិកម្ម",
  },
  "智慧科技應用系": {
    zh: "智慧科技應用系",
    en: "Dept. of Smart Technology Applications",
    km: "ដេប៉ាតឺម៉ង់ការអនុវត្តបច្ចេកវិទ្យាឆ្លាតវៃ",
    categoryEn: "Smart Technology",
    categoryKm: "បច្ចេកវិទ្យាឆ្លាតវៃ",
  },
  "數位機電工程系": {
    zh: "數位機電工程系",
    en: "Dept. of Digital Mechatronic Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកាត្រូនិកឌីជីថល",
    categoryEn: "Mechatronics",
    categoryKm: "មេកាត្រូនិកឌីជីថល",
  },
  "數位多媒體設計系": {
    zh: "數位多媒體設計系",
    en: "Dept. of Digital Multimedia Design",
    km: "ដេប៉ាតឺម៉ង់រចនាពហុមេឌាឌីជីថល",
    categoryEn: "Digital Media",
    categoryKm: "ពហុមេឌាឌីជីថល",
  },
  "視覺傳達設計系": {
    zh: "視覺傳达設計系",
    en: "Dept. of Visual Communication Design",
    km: "ដេប៉ាតឺម៉ង់រចនាប្រព័ន្ធទំនាក់ទំនងរូបភាព (Graphic Design)",
    categoryEn: "Visual Design",
    categoryKm: "រចនារូបភាព Graphic",
  },
  "觀光遊憩系": {
    zh: "觀光遊憩系",
    en: "Dept. of Tourism and Recreation",
    km: "ដេប៉ាតឺម៉ង់ទេសចរណ៍ និងលំហែកម្សាន្ត",
    categoryEn: "Tourism & Recreation",
    categoryKm: "ទេសចរណ៍ និងកម្សាន្ត",
  },
  "消防學系": {
    zh: "消防學系",
    en: "Dept. of Fire Science and Disaster Prevention",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រពន្លត់អគ្គិភ័យ និងបង្ការគ្រោះមហន្តរាយ",
    categoryEn: "Fire Science",
    categoryKm: "ពន្លត់អគ្គិភ័យ និងគ្រោះមហន្តរាយ",
  },
  "安全科技與管理系": {
    zh: "安全科技與管理系",
    en: "Dept. of Safety Technology and Management",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាសុវត្ថិភាព និងការគ្រប់គ្រង",
    categoryEn: "Safety Technology",
    categoryKm: "បច្ចេកវិទ្យាសុវត្ថិភាព",
  },
  "機械工程系車輛組": {
    zh: "機械工程系車輛組",
    en: "Dept. of Mechanical Engineering (Vehicle Division)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក (ផ្នែកយានយន្ត)",
    categoryEn: "Automotive Engineering",
    categoryKm: "មេកានិកយានយន្ត",
  },
  "機械工程系(車輛組)": {
    zh: "機械工程系(車輛組)",
    en: "Dept. of Mechanical Engineering (Automotive Section)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក (ផ្នែកយានយន្ត)",
    categoryEn: "Automotive Engineering",
    categoryKm: "មេកានិកយានយន្ត",
  },
  "機械工程系(先進車輛組)": {
    zh: "機械工程系(先進車輛組)",
    en: "Dept. of Mechanical Engineering (Advanced Vehicle Section)",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិក (ផ្នែកយានយន្តទំនើប)",
    categoryEn: "Automotive Engineering",
    categoryKm: "មេកានិកយានយន្តទំនើប",
  },
  "應用數位媒體系": {
    zh: "應用數位媒體系",
    en: "Dept. of Applied Digital Media",
    km: "ដេប៉ាតឺម៉ង់ប្រព័ន្ធផ្សព្វផ្សាយឌីជីថលអនុវត្តន៍",
    categoryEn: "Digital Media",
    categoryKm: "ប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល",
  },
  "觀光餐旅管理系": {
    zh: "觀光餐旅管理系",
    en: "Dept. of Tourism & Hospitality Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
    categoryEn: "Hospitality & Tourism",
    categoryKm: "ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
  },
  "觀光與餐旅管理系": {
    zh: "觀光與餐旅管理系",
    en: "Dept. of Tourism and Hospitality Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
    categoryEn: "Hospitality & Tourism",
    categoryKm: "ទេសចរណ៍ និងបដិសណ្ឋារកិច្ច",
  },
  "營建科技系": {
    zh: "營建科技系",
    en: "Dept. of Construction Engineering and Technology",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាសំណង់ និងសំណង់អាគារ",
    categoryEn: "Construction Engineering",
    categoryKm: "បច្ចេកវិទ្យាសំណង់",
  },
  "不動產經營系": {
    zh: "不動產經營系",
    en: "Dept. of Real Estate Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងអចលនទ្រព្យ",
    categoryEn: "Real Estate",
    categoryKm: "គ្រប់គ្រងអចលនទ្រព្យ",
  },
  "園藝與景觀設計系": {
    zh: "園藝與景觀設計系",
    en: "Dept. of Horticulture and Landscape Design",
    km: "ដេប៉ាតឺម៉ង់រចនាទេសភាព និងសាកវប្បកម្ម",
    categoryEn: "Landscape Architecture",
    categoryKm: "រចនាទេសភាព និងសួនច្បារ",
  },
  "電機與資訊技術系": {
    zh: "電機與資訊技術系",
    en: "Dept. of Electrical and Information Technology",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាអគ្គិសនី និងព័ត៌មានវិទ្យា",
    categoryEn: "Electrical & IT",
    categoryKm: "អគ្គិសនី និងព័ត៌មានវិទ្យា",
  },
  "長期照顧與健康促進系": {
    zh: "長期照顧與健康促進系",
    en: "Dept. of Long-Term Care and Health Promotion",
    km: "ដេប៉ាតឺម៉ង់ថែទាំមនុស្សចាស់រយៈពេលវែង និងលើកកម្ពស់សុខភាព",
    categoryEn: "Long-Term Care",
    categoryKm: "ថែទាំមនុស្សចាស់ និងសុខភាព",
  },
  "多媒體動畫設計系": {
    zh: "多媒體動畫設計系",
    en: "Dept. of Multimedia Animation Design",
    km: "ដេប៉ាតឺម៉ង់រចនាគំនូរជីវចលពហុមេឌា",
    categoryEn: "Animation Design",
    categoryKm: "គំនូរជីវចល និងអានីមេសិន",
  },
  "自動化工程系暨機電光系統": {
    zh: "自動化工程系暨機電光系統",
    en: "Dept. of Automation Engineering & Optomechatronics",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មស្វ័យប្រវត្តិកម្ម និងប្រព័ន្ធអុបទិកមេកាត្រូនិក",
    categoryEn: "Automation & Optomechatronics",
    categoryKm: "ស្វ័យប្រវត្តិកម្ម និងមេកាត្រូនិក",
  },
  "美容科技系": {
    zh: "美容科技系",
    en: "Dept. of Cosmetic Science and Technology",
    km: "ដេប៉ាតឺម៉ង់វិទ្យាសាស្ត្រ និងបច្ចេកវិទ្យាកែសម្ផស្ស",
    categoryEn: "Cosmetic Sciences",
    categoryKm: "បច្ចេកវិទ្យាកែសម្ផស្ស",
  },
  "空間設計系": {
    zh: "空間設計系",
    en: "Dept. of Spatial and Environmental Design",
    km: "ដេប៉ាតឺម៉ង់រចនាលំហ និងស្ថាបត្យកម្ម",
    categoryEn: "Spatial Design",
    categoryKm: "រចនាលំហ និងស្ថាបត្យកម្ម",
  },
  "數位媒體設計系": {
    zh: "數位媒體設計系",
    en: "Dept. of Digital Media Design",
    km: "ដេប៉ាតឺម៉ង់រចនាប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល",
    categoryEn: "Digital Media",
    categoryKm: "រចនាប្រព័ន្ធផ្សព្វផ្សាយឌីជីថល",
  },
  "觀光與休閒管理系": {
    zh: "觀光與休閒管理系",
    en: "Dept. of Tourism and Recreation Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងការកម្សាន្ត",
    categoryEn: "Tourism Management",
    categoryKm: "គ្រប់គ្រងទេសចរណ៍",
  },
  "社會工作系": {
    zh: "社會工作系",
    en: "Dept. of Social Work",
    km: "ដេប៉ាតឺម៉ង់ការងារសង្គម",
    categoryEn: "Social Work",
    categoryKm: "ការងារសង្គម",
  },
  "運動與休閒系": {
    zh: "運動與休閒系",
    en: "Dept. of Sports and Leisure",
    km: "ដេប៉ាតឺម៉ង់កីឡា និងលំហែកាយ",
    categoryEn: "Sports & Leisure",
    categoryKm: "កីឡា និងលំហែកាយ",
  },
  "工業工程與管理系": {
    zh: "工業工程與管理系",
    en: "Dept. of Industrial Engineering and Management",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មឧស្សាហកម្ម និងការគ្រប់គ្រង",
    categoryEn: "Industrial Engineering",
    categoryKm: "វិស្វកម្មឧស្សាហកម្ម",
  },
  "觀光與遊憩管理系": {
    zh: "觀光與遊憩管理系",
    en: "Dept. of Tourism and Recreation Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទេសចរណ៍ និងលំហែកម្សាន្ត",
    categoryEn: "Tourism Management",
    categoryKm: "ទេសចរណ៍ និងលំហែកម្សាន្ត",
  },
  "應用日語系": {
    zh: "應用日語系",
    en: "Dept. of Applied Japanese",
    km: "ដេប៉ាតឺម៉ង់ភាសាជប៉ុនអនុវត្តន៍",
    categoryEn: "Foreign Languages",
    categoryKm: "ភាសាជប៉ុន",
  },
  "應用日語科": {
    zh: "應用日語科",
    en: "Applied Japanese Division",
    km: "ផ្នែកភាសាជប៉ុនអនុវត្តន៍",
    categoryEn: "Languages",
    categoryKm: "ភាសាជប៉ុន",
  },
  "應用英語系": {
    zh: "應用英語系",
    en: "Dept. of Applied English",
    km: "ដេប៉ាតឺម៉ង់ភាសាអង់គ្លេសអនុវត្តន៍",
    categoryEn: "Foreign Languages",
    categoryKm: "ភាសាអង់គ្លេស",
  },
  "應用英語科": {
    zh: "應用英語科",
    en: "Applied English Division",
    km: "ផ្នែកភាសាអង់គ្លេសអនុវត្តន៍",
    categoryEn: "Languages",
    categoryKm: "ភាសាអង់គ្លេស",
  },
  "應用外語系": {
    zh: "應用外語系",
    en: "Dept. of Applied Foreign Languages",
    km: "ដេប៉ាតឺម៉ង់ភាសាបរទេសអនុវត្តន៍",
    categoryEn: "Foreign Languages",
    categoryKm: "ភាសាបរទេសអនុវត្តន៍",
  },
  "烘焙管理系": {
    zh: "烘焙管理系",
    en: "Dept. of Baking Technology and Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រង និងបច្ចេកវិទ្យាធ្វើនំប៉័ង",
    categoryEn: "Culinary Arts",
    categoryKm: "បច្ចេកវិទ្យាធ្វើនំប៉័ង",
  },
  "中餐廚藝系": {
    zh: "中餐廚藝系",
    en: "Dept. of Chinese Culinary Arts",
    km: "ដេប៉ាតឺម៉ង់សិល្បៈធ្វើម្ហូបចិន",
    categoryEn: "Culinary Arts",
    categoryKm: "សិល្បៈធ្វើម្ហូបចិន",
  },
  "西餐廚藝系": {
    zh: "西餐廚藝系",
    en: "Dept. of Western Culinary Arts",
    km: "ដេប៉ាតឺម៉ង់សិល្បៈធ្វើម្ហូបអឺរ៉ុប",
    categoryEn: "Culinary Arts",
    categoryKm: "សិល្បៈធ្វើម្ហូបអឺរ៉ុប",
  },
  "休閒暨遊憩管理系": {
    zh: "休閒暨遊憩管理系",
    en: "Dept. of Leisure and Recreation Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងការលំហែកាយ និងកម្សាន្ត",
    categoryEn: "Leisure & Recreation",
    categoryKm: "លំហែកាយ និងកម្សាន្ត",
  },
  "觀光事業系": {
    zh: "觀光事業系",
    en: "Dept. of Tourism Management",
    km: "ដេប៉ាតឺម៉ង់អាជីវកម្មទេសចរណ៍",
    categoryEn: "Tourism",
    categoryKm: "អាជីវកម្មទេសចរណ៍",
  },
  "冷凍空調與能源系": {
    zh: "冷凍空調與能源系",
    en: "Dept. of Refrigeration, Air Conditioning and Energy Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មម៉ាស៊ីនត្រជាក់ បន្ទប់ត្រជាក់ និងថាមពល",
    categoryEn: "Energy Engineering",
    categoryKm: "ម៉ាស៊ីនត្រជាក់ និងថាមពល",
  },
  "精密機械工程系": {
    zh: "精密機械工程系",
    en: "Dept. of Precision Mechanical Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មមេកានិកច្បាស់លាស់ (Precision Mechanical)",
    categoryEn: "Mechanical Engineering",
    categoryKm: "មេកានិកច្បាស់លាស់",
  },
  "視訊傳播設計系": {
    zh: "視訊傳播設計系",
    en: "Dept. of Motion Picture & Video Design",
    km: "ដេប៉ាតឺម៉ង់រចនាប្រព័ន្ធវីដេអូ និងភាពយន្ត",
    categoryEn: "Media & Film",
    categoryKm: "វីដេអូ និងភាពយន្ត",
  },
  "餐飲管理及廚藝系": {
    zh: "餐飲管理及廚藝系",
    en: "Dept. of Restaurant Management and Culinary Arts",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងភោជនីយដ្ឋាន និងសិល្បៈធ្វើម្ហូប",
    categoryEn: "Culinary Arts",
    categoryKm: "ភោជនីយដ្ឋាន និងធ្វើម្ហូប",
  },
  "旅遊文化發展系": {
    zh: "旅遊文化發展系",
    en: "Dept. of Tourism and Cultural Development",
    km: "ដេប៉ាតឺម៉ង់អភិវឌ្ឍន៍ទេសចរណ៍ និងវប្បធម៌",
    categoryEn: "Tourism & Culture",
    categoryKm: "ទេសចរណ៍ និងវប្បធម៌",
  },
  "電腦與通訊系": {
    zh: "電腦與通訊系",
    en: "Dept. of Computer and Communication",
    km: "ដេប៉ាតឺម៉ង់កុំព្យូទ័រ និងទូរគមនាគមន៍",
    categoryEn: "Computer & Comm",
    categoryKm: "កុំព្យូទ័រ និងទូរគមនាគមន៍",
  },
  "電腦與通訊工程系": {
    zh: "電腦與通訊工程系",
    en: "Dept. of Computer and Communication Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មកុំព្យូទ័រ និងទូរគមនាគមន៍",
    categoryEn: "Computer & Comm",
    categoryKm: "កុំព្យូទ័រ និងទូរគមនាគមន៍",
  },
  "行動商務與數位行銷系": {
    zh: "行動商務與數位行銷系",
    en: "Dept. of Mobile Commerce and Digital Marketing",
    km: "ដេប៉ាតឺម៉ង់ពាណិជ្ជកម្មចល័ត និងទីផ្សារឌីជីថល",
    categoryEn: "Digital Marketing",
    categoryKm: "ពាណិជ្ជកម្មចល័ត និងទីផ្សារឌីជីថល",
  },
  "時尚造型設計系": {
    zh: "時尚造型設計系",
    en: "Dept. of Fashion Styling and Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដ និងតុបតែងកាយទាន់សម័យ",
    categoryEn: "Fashion & Styling",
    categoryKm: "រចនាម៉ូដ និងតុបតែងកាយ",
  },
  "商業專案管理系": {
    zh: "商業專案管理系",
    en: "Dept. of Commercial Project Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងគម្រោងពាណិជ្ជកម្ម",
    categoryEn: "Project Management",
    categoryKm: "គ្រប់គ្រងគម្រោងពាណិជ្ជកម្ម",
  },
  "國際貿易系": {
    zh: "國際貿易系",
    en: "Dept. of International Trade",
    km: "ដេប៉ាតឺម៉ង់ពាណិជ្ជកម្មអន្តរជាតិ",
    categoryEn: "International Business",
    categoryKm: "ពាណិជ្ជកម្មអន្តរជាតិ",
  },
  "財務金融系": {
    zh: "財務金融系",
    en: "Dept. of Finance",
    km: "ដេប៉ាតឺម៉ង់ហិរញ្ញវត្ថុ និងធនាគារ",
    categoryEn: "Finance",
    categoryKm: "ហិរញ្ញវត្ថុ និងធនាគារ",
  },
  "資訊科技系": {
    zh: "資訊科技系",
    en: "Dept. of Information Technology",
    km: "ដេប៉ាតឺម៉ង់បច្ចេកវិទ្យាព័ត៌មាន (IT)",
    categoryEn: "Information Technology",
    categoryKm: "បច្ចេកវិទ្យាព័ត៌មាន",
  },
  "多媒體與遊戲設計系": {
    zh: "多媒體與遊戲設計系",
    en: "Dept. of Multimedia and Game Design",
    km: "ដេប៉ាតឺម៉ង់ពហុមេឌា និងរចនាហ្គេមកុំព្យូទ័រ",
    categoryEn: "Game Design",
    categoryKm: "ពហុមេឌា និងហ្គេម",
  },
  "口腔衛生照護系": {
    zh: "口腔衛生照護系",
    en: "Dept. of Oral Health Care",
    km: "ដេប៉ាតឺម៉ង់ថែទាំសុខភាពមាត់ធ្មេញ",
    categoryEn: "Dental Health",
    categoryKm: "សុខភាពមាត់ធ្មេញ",
  },
  "美容流行設計系": {
    zh: "美容流行設計系",
    en: "Dept. of Cosmetic and Trend Design",
    km: "ដេប៉ាតឺម៉ង់កែសម្ផស្ស និងរចនាម៉ូដទាន់សម័យ",
    categoryEn: "Cosmetics & Fashion",
    categoryKm: "កែសម្ផស្ស និងម៉ូដ",
  },
  "高齡照顧福利系": {
    zh: "高齡照顧福利系",
    en: "Dept. of Senior Welfare and Healthcare",
    km: "ដេប៉ាតឺម៉ង់សុខុមាលភាព និងថែទាំមនុស្សចាស់",
    categoryEn: "Senior Welfare",
    categoryKm: "សុខុមាលភាពមនុស្សចាស់",
  },
  "財稅系": {
    zh: "財稅系",
    en: "Dept. of Public Finance and Taxation",
    km: "ដេប៉ាតឺម៉ង់ហិរញ្ញវត្ថុសាធារណៈ និងពន្ធដារ",
    categoryEn: "Taxation & Finance",
    categoryKm: "ពន្ធដារ និងហិរញ្ញវត្ថុ",
  },
  "會計資訊系": {
    zh: "會計資訊系",
    en: "Dept. of Accounting Information",
    km: "ដេប៉ាតឺម៉ង់ព័ត៌មានវិទ្យាគណនេយ្យ",
    categoryEn: "Accounting",
    categoryKm: "ព័ត៌មានវិទ្យាគណនេយ្យ",
  },
  "行銷管理系": {
    zh: "行銷管理系",
    en: "Dept. of Marketing Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងទីផ្សារ",
    categoryEn: "Marketing",
    categoryKm: "គ្រប់គ្រងទីផ្សារ",
  },
  "多媒體設計系": {
    zh: "多媒體設計系",
    en: "Dept. of Multimedia Design",
    km: "ដេប៉ាតឺម៉ង់រចនាពហុមេឌា",
    categoryEn: "Multimedia Design",
    categoryKm: "រចនាពហុមេឌា",
  },
  "動畫與遊戲設計系": {
    zh: "動畫與遊戲設計系",
    en: "Dept. of Animation and Game Design",
    km: "ដេប៉ាតឺម៉ង់រចនាគំនូរជីវចល និងហ្គេម (Animation & Games)",
    categoryEn: "Animation & Gaming",
    categoryKm: "គំនូរជីវចល និងហ្គេម",
  },
  "演藝事業系": {
    zh: "演藝事業系",
    en: "Dept. of Performing Arts Industry",
    km: "ដេប៉ាតឺម៉ង់ឧស្សាហកម្មសិល្បៈសម្តែង",
    categoryEn: "Performing Arts",
    categoryKm: "ឧស្សាហកម្មសិល្បៈសម្តែង",
  },
  "電競產業管理學士學位學程": {
    zh: "電競產業管理學士學位學程",
    en: "Program of Esports Industry Management",
    km: "ដេប៉ាតឺម៉ង់គ្រប់គ្រងឧស្សាហកម្មកីឡាអេឡិចត្រូនិក (E-Sports)",
    categoryEn: "Esports Management",
    categoryKm: "ឧស្សាហកម្មកីឡាអេឡិចត្រូនិក",
  },
  "兒童與家庭服務系": {
    zh: "兒童與家庭服務系",
    en: "Dept. of Child and Family Services",
    km: "ដេប៉ាតឺម៉ង់សេវាកុមារ និងគ្រួសារ",
    categoryEn: "Family Studies",
    categoryKm: "សេវាកុមារ និងគ្រួសារ",
  },
  "遊戲產學學士學位學程": {
    zh: "遊戲產學學士學位學程",
    en: "Degree Program in Game Industry-Academia Development",
    km: "ដេប៉ាតឺម៉ង់អភិវឌ្ឍន៍ហ្គេម និងឧស្សាហកម្មកម្សាន្ត",
    categoryEn: "Game Development",
    categoryKm: "អភិវឌ្ឍន៍ហ្គេម",
  },
  "數位行銷跨境電商系": {
    zh: "數位行銷跨境電商系",
    en: "Dept. of Digital Marketing and Cross-Border E-Commerce",
    km: "ដេប៉ាតឺម៉ង់ទីផ្សារឌីជីថល និងពាណិជ្ជកម្មអេឡិចត្រូនិកឆ្លងដែន",
    categoryEn: "E-Commerce",
    categoryKm: "ទីផ្សារឌីជីថល និង E-Commerce",
  },
  "材料與纖維系": {
    zh: "材料與纖維系",
    en: "Dept. of Materials and Textile Engineering",
    km: "ដេប៉ាតឺម៉ង់វិស្វកម្មសម្ភារៈ និងសរសៃវាយនភ័ណ្ឌ",
    categoryEn: "Materials & Textile",
    categoryKm: "សម្ភារៈ និងវាយនភ័ណ្ឌ",
  },
  "工業設計系": {
    zh: "工業設計系",
    en: "Dept. of Industrial Design",
    km: "ដេប៉ាតឺម៉ង់រចនាផលិតផលឧស្សាហកម្ម (Industrial Design)",
    categoryEn: "Industrial Design",
    categoryKm: "រចនាឧស្សាហកម្ម",
  },
  "美髮造型設計系": {
    zh: "美髮造型設計系",
    en: "Dept. of Hair Styling and Salon Design",
    km: "ដេប៉ាតឺម៉ង់រចនាម៉ូដសក់ និងតុបតែងកាយ",
    categoryEn: "Hair & Beauty",
    categoryKm: "ម៉ូដសក់ និងសម្រស់",
  },
  "建築系": {
    zh: "建築系",
    en: "Dept. of Architecture",
    km: "ដេប៉ាតឺម៉ង់ស្ថាបត្យកម្ម",
    categoryEn: "Architecture",
    categoryKm: "ស្ថាបត្យកម្ម",
  },
  "綠能技術科": {
    zh: "綠能技術科",
    en: "Green Energy Technology Division",
    km: "ផ្នែកបច្ចេកវិទ្យាថាមពលបៃតង (Green Energy)",
    categoryEn: "Clean Energy",
    categoryKm: "ថាមពលបៃតង",
  },
  "電子競技科": {
    zh: "電子競技科",
    en: "Esports Technology Division",
    km: "ផ្នែកកីឡាអេឡិចត្រូនិក (E-Sports)",
    categoryEn: "Esports",
    categoryKm: "កីឡាអេឡិចត្រូនិក",
  },
  "動畫遊戲科": {
    zh: "動畫遊戲科",
    en: "Animation & Game Design Division",
    km: "ផ្នែកគំនូរជីវចល និងហ្គេមកុំព្យូទ័រ",
    categoryEn: "Animation & Gaming",
    categoryKm: "គំនូរជីវចល និងហ្គេម",
  },
  "流行服飾科": {
    zh: "流行服飾科",
    en: "Fashion & Apparel Design Division",
    km: "ផ្នែករចនាម៉ូតសម្លៀកបំពាក់ទាន់សម័យ",
    categoryEn: "Fashion Design",
    categoryKm: "ម៉ូតសម្លៀកបំពាក់",
  },
  "廣告設計科": {
    zh: "廣告設計科",
    en: "Advertising Design Division",
    km: "ផ្នែករចនាផ្សាយពាណិជ្ជកម្ម",
    categoryEn: "Advertising",
    categoryKm: "រចនាផ្សាយពាណិជ្ជកម្ម",
  },
  "廣告技術科": {
    zh: "廣告技術科",
    en: "Advertising Technology Division",
    km: "ផ្នែកបច្ចេកវិទ្យាផ្សាយពាណិជ្ជកម្ម",
    categoryEn: "Advertising Tech",
    categoryKm: "បច្ចេកវិទ្យាផ្សាយពាណិជ្ជកម្ម",
  },
  "普通科": {
    zh: "普通科",
    en: "General Academic Division",
    km: "ផ្នែកចំណេះដឹងទូទៅ (វិទ្យាសាស្ត្រពិត/សង្គម)",
    categoryEn: "General Studies",
    categoryKm: "ចំណេះទូទៅ",
  },
  "多媒體應用科": {
    zh: "多媒體應用科",
    en: "Multimedia Application Division",
    km: "ផ្នែកអនុវត្តន៍ពហុមេឌា",
    categoryEn: "Multimedia",
    categoryKm: "ពហុមេឌា",
  },
  "電影電視科": {
    zh: "電影電視科",
    en: "Cinema & Television Production Division",
    km: "ផ្នែកផលិតភាពយន្ត និងទូរទស្សន៍",
    categoryEn: "Film & TV",
    categoryKm: "ភាពយន្ត និងទូរទស្សន៍",
  },
  "音樂科": {
    zh: "音樂科",
    en: "Music Division",
    km: "ផ្នែកតន្ត្រី និងឧបករណ៍ភ្លេង",
    categoryEn: "Music",
    categoryKm: "តន្ត្រី",
  },
  "機電科": {
    zh: "機電科",
    en: "Mechatronics Division",
    km: "ផ្នែកមេកាត្រូនិក (មេកានិក + អគ្គិសនី)",
    categoryEn: "Mechatronics",
    categoryKm: "មេកាត្រូនិក",
  },
};

/**
 * Fuzzy or exact match for school translation
 */
export function getSchoolTranslation(name?: string): SchoolTranslation | null {
  if (!name || !name.trim()) return null;
  const cleanSpacing = (str: string) =>
    str.replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();
  const trimmed = name.trim();
  const normalized = cleanSpacing(trimmed);

  const findStaticBase = (): SchoolTranslation | null => {
    if (SCHOOL_TRANSLATIONS[trimmed]) {
      return SCHOOL_TRANSLATIONS[trimmed];
    }
    for (const [key, val] of Object.entries(SCHOOL_TRANSLATIONS)) {
      if (cleanSpacing(key) === normalized) {
        return val;
      }
    }
    if (normalized.includes('中信')) {
      return SCHOOL_TRANSLATIONS['中信科技大學'] || SCHOOL_TRANSLATIONS['臺南市新市區中華路49號 中信金學校財團法人中信科技大學'] || null;
    }
    if (normalized.includes('中華科')) {
      return SCHOOL_TRANSLATIONS['中華科技大學'] || SCHOOL_TRANSLATIONS['臺北市南港區研究院路三段 245號 中華學校財團法人中華科技大學'] || null;
    }
    if (normalized.includes('中臺') || normalized.includes('中台')) {
      return SCHOOL_TRANSLATIONS['中臺科技大學'] || SCHOOL_TRANSLATIONS['臺中市北屯區廍子路666號 中臺科技大學'] || null;
    }
    if (normalized.includes('立志') || normalized.includes('志高級')) {
      return SCHOOL_TRANSLATIONS['高雄市立 志高級中學'] || SCHOOL_TRANSLATIONS['高雄市立 立志高級中學'] || null;
    }
    for (const [key, val] of Object.entries(SCHOOL_TRANSLATIONS)) {
      const cleanKey = cleanSpacing(key);
      if (normalized.includes(cleanKey) || cleanKey.includes(normalized)) {
        return val;
      }
      if (val.shortZh && normalized.includes(val.shortZh)) {
        return val;
      }
      if (val.en.toLowerCase().includes(normalized.toLowerCase()) || normalized.toLowerCase().includes(val.en.toLowerCase())) {
        return val;
      }
    }
    const coreKey = normalized
      .replace(/(高雄市|臺北市|臺南市|桃園市|嘉義市|新竹縣|新竹市|臺中市|新北市|嘉義縣|雲林縣|台湾|宜蘭縣|私立|市立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段|新市區|中華路49號|南港區|研究院路三段|245號|北屯區|廍子路666號|中信金學校財團法人|中華學校財團法人)/g, '')
      .trim();

    if (coreKey) {
      for (const [key, val] of Object.entries(SCHOOL_TRANSLATIONS)) {
        if (cleanSpacing(key).includes(coreKey)) return val;
      }
    }
    return null;
  };

  const base = findStaticBase();
  const cachedLogo = dbStorage.getCachedSchoolLogo(normalized);
  const logoDeleted = dbStorage.isSchoolLogoDeleted(normalized);

  // Merge custom translation overrides if present
  try {
    const customRaw = localStorage.getItem('sms_custom_translations_v2');
    if (customRaw) {
      const customStore = JSON.parse(customRaw);
      const c = customStore?.schools?.[normalized] || customStore?.schools?.[trimmed];
      if (c) {
        return {
          zh: base?.zh || trimmed,
          shortZh: c.shortZh || base?.shortZh || trimmed,
          en: c.en || base?.en || trimmed,
          km: c.km || base?.km || trimmed,
          locationEn: c.locationEn || base?.locationEn || "Taiwan",
          locationKm: c.locationKm || base?.locationKm || "ប្រទេសតៃវ៉ាន់",
          levelEn: c.levelEn || base?.levelEn || "Institution",
          levelKm: c.levelKm || base?.levelKm || "គ្រឹះស្ថានអប់រំ",
          logoUrl: logoDeleted ? undefined : (cachedLogo || c.logoUrl || base?.logoUrl),
        };
      }
    }
  } catch (e) {
    // Ignore JSON error
  }

  if (base) {
    return {
      ...base,
      logoUrl: logoDeleted ? undefined : (cachedLogo || base.logoUrl),
    };
  }

  return {
    zh: trimmed,
    en: trimmed,
    km: trimmed,
    locationEn: "Taiwan",
    locationKm: "ប្រទេសតៃវ៉ាន់",
    levelEn: "Institution",
    levelKm: "គ្រឹះស្ថានអប់រំ",
    logoUrl: logoDeleted ? undefined : cachedLogo,
  };
}

/**
 * Fuzzy or exact match for major translation
 */
export function getMajorTranslation(name?: string): MajorTranslation | null {
  if (!name || !name.trim()) return null;
  const trimmed = name.trim();

  // 0. Check custom translations in localStorage first
  try {
    const customRaw = localStorage.getItem('sms_custom_translations_v2');
    if (customRaw) {
      const customStore = JSON.parse(customRaw);
      if (customStore?.majors?.[trimmed]) {
        const c = customStore.majors[trimmed];
        return {
          zh: trimmed,
          en: c.en || trimmed,
          km: c.km || trimmed,
          categoryEn: c.categoryEn || "Specialization",
          categoryKm: c.categoryKm || "ជំនាញសិក្សា",
        };
      }
    }
  } catch (e) {
    // Ignore JSON error
  }

  // 1. Direct match
  if (MAJOR_TRANSLATIONS[trimmed]) {
    return MAJOR_TRANSLATIONS[trimmed];
  }

  // 2. Partial match
  for (const [key, val] of Object.entries(MAJOR_TRANSLATIONS)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return val;
    }
    if (val.en.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(val.en.toLowerCase())) {
      return val;
    }
  }

  // Fallback
  return {
    zh: trimmed,
    en: trimmed,
    km: trimmed,
    categoryEn: "Specialization",
    categoryKm: "ជំនាញសិក្សា",
  };
}

/**
 * Generate formatted multi-line title attribute with Khmer, English and Chinese
 */
export function getTranslationTitle(name?: string, type: 'school' | 'major' = 'school'): string {
  if (!name || !name.trim()) return '';
  if (type === 'school') {
    const school = getSchoolTranslation(name);
    if (!school) return name;
    return `🇰🇭 ខ្មែរ: ${school.km}\n🇬🇧 EN: ${school.en}\n🇹🇼 中文: ${school.zh}`;
  } else {
    const major = getMajorTranslation(name);
    if (!major) return name;
    return `🇰🇭 ខ្មែរ: ${major.km}\n🇬🇧 EN: ${major.en}\n🇹🇼 中文: ${major.zh}`;
  }
}
