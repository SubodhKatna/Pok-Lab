export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface BaseStats {
  hp: number;
  attack: number;
  defense: number;
  spAtk: number;
  spDef: number;
  speed: number;
}

export interface PokemonSummary {
  id: number;
  name: string;
  sprite: string; // official artwork URL
}

export interface PokemonDetail extends PokemonSummary {
  types: PokemonType[];
  stats: BaseStats;
  abilities: Array<{ name: string; isHidden: boolean }>;
  height: number;   // decimetres
  weight: number;   // hectograms
  generation: number; // 1–9
  color: string;
  eggGroups: string[];
  evolutionStage: number; // 1 = base, 2 = first evo, 3 = final
  description: string;  // Pokédex flavor text
  moves: MoveEntry[];
  evolutionChain: EvolutionNode[];
  /** All non-default forms for this species (mega, gmax, regional, etc.) */
  forms: PokemonVariant[];
}

export interface MoveEntry {
  name: string;
  type: PokemonType;
  category: 'physical' | 'special' | 'status';
  power: number | null;
  accuracy: number | null;
  pp: number;
  learnMethod: string;       // e.g. "level-up", "machine", "egg", "tutor"
  levelLearnedAt: number;    // 0 if not level-up
  effect: string;            // short effect description
}

export type VariantKind = 'regional' | 'mega' | 'gmax' | 'dmax' | 'other';

export interface PokemonVariant {
  name: string;
  id: number;
  kind: VariantKind;
}

export interface EvolutionNode {
  name: string;
  id: number;
  trigger: string; // e.g. "level-up at 16", "use Fire Stone"
  children: EvolutionNode[];
  variants?: PokemonVariant[];
}
