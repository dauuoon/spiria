import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'
import { ITEMS } from '../data/items'

// Inventory counts are TBD; UI focuses on selection layout (3x4 grid)
// When counts become available, wire them from store/state.

export default function CraftScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [selected, setSelected] = useState<string[]>([])

  const canCraft = selected.length === 3

  const slots = useMemo(() => [0, 1, 2].map((i) => selected[i] ?? null), [selected])

  const toggle = (id: string) => {
    setSelected((cur) => {
      const has = cur.includes(id)
      if (has) return cur.filter((x) => x !== id)
      if (cur.length >= 3) return cur // limit 3
      return [...cur, id]
    })
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/main_back_em.png')}
        alt="Craft background"
        className="absolute inset-0 w-full h-full object-cover"
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
      <div className="absolute inset-0 bg-black/25" />

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* subtle particles like main */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* quest letter + pot + slots */}
      <div className="absolute inset-0 z-[6] p-4 pt-16">
        {/* quest letter panel */}
        <div className="absolute left-3 top-14 w-[58%] max-w-[270px] rounded-xl bg-[rgba(245,240,233,0.95)] text-[rgb(55,42,36)] border border-[rgba(0,0,0,0.08)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] p-3">
          <div className="text-[14px] font-extrabold mb-1">정령 의뢰서</div>
          <div className="text-[12px] text-[rgb(85,70,60)]">1 / 3</div>
          <div className="h-[1px] bg-[rgba(0,0,0,0.1)] my-2" />
          <p className="text-[12px] leading-5">
            밤의 안개 속에서 길을 잃은 이들을 위해, 은은하게 빛나는 등불이 되어주세요.
          </p>
          <div className="mt-2 text-[11px] text-[rgb(110,90,80)]">- 별빛 마을의 여행자 -</div>
        </div>

        {/* pot center */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[18%] w-[70%]">
          <img src={a('assets/particle/pot.png')} alt="솥" className="w-full h-auto object-contain pointer-events-none select-none" />
        </div>

        {/* slots row */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[55%] w-[82%] max-w-[480px]">
          <div className="w-full rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_16px_32px_rgba(0,0,0,0.45)] px-5 py-4 flex items-center justify-center gap-5">
            {slots.map((s, i) => (
              <div key={i} className="relative w-16 h-16 rounded-full border border-white/15 bg-black/30 flex items-center justify-center text-white/70">
                {s ? (
                  <span className="text-[12px] font-semibold">{ITEMS.find((it) => it.id === s)?.name}</span>
                ) : (
                  <span className="text-[20px]">+</span>
                )}
              </div>
            ))}
            <div className="text-white/60 text-[20px]">→</div>
            <div className="w-16 h-16 rounded-xl bg-[rgba(100,80,160,0.3)] border border-white/15 flex items-center justify-center text-white/80">
              ?
            </div>
          </div>

          {/* craft button */}
          <div className="mt-3 flex items-center justify-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={!canCraft}
              className={`px-4 py-2 rounded-lg border text-[13px] font-semibold ${canCraft ? 'bg-[#8f78ff]/90 text-white border-white/20 hover:bg-[#8f78ff]' : 'bg-white/10 text-white/50 border-white/15 cursor-not-allowed'}`}
              onClick={() => alert('프로토타입: 정령을 빚었습니다!')}
            >
              정령 빚기
            </motion.button>
          </div>
        </div>

        {/* inventory grid */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-4 w-[92%]">
          <div className="grid grid-cols-3 gap-3">
            {ITEMS.map((it) => {
              const active = selected.includes(it.id)
              return (
                <motion.button
                  key={it.id}
                  type="button"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggle(it.id)}
                  className={`relative rounded-2xl p-3 text-left border ${active ? 'bg-[rgba(138,116,255,0.25)] border-[#a894ff]/40' : 'bg-[rgba(10,12,30,0.55)] border-white/10'} backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_12px_28px_rgba(0,0,0,0.4)]`}
                >
                  <div className="text-white font-semibold text-[14px] leading-tight">{it.name}</div>
                  {active && (
                    <span className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-[#A894FF] text-[12px] text-black font-extrabold flex items-center justify-center">{selected.indexOf(it.id) + 1}</span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
