/**
 * Typed Firestore helpers.
 * All writes are no-ops when uid is null/undefined — no auth wall.
 */
import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SavedTeam {
  id: string
  name: string
  /** Array of Pokémon IDs */
  pokemonIds: number[]
  /** Array of Pokémon names (for display without re-fetching) */
  pokemonNames: string[]
  /** Array of sprite URLs */
  pokemonSprites: string[]
  createdAt: Date
}

export interface SavedFavourite {
  id: string
  pokemonId: number
  pokemonName: string
  sprite: string
  createdAt: Date
}

export interface SavedComparison {
  id: string
  label: string
  pokemonIds: number[]
  pokemonNames: string[]
  pokemonSprites: string[]
  createdAt: Date
}

export interface GameScore {
  id: string
  game: 'wordle' | 'whos-that-pokemon' | 'partial-image'
  score: number
  date: Date
}

// ── Collection path helpers ───────────────────────────────────────────────────

const teamsCol = (uid: string) => collection(db, 'users', uid, 'teams')
const teamDoc = (uid: string, teamId: string) => doc(db, 'users', uid, 'teams', teamId)

const favsCol = (uid: string) => collection(db, 'users', uid, 'favourites')
const favDoc = (uid: string, favId: string) => doc(db, 'users', uid, 'favourites', favId)

const comparisonsCol = (uid: string) => collection(db, 'users', uid, 'comparisons')

const scoresCol = (uid: string) => collection(db, 'users', uid, 'scores')

// ── Teams ─────────────────────────────────────────────────────────────────────

export async function saveTeam(
  uid: string | null | undefined,
  team: Omit<SavedTeam, 'id' | 'createdAt'>,
): Promise<string | null> {
  if (!uid) return null
  const ref = await addDoc(teamsCol(uid), {
    ...team,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function loadTeams(uid: string | null | undefined): Promise<SavedTeam[]> {
  if (!uid) return []
  const q = query(teamsCol(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      name: data.name as string,
      pokemonIds: data.pokemonIds as number[],
      pokemonNames: data.pokemonNames as string[],
      pokemonSprites: data.pokemonSprites as string[],
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    }
  })
}

export async function deleteTeam(uid: string | null | undefined, teamId: string): Promise<void> {
  if (!uid) return
  await deleteDoc(teamDoc(uid, teamId))
}

// ── Favourites ────────────────────────────────────────────────────────────────

/**
 * Saves a favourite using the pokemonId as the document ID so toggling is idempotent.
 */
export async function saveFavourite(
  uid: string | null | undefined,
  fav: Omit<SavedFavourite, 'id' | 'createdAt'>,
): Promise<void> {
  if (!uid) return
  await setDoc(favDoc(uid, String(fav.pokemonId)), {
    ...fav,
    createdAt: serverTimestamp(),
  })
}

export async function loadFavourites(uid: string | null | undefined): Promise<SavedFavourite[]> {
  if (!uid) return []
  const q = query(favsCol(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      pokemonId: data.pokemonId as number,
      pokemonName: data.pokemonName as string,
      sprite: data.sprite as string,
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    }
  })
}

export async function removeFavourite(
  uid: string | null | undefined,
  pokemonId: number,
): Promise<void> {
  if (!uid) return
  await deleteDoc(favDoc(uid, String(pokemonId)))
}

export async function isFavourite(
  uid: string | null | undefined,
  pokemonId: number,
): Promise<boolean> {
  if (!uid) return false
  const snap = await getDoc(favDoc(uid, String(pokemonId)))
  return snap.exists()
}

// ── Comparisons ───────────────────────────────────────────────────────────────

export async function saveComparison(
  uid: string | null | undefined,
  comparison: Omit<SavedComparison, 'id' | 'createdAt'>,
): Promise<string | null> {
  if (!uid) return null
  const ref = await addDoc(comparisonsCol(uid), {
    ...comparison,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function loadComparisons(uid: string | null | undefined): Promise<SavedComparison[]> {
  if (!uid) return []
  const q = query(comparisonsCol(uid), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      label: data.label as string,
      pokemonIds: data.pokemonIds as number[],
      pokemonNames: data.pokemonNames as string[],
      pokemonSprites: data.pokemonSprites as string[],
      createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
    }
  })
}

// ── Game Scores ───────────────────────────────────────────────────────────────

export async function saveGameScore(
  uid: string | null | undefined,
  entry: Omit<GameScore, 'id' | 'date'>,
): Promise<void> {
  if (!uid) return
  await addDoc(scoresCol(uid), {
    ...entry,
    date: serverTimestamp(),
  })
}

export async function loadGameScores(uid: string | null | undefined): Promise<GameScore[]> {
  if (!uid) return []
  const q = query(scoresCol(uid), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      game: data.game as GameScore['game'],
      score: data.score as number,
      date: (data.date as Timestamp)?.toDate() ?? new Date(),
    }
  })
}
