import React from 'react';
import { 
  Printer, 
  FileDown, 
  FileSpreadsheet, 
  Moon, 
  Sun, 
  RotateCcw,
  Sparkles,
  Disc as DiscIcon
} from 'lucide-react';
import { MiniDiscLogo } from './MiniDiscLogo';
import { DiscData } from '../types/minidisc';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeDiscId: number;
  onSelectDisc: (id: number) => void;
  discs: DiscData[];
  onPrint: () => void;
  onExportPdf: () => void;
  onExportCsv: () => void;
  onImportCsv: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  activeDiscId,
  onSelectDisc,
  discs,
  onPrint,
  onExportPdf,
  onExportCsv,
  onImportCsv,
  onResetData,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
            <MiniDiscLogo size={22} color="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white">
                Minidisc Studio
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                A4 Hárok (6 diskov)
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
              Tvorba nálepiek & obalov pre tlač
            </p>
          </div>
        </div>

        {/* Quick Disc Badges 1-6 */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2">Disk:</span>
          {discs.map((d) => {
            const isActive = d.id === activeDiscId;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDisc(d.id)}
                title={d.isConfigured ? `Disk ${d.id}: ${d.album} (${d.artist || 'Bez interpreta'})` : `Disk ${d.id} (Neupravený)`}
                className={`relative px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs border border-neutral-200/80 dark:border-neutral-700'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: d.diskLabel.backgroundColor }}
                />
                <span className="truncate max-w-[90px]">
                  {d.isConfigured ? d.album : `Disk ${d.id}`}
                </span>
                {d.isConfigured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* CSV dropdown or actions */}
          <div className="relative group">
            <button
              onClick={onExportCsv}
              title="Export do CSV (metadáta & skladby)"
              className="px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden md:inline">CSV</span>
            </button>
          </div>

          {/* PDF Export */}
          <button
            onClick={onExportPdf}
            title="Stiahnuť PDF hárok pre tlač (300 DPI)"
            className="px-3 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
          >
            <FileDown className="w-3.5 h-3.5 text-red-500" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Direct Print */}
          <button
            onClick={onPrint}
            title="Otvoriť dialóg tlače A4"
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Tlačiť A4</span>
          </button>

          <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* Reset / Sample Data */}
          <button
            onClick={onResetData}
            title="Obnoviť ukážkové albumy zo vzoru"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Prepnúť do svetlého režimu' : 'Prepnúť do tmavého režimu'}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
