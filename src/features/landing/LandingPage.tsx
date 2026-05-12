import { NavLink } from 'react-router-dom'
import { FiActivity, FiDatabase, FiLock, FiZap, FiUsers } from 'react-icons/fi'
import { useAuthContext } from '@/features/auth/AuthContext'

export function LandingPage() {
  const { loading, signIn } = useAuthContext()

  return (
    <div className="min-h-screen bg-zinc-950">
      <section
        className="relative overflow-hidden"
        style={{
          backgroundImage: 'url(/landing-hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-zinc-950/75" aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950/35 via-zinc-950/70 to-zinc-950" aria-hidden />

        <div className="relative px-6 pt-20 pb-14 sm:pt-28 sm:pb-20">
          <div className="mx-auto max-w-5xl">
            <span className="inline-flex items-center rounded-full border border-zinc-700 bg-zinc-950/50 px-3 py-1 text-xs font-medium tracking-widest text-zinc-300 uppercase">
              PokéLab
            </span>
            <h1 className="mt-4 max-w-2xl text-4xl font-extrabold tracking-tight text-zinc-100 sm:text-5xl lg:text-6xl">
              A calmer way to play, track, and build.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-zinc-300 sm:text-lg leading-relaxed">
              PokéLab brings mini-games, a Pokédex workspace, and team building into one account-backed hub.
              Your progress stays with you across devices.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                disabled={loading}
                onClick={() => void signIn()}
                className="rounded-md border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                Get started
              </button>
              <NavLink
                to="/pokedex"
                className="rounded-md border border-zinc-700 bg-zinc-950/20 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-950/35 transition-colors"
              >
                Explore Pokédex
              </NavLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: FiZap, title: 'Games that save', desc: 'Scores and streaks are tied to your account.' },
            { icon: FiDatabase, title: 'Personal workspace', desc: 'Favourites, comparisons, and teams stay organized.' },
            { icon: FiActivity, title: 'Fast flows', desc: 'Designed for repeat play and quick iteration.' },
            { icon: FiLock, title: 'Protected modules', desc: 'Games and team building are available after sign-in.' },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center gap-2 text-zinc-400">
                <f.icon size={16} />
                <p className="text-sm font-semibold text-zinc-100">{f.title}</p>
              </div>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-zinc-950">
        <div className="mx-auto max-w-5xl px-6 py-14">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Built for people who actually play</h2>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                PokéLab keeps the interface quiet and the loops tight: fewer clicks, clearer state, and fast navigation
                between discovery (Pokédex) and action (games, teams).
              </p>
              <div className="mt-5 flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900">
                  <FiUsers size={16} className="text-zinc-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">About us</p>
                  <p className="mt-1 text-sm text-zinc-500 leading-relaxed">
                    We’re building a single place for Pokemon fans to track progress and iterate on teams, without
                    bouncing between tabs or losing context.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
              <div className="aspect-[16/10] bg-zinc-950">
                <img
                  src="/landing-hero.png"
                  alt=""
                  className="h-full w-full object-cover opacity-90"
                  loading="lazy"
                />
              </div>
              <div className="px-5 py-4 border-t border-zinc-800">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Preview</p>
                <p className="mt-1 text-sm text-zinc-400">A focused dashboard with protected game modules.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-14">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-zinc-100">Ready to start?</p>
            <p className="mt-1 text-sm text-zinc-500">Sign in to unlock games, team building, and your saved data.</p>
          </div>
          <button
            disabled={loading}
            onClick={() => void signIn()}
            className="rounded-md border border-red-500/30 bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            Sign in
          </button>
        </div>
      </section>
    </div>
  )
}
