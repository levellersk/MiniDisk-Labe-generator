import React from 'react';
import { TrackItem } from '../types/minidisc';

interface CaseTracklistProps {
  tracks: TrackItem[];
  preferredColumns?: 1 | 2;
  className?: string;
}

export const CaseTracklist: React.FC<CaseTracklistProps> = ({
  tracks,
  preferredColumns,
  className = '',
}) => {
  if (!tracks || tracks.length === 0) return null;

  const count = tracks.length;

  // Auto column selection: 1 column if 8 or fewer tracks, 2 columns if 9+ tracks, or user preference
  const isTwoColumns = preferredColumns === 2 || (!preferredColumns && count > 8);

  // Dynamic proportional font size based on total track count
  let fontSizePt = 7.2;
  let lineHeight = 1.25;
  let gapY = 'gap-y-1';

  if (!isTwoColumns) {
    if (count <= 4) {
      fontSizePt = 8.4;
      lineHeight = 1.51;
      gapY = 'gap-y-1.5';
    } else if (count <= 6) {
      fontSizePt = 7.6;
      lineHeight = 1.40;
      gapY = 'gap-y-1';
    } else if (count <= 8) {
      fontSizePt = 6.7;
      lineHeight = 1.32;
      gapY = 'gap-y-0.5';
    } else if (count <= 11) {
      fontSizePt = 5.8;
      lineHeight = 1.25;
      gapY = 'gap-y-0.5';
    } else {
      fontSizePt = Math.max(4.2, 5.8 - (count - 11) * 0.2);
      lineHeight = 1.18;
      gapY = 'gap-y-0';
    }
  } else {
    // Two columns
    const rowsPerCol = Math.ceil(count / 2);
    if (rowsPerCol <= 5) {
      // Up to 10 tracks
      fontSizePt = 7.4;
      lineHeight = 1.40;
      gapY = 'gap-y-1';
    } else if (rowsPerCol <= 7) {
      // 11 - 14 tracks
      fontSizePt = 6.5;
      lineHeight = 1.32;
      gapY = 'gap-y-0.5';
    } else if (rowsPerCol <= 10) {
      // 15 - 20 tracks
      fontSizePt = 5.6;
      lineHeight = 1.25;
      gapY = 'gap-y-0.5';
    } else if (rowsPerCol <= 13) {
      // 21 - 26 tracks
      fontSizePt = 4.9;
      lineHeight = 1.21;
      gapY = 'gap-y-0';
    } else {
      // 27+ tracks
      fontSizePt = Math.max(4.0, 4.9 - (rowsPerCol - 13) * 0.16);
      lineHeight = 1.14;
      gapY = 'gap-y-0';
    }
  }

  if (isTwoColumns) {
    const half = Math.ceil(count / 2);
    const col1 = tracks.slice(0, half);
    const col2 = tracks.slice(half);

    return (
      <div className={`grid grid-cols-2 gap-x-2.5 ${className}`}>
        {/* Column 1 */}
        <div className={`flex flex-col ${gapY} min-w-0`}>
          {col1.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1 min-w-0"
              style={{
                fontSize: `${fontSizePt}pt`,
                lineHeight: lineHeight,
              }}
            >
              <span className="font-mono opacity-70 shrink-0 font-semibold text-[0.9em]">
                {t.number}
              </span>
              <span className="truncate">{t.title}</span>
            </div>
          ))}
        </div>

        {/* Column 2 */}
        <div className={`flex flex-col ${gapY} min-w-0`}>
          {col2.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-1 min-w-0"
              style={{
                fontSize: `${fontSizePt}pt`,
                lineHeight: lineHeight,
              }}
            >
              <span className="font-mono opacity-70 shrink-0 font-semibold text-[0.9em]">
                {t.number}
              </span>
              <span className="truncate">{t.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Single Column
  return (
    <div className={`flex flex-col ${gapY} min-w-0 ${className}`}>
      {tracks.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-1.5 min-w-0"
          style={{
            fontSize: `${fontSizePt}pt`,
            lineHeight: lineHeight,
          }}
        >
          <span className="font-mono opacity-70 shrink-0 font-semibold text-[0.9em]">
            {t.number}
          </span>
          <span className="truncate">{t.title}</span>
        </div>
      ))}
    </div>
  );
};
