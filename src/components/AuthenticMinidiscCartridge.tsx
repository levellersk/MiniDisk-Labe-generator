import React, { useState } from 'react';
import { DiscData } from '../types/minidisc';
import { MiniDiscLogo } from './MiniDiscLogo';
import { InsertionArrow } from './InsertionArrow';
import { Disc as DiscIcon, Image as ImageIcon } from 'lucide-react';

export const SONY_MDW74_IMAGE_URL = 'https://www.minidisc.wiki/_media/discs/sony/md-blank_sony_mdw-74_disc_front_.jpg';

export type CartridgeViewMode = 'sony-mdw74-photo' | 'vector-mdw74' | 'colored-shell';

export type CartridgeShellStyle = 
  | 'smoky-onyx' 
  | 'cobalt-blue' 
  | 'sony-neige' 
  | 'cyber-violet' 
  | 'emerald-green' 
  | 'crystal-clear' 
  | 'premium-gold';

interface AuthenticMinidiscCartridgeProps {
  disc: DiscData;
  viewMode?: CartridgeViewMode;
  shellStyle?: CartridgeShellStyle;
  showOpticalDisc?: boolean;
  scale?: number;
  className?: string;
  // Calibration offsets in percent for label placement on left
  labelOffsetLeft?: number; // default ~ 6.5%
  labelOffsetTop?: number;  // default ~ 13.5%
  labelWidth?: number;      // default ~ 50.5%
  labelHeight?: number;     // default ~ 76.0%
}

export const AuthenticMinidiscCartridge: React.FC<AuthenticMinidiscCartridgeProps> = ({
  disc,
  viewMode = 'sony-mdw74-photo',
  shellStyle = 'smoky-onyx',
  showOpticalDisc = true,
  scale = 1,
  className = '',
  labelOffsetLeft = 6.5,
  labelOffsetTop = 13.5,
  labelWidth = 50.5,
  labelHeight = 76.0,
}) => {
  const { diskLabel } = disc;
  const [photoError, setPhotoError] = useState(false);

  // Logo color calculation
  const logoColor =
    diskLabel.mdLogoColor === 'white'
      ? '#ffffff'
      : diskLabel.mdLogoColor === 'black'
      ? '#111111'
      : diskLabel.mdLogoColor === 'gold'
      ? '#d4af37'
      : diskLabel.textColor;

  // Base cartridge dimensions: 380px x 358px (Aspect ratio ~ 72mm x 68mm)
  const baseWidth = 380;
  const baseHeight = 358;

  // RENDER THE LABEL CONTENT (The Sticker itself)
  const renderStickerContent = (isPhotoOverlay = false) => {
    return (
      <div
        className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between select-none box-border relative overflow-hidden"
        style={{
          backgroundColor: diskLabel.backgroundColor,
          color: diskLabel.textColor,
          fontFamily: diskLabel.fontFamily || 'sans-serif',
          borderRadius: isPhotoOverlay ? '3px' : '4px',
          boxShadow: isPhotoOverlay 
            ? '0 1px 3px rgba(0,0,0,0.35), inset 0 0 0 0.5px rgba(0,0,0,0.15)' 
            : undefined,
        }}
      >
        {/* Subtle paper texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: '4px 4px',
          }}
        />

        {/* Top: Album Title & Insertion Arrow */}
        <div className="flex items-start justify-between gap-1 overflow-hidden relative z-10 min-h-[16px]">
          {diskLabel.showAlbum ? (
            <h4
              className="leading-tight truncate flex-1"
              style={{
                fontSize: `${diskLabel.fontSize}pt`,
                fontWeight: diskLabel.isBold ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
              title={disc.album}
            >
              {disc.album || 'Názov Albumu'}
            </h4>
          ) : (
            <div className="flex-1" />
          )}

          {diskLabel.showInsertionArrow !== false && (
            <div className="shrink-0 pl-1 pt-0.5" title="Smer vkladania disku">
              <InsertionArrow size={10.5} color={diskLabel.textColor} />
            </div>
          )}
        </div>

        {/* Center: Cover Artwork (Square format) */}
        <div
          className="w-full aspect-square my-auto rounded-xs overflow-hidden bg-black/10 border border-black/15 relative shadow-xs flex items-center justify-center z-10"
          style={{
            maxHeight: '145px',
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
            <div className="w-full h-full flex flex-col items-center justify-center text-xs opacity-40">
              <DiscIcon className="w-6 h-6 mb-1" />
              <span className="text-[10px]">Obal albumu</span>
            </div>
          )}
        </div>

        {/* Bottom: Artist & Year with MiniDisc Logo */}
        <div className="flex items-end justify-between gap-1 overflow-hidden mt-0.5 relative z-10">
          <div className="min-w-0 flex-1">
            {diskLabel.showArtist && (
              <p
                className="truncate font-semibold leading-tight"
                style={{
                  fontSize: `${Math.max(7, diskLabel.fontSize - 3)}pt`,
                }}
                title={disc.artist}
              >
                {disc.artist || 'Interprét'}
              </p>
            )}
            {diskLabel.showYear && disc.year && (
              <p
                className="opacity-80 leading-tight"
                style={{
                  fontSize: `${Math.max(6, diskLabel.fontSize - 4.5)}pt`,
                }}
              >
                {disc.year}
              </p>
            )}
          </div>

          {diskLabel.showMdLogo && (
            <div className="shrink-0 pb-0.5">
              <MiniDiscLogo size={16} color={logoColor} />
            </div>
          )}
        </div>

        {/* Paper Corner Sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.06) 100%)',
          }}
        />
      </div>
    );
  };

  // MODE 1: PHOTOREALISTIC SONY MDW-74 (Direct Reference Image from minidisc.wiki)
  if (viewMode === 'sony-mdw74-photo' && !photoError) {
    return (
      <div
        className={`relative select-none ${className}`}
        style={{
          width: `${baseWidth * scale}px`,
          height: `${baseHeight * scale}px`,
          filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.45)) drop-shadow(0 8px 10px rgba(0, 0, 0, 0.25))',
        }}
      >
        {/* Real Sony MDW-74 Disc Front Photograph Container */}
        <div className="relative w-full h-full rounded-xl overflow-hidden bg-neutral-900 border border-neutral-700/60 shadow-2xl">
          {/* Base Photo from minidisc.wiki */}
          <img
            src={SONY_MDW74_IMAGE_URL}
            alt="Sony MDW-74 Minidisc Reference"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={() => setPhotoError(true)}
            className="w-full h-full object-cover pointer-events-none"
          />

          {/* 
            THE STICKER LABEL OVERLAY:
            Positioned on the LEFT in the marked recess of the Sony MDW-74:
            Default: left ~ 6.5%, top ~ 13.5%, width ~ 50.5%, height ~ 76.0%
          */}
          <div
            className="absolute transition-all duration-150"
            style={{
              left: `${labelOffsetLeft}%`,
              top: `${labelOffsetTop}%`,
              width: `${labelWidth}%`,
              height: `${labelHeight}%`,
            }}
          >
            {renderStickerContent(true)}
          </div>

          {/* Slight natural reflection glare across the disc */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(125deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.04) 75%, rgba(255,255,255,0.12) 100%)',
            }}
          />
        </div>
      </div>
    );
  }

  // MODE 2: VECTOR SONY MDW-74 / COLORED SHELL
  // Vector recreation with accurate MDW-74 details:
  // "SONY" branding, "74 min", "MDW-74", aluminum sliding shutter, and sticker on the left!
  const width = 360;
  const height = 340;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{
        width: `${width * scale}px`,
        height: `${height * scale}px`,
        filter: 'drop-shadow(0 20px 25px rgba(0, 0, 0, 0.4)) drop-shadow(0 8px 10px rgba(0, 0, 0, 0.25))',
      }}
    >
      <svg
        width={width * scale}
        height={height * scale}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          {/* Optical disc rainbow diffraction grating */}
          <radialGradient id="discGroovesMdw" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#14171d" />
            <stop offset="35%" stopColor="#252932" />
            <stop offset="45%" stopColor="#353b47" />
            <stop offset="55%" stopColor="#252a33" />
            <stop offset="70%" stopColor="#191c22" />
            <stop offset="85%" stopColor="#313743" />
            <stop offset="100%" stopColor="#121418" />
          </radialGradient>

          <linearGradient id="rainbowMdw" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255, 0, 128, 0)" />
            <stop offset="25%" stopColor="rgba(0, 240, 255, 0.22)" />
            <stop offset="45%" stopColor="rgba(255, 230, 0, 0.25)" />
            <stop offset="60%" stopColor="rgba(255, 0, 150, 0.2)" />
            <stop offset="80%" stopColor="rgba(0, 255, 170, 0.18)" />
            <stop offset="100%" stopColor="rgba(0, 100, 255, 0)" />
          </linearGradient>

          {/* Stainless steel clamping hub */}
          <radialGradient id="hubMdw" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#e2e8f0" />
            <stop offset="60%" stopColor="#94a3b8" />
            <stop offset="85%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </radialGradient>

          {/* Metal brushed shutter */}
          <linearGradient id="shutterMdw" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="20%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* 1. SONY MDW-74 CARTRIDGE BODY */}
        <g id="sony-cartridge-body">
          {/* Main shell shape with 45° corner notch at top-right (x=335..356, y=4..25) */}
          <path
            d="
              M 16 4
              L 332 4
              L 356 28
              L 356 324
              A 12 12 0 0 1 344 336
              L 16 336
              A 12 12 0 0 1 4 324
              L 4 16
              A 12 12 0 0 1 16 4
              Z
            "
            fill="#181b22"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.5"
          />

          {/* Outer edge highlight */}
          <path
            d="M 16 6 L 330 6 L 354 30 L 354 324"
            fill="none"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="1"
          />
        </g>

        {/* 2. OPTICAL DISC MECHANISM ON THE RIGHT HALF */}
        {showOpticalDisc && (
          <g id="optical-disc-right" opacity="0.9">
            <circle
              cx="240"
              cy="185"
              r="115"
              fill="url(#discGroovesMdw)"
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
            <circle cx="240" cy="185" r="105" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />
            <circle cx="240" cy="185" r="92" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
            <circle cx="240" cy="185" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" />

            {/* Rainbow shimmer */}
            <circle
              cx="240"
              cy="185"
              r="115"
              fill="url(#rainbowMdw)"
              style={{ mixBlendMode: 'screen' }}
              opacity="0.75"
            />

            {/* Hub ring & clamping plate */}
            <circle cx="240" cy="185" r="46" fill="#1b1e26" stroke="#2d333f" strokeWidth="1.5" />
            <circle cx="240" cy="185" r="32" fill="url(#hubMdw)" stroke="#64748b" strokeWidth="1" />
            <circle cx="240" cy="185" r="12" fill="#0d0e12" stroke="#1c2027" strokeWidth="1.5" />
            <circle cx="240" cy="185" r="6" fill="#000000" />
            <circle cx="230" cy="185" r="2.5" fill="#475569" />
            <circle cx="250" cy="185" r="2.5" fill="#475569" />
          </g>
        )}

        {/* 3. SONY MDW-74 SPECIFIC BRANDING & MARKINGS ON RIGHT SIDE */}
        <g id="sony-mdw74-markings">
          {/* "74" in iconic large silver typeface on the right side */}
          <text
            x="245"
            y="290"
            fill="rgba(255, 255, 255, 0.75)"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="-1.5"
            textAnchor="middle"
          >
            74
          </text>
          <text
            x="280"
            y="275"
            fill="rgba(255, 255, 255, 0.6)"
            fontFamily="system-ui, sans-serif"
            fontWeight="700"
            fontSize="10"
          >
            min
          </text>

          {/* "MDW-74" model code */}
          <text
            x="245"
            y="312"
            fill="rgba(255, 255, 255, 0.55)"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="8.5"
            letterSpacing="1"
            textAnchor="middle"
          >
            SONY MDW-74
          </text>

          {/* Write protect tab on bottom right */}
          <rect x="296" y="324" width="28" height="9" rx="2" fill="#0c0e12" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
          <rect x="298" y="325" width="12" height="7" rx="1.5" fill="#ef4444" />
          <line x1="302" y1="326" x2="302" y2="331" stroke="#fff" strokeWidth="0.8" opacity="0.8" />

          {/* Insertion guide arrow on top-left edge */}
          <path d="M 40 14 L 30 14 L 35 9 Z" fill="rgba(255, 255, 255, 0.45)" />
          <text x="46" y="14" fill="rgba(255, 255, 255, 0.45)" fontFamily="monospace" fontWeight="700" fontSize="7" letterSpacing="1">
            INSERT
          </text>
        </g>

        {/* 4. SONY BRUSHED METAL SHUTTER (Top Right Half) */}
        <g id="sony-shutter">
          <rect
            x="132"
            y="4"
            width="194"
            height="72"
            rx="3"
            fill="url(#shutterMdw)"
            stroke="#475569"
            strokeWidth="1.2"
          />

          {/* Shutter bevel & grooves */}
          <line x1="133" y1="5.5" x2="324" y2="5.5" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
          <line x1="133" y1="74.5" x2="324" y2="74.5" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />

          {/* SONY Logo on Shutter */}
          <text
            x="150"
            y="26"
            fill="#1e293b"
            fontFamily="system-ui, sans-serif"
            fontWeight="900"
            fontSize="13"
            letterSpacing="1"
          >
            SONY
          </text>

          <text
            x="150"
            y="40"
            fill="#334155"
            fontFamily="monospace"
            fontWeight="700"
            fontSize="7"
            letterSpacing="0.8"
          >
            ◄ INSERT THIS END
          </text>

          {/* MiniDisc etched emblem */}
          <g transform="translate(280, 14)">
            <rect x="0" y="0" width="30" height="30" rx="4" fill="none" stroke="#1e293b" strokeWidth="2" />
            <path d="M 0 10 L 10 0" stroke="#1e293b" strokeWidth="1.8" />
            <text x="15" y="13" fill="#1e293b" fontFamily="sans-serif" fontWeight="800" fontSize="7" textAnchor="middle">
              Mini
            </text>
            <text x="15" y="22" fill="#1e293b" fontFamily="sans-serif" fontWeight="800" fontSize="8" textAnchor="middle">
              Disc
            </text>
            <circle cx="15" cy="26" r="1.2" fill="#1e293b" />
          </g>
        </g>

        {/* 5. MARKED STICKER POSITION ON THE LEFT SIDE (Corner guide ticks) */}
        {/* Recess: x=16, y=82, w=188, h=242 */}
        <g id="sony-sticker-well">
          {/* The molded L-shaped guide marks on the Sony MDW-74 */}
          <path d="M 14 90 L 14 80 L 24 80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          <path d="M 198 90 L 198 80 L 188 80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          <path d="M 14 316 L 14 326 L 24 326" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
          <path d="M 198 316 L 198 326 L 188 326" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />

          {/* Slight beveled recess */}
          <rect
            x="15"
            y="81"
            width="188"
            height="244"
            rx="5"
            fill="rgba(0, 0, 0, 0.45)"
            stroke="rgba(0, 0, 0, 0.65)"
            strokeWidth="1.2"
          />

          {/* 6. THE STICKER ON THE LEFT */}
          <foreignObject x="17" y="83" width="184" height="240">
            {renderStickerContent(false)}
          </foreignObject>
        </g>
      </svg>
    </div>
  );
};
