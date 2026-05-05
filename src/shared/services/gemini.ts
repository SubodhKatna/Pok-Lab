import type { TeamMember, SynergyBreakdown } from '@/shared/types/game-state';

// ── Client ────────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!key || key.trim() === '' || key === 'your_gemini_api_key_here') {
    throw new Error(
      'VITE_GEMINI_API_KEY is missing. Add it to poke-lab/.env and restart the dev server.',
    );
  }
  return key.trim();
}

/**
 * Call Gemini Flash via the REST API.
 * Uses fetch directly to avoid any SDK CORS issues in the browser.
 */
async function callGemini(prompt: string): Promise<string> {
  const key = getApiKey();

  // Updated URL using the rolling 'latest' alias
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${key}`;

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      // Increased to 8192 so the JSON does not get cut off!
      maxOutputTokens: 8192,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text.trim();
}

/** Strip markdown code fences the model sometimes wraps around JSON. */
function stripFences(text: string): string {
  // FIXED: Using \x60 instead of literal backticks so it doesn't break markdown parsers in chat UIs
  return text.replace(/^\x60\x60\x60(?:json)?\s*/i, '').replace(/\s*\x60\x60\x60$/i, '').trim();
}

// ── Team summary ──────────────────────────────────────────────────────────────

function buildTeamSummary(members: TeamMember[]): string {
  return members
    .map((m) => {
      const p = m.pokemon;
      const bst =
        p.stats.hp + p.stats.attack + p.stats.defense +
        p.stats.spAtk + p.stats.spDef + p.stats.speed;
      const item = m.heldItem ? ` @ ${m.heldItem}` : '';
      return `- ${p.name}${item} [${p.types.join('/')}] BST:${bst} HP:${p.stats.hp} Atk:${p.stats.attack} Def:${p.stats.defense} SpA:${p.stats.spAtk} SpD:${p.stats.spDef} Spe:${p.stats.speed}`;
    })
    .join('\n');
}

// ── Team Analysis ─────────────────────────────────────────────────────────────

export interface AIAnalysisSection {
  label: string;
  sentiment: 'good' | 'warn' | 'bad' | 'neutral';
  text: string;
}

export interface AIAnalysisResult {
  sections: AIAnalysisSection[];
}

export async function fetchAIAnalysis(
  members: TeamMember[],
  score: SynergyBreakdown,
): Promise<AIAnalysisResult> {
  const prompt = `
You are a competitive Pokémon team analyst. Analyse the following team and return a JSON object.

Team:
${buildTeamSummary(members)}

Synergy Score: ${score.total}/100
  Coverage Breadth: ${score.coverageBreadth}/40
  Shared Weakness Penalty: ${score.sharedWeaknessPenalty}/30
  Role Diversity: ${score.roleDiversity}/30

Return ONLY valid JSON matching this exact shape — no markdown, no explanation:
{
  "sections": [
    { "label": "Overall", "sentiment": "good", "text": "2-3 sentence verdict" },
    { "label": "Offensive Coverage", "sentiment": "warn", "text": "specific types not covered" },
    { "label": "Defensive Spread", "sentiment": "warn", "text": "shared weaknesses by name" },
    { "label": "Role Composition", "sentiment": "good", "text": "which Pokémon fill which roles" },
    { "label": "Speed Tier", "sentiment": "good", "text": "speed spread analysis" },
    { "label": "Competitive Tip", "sentiment": "neutral", "text": "one concrete actionable improvement" }
  ]
}

Rules:
- Be specific — name the Pokémon and types
- sentiment must be exactly one of: good, warn, bad, neutral
- Keep each text field to 2-3 sentences max
- Focus on competitive viability
`.trim();

  const raw = await callGemini(prompt);
  const parsed = JSON.parse(stripFences(raw)) as AIAnalysisResult;
  return parsed;
}

// ── AI Suggestions ────────────────────────────────────────────────────────────

export interface AISuggestion {
  name: string;
  reason: string;
  role: string;
}

export interface AISuggestionsResult {
  suggestions: AISuggestion[];
}

export async function fetchAISuggestions(
  members: TeamMember[],
  score: SynergyBreakdown,
): Promise<AISuggestionsResult> {
  const prompt = `
You are a competitive Pokémon team builder. Suggest 3 Pokémon additions to improve this team.

Current team:
${buildTeamSummary(members)}

Synergy Score: ${score.total}/100 (Coverage: ${score.coverageBreadth}/40, Weakness Penalty: ${score.sharedWeaknessPenalty}/30, Role Diversity: ${score.roleDiversity}/30)

Return ONLY valid JSON — no markdown, no explanation:
{
  "suggestions": [
    {
      "name": "exact-pokeapi-name-lowercase-with-hyphens",
      "reason": "1-2 sentences explaining why this Pokémon helps this specific team",
      "role": "Short role label e.g. Pivot, Wallbreaker, Hazard Setter, Revenge Killer, Cleric"
    }
  ]
}

Rules:
- name must be the exact PokeAPI slug (e.g. "garchomp", "iron-valiant", "great-tusk")
- Suggest Pokémon that address the team's specific weaknesses
- Prioritise competitive viability (OU/VGC usage)
- Do NOT suggest Pokémon already on the team
- Exactly 3 suggestions
`.trim();

  const raw = await callGemini(prompt);
  const parsed = JSON.parse(stripFences(raw)) as AISuggestionsResult;
  return parsed;
}