import { useEffect, useRef, useState } from 'react'
import useAppStore from '../lib/store'

const BGM_SRC_1 = `${import.meta.env.BASE_URL}assets/sound/bgm1.mp3`
const BGM_SRC_2 = `${import.meta.env.BASE_URL}assets/sound/magic_bgm.mp3`
const BGM_EXPEDITION = `${import.meta.env.BASE_URL}assets/sound/expedition_bgm.mp3`
const AMB_MAP1_BUG = `${import.meta.env.BASE_URL}assets/sound/bug.mp3`
const AMB_MAP2_WIND = `${import.meta.env.BASE_URL}assets/sound/wind.mp3`

export default function BgmPlayer() {
  const audioRef1 = useRef<HTMLAudioElement | null>(null)
  const audioRef2 = useRef<HTMLAudioElement | null>(null)
  const expeditionRef = useRef<HTMLAudioElement | null>(null)
  const ambMap1Ref = useRef<HTMLAudioElement | null>(null)
  const ambMap2Ref = useRef<HTMLAudioElement | null>(null)
  const interactionHooked = useRef(false)
  const [enabled, setEnabled] = useState(true)
  const screen = useAppStore(s => s.screen)

  // Create the audio element once
  useEffect(() => {
    const a1 = new Audio(BGM_SRC_1)
    a1.loop = true
    a1.volume = 0.35
    audioRef1.current = a1

    const a2 = new Audio(BGM_SRC_2)
    a2.loop = true
    a2.volume = 0.25
    audioRef2.current = a2

    const ae = new Audio(BGM_EXPEDITION)
    ae.loop = true
    ae.volume = 0.5
    expeditionRef.current = ae

    const am1 = new Audio(AMB_MAP1_BUG)
    am1.loop = true
    am1.volume = 0.28
    ambMap1Ref.current = am1

    const am2 = new Audio(AMB_MAP2_WIND)
    am2.loop = true
    am2.volume = 0.28
    ambMap2Ref.current = am2

    const tryPlay = async () => {
      if (!enabled) return
      try {
        // Play depending on current screen
        if (screen === 'expedition') {
          await Promise.allSettled([
            expeditionRef.current?.play() ?? Promise.resolve(),
          ])
        } else if (screen === 'map1') {
          await Promise.allSettled([
            expeditionRef.current?.play() ?? Promise.resolve(),
            ambMap1Ref.current?.play() ?? Promise.resolve(),
          ])
        } else if (screen === 'map2') {
          await Promise.allSettled([
            expeditionRef.current?.play() ?? Promise.resolve(),
            ambMap2Ref.current?.play() ?? Promise.resolve(),
          ])
        } else {
          await Promise.allSettled([
            audioRef1.current?.play() ?? Promise.resolve(),
            audioRef2.current?.play() ?? Promise.resolve(),
          ])
        }
      } catch {
        // Autoplay likely blocked; wait for a user gesture
        if (!interactionHooked.current) {
          const resume = async () => {
            if (!enabled) return
            try {
              if (screen === 'expedition') {
                await Promise.allSettled([
                  expeditionRef.current?.play() ?? Promise.resolve(),
                ])
              } else if (screen === 'map1') {
                await Promise.allSettled([
                  expeditionRef.current?.play() ?? Promise.resolve(),
                  ambMap1Ref.current?.play() ?? Promise.resolve(),
                ])
              } else if (screen === 'map2') {
                await Promise.allSettled([
                  expeditionRef.current?.play() ?? Promise.resolve(),
                  ambMap2Ref.current?.play() ?? Promise.resolve(),
                ])
              } else {
                await Promise.allSettled([
                  audioRef1.current?.play() ?? Promise.resolve(),
                  audioRef2.current?.play() ?? Promise.resolve(),
                ])
              }
            } catch {
              // ignore
            } finally {
              window.removeEventListener('pointerdown', resume)
              window.removeEventListener('keydown', resume)
            }
          }
          window.addEventListener('pointerdown', resume, { once: true })
          window.addEventListener('keydown', resume, { once: true })
          interactionHooked.current = true
        }
      }
    }

    void tryPlay()

    return () => {
      for (const a of [audioRef1.current, audioRef2.current, expeditionRef.current, ambMap1Ref.current, ambMap2Ref.current]) {
        if (a) {
          a.pause()
          a.src = ''
        }
      }
      audioRef1.current = null
      audioRef2.current = null
      expeditionRef.current = null
      ambMap1Ref.current = null
      ambMap2Ref.current = null
    }
  }, [])

  // React to enable/disable
  useEffect(() => {
    const a1 = audioRef1.current
    const a2 = audioRef2.current
    const ae = expeditionRef.current
    const am1 = ambMap1Ref.current
    const am2 = ambMap2Ref.current
    if (!a1 && !a2 && !ae && !am1 && !am2) return

    if (!enabled) {
      a1?.pause(); a2?.pause(); ae?.pause(); am1?.pause(); am2?.pause()
      return
    }

    if (screen === 'expedition') {
      a1?.pause(); a2?.pause(); am1?.pause(); am2?.pause()
      void Promise.allSettled([
        ae?.play() ?? Promise.resolve(),
      ])
    } else if (screen === 'map1') {
      a1?.pause(); a2?.pause(); am2?.pause()
      void Promise.allSettled([
        ae?.play() ?? Promise.resolve(),
        am1?.play() ?? Promise.resolve(),
      ])
    } else if (screen === 'map2') {
      a1?.pause(); a2?.pause(); am1?.pause()
      void Promise.allSettled([
        ae?.play() ?? Promise.resolve(),
        am2?.play() ?? Promise.resolve(),
      ])
    } else {
      ae?.pause(); am1?.pause(); am2?.pause()
      void Promise.allSettled([
        a1?.play() ?? Promise.resolve(),
        a2?.play() ?? Promise.resolve(),
      ])
    }
  }, [enabled, screen])

  if (!import.meta.env.DEV) return null

  return (
    <button
      type="button"
      onClick={() => setEnabled(v => !v)}
      className="fixed left-2 bottom-2 z-[70] px-2 py-1 rounded text-[10px] tracking-tight bg-white/10 text-white/70 hover:bg-white/20 hover:text-white/90 transition"
      aria-label="배경 음악 토글"
      title={enabled ? 'BGM: ON' : 'BGM: OFF'}
    >
      {enabled ? 'BGM ON' : 'BGM OFF'}
    </button>
  )
}
