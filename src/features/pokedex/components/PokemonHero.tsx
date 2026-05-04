import { TypeBadge } from '@/shared/components/TypeBadge';
import { StatBar } from '@/shared/components/StatBar';
import type { PokemonDetail } from '@/shared/types/pokemon';

interface Props { pokemon: PokemonDetail }

export function PokemonHero({ pokemon }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 flex flex-col items-center justify-center gap-3">
      <span className="text-xs font-mono text-zinc-500">#{String(pokemon.id).padStart(4, '0')}</span>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-zinc-700/30 blur-3xl scale-90" aria-hidden="true" />
        <img src={pokemon.sprite} alt={pokemon.name} className="relative h-48 w-48 object-contain drop-shadow-2xl" />
      </div>
      <h1 className="text-2xl font-black capitalize text-white tracking-tight">{pokemon.name}</h1>
      <div className="flex gap-2 flex-wrap justify-center">
        {pokemon.types.map((t) => <TypeBadge key={t} type={t} />)}
      </div>
    </div>
  );
}

export function PokemonStats({ pokemon }: Props) {
  const total = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 flex flex-col justify-center gap-2.5">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Base Stats</div>
      <StatBar label="HP"    value={pokemon.stats.hp} />
      <StatBar label="Atk"   value={pokemon.stats.attack} />
      <StatBar label="Def"   value={pokemon.stats.defense} />
      <StatBar label="SpAtk" value={pokemon.stats.spAtk} />
      <StatBar label="SpDef" value={pokemon.stats.spDef} />
      <StatBar label="Speed" value={pokemon.stats.speed} />
      <div className="mt-1 pt-2 border-t border-zinc-700 flex justify-between text-xs">
        <span className="text-zinc-400">Total</span>
        <span className="font-bold text-white tabular-nums">{total}</span>
      </div>
    </div>
  );
}
