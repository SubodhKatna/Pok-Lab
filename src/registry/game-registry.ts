import { GiCardRandom, GiMagnifyingGlass, GiSwordsPower } from 'react-icons/gi'
import { MdCatchingPokemon } from 'react-icons/md'
import { RiTeamFill } from 'react-icons/ri'
import type { GameModule } from '@/shared/types/registry'
import { WordlePage } from '@/features/wordle/WordlePage'
import { WTPPage } from '@/features/whos-that-pokemon/WTPPage'
import { PartialImagePage } from '@/features/partial-image/PartialImagePage'
import { PokedexPage } from '@/features/pokedex/PokedexPage'
import { TeamBuilderPage } from '@/features/team-builder/TeamBuilderPage'

export const GAME_REGISTRY: GameModule[] = [
  {
    id: 'wordle',
    name: 'Pokémon Wordle',
    description: 'Guess the mystery Pokémon by its attributes.',
    icon: GiCardRandom,
    path: '/wordle',
    component: WordlePage,
  },
  {
    id: 'whos-that-pokemon',
    name: "Who's That Pokémon?",
    description: 'Identify the Pokémon from its silhouette.',
    icon: GiMagnifyingGlass,
    path: '/whos-that-pokemon',
    component: WTPPage,
  },
  {
    id: 'partial-image',
    name: 'Partial Image',
    description: 'Identify the Pokémon from a cropped image.',
    icon: GiSwordsPower,
    path: '/partial-image',
    component: PartialImagePage,
  },
  {
    id: 'pokedex',
    name: 'Pokédex',
    description: 'Browse and compare Pokémon data.',
    icon: MdCatchingPokemon,
    path: '/pokedex',
    component: PokedexPage,
  },
  {
    id: 'team-builder',
    name: 'Team Builder',
    description: 'Build a team and score its synergy.',
    icon: RiTeamFill,
    path: '/team-builder',
    component: TeamBuilderPage,
  },
]
