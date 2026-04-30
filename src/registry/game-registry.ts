import { GiCardRandom, GiMagnifyingGlass, GiSwordsPower } from 'react-icons/gi'
import { MdCatchingPokemon } from 'react-icons/md'
import { RiTeamFill } from 'react-icons/ri'
import type { GameModule } from '@/shared/types/registry'

export const GAME_REGISTRY: GameModule[] = [
  {
    id: 'wordle',
    name: 'Pokémon Wordle',
    description: 'Guess the mystery Pokémon by its attributes.',
    icon: GiCardRandom,
    path: '/wordle',
  },
  {
    id: 'whos-that-pokemon',
    name: "Who's That Pokémon?",
    description: 'Identify the Pokémon from its silhouette.',
    icon: GiMagnifyingGlass,
    path: '/whos-that-pokemon',
  },
  {
    id: 'partial-image',
    name: 'Partial Image',
    description: 'Identify the Pokémon from a cropped image.',
    icon: GiSwordsPower,
    path: '/partial-image',
  },
  {
    id: 'pokedex',
    name: 'Pokédex',
    description: 'Browse and compare Pokémon data.',
    icon: MdCatchingPokemon,
    path: '/pokedex',
  },
  {
    id: 'team-builder',
    name: 'Team Builder',
    description: 'Build a team and score its synergy.',
    icon: RiTeamFill,
    path: '/team-builder',
  },
]
