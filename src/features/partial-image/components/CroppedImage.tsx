import { useMemo } from 'react'

/**
 * CroppedImage — shows a random zoomed-in crop of a Pokémon sprite and
 * progressively zooms out with each reveal step.
 *
 * Technique: fixed-size viewport container with overflow:hidden.
 * The image is scaled up and positioned at a random origin per round.
 * Each step reduces the scale until step 4 = full image (scale 1).
 *
 * Scale steps:
 *   Step 0: 5× zoom  — tiny random crop (~4% of image visible)
 *   Step 1: 3.5× zoom
 *   Step 2: 2.5× zoom
 *   Step 3: 1.6× zoom
 *   Step 4: 1×  zoom — full image
 */

const SCALE_STEPS = [5, 3.5, 2.5, 1.6, 1]

/** Viewport size in px — the "window" the player sees through */
const VIEWPORT = 220

interface CroppedImageProps {
  src: string
  alt: string
  revealStep: number
  revealed?: boolean
}

export function CroppedImage({ src, alt, revealStep, revealed = false }: CroppedImageProps) {
  const clampedStep = Math.min(Math.max(revealStep, 0), SCALE_STEPS.length - 1)
  const scale = revealed ? 1 : SCALE_STEPS[clampedStep]

  /**
   * Pick a stable random transform-origin per Pokémon (src changes each round).
   * Values are percentages (0–100) so the crop point is anywhere on the image.
   * We bias slightly away from edges (20–80%) so the crop always shows something.
   */
  const origin = useMemo(() => {
    const x = 20 + Math.random() * 60
    const y = 20 + Math.random() * 60
    return `${x.toFixed(1)}% ${y.toFixed(1)}%`
  }, [src]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="relative flex items-center justify-center"
      aria-label={
        revealed
          ? `${alt} fully revealed`
          : `Mystery Pokémon, reveal step ${clampedStep + 1} of 5`
      }
    >
      {/* Glow behind the viewport */}
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
            transformOrigin: origin,
            transition: 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </div>
    </div>
  )
}
