import React, { useState } from 'react';
import { SpineLabelStyle, DiskLabelStyle } from '../types/minidisc';
import { 
  Palette, 
  Type, 
  Bold, 
  Pipette, 
  Check, 
  Minimize2, 
  Copy
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SpineLabelEditorProps {
  style: SpineLabelStyle;
  onChangeStyle: (style: SpineLabelStyle) => void;
  album: string;
  artist: string;
  year: string;
  diskLabelStyle?: DiskLabelStyle;
}

// Curated palette identical to DiskLabelEditor
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

export const SpineLabelEditor: React.FC<SpineLabelEditorProps> = ({
  style,
  onChangeStyle,
  album,
  artist,
  year,
  diskLabelStyle,
}) => {
  const { t } = useLanguage();
  const [hasEyeDropper] = useState<boolean>(() => {
    return typeof window !== 'undefined' && 'EyeDropper' in window;
  });

  const updateField = <K extends keyof SpineLabelStyle>(key: K, value: SpineLabelStyle[K]) => {
    onChangeStyle({
      ...style,
      [key]: value,
    });
  };

  // Copy exact color & font setup from disklabel
  const handleCopyFromDiskLabel = () => {
    if (diskLabelStyle) {
      onChangeStyle({
        ...style,
        backgroundColor: diskLabelStyle.backgroundColor,
        textColor: diskLabelStyle.textColor,
        fontFamily: diskLabelStyle.fontFamily,
        isBold: diskLabelStyle.isBold,
      });
    }
  };

  // Native eyedropper handler
  const handleOpenEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          updateField('backgroundColor', result.sRGBHex);
        }
      } catch {
        // user canceled or unsupported
      }
    }
  };

  // Compute spine text based on format
  const getSpineMainText = () => {
    const format = style.format || 'artist-title';
    if (format === 'artist-title') {
      return artist ? `${artist} - ${album || t('albumPlaceholder')}` : (album || t('albumPlaceholder'));
    } else if (format === 'title-only') {
      return album || t('albumPlaceholder');
    }
    // Default fallback: title-artist
    return artist ? `${album || t('albumPlaceholder')} : ${artist}` : (album || t('albumPlaceholder'));
  };

  const mainText = getSpineMainText();
  // Auto-condense logic: if combined text is long (> 24 chars), condense it
  const isShowYear = style.showYear !== false;
  const isTextLong = (mainText.length + (isShowYear && year ? 6 : 0)) > 24;

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-xl p-4 sm:p-5 shadow-sm space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              {t('spineSection')}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>{t('spineLabelHeading')}</span>
            <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">
              · 54 × 6 mm
            </span>
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('spineSubtitleDetail')}
          </p>
        </div>

        {/* Sync with Disklabel button */}
        {diskLabelStyle && (
          <button
            type="button"
            onClick={handleCopyFromDiskLabel}
            title={t('copyColorFromDisc')}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200/60 dark:border-indigo-800/60 transition-colors flex items-center gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{t('copyColorFromDisc')}</span>
          </button>
        )}
      </div>

      {/* LIVE MINI PREVIEW OF THE 54 x 6 mm STRIP (Proportional 9:1 ratio) */}
      <div className="p-3 bg-neutral-100 dark:bg-neutral-800/60 rounded-xl border border-neutral-200 dark:border-neutral-700/60 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-500">
          <span>{t('liveSpinePreview')}</span>
          {isTextLong && style.autoCondense && (
            <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[10px]">
              <Minimize2 className="w-3 h-3" />
              <span>{t('condensedTextActive')}</span>
            </span>
          )}
        </div>

        {/* Centered proportional spine strip (54 × 6 mm at 5px/mm scale = 270px × 30px) */}
        <div className="w-full flex justify-center py-1">
          <div
            className="rounded-xs shadow-sm px-2.5 flex items-center justify-between overflow-hidden border border-black/15 transition-all"
            style={{
              width: '270px',
              height: '30px',
              backgroundColor: style.backgroundColor || '#16171a',
              color: style.textColor || '#ffffff',
              fontFamily: style.fontFamily || 'Plus Jakarta Sans',
            }}
          >
            {/* Main Title & Artist */}
            <div
              className="truncate flex-1 min-w-0"
              style={{
                transform: isTextLong && style.autoCondense ? 'scaleX(0.88)' : undefined,
                transformOrigin: 'left center',
                letterSpacing: isTextLong && style.autoCondense ? '-0.03em' : 'normal',
              }}
            >
              <span
                className="text-xs font-bold truncate block"
                style={{
                  fontSize: `${style.fontSize || 8.5}pt`,
                  fontWeight: style.isBold ? 700 : 500,
                }}
              >
                {mainText}
              </span>
            </div>

            {/* Year Aligned Right (Consistent font and style) */}
            {style.showYear !== false && year && (
              <div className="shrink-0 pl-2">
                <span
                  style={{
                    fontFamily: style.fontFamily || 'inherit',
                    fontSize: `${style.fontSize || 8.5}pt`,
                    fontWeight: style.isBold ? 700 : 500,
                    lineHeight: 1,
                  }}
                >
                  {year}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 1. Spine Color Options */}
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

        {/* Color Presets */}
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

        {/* Color Input & Eyedropper */}
        <div className="flex items-center gap-2 pt-1">
          <div className="relative flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-2.5 py-1.5">
            <input
              type="color"
              value={style.backgroundColor || '#16171a'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
              title={t('customColor')}
            />
            <input
              type="text"
              value={style.backgroundColor || '#16171a'}
              onChange={(e) => updateField('backgroundColor', e.target.value)}
              className="w-20 font-mono text-xs font-bold bg-transparent text-neutral-900 dark:text-white uppercase focus:outline-hidden"
              maxLength={7}
            />
          </div>

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

      {/* 2. Text Color & Font Family */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Text Color */}
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

            <div className="relative">
              <input
                type="color"
                value={style.textColor || '#ffffff'}
                onChange={(e) => updateField('textColor', e.target.value)}
                className="w-8 h-8 rounded cursor-pointer border border-neutral-300 dark:border-neutral-700 p-0.5 bg-transparent"
                title={t('customTextColor')}
              />
            </div>
          </div>
        </div>

        {/* Font Family */}
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

      {/* 3. Text Format & Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Layout Format selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
            {t('spineFormat')}
          </label>
          <select
            value={style.format || 'artist-title'}
            onChange={(e) => updateField('format', e.target.value as any)}
            className="w-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="artist-title">{t('formatArtistTitle')}</option>
            <option value="title-artist">{t('formatTitleArtist')}</option>
            <option value="title-only">{t('formatTitleOnly')}</option>
          </select>
        </div>

        {/* Font Size & Bold Toggle */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
              {t('fontSizeLabel')}
            </label>
            <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
              {style.fontSize ?? 8.5} pt
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-neutral-400">6pt</span>
            <input
              type="range"
              min="6"
              max="11"
              step="0.5"
              value={style.fontSize ?? 8.5}
              onChange={(e) => updateField('fontSize', parseFloat(e.target.value))}
              className="flex-1 accent-indigo-600 cursor-pointer"
            />
            <span className="text-[10px] text-neutral-400">11pt</span>
          </div>
        </div>

      </div>

      {/* 4. Checkbox Options */}
      <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
        
        {/* Tučné písmo (Bold) */}
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={!!style.isBold}
            onChange={(e) => updateField('isBold', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span className="font-semibold">{t('bold')}</span>
        </label>

        {/* Rok vydania napravo */}
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={style.showYear !== false}
            onChange={(e) => updateField('showYear', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span className="font-semibold">{t('showYear')}</span>
        </label>

        {/* Auto-condense */}
        <label className="flex items-center gap-2 text-xs font-medium text-neutral-800 dark:text-neutral-200 cursor-pointer">
          <input
            type="checkbox"
            checked={style.autoCondense !== false}
            onChange={(e) => updateField('autoCondense', e.target.checked)}
            className="rounded accent-indigo-600 w-4 h-4"
          />
          <span>{t('autoCondense')}</span>
        </label>

      </div>

    </div>
  );
};
