import type { ReactNode } from 'react'
import { useAuthContext } from './AuthContext'
import { UnauthorizedPage } from '@/shared/pages/UnauthorizedPage'

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthContext()

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] bg-zinc-950 px-6 py-14">
        <div className="mx-auto max-w-lg">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">
            Checking session…
          </div>
        </div>
      </div>
    )
  }

  if (!user) return <UnauthorizedPage />
  return children
}

