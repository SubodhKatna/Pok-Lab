import { useState, useCallback, useMemo, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { usePokedex } from './hooks/usePokedex';
import { PokemonHero, PokemonStats } from './components/PokemonHero';
import { PokemonInfo } from './components/PokemonInfo';
import { TypeChartSection, computeOffense } from './components/TypeChartPanel';
import { EvolutionChain } from './components/EvolutionChain';
import { MoveList } from './components/MoveList';
import { PokedexFilters, PokemonGrid } from './components/PokedexGrid';
import { computeTypeEffectiveness } from './logic';

export function PokedexPage() {
  const navigate = useNavigate();
  const { pokemonId } = useParams<{ pokemonId?: string }>();

  const {
    state,
    filteredList,
    isListLoading,
    setSearch,
    setGenerationFilter,
    toggleTypeFilter,
    clearTypeFilter,
    selectPokemon,
    clearSelected,
  } = usePokedex();

  const [showFilters, setShowFilters] = useState(false);
  const { selectedPokemon, isLoadingSelected, search, generationFilter, typeFilter } = state;

  // On mount / URL change: if there's a pokemonId param, load that pokemon
  useEffect(() => {
    if (!pokemonId) return;
    const id = parseInt(pokemonId, 10);
    if (isNaN(id)) return;
    if (selectedPokemon?.id === id) return;
    void selectPokemon({
      id,
      name: '',
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pokemonId]);

  // Keep URL in sync when selected pokemon changes
  const handleSelect = useCallback(
    async (p: { id: number; name: string; sprite: string }) => {
      navigate(`/pokedex/${p.id}`, { replace: false });
      await selectPokemon(p);
    },
    [navigate, selectPokemon],
  );

  const handleClearSelected = useCallback(() => {
    clearSelected();
    navigate('/pokedex', { replace: false });
  }, [clearSelected, navigate]);

  const selectedIndex = useMemo(
    () => (selectedPokemon ? filteredList.findIndex((p) => p.id === selectedPokemon.id) : -1),
    [selectedPokemon, filteredList],
  );
  const prevPokemon = selectedIndex > 0 ? filteredList[selectedIndex - 1] : null;
  const nextPokemon = selectedIndex >= 0 && selectedIndex < filteredList.length - 1 ? filteredList[selectedIndex + 1] : null;

  const handleEvoSelect = useCallback(
    (id: number, name: string) => {
      void handleSelect({
        id, name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      });
    },
    [handleSelect],
  );

  const hasTypeFilter = typeFilter.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-60 -left-20 h-[600px] w-[600px] rounded-full bg-violet-900/10 blur-[140px]" />
        <div className="absolute top-1/3 right-0 h-[400px] w-[400px] rounded-full bg-sky-900/10 blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-rose-900/8 blur-[100px]" />
      </div>

      {selectedPokemon ? (
        <div key={selectedPokemon.id} className="animate-pokemon-in min-h-screen">
          {/* Sticky nav bar */}
          <div className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
            <button
              onClick={handleClearSelected}
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors"
              aria-label="Back to list"
            >
              <FiChevronLeft size={15} />
              <span className="hidden sm:inline">Pokédex</span>
            </button>
            <span className="text-zinc-700 hidden sm:inline">/</span>
            <span className="text-sm font-bold capitalize text-white flex-1 truncate">{selectedPokemon.name}</span>
            <span className="text-xs text-zinc-600 tabular-nums hidden sm:inline">
              #{String(selectedPokemon.id).padStart(4, '0')}
            </span>

            {/* Prev / Next */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => prevPokemon && void handleSelect(prevPokemon)}
                disabled={!prevPokemon}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={12} />
                {prevPokemon && <span className="capitalize hidden md:inline max-w-[80px] truncate">{prevPokemon.name}</span>}
              </button>
              <button
                onClick={() => nextPokemon && void handleSelect(nextPokemon)}
                disabled={!nextPokemon}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300 hover:bg-white/10 hover:border-white/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              >
                {nextPokemon && <span className="capitalize hidden md:inline max-w-[80px] truncate">{nextPokemon.name}</span>}
                <FiChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
            {/* 3-col grid: Photo | Stats | Info(spans 2 rows) */}
            {/*            Weakness | Offense | ^              */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <PokemonHero pokemon={selectedPokemon} />
              <PokemonStats pokemon={selectedPokemon} />
              <PokemonInfo pokemon={selectedPokemon} />
              <TypeChartSection title="Weakness" chart={computeTypeEffectiveness(selectedPokemon.types)} />
              <TypeChartSection title="Offense"  chart={computeOffense(selectedPokemon.types)} />
            </div>

            {/* Evolution */}
            <Section title="Evolution Chain">
              <EvolutionChain
                chain={selectedPokemon.evolutionChain}
                currentId={selectedPokemon.id}
                onSelect={handleEvoSelect}
              />
            </Section>

            {/* Moves */}
            <Section title="Move Pool">
              <MoveList moves={selectedPokemon.moves} />
            </Section>
          </div>
        </div>
      ) : (
        /* Browse grid */
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md px-4 py-3 flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-white shrink-0">Pokédex</h1>
            <div className="relative flex-1 max-w-sm">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or number…"
                className="w-full rounded-xl border border-white/8 bg-white/5 py-2 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/50 focus:bg-white/8 focus:outline-none transition-colors"
                aria-label="Search Pokémon"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={[
                'rounded-xl border px-3 py-2 text-xs font-semibold transition-all shrink-0',
                showFilters || hasTypeFilter || generationFilter !== null
                  ? 'border-sky-500/50 bg-sky-500/10 text-sky-300'
                  : 'border-white/8 bg-white/5 text-zinc-400 hover:text-zinc-200 hover:bg-white/8',
              ].join(' ')}
            >
              {hasTypeFilter || generationFilter !== null ? 'Filters \u25cf' : 'Filters'}
            </button>
          </header>

          {showFilters && (
            <PokedexFilters
              generationFilter={generationFilter}
              typeFilter={typeFilter}
              hasTypeFilter={hasTypeFilter}
              onGeneration={setGenerationFilter}
              onToggleType={toggleTypeFilter}
              onClearType={clearTypeFilter}
            />
          )}

          <div className="flex-1 p-4">
            <PokemonGrid
              list={filteredList}
              isLoading={isListLoading}
              onSelect={(p) => void handleSelect(p)}
              onClearFilters={() => { setSearch(''); setGenerationFilter(null); clearTypeFilter(); }}
            />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
            <span className="text-sm text-zinc-400">Loading…</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">{title}</div>
      {children}
    </div>
  );
}
