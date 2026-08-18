import React from 'react';
import {
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Music,
  Activity,
  FileText,
  Volume2,
} from 'lucide-react';
import { AccentType, Setlist, Song, TimeSignature, VisualFlashMode } from '../types';

interface StageModeProps {
  isPlaying: boolean;
  bpm: number;
  timeSignature: TimeSignature;
  accents: AccentType[];
  currentBeat: number;
  currentSubdivision: number;
  subdivisionCount: number;
  isCountIn: boolean;
  countInRemaining: number;
  barNumber: number;
  flashMode: VisualFlashMode;
  currentSong: Song | null;
  currentSetlist: Setlist | null;
  onTogglePlay: () => void;
  onPrevSong: () => void;
  onNextSong: () => void;
  onExitStageMode: () => void;
  onTapTempo: () => void;
}

export const StageMode: React.FC<StageModeProps> = ({
  isPlaying,
  bpm,
  timeSignature,
  accents,
  currentBeat,
  currentSubdivision,
  subdivisionCount,
  isCountIn,
  countInRemaining,
  barNumber,
  flashMode,
  currentSong,
  currentSetlist,
  onTogglePlay,
  onPrevSong,
  onNextSong,
  onExitStageMode,
  onTapTempo,
}) => {
  const isFlashActive =
    isPlaying &&
    flashMode !== 'off' &&
    currentBeat === 0 &&
    currentSubdivision === 0;

  const currentSongIndex = currentSetlist?.songs.findIndex(
    (s) => s.id === currentSong?.id
  ) ?? -1;

  return (
    <div
      id="stage-mode-fullscreen"
      className={`fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between p-4 sm:p-8 select-none transition-colors duration-75 overflow-hidden ${
        isFlashActive && flashMode === 'screen'
          ? 'bg-emerald-950/90'
          : isFlashActive && flashMode === 'bar'
          ? 'ring-8 ring-cyan-400'
          : ''
      }`}
    >
      {/* Top Bar: Setlist context & Close Stage Mode */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Modo Palco Ativo
          </div>
          {currentSetlist && (
            <span className="text-zinc-400 text-sm font-medium hidden sm:inline">
              Repertório: <strong className="text-zinc-200">{currentSetlist.name}</strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            id="stage-tap-tempo"
            onClick={onTapTempo}
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-cyan-500 active:text-zinc-950 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>TAP (T)</span>
          </button>

          <button
            id="exit-stage-mode-btn"
            onClick={onExitStageMode}
            className="px-4 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Sair do Modo Palco (ESC)</span>
          </button>
        </div>
      </div>

      {/* Main Center Stage Info */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        {/* Count-in Banner on Stage */}
        {isPlaying && isCountIn && (
          <div className="w-full max-w-xl py-3 px-6 rounded-2xl bg-amber-500/25 border-2 border-amber-400 text-center mb-4 animate-bounce">
            <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wider uppercase">
              ⚠️ CONTAGEM: {countInRemaining} COMPASSO RESTANTE
            </div>
          </div>
        )}

        {/* Current Song Title & Key Banner */}
        {currentSong ? (
          <div className="text-center mb-4 w-full max-w-3xl">
            <div className="inline-flex items-center gap-2 mb-1">
              <span className="text-sm font-mono text-cyan-400 font-bold">
                MÚSICA {currentSongIndex + 1} DE {currentSetlist?.songs.length}
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-zinc-100 tracking-tight leading-tight truncate px-2">
              {currentSong.title}
            </h1>
            <div className="flex items-center justify-center gap-4 mt-2">
              {currentSong.artist && (
                <span className="text-zinc-400 text-lg font-medium">
                  {currentSong.artist}
                </span>
              )}
              {currentSong.key && (
                <span className="px-3 py-1 rounded-xl text-sm sm:text-base font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Tom: {currentSong.key}
                </span>
              )}
            </div>

            {currentSong.notes && (
              <div className="mt-3 inline-block max-w-xl px-4 py-2 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs sm:text-sm text-zinc-300 italic">
                <FileText className="w-4 h-4 inline mr-1.5 text-zinc-400" />
                {currentSong.notes}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-400">
              Metrônomo Livre
            </h1>
          </div>
        )}

        {/* Gigantic BPM & Time Signature Numbers */}
        <div className="flex items-baseline justify-center gap-4 my-2">
          <span
            className={`text-8xl sm:text-9xl md:text-[140px] font-black font-mono tracking-tighter leading-none transition-colors ${
              isPlaying ? 'text-cyan-400' : 'text-zinc-400'
            }`}
          >
            {bpm}
          </span>
          <div className="flex flex-col items-start font-mono">
            <span className="text-2xl sm:text-3xl font-bold text-zinc-500">
              BPM
            </span>
            <span className="text-xl sm:text-2xl font-bold text-cyan-300/80 mt-1">
              {timeSignature.beats}/{timeSignature.noteValue}
            </span>
          </div>
        </div>

        {/* Big High-Visibility Stage Beat Boxes */}
        <div
          className="w-full max-w-4xl grid gap-3 sm:gap-6 my-4 px-2"
          style={{
            gridTemplateColumns: `repeat(${timeSignature.beats}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: timeSignature.beats }).map((_, index) => {
            const isActive = isPlaying && currentBeat === index;
            const accentType = accents[index] || 'normal';
            const isAccent = accentType === 'accent';
            const isMute = accentType === 'mute';

            return (
              <div
                key={index}
                className={`flex flex-col items-center justify-center p-4 sm:p-8 rounded-2xl sm:rounded-3xl border-2 transition-all duration-75 select-none ${
                  isActive
                    ? isAccent
                      ? 'bg-emerald-400 border-white text-zinc-950 scale-110 shadow-[0_0_50px_rgba(16,185,129,0.9)] z-10'
                      : isMute
                      ? 'bg-rose-950 border-rose-600 text-rose-300'
                      : 'bg-cyan-400 border-white text-zinc-950 scale-105 shadow-[0_0_40px_rgba(6,182,212,0.8)] z-10'
                    : 'bg-zinc-900/90 border-zinc-800 text-zinc-500'
                }`}
              >
                <span className="text-3xl sm:text-5xl md:text-6xl font-black font-mono">
                  {index + 1}
                </span>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-wider mt-1 opacity-80">
                  {isAccent ? 'Forte' : isMute ? 'Mudo' : 'Tempo'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Compasso / Bar Counter for Stage */}
        <div className="text-zinc-400 font-mono text-sm sm:text-base mt-1">
          Compasso: <strong className="text-zinc-200">{isPlaying ? barNumber + 1 : '—'}</strong>
        </div>
      </div>

      {/* Bottom Controls Bar: Big Footswitch-like touch buttons */}
      <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-4 border-t border-zinc-800/80 max-w-4xl mx-auto w-full">
        {/* Prev Song */}
        <button
          id="stage-prev-song-btn"
          onClick={onPrevSong}
          disabled={!currentSetlist || currentSongIndex <= 0}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 sm:py-5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-200 border border-zinc-700 font-bold transition-transform active:scale-95 shadow-lg"
        >
          <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400" />
          <span className="text-sm sm:text-base">Música Anterior</span>
        </button>

        {/* Giant Play / Stop Button */}
        <button
          id="stage-play-stop-btn"
          onClick={onTogglePlay}
          className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-4 sm:py-5 px-4 rounded-2xl font-black text-base sm:text-xl transition-all active:scale-95 shadow-2xl ${
            isPlaying
              ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950 shadow-[0_0_30px_rgba(244,63,94,0.4)]'
              : 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
          }`}
        >
          {isPlaying ? (
            <>
              <Square className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              <span>PARAR (Espaço)</span>
            </>
          ) : (
            <>
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
              <span>INICIAR (Espaço)</span>
            </>
          )}
        </button>

        {/* Next Song */}
        <button
          id="stage-next-song-btn"
          onClick={onNextSong}
          disabled={
            !currentSetlist ||
            currentSongIndex >= currentSetlist.songs.length - 1
          }
          className="flex flex-col sm:flex-row items-center justify-center gap-2 py-4 sm:py-5 px-4 rounded-2xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none text-zinc-200 border border-zinc-700 font-bold transition-transform active:scale-95 shadow-lg"
        >
          <span className="text-sm sm:text-base">Próxima Música</span>
          <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
