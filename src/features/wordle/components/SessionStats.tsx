import type { WordleSessionStats } from '@/shared/types/game-state'

interface SessionStatsProps {
  stats: WordleSessionStats
}

interface StatTileProps {
  label: string
  value: string | number
}

function StatTile({ label, value }: StatTileProps) {
  const isActive =
    typeof value === 'number' ? value > 0 : value !== '0%'
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 py-4 flex-1">
      <span className={`text-3xl font-bold tabular-nums ${isActive ? 'text-sky-300' : 'text-zinc-100'}`}>{value}</span>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500 text-center leading-tight">
        {label}
      </span>
    </div>
  )
}

/**
 * Displays session-level Wordle statistics: games played, win %, streaks.
 */
export function SessionStats({ stats }: SessionStatsProps) {
  const winPct =
    stats.gamesPlayed === 0
      ? 0
      : Math.round((stats.wins / stats.gamesPlayed) * 100)

  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 backdrop-blur-md overflow-hidden">
      <p className="border-b border-white/8 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Session Stats
      </p>
      <div className="flex divide-x divide-white/8">
        <StatTile label="Played" value={stats.gamesPlayed} />
        <StatTile label="Win %" value={`${winPct}%`} />
        <StatTile label="Current Streak" value={stats.currentStreak} />
        <StatTile label="Max Streak" value={stats.maxStreak} />
      </div>
    </div>
  )
}
