import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiChevronDown, FiMenu, FiLogOut, FiLock, FiUser } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { GiSwordsPower } from 'react-icons/gi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { GAME_REGISTRY } from '@/registry/game-registry'
import { useAuthContext } from '@/features/auth/AuthContext'

// IDs that get their own top-level nav button (not in the Games dropdown)
const TOP_LEVEL_IDS = ['pokedex', 'team-builder']
// IDs that live inside the Games dropdown
const GAME_DROPDOWN_IDS = ['wordle', 'whos-that-pokemon', 'partial-image']

const topLevelModules = GAME_REGISTRY.filter((m) => TOP_LEVEL_IDS.includes(m.id))
const gameDropdownModules = GAME_REGISTRY.filter((m) => GAME_DROPDOWN_IDS.includes(m.id))

export function NavBar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, loading, signIn, signOut } = useAuthContext()
  const homeHref = user ? '/home' : '/'

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 h-14 flex items-center justify-between">
      {/* Logo */}
      <NavLink
        to={homeHref}
        className="flex items-center gap-2 text-zinc-100 font-semibold text-base tracking-tight shrink-0 hover:text-white transition-colors"
      >
        <img src="/favicon.svg" alt="PokéLab logo" className="w-7 h-7" />
        <span className="hidden sm:inline">PokéLab</span>
      </NavLink>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {/* Top-level modules (Pokédex) — rendered before the dropdown */}
        {topLevelModules
          .filter((m) => m.id !== 'team-builder')
          .map((mod) => (
            <NavLink
              key={mod.id}
              to={mod.path}
              className={({ isActive }) => `
                flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                ${isActive
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
              `}
            >
              <mod.icon size={16} />
              {mod.name}
            </NavLink>
          ))}

        {/* Games dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
            >
              <GiSwordsPower size={16} />
              Games
              <FiChevronDown size={14} className="opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="bg-zinc-900 border border-zinc-800 rounded-xl min-w-48"
          >
            {gameDropdownModules.map((mod) => {
              const locked = !!mod.requiresAuth && !user
              if (locked) {
                return (
                  <button
                    key={mod.id}
                    type="button"
                    disabled={loading}
                    onClick={() => void signIn()}
                    className="w-full flex items-center justify-between gap-2.5 px-2 py-1.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label={`${mod.name} (locked)`}
                  >
                    <span className="flex items-center gap-2.5">
                      <mod.icon size={16} />
                      {mod.name}
                    </span>
                    <FiLock size={14} className="opacity-70" />
                  </button>
                )
              }
              return (
                <NavLink
                  key={mod.id}
                  to={mod.path}
                  className={({ isActive }) => `
                    flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm cursor-pointer
                    ${isActive
                      ? 'bg-zinc-700 text-zinc-100'
                      : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}
                  `}
                >
                  <mod.icon size={16} />
                  {mod.name}
                </NavLink>
              )
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Team Builder — rendered after the dropdown */}
        {topLevelModules
          .filter((m) => m.id === 'team-builder')
          .map((mod) => (
            (!!mod.requiresAuth && !user) ? (
              <button
                key={mod.id}
                type="button"
                disabled={loading}
                onClick={() => void signIn()}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label={`${mod.name} (locked)`}
              >
                <mod.icon size={16} />
                {mod.name}
                <FiLock size={14} className="ml-1 opacity-70" />
              </button>
            ) : (
              <NavLink
                key={mod.id}
                to={mod.path}
                className={({ isActive }) => `
                  flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
                `}
              >
                <mod.icon size={16} />
                {mod.name}
              </NavLink>
            )
          ))}

        {/* Auth — desktop */}
        <div className="ml-2 pl-2 border-l border-zinc-800">
          {!loading && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800 transition-colors"
                    aria-label="Account menu"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName ?? 'User avatar'}
                        className="w-7 h-7 rounded-full border border-zinc-700"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {(user.displayName ?? 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm text-zinc-300 max-w-[120px] truncate hidden lg:inline">
                      {user.displayName ?? user.email}
                    </span>
                    <FiChevronDown size={12} className="text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl min-w-44"
                >
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-100 truncate">{user.displayName}</p>
                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <NavLink
                    to="/profile"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                  >
                    <FiUser size={14} />
                    Profile
                  </NavLink>
                  <button
                    onClick={() => void signOut()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-b-xl transition-colors"
                  >
                    <FiLogOut size={14} />
                    Sign out
                  </button>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => void signIn()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:border-zinc-600 hover:bg-zinc-700 transition-all"
              >
                <FcGoogle size={16} />
                Sign in
              </button>
            )
          )}
        </div>
      </div>

      {/* Mobile: auth + hamburger */}
      <div className="flex items-center gap-2 md:hidden">
        {/* Mobile auth button */}
        {!loading && (
          user ? (
            <button
              onClick={() => void signOut()}
              className="flex items-center gap-1.5 p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              aria-label="Sign out"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName ?? 'User avatar'}
                  className="w-7 h-7 rounded-full border border-zinc-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                  {(user.displayName ?? 'U')[0].toUpperCase()}
                </div>
              )}
            </button>
          ) : (
            <button
              onClick={() => void signIn()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-zinc-700 bg-zinc-800 text-xs font-medium text-zinc-300 hover:text-zinc-100 transition-all"
            >
              <FcGoogle size={14} />
              Sign in
            </button>
          )
        )}

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button
              aria-label="Open navigation menu"
              className="p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            >
              <FiMenu size={20} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-zinc-900 border-zinc-800 w-64 p-0">
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
              <SheetTitle className="flex items-center gap-2 text-zinc-100">
                <img src="/favicon.svg" alt="PokéLab logo" className="w-6 h-6" />
                PokéLab
              </SheetTitle>
            </SheetHeader>

            <div className="px-3 py-4 flex flex-col gap-1">
              {/* Pokédex */}
              {topLevelModules
                .filter((m) => m.id !== 'team-builder')
                .map((mod) => (
                  <NavLink
                    key={mod.id}
                    to={mod.path}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => `
                      w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left
                      ${isActive
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
                    `}
                  >
                    <mod.icon size={16} />
                    {mod.name}
                  </NavLink>
                ))}

              {/* Games section */}
              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Games
                </p>
                {gameDropdownModules.map((mod) => (
                  (!!mod.requiresAuth && !user) ? (
                    <button
                      key={mod.id}
                      type="button"
                      disabled={loading}
                      onClick={() => { void signIn(); setMobileOpen(false) }}
                      className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
                      aria-label={`${mod.name} (locked)`}
                    >
                      <span className="flex items-center gap-2.5">
                        <mod.icon size={16} />
                        {mod.name}
                      </span>
                      <FiLock size={14} className="opacity-70" />
                    </button>
                  ) : (
                    <NavLink
                      key={mod.id}
                      to={mod.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) => `
                        w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left
                        ${isActive
                          ? 'bg-zinc-700 text-zinc-100'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
                      `}
                    >
                      <mod.icon size={16} />
                      {mod.name}
                    </NavLink>
                  )
                ))}
              </div>

              {/* Team Builder */}
              <div className="pt-2">
                {topLevelModules
                  .filter((m) => m.id === 'team-builder')
                  .map((mod) => (
                    (!!mod.requiresAuth && !user) ? (
                      <button
                        key={mod.id}
                        type="button"
                        disabled={loading}
                        onClick={() => { void signIn(); setMobileOpen(false) }}
                        className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
                        aria-label={`${mod.name} (locked)`}
                      >
                        <span className="flex items-center gap-2.5">
                          <mod.icon size={16} />
                          {mod.name}
                        </span>
                        <FiLock size={14} className="opacity-70" />
                      </button>
                    ) : (
                      <NavLink
                        key={mod.id}
                        to={mod.path}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) => `
                          w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left
                          ${isActive
                            ? 'bg-zinc-700 text-zinc-100'
                            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
                        `}
                      >
                        <mod.icon size={16} />
                        {mod.name}
                      </NavLink>
                    )
                  ))}
              </div>

              {/* Auth in mobile sheet */}
              {!loading && (
                <div className="pt-4 mt-2 border-t border-zinc-800">
                  {user ? (
                    <div className="flex flex-col gap-2 px-3">
                      <div className="flex items-center gap-2">
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName ?? 'User avatar'}
                            className="w-8 h-8 rounded-full border border-zinc-700"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold text-zinc-300">
                            {(user.displayName ?? 'U')[0].toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-zinc-100 truncate">{user.displayName}</span>
                          <span className="text-xs text-zinc-500 truncate">{user.email}</span>
                        </div>
                      </div>
                      <NavLink
                        to="/profile"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      >
                        <FiUser size={14} />
                        Profile
                      </NavLink>
                      <button
                        onClick={() => { void signOut(); setMobileOpen(false) }}
                        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                      >
                        <FiLogOut size={14} />
                        Sign out
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { void signIn(); setMobileOpen(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
                    >
                      <FcGoogle size={16} />
                      Sign in with Google
                    </button>
                  )}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
