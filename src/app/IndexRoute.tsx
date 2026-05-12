import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/features/auth/AuthContext'
import { LandingPage } from '@/features/landing/LandingPage'

export function IndexRoute() {
  const { user, loading } = useAuthContext()

  if (loading) return null
  if (user) return <Navigate to="/home" replace />
  return <LandingPage />
}

