interface StatBarProps {
  /** Stat label, e.g. "HP", "Attack". */
  label: string
  /** Numeric stat value. */
  value: number
  /** Maximum possible value used to compute fill percentage. Defaults to 255. */
  max?: number
  className?: string
}

/**
 * Horizontal stat bar showing a label, numeric value, and a filled progress bar.
 *
 * The fill width is clamped to [0, 100]% based on `value / max`.
 */
export function StatBar({ label, value, max = 255, className = '' }: StatBarProps) {
  const pct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Label */}
      <span className="w-16 shrink-0 text-right text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {label}
      </span>

      {/* Numeric value */}
      <span className="w-8 shrink-0 text-right text-sm font-semibold text-zinc-100 tabular-nums">
        {value}
      </span>

      {/* Bar track */}
      <div
        className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-800"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full bg-sky-400 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
