import React from 'react';
import { Droplet, Info, Check } from 'lucide-react';

interface AventDialProps {
  currentSetting: 'defrost' | 'milk_low' | 'milk_high' | 'food' | 'keep_warm' | 'off';
  onSelectSetting?: (setting: 'defrost' | 'milk_low' | 'milk_high' | 'food' | 'keep_warm' | 'off') => void;
  interactive?: boolean;
}

const SETTING_INFO: Record<
  string,
  { nameHu: string; label: string; icon: string; description: string; water: string; badgeColor: string }
> = {
  defrost: {
    nameHu: 'Kiolvasztás (Hópehely)',
    label: 'Kiolvasztás',
    icon: '❄️',
    description: 'Állítsd a tárcsát a hópehely ikonra fagyasztott tej vagy bébiétel kíméletes kiolvasztásához.',
    water: 'A fagyasztott tej / étel szintjéig tölts vizet a melegítőbe.',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  milk_low: {
    nameHu: 'Tej melegítése (≤ 180 ml)',
    label: 'Normál tejmennyiség',
    icon: '🍼',
    description: 'Állítsd a tárcsát a cumisüveg ikonra (180 ml vagy annál kevesebb tejhez).',
    water: 'Tölts friss csapvizet a cumisüveg tejmagasságáig.',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
  },
  milk_high: {
    nameHu: 'Tej melegítése (> 180 ml)',
    label: 'Nagyobb tejmennyiség',
    icon: '🍼+',
    description: 'Állítsd a tárcsát a nagyobb tejadag jelzésre (180 ml feletti mennyiségnél).',
    water: 'Tölts vizet a cumisüveg tejmagasságáig (kb. 1 cm-rel a perem alatt).',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
  food: {
    nameHu: 'Bébiétel melegítése',
    label: 'Bébiételes üveg / edény',
    icon: '🥣',
    description: 'Állítsd a tárcsát a bébiételes tégely szimbólumra.',
    water: 'A bébiételes üveg ételmagasságáig tölts vizet.',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  keep_warm: {
    nameHu: 'Melegen tartás',
    label: 'Hőntartás',
    icon: '♨️',
    description: 'Állítsd a melegen tartás állásra, ha nem tudod azonnal odaadni.',
    water: 'A cumisüveg tejmagasságáig.',
    badgeColor: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  },
  off: {
    nameHu: 'Kikapcsolva',
    label: 'Kikapcsolt állapot',
    icon: '○',
    description: 'Kikapcsolt állapot.',
    water: '-',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  },
};

export const AventDial: React.FC<AventDialProps> = ({
  currentSetting,
  onSelectSetting,
  interactive = true,
}) => {
  const active = SETTING_INFO[currentSetting] || SETTING_INFO.milk_low;

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors">
      <div className="flex items-start gap-3">
        {/* Large Clean Icon */}
        <div className="w-12 h-12 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0 select-none">
          {active.icon}
        </div>

        {/* Text Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avent Tárcsa Beállítás
            </span>
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${active.badgeColor}`}>
              {active.label}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
            {active.nameHu}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {active.description}
          </p>

          {/* Water level reminder */}
          <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-cyan-800 dark:text-cyan-300 bg-cyan-50/80 dark:bg-cyan-950/40 p-2 rounded-lg border border-cyan-100 dark:border-cyan-900/50">
            <Droplet className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span><strong>Vízszint:</strong> {active.water}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
