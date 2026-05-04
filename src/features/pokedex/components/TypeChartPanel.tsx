import { TypeBadge } from '@/shared/components/TypeBadge';
import { computeTypeEffectiveness, ALL_TYPES } from '../logic';
import type { PokemonType } from '@/shared/types/pokemon';

const MULT_STYLE: Record<number, { label: string; pill: string; row: string }> = {
  4:    { label: '4×',  pill: 'bg-red-700 border border-red-500 text-white font-bold',         row: 'bg-red-950/60' },
  2:    { label: '2×',  pill: 'bg-orange-700 border border-orange-500 text-white font-bold',   row: 'bg-orange-950/40' },
  1:    { label: '1×',  pill: 'bg-zinc-700 border border-zinc-600 text-zinc-300',              row: '' },
  0.5:  { label: '½×',  pill: 'bg-sky-700 border border-sky-500 text-white font-bold',         row: 'bg-sky-950/40' },
  0.25: { label: '¼×',  pill: 'bg-blue-700 border border-blue-500 text-white font-bold',       row: 'bg-blue-950/50' },
  0:    { label: '0×',  pill: 'bg-zinc-800 border border-zinc-600 text-zinc-400 font-bold',    row: 'bg-zinc-900' },
};

export function computeOffense(attackerTypes: PokemonType[]): Record<PokemonType, number> {
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

export function TypeChartSection({ title, chart }: { title: string; chart: Record<PokemonType, number> }) {
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
    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5 flex flex-col gap-2">
      <div className="text-xs font-bold uppercase tracking-widest text-zinc-300 mb-2">{title}</div>
      {order.map((mult) => {
        const types = grouped.get(mult) ?? [];
        if (types.length === 0) return null;
        const s = MULT_STYLE[mult] ?? MULT_STYLE[1];
        return (
          <div key={mult} className={`flex items-start gap-2.5 rounded-xl px-3 py-2 ${s.row}`}>
            <span className={`mt-0.5 inline-flex w-9 shrink-0 items-center justify-center rounded-lg px-1 py-0.5 text-xs tabular-nums ${s.pill}`}>
              {s.label}
            </span>
            <div className="flex flex-wrap gap-1">
              {types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
