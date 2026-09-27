import React, { useState } from 'react';
import { SearchProvider, ReleaseSearchResult } from '../types/minidisc';
import { 
  Search, 
  Loader2, 
  Save, 
  Check, 
  Sparkles, 
} from 'lucide-react';
import { searchAlbumOnline, getFullReleaseDetails, optimizeImageForPrint } from '../services/musicApi';
import { useLanguage } from '../i18n/LanguageContext';

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
}) => {
  const { t } = useLanguage();
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
        setSearchError(t('noResults'));
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
      setSearchError(t('searchError'));
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
            {t('step2Title')}
          </span>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{t('searchTitle')}</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('searchSubtitle')}
          </p>
        </div>

        {/* Save to Database button */}
        <button
          onClick={handleManualSave}
          title={t('saveToDatabase')}
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
              <span>{t('savedToDb')}</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{t('saveToDb')}</span>
            </>
          )}
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="space-y-3">
        {/* Provider Selector */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('dataProvider')}
          </label>
          <div className="relative">
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as SearchProvider)}
              className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="itunes">{t('providerItunes')}</option>
              <option value="musicbrainz">{t('providerMusicbrainz')}</option>
              <option value="discogs">{t('providerDiscogs')}</option>
            </select>
          </div>
        </div>

        {/* Search Query Input & Action Button */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1">
            {t('albumOrArtistLabel')}
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg pl-3.5 pr-8 py-2 text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-xs font-semibold p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5 h-[38px] shadow-xs"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('searching')}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>{t('searchBtn')}</span>
                </>
              )}
            </button>
          </div>
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
          {t('quickTip')}
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
