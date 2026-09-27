import { jsPDF } from 'jspdf';
import { DiscData } from '../types/minidisc';

export async function generateMinidiscPdf(discs: DiscData[]): Promise<void> {
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

    // Add cover image cropped top and bottom to fill 70x55mm format
    if (disc.coverUrl) {
      try {
        const cropPos = disc.caseLabel.imageCropPosition || 'center';
        // Album art is square (70 x 70 mm), cropped to 70 x 55 mm
        const imgSize = 70;
        const imgY = cropPos === 'top' ? y : cropPos === 'bottom' ? y - 15 : y - 7.5;

        // @ts-ignore
        if (doc.saveGraphicsState && doc.clip && doc.restoreGraphicsState) {
          // @ts-ignore
          doc.saveGraphicsState();
          doc.rect(x, y, w, h);
          // @ts-ignore
          doc.clip();
          doc.addImage(disc.coverUrl, 'JPEG', x, imgY, imgSize, imgSize, undefined, 'FAST');
          // @ts-ignore
          doc.restoreGraphicsState();
        } else {
          doc.addImage(disc.coverUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
        }

        // Overlay for readability
        const overlayOpacity = (disc.caseLabel.overlayOpacity || 50) / 100;
        doc.setFillColor(0, 0, 0);
        // @ts-ignore
        if (doc.setGState) {
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: overlayOpacity }));
          doc.rect(x, y, w, h, 'F');
          // @ts-ignore
          doc.setGState(new doc.GState({ opacity: 1 }));
        }
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

    // Authentic MiniDisc squircle emblem bottom-right
    if (disc.caseLabel.showMdLogo) {
      const bx = x + w - 7.2;
      const by = y + h - 6.8;
      doc.setDrawColor(...textRgb);
      doc.setTextColor(...textRgb);
      doc.setLineWidth(0.2);
      doc.roundedRect(bx, by, 5.2, 5.2, 1.0, 1.0, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(3.1);
      doc.text('Mini', bx + 1.1, by + 2.3);
      doc.text('Disc', bx + 1.1, by + 4.2);
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

    // Album cover artwork square in middle
    const imgSize = 33;
    const imgX = x + (w - imgSize) / 2;
    const imgY = y + 7.5;

    if (disc.coverUrl) {
      try {
        doc.addImage(disc.coverUrl, 'JPEG', imgX, imgY, imgSize, imgSize, undefined, 'FAST');
      } catch (e) {
        // Fallback placeholder rect
        doc.setFillColor(200, 200, 200);
        doc.rect(imgX, imgY, imgSize, imgSize, 'F');
      }
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

    // Authentic MiniDisc squircle logo in bottom right
    if (disc.diskLabel.showMdLogo) {
      const bx = x + w - 6.8;
      const by = y + h - 6.8;
      const logoColorHex =
        disc.diskLabel.mdLogoColor === 'white'
          ? '#ffffff'
          : disc.diskLabel.mdLogoColor === 'black'
          ? '#111111'
          : disc.diskLabel.mdLogoColor === 'gold'
          ? '#d4af37'
          : disc.diskLabel.textColor;
      const logoRgb = hexToRgb(logoColorHex);
      doc.setDrawColor(...logoRgb);
      doc.setTextColor(...logoRgb);
      doc.setLineWidth(0.2);
      doc.roundedRect(bx, by, 5.0, 5.0, 1.0, 1.0, 'S');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(2.9);
      doc.text('Mini', bx + 1.0, by + 2.2);
      doc.text('Disc', bx + 1.0, by + 4.1);
    }

    drawCutGuides(x, y, w, h);
  }

  // 3. Draw 6 Spine Labels (Chrbtové nálepky)
  // Size: 54mm width x 5mm height
  const spineStartX = 10;
  const spineStartY = 190;
  const spineW = 60;
  const spineH = 5;

  for (let i = 0; i < 6; i++) {
    const disc = discs[i];
    if (!disc) continue;
    const sy = spineStartY + i * 6;

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

  // Save the PDF
  doc.save(`Minidisc_Labels_A4_${new Date().toISOString().slice(0, 10)}.pdf`);
}
