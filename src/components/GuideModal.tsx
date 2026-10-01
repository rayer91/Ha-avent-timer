import React from 'react';
import { X, BookOpen, ShieldCheck, AlertCircle, Sparkles, Droplets } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Philips Avent & Babaetetési Útmutató
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          
          {/* Section: Anyatej */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
              <h3>Anyatej melegítési aranyszabályok</h3>
            </div>
            <ul className="space-y-1.5 pl-4 list-disc">
              <li>
                <strong>Hőmérsékleti határ (max. 37–40 °C):</strong> Az anyatej élő sejteket, védő antitesteket, enzimeket és vitaminokat tartalmaz. 40 °C felett a bioaktív fehérjék denaturálódnak (elveszítik immunvédő hatásukat).
              </li>
              <li>
                <strong>Mikrohullámú sütő tilos:</strong> A mikró egyenetlenül melegít, hirtelen forró pontokat hoz létre, ami égési sérülést okozhat és elpusztítja a tápanyagokat.
              </li>
              <li>
                <strong>Óvatos körkörös keverés:</strong> Az állás során az anyatej zsírrétege felülre gyűlik. Melegítés után lassan forgasd át a palackot; ne rázd agresszíven, hogy a fehérjemolekulák épek maradjanak.
              </li>
              <li>
                <strong>Egyszer melegíthető:</strong> A felmelegített és megmaradt anyatejet tilos újra hűtőbe tenni és később felmelegíteni a bakteriális fertőzések elkerüléséért.
              </li>
            </ul>
          </div>

          {/* Section: Tápszer */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3>Tápszer készítési és melegítési szabályok</h3>
            </div>
            <ul className="space-y-1.5 pl-4 list-disc">
              <li>
                <strong>1 órás szabály:</strong> A felmelegített tápszert az etetés megkezdésétől számítva maximum 1 órán belül el kell fogyasztani, a maradékot pedig ki kell önteni!
              </li>
              <li>
                <strong>Egyenletes hőeloszlás:</strong> A tápszer sűrűbb lehet, ezért melegítés után alapos keverés/forgatás szükséges, hogy a hő teljesen egyenletesen terjedjen el a cumisüvegben.
              </li>
              <li>
                <strong>Előre elkészített tápszer:</strong> Ha hűtőben tárolt kész tápszert melegítesz, mindig válaszd a "Hűtött (~5°C)" opciót a pontos időzítéshez.
              </li>
            </ul>
          </div>

          {/* Section: Avent Melegítő használat */}
          <div>
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm sm:text-base mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <h3>Hogyan használd a Philips Avent melegítőt?</h3>
            </div>
            <ol className="space-y-2 pl-4 list-decimal">
              <li>
                Helyezd a cumisüveget a melegítő közepébe.
              </li>
              <li>
                <strong>Vízszint:</strong> Önts friss, szobahőmérsékletű csapvizet a tartályba pontosan a tej szintjéig (de legalább 1 cm-rel a készülék felső széle alatt).
              </li>
              <li>
                Fordítsd a tárcsát a kalkulátor által jelzett fokozatra (≤180 ml esetén az alacsony cumisüvegre, &gt;180 ml esetén a magas cumisüvegre, fagyasztottnál a hópehelyre).
              </li>
              <li>
                Indítsd el az időzítőt az appban. Amikor lejár, azonnal vedd ki az üveget!
              </li>
              <li>
                Fordítsd vissza a tárcsát a "KI" (O) állásba, és húzd ki a konnektorból.
              </li>
            </ol>
          </div>

          {/* Section: Vízkőtelenítés */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 mb-1">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span>Karbantartás és vízkőtelenítés:</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              A melegítési idő megnyúlhat, ha vízkő rakódik le a melegítő fűtőlapján. 4 hetente keverj össze 50 ml háztartási ecetet 100 ml hideg vízzel, öntsd a melegítőbe, kapcsold be a ≤180 ml állásra 10 percre, majd öblítsd ki alaposan.
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
            Értem, köszönöm
          </button>
        </div>
      </div>
    </div>
  );
};
