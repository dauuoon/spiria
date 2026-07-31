import { useEffect, useRef } from 'react'

// Plays a short tap sound on every pointerdown / Enter / Space press.
// Uses WebAudio for low-latency playback and BASE_URL for correct path.
export default function TapSfx() {
  const ctxRef = useRef<AudioContext | null>(null)
  const tapBufferRef = useRef<AudioBuffer | null>(null)
  const lockBufferRef = useRef<AudioBuffer | null>(null)
  const gainRef = useRef<GainNode | null>(null)
  const loadingTapRef = useRef(false)
  const loadingLockRef = useRef(false)

  const tapSrcUrl = `${import.meta.env.BASE_URL}assets/sound/tap.mp3`
  const lockSrcUrl = `${import.meta.env.BASE_URL}assets/sound/lock.mp3`

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

  const ensureTapBuffer = async () => {
    if (tapBufferRef.current || loadingTapRef.current) return
    loadingTapRef.current = true
    try {
      const res = await fetch(tapSrcUrl)
      const arr = await res.arrayBuffer()
      await ensureContext()
      if (!ctxRef.current) return
      const buf = await ctxRef.current.decodeAudioData(arr)
      tapBufferRef.current = buf
    } finally {
      loadingTapRef.current = false
    }
  }

  const ensureLockBuffer = async () => {
    if (lockBufferRef.current || loadingLockRef.current) return
    loadingLockRef.current = true
    try {
      const res = await fetch(lockSrcUrl)
      const arr = await res.arrayBuffer()
      await ensureContext()
      if (!ctxRef.current) return
      const buf = await ctxRef.current.decodeAudioData(arr)
      lockBufferRef.current = buf
    } finally {
      loadingLockRef.current = false
    }
  }

  const playBuffer = async (kind: 'tap' | 'lock') => {
    await ensureContext()
    if (kind === 'tap') await ensureTapBuffer()
    else await ensureLockBuffer()
    const ctx = ctxRef.current
    const gain = gainRef.current
    const buf = kind === 'tap' ? tapBufferRef.current : lockBufferRef.current
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

  const isDisabledTarget = (e: Event) => {
    const anyE = e as any
    const path: any[] = typeof anyE.composedPath === 'function' ? anyE.composedPath() : []
    const nodes: any[] = path.length ? path : [e.target]

    for (const n of nodes) {
      if (!(n instanceof Element)) continue

      if (n instanceof HTMLButtonElement && n.disabled) return true

      if (n.getAttribute('aria-disabled') === 'true') return true
      if (n.getAttribute('data-disabled') === 'true') return true
    }

    return false
  }

  useEffect(() => {
    // Pre-warm on first interaction; then play on each tap unless suppressed.
    const shouldSuppress = (e: Event) => {
      const anyE = e as any
      const path: any[] = typeof anyE.composedPath === 'function' ? anyE.composedPath() : []
      const nodes: any[] = path.length ? path : [e.target]
      for (const n of nodes) {
        if (n && typeof n === 'object' && 'getAttribute' in n) {
          try {
            const val = (n as Element).getAttribute('data-suppress-tap-sfx')
            if (val === 'true') return true
          } catch {
            // ignore
          }
        }
      }
      return false
    }
    const onPointerDown = (e: PointerEvent) => {
      if (isDisabledTarget(e)) {
        void playBuffer('lock')
        return
      }
      if (shouldSuppress(e)) return
      void playBuffer('tap')
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') void playBuffer('tap')
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
