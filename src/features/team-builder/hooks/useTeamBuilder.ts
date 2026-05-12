import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail';
import {
  computeSynergyScore,
  computeTournamentScore,
  computeTeamCoverage,
} from '../scoring';
import type { TeamBuilderState, SynergyBreakdown } from '@/shared/types/game-state';
import type { PokemonSummary, PokemonDetail } from '@/shared/types/pokemon';
import type { TeamCoverageGrid } from '../scoring';
import { readPersistedTeam, persistTeam } from './useTeamPersistence';

// ── Extended state ─────────────────────────────────────────────────────────────

export interface TeamBuilderExtendedState extends Omit<TeamBuilderState, 'suggestions'> {
  coverage: TeamCoverageGrid | null;
  isLoadingMember: boolean;
  error: string | null;
}

const initialState: TeamBuilderExtendedState = {
  members: [],
  tournamentMode: false,
  synergyScore: null,
  tournamentScore: null,
  coverage: null,
  isLoadingMember: false,
  error: null,
};

// ── Actions ────────────────────────────────────────────────────────────────────

type Action =
  | { type: 'ADD_MEMBER'; payload: PokemonDetail }
  | { type: 'REMOVE_MEMBER'; payload: number }           // pokemon id
  | { type: 'SET_ITEM'; payload: { id: number; item: string } }
  | { type: 'TOGGLE_TOURNAMENT_MODE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | {
      type: 'RECOMPUTE';
      payload: {
        synergyScore: SynergyBreakdown | null;
        tournamentScore: number | null;
        coverage: TeamCoverageGrid | null;
      };
    };

function teamBuilderReducer(
  state: TeamBuilderExtendedState,
  action: Action,
): TeamBuilderExtendedState {
  switch (action.type) {
    case 'ADD_MEMBER': {
      if (state.members.length >= 6) return state;
      if (state.members.some((m) => m.pokemon.id === action.payload.id)) return state;
      return {
        ...state,
        members: [...state.members, { pokemon: action.payload }],
        isLoadingMember: false,
        error: null,
      };
    }

    case 'REMOVE_MEMBER': {
      return {
        ...state,
        members: state.members.filter((m) => m.pokemon.id !== action.payload),
      };
    }

    case 'SET_ITEM': {
      return {
        ...state,
        members: state.members.map((m) =>
          m.pokemon.id === action.payload.id
            ? { ...m, heldItem: action.payload.item }
            : m,
        ),
      };
    }

    case 'TOGGLE_TOURNAMENT_MODE': {
      return { ...state, tournamentMode: !state.tournamentMode };
    }

    case 'SET_LOADING': {
      return { ...state, isLoadingMember: action.payload };
    }

    case 'SET_ERROR': {
      return { ...state, error: action.payload, isLoadingMember: false };
    }

    case 'RECOMPUTE': {
      return {
        ...state,
        synergyScore: action.payload.synergyScore,
        tournamentScore: action.payload.tournamentScore,
        coverage: action.payload.coverage,
      };
    }

    default:
      return state;
  }
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface UseTeamBuilderReturn {
  state: TeamBuilderExtendedState;
  pokemonList: PokemonSummary[];
  isListLoading: boolean;
  addPokemon: (summary: PokemonSummary) => Promise<void>;
  removePokemon: (id: number) => void;
  setItem: (id: number, item: string) => void;
  toggleTournamentMode: () => void;
}

export function useTeamBuilder(): UseTeamBuilderReturn {
  const [state, dispatch] = useReducer(teamBuilderReducer, initialState);
  const queryClient = useQueryClient();
  const { data: pokemonList = [], isLoading: isListLoading } = usePokemonList();
  const restoredRef = useRef(false);

  // ── Fetch detail helper ──────────────────────────────────────────────────────
  const fetchDetail = useCallback(
    async (nameOrId: string | number): Promise<PokemonDetail> => {
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', nameOrId]);
      if (cached) return cached;
      return queryClient.fetchQuery<PokemonDetail>({
        queryKey: ['pokemon-detail', nameOrId],
        queryFn: () => buildPokemonDetail(nameOrId),
        staleTime: Infinity,
      });
    },
    [queryClient],
  );

  // ── Restore team from URL / localStorage on first mount ─────────────────────
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;

    const slots = readPersistedTeam();
    if (slots.length === 0) return;

    // Fetch each Pokémon detail sequentially and add to team
    void (async () => {
      for (const slot of slots) {
        try {
          const detail = await fetchDetail(slot.name);
          dispatch({ type: 'ADD_MEMBER', payload: detail });
          if (slot.heldItem) {
            dispatch({ type: 'SET_ITEM', payload: { id: detail.id, item: slot.heldItem } });
          }
        } catch {
          // Skip Pokémon that fail to load (e.g. invalid name in URL)
        }
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Persist team to localStorage + URL on every change ──────────────────────
  useEffect(() => {
    if (!restoredRef.current) return;
    persistTeam(
      state.members.map((m) => ({
        name: m.pokemon.name,
        heldItem: m.heldItem,
      })),
    );
  }, [state.members]);

  // ── Recompute scores whenever members or tournamentMode change ───────────────
  useEffect(() => {
    const members = state.members;

    const synergyScore = computeSynergyScore(members);
    const tournamentScore = state.tournamentMode ? computeTournamentScore(members) : null;
    const coverage = members.length > 0 ? computeTeamCoverage(members) : null;

    dispatch({
      type: 'RECOMPUTE',
      payload: { synergyScore, tournamentScore, coverage },
    });
  }, [state.members, state.tournamentMode]);

  // ── Public actions ───────────────────────────────────────────────────────────
  const addPokemon = useCallback(
    async (summary: PokemonSummary): Promise<void> => {
      if (state.members.length >= 6) return;
      if (state.members.some((m) => m.pokemon.id === summary.id)) return;

      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const detail = await fetchDetail(summary.id);
        dispatch({ type: 'ADD_MEMBER', payload: detail });
      } catch {
        dispatch({ type: 'SET_ERROR', payload: `Failed to load ${summary.name}. Please try again.` });
      }
    },
    [state.members, fetchDetail],
  );

  const removePokemon = useCallback((id: number): void => {
    dispatch({ type: 'REMOVE_MEMBER', payload: id });
  }, []);

  const setItem = useCallback((id: number, item: string): void => {
    dispatch({ type: 'SET_ITEM', payload: { id, item } });
  }, []);

  const toggleTournamentMode = useCallback((): void => {
    dispatch({ type: 'TOGGLE_TOURNAMENT_MODE' });
  }, []);

  return {
    state,
    pokemonList,
    isListLoading,
    addPokemon,
    removePokemon,
    setItem,
    toggleTournamentMode,
  };
}
