import { useCallback } from 'react';
import { FiHeart } from 'react-icons/fi';
import { TypeBadge } from '@/shared/components/TypeBadge';
import type { PokemonSummary, PokemonType } from '@/shared/types/pokemon';

const GENERATIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

interface FiltersProps {
  generationFilter: number | null;
  typeFilter: PokemonType[];
  hasTypeFilter: boolean;
  showFavourites: boolean;
  hasFavourites: boolean;
  onGeneration: (g: number | null) => void;
  onToggleType: (t: PokemonType) => void;
  onClearType: () => void;
  onToggleFavourites: () => void;
}

export function PokedexFilters({ generationFilter, typeFilter, hasTypeFilter, showFavourites, hasFavourites, onGeneration, onToggleType, onClearType, onToggleFavourites }: FiltersProps) {
  return (
    <div className="border-b border-zinc-800 bg-zinc-900/80 px-4 py-4 flex flex-col gap-4">
      {/* Favourites tab */}
      {hasFavourites && (
        <div>
          <button
            onClick={onToggleFavourites}
            className={[
              'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
              showFavourites
                ? 'border-rose-500 bg-rose-900/60 text-rose-300'
                : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
            ].join(' ')}
          >
            <FiHeart size={12} className={showFavourites ? 'fill-rose-400 text-rose-400' : ''} />
            Favourites
          </button>
        </div>
      )}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">Generation</div>
        <div className="flex flex-wrap gap-1.5">
          <FilterChip label="All" active={generationFilter === null} onClick={() => onGeneration(null)} />
          {GENERATIONS.map((g) => (
            <FilterChip key={g} label={`Gen ${g}`} active={generationFilter === g} onClick={() => onGeneration(g)} />
          ))}
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Type</span>
          {hasTypeFilter && (
            <button onClick={onClearType} className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const active = typeFilter.includes(t);
            return (
              <button
                key={t}
                onClick={() => onToggleType(t)}
                className={`transition-all ${!active && hasTypeFilter ? 'opacity-30' : 'opacity-100'}`}
                aria-pressed={active}
                aria-label={`Filter by ${t} type`}
              >
                <TypeBadge type={t} className={active ? 'ring-2 ring-white/50 ring-offset-1 ring-offset-zinc-950' : ''} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface GridProps {
  list: PokemonSummary[];
  isLoading: boolean;
  favouriteIds?: Set<number>;
  onSelect: (p: PokemonSummary) => void;
  onClearFilters: () => void;
  onToggleFavourite?: (p: PokemonSummary) => void;
}

export function PokemonGrid({ list, isLoading, favouriteIds, onSelect, onClearFilters, onToggleFavourite }: GridProps) {
  const handleHeartClick = useCallback((e: React.MouseEvent, p: PokemonSummary) => {
    e.stopPropagation();
    onToggleFavourite?.(p);
  }, [onToggleFavourite]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col items-center gap-2 animate-pulse">
            <div className="h-20 w-20 rounded-full bg-zinc-800" />
            <div className="h-3 w-16 rounded-full bg-zinc-800" />
            <div className="h-2.5 w-10 rounded-full bg-zinc-800" />
          </div>
        ))}
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-zinc-400 text-sm">No Pokémon match your filters.</p>
        <button onClick={onClearFilters} className="text-sm text-sky-400 hover:text-sky-300 transition-colors underline underline-offset-2">
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3" role="list">
      {list.map((p) => {
        const isFav = favouriteIds?.has(p.id) ?? false;
        return (
          <li key={p.id} className="relative">
            <button
              onClick={() => onSelect(p)}
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-3 flex flex-col items-center gap-2 hover:border-zinc-600 hover:bg-zinc-800 transition-all group"
              aria-label={`View ${p.name}`}
            >
              <img
                src={p.sprite}
                alt={p.name}
                className="h-20 w-20 object-contain group-hover:scale-110 transition-transform duration-200 drop-shadow-lg"
                loading="lazy"
              />
              <span className="text-sm capitalize font-semibold text-zinc-100 text-center leading-tight">{p.name}</span>
              <span className="text-xs text-zinc-500 font-mono">#{String(p.id).padStart(4, '0')}</span>
            </button>
            {/* Heart / favourite button */}
            {onToggleFavourite && (
              <button
                onClick={(e) => handleHeartClick(e, p)}
                className={[
                  'absolute top-2 right-2 p-1 rounded-full transition-all',
                  isFav
                    ? 'text-rose-400 hover:text-rose-300'
                    : 'text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100',
                ].join(' ')}
                aria-label={isFav ? `Remove ${p.name} from favourites` : `Add ${p.name} to favourites`}
                aria-pressed={isFav}
              >
                <FiHeart size={14} className={isFav ? 'fill-rose-400' : ''} />
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all',
        active
          ? 'border-sky-500 bg-sky-900/60 text-sky-300'
          : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
      ].join(' ')}
    >
      {label}
    </button>
  );
}
