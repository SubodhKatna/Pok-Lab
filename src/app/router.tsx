import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '@/shared/components/Shell'
import { GAME_REGISTRY } from '@/registry/game-registry'
import { HomePage } from '@/features/home/HomePage'
import { PokedexPage } from '@/features/pokedex/PokedexPage'

const moduleRoutes = GAME_REGISTRY.map((mod) => ({
  path: mod.path,
  element: mod.component ? <mod.component /> : null,
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <HomePage /> },
      ...moduleRoutes,
      // Pokédex detail route — keeps URL in sync so reload works
      { path: '/pokedex/:pokemonId', element: <PokedexPage /> },
    ],
  },
])
