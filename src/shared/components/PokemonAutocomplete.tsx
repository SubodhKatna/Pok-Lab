import { useState } from 'react'
import { FiChevronDown, FiAlertCircle } from 'react-icons/fi'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { usePokemonList } from '@/shared/services/hooks/usePokemonList'
import type { PokemonSummary } from '@/shared/types/pokemon'

interface PokemonAutocompleteProps {
  /** Called when the user selects a Pokémon from the list. */
  onSelect: (pokemon: PokemonSummary) => void
  /** Currently selected Pokémon (controlled). Pass `null` to show placeholder. */
  value?: PokemonSummary | null
  /** Placeholder text shown when nothing is selected. */
  placeholder?: string
  /** Disables the trigger button. */
  disabled?: boolean
}

/**
 * Searchable Pokémon combobox backed by `usePokemonList`.
 *
 * Uses shadcn `Command` inside a `Popover` for the dropdown UI.
 * Shows a loading skeleton while the list is fetching and an error
 * banner if the fetch fails.
 */
export function PokemonAutocomplete({
  onSelect,
  value = null,
  placeholder = 'Search Pokémon…',
  disabled = false,
}: PokemonAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const { data: pokemonList, isLoading, isError } = usePokemonList()

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" aria-busy="true" aria-label="Loading Pokémon list">
        <Skeleton className="h-9 w-48 rounded-4xl" />
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div
        role="alert"
        className="flex items-center gap-2 rounded-xl border border-red-800/60 bg-red-950/40 px-3 py-2 text-sm text-red-400"
      >
        <FiAlertCircle className="shrink-0" size={16} />
        <span>Failed to load Pokémon list. Please refresh and try again.</span>
      </div>
    )
  }

  const list = pokemonList ?? []

  const handleSelect = (pokemon: PokemonSummary) => {
    onSelect(pokemon)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled}
          className="w-56 justify-between gap-2 border-zinc-700 bg-zinc-900 text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100"
        >
          {value ? (
            <span className="flex items-center gap-2 truncate">
              <img
                src={value.sprite}
                alt={value.name}
                className="h-5 w-5 object-contain"
                loading="lazy"
              />
              <span className="capitalize truncate">{value.name}</span>
            </span>
          ) : (
            <span className="text-zinc-500 truncate">{placeholder}</span>
          )}
          <FiChevronDown
            size={14}
            className={`shrink-0 opacity-60 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 p-0 border-zinc-800 bg-zinc-900"
        align="start"
        sideOffset={6}
      >
        <Command className="rounded-3xl bg-zinc-900">
          <CommandInput
            placeholder="Search Pokémon…"
            className="text-zinc-100 placeholder:text-zinc-500"
          />
          <CommandList>
            <CommandEmpty className="py-4 text-sm text-zinc-500">
              No Pokémon found.
            </CommandEmpty>
            <CommandGroup>
              {list.map((pokemon) => (
                <CommandItem
                  key={pokemon.id}
                  value={pokemon.name}
                  onSelect={() => handleSelect(pokemon)}
                  className="flex items-center gap-2.5 cursor-pointer text-zinc-300 data-selected:bg-zinc-800 data-selected:text-zinc-100"
                >
                  <img
                    src={pokemon.sprite}
                    alt={pokemon.name}
                    className="h-6 w-6 object-contain"
                    loading="lazy"
                  />
                  <span className="capitalize">{pokemon.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
