import { useReducer, useCallback } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import { buildPokemonCore, buildPokemonMoves } from '@/shared/services/buildPokemonDetail';
import { fetchPokemonIdsByType } from '@/shared/services/pokeapi';
import type { PokemonDetail, PokemonSummary, PokemonType, MoveEntry } from '@/shared/types/pokemon';

// ── State ─────────────────────────────────────────────────────────────────────

export interface PokedexState {
  search: string;
  generationFilter: number | null;   // null = all generations
  typeFilter: PokemonType[];         // empty = all types; multi-select
  selectedPokemon: PokemonDetail | null;
  comparisonList: PokemonDetail[];   // max 4
  isLoadingSelected: boolean;
}

const initialState: PokedexState = {
  search: '',
  generationFilter: null,
  typeFilter: [],
  selectedPokemon: null,
  comparisonList: [],
  isLoadingSelected: false,
};

// ── Actions ───────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_GENERATION_FILTER'; payload: number | null }
  | { type: 'TOGGLE_TYPE_FILTER'; payload: PokemonType }
  | { type: 'CLEAR_TYPE_FILTER' }
  | { type: 'SET_LOADING_SELECTED'; payload: boolean }
  | { type: 'SET_SELECTED'; payload: PokemonDetail | null }
  | { type: 'ADD_TO_COMPARISON'; payload: PokemonDetail }
  | { type: 'REMOVE_FROM_COMPARISON'; payload: number }  // pokemon id
  | { type: 'CLEAR_COMPARISON' }
  | { type: 'CLEAR_SELECTED' };

function pokedexReducer(state: PokedexState, action: Action): PokedexState {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.payload };

    case 'SET_GENERATION_FILTER':
      return { ...state, generationFilter: action.payload };

    case 'TOGGLE_TYPE_FILTER': {
      const already = state.typeFilter.includes(action.payload);
      return {
        ...state,
        typeFilter: already
          ? state.typeFilter.filter((t) => t !== action.payload)
          : [...state.typeFilter, action.payload],
      };
    }

    case 'CLEAR_TYPE_FILTER':
      return { ...state, typeFilter: [] };

    case 'SET_LOADING_SELECTED':
      return { ...state, isLoadingSelected: action.payload };

    case 'SET_SELECTED':
      return { ...state, selectedPokemon: action.payload, isLoadingSelected: false };

    case 'ADD_TO_COMPARISON': {
      // Max 4, no duplicates
      if (state.comparisonList.length >= 4) return state;
      if (state.comparisonList.some((p) => p.id === action.payload.id)) return state;
      return { ...state, comparisonList: [...state.comparisonList, action.payload] };
    }

    case 'REMOVE_FROM_COMPARISON':
      return {
        ...state,
        comparisonList: state.comparisonList.filter((p) => p.id !== action.payload),
      };

    case 'CLEAR_COMPARISON':
      return { ...state, comparisonList: [] };

    case 'CLEAR_SELECTED':
      return { ...state, selectedPokemon: null };

    default:
      return state;
  }
}

// ── Generation ranges ─────────────────────────────────────────────────────────

const GEN_RANGES: Record<number, [number, number]> = {
  1: [1, 151],
  2: [152, 251],
  3: [252, 386],
  4: [387, 493],
  5: [494, 649],
  6: [650, 721],
  7: [722, 809],
  8: [810, 905],
  9: [906, 1025],
};

function pokemonGeneration(id: number): number {
  for (const [gen, [min, max]] of Object.entries(GEN_RANGES)) {
    if (id >= min && id <= max) return Number(gen);
  }
  return 0;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export interface UsePokedexReturn {
  state: PokedexState;
  filteredList: PokemonSummary[];
  isListLoading: boolean;
  listError: Error | null;
  setSearch: (q: string) => void;
  setGenerationFilter: (gen: number | null) => void;
  toggleTypeFilter: (type: PokemonType) => void;
  clearTypeFilter: () => void;
  selectPokemon: (pokemon: PokemonSummary) => Promise<void>;
  clearSelected: () => void;
  addToComparison: (pokemon: PokemonDetail) => void;
  removeFromComparison: (id: number) => void;
  clearComparison: () => void;
}

export function usePokedex(): UsePokedexReturn {
  const [state, dispatch] = useReducer(pokedexReducer, initialState);
  const queryClient = useQueryClient();
  const { data: pokemonList = [], isLoading: isListLoading, error: listError } = usePokemonList();

  // Fetch type-indexed ID sets when type filters are active
  const { data: typeFilteredIds } = useQuery<Set<number>>({
    queryKey: ['type-filter', ...state.typeFilter.slice().sort()],
    queryFn: async () => {
      if (state.typeFilter.length === 0) return new Set<number>();
      const results = await Promise.all(state.typeFilter.map(fetchPokemonIdsByType));
      // Intersection: pokemon must have ALL selected types
      if (results.length === 1) return new Set(results[0]);
      const [first, ...rest] = results;
      const intersection = first.filter((id) => rest.every((r) => r.includes(id)));
      return new Set(intersection);
    },
    enabled: state.typeFilter.length > 0,
    staleTime: Infinity,
  });

  const filteredList: PokemonSummary[] = pokemonList.filter((p) => {
    if (state.search) {
      const q = state.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !String(p.id).includes(q)) return false;
    }
    if (state.generationFilter !== null) {
      if (pokemonGeneration(p.id) !== state.generationFilter) return false;
    }
    if (state.typeFilter.length > 0 && typeFilteredIds) {
      if (!typeFilteredIds.has(p.id)) return false;
    }
    return true;
  });

  const fetchDetail = useCallback(
    async (nameOrId: string | number): Promise<PokemonDetail> => {
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', nameOrId]);
      if (cached) return cached;

      // Phase 1: fetch core (fast — no moves)
      const core = await queryClient.fetchQuery<PokemonDetail & { _rawMoves?: unknown[] }>({
        queryKey: ['pokemon-core', nameOrId],
        queryFn: () => buildPokemonCore(nameOrId),
        staleTime: Infinity,
      });

      // Phase 2: fetch moves in background (slow)
      const rawMoves = core._rawMoves as Parameters<typeof buildPokemonMoves>[0] | undefined;
      if (rawMoves) {
        const moves = await queryClient.fetchQuery<MoveEntry[]>({
          queryKey: ['pokemon-moves', nameOrId],
          queryFn: () => buildPokemonMoves(rawMoves),
          staleTime: Infinity,
        });
        core.moves = moves;
        delete core._rawMoves;
      }

      // Cache the full detail
      queryClient.setQueryData(['pokemon-detail', nameOrId], core);
      return core;
    },
    [queryClient],
  );

  const selectPokemon = useCallback(
    async (pokemon: PokemonSummary): Promise<void> => {
      dispatch({ type: 'SET_LOADING_SELECTED', payload: true });
      try {
        const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', pokemon.id]);
        if (cached) {
          dispatch({ type: 'SET_SELECTED', payload: cached });
          return;
        }

        // Phase 1: show page immediately with core data (no moves yet)
        const core = await queryClient.fetchQuery<PokemonDetail & { _rawMoves?: unknown[] }>({
          queryKey: ['pokemon-core', pokemon.id],
          queryFn: () => buildPokemonCore(pokemon.id),
          staleTime: Infinity,
        });
        const rawMoves = core._rawMoves as Parameters<typeof buildPokemonMoves>[0] | undefined;
        delete core._rawMoves;
        dispatch({ type: 'SET_SELECTED', payload: { ...core } });

        // Phase 2: fetch moves in background, then patch them in
        if (rawMoves) {
          const moves = await queryClient.fetchQuery<MoveEntry[]>({
            queryKey: ['pokemon-moves', pokemon.id],
            queryFn: () => buildPokemonMoves(rawMoves),
            staleTime: Infinity,
          });
          const full: PokemonDetail = { ...core, moves };
          queryClient.setQueryData(['pokemon-detail', pokemon.id], full);
          dispatch({ type: 'SET_SELECTED', payload: full });
        }
      } catch {
        dispatch({ type: 'SET_LOADING_SELECTED', payload: false });
      }
    },
    [queryClient],
  );

  const clearSelected = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
  }, []);

  const addToComparison = useCallback((pokemon: PokemonDetail) => {
    dispatch({ type: 'ADD_TO_COMPARISON', payload: pokemon });
  }, []);

  const removeFromComparison = useCallback((id: number) => {
    dispatch({ type: 'REMOVE_FROM_COMPARISON', payload: id });
  }, []);

  const clearComparison = useCallback(() => {
    dispatch({ type: 'CLEAR_COMPARISON' });
  }, []);

  return {
    state,
    filteredList,
    isListLoading,
    listError: listError as Error | null,
    setSearch: (q) => dispatch({ type: 'SET_SEARCH', payload: q }),
    setGenerationFilter: (gen) => dispatch({ type: 'SET_GENERATION_FILTER', payload: gen }),
    toggleTypeFilter: (type) => dispatch({ type: 'TOGGLE_TYPE_FILTER', payload: type }),
    clearTypeFilter: () => dispatch({ type: 'CLEAR_TYPE_FILTER' }),
    selectPokemon,
    clearSelected,
    addToComparison,
    removeFromComparison,
    clearComparison,
  };
}
