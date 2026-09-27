import React, { useState } from 'react';
import { ReleaseSearchResult, TrackItem } from '../types/minidisc';
import { X, Check, Disc, Calendar, MapPin, ListMusic, Loader2 } from 'lucide-react';
import { getFullReleaseDetails, optimizeImageForPrint } from '../services/musicApi';
import { useLanguage } from '../i18n/LanguageContext';

interface ReleaseSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ReleaseSearchResult[];
  onSelectRelease: (data: {
    artist: string;
    album: string;
    year: string;
    tracks: TrackItem[];
    coverUrl: string;
    provider: any;
  }) => void;
}

export const ReleaseSelectorModal: React.FC<ReleaseSelectorModalProps> = ({
  isOpen,
  onClose,
  results,
  onSelectRelease,
}) => {
  const { t } = useLanguage();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChoose = async (release: ReleaseSearchResult) => {
    setLoadingId(release.id);
    try {
      const details = await getFullReleaseDetails(release);
      const printOptimizedCover = await optimizeImageForPrint(details.highResCover || release.coverUrl);

      onSelectRelease({
        artist: release.artist,
        album: release.title,
        year: release.year,
        tracks: details.tracks,
        coverUrl: printOptimizedCover,
        provider: release.provider,
      });
      onClose();
    } catch (err) {
      console.error('Error applying selected release:', err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {t('releaseModalTitle', { count: results.length })}
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {t('releaseModalDesc')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {results.map((rel) => {
            const isLoadingThis = loadingId === rel.id;
            return (
              <div
                key={rel.id}
                className="pt-2.5 first:pt-0 flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Artwork Thumbnail */}
                  <div className="w-14 h-14 rounded-lg bg-neutral-100 dark:bg-neutral-800 overflow-hidden shrink-0 border border-neutral-200 dark:border-neutral-700 relative">
                    {rel.coverUrl ? (
                      <img
                        src={rel.coverUrl}
                        alt={rel.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Disc className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Release Info */}
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                      {rel.title}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 truncate">
                      {rel.artist}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-neutral-400">
                      {rel.year && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{rel.year}</span>
                        </span>
                      )}
                      {rel.country && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{rel.country}</span>
                        </span>
                      )}
                      {rel.trackCount && (
                        <span className="flex items-center gap-1">
                          <ListMusic className="w-3 h-3" />
                          <span>{rel.trackCount} {t('tracksCount')}</span>
                        </span>
                      )}
                      <span className="uppercase text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                        {rel.provider}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Choose button */}
                <button
                  type="button"
                  disabled={isLoadingThis || loadingId !== null}
                  onClick={() => handleChoose(rel)}
                  className="px-3.5 py-2 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {isLoadingThis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('loadingRelease')}</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('chooseBtn')}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
