export function ProgressRing({
  day,
  total,
  size = 156,
  label,
}: {
  day: number;
  total: number;
  size?: number;
  /** Caption under the number, e.g. "Day of 14". */
  label?: string;
}) {
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total > 0 ? Math.min(Math.max(day / total, 0), 1) : 0;

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Day ${day} of ${total}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-dim)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="font-display text-5xl leading-none font-extrabold text-brand">
          {day}
        </span>
        <span className="mt-1 text-[11px] font-extrabold tracking-[0.14em] text-muted uppercase">
          {label ?? `Day of ${total}`}
        </span>
      </div>
    </div>
  );
}
