import React, { useState, useRef, useEffect } from 'react';
import { Plus, Minus, RotateCcw, Activity } from 'lucide-react';

interface TempoControlProps {
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  isPlaying: boolean;
}

const TEMPO_MARKINGS = [
  { name: 'Largo', range: [40, 60], center: 50 },
  { name: 'Adagio', range: [66, 76], center: 72 },
  { name: 'Andante', range: [76, 108], center: 92 },
  { name: 'Moderato', range: [108, 120], center: 114 },
  { name: 'Allegro', range: [120, 156], center: 132 },
  { name: 'Vivace', range: [156, 176], center: 160 },
  { name: 'Presto', range: [168, 200], center: 184 },
  { name: 'Prestissimo', range: [200, 300], center: 220 },
];

export const TempoControl: React.FC<TempoControlProps> = ({
  bpm,
  onBpmChange,
  isPlaying,
}) => {
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const [tapFlash, setTapFlash] = useState(false);
  const tapTimeoutRef = useRef<number | null>(null);

  // Identify matching Italian tempo name
  const currentTempoMarking = TEMPO_MARKINGS.find(
    (t) => bpm >= t.range[0] && bpm <= t.range[1]
  );

  const handleTapTempo = () => {
    const now = performance.now();
    setTapFlash(true);
    setTimeout(() => setTapFlash(false), 120);

    if (tapTimeoutRef.current) {
      window.clearTimeout(tapTimeoutRef.current);
    }

    setTapTimes((prev) => {
      // Filter out taps older than 2.5 seconds
      const recentTaps = [...prev.filter((t) => now - t < 2500), now];

      if (recentTaps.length >= 2) {
        // Calculate intervals
        const intervals: number[] = [];
        for (let i = 1; i < recentTaps.length; i++) {
          intervals.push(recentTaps[i] - recentTaps[i - 1]);
        }
        // Average interval in ms
        const avgInterval =
          intervals.reduce((acc, curr) => acc + curr, 0) / intervals.length;
        const calculatedBpm = Math.round(60000 / avgInterval);

        if (calculatedBpm >= 30 && calculatedBpm <= 320) {
          onBpmChange(calculatedBpm);
        }
      }
      return recentTaps;
    });

    // Reset tap buffer after 2.5 seconds of silence
    tapTimeoutRef.current = window.setTimeout(() => {
      setTapTimes([]);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (tapTimeoutRef.current) {
        window.clearTimeout(tapTimeoutRef.current);
      }
    };
  }, []);

  const adjustBpm = (delta: number) => {
    const next = Math.max(20, Math.min(320, bpm + delta));
    onBpmChange(next);
  };

  const multiplyBpm = (factor: number) => {
    const next = Math.max(20, Math.min(320, Math.round(bpm * factor)));
    onBpmChange(next);
  };

  return (
    <div
      id="tempo-control-card"
      className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 backdrop-blur-md"
    >
      {/* Top row: Italian marking badge + quick multipliers */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Andamento (BPM)
          </span>
          {currentTempoMarking && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/70 border border-cyan-800/60 text-cyan-300">
              {currentTempoMarking.name}
            </span>
          )}
        </div>

        {/* Half / Double time buttons */}
        <div className="flex items-center gap-1.5">
          <button
            id="half-time-btn"
            onClick={() => multiplyBpm(0.5)}
            title="Dividir andamento pela metade (÷2)"
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-semibold transition-colors"
          >
            ÷2
          </button>
          <button
            id="double-time-btn"
            onClick={() => multiplyBpm(2)}
            title="Dobrar andamento (×2)"
            className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono font-semibold transition-colors"
          >
            ×2
          </button>
        </div>
      </div>

      {/* Main BPM Display & Fine Adjustments */}
      <div className="flex items-center justify-between gap-3 mb-5">
        {/* Step Decrement Buttons */}
        <div className="flex flex-col gap-2">
          <button
            id="bpm-minus-5"
            onClick={() => adjustBpm(-5)}
            className="w-12 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 font-mono font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
            title="Diminuir 5 BPM"
          >
            -5
          </button>
          <button
            id="bpm-minus-1"
            onClick={() => adjustBpm(-1)}
            className="w-12 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 font-mono font-bold text-base flex items-center justify-center transition-colors shadow-sm"
            title="Diminuir 1 BPM"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Center Gigantic BPM Display */}
        <div className="flex-1 flex flex-col items-center justify-center py-2">
          <div className="relative flex items-baseline justify-center">
            <span
              id="bpm-display-value"
              className={`text-6xl sm:text-7xl font-extrabold font-mono tracking-tight transition-colors ${
                isPlaying ? 'text-cyan-400' : 'text-zinc-100'
              }`}
            >
              {bpm}
            </span>
            <span className="ml-2 text-sm font-semibold tracking-wider uppercase text-zinc-500 font-mono">
              BPM
            </span>
          </div>
          <span className="text-xs text-zinc-500 mt-1">
            {60000 / bpm < 1000 ? `${(60000 / bpm).toFixed(0)} ms/pulso` : `${(60 / bpm).toFixed(2)} s/pulso`}
          </span>
        </div>

        {/* Step Increment Buttons */}
        <div className="flex flex-col gap-2">
          <button
            id="bpm-plus-5"
            onClick={() => adjustBpm(5)}
            className="w-12 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 font-mono font-bold text-sm flex items-center justify-center transition-colors shadow-sm"
            title="Aumentar 5 BPM"
          >
            +5
          </button>
          <button
            id="bpm-plus-1"
            onClick={() => adjustBpm(1)}
            className="w-12 h-10 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 font-mono font-bold text-base flex items-center justify-center transition-colors shadow-sm"
            title="Aumentar 1 BPM"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BPM Slider */}
      <div className="mb-4">
        <div className="relative flex items-center">
          <input
            id="bpm-range-slider"
            type="range"
            min="30"
            max="300"
            step="1"
            value={bpm}
            onChange={(e) => onBpmChange(Number(e.target.value))}
            className="w-full h-3 bg-zinc-950 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-zinc-500 mt-1 px-1">
          <span>30 (Largo)</span>
          <span>120 (Moderato)</span>
          <span>300 (Prestissimo)</span>
        </div>
      </div>

      {/* Tap Tempo Button & Quick Presets Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-zinc-800/60">
        {/* Tap Tempo Button */}
        <button
          id="tap-tempo-btn"
          onClick={handleTapTempo}
          className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-100 select-none shadow-md ${
            tapFlash
              ? 'bg-cyan-400 text-zinc-950 scale-98 ring-4 ring-cyan-300/40'
              : 'bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-zinc-200 border border-zinc-700/60'
          }`}
        >
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>TAP TEMPO</span>
          {tapTimes.length > 1 && (
            <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-zinc-900/60 text-zinc-300 font-mono">
              {tapTimes.length} toques
            </span>
          )}
        </button>

        {/* Quick Common Tempo Dropdown / Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TEMPO_MARKINGS.slice(1, 6).map((m) => (
            <button
              key={m.name}
              id={`quick-tempo-${m.name.toLowerCase()}`}
              onClick={() => onBpmChange(m.center)}
              title={`${m.name} (${m.range[0]}-${m.range[1]} BPM)`}
              className={`flex-1 py-2 px-1.5 rounded-lg text-[11px] font-medium transition-colors text-center truncate ${
                bpm >= m.range[0] && bpm <= m.range[1]
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
