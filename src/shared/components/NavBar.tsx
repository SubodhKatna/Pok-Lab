import { useState } from 'react'
import { FiChevronDown, FiMenu } from 'react-icons/fi'
import { GiSwordsPower } from 'react-icons/gi'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

type ActivePage = string

export function NavBar() {
  const [active, setActive] = useState<ActivePage>('')
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 h-14 flex items-center justify-between">
      {/* Logo */}
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setActive('') }}
        className="flex items-center gap-2 text-zinc-100 font-semibold text-base tracking-tight shrink-0 hover:text-white transition-colors"
      >
        <img src="/favicon.svg" alt="PokéLab logo" className="w-7 h-7" />
        <span className="hidden sm:inline">PokéLab</span>
      </a>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-1">
        {/* Top-level modules (Pokédex, Team Builder) — rendered before the dropdown */}
        {topLevelModules
          .filter((m) => m.id !== 'team-builder')
          .map((mod) => (
            <NavButton
              key={mod.id}
              icon={<mod.icon size={16} />}
              label={mod.name}
              active={active === mod.id}
              onClick={() => setActive(mod.id)}
            />
          ))}

        {/* Games dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                ${active.startsWith('game-')
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
              `}
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
              <DropdownMenuItem
                key={mod.id}
                onClick={() => setActive(`game-${mod.id}`)}
                className={`
                  gap-2.5 cursor-pointer rounded-lg
                  ${active === `game-${mod.id}`
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100'}
                `}
              >
                <mod.icon size={16} />
                {mod.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Team Builder — rendered after the dropdown */}
        {topLevelModules
          .filter((m) => m.id === 'team-builder')
          .map((mod) => (
            <NavButton
              key={mod.id}
              icon={<mod.icon size={16} />}
              label={mod.name}
              active={active === mod.id}
              onClick={() => setActive(mod.id)}
            />
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
                  <MobileNavButton
                    key={mod.id}
                    icon={<mod.icon size={16} />}
                    label={mod.name}
                    active={active === mod.id}
                    onClick={() => { setActive(mod.id); setMobileOpen(false) }}
                  />
                ))}

              {/* Games section */}
              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Games
                </p>
                {gameDropdownModules.map((mod) => (
                  <MobileNavButton
                    key={mod.id}
                    icon={<mod.icon size={16} />}
                    label={mod.name}
                    active={active === `game-${mod.id}`}
                    onClick={() => { setActive(`game-${mod.id}`); setMobileOpen(false) }}
                  />
                ))}
              </div>

              {/* Team Builder */}
              <div className="pt-2">
                {topLevelModules
                  .filter((m) => m.id === 'team-builder')
                  .map((mod) => (
                    <MobileNavButton
                      key={mod.id}
                      icon={<mod.icon size={16} />}
                      label={mod.name}
                      active={active === mod.id}
                      onClick={() => { setActive(mod.id); setMobileOpen(false) }}
                    />
                  ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}

function NavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
        ${active
          ? 'bg-zinc-700 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
      `}
    >
      {icon}
      {label}
    </button>
  )
}

function MobileNavButton({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 text-left
        ${active
          ? 'bg-zinc-700 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'}
      `}
    >
      {icon}
      {label}
    </button>
  )
}
