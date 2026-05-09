import type { PokemonSummary, PokemonDetail } from './pokemon';

// --- Wordle ---
export type WordleMode = 'stats' | 'attributes';

export type StatFeedback = 'higher' | 'lower' | 'correct';
export type AttributeFeedback = 'correct' | 'partial' | 'incorrect';

export interface StatsFeedbackRow {
  mode: 'stats';
  guessedPokemon: PokemonSummary;
  hp: StatFeedback;
  attack: StatFeedback;
  defense: StatFeedback;
  spAtk: StatFeedback;
  spDef: StatFeedback;
  speed: StatFeedback;
}

export interface AttributesFeedbackRow {
  mode: 'attributes';
  guessedPokemon: PokemonSummary;
  // values shown in the cell
  guessedValues: {
    type1: string | null;
    type2: string | null;
    generation: number;
    color: string;
    eggGroup: string;
    evolutionStage: number;
  };
  type1: AttributeFeedback;
  type2: AttributeFeedback;
  generation: AttributeFeedback;
  color: AttributeFeedback;
  eggGroup: AttributeFeedback;
  evolutionStage: AttributeFeedback;
}

export type FeedbackRow = StatsFeedbackRow | AttributesFeedbackRow;

export interface WordleSessionStats {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
}

export interface WordleGameState {
  mode: WordleMode;
  mysteryPokemon: PokemonDetail | null;
  guesses: FeedbackRow[];
  status: 'idle' | 'playing' | 'won' | 'lost';
  generationFilter: number[];
  sessionStats: WordleSessionStats;
  hint1Used: boolean; // show mystery Pokémon attribute values
  hint2Used: boolean; // show one fact (description)
}

// --- Who's That Pokémon ---
export interface WTPGameState {
  mysteryPokemon: PokemonDetail | null;
  guessesRemaining: number; // max 3
  status: 'playing' | 'won' | 'lost';
  sessionScore: number;
  roundCount: number;
}

// --- Partial Image ---
export interface PartialImageGameState {
  mysteryPokemon: PokemonDetail | null;
  revealStep: number; // 0–4; each wrong guess increments
  status: 'playing' | 'won' | 'lost';
  sessionScore: number;
  roundCount: number;
}

// --- Team Builder ---
export interface TeamMember {
  pokemon: PokemonDetail;
  /** Optional held item name (free text, session-only). */
  heldItem?: string;
}

export interface SynergyBreakdown {
  coverageBreadth: number;       // 0–40 pts
  sharedWeaknessPenalty: number; // 0–30 pts (subtracted)
  roleDiversity: number;         // 0–30 pts
  total: number;                 // 0–100
}

export interface TeamBuilderState {
  members: TeamMember[];         // max 6
  tournamentMode: boolean;
  synergyScore: SynergyBreakdown | null;
  tournamentScore: number | null;
}
