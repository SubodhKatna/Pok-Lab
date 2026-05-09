import { useCallback } from 'react'
import { useAuthContext } from './AuthContext'
import { saveGameScore, type GameScore } from '@/lib/firestore'

/**
 * Returns a function that saves a game score to Firestore.
 * No-op when user is not signed in.
 */
export function useGameScore() {
  const { user } = useAuthContext()

  const recordScore = useCallback(
    async (game: GameScore['game'], score: number): Promise<void> => {
      if (!user) return
      await saveGameScore(user.uid, { game, score })
    },
    [user],
  )

  return { recordScore }
}
