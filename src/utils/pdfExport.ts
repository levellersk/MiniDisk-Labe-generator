import { jsPDF } from 'jspdf';
import { DiscData } from '../types/minidisc';

// Helper to convert image URL to base64 data URL with CORS fallback and safety timeout
async function getLoadedImageDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  
  return new Promise((resolve) => {
    let resolved = false;
    const finish = (result: string | null) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    // 4s timeout protection
    const timer = setTimeout(() => finish(null), 4000);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 400;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        finish(dataUrl);
      } catch (e) {
        finish(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = url;
  });
}

// Pre-crops square artwork to 70:55 aspect ratio (700 x 550 px) and applies scrim overlay with safety timeout
async function getCaseCoverDataUrl(
  url: string,
  cropPos: 'center' | 'top' | 'bottom' = 'center',
  overlayColor: string = '#000000',
  overlayOpacityPercent: number = 50
): Promise<string | null> {
  if (!url) return null;

  return new Promise((resolve) => {
    let resolved = false;
    const finish = (result: string | null) => {
      if (!resolved) {
        resolved = true;
        resolve(result);
      }
    };

    const timer = setTimeout(() => finish(null), 4000);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      clearTimeout(timer);
      try {
        // High quality target canvas for 70mm x 55mm print (approx 300 DPI)
        const targetW = 827; // 70mm at 300 DPI
        const targetH = 650; // 55mm at 300 DPI
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          finish(null);
          return;
        }

        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;

        const cropH = srcW * (55 / 70);
        let srcY = (srcH - cropH) / 2;
        if (cropPos === 'top') {
          srcY = 0;
        } else if (cropPos === 'bottom') {
          srcY = Math.max(0, srcH - cropH);
        }

        ctx.drawImage(img, 0, srcY, srcW, cropH, 0, 0, targetW, targetH);

        const opacity = Math.max(0, Math.min(100, overlayOpacityPercent)) / 100;
        ctx.fillStyle = overlayColor || '#000000';
        ctx.globalAlpha = opacity;
        ctx.fillRect(0, 0, targetW, targetH);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        finish(dataUrl);
      } catch (e) {
        finish(null);
      }
    };
    img.onerror = () => {
      clearTimeout(timer);
      finish(null);
    };
    img.src = url;
  });
}

// Cache for generated high-res vector MiniDisc logos per color
const miniDiscLogoPngCache: Record<string, string> = {};

function getMiniDiscLogoPngDataUrl(color: string): Promise<string> {
  const cacheKey = color.toLowerCase();
  if (miniDiscLogoPngCache[cacheKey]) {
    return Promise.resolve(miniDiscLogoPngCache[cacheKey]);
  }

  // Official Sony MiniDisc vector SVG markup matching MiniDiscLogo.tsx exactly
  const svgString = `
    <svg width="240" height="233" viewBox="0 0 520 504" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(-112.1102, -274.1811)">
        <path d="M 120.97229,719.05832 L 120.97229,333.22426 C 120.97229,305.49967 143.43878,283.03319 171.08371,283.03319 L 572.93111,283.03319 C 600.65571,283.03319 623.1222,305.49967 623.1222,333.14463 L 622.96286,719.21765 C 622.96286,746.94231 600.49637,769.32909 572.85144,769.32909 L 171.08371,769.32909 C 143.43878,769.32909 120.97229,746.86261 120.97229,719.21765 L 120.97229,719.05832 z M 611.80929,333.14463 C 611.80929,311.71385 594.36191,294.34609 572.93111,294.34609 L 171.08371,294.34609 C 149.65291,294.34609 132.2852,311.79348 132.2852,333.22426 L 132.2852,719.21765 C 132.2852,740.6485 149.65291,758.01619 171.08371,758.01619 L 572.85144,758.01619 C 594.28224,758.01619 611.64995,740.6485 611.64995,719.21765 L 611.80929,333.14463" fill="${color}" fill-rule="evenodd" />
        <g fill="${color}" fill-rule="evenodd">
          <path d="M 301.50088,437.19157 C 293.93238,467.70452 277.75969,514.3902 277.75969,514.3902 L 246.60935,514.54954 C 246.60935,514.54954 234.8981,474.07804 227.0906,448.26544 C 221.19513,428.66702 213.78597,395.44534 213.78597,395.44534 L 213.86564,514.54954 L 183.27297,514.54954 L 183.03397,361.98456 L 232.1097,361.98456 C 234.02175,368.03941 244.77698,401.97812 250.03509,420.14254 C 260.31232,455.75429 262.38369,477.3444 262.38369,477.3444 C 262.38369,477.3444 262.94137,454.87792 274.49329,419.10684 C 280.30909,401.10176 291.46266,361.42692 291.46266,361.42692 L 341.33508,361.42692 L 341.33508,514.3902 L 310.98142,514.3902 L 310.74241,394.25031 C 310.74241,394.25031 305.56396,420.54084 301.50088,437.19157" />
          <path d="M 279.99041,662.4141 C 279.99041,665.44149 277.28169,669.42494 271.62523,669.02658 L 213.62664,669.02658 L 213.62664,554.30407 L 271.62523,554.38377 C 278.39704,554.0651 279.99041,557.65019 279.99041,560.67759 L 279.99041,662.4141 z M 183.27297,697.38857 L 261.74635,697.38857 C 279.99041,697.38857 310.50341,689.02336 310.50341,648.6315 L 310.50341,574.93818 C 309.38805,534.62602 279.99041,526.26081 261.74635,526.26081 L 183.27297,526.26081 L 183.27297,697.38857" />
          <path d="M 439.0882,435.67787 L 439.0882,505.46736 L 423.23419,505.46736 L 423.47319,436.7932 C 423.47319,427.47199 432.07738,418.62885 442.75295,418.62885 L 482.10913,418.62885 C 492.70503,418.62885 502.34491,426.99399 502.34491,436.7932 L 502.50424,505.46736 L 485.69421,505.46736 L 485.69421,435.67787 L 439.0882,435.67787 z M 442.67328,409.70594 C 426.89894,409.70594 414.15199,421.73587 414.15199,436.71357 L 414.07232,440.13926 L 413.83332,514.3902 L 448.56874,514.31057 L 448.80775,443.96338 L 476.85102,443.96338 L 476.61201,514.31057 L 511.34744,514.3902 L 511.50677,440.13926 L 511.42711,436.71357 C 511.34744,422.85127 497.72414,409.70594 482.02947,409.70594 L 442.67328,409.70594" />
          <path d="M 403.47643,626.48369 L 403.47643,597.64369 L 457.01359,597.64369 L 457.01359,580.59467 L 402.75941,580.59467 C 391.92451,580.59467 387.94109,587.84448 387.94109,595.25363 L 387.94109,626.96168 C 387.94109,640.02732 394.4739,642.81568 402.67974,642.81568 L 442.1156,642.81568 L 442.1156,671.49634 L 389.21578,671.49634 L 389.21578,688.38603 L 444.02764,688.38603 C 454.86254,688.38603 458.92563,681.45488 458.92563,673.64737 L 458.92563,642.25798 C 458.92563,632.06047 453.10984,626.48369 444.02764,626.48369 L 403.47643,626.48369 z M 413.35531,617.72017 L 444.26664,617.72017 C 463.5464,617.79981 467.84849,631.98077 467.84849,641.77998 L 467.84849,672.53197 C 467.84849,691.17439 454.4642,697.38857 443.15129,697.38857 L 380.45226,697.38857 L 380.45226,662.49379 L 433.0334,662.49379 L 433.0334,651.34022 C 433.0334,651.34022 421.80016,651.41986 401.64405,651.41986 C 381.48795,651.41986 378.06221,636.52186 378.06221,626.48369 L 378.06221,595.25363 C 378.06221,576.85025 391.76517,572.07012 401.64405,572.07012 L 465.61778,572.07012 L 465.61778,606.4869 L 413.35531,606.4869 L 413.35531,617.72017" />
          <path d="M 490.23531,594.77563 C 490.23531,584.10006 497.64447,580.59467 505.53164,580.59467 L 554.12937,580.59467 L 554.12937,597.40473 L 506.48767,597.40473 L 506.408,671.41664 L 555.24472,671.57597 L 555.16506,687.82833 L 505.53164,687.82833 C 497.64447,687.82833 490.23531,683.68561 490.23531,674.60336 L 490.23531,594.77563 z M 481.15312,674.04573 C 481.15312,690.45736 493.74072,697.38857 506.00965,697.38857 L 563.84891,697.38857 L 563.92858,662.57343 L 515.88854,662.57343 L 515.88854,606.72594 L 563.92858,606.72594 L 563.84891,571.91079 L 506.00965,571.91079 C 491.74901,571.91079 481.15312,578.76231 481.15312,595.25363 L 481.15312,674.04573" />
          <path d="M 537.63801,369.39377 L 554.20904,369.39377 L 554.20904,388.27516 L 537.63801,388.27516 L 537.63801,369.39377 z M 528.39648,361.42692 L 563.45057,361.42692 L 563.45057,396.32164 L 528.39648,396.32164 L 528.39648,361.42692 z" />
          <path d="M 538.19569,418.31011 L 554.20904,418.31011 L 554.20904,505.46736 L 538.19569,505.46736 L 538.19569,418.31011 z M 528.63548,409.70594 L 563.92858,409.70594 L 563.92858,514.3902 L 528.63548,514.3902 L 528.63548,409.70594 z" />
          <path d="M 337.19232,534.22765 L 353.76335,534.22765 L 353.76335,553.10904 L 337.19232,553.10904 L 337.19232,534.22765 z M 327.95078,526.26081 L 363.00488,526.26081 L 363.00488,561.15558 L 327.95078,561.15558 L 327.95078,526.26081 z" />
          <path d="M 337.75,582.90503 L 353.60401,582.90503 L 353.60401,686.79263 L 337.75,686.79263 L 337.75,582.90503 z M 328.18979,572.62782 L 363.24389,572.62782 L 363.24389,697.38857 L 328.18979,697.38857 L 328.18979,572.62782 z" />
          <path d="M 388.33943,534.22765 L 404.91046,534.22765 L 404.91046,553.10904 L 388.33943,553.10904 L 388.33943,534.22765 z M 379.0979,526.26081 L 414.15199,526.26081 L 414.15199,561.15558 L 379.0979,561.15558 L 379.0979,526.26081 z" />
          <path d="M 438.53052,534.22765 L 455.10155,534.22765 L 455.10155,553.10904 L 438.53052,553.10904 L 438.53052,534.22765 z M 429.28899,526.26081 L 464.34308,526.26081 L 464.34308,561.15558 L 429.28899,561.15558 L 429.28899,526.26081 z" />
          <path d="M 488.72161,534.22765 L 505.21297,534.22765 L 505.21297,553.10904 L 488.72161,553.10904 L 488.72161,534.22765 z M 479.48008,526.26081 L 514.45451,526.26081 L 514.45451,561.15558 L 479.48008,561.15558 L 479.48008,526.26081 z" />
          <path d="M 538.83304,534.22765 L 555.40406,534.22765 L 555.40406,553.10904 L 538.83304,553.10904 L 538.83304,534.22765 z M 529.67117,526.26081 L 564.6456,526.26081 L 564.6456,561.15558 L 529.67117,561.15558 L 529.67117,526.26081 z" />
          <path d="M 370.17504,369.39377 L 386.74606,369.39377 L 386.74606,388.27516 L 370.17504,388.27516 L 370.17504,369.39377 z M 360.9335,361.42692 L 395.90793,361.42692 L 395.90793,396.32164 L 360.9335,396.32164 L 360.9335,361.42692 z" />
          <path d="M 370.73271,418.31011 L 386.74606,418.31011 L 386.74606,505.46736 L 370.73271,505.46736 L 370.73271,418.31011 z M 361.17251,409.70594 L 396.38594,409.70594 L 396.38594,514.3902 L 361.17251,514.3902 L 361.17251,409.70594 z" />
        </g>
      </g>
    </svg>
  `;

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 240;
        canvas.height = 233;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(blobUrl);
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        URL.revokeObjectURL(blobUrl);
        miniDiscLogoPngCache[cacheKey] = dataUrl;
        resolve(dataUrl);
      } catch (e) {
        URL.revokeObjectURL(blobUrl);
        resolve('');
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(blobUrl);
      resolve('');
    };
    img.src = blobUrl;
  });
}

export async function buildMinidiscPdfDoc(discs: DiscData[]): Promise<jsPDF> {
  // Pre-load all cover images to Data URLs to prevent jsPDF from throwing or freezing on remote URLs
  // Disk cartridge images (square 1:1)
  const coverDataMap: Record<number, string | null> = {};
  // Case labels images (pre-cropped to exact 70:55 ratio with scrim overlay applied)
  const caseCoverMap: Record<number, string | null> = {};
  // Pre-load official MiniDisc logo raster image per disc
  const caseLogoMap: Record<number, string | null> = {};
  const diskLogoMap: Record<number, string | null> = {};

  await Promise.all(
    discs.map(async (disc) => {
      // 1. Covers
      if (disc.coverUrl) {
        coverDataMap[disc.id] = await getLoadedImageDataUrl(disc.coverUrl);
        caseCoverMap[disc.id] = await getCaseCoverDataUrl(
          disc.coverUrl,
          disc.caseLabel.imageCropPosition || 'center',
          disc.caseLabel.overlayColor || '#000000',
          disc.caseLabel.overlayOpacity || 50
        );
      } else {
        coverDataMap[disc.id] = null;
        caseCoverMap[disc.id] = null;
      }

      // 2. Case MD logo
      if (disc.caseLabel.showMdLogo !== false) {
        caseLogoMap[disc.id] = await getMiniDiscLogoPngDataUrl('#ffffff');
      } else {
        caseLogoMap[disc.id] = null;
      }

      // 3. Cartridge MD logo
      if (disc.diskLabel.showMdLogo !== false) {
        const logoColorHex =
          disc.diskLabel.mdLogoColor === 'white'
            ? '#ffffff'
            : disc.diskLabel.mdLogoColor === 'black'
            ? '#111111'
            : disc.diskLabel.mdLogoColor === 'gold'
            ? '#d4af37'
            : disc.diskLabel.textColor || '#ffffff';
        diskLogoMap[disc.id] = await getMiniDiscLogoPngDataUrl(logoColorHex);
      } else {
        diskLogoMap[disc.id] = null;
      }
    })
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  // Background white page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');

  // Professional pre-press crop marks helper (Orezávacie značky)
  const drawCutGuides = (x: number, y: number, w: number, h: number) => {
    // 1. Fine hairline border around label perimeter (helpful for scissors cutting)
    doc.setDrawColor(205, 205, 205);
    doc.setLineWidth(0.08);
    doc.rect(x, y, w, h, 'S');

    // 2. High-precision exterior tick marks for ruler & craft knife cutting
    // Length: 3.2mm, Gap from border: 0.8mm (prevents visible ink on cut sticker)
    const tickLen = 3.2;
    const gap = 0.8;
    doc.setDrawColor(50, 50, 50); // High contrast dark marks for print
    doc.setLineWidth(0.2);

    // Top-Left corner
    doc.line(x, y - gap - tickLen, x, y - gap); // vertical tick up
    doc.line(x - gap - tickLen, y, x - gap, y); // horizontal tick left

    // Top-Right corner
    doc.line(x + w, y - gap - tickLen, x + w, y - gap); // vertical tick up
    doc.line(x + w + gap, y, x + w + gap + tickLen, y); // horizontal tick right

    // Bottom-Left corner
    doc.line(x, y + h + gap, x, y + h + gap + tickLen); // vertical tick down
    doc.line(x - gap - tickLen, y + h, x - gap, y + h); // horizontal tick left

    // Bottom-Right corner
    doc.line(x + w, y + h + gap, x + w, y + h + gap + tickLen); // vertical tick down
    doc.line(x + w + gap, y + h, x + w + gap + tickLen, y + h); // horizontal right
  };

  // Helper to parse hex color to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean || 'ffffff', 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  };

  // 1. Draw 6 Case Labels (Obaly) - 2 columns x 3 rows on the left
  // 1. Draw 6 Case Labels (Obaly na krabičku - case label / J-card)
  // Dimensions: 70mm width x 55mm height (2 columns x 3 rows)
  const casePositions = [
    { x: 10, y: 10, discIdx: 0 },
    { x: 83, y: 10, discIdx: 1 },
    { x: 10, y: 68, discIdx: 2 },
    { x: 83, y: 68, discIdx: 3 },
    { x: 10, y: 126, discIdx: 4 },
    { x: 83, y: 126, discIdx: 5 },
  ];

  for (const pos of casePositions) {
    const disc = discs[pos.discIdx];
    if (!disc) continue;
    const { x, y } = pos;
    const w = 70;
    const h = 55;

    // Fill background
    const bgRgb = hexToRgb(disc.caseLabel.backgroundColor);
    doc.setFillColor(...bgRgb);
    doc.rect(x, y, w, h, 'F');

    // Add cover image pre-cropped to exact 70x55mm format with scrim overlay already applied
    const caseCoverData = caseCoverMap[disc.id];
    if (caseCoverData) {
      try {
        doc.addImage(caseCoverData, 'JPEG', x, y, w, h, undefined, 'FAST');
      } catch (e) {
        console.warn('Cover image render in PDF fallback:', e);
      }
    }

    // Album title & Artist
    const textRgb = hexToRgb(disc.caseLabel.textColor);
    doc.setTextColor(...textRgb);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(disc.album, x + 3.5, y + 6.5, { maxWidth: w - 7 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    const subText = disc.year ? `${disc.artist} · ${disc.year}` : disc.artist;
    doc.text(subText, x + 3.5, y + 10.5, { maxWidth: w - 7 });

    // Real Tracklist: dynamically scaled according to real track count
    if (disc.caseLabel.showTracklist && disc.tracks && disc.tracks.length > 0) {
      const count = disc.tracks.length;
      const isTwoCols = disc.caseLabel.tracklistColumns === 2 || count > 8;

      if (isTwoCols) {
        const half = Math.ceil(count / 2);
        const col1 = disc.tracks.slice(0, half);
        const col2 = disc.tracks.slice(half);

        let fontSize = 5.8;
        let lineStep = 3.0;
        if (half <= 6) {
          fontSize = 5.8;
          lineStep = 3.0;
        } else if (half <= 9) {
          fontSize = 4.9;
          lineStep = 2.5;
        } else {
          fontSize = 4.3;
          lineStep = 2.0;
        }

        doc.setFontSize(fontSize);
        let ty1 = y + 15;
        for (const track of col1) {
          doc.text(`${track.number} ${track.title}`, x + 3.5, ty1, { maxWidth: 30 });
          ty1 += lineStep;
        }

        let ty2 = y + 15;
        for (const track of col2) {
          doc.text(`${track.number} ${track.title}`, x + 35.5, ty2, { maxWidth: 30 });
          ty2 += lineStep;
        }
      } else {
        // Single column
        let fontSize = 6.5;
        let lineStep = 3.6;
        if (count <= 5) {
          fontSize = 6.9;
          lineStep = 3.9;
        } else if (count <= 8) {
          fontSize = 5.8;
          lineStep = 3.1;
        } else {
          fontSize = 5.0;
          lineStep = 2.6;
        }

        doc.setFontSize(fontSize);
        let ty = y + 15;
        for (const track of disc.tracks) {
          doc.text(`${track.number} ${track.title}`, x + 3.5, ty, { maxWidth: w - 7 });
          ty += lineStep;
        }
      }
    }

    // Authentic Sony MiniDisc vector emblem bottom-right
    if (disc.caseLabel.showMdLogo && caseLogoMap[disc.id]) {
      const logoW = 5.2;
      const logoH = Math.round((logoW * 504 / 520) * 10) / 10;
      const bx = x + w - logoW - 2.0;
      const by = y + h - logoH - 2.0;
      try {
        doc.addImage(caseLogoMap[disc.id]!, 'PNG', bx, by, logoW, logoH, undefined, 'FAST');
      } catch (e) {
        console.warn('Failed to draw case MD logo:', e);
      }
    }

    drawCutGuides(x, y, w, h);
  }

  // 2. Draw 6 Cartridge Labels (Nálepky na disk - disklabel)
  // Standard size: 38mm width x 54mm height
  const diskPositions = [
    // Top right 3
    { x: 159, y: 10, discIdx: 0 },
    { x: 159, y: 67, discIdx: 1 },
    { x: 159, y: 124, discIdx: 2 },
    // Bottom row 3
    { x: 83, y: 190, discIdx: 4 },
    { x: 124, y: 190, discIdx: 5 },
    { x: 165, y: 190, discIdx: 3 },
  ];

  for (const pos of diskPositions) {
    const disc = discs[pos.discIdx];
    if (!disc) continue;
    const { x, y } = pos;
    const w = 38;
    const h = 54;

    // Fill background
    const bgRgb = hexToRgb(disc.diskLabel.backgroundColor);
    doc.setFillColor(...bgRgb);
    doc.rect(x, y, w, h, 'F');

    const textRgb = hexToRgb(disc.diskLabel.textColor);
    doc.setTextColor(...textRgb);

    // Title at top (leave room on right for insertion arrow if enabled)
    const hasArrow = disc.diskLabel.showInsertionArrow !== false;
    if (disc.diskLabel.showAlbum) {
      doc.setFont('helvetica', disc.diskLabel.isBold ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.text(disc.album, x + 2.5, y + 5.5, { maxWidth: w - 5 - (hasArrow ? 5 : 0) });
    }

    // Insertion direction arrow in top right corner
    if (hasArrow) {
      const ax = x + w - 4.8;
      const ay = y + 2.0;
      doc.setFillColor(...textRgb);
      doc.setDrawColor(...textRgb);
      doc.setLineWidth(0.1);
      // Arrowhead pointing up
      doc.triangle(
        ax, ay + 2.3,
        ax + 2.6, ay + 2.3,
        ax + 1.3, ay,
        'FD'
      );
      // Stem
      doc.rect(ax + 0.9, ay + 2.3, 0.8, 1.8, 'F');
    }

    // Album cover artwork square in middle (30 x 30 mm inside 38 x 54 mm)
    const imgSize = 30;
    const imgX = x + (w - imgSize) / 2;
    const imgY = y + 8.5;

    const diskCoverData = coverDataMap[disc.id];
    if (diskCoverData) {
      try {
        doc.addImage(diskCoverData, 'JPEG', imgX, imgY, imgSize, imgSize, undefined, 'FAST');
      } catch (e) {
        // Fallback placeholder rect
        doc.setFillColor(200, 200, 200);
        doc.rect(imgX, imgY, imgSize, imgSize, 'F');
      }
    } else {
      // Clean neutral placeholder box
      doc.setFillColor(235, 235, 235);
      doc.rect(imgX, imgY, imgSize, imgSize, 'F');
    }

    // Artist & Year at bottom
    let bY = y + 44.5;
    if (disc.diskLabel.showArtist) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.text(disc.artist, x + 2.5, bY, { maxWidth: w - 10 });
    }

    if (disc.diskLabel.showYear && disc.year) {
      doc.setFontSize(5.5);
      doc.text(disc.year, x + 2.5, bY + 4);
    }

    // Authentic Sony MiniDisc vector emblem bottom-right
    if (disc.diskLabel.showMdLogo && diskLogoMap[disc.id]) {
      const logoW = 5.2;
      const logoH = Math.round((logoW * 504 / 520) * 10) / 10;
      const bx = x + w - logoW - 2.0;
      const by = y + h - logoH - 2.0;
      try {
        doc.addImage(diskLogoMap[disc.id]!, 'PNG', bx, by, logoW, logoH, undefined, 'FAST');
      } catch (e) {
        console.warn('Failed to draw disk MD logo:', e);
      }
    }

    drawCutGuides(x, y, w, h);
  }

  // 3. Draw 6 Spine Labels (Chrbtové nálepky)
  // Size: 65mm width x 5.5mm height (exact match with PrintSheet and standard MD case)
  const spineStartX = 10;
  const spineStartY = 190;
  const spineW = 65;
  const spineH = 5.5;

  for (let i = 0; i < 6; i++) {
    const disc = discs[i];
    if (!disc) continue;
    const sy = spineStartY + i * 7.5;

    const bgRgb = hexToRgb(disc.spineLabel.backgroundColor || disc.diskLabel.backgroundColor);
    doc.setFillColor(...bgRgb);
    doc.rect(spineStartX, sy, spineW, spineH, 'F');

    const textRgb = hexToRgb(disc.spineLabel.textColor || disc.diskLabel.textColor);
    doc.setTextColor(...textRgb);

    const format = disc.spineLabel.format || 'artist-title';
    const spineText =
      format === 'title-only'
        ? disc.album
        : format === 'title-artist'
        ? (disc.artist ? `${disc.album} : ${disc.artist}` : disc.album)
        : (disc.artist ? `${disc.artist} - ${disc.album}` : disc.album);

    const showYear = disc.spineLabel.showYear !== false && !!disc.year;
    const yearWidth = showYear ? 8 : 0;
    const isLong = (spineText.length + (showYear ? 6 : 0)) > 24;

    // Use smaller / condensed font if title is long
    const fontSize = isLong && disc.spineLabel.autoCondense !== false ? 4.8 : (disc.spineLabel.fontSize ? Math.min(5.8, disc.spineLabel.fontSize * 0.65) : 5.4);
    doc.setFont('helvetica', disc.spineLabel.isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);

    // Left title & artist
    doc.text(spineText, spineStartX + 2, sy + 3.5, { maxWidth: spineW - yearWidth - 3 });

    // Right-aligned Year (same font size, weight and style, no MD logo)
    if (showYear) {
      doc.setFont('helvetica', disc.spineLabel.isBold ? 'bold' : 'normal');
      doc.setFontSize(fontSize);
      doc.text(disc.year, spineStartX + spineW - 2, sy + 3.5, { align: 'right' });
    }

    drawCutGuides(spineStartX, sy, spineW, spineH);
  }

  // 4. Calibration Ruler (5 cm) at the bottom
  const rulerX = 10;
  const rulerY = 278;
  const rulerW = 50; // exactly 50mm = 5cm

  doc.setDrawColor(80, 80, 80);
  doc.setLineWidth(0.3);
  doc.line(rulerX, rulerY, rulerX + rulerW, rulerY);

  // Ticks every 10mm (1 cm)
  for (let i = 0; i <= 5; i++) {
    const tx = rulerX + i * 10;
    const tickLen = i === 0 || i === 5 ? 4 : 2.5;
    doc.line(tx, rulerY, tx, rulerY - tickLen);
  }

  doc.setTextColor(80, 80, 80);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('5 cm', rulerX + rulerW / 2, rulerY - 5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.text('Kontrolné meradlo mierky tlače (100% / bez zmenšenia)', rulerX, rulerY + 4);

  return doc;
}

// Download A4 PDF file
export async function generateMinidiscPdf(discs: DiscData[]): Promise<void> {
  const doc = await buildMinidiscPdfDoc(discs);
  doc.save(`Minidisc_Labels_A4_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Direct print with robust cross-origin iframe / sandbox support
export async function printMinidiscDirectly(discs: DiscData[]): Promise<void> {
  // Method 1: Try native window.print() in current window
  let printed = false;
  try {
    window.print();
    printed = true;
    return;
  } catch (err) {
    console.warn('Direct window.print() failed or restricted by sandbox:', err);
  }

  // Method 2: If inside sandboxed iframe (such as AI Studio preview iframe where window.print is restricted),
  // open clean dedicated print window or fallback to high-resolution vector PDF
  try {
    const doc = await buildMinidiscPdfDoc(discs);
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    // Try opening in a new tab where native browser PDF viewer with 1-click print is available
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      setTimeout(() => {
        try {
          printWindow.print();
        } catch {
          // User has browser viewer print button in the opened tab
        }
      }, 500);
      return;
    }

    // If popup was blocked by browser, trigger direct download of the print-ready PDF
    doc.save(`Minidisc_Labels_A4_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (pdfErr) {
    console.error('Print generation failed, initiating direct PDF export:', pdfErr);
    await generateMinidiscPdf(discs);
  }
}
