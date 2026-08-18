import React, { useState, useEffect } from 'react';
import { metronomeEngine } from '../audio/soundEngine';
import { Volume2, VolumeX, Radio, X } from 'lucide-react';

interface TunerToneProps {
  isOpen: boolean;
  onClose: () => void;
}

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const INSTRUMENT_PRESETS = [
  {
    name: 'Diapasão A4 (440Hz)',
    notes: [{ note: 'A', octave: 4 }],
  },
  {
    name: 'Guitarra / Violão Padrão',
    notes: [
      { note: 'E', octave: 2 },
      { note: 'A', octave: 2 },
      { note: 'D', octave: 3 },
      { note: 'G', octave: 3 },
      { note: 'B', octave: 3 },
      { note: 'E', octave: 4 },
    ],
  },
  {
    name: 'Contrabaixo (4 cordas)',
    notes: [
      { note: 'E', octave: 1 },
      { note: 'A', octave: 1 },
      { note: 'D', octave: 2 },
      { note: 'G', octave: 2 },
    ],
  },
  {
    name: 'Ukulele',
    notes: [
      { note: 'G', octave: 4 },
      { note: 'C', octave: 4 },
      { note: 'E', octave: 4 },
      { note: 'A', octave: 4 },
    ],
  },
];

export const TunerTone: React.FC<TunerToneProps> = ({ isOpen, onClose }) => {
  const [selectedNote, setSelectedNote] = useState<string>('A');
  const [selectedOctave, setSelectedOctave] = useState<number>(4);
  const [baseFreq, setBaseFreq] = useState<number>(440); // 440, 432, 442
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Calculate note frequency: f = baseFreq * 2^((n - 69) / 12) where A4 is MIDI 69
  const getFrequency = (note: string, octave: number, a4Freq: number): number => {
    const noteIndex = NOTES.indexOf(note);
    const midiNumber = (octave + 1) * 12 + noteIndex;
    return a4Freq * Math.pow(2, (midiNumber - 69) / 12);
  };

  const currentFrequency = getFrequency(selectedNote, selectedOctave, baseFreq);

  const toggleTone = (note = selectedNote, octave = selectedOctave) => {
    if (isPlaying && note === selectedNote && octave === selectedOctave) {
      metronomeEngine.stopTunerTone();
      setIsPlaying(false);
    } else {
      const freq = getFrequency(note, octave, baseFreq);
      metronomeEngine.startTunerTone(freq, 'sine');
      setSelectedNote(note);
      setSelectedOctave(octave);
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      metronomeEngine.startTunerTone(currentFrequency, 'sine');
    }
  }, [baseFreq, selectedNote, selectedOctave]);

  useEffect(() => {
    if (!isOpen && isPlaying) {
      metronomeEngine.stopTunerTone();
      setIsPlaying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div
        id="tuner-modal-card"
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Tom de Referência / Afinação de Palco
            </h3>
          </div>
          <button
            onClick={() => {
              metronomeEngine.stopTunerTone();
              setIsPlaying(false);
              onClose();
            }}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Tone Display */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
            Nota Selecionada
          </span>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-5xl font-black font-mono text-cyan-400">
              {selectedNote}
            </span>
            <span className="text-2xl font-bold font-mono text-zinc-500">
              {selectedOctave}
            </span>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            {currentFrequency.toFixed(1)} Hz (Padrão A4 = {baseFreq} Hz)
          </span>

          <button
            onClick={() => toggleTone()}
            className={`mt-4 flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-150 shadow-md ${
              isPlaying
                ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                : 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isPlaying ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Silenciar Tom</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Tocar Som Contínuo</span>
              </>
            )}
          </button>
        </div>

        {/* Standard Tuning Frequency selector (440 vs 432) */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">Calibração A4:</span>
          <div className="flex items-center gap-1.5">
            {[432, 440, 442].map((hz) => (
              <button
                key={hz}
                onClick={() => setBaseFreq(hz)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs font-semibold transition-colors ${
                  baseFreq === hz
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {hz} Hz
              </button>
            ))}
          </div>
        </div>

        {/* Instrument Quick Tuning Presets */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2">
            Afinação por Instrumento
          </span>
          <div className="space-y-2">
            {INSTRUMENT_PRESETS.map((preset) => (
              <div
                key={preset.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800/80"
              >
                <span className="text-xs font-semibold text-zinc-300">
                  {preset.name}
                </span>
                <div className="flex items-center gap-1">
                  {preset.notes.map((n, idx) => {
                    const isCurrent =
                      isPlaying &&
                      selectedNote === n.note &&
                      selectedOctave === n.octave;
                    return (
                      <button
                        key={idx}
                        onClick={() => toggleTone(n.note, n.octave)}
                        className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
                          isCurrent
                            ? 'bg-cyan-400 text-zinc-950 scale-110 shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {n.note}
                        <sub className="text-[9px] -bottom-0.5">{n.octave}</sub>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Chromatic Notes Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400">
              Escala Cromática Completa
            </span>
            {/* Octave selector */}
            <div className="flex items-center gap-1">
              {[2, 3, 4, 5].map((oct) => (
                <button
                  key={oct}
                  onClick={() => setSelectedOctave(oct)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                    selectedOctave === oct
                      ? 'bg-cyan-500 text-zinc-950'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  Oitava {oct}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            {NOTES.map((note) => {
              const isSelected = selectedNote === note;
              return (
                <button
                  key={note}
                  onClick={() => {
                    setSelectedNote(note);
                    if (isPlaying) {
                      const freq = getFrequency(note, selectedOctave, baseFreq);
                      metronomeEngine.startTunerTone(freq, 'sine');
                    }
                  }}
                  className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                    isSelected
                      ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300'
                      : 'bg-zinc-950 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
