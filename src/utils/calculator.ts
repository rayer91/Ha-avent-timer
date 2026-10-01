import { BottleMaterial, CalculationResult, MilkType, StartTemp, TargetWarmth } from '../types/warmer';

export interface OfficialTableRow {
  volumeRange: string;
  volumeLabelHu: string;
  roomTempMin: number; // in minutes (e.g. 3, 4.5)
  fridgeTempMin: number; // in minutes (e.g. 4.5, 5.5, 3.5)
  frozenHours: string; // e.g. "1 - 1.5 hrs"
  dialSettingId: 'milk_low' | 'milk_high';
  dialSettingLabel: string;
}

/**
 * EXACT Official Philips Avent Warming Reference Table from the SCF355 user manual:
 * ---------------------------------------------------------------------------------
 * Milk content        | 20°C (Room) | 5°C (Fridge) | Frozen
 * 60-90ml / 2-3oz     | 3 min       | 4.5 min      | 1-1.5 hrs
 * 90-110ml / 3-4oz    | 3 min       | 5.5 min      | -
 * 125-150ml / 4-5oz   | 3 min       | 3.5 min      | -
 * 180-210ml / 6-7oz   | 4 min       | 5.5 min      | 1.5-2.5 hrs
 * 240-260ml / 8-9oz   | 4.5 min     | 7 min        | -
 * 290-330ml / 10-11oz | 5 min       | 7.5 min      | -
 */
export const OFFICIAL_AVENT_TABLE: OfficialTableRow[] = [
  {
    volumeRange: '60-90ml / 2-3oz',
    volumeLabelHu: '60 – 90 ml (2 – 3 oz)',
    roomTempMin: 3.0,
    fridgeTempMin: 4.5,
    frozenHours: '1 – 1.5 óra (hrs)',
    dialSettingId: 'milk_low',
    dialSettingLabel: '≤ 180 ml',
  },
  {
    volumeRange: '90-110ml / 3-4oz',
    volumeLabelHu: '90 – 110 ml (3 – 4 oz)',
    roomTempMin: 3.0,
    fridgeTempMin: 5.5,
    frozenHours: '1 – 1.5 óra',
    dialSettingId: 'milk_low',
    dialSettingLabel: '≤ 180 ml',
  },
  {
    volumeRange: '125-150ml / 4-5oz',
    volumeLabelHu: '125 – 150 ml (4 – 5 oz)',
    roomTempMin: 3.0,
    fridgeTempMin: 3.5,
    frozenHours: '1 – 1.5 óra',
    dialSettingId: 'milk_low',
    dialSettingLabel: '≤ 180 ml',
  },
  {
    volumeRange: '180-210ml / 6-7oz',
    volumeLabelHu: '180 – 210 ml (6 – 7 oz)',
    roomTempMin: 4.0,
    fridgeTempMin: 5.5,
    frozenHours: '1.5 – 2.5 óra (hrs)',
    dialSettingId: 'milk_high',
    dialSettingLabel: '> 180 ml',
  },
  {
    volumeRange: '240-260ml / 8-9oz',
    volumeLabelHu: '240 – 260 ml (8 – 9 oz)',
    roomTempMin: 4.5,
    fridgeTempMin: 7.0,
    frozenHours: '1.5 – 2.5 óra',
    dialSettingId: 'milk_high',
    dialSettingLabel: '> 180 ml',
  },
  {
    volumeRange: '290-330ml / 10-11oz',
    volumeLabelHu: '290 – 330 ml (10 – 11 oz)',
    roomTempMin: 5.0,
    fridgeTempMin: 7.5,
    frozenHours: '1.5 – 2.5 óra',
    dialSettingId: 'milk_high',
    dialSettingLabel: '> 180 ml',
  },
];

/**
 * Returns the exact base seconds from the Philips Avent reference table based on volume and start temperature.
 */
export function getBaseAventSeconds(volumeMl: number, startTemp: StartTemp): { seconds: number; bracketName: string } {
  const vol = Math.max(10, Math.min(330, volumeMl));

  // Small volumes below 60ml:
  // The official table starts at 60ml (room 3 min, fridge 4.5 min).
  // For smaller amounts (10-59ml), timing is scaled according to water bath thermal latency:
  // - 10ml: room ~45s, fridge ~80s (1:20)
  // - 30ml: room ~75s (1:15), fridge ~130s (2:10)
  // - 60ml: room 180s (3:00), fridge 270s (4:30)
  if (vol < 60) {
    if (vol <= 10) {
      if (startTemp === 'room') return { seconds: 45, bracketName: '10 ml (újszülött adag)' };
      if (startTemp === 'fridge') return { seconds: 80, bracketName: '10 ml (újszülött adag)' };
      return { seconds: 1800, bracketName: '10 ml (kiolvasztás)' };
    }
    if (vol <= 30) {
      const ratio = (vol - 10) / 20; // 0 to 1
      const roomS = Math.round(45 + ratio * (75 - 45));
      const fridgeS = Math.round(80 + ratio * (130 - 80));
      if (startTemp === 'room') return { seconds: roomS, bracketName: `${vol} ml (kis adag)` };
      if (startTemp === 'fridge') return { seconds: fridgeS, bracketName: `${vol} ml (kis adag)` };
      return { seconds: 2400, bracketName: `${vol} ml (kiolvasztás)` };
    }
    // 31 to 59 ml
    const ratio = (vol - 30) / 30; // 0 to 1
    const roomS = Math.round(75 + ratio * (180 - 75));
    const fridgeS = Math.round(130 + ratio * (270 - 130));
    if (startTemp === 'room') return { seconds: roomS, bracketName: `${vol} ml (átmeneti adag)` };
    if (startTemp === 'fridge') return { seconds: fridgeS, bracketName: `${vol} ml (átmeneti adag)` };
    return { seconds: 3600, bracketName: `${vol} ml (kiolvasztás)` };
  }

  // Bracket 1: 60 - 90 ml (2-3 oz) -> 20°C: 3 min (180s), 5°C: 4.5 min (270s)
  if (vol <= 90) {
    if (startTemp === 'room') return { seconds: 180, bracketName: '60 – 90 ml (2 – 3 oz)' };
    if (startTemp === 'fridge') return { seconds: 270, bracketName: '60 – 90 ml (2 – 3 oz)' };
    return { seconds: 4500, bracketName: '60 – 90 ml (1 – 1.5 óra kiolvasztás)' };
  }

  // Bracket 2: 91 - 115 ml (90-110 ml / 3-4 oz) -> 20°C: 3 min (180s), 5°C: 5.5 min (330s)
  if (vol <= 115) {
    if (startTemp === 'room') return { seconds: 180, bracketName: '90 – 110 ml (3 – 4 oz)' };
    if (startTemp === 'fridge') return { seconds: 330, bracketName: '90 – 110 ml (3 – 4 oz)' };
    return { seconds: 4500, bracketName: '90 – 110 ml (kiolvasztás)' };
  }

  // Bracket 3: 116 - 165 ml (125-150 ml / 4-5 oz) -> 20°C: 3 min (180s), 5°C: 3.5 min (210s)
  if (vol <= 165) {
    if (startTemp === 'room') return { seconds: 180, bracketName: '125 – 150 ml (4 – 5 oz)' };
    if (startTemp === 'fridge') return { seconds: 210, bracketName: '125 – 150 ml (4 – 5 oz)' };
    return { seconds: 5400, bracketName: '125 – 150 ml (kiolvasztás)' };
  }

  // Bracket 4: 166 - 225 ml (180-210 ml / 6-7 oz) -> 20°C: 4 min (240s), 5°C: 5.5 min (330s)
  if (vol <= 225) {
    if (startTemp === 'room') return { seconds: 240, bracketName: '180 – 210 ml (6 – 7 oz)' };
    if (startTemp === 'fridge') return { seconds: 330, bracketName: '180 – 210 ml (6 – 7 oz)' };
    return { seconds: 7200, bracketName: '180 – 210 ml (1.5 – 2.5 óra kiolvasztás)' };
  }

  // Bracket 5: 226 - 275 ml (240-260 ml / 8-9 oz) -> 20°C: 4.5 min (270s), 5°C: 7 min (420s)
  if (vol <= 275) {
    if (startTemp === 'room') return { seconds: 270, bracketName: '240 – 260 ml (8 – 9 oz)' };
    if (startTemp === 'fridge') return { seconds: 420, bracketName: '240 – 260 ml (8 – 9 oz)' };
    return { seconds: 7200, bracketName: '240 – 260 ml (kiolvasztás)' };
  }

  // Bracket 6: 276 - 330 ml (290-330 ml / 10-11 oz) -> 20°C: 5 min (300s), 5°C: 7.5 min (450s)
  if (startTemp === 'room') return { seconds: 300, bracketName: '290 – 330 ml (10 – 11 oz)' };
  if (startTemp === 'fridge') return { seconds: 450, bracketName: '290 – 330 ml (10 – 11 oz)' };
  return { seconds: 7200, bracketName: '290 – 330 ml (kiolvasztás)' };
}

export function calculateAventWarming(
  volumeMl: number,
  startTemp: StartTemp,
  milkType: MilkType,
  material: BottleMaterial = 'plastic',
  targetWarmth: TargetWarmth = 'standard',
  customOffsetSec: number = 0
): CalculationResult {
  const clampedVol = Math.max(10, Math.min(330, volumeMl));

  // 1. Exact base timing from the official Philips Avent Warming Reference Table
  const { seconds: baseTableSeconds, bracketName } = getBaseAventSeconds(clampedVol, startTemp);
  let computedSeconds = baseTableSeconds;

  // 2. Material compensation (glass conducts faster, silicone slightly slower)
  let materialOffset = 0;
  if (material === 'glass' && startTemp !== 'frozen') {
    materialOffset = clampedVol < 60 ? -15 : -30;
  } else if (material === 'silicone' && startTemp !== 'frozen') {
    materialOffset = clampedVol < 60 ? +15 : +30;
  }

  // 3. Target warmth adjustment
  let warmthOffset = 0;
  if (startTemp !== 'frozen') {
    if (targetWarmth === 'gentle') {
      warmthOffset = clampedVol < 40 ? -10 : -15;
    } else if (targetWarmth === 'warm') {
      warmthOffset = clampedVol < 40 ? +10 : +15;
    }
  }

  // Final seconds including user offset
  const finalSeconds = Math.max(25, computedSeconds + materialOffset + warmthOffset + customOffsetSec);

  // Minutes and seconds display
  const m = Math.floor(finalSeconds / 60);
  const s = finalSeconds % 60;
  const timeDisplay = `${m}:${s.toString().padStart(2, '0')}`;

  // Human friendly minutes range
  let rangeStr: string;
  if (startTemp === 'frozen') {
    rangeStr = clampedVol <= 150 ? '1 – 1.5 óra' : '1.5 – 2.5 óra';
  } else {
    const minVal = (finalSeconds / 60).toFixed(1);
    rangeStr = `${minVal} perc (${m}p ${s}mp)`;
  }

  // Dial setting according to the official manual:
  // - ≤ 180 ml: small bottle icon
  // - > 180 ml: large bottle icon
  // - frozen: snowflake icon
  let dialSetting: CalculationResult['dialSetting'];
  if (startTemp === 'frozen') {
    dialSetting = {
      id: 'defrost',
      nameHu: 'Kiolvasztás (Hópehely ❄️)',
      description: 'Állítsd a forgótárcsát a hópehely ikonra. A vízfürdő kíméletesen, túlhevítés nélkül olvasztja ki a tejet.',
      icon: '❄️',
      dialAngle: -50,
    };
  } else if (clampedVol <= 180) {
    dialSetting = {
      id: 'milk_low',
      nameHu: 'Tej melegítése ≤ 180 ml (🍼)',
      description: 'Állítsd a tárcsát az alacsonyabb cumisüveg szimbólumra (≤ 180 ml).',
      icon: '🍼',
      dialAngle: 0,
    };
  } else {
    dialSetting = {
      id: 'milk_high',
      nameHu: 'Tej melegítése > 180 ml (🍼+)',
      description: 'Állítsd a tárcsát a magasabb cumisüveg szimbólumra (> 180 ml).',
      icon: '🍼+',
      dialAngle: 50,
    };
  }

  // Water level guideline from Philips Avent user manual
  const waterGuideline = clampedVol <= 30
    ? `Kis adagnál (${clampedVol} ml) a tartályba a cumisüveg tejmagasságáig érő vizet tölts (kb. 1–2 cm mélység)!`
    : `Tölts annyi friss csapvizet a melegítőbe, hogy a víz szintje pontosan elérje a cumisüvegben lévő tej magasságát (${clampedVol} ml), de legfeljebb 1 cm-re legyen a perem alatt!`;

  const notes: string[] = [
    `Hivatalos referencia sáv: ${bracketName}.`,
  ];

  if (clampedVol >= 125 && clampedVol <= 150 && startTemp === 'fridge') {
    notes.push('Gyári sajátosság: A 125–150 ml-es hűtött adag a hivatalos Avent táblázatban 3.5 perc (3:30) a gyorsabb víz-üveg felületi hőátadás miatt.');
  }

  if (milkType === 'breast_milk') {
    notes.push('Anyatej védelem: Az időzítés a 37 °C testhőmérséklethez igazodik, megóvva az anyatej immunanyagait.');
  } else {
    notes.push('Tápszer: Melegítés után gyengéden forgasd át az üveget, hogy a hő eloszlása egyenletes legyen.');
  }

  if (material === 'glass') {
    notes.push('Üveg cumisüveg: Az üveg jobb hővezetése miatt a melegítés 30 másodperccel rövidebb.');
  } else if (material === 'silicone') {
    notes.push('Szilikon/tasak: A szigetelőbb fal miatt +30 másodperc szükséges.');
  }

  return {
    seconds: finalSeconds,
    timeDisplay,
    minutesRange: rangeStr,
    dialSetting,
    waterGuideline,
    notes,
  };
}
