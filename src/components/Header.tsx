import React from 'react';
import { Volume2, VolumeX, Moon, Sun, Table, BookOpen, Plug, Calculator, Timer, History } from 'lucide-react';
import { HomeAssistantConfig } from '../types/warmer';

interface HeaderProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  nightMode: boolean;
  onToggleNightMode: () => void;
  onOpenTableModal: () => void;
  onOpenGuideModal: () => void;
  onOpenHAModal: () => void;
  haConfig: HomeAssistantConfig;
  activeView: 'calculator' | 'timer' | 'history';
  setActiveView: (view: 'calculator' | 'timer' | 'history') => void;
  timerRunning?: boolean;
  timerSecondsLeft?: number;
}

export const Header: React.FC<HeaderProps> = ({
  soundEnabled,
  onToggleSound,
  nightMode,
  onToggleNightMode,
  onOpenTableModal,
  onOpenGuideModal,
  onOpenHAModal,
  haConfig,
  activeView,
  setActiveView,
  timerRunning = false,
  timerSecondsLeft = 0,
}) => {
  const formatTimerShort = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Left: Brand / Title (Compact on mobile) */}
        <button
          onClick={() => setActiveView('calculator')}
          className="text-left group cursor-pointer focus-visible:outline-none shrink-0"
        >
          <span className="text-base sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1 sm:gap-2">
            <span className="text-cyan-600 dark:text-cyan-400 font-black">AVENT</span>
            <span className="hidden md:inline text-slate-700 dark:text-slate-200 font-medium">Cumisüveg Időzítő</span>
          </span>
        </button>

        {/* Center: Main Navigation Tabs (Fits any screen width) */}
        <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-200/90 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 p-0.5 sm:p-1 rounded-xl shadow-2xs shrink-0">
          <button
            onClick={() => setActiveView('calculator')}
            title="Kalkulátor & Beállítás"
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'calculator'
                ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40 dark:bg-cyan-600 dark:text-white'
                : 'text-slate-700 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kalkulátor</span>
          </button>

          <button
            onClick={() => setActiveView('timer')}
            title="Visszaszámláló időzítő"
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 relative ${
              activeView === 'timer'
                ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40 dark:bg-cyan-600 dark:text-white'
                : 'text-slate-700 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Időzítő</span>
            {timerRunning ? (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-300 font-extrabold sm:inline">
                  {formatTimerShort(timerSecondsLeft)}
                </span>
              </span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveView('history')}
            title="Etetési & Melegítési Napló"
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'history'
                ? 'bg-cyan-600 text-white shadow-sm ring-1 ring-cyan-400/40 dark:bg-cyan-600 dark:text-white'
                : 'text-slate-700 dark:text-slate-100 hover:text-slate-950 dark:hover:text-white hover:bg-slate-300/60 dark:hover:bg-slate-700/80'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Napló</span>
          </button>
        </nav>

        {/* Right: Quick Action Utility Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Tapo / HA Button */}
          <button
            onClick={onOpenHAModal}
            title={haConfig.enabled ? 'Tapo konnektor: Bekapcsolva' : 'Tapo okoskonnektor & HA integráció'}
            className={`h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1 border relative ${
              haConfig.enabled
                ? 'border-emerald-500 bg-emerald-500/15 text-emerald-800 dark:text-emerald-200'
                : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <Plug className={`w-3.5 h-3.5 ${haConfig.enabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-cyan-600 dark:text-cyan-400'}`} />
            <span className="hidden lg:inline">Tapo / HA</span>
            {haConfig.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            )}
          </button>

          {/* Reference Table Modal Button (Visible on sm+) */}
          <button
            onClick={onOpenTableModal}
            title="Gyári referencia táblázat"
            aria-label="Gyári referencia táblázat"
            className="hidden sm:flex h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer items-center gap-1"
          >
            <Table className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Táblázat</span>
          </button>

          {/* Safety Guide Modal Button (Visible on sm+) */}
          <button
            onClick={onOpenGuideModal}
            title="Biztonsági útmutató"
            aria-label="Biztonsági útmutató"
            className="hidden sm:flex h-8 sm:h-9 px-2 sm:px-2.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Útmutató</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Hangjelzés kikapcsolása' : 'Hangjelzés bekapcsolása'}
            title={soundEnabled ? 'Hangjelzés aktív' : 'Hangjelzés némítva'}
            className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />}
          </button>

          {/* Night Mode Toggle */}
          <button
            type="button"
            onClick={onToggleNightMode}
            aria-label={nightMode ? 'Nappali mód bekapcsolása' : 'Éjszakai mód (szemkímélő)'}
            title={nightMode ? 'Nappali világos mód' : 'Éjszakai sötét mód'}
            className="w-8 sm:w-9 h-8 sm:h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            {nightMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>
    </header>
  );
};
