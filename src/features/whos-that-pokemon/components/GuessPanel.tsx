import { useState, useRef, useEffect } from 'react'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import type { PokemonSummary } from '@/shared/types/pokemon'

interface GuessPanelProps {
  guessesRemaining: number
  onGuess: (pokemon: PokemonSummary) => void
  onNext: () => void
  roundOver: boolean
  disabled?: boolean
}

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
        className="group relative overflow-hidden rounded-2xl px-12 py-3.5 text-sm font-bold text-white transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
        style={{
          background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
          boxShadow: '0 0 24px rgba(14,165,233,0.35)',
        }}
      >
        <span className="relative z-10 flex items-center gap-2">
          Next Round
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
        {/* Shine sweep */}
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
      </button>
    )
  }

  // Dot color per remaining count
  const dotColor = (i: number) => {
    if (i >= guessesRemaining) return 'bg-zinc-700 border-zinc-600'
    if (guessesRemaining === 3) return 'bg-sky-400 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.7)]'
    if (guessesRemaining === 2) return 'bg-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.7)]'
    return 'bg-red-400 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.7)]'
  }

  const countColor =
    guessesRemaining === 3
      ? 'text-sky-300'
      : guessesRemaining === 2
        ? 'text-yellow-300'
        : 'text-red-400'

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Guesses remaining */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Guesses remaining
        </span>
        <div className="flex items-center gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={[
                'h-4 w-4 rounded-full border-2 transition-all duration-400',
                dotColor(i),
              ].join(' ')}
              aria-hidden="true"
            />
          ))}
          <span className={['text-base font-extrabold tabular-nums transition-colors duration-300', countColor].join(' ')}>
            {guessesRemaining}
          </span>
        </div>
      </div>

      {/* Autocomplete */}
      <div ref={containerRef} className="relative w-full max-w-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query.trim().length >= 1 && setOpen(true)}
          placeholder="Type a Pokémon name…"
          disabled={disabled}
          autoComplete="off"
          className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-3.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400/30 disabled:opacity-40 transition-all"
        />

        {open && filtered.length > 0 && (
          <ul className="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-hidden">
            {filtered.map((pokemon, idx) => (
              <li key={pokemon.id}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(pokemon) }}
                  className={[
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm capitalize text-zinc-200 hover:bg-white/10 transition-colors',
                    idx === 0 ? 'pt-3' : '',
                    idx === filtered.length - 1 ? 'pb-3' : '',
                  ].join(' ')}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400/60 flex-shrink-0" />
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
