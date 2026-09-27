export type SearchProvider = 'itunes' | 'musicbrainz' | 'discogs';

export interface TrackItem {
  id: string;
  number: string;
  title: string;
  duration?: string;
}

export interface DiskLabelStyle {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number; // in pt or relative scale, default ~ 11
  isBold: boolean;
  showYear: boolean;
  showArtist: boolean;
  showAlbum: boolean;
  showMdLogo: boolean;
  mdLogoColor: 'auto' | 'white' | 'black' | 'gold' | 'custom';
  customLogoColor?: string;
  coverImage?: string;
  coverScale?: number;
  coverFit?: 'cover' | 'contain';
}

export interface SpineLabelStyle {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  isBold: boolean;
  format: 'title-artist' | 'artist-title' | 'title-only';
  customText?: string;
}

export interface CaseLabelStyle {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
  overlayOpacity: number; // 0 to 100%
  overlayColor: string;
  backgroundImage?: string;
  showTracklist: boolean;
  tracklistColumns: 1 | 2;
  tracklistFontSize: number;
  showMdLogo: boolean;
}

export interface DiscData {
  id: number; // 1 to 6
  isConfigured: boolean; // true once edited and saved to database
  artist: string;
  album: string;
  year: string;
  tracks: TrackItem[];
  coverUrl: string;
  highResCoverUrl?: string;
  sourceReleaseId?: string;
  sourceProvider?: string;
  diskLabel: DiskLabelStyle;
  spineLabel: SpineLabelStyle;
  caseLabel: CaseLabelStyle;
  lastUpdated?: string;
}

export interface ReleaseSearchResult {
  id: string;
  provider: SearchProvider;
  title: string;
  artist: string;
  year: string;
  coverUrl: string;
  highResCoverUrl?: string;
  country?: string;
  trackCount?: number;
  label?: string;
  barcode?: string;
  format?: string;
  tracks?: TrackItem[];
}
