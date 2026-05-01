const BASE = 'https://pokeapi.co/api/v2';

/** Structured error thrown on non-2xx responses */
export interface PokeAPIError {
  status: number;
  message: string;
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
