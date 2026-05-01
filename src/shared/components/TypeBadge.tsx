import type { PokemonType } from '@/shared/types/pokemon'

interface TypeBadgeProps {
  type: PokemonType
  className?: string
}

/** Tailwind bg + text classes for each Pokémon type. */
const TYPE_STYLES: Record<PokemonType, string> = {
  normal:   'bg-zinc-400   text-zinc-900',
  fire:     'bg-orange-500 text-white',
  water:    'bg-blue-500   text-white',
  electric: 'bg-yellow-400 text-zinc-900',
  grass:    'bg-green-500  text-white',
  ice:      'bg-cyan-300   text-zinc-900',
  fighting: 'bg-red-700    text-white',
  poison:   'bg-purple-500 text-white',
  ground:   'bg-amber-600  text-white',
  flying:   'bg-indigo-400 text-white',
  psychic:  'bg-pink-500   text-white',
  bug:      'bg-lime-500   text-zinc-900',
  rock:     'bg-stone-500  text-white',
  ghost:    'bg-violet-700 text-white',
  dragon:   'bg-blue-700   text-white',
  dark:     'bg-zinc-700   text-zinc-100',
  steel:    'bg-slate-400  text-zinc-900',
  fairy:    'bg-pink-300   text-zinc-900',
}

/**
 * Colored pill badge for a Pokémon type.
 *
 * Renders the type name in its canonical color scheme.
 */
export function TypeBadge({ type, className = '' }: TypeBadgeProps) {
  const styles = TYPE_STYLES[type]

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize tracking-wide ${styles} ${className}`}
    >
      {type}
    </span>
  )
}
