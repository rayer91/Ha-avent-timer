import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { ResultCard } from './components/ResultCard';
import { AventDial } from './components/AventDial';
import { CountdownTimer } from './components/CountdownTimer';
import { SafetyTips } from './components/SafetyTips';
import { ReferenceTableModal } from './components/ReferenceTableModal';
import { GuideModal } from './components/GuideModal';
import { HomeAssistantModal } from './components/HomeAssistantModal';
import { FeedingLog } from './components/FeedingLog';
import { calculateAventWarming } from './utils/calculator';
import { MilkType, StartTemp, BottleMaterial, TargetWarmth, FeedingLogEntry, HomeAssistantConfig } from './types/warmer';
import { DEFAULT_HA_CONFIG } from './utils/homeAssistant';
import { ArrowRight } from 'lucide-react';

const STORAGE_KEY_FEEDING_LOGS = 'avent_warmer_feeding_logs_v1';
const STORAGE_KEY_SETTINGS = 'avent_warmer_user_settings_v1';
const STORAGE_KEY_HA_CONFIG = 'avent_warmer_ha_config_v1';

export default function App() {
  // Calculator state
  const [milkType, setMilkType] = useState<MilkType>('breast_milk');
  const [startTemp, setStartTemp] = useState<StartTemp>('fridge');
  const [volumeMl, setVolumeMl] = useState<number>(120);
  const [material, setMaterial] = useState<BottleMaterial>('plastic');
  const [targetWarmth, setTargetWarmth] = useState<TargetWarmth>('standard');
  const [customOffsetSec, setCustomOffsetSec] = useState<number>(0);

  // App UI state
  const [activeView, setActiveView] = useState<'calculator' | 'timer' | 'history'>('calculator');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [nightMode, setNightMode] = useState<boolean>(false);
  const [isLoggedCurrent, setIsLoggedCurrent] = useState<boolean>(false);

  // Background timer state
  const [timerAutoStartTrigger, setTimerAutoStartTrigger] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(0);

  // Modals state
  const [tableModalOpen, setTableModalOpen] = useState<boolean>(false);
  const [guideModalOpen, setGuideModalOpen] = useState<boolean>(false);
  const [haModalOpen, setHaModalOpen] = useState<boolean>(false);

  // Home Assistant & Tapo Config
  const [haConfig, setHaConfig] = useState<HomeAssistantConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HA_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_HA_CONFIG;
  });

  // Feeding logs history state
  const [feedingLogs, setFeedingLogs] = useState<FeedingLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FEEDING_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load feeding logs', e);
    }
    return [];
  });

  // Load saved preferences
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
        if (parsed.nightMode !== undefined) setNightMode(parsed.nightMode);
        if (parsed.material) setMaterial(parsed.material);
        if (parsed.volumeMl) setVolumeMl(parsed.volumeMl);
      }
    } catch (e) {
      console.error('Failed to load user settings', e);
    }
  }, []);

  // Sync dark class on root html element
  useEffect(() => {
    const root = document.documentElement;
    if (nightMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [nightMode]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_SETTINGS,
        JSON.stringify({ soundEnabled, nightMode, material, volumeMl })
      );
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [soundEnabled, nightMode, material, volumeMl]);

  // Persist Home Assistant configuration
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HA_CONFIG, JSON.stringify(haConfig));
    } catch (e) {
      console.error('Failed to save Home Assistant config', e);
    }
  }, [haConfig]);

  // Persist feeding logs
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_FEEDING_LOGS, JSON.stringify(feedingLogs));
    } catch (e) {
      console.error('Failed to save feeding logs', e);
    }
  }, [feedingLogs]);

  // Reset logged status when parameters change
  useEffect(() => {
    setIsLoggedCurrent(false);
  }, [volumeMl, startTemp, milkType, material]);

  // Memoized calculation
  const calculation = useMemo(() => {
    return calculateAventWarming(
      volumeMl,
      startTemp,
      milkType,
      material,
      targetWarmth,
      customOffsetSec
    );
  }, [volumeMl, startTemp, milkType, material, targetWarmth, customOffsetSec]);

  // Start timer explicitly with new calculated duration
  const handleStartTimer = () => {
    setTimerAutoStartTrigger((prev) => prev + 1);
    setActiveView('timer');
  };

  const handleLogFeeding = useCallback(() => {
    try {
      const newEntry: FeedingLogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: Date.now(),
        milkType,
        volumeMl,
        startTemp,
        durationSeconds: calculation.seconds,
      };
      setFeedingLogs((prev) => [newEntry, ...prev.slice(0, 49)]); // keep up to 50 entries
      setIsLoggedCurrent(true);
    } catch (err) {
      console.error('Error logging feeding:', err);
    }
  }, [milkType, volumeMl, startTemp, calculation.seconds]);

  const handleDeleteEntry = (id: string) => {
    setFeedingLogs((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleClearLogs = () => {
    if (window.confirm('Biztosan törölni szeretnéd az összes etetési előzményt?')) {
      setFeedingLogs([]);
    }
  };

  const handleDialSelect = (setting: 'defrost' | 'milk_low' | 'milk_high' | 'food' | 'keep_warm' | 'off') => {
    if (setting === 'defrost') {
      setStartTemp('frozen');
    } else if (setting === 'milk_low') {
      if (startTemp === 'frozen') setStartTemp('fridge');
      if (volumeMl > 180) setVolumeMl(150);
    } else if (setting === 'milk_high') {
      if (startTemp === 'frozen') setStartTemp('fridge');
      if (volumeMl <= 180) setVolumeMl(210);
    }
  };

  return (
    <div className={nightMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200 flex flex-col justify-between overflow-x-hidden w-full max-w-full">
        <div className="w-full max-w-full overflow-x-hidden">
          {/* Top Bar Header */}
          <Header
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled((prev) => !prev)}
            nightMode={nightMode}
            onToggleNightMode={() => setNightMode((prev) => !prev)}
            onOpenTableModal={() => setTableModalOpen(true)}
            onOpenGuideModal={() => setGuideModalOpen(true)}
            onOpenHAModal={() => setHaModalOpen(true)}
            haConfig={haConfig}
            activeView={activeView}
            setActiveView={setActiveView}
            timerRunning={timerRunning}
            timerSecondsLeft={timerSecondsLeft}
          />

          {/* Main Content Area */}
          <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden w-full">
            {/* Context Header */}
            <div className="border-b border-slate-200/80 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 mb-1">
                <span>Philips Avent Gyors Cumisüveg-Melegítő</span>
                <span>·</span>
                <span>SCF355 / SCF358 referencia</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeView === 'calculator' && 'Időzítés & Beállítás Kalkulátor'}
                {activeView === 'timer' && 'Cumisüveg Melegítési Visszaszámláló'}
                {activeView === 'history' && 'Etetési & Melegítési Napló'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
                {activeView === 'calculator' && 'Add meg a cumisüveg tartalmát és kiindulási hőmérsékletét a melegítési idő és a helyes Avent tárcsafokozat kiszámításához.'}
                {activeView === 'timer' && 'Indítsd el a visszaszámlálót. A letelt idő után hangjelzés figyelmeztet, és a csatlakoztatott Tapo konnektor automatikusan áramtalanít.'}
                {activeView === 'history' && 'Itt találod a korábbi etetések és melegítések részletes naplóját.'}
              </p>
            </div>

            {/* View 1: Calculator & Avent Dial Card (Kept mounted for instant responsiveness) */}
            <div className={activeView === 'calculator' ? 'space-y-8 animate-fade-in' : 'hidden'}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Input Form (7 cols) */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-6 shadow-xs">
                  <CalculatorForm
                    milkType={milkType}
                    setMilkType={setMilkType}
                    startTemp={startTemp}
                    setStartTemp={setStartTemp}
                    volumeMl={volumeMl}
                    setVolumeMl={setVolumeMl}
                    material={material}
                    setMaterial={setMaterial}
                    targetWarmth={targetWarmth}
                    setTargetWarmth={setTargetWarmth}
                    customOffsetSec={customOffsetSec}
                    setCustomOffsetSec={setCustomOffsetSec}
                  />
                </div>

                {/* Right Column: Result Card & Clean Dial Setting Card (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <ResultCard
                    result={calculation}
                    milkType={milkType}
                    startTemp={startTemp}
                    volumeMl={volumeMl}
                    onStartTimer={handleStartTimer}
                    onLogFeeding={handleLogFeeding}
                    isLogged={isLoggedCurrent}
                  />

                  {/* Clean Avent Dial Setting Card (Icon & Text, no bulky dial image) */}
                  <AventDial
                    currentSetting={calculation.dialSetting.id}
                    onSelectSetting={handleDialSelect}
                    interactive={false}
                  />
                </div>
              </div>

              {/* Safety Tips and Quick Guidelines */}
              <SafetyTips milkType={milkType} onOpenGuide={() => setGuideModalOpen(true)} />
            </div>

            {/* View 2: Live Countdown Timer View (KEPT MOUNTED IN BACKGROUND SO IT NEVER STOPS!) */}
            <div className={activeView === 'timer' ? 'space-y-6 animate-fade-in max-w-2xl mx-auto' : 'hidden'}>
              {/* Active Parameters Ribbon */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Aktuális beállítás:
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-50 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 font-bold">
                    {volumeMl} ml {milkType === 'breast_milk' ? 'Anyatej' : 'Tápszer'}
                  </span>
                  <span className="text-slate-500">
                    ({startTemp === 'fridge' ? 'Hűtött' : startTemp === 'room' ? 'Szobahőm.' : 'Kiolvasztás'})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveView('calculator')}
                  className="text-cyan-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Módosítás a kalkulátorban</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Timer Main Widget */}
              <CountdownTimer
                initialSeconds={calculation.seconds}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled((prev) => !prev)}
                milkType={milkType}
                volumeMl={volumeMl}
                haConfig={haConfig}
                onOpenHAModal={() => setHaModalOpen(true)}
                autoStartTrigger={timerAutoStartTrigger}
                onTimerStatusChange={(st) => {
                  setTimerRunning(st.isRunning);
                  setTimerSecondsLeft(st.timeLeft);
                }}
                onTimerFinished={() => {
                  handleLogFeeding();
                }}
              />

              {/* Quick Avent Dial Reminder alongside timer */}
              <div className="p-4 bg-slate-100/80 dark:bg-slate-850/80 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {calculation.dialSetting.id === 'defrost' ? '❄' : '🍼'}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Philips Avent tárcsa: {calculation.dialSetting.nameHu}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Vízszint: a cumisüveg tejmagasságáig
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setGuideModalOpen(true)}
                  className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold hover:underline cursor-pointer"
                >
                  Útmutató
                </button>
              </div>
            </div>

            {/* View 3: Feeding & Warming History Log */}
            <div className={activeView === 'history' ? 'animate-fade-in' : 'hidden'}>
              <FeedingLog
                entries={feedingLogs}
                onClear={handleClearLogs}
                onDeleteEntry={handleDeleteEntry}
                onNewCalculation={() => setActiveView('calculator')}
              />
            </div>
          </main>
        </div>

        {/* Global Footer */}
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 mt-12 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <span>Philips Avent SCF355 / SCF358 kompatibilis digitális segédprogram.</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setTableModalOpen(true)}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Gyári Táblázat
              </button>
              <button
                type="button"
                onClick={() => setGuideModalOpen(true)}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer"
              >
                Biztonsági Útmutató
              </button>
              <button
                type="button"
                onClick={() => setHaModalOpen(true)}
                className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors cursor-pointer text-emerald-600 dark:text-emerald-400 font-bold"
              >
                Tapo / HA
              </button>
            </div>
          </div>
        </footer>

        {/* Reference Table Modal */}
        <ReferenceTableModal
          isOpen={tableModalOpen}
          onClose={() => setTableModalOpen(false)}
        />

        {/* Safety Guide Modal */}
        <GuideModal
          isOpen={guideModalOpen}
          onClose={() => setGuideModalOpen(false)}
        />

        {/* Home Assistant & Tapo Setup Modal */}
        <HomeAssistantModal
          isOpen={haModalOpen}
          onClose={() => setHaModalOpen(false)}
          config={haConfig}
          onSaveConfig={(newConfig) => setHaConfig(newConfig)}
        />
      </div>
    </div>
  );
}
