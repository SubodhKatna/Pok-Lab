import { useState, useMemo } from 'react';
import { FiChevronDown, FiPackage, FiSearch, FiZap } from 'react-icons/fi';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { usePokemonList } from '@/shared/services/hooks/usePokemonList';
import { useItemList } from '@/shared/services/hooks/useItemList';
import type { PokemonSummary } from '@/shared/types/pokemon';

function formatName(name: string): string {
  return name.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

type Tab = 'pokemon' | 'item';

interface TeamSlotPickerProps {
  selectedPokemon: PokemonSummary | null;
  selectedItem: string;
  onSelectPokemon: (pokemon: PokemonSummary) => void;
  onSelectItem: (itemName: string) => void;
  disabled?: boolean;
}

export function TeamSlotPicker({
  selectedPokemon,
  selectedItem,
  onSelectPokemon,
  onSelectItem,
  disabled = false,
}: TeamSlotPickerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('pokemon');
  const [query, setQuery] = useState('');

  const { data: pokemonList = [], isLoading: pokemonLoading } = usePokemonList();
  const { data: itemList = [], isLoading: itemLoading } = useItemList();

  const filteredPokemon = useMemo(() => {
    if (!query) return pokemonList.slice(0, 80);
    const q = query.toLowerCase();
    return pokemonList.filter((p) => p.name.includes(q)).slice(0, 80);
  }, [pokemonList, query]);

  const filteredItems = useMemo(() => {
    if (!query) return itemList.slice(0, 80);
    const q = query.toLowerCase();
    return itemList.filter((i) => i.name.includes(q)).slice(0, 80);
  }, [itemList, query]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    if (!v) setQuery('');
  };

  const handlePickPokemon = (pokemon: PokemonSummary) => {
    onSelectPokemon(pokemon);
    setOpen(false);
    setQuery('');
  };

  const handlePickItem = (name: string) => {
    onSelectItem(name);
    setOpen(false);
    setQuery('');
  };

  const handleClearItem = () => {
    onSelectItem('');
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={[
            'flex w-full items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-all duration-150',
            disabled
              ? 'cursor-not-allowed border-zinc-800/50 bg-transparent text-zinc-700'
              : open
                ? 'border-sky-500/40 bg-zinc-800 text-zinc-200'
                : 'border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800 hover:text-zinc-200',
          ].join(' ')}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
            {selectedPokemon ? (
              <>
                <img src={selectedPokemon.sprite} alt="" className="h-4 w-4 shrink-0 object-contain" />
                <span className="truncate capitalize font-medium text-zinc-300">{selectedPokemon.name}</span>
              </>
            ) : (
              <span className="text-zinc-600">Choose Pokémon…</span>
            )}
            {selectedItem && (
              <>
                <span className="text-zinc-700">·</span>
                <FiPackage size={10} className="shrink-0 text-sky-500" />
                <span className="truncate text-sky-400">{formatName(selectedItem)}</span>
              </>
            )}
          </span>
          <FiChevronDown
            size={11}
            className={`shrink-0 text-zinc-600 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-72 border-zinc-800 bg-zinc-950 p-0 shadow-2xl shadow-black/50"
        align="start"
        sideOffset={4}
      >
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-zinc-800 px-3 py-2">
          <FiSearch size={12} className="shrink-0 text-zinc-600" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tab === 'pokemon' ? 'Search Pokémon…' : 'Search items…'}
            className="flex-1 bg-transparent text-xs text-zinc-100 placeholder-zinc-700 outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-zinc-700 hover:text-zinc-400 text-[10px]">✕</button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-zinc-800">
          <TabBtn active={tab === 'pokemon'} onClick={() => { setTab('pokemon'); setQuery(''); }}>
            <FiZap size={10} className="mr-1 inline" />Pokémon
          </TabBtn>
          <TabBtn active={tab === 'item'} onClick={() => { setTab('item'); setQuery(''); }}>
            <FiPackage size={10} className="mr-1 inline" />Held Item
          </TabBtn>
        </div>

        {/* List */}
        <div className="max-h-60 overflow-y-auto overscroll-contain">
          {tab === 'pokemon' && (
            <>
              {pokemonLoading ? <Skeleton /> : filteredPokemon.length === 0 ? <Empty label="No Pokémon found" /> : (
                filteredPokemon.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handlePickPokemon(p)}
                    className={[
                      'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
                      selectedPokemon?.id === p.id
                        ? 'bg-sky-500/10 text-sky-300'
                        : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                    ].join(' ')}
                  >
                    <img src={p.sprite} alt={p.name} className="h-6 w-6 shrink-0 object-contain" loading="lazy" />
                    <span className="capitalize flex-1">{p.name}</span>
                    {selectedPokemon?.id === p.id && <span className="text-sky-500 text-[10px]">✓</span>}
                  </button>
                ))
              )}
              {!pokemonLoading && filteredPokemon.length === 80 && (
                <p className="px-3 py-2 text-center text-[10px] text-zinc-700">Type to narrow results</p>
              )}
            </>
          )}

          {tab === 'item' && (
            <>
              {selectedItem && (
                <button
                  onClick={handleClearItem}
                  className="flex w-full items-center gap-2 border-b border-zinc-800/60 px-3 py-1.5 text-left text-[11px] text-zinc-600 transition-colors hover:bg-zinc-900 hover:text-zinc-400"
                >
                  <span>✕</span> Remove held item
                </button>
              )}
              {itemLoading ? <Skeleton /> : filteredItems.length === 0 ? <Empty label="No items found" /> : (
                filteredItems.map((item) => {
                  const active = selectedItem === item.name;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handlePickItem(item.name)}
                      className={[
                        'flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors',
                        active ? 'bg-sky-500/10 text-sky-300' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100',
                      ].join(' ')}
                    >
                      <FiPackage size={11} className={active ? 'text-sky-400' : 'text-zinc-700'} />
                      <span className="flex-1">{formatName(item.name)}</span>
                      {active && <span className="text-sky-500 text-[10px]">✓</span>}
                    </button>
                  );
                })
              )}
              {!itemLoading && filteredItems.length === 80 && (
                <p className="px-3 py-2 text-center text-[10px] text-zinc-700">Type to narrow results</p>
              )}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex-1 px-3 py-2 text-[11px] font-semibold transition-colors',
        active ? 'border-b-2 border-sky-500 text-sky-400' : 'text-zinc-600 hover:text-zinc-400',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-1 p-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-7 animate-pulse rounded bg-zinc-900" />
      ))}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-5 text-center text-xs text-zinc-700">{label}</p>;
}
