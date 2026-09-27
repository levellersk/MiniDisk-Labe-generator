import React, { useState } from 'react';
import { SearchProvider, ReleaseSearchResult } from '../types/minidisc';
import { 
  Search, 
  Loader2, 
  Save, 
  Globe, 
  Check, 
  Sparkles, 
  Music,
  ExternalLink,
  Layers
} from 'lucide-react';
import { searchAlbumOnline, getFullReleaseDetails, optimizeImageForPrint } from '../services/musicApi';

interface AlbumSearchProps {
  onApplyAlbumData: (data: {
    artist: string;
    album: string;
    year: string;
    tracks: any[];
    coverUrl: string;
    provider: SearchProvider;
  }) => void;
  onOpenMultiReleaseModal: (results: ReleaseSearchResult[]) => void;
  onSaveToDatabase: () => void;
  hasUnsavedChanges: boolean;
  currentArtist: string;
  currentAlbum: string;
}

export const AlbumSearch: React.FC<AlbumSearchProps> = ({
  onApplyAlbumData,
  onOpenMultiReleaseModal,
  onSaveToDatabase,
  hasUnsavedChanges,
  currentArtist,
  currentAlbum,
}) => {
  const [provider, setProvider] = useState<SearchProvider>('itunes');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchError(null);

    try {
      const results = await searchAlbumOnline(query.trim(), provider);

      if (results.length === 0) {
        setSearchError('Pre zadaný dopyt sa nenašli žiadne albumy. Skúste zmeniť kľúčové slová alebo poskytovateľa.');
        setIsLoading(false);
        return;
      }

      // If multiple results, open the dedicated modal as requested
      if (results.length > 1) {
        onOpenMultiReleaseModal(results);
      } else {
        // Exactly one result, load it directly
        const single = results[0];
        const details = await getFullReleaseDetails(single);
        // Optimize cover image for print automatically
        const printOptimizedCover = await optimizeImageForPrint(details.highResCover || single.coverUrl);

        onApplyAlbumData({
          artist: single.artist,
          album: single.title,
          year: single.year,
          tracks: details.tracks,
          coverUrl: printOptimizedCover,
          provider: single.provider,
        });
      }
    } catch (err) {
      console.error(err);
      setSearchError('Nastala chyba pri vyhľadávaní. Skontrolujte internetové pripojenie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualSave = () => {
    onSaveToDatabase();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleQuickSuggest = (artistName: string, albumName: string) => {
    setQuery(`${artistName} ${albumName}`);
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Krok 2 · Online databáza hudby
          </span>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Vyhľadanie interpreta a albumu</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Automaticky stiahne oficiálny obal v 1400px+, rok vydania a kompletný zoznam skladieb.
          </p>
        </div>

        {/* Save to Database button */}
        <button
          onClick={handleManualSave}
          title="Uložiť aktuálny stav disku do lokálnej databázy"
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
            saveSuccess
              ? 'bg-emerald-600 text-white shadow-xs'
              : hasUnsavedChanges
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs animate-pulse'
              : 'bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900'
          }`}
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Uložené do databázy</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Uložiť zmeny do DB</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row items-stretch gap-2.5">
        {/* Provider Selector */}
        <div className="md:w-56 shrink-0 relative">
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            Poskytovateľ dát:
          </label>
          <div className="relative">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as SearchProvider)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="itunes">Apple Music / iTunes (HQ Obaly)</option>
              <option value="musicbrainz">MusicBrainz & Cover Art</option>
              <option value="discogs">Discogs / Katalógové ID</option>
            </select>
          </div>
        </div>

        {/* Search Query Input */}
        <div className="flex-1">
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            Názov albumu alebo interpreta / ID:
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="napr. Daft Punk Discovery, Pink Floyd, alebo EAN kód..."
              className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-3.5 pr-10 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-semibold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Button */}
        <div className="md:self-end">
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full md:w-auto px-5 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 h-[38px] shadow-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vyhľadávam...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Vyhľadať</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Error message */}
      {searchError && (
        <div className="mt-3 p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
          {searchError}
        </div>
      )}

      {/* Quick Suggestions */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/60 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Rýchly tip:
        </span>
        {[
          { a: 'Daft Punk', b: 'Discovery' },
          { a: 'Miles Davis', b: 'Kind of Blue' },
          { a: 'Depeche Mode', b: 'Violator' },
          { a: 'Radiohead', b: 'OK Computer' },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleQuickSuggest(item.a, item.b)}
            className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            {item.a} – {item.b}
          </button>
        ))}
      </div>
    </div>
  );
};
