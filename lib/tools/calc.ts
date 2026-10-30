import { clamp } from "@/lib/utils";

export function paceSecondsPerKm(distanceKm: number, totalSeconds: number) {
  if (distanceKm <= 0 || totalSeconds <= 0) return NaN;
  return totalSeconds / distanceKm;
}

export function timeFromPace(distanceKm: number, secondsPerKm: number) {
  if (distanceKm <= 0 || secondsPerKm <= 0) return NaN;
  return distanceKm * secondsPerKm;
}

export function riegel(timeSeconds: number, fromKm: number, toKm: number, exponent = 1.06) {
  if (timeSeconds <= 0 || fromKm <= 0 || toKm <= 0) return NaN;
  return timeSeconds * Math.pow(toKm / fromKm, exponent);
}

export function speedKmh(distanceKm: number, totalSeconds: number) {
  if (distanceKm <= 0 || totalSeconds <= 0) return NaN;
  return distanceKm / (totalSeconds / 3600);
}

export function maxHeartRateTanaka(age: number) {
  if (age <= 0) return NaN;
  return 208 - 0.7 * age;
}

export type Zone = {
  zone: number;
  low: number;
  high: number;
  label: "recovery" | "easy" | "tempo" | "threshold" | "vo2";
};

export function heartRateZones(age: number, restingHr: number | null, method: "max" | "reserve"): Zone[] {
  const max = maxHeartRateTanaka(age);
  const rest = restingHr && restingHr > 0 ? restingHr : 0;
  const bands: [number, number, Zone["label"]][] = [
    [0.5, 0.6, "recovery"],
    [0.6, 0.7, "easy"],
    [0.7, 0.8, "tempo"],
    [0.8, 0.9, "threshold"],
    [0.9, 1.0, "vo2"],
  ];
  return bands.map(([low, high, label], index) => {
    if (method === "reserve" && rest > 0) {
      return {
        zone: index + 1,
        low: rest + low * (max - rest),
        high: rest + high * (max - rest),
        label,
      };
    }
    return { zone: index + 1, low: low * max, high: high * max, label };
  });
}

export function cadenceFromSteps(steps: number, totalSeconds: number) {
  if (steps <= 0 || totalSeconds <= 0) return NaN;
  return steps / (totalSeconds / 60);
}

export function trainingPaces(fiveKPaceSeconds: number) {
  const factors = {
    easyLow: 1.25,
    easyHigh: 1.35,
    marathonLow: 1.13,
    marathonHigh: 1.18,
    tempoLow: 1.03,
    tempoHigh: 1.06,
    intervalLow: 0.95,
    intervalHigh: 0.98,
  };
  return {
    easy: [fiveKPaceSeconds * factors.easyLow, fiveKPaceSeconds * factors.easyHigh] as const,
    marathon: [fiveKPaceSeconds * factors.marathonLow, fiveKPaceSeconds * factors.marathonHigh] as const,
    tempo: [fiveKPaceSeconds * factors.tempoLow, fiveKPaceSeconds * factors.tempoHigh] as const,
    interval: [fiveKPaceSeconds * factors.intervalLow, fiveKPaceSeconds * factors.intervalHigh] as const,
  };
}

export function weeklyMileage(currentKm: number, weeks: number, includeDeload = true) {
  const rows: { week: number; volume: number; type: "build" | "deload" }[] = [];
  let volume = currentKm;
  for (let week = 1; week <= weeks; week += 1) {
    const deload = includeDeload && week % 4 === 0;
    if (deload) {
      volume = volume * 0.8;
    } else if (week > 1) {
      volume = volume * 1.1;
    }
    rows.push({ week, volume: Math.round(volume * 10) / 10, type: deload ? "deload" : "build" });
  }
  return rows;
}

export type PlanWeek = {
  week: number;
  totalKm: number;
  longRunKm: number;
  quality: "easy" | "tempo" | "intervals";
  taper: boolean;
};

export function trainingPlan(raceKm: number, weeks: number, currentWeeklyKm: number) {
  const safeWeeks = clamp(Math.round(weeks), 4, 24);
  const peak = Math.max(currentWeeklyKm * 1.35, raceKm * 0.9, 20);
  const taperWeeks = safeWeeks >= 8 ? 2 : 1;
  const buildWeeks = safeWeeks - taperWeeks;
  const rows: PlanWeek[] = [];
  const start = Math.max(currentWeeklyKm, 10);

  for (let week = 1; week <= safeWeeks; week += 1) {
    let total: number;
    let taper = false;
    if (week <= buildWeeks) {
      const progress = buildWeeks === 1 ? 1 : (week - 1) / (buildWeeks - 1);
      const deload = week % 4 === 0;
      total = start + (peak - start) * progress;
      if (deload) total *= 0.82;
    } else {
      taper = true;
      const remaining = safeWeeks - week + 1;
      total = peak * (remaining === 1 ? 0.55 : 0.72);
    }
    const longRun = Math.min(raceKm * 0.8, Math.max(total * 0.3, 8));
    const quality: PlanWeek["quality"] = week % 3 === 0 ? "intervals" : week % 2 === 0 ? "tempo" : "easy";
    rows.push({
      week,
      totalKm: Math.round(total * 10) / 10,
      longRunKm: Math.round((taper ? longRun * 0.7 : longRun) * 10) / 10,
      quality: taper ? "easy" : quality,
      taper,
    });
  }
  return rows;
}

export function equivalentFlatKm(distanceKm: number, climbM: number) {
  if (distanceKm <= 0) return NaN;
  return distanceKm + Math.max(0, climbM) / 100;
}

const MET_TABLE: { speed: number; met: number }[] = [
  { speed: 6, met: 6.0 },
  { speed: 8, met: 8.3 },
  { speed: 10, met: 9.8 },
  { speed: 11, met: 10.5 },
  { speed: 12, met: 11.8 },
  { speed: 13, met: 12.8 },
  { speed: 14, met: 13.5 },
  { speed: 16, met: 15.0 },
];

export function metForSpeed(kmh: number) {
  if (!Number.isFinite(kmh) || kmh <= 0) return NaN;
  if (kmh <= MET_TABLE[0].speed) return MET_TABLE[0].met;
  for (let i = 1; i < MET_TABLE.length; i += 1) {
    const prev = MET_TABLE[i - 1];
    const next = MET_TABLE[i];
    if (kmh <= next.speed) {
      const ratio = (kmh - prev.speed) / (next.speed - prev.speed);
      return prev.met + ratio * (next.met - prev.met);
    }
  }
  return MET_TABLE[MET_TABLE.length - 1].met;
}

export function caloriesBurned(weightKg: number, distanceKm: number, totalSeconds: number) {
  if (weightKg <= 0 || distanceKm <= 0 || totalSeconds <= 0) return NaN;
  const kmh = speedKmh(distanceKm, totalSeconds);
  const met = metForSpeed(kmh);
  const minutes = totalSeconds / 60;
  return (met * 3.5 * weightKg) / 200 * minutes;
}

export function marathonFromHalf(halfSeconds: number) {
  return riegel(halfSeconds, 21.0975, 42.195, 1.06);
}

export const AGE_FACTORS: { age: number; factor: number }[] = [
  { age: 20, factor: 1.0 },
  { age: 25, factor: 1.0 },
  { age: 30, factor: 1.0 },
  { age: 35, factor: 0.965 },
  { age: 40, factor: 0.925 },
  { age: 45, factor: 0.88 },
  { age: 50, factor: 0.83 },
  { age: 55, factor: 0.775 },
  { age: 60, factor: 0.715 },
  { age: 65, factor: 0.655 },
  { age: 70, factor: 0.595 },
  { age: 75, factor: 0.535 },
  { age: 80, factor: 0.475 },
  { age: 85, factor: 0.42 },
  { age: 90, factor: 0.36 },
];

export function ageFactor(age: number) {
  const a = clamp(age, 20, 90);
  for (let i = 1; i < AGE_FACTORS.length; i += 1) {
    const prev = AGE_FACTORS[i - 1];
    const next = AGE_FACTORS[i];
    if (a <= next.age) {
      const ratio = (a - prev.age) / (next.age - prev.age);
      return prev.factor + ratio * (next.factor - prev.factor);
    }
  }
  return AGE_FACTORS[AGE_FACTORS.length - 1].factor;
}

export function ageGradedTime(actualSeconds: number, age: number) {
  if (actualSeconds <= 0) return NaN;
  return actualSeconds * ageFactor(age);
}

export function countdown(target: string, now = new Date()) {
  const diff = new Date(target).getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  return {
    totalSeconds,
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    passed: diff < 0,
  };
}

export function splitRows(totalSeconds: number, segments: number, type: "even" | "negative" | "positive") {
  if (totalSeconds <= 0 || segments <= 0) return [];
  const base = totalSeconds / segments;
  const delta = type === "even" ? 0 : type === "negative" ? -base * 0.02 : base * 0.02;
  const rows: { segment: number; split: number; cumulative: number }[] = [];
  let cumulative = 0;
  for (let i = 1; i <= segments; i += 1) {
    const split = base + delta * (i - (segments + 1) / 2);
    cumulative += split;
    rows.push({ segment: i, split, cumulative });
  }
  const scale = totalSeconds / cumulative;
  let scaledCumulative = 0;
  return rows.map((row) => {
    const split = row.split * scale;
    scaledCumulative += split;
    return { segment: row.segment, split, cumulative: scaledCumulative };
  });
}
