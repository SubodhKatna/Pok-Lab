import type { EvolutionNode, PokemonVariant, VariantKind } from '@/shared/types/pokemon';

interface EvolutionChainProps {
  chain: EvolutionNode[];
  currentId?: number;
  onSelect?: (id: number, name: string) => void;
}

export function EvolutionChain({ chain, currentId, onSelect }: EvolutionChainProps) {
  if (chain.length === 0) {
    return <p className="text-sm text-zinc-500">No evolution data.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start justify-center min-w-max py-2 px-4">
        <EvoNode node={chain[0]} currentId={currentId} onSelect={onSelect} />
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function kindLabel(kind: VariantKind): string {
  if (kind === 'mega') return 'Mega';
  if (kind === 'gmax') return 'G-Max';
  if (kind === 'dmax') return 'D-Max';
  return 'Regional';
}

function kindRing(kind: VariantKind): string {
  if (kind === 'mega') return 'border-amber-400/50 bg-amber-400/10 hover:bg-amber-400/20';
  if (kind === 'gmax') return 'border-rose-400/50 bg-rose-400/10 hover:bg-rose-400/20';
  if (kind === 'dmax') return 'border-purple-400/50 bg-purple-400/10 hover:bg-purple-400/20';
  return 'border-teal-400/50 bg-teal-400/10 hover:bg-teal-400/20';
}

function kindBadgeColor(kind: VariantKind): string {
  if (kind === 'mega') return 'bg-amber-400/15 text-amber-300 border-amber-400/30';
  if (kind === 'gmax') return 'bg-rose-400/15 text-rose-300 border-rose-400/30';
  if (kind === 'dmax') return 'bg-purple-400/15 text-purple-300 border-purple-400/30';
  return 'bg-teal-400/15 text-teal-300 border-teal-400/30';
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function PokemonCard({
  id, name, isCurrent, onSelect, variantKind,
}: {
  id: number;
  name: string;
  isCurrent: boolean;
  onSelect?: (id: number, name: string) => void;
  variantKind?: VariantKind;
}) {
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  const isVariant = variantKind !== undefined;

  const baseClass = 'flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all w-[110px] shrink-0';
  const stateClass = isCurrent
    ? 'border-indigo-400/60 bg-indigo-500/15 cursor-default shadow-indigo-500/10 shadow-md'
    : onSelect
      ? `cursor-pointer ${isVariant ? kindRing(variantKind!) : 'border-white/8 bg-white/4 hover:border-indigo-400/40 hover:bg-indigo-500/10'}`
      : 'border-white/5 bg-white/3 cursor-default';

  return (
    <div className="flex flex-col items-center gap-1">
      {isVariant && (
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${kindBadgeColor(variantKind!)}`}>
          {kindLabel(variantKind!)}
        </span>
      )}
      <button
        onClick={() => onSelect?.(id, name)}
        disabled={isCurrent || !onSelect}
        className={`${baseClass} ${stateClass}`}
        aria-label={`View ${name}`}
        aria-current={isCurrent ? 'true' : undefined}
      >
        <img src={sprite} alt={name} className="h-16 w-16 object-contain drop-shadow-lg" loading="lazy" />
        <span className={`text-xs capitalize font-bold text-center leading-tight ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
          {name.replace(/-/g, ' ')}
        </span>
        {isCurrent && <span className="text-[9px] text-indigo-400 font-semibold uppercase tracking-widest">Current</span>}
      </button>
    </div>
  );
}

// ── Node ──────────────────────────────────────────────────────────────────────

function EvoNode({ node, currentId, onSelect }: {
  node: EvolutionNode;
  currentId?: number;
  onSelect?: (id: number, name: string) => void;
}) {
  const regionalForms = (node.variants ?? []).filter(
    (v): v is PokemonVariant => v.kind === 'regional',
  );

  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center gap-2">

        {/* Base species */}
        <PokemonCard
          id={node.id}
          name={node.name}
          isCurrent={node.id === currentId}
          onSelect={onSelect}
        />

        {/* Regional forms — below the base */}
        {regionalForms.length > 0 && (
          <div className="flex flex-col items-center gap-1.5 mt-1">
            <div className="w-px h-3 bg-white/15" aria-hidden="true" />
            <div className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Regional</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {regionalForms.map((v) => (
                <PokemonCard
                  key={v.id}
                  id={v.id}
                  name={v.name}
                  isCurrent={v.id === currentId}
                  onSelect={onSelect}
                  variantKind={v.kind}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Evolution children */}
      {node.children.length > 0 && (
        <div className="flex flex-col gap-4 items-start ml-0">
          {node.children.map((child) => (
            <div key={child.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 px-3 w-[72px] shrink-0">
                <span className="text-slate-500 text-lg">→</span>
                {child.trigger && (
                  <span className="text-[9px] text-slate-400 text-center leading-tight capitalize bg-white/5 border border-white/10 rounded-lg px-2 py-0.5 max-w-[64px]">
                    {child.trigger}
                  </span>
                )}
              </div>
              <EvoNode node={child} currentId={currentId} onSelect={onSelect} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
