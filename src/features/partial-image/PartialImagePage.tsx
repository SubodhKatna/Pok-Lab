import { useEffect } from 'react'
import { usePartialImageGame } from './hooks/usePartialImageGame'
import { CroppedImage } from './components/CroppedImage'
import { GuessPanel } from './components/GuessPanel'
import type { PokemonSummary } from '@/shared/types/pokemon'

export function PartialImagePage() {
  const { state, isListLoading, startRound, submitGuess, nextRound } = usePartialImageGame()
  const { mysteryPokemon, revealStep, status, sessionScore, roundCount } = state

  useEffect(() => {
    if (!isListLoading && mysteryPokemon === null) {
      void startRound()
    }
  }, [isListLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  const isRevealed = status === 'won' || status === 'lost'

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-12 overflow-y-auto">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-violet-700/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-sky-600/8 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-xl flex flex-col items-center gap-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-white">
            Partial Image
          </h1>
          <p className="text-sm text-zinc-500">Identify the Pokémon from a cropped image</p>
        </div>

        {/* Stats bar */}
        <div className="flex items-stretch rounded-2xl overflow-hidden border border-white/8 bg-white/4 backdrop-blur-md divide-x divide-white/8">
          <StatCell label="Score" value={sessionScore} accent="text-yellow-400" glow="rgba(250,204,21,0.4)" />
          <StatCell label="Round" value={roundCount} accent="text-zinc-100" />
          <StatCell
            label="Correct"
            value={`${sessionScore}/${Math.max(roundCount - 1, 0)}`}
            accent="text-emerald-400"
          />
        </div>

        {/* Game card */}
        <div className="w-full rounded-3xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm overflow-visible">
          {/* Card inner glow top edge */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-3xl" />

          <div className="px-8 pt-6 pb-10 flex flex-col items-center gap-6">
            {isListLoading || mysteryPokemon === null ? (
              <LoadingSkeleton />
            ) : (
              <>
                <CroppedImage
                  src={mysteryPokemon.sprite}
                  alt={mysteryPokemon.name}
                  revealStep={revealStep}
                  revealed={isRevealed}
                />

                {isRevealed && (
                  <ResultBanner
                    status={status as 'won' | 'lost'}
                    pokemonName={mysteryPokemon.name}
                  />
                )}

                <GuessPanel
                  revealStep={revealStep}
                  onGuess={(p: PokemonSummary) => submitGuess(p)}
                  onNext={() => void nextRound()}
                  roundOver={isRevealed}
                  disabled={isListLoading}
                />
              </>
            )}
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        </div>
      </div>
    </div>
  )
}

// ── Stat Cell ─────────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  accent = 'text-zinc-100',
  glow,
}: {
  label: string
  value: string | number
  accent?: string
  glow?: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 px-10 py-5">
      <span
        className={['text-4xl font-black tabular-nums leading-none', accent].join(' ')}
        style={glow ? { textShadow: `0 0 20px ${glow}` } : undefined}
      >
        {value}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mt-0.5">
        {label}
      </span>
    </div>
  )
}

// ── Result Banner ─────────────────────────────────────────────────────────────

function ResultBanner({
  status,
  pokemonName,
}: {
  status: 'won' | 'lost'
  pokemonName: string
}) {
  const isWon = status === 'won'

  return (
    <div
      className={[
        'w-full rounded-2xl border px-6 py-5 text-center',
        'animate-in fade-in slide-in-from-bottom-3 duration-500',
        isWon
          ? 'border-emerald-500/25 bg-gradient-to-b from-emerald-500/15 to-emerald-500/5'
          : 'border-red-500/25 bg-gradient-to-b from-red-500/15 to-red-500/5',
      ].join(' ')}
      style={{
        boxShadow: isWon
          ? '0 0 32px rgba(52,211,153,0.12), inset 0 1px 0 rgba(52,211,153,0.15)'
          : '0 0 32px rgba(248,113,113,0.12), inset 0 1px 0 rgba(248,113,113,0.15)',
      }}
      role="status"
      aria-live="polite"
    >
      {isWon ? (
        <>
          <p className="text-2xl font-black text-emerald-300">🎉 Correct!</p>
          <p className="mt-1 text-sm text-emerald-400/70">
            It's{' '}
            <span className="capitalize font-bold text-emerald-200">{pokemonName}</span>!
          </p>
        </>
      ) : (
        <>
          <p className="text-2xl font-black text-red-300">😔 Not quite!</p>
          <p className="mt-1 text-sm text-red-400/70">
            It was{' '}
            <span className="capitalize font-bold text-red-200">{pokemonName}</span>
          </p>
        </>
      )}
    </div>
  )
}

// ── Loading Skeleton ──────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <div className="h-64 w-64 rounded-full bg-zinc-800/60 animate-pulse" />
      <div className="h-4 w-32 rounded-full bg-zinc-800 animate-pulse" />
      <div className="h-12 w-72 rounded-2xl bg-zinc-800/60 animate-pulse" />
    </div>
  )
}
