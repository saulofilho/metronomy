import React, { useState } from 'react';
import {
  MuteTrainerConfig,
  SpeedTrainerConfig,
} from '../types';
import {
  Flame,
  VolumeX,
  Clock,
  RotateCcw,
  Sliders,
  Play,
  CheckCircle2,
} from 'lucide-react';

interface PracticeToolsProps {
  currentBpm: number;
  speedTrainer: SpeedTrainerConfig;
  muteTrainer: MuteTrainerConfig;
  onUpdateSpeedTrainer: (config: SpeedTrainerConfig) => void;
  onUpdateMuteTrainer: (config: MuteTrainerConfig) => void;
  barNumber: number;
  sessionSeconds: number;
  onResetSession: () => void;
}

export const PracticeTools: React.FC<PracticeToolsProps> = ({
  currentBpm,
  speedTrainer,
  muteTrainer,
  onUpdateSpeedTrainer,
  onUpdateMuteTrainer,
  barNumber,
  sessionSeconds,
  onResetSession,
}) => {
  const [activeTab, setActiveTab] = useState<'speed' | 'mute' | 'stats'>('speed');

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      id="practice-tools-container"
      className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 backdrop-blur-md"
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800/80">
        <div>
          <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-400" />
            Ferramentas de Estudo & Ensaio Técnico
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Treinamento de precisão rítmica, acelerando e tempo interno.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('speed')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'speed'
                ? 'bg-zinc-800 text-amber-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Acelerador (Speed)</span>
          </button>

          <button
            onClick={() => setActiveTab('mute')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'mute'
                ? 'bg-zinc-800 text-rose-400 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span>Ritmo Interior (Mute)</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-zinc-800 text-cyan-300 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Cronômetro</span>
          </button>
        </div>
      </div>

      {/* Speed Trainer (Acelerando) Tab */}
      {activeTab === 'speed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="speed-trainer-toggle"
                type="checkbox"
                checked={speedTrainer.enabled}
                onChange={(e) =>
                  onUpdateSpeedTrainer({
                    ...speedTrainer,
                    enabled: e.target.checked,
                    startBpm: currentBpm,
                  })
                }
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="speed-trainer-toggle"
                className="text-xs font-bold text-zinc-200 cursor-pointer"
              >
                Ativar Treinador de Velocidade Automático
              </label>
            </div>

            {speedTrainer.enabled && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Ativo: {currentBpm} → {speedTrainer.targetBpm} BPM
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                BPM Alvo Final
              </label>
              <input
                type="number"
                min="40"
                max="300"
                value={speedTrainer.targetBpm}
                onChange={(e) =>
                  onUpdateSpeedTrainer({
                    ...speedTrainer,
                    targetBpm: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Incremento (+ BPM)
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={speedTrainer.bpmStep}
                onChange={(e) =>
                  onUpdateSpeedTrainer({
                    ...speedTrainer,
                    bpmStep: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                A cada X Compassos
              </label>
              <input
                type="number"
                min="1"
                max="32"
                value={speedTrainer.barsInterval}
                onChange={(e) =>
                  onUpdateSpeedTrainer({
                    ...speedTrainer,
                    barsInterval: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            O metrônomo aumentará automaticamente{' '}
            <strong>+{speedTrainer.bpmStep} BPM</strong> a cada{' '}
            <strong>{speedTrainer.barsInterval} compassos</strong> tocados até atingir{' '}
            <strong>{speedTrainer.targetBpm} BPM</strong>.
          </p>
        </div>
      )}

      {/* Mute Trainer (Rhythm Internal Clock) Tab */}
      {activeTab === 'mute' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                id="mute-trainer-toggle"
                type="checkbox"
                checked={muteTrainer.enabled}
                onChange={(e) =>
                  onUpdateMuteTrainer({
                    ...muteTrainer,
                    enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 rounded bg-zinc-950 border-zinc-700 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <label
                htmlFor="mute-trainer-toggle"
                className="text-xs font-bold text-zinc-200 cursor-pointer"
              >
                Ativar Treino de Ritmo Interior (Compassos Silenciosos)
              </label>
            </div>

            {muteTrainer.enabled && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Padrão: {muteTrainer.barsAudible} Audíveis / {muteTrainer.barsMuted} Mudos
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Compassos com Som (Audíveis)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={muteTrainer.barsAudible}
                onChange={(e) =>
                  onUpdateMuteTrainer({
                    ...muteTrainer,
                    barsAudible: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-400"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">
                Compassos em Silêncio (Mudos)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={muteTrainer.barsMuted}
                onChange={(e) =>
                  onUpdateMuteTrainer({
                    ...muteTrainer,
                    barsMuted: Number(e.target.value),
                  })
                }
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-400"
              />
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            Excelente para bateristas, baixistas e solistas: o som silencia durante os compassos mudos. Você continua tocando no mesmo andamento para verificar se está caindo exatamente na cabeça do próximo compasso audível!
          </p>
        </div>
      )}

      {/* Session Timer & Stats Tab */}
      {activeTab === 'stats' && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="grid grid-cols-2 gap-4 w-full sm:w-auto">
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">
                Tempo do Ensaio / Sessão
              </span>
              <span className="text-2xl font-bold font-mono text-cyan-300">
                {formatTime(sessionSeconds)}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
              <span className="text-[11px] text-zinc-400 block">
                Total de Compassos
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-300">
                {barNumber}
              </span>
            </div>
          </div>

          <button
            id="reset-practice-timer-btn"
            onClick={onResetSession}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Zerar Cronômetro</span>
          </button>
        </div>
      )}
    </div>
  );
};
