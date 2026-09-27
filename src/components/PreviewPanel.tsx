import React, { useState, useRef, useEffect } from 'react';
import { DiscData } from '../types/minidisc';
import { MiniDiscLogo } from './MiniDiscLogo';
import { PrintSheet } from './PrintSheet';
import { CaseTracklist } from './CaseTracklist';
import { InsertionArrow } from './InsertionArrow';
import { 
  ZoomIn, 
  ZoomOut, 
  Printer, 
  Layers, 
  Crop,
  Maximize2
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PreviewPanelProps {
  currentDisc: DiscData;
  allDiscs: DiscData[];
  onPrint: () => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  currentDisc,
  allDiscs,
  onPrint,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'set' | 'sheet'>('set');
  const [previewZoom, setPreviewZoom] = useState<number>(1.0);
  
  // Calculate smart default zoom based on screen width
  const [sheetZoom, setSheetZoom] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const w = window.innerWidth;
      if (w > 1600) return 0.88;
      if (w > 1300) return 0.78;
      if (w > 900) return 0.68;
      return 0.55;
    }
    return 0.78;
  });

  const [showCropMarks, setShowCropMarks] = useState<boolean>(true);
  const containerRef = useRef<HTMLDivElement>(null);

  const { diskLabel, spineLabel, caseLabel } = currentDisc;
  const logoColor =
    diskLabel.mdLogoColor === 'white'
      ? '#ffffff'
      : diskLabel.mdLogoColor === 'black'
      ? '#111111'
      : diskLabel.mdLogoColor === 'gold'
      ? '#d4af37'
      : diskLabel.textColor;

  // Auto-fit sheet scale to available container width
  const handleAutoFit = () => {
    if (activeTab === 'sheet') {
      const containerWidth = containerRef.current?.clientWidth || 800;
      // A4 width is 210mm (~794px). Allow ~48px padding:
      const calculated = Math.min(1.25, Math.max(0.4, (containerWidth - 48) / 794));
      setSheetZoom(parseFloat(calculated.toFixed(2)));
    } else {
      setPreviewZoom(1.0);
    }
  };

  // Adjust sheet zoom on initial switch to 'sheet' tab if needed
  useEffect(() => {
    if (activeTab === 'sheet' && containerRef.current) {
      const width = containerRef.current.clientWidth;
      if (width > 600) {
        const calculated = Math.min(1.15, Math.max(0.45, (width - 48) / 794));
        setSheetZoom(parseFloat(calculated.toFixed(2)));
      }
    }
  }, [activeTab]);

  return (
    <div className="w-full h-full flex flex-col bg-neutral-100 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800">
      
      {/* Top Header of Preview Panel with robust non-overlapping flex layout */}
      <div className="px-3 py-2 sm:px-4 sm:py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-wrap items-center justify-between gap-2.5 shrink-0 z-10 shadow-2xs">
        
        {/* Left: View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800/90 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('set')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'set'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('tabSet', { id: currentDisc.id })}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'sheet'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-indigo-500" />
            <span>{t('tabSheet')}</span>
          </button>
        </div>

        {/* Right: Controls & Actions (strictly separated to prevent overlapping) */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'sheet' && (
            <button
              type="button"
              onClick={() => setShowCropMarks(!showCropMarks)}
              className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                showCropMarks
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900 shadow-2xs'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-750'
              }`}
              title={t('cropMarksTooltip')}
            >
              <Crop className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('cropMarks')}</span>
            </button>
          )}

          {/* Zoom controls */}
          <div className="flex items-center gap-0.5 p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'sheet') {
                  setSheetZoom((z) => Math.max(0.35, parseFloat((z - 0.05).toFixed(2))));
                } else {
                  setPreviewZoom((z) => Math.max(0.5, parseFloat((z - 0.1).toFixed(2))));
                }
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors"
              title={t('zoomOut')}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="w-12 text-center font-mono text-[11px] font-bold">
              {Math.round((activeTab === 'sheet' ? sheetZoom : previewZoom) * 100)}%
            </span>

            <button
              type="button"
              onClick={() => {
                if (activeTab === 'sheet') {
                  setSheetZoom((z) => Math.min(1.5, parseFloat((z + 0.05).toFixed(2))));
                } else {
                  setPreviewZoom((z) => Math.min(1.6, parseFloat((z + 0.1).toFixed(2))));
                }
              }}
              className="p-1.5 hover:bg-white dark:hover:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-400 transition-colors"
              title={t('zoomIn')}
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Quick Auto-Fit button */}
            <button
              type="button"
              onClick={handleAutoFit}
              title={t('zoomFitTooltip')}
              className="px-2 py-1 text-[11px] font-bold text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-400 border-l border-neutral-300 dark:border-neutral-700 transition-colors flex items-center gap-1"
            >
              <Maximize2 className="w-3 h-3" />
              <span>{t('zoomFit')}</span>
            </button>
          </div>

          {/* Print button */}
          <button
            type="button"
            onClick={onPrint}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-2xs transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('print')}</span>
          </button>
        </div>

      </div>

      {/* Main Preview Canvas Area spanning full width and height */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-start relative"
      >
        
        {/* TAB 1: Complete Disc Set (Case + Disk + Spine) */}
        {activeTab === 'set' && (
          <div 
            className="w-full max-w-2xl flex flex-col items-center gap-6 animate-in fade-in duration-150 py-4 transition-transform origin-top"
            style={{
              transform: previewZoom !== 1 ? `scale(${previewZoom})` : undefined,
            }}
          >
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-6">
              
              {/* 1. Case Insert (70 x 55 mm) */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                  {t('previewCaseLabel')}
                </span>
                <div
                  className="rounded-lg shadow-xl relative overflow-hidden border border-neutral-300 dark:border-neutral-700"
                  style={{
                    width: '280px',
                    height: '220px', // exact 70 x 55 mm ratio at 4px/mm scale
                    backgroundColor: caseLabel.backgroundColor || '#111',
                    color: caseLabel.textColor || '#fff',
                    fontFamily: caseLabel.fontFamily,
                  }}
                >
                  {currentDisc.coverUrl && (
                    <div
                      className="absolute inset-0 bg-cover"
                      style={{
                        backgroundImage: `url(${currentDisc.coverUrl})`,
                        backgroundPosition:
                          caseLabel.imageCropPosition === 'top'
                            ? 'center top'
                            : caseLabel.imageCropPosition === 'bottom'
                            ? 'center bottom'
                            : 'center center',
                      }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: caseLabel.overlayColor || '#000',
                      opacity: (caseLabel.overlayOpacity || 50) / 100,
                    }}
                  />
                  <div className="relative z-10 p-2.5 h-full flex flex-col justify-between">
                    <div className="shrink-0 min-w-0">
                      <h4
                        className="font-bold tracking-tight text-white leading-tight drop-shadow-md truncate"
                        style={{ fontSize: '10.5pt' }}
                      >
                        {currentDisc.album || t('albumPlaceholder')}
                      </h4>
                      <p
                        className="text-neutral-300 font-medium leading-normal drop-shadow-md truncate"
                        style={{ fontSize: '7.5pt' }}
                      >
                        {currentDisc.artist || t('noArtist')} {currentDisc.year ? `· ${currentDisc.year}` : ''}
                      </p>
                    </div>

                    {caseLabel.showTracklist && currentDisc.tracks && currentDisc.tracks.length > 0 && (
                      <div className="my-auto py-1 min-h-0 flex-1 flex flex-col justify-center overflow-hidden">
                        <CaseTracklist
                          tracks={currentDisc.tracks}
                          preferredColumns={caseLabel.tracklistColumns}
                        />
                      </div>
                    )}

                    {caseLabel.showMdLogo && (
                      <div className="flex justify-end pt-0.5 shrink-0">
                        <MiniDiscLogo size={13} color="#ffffff" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Cartridge Sticker Detail (38 x 54 mm) */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                  {t('previewDiskLabel')}
                </span>
                <div
                  className="rounded-md shadow-xl p-2.5 flex flex-col justify-between overflow-hidden border border-neutral-300 dark:border-neutral-700"
                  style={{
                    width: '152px',
                    height: '216px', // exact 38 x 54 mm at 4px/mm scale
                    backgroundColor: diskLabel.backgroundColor,
                    color: diskLabel.textColor,
                    fontFamily: diskLabel.fontFamily,
                  }}
                >
                  {/* Top Header: Album Title (left) & Insertion Arrow (top right) */}
                  <div className="flex items-start justify-between gap-1 overflow-hidden min-h-[16px]">
                    {diskLabel.showAlbum ? (
                      <h5
                        className="leading-tight truncate flex-1"
                        style={{
                          fontSize: `${diskLabel.fontSize}pt`,
                          fontWeight: diskLabel.isBold ? 700 : 500,
                        }}
                      >
                        {currentDisc.album || t('albumPlaceholder')}
                      </h5>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {diskLabel.showInsertionArrow !== false && (
                      <div className="shrink-0 pl-1 pt-0.5" title={t('insertionArrowTooltip')}>
                        <InsertionArrow size={10} color={diskLabel.textColor} />
                      </div>
                    )}
                  </div>

                  <div className="w-full aspect-square my-auto rounded-xs overflow-hidden bg-black/10 border border-black/10">
                    {currentDisc.coverUrl && (
                      <img
                        src={currentDisc.coverUrl}
                        alt={currentDisc.album}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>

                  <div className="flex items-end justify-between min-h-[16px]">
                    <div className="overflow-hidden leading-tight flex-1 pr-1">
                      {diskLabel.showArtist && (
                        <p className="text-[10px] truncate opacity-90 font-medium">
                          {currentDisc.artist}
                        </p>
                      )}
                      {diskLabel.showYear && currentDisc.year && (
                        <p className="text-[9px] opacity-75">{currentDisc.year}</p>
                      )}
                    </div>
                    {diskLabel.showMdLogo && (
                      <MiniDiscLogo size={14} color={logoColor} />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* 3. Spine Label (54 x 6 mm) */}
            <div className="w-full flex flex-col items-center gap-1.5 mt-2">
              <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
                {t('previewSpineLabel')}
              </span>
              {(() => {
                // Compute spine text formatting
                let spineMainText = '';
                const format = spineLabel.format || 'artist-title';
                if (format === 'title-only') {
                  spineMainText = currentDisc.album;
                } else if (format === 'title-artist') {
                  spineMainText = currentDisc.artist ? `${currentDisc.album} - ${currentDisc.artist}` : currentDisc.album;
                } else {
                  // Default: artist - title ("Interpret - Názov albumu")
                  spineMainText = currentDisc.artist ? `${currentDisc.artist} - ${currentDisc.album}` : currentDisc.album;
                }

                const showYear = (spineLabel.showYear !== false) && currentDisc.year;
                const isLong = spineMainText.length > 25;

                return (
                  <div
                    className="rounded-xs shadow-md px-3 flex items-center justify-between border border-neutral-300 dark:border-neutral-700 overflow-hidden"
                    style={{
                      width: '270px',
                      height: '30px',
                      backgroundColor: spineLabel.backgroundColor,
                      color: spineLabel.textColor,
                      fontFamily: spineLabel.fontFamily,
                    }}
                  >
                    {/* Left text: Title and Artist with condensed scaling if long */}
                    <div
                      className="min-w-0 flex-1 truncate"
                      style={{
                        transform: isLong && spineLabel.autoCondense !== false ? 'scaleX(0.88)' : undefined,
                        transformOrigin: 'left center',
                        letterSpacing: isLong && spineLabel.autoCondense !== false ? '-0.03em' : 'normal',
                      }}
                    >
                      <span
                        className="font-bold text-xs truncate block"
                        style={{
                          fontSize: `${spineLabel.fontSize || 8.5}pt`,
                          fontWeight: spineLabel.isBold ? 700 : 500,
                        }}
                      >
                        {spineMainText}
                      </span>
                    </div>

                    {/* Right text: Year */}
                    {showYear && (
                      <div className="shrink-0 pl-2">
                        <span
                          style={{
                            fontFamily: spineLabel.fontFamily || 'inherit',
                            fontSize: `${spineLabel.fontSize || 8.5}pt`,
                            fontWeight: spineLabel.isBold ? 700 : 500,
                            lineHeight: 1,
                          }}
                        >
                          {currentDisc.year}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

          </div>
        )}

        {/* TAB 2: Full A4 Print Sheet (dynamically filling available viewport) */}
        {activeTab === 'sheet' && (
          <div className="w-full flex-1 flex justify-center items-start py-4">
            <PrintSheet
              discs={allDiscs}
              scale={sheetZoom}
              highlightDiscId={currentDisc.id}
              showCropMarks={showCropMarks}
            />
          </div>
        )}

      </div>
    </div>
  );
};
