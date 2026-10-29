/**
 * School Logo Image Compression & Normalization Utilities
 * Ensures uploaded school logos stay crisp (with full alpha transparency) while remaining
 * compact (< 42,000 Base64 chars) so they persist reliably in IndexedDB, localStorage,
 * and Google Sheets (which enforces a 50,000-character limit per cell).
 */

export const MAX_SHEETS_SAFE_DATA_URL_LENGTH = 42000;

/**
 * Normalizes a school name key so whitespace differences or zero-width characters
 * never cause a logo lookup miss.
 */
export function normalizeSchoolKey(name?: string): string {
  if (!name) return '';
  return name
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Maps legacy address-prefixed university names, shortened university names,
 * and historical spacing variants to the single official canonical school name.
 */
export const LEGACY_SCHOOL_ALIAS_MAP: Record<string, string> = {
  '高雄市立 志高級中學': '高雄市 立志高級中學',
  '新北市私立 醒吾高級中學': '新北市私立 醒吾高中',
  // 27 Partner Universities & Colleges (Address-prefixed & short variants -> Official Canonical Name)
  '臺中市沙鹿區臺灣大道六段 弘光科技大學': '弘光科技大學',
  '臺中市沙鹿區臺灣大道六段1018號 弘光科技大學': '弘光科技大學',
  '新竹縣湖口鄉中山路三段 中國科技大學': '中國科技大學',
  '新竹縣湖口鄉中山路三段530號 中國科技大學': '中國科技大學',
  '桃園市龜山區萬壽路一段 龍華科技大學': '龍華科技大學',
  '桃園市龜山區萬壽路一段300號 龍華科技大學': '龍華科技大學',
  '新北市板橋區四川路二段58號 亞東科技大學': '亞東科技大學',
  '新北市板橋區四川路二段 58 號 亞東科技大學': '亞東科技大學',
  '臺南市新市區中華路49號 中信金學校財團法人中信科技大學': '中信金學校財團法人中信科技大學',
  '中信科技大學': '中信金學校財團法人中信科技大學',
  '臺北市南港區研究院路三段 245號 中華學校財團法人中華科技大學': '中華學校財團法人中華科技大學',
  '臺北市南港區研究院路三段245號 中華學校財團法人中華科技大學': '中華學校財團法人中華科技大學',
  '中華科技大學': '中華學校財團法人中華科技大學',
  '臺中市北屯區廍子路666號 中臺科技大學': '中臺科技大學',
  '新竹市元培街306號 元培醫事科技大學': '元培醫事科技大學',
  '臺南市永康區中正路529號 台南應用科技大學': '台南應用科技大學',
  '高雄市路竹區中山路1821號 台鋼學校財團法人台鋼科技大學': '台鋼學校財團法人台鋼科技大學',
  '台鋼科技大學': '台鋼學校財團法人台鋼科技大學',
  '高雄市鳥松區澄清路840號 正修科技大學': '正修科技大學',
  '嘉義縣民雄鄉建國路二段117號 吳鳳科技大學': '吳鳳科技大學',
  '臺灣新北市土城區青雲路380巷1號 宏國德霖科技大學': '宏國德霖科技大學',
  '新北市深坑區北深路三段 152 號 東南科技大學': '東南科技大學',
  '新北市深坑區北深路三段152號 東南科技大學': '東南科技大學',
  '南投縣草屯鎮中正路568號 南開科技大學': '南開科技大學',
  '中華民國 臺灣50094彰化縣彰化市介壽北路1號 建國科技大學': '建國科技大學',
  '屏東縣內埔鄉美和村屏光路23號 美和科技大學': '美和科技大學',
  '臺中市大里區工業路11號 修平科技大學': '修平科技大學',
  '高雄市小港區松和路一號 國立高雄餐旅大學': '國立高雄餐旅大學',
  '臺中市太平區坪林里中山路二段57號 國立勤益科技大學': '國立勤益科技大學',
  '臺南市永康區崑大路 195 號 崑山科技大學': '崑山科技大學',
  '臺南市永康區崑大路195號 崑山科技大學': '崑山科技大學',
  '新北市新店區安忠路 99 號 景文科技大學': '景文科技大學',
  '新北市新店區安忠路99號 景文科技大學': '景文科技大學',
  '桃園市中壢區萬能路1號 萬能學校財團法人萬能科技大學': '萬能學校財團法人萬能科技大學',
  '萬能科技大學': '萬能學校財團法人萬能科技大學',
  '臺中市西屯區僑光路 100 號 僑光科技大學': '僑光科技大學',
  '臺中市西屯區僑光路100號 僑光科技大學': '僑光科技大學',
  '基隆市中山區復興路 336 號 德育學校財團法人德育護理健康學院': '德育學校財團法人德育護理健康學院',
  '基隆市中山區復興路336號 德育學校財團法人德育護理健康學院': '德育學校財團法人德育護理健康學院',
  '德育護理健康學院': '德育學校財團法人德育護理健康學院',
  '臺北市內湖區環山路一段56號 德明財經科技大學': '德明財經科技大學',
  '高雄市燕巢區橫山路59號 樹德科技大學': '樹德科技大學',
};

export const RETIRED_AGE_26_27_SCHOOLS = new Set<string>([
  '台灣高雄市大寮區 輔英科技大學',
  '輔英科技大學',
  '台灣新北市泰山區 黎明技術學院',
  '黎明技術學院',
  '宜蘭縣三星鄉三星路二段 聖母醫護管理專科學校',
  '聖母醫護管理專科學校',
]);

export function canonicalizeSchoolName(name?: string): string {
  const norm = normalizeSchoolKey(name);
  if (!norm) return '';
  return LEGACY_SCHOOL_ALIAS_MAP[norm] || norm;
}

export function getSchoolAliasKeys(name?: string): string[] {
  const norm = normalizeSchoolKey(name);
  if (!norm) return [];
  const canon = canonicalizeSchoolName(norm);
  const keys = new Set<string>([canon, norm]);
  for (const [legacy, target] of Object.entries(LEGACY_SCHOOL_ALIAS_MAP)) {
    if (target === canon) {
      keys.add(legacy);
    }
  }
  return Array.from(keys);
}

export function isRetiredLegacySchool(name?: string): boolean {
  const norm = normalizeSchoolKey(name);
  if (!norm) return false;
  return RETIRED_AGE_26_27_SCHOOLS.has(norm);
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read image file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Resizes and compresses an uploaded logo image while preserving transparency.
 * Guarantees a compact Data URL suitable for IndexedDB, localStorage, and Google Sheets sync.
 */
export async function compressSchoolLogo(
  file: File,
  maxChars: number = MAX_SHEETS_SAFE_DATA_URL_LENGTH
): Promise<string> {
  // Small SVG files are already compact and infinitely sharp
  if (file.type === 'image/svg+xml' && file.size < 28 * 1024) {
    const svgUrl = await readFileAsDataUrl(file);
    if (svgUrl.length <= maxChars) {
      return svgUrl;
    }
  }

  // Load image via Object URL
  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error('Invalid or unsupported image file'));
      el.src = objectUrl;
    });

    const srcWidth = img.naturalWidth || img.width || 256;
    const srcHeight = img.naturalHeight || img.height || 256;

    const dimensionSteps = [256, 200, 160, 128, 96];
    const qualitySteps = [0.88, 0.76, 0.64, 0.52];

    let lastCandidate = '';

    for (const maxDim of dimensionSteps) {
      const scale = Math.min(1, maxDim / Math.max(srcWidth, srcHeight));
      const targetW = Math.max(1, Math.round(srcWidth * scale));
      const targetH = Math.max(1, Math.round(srcHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.clearRect(0, 0, targetW, targetH);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetW, targetH);

      for (const quality of qualitySteps) {
        // Prefer WebP because it preserves alpha transparency AND compresses 3x-5x smaller than PNG
        const webpDataUrl = canvas.toDataURL('image/webp', quality);
        if (webpDataUrl.startsWith('data:image/webp')) {
          lastCandidate = webpDataUrl;
          if (webpDataUrl.length <= maxChars) {
            return webpDataUrl;
          }
        } else {
          // Browser fallback if WebP encoding is unavailable
          const pngDataUrl = canvas.toDataURL('image/png');
          if (pngDataUrl.length <= maxChars) {
            return pngDataUrl;
          }
          // Composite onto white background for JPEG fallback when PNG exceeds cell limit
          const jpgCanvas = document.createElement('canvas');
          jpgCanvas.width = targetW;
          jpgCanvas.height = targetH;
          const jpgCtx = jpgCanvas.getContext('2d');
          if (jpgCtx) {
            jpgCtx.fillStyle = '#ffffff';
            jpgCtx.fillRect(0, 0, targetW, targetH);
            jpgCtx.drawImage(canvas, 0, 0);
            const jpgDataUrl = jpgCanvas.toDataURL('image/jpeg', quality);
            lastCandidate = jpgDataUrl;
            if (jpgDataUrl.length <= maxChars) {
              return jpgDataUrl;
            }
          }
        }
      }
    }

    if (lastCandidate) {
      return lastCandidate;
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return readFileAsDataUrl(file);
}
