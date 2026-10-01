import React from 'react';
import { X, Table, Info } from 'lucide-react';
import { OFFICIAL_AVENT_TABLE } from '../utils/calculator';

interface ReferenceTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReferenceTableModal: React.FC<ReferenceTableModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Warming Reference Table (Gyári Referenciatáblázat)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          <p className="text-slate-600 dark:text-slate-300">
            Az időzítő motorja pontosan a Philips Avent hivatalos gyári referenciatáblázatán alapul:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="py-2.5 px-3">Milk content</th>
                  <th className="py-2.5 px-3 text-cyan-700 dark:text-cyan-300">20°C (Szobahőm.)</th>
                  <th className="py-2.5 px-3 text-blue-700 dark:text-blue-300">5°C (Hűtött)</th>
                  <th className="py-2.5 px-3 text-indigo-700 dark:text-indigo-300">Frozen (Fagyasztott)</th>
                  <th className="py-2.5 px-3 text-slate-700 dark:text-slate-300">Avent tárcsa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs">
                {OFFICIAL_AVENT_TABLE.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white font-sans">{row.volumeRange}</td>
                    <td className="py-2.5 px-3 font-bold text-cyan-800 dark:text-cyan-300">{row.roomTempMin} min</td>
                    <td className="py-2.5 px-3 font-bold text-blue-700 dark:text-blue-300">{row.fridgeTempMin} min</td>
                    <td className="py-2.5 px-3 text-indigo-700 dark:text-indigo-300">{row.frozenHours || '—'}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-slate-200 font-sans">{row.dialSettingLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 bg-cyan-50/70 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800/60 text-xs space-y-1.5 text-cyan-900 dark:text-cyan-200">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Avent gyári táblázat sajátossága:</span>
            </div>
            <p>
              A <strong>125–150 ml-es</strong> adag hűtött tej (5°C) melegítése az Avent hivatalos táblázata szerint <strong>3.5 perc</strong>, míg a <strong>90–110 ml-es</strong> adagé <strong>5.5 perc</strong> a cumisüveg formájának és a vízfürdő kontaktfelületének fizikai arányai miatt.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
};
