import React from 'react';
import { SpineLabelStyle } from '../types/minidisc';
import { Palette, Type, Bold } from 'lucide-react';

interface SpineLabelEditorProps {
  style: SpineLabelStyle;
  onChangeStyle: (style: SpineLabelStyle) => void;
  album: string;
  artist: string;
}

export const SpineLabelEditor: React.FC<SpineLabelEditorProps> = ({
  style,
  onChangeStyle,
  album,
  artist,
}) => {
  const updateField = <K extends keyof SpineLabelStyle>(key: K, value: SpineLabelStyle[K]) => {
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
            <span>Nálepka na chrbát disku (spine label)</span>
            <span className="text-[11px] font-normal text-neutral-400">· 54 × 5 mm</span>
          </h4>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Úzky chrbátový pásik pre identifikáciu disku v poličke alebo obale.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Background & text color */}
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>Farba chrbta:</span>
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

        {/* Text format */}
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mb-1 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-500" />
            <span>Formát textu:</span>
          </label>
          <select
            value={style.format}
            onChange={(e) => updateField('format', e.target.value as any)}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-900 dark:text-white"
          >
            <option value="title-artist">Album : Interpret ({album || 'Album'} : {artist || 'Umelec'})</option>
            <option value="artist-title">Interpret - Album ({artist || 'Umelec'} - {album || 'Album'})</option>
            <option value="title-only">Iba názov albumu ({album || 'Album'})</option>
          </select>
        </div>
      </div>
    </div>
  );
};
