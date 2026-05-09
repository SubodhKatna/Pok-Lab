import type { PokemonType } from '@/shared/types/pokemon';
import type { TeamMember, SynergyBreakdown } from '@/shared/types/game-state';
import { ALL_TYPES } from '@/features/pokedex/logic';

// ── Type effectiveness chart (attacking → defending) ──────────────────────────
// Used to compute offensive coverage: which defending types does this team cover?
const TYPE_CHART: Partial<Record<PokemonType, Partial<Record<PokemonType, number>>>> = {
  normal:   { rock: 0.5, ghost: 0, steel: 0.5 },
  fire:     { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water:    { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass:    { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice:      { water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison:   { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground:   { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying:   { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic:  { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug:      { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock:     { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost:    { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon:   { dragon: 2, steel: 0.5, fairy: 0 },
  dark:     { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel:    { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy:    { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Compute the combined defensive multiplier for each attacking type
 * against a Pokémon with the given defending types.
 */
function defenseMultiplier(attackType: PokemonType, defenderTypes: PokemonType[]): number {
  let mult = 1;
  for (const defType of defenderTypes) {
    const row = TYPE_CHART[attackType];
    const val = row?.[defType];
    if (val !== undefined) mult *= val;
  }
  return mult;
}

/**
 * Returns the set of attacking types that deal super-effective (>1×) damage
 * against a Pokémon with the given types.
 */
export function weaknessesOf(types: PokemonType[]): Set<PokemonType> {
  const result = new Set<PokemonType>();
  for (const atkType of ALL_TYPES) {
    if (defenseMultiplier(atkType, types) > 1) {
      result.add(atkType);
    }
  }
  return result;
}

/**
 * Returns the set of defending types that this Pokémon's types cover offensively
 * (i.e., at least one of its types deals super-effective damage against that defending type).
 */
export function offensiveCoverageOf(types: PokemonType[]): Set<PokemonType> {
  const covered = new Set<PokemonType>();
  for (const defType of ALL_TYPES) {
    for (const atkType of types) {
      const row = TYPE_CHART[atkType];
      const mult = row?.[defType] ?? 1;
      if (mult > 1) {
        covered.add(defType);
        break;
      }
    }
  }
  return covered;
}

/**
 * Classify a Pokémon into role buckets based on its stats and moves.
 *
 * Role buckets:
 *   - fast-attacker: speed ≥ 100
 *   - bulky-attacker: attack or spAtk is high but not a wall
 *   - wall: def + spDef ≥ 200
 *   - support: has status moves
 */
function classifyRoles(member: TeamMember): Set<string> {
  const roles = new Set<string>();
  const { stats, moves } = member.pokemon;

  if (stats.speed >= 100) roles.add('fast-attacker');
  if (stats.defense + stats.spDef >= 200) roles.add('wall');
  if (moves.some((m) => m.category === 'status')) roles.add('support');
  // bulky-attacker: high offensive stat but not a wall
  if (!roles.has('wall') && (stats.attack >= 90 || stats.spAtk >= 90)) {
    roles.add('bulky-attacker');
  }

  return roles;
}

/**
 * Classify speed tier: 0 = slow (<60), 1 = mid (60–99), 2 = fast (≥100).
 */
function speedTier(speed: number): number {
  if (speed >= 100) return 2;
  if (speed >= 60) return 1;
  return 0;
}

/**
 * Compute the synergy score breakdown for a team.
 *
 * Algorithm:
 *   coverageBreadth  = (unique offensive types covered / 18) × 40
 *   sharedWeaknessPenalty = min(sharedWeaknessCount × 5, 30)
 *   roleDiversity    = (unique speed tiers + unique role buckets) / maxRoles × 30
 *   synergyScore     = coverageBreadth - sharedWeaknessPenalty + roleDiversity
 *
 * Returns null if fewer than 2 members.
 *
 * Validates: Requirements 8.4, 8.5
 */
export function computeSynergyScore(members: TeamMember[]): SynergyBreakdown | null {
  if (members.length < 2) return null;

  // ── Coverage breadth ──────────────────────────────────────────────────────
  const allCovered = new Set<PokemonType>();
  for (const m of members) {
    for (const t of offensiveCoverageOf(m.pokemon.types)) {
      allCovered.add(t);
    }
  }
  const coverageBreadth = (allCovered.size / 18) * 40;

  // ── Shared weakness penalty ───────────────────────────────────────────────
  // Count types that are a weakness for ALL members (shared weakness)
  let sharedWeaknessCount = 0;
  for (const atkType of ALL_TYPES) {
    const allWeak = members.every((m) => weaknessesOf(m.pokemon.types).has(atkType));
    if (allWeak) sharedWeaknessCount++;
  }
  const sharedWeaknessPenalty = Math.min(sharedWeaknessCount * 5, 30);

  // ── Role diversity ────────────────────────────────────────────────────────
  const uniqueSpeedTiers = new Set(members.map((m) => speedTier(m.pokemon.stats.speed)));
  const uniqueRoleBuckets = new Set<string>();
  for (const m of members) {
    for (const role of classifyRoles(m)) {
      uniqueRoleBuckets.add(role);
    }
  }
  // maxRoles = 3 speed tiers + 4 role buckets = 7
  const maxRoles = 7;
  const roleDiversity = ((uniqueSpeedTiers.size + uniqueRoleBuckets.size) / maxRoles) * 30;

  const raw = coverageBreadth - sharedWeaknessPenalty + roleDiversity;
  const total = Math.min(100, Math.max(0, Math.round(raw)));

  return {
    coverageBreadth: Math.round(coverageBreadth),
    sharedWeaknessPenalty: Math.round(sharedWeaknessPenalty),
    roleDiversity: Math.round(roleDiversity),
    total,
  };
}

/**
 * Compute a VGC tournament viability score (0–100) for the team.
 *
 * Criteria checked:
 *   1. Species clause: no duplicate Pokémon (by id)          — 25 pts
 *   2. Team size is 4–6 (VGC standard)                       — 20 pts
 *   3. No more than 2 restricted (legendary/mythical) Pokémon — 25 pts
 *      (uses is_legendary / is_mythical flags stored on PokemonDetail via species)
 *   4. Type diversity: ≥ 4 unique types across the team       — 15 pts
 *   5. Speed spread: at least 2 different speed tiers         — 15 pts
 *
 * Returns null if team is empty.
 *
 * Validates: Requirements 8.6
 */
export function computeTournamentScore(members: TeamMember[]): number | null {
  if (members.length === 0) return null;

  let score = 0;

  // 1. Species clause — no duplicate IDs
  const ids = members.map((m) => m.pokemon.id);
  const uniqueIds = new Set(ids);
  if (uniqueIds.size === ids.length) score += 25;

  // 2. Team size 4–6
  if (members.length >= 4 && members.length <= 6) score += 20;
  else if (members.length === 3) score += 10;

  // 3. Restricted Pokémon check — legendary/mythical
  // PokemonDetail doesn't carry is_legendary/is_mythical directly; we approximate
  // using base stat total as a proxy (BST ≥ 580 is a common legendary threshold).
  // This is a best-effort heuristic since species endpoint data isn't stored on PokemonDetail.
  const restrictedCount = members.filter((m) => {
    const { hp, attack, defense, spAtk, spDef, speed } = m.pokemon.stats;
    const bst = hp + attack + defense + spAtk + spDef + speed;
    return bst >= 580;
  }).length;
  if (restrictedCount <= 2) score += 25;
  else if (restrictedCount === 3) score += 10;

  // 4. Type diversity — at least 4 unique types
  const allTypes = new Set<PokemonType>();
  for (const m of members) {
    for (const t of m.pokemon.types) allTypes.add(t);
  }
  if (allTypes.size >= 4) score += 15;
  else if (allTypes.size === 3) score += 8;

  // 5. Speed spread — at least 2 different speed tiers
  const tiers = new Set(members.map((m) => speedTier(m.pokemon.stats.speed)));
  if (tiers.size >= 2) score += 15;
  else if (tiers.size === 1) score += 5;

  return Math.min(100, score);
}

/**
 * Compute the team's type coverage grid for display.
 *
 * Returns two maps:
 *   - offense: for each defending type, the best multiplier the team can deal
 *   - defense: for each attacking type, the combined multiplier against the team
 *     (averaged across members, or worst-case)
 */
export interface TeamCoverageGrid {
  /** Best offensive multiplier the team can deal against each defending type. */
  offense: Record<PokemonType, number>;
  /**
   * For each attacking type, how many team members are weak (>1×), neutral (1×),
   * resistant (<1×, >0), or immune (0×).
   */
  defense: Record<PokemonType, { weak: number; neutral: number; resist: number; immune: number }>;
}

export function computeTeamCoverage(members: TeamMember[]): TeamCoverageGrid {
  const offense = {} as Record<PokemonType, number>;
  const defense = {} as Record<PokemonType, { weak: number; neutral: number; resist: number; immune: number }>;

  for (const defType of ALL_TYPES) {
    let best = 1;
    for (const m of members) {
      for (const atkType of m.pokemon.types) {
        const row = TYPE_CHART[atkType];
        const mult = row?.[defType] ?? 1;
        if (mult > best) best = mult;
      }
    }
    offense[defType] = best;
  }

  for (const atkType of ALL_TYPES) {
    const counts = { weak: 0, neutral: 0, resist: 0, immune: 0 };
    for (const m of members) {
      const mult = defenseMultiplier(atkType, m.pokemon.types);
      if (mult === 0) counts.immune++;
      else if (mult < 1) counts.resist++;
      else if (mult > 1) counts.weak++;
      else counts.neutral++;
    }
    defense[atkType] = counts;
  }

  return { offense, defense };
}
