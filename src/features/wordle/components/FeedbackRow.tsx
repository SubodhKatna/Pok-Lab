import type {
  FeedbackRow as FeedbackRowType,
  StatsFeedbackRow,
  AttributesFeedbackRow,
  StatFeedback,
  AttributeFeedback,
} from '@/shared/types/game-state'

// ── Stats mode helpers ────────────────────────────────────────────────────────

const STAT_LABELS: Record<keyof Omit<StatsFeedbackRow, 'mode' | 'guessedPokemon'>, string> = {
  hp: 'HP',
  attack: 'Atk',
  defense: 'Def',
  spAtk: 'SpA',
  spDef: 'SpD',
  speed: 'Spe',
}

function StatCell({ label, feedback }: { label: string; feedback: StatFeedback }) {
  const icon = feedback === 'higher' ? '↑' : feedback === 'lower' ? '↓' : '✓'
  const color =
    feedback === 'higher'
      ? 'text-red-400'
      : feedback === 'lower'
        ? 'text-blue-400'
        : 'text-green-400'

  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[3rem]">
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      <span className={`text-lg font-bold leading-none ${color}`} aria-label={feedback}>
        {icon}
      </span>
    </div>
  )
}

// ── Attributes mode helpers ───────────────────────────────────────────────────

type AttrKey = keyof Omit<AttributesFeedbackRow, 'mode' | 'guessedPokemon' | 'guessedValues'>

const ATTR_LABELS: Record<AttrKey, string> = {
  type1: 'Type 1',
  type2: 'Type 2',
  generation: 'Gen',
  color: 'Color',
  eggGroup: 'Egg Grp',
  evolutionStage: 'Evo',
}

function AttrCell({
  label,
  feedback,
  value,
}: {
  label: string
  feedback: AttributeFeedback
  value: string | number | null
}) {
  const bg =
    feedback === 'correct'
      ? 'bg-green-700 border-green-600 text-green-100'
      : feedback === 'partial'
        ? 'bg-yellow-600 border-yellow-500 text-yellow-100'
        : 'bg-zinc-800 border-zinc-700 text-zinc-400'

  const displayValue =
    value === null || value === ''
      ? '—'
      : label === 'Evo'
        ? `Stage ${value}`
        : typeof value === 'number'
          ? String(value)
          : value

  return (
    <div
      className={`flex flex-col items-center justify-center rounded border px-2 py-1.5 min-w-[3.5rem] ${bg}`}
      aria-label={`${label}: ${feedback}`}
    >
      <span className="text-[9px] font-medium uppercase tracking-wide opacity-70 leading-none mb-1">
        {label}
      </span>
      <span className="text-[11px] font-semibold capitalize leading-none truncate max-w-[5rem]">
        {displayValue}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface FeedbackRowProps {
  row: FeedbackRowType
}

/**
 * Renders a single guess feedback row.
 * Stats mode: higher/lower/correct arrows per stat.
 * Attributes mode: correct/partial/incorrect colored cells with actual values.
 */
export function FeedbackRow({ row }: FeedbackRowProps) {
  const { guessedPokemon } = row

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2">
      {/* Sprite + name */}
      <div className="flex items-center gap-2 w-32 shrink-0">
        <img
          src={guessedPokemon.sprite}
          alt={guessedPokemon.name}
          className="h-10 w-10 object-contain"
          loading="lazy"
        />
        <span className="text-sm font-medium capitalize text-zinc-100 truncate">
          {guessedPokemon.name}
        </span>
      </div>

      {/* Feedback cells */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        {row.mode === 'stats' ? (
          <>
            {(
              Object.entries(STAT_LABELS) as [
                keyof Omit<StatsFeedbackRow, 'mode' | 'guessedPokemon'>,
                string,
              ][]
            ).map(([key, label]) => (
              <StatCell key={key} label={label} feedback={row[key]} />
            ))}
          </>
        ) : (
          <>
            {(Object.keys(ATTR_LABELS) as AttrKey[]).map((key) => {
              const rawValue = row.guessedValues[key as keyof typeof row.guessedValues]
              return (
                <AttrCell
                  key={key}
                  label={ATTR_LABELS[key]}
                  feedback={row[key]}
                  value={rawValue ?? null}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
