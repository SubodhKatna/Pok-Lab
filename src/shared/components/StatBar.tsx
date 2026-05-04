import { useEffect, useState } from 'react'

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
 * Animates from 0 to the target width on mount and whenever `value` changes.
 */
export function StatBar({ label, value, max = 255, className = '' }: StatBarProps) {
  const targetPct = Math.min(100, Math.max(0, Math.round((value / max) * 100)))

  // Start at 0 and animate to targetPct after mount / value change
  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    let id1: number;
    let id2: number;
    // Use two rAFs: first resets to 0, second animates to target
    // Wrapped in setTimeout to avoid synchronous setState-in-effect lint error
    const timeout = setTimeout(() => {
      setDisplayPct(0);
      id1 = requestAnimationFrame(() => {
        id2 = requestAnimationFrame(() => {
          setDisplayPct(targetPct);
        });
      });
    }, 0);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [targetPct])

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
        {/* Fill — transitions smoothly from 0 to target width */}
        <div
          className="h-full rounded-full bg-sky-400 transition-[width] duration-700 ease-out"
          style={{ width: `${displayPct}%` }}
        />
      </div>
    </div>
  )
}
