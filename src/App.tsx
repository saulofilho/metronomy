import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  AccentType,
  MetronomeAudioSettings,
  MuteTrainerConfig,
  Setlist,
  Song,
  SpeedTrainerConfig,
  SubdivisionType,
  TimeSignature,
} from './types';
import { metronomeEngine, BeatEvent } from './audio/soundEngine';
import { DEFAULT_SETLISTS } from './data/defaultSetlists';
import { BeatIndicator } from './components/BeatIndicator';
import { TempoControl } from './components/TempoControl';
import { TimeSignatureSubdivision } from './components/TimeSignatureSubdivision';
import { SetlistManager } from './components/SetlistManager';
import { StageMode } from './components/StageMode';
import { PracticeTools } from './components/PracticeTools';
import { TunerTone } from './components/TunerTone';
import { SoundSettingsModal } from './components/SoundSettingsModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import {
  Play,
  Square,
  Maximize2,
  Sliders,
  Radio,
  Keyboard,
  Volume2,
  VolumeX,
  ListMusic,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

const STORAGE_KEY_SETLISTS = 'metronomo_pro_setlists_v1';
const STORAGE_KEY_SETTINGS = 'metronomo_pro_settings_v1';

export default function App() {
  // Main metronome state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(120);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({
    beats: 4,
    noteValue: 4,
  });
  const [subdivision, setSubdivision] = useState<SubdivisionType>('quarter');
  const [accents, setAccents] = useState<AccentType[]>([
    'accent',
    'normal',
    'normal',
    'normal',
  ]);

  // Real-time audio sync state
  const [currentBeat, setCurrentBeat] = useState<number>(0);
  const [currentSubdivision, setCurrentSubdivision] = useState<number>(0);
  const [barNumber, setBarNumber] = useState<number>(0);
  const [isCountIn, setIsCountIn] = useState<boolean>(false);
  const [countInRemaining, setCountInRemaining] = useState<number>(0);

  // Settings & Setlists
  const [setlists, setSetlists] = useState<Setlist[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETLISTS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_SETLISTS;
  });

  const [activeSetlistId, setActiveSetlistId] = useState<string>(
    DEFAULT_SETLISTS[0].id
  );
  const [activeSongId, setActiveSongId] = useState<string | null>(null);

  const [audioSettings, setAudioSettings] = useState<MetronomeAudioSettings>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
        if (saved) return JSON.parse(saved);
      } catch {}
      return {
        sound: 'woodblock',
        masterVolume: 0.85,
        accentVolume: 1.0,
        subdivisionVolume: 0.5,
        pitchShift: 0,
        flashMode: 'bar',
      };
    }
  );

  // Training tools state
  const [speedTrainer, setSpeedTrainer] = useState<SpeedTrainerConfig>({
    enabled: false,
    startBpm: 100,
    targetBpm: 150,
    bpmStep: 2,
    barsInterval: 4,
    currentBars: 0,
  });

  const [muteTrainer, setMuteTrainer] = useState<MuteTrainerConfig>({
    enabled: false,
    barsAudible: 4,
    barsMuted: 1,
    currentBar: 0,
    isMutedPhase: false,
  });

  const [sessionSeconds, setSessionSeconds] = useState<number>(0);

  // UI Modals & Views
  const [stageModeOpen, setStageModeOpen] = useState<boolean>(false);
  const [tunerOpen, setTunerOpen] = useState<boolean>(false);
  const [soundModalOpen, setSoundModalOpen] = useState<boolean>(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [activeViewTab, setActiveViewTab] = useState<'main' | 'setlist' | 'practice'>('main');

  // Timer reference for elapsed session
  const timerIntervalRef = useRef<number | null>(null);

  // Get current active song & setlist
  const currentSetlist =
    setlists.find((s) => s.id === activeSetlistId) || setlists[0];
  const currentSong =
    currentSetlist?.songs.find((s) => s.id === activeSongId) || null;

  // Persist setlists & settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETLISTS, JSON.stringify(setlists));
    } catch {}
  }, [setlists]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(audioSettings));
    } catch {}
  }, [audioSettings]);

  // Sync engine settings
  useEffect(() => {
    metronomeEngine.setBpm(bpm);
  }, [bpm]);

  useEffect(() => {
    metronomeEngine.setTimeSignature(timeSignature);
  }, [timeSignature]);

  useEffect(() => {
    metronomeEngine.setSubdivision(subdivision);
  }, [subdivision]);

  useEffect(() => {
    metronomeEngine.setAccents(accents);
  }, [accents]);

  useEffect(() => {
    metronomeEngine.setSound(audioSettings.sound);
    metronomeEngine.setVolumes(
      audioSettings.masterVolume,
      audioSettings.accentVolume,
      audioSettings.subdivisionVolume
    );
    metronomeEngine.setPitchShift(audioSettings.pitchShift);
  }, [audioSettings]);

  useEffect(() => {
    metronomeEngine.setMuteTrainer(
      muteTrainer.enabled,
      muteTrainer.barsAudible,
      muteTrainer.barsMuted
    );
  }, [muteTrainer]);

  useEffect(() => {
    metronomeEngine.setSpeedTrainer(
      speedTrainer.enabled,
      speedTrainer.targetBpm,
      speedTrainer.bpmStep,
      speedTrainer.barsInterval,
      (newBpm) => {
        setBpm(newBpm);
      }
    );
  }, [speedTrainer]);

  // Subscribe to audio engine tick callback
  useEffect(() => {
    const unsubscribe = metronomeEngine.subscribeBeat((e: BeatEvent) => {
      setCurrentBeat(e.beatNumber);
      setCurrentSubdivision(e.subdivisionIndex);
      setBarNumber(e.barNumber);
      setIsCountIn(e.isCountIn);
      setCountInRemaining(e.countInBarRemaining);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Session time counter
  useEffect(() => {
    if (isPlaying) {
      timerIntervalRef.current = window.setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // Handle Play / Stop
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      metronomeEngine.stop();
      setIsPlaying(false);
      setIsCountIn(false);
    } else {
      // Calculate count-in if song or practice requested
      const countIn = currentSong?.countInBars ?? 0;
      metronomeEngine.start(countIn);
      setIsPlaying(true);
    }
  }, [isPlaying, currentSong]);

  // Handle BPM Changes
  const handleBpmChange = useCallback((newBpm: number) => {
    const clamped = Math.max(20, Math.min(320, newBpm));
    setBpm(clamped);
    metronomeEngine.setBpm(clamped);
  }, []);

  // Handle Time Signature Changes
  const handleTimeSignatureChange = useCallback((ts: TimeSignature) => {
    setTimeSignature(ts);
    metronomeEngine.setTimeSignature(ts);

    // Update accents array
    const newAccents: AccentType[] = [];
    for (let i = 0; i < ts.beats; i++) {
      if (i === 0) newAccents.push('accent');
      else if (ts.beats === 6 && i === 3) newAccents.push('accent');
      else if (ts.beats === 9 && (i === 3 || i === 6)) newAccents.push('accent');
      else if (ts.beats === 12 && (i === 3 || i === 6 || i === 9))
        newAccents.push('accent');
      else newAccents.push('normal');
    }
    setAccents(newAccents);
  }, []);

  // Handle Accent Cycler
  const handleToggleAccent = useCallback((index: number) => {
    setAccents((prev) => {
      const next = [...prev];
      const current = next[index] || 'normal';
      let updated: AccentType = 'normal';
      if (current === 'accent') updated = 'normal';
      else if (current === 'normal') updated = 'soft';
      else if (current === 'soft') updated = 'mute';
      else if (current === 'mute') updated = 'accent';
      next[index] = updated;
      metronomeEngine.setAccents(next);
      return next;
    });
  }, []);

  // Handle Song Selection
  const handleSelectSong = useCallback(
    (song: Song) => {
      setActiveSongId(song.id);
      handleBpmChange(song.bpm);
      handleTimeSignatureChange(song.timeSignature);
      setSubdivision(song.subdivision || 'quarter');

      if (song.accents && song.accents.length === song.timeSignature.beats) {
        setAccents(song.accents);
        metronomeEngine.setAccents(song.accents);
      }

      if (song.soundPreset) {
        setAudioSettings((prev) => ({ ...prev, sound: song.soundPreset! }));
        metronomeEngine.setSound(song.soundPreset);
      }

      // If already playing, restart seamlessly with this song's count-in
      if (isPlaying) {
        metronomeEngine.stop();
        metronomeEngine.start(song.countInBars ?? 0);
      }
    },
    [isPlaying, handleBpmChange, handleTimeSignatureChange]
  );

  // Next / Prev Song in Setlist
  const handleNextSong = useCallback(() => {
    if (!currentSetlist || currentSetlist.songs.length === 0) return;
    const currentIndex = currentSetlist.songs.findIndex(
      (s) => s.id === activeSongId
    );
    if (currentIndex < currentSetlist.songs.length - 1) {
      handleSelectSong(currentSetlist.songs[currentIndex + 1]);
    }
  }, [currentSetlist, activeSongId, handleSelectSong]);

  const handlePrevSong = useCallback(() => {
    if (!currentSetlist || currentSetlist.songs.length === 0) return;
    const currentIndex = currentSetlist.songs.findIndex(
      (s) => s.id === activeSongId
    );
    if (currentIndex > 0) {
      handleSelectSong(currentSetlist.songs[currentIndex - 1]);
    }
  }, [currentSetlist, activeSongId, handleSelectSong]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing inside an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        const tapBtn = document.getElementById('tap-tempo-btn') || document.getElementById('stage-tap-tempo');
        tapBtn?.click();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setStageModeOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setStageModeOpen(false);
        setTunerOpen(false);
        setSoundModalOpen(false);
        setShortcutsModalOpen(false);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        handleBpmChange(bpm + delta);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const delta = e.shiftKey ? 5 : 1;
        handleBpmChange(bpm - delta);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleNextSong();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handlePrevSong();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        setTunerOpen((prev) => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setSoundModalOpen((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleTogglePlay,
    handleBpmChange,
    handleNextSong,
    handlePrevSong,
    bpm,
  ]);

  const getSubdivisionMultiplier = () => {
    switch (subdivision) {
      case 'quarter':
        return 1;
      case 'eighth':
        return 2;
      case 'triplet':
        return 3;
      case 'sixteenth':
        return 4;
      case 'swing':
        return 2;
      case 'clave_3_2':
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div
      id="metronome-root"
      className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-zinc-950"
    >
      {/* Top Navbar */}
      <header
        id="app-header"
        className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-800/80 px-4 sm:px-6 py-3"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Live Status */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex-shrink-0 bg-zinc-900">
              <img
                src="/icon.jpg"
                alt="Ícone do Metrônomo Pro"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to stylized SVG icon if image file fails
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-zinc-100">
                  Metrônomo Pro
                </h1>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PALCO & ENSAIO
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Sincronismo Web Audio de Alta Precisão
              </p>
            </div>
          </div>

          {/* Quick Nav Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Tuner Reference Button */}
            <button
              id="header-tuner-btn"
              onClick={() => setTunerOpen(true)}
              title="Afinação / Tom de Referência (A)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
            >
              <Radio className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Afinador (440Hz)</span>
            </button>

            {/* Sound & Flash Settings */}
            <button
              id="header-sound-settings-btn"
              onClick={() => setSoundModalOpen(true)}
              title="Configurações de Áudio e Flash (S)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Timbres & Flash</span>
            </button>

            {/* Stage Mode Fullscreen Button */}
            <button
              id="header-stage-mode-btn"
              onClick={() => setStageModeOpen(true)}
              title="Modo Palco Fullscreen (F)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">Modo Palco</span>
            </button>

            {/* Shortcuts Guide */}
            <button
              id="header-shortcuts-btn"
              onClick={() => setShortcutsModalOpen(true)}
              title="Atalhos de Teclado (?)"
              className="p-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Keyboard className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5">
        {/* Active Song Banner (if playing a gig song from setlist) */}
        {currentSong && (
          <div
            id="active-song-stage-bar"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-300">
                <ListMusic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-mono font-bold text-cyan-400">
                    Música em Execução:
                  </span>
                  {currentSong.key && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-900 text-amber-300 border border-zinc-700">
                      Tom: {currentSong.key}
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-bold text-zinc-100">
                  {currentSong.title}{' '}
                  {currentSong.artist && (
                    <span className="text-zinc-400 font-normal">
                      — {currentSong.artist}
                    </span>
                  )}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevSong}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Anterior
              </button>
              <button
                onClick={handleNextSong}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Próxima Música
              </button>
            </div>
          </div>
        )}

        {/* Top Control Bar: BIG PLAY/STOP BUTTON & Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-stretch">
          {/* Giant Start / Stop Metronome Button */}
          <div className="md:col-span-3">
            <button
              id="main-play-stop-btn"
              onClick={handleTogglePlay}
              className={`w-full py-4 sm:py-5 px-6 rounded-2xl font-black text-lg sm:text-2xl flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.99] select-none shadow-xl ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-400 text-zinc-950 shadow-[0_0_30px_rgba(244,63,94,0.35)]'
                  : 'bg-gradient-to-r from-emerald-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.35)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Square className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                  <span>PARAR METRÔNOMO (ESPAÇO)</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />
                  <span>INICIAR METRÔNOMO (ESPAÇO)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Sound & Rehearsal Timer Tile */}
          <div className="md:col-span-1 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-3.5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Timbre Atual</span>
              <button
                onClick={() => setSoundModalOpen(true)}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Trocar
              </button>
            </div>
            <div className="text-sm font-bold text-zinc-200 capitalize mt-1">
              {audioSettings.sound === 'woodblock'
                ? 'Madeira Acústica'
                : audioSettings.sound === 'sticks'
                ? 'Baquetas (Sticks)'
                : audioSettings.sound === 'cowbell'
                ? 'Cowbell 808'
                : audioSettings.sound === 'digital'
                ? 'Bip Digital'
                : 'Sintetizador'}
            </div>
            <div className="text-[11px] text-zinc-500 font-mono mt-2 pt-2 border-t border-zinc-800 flex justify-between">
              <span>Compasso: {isPlaying ? barNumber + 1 : 1}</span>
              <span>
                {Math.floor(sessionSeconds / 60)}:
                {(sessionSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Beat Indicator Visualizer */}
        <BeatIndicator
          timeSignature={timeSignature}
          accents={accents}
          currentBeat={currentBeat}
          currentSubdivision={currentSubdivision}
          subdivisionCount={getSubdivisionMultiplier()}
          isPlaying={isPlaying}
          isCountIn={isCountIn}
          countInRemaining={countInRemaining}
          barNumber={barNumber}
          flashMode={audioSettings.flashMode}
          onToggleAccent={handleToggleAccent}
        />

        {/* View Tabs (Metrônomo Principal | Repertório/Setlists | Treinamento & Estudo) */}
        <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2">
          <button
            id="tab-metronome-main"
            onClick={() => setActiveViewTab('main')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeViewTab === 'main'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Andamento & Compasso
          </button>

          <button
            id="tab-setlist-manager"
            onClick={() => setActiveViewTab('setlist')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'setlist'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <ListMusic className="w-4 h-4" />
            <span>Repertório de Shows ({currentSetlist?.songs.length ?? 0})</span>
          </button>

          <button
            id="tab-practice-tools"
            onClick={() => setActiveViewTab('practice')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeViewTab === 'practice'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Treinador de Ensaio</span>
          </button>
        </div>

        {/* View Tab 1: Main Controls (Tempo + Time Signatures) */}
        {activeViewTab === 'main' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Tempo Control (BPM & Tap) */}
            <div className="lg:col-span-7">
              <TempoControl
                bpm={bpm}
                onBpmChange={handleBpmChange}
                isPlaying={isPlaying}
              />
            </div>

            {/* Time Signature & Subdivisions */}
            <div className="lg:col-span-5">
              <TimeSignatureSubdivision
                timeSignature={timeSignature}
                onTimeSignatureChange={handleTimeSignatureChange}
                subdivision={subdivision}
                onSubdivisionChange={setSubdivision}
              />
            </div>
          </div>
        )}

        {/* View Tab 2: Setlist & Live Gig Manager */}
        {activeViewTab === 'setlist' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8">
              <SetlistManager
                setlists={setlists}
                activeSetlistId={activeSetlistId}
                activeSongId={activeSongId}
                isPlaying={isPlaying}
                onSelectSetlist={setActiveSetlistId}
                onSelectSong={handleSelectSong}
                onNextSong={handleNextSong}
                onPrevSong={handlePrevSong}
                onUpdateSetlists={setSetlists}
                onStartMetronome={handleTogglePlay}
              />
            </div>

            {/* Quick Helper / Live Tips for Musicians */}
            <div className="lg:col-span-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Dicas para Palco & Ensaios
              </h3>

              <div className="space-y-3 text-xs text-zinc-300">
                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <strong className="text-cyan-300 block mb-1">
                    1. Contagem de Entrada Automática
                  </strong>
                  Configure 1 ou 2 compassos de contagem nas músicas para a banda entrar afinada no primeiro tempo sem precisar de cliques contínuos durante a introdução.
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <strong className="text-emerald-300 block mb-1">
                    2. Modo Palco (Fullscreen)
                  </strong>
                  Pressione a tecla <strong>F</strong> no notebook ou tablet na estante de partitura para ativar os números gigantes visíveis de longe sob as luzes do palco.
                </div>

                <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                  <strong className="text-amber-300 block mb-1">
                    3. Pedal Footswitch USB
                  </strong>
                  Pedais USB mapeados para a tecla <strong>N</strong> (próxima música) e <strong>Espaço</strong> (play/pause) permitem controle total pelos pés.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Tab 3: Practice & Speed Trainer */}
        {activeViewTab === 'practice' && (
          <div className="space-y-5">
            <PracticeTools
              currentBpm={bpm}
              speedTrainer={speedTrainer}
              muteTrainer={muteTrainer}
              onUpdateSpeedTrainer={setSpeedTrainer}
              onUpdateMuteTrainer={setMuteTrainer}
              barNumber={barNumber}
              sessionSeconds={sessionSeconds}
              onResetSession={() => {
                setSessionSeconds(0);
                setBarNumber(0);
              }}
            />
          </div>
        )}
      </main>

      {/* Stage Mode Fullscreen Overlay */}
      {stageModeOpen && (
        <StageMode
          isPlaying={isPlaying}
          bpm={bpm}
          timeSignature={timeSignature}
          accents={accents}
          currentBeat={currentBeat}
          currentSubdivision={currentSubdivision}
          subdivisionCount={getSubdivisionMultiplier()}
          isCountIn={isCountIn}
          countInRemaining={countInRemaining}
          barNumber={barNumber}
          flashMode={audioSettings.flashMode}
          currentSong={currentSong}
          currentSetlist={currentSetlist}
          onTogglePlay={handleTogglePlay}
          onPrevSong={handlePrevSong}
          onNextSong={handleNextSong}
          onExitStageMode={() => setStageModeOpen(false)}
          onTapTempo={() => {
            const tapBtn = document.getElementById('tap-tempo-btn');
            tapBtn?.click();
          }}
        />
      )}

      {/* Tuner Reference Pitch Tone Modal */}
      <TunerTone isOpen={tunerOpen} onClose={() => setTunerOpen(false)} />

      {/* Sound Settings & Flash Modal */}
      <SoundSettingsModal
        isOpen={soundModalOpen}
        settings={audioSettings}
        onUpdateSettings={setAudioSettings}
        onClose={() => setSoundModalOpen(false)}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
}
