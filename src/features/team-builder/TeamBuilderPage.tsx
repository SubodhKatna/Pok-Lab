import { useState } from 'react';
import { FiLink, FiCheck } from 'react-icons/fi';
import { useTeamBuilder } from './hooks/useTeamBuilder';
import { TeamSlot } from './components/TeamSlot';
import { TypeCoverageGrid } from './components/TypeCoverageGrid';
import { SynergyScorePanel } from './components/SynergyScorePanel';
import { MyTeamsPanel } from './components/MyTeamsPanel';
import type { PokemonSummary } from '@/shared/types/pokemon';

const SLOT_COUNT = 6;

export function TeamBuilderPage() {
  const { state, addPokemon, removePokemon, setItem, toggleTournamentMode } = useTeamBuilder();
  const [copied, setCopied] = useState(false);

  const {
    members,
    tournamentMode,
    synergyScore,
    tournamentScore,
    coverage,
    isLoadingMember,
    error,
  } = state;

  const handleSelect = (pokemon: PokemonSummary) => {
    void addPokemon(pokemon);
  };

  const handleLoadTeam = (pokemonList: PokemonSummary[]) => {
    // Remove all current members first, then add new ones sequentially
    // We remove by ID from the current snapshot to avoid stale closure issues
    const currentIds = members.map((m) => m.pokemon.id)
    currentIds.forEach((id) => removePokemon(id))
    // Use setTimeout to let the removals flush before adding
    setTimeout(() => {
      pokemonList.forEach((p) => void addPokemon(p))
    }, 0)
  }

  const handleCopyLink = () => {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-60 left-1/3 h-[600px] w-[600px] rounded-full bg-violet-900/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-sky-900/10 blur-[130px]" />
        <div className="absolute top-1/2 left-0 h-[300px] w-[300px] rounded-full bg-emerald-900/5 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              Pokémon Game Hub
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">Team Builder</h1>
            <p className="mt-1 text-sm text-zinc-500">
              Assemble a team of up to 6 Pokémon and analyse its synergy, coverage, and tournament viability.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isLoadingMember && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent" />
                Loading…
              </div>
            )}

            {members.length > 0 && (
              <span className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-semibold text-zinc-400">
                {members.length} / {SLOT_COUNT}
              </span>
            )}

            {/* Share / copy link */}
            {members.length > 0 && (
              <button
                onClick={handleCopyLink}
                className={[
                  'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-200',
                  copied
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                ].join(' ')}
                title="Copy shareable link"
              >
                {copied ? <FiCheck size={14} /> : <FiLink size={14} />}
                {copied ? 'Copied!' : 'Share'}
              </button>
            )}

            <button
              onClick={toggleTournamentMode}
              className={[
                'rounded-xl border px-4 py-2 text-sm font-bold transition-all duration-200',
                tournamentMode
                  ? 'border-violet-500/50 bg-violet-500/10 text-violet-300 shadow-[0_0_12px_2px_rgba(139,92,246,0.15)]'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
              ].join(' ')}
              aria-pressed={tournamentMode}
            >
              ⚔️ {tournamentMode ? 'VGC Mode ON' : 'VGC Mode'}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </div>
        )}

        {/* ── Main grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_360px]">

          {/* Left column */}
          <div className="flex flex-col gap-6">

            {/* Team slots */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Your Team</p>
                {members.length > 0 && (
                  <div className="flex -space-x-2">
                    {members.map((m) => (
                      <img
                        key={m.pokemon.id}
                        src={m.pokemon.sprite}
                        alt={m.pokemon.name}
                        className="h-6 w-6 rounded-full border border-zinc-800 bg-zinc-900 object-contain"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {Array.from({ length: SLOT_COUNT }).map((_, i) => (
                  <TeamSlot
                    key={i}
                    index={i}
                    member={members[i] ?? null}
                    onRemove={removePokemon}
                    onSetItem={setItem}
                    onAddPokemon={handleSelect}
                    teamFull={members.length >= SLOT_COUNT}
                  />
                ))}
              </div>
            </div>

            {/* Type coverage */}
            {coverage && members.length > 0 && (
              <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-500">Type Coverage</p>
                <TypeCoverageGrid coverage={coverage} memberCount={members.length} />
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">
            <SynergyScorePanel
              synergyScore={synergyScore}
              tournamentMode={tournamentMode}
              tournamentScore={tournamentScore}
              memberCount={members.length}
              members={members}
            />

            <MyTeamsPanel
              members={members}
              onLoadTeam={handleLoadTeam}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
