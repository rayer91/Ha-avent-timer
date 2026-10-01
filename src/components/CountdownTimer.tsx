import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, Volume2, VolumeX, ShieldCheck, AlertTriangle, Plug } from 'lucide-react';
import { playTimerCompleteChime, playTickSound, playStartSound, initAudioOnUserInteraction } from '../utils/audio';
import { MilkType, HomeAssistantConfig } from '../types/warmer';
import { triggerHomeAssistantDevice, checkHomeAssistantStatus } from '../utils/homeAssistant';

interface CountdownTimerProps {
  initialSeconds: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  milkType: MilkType;
  volumeMl: number;
  onTimerFinished?: () => void;
  haConfig?: HomeAssistantConfig;
  onOpenHAModal?: () => void;
  onTimerStatusChange?: (status: { isRunning: boolean; timeLeft: number; isFinished: boolean }) => void;
  autoStartTrigger?: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  initialSeconds,
  soundEnabled,
  onToggleSound,
  milkType,
  volumeMl,
  onTimerFinished,
  haConfig,
  onOpenHAModal,
  onTimerStatusChange,
  autoStartTrigger,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [inHomeAssistant, setInHomeAssistant] = useState(false);

  useEffect(() => {
    checkHomeAssistantStatus().then((s) => setInHomeAssistant(s.inHomeAssistant));
  }, []);

  // Target timestamp in epoch milliseconds (immune to tab throttling and sleep)
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const finishedRef = useRef<boolean>(false);

  // Keep callback reference updated without triggering re-effects
  const onTimerFinishedRef = useRef(onTimerFinished);
  useEffect(() => {
    onTimerFinishedRef.current = onTimerFinished;
  }, [onTimerFinished]);

  // Clean interval cleanup
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle external explicit start trigger from Calculator
  const prevTriggerRef = useRef<number | undefined>(autoStartTrigger);
  useEffect(() => {
    if (autoStartTrigger !== undefined && autoStartTrigger !== prevTriggerRef.current) {
      prevTriggerRef.current = autoStartTrigger;
      // Start or restart with new initialSeconds
      stopInterval();
      finishedRef.current = false;
      setIsFinished(false);
      setTotalSeconds(initialSeconds);
      setTimeLeft(initialSeconds);
      endTimeRef.current = Date.now() + initialSeconds * 1000;
      setIsRunning(true);
      playStartSound(soundEnabled);

      if (haConfig?.enabled && haConfig?.turnOnOnStart) {
        triggerHomeAssistantDevice(
          haConfig,
          'start',
          { volumeMl, milkType, durationSeconds: initialSeconds },
          inHomeAssistant
        );
      }
    }
  }, [autoStartTrigger, initialSeconds, soundEnabled, haConfig, inHomeAssistant, milkType, stopInterval, volumeMl]);

  // If initialSeconds changed and timer was NOT started or paused (idle state)
  const prevInitialSecondsRef = useRef(initialSeconds);
  useEffect(() => {
    if (initialSeconds !== prevInitialSecondsRef.current) {
      prevInitialSecondsRef.current = initialSeconds;
      if (!isRunning && !isFinished && timeLeft === totalSeconds) {
        setTotalSeconds(initialSeconds);
        setTimeLeft(initialSeconds);
      }
    }
  }, [initialSeconds, isRunning, isFinished, timeLeft, totalSeconds]);

  // Keep parent informed of running state so Header can show live badge in background
  useEffect(() => {
    onTimerStatusChange?.({ isRunning, timeLeft, isFinished });
  }, [isRunning, timeLeft, isFinished, onTimerStatusChange]);

  // Request screen wake lock so the phone screen stays awake
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && isRunning) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch {
        // Ignore wake lock refusal
      }
    };

    if (isRunning) {
      requestWakeLock();
    }

    return () => {
      try {
        if (wakeLock && typeof wakeLock.release === 'function') {
          wakeLock.release().catch(() => {});
        }
      } catch {
        // Safe cleanup
      }
    };
  }, [isRunning]);

  // Main timer tick engine using wall-clock time
  useEffect(() => {
    if (!isRunning) {
      stopInterval();
      return;
    }

    // Interval checks every 200ms for smooth, drift-free countdown
    intervalRef.current = setInterval(() => {
      if (!endTimeRef.current) return;

      const remainingMs = endTimeRef.current - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      if (remainingSec <= 0) {
        stopInterval();
        endTimeRef.current = null;
        setTimeLeft(0);
        setIsRunning(false);
        setIsFinished(true);

        if (!finishedRef.current) {
          finishedRef.current = true;

          // Execute sound and callback asynchronously outside of render cycle
          setTimeout(() => {
            try {
              playTimerCompleteChime(soundEnabled);
            } catch (err) {
              console.warn('Audio chime failed:', err);
            }

            try {
              if (onTimerFinishedRef.current) {
                onTimerFinishedRef.current();
              }
            } catch (err) {
              console.warn('Timer finish callback error:', err);
            }

            // Home Assistant / Tapo automatic power cut-off
            if (haConfig?.enabled && haConfig?.turnOffOnFinish) {
              triggerHomeAssistantDevice(
                haConfig,
                'finish',
                { volumeMl, milkType, durationSeconds: totalSeconds },
                inHomeAssistant
              );
            }
          }, 50);
        }
      } else {
        setTimeLeft(remainingSec);
      }
    }, 200);

    return () => stopInterval();
  }, [isRunning, soundEnabled, stopInterval, haConfig, inHomeAssistant, milkType, totalSeconds, volumeMl]);

  const handleStartPause = () => {
    initAudioOnUserInteraction();

    if (isFinished) {
      // Restart from beginning
      finishedRef.current = false;
      endTimeRef.current = Date.now() + totalSeconds * 1000;
      setTimeLeft(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
      playStartSound(soundEnabled);

      if (haConfig?.enabled && haConfig?.turnOnOnStart) {
        triggerHomeAssistantDevice(
          haConfig,
          'start',
          { volumeMl, milkType, durationSeconds: totalSeconds },
          inHomeAssistant
        );
      }
      return;
    }

    if (!isRunning) {
      // Starting / resuming from exactly where it was paused
      finishedRef.current = false;
      const currentSeconds = timeLeft > 0 ? timeLeft : totalSeconds;
      endTimeRef.current = Date.now() + currentSeconds * 1000;
      setIsRunning(true);
      playStartSound(soundEnabled);

      if (haConfig?.enabled && haConfig?.turnOnOnStart) {
        triggerHomeAssistantDevice(
          haConfig,
          'start',
          { volumeMl, milkType, durationSeconds: totalSeconds },
          inHomeAssistant
        );
      }
    } else {
      // GENUINE PAUSE: save exact remaining seconds without resetting!
      stopInterval();
      if (endTimeRef.current) {
        const remainingSec = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
        setTimeLeft(remainingSec);
      }
      endTimeRef.current = null;
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    const wasRunning = isRunning;
    stopInterval();
    endTimeRef.current = null;
    finishedRef.current = false;
    setIsRunning(false);
    setIsFinished(false);
    setTimeLeft(totalSeconds);

    if (wasRunning && haConfig?.enabled && haConfig?.turnOffOnFinish) {
      triggerHomeAssistantDevice(
        haConfig,
        'cancel',
        { volumeMl, milkType, durationSeconds: totalSeconds },
        inHomeAssistant
      );
    }
  };

  const handleAdjustTime = (delta: number) => {
    initAudioOnUserInteraction();

    if (isFinished) {
      // If timer has already finished, clicking +30s immediately starts 30 seconds extra warming!
      const addSeconds = delta > 0 ? delta : 30;
      finishedRef.current = false;
      setIsFinished(false);
      setTotalSeconds(addSeconds);
      setTimeLeft(addSeconds);
      endTimeRef.current = Date.now() + addSeconds * 1000;
      setIsRunning(true);
      playStartSound(soundEnabled);

      if (haConfig?.enabled && haConfig?.turnOnOnStart) {
        triggerHomeAssistantDevice(
          haConfig,
          'start',
          { volumeMl, milkType, durationSeconds: addSeconds },
          inHomeAssistant
        );
      }
      return;
    }

    setTimeLeft((prev) => {
      const updated = Math.max(5, prev + delta);
      if (isRunning) {
        endTimeRef.current = Date.now() + updated * 1000;
      }
      if (updated > totalSeconds) {
        setTotalSeconds(updated);
      }
      return updated;
    });
    playTickSound(soundEnabled);
  };

  // Format time mm:ss
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // SVG circular progress calculation
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm p-6 flex flex-col items-center select-none max-w-full overflow-hidden">
      
      {/* Top Banner / Header */}
      <div className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4">
        <div className="flex items-center gap-2">
          <span className="font-semibold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">
            Melegítési Visszaszámláló
          </span>
          {haConfig?.enabled ? (
            <button
              type="button"
              onClick={onOpenHAModal}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-[10px] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="Tapo okoskonnektor csatlakoztatva: automatikus kikapcsolás aktív"
            >
              <Plug className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
              <span>Tapo aktív</span>
            </button>
          ) : onOpenHAModal ? (
            <button
              type="button"
              onClick={onOpenHAModal}
              className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer"
              title="Tapo okoskonnektor összekötése"
            >
              <Plug className="w-2.5 h-2.5" />
              <span>Tapo csatlakoztatása</span>
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onToggleSound}
          className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          {soundEnabled ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Hang be</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              <span>Némítva</span>
            </>
          )}
        </button>
      </div>

      {/* Circular Progress Ring with Digital Time */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 240 240">
          {/* Background Track Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className="stroke-slate-100 dark:stroke-slate-800"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="120"
            cy="120"
            r={radius}
            className={`transition-all duration-300 ease-linear ${
              isFinished
                ? 'stroke-emerald-500'
                : isRunning
                ? 'stroke-cyan-500'
                : 'stroke-cyan-400/60'
            }`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center Countdown Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {isFinished ? (
            <div>
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">
                KÉSZ!
              </span>
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mt-1">
                Vedd ki az üveget!
              </div>
              <div className="mt-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                0 mp van még hátra (lejárt)
              </div>
            </div>
          ) : (
            <>
              <span className="text-4xl sm:text-5xl font-mono font-black tracking-tight text-slate-900 dark:text-white tabular-nums">
                {formattedTime}
              </span>

              {/* Exact remaining seconds display */}
              <div className="mt-1 px-3 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800 text-xs sm:text-sm font-extrabold text-cyan-800 dark:text-cyan-300 tabular-nums shadow-2xs">
                {timeLeft} mp van még hátra
              </div>

              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                {isRunning ? 'Melegítés folyamatban...' : timeLeft === totalSeconds ? 'Indításra kész' : 'Szüneteltetve'}
              </span>
              <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold mt-0.5">
                {volumeMl} ml {milkType === 'breast_milk' ? 'anyatej' : 'tápszer'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Quick Fine-Tuning Buttons (+30s / -30s) */}
      <div className="flex items-center gap-3 my-4">
        <button
          type="button"
          onClick={() => handleAdjustTime(-30)}
          disabled={timeLeft <= 5 && !isFinished}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1"
        >
          <Minus className="w-3 h-3" /> 30 mp
        </button>

        <button
          type="button"
          onClick={() => handleAdjustTime(30)}
          title="30 másodperc hozzáadása (lejárat után azonnal indítja)"
          className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-lg border border-cyan-300 dark:border-cyan-700 bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-800 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" /> 30 mp
        </button>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm mt-1">
        {isFinished ? (
          <>
            {/* Quick +30s resume button when finished */}
            <button
              type="button"
              onClick={() => handleAdjustTime(30)}
              className="w-full sm:flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+30 mp Melegítés</span>
            </button>

            {/* Restart full original timer */}
            <button
              type="button"
              onClick={handleStartPause}
              className="w-full sm:flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Teljes újraindítás</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={handleStartPause}
            className={`w-full sm:flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                : 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Szünet</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>{timeLeft < totalSeconds ? 'Folytatás' : 'Indítás'}</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleReset}
          title="Alaphelyzetbe állítás"
          aria-label="Alaphelyzetbe állítás"
          className="w-full sm:w-12 h-10 sm:h-12 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="sm:hidden text-xs font-semibold ml-1.5">Alaphelyzet</span>
        </button>
      </div>

      {/* Post-Warming Safety Checklist when timer completes */}
      {isFinished && (
        <div className="w-full mt-6 p-4 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold text-sm mb-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Kész! 3 lépéses biztonsági ellenőrzés etetés előtt:</span>
          </div>
          <ol className="space-y-1.5 text-xs text-emerald-900 dark:text-emerald-300 pl-6 list-decimal">
            <li>
              <strong>Azonnal vedd ki</strong> a cumisüveget a készülékből, hogy a maradék forró víz ne melegítse túl a tejet.
            </li>
            <li>
              <strong>Gyengéden forgasd át</strong> a cumisüveget körkörös mozdulattal, hogy a meleg egyenletesen eloszoljon (forró pontok elkerülése).
            </li>
            <li>
              <strong>Csuklóteszt:</strong> Cseppents 1–2 csepp tejet a csuklód belső érzékeny bőrére. Kellemesen testmelegnek (kb. 37 °C) kell lennie, sohasem forrónak!
            </li>
          </ol>
        </div>
      )}

      {/* Gentle in-progress reminder */}
      {isRunning && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Ha letelt az idő, azonnal vedd ki az üveget a túlmelegedés elkerülésére!</span>
        </div>
      )}
    </div>
  );
};
