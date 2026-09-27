import React from 'react';

interface MiniDiscLogoProps {
  className?: string;
  color?: string; // hex or currentColor
  size?: number; // width in px
}

export const MiniDiscLogo: React.FC<MiniDiscLogoProps> = ({
  className = '',
  color = 'currentColor',
  size = 28,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="MiniDisc Logo"
    >
      {/* Outer squircle / rounded cartridge border */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="14"
        stroke={color}
        strokeWidth="7"
      />
      {/* Shutter corner notch */}
      <path
        d="M6 32 L24 6"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* MiniDisc typography mark */}
      <text
        x="50"
        y="42"
        fill={color}
        fontFamily="sans-serif"
        fontWeight="800"
        fontSize="21"
        letterSpacing="-0.5"
        textAnchor="middle"
      >
        Mini
      </text>
      <text
        x="50"
        y="68"
        fill={color}
        fontFamily="sans-serif"
        fontWeight="800"
        fontSize="23"
        letterSpacing="0.5"
        textAnchor="middle"
      >
        Disc
      </text>
      {/* Small optical disc icon underline */}
      <circle cx="50" cy="80" r="3.5" fill={color} />
      <circle cx="40" cy="80" r="2" fill={color} opacity="0.6" />
      <circle cx="60" cy="80" r="2" fill={color} opacity="0.6" />
    </svg>
  );
};
