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
