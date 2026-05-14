import { TypeBadge } from '@/shared/components/TypeBadge';
import { ALL_TYPES } from '../logic';
import type { PokemonType } from '@/shared/types/pokemon';

const MULT_STYLE: Record<number, { label: string; pill: string; row: string }> = {
  4:    { label: '4×',  pill: 'bg-red-600 border border-red-500 text-white font-black shadow-sm',       row: 'bg-red-950/40' },
  2:    { label: '2×',  pill: 'bg-orange-600 border border-orange-500 text-white font-black shadow-sm', row: 'bg-orange-950/30' },
  1:    { label: '1×',  pill: 'bg-slate-700 border border-slate-600 text-slate-300 font-bold',          row: '' },
  0.5:  { label: '½×',  pill: 'bg-sky-600 border border-sky-500 text-white font-black shadow-sm',       row: 'bg-sky-950/30' },
  0.25: { label: '¼×',  pill: 'bg-blue-600 border border-blue-500 text-white font-black shadow-sm',     row: 'bg-blue-950/40' },
  0:    { label: '0×',  pill: 'bg-slate-800 border border-slate-700 text-slate-400 font-black',         row: 'bg-slate-900/60' },
};

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
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 flex flex-col gap-2">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{title}</div>
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
