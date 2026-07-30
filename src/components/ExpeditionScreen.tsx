import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'

export default function ExpeditionScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/main_back_em.png')}
        alt="Expedition background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* subtle glow accents */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-60">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-45 scale-90">
          <SoftGlow />
        </div>
      </div>

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/28" />

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* subtle particles like main */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* content */}
      <div className="absolute inset-0 z-[6] flex items-center justify-center p-6">
        <div className="w-full max-w-[85%] rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_32px_rgba(0,0,0,0.45)] p-5 text-center">
          <h2 className="text-white font-semibold text-[18px] mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">탐험 준비중</h2>
          <p className="text-white/80 text-[13px]">탐험 지역과 파티 편성이 곧 추가됩니다.</p>
        </div>
      </div>
    </div>
  )
}
