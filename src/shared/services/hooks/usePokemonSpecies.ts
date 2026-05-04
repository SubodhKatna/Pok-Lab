import { useQuery } from '@tanstack/react-query';
import { fetchPokemonSpecies } from '../pokeapi';
import type { RawSpecies } from '../pokeapi';

/**
 * Fetches species data (generation, color, egg groups, flavor text, evolution
 * chain URL) for a Pokémon by name or National Pokédex ID.
 *
 * `staleTime: Infinity` — data is never considered stale within the session,
 * so no background re-fetches occur.
 *
 * Pass `undefined` or `null` as `nameOrId` to disable the query.
 */
export function usePokemonSpecies(nameOrId: string | number | null | undefined) {
  return useQuery<RawSpecies>({
    queryKey: ['pokemon-species', nameOrId],
    queryFn: () => fetchPokemonSpecies(nameOrId as string | number),
    enabled: nameOrId != null && nameOrId !== '',
    staleTime: Infinity,
  });
}
