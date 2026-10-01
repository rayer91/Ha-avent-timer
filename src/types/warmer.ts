export type MilkType = 'breast_milk' | 'formula';

export type StartTemp = 'fridge' | 'room' | 'frozen';

export type BottleMaterial = 'plastic' | 'glass' | 'silicone';

export type TargetWarmth = 'gentle' | 'standard' | 'warm';

export interface CalculationResult {
  seconds: number;
  timeDisplay: string; // e.g., "3:30"
  minutesRange: string; // e.g., "3 – 3.5 perc"
  dialSetting: {
    id: 'defrost' | 'milk_low' | 'milk_high' | 'food' | 'keep_warm';
    nameHu: string;
    description: string;
    icon: string;
    dialAngle: number; // degrees for visual dial
  };
  waterGuideline: string;
  notes: string[];
}

export interface FeedingLogEntry {
  id: string;
  timestamp: number;
  milkType: MilkType;
  volumeMl: number;
  startTemp: StartTemp;
  durationSeconds: number;
}

export interface HomeAssistantConfig {
  enabled: boolean;
  webhookUrl: string;
  turnOnOnStart: boolean;
  turnOffOnFinish: boolean;
  entityId: string;
}

