import { DiscData } from '../types/minidisc';

export interface MinidiscProjectFile {
  version: '1.0';
  appName: 'Minidisc Label Studio';
  exportedAt: string;
  discs: DiscData[];
}

/**
 * Saves current 6 discs project to a .minidisc JSON file on user's disk
 */
export function exportProjectFile(discs: DiscData[]): void {
  const project: MinidiscProjectFile = {
    version: '1.0',
    appName: 'Minidisc Label Studio',
    exportedAt: new Date().toISOString(),
    discs,
  };

  const jsonString = JSON.stringify(project, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  const dateStr = new Date().toISOString().slice(0, 10);
  link.download = `minidisc_project_${dateStr}.minidisc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Validates and parses project JSON content
 */
export function parseProjectFile(jsonContent: string): DiscData[] {
  const data = JSON.parse(jsonContent);

  // Check if it's the wrapper format or direct array
  let discsArray: any[] | null = null;
  if (data && Array.isArray(data.discs)) {
    discsArray = data.discs;
  } else if (Array.isArray(data)) {
    discsArray = data;
  }

  if (!discsArray || discsArray.length === 0) {
    throw new Error('Neplatný formát projektu: Chýbajú dáta diskov.');
  }

  // Ensure exactly 6 items with proper IDs and required nested objects
  const validated: DiscData[] = [];
  for (let i = 1; i <= 6; i++) {
    const found = discsArray.find((d: any) => d && d.id === i) || discsArray[i - 1];
    if (found) {
      validated.push({
        id: i,
        isConfigured: Boolean(found.isConfigured),
        artist: String(found.artist || ''),
        album: String(found.album || ''),
        year: String(found.year || ''),
        tracks: Array.isArray(found.tracks) ? found.tracks : [],
        coverUrl: String(found.coverUrl || ''),
        highResCoverUrl: found.highResCoverUrl ? String(found.highResCoverUrl) : undefined,
        sourceReleaseId: found.sourceReleaseId ? String(found.sourceReleaseId) : undefined,
        sourceProvider: found.sourceProvider ? String(found.sourceProvider) : undefined,
        diskLabel: {
          backgroundColor: found.diskLabel?.backgroundColor || '#1c1917',
          textColor: found.diskLabel?.textColor || '#ffffff',
          fontFamily: found.diskLabel?.fontFamily || 'Inter, sans-serif',
          fontSize: typeof found.diskLabel?.fontSize === 'number' ? found.diskLabel.fontSize : 11,
          isBold: found.diskLabel?.isBold !== undefined ? Boolean(found.diskLabel.isBold) : true,
          showYear: found.diskLabel?.showYear !== undefined ? Boolean(found.diskLabel.showYear) : true,
          showArtist: found.diskLabel?.showArtist !== undefined ? Boolean(found.diskLabel.showArtist) : true,
          showAlbum: found.diskLabel?.showAlbum !== undefined ? Boolean(found.diskLabel.showAlbum) : true,
          showMdLogo: found.diskLabel?.showMdLogo !== undefined ? Boolean(found.diskLabel.showMdLogo) : true,
          mdLogoColor: found.diskLabel?.mdLogoColor || 'auto',
          customLogoColor: found.diskLabel?.customLogoColor,
          showInsertionArrow: found.diskLabel?.showInsertionArrow !== undefined ? Boolean(found.diskLabel.showInsertionArrow) : true,
          coverImage: found.diskLabel?.coverImage,
          coverScale: found.diskLabel?.coverScale,
          coverFit: found.diskLabel?.coverFit,
        },
        spineLabel: {
          backgroundColor: found.spineLabel?.backgroundColor || '#1c1917',
          textColor: found.spineLabel?.textColor || '#ffffff',
          fontFamily: found.spineLabel?.fontFamily || 'Inter, sans-serif',
          fontSize: typeof found.spineLabel?.fontSize === 'number' ? found.spineLabel.fontSize : 8.5,
          isBold: found.spineLabel?.isBold !== undefined ? Boolean(found.spineLabel.isBold) : true,
          format: found.spineLabel?.format || 'artist-title',
          showYear: found.spineLabel?.showYear !== undefined ? Boolean(found.spineLabel.showYear) : true,
          autoCondense: found.spineLabel?.autoCondense !== undefined ? Boolean(found.spineLabel.autoCondense) : true,
          customText: found.spineLabel?.customText,
        },
        caseLabel: {
          backgroundColor: found.caseLabel?.backgroundColor || '#111827',
          textColor: found.caseLabel?.textColor || '#ffffff',
          fontFamily: found.caseLabel?.fontFamily || 'Inter, sans-serif',
          fontSize: typeof found.caseLabel?.fontSize === 'number' ? found.caseLabel.fontSize : 12,
          overlayOpacity: typeof found.caseLabel?.overlayOpacity === 'number' ? found.caseLabel.overlayOpacity : 50,
          overlayColor: found.caseLabel?.overlayColor || '#000000',
          backgroundImage: found.caseLabel?.backgroundImage,
          imageCropPosition: found.caseLabel?.imageCropPosition || 'center',
          showTracklist: found.caseLabel?.showTracklist !== undefined ? Boolean(found.caseLabel.showTracklist) : true,
          tracklistColumns: found.caseLabel?.tracklistColumns === 2 ? 2 : 1,
          tracklistFontSize: typeof found.caseLabel?.tracklistFontSize === 'number' ? found.caseLabel.tracklistFontSize : 7,
          showMdLogo: found.caseLabel?.showMdLogo !== undefined ? Boolean(found.caseLabel.showMdLogo) : true,
        },
        lastUpdated: found.lastUpdated || new Date().toISOString(),
      });
    }
  }

  if (validated.length !== 6) {
    throw new Error('Projekt musí obsahovať konfiguráciu pre 6 diskov.');
  }

  return validated;
}
