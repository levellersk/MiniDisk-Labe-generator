import React from 'react';
import { DiscData } from '../types/minidisc';
import { MiniDiscLogo } from './MiniDiscLogo';

interface PrintSheetProps {
  discs: DiscData[];
  scale?: number; // for interactive zoom preview
  highlightDiscId?: number;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  discs,
  scale = 1,
  highlightDiscId,
}) => {
  // Case positions in 2 columns x 3 rows:
  // Col 0: discs[0] (Blue Hour), discs[2] (Signal Garden), discs[4] (Neon Civic)
  // Col 1: discs[1] (Silver Map), discs[3] (Late Static), discs[5] (Amp Weather)
  const caseMap = [
    { disc: discs[0], col: 0, row: 0 },
    { disc: discs[1], col: 1, row: 0 },
    { disc: discs[2], col: 0, row: 1 },
    { disc: discs[3], col: 1, row: 1 },
    { disc: discs[4], col: 0, row: 2 },
    { disc: discs[5], col: 1, row: 2 },
  ];

  // Cartridge disk positions:
  // Top right column (3 items): discs[0], discs[1], discs[2]
  // Bottom horizontal row (3 items): discs[4], discs[5], discs[3]
  const diskTopColumn = [discs[0], discs[1], discs[2]];
  const diskBottomRow = [discs[4], discs[5], discs[3]];

  return (
    <div
      className="print-sheet-container bg-neutral-200/70 dark:bg-neutral-950 p-2 sm:p-6 flex items-center justify-center overflow-auto"
      style={{ minHeight: '600px' }}
    >
      {/* 
        A4 sheet dimensions: 210mm x 297mm (aspect ratio 1 : 1.414).
        In CSS, we use exact mm for print and px equivalent for screen.
        794px x 1123px at 96 DPI screen scale.
      */}
      <div
        id="a4-print-sheet"
        className="a4-sheet bg-white text-black shadow-2xl relative select-none"
        style={{
          width: '210mm',
          height: '297mm',
          minWidth: '210mm',
          minHeight: '297mm',
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'top center',
          boxSizing: 'border-box',
          padding: '10mm',
        }}
      >
        
        {/* Top & Left Grid: 6 Case Labels (2 cols x 3 rows) */}
        <div
          className="absolute"
          style={{
            top: '10mm',
            left: '10mm',
            width: '143mm',
            height: '216mm',
            display: 'grid',
            gridTemplateColumns: '70mm 70mm',
            gridTemplateRows: '70mm 70mm 70mm',
            gap: '3mm',
          }}
        >
          {caseMap.map((item, idx) => {
            const disc = item.disc;
            if (!disc) return null;
            const isHighlight = highlightDiscId === disc.id;

            return (
              <div
                key={`case-${disc.id}-${idx}`}
                className={`relative overflow-hidden border border-neutral-300 ${
                  isHighlight ? 'ring-2 ring-indigo-500' : ''
                }`}
                style={{
                  width: '70mm',
                  height: '70mm',
                  backgroundColor: disc.caseLabel.backgroundColor || '#111',
                  color: disc.caseLabel.textColor || '#fff',
                  fontFamily: disc.caseLabel.fontFamily || 'sans-serif',
                }}
              >
                {/* Background Artwork */}
                {disc.coverUrl && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url(${disc.coverUrl})`,
                    }}
                  />
                )}

                {/* Scrim Overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundColor: disc.caseLabel.overlayColor || '#000',
                    opacity: (disc.caseLabel.overlayOpacity || 50) / 100,
                  }}
                />

                {/* Content Overlay */}
                <div className="relative z-10 p-3 h-full flex flex-col justify-between">
                  {/* Title & Artist */}
                  <div>
                    <h3
                      className="font-bold tracking-tight text-white leading-tight drop-shadow-xs"
                      style={{ fontSize: '13pt' }}
                    >
                      {disc.album}
                    </h3>
                    <p
                      className="text-neutral-300 font-medium leading-normal drop-shadow-xs"
                      style={{ fontSize: '8.5pt' }}
                    >
                      {disc.artist} {disc.year ? `· ${disc.year}` : ''}
                    </p>
                  </div>

                  {/* Tracklist on case card */}
                  {disc.caseLabel.showTracklist && disc.tracks.length > 0 && (
                    <div className="my-auto space-y-0.5">
                      {disc.tracks.slice(0, 6).map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-1.5 text-neutral-200"
                          style={{ fontSize: '7pt', lineHeight: 1.25 }}
                        >
                          <span className="font-mono text-neutral-400 opacity-80">
                            {t.number}
                          </span>
                          <span className="truncate font-medium">{t.title}</span>
                        </div>
                      ))}
                      {disc.tracks.length > 6 && (
                        <span
                          className="text-neutral-400 italic block mt-0.5"
                          style={{ fontSize: '6pt' }}
                        >
                          + {disc.tracks.length - 6} ďalších
                        </span>
                      )}
                    </div>
                  )}

                  {/* Bottom Logo */}
                  {disc.caseLabel.showMdLogo && (
                    <div className="flex justify-end">
                      <MiniDiscLogo size={14} color="#ffffff" />
                    </div>
                  )}
                </div>

                {/* Cut crop corner guides */}
                <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50" />
                <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-white/50" />
                <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-white/50" />
                <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50" />
              </div>
            );
          })}
        </div>

        {/* Top Right Column: 3 Cartridge Labels (Nálepka na disk: Discs 1, 2, 3) */}
        <div
          className="absolute"
          style={{
            top: '10mm',
            left: '159mm',
            width: '38mm',
            display: 'flex',
            flexDirection: 'column',
            gap: '3mm',
          }}
        >
          {diskTopColumn.map((disc, idx) => {
            if (!disc) return null;
            return renderCartridgeLabel(disc, highlightDiscId === disc.id, `top-${idx}`);
          })}
        </div>

        {/* Bottom Horizontal Row: 3 Cartridge Labels (Discs 5, 6, 4) */}
        <div
          className="absolute"
          style={{
            top: '230mm',
            left: '83mm',
            display: 'flex',
            gap: '3mm',
          }}
        >
          {diskBottomRow.map((disc, idx) => {
            if (!disc) return null;
            return renderCartridgeLabel(disc, highlightDiscId === disc.id, `bottom-${idx}`);
          })}
        </div>

        {/* Bottom Left: 6 Spine Labels */}
        <div
          className="absolute"
          style={{
            top: '230mm',
            left: '10mm',
            width: '65mm',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2mm',
          }}
        >
          {discs.map((disc) => {
            const isHighlight = highlightDiscId === disc.id;
            return (
              <div
                key={`spine-${disc.id}`}
                className={`border border-neutral-300 px-2 flex items-center justify-between overflow-hidden relative ${
                  isHighlight ? 'ring-1 ring-indigo-500' : ''
                }`}
                style={{
                  width: '65mm',
                  height: '5.5mm',
                  backgroundColor: disc.spineLabel.backgroundColor || disc.diskLabel.backgroundColor,
                  color: disc.spineLabel.textColor || disc.diskLabel.textColor,
                  fontFamily: disc.spineLabel.fontFamily || disc.diskLabel.fontFamily,
                }}
              >
                <span
                  className="font-bold truncate"
                  style={{ fontSize: '6.5pt', lineHeight: 1 }}
                >
                  {disc.album} : {disc.artist}
                </span>
                <MiniDiscLogo size={9} color={disc.spineLabel.textColor || disc.diskLabel.textColor} />
              </div>
            );
          })}
        </div>

        {/* 5 cm Calibration Ruler at the bottom left */}
        <div
          className="absolute"
          style={{
            bottom: '10mm',
            left: '10mm',
            width: '50mm', // exactly 50mm = 5 cm
          }}
        >
          <div className="text-[7pt] text-neutral-600 font-sans text-center mb-1 font-semibold">
            5 cm
          </div>
          {/* Ruler line with ticks */}
          <div className="relative w-full h-[6px] border-b border-neutral-800">
            {/* 6 ticks: 0cm, 1cm, 2cm, 3cm, 4cm, 5cm */}
            {[0, 10, 20, 30, 40, 50].map((pos, i) => (
              <span
                key={i}
                className="absolute bottom-0 w-[0.8px] bg-neutral-800"
                style={{
                  left: `${pos}mm`,
                  height: i === 0 || i === 5 ? '6px' : '4px',
                }}
              />
            ))}
          </div>
          <p className="text-[5pt] text-neutral-400 mt-1 font-mono">
            Mierka tlače 100% · Pri tlači zvoľte skutočnú veľkosť (Actual Size)
          </p>
        </div>

      </div>
    </div>
  );
};

// Render function for a single standard Minidisc cartridge label (disklabel: 38mm x 54mm)
function renderCartridgeLabel(disc: DiscData, isHighlight: boolean, key: string) {
  const { diskLabel } = disc;
  const logoColor =
    diskLabel.mdLogoColor === 'white'
      ? '#ffffff'
      : diskLabel.mdLogoColor === 'black'
      ? '#111111'
      : diskLabel.mdLogoColor === 'gold'
      ? '#d4af37'
      : diskLabel.textColor;

  return (
    <div
      key={key}
      className={`relative overflow-hidden border border-neutral-300 p-2 flex flex-col justify-between select-none ${
        isHighlight ? 'ring-2 ring-indigo-500' : ''
      }`}
      style={{
        width: '38mm',
        height: '54mm',
        backgroundColor: diskLabel.backgroundColor,
        color: diskLabel.textColor,
        fontFamily: diskLabel.fontFamily || 'sans-serif',
        boxSizing: 'border-box',
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
            {disc.album}
          </h4>
        </div>
      )}

      {/* Album Cover in center (Square) */}
      <div
        className="w-full aspect-square my-auto rounded-sm overflow-hidden bg-black/10 border border-black/10 relative"
        style={{
          maxHeight: '30mm',
        }}
      >
        {disc.coverUrl ? (
          <img
            src={disc.coverUrl}
            alt={disc.album}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs opacity-40">
            MD Cover
          </div>
        )}
      </div>

      {/* Artist & Year at bottom with MD Logo */}
      <div className="flex items-end justify-between gap-1 overflow-hidden mt-0.5">
        <div className="min-w-0">
          {diskLabel.showArtist && (
            <p
              className="truncate font-semibold leading-tight"
              style={{ fontSize: `${Math.max(6, diskLabel.fontSize - 3)}pt` }}
            >
              {disc.artist}
            </p>
          )}
          {diskLabel.showYear && disc.year && (
            <p
              className="opacity-75 leading-tight"
              style={{ fontSize: `${Math.max(5.5, diskLabel.fontSize - 4.5)}pt` }}
            >
              {disc.year}
            </p>
          )}
        </div>

        {/* MD Logo */}
        {diskLabel.showMdLogo && (
          <div className="shrink-0 pb-0.5">
            <MiniDiscLogo size={13} color={logoColor} />
          </div>
        )}
      </div>

      {/* Cutting crop corners */}
      <span className="absolute top-0 left-0 w-1 h-1 border-t border-l border-neutral-400" />
      <span className="absolute top-0 right-0 w-1 h-1 border-t border-r border-neutral-400" />
      <span className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-neutral-400" />
      <span className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-neutral-400" />
    </div>
  );
}
