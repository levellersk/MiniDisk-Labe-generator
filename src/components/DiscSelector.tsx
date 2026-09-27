import React from 'react';
import { DiscData } from '../types/minidisc';
import { Disc as DiscIcon, CheckCircle2, CircleDashed, ChevronDown } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface DiscSelectorProps {
  discs: DiscData[];
  activeDiscId: number;
  onSelectDisc: (id: number) => void;
}

export const DiscSelector: React.FC<DiscSelectorProps> = ({
  discs,
  activeDiscId,
  onSelectDisc,
}) => {
  const { t } = useLanguage();
  const currentDisc = discs.find((d) => d.id === activeDiscId) || discs[0];

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {t('step1Title')}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
              {t('currentDiscTitle')}
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50">
              {t('disc')} {currentDisc.id} / 6
            </span>
            {currentDisc.isConfigured ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t('savedInDb')}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400">
                <span>{t('notConfiguredYet')}</span>
              </span>
            )}
          </div>
        </div>

        {/* Mobile dropdown selector */}
        <div className="relative sm:hidden">
          <select
            value={activeDiscId}
            onChange={(e) => onSelectDisc(Number(e.target.value))}
            className="w-full appearance-none bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {discs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.isConfigured
                  ? `${t('disc')} ${d.id}: ${d.album} (${d.artist || t('noArtist')}) ✓`
                  : `${t('disc')} ${d.id} (${t('unconfigured')})`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Grid of 6 Discs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {discs.map((disc) => {
          const isSelected = disc.id === activeDiscId;
          const isEdited = disc.isConfigured;

          return (
            <button
              key={disc.id}
              onClick={() => onSelectDisc(disc.id)}
              className={`group text-left p-2.5 rounded-lg border transition-all relative overflow-hidden flex flex-col justify-between min-h-[96px] ${
                isSelected
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                  : isEdited
                  ? 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/20 dark:bg-emerald-950/10 hover:border-emerald-400'
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/70'
              }`}
            >
              {/* Disc Header Tag & Color Pip */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span className="text-[11px] font-extrabold tracking-wider text-neutral-500 dark:text-neutral-400 uppercase">
                  {t('disc')} {disc.id}
                </span>

                <div className="flex items-center gap-1">
                  {isEdited && (
                    <span title={t('savedInDb')}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </span>
                  )}
                  <span
                    className="w-3 h-3 rounded-sm border border-black/15 shadow-2xs shrink-0"
                    style={{ backgroundColor: disc.diskLabel.backgroundColor }}
                  />
                </div>
              </div>

              {/* Disc Body: If edited, show Album & Artist; if unedited, show generic Disk N placeholder */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-neutral-200 dark:bg-neutral-700 overflow-hidden shrink-0 border border-neutral-300 dark:border-neutral-700 relative flex items-center justify-center">
                  {isEdited && disc.coverUrl ? (
                    <img
                      src={disc.coverUrl}
                      alt={disc.album}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : isEdited ? (
                    <DiscIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <CircleDashed className="w-4 h-4 text-neutral-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {isEdited ? (
                    <>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white truncate" title={disc.album}>
                        {disc.album || `${t('disc')} ${disc.id}`}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate" title={disc.artist}>
                        {disc.artist || t('noArtist')}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 truncate">
                        {t('disc')} {disc.id}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate italic">
                        {t('unconfigured')}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
