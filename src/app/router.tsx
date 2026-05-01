import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Shell } from '@/shared/components/Shell'
import { GAME_REGISTRY } from '@/registry/game-registry'

const moduleRoutes = GAME_REGISTRY.map((mod) => ({
  path: mod.path,
  element: mod.component ? <mod.component /> : null,
}))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Shell />,
    children: [
      // Redirect root to the first registered module
      { index: true, element: <Navigate to={GAME_REGISTRY[0].path} replace /> },
      ...moduleRoutes,
    ],
  },
])
