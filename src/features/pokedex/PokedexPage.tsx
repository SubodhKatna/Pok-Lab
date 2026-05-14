import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FiSearch, FiChevronLeft, FiChevronRight, FiSave } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { usePokedex } from './hooks/usePokedex';
import { PokemonHero, PokemonStats, type FormOverride } from './components/PokemonHero';
import { PokemonInfo } from './components/PokemonInfo';
import { TypeChartSection } from './components/TypeChartPanel';
import { EvolutionChain } from './components/EvolutionChain';
import { MoveList } from './components/MoveList';
import { PokedexFilters, PokemonGrid } from './components/PokedexGrid';
import { computeTypeEffectiveness, computeOffense } from './logic';
import { useAuthContext } from '@/features/auth/AuthContext';
import { fetchPokemon } from '@/shared/services/pokeapi';
import {
  saveFavourite,
  removeFavourite,
  loadFavourites,
  saveComparison,
  loadComparisons,
  type SavedFavourite,
  type SavedComparison,
} from '@/lib/firestore';
import type { PokemonSummary, PokemonVariant, PokemonType } from '@/shared/types/pokemon';

export function PokedexPage() {
  const navigate = useNavigate();
  const { pokemonId } = useParams<{ pokemonId?: string }>();
  const { user } = useAuthContext();

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
  const [showFavourites, setShowFavourites] = useState(false);
  const [favourites, setFavourites] = useState<SavedFavourite[]>([]);
  const [savedComparisons, setSavedComparisons] = useState<SavedComparison[]>([]);
  const [savingComparison, setSavingComparison] = useState(false);
  const [activeForm, setActiveForm] = useState<FormOverride | null>(null);
  const [loadingFormId, setLoadingFormId] = useState<number | null>(null);
  const { selectedPokemon, isLoadingSelected, search, generationFilter, typeFilter, comparisonList } = state;

  // Load favourites when user changes
  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => setFavourites([]))
      return
    }
    void loadFavourites(user.uid).then(setFavourites);
  }, [user]);

  // Load saved comparisons when user changes
  useEffect(() => {
    if (!user) {
      void Promise.resolve().then(() => setSavedComparisons([]))
      return
    }
    void loadComparisons(user.uid).then(setSavedComparisons);
  }, [user]);

  const favouriteIds = useMemo(() => new Set(favourites.map((f) => f.pokemonId)), [favourites]);

  const handleToggleFavourite = useCallback(async (p: PokemonSummary) => {
    if (!user) return;
    if (favouriteIds.has(p.id)) {
      await removeFavourite(user.uid, p.id);
    } else {
      await saveFavourite(user.uid, {
        pokemonId: p.id,
        pokemonName: p.name,
        sprite: p.sprite,
      });
    }
    const updated = await loadFavourites(user.uid);
    setFavourites(updated);
  }, [user, favouriteIds]);

  const handleSaveComparison = useCallback(async () => {
    if (!user || comparisonList.length === 0) return;
    setSavingComparison(true);
    try {
      await saveComparison(user.uid, {
        label: comparisonList.map((p) => p.name).join(' vs '),
        pokemonIds: comparisonList.map((p) => p.id),
        pokemonNames: comparisonList.map((p) => p.name),
        pokemonSprites: comparisonList.map((p) => p.sprite),
      });
      const updated = await loadComparisons(user.uid);
      setSavedComparisons(updated);
    } finally {
      setSavingComparison(false);
    }
  }, [user, comparisonList]);

  // Filtered list with favourites filter applied
  const displayList = useMemo(() => {
    if (!showFavourites) return filteredList;
    return filteredList.filter((p) => favouriteIds.has(p.id));
  }, [filteredList, showFavourites, favouriteIds]);

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

  // Reset active form when selected pokemon changes — use ref comparison to avoid
  // calling setState synchronously inside an effect body
  const prevSelectedIdRef = React.useRef<number | undefined>(undefined);
  if (prevSelectedIdRef.current !== selectedPokemon?.id) {
    prevSelectedIdRef.current = selectedPokemon?.id;
    if (activeForm !== null) setActiveForm(null);
  }

  // Handle form variant selection — fetch raw data and lift into activeForm
  const handleFormSelect = useCallback(async (variant: PokemonVariant) => {
    // Toggle off if already active
    if (activeForm?.id === variant.id) {
      setActiveForm(null);
      return;
    }
    setLoadingFormId(variant.id);
    try {
      const raw = await fetchPokemon(variant.id);
      const sprite =
        raw.sprites.other['official-artwork'].front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`;
      const statsMap: Record<string, number> = {};
      for (const s of raw.stats) statsMap[s.stat.name] = s.base_stat;
      setActiveForm({
        id: raw.id,
        name: raw.name,
        sprite,
        types: raw.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name) as PokemonType[],
        stats: {
          hp: statsMap['hp'] ?? 0,
          attack: statsMap['attack'] ?? 0,
          defense: statsMap['defense'] ?? 0,
          spAtk: statsMap['special-attack'] ?? 0,
          spDef: statsMap['special-defense'] ?? 0,
          speed: statsMap['speed'] ?? 0,
        },
      });
    } finally {
      setLoadingFormId(null);
    }
  }, [activeForm]);

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-1/2 right-0 h-[400px] w-[400px] rounded-full bg-violet-900/15 blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-blue-900/10 blur-[80px]" />
      </div>

      {selectedPokemon ? (
        <div key={selectedPokemon.id} className="animate-pokemon-in min-h-screen">
          {/* Sticky nav bar */}
          <div className="sticky top-0 z-20 border-b border-white/6 bg-slate-950/90 backdrop-blur-md px-4 py-2.5 flex items-center gap-3">
            <button
              onClick={handleClearSelected}
              className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors"
              aria-label="Back to list"
            >
              <FiChevronLeft size={15} />
              <span className="hidden sm:inline">Pokédex</span>
            </button>
            <span className="text-slate-700 hidden sm:inline">/</span>
            <span className="text-sm font-bold capitalize text-white flex-1 truncate">{selectedPokemon.name}</span>
            <span className="text-xs text-slate-600 tabular-nums hidden sm:inline font-mono">
              #{String(selectedPokemon.id).padStart(4, '0')}
            </span>

            {/* Prev / Next */}
            <div className="flex items-center gap-1.5 ml-2">
              <button
                onClick={() => prevPokemon && void handleSelect(prevPokemon)}
                disabled={!prevPokemon}
                className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/8 hover:border-white/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                <FiChevronLeft size={12} />
                {prevPokemon && <span className="capitalize hidden md:inline max-w-[80px] truncate">{prevPokemon.name}</span>}
              </button>
              <button
                onClick={() => nextPokemon && void handleSelect(nextPokemon)}
                disabled={!nextPokemon}
                className="flex items-center gap-1 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/8 hover:border-white/15 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                {nextPokemon && <span className="capitalize hidden md:inline max-w-[80px] truncate">{nextPokemon.name}</span>}
                <FiChevronRight size={12} />
              </button>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <PokemonHero
                pokemon={selectedPokemon}
                activeForm={activeForm}
                loadingFormId={loadingFormId}
                onFormSelect={(v) => void handleFormSelect(v)}
                isFavourite={favouriteIds.has(selectedPokemon.id)}
                onToggleFavourite={user ? () => void handleToggleFavourite(selectedPokemon) : undefined}
              />
              <PokemonStats pokemon={selectedPokemon} activeForm={activeForm} />
              <PokemonInfo pokemon={selectedPokemon} />
              <TypeChartSection title="Weakness" chart={computeTypeEffectiveness(activeForm?.types ?? selectedPokemon.types)} />
              <TypeChartSection title="Offense"  chart={computeOffense(activeForm?.types ?? selectedPokemon.types)} />
            </div>

            <Section title="Evolution Chain">
              <EvolutionChain
                chain={selectedPokemon.evolutionChain}
                currentId={selectedPokemon.id}
                onSelect={handleEvoSelect}
              />
            </Section>

            <Section title="Move Pool">
              <MoveList moves={selectedPokemon.moves} />
            </Section>

            {user && comparisonList.length > 0 && (
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 px-5 py-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Comparison</p>
                  <p className="text-sm text-slate-300 capitalize">
                    {comparisonList.map((p) => p.name).join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => void handleSaveComparison()}
                  disabled={savingComparison}
                  className="flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20 disabled:opacity-50 transition-all"
                >
                  <FiSave size={14} />
                  {savingComparison ? 'Saving…' : 'Save Comparison'}
                </button>
              </div>
            )}

            {user && savedComparisons.length > 0 && (
              <Section title="Saved Comparisons">
                <div className="flex flex-col gap-2">
                  {savedComparisons.map((comp) => (
                    <div key={comp.id} className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/3 px-3 py-2.5">
                      <div className="flex -space-x-2 shrink-0">
                        {comp.pokemonSprites.slice(0, 4).map((sprite, i) => (
                          <img
                            key={i}
                            src={sprite}
                            alt={comp.pokemonNames[i]}
                            className="h-7 w-7 rounded-full border border-white/10 bg-slate-900 object-contain"
                          />
                        ))}
                      </div>
                      <p className="flex-1 text-sm text-slate-300 capitalize truncate">{comp.label}</p>
                      <p className="text-xs text-slate-600 shrink-0">{comp.createdAt.toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      ) : (
        /* Browse grid */
        <div className="flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 border-b border-white/6 bg-slate-950/85 backdrop-blur-md px-4 py-3 flex items-center gap-3">
            <h1 className="text-xl font-black tracking-tight text-white shrink-0">Pokédex</h1>
            <div className="relative flex-1 max-w-sm">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or number…"
                className="w-full rounded-xl border border-white/8 bg-white/5 py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-400/50 focus:bg-white/8 focus:outline-none transition-colors"
                aria-label="Search Pokémon"
              />
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={[
                'rounded-xl border px-3 py-2 text-xs font-semibold transition-all shrink-0',
                showFilters || hasTypeFilter || generationFilter !== null || showFavourites
                  ? 'border-indigo-400/50 bg-indigo-400/10 text-indigo-300'
                  : 'border-white/8 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/8',
              ].join(' ')}
            >
              {hasTypeFilter || generationFilter !== null || showFavourites ? 'Filters ●' : 'Filters'}
            </button>
          </header>

          {showFilters && (
            <PokedexFilters
              generationFilter={generationFilter}
              typeFilter={typeFilter}
              hasTypeFilter={hasTypeFilter}
              showFavourites={showFavourites}
              hasFavourites={favourites.length > 0}
              onGeneration={setGenerationFilter}
              onToggleType={toggleTypeFilter}
              onClearType={clearTypeFilter}
              onToggleFavourites={() => setShowFavourites((v) => !v)}
            />
          )}

          <div className="flex-1 p-4">
            <PokemonGrid
              list={displayList}
              isLoading={isListLoading}
              favouriteIds={favouriteIds}
              onSelect={(p) => void handleSelect(p)}
              onClearFilters={() => { setSearch(''); setGenerationFilter(null); clearTypeFilter(); setShowFavourites(false); }}
              onToggleFavourite={user ? (p) => void handleToggleFavourite(p) : undefined}
            />
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isLoadingSelected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
            <span className="text-sm text-slate-400">Loading…</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">{title}</div>
      {children}
    </div>
  );
}
