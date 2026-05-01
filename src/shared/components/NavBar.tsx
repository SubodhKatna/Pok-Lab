import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FiChevronDown, FiMenu } from 'react-icons/fi'
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

// IDs that get their own top-level nav button (not in the Games dropdown)
const TOP_LEVEL_IDS = ['pokedex', 'team-builder']
// IDs that live inside the Games dropdown
const GAME_DROPDOWN_IDS = ['wordle', 'whos-that-pokemon', 'partial-image']

const topLevelModules = GAME_REGISTRY.filter((m) => TOP_LEVEL_IDS.includes(m.id))
const gameDropdownModules = GAME_REGISTRY.filter((m) => GAME_DROPDOWN_IDS.includes(m.id))

export function NavBar()  {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 h-14 flex items-center justify-between">
      {/* Logo */}
      <NavLink
        to={GAME_REGISTRY[0].path}
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
            {gameDropdownModules.map((mod) => (
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
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Team Builder — rendered after the dropdown */}
        {topLevelModules
          .filter((m) => m.id === 'team-builder')
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
      </div>

      {/* Mobile hamburger */}
      <div className="flex md:hidden">
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
              </div>

              {/* Team Builder */}
              <div className="pt-2">
                {topLevelModules
                  .filter((m) => m.id === 'team-builder')
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
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
