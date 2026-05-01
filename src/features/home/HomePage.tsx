import { Link } from 'react-router-dom'
import { GAME_REGISTRY } from '@/registry/game-registry'

export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAME_REGISTRY.map((mod) => {
          const Icon = mod.icon
          return (
            <Link
              key={mod.id}
              to={mod.path}
              className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors"
            >
              <Icon className="text-4xl text-zinc-100 mb-4" />
              <h2 className="text-zinc-100 text-lg font-semibold mb-2">{mod.name}</h2>
              <p className="text-zinc-400 text-sm">{mod.description}</p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
