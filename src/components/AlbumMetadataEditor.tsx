import React, { useState } from 'react';
import { TrackItem } from '../types/minidisc';
import { 
  User, 
  Disc, 
  Calendar, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Image as ImageIcon,
  Upload,
  ClipboardList,
  Check
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AlbumMetadataEditorProps {
  artist: string;
  album: string;
  year: string;
  coverUrl: string;
  tracks: TrackItem[];
  onChangeArtist: (val: string) => void;
  onChangeAlbum: (val: string) => void;
  onChangeYear: (val: string) => void;
  onChangeCoverUrl: (val: string) => void;
  onUpdateTracks: (tracks: TrackItem[]) => void;
}

export const AlbumMetadataEditor: React.FC<AlbumMetadataEditorProps> = ({
  artist,
  album,
  year,
  coverUrl,
  tracks,
  onChangeArtist,
  onChangeAlbum,
  onChangeYear,
  onChangeCoverUrl,
  onUpdateTracks,
}) => {
  const { t } = useLanguage();
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [newTrackTitle, setNewTrackTitle] = useState('');

  // Handle single track add
  const handleAddTrack = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTrackTitle.trim()) return;

    const nextNum = String(tracks.length + 1).padStart(2, '0');
    const newTrack: TrackItem = {
      id: `track-${Date.now()}-${Math.random()}`,
      number: nextNum,
      title: newTrackTitle.trim(),
    };

    onUpdateTracks([...tracks, newTrack]);
    setNewTrackTitle('');
  };

  // Handle track edit
  const handleTrackChange = (index: number, field: 'number' | 'title' | 'duration', value: string) => {
    const updated = [...tracks];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateTracks(updated);
  };

  // Handle track delete
  const handleDeleteTrack = (index: number) => {
    const updated = tracks.filter((_, i) => i !== index);
    // Renumber tracks nicely
    const renumbered = updated.map((t, idx) => ({
      ...t,
      number: String(idx + 1).padStart(2, '0'),
    }));
    onUpdateTracks(renumbered);
  };

  // Move up/down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === tracks.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...tracks];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // Renumber
    const renumbered = updated.map((t, idx) => ({
      ...t,
      number: String(idx + 1).padStart(2, '0'),
    }));
    onUpdateTracks(renumbered);
  };

  // Bulk paste parser
  const handleApplyBulkText = () => {
    if (!bulkText.trim()) return;

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsedTracks: TrackItem[] = lines.map((line, idx) => {
      let clean = line.trim();
      let duration = '';

      // Match duration at end e.g. (3:45) or 3:45
      const durMatch = clean.match(/[\(\[]?(\d{1,2}:\d{2})[\)\]]?\s*$/);
      if (durMatch) {
        duration = durMatch[1];
        clean = clean.replace(/[\(\[]?(\d{1,2}:\d{2})[\)\]]?\s*$/, '').trim();
      }

      // Match leading track number e.g. "01.", "1 -", "01 "
      const numMatch = clean.match(/^(\d{1,3})[\.\-\s\)]+(.*)$/);
      let num = String(idx + 1).padStart(2, '0');
      let title = clean;

      if (numMatch) {
        num = numMatch[1].padStart(2, '0');
        title = numMatch[2].trim();
      }

      return {
        id: `track-${Date.now()}-${idx}-${Math.random()}`,
        number: num,
        title: title || `Track ${idx + 1}`,
        duration: duration || undefined,
      };
    });

    onUpdateTracks(parsedTracks);
    setIsBulkOpen(false);
    setBulkText('');
  };

  // Image file upload
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChangeCoverUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
      
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {t('metadataStepTitle')}
        </span>
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-white">
          {t('metadataTitle')}
        </h3>
      </div>

      {/* Main Metadata Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
        
        {/* Cover Art Box (3 cols) */}
        <div className="md:col-span-3 flex flex-col gap-2">
          <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400">
            {t('coverArtLabel')}
          </label>
          <div className="relative aspect-square w-full rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 overflow-hidden group">
            {coverUrl ? (
              <img
                src={coverUrl}
                alt={album || 'Cover'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 text-xs p-2 text-center">
                <ImageIcon className="w-8 h-8 mb-1 stroke-1" />
                <span>{t('noImage')}</span>
              </div>
            )}

            {/* Hover overlay with upload button */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 text-white">
              <label className="cursor-pointer px-2.5 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-md text-xs font-medium flex items-center gap-1">
                <Upload className="w-3.5 h-3.5" />
                <span>{t('uploadFile')}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
              </label>
              {coverUrl && (
                <button
                  type="button"
                  onClick={() => onChangeCoverUrl('')}
                  className="text-[10px] text-red-300 hover:text-red-200 underline mt-1"
                >
                  {t('removeImage')}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Text Fields (9 cols) */}
        <div className="md:col-span-9 flex flex-col justify-between gap-3">
          
          {/* Artist */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-neutral-400" />
              {t('artistLabel')}
            </label>
            <input
              type="text"
              value={artist || ''}
              onChange={(e) => onChangeArtist(e.target.value)}
              placeholder={t('artistPlaceholder')}
              className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Album */}
          <div>
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
              <Disc className="w-3.5 h-3.5 text-neutral-400" />
              {t('albumLabel')}
            </label>
            <input
              type="text"
              value={album || ''}
              onChange={(e) => onChangeAlbum(e.target.value)}
              placeholder={t('albumPlaceholder')}
              className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Year & Cover URL input */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {t('yearLabel')}
              </label>
              <input
                type="text"
                value={year || ''}
                onChange={(e) => onChangeYear(e.target.value)}
                placeholder={t('yearPlaceholder')}
                className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3.5 py-2 text-sm text-neutral-900 dark:text-white font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
                {t('directImageUrl')}
              </label>
              <input
                type="url"
                value={coverUrl ? (coverUrl.startsWith('data:') ? t('uploadedImageTag') : coverUrl) : ''}
                onChange={(e) => onChangeCoverUrl(e.target.value)}
                placeholder="https://.../cover.jpg"
                className="w-full bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3.5 py-2 text-xs text-neutral-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Tracklist Section */}
      <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
              {t('tracklistHeading')} ({tracks.length})
            </h4>
            <span className="text-[11px] text-neutral-400">
              {t('tracklistHint')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bulk Paste Toggle */}
            <button
              type="button"
              onClick={() => setIsBulkOpen(!isBulkOpen)}
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors flex items-center gap-1"
            >
              <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
              <span>{t('bulkPasteBtn')}</span>
            </button>
          </div>
        </div>

        {/* Bulk Paste Dialog Box */}
        {isBulkOpen && (
          <div className="mb-4 p-3 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-xl space-y-2">
            <p className="text-xs text-neutral-600 dark:text-neutral-300">
              {t('bulkPastePrompt')}
            </p>
            <textarea
              rows={5}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="01. One More Time&#10;02. Aerodynamic&#10;03. Digital Love&#10;04. Harder, Better, Faster, Stronger"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 text-xs text-neutral-900 dark:text-white font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBulkOpen(false)}
                className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-700"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleApplyBulkText}
                className="px-3.5 py-1 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{t('processTracksBtn')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tracks List Items */}
        <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
          {tracks.map((track, idx) => (
            <div
              key={track.id}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-neutral-50/80 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 group transition-all"
            >
              {/* Number */}
              <input
                type="text"
                value={track.number || ''}
                onChange={(e) => handleTrackChange(idx, 'number', e.target.value)}
                className="w-10 text-center font-mono text-xs font-semibold bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-1 py-1 text-neutral-700 dark:text-neutral-300"
              />

              {/* Title */}
              <input
                type="text"
                value={track.title || ''}
                onChange={(e) => handleTrackChange(idx, 'title', e.target.value)}
                className="flex-1 text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-2.5 py-1 text-neutral-900 dark:text-white"
                placeholder={t('trackTitlePlaceholder')}
              />

              {/* Duration */}
              <input
                type="text"
                value={track.duration || ''}
                onChange={(e) => handleTrackChange(idx, 'duration', e.target.value)}
                placeholder="3:45"
                className="w-14 text-center font-mono text-[11px] bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded px-1 py-1 text-neutral-500 dark:text-neutral-400"
              />

              {/* Reordering Up/Down */}
              <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === tracks.length - 1}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 disabled:opacity-20"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteTrack(idx)}
                  className="p-1 text-red-400 hover:text-red-600 transition-colors ml-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {tracks.length === 0 && (
            <p className="text-xs text-neutral-400 dark:text-neutral-500 py-3 text-center italic">
              {t('emptyTracklistMsg')}
            </p>
          )}
        </div>

        {/* Add single track bar */}
        <form onSubmit={handleAddTrack} className="mt-2.5 flex items-center gap-2">
          <input
            type="text"
            value={newTrackTitle}
            onChange={(e) => setNewTrackTitle(e.target.value)}
            placeholder={t('addNextTrackPlaceholder')}
            className="flex-1 bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={!newTrackTitle.trim()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 disabled:opacity-40 transition-all flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('addBtn')}</span>
          </button>
        </form>

      </div>

    </div>
  );
};
