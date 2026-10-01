import React from 'react';
import { FeedingLogEntry } from '../types/warmer';
import { Trash2, Clock, Milk, Sparkles, Plus } from 'lucide-react';

interface FeedingLogProps {
  entries: FeedingLogEntry[];
  onClear: () => void;
  onDeleteEntry: (id: string) => void;
  onNewCalculation: () => void;
}

export const FeedingLog: React.FC<FeedingLogProps> = ({
  entries,
  onClear,
  onDeleteEntry,
  onNewCalculation,
}) => {
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const timeStr = d.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' });
    if (isToday) {
      return `Ma, ${timeStr}`;
    }
    return `${d.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}, ${timeStr}`;
  };

  const getTempLabel = (temp: string) => {
    if (temp === 'fridge') return 'Hűtött (5°C)';
    if (temp === 'room') return 'Szobahőm. (20°C)';
    return 'Fagyasztott (-18°C)';
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>Etetési és Melegítési Napló</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            A legutóbbi melegítések és adagok listája
          </p>
        </div>

        {entries.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Napló törlése</span>
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Még nincs mentett melegítés a naplóban
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
            A kalkulátor eredményénél kattints a "+ Mentés a naplóba" gombra az adagok rögzítéséhez!
          </p>
          <button
            type="button"
            onClick={onNewCalculation}
            className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors cursor-pointer inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Melegítés kalkulálása</span>
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {entries.map((entry) => {
            const isBreastMilk = entry.milkType === 'breast_milk';
            const m = Math.floor(entry.durationSeconds / 60);
            const s = entry.durationSeconds % 60;
            const durationStr = `${m}:${s.toString().padStart(2, '0')}`;

            return (
              <div
                key={entry.id}
                className="py-3 sm:py-3.5 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isBreastMilk
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400'
                        : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isBreastMilk ? <Milk className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {entry.volumeMl} ml {isBreastMilk ? 'Anyatej' : 'Tápszer'}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        ({durationStr})
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{formatTime(entry.timestamp)}</span>
                      <span>·</span>
                      <span>{getTempLabel(entry.startTemp)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteEntry(entry.id)}
                  title="Törlés"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-500 opacity-60 hover:opacity-100 transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
