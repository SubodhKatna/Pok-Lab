import { useState, useEffect, useCallback } from 'react'
import { FiSave, FiTrash2, FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { useAuthContext } from '@/features/auth/AuthContext'
import {
  saveTeam,
  loadTeams,
  deleteTeam,
  type SavedTeam,
} from '@/lib/firestore'
import type { TeamMember } from '@/shared/types/game-state'
import type { PokemonSummary } from '@/shared/types/pokemon'

interface MyTeamsPanelProps {
  members: TeamMember[]
  onLoadTeam: (pokemonIds: { id: number; name: string; sprite: string }[]) => void
}

export function MyTeamsPanel({ members, onLoadTeam }: MyTeamsPanelProps) {
  const { user } = useAuthContext()
  const [teams, setTeams] = useState<SavedTeam[]>([])
  const [saving, setSaving] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [teamName, setTeamName] = useState('')
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchTeams = useCallback(async () => {
    if (!user) return
    const loaded = await loadTeams(user.uid)
    setTeams(loaded)
  }, [user])

  useEffect(() => {
    let cancelled = false
    if (!user) {
      void Promise.resolve().then(() => { if (!cancelled) setTeams([]) })
      return () => { cancelled = true }
    }
    loadTeams(user.uid).then((loaded) => {
      if (!cancelled) setTeams(loaded)
    }).catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [user])

  const handleSave = async () => {
    if (!user || members.length === 0) return
    setSaving(true)
    setSaveError(null)
    try {
      const name = teamName.trim() || `Team ${new Date().toLocaleDateString()}`
      await saveTeam(user.uid, {
        name,
        pokemonIds: members.map((m) => m.pokemon.id),
        pokemonNames: members.map((m) => m.pokemon.name),
        pokemonSprites: members.map((m) => m.pokemon.sprite),
      })
      setTeamName('')
      await fetchTeams()
      setExpanded(true)
    } catch {
      setSaveError('Failed to save team. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (teamId: string) => {
    if (!user) return
    await deleteTeam(user.uid, teamId)
    await fetchTeams()
  }

  const handleLoad = (team: SavedTeam) => {
    const pokemon: PokemonSummary[] = team.pokemonIds.map((id, i) => ({
      id,
      name: team.pokemonNames[i] ?? '',
      sprite: team.pokemonSprites[i] ?? '',
    }))
    onLoadTeam(pokemon)
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500 mb-2">My Teams</p>
        <p className="text-sm text-zinc-500">Sign in to save and load teams.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">My Teams</p>
        {teams.length > 0 && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {expanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
            {teams.length} saved
          </button>
        )}
      </div>

      {/* Save current team */}
      {members.length > 0 && (
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name (optional)"
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-sky-500/50 focus:outline-none transition-colors"
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSave() }}
          />
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
          >
            <FiSave size={14} />
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      )}

      {saveError && (
        <p className="mb-3 text-xs text-red-400">{saveError}</p>
      )}

      {/* Saved teams list */}
      {expanded && teams.length > 0 && (
        <div className="flex flex-col gap-2">
          {teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-3 rounded-xl border border-zinc-700/60 bg-zinc-800/60 px-3 py-2.5"
            >
              {/* Sprites */}
              <div className="flex -space-x-2 shrink-0">
                {team.pokemonSprites.slice(0, 4).map((sprite, i) => (
                  <img
                    key={i}
                    src={sprite}
                    alt={team.pokemonNames[i]}
                    className="h-7 w-7 rounded-full border border-zinc-700 bg-zinc-900 object-contain"
                  />
                ))}
                {team.pokemonSprites.length > 4 && (
                  <div className="h-7 w-7 rounded-full border border-zinc-700 bg-zinc-800 flex items-center justify-center text-[10px] text-zinc-400 font-bold">
                    +{team.pokemonSprites.length - 4}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-100 truncate">{team.name}</p>
                <p className="text-xs text-zinc-500 capitalize truncate">
                  {team.pokemonNames.join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => handleLoad(team)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-sky-400 hover:bg-sky-400/10 transition-all"
                  title="Load team"
                >
                  <FiDownload size={13} />
                </button>
                <button
                  onClick={() => void handleDelete(team.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                  title="Delete team"
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {teams.length === 0 && (
        <p className="text-xs text-zinc-600">No saved teams yet. Build a team and save it!</p>
      )}
    </div>
  )
}
