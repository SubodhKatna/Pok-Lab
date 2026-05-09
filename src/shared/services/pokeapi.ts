const BASE = 'https://pokeapi.co/api/v2';

/** Structured error thrown on non-2xx responses */
export interface PokeAPIError {
  status: number;
  message: string;
}

/** Raw shape returned by /pokemon-species/:nameOrId */
export interface RawSpecies {
  id: number;
  name: string;
  color: { name: string };
  egg_groups: Array<{ name: string }>;
  generation: { name: string }; // e.g. "generation-i"
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
    version: { name: string };
  }>;
  evolves_from_species: { name: string; url: string } | null;
  evolution_chain: { url: string };
  varieties: Array<{
    is_default: boolean;
    pokemon: { name: string; url: string };
  }>;
}

/** Raw shape returned by /pokemon/:nameOrId */
export interface RawPokemon {
  id: number;
  name: string;
  sprites: {
    other: {
      'official-artwork': {
        front_default: string | null;
      };
    };
  };
  types: Array<{
    slot: number;
    type: { name: string; url: string };
  }>;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
  height: number;
  weight: number;
  moves: Array<{
    move: { name: string; url: string };
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: { name: string };
    }>;
  }>;
}

/** Raw shape returned by /pokemon?limit=N */
export interface PokemonListEntry {
  name: string;
  url: string;
}

interface RawPokemonListResponse {
  count: number;
  results: PokemonListEntry[];
}

/** Raw shape returned by /move/:nameOrId */
export interface RawMove {
  id: number;
  name: string;
  type: { name: string };
  damage_class: { name: string }; // "physical" | "special" | "status"
  power: number | null;
  accuracy: number | null;
  pp: number;
  effect_entries: Array<{
    short_effect: string;
    language: { name: string };
  }>;
}

/** A single node in the evolution chain tree */
export interface RawEvolutionChainLink {
  species: { name: string; url: string };
  evolution_details: Array<{
    trigger: { name: string };
    min_level: number | null;
    item: { name: string } | null;
  }>;
  evolves_to: RawEvolutionChainLink[];
}

/** Raw shape returned by /evolution-chain/:id */
export interface RawEvolutionChain {
  id: number;
  chain: RawEvolutionChainLink;
}

/** Raw shape returned by /item?limit=N */
export interface ItemListEntry {
  name: string;
  url: string;
}

/** Raw shape returned by /item/:nameOrId */
export interface RawItem {
  id: number;
  name: string;
  sprites: { default: string | null };
  category: { name: string };
  effect_entries: Array<{
    short_effect: string;
    language: { name: string };
  }>;
}

async function apiFetch<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const error: PokeAPIError = {
      status: res.status,
      message: `PokeAPI request failed: ${res.status} ${res.statusText}`,
    };
    throw error;
  }
  return res.json() as Promise<T>;
}

/**
 * Fetch a single Pokémon by name or National Pokédex ID.
 * Throws a `PokeAPIError` on non-2xx responses.
 */
export async function fetchPokemon(nameOrId: string | number): Promise<RawPokemon> {
  return apiFetch<RawPokemon>(`${BASE}/pokemon/${nameOrId}`);
}

/**
 * Fetch species data (generation, color, egg groups, flavor text, evolution chain).
 * Throws a `PokeAPIError` on non-2xx responses.
 */
export async function fetchPokemonSpecies(nameOrId: string | number): Promise<RawSpecies> {
  return apiFetch<RawSpecies>(`${BASE}/pokemon-species/${nameOrId}`);
}

/**
 * Fetch the full Pokémon name+URL list.
 * Defaults to the first 1025 entries (all released Pokémon as of Gen 9).
 * Throws a `PokeAPIError` on non-2xx responses.
 */
export async function fetchPokemonList(limit = 1025): Promise<PokemonListEntry[]> {
  const data = await apiFetch<RawPokemonListResponse>(
    `${BASE}/pokemon?limit=${limit}&offset=0`,
  );
  return data.results;
}

/**
 * Fetch a single move by name or ID.
 * Throws a `PokeAPIError` on non-2xx responses.
 */
export async function fetchMove(nameOrId: string | number): Promise<RawMove> {
  return apiFetch<RawMove>(`${BASE}/move/${nameOrId}`);
}

/**
 * Fetch an evolution chain by its numeric ID.
 * Throws a `PokeAPIError` on non-2xx responses.
 */
export async function fetchEvolutionChain(id: number): Promise<RawEvolutionChain> {
  return apiFetch<RawEvolutionChain>(`${BASE}/evolution-chain/${id}`);
}

/**
 * Fetch all Pokémon IDs for a given type.
 * Returns an array of numeric IDs (only base forms, id <= 10000).
 */
export async function fetchPokemonIdsByType(typeName: string): Promise<number[]> {
  const data = await apiFetch<{ pokemon: Array<{ pokemon: { name: string; url: string } }> }>(
    `${BASE}/type/${typeName}`,
  );
  return data.pokemon
    .map((entry) => {
      const segments = entry.pokemon.url.replace(/\/$/, '').split('/');
      return Number(segments[segments.length - 1]);
    })
    .filter((id) => id > 0 && id <= 10000);
}

/**
 * Fetch the list of all hold items from PokeAPI.
 * Uses the "all-held-items" category which covers every item a Pokémon can hold.
 * Falls back to a broad item fetch filtered by holdable categories if needed.
 */
export async function fetchItemList(): Promise<ItemListEntry[]> {
  // PokeAPI item categories that represent holdable items
  const HOLD_CATEGORIES = [
    'held-items',
    'choice',
    'effort-training',
    'bad-held-items',
    'training',
    'plates',
    'species-specific',
    'type-enhancement',
    'mega-stones',
    'memories',
    'z-crystals',
    'jewels',
    'stat-boosts',
    'in-a-pinch',
    'other',
  ];

  const results = await Promise.allSettled(
    HOLD_CATEGORIES.map((cat) =>
      apiFetch<{ items: ItemListEntry[] }>(`${BASE}/item-category/${cat}`).then((d) => d.items),
    ),
  );

  const seen = new Set<string>();
  const items: ItemListEntry[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const item of r.value) {
        if (!seen.has(item.name)) {
          seen.add(item.name);
          items.push(item);
        }
      }
    }
  }

  // Sort alphabetically for consistent display
  items.sort((a, b) => a.name.localeCompare(b.name));
  return items;
}
