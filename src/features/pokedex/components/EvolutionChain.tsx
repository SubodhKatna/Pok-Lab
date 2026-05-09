import type { EvolutionNode } from '@/shared/types/pokemon';

interface EvolutionChainProps {
  chain: EvolutionNode[];
  currentId?: number;
  onSelect?: (id: number, name: string) => void;
}

export function EvolutionChain({ chain, currentId, onSelect }: EvolutionChainProps) {
  if (chain.length === 0) {
    return <p className="text-sm text-zinc-500">No evolution data.</p>;
  }
  const root = chain[0];
  return (
    <div className="overflow-x-auto">
      <div className="flex items-start justify-center min-w-max py-2 px-4">
        <EvoNode node={root} currentId={currentId} onSelect={onSelect} />
      </div>
    </div>
  );
}

function PokemonCard({
  id, name, isCurrent, onSelect,
}: {
  id: number; name: string; isCurrent: boolean; onSelect?: (id: number, name: string) => void;
}) {
  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
  return (
    <button
      onClick={() => onSelect?.(id, name)}
      disabled={isCurrent || !onSelect}
      className={[
        'flex flex-col items-center gap-2 rounded-2xl border p-3 transition-all w-[110px] shrink-0',
        isCurrent
          ? 'border-sky-500 bg-sky-900/40 cursor-default'
          : onSelect
            ? 'border-zinc-700 bg-zinc-800 hover:border-sky-500/60 hover:bg-zinc-700 cursor-pointer'
            : 'border-zinc-800 bg-zinc-900 cursor-default',
      ].join(' ')}
      aria-label={`View ${name}`}
      aria-current={isCurrent ? 'true' : undefined}
    >
      <img src={sprite} alt={name} className="h-16 w-16 object-contain drop-shadow-lg" loading="lazy" />
      <span className={`text-xs capitalize font-bold text-center leading-tight ${isCurrent ? 'text-sky-300' : 'text-zinc-100'}`}>
        {name.replace(/-/g, ' ')}
      </span>
      {isCurrent && <span className="text-[9px] text-sky-400 font-semibold uppercase tracking-widest">Current</span>}
    </button>
  );
}

function EvoNode({ node, currentId, onSelect }: {
  node: EvolutionNode;
  currentId?: number;
  onSelect?: (id: number, name: string) => void;
}) {
  const isCurrent = node.id === currentId;
  const hasVariants = node.variants && node.variants.length > 0;

  return (
    <div className="flex items-start">
      {/* Main species + its variants stacked vertically */}
      <div className="flex flex-col items-center gap-2">
        <PokemonCard id={node.id} name={node.name} isCurrent={isCurrent} onSelect={onSelect} />
        {hasVariants && (
          <div className="flex flex-col gap-1.5 items-center">
            <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-semibold">Variants</div>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {node.variants!.map((v) => (
                <PokemonCard
                  key={v.id}
                  id={v.id}
                  name={v.name}
                  isCurrent={v.id === currentId}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Children branches */}
      {node.children.length > 0 && (
        <div className="flex flex-col gap-4 items-start ml-0">
          {node.children.map((child) => (
            <div key={child.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 px-3 w-[72px] shrink-0">
                <span className="text-zinc-500 text-lg">→</span>
                {child.trigger && (
                  <span className="text-[9px] text-zinc-400 text-center leading-tight capitalize bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-0.5 max-w-[64px]">
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
