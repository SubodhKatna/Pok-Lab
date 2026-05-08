import { FiX } from 'react-icons/fi';
import { TypeBadge } from '@/shared/components/TypeBadge';
import { TeamSlotPicker } from './TeamSlotPicker';
import type { TeamMember } from '@/shared/types/game-state';
import type { PokemonType, PokemonSummary } from '@/shared/types/pokemon';

interface TeamSlotProps {
  index: number;
  member: TeamMember | null;
  onRemove: (id: number) => void;
  onSetItem: (id: number, item: string) => void;
  onAddPokemon: (pokemon: PokemonSummary) => void;
  teamFull?: boolean;
}

const TYPE_BORDER_COLOR: Record<PokemonType, string> = {
  normal:   'border-l-zinc-400',
  fire:     'border-l-orange-500',
  water:    'border-l-blue-500',
  electric: 'border-l-yellow-400',
  grass:    'border-l-green-500',
  ice:      'border-l-cyan-300',
  fighting: 'border-l-red-700',
  poison:   'border-l-purple-500',
  ground:   'border-l-amber-600',
  flying:   'border-l-indigo-400',
  psychic:  'border-l-pink-500',
  bug:      'border-l-lime-500',
  rock:     'border-l-stone-500',
  ghost:    'border-l-violet-700',
  dragon:   'border-l-blue-700',
  dark:     'border-l-zinc-600',
  steel:    'border-l-slate-400',
  fairy:    'border-l-pink-300',
};

export function TeamSlot({ index, member, onRemove, onSetItem, onAddPokemon, teamFull = false }: TeamSlotProps) {
  if (!member) {
    return (
      <div
        className="flex flex-col gap-2 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/30 px-3 py-3 transition-colors hover:border-zinc-700 hover:bg-zinc-900/60"
        aria-label={`Empty team slot ${index + 1}`}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-700">
          Slot {index + 1}
        </span>
        <TeamSlotPicker
          selectedPokemon={null}
          selectedItem=""
          onSelectPokemon={onAddPokemon}
          onSelectItem={() => {}}
          disabled={teamFull}
        />
      </div>
    );
  }

  const { pokemon, heldItem } = member;
  const bst =
    pokemon.stats.hp +
    pokemon.stats.attack +
    pokemon.stats.defense +
    pokemon.stats.spAtk +
    pokemon.stats.spDef +
    pokemon.stats.speed;

  const primaryType = pokemon.types[0];
  const borderAccent = primaryType ? TYPE_BORDER_COLOR[primaryType] : 'border-l-zinc-700';

  return (
    <div
      className={`group relative flex flex-col rounded-xl border border-zinc-800/80 border-l-[3px] ${borderAccent} bg-zinc-900/80 transition-all duration-150 hover:border-zinc-700 hover:bg-zinc-900`}
    >
      {/* Remove */}
      <button
        onClick={() => onRemove(pokemon.id)}
        className="absolute right-2 top-2 z-10 rounded-md p-1 text-zinc-600 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        aria-label={`Remove ${pokemon.name}`}
      >
        <FiX size={12} />
      </button>

      {/* Card body */}
      <div className="flex items-center gap-3 px-3 pt-3 pb-2 pr-8">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="h-14 w-14 shrink-0 object-contain drop-shadow-md transition-transform duration-200 group-hover:scale-110"
          loading="lazy"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-bold capitalize text-zinc-100">
            {pokemon.name}
          </span>
          <div className="flex flex-wrap gap-1">
            {pokemon.types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <span className="text-[11px] text-zinc-600">
            BST <span className="font-semibold text-zinc-400">{bst}</span>
          </span>
        </div>
      </div>

      {/* Picker */}
      <div className="border-t border-zinc-800/50 px-3 py-2">
        <TeamSlotPicker
          selectedPokemon={pokemon}
          selectedItem={heldItem ?? ''}
          onSelectPokemon={(newPokemon) => {
            onRemove(pokemon.id);
            onAddPokemon(newPokemon);
          }}
          onSelectItem={(item) => onSetItem(pokemon.id, item)}
        />
      </div>
    </div>
  );
}
