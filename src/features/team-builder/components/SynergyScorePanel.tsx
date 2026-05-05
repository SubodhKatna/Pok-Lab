import { useState } from 'react';
import { FiChevronDown, FiZap } from 'react-icons/fi';
import type { SynergyBreakdown, TeamMember } from '@/shared/types/game-state';
import { useAIAnalysis } from '@/shared/services/hooks/useAIAnalysis';
import type { AIAnalysisSection as AnalysisSection } from '@/shared/services/gemini';

interface SynergyScorePanelProps {
  synergyScore: SynergyBreakdown | null;
  tournamentMode: boolean;
  tournamentScore: number | null;
  memberCount: number;
  members: TeamMember[];
}

/** Letter grade based on score. */
function letterGrade(score: number): string {
  if (score >= 90) return 'S';
  if (score >= 70) return 'A';
  if (score >= 50) return 'B';
  if (score >= 30) return 'C';
  return 'D';
}

/** Ring + text color based on score tier. */
function scoreTierClasses(score: number): {
  ring: string;
  text: string;
  grade: string;
  glow: string;
} {
  if (score >= 70) {
    return {
      ring: 'border-emerald-400',
      text: 'text-emerald-400',
      grade: 'text-emerald-300 bg-emerald-400/10 border-emerald-500/30',
      glow: 'shadow-[0_0_20px_4px_rgba(52,211,153,0.2)]',
    };
  }
  if (score >= 40) {
    return {
      ring: 'border-yellow-400',
      text: 'text-yellow-400',
      grade: 'text-yellow-300 bg-yellow-400/10 border-yellow-500/30',
      glow: 'shadow-[0_0_20px_4px_rgba(250,204,21,0.2)]',
    };
  }
  return {
    ring: 'border-red-400',
    text: 'text-red-400',
    grade: 'text-red-300 bg-red-400/10 border-red-500/30',
    glow: 'shadow-[0_0_20px_4px_rgba(248,113,113,0.2)]',
  };
}

/**
 * Displays the synergy score total and its three component breakdowns,
 * a full text analysis, and optionally the tournament score.
 */
export function SynergyScorePanel({
  synergyScore,
  tournamentMode,
  tournamentScore,
  memberCount,
  members,
}: SynergyScorePanelProps) {
  const [showInfo, setShowInfo] = useState(false);

  const {
    data: aiData,
    isLoading: aiLoading,
    isError: aiError,
    refetch: retryAnalysis,
  } = useAIAnalysis(members, synergyScore);

  if (memberCount < 2) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 text-center backdrop-blur-sm">
        <span className="text-3xl">⚔️</span>
        <p className="text-sm font-medium text-zinc-500">Add at least 2 Pokémon</p>
        <p className="text-xs text-zinc-700">to see the synergy score</p>
      </div>
    );
  }

  if (!synergyScore) return null;

  const { coverageBreadth, sharedWeaknessPenalty, roleDiversity, total } = synergyScore;
  const tier = scoreTierClasses(total);
  const grade = letterGrade(total);

  return (
    <div className="flex flex-col gap-0 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-sm">

      {/* ── Score hero ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 px-5 py-5">
        {/* Ring */}
        <div
          className={`relative flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full border-[3px] ${tier.ring} ${tier.glow} transition-all duration-500`}
          aria-label={`Synergy score: ${total}`}
        >
          <div className="flex flex-col items-center leading-none">
            <span className={`text-2xl font-black tabular-nums ${tier.text}`}>{total}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-zinc-600">/ 100</span>
          </div>
        </div>

        {/* Grade + label */}
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">Synergy Score</p>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xl font-black ${tier.grade}`}>
              {grade}
            </span>
            <span className="text-xs text-zinc-500">
              {grade === 'S' && 'Exceptional'}
              {grade === 'A' && 'Strong'}
              {grade === 'B' && 'Decent'}
              {grade === 'C' && 'Needs work'}
              {grade === 'D' && 'Poor synergy'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Breakdown bars ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-zinc-800/60 px-5 py-4">
        <BarRow
          label="Coverage Breadth"
          tooltip="How many of the 18 types your team can hit super-effectively"
          value={`+${coverageBreadth}`}
          valueColor="text-sky-400"
          barValue={coverageBreadth}
          barMax={40}
          gradient="bg-gradient-to-r from-sky-700 to-sky-400"
          glow="shadow-[0_0_6px_1px_rgba(56,189,248,0.35)]"
        />
        <BarRow
          label="Shared Weakness Penalty"
          tooltip="Deducted for types that all team members are weak to"
          value={`−${sharedWeaknessPenalty}`}
          valueColor="text-red-400"
          barValue={sharedWeaknessPenalty}
          barMax={30}
          gradient="bg-gradient-to-r from-red-800 to-red-500"
          glow="shadow-[0_0_6px_1px_rgba(239,68,68,0.35)]"
        />
        <BarRow
          label="Role Diversity"
          tooltip="Bonus for varied speed tiers and archetypes (attacker, wall, support)"
          value={`+${roleDiversity}`}
          valueColor="text-violet-400"
          barValue={roleDiversity}
          barMax={30}
          gradient="bg-gradient-to-r from-violet-800 to-violet-400"
          glow="shadow-[0_0_6px_1px_rgba(167,139,250,0.35)]"
        />
      </div>

      {/* ── Team Analysis (AI) ───────────────────────────────────────── */}
      <div className="border-t border-zinc-800/60 px-5 py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FiZap size={11} className="text-violet-400" />
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">AI Analysis</p>
          </div>
          {(aiData || aiError) && (
            <button
              onClick={() => void retryAnalysis()}
              disabled={aiLoading}
              className="text-[10px] text-zinc-600 underline hover:text-zinc-400 transition-colors disabled:opacity-40"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Idle — show trigger button */}
        {!aiData && !aiLoading && !aiError && (
          <button
            onClick={() => void retryAnalysis()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/25 bg-violet-500/8 px-4 py-3 text-sm font-semibold text-violet-400 transition-all duration-200 hover:border-violet-500/50 hover:bg-violet-500/15 hover:text-violet-300 active:scale-[0.98]"
          >
            <FiZap size={14} />
            Analyse with AI
          </button>
        )}

        {/* Loading skeleton */}
        {aiLoading && (
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-800" />
                <div className="h-8 animate-pulse rounded bg-zinc-800/60" style={{ animationDelay: `${i * 80}ms` }} />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {aiError && !aiLoading && (
          <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-3 text-[11px] text-red-400">
            Request failed — check your API key or try again in a moment.
          </div>
        )}

        {/* Results */}
        {aiData && !aiLoading && (
          <div className="flex flex-col gap-3.5">
            {aiData.sections.map((section) => (
              <AnalysisBlock key={section.label} section={section} />
            ))}
          </div>
        )}
      </div>

      {/* ── How is this calculated? ──────────────────────────────────── */}
      <div className="border-t border-zinc-800/60">
        <button
          onClick={() => setShowInfo((v) => !v)}
          className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-zinc-800/30"
          aria-expanded={showInfo}
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-600">
            How is this calculated?
          </span>
          <FiChevronDown
            size={12}
            className={`text-zinc-600 transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`}
          />
        </button>

        {showInfo && (
          <div className="border-t border-zinc-800/60 px-5 pb-4 pt-3 flex flex-col gap-2.5 text-[11px] text-zinc-500 leading-relaxed">
            <p>
              The <span className="font-semibold text-zinc-300">Synergy Score</span> (0–100) measures how well your team's types, roles, and speed tiers complement each other.
            </p>
            <div className="flex flex-col gap-1.5">
              <InfoRow color="bg-sky-400"    label="Coverage Breadth (+0–40)"         detail="Types your team can hit super-effectively. More = higher score." />
              <InfoRow color="bg-red-500"    label="Shared Weakness Penalty (−0–30)"  detail="−5 pts per type that all members are weak to, capped at 30." />
              <InfoRow color="bg-violet-400" label="Role Diversity (+0–30)"           detail="Bonus for mixing speed tiers and archetypes (attacker, wall, support)." />
            </div>
            <p className="text-zinc-700 italic">Formula: Coverage − Penalty + Diversity, clamped to [0, 100].</p>
          </div>
        )}
      </div>

      {/* ── Tournament score ─────────────────────────────────────────── */}
      {tournamentMode && tournamentScore !== null && (
        <div className="flex items-center gap-3 border-t border-zinc-800/60 bg-violet-950/20 px-5 py-3">
          <span className="shrink-0 rounded-md border border-violet-500/30 bg-violet-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-violet-400">
            ⚔️ VGC
          </span>
          <span className="flex-1 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Tournament Score
          </span>
          <span
            className={`text-xl font-black tabular-nums ${
              tournamentScore >= 70 ? 'text-emerald-400' : tournamentScore >= 40 ? 'text-yellow-400' : 'text-red-400'
            }`}
          >
            {tournamentScore}
          </span>
        </div>
      )}
    </div>
  );
}

interface BarRowProps {
  label: string;
  tooltip: string;
  value: string;
  valueColor: string;
  barValue: number;
  barMax: number;
  gradient: string;
  glow: string;
}

function BarRow({ label, tooltip, value, valueColor, barValue, barMax, gradient, glow }: BarRowProps) {
  const pct = Math.min(100, Math.max(0, Math.round((barValue / barMax) * 100)));
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-zinc-400">{label}</span>
          <span className="cursor-default text-zinc-700 hover:text-zinc-500 transition-colors text-[11px]" title={tooltip}>ⓘ</span>
        </div>
        <span className={`text-[11px] font-bold tabular-nums ${valueColor}`}>{value}</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ease-out ${gradient} ${glow}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function AnalysisBlock({ section }: { section: AnalysisSection }) {
  const sentimentStyles: Record<AnalysisSection['sentiment'], { dot: string; label: string }> = {
    good:    { dot: 'bg-emerald-400', label: 'text-emerald-400' },
    warn:    { dot: 'bg-yellow-400',  label: 'text-yellow-400' },
    bad:     { dot: 'bg-red-400',     label: 'text-red-400' },
    neutral: { dot: 'bg-zinc-500',    label: 'text-zinc-400' },
  };
  const s = sentimentStyles[section.sentiment];
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${s.dot}`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${s.label}`}>
          {section.label}
        </span>
      </div>
      <p className="pl-3 text-[11px] leading-relaxed text-zinc-400">{section.text}</p>
    </div>
  );
}

function InfoRow({ color, label, detail }: { color: string; label: string; detail: string }) {
  return (
    <div className="flex gap-2">
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${color}`} />
      <div>
        <span className="font-semibold text-zinc-300">{label}: </span>
        {detail}
      </div>
    </div>
  );
}
