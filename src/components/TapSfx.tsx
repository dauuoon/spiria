import { useEffect, useRef } from 'react'

// Plays a short tap sound on every pointerdown / Enter / Space press.
// Uses WebAudio for low-latency playback and BASE_URL for correct path.
export default function TapSfx() {
  const ctxRef = useRef<AudioContext | null>(null)
  const bufferRef = useRef<AudioBuffer | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const loadingRef = useRef(false)

  const srcUrl = `${import.meta.env.BASE_URL}assets/sound/tap.mp3`

  const ensureContext = async () => {
    if (!ctxRef.current) {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
      const ctx: AudioContext = new Ctx()
      ctxRef.current = ctx
      const gain = ctx.createGain()
      gain.gain.value = 0.6
      gain.connect(ctx.destination)
      gainRef.current = gain
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      try {
        await ctxRef.current.resume()
      } catch {
        // ignore
      }
    }
  }

  const ensureBuffer = async () => {
    if (bufferRef.current || loadingRef.current) return
    loadingRef.current = true
    try {
      const res = await fetch(srcUrl)
      const arr = await res.arrayBuffer()
      await ensureContext()
      if (!ctxRef.current) return
      const buf = await ctxRef.current.decodeAudioData(arr)
      bufferRef.current = buf
    } finally {
      loadingRef.current = false
    }
  }

  const playTap = async () => {
    await ensureContext()
    await ensureBuffer()
    const ctx = ctxRef.current
    const gain = gainRef.current
    const buf = bufferRef.current
    if (!ctx || !buf || !gain) return
    const src = ctx.createBufferSource()
    src.buffer = buf
    src.connect(gain)
    try {
      src.start(0)
    } catch {
      // ignore start race
    }
  }

  useEffect(() => {
    // Pre-warm on first interaction; then play on each tap.
    const onPointerDown = () => {
      void playTap()
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') void playTap()
    }
    window.addEventListener('pointerdown', onPointerDown, { capture: true })
    window.addEventListener('keydown', onKeyDown, { capture: true })
    return () => {
      window.removeEventListener('pointerdown', onPointerDown, { capture: true } as any)
      window.removeEventListener('keydown', onKeyDown, { capture: true } as any)
    }
  }, [])

  return null
}
