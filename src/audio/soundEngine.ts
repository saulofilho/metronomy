import { AccentType, SoundType, SubdivisionType, TimeSignature } from '../types';

export interface BeatEvent {
  beatNumber: number; // 0 to beats - 1
  subdivisionIndex: number; // 0 to subCount - 1
  isSubdivision: boolean;
  accent: AccentType;
  barNumber: number;
  isCountIn: boolean;
  countInBarRemaining: number;
  time: number;
}

export type BeatCallback = (event: BeatEvent) => void;

class MetronomeEngine {
  private audioCtx: AudioContext | null = null;
  private isRunning: boolean = false;
  private bpm: number = 120;
  private timeSignature: TimeSignature = { beats: 4, noteValue: 4 };
  private subdivision: SubdivisionType = 'quarter';
  private accents: AccentType[] = ['accent', 'normal', 'normal', 'normal'];
  private sound: SoundType = 'woodblock';
  private masterVolume: number = 0.85;
  private accentVolume: number = 1.0;
  private subdivisionVolume: number = 0.55;
  private pitchShiftSemitones: number = 0;

  // Scheduling state
  private nextNoteTime: number = 0;
  private currentBeat: number = 0;
  private currentSubdivisionIndex: number = 0;
  private currentBar: number = 0;
  private timerWorkerId: number | null = null;

  // Lookahead settings
  private readonly lookaheadMs: number = 25;
  private readonly scheduleAheadTime: number = 0.1;

  // Callbacks
  private onBeatCallbacks: Set<BeatCallback> = new Set();

  // Count-in & Training modes
  private isCountInActive: boolean = false;
  private countInBarsTotal: number = 0;
  private countInBarsRemaining: number = 0;
  private isMuteTrainerActive: boolean = false;
  private muteBarsAudible: number = 4;
  private muteBarsMuted: number = 1;
  private isSpeedTrainerActive: boolean = false;
  private speedTargetBpm: number = 140;
  private speedBpmStep: number = 2;
  private speedBarsInterval: number = 4;
  private onBpmChangeCallback?: (newBpm: number) => void;

  // Tuner tone oscillator
  private tunerOscillator: OscillatorNode | null = null;
  private tunerGainNode: GainNode | null = null;

  public initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  public subscribeBeat(cb: BeatCallback): () => void {
    this.onBeatCallbacks.add(cb);
    return () => {
      this.onBeatCallbacks.delete(cb);
    };
  }

  public start(countInBars: number = 0) {
    const ctx = this.initAudioContext();
    if (this.isRunning) return;

    this.isRunning = true;
    this.currentBeat = 0;
    this.currentSubdivisionIndex = 0;
    this.currentBar = 0;

    if (countInBars > 0) {
      this.isCountInActive = true;
      this.countInBarsTotal = countInBars;
      this.countInBarsRemaining = countInBars;
    } else {
      this.isCountInActive = false;
      this.countInBarsTotal = 0;
      this.countInBarsRemaining = 0;
    }

    this.nextNoteTime = ctx.currentTime + 0.05;
    this.startScheduler();
  }

  public stop() {
    this.isRunning = false;
    this.isCountInActive = false;
    if (this.timerWorkerId !== null) {
      window.clearInterval(this.timerWorkerId);
      this.timerWorkerId = null;
    }
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(20, Math.min(320, Math.round(newBpm)));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setTimeSignature(ts: TimeSignature) {
    this.timeSignature = ts;
    // Adjust accents array if size mismatch
    if (this.accents.length !== ts.beats) {
      const newAccents: AccentType[] = [];
      for (let i = 0; i < ts.beats; i++) {
        if (i === 0) newAccents.push('accent');
        else if (ts.beats === 6 && i === 3) newAccents.push('accent');
        else if (ts.beats === 9 && (i === 3 || i === 6)) newAccents.push('accent');
        else if (ts.beats === 12 && (i === 3 || i === 6 || i === 9)) newAccents.push('accent');
        else newAccents.push('normal');
      }
      this.accents = newAccents;
    }
  }

  public getTimeSignature(): TimeSignature {
    return this.timeSignature;
  }

  public setSubdivision(sub: SubdivisionType) {
    this.subdivision = sub;
  }

  public setAccents(accents: AccentType[]) {
    this.accents = [...accents];
  }

  public getAccents(): AccentType[] {
    return this.accents;
  }

  public setSound(sound: SoundType) {
    this.sound = sound;
  }

  public setVolumes(master: number, accent: number, subdivision: number) {
    this.masterVolume = Math.max(0, Math.min(1, master));
    this.accentVolume = Math.max(0, Math.min(1, accent));
    this.subdivisionVolume = Math.max(0, Math.min(1, subdivision));
  }

  public setPitchShift(semitones: number) {
    this.pitchShiftSemitones = semitones;
  }

  public setMuteTrainer(enabled: boolean, audible: number = 4, muted: number = 1) {
    this.isMuteTrainerActive = enabled;
    this.muteBarsAudible = audible;
    this.muteBarsMuted = muted;
  }

  public setSpeedTrainer(enabled: boolean, targetBpm: number = 140, step: number = 2, barsInterval: number = 4, onBpmChange?: (bpm: number) => void) {
    this.isSpeedTrainerActive = enabled;
    this.speedTargetBpm = targetBpm;
    this.speedBpmStep = step;
    this.speedBarsInterval = barsInterval;
    this.onBpmChangeCallback = onBpmChange;
  }

  private startScheduler() {
    if (this.timerWorkerId !== null) {
      window.clearInterval(this.timerWorkerId);
    }
    this.timerWorkerId = window.setInterval(() => {
      this.scheduler();
    }, this.lookaheadMs);
  }

  private scheduler() {
    if (!this.audioCtx || !this.isRunning) return;

    while (this.nextNoteTime < this.audioCtx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.nextNoteTime);
      this.advanceNote();
    }
  }

  private getSubdivisionMultiplier(): number {
    switch (this.subdivision) {
      case 'quarter': return 1;
      case 'eighth': return 2;
      case 'triplet': return 3;
      case 'sixteenth': return 4;
      case 'swing': return 2; // handled with swing offset
      case 'clave_3_2': return 4;
      default: return 1;
    }
  }

  private scheduleNote(time: number) {
    if (!this.audioCtx) return;

    const isSub = this.currentSubdivisionIndex > 0;
    const beatAcc = this.accents[this.currentBeat] || 'normal';
    const isMutedByAccent = beatAcc === 'mute';

    // Mute trainer calculation
    let isSilencedByTrainer = false;
    if (!this.isCountInActive && this.isMuteTrainerActive) {
      const cycleLength = this.muteBarsAudible + this.muteBarsMuted;
      const barInCycle = this.currentBar % cycleLength;
      if (barInCycle >= this.muteBarsAudible) {
        isSilencedByTrainer = true;
      }
    }

    const effectiveAccent = isSub ? 'soft' : beatAcc;

    if (!isMutedByAccent && !isSilencedByTrainer) {
      this.playSynthSound(time, effectiveAccent, isSub, this.isCountInActive);
    }

    // Schedule UI event via setTimeout so React component pulses at exact audio time
    const timeDiff = Math.max(0, (time - this.audioCtx.currentTime) * 1000);
    const beatEventData: BeatEvent = {
      beatNumber: this.currentBeat,
      subdivisionIndex: this.currentSubdivisionIndex,
      isSubdivision: isSub,
      accent: effectiveAccent,
      barNumber: this.currentBar,
      isCountIn: this.isCountInActive,
      countInBarRemaining: this.countInBarsRemaining,
      time,
    };

    setTimeout(() => {
      if (this.isRunning) {
        this.onBeatCallbacks.forEach(cb => cb(beatEventData));
      }
    }, timeDiff);
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    const subCount = this.getSubdivisionMultiplier();

    let stepDuration = secondsPerBeat / subCount;

    // Swing feel handling
    if (this.subdivision === 'swing' && subCount === 2) {
      if (this.currentSubdivisionIndex === 0) {
        stepDuration = secondsPerBeat * 0.66; // long beat
      } else {
        stepDuration = secondsPerBeat * 0.34; // short off-beat
      }
    }

    this.nextNoteTime += stepDuration;
    this.currentSubdivisionIndex++;

    if (this.currentSubdivisionIndex >= subCount) {
      this.currentSubdivisionIndex = 0;
      this.currentBeat++;

      if (this.currentBeat >= this.timeSignature.beats) {
        this.currentBeat = 0;
        this.currentBar++;

        // Handle count-in completion
        if (this.isCountInActive) {
          this.countInBarsRemaining--;
          if (this.countInBarsRemaining <= 0) {
            this.isCountInActive = false;
            this.currentBar = 0;
          }
        } else if (this.isSpeedTrainerActive) {
          // Speed trainer bar step
          if (this.currentBar > 0 && this.currentBar % this.speedBarsInterval === 0) {
            if (this.bpm < this.speedTargetBpm) {
              const updatedBpm = Math.min(this.speedTargetBpm, this.bpm + this.speedBpmStep);
              this.setBpm(updatedBpm);
              if (this.onBpmChangeCallback) {
                this.onBpmChangeCallback(updatedBpm);
              }
            }
          }
        }
      }
    }
  }

  // Pure Web Audio procedural synthesizers for click sounds
  private playSynthSound(time: number, accent: AccentType, isSub: boolean, isCountIn: boolean) {
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);

    let baseVol = this.masterVolume;
    if (isCountIn) {
      baseVol *= 1.1; // count in is crisp
    } else if (isSub) {
      baseVol *= this.subdivisionVolume;
    } else if (accent === 'accent') {
      baseVol *= this.accentVolume;
    } else if (accent === 'soft') {
      baseVol *= 0.45;
    } else {
      baseVol *= 0.8;
    }

    masterGain.gain.setValueAtTime(Math.max(0.0001, baseVol), time);

    const pitchFactor = Math.pow(2, this.pitchShiftSemitones / 12);

    switch (this.sound) {
      case 'digital':
        this.synthDigital(ctx, masterGain, time, accent, isSub, pitchFactor, isCountIn);
        break;
      case 'woodblock':
        this.synthWoodblock(ctx, masterGain, time, accent, isSub, pitchFactor, isCountIn);
        break;
      case 'sticks':
        this.synthSticks(ctx, masterGain, time, accent, isSub, pitchFactor);
        break;
      case 'cowbell':
        this.synthCowbell(ctx, masterGain, time, accent, isSub, pitchFactor);
        break;
      case 'electronic':
        this.synthElectronic(ctx, masterGain, time, accent, isSub, pitchFactor);
        break;
      default:
        this.synthDigital(ctx, masterGain, time, accent, isSub, pitchFactor, isCountIn);
    }
  }

  private synthDigital(ctx: AudioContext, destination: AudioNode, time: number, accent: AccentType, isSub: boolean, pitch: number, isCountIn: boolean) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    let freq = 1200;
    if (isCountIn) freq = 2200;
    else if (accent === 'accent') freq = 1760;
    else if (isSub) freq = 880;
    else freq = 1200;

    osc.frequency.setValueAtTime(freq * pitch, time);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  private synthWoodblock(ctx: AudioContext, destination: AudioNode, time: number, accent: AccentType, isSub: boolean, pitch: number, isCountIn: boolean) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    let freq = 900;
    if (isCountIn) freq = 1500;
    else if (accent === 'accent') freq = 1200;
    else if (isSub) freq = 650;
    else freq = 850;

    osc1.frequency.setValueAtTime(freq * pitch, time);
    osc1.frequency.exponentialRampToValueAtTime((freq * 0.7) * pitch, time + 0.06);

    osc2.frequency.setValueAtTime((freq * 1.5) * pitch, time);
    osc2.frequency.exponentialRampToValueAtTime((freq * 1.1) * pitch, time + 0.04);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.065);
    osc2.stop(time + 0.065);
  }

  private synthSticks(ctx: AudioContext, destination: AudioNode, time: number, accent: AccentType, isSub: boolean, pitch: number) {
    // Drumstick click: noise burst + high resonant bandpass
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    const baseFreq = accent === 'accent' ? 3200 : isSub ? 2000 : 2500;
    filter.frequency.setValueAtTime(baseFreq * pitch, time);
    filter.Q.setValueAtTime(12, time);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    noise.start(time);
    noise.stop(time + 0.03);
  }

  private synthCowbell(ctx: AudioContext, destination: AudioNode, time: number, accent: AccentType, isSub: boolean, pitch: number) {
    // Classic 808 style cowbell using two square oscillators (540Hz & 800Hz) with bandpass filter
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = 'square';
    osc2.type = 'square';

    const mult = accent === 'accent' ? 1.25 : isSub ? 0.85 : 1.0;
    osc1.frequency.setValueAtTime(540 * mult * pitch, time);
    osc2.frequency.setValueAtTime(800 * mult * pitch, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000 * mult * pitch, time);
    filter.Q.setValueAtTime(2.5, time);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.13);
    osc2.stop(time + 0.13);
  }

  private synthElectronic(ctx: AudioContext, destination: AudioNode, time: number, accent: AccentType, isSub: boolean, pitch: number) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    const startFreq = accent === 'accent' ? 1200 : isSub ? 450 : 800;
    osc.frequency.setValueAtTime(startFreq * pitch, time);
    osc.frequency.exponentialRampToValueAtTime(80 * pitch, time + 0.05);

    gain.gain.setValueAtTime(1, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(gain);
    gain.connect(destination);

    osc.start(time);
    osc.stop(time + 0.075);
  }

  // --- Chromatic Reference Tuner Generator ---
  public startTunerTone(frequency: number, type: OscillatorType = 'sine') {
    const ctx = this.initAudioContext();
    this.stopTunerTone();

    this.tunerOscillator = ctx.createOscillator();
    this.tunerGainNode = ctx.createGain();

    this.tunerOscillator.type = type;
    this.tunerOscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    // Smooth fade in
    this.tunerGainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    this.tunerGainNode.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.08);

    this.tunerOscillator.connect(this.tunerGainNode);
    this.tunerGainNode.connect(ctx.destination);

    this.tunerOscillator.start();
  }

  public stopTunerTone() {
    if (this.tunerOscillator && this.tunerGainNode && this.audioCtx) {
      try {
        const now = this.audioCtx.currentTime;
        this.tunerGainNode.gain.setValueAtTime(this.tunerGainNode.gain.value, now);
        this.tunerGainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        this.tunerOscillator.stop(now + 0.09);
      } catch {
        // Safe catch if already stopped
      }
      this.tunerOscillator = null;
      this.tunerGainNode = null;
    }
  }

  public isTunerPlaying(): boolean {
    return this.tunerOscillator !== null;
  }
}

export const metronomeEngine = new MetronomeEngine();
