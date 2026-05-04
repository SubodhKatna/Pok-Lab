import { useQuery } from '@tanstack/react-query';
import { fetchMove } from '../pokeapi';
import type { RawMove } from '../pokeapi';

/**
 * Fetches move data (type, damage class, power, accuracy, PP) by move name or ID.
 *
 * `staleTime: Infinity` — data is never considered stale within the session,
 * so no background re-fetches occur.
 *
 * Pass `undefined` or `null` as `name` to disable the query.
 */
export function useMoveDetails(name: string | number | null | undefined) {
  return useQuery<RawMove>({
    queryKey: ['move', name],
    queryFn: () => fetchMove(name as string | number),
    enabled: name != null && name !== '',
    staleTime: Infinity,
  });
}
