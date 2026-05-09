import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
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
    if (!user) {
      void Promise.resolve().then(() => setScores([]))
      return
    }
    void loadGameScores(user.uid).then(setScores)
  }, [user])

  // Compute personal bests per game
  const personalBests = (['wordle', 'whos-that-pokemon', 'partial-image'] as GameScore['game'][]).map((game) => {
    const gameScores = scores.filter((s) => s.game === game)
    const best = gameScores.length > 0 ? Math.max(...gameScores.map((s) => s.score)) : null
    return { game, best, count: gameScores.length }
  })
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28 text-center">
        {/* Subtle radial glow behind the title */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[480px] w-[480px] rounded-full bg-red-600/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-2xl">
          <span className="mb-4 inline-block rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs font-medium tracking-widest text-zinc-400 uppercase">
            PokéLab
          </span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
            Your Pokémon{' '}
            <span className="text-red-500">Game Hub</span>
          </h1>
          <p className="mt-5 text-base text-zinc-400 sm:text-lg leading-relaxed">
            Play Pokémon-themed games, explore the Pokédex, and build your perfect team — all in one place.
          </p>
        </div>
      </section>

      {/* Game cards */}
      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
          Choose a module
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAME_REGISTRY.map((mod) => {
            const Icon = mod.icon
            return (
              <Link
                key={mod.id}
                to={mod.path}
                className="group relative flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-6
                           transition-all duration-200
                           hover:-translate-y-1 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/40"
              >
                {/* Icon container */}
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

                {/* Arrow hint */}
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
      </section>

      {/* My Scores — only shown when signed in */}
      {user && (
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            My Scores
          </h2>
          {scores.length === 0 ? (
            <p className="text-sm text-zinc-600">Play some games to see your personal bests here.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {personalBests.map(({ game, best, count }) => (
                <div
                  key={game}
                  className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 flex flex-col gap-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">
                    {GAME_LABELS[game]}
                  </p>
                  <p className="text-3xl font-black text-zinc-100 tabular-nums">
                    {best !== null ? best : '—'}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {count} {count === 1 ? 'game' : 'games'} played
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  )
}
