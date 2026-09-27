import React, { useState } from 'react';
import { DiscData } from '../types/minidisc';
import { MiniDiscLogo } from './MiniDiscLogo';
import { PrintSheet } from './PrintSheet';
import { 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCw, 
  Printer, 
  Sparkles,
  Layers,
  Disc as DiscIcon
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'disklabel' | 'set' | 'sheet'>('disklabel');
  const [cartridgeColor, setCartridgeColor] = useState<'transparent' | 'smoked' | 'blue' | 'clear'>('transparent');
  const [sheetZoom, setSheetZoom] = useState<number>(0.85);

  const { diskLabel, spineLabel, caseLabel } = currentDisc;
  const logoColor =
    diskLabel.mdLogoColor === 'white'
      ? '#ffffff'
      : diskLabel.mdLogoColor === 'black'
      ? '#111111'
      : diskLabel.mdLogoColor === 'gold'
      ? '#d4af37'
      : diskLabel.textColor;

  return (
    <div className="w-full h-full flex flex-col bg-neutral-100 dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800">
      
      {/* Top Header of Preview Panel */}
      <div className="p-3 sm:px-4 sm:py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 shrink-0">
        
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => setActiveTab('disklabel')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'disklabel'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Detail nálepky</span>
          </button>

          <button
            onClick={() => setActiveTab('set')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'set'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span>Sada disku #{currentDisc.id}</span>
          </button>

          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'sheet'
                ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Celý A4 hárok (6)</span>
          </button>
        </div>

        {/* Zoom & Print Buttons */}
        <div className="flex items-center gap-1.5">
          {activeTab === 'sheet' && (
            <div className="flex items-center gap-1 mr-2 text-xs font-semibold text-neutral-500">
              <button
                onClick={() => setSheetZoom((z) => Math.max(0.45, z - 0.1))}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400"
                title="Zmenšiť náhľad"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono text-[11px]">
                {Math.round(sheetZoom * 100)}%
              </span>
              <button
                onClick={() => setSheetZoom((z) => Math.min(1.3, z + 0.1))}
                className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400"
                title="Zväčšiť náhľad"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          )}

          <button
            onClick={onPrint}
            className="px-3 py-1.5 text-xs font-bold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tlač</span>
          </button>
        </div>

      </div>

      {/* Main Preview Canvas Area */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-center relative">
        
        {/* TAB 1: Zoomed Disklabel on Realistic Cartridge */}
        {activeTab === 'disklabel' && (
          <div className="w-full max-w-md flex flex-col items-center gap-4 animate-in fade-in duration-150">
            
            {/* Shell style switcher */}
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <span>Farba kazety MD:</span>
              {(['transparent', 'smoked', 'blue', 'clear'] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCartridgeColor(c)}
                  className={`px-2 py-0.5 rounded capitalize transition-all ${
                    cartridgeColor === c
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold'
                      : 'hover:bg-neutral-200 dark:hover:bg-neutral-800'
                  }`}
                >
                  {c === 'transparent' ? 'Priesvitná' : c === 'smoked' ? 'Dymová' : c === 'blue' ? 'Modrá' : 'Číra'}
                </button>
              ))}
            </div>

            {/* Realistic Minidisc Cartridge (72mm x 68mm equivalent ratio) */}
            <div
              className={`relative rounded-2xl p-4 shadow-2xl transition-colors duration-300 border ${
                cartridgeColor === 'transparent'
                  ? 'bg-gradient-to-br from-neutral-200/90 to-neutral-300/80 dark:from-neutral-800/80 dark:to-neutral-900/90 backdrop-blur-md border-white/40 dark:border-neutral-700/50'
                  : cartridgeColor === 'smoked'
                  ? 'bg-neutral-900 text-white border-neutral-700'
                  : cartridgeColor === 'blue'
                  ? 'bg-blue-950/80 text-white border-blue-800'
                  : 'bg-white/95 text-neutral-900 border-neutral-300 shadow-md'
              }`}
              style={{
                width: '320px',
                height: '335px',
              }}
            >
              {/* Metallic Shutter at top */}
              <div className="absolute top-2 left-6 right-6 h-10 rounded-t-lg bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-300 dark:from-neutral-700 dark:via-neutral-600 dark:to-neutral-750 border-b border-neutral-400/80 dark:border-neutral-800 shadow-xs flex items-center justify-between px-3">
                <span className="text-[9px] font-mono tracking-widest text-neutral-600 dark:text-neutral-300 uppercase">
                  ◄ INSERT THIS END
                </span>
                <MiniDiscLogo size={14} color="#555" />
              </div>

              {/* Minidisc Optical Disc Center Window */}
              <div className="absolute top-16 right-7 w-20 h-20 rounded-full border-2 border-neutral-400/40 dark:border-neutral-700/60 bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-amber-500/10 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full border border-neutral-400/40 bg-white/20 dark:bg-black/40 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-neutral-400/60" />
                </div>
              </div>

              {/* The Recessed Sticker Label Slot (Physical size 38mm x 54mm) */}
              <div
                className="absolute left-6 bottom-5 rounded-md shadow-inner p-3 flex flex-col justify-between overflow-hidden transition-all duration-200 border border-neutral-300/60 dark:border-neutral-800/80"
                style={{
                  width: '185px',
                  height: '240px',
                  backgroundColor: diskLabel.backgroundColor,
                  color: diskLabel.textColor,
                  fontFamily: diskLabel.fontFamily || 'sans-serif',
                }}
              >
                {/* Album Title at top */}
                {diskLabel.showAlbum && (
                  <div className="overflow-hidden">
                    <h4
                      className="leading-tight truncate"
                      style={{
                        fontSize: `${diskLabel.fontSize}pt`,
                        fontWeight: diskLabel.isBold ? 700 : 500,
                      }}
                    >
                      {currentDisc.album || 'Názov Albumu'}
                    </h4>
                  </div>
                )}

                {/* Cover Art in center */}
                <div className="w-full aspect-square my-auto rounded-sm overflow-hidden bg-black/10 border border-black/10 relative shadow-2xs">
                  {currentDisc.coverUrl ? (
                    <img
                      src={currentDisc.coverUrl}
                      alt={currentDisc.album}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xs opacity-50">
                      <DiscIcon className="w-8 h-8 mb-1" />
                      <span>Obal albumu</span>
                    </div>
                  )}
                </div>

                {/* Artist & Year at bottom with Logo */}
                <div className="flex items-end justify-between gap-1 overflow-hidden mt-1">
                  <div className="min-w-0">
                    {diskLabel.showArtist && (
                      <p
                        className="truncate font-semibold leading-tight"
                        style={{ fontSize: `${Math.max(7, diskLabel.fontSize - 3)}pt` }}
                      >
                        {currentDisc.artist || 'Interprét'}
                      </p>
                    )}
                    {diskLabel.showYear && currentDisc.year && (
                      <p
                        className="opacity-80 leading-tight"
                        style={{ fontSize: `${Math.max(6, diskLabel.fontSize - 4.5)}pt` }}
                      >
                        {currentDisc.year}
                      </p>
                    )}
                  </div>

                  {diskLabel.showMdLogo && (
                    <div className="shrink-0 pb-0.5">
                      <MiniDiscLogo size={18} color={logoColor} />
                    </div>
                  )}
                </div>
              </div>

              {/* Write Protect Tab Notch */}
              <div className="absolute bottom-4 right-6 w-5 h-2.5 rounded-sm bg-neutral-400 dark:bg-neutral-700" />
            </div>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 text-center">
              Interaktívna simulácia nálepky vo vnútri výrezu kazety Minidisku
            </p>
          </div>
        )}

        {/* TAB 2: Complete Disc Set (Case + Disk + Spine) */}
        {activeTab === 'set' && (
          <div className="w-full max-w-xl flex flex-col items-center gap-6 animate-in fade-in duration-150">
            <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-5">
              
              {/* Case Insert */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400">1. Obal (70 × 70 mm)</span>
                <div
                  className="rounded-lg shadow-lg relative overflow-hidden border border-neutral-300 dark:border-neutral-700"
                  style={{
                    width: '210px',
                    height: '210px',
                    backgroundColor: caseLabel.backgroundColor,
                    color: caseLabel.textColor,
                    fontFamily: caseLabel.fontFamily,
                  }}
                >
                  {currentDisc.coverUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${currentDisc.coverUrl})` }}
                    />
                  )}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: caseLabel.overlayColor,
                      opacity: caseLabel.overlayOpacity / 100,
                    }}
                  />
                  <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-sm leading-tight text-white drop-shadow-xs">
                        {currentDisc.album}
                      </h4>
                      <p className="text-xs text-neutral-300 font-medium drop-shadow-xs">
                        {currentDisc.artist} {currentDisc.year ? `· ${currentDisc.year}` : ''}
                      </p>
                    </div>

                    {caseLabel.showTracklist && currentDisc.tracks.length > 0 && (
                      <div className="my-auto space-y-0.5">
                        {currentDisc.tracks.slice(0, 5).map((t) => (
                          <div key={t.id} className="text-[10px] text-neutral-200 truncate">
                            <span className="font-mono text-neutral-400 mr-1">{t.number}</span>
                            <span>{t.title}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <MiniDiscLogo size={14} color="#ffffff" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cartridge Sticker */}
              <div className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] font-bold text-neutral-400">2. Nálepka na disk (38 × 54 mm)</span>
                <div
                  className="rounded-md shadow-lg p-2.5 flex flex-col justify-between overflow-hidden border border-neutral-300 dark:border-neutral-700"
                  style={{
                    width: '140px',
                    height: '190px',
                    backgroundColor: diskLabel.backgroundColor,
                    color: diskLabel.textColor,
                    fontFamily: diskLabel.fontFamily,
                  }}
                >
                  {diskLabel.showAlbum && (
                    <h5
                      className="leading-tight truncate"
                      style={{
                        fontSize: `${diskLabel.fontSize}pt`,
                        fontWeight: diskLabel.isBold ? 700 : 500,
                      }}
                    >
                      {currentDisc.album}
                    </h5>
                  )}
                  <div className="w-full aspect-square my-auto rounded-sm overflow-hidden bg-black/10 border border-black/10">
                    {currentDisc.coverUrl && (
                      <img
                        src={currentDisc.coverUrl}
                        alt={currentDisc.album}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-1 overflow-hidden mt-1">
                    <div className="min-w-0">
                      {diskLabel.showArtist && (
                        <p className="truncate font-semibold text-xs leading-tight">
                          {currentDisc.artist}
                        </p>
                      )}
                      {diskLabel.showYear && currentDisc.year && (
                        <p className="opacity-80 text-[10px] leading-tight">
                          {currentDisc.year}
                        </p>
                      )}
                    </div>
                    {diskLabel.showMdLogo && (
                      <MiniDiscLogo size={14} color={logoColor} />
                    )}
                  </div>
                </div>
              </div>

            </div>

            {/* Spine Sticker */}
            <div className="w-full max-w-sm flex flex-col items-center gap-1.5">
              <span className="text-[11px] font-bold text-neutral-400">3. Chrbát (54 × 5 mm)</span>
              <div
                className="w-full h-8 px-3 rounded shadow-md border border-neutral-300 flex items-center justify-between"
                style={{
                  backgroundColor: spineLabel.backgroundColor,
                  color: spineLabel.textColor,
                  fontFamily: spineLabel.fontFamily,
                }}
              >
                <span className="font-bold text-xs truncate">
                  {currentDisc.album} : {currentDisc.artist}
                </span>
                <MiniDiscLogo size={12} color={spineLabel.textColor} />
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: Full A4 Print Sheet */}
        {activeTab === 'sheet' && (
          <div className="w-full flex justify-center py-4">
            <PrintSheet
              discs={allDiscs}
              scale={sheetZoom}
              highlightDiscId={currentDisc.id}
            />
          </div>
        )}

      </div>
    </div>
  );
};
