import React from 'react';
import { MilkType, StartTemp, BottleMaterial, TargetWarmth } from '../types/warmer';
import { Milk, Sparkles, Snowflake, Thermometer, Sun, Minus, Plus, Flame, Sliders } from 'lucide-react';

interface CalculatorFormProps {
  milkType: MilkType;
  setMilkType: (val: MilkType) => void;
  startTemp: StartTemp;
  setStartTemp: (val: StartTemp) => void;
  volumeMl: number;
  setVolumeMl: (val: number) => void;
  material: BottleMaterial;
  setMaterial: (val: BottleMaterial) => void;
  targetWarmth: TargetWarmth;
  setTargetWarmth: (val: TargetWarmth) => void;
  customOffsetSec: number;
  setCustomOffsetSec: (val: number) => void;
}

const COMMON_VOLUMES = [30, 60, 80, 100, 125, 150, 180, 200, 240, 260, 300, 330];

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  milkType,
  setMilkType,
  startTemp,
  setStartTemp,
  volumeMl,
  setVolumeMl,
  material,
  setMaterial,
  targetWarmth,
  setTargetWarmth,
  customOffsetSec,
  setCustomOffsetSec,
}) => {
  const handleVolumeChange = (newVal: number) => {
    if (isNaN(newVal)) return;
    const clamped = Math.max(10, Math.min(330, newVal));
    setVolumeMl(clamped);
  };

  const handleStepDelta = (delta: number) => {
    handleVolumeChange(volumeMl + delta);
  };

  return (
    <div className="space-y-6">
      {/* 1. Milk Type Switcher: Breast Milk vs Formula */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          1. Tejtípus kiválasztása
        </label>
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-200/80 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 rounded-xl">
          <button
            type="button"
            onClick={() => setMilkType('breast_milk')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              milkType === 'breast_milk'
                ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40 dark:bg-cyan-600 dark:text-white'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80'
            }`}
          >
            <Milk className="w-4 h-4 text-white" />
            <span>Anyatej</span>
          </button>

          <button
            type="button"
            onClick={() => setMilkType('formula')}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-sm transition-all cursor-pointer ${
              milkType === 'formula'
                ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40 dark:bg-cyan-600 dark:text-white'
                : 'text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tápszer</span>
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {milkType === 'breast_milk'
            ? 'Anyatej-kímélő profil: az értékes immunanyagok és vitaminok 40°C alatti védelme.'
            : 'Tápszer profil: alapos összekeverés és biztonságos hőeloszlás kalkuláció.'}
        </p>
      </div>

      {/* 2. Initial Temperature Switcher */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          2. Kezdő hőmérséklet
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setStartTemp('fridge')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              startTemp === 'fridge'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <Thermometer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">~5 °C</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Hűtött tej</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-300">Hűtőszekrényből</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStartTemp('room')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              startTemp === 'room'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">~20 °C</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Szobahőmérséklet</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-300">Szobán állt / friss</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setStartTemp('frozen')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
              startTemp === 'frozen'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between">
              <Snowflake className="w-4 h-4 text-blue-500" />
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">-18 °C</span>
            </div>
            <div className="mt-2">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Fagyasztott</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-300">Kiolvasztás mód</div>
            </div>
          </button>
        </div>
      </div>

      {/* 3. Milk Volume (ml) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            3. Tej / tápszer mennyisége (1 ml pontossággal)
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleStepDelta(-10)}
              aria-label="Csökkentés 10 ml-rel"
              title="-10 ml"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold cursor-pointer"
            >
              -10
            </button>
            <button
              type="button"
              onClick={() => handleStepDelta(-1)}
              aria-label="Csökkentés 1 ml-rel"
              title="-1 ml"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold cursor-pointer"
            >
              -1
            </button>
            <div className="flex items-center px-2 py-0.5 bg-cyan-50 dark:bg-cyan-950/60 rounded-md border border-cyan-200 dark:border-cyan-800">
              <input
                type="number"
                min="10"
                max="330"
                step="1"
                value={volumeMl}
                onChange={(e) => handleVolumeChange(parseInt(e.target.value, 10))}
                className="w-12 text-center bg-transparent text-cyan-800 dark:text-cyan-300 font-bold font-mono text-base focus:outline-none"
              />
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400 ml-0.5">ml</span>
            </div>
            <button
              type="button"
              onClick={() => handleStepDelta(1)}
              aria-label="Növelés 1 ml-rel"
              title="+1 ml"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold cursor-pointer"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleStepDelta(10)}
              aria-label="Növelés 10 ml-rel"
              title="+10 ml"
              className="w-7 h-7 flex items-center justify-center rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-xs font-bold cursor-pointer"
            >
              +10
            </button>
          </div>
        </div>

        {/* Range Slider - 1 ml precision */}
        <input
          type="range"
          min="10"
          max="330"
          step="1"
          value={volumeMl}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          aria-label="Tejmennyiség milliliterben"
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-600"
        />

        {volumeMl <= 30 && (
          <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300">
            <strong>Kis adag ({volumeMl} ml):</strong> A cumisüveg alján lévő kevés tej a melegítőben gyorsabban átforrósodik. Figyeld a folyamatot, és azonnal vedd ki a jelzéskor!
          </div>
        )}

        {/* Quick Presets for standard Avent bottles */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {COMMON_VOLUMES.map((vol) => (
            <button
              key={vol}
              type="button"
              onClick={() => handleVolumeChange(vol)}
              className={`px-2.5 py-1 text-xs font-mono rounded-md border transition-all cursor-pointer ${
                volumeMl === vol
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white font-bold'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
              }`}
            >
              {vol} ml
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bottle Material Selection */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
          4. Cumisüveg anyaga (opcionális korrekció)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMaterial('plastic')}
            className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${
              material === 'plastic'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            Műanyag (PP)
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">Standard Avent</span>
          </button>

          <button
            type="button"
            onClick={() => setMaterial('glass')}
            className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${
              material === 'glass'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            Üvegpalack
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">-35 mp (gyorsabb)</span>
          </button>

          <button
            type="button"
            onClick={() => setMaterial('silicone')}
            className={`py-2 px-3 text-xs rounded-lg border text-center transition-all cursor-pointer ${
              material === 'silicone'
                ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
            }`}
          >
            Szilikon / Tasak
            <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">+30 mp (lassabb)</span>
          </button>
        </div>
      </div>

      {/* 5. Target Warmth Preference & Fine-Tuning */}
      {startTemp !== 'frozen' && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>5. Kívánt hőfok & Finomhangolás</span>
            </label>
            {customOffsetSec !== 0 && (
              <button
                type="button"
                onClick={() => setCustomOffsetSec(0)}
                className="text-[10px] text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer"
              >
                Visszaállítás (0 mp)
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setTargetWarmth('gentle')}
              className={`py-2 px-2.5 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                targetWarmth === 'gentle'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              Langyos
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">~36 °C (-15 mp)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetWarmth('standard')}
              className={`py-2 px-2.5 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                targetWarmth === 'standard'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              Testmeleg
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">~37 °C (Optimális)</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetWarmth('warm')}
              className={`py-2 px-2.5 text-xs rounded-lg border text-center transition-all cursor-pointer ${
                targetWarmth === 'warm'
                  ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/70 text-cyan-950 dark:text-cyan-100 font-bold ring-2 ring-cyan-500/40 shadow-sm'
                  : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              Melegebb
              <span className="block text-[10px] font-normal text-slate-500 dark:text-slate-400">~38 °C (+15 mp)</span>
            </button>
          </div>

          {/* Manual Fine-Tuning Buttons */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-xs">
            <span className="text-slate-600 dark:text-slate-300">
              Egyéni készülék-korrekció:
            </span>
            <div className="flex items-center gap-1.5 font-mono">
              <button
                type="button"
                onClick={() => setCustomOffsetSec(Math.max(-60, customOffsetSec - 10))}
                className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 flex items-center justify-center cursor-pointer"
                title="10 másodperccel kevesebb"
              >
                -10
              </button>
              <span className={`px-2 font-bold ${customOffsetSec > 0 ? 'text-amber-600 dark:text-amber-400' : customOffsetSec < 0 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                {customOffsetSec > 0 ? `+${customOffsetSec}` : customOffsetSec} mp
              </span>
              <button
                type="button"
                onClick={() => setCustomOffsetSec(Math.min(60, customOffsetSec + 10))}
                className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 flex items-center justify-center cursor-pointer"
                title="10 másodperccel több"
              >
                +10
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
