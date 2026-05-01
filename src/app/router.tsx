import { createBrowserRouter } from 'react-router-dom'
import { Shell } from '@/shared/components/Shell'
import { GAME_REGISTRY } from '@/registry/game-registry'
import { HomePage } from '@/features/home/HomePage'

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
    ],
  },
])
