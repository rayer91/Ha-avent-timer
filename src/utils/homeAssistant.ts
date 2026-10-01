import { HomeAssistantConfig, MilkType } from '../types/warmer';

export const DEFAULT_HA_CONFIG: HomeAssistantConfig = {
  enabled: false,
  webhookUrl: '',
  turnOnOnStart: true,
  turnOffOnFinish: true,
  entityId: 'switch.tapo_cumisuveg_melegito',
};

export interface HASwitchEntity {
  entity_id: string;
  name: string;
  state: string;
}

export interface HAStatusResponse {
  inHomeAssistant: boolean;
  supervisorOnline: boolean;
}

/**
 * Checks if the app is currently running as a Home Assistant Add-on with Supervisor API access
 */
export async function checkHomeAssistantStatus(): Promise<HAStatusResponse> {
  try {
    const res = await fetch('/api/ha/status');
    if (!res.ok) return { inHomeAssistant: false, supervisorOnline: false };
    return await res.json();
  } catch {
    return { inHomeAssistant: false, supervisorOnline: false };
  }
}

/**
 * Fetches all switch entities from Home Assistant via the Supervisor API
 */
export async function fetchHomeAssistantSwitches(): Promise<HASwitchEntity[]> {
  try {
    const res = await fetch('/api/ha/switches');
    if (!res.ok) return [];
    const data = await res.json();
    return data.entities || [];
  } catch {
    return [];
  }
}

/**
 * Directly control a switch via the internal Supervisor API
 */
export async function setSwitchStateDirectly(
  entityId: string,
  turnOn: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const endpoint = turnOn ? '/api/ha/switch/turn_on' : '/api/ha/switch/turn_off';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_id: entityId }),
    });
    const data = await res.json();
    return { success: data.success, error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Hálózati hiba' };
  }
}

/**
 * Universal dispatcher: uses direct Supervisor API if available in Add-on mode,
 * otherwise falls back to Webhook mode.
 */
export async function triggerHomeAssistantDevice(
  config: HomeAssistantConfig,
  event: 'start' | 'finish' | 'cancel',
  details: {
    volumeMl: number;
    milkType: MilkType;
    durationSeconds: number;
  },
  isDirectSupervisor: boolean = false
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled) {
    return { success: false, error: 'A Home Assistant integráció ki van kapcsolva.' };
  }

  // 1. Direct Supervisor API Mode (Inside Home Assistant Add-on)
  if (isDirectSupervisor && config.entityId) {
    const shouldTurnOn = event === 'start';
    const directResult = await setSwitchStateDirectly(config.entityId, shouldTurnOn);

    // Also send an in-app notification if finished
    if (event === 'finish' && directResult.success) {
      fetch('/api/ha/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '✅ KÉSZ A BABA TEJE!',
          message: `A ${details.volumeMl} ml tej felmelegedett. A konnektor lekapcsolva, vedd ki az üveget!`,
        }),
      }).catch(() => {});
    }

    return directResult;
  }

  // 2. Webhook Fallback Mode (For external access)
  if (config.webhookUrl) {
    return sendHomeAssistantWebhook(config, event, details);
  }

  return { success: false, error: 'Nincs beállítva entitás vagy Webhook URL.' };
}

export async function sendHomeAssistantWebhook(
  config: HomeAssistantConfig,
  event: 'start' | 'finish' | 'cancel',
  details: {
    volumeMl: number;
    milkType: MilkType;
    durationSeconds: number;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled || !config.webhookUrl) {
    return { success: false, error: 'Home Assistant integráció nincs bekapcsolva vagy nincs webhook URL megadva.' };
  }

  try {
    const payload = {
      event,
      device: 'philips_avent_warmer',
      entity_id: config.entityId || 'switch.tapo_cumisuveg_melegito',
      action: event === 'start' ? 'turn_on' : 'turn_off',
      volume_ml: details.volumeMl,
      milk_type: details.milkType,
      duration_seconds: details.durationSeconds,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      mode: 'cors',
    });

    if (!response.ok && response.status !== 200) {
      return { success: false, error: `Home Assistant HTTP válaszkód: ${response.status}` };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('Home Assistant webhook trigger failed:', err);
    return { success: false, error: err?.message || 'Hálózati hiba a Home Assistant elérésekor' };
  }
}

/**
 * Generates ready-to-copy Home Assistant YAML automation code for Tapo plug integration.
 */
export function generateHomeAssistantAutomationYaml(webhookId: string = 'avent_warmer', tapoEntity: string = 'switch.tapo_cumisuveg_melegito'): string {
  return `alias: "Avent Melegítő & Tapo Konnektor Automatikus Vezérlés"
description: "Automatikusan bekapcsolja a Tapo konnektort melegítéskor, lejáratkor kikapcsolja és értesítést küld."
trigger:
  - platform: webhook
    webhook_id: "${webhookId}"
    allowed_methods:
      - POST
    local_only: true
condition: []
action:
  - choose:
      # 1. Esemény: Melegítés indítása -> Tapo konnektor BE
      - conditions:
          - condition: template
            value_template: "{{ trigger.json.event == 'start' }}"
        sequence:
          - service: switch.turn_on
            target:
              entity_id: ${tapoEntity}
          - service: notify.notify
            data:
              title: "🍼 Cumisüveg melegítés elindult"
              message: "{{ trigger.json.volume_ml }} ml {{ 'anyatej' if trigger.json.milk_type == 'breast_milk' else 'tápszer' }} melegítése indult."

      # 2. Esemény: Melegítés befejeződött -> Tapo konnektor KI és értesítés!
      - conditions:
          - condition: template
            value_template: "{{ trigger.json.event == 'finish' }}"
        sequence:
          - service: switch.turn_off
            target:
              entity_id: ${tapoEntity}
          - service: notify.notify
            data:
              title: "✅ KÉSZ A BABA TEJE!"
              message: "A {{ trigger.json.volume_ml }} ml tej felmelegedett! A Tapo konnektor lekapcsolva, vedd ki az üveget!"

mode: restart
`;
}
