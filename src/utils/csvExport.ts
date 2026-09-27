import { DiscData, TrackItem } from '../types/minidisc';

export function exportDiscsToCsv(discs: DiscData[]): void {
  const headers = ['Disk ID', 'Artist', 'Album', 'Year', 'Track Number', 'Track Title', 'Track Duration', 'Disk Background Color', 'Disk Text Color', 'Font Family'];
  const rows: string[][] = [headers];

  discs.forEach((disc) => {
    if (disc.tracks.length === 0) {
      rows.push([
        String(disc.id),
        escapeCsv(disc.artist),
        escapeCsv(disc.album),
        escapeCsv(disc.year),
        '',
        '',
        '',
        disc.diskLabel.backgroundColor,
        disc.diskLabel.textColor,
        disc.diskLabel.fontFamily,
      ]);
    } else {
      disc.tracks.forEach((track) => {
        rows.push([
          String(disc.id),
          escapeCsv(disc.artist),
          escapeCsv(disc.album),
          escapeCsv(disc.year),
          escapeCsv(track.number),
          escapeCsv(track.title),
          escapeCsv(track.duration || ''),
          disc.diskLabel.backgroundColor,
          disc.diskLabel.textColor,
          disc.diskLabel.fontFamily,
        ]);
      });
    }
  });

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `minidisc_labels_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCsv(val: string): string {
  if (!val) return '""';
  const clean = val.replace(/"/g, '""');
  return `"${clean}"`;
}

export function parseCsvTracks(csvText: string): { artist?: string; album?: string; year?: string; tracks: TrackItem[] } {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return { tracks: [] };

  const tracks: TrackItem[] = [];
  let detectedArtist = '';
  let detectedAlbum = '';
  let detectedYear = '';

  // Skip header if line 0 looks like a header
  const startIndex = lines[0].toLowerCase().includes('artist') || lines[0].toLowerCase().includes('track') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length >= 2) {
      // Possible formats:
      // If exported by us: [Disk ID, Artist, Album, Year, Track Number, Track Title, Track Duration, ...]
      if (cols.length >= 6 && !isNaN(Number(cols[0]))) {
        detectedArtist = detectedArtist || cols[1];
        detectedAlbum = detectedAlbum || cols[2];
        detectedYear = detectedYear || cols[3];
        if (cols[5]) {
          tracks.push({
            id: `imported-${i}`,
            number: cols[4] || String(tracks.length + 1).padStart(2, '0'),
            title: cols[5],
            duration: cols[6] || undefined,
          });
        }
      } else {
        // Generic CSV: [Number, Title] or [Title, Duration]
        const num = cols[0];
        const title = cols[1];
        const dur = cols[2];
        tracks.push({
          id: `imported-${i}`,
          number: num || String(tracks.length + 1).padStart(2, '0'),
          title: title,
          duration: dur,
        });
      }
    }
  }

  return { artist: detectedArtist, album: detectedAlbum, year: detectedYear, tracks };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
