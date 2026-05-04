import { TypeBadge } from '@/shared/components/TypeBadge';
import { computeStatHighlights, computeTypeEffectiveness, ALL_TYPES } from '../logic';
import type { PokemonDetail, PokemonType } from '@/shared/types/pokemon';

interface ComparisonViewProps {
  pokemon: PokemonDetail[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  spAtk: 'SpAtk',
  spDef: 'SpDef',
  speed: 'Speed',
};

/**
 * Side-by-side stat comparison for 2–4 Pokémon.
 * Highlights the highest stat in green and the lowest in red for each row.
 * Shows combined type coverage (shared weaknesses / resistances).
 * Validates: Requirements 7.6, 7.7, 7.8
 */
export function ComparisonView({ pokemon, onRemove, onClear }: ComparisonViewProps) {
  if (pokemon.length < 2) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-zinc-500">
        Add at least 2 Pokémon to compare.
      </div>
    );
  }

  const statHighlights = computeStatHighlights(pokemon.map((p) => p.stats));

  // Combined type coverage: shared weaknesses (2× or 4×) and shared resistances (0.5× or 0×)
  const charts = pokemon.map((p) => computeTypeEffectiveness(p.types));
  const sharedWeaknesses: PokemonType[] = ALL_TYPES.filter((t) =>
    charts.every((c) => c[t] >= 2),
  );
  const sharedResistances: PokemonType[] = ALL_TYPES.filter((t) =>
    charts.every((c) => c[t] <= 0.5),
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Comparison
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Clear all
        </button>
      </div>

      {/* Pokémon columns */}
      <div className="overflow-auto rounded-xl border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="w-20 text-left px-3 py-2 text-xs text-zinc-500 uppercase tracking-wide font-medium">
                Stat
              </th>
              {pokemon.map((p) => (
                <th key={p.id} className="px-3 py-2 text-center min-w-[90px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <img
                      src={p.sprite}
                      alt={p.name}
                      className="h-12 w-12 object-contain drop-shadow"
                      loading="lazy"
                    />
                    <span className="text-xs capitalize text-zinc-200 font-bold leading-tight">{p.name}</span>
                    <div className="flex gap-1 flex-wrap justify-center">
                      {p.types.map((t) => (
                        <TypeBadge key={t} type={t} />
                      ))}
                    </div>
                    <button
                      onClick={() => onRemove(p.id)}
                      className="text-[10px] text-zinc-600 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${p.name} from comparison`}
                    >
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {statHighlights.map(({ stat, highestIndex, diffs }) => {
              const values = pokemon.map((p) => p.stats[stat]);
              const minVal = Math.min(...values);
              const minCount = values.filter((v) => v === minVal).length;
              // Only mark lowest if it's unique (not tied) and not also the highest
              const lowestIndex = minCount === 1 ? values.indexOf(minVal) : -1;

              return (
                <tr key={stat} className="border-t border-zinc-800/60 hover:bg-zinc-800/20 transition-colors">
                  <td className="px-3 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                    {STAT_LABELS[stat]}
                  </td>
                  {pokemon.map((p, i) => {
                    const isHighest = highestIndex === i;
                    const isLowest = lowestIndex === i && !isHighest;
                    const diff = diffs[i];
                    return (
                      <td key={p.id} className="px-3 py-2.5 text-center">
                        <div className="flex flex-col items-center gap-0.5">
                          <span
                            className={[
                              'text-sm font-bold tabular-nums',
                              isHighest
                                ? 'text-emerald-400'
                                : isLowest
                                  ? 'text-red-400'
                                  : 'text-zinc-300',
                            ].join(' ')}
                          >
                            {p.stats[stat]}
                          </span>
                          {!isHighest && diff !== 0 && (
                            <span className="text-[10px] text-zinc-600 tabular-nums leading-none">
                              {diff}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {/* Total BST row */}
            <tr className="border-t border-zinc-700 bg-zinc-900/40">
              <td className="px-3 py-2.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Total
              </td>
              {pokemon.map((p) => {
                const total = Object.values(p.stats).reduce((a, b) => a + b, 0);
                return (
                  <td key={p.id} className="px-3 py-2.5 text-center text-sm font-bold text-zinc-200 tabular-nums">
                    {total}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Combined type coverage */}
      <div className="grid grid-cols-2 gap-3">
        <CoverageSection
          label="Shared Weaknesses"
          types={sharedWeaknesses}
          emptyText="None"
          labelColor="text-red-400"
          borderColor="border-red-900/40"
        />
        <CoverageSection
          label="Shared Resistances"
          types={sharedResistances}
          emptyText="None"
          labelColor="text-sky-400"
          borderColor="border-sky-900/40"
        />
      </div>
    </div>
  );
}

function CoverageSection({
  label,
  types,
  emptyText,
  labelColor,
  borderColor,
}: {
  label: string;
  types: PokemonType[];
  emptyText: string;
  labelColor: string;
  borderColor: string;
}) {
  return (
    <div className={`rounded-xl border ${borderColor} bg-zinc-900/40 p-3`}>
      <div className={`mb-2 text-xs font-semibold uppercase tracking-wide ${labelColor}`}>
        {label}
      </div>
      {types.length === 0 ? (
        <span className="text-xs text-zinc-600">{emptyText}</span>
      ) : (
        <div className="flex flex-wrap gap-1">
          {types.map((t) => (
            <TypeBadge key={t} type={t} />
          ))}
        </div>
      )}
    </div>
  );
}
