import React from 'react';
import { ShieldAlert, Sparkles, HeartHandshake, CheckCircle } from 'lucide-react';
import { MilkType } from '../types/warmer';

interface SafetyTipsProps {
  milkType: MilkType;
  onOpenGuide: () => void;
}

export const SafetyTips: React.FC<SafetyTipsProps> = ({ milkType, onOpenGuide }) => {
  return (
    <div className="bg-slate-50/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 text-xs sm:text-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Biztonságos etetési tanácsok: {milkType === 'breast_milk' ? 'Anyatej' : 'Tápszer'}</span>
        </h3>
        <button
          type="button"
          onClick={onOpenGuide}
          className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer"
        >
          Részletes útmutató &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Csuklópróba minden etetés előtt</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            A cumisüveg külső fala hűvösebb lehet, mint a belső tej. Mindig cseppents 1–2 cseppet a kézfejed vagy csuklód belső, érzékeny részére!
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>{milkType === 'breast_milk' ? 'Zsírréteg elkeverése' : 'Hot spots elkerülése'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {milkType === 'breast_milk'
              ? 'Az anyatej természetesen rétegekre válik szét. Melegítés után lassan forgasd át az üveget, hogy a tápláló zsír egyenletesen eloszoljon.'
              : 'A tápszert melegítés után alaposan keverd vagy forgasd össze, hogy sehol se alakulhassanak ki veszélyesen meleg pontok.'}
          </p>
        </div>

        <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>{milkType === 'breast_milk' ? 'Mikrózás és forralás tilos' : '1 órás fogyasztási szabály'}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {milkType === 'breast_milk'
              ? '40 °C felett a védő immunanyagok elpusztulnak. Ezért fontos a kíméletes vízfürdős Philips Avent melegítés és az időzítő betartása.'
              : 'A megmaradt tápszert a baba szájflórájából bekerülő baktériumok miatt tilos újra eltenni vagy újra melegíteni; 1 óra után dobd ki.'}
          </p>
        </div>
      </div>
    </div>
  );
};
