import { useState, useRef, useEffect } from 'react'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import type { PokemonSummary } from '@/shared/types/pokemon'

interface GuessPanelProps {
  /** Number of incorrect guesses still allowed. */
  guessesRemaining: number
  /** Called when the user selects a Pokémon from the autocomplete. */
  onGuess: (pokemon: PokemonSummary) => void
  /** Called when the user clicks "Next Round". */
  onNext: () => void
  /** Whether the round is over (won or lost). Shows "Next" button instead of input. */
  roundOver: boolean
  /** Disable the input (e.g. while loading). */
  disabled?: boolean
}

/**
 * Guess panel for Who's That Pokémon.
 *
 * - While playing: shows a searchable autocomplete input + guesses-remaining indicator.
 * - When round is over: shows a "Next Round" button.
 */
export function GuessPanel({
  guessesRemaining,
  onGuess,
  onNext,
  roundOver,
  disabled = false,
}: GuessPanelProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: pokemonList = [] } = usePokemonList()

  const filtered =
    query.trim().length >= 1
      ? pokemonList
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase().trim()))
          .slice(0, 8)
      : []

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (pokemon: PokemonSummary) => {
    setQuery('')
    setOpen(false)
    onGuess(pokemon)
  }

  if (roundOver) {
    return (
      <button
        type="button"
        onClick={onNext}
        className="rounded-xl bg-sky-500/20 border border-sky-400/30 backdrop-blur-md px-10 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-500/30 hover:border-sky-400/50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
      >
        Next Round →
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Guesses remaining indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Guesses remaining:
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={[
                'h-3 w-3 rounded-full border',
                i < guessesRemaining
                  ? 'bg-sky-400 border-sky-400'
                  : 'bg-transparent border-zinc-600',
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
        </div>
        <span className="text-sm font-semibold tabular-nums text-zinc-300">
          {guessesRemaining} / 3
        </span>
      </div>

      {/* Autocomplete input */}
      <div ref={containerRef} className="relative w-96">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query.trim().length >= 1 && setOpen(true)}
          placeholder="Who's that Pokémon?"
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/30 disabled:opacity-50 transition-all"
        />

        {open && filtered.length > 0 && (
          <ul className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-2xl overflow-hidden">
            {filtered.map((pokemon) => (
              <li key={pokemon.id}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(pokemon)
                  }}
                  className="flex w-full items-center px-3 py-2.5 text-sm capitalize text-zinc-200 hover:bg-white/10 transition-colors"
                >
                  {pokemon.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
