import React, { useState, useEffect } from 'react';
import { DiscData, ReleaseSearchResult, SearchProvider, TrackItem } from './types/minidisc';
import { defaultDiscs } from './data/defaultDiscs';
import { Navbar } from './components/Navbar';
import { DiscSelector } from './components/DiscSelector';
import { AlbumSearch } from './components/AlbumSearch';
import { ReleaseSelectorModal } from './components/ReleaseSelectorModal';
import { AlbumMetadataEditor } from './components/AlbumMetadataEditor';
import { DiskLabelEditor } from './components/DiskLabelEditor';
import { SpineLabelEditor } from './components/SpineLabelEditor';
import { CaseLabelEditor } from './components/CaseLabelEditor';
import { PreviewPanel } from './components/PreviewPanel';
import { generateMinidiscPdf } from './utils/pdfExport';
import { exportDiscsToCsv, parseCsvTracks } from './utils/csvExport';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './i18n/LanguageContext';

const LOCAL_STORAGE_KEY = 'minidisc_studio_discs_v2';
const DARK_MODE_KEY = 'minidisc_studio_theme';

export default function App() {
  const { t } = useLanguage();

  // Discs state initialized from localStorage or default template
  const [discs, setDiscs] = useState<DiscData[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 6) {
          return parsed.map((d: DiscData) => ({
            ...d,
            spineLabel: {
              ...d.spineLabel,
              format: d.spineLabel?.format === 'title-artist' && !d.isConfigured ? 'artist-title' : (d.spineLabel?.format || 'artist-title'),
              showYear: d.spineLabel?.showYear !== undefined ? d.spineLabel.showYear : true,
            },
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved discs:', e);
    }
    return defaultDiscs;
  });

  const [activeDiscId, setActiveDiscId] = useState<number>(1);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Accordion state for the 3 label sections
  const [openSection, setOpenSection] = useState<'disk' | 'spine' | 'case'>('disk');

  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const savedTheme = localStorage.getItem(DARK_MODE_KEY);
      if (savedTheme !== null) return savedTheme === 'dark';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Modal for multiple releases
  const [multiReleases, setMultiReleases] = useState<ReleaseSearchResult[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(DARK_MODE_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(DARK_MODE_KEY, 'light');
    }
  }, [darkMode]);

  // Current active disc reference
  const currentDiscIndex = discs.findIndex((d) => d.id === activeDiscId);
  const currentDisc = discs[currentDiscIndex >= 0 ? currentDiscIndex : 0];

  // Helper to update current disc
  const updateCurrentDisc = (updater: (prev: DiscData) => DiscData) => {
    setDiscs((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((d) => d.id === activeDiscId);
      if (idx >= 0) {
        copy[idx] = updater(copy[idx]);
      }
      return copy;
    });
    setHasUnsavedChanges(true);
  };

  // Save changes to database (localStorage)
  const handleSaveToDatabase = () => {
    try {
      const updatedDiscs = discs.map((d) => {
        if (d.id === activeDiscId) {
          return {
            ...d,
            isConfigured: true,
            album: d.album.trim() || `${t('disc')} ${d.id}`,
            lastUpdated: new Date().toISOString(),
          };
        }
        return d;
      });

      setDiscs(updatedDiscs);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDiscs));
      setHasUnsavedChanges(false);

      const savedDisc = updatedDiscs.find((d) => d.id === activeDiscId);
      setSaveBanner(
        t('saveSuccessBanner', {
          id: activeDiscId,
          album: savedDisc?.album || '',
          artist: savedDisc?.artist || t('noArtist'),
        })
      );
      setTimeout(() => setSaveBanner(null), 3000);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  // Reset to default blank discs
  const handleResetData = () => {
    if (window.confirm(t('confirmReset'))) {
      setDiscs(defaultDiscs);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultDiscs));
      setHasUnsavedChanges(false);
      setSaveBanner(t('resetNotice'));
      setTimeout(() => setSaveBanner(null), 3000);
    }
  };

  // Apply fetched album data
  const handleApplyAlbumData = (data: {
    artist: string;
    album: string;
    year: string;
    tracks: TrackItem[];
    coverUrl: string;
    provider: SearchProvider;
  }) => {
    updateCurrentDisc((prev) => ({
      ...prev,
      artist: data.artist || prev.artist,
      album: data.album || prev.album,
      year: data.year || prev.year,
      tracks: data.tracks.length > 0 ? data.tracks : prev.tracks,
      coverUrl: data.coverUrl || prev.coverUrl,
      sourceProvider: data.provider,
    }));
  };

  // Open multi-release modal
  const handleOpenMultiReleaseModal = (results: ReleaseSearchResult[]) => {
    setMultiReleases(results);
    setIsModalOpen(true);
  };

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // PDF Export
  const handleExportPdf = async () => {
    try {
      await generateMinidiscPdf(discs);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert(t('pdfErrorAlert'));
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    exportDiscsToCsv(discs);
  };

  // CSV Import
  const handleImportCsv = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,text/csv';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          if (text) {
            const parsed = parseCsvTracks(text);
            updateCurrentDisc((prev) => ({
              ...prev,
              artist: parsed.artist || prev.artist,
              album: parsed.album || prev.album,
              year: parsed.year || prev.year,
              tracks: parsed.tracks.length > 0 ? parsed.tracks : prev.tracks,
            }));
            setSaveBanner(t('csvImportSuccess'));
            setTimeout(() => setSaveBanner(null), 3000);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100/70 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      
      {/* Top Navbar */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        activeDiscId={activeDiscId}
        onSelectDisc={setActiveDiscId}
        discs={discs}
        onPrint={handlePrint}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
        onImportCsv={handleImportCsv}
        onResetData={handleResetData}
      />

      {/* Unsaved changes notification banner */}
      {saveBanner && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* Main Workspace (Full-width dynamic layout stretching to the right window edge) */}
      <main className="flex-1 w-full flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left Column: Form & Controls Editor */}
        <div className="w-full lg:w-[500px] xl:w-[560px] 2xl:w-[600px] shrink-0 p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] border-r border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xs">
          
          {/* STEP 1: Choose Disc (1 to 6) */}
          <DiscSelector
            discs={discs}
            activeDiscId={activeDiscId}
            onSelectDisc={setActiveDiscId}
          />

          {/* STEP 2: Online Database Search & Save */}
          <AlbumSearch
            onApplyAlbumData={handleApplyAlbumData}
            onOpenMultiReleaseModal={handleOpenMultiReleaseModal}
            onSaveToDatabase={handleSaveToDatabase}
            hasUnsavedChanges={hasUnsavedChanges}
            currentArtist={currentDisc.artist}
            currentAlbum={currentDisc.album}
          />

          {/* STEP 3: Album Metadata & Tracklist Editor */}
          <AlbumMetadataEditor
            artist={currentDisc.artist}
            album={currentDisc.album}
            year={currentDisc.year}
            coverUrl={currentDisc.coverUrl}
            tracks={currentDisc.tracks}
            onChangeArtist={(artist) => updateCurrentDisc((d) => ({ ...d, artist }))}
            onChangeAlbum={(album) => updateCurrentDisc((d) => ({ ...d, album }))}
            onChangeYear={(year) => updateCurrentDisc((d) => ({ ...d, year }))}
            onChangeCoverUrl={(coverUrl) => updateCurrentDisc((d) => ({ ...d, coverUrl }))}
            onUpdateTracks={(tracks) => updateCurrentDisc((d) => ({ ...d, tracks }))}
          />

          {/* STEP 4: Definition of the 3 Labels Design (Cleanly Separated) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {t('step4Title')}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
                  {t('designTitleForDisc', { id: currentDisc.id })}
                </h3>
              </div>
            </div>

            {/* SECTION A: Nálepka na disk (disklabel) - Primary Focus */}
            <div className="rounded-xl overflow-hidden border border-indigo-500/30 dark:border-indigo-500/40 bg-white dark:bg-neutral-900 shadow-sm">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'disk' ? ('' as any) : 'disk')}
                className="w-full px-4 py-3 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="font-bold text-sm text-neutral-900 dark:text-white">
                    {t('sectionDiskTitle')}
                  </span>
                </div>
                {openSection === 'disk' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {openSection === 'disk' && (
                <div className="p-3 sm:p-4">
                  <DiskLabelEditor
                    style={currentDisc.diskLabel}
                    onChangeStyle={(style) => updateCurrentDisc((d) => ({ ...d, diskLabel: style }))}
                    album={currentDisc.album}
                    artist={currentDisc.artist}
                    year={currentDisc.year}
                  />
                </div>
              )}
            </div>

            {/* SECTION B: Nálepka na chrbát disku (spine label) */}
            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'spine' ? ('' as any) : 'spine')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {t('sectionSpineTitle')}
                  </span>
                </div>
                {openSection === 'spine' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {openSection === 'spine' && (
                <div className="p-3 sm:p-4">
                  <SpineLabelEditor
                    style={currentDisc.spineLabel}
                    onChangeStyle={(style) => updateCurrentDisc((d) => ({ ...d, spineLabel: style }))}
                    album={currentDisc.album}
                    artist={currentDisc.artist}
                    year={currentDisc.year}
                    diskLabelStyle={currentDisc.diskLabel}
                  />
                </div>
              )}
            </div>

            {/* SECTION C: Nálepka na obal (case label) */}
            <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs">
              <button
                type="button"
                onClick={() => setOpenSection(openSection === 'case' ? ('' as any) : 'case')}
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
                  <span className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
                    {t('sectionCaseTitle')}
                  </span>
                </div>
                {openSection === 'case' ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </button>

              {openSection === 'case' && (
                <div className="p-3 sm:p-4">
                  <CaseLabelEditor
                    style={currentDisc.caseLabel}
                    onChangeStyle={(style) => updateCurrentDisc((d) => ({ ...d, caseLabel: style }))}
                    album={currentDisc.album}
                    artist={currentDisc.artist}
                    tracks={currentDisc.tracks}
                  />
                </div>
              )}
            </div>

          </div>

          {/* Quick Footer info */}
          <div className="text-center pt-4 pb-6 text-xs text-neutral-400 dark:text-neutral-500">
            {t('footerNotice')}
          </div>

        </div>

        {/* Right Column: Dynamic Live Interactive Preview Panel stretching to right edge */}
        <div className="flex-1 min-w-0 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex flex-col overflow-hidden bg-neutral-100 dark:bg-neutral-950">
          <PreviewPanel
            currentDisc={currentDisc}
            allDiscs={discs}
            onPrint={handlePrint}
          />
        </div>

        {/* Mobile / Tablet preview drawer (displayed below on small screens) */}
        <div className="lg:hidden p-4 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="font-bold text-base mb-3 text-neutral-900 dark:text-white">
            {t('mobilePreviewTitle', { id: currentDisc.id })}
          </h3>
          <PreviewPanel
            currentDisc={currentDisc}
            allDiscs={discs}
            onPrint={handlePrint}
          />
        </div>

      </main>

      {/* Disambiguation Modal for Multiple Releases */}
      <ReleaseSelectorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        results={multiReleases}
        onSelectRelease={handleApplyAlbumData}
      />

    </div>
  );
}
