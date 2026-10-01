import React, { useState, useEffect } from 'react';
import { X, Plug, CheckCircle2, Copy, Send, Sparkles, HelpCircle, RefreshCw, Zap } from 'lucide-react';
import { HomeAssistantConfig } from '../types/warmer';
import {
  generateHomeAssistantAutomationYaml,
  sendHomeAssistantWebhook,
  checkHomeAssistantStatus,
  fetchHomeAssistantSwitches,
  setSwitchStateDirectly,
  HASwitchEntity,
} from '../utils/homeAssistant';

interface HomeAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: HomeAssistantConfig;
  onSaveConfig: (newConfig: HomeAssistantConfig) => void;
}

export const HomeAssistantModal: React.FC<HomeAssistantModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [localConfig, setLocalConfig] = useState<HomeAssistantConfig>(config);
  const [copied, setCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<{ running: boolean; message: string; success?: boolean } | null>(null);

  // Add-on environment state
  const [inHomeAssistant, setInHomeAssistant] = useState(false);
  const [loadingSwitches, setLoadingSwitches] = useState(false);
  const [availableSwitches, setAvailableSwitches] = useState<HASwitchEntity[]>([]);

  useEffect(() => {
    if (isOpen) {
      checkHomeAssistantStatus().then((status) => {
        setInHomeAssistant(status.inHomeAssistant);
        if (status.inHomeAssistant) {
          loadSwitches();
        }
      });
    }
  }, [isOpen]);

  const loadSwitches = async () => {
    setLoadingSwitches(true);
    const switches = await fetchHomeAssistantSwitches();
    setAvailableSwitches(switches);
    setLoadingSwitches(false);
    // Auto-select first Tapo switch if none selected
    if (!localConfig.entityId && switches.length > 0) {
      const tapo = switches.find((s) => s.entity_id.includes('tapo') || s.name.toLowerCase().includes('tapo'));
      if (tapo) {
        setLocalConfig((prev) => ({ ...prev, entityId: tapo.entity_id }));
      } else {
        setLocalConfig((prev) => ({ ...prev, entityId: switches[0].entity_id }));
      }
    }
  };

  if (!isOpen) return null;

  const handleCopyYaml = () => {
    const yaml = generateHomeAssistantAutomationYaml('avent_warmer', localConfig.entityId || 'switch.tapo_cumisuveg_melegito');
    navigator.clipboard.writeText(yaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    onClose();
  };

  const handleDirectSwitchTest = async (turnOn: boolean) => {
    if (!localConfig.entityId) return;
    setTestStatus({ running: true, message: `Konnektor ${turnOn ? 'bekapcsolása' : 'kikapcsolása'} folyamatban...` });

    if (inHomeAssistant) {
      const res = await setSwitchStateDirectly(localConfig.entityId, turnOn);
      if (res.success) {
        setTestStatus({
          running: false,
          success: true,
          message: `Sikeres vezérlés! A Home Assistant ${turnOn ? 'bekapcsolta' : 'kikapcsolta'} a konnektort (${localConfig.entityId}).`,
        });
      } else {
        setTestStatus({
          running: false,
          success: false,
          message: `Nem sikerült a vezérlés: ${res.error || 'Ismeretlen hiba'}`,
        });
      }
    } else {
      // Webhook test fallback
      const res = await sendHomeAssistantWebhook(localConfig, turnOn ? 'start' : 'finish', {
        volumeMl: 60,
        milkType: 'breast_milk',
        durationSeconds: 120,
      });
      if (res.success) {
        setTestStatus({
          running: false,
          success: true,
          message: `Sikeres teszt! A Home Assistant fogadta a Webhook hívást.`,
        });
      } else {
        setTestStatus({
          running: false,
          success: false,
          message: `Nem sikerült elérni a Webhookot: ${res.error}`,
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Plug className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>Tapo Okoskonnektor & Home Assistant</span>
              </h2>
              <p className="text-[11px] text-slate-500">Automatikus fűtéslekapcsolás és közvetlen entitás-vezérlés</p>
            </div>
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
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Add-on Direct Access Badge */}
          {inHomeAssistant ? (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-900 dark:text-emerald-200 text-xs block">
                  Home Assistant Add-on közvetlen hozzáférés aktív!
                </strong>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5">
                  A bővítmény a <code>SUPERVISOR_TOKEN</code> segítségével közvetlenül eléri az entitásokat. Nincs szükség manuális Webhookra vagy külső tokenekre!
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              💡 <strong>Tipp:</strong> Ha a Home Assistant bővítményként (Add-onként) futtatod ezt az appot, automatikusan felismeri az összes okoskonnektorodat, és egyetlen kattintással választhatsz a listából!
            </div>
          )}

          {/* Main Activation Toggle */}
          <div className="p-4 rounded-xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-800/60 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900 dark:text-white block">
                Okoskonnektor vezérlés bekapcsolása
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                A melegítő indításakor és leállásakor közvetlenül vezérli a konnektort
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={localConfig.enabled}
                onChange={(e) => setLocalConfig({ ...localConfig, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>

          {localConfig.enabled && (
            <div className="space-y-4 animate-fade-in">
              {/* Entity Selector: Dropdown in Add-on mode, Text input otherwise */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Válaszd ki a Tapo konnektort (Entity ID):
                  </label>
                  {inHomeAssistant && (
                    <button
                      type="button"
                      onClick={loadSwitches}
                      disabled={loadingSwitches}
                      className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${loadingSwitches ? 'animate-spin' : ''}`} />
                      <span>Lista frissítése</span>
                    </button>
                  )}
                </div>

                {inHomeAssistant && availableSwitches.length > 0 ? (
                  <select
                    value={localConfig.entityId}
                    onChange={(e) => setLocalConfig({ ...localConfig, entityId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none cursor-pointer"
                  >
                    {availableSwitches.map((sw) => (
                      <option key={sw.entity_id} value={sw.entity_id}>
                        {sw.name} ({sw.entity_id}) - [{sw.state.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="switch.tapo_p100_cumisuveg_melegito"
                    value={localConfig.entityId}
                    onChange={(e) => setLocalConfig({ ...localConfig, entityId: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                )}
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Példa: <code>switch.tapo_p100_cumisuveg_melegito</code>
                </span>
              </div>

              {/* Webhook URL input (only needed when running outside of Home Assistant Add-on) */}
              {!inHomeAssistant && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Home Assistant Webhook URL (külső elérés esetén):
                  </label>
                  <input
                    type="url"
                    placeholder="http://homeassistant.local:8123/api/webhook/avent_warmer"
                    value={localConfig.webhookUrl}
                    onChange={(e) => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.turnOnOnStart}
                    onChange={(e) => setLocalConfig({ ...localConfig, turnOnOnStart: e.target.checked })}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Konnektor bekapcsolása indításkor</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localConfig.turnOffOnFinish}
                    onChange={(e) => setLocalConfig({ ...localConfig, turnOffOnFinish: e.target.checked })}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Konnektor lekapcsolása lejáratkor</span>
                </label>
              </div>

              {/* Test Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDirectSwitchTest(true)}
                  disabled={testStatus?.running || !localConfig.entityId}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Konnektor BE teszt</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectSwitchTest(false)}
                  disabled={testStatus?.running || !localConfig.entityId}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Konnektor KI teszt</span>
                </button>
              </div>

              {testStatus && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    testStatus.success
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {testStatus.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <HelpCircle className="w-4 h-4 shrink-0" />}
                  <span>{testStatus.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Optional Automation YAML (mainly for reference or standalone use) */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-600" />
                <span>Home Assistant Értesítés & Hangszóró automatizmus</span>
              </span>
              <button
                type="button"
                onClick={handleCopyYaml}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Másolva!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>YAML másolása</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950 text-slate-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36 border border-slate-800 leading-relaxed">
                {generateHomeAssistantAutomationYaml('avent_warmer', localConfig.entityId || 'switch.tapo_cumisuveg_melegito')}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {inHomeAssistant ? '🟢 Bővítmény mód aktív' : 'Tapo P100 / P110 / P115'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Mégse
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white transition-colors cursor-pointer shadow-sm"
            >
              Mentés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
