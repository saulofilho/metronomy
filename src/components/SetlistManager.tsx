import React, { useState } from 'react';
import { Setlist, Song, SubdivisionType, TimeSignature } from '../types';
import {
  ListMusic,
  Plus,
  Play,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Music2,
  FileText,
  Clock,
  Download,
  Upload,
  RotateCcw,
  Check,
  X,
} from 'lucide-react';

interface SetlistManagerProps {
  setlists: Setlist[];
  activeSetlistId: string;
  activeSongId: string | null;
  isPlaying: boolean;
  onSelectSetlist: (id: string) => void;
  onSelectSong: (song: Song) => void;
  onNextSong: () => void;
  onPrevSong: () => void;
  onUpdateSetlists: (setlists: Setlist[]) => void;
  onStartMetronome: () => void;
}

export const SetlistManager: React.FC<SetlistManagerProps> = ({
  setlists,
  activeSetlistId,
  activeSongId,
  isPlaying,
  onSelectSetlist,
  onSelectSong,
  onNextSong,
  onPrevSong,
  onUpdateSetlists,
  onStartMetronome,
}) => {
  const [isEditingSong, setIsEditingSong] = useState<boolean>(false);
  const [editingSongData, setEditingSongData] = useState<Partial<Song>>({});
  const [isCreatingSetlist, setIsCreatingSetlist] = useState<boolean>(false);
  const [newSetlistName, setNewSetlistName] = useState<string>('');

  const currentSetlist =
    setlists.find((s) => s.id === activeSetlistId) || setlists[0];

  const currentSongIndex = currentSetlist?.songs.findIndex(
    (s) => s.id === activeSongId
  );

  const handleOpenNewSong = () => {
    setEditingSongData({
      id: 'song-' + Date.now(),
      title: '',
      artist: '',
      bpm: 120,
      timeSignature: { beats: 4, noteValue: 4 },
      subdivision: 'quarter',
      countInBars: 1,
      key: '',
      notes: '',
      soundPreset: 'woodblock',
    });
    setIsEditingSong(true);
  };

  const handleEditSong = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSongData({ ...song });
    setIsEditingSong(true);
  };

  const handleDeleteSong = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentSetlist) return;
    const updatedSongs = currentSetlist.songs.filter((s) => s.id !== songId);
    const updated = setlists.map((sl) =>
      sl.id === currentSetlist.id
        ? { ...sl, songs: updatedSongs, updatedAt: Date.now() }
        : sl
    );
    onUpdateSetlists(updated);
  };

  const handleSaveSong = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSetlist || !editingSongData.title) return;

    const fullSong: Song = {
      id: editingSongData.id || 'song-' + Date.now(),
      title: editingSongData.title,
      artist: editingSongData.artist || '',
      bpm: editingSongData.bpm || 120,
      timeSignature: editingSongData.timeSignature || { beats: 4, noteValue: 4 },
      subdivision: editingSongData.subdivision || 'quarter',
      countInBars: editingSongData.countInBars ?? 1,
      key: editingSongData.key || '',
      notes: editingSongData.notes || '',
      soundPreset: editingSongData.soundPreset || 'woodblock',
    };

    let updatedSongs: Song[];
    const exists = currentSetlist.songs.some((s) => s.id === fullSong.id);
    if (exists) {
      updatedSongs = currentSetlist.songs.map((s) =>
        s.id === fullSong.id ? fullSong : s
      );
    } else {
      updatedSongs = [...currentSetlist.songs, fullSong];
    }

    const updated = setlists.map((sl) =>
      sl.id === currentSetlist.id
        ? { ...sl, songs: updatedSongs, updatedAt: Date.now() }
        : sl
    );

    onUpdateSetlists(updated);
    setIsEditingSong(false);
    onSelectSong(fullSong);
  };

  const handleCreateNewSetlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSetlistName.trim()) return;
    const newSl: Setlist = {
      id: 'setlist-' + Date.now(),
      name: newSetlistName.trim(),
      updatedAt: Date.now(),
      songs: [],
    };
    onUpdateSetlists([...setlists, newSl]);
    onSelectSetlist(newSl.id);
    setNewSetlistName('');
    setIsCreatingSetlist(false);
  };

  const handleExportSetlists = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(setlists, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `metronomo-setlists-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      id="setlist-manager-container"
      className="rounded-2xl bg-zinc-900/90 border border-zinc-800/80 p-5 backdrop-blur-md flex flex-col h-full"
    >
      {/* Setlist Header & Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <ListMusic className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-zinc-100">
            Repertório & Setlist (Shows / Ensaios)
          </h2>
        </div>

        {/* Setlist Selector Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            id="setlist-select-dropdown"
            value={activeSetlistId}
            onChange={(e) => onSelectSetlist(e.target.value)}
            className="flex-1 sm:flex-initial bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-zinc-200 font-medium focus:outline-none focus:border-cyan-400"
          >
            {setlists.map((sl) => (
              <option key={sl.id} value={sl.id}>
                {sl.name} ({sl.songs.length} músicas)
              </option>
            ))}
          </select>

          <button
            id="create-new-setlist-btn"
            onClick={() => setIsCreatingSetlist(!isCreatingSetlist)}
            title="Criar novo repertório"
            className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* New Setlist Input Form */}
      {isCreatingSetlist && (
        <form
          onSubmit={handleCreateNewSetlist}
          className="p-3 mb-4 rounded-xl bg-zinc-950/90 border border-cyan-500/40 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Nome do novo repertório (ex: Show Barzinho Acústico)"
            value={newSetlistName}
            onChange={(e) => setNewSetlistName(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold rounded-lg"
          >
            Criar
          </button>
          <button
            type="button"
            onClick={() => setIsCreatingSetlist(false)}
            className="p-1.5 text-zinc-400 hover:text-zinc-200"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Live Stage Song Controls Row (Quick Prev / Next Song) */}
      {currentSetlist && currentSetlist.songs.length > 0 && (
        <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-zinc-950/70 border border-zinc-800">
          <button
            id="prev-song-quick-btn"
            onClick={onPrevSong}
            disabled={currentSongIndex <= 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 text-xs font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-center px-2">
            <span className="text-xs font-mono font-semibold text-cyan-400">
              {currentSongIndex >= 0 ? currentSongIndex + 1 : '—'} /{' '}
              {currentSetlist.songs.length}
            </span>
          </div>

          <button
            id="next-song-quick-btn"
            onClick={onNextSong}
            disabled={currentSongIndex >= currentSetlist.songs.length - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 disabled:pointer-events-none text-zinc-300 text-xs font-semibold transition-colors"
          >
            <span>Próxima</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Song List or Empty State */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[340px]">
        {currentSetlist && currentSetlist.songs.length === 0 ? (
          <div className="py-8 text-center text-zinc-500 text-xs">
            Nenhuma música neste repertório. Clique no botão abaixo para
            adicionar a primeira!
          </div>
        ) : (
          currentSetlist?.songs.map((song, idx) => {
            const isSelected = song.id === activeSongId;
            return (
              <div
                key={song.id}
                id={`song-item-${song.id}`}
                onClick={() => onSelectSong(song)}
                className={`group relative p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                  isSelected
                    ? 'bg-cyan-950/40 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-850'
                }`}
              >
                {/* Song Index + Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${
                      isSelected
                        ? 'bg-cyan-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          isSelected ? 'text-cyan-200 font-bold' : 'text-zinc-200'
                        }`}
                      >
                        {song.title}
                      </h4>
                      {song.key && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-800 text-amber-300 border border-zinc-700">
                          {song.key}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono mt-0.5">
                      {song.artist && (
                        <span className="text-zinc-400 truncate max-w-[120px]">
                          {song.artist} •
                        </span>
                      )}
                      <span className="text-emerald-400 font-semibold">
                        {song.bpm} BPM
                      </span>
                      <span>
                        {song.timeSignature.beats}/{song.timeSignature.noteValue}
                      </span>
                      {song.countInBars && song.countInBars > 0 ? (
                        <span className="text-amber-400 text-[10px]">
                          Contagem {song.countInBars}c
                        </span>
                      ) : null}
                    </div>

                    {song.notes && (
                      <p className="text-[11px] text-zinc-500 italic truncate mt-1 flex items-center gap-1">
                        <FileText className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                        {song.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions (Play / Edit / Delete) */}
                <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleEditSong(song, e)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                    title="Editar música"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteSong(song.id, e)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Excluir música"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Add Song & Export Buttons */}
      <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between gap-2">
        <button
          id="add-song-to-setlist-btn"
          onClick={handleOpenNewSong}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Adicionar Música</span>
        </button>

        <button
          id="export-setlist-btn"
          onClick={handleExportSetlists}
          title="Exportar repertórios em formato JSON para backup ou compartilhamento"
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      {/* Edit / Add Song Modal */}
      {isEditingSong && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <form
            onSubmit={handleSaveSong}
            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-3.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
              <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                <Music2 className="w-4 h-4 text-cyan-400" />
                {editingSongData.id &&
                currentSetlist?.songs.some((s) => s.id === editingSongData.id)
                  ? 'Editar Música'
                  : 'Nova Música no Repertório'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingSong(false)}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Nome da Música *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Superstition"
                  value={editingSongData.title || ''}
                  onChange={(e) =>
                    setEditingSongData({ ...editingSongData, title: e.target.value })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Artista / Banda
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Stevie Wonder"
                    value={editingSongData.artist || ''}
                    onChange={(e) =>
                      setEditingSongData({
                        ...editingSongData,
                        artist: e.target.value,
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Tom / Tonalidade (Key)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Em, C maior, B♭"
                    value={editingSongData.key || ''}
                    onChange={(e) =>
                      setEditingSongData({ ...editingSongData, key: e.target.value })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Andamento (BPM)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="300"
                    value={editingSongData.bpm || 120}
                    onChange={(e) =>
                      setEditingSongData({
                        ...editingSongData,
                        bpm: Number(e.target.value),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Compasso
                  </label>
                  <select
                    value={`${editingSongData.timeSignature?.beats || 4}/${
                      editingSongData.timeSignature?.noteValue || 4
                    }`}
                    onChange={(e) => {
                      const [b, n] = e.target.value.split('/').map(Number);
                      setEditingSongData({
                        ...editingSongData,
                        timeSignature: { beats: b, noteValue: n },
                      });
                    }}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="2/4">2/4</option>
                    <option value="3/4">3/4</option>
                    <option value="4/4">4/4</option>
                    <option value="5/4">5/4</option>
                    <option value="6/8">6/8</option>
                    <option value="7/8">7/8</option>
                    <option value="12/8">12/8</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">
                    Contagem Início
                  </label>
                  <select
                    value={editingSongData.countInBars ?? 1}
                    onChange={(e) =>
                      setEditingSongData({
                        ...editingSongData,
                        countInBars: Number(e.target.value),
                      })
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value={0}>Sem contagem</option>
                    <option value={1}>1 Compasso</option>
                    <option value={2}>2 Compassos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 block mb-1">
                  Notas de Performance / Dicas para a Banda
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Começar com violão solo. Bateria entra no compasso 9. Final em Fade Out."
                  value={editingSongData.notes || ''}
                  onChange={(e) =>
                    setEditingSongData({
                      ...editingSongData,
                      notes: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-cyan-400 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setIsEditingSong(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold"
              >
                Salvar Música
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
