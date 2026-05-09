import { useState, useEffect } from 'react'
import { useWordleGame } from './hooks/useWordleGame'
import { ModeSelector } from './components/ModeSelector'
import { GuessInput } from './components/GuessInput'
import { FeedbackRow } from './components/FeedbackRow'
import { SessionStats } from './components/SessionStats'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { WordleMode } from '@/shared/types/game-state'
import type { PokemonDetail } from '@/shared/types/pokemon'
import { useGameScore } from '@/features/auth/useGameScore'

const ALL_GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function WordlePage() {
  const { state, startGame, submitGuess, resetGame, useHint1, useHint2, giveUp } = useWordleGame()
  const [pendingMode, setPendingMode] = useState<WordleMode>('attributes')
  const [genFilter, setGenFilter] = useState<number>(0)
  const { recordScore } = useGameScore()

  const { status, guesses, sessionStats, mysteryPokemon, hint1Used, hint2Used } = state

  // Save score when game ends
  useEffect(() => {
    if (status === 'won') {
      // Score = max guesses (10) minus guesses used — higher is better
      void recordScore('wordle', Math.max(10 - guesses.length, 1))
    } else if (status === 'lost') {
      void recordScore('wordle', 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, guesses.length])

  const handleStart = () => {
    const filter = genFilter === 0 ? [] : [genFilter]
    void startGame(pendingMode, filter)
  }

  const handleGuess = (pokemon: PokemonDetail) => {
    submitGuess(pokemon)
  }

  const isGameOver = status === 'won' || status === 'lost'
  const isPlaying = status === 'playing'
  const isIdle = status === 'idle'

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_#0f172a_0%,_#09090b_60%)] px-4 py-10">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-sky-600/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 h-80 w-80 rounded-full bg-violet-600/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-4xl flex flex-col gap-8">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-br from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            Pokémon Wordle
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Guess the mystery Pokémon by its{' '}
            {state.mode === 'stats' ? 'base stats' : 'attributes'}.
          </p>
        </div>

        {/* Idle: mode selector + gen filter + start */}
        {isIdle && (
          <div className="flex flex-col items-center gap-6">
            <ModeSelector value={pendingMode} onChange={setPendingMode} disabled={false} />

            {/* Generation filter */}
            <div className="flex flex-col items-center gap-2">
              <label className="text-xs font-medium uppercase tracking-widest text-zinc-500">
                Generation Filter
              </label>
              <Select
                value={String(genFilter)}
                onValueChange={(v) => setGenFilter(Number(v))}
              >
                <SelectTrigger className="w-52 border-white/10 bg-white/5 backdrop-blur-md text-zinc-100 hover:bg-white/10 hover:border-white/20 transition-all">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Generations</SelectItem>
                  {ALL_GENS.map((g) => (
                    <SelectItem key={g} value={String(g)}>
                      Generation {g}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="rounded-xl bg-sky-500/20 border border-sky-400/30 backdrop-blur-md px-10 py-3 text-sm font-semibold text-sky-200 hover:bg-sky-500/30 hover:border-sky-400/50 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Hints + guess input */}
        {isPlaying && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex flex-col items-center gap-3 w-full max-w-lg">
              <div className="flex flex-wrap justify-center gap-2">
                {!hint1Used && (
                  <button
                    type="button"
                    onClick={useHint1}
                    className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-all"
                  >
                    Hint 1 — Show attribute values
                  </button>
                )}
                {!hint2Used && (
                  <button
                    type="button"
                    onClick={useHint2}
                    className="rounded-lg border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/10 transition-all"
                  >
                    Hint 2 — Pokédex fact
                  </button>
                )}
                <button
                  type="button"
                  onClick={giveUp}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-all"
                >
                  Give Up
                </button>
              </div>

              {/* Hint 1 content */}
              {hint1Used && mysteryPokemon && (
                <HintPanel1 pokemon={mysteryPokemon} />
              )}

              {/* Hint 2 content */}
              {hint2Used && mysteryPokemon?.description && (
                <div className="w-full rounded-lg border border-yellow-800/50 bg-yellow-950/30 px-4 py-3 text-sm text-yellow-200">
                  <span className="mr-2 text-yellow-500 font-semibold">Hint 2:</span>
                  {mysteryPokemon.description}
                </div>
              )}
              {hint2Used && mysteryPokemon && !mysteryPokemon.description && (
                <div className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400">
                  No Pokédex entry available for this Pokémon.
                </div>
              )}
            </div>

            {/* Guess input */}
            <GuessInput onSubmit={handleGuess} disabled={false} />
          </div>
        )}

        {/* Win / loss banner — animated slide-in */}
        {isGameOver && mysteryPokemon != null && (
          <WinLossBanner
            status={status as 'won' | 'lost'}
            pokemon={mysteryPokemon}
            guessCount={guesses.length}
            onPlayAgain={resetGame}
          />
        )}

        {/* Feedback rows — most recent first */}
        {guesses.length > 0 && (
          <div className="flex flex-col gap-2">
            {[...guesses].reverse().map((row, i) => (
              <FeedbackRow key={guesses.length - 1 - i} row={row} rowIndex={i} />
            ))}
          </div>
        )}

        {/* Session stats */}
        <SessionStats stats={sessionStats} />
      </div>
    </div>
  )
}

// ── Win / Loss Banner ─────────────────────────────────────────────────────────

interface WinLossBannerProps {
  status: 'won' | 'lost'
  pokemon: PokemonDetail
  guessCount: number
  onPlayAgain: () => void
}

function WinLossBanner({ status, pokemon, guessCount, onPlayAgain }: WinLossBannerProps) {
  const isWon = status === 'won'

  return (
    <div
      className={[
        'wordle-banner-animate scale-100 rounded-2xl border backdrop-blur-xl px-6 py-6 text-center shadow-2xl',
        isWon
          ? 'border-green-400/20 bg-green-400/10 shadow-green-900/30'
          : 'border-red-400/20 bg-red-400/10 shadow-red-900/30',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      {/* Pokémon reveal */}
      <div className="flex flex-col items-center gap-2 mb-3">
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="h-28 w-28 object-contain drop-shadow-lg"
        />
        <p className="text-lg font-bold capitalize text-zinc-100">{pokemon.name}</p>
      </div>

      {/* Result message */}
      {isWon ? (
        <div className="mb-4">
          <p className="text-4xl mb-1">🎉</p>
          <p className="text-2xl font-extrabold text-green-400">You got it!</p>
          <p className="mt-1 text-sm text-zinc-400">
            Solved in{' '}
            <span className="font-semibold font-mono tabular-nums text-zinc-200">
              {guessCount} {guessCount === 1 ? 'guess' : 'guesses'}
            </span>
          </p>
        </div>
      ) : (
        <div className="mb-4">
          <p className="text-4xl mb-1">😔</p>
          <p className="text-2xl font-extrabold text-red-400">Better luck next time!</p>
          <p className="mt-1 text-sm text-zinc-400">The mystery Pokémon was revealed above.</p>
        </div>
      )}

      <button
        type="button"
        onClick={onPlayAgain}
        className={[
          'rounded-xl border backdrop-blur-md px-8 py-2.5 text-sm font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2',
          isWon
            ? 'border-green-400/30 bg-green-400/15 text-green-200 hover:bg-green-400/25 focus:ring-green-500/40'
            : 'border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10 focus:ring-zinc-500/40',
        ].join(' ')}
      >
        Play Again
      </button>
    </div>
  )
}

// ── Hint 1: show mystery Pokémon attribute values ─────────────────────────────

function HintPanel1({ pokemon }: { pokemon: PokemonDetail }) {
  const attrs = [
    { label: 'Type 1', value: pokemon.types[0] ?? '—' },
    { label: 'Type 2', value: pokemon.types[1] ?? '—' },
    { label: 'Gen', value: pokemon.generation || '?' },
    { label: 'Color', value: pokemon.color || '?' },
    { label: 'Egg Grp', value: pokemon.eggGroups[0] ?? '—' },
    { label: 'Evo Stage', value: `Stage ${pokemon.evolutionStage || 1}` },
  ]

  return (
    <div className="w-full rounded-xl border border-sky-400/20 bg-sky-400/5 backdrop-blur-md px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
        Hint 1 — Attribute values
      </p>
      <div className="flex flex-wrap gap-2">
        {attrs.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm px-3 py-1.5 min-w-[3.5rem]"
          >
            <span className="text-[9px] font-medium uppercase tracking-wide text-zinc-500 leading-none mb-1">
              {label}
            </span>
            <span className="text-xs font-semibold capitalize text-zinc-100 leading-none">
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
