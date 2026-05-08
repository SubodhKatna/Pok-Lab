import { FiZap } from 'react-icons/fi';
import { useAISuggestions } from '@/shared/services/hooks/useAISuggestions';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import type { PokemonSummary } from '@/shared/types/pokemon';
import type { SuggestionItem } from '../scoring';
import type { TeamMember, SynergyBreakdown } from '@/shared/types/game-state';

interface SuggestionPanelProps {
  /** Algorithmic fallback suggestions */
  suggestions: SuggestionItem[];
  memberCount: number;
  members: TeamMember[];
  synergyScore: SynergyBreakdown | null;
  onAdd: (pokemon: PokemonSummary) => void;
}

export function SuggestionPanel({
  suggestions,
  memberCount,
  members,
  synergyScore,
  onAdd,
}: SuggestionPanelProps) {
  const { data: pokemonList = [] } = usePokemonList();

  const {
    data: aiData,
    isLoading: aiLoading,
    isError: aiError,
    refetch: retryAI,
  } = useAISuggestions(members, synergyScore);

  // Hide only when no Pokémon at all
  if (memberCount === 0) return null;

  const teamFull = memberCount >= 6;

  // Resolve AI suggestion names to PokemonSummary from the cached list
  const aiSuggestions = aiData?.suggestions
    .map((s) => {
      const match = pokemonList.find((p) => p.name === s.name);
      return match ? { pokemon: match, reason: s.reason, role: s.role } : null;
    })
    .filter(Boolean) as Array<{ pokemon: PokemonSummary; reason: string; role: string }> | undefined;

  const hasAI = aiSuggestions && aiSuggestions.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-1.5">
          <FiZap size={11} className="text-violet-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            {hasAI ? 'AI Suggestions' : 'Suggested Additions'}
          </p>
          {teamFull && (
            <span className="rounded-full border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-600">
              swap to add
            </span>
          )}
        </div>
        {(aiData || aiError) && (
          <button
            onClick={() => void retryAI()}
            disabled={aiLoading}
            className="text-[10px] text-zinc-600 underline hover:text-zinc-400 transition-colors disabled:opacity-40"
          >
            Refresh
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        {/* Idle — show trigger button (only when no AI data yet) */}
        {!aiData && !aiLoading && !aiError && (
          <button
            onClick={() => void retryAI()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/8 px-4 py-3 text-sm font-semibold text-violet-400 transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/15 hover:text-violet-300 active:scale-[0.98]"
          >
            <FiZap size={14} />
            Get AI Suggestions
          </button>
        )}
        {/* AI loading skeleton */}
        {aiLoading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-zinc-800/60"
                style={{ animationDelay: `${i * 80}ms` }}
              />
            ))}
          </div>
        )}

        {/* AI suggestions */}
        {hasAI && !aiLoading && (
          <div className="flex flex-col gap-2">
            {aiSuggestions.map((s, i) => (
              <AISuggestionCard
                key={s.pokemon.id}
                pokemon={s.pokemon}
                reason={s.reason}
                role={s.role}
                onAdd={onAdd}
                teamFull={teamFull}
                animationDelay={i * 60}
              />
            ))}
          </div>
        )}

        {/* Fallback: algorithmic suggestions (shown when AI failed or no results) */}
        {!aiLoading && !hasAI && aiData === undefined && aiError && (
          <div className="mb-2 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2.5 text-[11px] text-red-400">
            Request failed — try again in a moment.
          </div>
        )}
        {!aiLoading && !hasAI && (
          <>
            {suggestions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <span className="text-2xl" aria-hidden="true">🔍</span>
                <p className="text-xs text-zinc-600">
                  {memberCount < 2 ? 'Add a second Pokémon to get suggestions' : 'No suggestions available yet'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {suggestions.map((item, i) => (
                  <AlgoSuggestionCard
                    key={item.pokemon.id}
                    item={item}
                    onAdd={onAdd}
                    animationDelay={i * 60}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── AI suggestion card ────────────────────────────────────────────────────────

interface AISuggestionCardProps {
  pokemon: PokemonSummary;
  reason: string;
  role: string;
  onAdd: (pokemon: PokemonSummary) => void;
  teamFull: boolean;
  animationDelay: number;
}

function AISuggestionCard({ pokemon, reason, role, onAdd, teamFull, animationDelay }: AISuggestionCardProps) {
  return (
    <button
      onClick={() => !teamFull && onAdd(pokemon)}
      disabled={teamFull}
      className={[
        'group flex w-full flex-col gap-1.5 rounded-xl border border-zinc-800/60 bg-zinc-800/30 px-3 py-2.5 text-left',
        'transition-all duration-200 animate-[fadeSlideIn_0.25s_ease-out_both]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        teamFull
          ? 'cursor-default opacity-70'
          : 'hover:border-violet-500/30 hover:bg-zinc-800/60',
      ].join(' ')}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={teamFull ? `${pokemon.name} — remove a Pokémon to add` : `Add ${pokemon.name} to team`}
    >
      <div className="flex items-center gap-2.5">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className={`h-9 w-9 shrink-0 object-contain transition-transform duration-200 ${teamFull ? '' : 'group-hover:scale-110'}`}
          loading="lazy"
        />
        <span className="flex-1 truncate text-sm font-bold capitalize text-zinc-200 transition-colors group-hover:text-white">
          {pokemon.name}
        </span>
        <span className="shrink-0 rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400">
          {role}
        </span>
      </div>
      <p className="pl-[2.875rem] text-[11px] leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
        {reason}
      </p>
    </button>
  );
}

// ── Algorithmic fallback card ─────────────────────────────────────────────────

interface AlgoSuggestionCardProps {
  item: SuggestionItem;
  onAdd: (pokemon: PokemonSummary) => void;
  animationDelay: number;
}

function AlgoSuggestionCard({ item, onAdd, animationDelay }: AlgoSuggestionCardProps) {
  const { pokemon, improvement } = item;
  const hasImprovement = improvement > 0;

  return (
    <button
      onClick={() => onAdd(pokemon)}
      className="group flex w-full items-center gap-3 rounded-xl border border-zinc-800/60 bg-zinc-800/30 px-3 py-2 text-left
        transition-all duration-200
        hover:border-sky-500/30 hover:bg-zinc-800/60
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50
        animate-[fadeSlideIn_0.25s_ease-out_both]"
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`Add ${pokemon.name} to team`}
    >
      <img
        src={pokemon.sprite}
        alt={pokemon.name}
        className="h-9 w-9 shrink-0 object-contain transition-transform duration-200 group-hover:scale-110"
        loading="lazy"
      />
      <span className="flex-1 truncate text-sm font-semibold capitalize text-zinc-300 group-hover:text-white transition-colors">
        {pokemon.name}
      </span>
      {hasImprovement ? (
        <span className="shrink-0 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-400 tabular-nums">
          +{improvement}
        </span>
      ) : (
        <span className="shrink-0 rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
          Pick
        </span>
      )}
    </button>
  );
}
