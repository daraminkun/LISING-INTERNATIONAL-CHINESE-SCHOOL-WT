/**
 * School and Major Translation Dictionary
 * Provides complete Khmer (ភាសាខ្មែរ) and English translations for all
 * target schools and vocational / university majors in Taiwan.
 */

export interface SchoolTranslation {
  zh: string;
  shortZh?: string;
  en: string;
  km: string;
  locationEn: string;
  locationKm: string;
  levelEn: string;
  levelKm: string;
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
  // Lising International Chinese School / សាលារៀនចិនលីស៊ីងអន្តរជាតិ / 日興國際學校
  "日興國際學校": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលីស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  "សាលារៀនចិនលីស៊ីងអន្តរជាតិ": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលីស៊ីងអន្តរជាតិ",
    locationEn: "Phnom Penh, Cambodia",
    locationKm: "រាជធានីភ្នំពេញ ប្រទេសកម្ពុជា",
    levelEn: "International Chinese School",
    levelKm: "សាលារៀនចិនអន្តរជាតិ",
  },
  "LISING INTERNATIONAL CHINESE SCHOOL": {
    zh: "日興國際學校",
    shortZh: "日興國際",
    en: "Lising International Chinese School",
    km: "សាលារៀនចិនលីស៊ីងអន្តរជាតិ",
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
  // 18. 輔英科技大學
  "台灣高雄市大寮區 輔英科技大學": {
    zh: "台灣高雄市大寮區 輔英科技大學",
    shortZh: "輔英科大",
    en: "Fooyin University (Kaohsiung)",
    km: "សាកលវិទ្យាល័យបច្ចេកវិទ្យា ហ្វូយីន (ក្រុងកៅសុង)",
    locationEn: "Kaohsiung City, Taiwan",
    locationKm: "រាជធានីកៅសុង ប្រទេសតៃវ៉ាន់",
    levelEn: "University / College (Age 26-27)",
    levelKm: "កម្រិតសាកលវិទ្យាល័យ / មហាវិទ្យាល័យ (អាយុ ២៦-២៧ឆ្នាំ)",
  },
  // 19. 黎明技術學院
  "台灣新北市泰山區 黎明技術學院": {
    zh: "台灣新北市泰山區 黎明技術學院",
    shortZh: "黎明學院",
    en: "Lee-Ming Institute of Technology (New Taipei)",
    km: "វិទ្យាស្ថានបច្ចេកវិទ្យា លីមីង (ក្រុងញូវតៃប៉ិ)",
    locationEn: "New Taipei City, Taiwan",
    locationKm: "ក្រុងញូវតៃប៉ិ ប្រទេសតៃវ៉ាន់",
    levelEn: "College of Technology (Age 26-27)",
    levelKm: "កម្រិតវិទ្យាស្ថានបច្ចេកវិទ្យា (អាយុ ២៦-២៧ឆ្នាំ)",
  },
  // 20. 聖母醫護管理專科學校
  "宜蘭縣三星鄉三星路二段 聖母醫護管理專科學校": {
    zh: "宜蘭縣三星鄉三星路二段 聖母醫護管理專科學校",
    shortZh: "聖母專校",
    en: "St. Mary's Junior College of Medicine and Nursing (Yilan)",
    km: "មហាវិទ្យាល័យវេជ្ជសាស្ត្រ និងគិលានុបដ្ឋាក សាំងម៉ារី (ខេត្តយីឡាន)",
    locationEn: "Yilan County, Taiwan",
    locationKm: "ខេត្តយីឡាន ប្រទេសតៃវ៉ាន់",
    levelEn: "Medical & Nursing College (Age 26-27)",
    levelKm: "កម្រិតមហាវិទ្យាល័យវេជ្ជសាស្ត្រ & ថែទាំ (អាយុ ២៦-២៧ឆ្នាំ)",
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
};

/**
 * Fuzzy or exact match for school translation
 */
export function getSchoolTranslation(name?: string): SchoolTranslation | null {
  if (!name || !name.trim()) return null;
  const trimmed = name.trim();

  // 0. Check custom translations in localStorage first
  try {
    const customRaw = localStorage.getItem('sms_custom_translations_v2');
    if (customRaw) {
      const customStore = JSON.parse(customRaw);
      if (customStore?.schools?.[trimmed]) {
        const c = customStore.schools[trimmed];
        return {
          zh: trimmed,
          shortZh: c.shortZh || trimmed,
          en: c.en || trimmed,
          km: c.km || trimmed,
          locationEn: c.locationEn || "Taiwan",
          locationKm: c.locationKm || "ប្រទេសតៃវ៉ាន់",
          levelEn: c.levelEn || "Institution",
          levelKm: c.levelKm || "គ្រឹះស្ថានអប់រំ",
        };
      }
    }
  } catch (e) {
    // Ignore JSON error
  }

  // 1. Direct key match
  if (SCHOOL_TRANSLATIONS[trimmed]) {
    return SCHOOL_TRANSLATIONS[trimmed];
  }

  // 2. Partial match in keys
  for (const [key, val] of Object.entries(SCHOOL_TRANSLATIONS)) {
    if (trimmed.includes(key) || key.includes(trimmed)) {
      return val;
    }
    if (val.shortZh && trimmed.includes(val.shortZh)) {
      return val;
    }
    if (val.en.toLowerCase().includes(trimmed.toLowerCase()) || trimmed.toLowerCase().includes(val.en.toLowerCase())) {
      return val;
    }
  }

  // 3. Normalized stripped match
  const coreKey = trimmed
    .replace(/(高雄市|臺南市|桃園市|嘉義市|新竹縣|臺中市|新北市|嘉義縣|台灣|宜蘭縣|私立|區|鄉|路|段|號|臺灣大道六段|沙鹿區|湖口鄉|中山路三段|龜山區|萬壽路一段|板橋區|四川路二段58號|大寮區|泰山區|三星鄉|三星路二段)/g, '')
    .trim();

  if (coreKey) {
    for (const [key, val] of Object.entries(SCHOOL_TRANSLATIONS)) {
      if (key.includes(coreKey)) return val;
    }
  }

  // Fallback if not found: create a structured object
  return {
    zh: trimmed,
    en: trimmed,
    km: trimmed,
    locationEn: "Taiwan",
    locationKm: "ប្រទេសតៃវ៉ាន់",
    levelEn: "Institution",
    levelKm: "គ្រឹះស្ថានអប់រំ",
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
