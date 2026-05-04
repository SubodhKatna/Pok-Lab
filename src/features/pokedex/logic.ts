import type { PokemonType, BaseStats } from '@/shared/types/pokemon';

/** All 18 Pokémon types in canonical order. */
export const ALL_TYPES: PokemonType[] = [
  'normal', 'fire', 'water', 'electric', 'grass', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy',
];

/**
 * Type effectiveness chart: attackingType → defendingType → multiplier.
 * Values: 0 (immune), 0.5 (not very effective), 2 (super effective).
 * Omitted entries default to 1 (normal damage).
 */
const TYPE_CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Compute the damage multiplier for each of the 18 attacking types
 * against a defending Pokémon with the given types.
 *
 * For dual-type Pokémon, multipliers from each defending type are multiplied together.
 * Returns a map of attackingType → combined multiplier (0, 0.25, 0.5, 1, 2, or 4).
 *
 * Validates: Requirements 7.3
 */
export function computeTypeEffectiveness(
  defenderTypes: PokemonType[],
): Record<PokemonType, number> {
  const result = {} as Record<PokemonType, number>;

  for (const attackType of ALL_TYPES) {
    let multiplier = 1;
    for (const defType of defenderTypes) {
      const row = TYPE_CHART[attackType];
      const val = row?.[defType];
      if (val !== undefined) {
        multiplier *= val;
      }
    }
    result[attackType] = multiplier;
  }

  return result;
}

/** Per-stat highlight info returned by computeStatHighlights. */
export interface StatHighlight {
  /** The stat key. */
  stat: keyof BaseStats;
  /** Index of the Pokémon with the highest value for this stat (-1 if tied). */
  highestIndex: number;
  /** Differences: value[i] - value[highestIndex] (0 for the highest, negative for others). */
  diffs: number[];
}

/**
 * For a set of 2–4 Pokémon in the comparison view, compute which Pokémon has
 * the highest value for each stat and the numeric differences.
 *
 * Validates: Requirements 7.6, 7.7
 */
export function computeStatHighlights(statsList: BaseStats[]): StatHighlight[] {
  const statKeys: (keyof BaseStats)[] = ['hp', 'attack', 'defense', 'spAtk', 'spDef', 'speed'];

  return statKeys.map((stat) => {
    const values = statsList.map((s) => s[stat]);
    const maxVal = Math.max(...values);
    // If multiple Pokémon share the max, highestIndex is -1 (tied)
    const maxCount = values.filter((v) => v === maxVal).length;
    const highestIndex = maxCount > 1 ? -1 : values.indexOf(maxVal);
    const diffs = values.map((v) => v - maxVal);
    return { stat, highestIndex, diffs };
  });
}
