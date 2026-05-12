import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '@/shared/components/Shell'
import { GAME_REGISTRY } from '@/registry/game-registry'
import { HomePage } from '@/features/home/HomePage'
import { PokedexPage } from '@/features/pokedex/PokedexPage'
import { RequireAuth } from '@/features/auth/RequireAuth'
import { NotFoundPage } from '@/shared/pages/NotFoundPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { IndexRoute } from './IndexRoute'

const moduleRoutes = GAME_REGISTRY.map((mod) => ({
  path: mod.path,
  element: mod.component
    ? (mod.requiresAuth ? (
      <RequireAuth>
        <mod.component />
      </RequireAuth>
    ) : (
      <mod.component />
    ))
    : null,
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      { index: true, element: <IndexRoute /> },
      { path: '/home', element: <RequireAuth><HomePage /></RequireAuth> },
      { path: '/profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
      ...moduleRoutes,
      // Pokédex detail route — keeps URL in sync so reload works
      { path: '/pokedex/:pokemonId', element: <PokedexPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
