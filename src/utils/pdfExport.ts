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

  // Thin cutting lines helper
  const drawCutGuides = (x: number, y: number, w: number, h: number) => {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.1);
    doc.rect(x, y, w, h, 'S');

    // Small corner tick marks extending 2mm outward
    const tick = 2;
    doc.setDrawColor(160, 160, 160);
    doc.setLineWidth(0.15);
    // top-left
    doc.line(x - tick, y, x, y);
    doc.line(x, y - tick, x, y);
    // top-right
    doc.line(x + w, y, x + w + tick, y);
    doc.line(x + w, y - tick, x + w, y);
    // bottom-left
    doc.line(x - tick, y + h, x, y + h);
    doc.line(x, y + h, x, y + h + tick);
    // bottom-right
    doc.line(x + w, y + h, x + w + tick, y + h);
    doc.line(x + w, y + h, x + w, y + h + tick);
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
  // Dimensions: 70mm x 70mm
  const casePositions = [
    { x: 10, y: 10, discIdx: 0 },
    { x: 83, y: 10, discIdx: 1 },
    { x: 10, y: 83, discIdx: 2 },
    { x: 83, y: 83, discIdx: 3 },
    { x: 10, y: 156, discIdx: 4 },
    { x: 83, y: 156, discIdx: 5 },
  ];

  for (const pos of casePositions) {
    const disc = discs[pos.discIdx];
    if (!disc) continue;
    const { x, y } = pos;
    const w = 70;
    const h = 70;

    // Fill background
    const bgRgb = hexToRgb(disc.caseLabel.backgroundColor);
    doc.setFillColor(...bgRgb);
    doc.rect(x, y, w, h, 'F');

    // Add cover image if exists
    if (disc.coverUrl) {
      try {
        doc.addImage(disc.coverUrl, 'JPEG', x, y, w, h, undefined, 'FAST');
        // Overlay for readability
        const overlayOpacity = (disc.caseLabel.overlayOpacity || 50) / 100;
        doc.setFillColor(0, 0, 0);
        // jsPDF GState if available, or simulated
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
    doc.setFontSize(10.5);
    doc.text(disc.album, x + 4, y + 8, { maxWidth: w - 8 });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const subText = disc.year ? `${disc.artist} - ${disc.year}` : disc.artist;
    doc.text(subText, x + 4, y + 13, { maxWidth: w - 8 });

    // Tracklist
    if (disc.caseLabel.showTracklist && disc.tracks.length > 0) {
      doc.setFontSize(6.5);
      let ty = y + 21;
      const visibleTracks = disc.tracks.slice(0, 7);
      for (const track of visibleTracks) {
        doc.text(`${track.number} ${track.title}`, x + 4, ty, { maxWidth: w - 16 });
        ty += 3.8;
      }
      if (disc.tracks.length > 7) {
        doc.setFontSize(5.5);
        doc.text(`+ ${disc.tracks.length - 7} ďalších skladieb`, x + 4, ty);
      }
    }

    // MiniDisc emblem bottom-right
    if (disc.caseLabel.showMdLogo) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.5);
      doc.setDrawColor(...textRgb);
      doc.setLineWidth(0.2);
      doc.rect(x + w - 7, y + h - 7, 5, 5, 'S');
      doc.text('MD', x + w - 5.7, y + h - 3.5);
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
    { x: 83, y: 228, discIdx: 4 },
    { x: 124, y: 228, discIdx: 5 },
    { x: 165, y: 228, discIdx: 3 },
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

    // Title at top
    if (disc.diskLabel.showAlbum) {
      doc.setFont('helvetica', disc.diskLabel.isBold ? 'bold' : 'normal');
      doc.setFontSize(7.5);
      doc.text(disc.album, x + 2.5, y + 5.5, { maxWidth: w - 5 });
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

    // MiniDisc logo in bottom right
    if (disc.diskLabel.showMdLogo) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(4.5);
      doc.setDrawColor(...textRgb);
      doc.setLineWidth(0.2);
      doc.rect(x + w - 6.5, y + h - 6.5, 4.5, 4.5, 'S');
      doc.text('MD', x + w - 5.5, y + h - 3.4);
    }

    drawCutGuides(x, y, w, h);
  }

  // 3. Draw 6 Spine Labels (Chrbtové nálepky)
  // Size: 54mm width x 5mm height
  const spineStartX = 10;
  const spineStartY = 230;
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
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    const spineText = `${disc.album} : ${disc.artist}`;
    doc.text(spineText, spineStartX + 2, sy + 3.6, { maxWidth: spineW - 4 });

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
