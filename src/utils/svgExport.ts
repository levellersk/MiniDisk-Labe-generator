import { DiscData } from '../types/minidisc';

// Helper to convert image URL to base64 data URL with CORS fallback
async function getLoadedImageDataUrl(url: string): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 300;
        canvas.height = img.naturalHeight || img.height || 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (e) {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
}

function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Builds an authentic, layered SVG document fully compatible with Inkscape
 * Page size: A4 (210 x 297 mm)
 * Structured with named Inkscape layers:
 *  - Guides and Grid
 *  - Case Labels (70 x 55 mm)
 *  - Cartridge Labels (38 x 54 mm)
 *  - Spine Labels (65 x 5.5 mm)
 *  - Crop Marks & Ruler
 */
export async function generateMinidiscSvg(discs: DiscData[]): Promise<string> {
  // Preload cover images
  const coverMap: Record<number, string | null> = {};
  await Promise.all(
    discs.map(async (d) => {
      if (d.coverUrl) {
        coverMap[d.id] = await getLoadedImageDataUrl(d.coverUrl);
      } else {
        coverMap[d.id] = null;
      }
    })
  );

  // Sony MiniDisc vector logo path data
  const miniDiscOuterPath = "M 120.97229,719.05832 L 120.97229,333.22426 C 120.97229,305.49967 143.43878,283.03319 171.08371,283.03319 L 572.93111,283.03319 C 600.65571,283.03319 623.1222,305.49967 623.1222,333.14463 L 622.96286,719.21765 C 622.96286,746.94231 600.49637,769.32909 572.85144,769.32909 L 171.08371,769.32909 C 143.43878,769.32909 120.97229,746.86261 120.97229,719.21765 L 120.97229,719.05832 z M 611.80929,333.14463 C 611.80929,311.71385 594.36191,294.34609 572.93111,294.34609 L 171.08371,294.34609 C 149.65291,294.34609 132.2852,311.79348 132.2852,333.22426 L 132.2852,719.21765 C 132.2852,740.6485 149.65291,758.01619 171.08371,758.01619 L 572.85144,758.01619 C 594.28224,758.01619 611.64995,740.6485 611.64995,719.21765 L 611.80929,333.14463";
  const miniDiscLettersPath = `
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
  `;

  const miniDiscLogoSvg = (x: number, y: number, size: number, color: string) => {
    const scale = size / 520;
    return `
      <g transform="translate(${x}, ${y}) scale(${scale}) translate(-112.1102, -274.1811)">
        <path d="${miniDiscOuterPath}" fill="${color}" fill-rule="evenodd" />
        <g fill="${color}" fill-rule="evenodd">
          ${miniDiscLettersPath}
        </g>
      </g>
    `;
  };

  const arrowSvg = (x: number, y: number, size: number, color: string) => {
    // Stylized slender needle triangle pointing up (matching authentic MD shells)
    // Width ~1.4mm, Height ~3.6mm
    const w = 1.4;
    const h = 3.6;
    return `
      <polygon points="${x + w / 2},${y} ${x + w},${y + h} ${x},${y + h}" fill="${color}" />
    `;
  };

  // Crop marks generator
  const renderCropMarks = (x: number, y: number, w: number, h: number) => {
    const tickLen = 3.2;
    const gap = 0.8;
    return `
      <!-- Outline border -->
      <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#d4d4d4" stroke-width="0.08" />
      <!-- Top-left -->
      <line x1="${x}" y1="${y - gap}" x2="${x}" y2="${y - gap - tickLen}" stroke="#222" stroke-width="0.15" />
      <line x1="${x - gap}" y1="${y}" x2="${x - gap - tickLen}" y2="${y}" stroke="#222" stroke-width="0.15" />
      <!-- Top-right -->
      <line x1="${x + w}" y1="${y - gap}" x2="${x + w}" y2="${y - gap - tickLen}" stroke="#222" stroke-width="0.15" />
      <line x1="${x + w + gap}" y1="${y}" x2="${x + w + gap + tickLen}" y2="${y}" stroke="#222" stroke-width="0.15" />
      <!-- Bottom-left -->
      <line x1="${x}" y1="${y + h + gap}" x2="${x}" y2="${y + h + gap + tickLen}" stroke="#222" stroke-width="0.15" />
      <line x1="${x - gap}" y1="${y + h}" x2="${x - gap - tickLen}" y2="${y + h}" stroke="#222" stroke-width="0.15" />
      <!-- Bottom-right -->
      <line x1="${x + w}" y1="${y + h + gap}" x2="${x + w}" y2="${y + h + gap + tickLen}" stroke="#222" stroke-width="0.15" />
      <line x1="${x + w + gap}" y1="${y + h}" x2="${x + w + gap + tickLen}" y2="${y + h}" stroke="#222" stroke-width="0.15" />
    `;
  };

  // 1. Case Labels (70 x 55 mm) - 6 items
  const casePositions = [
    { disc: discs[0], col: 0, row: 0 },
    { disc: discs[1], col: 1, row: 0 },
    { disc: discs[2], col: 0, row: 1 },
    { disc: discs[3], col: 1, row: 1 },
    { disc: discs[4], col: 0, row: 2 },
    { disc: discs[5], col: 1, row: 2 },
  ];

  let caseElements = '';
  casePositions.forEach(({ disc, col, row }) => {
    const x = 10 + col * 73;
    const y = 10 + row * 58;
    const w = 70;
    const h = 55;
    const coverData = coverMap[disc.id];

    caseElements += `
      <g id="case-label-${disc.id}" inkscape:label="Case ${disc.id}: ${escapeXml(disc.album || 'Disc ' + disc.id)}">
        <!-- Background -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${disc.caseLabel.backgroundColor || '#111827'}" />
    `;

    // Background Image
    if (coverData) {
      const cropY = disc.caseLabel.imageCropPosition === 'top' ? y : disc.caseLabel.imageCropPosition === 'bottom' ? y - (w - h) : y - (w - h) / 2;
      caseElements += `
        <g clip-path="url(#clip-case-${disc.id})">
          <image x="${x}" y="${cropY}" width="${w}" height="${w}" href="${coverData}" preserveAspectRatio="xMidYMid slice" />
          <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${disc.caseLabel.overlayColor || '#000000'}" opacity="${(disc.caseLabel.overlayOpacity || 50) / 100}" />
        </g>
      `;
    }

    // Title and Artist
    caseElements += `
      <text x="${x + 3}" y="${y + 5.5}" font-family="${escapeXml(disc.caseLabel.fontFamily || 'sans-serif')}" font-size="3.7" font-weight="bold" fill="#ffffff">${escapeXml(disc.album)}</text>
      <text x="${x + 3}" y="${y + 9}" font-family="${escapeXml(disc.caseLabel.fontFamily || 'sans-serif')}" font-size="2.6" font-weight="500" fill="#e5e7eb">${escapeXml(disc.artist)}${disc.year ? ' · ' + escapeXml(disc.year) : ''}</text>
    `;

    // Tracklist
    if (disc.caseLabel.showTracklist && disc.tracks && disc.tracks.length > 0) {
      const tracksToRender = disc.tracks.slice(0, 16);
      const isTwoCol = disc.caseLabel.tracklistColumns === 2 && tracksToRender.length > 8;
      const col1 = isTwoCol ? tracksToRender.slice(0, Math.ceil(tracksToRender.length / 2)) : tracksToRender;
      const col2 = isTwoCol ? tracksToRender.slice(Math.ceil(tracksToRender.length / 2)) : [];

      const startY = y + 13.5;
      const rowH = Math.min(2.4, 30 / Math.max(col1.length, 1));

      col1.forEach((t, idx) => {
        caseElements += `
          <text x="${x + 3}" y="${startY + idx * rowH}" font-family="monospace" font-size="1.9" fill="#f3f4f6">${escapeXml(t.number)}. ${escapeXml(t.title)}</text>
        `;
      });

      if (isTwoCol) {
        col2.forEach((t, idx) => {
          caseElements += `
            <text x="${x + 36}" y="${startY + idx * rowH}" font-family="monospace" font-size="1.9" fill="#f3f4f6">${escapeXml(t.number)}. ${escapeXml(t.title)}</text>
          `;
        });
      }
    }

    // Logo
    if (disc.caseLabel.showMdLogo !== false) {
      caseElements += miniDiscLogoSvg(x + w - 5.5, y + h - 5.5, 4.2, '#ffffff');
    }

    caseElements += `</g>`;
  });

  // 2. Cartridge Disk Labels (38 x 54 mm) - 6 items
  // Top right column (discs 1, 2, 3)
  // Bottom horizontal row (discs 5, 6, 4)
  const diskPositions = [
    { disc: discs[0], x: 159, y: 10 },
    { disc: discs[1], x: 159, y: 67 },
    { disc: discs[2], x: 159, y: 124 },
    { disc: discs[4], x: 83, y: 190 },
    { disc: discs[5], x: 124, y: 190 },
    { disc: discs[3], x: 165, y: 190 },
  ];

  let diskElements = '';
  diskPositions.forEach(({ disc, x, y }) => {
    const w = 38;
    const h = 54;
    const { diskLabel } = disc;
    const coverData = coverMap[disc.id];
    const logoColor =
      diskLabel.mdLogoColor === 'white'
        ? '#ffffff'
        : diskLabel.mdLogoColor === 'black'
        ? '#111111'
        : diskLabel.mdLogoColor === 'gold'
        ? '#d4af37'
        : diskLabel.textColor;

    diskElements += `
      <g id="cartridge-label-${disc.id}" inkscape:label="Disk ${disc.id}: ${escapeXml(disc.album || 'Cartridge ' + disc.id)}">
        <!-- Background -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${diskLabel.backgroundColor || '#1c1917'}" />
    `;

    // Title on top
    if (diskLabel.showAlbum) {
      const fontSizeMm = (diskLabel.fontSize || 10) * 0.28;
      diskElements += `
        <text x="${x + 2.5}" y="${y + 4.8}" font-family="${escapeXml(diskLabel.fontFamily || 'sans-serif')}" font-size="${fontSizeMm}" font-weight="${diskLabel.isBold ? 'bold' : '500'}" fill="${diskLabel.textColor}">${escapeXml(disc.album)}</text>
      `;
    }

    // Insertion Arrow
    if (diskLabel.showInsertionArrow !== false) {
      diskElements += arrowSvg(x + w - 4.5, y + 1.8, 3.2, diskLabel.textColor);
    }

    // Cover Square in center (30 x 30 mm)
    const imgSize = 30;
    const imgX = x + (w - imgSize) / 2;
    const imgY = y + 8.5;

    if (coverData) {
      diskElements += `
        <rect x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" fill="#222222" />
        <image x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" href="${coverData}" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      diskElements += `
        <rect x="${imgX}" y="${imgY}" width="${imgSize}" height="${imgSize}" fill="#e5e7eb" stroke="#d1d5db" stroke-width="0.2" />
        <text x="${imgX + imgSize / 2}" y="${imgY + imgSize / 2 + 1}" font-family="sans-serif" font-size="2.5" fill="#9ca3af" text-anchor="middle">MD Cover</text>
      `;
    }

    // Artist & Year
    if (diskLabel.showArtist && disc.artist) {
      diskElements += `
        <text x="${x + 2.5}" y="${y + 44.5}" font-family="${escapeXml(diskLabel.fontFamily || 'sans-serif')}" font-size="2.5" font-weight="600" fill="${diskLabel.textColor}">${escapeXml(disc.artist)}</text>
      `;
    }
    if (diskLabel.showYear && disc.year) {
      diskElements += `
        <text x="${x + 2.5}" y="${y + 48.5}" font-family="${escapeXml(diskLabel.fontFamily || 'sans-serif')}" font-size="2.1" opacity="0.8" fill="${diskLabel.textColor}">${escapeXml(disc.year)}</text>
      `;
    }

    // MD Logo bottom-right
    if (diskLabel.showMdLogo !== false) {
      diskElements += miniDiscLogoSvg(x + w - 5.5, y + h - 5.5, 4.4, logoColor);
    }

    diskElements += `</g>`;
  });

  // 3. Spine Labels (65 x 5.5 mm) - 6 items
  let spineElements = '';
  discs.forEach((disc, idx) => {
    const sx = 10;
    const sy = 190 + idx * 7.5;
    const sw = 65;
    const sh = 5.5;

    const format = disc.spineLabel.format || 'artist-title';
    const spineText =
      format === 'title-only'
        ? disc.album
        : format === 'title-artist'
        ? (disc.artist ? `${disc.album} : ${disc.artist}` : disc.album)
        : (disc.artist ? `${disc.artist} - ${disc.album}` : disc.album);

    const showYear = disc.spineLabel.showYear !== false && !!disc.year;
    const isTextLong = (spineText.length + (showYear ? 6 : 0)) > 24;
    const fontSize = isTextLong && disc.spineLabel.autoCondense !== false ? 1.8 : 2.1;

    spineElements += `
      <g id="spine-label-${disc.id}" inkscape:label="Spine ${disc.id}: ${escapeXml(disc.album || 'Spine ' + disc.id)}">
        <!-- Background -->
        <rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" fill="${disc.spineLabel.backgroundColor || disc.diskLabel.backgroundColor}" />
        <!-- Title & Artist -->
        <text x="${sx + 2}" y="${sy + 3.6}" font-family="${escapeXml(disc.spineLabel.fontFamily || 'sans-serif')}" font-size="${fontSize}" font-weight="${disc.spineLabel.isBold ? 'bold' : '500'}" fill="${disc.spineLabel.textColor || disc.diskLabel.textColor}">${escapeXml(spineText)}</text>
    `;

    if (showYear) {
      spineElements += `
        <text x="${sx + sw - 2}" y="${sy + 3.6}" font-family="${escapeXml(disc.spineLabel.fontFamily || 'sans-serif')}" font-size="${fontSize}" font-weight="${disc.spineLabel.isBold ? 'bold' : '500'}" fill="${disc.spineLabel.textColor || disc.diskLabel.textColor}" text-anchor="end">${escapeXml(disc.year)}</text>
      `;
    }

    spineElements += `</g>`;
  });

  // 4. Crop Marks Layer
  let cropMarksElements = '';
  // Case crop marks
  casePositions.forEach(({ col, row }) => {
    cropMarksElements += renderCropMarks(10 + col * 73, 10 + row * 58, 70, 55);
  });
  // Disk crop marks
  diskPositions.forEach(({ x, y }) => {
    cropMarksElements += renderCropMarks(x, y, 38, 54);
  });
  // Spine crop marks
  discs.forEach((_, idx) => {
    cropMarksElements += renderCropMarks(10, 190 + idx * 7.5, 65, 5.5);
  });

  // 5. Calibration Ruler (5 cm) at 100% scale
  const rulerElements = `
    <g id="calibration-ruler" inkscape:label="5cm Calibration Ruler">
      <line x1="10" y1="278" x2="60" y2="278" stroke="#333333" stroke-width="0.3" />
      <line x1="10" y1="278" x2="10" y2="274" stroke="#333333" stroke-width="0.3" />
      <line x1="20" y1="278" x2="20" y2="275.5" stroke="#333333" stroke-width="0.3" />
      <line x1="30" y1="278" x2="30" y2="275.5" stroke="#333333" stroke-width="0.3" />
      <line x1="40" y1="278" x2="40" y2="275.5" stroke="#333333" stroke-width="0.3" />
      <line x1="50" y1="278" x2="50" y2="275.5" stroke="#333333" stroke-width="0.3" />
      <line x1="60" y1="278" x2="60" y2="274" stroke="#333333" stroke-width="0.3" />
      <text x="35" y="273.5" font-family="sans-serif" font-size="2.6" font-weight="600" fill="#444444" text-anchor="middle">5 cm</text>
      <text x="10" y="282" font-family="sans-serif" font-size="2" fill="#666666">Kontrolné meradlo mierky tlače (100% / bez zmenšenia)</text>
    </g>
  `;

  // Defs for clip paths
  const clipDefs = casePositions
    .map(
      ({ disc, col, row }) => `
      <clipPath id="clip-case-${disc.id}">
        <rect x="${10 + col * 73}" y="${10 + row * 58}" width="70" height="55" />
      </clipPath>
    `
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg
   xmlns:dc="http://purl.org/dc/elements/1.1/"
   xmlns:cc="http://creativecommons.org/ns#"
   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
   xmlns:svg="http://www.w3.org/2000/svg"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:xlink="http://www.w3.org/1999/xlink"
   xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"
   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
   width="210mm"
   height="297mm"
   viewBox="0 0 210 297"
   version="1.1"
   id="minidisc-a4-sheet"
   inkscape:version="1.2 (dc2aedaf03, 2022-05-15)"
   sodipodi:docname="minidisc_labels_a4.svg">
  <defs>
    ${clipDefs}
  </defs>
  <sodipodi:namedview
     id="base"
     pagecolor="#ffffff"
     bordercolor="#666666"
     borderopacity="1.0"
     inkscape:pageopacity="0.0"
     inkscape:pageshadow="2"
     inkscape:zoom="0.9"
     inkscape:cx="400"
     inkscape:cy="560"
     inkscape:document-units="mm"
     inkscape:current-layer="layer-cropmarks"
     showgrid="false"
     units="mm" />
  
  <!-- BACKGROUND WHITE PAGE -->
  <rect id="a4-background" x="0" y="0" width="210" height="297" fill="#ffffff" />

  <!-- INKSCAPE LAYER 1: Case Labels (70 x 55 mm) -->
  <g inkscape:groupmode="layer" id="layer-case-labels" inkscape:label="1. Case Inserts (70x55mm)">
    ${caseElements}
  </g>

  <!-- INKSCAPE LAYER 2: Cartridge Labels (38 x 54 mm) -->
  <g inkscape:groupmode="layer" id="layer-cartridge-labels" inkscape:label="2. Cartridge Labels (38x54mm)">
    ${diskElements}
  </g>

  <!-- INKSCAPE LAYER 3: Spine Labels (65 x 5.5 mm) -->
  <g inkscape:groupmode="layer" id="layer-spine-labels" inkscape:label="3. Spine Labels (65x5.5mm)">
    ${spineElements}
  </g>

  <!-- INKSCAPE LAYER 4: Crop Marks & Cut Guides -->
  <g inkscape:groupmode="layer" id="layer-cropmarks" inkscape:label="4. Crop Marks & Cut Guides">
    ${cropMarksElements}
    ${rulerElements}
  </g>
</svg>`;
}

/**
 * Initiates direct download of Inkscape SVG file
 */
export async function exportMinidiscSvg(discs: DiscData[]): Promise<void> {
  const svgContent = await generateMinidiscSvg(discs);
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `Minidisc_Sheet_${dateStr}.svg`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
