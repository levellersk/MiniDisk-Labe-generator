import React from 'react';
import { CaseLabelStyle } from '../types/minidisc';
import { Palette, Layers, ListMusic } from 'lucide-react';

interface CaseLabelEditorProps {
  style: CaseLabelStyle;
  onChangeStyle: (style: CaseLabelStyle) => void;
  album: string;
  artist: string;
}

export const CaseLabelEditor: React.FC<CaseLabelEditorProps> = ({
  style,
  onChangeStyle,
  album,
  artist,
}) => {
  const updateField = <K extends keyof CaseLabelStyle>(key: K, value: CaseLabelStyle[K]) => {
    onChangeStyle({
      ...style,
      [key]: value,
    });
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Nálepka na obal (case label / J-card)</span>
            <span className="text-[11px] font-normal text-neutral-400">· 70 × 70 mm</span>
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Predná / vložená kartička pre plastovú Minidisc krabičku s grafikou a zoznamom skladieb.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Background & text color */}
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>Základná farba podkladu:</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-8 h-8 rounded border border-neutral-300 dark:border-neutral-700 cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={style.backgroundColor}
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
              <span>Stmavenie obalu (krytie):</span>
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {style.overlayOpacity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="90"
            value={style.overlayOpacity}
            onChange={(e) => updateField('overlayOpacity', parseInt(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={style.showTracklist}
            onChange={(e) => updateField('showTracklist', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span>Zobraziť zoznam skladieb</span>
        </label>

        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={style.showMdLogo}
            onChange={(e) => updateField('showMdLogo', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span>Zobraziť MiniDisc logo</span>
        </label>
      </div>
    </div>
  );
};
