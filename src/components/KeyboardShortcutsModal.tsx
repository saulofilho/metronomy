import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: 'Espaço', desc: 'Iniciar / Parar o Metrônomo' },
  { key: 'T', desc: 'Tap Tempo (marcar andamento ao ritmo do toque)' },
  { key: 'F', desc: 'Alternar Modo Palco Fullscreen (Visão Gigante)' },
  { key: '↑ / ↓', desc: 'Ajustar andamento em ±1 BPM' },
  { key: 'Shift + ↑ / ↓', desc: 'Ajustar andamento em ±5 BPM' },
  { key: 'N', desc: 'Próxima música da Setlist (Show / Ensaio)' },
  { key: 'P', desc: 'Música anterior da Setlist' },
  { key: 'M', desc: 'Alternar mudo (apenas metrônomo visual)' },
  { key: 'A', desc: 'Abrir Afinador / Tom de Referência' },
  { key: 'S', desc: 'Abrir Configurações de Som e Flash' },
  { key: '?', desc: 'Abrir esta lista de atalhos' },
  { key: 'Esc', desc: 'Fechar modais / Sair do Modo Palco' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <div
        id="shortcuts-modal-card"
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-bold text-zinc-100">
              Atalhos de Teclado & Footswitch
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-zinc-400">
          Você pode usar pedais MIDI/USB mapeados para teclas de teclado no palco para avançar músicas ou dar play/stop sem tirar as mãos do instrumento.
        </p>

        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {SHORTCUTS.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 border border-zinc-800/80"
            >
              <span className="text-xs text-zinc-300 font-medium">
                {item.desc}
              </span>
              <kbd className="px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-cyan-300 font-mono text-xs font-bold shadow-sm whitespace-nowrap">
                {item.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-zinc-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
