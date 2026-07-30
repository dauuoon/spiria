import { useEffect, useRef } from 'react'
import { useAnimationControls } from 'framer-motion'

/**
 * Provides framer-motion animation controls that trigger a short wiggle
 * at irregular intervals between minMs and maxMs.
 */
export default function useRandomWiggle(
  minMs = 3800,
  maxMs = 9200,
  ampDeg = 1.2,
  duration = 0.8,
) {
  const controls = useAnimationControls()
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    let t: ReturnType<typeof setTimeout> | undefined

    const schedule = () => {
      const delay = Math.floor(minMs + Math.random() * (maxMs - minMs))
      t = setTimeout(async () => {
        if (!alive.current) return
        try {
          await controls.start({
            rotate: [
              0,
              ampDeg,
              -ampDeg,
              ampDeg * 0.65,
              -ampDeg * 0.65,
              ampDeg * 0.35,
              -ampDeg * 0.2,
              0,
            ],
            transition: { duration, ease: 'easeInOut' }
          })
        } finally {
          if (alive.current) schedule()
        }
      }, delay)
    }

    schedule()

    return () => {
      alive.current = false
      if (t) clearTimeout(t)
    }
  }, [controls, minMs, maxMs])

  return controls
}
