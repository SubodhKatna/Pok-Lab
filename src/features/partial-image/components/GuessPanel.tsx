import { useState, useRef, useEffect, useCallback } from 'react'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import type { PokemonSummary } from '@/shared/types/pokemon'

const MAX_REVEAL_STEP = 4

interface GuessPanelProps {
  /** Current reveal step (0–4). */
  revealStep: number
  /** Called when the user submits a guess. */
  onGuess: (pokemon: PokemonSummary) => void
  /** Called when the user clicks "Next Round". */
  onNext: () => void
  /** Whether the round is over (won or lost). */
  roundOver: boolean
  /** Disables the input. */
  disabled?: boolean
}

export function GuessPanel({
  revealStep,
  onGuess,
  onNext,
  roundOver,
  disabled = false,
}: GuessPanelProps) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const { data: pokemonList = [] } = usePokemonList()

  const filtered =
    query.trim().length >= 1
      ? pokemonList
          .filter((p) => p.name.toLowerCase().includes(query.toLowerCase().trim()))
          .slice(0, 50)
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

  // Reset active index when filtered list changes
  useEffect(() => { setActiveIndex(-1) }, [filtered.length])

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return
    const item = listRef.current.children[activeIndex] as HTMLElement | undefined
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const handleSelect = useCallback((pokemon: PokemonSummary) => {
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    onGuess(pokemon)
  }, [onGuess])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  // ── Next Round button ──────────────────────────────────────────────────────
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

  // ── Step indicator helpers ─────────────────────────────────────────────────
  /**
   * Returns Tailwind classes for each dot based on its position relative to
   * the current revealStep:
   *   - i < revealStep  → already revealed (filled, accent colour)
   *   - i === revealStep → current step (bright glow, larger)
   *   - i > revealStep  → not yet revealed (dim, empty)
   */
  const dotClasses = (i: number): string => {
    if (i < revealStep) {
      // Revealed steps — filled with a muted accent
      return 'h-3 w-3 rounded-full bg-indigo-400/70 border-2 border-indigo-400/50 transition-all duration-500'
    }
    if (i === revealStep) {
      // Current step — bright, slightly larger, glowing
      const glow =
        revealStep === 0
          ? 'bg-sky-400 border-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]'
          : revealStep <= 2
            ? 'bg-yellow-400 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]'
            : 'bg-red-400 border-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]'
      return `h-4 w-4 rounded-full border-2 transition-all duration-500 ${glow}`
    }
    // Remaining steps — dim, unfilled
    return 'h-3 w-3 rounded-full bg-zinc-800 border-2 border-zinc-700 transition-all duration-500'
  }

  const stepLabel =
    revealStep === 0
      ? 'text-sky-300'
      : revealStep <= 2
        ? 'text-yellow-300'
        : 'text-red-400'

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Step indicator */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
          Reveal progress
        </span>
        <div className="flex items-center gap-2.5" role="group" aria-label={`Reveal step ${revealStep + 1} of ${MAX_REVEAL_STEP + 1}`}>
          {Array.from({ length: MAX_REVEAL_STEP + 1 }).map((_, i) => (
            <span
              key={i}
              className={dotClasses(i)}
              aria-hidden="true"
            />
          ))}
        </div>
        <span
          className={[
            'text-xs font-semibold tabular-nums transition-colors duration-300',
            stepLabel,
          ].join(' ')}
        >
          Attempt {revealStep + 1} of {MAX_REVEAL_STEP + 1}
        </span>
      </div>

      {/* Autocomplete */}
      <div ref={containerRef} className="relative w-full max-w-sm">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => query.trim().length >= 1 && setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Type a Pokémon name…"
          disabled={disabled}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && filtered.length > 0}
          aria-activedescendant={activeIndex >= 0 ? `pi-option-${activeIndex}` : undefined}
          className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md px-5 py-3.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400/30 disabled:opacity-40 transition-all"
        />

        {open && filtered.length > 0 && (
          <ul ref={listRef} role="listbox" className="absolute z-50 mt-2 w-full rounded-2xl border border-white/10 bg-zinc-900/95 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] overflow-y-auto max-h-60 py-1">
            {filtered.map((pokemon, idx) => (
              <li key={pokemon.id} id={`pi-option-${idx}`} role="option" aria-selected={idx === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault()
                    handleSelect(pokemon)
                  }}
                  onMouseEnter={() => setActiveIndex(idx)}
                  className={[
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm capitalize text-zinc-200 transition-colors',
                    idx === activeIndex ? 'bg-white/15' : 'hover:bg-white/10',
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
