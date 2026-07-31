import { motion } from 'framer-motion'
import { useState } from 'react'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'

export default function BookScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const filters = ['전체','발견','미발견'] as const
  const [tab, setTab] = useState<(typeof filters)[number]>('전체')

  type Card = { name: string; img: string; discovered: boolean }
  const baseDiscovered: readonly Card[] = [
    { name: '소요', img: 'assets/codex/soyo.png', discovered: true },
    { name: '루아', img: 'assets/codex/rua.png', discovered: true },
    { name: '플레오', img: 'assets/codex/pleo.png', discovered: true },
    { name: '스텔리오', img: 'assets/codex/stellio.png', discovered: true },
    { name: '포리나', img: 'assets/codex/porina.png', discovered: true },
    { name: '누비', img: 'assets/codex/nubi.png', discovered: true },
    { name: '???', img: '', discovered: false },
    { name: '???', img: '', discovered: false },
    { name: '???', img: '', discovered: false },
  ] as const
  const totalCount = 220
  const fillers: Card[] = Array.from({ length: totalCount - baseDiscovered.length }, () => ({ name: '???', img: '', discovered: false }))
  const allCards: Card[] = [...baseDiscovered, ...fillers]
  const discoveredCount = allCards.reduce((acc, c) => acc + (c.discovered ? 1 : 0), 0)
  const undiscoveredCount = allCards.length - discoveredCount
  const filteredCards: Card[] = tab === '발견' ? allCards.filter(c => c.discovered)
    : tab === '미발견' ? allCards.filter(c => !c.discovered)
    : allCards

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/book.png')}
        alt="Book background"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = a('assets/background/main_back_em.png')
        }}
      />

      {/* glow accents */}
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

      {/* top book overlay image (above cards, below UI) */}
      <div className="absolute top-0 left-0 right-0 z-[12] pointer-events-none">
        <img
          src={a('assets/background/book_top.png')}
          alt=""
          className="block w-full h-auto object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>

      {/* overlay UI: Title, discovered text, and tabs above overlay image */}
      <div className="absolute left-5 right-5 top-[70px] z-[20]">
        {/* page header */}
        <div className="mb-3">
          <h2 className="text-[#b78960] text-[26px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">정령 도감</h2>
          <div className="mt-[6px] flex items-center gap-3 text-white/80 text-[12px]">
            <span className="text-[#b78960]">발견한 정령 {discoveredCount} / {totalCount}</span>
            <div className="relative h-2 w-[180px] bg-white/10 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E3BD87] to-[#E3BD87]/40"
                style={{ width: `${Math.max(0, Math.min(100, Math.round((discoveredCount / totalCount) * 100)))}%` }}
              />
            </div>
          </div>
        </div>
        {/* filters row */}
        <div className="mt-[20px] mb-2 flex items-center gap-2">
          {filters.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={
                `px-4 py-2 rounded-full text-[12px] transition-colors border ` +
                (tab === t
                  ? 'text-white bg-[linear-gradient(180deg,#6F49C6_0%,#8C66E8_100%)] border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_18px_rgba(78,41,141,0.45)]'
                  : 'text-[#E3BD87]/80 bg-white/[0.04] border-[#6A59A8]/30 hover:bg-white/[0.08]')
              }
            >
              {t}{'('}{t === '전체' ? allCards.length : t === '발견' ? discoveredCount : undiscoveredCount}{')'}
            </button>
          ))}
          <button className="ml-auto px-2.5 py-1.5 rounded-full border bg-white/10 text-white/80 hover:bg-white/15 border-white/20 text-[12px]">
            필터
          </button>
        </div>
      </div>

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* content (grid scroll area) */}
      <div className="absolute inset-0 z-[6] p-5 pt-[240px] overflow-y-auto book-scroll">
        {/* top overlay image moved outside scroll; keep spacer if needed */}

        {/* 3-col grid placeholder: positioned well under the top overlay */}
        <div className="grid grid-cols-3 gap-3 mt-[10px] pb-6 relative z-[1]">
          {filteredCards.map((c, idx) => (
            <motion.button
              key={idx}
              type="button"
              whileTap={{ scale: 0.96, y: 1 }}
              className="relative rounded-xl aspect-[3/4] overflow-hidden block w-full bg-transparent border-0 p-0 select-none focus:outline-none cursor-pointer"
              aria-label={c.discovered ? c.name : '미발견 슬롯'}
            >
              {/* card frame background */}
              <img
                aria-hidden
                src={a('assets/codex/card.PNG')}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              {/* creature artwork */}
              {c.discovered ? (
                <img
                  src={a(c.img)}
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain select-none"
                  draggable={false}
                  onError={(e) => {
                    const el = e.currentTarget as HTMLImageElement
                    // fallback to placeholder once
                    if (!el.dataset.fallback) {
                      el.dataset.fallback = '1'
                      el.src = a('assets/codex/unknown.png')
                      el.className = 'absolute left-1/2 top-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 object-contain select-none'
                    } else {
                      el.style.display = 'none'
                    }
                  }}
                />
              ) : (
                <img
                  src={a('assets/codex/unknown.png')}
                  alt=""
                  className="absolute left-1/2 top-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                  draggable={false}
                />
              )}

              {/* name label */}
              <div className="absolute bottom-[18px] left-0 right-0 text-center">
                <span
                  className={
                    `inline-block text-[17px] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] ` +
                    (c.discovered ? 'text-[#b78960]' : 'text-[#695369]')
                  }
                >
                  {c.discovered ? c.name : '???'}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* particles layer like main */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>
    </div>
  )
}
