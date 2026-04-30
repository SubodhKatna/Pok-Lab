const NAV_ITEMS = [
  { label: "Pokémon Wordle" },
  { label: "Who's That Pokémon?" },
  { label: "Partial Image" },
  { label: "Pokédex" },
  { label: "Team Builder" },
]

export function NavBar() {
  return (
    <nav className="bg-zinc-900 px-6 py-3">
      <ul className="flex flex-row gap-6 list-none m-0 p-0">
        {NAV_ITEMS.map((item) => (
          <li key={item.label}>
            <a
              href="#"
              className="text-zinc-100 hover:text-white transition-colors duration-150 text-sm font-medium"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
