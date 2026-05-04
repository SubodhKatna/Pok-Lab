import { useState, useMemo } from 'react';
import { TypeBadge } from '@/shared/components/TypeBadge';
import type { MoveEntry } from '@/shared/types/pokemon';

type SortKey = 'name' | 'type' | 'category' | 'power' | 'accuracy' | 'pp' | 'learnMethod' | 'level';
type SortDir = 'asc' | 'desc';
type MethodFilter = 'all' | 'level-up' | 'machine' | 'egg' | 'tutor';

const CAT: Record<MoveEntry['category'], string> = {
  physical: 'bg-orange-900 text-orange-200 border-orange-700',
  special:  'bg-blue-900   text-blue-200   border-blue-700',
  status:   'bg-zinc-800   text-zinc-300   border-zinc-600',
};

const METHOD: Record<string, string> = {
  'level-up': 'bg-emerald-900 text-emerald-200 border-emerald-700',
  'machine':  'bg-sky-900     text-sky-200     border-sky-700',
  'egg':      'bg-pink-900    text-pink-200    border-pink-700',
  'tutor':    'bg-violet-900  text-violet-200  border-violet-700',
};

const TABS: { key: MethodFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'level-up', label: 'Level Up' },
  { key: 'machine',  label: 'TM / HM' },
  { key: 'egg',      label: 'Egg' },
  { key: 'tutor',    label: 'Tutor' },
];

export function MoveList({ moves }: { moves: MoveEntry[] }) {
  const [sortKey, setSortKey]   = useState<SortKey>('level');
  const [sortDir, setSortDir]   = useState<SortDir>('asc');
  const [method, setMethod]     = useState<MethodFilter>('all');
  const [search, setSearch]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: moves.length };
    for (const m of moves) c[m.learnMethod] = (c[m.learnMethod] ?? 0) + 1;
    return c;
  }, [moves]);

  const sorted = useMemo(() => {
    const filtered = moves.filter((m) => {
      if (method !== 'all' && m.learnMethod !== method) return false;
      if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':        cmp = a.name.localeCompare(b.name); break;
        case 'type':        cmp = a.type.localeCompare(b.type); break;
        case 'category':    cmp = a.category.localeCompare(b.category); break;
        case 'power':       cmp = (a.power ?? -1) - (b.power ?? -1); break;
        case 'accuracy':    cmp = (a.accuracy ?? -1) - (b.accuracy ?? -1); break;
        case 'pp':          cmp = a.pp - b.pp; break;
        case 'learnMethod': cmp = a.learnMethod.localeCompare(b.learnMethod); break;
        case 'level':       cmp = a.levelLearnedAt - b.levelLearnedAt; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [moves, method, search, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  }

  const arr = (k: SortKey) => sortKey === k ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  if (moves.length === 0) {
    return <div className="py-8 text-center text-sm text-zinc-400">No move data available.</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TABS.map(({ key, label }) => {
            const count = key === 'all' ? counts.all : (counts[key] ?? 0);
            if (key !== 'all' && count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => setMethod(key)}
                className={[
                  'rounded-lg border px-3 py-1 text-xs font-semibold transition-all',
                  method === key
                    ? 'border-sky-500 bg-sky-900 text-sky-200'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white',
                ].join(' ')}
              >
                {label}
                <span className="ml-1.5 text-[10px] text-zinc-400 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search moves…"
          className="ml-auto rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-sky-500 focus:outline-none transition-colors w-40"
        />
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-700 overflow-hidden">
        <div className="overflow-auto max-h-[520px]">
          <table className="w-full text-sm border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-800 border-b border-zinc-700">
                <Th label={`Move${arr('name')}`}          onClick={() => handleSort('name')} />
                <Th label={`Type${arr('type')}`}          onClick={() => handleSort('type')} />
                <Th label={`Cat${arr('category')}`}       onClick={() => handleSort('category')} />
                <Th label={`Pwr${arr('power')}`}          onClick={() => handleSort('power')} right />
                <Th label={`Acc${arr('accuracy')}`}       onClick={() => handleSort('accuracy')} right />
                <Th label={`PP${arr('pp')}`}              onClick={() => handleSort('pp')} right />
                <Th label={`Method${arr('learnMethod')}`} onClick={() => handleSort('learnMethod')} />
                <Th label={`Lv${arr('level')}`}           onClick={() => handleSort('level')} right />
              </tr>
            </thead>
            <tbody>
              {sorted.map((move, i) => {
                const isExp = expanded === move.name;
                return (
                  <>
                    <tr
                      key={move.name}
                      onClick={() => setExpanded(isExp ? null : move.name)}
                      className={[
                        'border-b border-zinc-800 cursor-pointer transition-colors',
                        i % 2 === 0 ? 'bg-zinc-900' : 'bg-zinc-950',
                        isExp ? 'bg-zinc-700' : 'hover:bg-zinc-800',
                      ].join(' ')}
                    >
                      <td className="px-4 py-2.5 font-semibold text-zinc-100 capitalize whitespace-nowrap">
                        {move.name.replace(/-/g, ' ')}
                      </td>
                      <td className="px-4 py-2.5"><TypeBadge type={move.type} /></td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${CAT[move.category]}`}>
                          {move.category}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-200 tabular-nums">
                        {move.power ?? <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-200 tabular-nums">
                        {move.accuracy != null ? `${move.accuracy}%` : <span className="text-zinc-600">—</span>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-200 tabular-nums">{move.pp}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold capitalize ${METHOD[move.learnMethod] ?? 'bg-zinc-800 text-zinc-300 border-zinc-600'}`}>
                          {move.learnMethod === 'level-up' ? 'Level Up' : move.learnMethod === 'machine' ? 'TM/HM' : move.learnMethod}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-zinc-200 tabular-nums">
                        {move.learnMethod === 'level-up' && move.levelLearnedAt > 0
                          ? move.levelLearnedAt
                          : <span className="text-zinc-600">—</span>}
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={`${move.name}-eff`} className="border-b border-zinc-800 bg-zinc-800">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="flex items-start gap-2.5">
                            <span className="shrink-0 rounded-md bg-sky-900 border border-sky-700 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-sky-300">
                              Effect
                            </span>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              {move.effect || 'No effect description available.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-400">
                    No moves match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="text-xs text-zinc-500 text-right">
        {sorted.length} of {moves.length} moves — click a row to see effect
      </div>
    </div>
  );
}

function Th({ label, onClick, right = false }: { label: string; onClick: () => void; right?: boolean }) {
  return (
    <th
      onClick={onClick}
      className={[
        'px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-300 cursor-pointer select-none',
        'hover:text-white hover:bg-zinc-700 transition-colors whitespace-nowrap',
        right ? 'text-right' : 'text-left',
      ].join(' ')}
    >
      {label}
    </th>
  );
}
