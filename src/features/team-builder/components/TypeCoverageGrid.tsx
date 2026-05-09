import { ALL_TYPES } from '@/features/pokedex/logic';
import type { TeamCoverageGrid } from '../scoring';
import type { PokemonType } from '@/shared/types/pokemon';

interface TypeCoverageGridProps {
  coverage: TeamCoverageGrid;
  memberCount: number;
}

/**
 * Tailwind bg + text classes for each Pokémon type — used for offense cells.
 * Mirrors the canonical type colors from TypeBadge.
 */
const TYPE_CELL_STYLES: Record<PokemonType, string> = {
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
};

/** Returns overlay + ring classes based on the offensive multiplier. */
function offenseCellClass(type: PokemonType, mult: number): string {
  const base = TYPE_CELL_STYLES[type];
  if (mult >= 4) {
    // Bright glow for 4× coverage
    return `${base} ring-2 ring-white/60 shadow-[0_0_8px_2px_rgba(255,255,255,0.35)]`;
  }
  if (mult >= 2) {
    return base;
  }
  if (mult === 1) {
    // Neutral — muted zinc overlay
    return 'bg-zinc-700/60 text-zinc-400';
  }
  // Not covered (<1×)
  return 'bg-zinc-900 text-zinc-700 border border-zinc-800';
}

/** Color classes for defensive weakness counts. */
function defenseColorClass(weak: number, immune: number, memberCount: number): string {
  if (immune > 0 && weak === 0) return 'bg-indigo-900/70 text-indigo-300 ring-1 ring-indigo-500/40';
  if (weak === 0) return 'bg-zinc-800/60 text-zinc-500';
  if (weak === memberCount) return 'bg-red-600 text-white';
  if (weak >= 2) return 'bg-orange-500 text-white';
  return 'bg-yellow-500/80 text-zinc-900';
}

function typeLabel(type: PokemonType): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Displays a two-section grid:
 *   - Offense: best multiplier the team can deal against each defending type
 *   - Defense: how many team members are weak to each attacking type
 */
export function TypeCoverageGrid({ coverage, memberCount }: TypeCoverageGridProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* ── Offense ─────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Offensive Coverage
        </p>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
          {ALL_TYPES.map((type) => {
            const mult = coverage.offense[type];
            return (
              <div
                key={type}
                className={`flex flex-col items-center rounded-lg px-1 py-1.5 text-center transition-transform hover:scale-105 ${offenseCellClass(type, mult)}`}
                title={`${typeLabel(type)}: ${mult}×`}
              >
                <span className="text-[9px] font-semibold leading-tight">{typeLabel(type)}</span>
                <span className="text-[10px] font-black tabular-nums">{mult}×</span>
              </div>
            );
          })}
        </div>
        {/* Offense legend */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <LegendItem color="bg-orange-500" label="4× super" />
          <LegendItem color="bg-green-500" label="2× effective" />
          <LegendItem color="bg-zinc-700/60" label="1× neutral" />
          <LegendItem color="bg-zinc-900 border border-zinc-800" label="Not covered" />
        </div>
      </div>

      {/* ── Defense ─────────────────────────────────────────────────────── */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          Defensive Weaknesses
        </p>
        <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
          {ALL_TYPES.map((type) => {
            const { weak, immune } = coverage.defense[type];
            return (
              <div
                key={type}
                className={`flex flex-col items-center rounded-lg px-1 py-1.5 text-center transition-transform hover:scale-105 ${defenseColorClass(weak, immune, memberCount)}`}
                title={`${typeLabel(type)}: ${weak} weak, ${immune} immune`}
              >
                <span className="text-[9px] font-semibold leading-tight">{typeLabel(type)}</span>
                <span className="text-[10px] font-black tabular-nums">
                  {immune > 0 && weak === 0
                    ? '✦'
                    : immune > 0
                      ? `${weak}w ${immune}i`
                      : `${weak}w`}
                </span>
              </div>
            );
          })}
        </div>
        {/* Defense legend */}
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
          <LegendItem color="bg-indigo-900/70 ring-1 ring-indigo-500/40" label="Immune (✦)" />
          <LegendItem color="bg-zinc-800/60" label="0 weak (safe)" />
          <LegendItem color="bg-yellow-500/80" label="1 weak" />
          <LegendItem color="bg-orange-500" label="2+ weak" />
          <LegendItem color="bg-red-600" label="All weak" />
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 shrink-0 rounded-sm ${color}`} />
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}
