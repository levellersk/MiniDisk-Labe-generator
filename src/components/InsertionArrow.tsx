import React from 'react';

interface InsertionArrowProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Authentic Minidisc cartridge insertion direction arrow (šípka smeru vkladania do MD mechaniky).
 * Positioned in the top right corner of the 38x54mm cartridge label.
 */
export const InsertionArrow: React.FC<InsertionArrowProps> = ({
  size = 11,
  color = 'currentColor',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={Math.round((size * 12) / 10)}
      viewBox="0 0 10 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      role="img"
      aria-label="Smer vkladania disku"
    >
      <title>Smer vkladania disku</title>
      <path
        d="M5 0.5L9.2 5.2H6.3V11.5H3.7V5.2H0.8L5 0.5Z"
        fill={color}
      />
    </svg>
  );
};
