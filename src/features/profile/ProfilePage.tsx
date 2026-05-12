import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiStar, FiCopy, FiLayers, FiExternalLink } from 'react-icons/fi'
import { useAuthContext } from '@/features/auth/AuthContext'
import {
  loadTeams,
  loadFavourites,
  loadComparisons,
  loadGameScores,
  type SavedTeam,
  type SavedFavourite,
  type SavedComparison,
  type GameScore,
} from '@/lib/firestore'

export function ProfilePage() {
  const { user } = useAuthContext()
  const [teams, setTeams] = useState<SavedTeam[]>([])
  const [favourites, setFavourites] = useState<SavedFavourite[]>([])
  const [comparisons, setComparisons] = useState<SavedComparison[]>([])
  const [scores, setScores] = useState<GameScore[]>([])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    loadTeams(user.uid).then((v) => { if (!cancelled) setTeams(v) }).catch(() => { /* ignore */ })
    loadFavourites(user.uid).then((v) => { if (!cancelled) setFavourites(v) }).catch(() => { /* ignore */ })
    loadComparisons(user.uid).then((v) => { if (!cancelled) setComparisons(v) }).catch(() => { /* ignore */ })
    loadGameScores(user.uid).then((v) => { if (!cancelled) setScores(v) }).catch(() => { /* ignore */ })

    return () => { cancelled = true }
  }, [user])

  const identity = useMemo(() => {
    if (!user) return { title: 'Profile', subtitle: '' }
    return {
      title: user.displayName ?? 'Profile',
      subtitle: user.email ?? user.uid,
    }
  }, [user])

  const stats = useMemo(() => {
    return [
      { label: 'Teams', value: teams.length, icon: FiLayers },
      { label: 'Favourites', value: favourites.length, icon: FiStar },
      { label: 'Comparisons', value: comparisons.length, icon: FiCopy },
      { label: 'Scores', value: scores.length, icon: FiUser },
    ]
  }, [teams.length, favourites.length, comparisons.length, scores.length])

  return (
    <div className="min-h-[calc(100vh-56px)] bg-zinc-950 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
              <FiUser size={18} className="text-zinc-200" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-zinc-100 truncate">{identity.title}</h1>
              <p className="text-sm text-zinc-500 truncate">{identity.subtitle}</p>
            </div>
          </div>
          <Link
            to="/home"
            className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors shrink-0"
          >
            Back to Home
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2 text-zinc-500">
                <s.icon size={14} />
                <p className="text-xs font-semibold uppercase tracking-widest">{s.label}</p>
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-100 tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-100">Saved Teams</h2>
            <p className="mt-1 text-xs text-zinc-500">Latest saved team names.</p>
            {teams.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600">No saved teams yet.</p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {teams.slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                    <p className="text-sm text-zinc-200 truncate">{t.name}</p>
                    <span className="text-xs text-zinc-500 shrink-0 tabular-nums">{t.pokemonIds.length}/6</span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Link to="/team-builder" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
                Open Team Builder <FiExternalLink size={14} className="opacity-70" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h2 className="text-sm font-semibold text-zinc-100">Pokédex Saves</h2>
            <p className="mt-1 text-xs text-zinc-500">Favourites and comparisons.</p>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Favourites</p>
                <p className="mt-2 text-2xl font-black text-zinc-100 tabular-nums">{favourites.length}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Comparisons</p>
                <p className="mt-2 text-2xl font-black text-zinc-100 tabular-nums">{comparisons.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/pokedex" className="inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-zinc-100 transition-colors">
                Open Pokédex <FiExternalLink size={14} className="opacity-70" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
