import { useState } from 'react'
import { useWordleGame } from './hooks/useWordleGame'
import { ModeSelector } from './components/ModeSelector'
import { GuessInput } from './components/GuessInput'
import { FeedbackRow } from './components/FeedbackRow'
import { SessionStats } from './components/SessionStats'
import type { WordleMode } from '@/shared/types/game-state'
import type { PokemonDetail } from '@/shared/types/pokemon'

const ALL_GENS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function WordlePage() {
  const { state, startGame, submitGuess, resetGame, useHint1, useHint2, giveUp } = useWordleGame()
  const [pendingMode, setPendingMode] = useState<WordleMode>('attributes')
  const [genFilter, setGenFilter] = useState<number>(0)

  const { status, guesses, sessionStats, mysteryPokemon, hint1Used, hint2Used } = state

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
    <div className="min-h-screen bg-zinc-950 px-4 py-8">
      <div className="mx-auto max-w-3xl flex flex-col gap-6">

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Pokémon Wordle</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Guess the mystery Pokémon by its{' '}
            {state.mode === 'stats' ? 'base stats' : 'attributes'}.
          </p>
        </div>

        {/* Idle: mode selector + gen filter + start */}
        {isIdle && (
          <div className="flex flex-col items-center gap-4">
            <ModeSelector value={pendingMode} onChange={setPendingMode} disabled={false} />
            <div className="flex items-center gap-3">
              <label
                htmlFor="gen-filter"
                className="text-xs font-medium uppercase tracking-widest text-zinc-500"
              >
                Generation
              </label>
              <select
                id="gen-filter"
                value={genFilter}
                onChange={(e) => setGenFilter(Number(e.target.value))}
                className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-sky-600"
              >
                <option value={0}>All</option>
                {ALL_GENS.map((g) => (
                  <option key={g} value={g}>Gen {g}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleStart}
              className="rounded-lg bg-sky-600 px-6 py-2 text-sm font-semibold text-white hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Hints + guess input */}
        {isPlaying && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
              <div className="flex gap-2">
                {!hint1Used && (
                  <button
                    type="button"
                    onClick={useHint1}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Hint 1 — Show attribute values
                  </button>
                )}
                {!hint2Used && (
                  <button
                    type="button"
                    onClick={useHint2}
                    className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Hint 2 — Pokédex fact
                  </button>
                )}
                <button
                  type="button"
                  onClick={giveUp}
                  className="rounded-md border border-red-900 bg-red-950/40 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-900/40 transition-colors"
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

        {/* Win / loss banner */}
        {isGameOver && mysteryPokemon && (
          <div
            className={[
              'rounded-lg border px-4 py-4 text-center',
              status === 'won'
                ? 'border-green-700 bg-green-950/50 text-green-300'
                : 'border-red-800 bg-red-950/50 text-red-300',
            ].join(' ')}
          >
            <div className="flex flex-col items-center gap-2">
              <img
                src={mysteryPokemon.sprite}
                alt={mysteryPokemon.name}
                className="h-20 w-20 object-contain"
              />
              <p className="text-base font-semibold capitalize text-zinc-100">{mysteryPokemon.name}</p>
            </div>
            {status === 'won' ? (
              <p className="mt-1 text-lg font-bold">You got it! 🎉 ({guesses.length} guess{guesses.length !== 1 ? 'es' : ''})</p>
            ) : (
              <p className="mt-1 text-lg font-bold">Better luck next time!</p>
            )}
            <button
              type="button"
              onClick={resetGame}
              className="mt-3 rounded-lg border border-zinc-700 bg-zinc-800 px-5 py-1.5 text-sm font-medium text-zinc-100 hover:bg-zinc-700 transition-colors"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Feedback rows — most recent first */}
        {guesses.length > 0 && (
          <div className="flex flex-col gap-2">
            {[...guesses].reverse().map((row, i) => (
              <FeedbackRow key={guesses.length - 1 - i} row={row} />
            ))}
          </div>
        )}

        {/* Session stats */}
        <SessionStats stats={sessionStats} />
      </div>
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
    <div className="w-full rounded-lg border border-sky-800/50 bg-sky-950/30 px-4 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-sky-400">
        Hint 1 — Attribute values
      </p>
      <div className="flex flex-wrap gap-2">
        {attrs.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col items-center rounded border border-zinc-700 bg-zinc-800 px-3 py-1.5 min-w-[3.5rem]"
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
