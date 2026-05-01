import { useQuery } from '@tanstack/react-query';
import { fetchPokemon } from '../pokeapi';
import type { PokemonSummary } from '@/shared/types/pokemon';

/**
 * Fetches a single Pokémon by name or National Pokédex ID and maps the raw
 * response to a `PokemonSummary`.
 *
 * `staleTime: Infinity` — data is never considered stale within the session,
 * so no background re-fetches occur.
 *
 * Pass `undefined` or `null` as `nameOrId` to disable the query.
 */
export function usePokemon(nameOrId: string | number | null | undefined) {
  return useQuery<PokemonSummary>({
    queryKey: ['pokemon', nameOrId],
    queryFn: async () => {
      // queryFn is only called when nameOrId is defined (see `enabled` below)
      const raw = await fetchPokemon(nameOrId as string | number);
      const sprite =
        raw.sprites.other['official-artwork'].front_default ??
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${raw.id}.png`;
      return {
        id: raw.id,
        name: raw.name,
        sprite,
      };
    },
    enabled: nameOrId != null && nameOrId !== '',
    staleTime: Infinity,
  });
}
