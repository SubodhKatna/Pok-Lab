import { useState } from 'react'
import { FiChevronDown, FiMenu, FiBook, FiUsers } from 'react-icons/fi'
import { GiSwordsPower, GiPokecog } from 'react-icons/gi'
import { BsQuestionCircleFill } from 'react-icons/bs'
import { MdOutlineCropFree } from 'react-icons/md'
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

const GAMES: GameEntry[] = [
  { label: 'Pokémon Wordle', icon: <GiPokecog size={15} />, href: '#' },
  { label: "Who's That Pokémon?", icon: <BsQuestionCircleFill size={15} />, href: '#' },
  { label: 'Partial Image', icon: <MdOutlineCropFree size={15} />, href: '#' },
]

type ActivePage = 'pokedex' | 'team-builder' | string

interface GameEntry {
  label: string
  icon: React.ReactNode
  href: string
}

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
        {/* Pokédex */}
        <NavButton
          icon={<FiBook size={16} />}
          label="Pokédex"
          active={active === 'pokedex'}
          onClick={() => setActive('pokedex')}
        />

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
            {GAMES.map((game) => (
              <DropdownMenuItem
                key={game.label}
                onClick={() => setActive(`game-${game.label}`)}
                className={`
                  gap-2.5 cursor-pointer rounded-lg
                  ${active === `game-${game.label}`
                    ? 'bg-zinc-700 text-zinc-100'
                    : 'text-zinc-300 focus:bg-zinc-800 focus:text-zinc-100'}
                `}
              >
                <span>{game.icon}</span>
                {game.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Team Builder */}
        <NavButton
          icon={<FiUsers size={16} />}
          label="Team Builder"
          active={active === 'team-builder'}
          onClick={() => setActive('team-builder')}
        />
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
              <MobileNavButton
                icon={<FiBook size={16} />}
                label="Pokédex"
                active={active === 'pokedex'}
                onClick={() => { setActive('pokedex'); setMobileOpen(false) }}
              />

              {/* Games section */}
              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                  Games
                </p>
                {GAMES.map((game) => (
                  <MobileNavButton
                    key={game.label}
                    icon={game.icon}
                    label={game.label}
                    active={active === `game-${game.label}`}
                    onClick={() => { setActive(`game-${game.label}`); setMobileOpen(false) }}
                  />
                ))}
              </div>

              {/* Team Builder */}
              <div className="pt-2">
                <MobileNavButton
                  icon={<FiUsers size={16} />}
                  label="Team Builder"
                  active={active === 'team-builder'}
                  onClick={() => { setActive('team-builder'); setMobileOpen(false) }}
                />
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
