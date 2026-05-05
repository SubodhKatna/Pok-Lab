import { useQuery } from '@tanstack/react-query';
import { fetchAIAnalysis } from '@/shared/services/gemini';
import type { TeamMember, SynergyBreakdown } from '@/shared/types/game-state';

/**
 * Fetches an AI-generated team analysis from Gemini.
 * Re-runs whenever the team composition or synergy score changes.
 * Disabled when fewer than 2 members or no score.
 */
export function useAIAnalysis(members: TeamMember[], score: SynergyBreakdown | null) {
  const key = members
    .map((m) => m.pokemon.id)
    .sort((a, b) => a - b)
    .join(',');

  return useQuery({
    queryKey: ['ai-analysis', key, score?.total ?? 0],
    queryFn: () => fetchAIAnalysis(members, score!),
    enabled: false,      // never auto-fetch — user must click the button
    staleTime: Infinity,
    retry: false,
  });
}
