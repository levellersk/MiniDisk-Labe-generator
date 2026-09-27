import React from 'react';

interface CropMarksProps {
  show?: boolean;
}

/**
 * Professional pre-press crop marks (orezávacie značky).
 * 3mm tick marks extending outwards with a 0.8mm offset from the cutting edge.
 * Allows perfect ruler alignment without leaving marks on the finished cut label.
 */
export const CropMarks: React.FC<CropMarksProps> = ({ show = true }) => {
  if (!show) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 select-none overflow-visible">
      {/* TOP LEFT */}
      {/* Vertical tick up */}
      <span
        className="absolute -top-[3.8mm] left-0 w-[0.3mm] h-[3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateX(-0.15mm)' }}
      />
      {/* Horizontal tick left */}
      <span
        className="absolute top-0 -left-[3.8mm] w-[3mm] h-[0.3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateY(-0.15mm)' }}
      />

      {/* TOP RIGHT */}
      {/* Vertical tick up */}
      <span
        className="absolute -top-[3.8mm] right-0 w-[0.3mm] h-[3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateX(0.15mm)' }}
      />
      {/* Horizontal tick right */}
      <span
        className="absolute top-0 -right-[3.8mm] w-[3mm] h-[0.3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateY(-0.15mm)' }}
      />

      {/* BOTTOM LEFT */}
      {/* Vertical tick down */}
      <span
        className="absolute -bottom-[3.8mm] left-0 w-[0.3mm] h-[3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateX(-0.15mm)' }}
      />
      {/* Horizontal tick left */}
      <span
        className="absolute bottom-0 -left-[3.8mm] w-[3mm] h-[0.3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateY(0.15mm)' }}
      />

      {/* BOTTOM RIGHT */}
      {/* Vertical tick down */}
      <span
        className="absolute -bottom-[3.8mm] right-0 w-[0.3mm] h-[3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateX(0.15mm)' }}
      />
      {/* Horizontal tick right */}
      <span
        className="absolute bottom-0 -right-[3.8mm] w-[3mm] h-[0.3mm] bg-neutral-800 dark:bg-neutral-200 print:bg-black"
        style={{ transform: 'translateY(0.15mm)' }}
      />
    </div>
  );
};
