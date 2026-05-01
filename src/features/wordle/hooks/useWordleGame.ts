import { useReducer, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail';
import { computeStatFeedback, computeAttributeFeedback } from '../logic';
import type { PokemonDetail, PokemonSummary } from '@/shared/types/pokemon';
import type {
  WordleGameState,
  WordleMode,
  FeedbackRow,
  WordleSessionStats,
} from '@/shared/types/game-state';

const GENERATION_RANGES: Record<number, [number, number]> = {
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
type Action =
  | {
      type: 'START_GAME';
      payload: { mode: WordleMode; generationFilter: number[]; mysteryPokemon: PokemonDetail };
    }
  | { type: 'SUBMIT_GUESS'; payload: { guessed: PokemonDetail } }
  | { type: 'RESET_GAME' }
  | { type: 'USE_HINT1' }
  | { type: 'USE_HINT2' }
  | { type: 'GIVE_UP' };


const initialSessionStats: WordleSessionStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};

const initialState: WordleGameState = {
  mode: 'attributes',
  mysteryPokemon: null,
  guesses: [],
  status: 'idle',
  generationFilter: [],
  sessionStats: initialSessionStats,
  hint1Used: false,
  hint2Used: false,
};

function wordleReducer(state: WordleGameState, action: Action): WordleGameState {
  switch (action.type) {
    case 'START_GAME': {
      const { mode, generationFilter, mysteryPokemon } = action.payload;
      return {
        ...state,
        mode,
        generationFilter,
        mysteryPokemon,
        guesses: [],
        status: 'playing',
        hint1Used: false,
        hint2Used: false,
      };
    }

    case 'SUBMIT_GUESS': {
      if (state.status !== 'playing' || state.mysteryPokemon === null) {
        return state;
      }

      const { guessed } = action.payload;
      const mystery = state.mysteryPokemon;

      // Compute feedback row based on current mode
      const feedbackRow: FeedbackRow =
        state.mode === 'stats'
          ? computeStatFeedback(guessed, mystery)
          : computeAttributeFeedback(guessed, mystery);

      const newGuesses = [...state.guesses, feedbackRow];
      const isCorrect = guessed.id === mystery.id;

      if (isCorrect) {
        const newStreak = state.sessionStats.currentStreak + 1;
        return {
          ...state,
          guesses: newGuesses,
          status: 'won',
          sessionStats: {
            gamesPlayed: state.sessionStats.gamesPlayed + 1,
            wins: state.sessionStats.wins + 1,
            currentStreak: newStreak,
            maxStreak: Math.max(state.sessionStats.maxStreak, newStreak),
          },
        };
      }

      return {
        ...state,
        guesses: newGuesses,
        status: 'playing',
      };
    }

    case 'RESET_GAME': {
      return {
        ...state,
        mysteryPokemon: null,
        guesses: [],
        status: 'idle',
        hint1Used: false,
        hint2Used: false,
      };
    }

    case 'USE_HINT1':
      return { ...state, hint1Used: true };

    case 'USE_HINT2':
      return { ...state, hint2Used: true };

    case 'GIVE_UP': {
      if (state.status !== 'playing') return state;
      return {
        ...state,
        status: 'lost',
        sessionStats: {
          ...state.sessionStats,
          gamesPlayed: state.sessionStats.gamesPlayed + 1,
          currentStreak: 0,
        },
      };
    }

    default:
      return state;
  }
}
export interface UseWordleGameReturn {
  state: WordleGameState;
  pokemonList: PokemonSummary[];
  isListLoading: boolean;
  listError: Error | null;
  startGame: (mode: WordleMode, generationFilter?: number[]) => Promise<void>;
  submitGuess: (pokemon: PokemonDetail) => void;
  resetGame: () => void;
  useHint1: () => void;
  useHint2: () => void;
  giveUp: () => void;
}

export function useWordleGame(): UseWordleGameReturn {
  const [state, dispatch] = useReducer(wordleReducer, initialState);
  const queryClient = useQueryClient();
  const { data: pokemonList = [], isLoading: isListLoading, error: listError } = usePokemonList();

  const pickRandomPokemon = useCallback(
    (generationFilter: number[]): PokemonSummary | null => {
      if (pokemonList.length === 0) return null;

      let eligible = pokemonList;

      if (generationFilter.length > 0) {
        eligible = pokemonList.filter((p) => {
          return generationFilter.some((gen) => {
            const range = GENERATION_RANGES[gen];
            if (!range) return false;
            return p.id >= range[0] && p.id <= range[1];
          });
        });
      }

      if (eligible.length === 0) return null;

      const idx = Math.floor(Math.random() * eligible.length);
      return eligible[idx];
    },
    [pokemonList],
  );


  const fetchPokemonDetail = useCallback(
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


  const startGame = useCallback(
    async (mode: WordleMode, generationFilter: number[] = []): Promise<void> => {
      const summary = pickRandomPokemon(generationFilter);
      if (!summary) return;

      const mysteryPokemon = await fetchPokemonDetail(summary.id);

      dispatch({
        type: 'START_GAME',
        payload: { mode, generationFilter, mysteryPokemon },
      });
    },
    [pickRandomPokemon, fetchPokemonDetail],
  );

  const submitGuess = useCallback((pokemon: PokemonDetail): void => {
    dispatch({ type: 'SUBMIT_GUESS', payload: { guessed: pokemon } });
  }, []);

  const resetGame = useCallback((): void => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const useHint1 = useCallback((): void => {
    dispatch({ type: 'USE_HINT1' });
  }, []);

  const useHint2 = useCallback((): void => {
    dispatch({ type: 'USE_HINT2' });
  }, []);

  const giveUp = useCallback((): void => {
    dispatch({ type: 'GIVE_UP' });
  }, []);

  return {
    state,
    pokemonList,
    isListLoading,
    listError: listError as Error | null,
    startGame,
    submitGuess,
    resetGame,
    useHint1,
    useHint2,
    giveUp,
  };
}
