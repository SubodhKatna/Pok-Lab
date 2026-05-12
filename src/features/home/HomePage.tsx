import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { GAME_REGISTRY } from '@/registry/game-registry'
import { useAuthContext } from '@/features/auth/AuthContext'
import { loadGameScores, type GameScore } from '@/lib/firestore'

const GAME_LABELS: Record<GameScore['game'], string> = {
  'wordle': 'Pokémon Wordle',
  'whos-that-pokemon': "Who's That Pokémon?",
  'partial-image': 'Partial Image',
}

export function HomePage() {
  const { user } = useAuthContext()
  const [scores, setScores] = useState<GameScore[]>([])

  useEffect(() => {
    if (!user) return
    void loadGameScores(user.uid).then(setScores)
  }, [user])

  const personalBests = useMemo(() => {
    return (['wordle', 'whos-that-pokemon', 'partial-image'] as GameScore['game'][]).map((game) => {
      const gameScores = scores.filter((s) => s.game === game)
      const best = gameScores.length > 0 ? Math.max(...gameScores.map((s) => s.score)) : null
      return { game, best, count: gameScores.length }
    })
  }, [scores])

  const quickLinks = useMemo(() => {
    // Only show modules that are intended for signed-in users on this page.
    return GAME_REGISTRY.filter((m) => m.requiresAuth)
  }, [])

  return (
    <div className="min-h-[calc(100vh-56px)] bg-zinc-950 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-zinc-100">
            Welcome{user?.displayName ? `, ${user.displayName}` : ''}.
          </h1>
          <p className="text-sm text-zinc-500">
            Jump back into games, or review your progress.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {personalBests.map(({ game, best, count }) => (
            <div key={game} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                {GAME_LABELS[game]}
              </p>
              <p className="mt-2 text-3xl font-black text-zinc-100 tabular-nums">
                {best !== null ? best : '—'}
              </p>
              <p className="mt-1 text-xs text-zinc-600">
                {count} {count === 1 ? 'game' : 'games'} played
              </p>
            </div>
          ))}
          <Link
            to="/profile"
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
              Profile
            </p>
            <p className="mt-2 text-sm font-semibold text-zinc-100">View your saved data</p>
            <p className="mt-1 text-xs text-zinc-600">Teams, favourites, comparisons, scores</p>
          </Link>
        </div>

        <div className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Quick start</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quickLinks.map((mod) => {
              const Icon = mod.icon
              return (
                <Link
                  key={mod.id}
                  to={mod.path}
                  className="group relative flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 transition-colors duration-200 group-hover:border-red-500/50 group-hover:bg-red-500/10">
                    <Icon size={22} className="text-zinc-300 transition-colors duration-200 group-hover:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors duration-200">
                      {mod.name}
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors duration-200">
                      {mod.description}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className="absolute bottom-5 right-5 text-zinc-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-zinc-400"
                  >
                    →
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

