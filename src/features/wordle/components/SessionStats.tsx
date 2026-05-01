import type { WordleSessionStats } from '@/shared/types/game-state'

interface SessionStatsProps {
  stats: WordleSessionStats
}

interface StatTileProps {
  label: string
  value: string | number
}

function StatTile({ label, value }: StatTileProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3">
      <span className="text-2xl font-bold text-zinc-100 tabular-nums">{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-widest text-zinc-500 text-center leading-tight">
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
    <div className="rounded-lg border border-zinc-800 bg-zinc-900">
      <p className="border-b border-zinc-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Session Stats
      </p>
      <div className="flex divide-x divide-zinc-800">
        <StatTile label="Played" value={stats.gamesPlayed} />
        <StatTile label="Win %" value={`${winPct}%`} />
        <StatTile label="Current Streak" value={stats.currentStreak} />
        <StatTile label="Max Streak" value={stats.maxStreak} />
      </div>
    </div>
  )
}
