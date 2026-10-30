"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Copy } from "lucide-react";
import {
  ageFactor,
  ageGradedTime,
  cadenceFromSteps,
  caloriesBurned,
  countdown,
  equivalentFlatKm,
  heartRateZones,
  marathonFromHalf,
  paceSecondsPerKm,
  riegel,
  speedKmh,
  splitRows,
  timeFromPace,
  trainingPaces,
  trainingPlan,
  weeklyMileage,
} from "@/lib/tools/calc";
import { cn, formatDuration, formatNumber, formatPace, parseTimeToSeconds } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/settings";

type ToolProps = { locale: Locale };

const fieldClass =
  "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink outline-none transition placeholder:text-subtle focus:border-accent/70";

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card p-5 sm:p-6", className)}>
      <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-subtle">{title}</p>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="mb-1.5 block text-xs font-medium text-muted">{children}</span>;
}

function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(event.target.value)}
          className={cn(fieldClass, suffix && "pr-12")}
        />
        {suffix ? <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[0.65rem] text-subtle">{suffix}</span> : null}
      </div>
    </label>
  );
}

function TimeField({
  label,
  h,
  m,
  s,
  onChange,
}: {
  label: string;
  h: string;
  m: string;
  s: string;
  onChange: (part: "h" | "m" | "s", value: string) => void;
}) {
  const t = useTranslation("tools").t;
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        {[
          { key: "h" as const, value: h, label: t("hours"), max: 48 },
          { key: "m" as const, value: m, label: t("minutes"), max: 59 },
          { key: "s" as const, value: s, label: t("seconds"), max: 59 },
        ].map((part) => (
          <label key={part.key} className="relative block">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={part.max}
              value={part.value}
              onChange={(event) => onChange(part.key, event.target.value)}
              className={cn(fieldClass, "pr-9 text-center font-mono")}
              aria-label={`${label} — ${part.label}`}
            />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[0.6rem] uppercase text-subtle">
              {part.key}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultRow({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <div>
        <p className="text-xs text-muted">{label}</p>
        {hint ? <p className="mt-0.5 font-mono text-[0.58rem] text-subtle">{hint}</p> : null}
      </div>
      <p className="shrink-0 font-mono text-sm font-medium text-ink">{value}</p>
    </div>
  );
}

function BigResult({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-accent/25 bg-accent-soft/60 p-4">
      <p className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const { t } = useTranslation("tools");
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-accent"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-teal" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? t("copied") : t("copy")}
    </button>
  );
}

function Invalid() {
  const { t } = useTranslation("tools");
  return <p className="rounded-lg border border-dashed border-line bg-canvas px-3 py-2 text-xs text-subtle">{t("invalid")}</p>;
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] border-collapse text-left text-xs">
        <thead>
          <tr className="border-b border-line">
            {head.map((cell) => (
              <th key={cell} className="pb-2 pr-4 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-subtle">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-line/70 last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="py-2 pr-4 text-muted">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaceTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [mode, setMode] = useState<"time" | "pace">("time");
  const [distance, setDistance] = useState("10");
  const [h, setH] = useState("0");
  const [m, setM] = useState("50");
  const [s, setS] = useState("0");
  const [pm, setPm] = useState("5");
  const [ps, setPs] = useState("0");

  const dist = Number(distance);
  const timeSeconds = mode === "time" ? parseTimeToSeconds(h, m, s) : timeFromPace(dist, Number(pm) * 60 + Number(ps));
  const paceSeconds = mode === "time" ? paceSecondsPerKm(dist, timeSeconds) : Number(pm) * 60 + Number(ps);
  const speed = speedKmh(dist, timeSeconds);
  const valid = Number.isFinite(paceSeconds) && paceSeconds > 0 && Number.isFinite(speed);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="mb-5 inline-flex rounded-full border border-line bg-canvas p-1">
          {(["time", "pace"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition",
                mode === option ? "bg-accent text-white dark:text-[#04101F]" : "text-muted hover:text-ink",
              )}
            >
              {option === "time" ? t("fromTime") : t("fromPace")}
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <NumberField label={t("distanceKm")} value={distance} onChange={setDistance} min={0.1} step={0.1} />
          {mode === "time" ? (
            <TimeField
              label={t("targetTime")}
              h={h}
              m={m}
              s={s}
              onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <NumberField label={`${t("pace")} (${t("minutes")})`} value={pm} onChange={setPm} min={0} step={1} />
              <NumberField label={`${t("pace")} (${t("seconds")})`} value={ps} onChange={setPs} min={0} max={59} step={1} />
            </div>
          )}
        </div>
      </Panel>
      <Panel title={t("results")}>
        {valid ? (
          <div className="space-y-4">
            <BigResult label={t("pace")} value={formatPace(paceSeconds)} />
            <div>
              <ResultRow label={t("targetTime")} value={formatDuration(timeSeconds)} />
              <ResultRow label={t("speed")} value={`${formatNumber(speed, locale, 2)} ${t("kmh")}`} />
              <ResultRow label={`${t("pace")} / mi`} value={formatPace(paceSeconds, "mi")} />
            </div>
            <CopyButton value={`${formatPace(paceSeconds)} · ${formatDuration(timeSeconds)}`} />
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

const RACE_DISTANCES = [
  { value: "5", key: "fiveK" },
  { value: "10", key: "tenK" },
  { value: "21.0975", key: "halfMarathon" },
  { value: "42.195", key: "marathon" },
] as const;

function RacePredictorTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [from, setFrom] = useState("10");
  const [to, setTo] = useState("21.0975");
  const [h, setH] = useState("0");
  const [m, setM] = useState("50");
  const [s, setS] = useState("0");

  const time = parseTimeToSeconds(h, m, s);
  const predicted = riegel(time, Number(from), Number(to));
  const pace = predicted / Number(to);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField
              label={t("fromDistance")}
              value={from}
              onChange={setFrom}
              options={RACE_DISTANCES.map((d) => ({ value: d.value, label: t(d.key) }))}
            />
            <SelectField
              label={t("toDistance")}
              value={to}
              onChange={setTo}
              options={RACE_DISTANCES.map((d) => ({ value: d.value, label: t(d.key) }))}
            />
          </div>
          <TimeField
            label={t("targetTime")}
            h={h}
            m={m}
            s={s}
            onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
          />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(predicted) && predicted > 0 ? (
          <div className="space-y-4">
            <BigResult label={t("results")} value={formatDuration(predicted)} />
            <ResultRow label={t("pace")} value={formatPace(pace)} />
            <ResultRow label={t("equivalent")} value={`${t("fromDistance")}: ${formatDuration(time)}`} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">{t("estimateNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function SplitTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [h, setH] = useState("1");
  const [m, setM] = useState("45");
  const [s, setS] = useState("0");
  const [segments, setSegments] = useState("5");
  const [type, setType] = useState("even");

  const total = parseTimeToSeconds(h, m, s);
  const rows = splitRows(total, Math.max(1, Math.min(42, Math.round(Number(segments)))), type as "even" | "negative" | "positive");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <TimeField
            label={t("targetTime")}
            h={h}
            m={m}
            s={s}
            onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t("segments")} value={segments} onChange={setSegments} min={1} max={42} />
            <SelectField
              label={t("splitType")}
              value={type}
              onChange={setType}
              options={[
                { value: "even", label: t("even") },
                { value: "negative", label: t("negative") },
                { value: "positive", label: t("positive") },
              ]}
            />
          </div>
        </div>
      </Panel>
      <Panel title={t("results")}>
        {rows.length > 0 ? (
          <Table
            head={["#", t("split"), t("cumulative")]}
            rows={rows.map((row) => [
              <span key="s" className="font-mono">{row.segment}</span>,
              <span key="p" className="font-mono text-ink">{formatDuration(row.split)}</span>,
              <span key="c" className="font-mono">{formatDuration(row.cumulative)}</span>,
            ])}
          />
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function DistanceConverterTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [value, setValue] = useState("10");
  const [unit, setUnit] = useState("km");
  const numeric = Number(value);
  const meters = unit === "km" ? numeric * 1000 : unit === "mi" ? numeric * 1609.344 : numeric;
  const valid = Number.isFinite(meters) && meters >= 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
          <NumberField label={t("value")} value={value} onChange={setValue} min={0} step={0.01} />
          <SelectField
            label={t("unit")}
            value={unit}
            onChange={setUnit}
            options={[
              { value: "km", label: t("km") },
              { value: "mi", label: t("miles") },
              { value: "m", label: t("meters") },
            ]}
          />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {valid ? (
          <div>
            <ResultRow label={t("km")} value={formatNumber(meters / 1000, locale, 3)} />
            <ResultRow label={t("miles")} value={formatNumber(meters / 1609.344, locale, 3)} />
            <ResultRow label={t("meters")} value={formatNumber(meters, locale, 0)} />
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function SpeedConverterTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [value, setValue] = useState("12");
  const [unit, setUnit] = useState("kmh");
  const numeric = Number(value);
  const kmh = unit === "kmh" ? numeric : unit === "mph" ? numeric * 1.609344 : numeric * 3.6;
  const valid = Number.isFinite(kmh) && kmh > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label={t("value")} value={value} onChange={setValue} min={0} step={0.1} />
          <SelectField
            label={t("unit")}
            value={unit}
            onChange={setUnit}
            options={[
              { value: "kmh", label: t("kmh") },
              { value: "mph", label: t("mph") },
              { value: "ms", label: t("ms") },
            ]}
          />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {valid ? (
          <div>
            <ResultRow label={t("kmh")} value={formatNumber(kmh, locale, 2)} />
            <ResultRow label={t("mph")} value={formatNumber(kmh / 1.609344, locale, 2)} />
            <ResultRow label={t("ms")} value={formatNumber(kmh / 3.6, locale, 2)} />
            <ResultRow label={t("pace")} value={formatPace(3600 / kmh)} />
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

const zoneKeys: Record<string, string> = {
  recovery: "zoneRecovery",
  easy: "zoneEasy",
  tempo: "zoneTempo",
  threshold: "zoneThreshold",
  vo2: "zoneVo2",
};

function HeartRateTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [age, setAge] = useState("35");
  const [resting, setResting] = useState("60");
  const [method, setMethod] = useState("max");
  const zones = heartRateZones(Number(age), Number(resting) || null, method as "max" | "reserve");
  const valid = Number(age) > 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t("ageYears")} value={age} onChange={setAge} min={10} max={100} />
            <NumberField label={t("restingHr")} value={resting} onChange={setResting} min={30} max={120} suffix={t("bpm")} />
          </div>
          <SelectField
            label={t("method")}
            value={method}
            onChange={setMethod}
            options={[
              { value: "max", label: t("methodMax") },
              { value: "reserve", label: t("methodReserve") },
            ]}
          />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {valid ? (
          <Table
            head={[t("zone"), t("low"), t("high")]}
            rows={zones.map((zone) => [
              <span key="z" className="font-mono text-ink">Z{zone.zone}</span>,
              <span key="l" className="font-mono">{Math.round(zone.low)} {t("bpm")}</span>,
              <span key="h" className="font-mono">{Math.round(zone.high)} {t("bpm")}</span>,
              <span key="n" className="text-[0.65rem]">{t(zoneKeys[zone.label])}</span>,
            ])}
          />
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function CadenceTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [steps, setSteps] = useState("5280");
  const [minutes, setMinutes] = useState("30");
  const cadence = cadenceFromSteps(Number(steps), Number(minutes) * 60);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label={t("steps")} value={steps} onChange={setSteps} min={1} />
          <NumberField label={t("minutes")} value={minutes} onChange={setMinutes} min={1} />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(cadence) ? (
          <div className="space-y-4">
            <BigResult label={t("cadence")} value={`${formatNumber(cadence, locale, 0)} ${t("stepsPerMin")}`} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">
              {t("cadence")}: 170–180 {t("stepsPerMin")}
            </p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function TrainingPaceTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [h, setH] = useState("0");
  const [m, setM] = useState("25");
  const [s, setS] = useState("0");
  const fiveK = parseTimeToSeconds(h, m, s);
  const paces = trainingPaces(fiveK);
  const rows: { label: string; range: readonly [number, number] }[] = [
    { label: t("easyPace"), range: paces.easy },
    { label: t("marathonPace"), range: paces.marathon },
    { label: t("tempoPace"), range: paces.tempo },
    { label: t("intervalPace"), range: paces.interval },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <TimeField
          label={t("fiveKPace")}
          h={h}
          m={m}
          s={s}
          onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
        />
      </Panel>
      <Panel title={t("results")}>
        {fiveK > 0 ? (
          <div>
            {rows.map((row) => (
              <ResultRow key={row.label} label={row.label} value={`${formatPace(row.range[0])} – ${formatPace(row.range[1])}`} />
            ))}
            <p className="mt-3 text-[0.68rem] leading-relaxed text-subtle">{t("estimateNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function WeeklyMileageTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [current, setCurrent] = useState("30");
  const [weeks, setWeeks] = useState("8");
  const [deload, setDeload] = useState(true);
  const rows = weeklyMileage(Number(current), Math.max(1, Math.min(24, Math.round(Number(weeks)))), deload);
  const total = rows.reduce((sum, row) => sum + row.volume, 0);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t("currentWeekly")} value={current} onChange={setCurrent} min={1} suffix="km" />
            <NumberField label={t("weeks")} value={weeks} onChange={setWeeks} min={1} max={24} />
          </div>
          <label className="flex items-center gap-2 text-xs text-muted">
            <input type="checkbox" checked={deload} onChange={(event) => setDeload(event.target.checked)} className="h-4 w-4 accent-[rgb(var(--accent))]" />
            {t("deload")}
          </label>
        </div>
      </Panel>
      <Panel title={t("results")}>
        {rows.length > 0 ? (
          <div>
            <Table
              head={[t("week"), t("weeklyVolume"), t("type")]}
              rows={rows.map((row) => [
                <span key="w" className="font-mono">{row.week}</span>,
                <span key="v" className="font-mono text-ink">{formatNumber(row.volume, locale, 1)} km</span>,
                <span key="t">{row.type === "deload" ? t("deload") : t("build")}</span>,
              ])}
            />
            <div className="mt-3">
              <ResultRow label={t("total")} value={`${formatNumber(total, locale, 1)} km`} />
            </div>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function RaceCountdownTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [date, setDate] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 60000);
    return () => window.clearInterval(id);
  }, []);

  const result = date && now ? countdown(date, now) : null;
  const weeks = result ? Math.floor(result.days / 7) : 0;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <label className="block">
          <Label>{t("raceDate")}</Label>
          <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={fieldClass} />
        </label>
      </Panel>
      <Panel title={t("results")}>
        {result ? (
          result.passed ? (
            <p className="rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-muted">{t("passed")}</p>
          ) : (
            <div className="space-y-4">
              <BigResult label={t("remaining")} value={`${result.days} ${t("days")}`} />
              <ResultRow label={t("weeksLabel")} value={`${weeks} ${t("weeksLabel")}`} />
              <ResultRow label={t("hours")} value={`${result.hours} ${t("hours")}`} />
              <ResultRow label={t("minutes")} value={`${result.minutes} ${t("minutes")}`} />
            </div>
          )
        ) : (
          <p className="text-xs text-subtle">{t("raceDate")}</p>
        )}
      </Panel>
    </div>
  );
}

function ElevationTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [distance, setDistance] = useState("15");
  const [climb, setClimb] = useState("300");
  const equivalent = equivalentFlatKm(Number(distance), Number(climb));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label={t("distanceKm")} value={distance} onChange={setDistance} min={0.1} step={0.1} />
          <NumberField label={t("climb")} value={climb} onChange={setClimb} min={0} suffix="m" />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(equivalent) ? (
          <div className="space-y-4">
            <BigResult label={t("flatEquivalent")} value={`${formatNumber(equivalent, locale, 1)} km`} />
            <ResultRow label={t("climb")} value={`${formatNumber(Number(climb) / Math.max(Number(distance), 0.1), locale, 0)} m/km`} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">{t("estimateNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function CalorieTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [weight, setWeight] = useState("65");
  const [distance, setDistance] = useState("10");
  const [h, setH] = useState("0");
  const [m, setM] = useState("55");
  const [s, setS] = useState("0");
  const seconds = parseTimeToSeconds(h, m, s);
  const kcal = caloriesBurned(Number(weight), Number(distance), seconds);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t("weightKg")} value={weight} onChange={setWeight} min={30} max={200} />
            <NumberField label={t("distanceKm")} value={distance} onChange={setDistance} min={0.1} step={0.1} />
          </div>
          <TimeField
            label={t("targetTime")}
            h={h}
            m={m}
            s={s}
            onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
          />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(kcal) ? (
          <div className="space-y-4">
            <BigResult label={t("calories")} value={`${formatNumber(kcal, locale, 0)} ${t("kcal")}`} />
            <ResultRow label={t("speed")} value={`${formatNumber(speedKmh(Number(distance), seconds), locale, 1)} ${t("kmh")}`} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">{t("calorieNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function TrainingPlanTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [race, setRace] = useState("21.0975");
  const [weeks, setWeeks] = useState("12");
  const [current, setCurrent] = useState("25");
  const plan = trainingPlan(Number(race), Number(weeks), Number(current));
  const qualityKey: Record<string, string> = { easy: "qualityEasy", tempo: "qualityTempo", intervals: "qualityIntervals" };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <SelectField
            label={t("planRace")}
            value={race}
            onChange={setRace}
            options={RACE_DISTANCES.map((d) => ({ value: d.value, label: t(d.key) }))}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberField label={t("weeks")} value={weeks} onChange={setWeeks} min={4} max={24} />
            <NumberField label={t("currentWeekly")} value={current} onChange={setCurrent} min={1} suffix="km" />
          </div>
        </div>
      </Panel>
      <Panel title={t("results")}>
        {plan.length > 0 ? (
          <div>
            <Table
              head={[t("week"), t("weeklyVolume"), t("longRun"), t("quality")]}
              rows={plan.map((week) => [
                <span key="w" className="font-mono">{week.week}{week.taper ? <span className="ml-1 text-teal">↓</span> : null}</span>,
                <span key="v" className="font-mono text-ink">{formatNumber(week.totalKm, locale, 1)} km</span>,
                <span key="l" className="font-mono">{formatNumber(week.longRunKm, locale, 1)} km</span>,
                <span key="q">{t(qualityKey[week.quality])}</span>,
              ])}
            />
            <p className="mt-3 text-[0.68rem] leading-relaxed text-subtle">{t("planDisclaimer")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function MarathonTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [h, setH] = useState("1");
  const [m, setM] = useState("45");
  const [s, setS] = useState("0");
  const half = parseTimeToSeconds(h, m, s);
  const marathon = marathonFromHalf(half);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <TimeField
          label={t("halfTime")}
          h={h}
          m={m}
          s={s}
          onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
        />
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(marathon) && marathon > 0 ? (
          <div className="space-y-4">
            <BigResult label={t("marathonProjection")} value={formatDuration(marathon)} />
            <ResultRow label={t("requiredPace")} value={formatPace(marathon / 42.195)} />
            <ResultRow label={t("halfTime")} value={formatDuration(half)} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">{t("estimateNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

function AgeGradingTool({ locale }: ToolProps) {
  const { t } = useTranslation("tools");
  const [h, setH] = useState("0");
  const [m, setM] = useState("50");
  const [s, setS] = useState("0");
  const [age, setAge] = useState("40");
  const actual = parseTimeToSeconds(h, m, s);
  const factor = ageFactor(Number(age));
  const graded = ageGradedTime(actual, Number(age));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title={t("inputs")}>
        <div className="space-y-4">
          <TimeField
            label={t("targetTime")}
            h={h}
            m={m}
            s={s}
            onChange={(part, value) => (part === "h" ? setH(value) : part === "m" ? setM(value) : setS(value))}
          />
          <NumberField label={t("ageYears")} value={age} onChange={setAge} min={20} max={90} />
        </div>
      </Panel>
      <Panel title={t("results")}>
        {Number.isFinite(graded) && graded > 0 ? (
          <div className="space-y-4">
            <BigResult label={t("gradedTime")} value={formatDuration(graded)} />
            <ResultRow label={t("ageFactor")} value={`${formatNumber(factor * 100, locale, 1)}%`} />
            <ResultRow label={t("targetTime")} value={formatDuration(actual)} />
            <p className="text-[0.68rem] leading-relaxed text-subtle">{t("estimateNote")}</p>
          </div>
        ) : (
          <Invalid />
        )}
      </Panel>
    </div>
  );
}

export function ToolWorkbench({ slug, locale }: { slug: string; locale: Locale }) {
  switch (slug) {
    case "pace-calculator":
      return <PaceTool locale={locale} />;
    case "race-time-predictor":
      return <RacePredictorTool locale={locale} />;
    case "split-calculator":
      return <SplitTool locale={locale} />;
    case "distance-converter":
      return <DistanceConverterTool locale={locale} />;
    case "speed-converter":
      return <SpeedConverterTool locale={locale} />;
    case "heart-rate-zones":
      return <HeartRateTool locale={locale} />;
    case "cadence-calculator":
      return <CadenceTool locale={locale} />;
    case "training-pace":
      return <TrainingPaceTool locale={locale} />;
    case "weekly-mileage":
      return <WeeklyMileageTool locale={locale} />;
    case "race-countdown":
      return <RaceCountdownTool locale={locale} />;
    case "elevation-calculator":
      return <ElevationTool locale={locale} />;
    case "calorie-estimator":
      return <CalorieTool locale={locale} />;
    case "training-plan":
      return <TrainingPlanTool locale={locale} />;
    case "marathon-time":
      return <MarathonTool locale={locale} />;
    case "age-grading":
      return <AgeGradingTool locale={locale} />;
    default:
      return null;
  }
}
