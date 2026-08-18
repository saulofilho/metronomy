import React from 'react';
import { AccentType, TimeSignature, VisualFlashMode } from '../types';
import { Volume2, Volume1, VolumeX, Sparkles } from 'lucide-react';

interface BeatIndicatorProps {
  timeSignature: TimeSignature;
  accents: AccentType[];
  currentBeat: number;
  currentSubdivision: number;
  subdivisionCount: number;
  isPlaying: boolean;
  isCountIn: boolean;
  countInRemaining: number;
  barNumber: number;
  flashMode: VisualFlashMode;
  onToggleAccent: (beatIndex: number) => void;
}

export const BeatIndicator: React.FC<BeatIndicatorProps> = ({
  timeSignature,
  accents,
  currentBeat,
  currentSubdivision,
  subdivisionCount,
  isPlaying,
  isCountIn,
  countInRemaining,
  barNumber,
  flashMode,
  onToggleAccent,
}) => {
  const isFlashActive =
    isPlaying &&
    flashMode !== 'off' &&
    currentBeat === 0 &&
    currentSubdivision === 0;

  const getAccentIcon = (type: AccentType) => {
    switch (type) {
      case 'accent':
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      case 'normal':
        return <Volume2 className="w-4 h-4 text-cyan-400" />;
      case 'soft':
        return <Volume1 className="w-4 h-4 text-zinc-400" />;
      case 'mute':
        return <VolumeX className="w-4 h-4 text-rose-500/80" />;
    }
  };

  const getAccentLabel = (type: AccentType) => {
    switch (type) {
      case 'accent':
        return 'Forte';
      case 'normal':
        return 'Médio';
      case 'soft':
        return 'Fraco';
      case 'mute':
        return 'Mudo';
    }
  };

  // Pendulum position from -1 to 1 based on current beat
  const pendulumFraction =
    timeSignature.beats > 1
      ? (currentBeat / (timeSignature.beats - 1)) * 2 - 1
      : 0;

  return (
    <div
      id="beat-indicator-container"
      className={`relative w-full rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 backdrop-blur-md transition-colors duration-150 overflow-hidden ${
        isFlashActive && flashMode === 'indicator'
          ? 'ring-2 ring-emerald-400/80 bg-zinc-900'
          : ''
      }`}
    >
      {/* Visual Flash effect overlay */}
      {isFlashActive && flashMode === 'bar' && (
        <div
          id="flash-bar-overlay"
          className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 animate-pulse pointer-events-none"
        />
      )}

      {/* Count-in Banner */}
      {isPlaying && isCountIn && (
        <div
          id="count-in-banner"
          className="mb-4 py-2 px-4 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-bold tracking-wider uppercase text-amber-300">
              Contagem de Entrada
            </span>
          </div>
          <div className="text-sm font-mono font-bold text-amber-200">
            Falta {countInRemaining} {countInRemaining === 1 ? 'compasso' : 'compassos'}
          </div>
        </div>
      )}

      {/* Header Info: Bar & Sub-pulses */}
      <div className="flex items-center justify-between mb-4 text-xs font-mono text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-semibold">
            Compasso: {isPlaying ? barNumber + 1 : '—'}
          </span>
          <span className="text-zinc-500">
            {timeSignature.beats}/{timeSignature.noteValue}
          </span>
        </div>
        <div className="text-zinc-400 text-xs">
          Toque no tempo para alternar acento
        </div>
      </div>

      {/* Main Beat Blocks Display */}
      <div
        id="beat-blocks-grid"
        className="grid gap-2.5 sm:gap-3.5 mb-4"
        style={{
          gridTemplateColumns: `repeat(${timeSignature.beats}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: timeSignature.beats }).map((_, index) => {
          const isActive = isPlaying && currentBeat === index;
          const accentType = accents[index] || 'normal';
          const isAccent = accentType === 'accent';
          const isMute = accentType === 'mute';
          const isSoft = accentType === 'soft';

          return (
            <button
              key={index}
              id={`beat-button-${index + 1}`}
              onClick={() => onToggleAccent(index)}
              title={`Tempo ${index + 1}: ${getAccentLabel(accentType)} (Clique para alterar)`}
              className={`group relative flex flex-col items-center justify-between p-2.5 sm:p-3.5 rounded-xl border transition-all duration-100 select-none ${
                isActive
                  ? isAccent
                    ? 'bg-emerald-500/25 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.35)] scale-105 z-10'
                    : isMute
                    ? 'bg-rose-950/40 border-rose-600/60 scale-100'
                    : isSoft
                    ? 'bg-zinc-800 border-zinc-500 scale-102'
                    : 'bg-cyan-500/20 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.3)] scale-102 z-10'
                  : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              {/* Beat Number */}
              <span
                className={`text-base sm:text-xl font-bold font-mono transition-colors ${
                  isActive
                    ? isAccent
                      ? 'text-emerald-300'
                      : isMute
                      ? 'text-rose-400'
                      : 'text-cyan-300'
                    : 'text-zinc-400 group-hover:text-zinc-200'
                }`}
              >
                {index + 1}
              </span>

              {/* Accent Icon & Indicator Pill */}
              <div className="my-1 sm:my-2">{getAccentIcon(accentType)}</div>

              {/* Sub-label */}
              <span
                className={`text-[10px] sm:text-xs font-medium tracking-tight uppercase ${
                  isAccent
                    ? 'text-emerald-400/90 font-semibold'
                    : isMute
                    ? 'text-rose-400/80'
                    : 'text-zinc-500'
                }`}
              >
                {getAccentLabel(accentType)}
              </span>

              {/* Active Pulse Glow Bar at Bottom */}
              <div
                className={`w-full h-1 mt-1.5 rounded-full transition-all duration-75 ${
                  isActive
                    ? isAccent
                      ? 'bg-emerald-400'
                      : isMute
                      ? 'bg-rose-500'
                      : isSoft
                      ? 'bg-zinc-400'
                      : 'bg-cyan-400'
                    : 'bg-transparent group-hover:bg-zinc-800'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Subdivision Sub-ticks bar */}
      {subdivisionCount > 1 && (
        <div
          id="subdivisions-ticker"
          className="flex items-center justify-between px-2 py-2 rounded-lg bg-zinc-950/80 border border-zinc-800/50 mb-3"
        >
          <span className="text-[11px] font-mono text-zinc-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
            Subdivisão ({subdivisionCount}x):
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: subdivisionCount }).map((_, sIdx) => {
              const isSubActive =
                isPlaying && currentSubdivision === sIdx;
              return (
                <span
                  key={sIdx}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-75 ${
                    isSubActive
                      ? sIdx === 0
                        ? 'bg-emerald-400 scale-125 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                        : 'bg-cyan-400 scale-110 shadow-[0_0_6px_rgba(6,182,212,0.7)]'
                      : 'bg-zinc-800'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Pendulum visual sweep bar */}
      <div className="relative w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
        <div
          id="pendulum-dot"
          className={`absolute top-0 bottom-0 w-8 -ml-4 rounded-full transition-all duration-100 ease-out ${
            isPlaying
              ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.8)]'
              : 'bg-zinc-700'
          }`}
          style={{
            left: `${((pendulumFraction + 1) / 2) * 100}%`,
          }}
        />
      </div>
    </div>
  );
};
