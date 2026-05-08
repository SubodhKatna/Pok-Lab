import { useQuery } from '@tanstack/react-query';
import { fetchAISuggestions } from '@/shared/services/gemini';
import type { TeamMember, SynergyBreakdown } from '@/shared/types/game-state';

/**
 * Fetches AI-powered Pokémon suggestions from Gemini.
 * Disabled when team is empty, full, or no score available.
 */
export function useAISuggestions(members: TeamMember[], score: SynergyBreakdown | null) {
  const key = members
    .map((m) => m.pokemon.id)
    .sort((a, b) => a - b)
    .join(',');

  return useQuery({
    queryKey: ['ai-suggestions', key, score?.total ?? 0],
    queryFn: () => fetchAISuggestions(members, score!),
    enabled: false,      // never auto-fetch — user must click the button
    staleTime: Infinity,
    retry: false,
  });
}
