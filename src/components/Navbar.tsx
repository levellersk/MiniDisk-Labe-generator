import React, { useState, useRef, useEffect } from 'react';
import { 
  Printer, 
  FileDown, 
  FileSpreadsheet, 
  Moon, 
  Sun, 
  RotateCcw,
  Languages,
  FolderOpen,
  Save,
  Download,
  Upload,
  ChevronDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { MiniDiscLogo } from './MiniDiscLogo';
import { DiscData } from '../types/minidisc';
import { useLanguage } from '../i18n/LanguageContext';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeDiscId: number;
  onSelectDisc: (id: number) => void;
  discs: DiscData[];
  onPrint: () => void;
  onExportPdf: () => void;
  onExportSvg: () => void;
  onExportCsv: () => void;
  onImportCsv: () => void;
  onSaveProject: () => void;
  onLoadProject: () => void;
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
  onExportSvg,
  onExportCsv,
  onSaveProject,
  onLoadProject,
  onResetData,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const projectMenuRef = useRef<HTMLDivElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectMenuRef.current && !projectMenuRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md transition-colors">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
            <MiniDiscLogo size={22} color="currentColor" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-neutral-900 dark:text-white">
                {t('appTitle')}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                {t('sheetBadge')}
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Quick Disc Badges 1-6 */}
        <div className="hidden lg:flex items-center gap-1.5 p-1 rounded-lg bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/60">
          <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 px-2">
            {t('disc')}:
          </span>
          {discs.map((d) => {
            const isActive = d.id === activeDiscId;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDisc(d.id)}
                title={d.isConfigured ? `${t('disc')} ${d.id}: ${d.album} (${d.artist || t('noArtist')})` : `${t('disc')} ${d.id} (${t('unconfigured')})`}
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
                  {d.isConfigured ? d.album : `${t('disc')} ${d.id}`}
                </span>
                {d.isConfigured && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* PROJECT MENU (Save / Load project) */}
          <div className="relative" ref={projectMenuRef}>
            <button
              onClick={() => {
                setIsProjectMenuOpen(!isProjectMenuOpen);
                setIsExportMenuOpen(false);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
              title={t('projectMenu')}
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">{t('projectMenu')}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isProjectMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={() => {
                    setIsProjectMenuOpen(false);
                    onSaveProject();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors"
                >
                  <Save className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100">
                      {t('saveProject')}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block leading-tight mt-0.5">
                      {t('saveProjectDesc')}
                    </span>
                  </div>
                </button>

                <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />

                <button
                  onClick={() => {
                    setIsProjectMenuOpen(false);
                    onLoadProject();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-start gap-2.5 transition-colors"
                >
                  <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100">
                      {t('loadProject')}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block leading-tight mt-0.5">
                      {t('loadProjectDesc')}
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* EXPORT MENU DROPDOWN (PDF, SVG Inkscape, CSV) */}
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => {
                setIsExportMenuOpen(!isExportMenuOpen);
                setIsProjectMenuOpen(false);
              }}
              className="px-2.5 py-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-100 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors flex items-center gap-1.5 border border-neutral-200 dark:border-neutral-700"
              title={t('exportMenu')}
            >
              <Download className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-300" />
              <span className="hidden sm:inline">{t('exportMenu')}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* 1. PDF Export */}
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportPdf();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-red-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100">
                      {t('exportPdf')}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block leading-tight">
                      300 DPI A4 Print PDF
                    </span>
                  </div>
                </button>

                {/* 2. Inkscape SVG Export */}
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportSvg();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors"
                >
                  <Layers className="w-4 h-4 text-violet-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100 flex items-center gap-1">
                      {t('exportSvg')}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block leading-tight">
                      Vektorový hárok s vrstvami
                    </span>
                  </div>
                </button>

                {/* 3. CSV Export */}
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportCsv();
                  }}
                  className="w-full px-3.5 py-2 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2.5 transition-colors border-t border-neutral-100 dark:border-neutral-800 mt-1"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-neutral-900 dark:text-neutral-100">
                      {t('exportCsv')}
                    </span>
                    <span className="text-[10px] text-neutral-500 dark:text-neutral-400 block leading-tight">
                      Metadáta & skladby
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Direct Print Button */}
          <button
            onClick={onPrint}
            title={t('printA4Title')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{t('printA4')}</span>
          </button>

          <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Language Selector: SK / EN */}
          <div className="flex items-center p-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('sk')}
              title={t('langSkFull')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'sk'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              SK
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              title={t('langEnFull')}
              className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white dark:bg-neutral-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <div className="w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

          {/* Reset / Sample Data */}
          <button
            onClick={onResetData}
            title={t('resetSample')}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? t('toggleLight') : t('toggleDark')}
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-600" />}
          </button>
        </div>

      </div>
    </header>
  );
};
