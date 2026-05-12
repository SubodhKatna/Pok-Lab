import { NavLink } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuthContext } from '@/features/auth/AuthContext'

export function UnauthorizedPage() {
  const { user, loading, signIn } = useAuthContext()
  const homeHref = user ? '/home' : '/'

  return (
    <div className="min-h-[calc(100vh-56px)] bg-zinc-950 px-6 py-14">
      <div className="mx-auto max-w-lg">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800">
              <FiLock className="text-zinc-200" size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-zinc-100">Sign in required</h1>
              <p className="mt-1 text-sm text-zinc-400">
                This area is protected. Sign in to continue.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              disabled={loading}
              onClick={() => void signIn()}
              className="inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              <FcGoogle size={16} />
              Sign in with Google
            </button>
            <NavLink
              to={homeHref}
              className="inline-flex items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              Go home
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  )
}
