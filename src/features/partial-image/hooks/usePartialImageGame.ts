import { useReducer, useCallback, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import { buildPokemonDetail } from '@/shared/services/buildPokemonDetail'
import type { PokemonDetail, PokemonSummary } from '@/shared/types/pokemon'
import type { PartialImageGameState } from '@/shared/types/game-state'

const MAX_REVEAL_STEP = 4

type Action =
  | { type: 'START_ROUND'; payload: { mysteryPokemon: PokemonDetail } }
  | { type: 'SUBMIT_GUESS'; payload: { guessedId: number } }
  | { type: 'NEXT_ROUND' }

const initialState: PartialImageGameState = {
  mysteryPokemon: null,
  revealStep: 0,
  status: 'playing',
  sessionScore: 0,
  roundCount: 0,
}

function partialImageReducer(
  state: PartialImageGameState,
  action: Action,
): PartialImageGameState {
  switch (action.type) {
    case 'START_ROUND': {
      return {
        ...state,
        mysteryPokemon: action.payload.mysteryPokemon,
        revealStep: 0,
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

      const newRevealStep = state.revealStep + 1

      if (newRevealStep >= MAX_REVEAL_STEP) {
        return {
          ...state,
          revealStep: MAX_REVEAL_STEP,
          status: 'lost',
        }
      }

      return {
        ...state,
        revealStep: newRevealStep,
      }
    }

    case 'NEXT_ROUND': {
      return {
        ...state,
        mysteryPokemon: null,
        revealStep: 0,
        status: 'playing',
      }
    }

    default:
      return state
  }
}

export interface UsePartialImageGameReturn {
  state: PartialImageGameState
  cropOrigin: string
  pokemonList: PokemonSummary[]
  isListLoading: boolean
  listError: Error | null
  startRound: () => Promise<void>
  submitGuess: (pokemon: PokemonSummary) => void
  nextRound: () => Promise<void>
}

export function usePartialImageGame(): UsePartialImageGameReturn {
  const [state, dispatch] = useReducer(partialImageReducer, initialState)
  const [cropOrigin, setCropOrigin] = useState('50% 50%')
  const queryClient = useQueryClient()
  const {
    data: pokemonList = [],
    isLoading: isListLoading,
    error: listError,
  } = usePokemonList()

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

    // Generate a new random crop origin for this round (biased 20–80% to avoid edges)
    const x = 20 + Math.random() * 60
    const y = 20 + Math.random() * 60
    setCropOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`)

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
    cropOrigin,
    pokemonList,
    isListLoading,
    listError: listError as Error | null,
    startRound,
    submitGuess,
    nextRound,
  }
}
