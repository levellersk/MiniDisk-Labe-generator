import React from 'react';

interface InsertionArrowProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Authentic Sony MiniDisc cartridge insertion direction indicator (štylizovaný trojuholník smeru vkladania do MD mechaniky).
 * Features the iconic slender, elongated isosceles needle-triangle embossed/printed on authentic MiniDisc shells.
 * Positioned in the top right corner of the 38x54mm cartridge label.
 */
export const InsertionArrow: React.FC<InsertionArrowProps> = ({
  size = 11,
  color = 'currentColor',
  className = '',
}) => {
  // Aspect ratio is approx 1:2.4 (slender needle triangle pointing up)
  const width = Math.max(5, Math.round(size * 0.55));
  const height = Math.round(width * 2.3);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 10 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Smer vkladania disku"
    >
      <title>Smer vkladania disku</title>
      {/* Elongated slender triangle pointing upward */}
      <polygon
        points="5,0.8 9.5,22.2 0.5,22.2"
        fill={color}
      />
    </svg>
  );
};
