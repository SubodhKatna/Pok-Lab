import type { WordleMode } from '@/shared/types/game-state'

interface ModeSelectorProps {
  value: WordleMode
  onChange: (mode: WordleMode) => void
  disabled?: boolean
}

/**
 * Toggle between 'stats' and 'attributes' game modes.
 * Disabled once a game is in progress.
 */
export function ModeSelector({ value, onChange, disabled = false }: ModeSelectorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
        Game Mode
      </span>
      <div
        className="flex rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-1 gap-1"
        role="group"
        aria-label="Game mode selector"
      >
        {(['stats', 'attributes'] as const).map((mode) => {
          const isActive = value === mode
          return (
            <button
              key={mode}
              type="button"
              onClick={() => !disabled && onChange(mode)}
              disabled={disabled}
              aria-pressed={isActive}
              className={[
                'rounded-lg px-5 py-2 text-sm font-medium capitalize transition-all',
                isActive
                  ? 'bg-sky-500/25 border border-sky-400/40 text-sky-200 shadow-[0_0_12px_rgba(14,165,233,0.3)]'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
              ].join(' ')}
            >
              {mode === 'stats' ? 'Stats' : 'Attributes'}
            </button>
          )
        })}
      </div>
    </div>
  )
}
