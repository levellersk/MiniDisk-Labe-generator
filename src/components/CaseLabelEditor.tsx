import React from 'react';
import { CaseLabelStyle, TrackItem } from '../types/minidisc';
import { Palette, Layers, Columns, Crop, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface CaseLabelEditorProps {
  style: CaseLabelStyle;
  onChangeStyle: (style: CaseLabelStyle) => void;
  album: string;
  artist: string;
  tracks?: TrackItem[];
}

export const CaseLabelEditor: React.FC<CaseLabelEditorProps> = ({
  style,
  onChangeStyle,
  tracks = [],
}) => {
  const { t } = useLanguage();

  const updateField = <K extends keyof CaseLabelStyle>(key: K, value: CaseLabelStyle[K]) => {
    onChangeStyle({
      ...style,
      [key]: value,
    });
  };

  const tracksCount = tracks.length;

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800 gap-1">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{t('caseLabelHeading')}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              70 × 55 mm
            </span>
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            {t('caseLabelSubtitleDetail')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Background & text color */}
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('baseBgColor')}</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.backgroundColor || '#16171a'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={style.backgroundColor || '#16171a'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-24 text-xs font-mono font-bold bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded px-2 py-1 uppercase"
            />
          </div>
        </div>

        {/* Overlay Darkening for legibility */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('overlayOpacityLabel')}</span>
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {style.overlayOpacity ?? 50}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={style.overlayOpacity ?? 50}
            onChange={(e) => updateField('overlayOpacity', parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Image Crop & Vertical Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Crop className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('imageCropLabel')}</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateField('imageCropPosition', 'center')}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all ${
                (!style.imageCropPosition || style.imageCropPosition === 'center')
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('cropCenterLabel')}
            </button>
            <button
              type="button"
              onClick={() => updateField('imageCropPosition', 'top')}
              className={`py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all ${
                style.imageCropPosition === 'top'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('cropTopLabel')}
            </button>
            <button
              type="button"
              onClick={() => updateField('imageCropPosition', 'bottom')}
              className={`py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all ${
                style.imageCropPosition === 'bottom'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('cropBottomLabel')}
            </button>
          </div>
        </div>

        {/* Tracklist layout columns */}
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('tracklistColumnsLabel')}</span>
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => updateField('tracklistColumns', 1)}
              className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all ${
                style.tracklistColumns === 1
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('col1Label')}
            </button>
            <button
              type="button"
              onClick={() => updateField('tracklistColumns', 2)}
              className={`flex-1 py-1.5 px-2.5 text-xs font-medium rounded-lg border transition-all ${
                style.tracklistColumns === 2
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs font-semibold'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              {t('col2Label')}
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist info banner */}
      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] text-indigo-950 dark:text-indigo-200">
        <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
        <span>
          {t('tracksCountBanner', { count: tracksCount })}
        </span>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={!!style.showTracklist}
            onChange={(e) => updateField('showTracklist', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span className="font-semibold">{t('showTracklistOnCover')}</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={!!style.showMdLogo}
            onChange={(e) => updateField('showMdLogo', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span>{t('showMdLogoOnCover')}</span>
        </label>
      </div>
    </div>
  );
};
