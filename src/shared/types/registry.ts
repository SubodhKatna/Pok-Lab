import type React from 'react'
import type { IconType } from 'react-icons'

export interface GameModule {
  id: string
  name: string
  description: string
  icon: IconType          // react-icons icon component
  path: string            // React Router path
  component?: React.ComponentType
  /**
   * When true, the module should only be accessible when signed in.
   * The router should enforce this, and the UI should visually lock it.
   */
  requiresAuth?: boolean
}
