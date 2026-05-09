import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

const provider = new GoogleAuthProvider()

export interface UseAuthReturn {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signIn = useCallback(async () => {
    try {
      await signInWithPopup(auth, provider)
    } catch (err) {
      // User closed the popup — not an error worth surfacing
      if ((err as { code?: string }).code !== 'auth/popup-closed-by-user') {
        throw err
      }
    }
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
  }, [])

  return { user, loading, signIn, signOut }
}
