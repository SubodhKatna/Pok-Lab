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

function StatCell({
  label,
  feedback,
  index,
}: {
  label: string
  feedback: StatFeedback
  index: number
}) {
  const icon = feedback === 'higher' ? '↑' : feedback === 'lower' ? '↓' : '✓'

  const colorClasses =
    feedback === 'correct'
      ? 'bg-green-400/20 border-green-400/40 text-green-100 shadow-[0_0_12px_rgba(74,222,128,0.2)]'
      : feedback === 'higher'
        ? 'bg-red-400/20 border-red-400/40 text-red-200 shadow-[0_0_12px_rgba(248,113,113,0.2)]'
        : 'bg-blue-400/20 border-blue-400/40 text-blue-200 shadow-[0_0_12px_rgba(96,165,250,0.2)]'

  return (
    <div
      className={`wordle-cell-animate flex flex-col items-center justify-center rounded-xl border backdrop-blur-md px-3 py-3 w-16 transition-all duration-200 hover:scale-105 ${colorClasses}`}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`${label}: ${feedback}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75 leading-none mb-2">
        {label}
      </span>
      <span className="text-xl font-bold leading-none" aria-hidden="true">
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
  index,
}: {
  label: string
  feedback: AttributeFeedback
  value: string | number | null
  index: number
}) {
  const bg =
    feedback === 'correct'
      ? 'bg-green-400/20 border-green-400/40 text-green-100 shadow-[0_0_12px_rgba(74,222,128,0.2)]'
      : feedback === 'partial'
        ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-100 shadow-[0_0_12px_rgba(250,204,21,0.2)]'
        : 'bg-white/5 border-white/10 text-zinc-400'

  const icon =
    feedback === 'correct' ? '✓' : feedback === 'partial' ? '◑' : '✗'

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
      className={`wordle-cell-animate flex flex-col items-center justify-center rounded-xl border backdrop-blur-md px-3 py-3 w-20 transition-all duration-200 hover:scale-105 ${bg}`}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`${label}: ${feedback}`}
    >
      <span className="text-[10px] font-semibold uppercase tracking-wider opacity-75 leading-none mb-1.5">
        {label}
      </span>
      <span className="text-sm font-bold capitalize leading-none truncate max-w-[4.5rem] mb-1.5">
        {displayValue}
      </span>
      <span className="text-sm leading-none opacity-90 font-semibold" aria-hidden="true">
        {icon}
      </span>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface FeedbackRowProps {
  row: FeedbackRowType
  /** Row index used to stagger the row slide-in (0 = newest). */
  rowIndex?: number
}

/**
 * Renders a single guess feedback row.
 * Stats mode: higher/lower/correct arrows per stat, with colored backgrounds.
 * Attributes mode: correct/partial/incorrect colored cells with actual values.
 * Each cell animates in with a staggered delay.
 */
export function FeedbackRow({ row, rowIndex = 0 }: FeedbackRowProps) {
  const { guessedPokemon } = row

  return (
    <div
      className="wordle-row-animate flex items-center gap-4 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md px-4 py-3 transition-all hover:border-white/15 hover:bg-white/8"
      style={{ animationDelay: `${rowIndex * 30}ms` }}
    >
      {/* Sprite + name */}
      <div className="flex items-center gap-3 w-36 shrink-0">
        <img
          src={guessedPokemon.sprite}
          alt={guessedPokemon.name}
          className="h-12 w-12 object-contain drop-shadow-md"
          loading="lazy"
        />
        <span className="text-sm font-semibold capitalize text-zinc-100 truncate">
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
            ).map(([key, label], i) => (
              <StatCell key={key} label={label} feedback={row[key]} index={i} />
            ))}
          </>
        ) : (
          <>
            {(Object.keys(ATTR_LABELS) as AttrKey[]).map((key, i) => {
              const rawValue = row.guessedValues[key as keyof typeof row.guessedValues]
              return (
                <AttrCell
                  key={key}
                  label={ATTR_LABELS[key]}
                  feedback={row[key]}
                  value={rawValue ?? null}
                  index={i}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}
