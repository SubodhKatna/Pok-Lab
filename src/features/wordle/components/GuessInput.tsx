import { useState, useRef, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail'
import type { PokemonSummary, PokemonDetail } from '@/shared/types/pokemon'

interface GuessInputProps {
  onSubmit: (pokemon: PokemonDetail) => void
  disabled?: boolean
}

/**
 * Simple text input with a filtered dropdown.
 * Type a name → see matching Pokémon → click to submit guess.
 */
export function GuessInput({ onSubmit, disabled = false }: GuessInputProps) {
  const [query, setQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()
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

  const handleSelect = async (pokemon: PokemonSummary) => {
    setQuery('')
    setOpen(false)
    setIsSubmitting(true)
    try {
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', pokemon.id])
      if (cached) {
        onSubmit(cached)
        return
      }

      const detail = await queryClient.fetchQuery<PokemonDetail>({
        queryKey: ['pokemon-detail', pokemon.id],
        queryFn: () => buildPokemonDetail(pokemon.id),
        staleTime: Infinity,
      })

      onSubmit(detail)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-96">
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => query.trim().length >= 1 && setOpen(true)}
        placeholder="Type the Pokémon name…"
        disabled={disabled || isSubmitting}
        autoComplete="off"
        className="w-full rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-400/30 disabled:opacity-50 transition-all"
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          {filtered.map((pokemon) => (
            <li key={pokemon.id}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault() // prevent input blur before click fires
                  void handleSelect(pokemon)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2.5 text-sm capitalize text-zinc-200 hover:bg-white/10 transition-colors"
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
