import { fetchPokemon, fetchPokemonSpecies, fetchMove, fetchEvolutionChain } from './pokeapi';
import type { RawEvolutionChainLink } from './pokeapi';
import type { PokemonDetail, MoveEntry, EvolutionNode, PokemonVariant, VariantKind, PokemonType } from '@/shared/types/pokemon';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseGeneration(genName: string): number {
  const map: Record<string, number> = {
    'generation-i': 1, 'generation-ii': 2, 'generation-iii': 3,
    'generation-iv': 4, 'generation-v': 5, 'generation-vi': 6,
    'generation-vii': 7, 'generation-viii': 8, 'generation-ix': 9,
  };
  return map[genName] ?? 0;
}

function extractEvolutionChainId(url: string): number {
  const m = url.match(/\/evolution-chain\/(\d+)\//);
  return m ? parseInt(m[1], 10) : 0;
}

function extractSpeciesId(url: string): number {
  const m = url.match(/\/pokemon-species\/(\d+)\//);
  return m ? parseInt(m[1], 10) : 0;
}

function extractPokemonId(url: string): number {
  const m = url.match(/\/pokemon\/(\d+)\//);
  return m ? parseInt(m[1], 10) : 0;
}

function classifyVariant(name: string): VariantKind {
  if (/-mega$|-mega-x$|-mega-y$/.test(name)) return 'mega';
  if (/-gmax$/.test(name)) return 'gmax';
  if (/-dmax$/.test(name)) return 'dmax';
  if (/-alola$|-galar$|-hisui$|-paldea$|-alolan$|-galarian$|-hisuian$|-paldean$/.test(name)) return 'regional';
  return 'other';
}

const COSTUME_PATTERN = /-(?:original|alola-cap|hoenn-cap|sinnoh-cap|unova-cap|kalos-cap|partner-cap|world-cap|starter|belle|libre|phd|pop-star|rock-star|cosplay|totem|own-tempo|busted|hangry|noice|gulping|gorging|rapid-strike|single-strike|ice-rider|shadow-rider|eternamax|primal|ash|pikachu-cap|pikachu-original|pikachu-hoenn|pikachu-sinnoh|pikachu-unova|pikachu-kalos|pikachu-alola|pikachu-partner|pikachu-world)$/;

function parseVariants(varieties: Array<{ is_default: boolean; pokemon: { name: string; url: string } }>): PokemonVariant[] {
  return varieties
    .filter((v) => !v.is_default)
    .map((v) => ({ name: v.pokemon.name, id: extractPokemonId(v.pokemon.url), kind: classifyVariant(v.pokemon.name) }))
    .filter((v) => v.id > 0 && v.kind !== 'other' && !COSTUME_PATTERN.test(v.name));
}

async function fetchVariantsForNode(
  speciesName: string,
  cache: Map<string, PokemonVariant[]>,
): Promise<PokemonVariant[]> {
  if (cache.has(speciesName)) return cache.get(speciesName)!;
  try {
    const s = await fetchPokemonSpecies(speciesName);
    const variants = parseVariants(s.varieties).filter((v) => v.kind === 'regional');
    cache.set(speciesName, variants);
    return variants;
  } catch {
    cache.set(speciesName, []);
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

function deriveEvolutionStage(chain: EvolutionNode[], targetId: number): number {
  function search(node: EvolutionNode, depth: number): number {
    if (node.id === targetId) return depth;
    for (const child of node.children) {
      const found = search(child, depth + 1);
      if (found > 0) return found;
    }
    return 0;
  }
  return chain.length === 0 ? 1 : (search(chain[0], 1) || 1);
}

// ── Move cache (module-level, persists across navigations) ───────────────────

const moveCache = new Map<string, MoveEntry>();

// ── Core detail (fast — no moves) ────────────────────────────────────────────

export async function buildPokemonCore(nameOrId: string | number): Promise<PokemonDetail> {
  const raw = await fetchPokemon(nameOrId);
  const species = await fetchPokemonSpecies(raw.species.name);

  const sprite =
    raw.sprites.other['official-artwork'].front_default ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`;

  const statsMap: Record<string, number> = {};
  for (const s of raw.stats) statsMap[s.stat.name] = s.base_stat;
  const types = raw.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name) as PokemonType[];

  const flavorEntry = species.flavor_text_entries.find((e) => e.language.name === 'en');
  const description = flavorEntry ? flavorEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ') : '';

  const variantCache = new Map<string, PokemonVariant[]>();
  const currentForms = parseVariants(species.varieties);
  variantCache.set(species.name, currentForms.filter((v) => v.kind === 'regional'));

  const evolutionChain = await (async (): Promise<EvolutionNode[]> => {
    try {
      const chainId = extractEvolutionChainId(species.evolution_chain.url);
      if (chainId <= 0) return [];
      const rawChain = await fetchEvolutionChain(chainId);
      const root = flattenChain(rawChain.chain, true);
      const allNodes: EvolutionNode[] = [];
      function collectNodes(n: EvolutionNode) { allNodes.push(n); n.children.forEach(collectNodes); }
      collectNodes(root);
      await Promise.all(allNodes.map(async (node) => {
        node.variants = await fetchVariantsForNode(node.name, variantCache);
      }));
      return [root];
    } catch { return []; }
  })();

  const forms = currentForms.filter((v) => v.kind !== 'other');
  const evolutionStage = deriveEvolutionStage(evolutionChain, raw.id);

  // Store raw move metadata on the detail so moves can be fetched separately
  // We attach it as a non-rendered field used by buildPokemonMoves
  const rawMovesMeta = raw.moves;

  const detail: PokemonDetail & { _rawMoves?: typeof rawMovesMeta } = {
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
    evolutionStage, description,
    moves: [], // populated separately
    evolutionChain, forms,
    _rawMoves: rawMovesMeta,
  };

  return detail;
}

// ── Moves (slow — fetches each move individually, cached) ────────────────────

export async function buildPokemonMoves(
  rawMoves: Array<{
    move: { name: string };
    version_group_details: Array<{ level_learned_at: number; move_learn_method: { name: string } }>;
  }>,
): Promise<MoveEntry[]> {
  const METHOD_PRIORITY: Record<string, number> = { 'level-up': 0, 'machine': 1, 'egg': 2, 'tutor': 3 };

  const bestMap = new Map<string, { name: string; learnMethod: string; levelLearnedAt: number }>();
  for (const m of rawMoves) {
    const vgd = m.version_group_details[0];
    if (!vgd) continue;
    const method = vgd.move_learn_method.name;
    const level = vgd.level_learned_at;
    const existing = bestMap.get(m.move.name);
    const priority = METHOD_PRIORITY[method] ?? 99;
    if (!existing || priority < (METHOD_PRIORITY[existing.learnMethod] ?? 99)) {
      bestMap.set(m.move.name, { name: m.move.name, learnMethod: method, levelLearnedAt: level });
    }
  }

  const entries = Array.from(bestMap.values());
  const toFetch = entries.filter((e) => !moveCache.has(e.name));

  // All uncached moves in parallel — browser connection pool handles throttling
  await Promise.allSettled(
    toFetch.map(async (meta) => {
      try {
        const mv = await fetchMove(meta.name);
        const effectEntry = mv.effect_entries.find((e) => e.language.name === 'en');
        moveCache.set(meta.name, {
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
      } catch { /* skip */ }
    }),
  );

  return entries.flatMap((meta) => {
    const cached = moveCache.get(meta.name);
    if (!cached) return [];
    return [{ ...cached, learnMethod: meta.learnMethod, levelLearnedAt: meta.levelLearnedAt }];
  });
}

// ── Legacy combined builder (kept for compatibility) ─────────────────────────

export async function buildPokemonDetail(nameOrId: string | number): Promise<PokemonDetail> {
  const core = await buildPokemonCore(nameOrId) as PokemonDetail & { _rawMoves?: unknown[] };
  const rawMoves = core._rawMoves as Parameters<typeof buildPokemonMoves>[0] | undefined;
  if (rawMoves) {
    core.moves = await buildPokemonMoves(rawMoves);
    delete core._rawMoves;
  }
  return core;
}
