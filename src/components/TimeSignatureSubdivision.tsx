import React, { useState } from 'react';
import { SubdivisionType, TimeSignature } from '../types';
import { Music, Sliders, ChevronDown } from 'lucide-react';

interface TimeSignatureSubdivisionProps {
  timeSignature: TimeSignature;
  onTimeSignatureChange: (ts: TimeSignature) => void;
  subdivision: SubdivisionType;
  onSubdivisionChange: (sub: SubdivisionType) => void;
}

const COMMON_SIGNATURES: TimeSignature[] = [
  { beats: 2, noteValue: 4 },
  { beats: 3, noteValue: 4 },
  { beats: 4, noteValue: 4 },
  { beats: 5, noteValue: 4 },
  { beats: 6, noteValue: 8 },
  { beats: 7, noteValue: 8 },
  { beats: 9, noteValue: 8 },
  { beats: 12, noteValue: 8 },
];

const SUBDIVISIONS: {
  id: SubdivisionType;
  label: string;
  namePt: string;
  symbol: string;
  noteCount: number;
}[] = [
  { id: 'quarter', label: '1/1', namePt: 'Semínima (1)', symbol: '♩', noteCount: 1 },
  { id: 'eighth', label: '1/2', namePt: 'Colcheia (2)', symbol: '♫', noteCount: 2 },
  { id: 'triplet', label: '1/3', namePt: 'Tercina (3)', symbol: '3', noteCount: 3 },
  { id: 'sixteenth', label: '1/4', namePt: 'Semicolcheia (4)', symbol: '♬', noteCount: 4 },
  { id: 'swing', label: 'Swing', namePt: 'Shuffle/Swing', symbol: '🎷', noteCount: 2 },
  { id: 'clave_3_2', label: 'Clave', namePt: 'Clave 3:2', symbol: '🪘', noteCount: 4 },
];

export const TimeSignatureSubdivision: React.FC<TimeSignatureSubdivisionProps> = ({
  timeSignature,
  onTimeSignatureChange,
  subdivision,
  onSubdivisionChange,
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customBeats, setCustomBeats] = useState(timeSignature.beats);
  const [customNoteValue, setCustomNoteValue] = useState(timeSignature.noteValue);

  const isCurrentTs = (ts: TimeSignature) =>
    ts.beats === timeSignature.beats && ts.noteValue === timeSignature.noteValue;

  const handleApplyCustom = () => {
    onTimeSignatureChange({
      beats: Math.max(1, Math.min(16, customBeats)),
      noteValue: customNoteValue,
    });
    setShowCustomModal(false);
  };

  return (
    <div
      id="time-signature-subdivision-card"
      className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 backdrop-blur-md"
    >
      {/* Time Signatures Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
            <Music className="w-3.5 h-3.5 text-cyan-400" />
            Fórmula de Compasso
          </span>
          <button
            id="custom-time-sig-toggle"
            onClick={() => setShowCustomModal(!showCustomModal)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            {showCustomModal ? 'Fechar' : 'Personalizar...'}
          </button>
        </div>

        {/* Custom Form or Preset Grid */}
        {showCustomModal ? (
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Tempos por compasso (1-16)
                </label>
                <input
                  id="custom-beats-input"
                  type="number"
                  min="1"
                  max="16"
                  value={customBeats}
                  onChange={(e) => setCustomBeats(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex-1">
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Unidade de tempo
                </label>
                <select
                  id="custom-note-value-select"
                  value={customNoteValue}
                  onChange={(e) => setCustomNoteValue(Number(e.target.value))}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
                >
                  <option value={2}>2 (Mínima)</option>
                  <option value={4}>4 (Semínima)</option>
                  <option value={8}>8 (Colcheia)</option>
                  <option value={16}>16 (Semicolcheia)</option>
                </select>
              </div>
            </div>
            <button
              id="apply-custom-ts-btn"
              onClick={handleApplyCustom}
              className="w-full py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-colors"
            >
              Aplicar Compasso {customBeats}/{customNoteValue}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {COMMON_SIGNATURES.map((ts) => {
              const active = isCurrentTs(ts);
              return (
                <button
                  key={`${ts.beats}/${ts.noteValue}`}
                  id={`ts-button-${ts.beats}-${ts.noteValue}`}
                  onClick={() => onTimeSignatureChange(ts)}
                  className={`py-2 px-2 rounded-xl text-xs font-mono font-bold transition-all ${
                    active
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800/80 hover:bg-zinc-800'
                  }`}
                >
                  {ts.beats}/{ts.noteValue}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Subdivisions Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            Subdivisão Rítmica
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            {SUBDIVISIONS.find((s) => s.id === subdivision)?.namePt}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SUBDIVISIONS.map((sub) => {
            const active = subdivision === sub.id;
            return (
              <button
                key={sub.id}
                id={`subdivision-btn-${sub.id}`}
                onClick={() => onSubdivisionChange(sub.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  active
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                    : 'bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border-zinc-800/80 hover:bg-zinc-800'
                }`}
              >
                <span className="text-base mb-0.5">{sub.symbol}</span>
                <span className="text-[11px] font-semibold tracking-tight">
                  {sub.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
