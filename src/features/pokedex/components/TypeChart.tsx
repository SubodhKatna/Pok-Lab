import { TypeBadge } from '@/shared/components/TypeBadge';
import { computeTypeEffectiveness, ALL_TYPES } from '../logic';
import type { PokemonType } from '@/shared/types/pokemon';

interface TypeChartProps {
  types: PokemonType[];
}

const MULT_STYLE: Record<number, { label: string; pill: string; row: string }> = {
  4:    { label: '4×',  pill: 'bg-red-600/30 border border-red-500/60 text-red-300 font-bold',      row: 'bg-red-950/30' },
  2:    { label: '2×',  pill: 'bg-orange-600/30 border border-orange-500/60 text-orange-300 font-bold', row: 'bg-orange-950/20' },
  1:    { label: '1×',  pill: 'bg-zinc-800/40 border border-zinc-700/40 text-zinc-500',              row: '' },
  0.5:  { label: '½×',  pill: 'bg-sky-700/30 border border-sky-600/60 text-sky-300 font-bold',       row: 'bg-sky-950/20' },
  0.25: { label: '¼×',  pill: 'bg-blue-800/40 border border-blue-700/60 text-blue-300 font-bold',    row: 'bg-blue-950/30' },
  0:    { label: '0×',  pill: 'bg-zinc-800/60 border border-zinc-700/50 text-zinc-500 font-bold',    row: 'bg-zinc-900/40' },
};

function computeOffensiveChart(attackerTypes: PokemonType[]): Record<PokemonType, number> {
  const result = {} as Record<PokemonType, number>;
  for (const defType of ALL_TYPES) {
    let best = 1;
    for (const atkType of attackerTypes) {
      const chart = computeTypeEffectiveness([defType]);
      const mult = chart[atkType] ?? 1;
      if (mult > best) best = mult;
    }
    result[defType] = best;
  }
  return result;
}

export function TypeChart({ types }: TypeChartProps) {
  const defChart = computeTypeEffectiveness(types);
  const offChart = computeOffensiveChart(types);

  return (
    <div className="flex flex-col gap-5">
      <ChartSection title="Offense" subtitle="Best damage dealt" chart={offChart} />
      <div className="border-t border-zinc-800" />
      <ChartSection title="Defense" subtitle="Damage taken" chart={defChart} />
    </div>
  );
}

function ChartSection({
  title,
  subtitle,
  chart,
}: {
  title: string;
  subtitle: string;
  chart: Record<PokemonType, number>;
}) {
  const order = [4, 2, 0.5, 0.25, 0, 1];
  const grouped = new Map<number, PokemonType[]>();
  for (const m of order) grouped.set(m, []);
  for (const t of ALL_TYPES) {
    const m = chart[t];
    const bucket = grouped.get(m);
    if (bucket) bucket.push(t);
    else grouped.set(m, [t]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1">
        <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">{title}</span>
        <span className="ml-2 text-[10px] text-zinc-500">{subtitle}</span>
      </div>
      {order.map((mult) => {
        const typesInGroup = grouped.get(mult) ?? [];
        if (typesInGroup.length === 0) return null;
        const style = MULT_STYLE[mult] ?? MULT_STYLE[1];
        return (
          <div key={mult} className={`flex items-start gap-2 rounded-lg px-2 py-1.5 ${style.row}`}>
            <span className={`mt-0.5 inline-flex w-9 shrink-0 items-center justify-center rounded px-1 py-0.5 text-[10px] tabular-nums ${style.pill}`}>
              {style.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {typesInGroup.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
