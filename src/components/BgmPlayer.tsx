import { useEffect, useRef, useState } from 'react'

const BGM_SRC = `${import.meta.env.BASE_URL}assets/sound/bgm1.mp3`

export default function BgmPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const interactionHooked = useRef(false)
  const [enabled, setEnabled] = useState(true)

  // Create the audio element once
  useEffect(() => {
    const audio = new Audio(BGM_SRC)
    audio.loop = true
    audio.volume = 0.45
    audioRef.current = audio

    const tryPlay = async () => {
      if (!audioRef.current || !enabled) return
      try {
        await audioRef.current.play()
      } catch {
        // Autoplay likely blocked; wait for a user gesture
        if (!interactionHooked.current) {
          const resume = async () => {
            if (!audioRef.current || !enabled) return
            try {
              await audioRef.current.play()
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
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [])

  // React to enable/disable
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (enabled) {
      void audio.play().catch(() => {
        // ignore; will resume on next gesture
      })
    } else {
      audio.pause()
    }
  }, [enabled])

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
