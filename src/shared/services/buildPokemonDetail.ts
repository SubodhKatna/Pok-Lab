import { fetchPokemon, fetchPokemonSpecies, fetchMove, fetchEvolutionChain } from './pokeapi';
import type { RawEvolutionChainLink } from './pokeapi';
import type { PokemonDetail, MoveEntry, EvolutionNode, PokemonType } from '@/shared/types/pokemon';

function parseGeneration(genName: string): number {
  const map: Record<string, number> = {
    'generation-i': 1, 'generation-ii': 2, 'generation-iii': 3,
    'generation-iv': 4, 'generation-v': 5, 'generation-vi': 6,
    'generation-vii': 7, 'generation-viii': 8, 'generation-ix': 9,
  };
  return map[genName] ?? 0;
}

async function getEvolutionStage(evolvesFrom: { name: string } | null): Promise<number> {
  if (!evolvesFrom) return 1;
  try {
    const parentSpecies = await fetchPokemonSpecies(evolvesFrom.name);
    return parentSpecies.evolves_from_species ? 3 : 2;
  } catch { return 2; }
}

function extractEvolutionChainId(url: string): number {
  const match = url.match(/\/evolution-chain\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

function extractSpeciesId(url: string): number {
  const match = url.match(/\/pokemon-species\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

function extractPokemonId(url: string): number {
  const match = url.match(/\/pokemon\/(\d+)\//);
  return match ? parseInt(match[1], 10) : 0;
}

async function fetchVariants(speciesName: string): Promise<Array<{ name: string; id: number }>> {
  try {
    const species = await fetchPokemonSpecies(speciesName);
    return species.varieties
      .filter((v) => !v.is_default)
      .map((v) => ({
        name: v.pokemon.name,
        id: extractPokemonId(v.pokemon.url),
      }))
      .filter((v) => v.id > 0);
  } catch {
    return [];
  }
}

function flattenChain(link: RawEvolutionChainLink, isRoot = true): EvolutionNode {
  const detail = link.evolution_details[0];
  let trigger = '';
  if (detail) {
    if (detail.trigger.name === 'level-up' && detail.min_level) trigger = `Lv. ${detail.min_level}`;
    else if (detail.trigger.name === 'use-item' && detail.item) trigger = detail.item.name.replace(/-/g, ' ');
    else trigger = detail.trigger.name.replace(/-/g, ' ');
  }
  return {
    id: extractSpeciesId(link.species.url),
    name: link.species.name,
    trigger: isRoot ? '' : trigger,
    children: link.evolves_to.map((child) => flattenChain(child, false)),
  };
}


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

  const types = raw.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name) as PokemonType[];

  const flavorEntry = species.flavor_text_entries.find((e) => e.language.name === 'en');
  const description = flavorEntry
    ? flavorEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ')
    : '';

  // Deduplicate moves — keep best learn method per move
  const METHOD_PRIORITY: Record<string, number> = { 'level-up': 0, 'machine': 1, 'egg': 2, 'tutor': 3 };
  const bestMoveMap = new Map<string, { name: string; learnMethod: string; levelLearnedAt: number }>();
  for (const m of raw.moves) {
    const vgd = m.version_group_details[0];
    if (!vgd) continue;
    const method = vgd.move_learn_method.name;
    const level = vgd.level_learned_at;
    const existing = bestMoveMap.get(m.move.name);
    const priority = METHOD_PRIORITY[method] ?? 99;
    const existingPriority = existing ? (METHOD_PRIORITY[existing.learnMethod] ?? 99) : 999;
    if (!existing || priority < existingPriority) {
      bestMoveMap.set(m.move.name, { name: m.move.name, learnMethod: method, levelLearnedAt: level });
    }
  }

  // Fetch ALL moves in parallel batches of 20 to avoid overwhelming the API
  const moveEntries = Array.from(bestMoveMap.values());
  const BATCH = 20;
  const moves: MoveEntry[] = [];
  for (let i = 0; i < moveEntries.length; i += BATCH) {
    const batch = moveEntries.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map((m) => fetchMove(m.name).then((mv) => ({ mv, meta: m }))),
    );
    for (const r of results) {
      if (r.status !== 'fulfilled') continue;
      const { mv, meta } = r.value;
      const effectEntry = mv.effect_entries.find((e) => e.language.name === 'en');
      moves.push({
        name: mv.name,
        type: mv.type.name as PokemonType,
        category: mv.damage_class.name as MoveEntry['category'],
        power: mv.power,
        accuracy: mv.accuracy,
        pp: mv.pp,
        learnMethod: meta.learnMethod,
        levelLearnedAt: meta.levelLearnedAt,
        effect: effectEntry?.short_effect ?? '',
      });
    }
  }

  // Evolution chain — fetch variants for each node
  let evolutionChain: EvolutionNode[] = [];
  try {
    const chainId = extractEvolutionChainId(species.evolution_chain.url);
    if (chainId > 0) {
      const rawChain = await fetchEvolutionChain(chainId);
      const root = flattenChain(rawChain.chain, true);
      // Fetch variants for all nodes in parallel
      const allNodes: EvolutionNode[] = [];
      function collectNodes(node: EvolutionNode) {
        allNodes.push(node);
        node.children.forEach(collectNodes);
      }
      collectNodes(root);
      await Promise.all(
        allNodes.map(async (node) => {
          node.variants = await fetchVariants(node.name);
        }),
      );
      evolutionChain = [root];
    }
  } catch { evolutionChain = []; }

  const evolutionStage = await getEvolutionStage(species.evolves_from_species);

  return {
    id: raw.id, name: raw.name, sprite, types,
    stats: {
      hp: statsMap['hp'] ?? 0, attack: statsMap['attack'] ?? 0,
      defense: statsMap['defense'] ?? 0, spAtk: statsMap['special-attack'] ?? 0,
      spDef: statsMap['special-defense'] ?? 0, speed: statsMap['speed'] ?? 0,
    },
    abilities: raw.abilities.map((a) => ({ name: a.ability.name, isHidden: a.is_hidden })),
    height: raw.height, weight: raw.weight,
    generation: parseGeneration(species.generation.name),
    color: species.color.name,
    eggGroups: species.egg_groups.map((g) => g.name),
    evolutionStage, description, moves, evolutionChain,
  };
}
