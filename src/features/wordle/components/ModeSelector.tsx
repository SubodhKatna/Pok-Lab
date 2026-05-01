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
        className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1 gap-1"
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
                'rounded-md px-4 py-1.5 text-sm font-medium capitalize transition-colors',
                isActive
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-100',
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
