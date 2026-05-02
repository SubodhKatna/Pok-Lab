import { useEffect } from 'react'
import { useWTPGame } from './hooks/useWTPGame'
import { SilhouetteImage } from './components/SilhouetteImage'
import { GuessPanel } from './components/GuessPanel'
import type { PokemonSummary } from '@/shared/types/pokemon'

export function WTPPage() {
  const { state, isListLoading, startRound, submitGuess, nextRound } = useWTPGame()
  const { mysteryPokemon, guessesRemaining, status, sessionScore, roundCount } = state

  // Start the first round once the Pokémon list is loaded
  useEffect(() => {
    if (!isListLoading && mysteryPokemon === null) {
      void startRound()
    }
  }, [isListLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const isRevealed = status === 'won' || status === 'lost'
  const roundOver = isRevealed

  const handleGuess = (pokemon: PokemonSummary) => {
    submitGuess(pokemon)
  }

  const handleNext = () => {
    void nextRound()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#09090b_60%)] px-4 py-10">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-80 w-80 rounded-full bg-sky-600/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-2xl flex flex-col items-center gap-8">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Who's That Pokémon?
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Identify the Pokémon from its silhouette.
          </p>
        </div>

        {/* Session stats bar */}
        <div className="flex items-center gap-6 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md px-6 py-3">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-sky-300">{sessionScore}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Score</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold tabular-nums text-zinc-100">{roundCount}</span>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">Rounds</span>
          </div>
        </div>

        {/* Main game card */}
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-8 flex flex-col items-center gap-6">

          {/* Loading state */}
          {isListLoading || mysteryPokemon === null ? (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-56 w-56 rounded-2xl bg-zinc-800 animate-pulse" />
              <p className="text-sm text-zinc-500">Loading…</p>
            </div>
          ) : (
            <>
              {/* Silhouette / revealed image */}
              <SilhouetteImage
                src={mysteryPokemon.sprite}
                alt={mysteryPokemon.name}
                revealed={isRevealed}
              />

              {/* Result banner */}
              {isRevealed && (
                <ResultBanner
                  status={status as 'won' | 'lost'}
                  pokemonName={mysteryPokemon.name}
                />
              )}

              {/* Guess panel */}
              <GuessPanel
                guessesRemaining={guessesRemaining}
                onGuess={handleGuess}
                onNext={handleNext}
                roundOver={roundOver}
                disabled={isListLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Result Banner ─────────────────────────────────────────────────────────────

interface ResultBannerProps {
  status: 'won' | 'lost'
  pokemonName: string
}

function ResultBanner({ status, pokemonName }: ResultBannerProps) {
  const isWon = status === 'won'

  return (
    <div
      className={[
        'w-full rounded-xl border px-4 py-3 text-center',
        isWon
          ? 'border-green-400/20 bg-green-400/10'
          : 'border-red-400/20 bg-red-400/10',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {isWon ? (
        <p className="text-base font-semibold text-green-300">
          🎉 Correct! It's{' '}
          <span className="capitalize font-bold text-green-200">{pokemonName}</span>!
        </p>
      ) : (
        <p className="text-base font-semibold text-red-300">
          😔 It was{' '}
          <span className="capitalize font-bold text-red-200">{pokemonName}</span>. Better luck next time!
        </p>
      )}
    </div>
  )
}
