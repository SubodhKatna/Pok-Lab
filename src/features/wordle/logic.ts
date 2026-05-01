import type { PokemonDetail } from '@/shared/types/pokemon';
import type {
  StatsFeedbackRow,
  AttributesFeedbackRow,
  StatFeedback,
  AttributeFeedback,
} from '@/shared/types/game-state';

function compareStatValue(guessed: number, mystery: number): StatFeedback {
  if (guessed > mystery) return 'higher';
  if (guessed < mystery) return 'lower';
  return 'correct';
}

export function computeStatFeedback(
  guessed: PokemonDetail,
  mystery: PokemonDetail,
): StatsFeedbackRow {
  return {
    mode: 'stats',
    guessedPokemon: {
      id: guessed.id,
      name: guessed.name,
      sprite: guessed.sprite,
    },
    hp: compareStatValue(guessed.stats.hp, mystery.stats.hp),
    attack: compareStatValue(guessed.stats.attack, mystery.stats.attack),
    defense: compareStatValue(guessed.stats.defense, mystery.stats.defense),
    spAtk: compareStatValue(guessed.stats.spAtk, mystery.stats.spAtk),
    spDef: compareStatValue(guessed.stats.spDef, mystery.stats.spDef),
    speed: compareStatValue(guessed.stats.speed, mystery.stats.speed),
  };
}

function compareScalar<T>(guessed: T, mystery: T): AttributeFeedback {
  return guessed === mystery ? 'correct' : 'incorrect';
}

function compareType(
  guessedType: string | undefined,
  mysteryType: string | undefined,
  mysteryAllTypes: string[],
): AttributeFeedback {
  if (guessedType === undefined && mysteryType === undefined) return 'correct';
  if (guessedType === undefined || mysteryType === undefined) return 'incorrect';
  if (guessedType === mysteryType) return 'correct';
  if (mysteryAllTypes.includes(guessedType)) return 'partial';
  return 'incorrect';
}

function compareEggGroup(
  guessedEggGroups: string[],
  mysteryEggGroups: string[],
): AttributeFeedback {
  if (guessedEggGroups[0] === mysteryEggGroups[0]) return 'correct';
  const hasOverlap = guessedEggGroups.some(g => mysteryEggGroups.includes(g));
  return hasOverlap ? 'partial' : 'incorrect';
}

export function computeAttributeFeedback(
  guessed: PokemonDetail,
  mystery: PokemonDetail,
): AttributesFeedbackRow {
  const guessedType1 = guessed.types[0] ?? undefined;
  const guessedType2 = guessed.types[1] ?? undefined;
  const mysteryType1 = mystery.types[0] ?? undefined;
  const mysteryType2 = mystery.types[1] ?? undefined;

  return {
    mode: 'attributes',
    guessedPokemon: {
      id: guessed.id,
      name: guessed.name,
      sprite: guessed.sprite,
    },
    guessedValues: {
      type1: guessedType1 ?? null,
      type2: guessedType2 ?? null,
      generation: guessed.generation,
      color: guessed.color,
      eggGroup: guessed.eggGroups[0] ?? '',
      evolutionStage: guessed.evolutionStage,
    },
    type1: compareType(guessedType1, mysteryType1, mystery.types),
    type2: compareType(guessedType2, mysteryType2, mystery.types),
    generation: compareScalar(guessed.generation, mystery.generation),
    color: compareScalar(guessed.color, mystery.color),
    eggGroup: compareEggGroup(guessed.eggGroups, mystery.eggGroups),
    evolutionStage: compareScalar(guessed.evolutionStage, mystery.evolutionStage),
  };
}
