import { TypeBadge } from '@/shared/components/TypeBadge';
import { StatBar } from '@/shared/components/StatBar';
import type { PokemonDetail } from '@/shared/types/pokemon';

interface PokemonCardProps {
  pokemon: PokemonDetail;
  onAddToComparison: (pokemon: PokemonDetail) => void;
  isInComparison: boolean;
  comparisonFull: boolean;
}

/**
 * Full detail card for a selected Pokémon.
 * Shows artwork, dex number, name, types, base stats, abilities, height, weight, description.
 */
export function PokemonCard({
  pokemon,
  onAddToComparison,
  isInComparison,
  comparisonFull,
}: PokemonCardProps) {
  const { id, name, sprite, types, stats, abilities, height, weight, description } = pokemon;

  const heightM = (height / 10).toFixed(1);
  const weightKg = (weight / 10).toFixed(1);

  const canAdd = !isInComparison && !comparisonFull;

  return (
    <div className="flex flex-col gap-4">
      {/* Artwork + identity */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="absolute inset-0 rounded-full bg-zinc-800/60 blur-xl" aria-hidden="true" />
          <img
            src={sprite}
            alt={name}
            className="relative h-28 w-28 object-contain drop-shadow-lg"
            loading="lazy"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-zinc-500 tabular-nums">
            #{String(id).padStart(4, '0')}
          </span>
          <h2 className="text-2xl font-black capitalize text-zinc-100 leading-none">{name}</h2>
          <div className="flex gap-1.5 flex-wrap">
            {types.map((t) => (
              <TypeBadge key={t} type={t} />
            ))}
          </div>
          <button
            onClick={() => onAddToComparison(pokemon)}
            disabled={!canAdd}
            className={[
              'mt-1 rounded-lg px-3 py-1 text-xs font-semibold transition-colors',
              isInComparison
                ? 'bg-sky-900/40 text-sky-400 border border-sky-800/60 cursor-default'
                : canAdd
                  ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:text-zinc-100'
                  : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed',
            ].join(' ')}
          >
            {isInComparison ? '✓ In comparison' : comparisonFull ? 'Comparison full' : '+ Compare'}
          </button>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-sm text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-3">
          {description}
        </p>
      )}

      {/* Base stats */}
      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Base Stats
        </h3>
        <div className="flex flex-col gap-1.5">
          <StatBar label="HP"    value={stats.hp}      />
          <StatBar label="Atk"   value={stats.attack}  />
          <StatBar label="Def"   value={stats.defense} />
          <StatBar label="SpAtk" value={stats.spAtk}   />
          <StatBar label="SpDef" value={stats.spDef}   />
          <StatBar label="Speed" value={stats.speed}   />
        </div>
      </div>

      {/* Physical info */}
      <div className="grid grid-cols-2 gap-2">
        <InfoCell label="Height" value={`${heightM} m`} />
        <InfoCell label="Weight" value={`${weightKg} kg`} />
      </div>

      {/* Abilities */}
      <div>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Abilities
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {abilities.map((a) => (
            <span
              key={a.name}
              className={[
                'rounded-lg border px-2.5 py-0.5 text-xs capitalize',
                a.isHidden
                  ? 'border-violet-800/50 bg-violet-900/20 text-violet-300'
                  : 'border-zinc-700 bg-zinc-800 text-zinc-300',
              ].join(' ')}
            >
              {a.name.replace(/-/g, ' ')}
              {a.isHidden && <span className="ml-1 text-[10px] text-violet-500">(hidden)</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-center">
      <div className="text-xs text-zinc-500 uppercase tracking-wide">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-zinc-200">{value}</div>
    </div>
  );
}
