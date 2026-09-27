import React from 'react';
import { DiscData } from '../types/minidisc';
import { MiniDiscLogo } from './MiniDiscLogo';
import { CaseTracklist } from './CaseTracklist';

interface AuthenticJewelCaseProps {
  disc: DiscData;
  scale?: number;
  className?: string;
}

export const AuthenticJewelCase: React.FC<AuthenticJewelCaseProps> = ({
  disc,
  scale = 1,
  className = '',
}) => {
  const { caseLabel } = disc;

  // Standard Minidisc jewel case dimensions
  const caseWidth = 360;
  const caseHeight = 310;

  // Background position for cropping image top and bottom
  const bgPosition =
    caseLabel.imageCropPosition === 'top'
      ? 'center top'
      : caseLabel.imageCropPosition === 'bottom'
      ? 'center bottom'
      : 'center center';

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: `${caseWidth * scale}px`,
        height: `${caseHeight * scale}px`,
        filter: 'drop-shadow(0 25px 30px rgba(0, 0, 0, 0.4)) drop-shadow(0 10px 12px rgba(0, 0, 0, 0.25))',
      }}
    >
      <div
        className="w-full h-full relative rounded-xl overflow-hidden border border-neutral-400/50 dark:border-neutral-700/60 bg-gradient-to-br from-neutral-200 to-neutral-400 dark:from-neutral-800 dark:to-neutral-900 p-3 shadow-2xl flex items-center justify-center pl-6"
        style={{
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {/* Left Spine Hinge Bar (Iconic ribbed plastic hinge of Minidisc cases) */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-neutral-400 via-neutral-300 to-neutral-400 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800 border-r border-black/30 flex flex-col justify-between py-6 items-center z-20">
          <div className="w-2 h-4 rounded-xs bg-black/40 shadow-inner" />
          <div className="w-1.5 h-12 rounded-full bg-white/20" />
          <div className="w-2 h-4 rounded-xs bg-black/40 shadow-inner" />
        </div>

        {/* The Inserted 70 mm x 55 mm J-Card / Cover Label (Exact 70:55 ratio) */}
        <div
          className="rounded-md overflow-hidden relative shadow-lg border border-black/20 flex flex-col justify-between p-3.5 z-10"
          style={{
            width: '280px',
            height: '220px', // 280 / 220 = 1.2727 = 70mm / 55mm
            backgroundColor: caseLabel.backgroundColor || '#111',
            color: caseLabel.textColor || '#fff',
            fontFamily: caseLabel.fontFamily || 'sans-serif',
          }}
        >
          {/* Background Artwork - Cropped top and bottom to fill 70x55 format */}
          {disc.coverUrl && (
            <div
              className="absolute inset-0 bg-cover"
              style={{
                backgroundImage: `url(${disc.coverUrl})`,
                backgroundPosition: bgPosition,
              }}
            />
          )}

          {/* Scrim Darkening Overlay */}
          <div
            className="absolute inset-0"
            style={{
              backgroundColor: caseLabel.overlayColor || '#000',
              opacity: (caseLabel.overlayOpacity || 50) / 100,
            }}
          />

          {/* Top: Album Title & Artist */}
          <div className="relative z-10 min-w-0">
            <h3
              className="font-extrabold text-base leading-tight text-white drop-shadow-md truncate"
              title={disc.album}
            >
              {disc.album || 'Názov Albumu'}
            </h3>
            <p className="text-xs text-neutral-300 font-medium drop-shadow-md mt-0.5 truncate">
              {disc.artist || 'Interprét'} {disc.year ? `· ${disc.year}` : ''}
            </p>
          </div>

          {/* Middle: Full Real Tracklist with Dynamic Proportional Font Scaling */}
          {caseLabel.showTracklist && disc.tracks && disc.tracks.length > 0 && (
            <div className="relative z-10 my-auto bg-black/40 backdrop-blur-xs p-2 rounded-md border border-white/10 max-h-[125px] overflow-hidden">
              <CaseTracklist
                tracks={disc.tracks}
                preferredColumns={caseLabel.tracklistColumns}
              />
            </div>
          )}

          {/* Bottom: MD Emblem & Format Badge */}
          <div className="relative z-10 flex items-center justify-between mt-auto pt-1">
            <span className="text-[8px] font-mono tracking-widest text-neutral-300 uppercase opacity-85">
              MINIDISC DIGITAL AUDIO
            </span>
            {caseLabel.showMdLogo && (
              <MiniDiscLogo size={15} color="#ffffff" />
            )}
          </div>
        </div>

        {/* Clear Acrylic Case Front Cover Lid with Realistic Diagonal Glare / Reflection */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl z-30"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.15) 85%, rgba(255,255,255,0.25) 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.3)',
          }}
        >
          {/* Embossed "MiniDisc" watermark on the transparent plastic lid */}
          <div className="absolute bottom-3 right-4 opacity-35">
            <MiniDiscLogo size={20} color="#ffffff" />
          </div>
        </div>

      </div>
    </div>
  );
};
