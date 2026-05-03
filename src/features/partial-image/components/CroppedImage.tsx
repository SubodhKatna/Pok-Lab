/**
 * CroppedImage — shows a zoomed-in crop of a Pokémon sprite and progressively
 * zooms out with each reveal step.
 *
 * The crop origin (transform-origin) is passed in as a prop so it can be
 * generated outside of render (in the hook) — keeping this component pure.
 *
 * Scale steps:
 *   Step 0: 5×   — tiny random crop (~4% visible)
 *   Step 1: 3.5×
 *   Step 2: 2.5×
 *   Step 3: 1.6×
 *   Step 4: 1×   — full image
 */

const SCALE_STEPS = [5, 3.5, 2.5, 1.6, 1]
const VIEWPORT = 220

interface CroppedImageProps {
  src: string
  alt: string
  revealStep: number
  /** CSS transform-origin string, e.g. "42.3% 61.7%". Generated per round in the hook. */
  cropOrigin: string
  revealed?: boolean
}

export function CroppedImage({ src, alt, revealStep, cropOrigin, revealed = false }: CroppedImageProps) {
  const clampedStep = Math.min(Math.max(revealStep, 0), SCALE_STEPS.length - 1)
  const scale = revealed ? 1 : SCALE_STEPS[clampedStep]

  return (
    <div
      className="relative flex items-center justify-center"
      aria-label={
        revealed
          ? `${alt} fully revealed`
          : `Mystery Pokémon, reveal step ${clampedStep + 1} of 5`
      }
    >
      {/* Glow */}
      <div
        className="absolute rounded-full blur-3xl opacity-25 bg-sky-400 pointer-events-none"
        style={{ width: VIEWPORT, height: VIEWPORT }}
        aria-hidden="true"
      />

      {/* Fixed viewport — clips the zoomed image */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/8 bg-zinc-900"
        style={{ width: VIEWPORT, height: VIEWPORT }}
      >
        <img
          src={src}
          alt={revealed ? alt : 'Mystery Pokémon'}
          draggable={false}
          className="absolute inset-0 w-full h-full object-contain select-none"
          style={{
            transform: `scale(${scale})`,
            transformOrigin: cropOrigin,
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}
