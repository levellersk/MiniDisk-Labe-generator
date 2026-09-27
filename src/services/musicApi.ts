import { ReleaseSearchResult, SearchProvider, TrackItem } from '../types/minidisc';

// iTunes Search & Lookup
export async function searchItunes(query: string): Promise<ReleaseSearchResult[]> {
  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=12`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('iTunes API error');
    const data = await res.json();
    
    return (data.results || []).map((item: any) => {
      // Upgrade iTunes 100x100 to 1400x1400 high-res
      const rawArt = item.artworkUrl100 || '';
      const highResArt = rawArt.replace('100x100bb', '1400x1400bb');
      const year = item.releaseDate ? new Date(item.releaseDate).getFullYear().toString() : '';

      return {
        id: String(item.collectionId),
        provider: 'itunes' as SearchProvider,
        title: item.collectionName || 'Neznámy album',
        artist: item.artistName || 'Neznámy umelec',
        year: year,
        coverUrl: highResArt || rawArt,
        highResCoverUrl: highResArt,
        country: item.country,
        trackCount: item.trackCount,
        label: item.primaryGenreName,
        format: 'CD / Digital',
      };
    });
  } catch (err) {
    console.warn('iTunes search failed:', err);
    return [];
  }
}

export async function fetchItunesTracks(collectionId: string): Promise<TrackItem[]> {
  try {
    const url = `https://itunes.apple.com/lookup?id=${encodeURIComponent(collectionId)}&entity=song&limit=100`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    const songs = (data.results || []).filter((r: any) => r.wrapperType === 'track');
    
    return songs.map((s: any, idx: number) => {
      const mins = Math.floor((s.trackTimeMillis || 0) / 60000);
      const secs = Math.floor(((s.trackTimeMillis || 0) % 60000) / 1000);
      const formattedDuration = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
      const num = s.trackNumber ? String(s.trackNumber).padStart(2, '0') : String(idx + 1).padStart(2, '0');

      return {
        id: `itunes-${s.trackId || idx}`,
        number: num,
        title: s.trackName || `Skladba ${idx + 1}`,
        duration: formattedDuration,
      };
    });
  } catch (err) {
    console.warn('Failed to fetch iTunes tracks:', err);
    return [];
  }
}

// MusicBrainz Search & Lookup
export async function searchMusicBrainz(query: string): Promise<ReleaseSearchResult[]> {
  try {
    // MusicBrainz release query
    const url = `https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=10`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MinidiscStudioApp/1.0.0 ( contact@minidisc-studio.local )',
      },
    });
    if (!res.ok) throw new Error('MusicBrainz API error');
    const data = await res.json();

    const releases = data.releases || [];
    return releases.map((rel: any) => {
      const year = rel.date ? rel.date.substring(0, 4) : '';
      const artist = rel['artist-credit']?.[0]?.name || rel['artist-credit']?.[0]?.artist?.name || 'Neznámy umelec';
      const mbid = rel.id;
      // CAA high-resolution cover
      const coverUrl = `https://coverartarchive.org/release/${mbid}/front-500`;
      const highResArt = `https://coverartarchive.org/release/${mbid}/front-1200`;

      return {
        id: mbid,
        provider: 'musicbrainz' as SearchProvider,
        title: rel.title || 'Neznámy album',
        artist: artist,
        year: year,
        coverUrl: coverUrl,
        highResCoverUrl: highResArt,
        country: rel.country,
        trackCount: rel['track-count'],
        label: rel['label-info']?.[0]?.label?.name,
        barcode: rel.barcode,
        format: rel.media?.[0]?.format || 'MiniDisc / CD',
      };
    });
  } catch (err) {
    console.warn('MusicBrainz search failed:', err);
    return [];
  }
}

export async function fetchMusicBrainzTracks(mbid: string): Promise<TrackItem[]> {
  try {
    const url = `https://musicbrainz.org/ws/2/release/${encodeURIComponent(mbid)}?inc=recordings+artist-credits&fmt=json`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'MinidiscStudioApp/1.0.0 ( contact@minidisc-studio.local )',
      },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const tracksList: TrackItem[] = [];

    const media = data.media || [];
    let overallIndex = 1;
    for (const m of media) {
      const tracks = m.tracks || [];
      for (const t of tracks) {
        const ms = t.length || 0;
        const mins = Math.floor(ms / 60000);
        const secs = Math.floor((ms % 60000) / 1000);
        const dur = ms > 0 ? `${mins}:${secs < 10 ? '0' : ''}${secs}` : undefined;
        tracksList.push({
          id: t.id || `mb-${overallIndex}`,
          number: String(t.position || overallIndex).padStart(2, '0'),
          title: t.title || `Skladba ${overallIndex}`,
          duration: dur,
        });
        overallIndex++;
      }
    }
    return tracksList;
  } catch (err) {
    console.warn('Failed to fetch MusicBrainz tracks:', err);
    return [];
  }
}

// Unified Search Dispatcher
export async function searchAlbumOnline(
  query: string,
  provider: SearchProvider = 'itunes'
): Promise<ReleaseSearchResult[]> {
  if (!query.trim()) return [];

  if (provider === 'musicbrainz') {
    const mbResults = await searchMusicBrainz(query);
    if (mbResults.length > 0) return mbResults;
    // fallback to itunes if no results
    return await searchItunes(query);
  }

  // default to iTunes (fastest, high-res artwork)
  const itunesResults = await searchItunes(query);
  if (itunesResults.length > 0) return itunesResults;
  
  // fallback to MusicBrainz
  return await searchMusicBrainz(query);
}

// Function to fetch full release details including tracks
export async function getFullReleaseDetails(release: ReleaseSearchResult): Promise<{
  tracks: TrackItem[];
  highResCover: string;
}> {
  let tracks: TrackItem[] = [];
  if (release.provider === 'itunes') {
    tracks = await fetchItunesTracks(release.id);
  } else if (release.provider === 'musicbrainz') {
    tracks = await fetchMusicBrainzTracks(release.id);
  }

  // Cover image verification or high-res
  const highResCover = release.highResCoverUrl || release.coverUrl;
  return { tracks, highResCover };
}

// Client-side high-DPI image auto-optimizer for print export
export async function optimizeImageForPrint(
  imageUrl: string,
  targetWidth = 1200,
  targetHeight = 1200
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Calculate aspect fill
        const imgAspect = img.width / img.height;
        const targetAspect = targetWidth / targetHeight;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch {
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
