import { useReducer, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import { fetchPokemon } from '@/shared/services/pokeapi';
import { computeStatFeedback, computeAttributeFeedback } from '../logic';
import type { PokemonDetail, PokemonSummary } from '@/shared/types/pokemon';
import type {
  WordleGameState,
  WordleMode,
  FeedbackRow,
  WordleSessionStats,
} from '@/shared/types/game-state';

// ---------------------------------------------------------------------------
// Generation ID ranges (National Pokédex IDs, inclusive)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------
type Action =
  | {
      type: 'START_GAME';
      payload: { mode: WordleMode; generationFilter: number[]; mysteryPokemon: PokemonDetail };
    }
  | { type: 'SUBMIT_GUESS'; payload: { guessed: PokemonDetail } }
  | { type: 'RESET_GAME' };

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const initialSessionStats: WordleSessionStats = {
  gamesPlayed: 0,
  wins: 0,
  currentStreak: 0,
  maxStreak: 0,
};

const initialState: WordleGameState = {
  mode: 'stats',
  mysteryPokemon: null,
  guesses: [],
  status: 'idle',
  generationFilter: [],
  sessionStats: initialSessionStats,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
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

      // No max guess limit — game continues until correct
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
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------
export interface UseWordleGameReturn {
  state: WordleGameState;
  pokemonList: PokemonSummary[];
  isListLoading: boolean;
  listError: Error | null;
  startGame: (mode: WordleMode, generationFilter?: number[]) => Promise<void>;
  submitGuess: (pokemon: PokemonDetail) => void;
  resetGame: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useWordleGame(): UseWordleGameReturn {
  const [state, dispatch] = useReducer(wordleReducer, initialState);
  const queryClient = useQueryClient();
  const { data: pokemonList = [], isLoading: isListLoading, error: listError } = usePokemonList();

  /**
   * Filter the Pokémon list by generation, then pick a random entry.
   * If no generation filter is provided (or the array is empty), all Pokémon
   * are eligible.
   */
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

  /**
   * Fetch a PokemonDetail, using React Query's cache when available.
   * Falls back to a direct fetch and stores the result in the cache.
   */
  const fetchPokemonDetail = useCallback(
    async (nameOrId: string | number): Promise<PokemonDetail> => {
      // Try to get from cache first
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', nameOrId]);
      if (cached) return cached;

      // Fetch via React Query's fetchQuery so the result is cached
      return queryClient.fetchQuery<PokemonDetail>({
        queryKey: ['pokemon-detail', nameOrId],
        queryFn: async () => {
          const raw = await fetchPokemon(nameOrId);

          const sprite =
            raw.sprites.other['official-artwork'].front_default ??
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`;

          // Map raw stats array to BaseStats
          const statsMap: Record<string, number> = {};
          for (const s of raw.stats) {
            statsMap[s.stat.name] = s.base_stat;
          }

          // Map raw types to PokemonType[]
          const types = raw.types
            .sort((a, b) => a.slot - b.slot)
            .map((t) => t.type.name) as PokemonDetail['types'];

          // Map abilities
          const abilities = raw.abilities.map((a) => a.ability.name);

          // NOTE: generation, color, eggGroups, evolutionStage, description,
          // moves, and evolutionChain require additional PokeAPI endpoints
          // (species, move details, evolution chain) that are not yet implemented
          // (see task 20). We provide sensible defaults here so the hook is
          // functional for the Wordle game, which only uses stats and attributes
          // that are available from the /pokemon endpoint.
          const detail: PokemonDetail = {
            id: raw.id,
            name: raw.name,
            sprite,
            types,
            stats: {
              hp: statsMap['hp'] ?? 0,
              attack: statsMap['attack'] ?? 0,
              defense: statsMap['defense'] ?? 0,
              spAtk: statsMap['special-attack'] ?? 0,
              spDef: statsMap['special-defense'] ?? 0,
              speed: statsMap['speed'] ?? 0,
            },
            abilities,
            height: raw.height,
            weight: raw.weight,
            // Fields requiring species/evolution endpoints — defaults until task 20
            generation: 0,
            color: '',
            eggGroups: [],
            evolutionStage: 1,
            description: '',
            moves: [],
            evolutionChain: [],
          };

          return detail;
        },
        staleTime: Infinity,
      });
    },
    [queryClient],
  );

  /**
   * Start a new game: pick a random mystery Pokémon (filtered by generation),
   * fetch its full detail, and transition to 'playing'.
   */
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

  /**
   * Submit a guess. The caller must provide a fully-resolved PokemonDetail.
   * Computes feedback and checks for win condition.
   */
  const submitGuess = useCallback((pokemon: PokemonDetail): void => {
    dispatch({ type: 'SUBMIT_GUESS', payload: { guessed: pokemon } });
  }, []);

  /**
   * Reset the current game back to idle without clearing session stats.
   */
  const resetGame = useCallback((): void => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  return {
    state,
    pokemonList,
    isListLoading,
    listError: listError as Error | null,
    startGame,
    submitGuess,
    resetGame,
  };
}
