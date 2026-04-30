import type React from 'react'
import type { IconType } from 'react-icons'

export interface GameModule {
  id: string
  name: string
  description: string
  icon: IconType          // react-icons icon component
  path: string            // React Router path
  component?: React.ComponentType
}
