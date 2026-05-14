import { TypeBadge } from '@/shared/components/TypeBadge';
import { StatBar } from '@/shared/components/StatBar';
import { FiHeart } from 'react-icons/fi';
import type { PokemonDetail, PokemonVariant, VariantKind, BaseStats } from '@/shared/types/pokemon';

export interface FormOverride {
  id: number;
  name: string;
  sprite: string;
  types: PokemonDetail['types'];
  stats: BaseStats;
}

function kindLabel(kind: VariantKind): string {
  if (kind === 'mega') return 'Mega';
  if (kind === 'gmax') return 'G-Max';
  if (kind === 'dmax') return 'D-Max';
  return 'Regional';
}

function kindColors(kind: VariantKind) {
  if (kind === 'mega')  return { idle: 'border-amber-400/40 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20',   active: 'border-amber-400 bg-amber-400/25 text-amber-200 shadow-amber-400/20 shadow-sm' };
  if (kind === 'gmax')  return { idle: 'border-rose-400/40 bg-rose-400/10 text-rose-300 hover:bg-rose-400/20',       active: 'border-rose-400 bg-rose-400/25 text-rose-200 shadow-rose-400/20 shadow-sm' };
  if (kind === 'dmax')  return { idle: 'border-purple-400/40 bg-purple-400/10 text-purple-300 hover:bg-purple-400/20', active: 'border-purple-400 bg-purple-400/25 text-purple-200 shadow-purple-400/20 shadow-sm' };
  return                       { idle: 'border-teal-400/40 bg-teal-400/10 text-teal-300 hover:bg-teal-400/20',       active: 'border-teal-400 bg-teal-400/25 text-teal-200 shadow-teal-400/20 shadow-sm' };
}

interface HeroProps {
  pokemon: PokemonDetail;
  activeForm: FormOverride | null;
  loadingFormId: number | null;
  onFormSelect: (v: PokemonVariant) => void;
  isFavourite?: boolean;
  onToggleFavourite?: () => void;
}

export function PokemonHero({ pokemon, activeForm, loadingFormId, onFormSelect, isFavourite, onToggleFavourite }: HeroProps) {
  const displayed = activeForm ?? pokemon;

  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-6 flex flex-col items-center gap-4">
      {/* Top row: dex number + favourite */}
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-mono text-slate-500 tracking-widest">
          #{String(pokemon.id).padStart(4, '0')}
        </span>
        {onToggleFavourite && (
          <button
            onClick={onToggleFavourite}
            aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
            className={[
              'flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-all',
              isFavourite
                ? 'border-rose-400/60 bg-rose-400/15 text-rose-300 hover:bg-rose-400/25'
                : 'border-white/10 bg-white/5 text-slate-400 hover:border-rose-400/40 hover:text-rose-300',
            ].join(' ')}
          >
            <FiHeart size={12} className={isFavourite ? 'fill-rose-400 text-rose-400' : ''} />
            {isFavourite ? 'Saved' : 'Favourite'}
          </button>
        )}
      </div>

      {/* Form switcher */}
      {pokemon.forms.length > 0 && (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {pokemon.forms.map((v) => {
            const colors = kindColors(v.kind);
            const isActive = activeForm?.id === v.id;
            const isLoading = loadingFormId === v.id;
            const label = v.name.replace(`${pokemon.name}-`, '').replace(/-/g, ' ');
            return (
              <button
                key={v.id}
                onClick={() => onFormSelect(v)}
                disabled={isLoading}
                className={[
                  'text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border transition-all',
                  isActive ? colors.active : colors.idle,
                  isLoading ? 'opacity-40 cursor-wait' : '',
                ].join(' ')}
              >
                {isLoading ? '…' : `${kindLabel(v.kind)} ${label}`}
              </button>
            );
          })}
        </div>
      )}

      {/* Sprite */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-indigo-500/10 blur-3xl scale-110" aria-hidden="true" />
        <img
          key={displayed.id}
          src={displayed.sprite}
          alt={displayed.name}
          className="relative h-44 w-44 object-contain drop-shadow-2xl"
        />
      </div>

      {/* Name + types */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-black capitalize text-white tracking-tight leading-none">
          {displayed.name.replace(/-/g, ' ')}
        </h1>
        <div className="flex gap-2 flex-wrap justify-center">
          {displayed.types.map((t) => <TypeBadge key={t} type={t} />)}
        </div>
      </div>
    </div>
  );
}

interface StatsProps { pokemon: PokemonDetail; activeForm: FormOverride | null }

export function PokemonStats({ pokemon, activeForm }: StatsProps) {
  const stats = activeForm?.stats ?? pokemon.stats;
  const total = Object.values(stats).reduce((a, b) => a + b, 0);
  return (
    <div className="rounded-2xl border border-white/8 bg-gradient-to-b from-slate-800/80 to-slate-900/80 backdrop-blur-sm p-5 flex flex-col justify-center gap-3">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Base Stats</div>
      <StatBar label="HP"    value={stats.hp} />
      <StatBar label="Atk"   value={stats.attack} />
      <StatBar label="Def"   value={stats.defense} />
      <StatBar label="SpAtk" value={stats.spAtk} />
      <StatBar label="SpDef" value={stats.spDef} />
      <StatBar label="Speed" value={stats.speed} />
      <div className="mt-1 pt-2.5 border-t border-white/8 flex justify-between text-xs">
        <span className="text-slate-400 font-medium">Total</span>
        <span className="font-black text-white tabular-nums">{total}</span>
      </div>
    </div>
  );
}
