import { useReducer, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail'
import type { PokemonDetail, PokemonSummary } from '@/shared/types/pokemon'
import type { WTPGameState } from '@/shared/types/game-state'

const MAX_GUESSES = 3

type Action =
  | { type: 'START_ROUND'; payload: { mysteryPokemon: PokemonDetail } }
  | { type: 'SUBMIT_GUESS'; payload: { guessedId: number } }
  | { type: 'NEXT_ROUND' }

const initialState: WTPGameState = {
  mysteryPokemon: null,
  guessesRemaining: MAX_GUESSES,
  status: 'playing',
  sessionScore: 0,
  roundCount: 0,
}

function wtpReducer(state: WTPGameState, action: Action): WTPGameState {
  switch (action.type) {
    case 'START_ROUND': {
      return {
        ...state,
        mysteryPokemon: action.payload.mysteryPokemon,
        guessesRemaining: MAX_GUESSES,
        status: 'playing',
        roundCount: state.roundCount + 1,
      }
    }

    case 'SUBMIT_GUESS': {
      if (state.status !== 'playing' || state.mysteryPokemon === null) {
        return state
      }

      const isCorrect = action.payload.guessedId === state.mysteryPokemon.id

      if (isCorrect) {
        return {
          ...state,
          status: 'won',
          sessionScore: state.sessionScore + 1,
        }
      }

      const newGuessesRemaining = state.guessesRemaining - 1

      if (newGuessesRemaining <= 0) {
        return {
          ...state,
          guessesRemaining: 0,
          status: 'lost',
        }
      }

      return {
        ...state,
        guessesRemaining: newGuessesRemaining,
      }
    }

    case 'NEXT_ROUND': {
      // Reset round state but keep session score and round count
      // (round count increments on START_ROUND)
      return {
        ...state,
        mysteryPokemon: null,
        guessesRemaining: MAX_GUESSES,
        status: 'playing',
      }
    }

    default:
      return state
  }
}

export interface UseWTPGameReturn {
  state: WTPGameState
  pokemonList: PokemonSummary[]
  isListLoading: boolean
  listError: Error | null
  startRound: () => Promise<void>
  submitGuess: (pokemon: PokemonSummary) => void
  nextRound: () => Promise<void>
}

export function useWTPGame(): UseWTPGameReturn {
  const [state, dispatch] = useReducer(wtpReducer, initialState)
  const queryClient = useQueryClient()
  const { data: pokemonList = [], isLoading: isListLoading, error: listError } = usePokemonList()

  const fetchPokemonDetail = useCallback(
    async (nameOrId: string | number): Promise<PokemonDetail> => {
      const cached = queryClient.getQueryData<PokemonDetail>(['pokemon-detail', nameOrId])
      if (cached) return cached

      return queryClient.fetchQuery<PokemonDetail>({
        queryKey: ['pokemon-detail', nameOrId],
        queryFn: () => buildPokemonDetail(nameOrId),
        staleTime: Infinity,
      })
    },
    [queryClient],
  )

  const pickRandomPokemon = useCallback((): PokemonSummary | null => {
    if (pokemonList.length === 0) return null
    const idx = Math.floor(Math.random() * pokemonList.length)
    return pokemonList[idx]
  }, [pokemonList])

  const startRound = useCallback(async (): Promise<void> => {
    const summary = pickRandomPokemon()
    if (!summary) return

    const mysteryPokemon = await fetchPokemonDetail(summary.id)
    dispatch({ type: 'START_ROUND', payload: { mysteryPokemon } })
  }, [pickRandomPokemon, fetchPokemonDetail])

  const submitGuess = useCallback((pokemon: PokemonSummary): void => {
    dispatch({ type: 'SUBMIT_GUESS', payload: { guessedId: pokemon.id } })
  }, [])

  const nextRound = useCallback(async (): Promise<void> => {
    dispatch({ type: 'NEXT_ROUND' })
    await startRound()
  }, [startRound])

  return {
    state,
    pokemonList,
    isListLoading,
    listError: listError as Error | null,
    startRound,
    submitGuess,
    nextRound,
  }
}
