import { NavLink } from 'react-router-dom'
import { FiCompass } from 'react-icons/fi'
import { useAuthContext } from '@/features/auth/AuthContext'

export function NotFoundPage() {
  const { user } = useAuthContext()
  const homeHref = user ? '/home' : '/'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-zinc-950 px-6 py-14">
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
              <FiCompass className="text-zinc-200" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-zinc-100">Page not found</h1>
              <p className="mt-1 text-sm text-zinc-400">
                That route doesn&apos;t exist.
              </p>
            </div>
          </div>

          <div className="mt-5">
            <NavLink
              to={homeHref}
              className="inline-flex items-center rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              Back to home
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
