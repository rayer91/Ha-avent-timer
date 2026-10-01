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
 * Returns the correct base URL for API requests.
 * In Home Assistant Ingress, the browser pathname starts with /api/hassio_ingress/<token>/
 * Standard relative fetches without this prefix get intercepted by the root Home Assistant origin (port 8123)
 * resulting in 404 Not Found. This helper extracts the active Ingress prefix.
 */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname || '';
  const ingressIdx = pathname.indexOf('/api/hassio_ingress/');
  if (ingressIdx !== -1) {
    const sub = pathname.substring(ingressIdx);
    const parts = sub.split('/');
    if (parts.length >= 4) {
      return parts.slice(0, 4).join('/');
    }
  }
  return '';
}

/**
 * Checks if the app is currently running as a Home Assistant Add-on with Supervisor API access
 */
export async function checkHomeAssistantStatus(): Promise<HAStatusResponse> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ha/status`);
    if (!res.ok) return { inHomeAssistant: false, supervisorOnline: false };
    const data = await res.json();
    return {
      inHomeAssistant: Boolean(data.inHomeAssistant),
      supervisorOnline: Boolean(data.supervisorOnline),
    };
  } catch {
    return { inHomeAssistant: false, supervisorOnline: false };
  }
}

/**
 * Fetches all switch and plug entities from Home Assistant via the Supervisor API
 */
export async function fetchHomeAssistantSwitches(): Promise<HASwitchEntity[]> {
  try {
    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/api/ha/switches`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.entities || [];
  } catch {
    return [];
  }
}

/**
 * Directly control a switch or plug via the internal Supervisor API
 */
export async function setSwitchStateDirectly(
  entityId: string,
  turnOn: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const baseUrl = getApiBaseUrl();
    const endpoint = turnOn ? `${baseUrl}/api/ha/switch/turn_on` : `${baseUrl}/api/ha/switch/turn_off`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entity_id: entityId }),
    });
    const data = await res.json();
    return { success: Boolean(data.success), error: data.error };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Hálózati hiba a vezérlés során' };
  }
}

/**
 * Universal dispatcher:
 * - Direct Home Assistant API mode: used whenever an entityId is selected or in Add-on environment (NO WEBHOOK REQUIRED!)
 * - Webhook mode: used ONLY if an explicit Webhook URL is provided by the user.
 */
export async function triggerHomeAssistantDevice(
  config: HomeAssistantConfig,
  event: 'start' | 'finish' | 'cancel',
  details: {
    volumeMl: number;
    milkType: MilkType;
    durationSeconds: number;
  },
  _isDirectSupervisor?: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled) {
    return { success: false, error: 'A Home Assistant integráció ki van kapcsolva.' };
  }

  const shouldTurnOn = event === 'start';

  // 1. Direct Control via Home Assistant Entity ID (Default & Recommended Path!)
  if (config.entityId) {
    const directResult = await setSwitchStateDirectly(config.entityId, shouldTurnOn);

    // If successfully finished, also request a friendly in-app Home Assistant notification
    if (event === 'finish' && directResult.success) {
      const baseUrl = getApiBaseUrl();
      fetch(`${baseUrl}/api/ha/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '✅ KÉSZ A BABA TEJE!',
          message: `A ${details.volumeMl} ml tej felmelegedett. A konnektor lekapcsolva, vedd ki az üveget!`,
        }),
      }).catch(() => {});
    }

    if (directResult.success || !config.webhookUrl) {
      return directResult;
    }
  }

  // 2. Webhook Mode (ONLY used if an explicit Webhook URL is actually configured!)
  if (config.webhookUrl && config.webhookUrl.trim() !== '') {
    return sendHomeAssistantWebhook(config, event, details);
  }

  return {
    success: false,
    error: 'Kérlek válaszd ki a vezérelni kívánt konnektort (Entity ID) a beállításokban!',
  };
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
  if (!config.enabled || !config.webhookUrl || config.webhookUrl.trim() === '') {
    return { success: false, error: 'Nincs megadva Webhook URL.' };
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
    return { success: false, error: err?.message || 'Hálózati hiba a Home Assistant Webhook elérésekor' };
  }
}

/**
 * Generates ready-to-copy Home Assistant YAML automation code for Tapo plug integration (optional webhook fallback).
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
          - service: homeassistant.turn_on
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
          - service: homeassistant.turn_off
            target:
              entity_id: ${tapoEntity}
          - service: notify.notify
            data:
              title: "✅ KÉSZ A BABA TEJE!"
              message: "A {{ trigger.json.volume_ml }} ml tej felmelegedett! A Tapo konnektor lekapcsolva, vedd ki az üveget!"

mode: restart
`;
}
