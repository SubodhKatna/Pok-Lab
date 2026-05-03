import { useState, useRef, useEffect, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail'
import type { PokemonSummary, PokemonDetail } from '@/shared/types/pokemon'

interface GuessInputProps {
  onSubmit: (pokemon: PokemonDetail) => void
  disabled?: boolean
}

export function GuessInput({ onSubmit, disabled = false }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const queryClient = useQueryClient()
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

  const handleSelect = useCallback(async (pokemon: PokemonSummary) => {
    setQuery('')
    setOpen(false)
    setActiveIndex(-1)
    setIsSubmitting(true)
    try {
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', pokemon.id])
      if (cached) { onSubmit(cached); return }
      const detail = await queryClient.fetchQuery<PokemonDetail>({
        queryKey: ['pokemon-detail', pokemon.id],
        queryFn: () => buildPokemonDetail(pokemon.id),
        staleTime: Infinity,
      })
      onSubmit(detail)
    } finally {
      setIsSubmitting(false)
    }
  }, [queryClient, onSubmit])

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
      void handleSelect(filtered[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={containerRef} className="relative w-96">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query.trim().length >= 1 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Type the Pokémon name…"
        disabled={disabled || isSubmitting}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && filtered.length > 0}
        aria-activedescendant={activeIndex >= 0 ? `wordle-option-${activeIndex}` : undefined}
        className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/30 disabled:opacity-50 transition-all"
      />

      {open && filtered.length > 0 && (
        <ul
          ref={listRef}
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-y-auto max-h-60"
        >
          {filtered.map((pokemon, idx) => (
            <li key={pokemon.id} id={`wordle-option-${idx}`} role="option" aria-selected={idx === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); void handleSelect(pokemon) }}
                onMouseEnter={() => setActiveIndex(idx)}
                className={[
                  'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm capitalize text-zinc-200 transition-colors',
                  idx === activeIndex ? 'bg-white/15' : 'hover:bg-white/10',
                ].join(' ')}
              >
                <img
                  src={pokemon.sprite}
                  alt={pokemon.name}
                  className="h-6 w-6 object-contain"
                  loading="lazy"
                />
                {pokemon.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
