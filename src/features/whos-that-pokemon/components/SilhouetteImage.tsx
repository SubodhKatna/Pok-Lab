interface SilhouetteImageProps {
  /** Official artwork URL for the mystery Pokémon. */
  src: string
  /** Alt text for the image (use Pokémon name when revealed, generic when hidden). */
  alt: string
  /** When true, the full-color image is shown. When false, brightness(0) silhouette. */
  revealed: boolean
}

/**
 * Displays a Pokémon sprite as a black silhouette until `revealed` is true.
 *
 * Uses CSS `filter: brightness(0)` for the silhouette effect — no extra assets needed.
 * The transition is instant (polish pass will add animation).
 */
export function SilhouetteImage({ src, alt, revealed }: SilhouetteImageProps) {
  return (
    <div className="flex items-center justify-center">
      <img
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon silhouette'}
        className="h-56 w-56 object-contain drop-shadow-2xl select-none"
        style={revealed ? undefined : { filter: 'brightness(0)' }}
        draggable={false}
      />
    </div>
  )
}
