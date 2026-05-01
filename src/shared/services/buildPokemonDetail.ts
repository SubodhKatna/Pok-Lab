import { fetchPokemon, fetchPokemonSpecies } from './pokeapi';
import type { PokemonDetail } from '@/shared/types/pokemon';

/** Parse "generation-i" → 1, "generation-iv" → 4, etc. */
function parseGeneration(genName: string): number {
  const map: Record<string, number> = {
    'generation-i': 1,
    'generation-ii': 2,
    'generation-iii': 3,
    'generation-iv': 4,
    'generation-v': 5,
    'generation-vi': 6,
    'generation-vii': 7,
    'generation-viii': 8,
    'generation-ix': 9,
  };
  return map[genName] ?? 0;
}

/**
 * Determine evolution stage (1 = base, 2 = first evo, 3 = final evo).
 * Uses `evolves_from_species` — if null it's stage 1.
 * We do a second species fetch to check if the parent also evolved.
 */
async function getEvolutionStage(
  evolvesFrom: { name: string } | null,
): Promise<number> {
  if (!evolvesFrom) return 1;
  try {
    const parentSpecies = await fetchPokemonSpecies(evolvesFrom.name);
    return parentSpecies.evolves_from_species ? 3 : 2;
  } catch {
    return 2;
  }
}

/**
 * Fetch both /pokemon and /pokemon-species and merge into a full PokemonDetail.
 * Cached by React Query — call via queryClient.fetchQuery with staleTime: Infinity.
 */
export async function buildPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
  const [raw, species] = await Promise.all([
    fetchPokemon(nameOrId),
    fetchPokemonSpecies(nameOrId),
  ]);

  const sprite =
    raw.sprites.other['official-artwork'].front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`;

  const statsMap: Record<string, number> = {};
  for (const s of raw.stats) statsMap[s.stat.name] = s.base_stat;

  const types = raw.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name) as PokemonDetail['types'];

  // English flavor text — pick the first available entry
  const flavorEntry = species.flavor_text_entries.find(
    (e) => e.language.name === 'en',
  );
  const description = flavorEntry
    ? flavorEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    : '';

  const evolutionStage = await getEvolutionStage(species.evolves_from_species);

  return {
    id: raw.id,
    name: raw.name,
    sprite,
    types,
    stats: {
      hp: statsMap['hp'] ?? 0,
      attack: statsMap['attack'] ?? 0,
      defense: statsMap['defense'] ?? 0,
      spAtk: statsMap['special-attack'] ?? 0,
      spDef: statsMap['special-defense'] ?? 0,
      speed: statsMap['speed'] ?? 0,
    },
    abilities: raw.abilities.map((a) => a.ability.name),
    height: raw.height,
    weight: raw.weight,
    generation: parseGeneration(species.generation.name),
    color: species.color.name,
    eggGroups: species.egg_groups.map((g) => g.name),
    evolutionStage,
    description,
    moves: [],
    evolutionChain: [],
  };
}
