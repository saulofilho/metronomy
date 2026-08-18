export type AccentType = 'accent' | 'normal' | 'soft' | 'mute';

export type SoundType = 'digital' | 'woodblock' | 'sticks' | 'cowbell' | 'electronic';

export type SubdivisionType = 'quarter' | 'eighth' | 'triplet' | 'sixteenth' | 'swing' | 'clave_3_2';

export interface TimeSignature {
  beats: number; // Numerator (e.g., 2, 3, 4, 5, 6, 7, 9, 12)
  noteValue: number; // Denominator (e.g., 4, 8)
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  bpm: number;
  timeSignature: TimeSignature;
  subdivision: SubdivisionType;
  accents?: AccentType[]; // Custom accents per beat
  key?: string; // e.g. "Em", "G maior", "Bb"
  countInBars?: number; // 0, 1, 2 bars count-in
  notes?: string; // e.g. "Começar com violão", "Convenção compasso 8"
  soundPreset?: SoundType;
}

export interface Setlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  updatedAt: number;
}

export type VisualFlashMode = 'screen' | 'indicator' | 'bar' | 'off';

export interface SpeedTrainerConfig {
  enabled: boolean;
  startBpm: number;
  targetBpm: number;
  bpmStep: number;
  barsInterval: number;
  currentBars: number;
}

export interface MuteTrainerConfig {
  enabled: boolean;
  barsAudible: number;
  barsMuted: number;
  currentBar: number;
  isMutedPhase: boolean;
}

export interface CountInConfig {
  enabled: boolean;
  bars: number;
  remainingBars: number;
  currentBeat: number;
  isActive: boolean;
}

export interface MetronomeAudioSettings {
  sound: SoundType;
  masterVolume: number; // 0 - 1
  accentVolume: number; // 0 - 1
  subdivisionVolume: number; // 0 - 1
  pitchShift: number; // -12 to +12 semitones
  flashMode: VisualFlashMode;
}
