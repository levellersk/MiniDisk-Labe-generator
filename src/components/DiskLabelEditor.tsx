import React, { useState } from 'react';
import { DiskLabelStyle } from '../types/minidisc';
import { 
  Pipette, 
  Type, 
  Bold, 
  Check, 
  Palette, 
  Sliders
} from 'lucide-react';
import { MiniDiscLogo } from './MiniDiscLogo';
import { InsertionArrow } from './InsertionArrow';
import { useLanguage } from '../i18n/LanguageContext';

interface DiskLabelEditorProps {
  style: DiskLabelStyle;
  onChangeStyle: (style: DiskLabelStyle) => void;
  album: string;
  artist: string;
  year: string;
}

// Curated palette inspired by classic MD blank media
const COLOR_PRESETS = [
  { name: 'Vintage Beige', hex: '#f5eee6', border: '#e3d8cc' },
  { name: 'Midnight Onyx', hex: '#16171a', border: '#333538' },
  { name: 'Sony Indigo', hex: '#1b1325', border: '#37274b' },
  { name: 'Cyber Violet', hex: '#260a3a', border: '#4d1674' },
  { name: 'Studio Teal', hex: '#d8e8e4', border: '#b8d1cb' },
  { name: 'Pastel Lilac', hex: '#f5d6f5', border: '#e2b3e2' },
  { name: 'Warm Khaki', hex: '#ceb49b', border: '#b8997e' },
  { name: 'Graphite Grey', hex: '#2b2d42', border: '#434661' },
  { name: 'Deep Crimson', hex: '#4a0e17', border: '#781a29' },
  { name: 'Alpine White', hex: '#ffffff', border: '#d1d5db' },
  { name: 'Forest Moss', hex: '#233827', border: '#38573d' },
  { name: 'Golden Amber', hex: '#e9a843', border: '#c78828' },
];

const FONT_OPTIONS = [
  { id: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans (Modern Clean)' },
  { id: 'Syne', label: 'Syne (Audio Display)' },
  { id: 'Archivo', label: 'Archivo (Industrial Grotesk)' },
  { id: 'JetBrains Mono', label: 'JetBrains Mono (Techno & Code)' },
  { id: 'Georgia', label: 'Georgia / Serif (Classic)' },
];

export const DiskLabelEditor: React.FC<DiskLabelEditorProps> = ({
  style,
  onChangeStyle,
}) => {
  const { t } = useLanguage();
  const [hasEyeDropper] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'EyeDropper' in window;
  });

  const updateField = <K extends keyof DiskLabelStyle>(key: K, value: DiskLabelStyle[K]) => {
    onChangeStyle({
      ...style,
      [key]: value,
    });
  };

  // Eyedropper API handler
  const handleOpenEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          updateField('backgroundColor', result.sRGBHex);
        }
      } catch (err) {
        // user canceled or not supported
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
      
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{t('sectionDiskTitle')}</span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('diskLabelSubtitleDetail')}
          </p>
        </div>

        {/* Badge MiniDisc logo */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-medium border border-neutral-200 dark:border-neutral-700">
          <MiniDiscLogo size={16} color="currentColor" />
          <span>{t('mdCartridgeBadge')}</span>
        </div>
      </div>

      {/* 1. Farba pozadia (Background Color & Eyedropper) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('bgColorLabel')}</span>
          </label>
          <span className="text-xs font-mono font-medium text-neutral-500">
            {style.backgroundColor.toUpperCase()}
          </span>
        </div>

        {/* Color Presets Palette */}
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = style.backgroundColor.toLowerCase() === preset.hex.toLowerCase();
            return (
              <button
                key={preset.hex}
                type="button"
                onClick={() => updateField('backgroundColor', preset.hex)}
                title={preset.name}
                className={`w-7 h-7 rounded-lg transition-transform relative flex items-center justify-center ${
                  isSelected ? 'scale-115 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-neutral-900 shadow-sm' : 'hover:scale-105'
                }`}
                style={{
                  backgroundColor: preset.hex,
                  border: `1px solid ${preset.border}`,
                }}
              >
                {isSelected && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      preset.hex === '#ffffff' || preset.hex === '#f5eee6' || preset.hex === '#d8e8e4' || preset.hex === '#f5d6f5'
                        ? 'text-neutral-900'
                        : 'text-white'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Hex Input & Native Eyedropper Picker */}
        <div className="flex items-center gap-2 pt-1">
          {/* Native HTML5 Color Picker */}
          <div className="relative flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5">
            <input
              type="color"
              value={style.backgroundColor || '#f5eee6'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
              title={t('customColor')}
            />
            <input
              type="text"
              value={style.backgroundColor || '#f5eee6'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-20 font-mono text-xs font-bold bg-transparent text-neutral-900 dark:text-white uppercase focus:outline-hidden"
              maxLength={7}
            />
          </div>

          {/* Eyedropper tool button ("kvapkátko") */}
          <button
            type="button"
            onClick={handleOpenEyeDropper}
            title={hasEyeDropper ? t('eyedropperTooltip') : t('eyedropperNotSupported')}
            disabled={!hasEyeDropper}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              hasEyeDropper
                ? 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border-neutral-300 dark:border-neutral-700'
                : 'opacity-40 cursor-not-allowed bg-neutral-100 dark:bg-neutral-800 border-neutral-300 text-neutral-400'
            }`}
          >
            <Pipette className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('eyedropper')}</span>
          </button>
        </div>
      </div>

      {/* 2. Typografia a Farba Textu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Farba textu */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('textColorLabel')}</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => updateField('textColor', '#ffffff')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                style.textColor === '#ffffff'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-white border border-neutral-400" />
              <span>{t('colorWhite')}</span>
            </button>

            <button
              type="button"
              onClick={() => updateField('textColor', '#1a1d20')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                style.textColor === '#1a1d20' || style.textColor === '#000000'
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-neutral-700'
              }`}
            >
              <span className="w-3 h-3 rounded-full bg-neutral-900 border border-neutral-700" />
              <span>{t('colorDark')}</span>
            </button>

            {/* Custom text color input */}
            <div className="relative">
              <input
                type="color"
                value={style.textColor || '#1a1d20'}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700 p-0.5 bg-transparent"
                title={t('customTextColor')}
              />
            </div>
          </div>
        </div>

        {/* Písmo (Font Family) */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {t('fontLabel')}
          </label>
          <select
            value={style.fontFamily || 'Plus Jakarta Sans'}
            onChange={(e) => updateField('fontFamily', e.target.value)}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* 3. Veľkosť písma & Tučné písmo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Veľkosť textu */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {t('fontSizeLabel')}
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {style.fontSize ?? 10} pt
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-400">8pt</span>
            <input
              type="range"
              min="8"
              max="15"
              step="0.5"
              value={style.fontSize ?? 10}
              onChange={(e) => updateField('fontSize', parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-400">15pt</span>
          </div>
        </div>

        {/* Tučné písmo (Bold Toggle) */}
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div>
            <span className="block text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {t('boldLabel')}
            </span>
            <span className="text-[11px] text-neutral-400">
              {t('boldDesc')}
            </span>
          </div>
          <button
            type="button"
            onClick={() => updateField('isBold', !style.isBold)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              style.isBold
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-700'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
            <span>{style.isBold ? t('enabled') : t('disabled')}</span>
          </button>
        </div>

      </div>

      {/* 4. Položky Year, Artist, Album & Logo MiniDisc */}
      <div className="space-y-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5 text-indigo-500" />
          <span>{t('visibleItemsLabel')}</span>
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {/* Album */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={!!style.showAlbum}
              onChange={(e) => updateField('showAlbum', e.target.checked)}
              className="rounded accent-indigo-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {t('albumElement')}
            </span>
          </label>

          {/* Artist */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={!!style.showArtist}
              onChange={(e) => updateField('showArtist', e.target.checked)}
              className="rounded accent-indigo-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {t('artistElement')}
            </span>
          </label>

          {/* Year */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={!!style.showYear}
              onChange={(e) => updateField('showYear', e.target.checked)}
              className="rounded accent-indigo-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              {t('yearElement')}
            </span>
          </label>

          {/* MiniDisc Logo */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={!!style.showMdLogo}
              onChange={(e) => updateField('showMdLogo', e.target.checked)}
              className="rounded accent-indigo-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
              <span>{t('mdLogoElement')}</span>
            </span>
          </label>

          {/* Smer vkladania (Štylizovaný trojuholník) */}
          <label className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
            <input
              type="checkbox"
              checked={style.showInsertionArrow !== false}
              onChange={(e) => updateField('showInsertionArrow', e.target.checked)}
              className="rounded accent-indigo-600 w-4 h-4"
            />
            <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <InsertionArrow size={10} color="#6366f1" />
              <span>{t('insertionArrowElement')}</span>
            </span>
          </label>
        </div>

        {/* Logo Color Option */}
        {style.showMdLogo && (
          <div className="flex items-center gap-2 pt-2">
            <span className="text-[11px] font-semibold text-neutral-500">
              {t('mdLogoColorLabel')}
            </span>
            {(['auto', 'white', 'black', 'gold'] as const).map((col) => {
              const labelText =
                col === 'auto'
                  ? t('logoColorAuto')
                  : col === 'white'
                  ? t('logoColorWhite')
                  : col === 'black'
                  ? t('logoColorBlack')
                  : t('logoColorGold');

              return (
                <button
                  key={col}
                  type="button"
                  onClick={() => updateField('mdLogoColor', col)}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded capitalize transition-all ${
                    style.mdLogoColor === col
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
                  }`}
                >
                  {labelText}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
