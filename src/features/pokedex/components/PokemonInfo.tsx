import type { PokemonDetail } from '@/shared/types/pokemon';

interface Props { pokemon: PokemonDetail }

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-white capitalize">{value}</div>
    </div>
  );
}

export function PokemonInfo({ pokemon }: Props) {
  const primary = pokemon.abilities.filter((a) => !a.isHidden);
  const hidden  = pokemon.abilities.filter((a) => a.isHidden);

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 flex flex-col gap-4 lg:row-span-2">
      {pokemon.description && (
        <p className="text-sm text-slate-300 leading-relaxed border-l-2 border-indigo-400/60 pl-3 italic">
          {pokemon.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <InfoCell label="Height"     value={`${(pokemon.height / 10).toFixed(1)} m`} />
        <InfoCell label="Weight"     value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
        <InfoCell label="Generation" value={`Gen ${pokemon.generation}`} />
        <InfoCell label="Color"      value={pokemon.color} />
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Egg Groups</div>
        <div className="flex flex-wrap gap-1.5">
          {pokemon.eggGroups.map((g) => (
            <span key={g} className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize text-slate-300 font-medium">
              {g.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Abilities</div>
        <div className="flex flex-col gap-3">
          {primary.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Primary</div>
              <div className="flex flex-wrap gap-1.5">
                {primary.map((a) => (
                  <span key={a.name} className="rounded-lg border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs capitalize text-emerald-300 font-medium">
                    {a.name.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {hidden.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mb-1.5">Hidden</div>
              <div className="flex flex-wrap gap-1.5">
                {hidden.map((a) => (
                  <span key={a.name} className="rounded-lg border border-violet-400/30 bg-violet-400/10 px-2.5 py-1 text-xs capitalize text-violet-300 font-medium">
                    {a.name.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
