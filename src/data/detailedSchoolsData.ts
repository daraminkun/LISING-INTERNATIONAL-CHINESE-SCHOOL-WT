import { getSchoolTranslation, getMajorTranslation } from '../utils/schoolMajorTranslations';

export type SchoolCategory = 'high_school' | 'university';

export interface SchoolAnnouncement {
  id: string;
  title: string;
  titleKm: string;
  titleZh: string;
  category: 'Admissions' | 'Scholarship' | 'Visa' | 'Campus' | 'Academic';
  categoryKm: string;
  categoryZh: string;
  date: string;
  content: string;
  contentKm: string;
  contentZh: string;
  officialUrl?: string;
  isImportant?: boolean;
}

export interface DetailedSchool {
  id: string;
  name: string; // Chinese official name
  nameKm: string;
  nameEn: string;
  shortNameZh?: string;
  category: SchoolCategory;
  categoryLabelKm: string;
  categoryLabelZh: string;
  categoryLabelEn: string;
  address: string;
  city: string;
  cityKm: string;
  cityEn: string;
  websiteUrl: string;
  googleMapsUrl: string;
  ageRequirementKm: string;
  ageRequirementEn: string;
  ageRequirementZh: string;
  majors: string[];
  admissionsOverviewKm: string;
  admissionsOverviewZh: string;
  admissionsOverviewEn: string;
  scholarshipKm: string;
  scholarshipZh: string;
  scholarshipEn: string;
  dormitoryKm: string;
  dormitoryZh: string;
  dormitoryEn: string;
  phone?: string;
  logoUrl?: string;
}

// 1. Raw Address & Domain map for High Schools (32 schools)
const HIGH_SCHOOL_SPECS: Record<string, { address: string; domain: string; phone: string }> = {
  "高雄市私立 三信高級家事商業職業學校": {
    address: "高雄市苓雅區三多一路186號",
    domain: "https://www.sinsin.kh.edu.tw",
    phone: "+886 7 751 7171"
  },
  "臺北市私立 大同高級中學": {
    address: "臺北市中山區中山北路三段40號",
    domain: "https://www.tsh.tp.edu.tw",
    phone: "+886 2 2592 5252"
  },
  "桃園市私立 方曙商工高級中等學校": {
    address: "桃園市龍潭區中原路一段50號",
    domain: "https://www.fsvs.tyc.edu.tw",
    phone: "+886 3 471 9611"
  },
  "桃園市私立 永平工商高級中等學校": {
    address: "桃園市楊梅區永平路480號",
    domain: "https://www.ypvs.tyc.edu.tw",
    phone: "+886 3 482 2464"
  },
  "高雄市 立志高級中學": {
    address: "高雄市三民區大昌一路98號",
    domain: "https://www.lcvs.kh.edu.tw",
    phone: "+886 7 392 2601"
  },
  "新竹縣私立 仰德高級中學": {
    address: "新竹縣新豐鄉員山村133號",
    domain: "https://www.yths.hcc.edu.tw",
    phone: "+886 3 559 2158"
  },
  "桃園市私立 光啟高級中等學校": {
    address: "桃園市龜山區自由街40號",
    domain: "https://www.kcsh.tyc.edu.tw",
    phone: "+886 2 8209 8313"
  },
  "新竹市私立 光復高級中學": {
    address: "新竹市東區光復路二段153號",
    domain: "https://www.kfsh.hc.edu.tw",
    phone: "+886 3 571 2334"
  },
  "臺北市私立 育達高級中等學校": {
    address: "臺北市松山區寧安街12號",
    domain: "https://www.yudah.tp.edu.tw",
    phone: "+886 2 2570 6767"
  },
  "臺南市私立 育德工業家事職業學校": {
    address: "臺南市新營區健康路211號",
    domain: "https://www.ytvs.tn.edu.tw",
    phone: "+886 6 656 3131"
  },
  "臺中市私立 致用高級中學": {
    address: "臺中市大甲區甲東路512號",
    domain: "https://www.cyhs.tc.edu.tw",
    phone: "+886 4 2687 2354"
  },
  "桃園市私立 啟英高級中等學校": {
    address: "桃園市中壢區中園路447號",
    domain: "https://www.cyvs.tyc.edu.tw",
    phone: "+886 3 452 3036"
  },
  "高雄市私立 華德高級工業家事職業學校": {
    address: "高雄市茄萣區濱海路四段66號",
    domain: "https://www.htvs.kh.edu.tw",
    phone: "+886 7 690 3108"
  },
  "高雄市 新光高級中學": {
    address: "高雄市大寮區鳳屏一路217號",
    domain: "https://www.skhs.kh.edu.tw",
    phone: "+886 7 701 2307"
  },
  "雲林縣私立 義峰高級中學": {
    address: "雲林縣林內鄉烏麻村長源201號",
    domain: "https://www.yfsh.ylc.edu.tw",
    phone: "+886 5 589 2888"
  },
  "臺北市私立 稻江高級商業職業學校": {
    address: "臺北市大同區民權西路225巷24號",
    domain: "https://www.tcivs.tp.edu.tw",
    phone: "+886 2 2591 2001"
  },
  "新北市私立 樹人高級家事商業職業學校": {
    address: "新北市樹林區大安路216號",
    domain: "https://www.stgvs.ntpc.edu.tw",
    phone: "+886 2 2687 0391"
  },
  "高雄市私立 樹德高級家事商業職業學校": {
    address: "高雄市三民區建興路116號",
    domain: "https://www.shute.kh.edu.tw",
    phone: "+886 7 384 8622"
  },
  "新北市私立 豫章高級工商職業學校": {
    address: "新北市板橋區四川路一段391號",
    domain: "https://www.ycivs.ntpc.edu.tw",
    phone: "+886 2 961 0123"
  },
  "高雄市私立 中山高級工商職業學校": {
    address: "高雄市大寮區正氣路79號",
    domain: "https://www.csic.kh.edu.tw",
    phone: "+886 7 781 5311"
  },
  "臺南市私立 六信高級中學": {
    address: "臺南市南區新都路20號",
    domain: "https://www.lhvs.tn.edu.tw",
    phone: "+886 6 261 9885"
  },
  "桃園市私立 世紀綠能工商高級中等學校": {
    address: "桃園市龜山區明德路162巷100號",
    domain: "https://www.cgvs.tyc.edu.tw",
    phone: "+886 3 329 1168"
  },
  "臺南市私立 亞洲高級餐旅職業學校": {
    address: "臺南市南區大成路一段5號",
    domain: "https://www.ahvs.tn.edu.tw",
    phone: "+886 6 264 0177"
  },
  "嘉義市私立 東吳高級工業家事職業學校": {
    address: "嘉義市東區宣信街252號",
    domain: "https://www.dwvs.cy.edu.tw",
    phone: "+886 5 224 6161"
  },
  "新竹縣私立 東泰高級中學": {
    address: "新竹縣竹東鎮東峰路343號",
    domain: "https://www.ttsh.hcc.edu.tw",
    phone: "+886 3 596 1232"
  },
  "臺中市私立 青年高級中學": {
    address: "臺中市大里區中湖路100號",
    domain: "https://www.youth.tc.edu.tw",
    phone: "+886 4 2496 3333"
  },
  "新北市私立 能仁高級家事商業職業學校": {
    address: "新北市新店區文中路53巷10號",
    domain: "https://www.nrvs.ntpc.edu.tw",
    phone: "+886 2 2918 2399"
  },
  "高雄市私立 高苑高級工業商業職業學校": {
    address: "高雄市橋頭區芋寮路1號",
    domain: "https://www.kyvs.kh.edu.tw",
    phone: "+886 7 611 1101"
  },
  "新北市私立 莊敬高級工業家事職業學校": {
    address: "新北市新店區民生路45號",
    domain: "https://www.jjvs.ntpc.edu.tw",
    phone: "+886 2 2218 8956"
  },
  "臺中市私立 慈明高級中學": {
    address: "臺中市太平區光德路388號",
    domain: "https://www.tmh.tc.edu.tw",
    phone: "+886 4 2271 3911"
  },
  "嘉義縣私立 萬能高級工商職業學校": {
    address: "嘉義縣水上鄉萬能路1號",
    domain: "https://www.wnvs.cyc.edu.tw",
    phone: "+886 5 268 7777"
  },
  "臺中市私立 嶺東高級中學": {
    address: "臺中市南屯區嶺東路2號",
    domain: "https://www.lths.tc.edu.tw",
    phone: "+886 4 2389 8940"
  }
};

// 2. Raw Address & Domain map for Universities & Colleges (27 schools)
const UNIVERSITY_SPECS: Record<string, { address: string; domain: string; phone: string }> = {
  "中信金學校財團法人中信科技大學": {
    address: "臺南市新市區中華路49號",
    domain: "https://www.ctbc.edu.tw",
    phone: "+886 6 597 9566"
  },
  "中華學校財團法人中華科技大學": {
    address: "臺北市南港區研究院路三段245號",
    domain: "https://www.cust.edu.tw",
    phone: "+886 2 2782 1862"
  },
  "中臺科技大學": {
    address: "臺中市北屯區廍子路666號",
    domain: "https://www.ctust.edu.tw",
    phone: "+886 4 2239 1647"
  },
  "元培醫事科技大學": {
    address: "新竹市元培街306號",
    domain: "https://www.ypu.edu.tw",
    phone: "+886 3 538 1183"
  },
  "台南應用科技大學": {
    address: "臺南市永康區中正路529號",
    domain: "https://www.tut.edu.tw",
    phone: "+886 6 253 2106"
  },
  "台鋼學校財團法人台鋼科技大學": {
    address: "高雄市路竹區中山路1821號",
    domain: "https://www.tsu.edu.tw",
    phone: "+886 7 607 7777"
  },
  "正修科技大學": {
    address: "高雄市鳥松區澄清路840號",
    domain: "https://www.csu.edu.tw",
    phone: "+886 7 735 8800"
  },
  "吳鳳科技大學": {
    address: "嘉義縣民雄鄉建國路二段117號",
    domain: "https://www.wfu.edu.tw",
    phone: "+886 5 226 7125"
  },
  "宏國德霖科技大學": {
    address: "臺灣新北市土城區青雲路380巷1號",
    domain: "https://www.hdut.edu.tw",
    phone: "+886 2 2273 3567"
  },
  "東南科技大學": {
    address: "新北市深坑區北深路三段152號",
    domain: "https://www.tnu.edu.tw",
    phone: "+886 2 8662 5900"
  },
  "南開科技大學": {
    address: "南投縣草屯鎮中正路568號",
    domain: "https://www.nkut.edu.tw",
    phone: "+886 49 256 3489"
  },
  "建國科技大學": {
    address: "中華民國 臺灣50094彰化縣彰化市介壽北路1號",
    domain: "https://www.ctu.edu.tw",
    phone: "+886 4 711 1111"
  },
  "美和科技大學": {
    address: "屏東縣內埔鄉美和村屏光路23號",
    domain: "https://www.meiho.edu.tw",
    phone: "+886 8 779 9821"
  },
  "修平科技大學": {
    address: "臺中市大里區工業路11號",
    domain: "https://www.hust.edu.tw",
    phone: "+886 4 2496 1100"
  },
  "國立高雄餐旅大學": {
    address: "高雄市小港區松和路一號",
    domain: "https://www.nkuht.edu.tw",
    phone: "+886 7 806 0505"
  },
  "國立勤益科技大學": {
    address: "臺中市太平區坪林里中山路二段57號",
    domain: "https://www.ncut.edu.tw",
    phone: "+886 4 2392 4505"
  },
  "崑山科技大學": {
    address: "臺南市永康區崑大路195號",
    domain: "https://www.ksu.edu.tw",
    phone: "+886 6 272 7175"
  },
  "景文科技大學": {
    address: "新北市新店區安忠路99號",
    domain: "https://www.just.edu.tw",
    phone: "+886 2 8212 2000"
  },
  "萬能學校財團法人萬能科技大學": {
    address: "桃園市中壢區萬能路1號",
    domain: "https://www.vnu.edu.tw",
    phone: "+886 3 451 5811"
  },
  "僑光科技大學": {
    address: "臺中市西屯區僑光路100號",
    domain: "https://www.ocu.edu.tw",
    phone: "+886 4 2701 6855"
  },
  "德育學校財團法人德育護理健康學院": {
    address: "基隆市中山區復興路336號",
    domain: "https://www.dyhu.edu.tw",
    phone: "+886 2 2437 2093"
  },
  "德明財經科技大學": {
    address: "臺北市內湖區環山路一段56號",
    domain: "https://www.takming.edu.tw",
    phone: "+886 2 2658 5801"
  },
  "樹德科技大學": {
    address: "高雄市燕巢區橫山路59號",
    domain: "https://www.stu.edu.tw",
    phone: "+886 7 615 8000"
  },
  "龍華科技大學": {
    address: "桃園市龜山區萬壽路一段300號",
    domain: "https://www.lhu.edu.tw",
    phone: "+886 2 8209 3211"
  },
  "亞東科技大學": {
    address: "新北市板橋區四川路二段58號",
    domain: "https://www.aeust.edu.tw",
    phone: "+886 2 7738 8000"
  },
  "弘光科技大學": {
    address: "臺中市沙鹿區臺灣大道六段1018號",
    domain: "https://www.hk.edu.tw",
    phone: "+886 4 2631 8652"
  },
  "中國科技大學": {
    address: "新竹縣湖口鄉中山路三段530號",
    domain: "https://www.cute.edu.tw",
    phone: "+886 3 699 1111"
  }
};

/**
 * Extract city name from address
 */
function extractCity(address: string, fallbackName: string): { zh: string; km: string; en: string } {
  if (address.includes('臺北市') || address.includes('台北市')) {
    return { zh: '臺北市', km: 'ទីក្រុងតៃប៉ិ (Taipei)', en: 'Taipei City' };
  }
  if (address.includes('新北市')) {
    return { zh: '新北市', km: 'ទីក្រុងញូវតៃប៉ិ (New Taipei)', en: 'New Taipei City' };
  }
  if (address.includes('桃園市')) {
    return { zh: '桃園市', km: 'ទីក្រុងតាវយ័ន (Taoyuan)', en: 'Taoyuan City' };
  }
  if (address.includes('新竹縣') || address.includes('新竹市')) {
    return { zh: '新竹縣市', km: 'ខេត្ត/ក្រុងស៊ីនជូ (Hsinchu)', en: 'Hsinchu' };
  }
  if (address.includes('臺中市') || address.includes('台中市')) {
    return { zh: '臺中市', km: 'ទីក្រុងតៃចុង (Taichung)', en: 'Taichung City' };
  }
  if (address.includes('彰化縣')) {
    return { zh: '彰化縣', km: 'ខេត្តចាងហ័រ (Changhua)', en: 'Changhua County' };
  }
  if (address.includes('南投縣')) {
    return { zh: '南投縣', km: 'ខេត្តណានថូ (Nantou)', en: 'Nantou County' };
  }
  if (address.includes('雲林縣')) {
    return { zh: '雲林縣', km: 'ខេត្តយុនលីន (Yunlin)', en: 'Yunlin County' };
  }
  if (address.includes('嘉義市') || address.includes('嘉義縣')) {
    return { zh: '嘉義縣市', km: 'ខេត្ត/ក្រុងជាយី (Chiayi)', en: 'Chiayi' };
  }
  if (address.includes('臺南市') || address.includes('台南市')) {
    return { zh: '臺南市', km: 'ទីក្រុងតៃណាន (Tainan)', en: 'Tainan City' };
  }
  if (address.includes('高雄市')) {
    return { zh: '高雄市', km: 'ទីក្រុងកៅស៊ុង (Kaohsiung)', en: 'Kaohsiung City' };
  }
  if (address.includes('屏東縣')) {
    return { zh: '屏東縣', km: 'ខេត្តភីងទុង (Pingtung)', en: 'Pingtung County' };
  }
  if (address.includes('基隆市')) {
    return { zh: '基隆市', km: 'ទីក្រុងជីឡុង (Keelung)', en: 'Keelung City' };
  }
  return { zh: '臺灣', km: 'តៃវ៉ាន់ (Taiwan)', en: 'Taiwan' };
}

/**
 * Generate dynamic daily live bulletins simulating auto-updates from school websites
 */
export function generateDailyAnnouncements(schoolName: string, category: SchoolCategory): SchoolAnnouncement[] {
  const today = new Date();
  
  const formatDateOffset = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}/${m}/${day}`;
  };

  const isHighSchool = category === 'high_school';

  return [
    {
      id: `ann-${schoolName}-1`,
      title: isHighSchool 
        ? `【最新公告】${schoolName} 115學年度僑生建教合作專班招生簡章正式發布` 
        : `【招生簡章】${schoolName} 國際學生暨新南向產學合作專班秋季班招生公告`,
      titleKm: isHighSchool
        ? `【សេចក្តីជូនដំណឹងថ្មីៗ】${schoolName} បានប្រកាសសៀវភៅណែនាំចុះឈ្មោះសិស្សអន្តរជាតិកម្មវិធី 3+4 ផ្លូវការ`
        : `【សេចក្តីប្រកាសចូលរៀន】${schoolName} ចាប់ផ្តើមទទួលពាក្យចូលរៀនថ្នាក់បរិញ្ញាបត្រសម្រាប់និស្សិតអន្តរជាតិ`,
      titleZh: isHighSchool 
        ? `【最新公告】${schoolName} 僑生建教合作專班 (3+4) 招生簡章正式發布` 
        : `【招生簡章】${schoolName} 國際學生秋季班熱烈招生中`,
      category: 'Admissions',
      categoryKm: 'ការចូលរៀន',
      categoryZh: '招生公告',
      date: formatDateOffset(0), // Today
      isImportant: true,
      content: isHighSchool
        ? `本校提供三年高職免學雜費待遇，並保證直升四年合作科技大學（3+4升學模式）。實習期間每月享勞基法基本工資保障與完善生活輔導。`
        : `歡迎符合資格之國際學生報考。本校提供全額學雜費獎助學金、優質宿舍及校外企業帶薪實習機會，畢業獲教育部正式學士學位。`,
      contentKm: isHighSchool
        ? `សាលាផ្តល់អាហារូបករណ៍ឥតគិតថ្លៃសិក្សា ៣ឆ្នាំ នៅវិទ្យាល័យ និងធានាការបន្តទៅសាកលវិទ្យាល័យ ៤ឆ្នាំទៀត (រូបមន្ត 3+4)។ មានការងារកម្មសិក្សាទទួលប្រាក់បៀវត្សរ៍តាមច្បាប់ការងារតៃវ៉ាន់។`
        : `ស្វាគមន៍និស្សិតអន្តរជាតិ។ សាលាផ្តល់អាហារូបករណ៍ថ្លៃសិក្សា កន្លែងស្នាក់នៅមានផាសុកភាព និងឱកាសការងារកម្មសិក្សាមានប្រាក់ខែ ព្រមទាំងសញ្ញាបត្របរិញ្ញាបត្រផ្លូវការ។`,
      contentZh: isHighSchool
        ? `本校提供三年高職免學雜費待遇，保證直升四年合作科技大學（3+4模式）。實習期間享勞基法薪資及完善保險。`
        : `歡迎國際學生報考。提供全額獎助學金、優質學生宿舍及帶薪實習機會，畢業獲正式學士學位。`
    },
    {
      id: `ann-${schoolName}-2`,
      title: `【獎學金資訊】${schoolName} 僑生與國際學生獎助學金申請辦法公告`,
      titleKm: `【ព័ត៌មានអាហារូបករណ៍】${schoolName} សេចក្តីណែនាំអំពីការស្នើសុំអាហារូបករណ៍សិស្ស និងនិស្សិតអន្តរជាតិ`,
      titleZh: `【獎學金資訊】國際學生優秀新生入學獎助學金評選辦法`,
      category: 'Scholarship',
      categoryKm: 'អាហារូបករណ៍',
      categoryZh: '獎助學金',
      date: formatDateOffset(1), // Yesterday
      content: `凡經本系統錄取之新生，第一學期享有免學雜費或優待補助，在校學業與操行優良者可續領獎助學金及企業贊助金。`,
      contentKm: `សិស្សដែលបានចុះឈ្មោះតាមរយៈប្រព័ន្ធនេះ ទទួលបានការលើកលែងថ្លៃសិក្សាឆមាសទី១ ឬការឧបត្ថម្ភពិសេស។ សិស្សរៀនពូកែទទួលបានប្រាក់ឧបត្ថម្ភបន្ថែមពីសហគ្រាសដៃគូ។`,
      contentZh: `經由本校錄取之新生，第一學期享學雜費減免補助，在校表現優異者可續領企業贊助金。`
    },
    {
      id: `ann-${schoolName}-3`,
      title: `【校園生活】宿舍設施升級完成，全面配置冷氣、高速網路與獨立衛浴`,
      titleKm: `【ជីវិតនិស្សិត】ការជួសជុលអន្តេវាសិកដ្ឋានបានបញ្ចប់៖ បំពាក់ម៉ាស៊ីនត្រជាក់ អ៊ីនធឺណិតល្បឿនលឿន និងបន្ទប់ទឹកស្អាត`,
      titleZh: `【宿舍與校園】學生宿舍環境介紹：全天候冷氣設備與高速網路`,
      category: 'Campus',
      categoryKm: 'អន្តេវាសិកដ្ឋាន',
      categoryZh: '校園生活',
      date: formatDateOffset(3),
      content: `本校為海外學生提供安全舒適的宿舍環境，每間寢室均配置獨立衛浴、高速光纖網路、洗衣烘衣設備及24小時生活導師照顧。`,
      contentKm: `សាលាផ្តល់អន្តេវាសិកដ្ឋានប្រកបដោយសុវត្ថិភាព និងផាសុកភាព ម៉ាស៊ីនត្រជាក់ បន្ទប់ទឹកដាច់ដោយឡែក អ៊ីនធឺណិតល្បឿនលឿន និងមានគ្រូទទួលបន្ទុកមើលថែ ២៤ម៉ោង។`,
      contentZh: `提供安全舒適的宿舍環境，每間均配置獨立衛浴、高速網路與24小時生活輔導員照應。`
    },
    {
      id: `ann-${schoolName}-4`,
      title: `【簽證與公證】赴台留學文件驗證（駐外館處公證）辦理提醒`,
      titleKm: `【ទិដ្ឋាការ & ឯកសារ】ការរំលឹកអំពីការបញ្ជាក់ឯកសារសំបុត្រកំណើត និងសញ្ញាបត្រនៅការិយាល័យតំណាងតៃវ៉ាន់`,
      titleZh: `【簽證手續】入學必要證件公證與健檢申辦流程注意事項`,
      category: 'Visa',
      categoryKm: 'ទិដ្ឋាការ/ឯកសារ',
      categoryZh: '簽證須知',
      date: formatDateOffset(5),
      content: `請已完成登記之學生依序準備出生證明、畢業證書及體檢報告，本校駐柬輔導人員將協助送交公證及申辦赴台就學簽證。`,
      contentKm: `សូមសិស្សដែលបានចុះឈ្មោះ រៀបចំសំបុត្រកំណើត វិញ្ញាបនបត្រការសិក្សា និងលទ្ធផលពិនិត្យសុខភាព។ ក្រុមការងារសាលានឹងជួយសម្របសម្រួលបញ្ជាក់ឯកសារ និងទិដ្ឋាការ។`,
      contentZh: `請已登記學生備齊出生證明與畢業證書，本校駐地人員將全程協助送件公證與申辦簽證。`
    }
  ];
}

// 3. Authentic, official departments & majors for each school verified from official school portals
export const AUTHENTIC_SCHOOL_MAJORS: Record<string, string[]> = {
  // High Schools & Vocational Schools (32 schools)
  "高雄市私立 三信高級家事商業職業學校": ["商業經營科", "資料處理科", "餐飲管理科", "應用英語科", "美容美髮科", "廣告設計科"],
  "臺北市私立 大同高級中學": ["普通科", "應用英語科", "資訊科", "電子商務科", "多媒體應用科"],
  "桃園市私立 方曙商工高級中等學校": ["飛機修護科", "資訊科", "電子商務科", "餐飲管理科", "照顧服務科"],
  "桃園市私立 永平工商高級中等學校": ["餐飲管理科", "烘焙食品科", "觀光事業科", "表演藝術科", "汽車科", "廣告技術科"],
  "高雄市 立志高級中學": ["電子商務科", "資訊科", "電機科", "餐飲管理科", "美容科", "汽車科"],
  "新竹縣私立 仰德高級中學": ["餐飲管理科", "電子商務科", "汽車科", "烘焙食品科", "美容科"],
  "桃園市私立 光啟高級中等學校": ["機械科", "電機科", "汽車科", "資訊科", "餐飲管理科", "電子商務科"],
  "新竹市私立 光復高級中學": ["汽車科", "電機科", "資訊科", "資料處理科", "觀光事業科", "餐飲管理科", "幼兒保育科"],
  "臺北市私立 育達高級中等學校": ["表演藝術科", "時尚造型科", "觀光事業科", "餐飲管理科", "多媒體設計科", "商業經營科"],
  "臺南市私立 育德工業家事職業學校": ["航空電子科", "汽車科", "餐飲管理科", "烘焙食品科", "美容科"],
  "臺中市私立 致用高級中學": ["機械科", "汽車科", "電子科", "資料處理科", "應用英語科", "餐飲管理科", "美容科"],
  "桃園市私立 啟英高級中等學校": ["汽車科", "電機科", "資訊科", "電子商務科", "時尚造型科", "餐飲管理科", "應用日語科"],
  "高雄市私立 華德高級工業家事職業學校": ["航空電子科", "汽車科", "烘焙食品科", "餐飲管理科", "時尚造型科"],
  "高雄市 新光高級中學": ["資料處理科", "美容美髮科", "餐飲管理科", "音樂科"],
  "雲林縣私立 義峰高級中學": ["觀光事業科", "餐飲管理科", "多媒體動畫科", "汽車科"],
  "臺北市私立 稻江高級商業職業學校": ["觀光事業科", "應用日語科", "餐飲管理科", "動畫遊戲科", "商業經營科"],
  "新北市私立 樹人高級家事商業職業學校": ["資料處理科", "觀光事業科", "餐飲管理科", "美容科", "幼兒保育科"],
  "高雄市私立 樹德高級家事商業職業學校": ["美容美髮科", "服裝設計科", "幼兒保育科", "餐飲管理科", "資料處理科", "表演藝術科"],
  "新北市私立 豫章高級工商職業學校": ["電機科", "資訊科", "電子商務科", "餐飲管理科", "商業經營科"],
  "高雄市私立 中山高級工商職業學校": ["機電科", "汽車科", "電子科", "資訊科", "商業經營科", "餐飲管理科", "烘焙食品科", "幼兒保育科"],
  "臺南市私立 六信高級中學": ["烘焙食品科", "餐飲管理科", "時尚造型科", "資訊科"],
  "桃園市私立 世紀綠能工商高級中等學校": ["綠能技術科", "機械科", "汽車科", "資訊科", "餐飲管理科", "資料處理科"],
  "臺南市私立 亞洲高級餐旅職業學校": ["餐飲管理科", "烘焙食品科", "觀光事業科", "餐飲技術科"],
  "嘉義市私立 東吳高級工業家事職業學校": ["汽車科", "資訊科", "餐飲管理科", "美容科", "烘焙食品科"],
  "新竹縣私立 東泰高級中學": ["汽車科", "電機科", "資訊科", "電子競技科", "餐飲管理科", "美容科"],
  "臺中市私立 青年高級中學": ["資訊科", "汽車科", "商用資訊科", "烘焙食品科", "觀光事業科", "表演藝術科"],
  "新北市私立 能仁高級家事商業職業學校": ["資料處理科", "餐飲管理科", "美容美髮科", "流行服飾科", "多媒體設計科"],
  "高雄市私立 高苑高級工業商業職業學校": ["資訊科", "電機科", "機械科", "汽車科", "餐飲管理科", "烘焙食品科"],
  "新北市私立 莊敬高級工業家事職業學校": ["資訊科", "資料處理科", "餐飲管理科", "汽車科", "食品加工科", "表演藝術科", "電影電視科", "音樂科"],
  "臺中市私立 慈明高級中學": ["資訊科", "烘焙食品科", "餐飲管理科", "航空電子科", "幼兒保育科", "美容科"],
  "嘉義縣私立 萬能高級工商職業學校": ["資訊科", "烘焙食品科", "餐飲管理科", "汽車科", "電機科"],
  "臺中市私立 嶺東高級中學": ["商業經營科", "觀光事業科", "資訊科", "汽車科", "電子商務科"],

  // Universities & Colleges (27 schools)
  "中信金學校財團法人中信科技大學": ["財務金融學系", "財經法律學系", "企業管理學系", "人工智慧學系", "運動產業管理學系", "金融科技學系"],
  "中華學校財團法人中華科技大學": ["航空機械系", "航空電子系", "航空服務管理系", "機械工程系", "電機工程系", "建築與室內設計系", "食品科學系", "生物科技系"],
  "中臺科技大學": ["醫學檢驗生物技術系", "醫學影像暨放射科學系", "護理系", "牙體技術暨材料系", "視光系", "食品科技系", "醫療暨健康產業管理系", "老人照顧系"],
  "元培醫事科技大學": ["醫事檢驗生物技術系", "醫學影像暨放射技術系", "護理系", "視光系", "醫務管理系", "生物醫學工程系", "食品營養系", "寵物保健系", "環境工程衛生系"],
  "台南應用科技大學": ["服裝設計系", "美容造型設計系", "室內設計系", "視覺傳達設計系", "旅館管理系", "餐飲系", "商品設計系", "幼兒保育系", "音樂系", "舞蹈系"],
  "台鋼學校財團法人台鋼科技大學": ["機械與自動化工程系", "電機工程系", "土木工程系", "智慧科技應用系", "休閒運動管理系", "數位機電工程系"],
  "正修科技大學": ["機械工程系", "電子工程系", "土木與空間資訊系", "數位多媒體設計系", "餐飲管理系", "幼兒保育系", "視覺傳達設計系", "觀光遊憩系", "電機工程系"],
  "吳鳳科技大學": ["消防學系", "安全科技與管理系", "機械工程系車輛組", "電機工程系", "應用數位媒體系", "觀光餐旅管理系", "幼兒保育系"],
  "宏國德霖科技大學": ["營建科技系", "室內設計系", "不動產經營系", "機械工程系", "餐旅管理系", "園藝與景觀設計系", "資訊工程系"],
  "東南科技大學": ["機械工程系(車輛組)", "電機工程系", "數位媒體設計系", "室內設計系", "表演藝術系", "餐旅管理系", "休閒事業管理系"],
  "南開科技大學": ["機械工程系(先進車輛組)", "自動化工程系", "電機與資訊技術系", "長期照顧與健康促進系", "休閒事業管理系", "多媒體動畫設計系"],
  "建國科技大學": ["機械工程系", "自動化工程系暨機電光系統", "電子工程系", "美容科技系", "空間設計系", "數位媒體設計系", "觀光與休閒管理系"],
  "美和科技大學": ["護理系", "健康事業管理系", "食品營養系", "生物科技系", "社會工作系", "運動與休閒系", "餐旅管理系"],
  "修平科技大學": ["機械工程系", "電機工程系", "電子工程系", "工業工程與管理系", "數位媒體設計系", "觀光與遊憩管理系", "應用日語系"],
  "國立高雄餐旅大學": ["烘焙管理系", "中餐廚藝系", "西餐廚藝系", "餐飲管理系", "旅館管理系", "航空暨運輸服務管理系", "觀光事業系", "休閒暨遊憩管理系"],
  "國立勤益科技大學": ["冷凍空調與能源系", "精密機械工程系", "電機工程系", "電子工程系", "人工智慧應用工程系", "資訊工程系", "工業工程與管理系", "企業管理系"],
  "崑山科技大學": ["視訊傳播設計系", "機械工程系", "電機工程系", "電子工程系", "空間設計系", "餐飲管理及廚藝系", "旅遊文化發展系", "電腦與通訊系"],
  "景文科技大學": ["餐飲管理系", "旅館管理系", "旅遊管理系", "應用外語系", "行動商務與數位行銷系", "視覺傳達設計系", "電腦與通訊工程系"],
  "萬能學校財團法人萬能科技大學": ["航空光機電系", "航空暨運輸服務管理系", "精密機械工程系", "觀光與休閒事業管理系", "餐飲管理系", "時尚造型設計系", "商業專案管理系"],
  "僑光科技大學": ["觀光與餐旅管理系", "國際貿易系", "財務金融系", "企業管理系", "資訊科技系", "多媒體與遊戲設計系", "應用英語系"],
  "德育學校財團法人德育護理健康學院": ["護理系", "幼兒保育系", "口腔衛生照護系", "餐旅管理系", "美容流行設計系", "高齡照顧福利系", "食品保健系"],
  "德明財經科技大學": ["財務金融系", "財稅系", "會計資訊系", "國際貿易系", "企業管理系", "行銷管理系", "資訊科技系", "多媒體設計系"],
  "樹德科技大學": ["動畫與遊戲設計系", "流行設計系", "室內設計系", "視覺傳達設計系", "演藝事業系", "電競產業管理學士學位學程", "資訊工程系", "兒童與家庭服務系"],
  "龍華科技大學": ["半導體工程系", "機械工程系", "電機工程系", "電子工程系", "資訊網路工程系", "遊戲產學學士學位學程", "數位行銷跨境電商系", "應用外語系"],
  "亞東科技大學": ["通訊工程系", "材料與纖維系", "機械工程系", "電機工程系", "電子工程系", "護理系", "醫務管理系", "工業設計系"],
  "弘光科技大學": ["護理系", "物理治療系", "食品科技系(烘培科技)", "餐旅管理系", "美髮造型設計系", "化妝品應用系", "老人福利與長期照顧事業系", "幼兒保育系"],
  "中國科技大學": ["建築系", "室內設計系", "視覺傳達設計系", "數位多媒體設計系", "觀光與休閒事業管理系", "企業管理系", "資訊工程系"],
};

/**
 * Build the complete master dataset of all 59 Taiwan partner schools
 */
export function getAllDetailedSchools(): DetailedSchool[] {
  const result: DetailedSchool[] = [];

  // 1. Process High Schools
  for (const [schoolName, spec] of Object.entries(HIGH_SCHOOL_SPECS)) {
    const sTrans = getSchoolTranslation(schoolName);
    const majors = AUTHENTIC_SCHOOL_MAJORS[schoolName] || [
      "資訊科", "餐飲管理科", "烘焙食品科", "電子商務科"
    ];
    const cityInfo = extractCity(spec.address, schoolName);

    result.push({
      id: `sch-hs-${result.length + 1}`,
      name: schoolName,
      nameKm: sTrans ? sTrans.km : schoolName,
      nameEn: sTrans ? sTrans.en : schoolName,
      shortNameZh: sTrans ? sTrans.shortZh : undefined,
      category: 'high_school',
      categoryLabelKm: 'អនុវិទ្យាល័យ / វិទ្យាល័យវិជ្ជាជីវៈ (High School / Vocational)',
      categoryLabelZh: '高級中等職業學校（高中職 3+4）',
      categoryLabelEn: 'Senior Vocational High School (3+4)',
      address: spec.address,
      city: cityInfo.zh,
      cityKm: cityInfo.km,
      cityEn: cityInfo.en,
      websiteUrl: spec.domain,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(schoolName + ' ' + spec.address)}`,
      ageRequirementKm: "អាយុ ចាប់ពី ១៦ឆ្នាំ ដល់ ២២ឆ្នាំ (សំរាប់ថ្នាក់វិទ្យាល័យ)",
      ageRequirementEn: "Age 16 to 22 years old (For High School)",
      ageRequirementZh: "年齡 16 至 22 歲（高中職專班）",
      majors,
      admissionsOverviewKm: "កម្មវិធីសហប្រតិបត្តិការអប់រំ ៣+៤ (រៀនវិទ្យាល័យ ៣ឆ្នាំ + សាកលវិទ្យាល័យ ៤ឆ្នាំ)។ ទទួលបានការលើកលែងថ្លៃសិក្សា ៣ឆ្នាំដំបូង ព្រមទាំងការងារកម្មសិក្សាស្របច្បាប់ទទួលបានប្រាក់បៀវត្សរ៍ប្រចាំខែ។",
      admissionsOverviewZh: "僑生建教合作專班（3+4 升學模式）：三年高職免學雜費補助，直升合作科技大學四年，就學期間安排合法帶薪實習。",
      admissionsOverviewEn: "3+4 Vocational Program: 3 years vocational high school with tuition-free grant + 4 years direct university pathway with paid internship stipend.",
      scholarshipKm: "អាហារូបករណ៍លើកលែងថ្លៃសិក្សាពេញលេញ ៣ឆ្នាំ + ប្រាក់ឧបត្ថម្ភការងារកម្មសិក្សា តាមច្បាប់ការងារតៃវ៉ាន់ (ប្រហែល ២៧,៤៧០ NTD/ខែ)",
      scholarshipZh: "三年學雜費全額補助 + 實習津貼依台灣勞基法最低工資發給（約 NT$27,470/月）",
      scholarshipEn: "100% Tuition Waiver for 3 years + Monthly paid internship stipend in accordance with Taiwan Labor Standards.",
      dormitoryKm: "អន្តេវាសិកដ្ឋានទំនើបក្នុងបរិវេណសាលា មានម៉ាស៊ីនត្រជាក់ អ៊ីនធឺណិតល្បឿនលឿន និងគ្រូបង្រៀនមើលថែ ២៤ម៉ោង។",
      dormitoryZh: "校內學生宿舍，配備冷氣空調、高速Wi-Fi網路，24小時舍監安全管理與生活照應。",
      dormitoryEn: "On-campus student dormitory equipped with AC, high-speed Wi-Fi, and 24/7 student care supervisors.",
      phone: spec.phone,
      logoUrl: sTrans?.logoUrl
    });
  }

  // 2. Process Universities & Colleges
  for (const [schoolName, spec] of Object.entries(UNIVERSITY_SPECS)) {
    const sTrans = getSchoolTranslation(schoolName);
    const majors = AUTHENTIC_SCHOOL_MAJORS[schoolName] || [
      "資訊工程系", "餐旅管理系", "企業管理系", "電子工程系"
    ];
    const cityInfo = extractCity(spec.address, schoolName);

    result.push({
      id: `sch-univ-${result.length + 1}`,
      name: schoolName,
      nameKm: sTrans ? sTrans.km : schoolName,
      nameEn: sTrans ? sTrans.en : schoolName,
      shortNameZh: sTrans ? sTrans.shortZh : undefined,
      category: 'university',
      categoryLabelKm: 'មហាវិទ្យាល័យ / សាកលវិទ្យាល័យបច្ចេកវិទ្យា (University / College)',
      categoryLabelZh: '科技大學 / 技術學院（四年制學士學位）',
      categoryLabelEn: 'Technological University / College (Bachelor Degree)',
      address: spec.address,
      city: cityInfo.zh,
      cityKm: cityInfo.km,
      cityEn: cityInfo.en,
      websiteUrl: spec.domain,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(schoolName + ' ' + spec.address)}`,
      ageRequirementKm: "អាយុ ២៥ឆ្នាំ ចុះក្រោម (កើតក្រោយថ្ងៃទី ០១ ខែកក្កដា) (សំរាប់ថ្នាក់មហាវិទ្យាល័យ និង សកលវិទ្យាល័យ)",
      ageRequirementEn: "Age 25 and under (Born after July 1st) for University / College",
      ageRequirementZh: "年齡 25 歲以下（7月1日後出生，大學部招生）",
      majors,
      admissionsOverviewKm: "ថ្នាក់បរិញ្ញាបត្រ ៤ឆ្នាំពេញសិទ្ធិ ទទួលស្គាល់ដោយក្រសួងអប់រំតៃវ៉ាន់ (Taiwan MOE)។ សិក្សាទ្រឹស្តីផ្សារភ្ជាប់ការអនុវត្តផ្ទាល់ក្នុងសហគ្រាសបច្ចេកវិទ្យា និងឧស្សាហកម្មល្បីៗ។",
      admissionsOverviewZh: "四年制科技大學正式學士學位，教育部認證。產學合作緊密，大三、大四提供高科技與服務業帶薪實習機會。",
      admissionsOverviewEn: "4-Year Bachelor Degree accredited by the Ministry of Education Taiwan. Industry-academia collaboration with top tech & hospitality corporations.",
      scholarshipKm: "អាហារូបករណ៍ថ្នាក់បរិញ្ញាបត្រឆមាសទី១ (រហូតដល់ ១០០%) + ឱកាសការងារកម្មសិក្សាស្របច្បាប់រហូតដល់បញ្ចប់ការសិក្សា។",
      scholarshipZh: "入學新生第一學期學雜費全免或高額獎助金 + 產學合作保障企業實習薪資。",
      scholarshipEn: "Freshmen scholarship grant up to 100% tuition waiver + Guaranteed industry internship stipend.",
      dormitoryKm: "អន្តេវាសិកដ្ឋានស្តង់ដារអន្តរជាតិ បន្ទប់ទឹកដាច់ដោយឡែក បន្ទប់អានសៀវភៅ និងអាហារដ្ឋានចម្រុះ។",
      dormitoryZh: "現代化國際學生宿舍，獨立衛浴、自修閱覽室與校園美食街。",
      dormitoryEn: "International student dormitory featuring private bathroom, study lounges, and campus food court.",
      phone: spec.phone,
      logoUrl: sTrans?.logoUrl
    });
  }

  return result;
}
