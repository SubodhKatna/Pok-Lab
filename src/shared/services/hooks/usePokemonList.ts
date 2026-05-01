import { useQuery } from '@tanstack/react-query';
import { fetchPokemonList } from '../pokeapi';
import type { PokemonSummary } from '@/shared/types/pokemon';

/**
 * Fetches the full Pokémon list once per session and maps each entry to a
 * `PokemonSummary`. The National Pokédex ID is extracted from the entry URL.
 *
 * `staleTime: Infinity` — data is never considered stale within the session,
 * so no background re-fetches occur.
 */
export function usePokemonList() {
  return useQuery<PokemonSummary[]>({
    queryKey: ['pokemon-list'],
    queryFn: async () => {
      const entries = await fetchPokemonList();
      return entries.map((entry) => {
        // URL format: https://pokeapi.co/api/v2/pokemon/25/
        const segments = entry.url.replace(/\/$/, '').split('/');
        const id = Number(segments[segments.length - 1]);
        return {
          id,
          name: entry.name,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        };
      });
    },
    staleTime: Infinity,
  });
}
