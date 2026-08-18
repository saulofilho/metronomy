import React from 'react';
import { MetronomeAudioSettings, SoundType, VisualFlashMode } from '../types';
import { Volume2, Sliders, Eye, Sparkles, X, Music } from 'lucide-react';
import { metronomeEngine } from '../audio/soundEngine';

interface SoundSettingsModalProps {
  isOpen: boolean;
  settings: MetronomeAudioSettings;
  onUpdateSettings: (newSettings: MetronomeAudioSettings) => void;
  onClose: () => void;
}

const SOUND_PRESETS: { id: SoundType; label: string; desc: string; icon: string }[] = [
  {
    id: 'woodblock',
    label: 'Bloco de Madeira',
    desc: 'Madeira acústica ressonante, padrão em orquestras e estúdios.',
    icon: '🪵',
  },
  {
    id: 'sticks',
    label: 'Baquetas (Sticks)',
    desc: 'Estalo de baquetas de bateria, perfeito para bandas ao vivo.',
    icon: '🥁',
  },
  {
    id: 'cowbell',
    label: 'Cowbell (808)',
    desc: 'Campana metálica com altíssima penetração em palcos barulhentos.',
    icon: '🔔',
  },
  {
    id: 'digital',
    label: 'Bip Digital Pro',
    desc: 'Onda senoidal pura com corte preciso e alta definição.',
    icon: '⚡',
  },
  {
    id: 'electronic',
    label: 'Sintetizador 808',
    desc: 'Punch eletrônico para música pop, trap e hip-hop.',
    icon: '🎛️',
  },
];

const FLASH_MODES: { id: VisualFlashMode; label: string; desc: string }[] = [
  {
    id: 'bar',
    label: 'Borda Superior Luminosa',
    desc: 'Faixa luminosa no topo visível com visão periférica.',
  },
  {
    id: 'screen',
    label: 'Flash na Tela Inteira',
    desc: 'Pulsar sutil da tela no tempo 1 (ideal para palcos muito ruidosos).',
  },
  {
    id: 'indicator',
    label: 'Apenas no Indicador',
    desc: 'Brilho nos blocos de tempo sem alterar o fundo.',
  },
  {
    id: 'off',
    label: 'Desativado',
    desc: 'Sem flashes visuais adicionais.',
  },
];

export const SoundSettingsModal: React.FC<SoundSettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleSoundChange = (sound: SoundType) => {
    onUpdateSettings({ ...settings, sound });
    metronomeEngine.setSound(sound);
  };

  const handleTestClick = (sound: SoundType) => {
    metronomeEngine.setSound(sound);
    // Quick test click
    const ctx = metronomeEngine.initAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(1400, ctx.currentTime);
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div
        id="sound-settings-card"
        className="w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Configurações de Áudio & Visual
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Selection */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2.5">
            Timbre do Metrônomo
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SOUND_PRESETS.map((preset) => {
              const isSelected = settings.sound === preset.id;
              return (
                <button
                  key={preset.id}
                  id={`sound-preset-${preset.id}`}
                  onClick={() => handleSoundChange(preset.id)}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50 shadow-sm'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <span className="text-2xl">{preset.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>{preset.label}</span>
                      {isSelected && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500 text-zinc-950 font-bold">
                          Ativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight line-clamp-2">
                      {preset.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Volume Mix Sliders */}
        <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 space-y-4">
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block">
            Mixagem de Volumes Independentes
          </span>

          {/* Master Volume */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-zinc-300">Volume Geral (Master)</span>
              <span className="text-cyan-400 font-mono">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({ ...settings, masterVolume: val });
                metronomeEngine.setVolumes(
                  val,
                  settings.accentVolume,
                  settings.subdivisionVolume
                );
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Accent Volume */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-zinc-300">Volume dos Acentos Fortes</span>
              <span className="text-emerald-400 font-mono">
                {Math.round(settings.accentVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.5"
              step="0.05"
              value={settings.accentVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({ ...settings, accentVolume: val });
                metronomeEngine.setVolumes(
                  settings.masterVolume,
                  val,
                  settings.subdivisionVolume
                );
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Subdivision Volume */}
          <div>
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-zinc-300">Volume das Subdivisões</span>
              <span className="text-zinc-400 font-mono">
                {Math.round(settings.subdivisionVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.subdivisionVolume}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({ ...settings, subdivisionVolume: val });
                metronomeEngine.setVolumes(
                  settings.masterVolume,
                  settings.accentVolume,
                  val
                );
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-400"
            />
          </div>

          {/* Pitch Shift / Transposição do Click */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-xs mb-1.5 font-medium">
              <span className="text-zinc-300">
                Afinação do Click (Semitons)
              </span>
              <span className="text-amber-300 font-mono">
                {settings.pitchShift > 0
                  ? `+${settings.pitchShift}`
                  : settings.pitchShift}{' '}
                semitons
              </span>
            </div>
            <input
              type="range"
              min="-12"
              max="12"
              step="1"
              value={settings.pitchShift}
              onChange={(e) => {
                const val = Number(e.target.value);
                onUpdateSettings({ ...settings, pitchShift: val });
                metronomeEngine.setPitchShift(val);
              }}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Dica: Ajuste a altura do click para não ficar na mesma frequência dos pratos da bateria ou guitarras.
            </p>
          </div>
        </div>

        {/* Visual Flash Settings */}
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 block mb-2.5">
            Flash Visual de Palco (Para Ambientes Ruidosos)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLASH_MODES.map((mode) => {
              const isSelected = settings.flashMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`flash-mode-${mode.id}`}
                  onClick={() =>
                    onUpdateSettings({ ...settings, flashMode: mode.id })
                  }
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-400 text-emerald-200 ring-1 ring-emerald-400/50'
                      : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-700 text-zinc-300'
                  }`}
                >
                  <div className="font-bold text-xs">{mode.label}</div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                    {mode.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-colors"
          >
            Concluir Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
