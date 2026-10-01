import React from 'react';
import { CalculationResult, MilkType, StartTemp } from '../types/warmer';
import { Play, Droplets, Info, CheckCircle2, ShieldAlert } from 'lucide-react';

interface ResultCardProps {
  result: CalculationResult;
  milkType: MilkType;
  startTemp: StartTemp;
  volumeMl: number;
  onStartTimer: () => void;
  onLogFeeding: () => void;
  isLogged: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  milkType,
  volumeMl,
  onStartTimer,
  onLogFeeding,
  isLogged,
}) => {
  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header Kicker */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span>Kalkulált melegítési idő</span>
          <span>Tartomány: {result.minutesRange}</span>
        </div>

        {/* Primary Large Time Display */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-cyan-700 dark:text-cyan-400">
            {result.timeDisplay}
          </span>
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            perc:másodperc
          </span>
        </div>

        {/* Avent Warmer Dial Position Highlight Box */}
        <div className="p-3.5 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 mb-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-300 mb-1 flex items-center gap-1.5">
            <span>Philips Avent beállítás:</span>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white">
            {result.dialSetting.nameHu}
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {result.dialSetting.description}
          </p>
        </div>

        {/* Water guideline */}
        <div className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 mb-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Vízszint útmutató: </span>
            {result.waterGuideline}
          </div>
        </div>

        {/* Specific Bullet Notes for Formula vs Breast Milk */}
        <div className="space-y-1.5 mb-5 text-xs text-slate-600 dark:text-slate-300">
          {result.notes.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-cyan-500 font-bold shrink-0 mt-0.5">·</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onStartTimer}
          className="w-full h-12 rounded-xl bg-cyan-600 hover:bg-cyan-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Visszaszámláló indítása ({result.timeDisplay})</span>
        </button>

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={onLogFeeding}
            disabled={isLogged}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isLogged
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300 cursor-default'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {isLogged ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mentve az etetési naplóba!</span>
              </>
            ) : (
              <>
                <span>+ Mentés a naplóba ({volumeMl} ml {milkType === 'breast_milk' ? 'anyatej' : 'tápszer'})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
