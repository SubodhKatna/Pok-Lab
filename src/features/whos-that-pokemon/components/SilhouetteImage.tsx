interface SilhouetteImageProps {
  src: string
  alt: string
  revealed: boolean
}

/**
 * Pokémon silhouette with a dramatic spotlight backdrop.
 * Smooth 800ms brightness + scale transition on reveal.
 */
export function SilhouetteImage({ src, alt, revealed }: SilhouetteImageProps) {
  return (
    <div className="relative flex items-center justify-center w-80 h-80">
      {/* Spotlight glow */}
      <div
        className={[
          'absolute inset-8 rounded-full blur-2xl transition-all duration-700',
          revealed ? 'bg-yellow-400/30 scale-125' : 'bg-violet-500/15 scale-100',
        ].join(' ')}
        aria-hidden="true"
      />

      <img
        src={src}
        alt={revealed ? alt : 'Mystery Pokémon silhouette'}
        className="relative z-10 h-72 w-72 object-contain select-none"
        style={{
          filter: revealed
            ? 'brightness(1) drop-shadow(0 0 32px rgba(250,204,21,0.4))'
            : 'brightness(0)',
          transform: revealed ? 'scale(1.08)' : 'scale(1)',
          transition: 'filter 800ms ease-in-out, transform 800ms ease-in-out',
        }}
        draggable={false}
      />
    </div>
  )
}
