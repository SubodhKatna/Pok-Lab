import { useQuery } from '@tanstack/react-query';
import { fetchItemList } from '@/shared/services/pokeapi';
import type { ItemListEntry } from '@/shared/services/pokeapi';

/**
 * Fetches and caches the full list of holdable items from PokeAPI.
 * staleTime: Infinity — fetched once per session, never re-fetched.
 */
export function useItemList() {
  return useQuery<ItemListEntry[]>({
    queryKey: ['item-list'],
    queryFn: fetchItemList,
    staleTime: Infinity,
  });
}
