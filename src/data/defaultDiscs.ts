import { DiscData } from '../types/minidisc';

// Default blank / generic discs (Disk 1 to 6)
export const createDefaultBlankDisc = (id: number): DiscData => {
  // Preset default classic colors for the 6 discs
  const defaultColors = [
    { bg: '#f5eee6', text: '#1a1d20' }, // Disk 1: Vintage Beige
    { bg: '#1b1325', text: '#ffffff' }, // Disk 2: Sony Indigo
    { bg: '#ceb49b', text: '#2b2118' }, // Disk 3: Warm Khaki
    { bg: '#d8e8e4', text: '#1a332f' }, // Disk 4: Studio Mint
    { bg: '#260a3a', text: '#ffffff' }, // Disk 5: Cyber Violet
    { bg: '#2b2d42', text: '#ffffff' }, // Disk 6: Graphite Slate
  ];

  const color = defaultColors[id - 1] || { bg: '#f5eee6', text: '#1a1d20' };

  return {
    id,
    isConfigured: false,
    artist: '',
    album: `Disk ${id}`,
    year: '',
    tracks: [],
    coverUrl: '',
    diskLabel: {
      backgroundColor: color.bg,
      textColor: color.text,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 10,
      isBold: false,
      showYear: true,
      showArtist: true,
      showAlbum: true,
      showMdLogo: true,
      mdLogoColor: 'auto',
      showInsertionArrow: true,
      coverFit: 'cover',
      coverScale: 1,
    },
    spineLabel: {
      backgroundColor: color.bg,
      textColor: color.text,
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 8.5,
      isBold: true,
      format: 'artist-title',
      showYear: true,
      autoCondense: true,
    },
    caseLabel: {
      backgroundColor: '#16171a',
      textColor: '#ffffff',
      fontFamily: 'Plus Jakarta Sans',
      fontSize: 14,
      overlayOpacity: 50,
      overlayColor: '#000000',
      imageCropPosition: 'center',
      showTracklist: true,
      tracklistColumns: 1,
      tracklistFontSize: 9,
      showMdLogo: true,
    },
  };
};

export const defaultDiscs: DiscData[] = [
  createDefaultBlankDisc(1),
  createDefaultBlankDisc(2),
  createDefaultBlankDisc(3),
  createDefaultBlankDisc(4),
  createDefaultBlankDisc(5),
  createDefaultBlankDisc(6),
];
