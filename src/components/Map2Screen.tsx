import useAppStore from '../lib/store'
import { useState, useCallback, useEffect } from 'react'
import TopBar from './TopBar'
import { DUNGEONS } from '../data/dungeons'
import { motion, useAnimation } from 'framer-motion'
import ParticlesCanvas from './ParticlesCanvas'
import SoftGlow from './SoftGlow'

export default function Map2Screen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const bgControls = useAnimation()
  const circleControls = useAnimation()
  const randomAngle = () => (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.4)
  // listen for step events from touch layer to drive animations
  useEffect(() => {
    const handler = (e: any) => {
      const ang = e?.detail?.angle ?? randomAngle()
      void bgControls.start({
        scale: [1, 1.06, 1, 1.03, 1],
        rotateZ: [0, ang, 0, -ang, 0],
        transition: { duration: 0.6, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' }
      })
      void circleControls.start({ y: [0, -10, 0], transition: { duration: 0.28, ease: 'easeOut' } })
    }
    window.addEventListener('map2-step' as any, handler)
    return () => window.removeEventListener('map2-step' as any, handler)
  }, [bgControls, circleControls])
  return (
    <div className="relative w-full h-full bg-black">
      <motion.img
        animate={bgControls}
        src={a('assets/background/map2_back.png')}
        alt="Map2 background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* glow accents */}
      <div className="absolute inset-0 z-[4] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-60">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-45 scale-90">
          <SoftGlow />
        </div>
      </div>

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/20" />

      <TopBar onBack={() => setScreen('expedition')} title={DUNGEONS[1]?.name ?? 'Map2'} />

      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* interactive touch layer */}
      <Map2TouchLayer />

      {/* center hint text + magic circle (click-through) */}
      <div className="absolute inset-0 z-[7] flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="text-white/85 text-[14px] tracking-wide"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            아무 곳이나 터치해 탐색하세요.
          </motion.div>
          <motion.div animate={circleControls} className="mt-[50px] w-[54%] max-w-[360px]">
            <motion.img
              src={a('assets/particle/map2_magic circl.png')}
              alt="magic circle"
              className="w-full h-auto translate-x-[2%]"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              draggable={false}
            />
          </motion.div>
        </div>
      </div>

      {/* progress panel bottom-left */}
      <Map2Progress />
    </div>
  )
}

function Map2TouchLayer() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [used, setUsed] = useState(0)
  const TOTAL = 10
  const remaining = Math.max(0, TOTAL - used)
  const onTap = useCallback(() => {
    if (remaining <= 0) return
    try {
      const audio = new Audio(a('assets/sound/foot_stone.mp3'))
      audio.volume = 0.7
      void audio.play()
    } catch {}
    setUsed((u) => Math.min(TOTAL, u + 1))
    const nextUsed = Math.min(TOTAL, used + 1)
    window.dispatchEvent(new CustomEvent('map2-progress', { detail: { used: nextUsed } }))
    const ang = (Math.random() < 0.5 ? -1 : 1) * (0.4 + Math.random() * 0.4)
    window.dispatchEvent(new CustomEvent('map2-step', { detail: { angle: ang } }))
  }, [remaining, a, used])
  return <div className="absolute inset-0 z-[6]" data-suppress-tap-sfx="true" onPointerDown={onTap} />
}

function Map2Progress() {
  const [used, setUsed] = useState(0)
  const TOTAL = 10
  const remaining = Math.max(0, TOTAL - used)
  useEffect(() => {
    const handler = (e: any) => setUsed(e.detail?.used ?? 0)
    window.addEventListener('map2-progress' as any, handler)
    return () => window.removeEventListener('map2-progress' as any, handler)
  }, [])
  return (
    <div className="absolute left-3 bottom-3 z-[8] w-[260px] max-w-[62vw] select-none pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
      <div className="rounded-2xl bg-[rgba(10,12,30,0.45)] backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.35)] p-3">
        <div className="text-white/85 text-[12px] font-semibold">탐험 진행 ({remaining} / {TOTAL})</div>
        <div className="mt-2 flex items-center gap-2">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${i < remaining ? 'bg-[#8b5cf6]' : 'bg-transparent border border-white/20'}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
