import { cn } from "@/lib/utils";

export function Artwork({
  seed = 1,
  className,
  label,
  tone = "dark",
}: {
  seed?: number;
  className?: string;
  label?: string;
  tone?: "dark" | "light";
}) {
  const palettes =
    tone === "dark"
      ? [
          ["#071426", "#0E2C4A", "#4D9FFF"],
          ["#0A1520", "#163B3A", "#36D6D0"],
          ["#0B1020", "#1D2A4A", "#7EA6FF"],
          ["#0D141B", "#243B2E", "#8FD0A8"],
        ]
      : [
          ["#E8F1FF", "#CFE1FF", "#1869E2"],
          ["#E6F7F5", "#CDEDE8", "#0A8F85"],
          ["#EEF1FA", "#D9E0F5", "#3A5CCC"],
          ["#EDF4EA", "#D6E8D0", "#3D7A4C"],
        ];
  const [from, to, accent] = palettes[(seed - 1) % palettes.length];
  const shift = ((seed * 17) % 40) - 20;

  return (
    <div
      aria-hidden="true"
      className={cn("relative overflow-hidden bg-surface", className)}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g stroke={accent} strokeOpacity="0.22" strokeWidth="0.8">
          {Array.from({ length: 7 }).map((_, index) => (
            <ellipse
              key={index}
              cx={210 + shift}
              cy={118 + shift / 3}
              rx={44 + index * 26}
              ry={20 + index * 13}
            />
          ))}
          <path d="M0 200 H400 M0 40 H400 M70 0 V240 M330 0 V240" strokeOpacity="0.1" />
        </g>
        <path
          d={`M-20 ${170 + shift} C 60 ${90 + shift}, 120 ${205 - shift}, 200 ${130 + shift} S 320 ${40 + shift}, 420 ${95 + shift}`}
          stroke={accent}
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <circle cx={200} cy={130 + shift} r="5" fill={accent} />
        <circle cx={200} cy={130 + shift} r="13" stroke={accent} strokeOpacity="0.45" />
        <circle cx="330" cy={70 + shift / 2} r="3" fill={accent} fillOpacity="0.8" />
      </svg>
      {label ? (
        <span className="absolute bottom-4 left-5 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/70">
          {label}
        </span>
      ) : null}
      <div className="absolute inset-0 bg-noise opacity-[0.12] mix-blend-overlay" />
    </div>
  );
}
