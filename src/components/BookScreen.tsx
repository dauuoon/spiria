import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import useAppStore from '../lib/store'
import { DEFAULT_SPIRIT_DETAIL_META, SPIRIT_DETAIL_META } from '../data/spiritDetails'
import { getSpiritAnimationFrames, getSpiritArtworkPath, sortSpiritsByDiscoveryOrder, SPIRITS } from '../data/spirits'
import type { SpiritRarity } from '../types/game'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'

export default function BookScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const openSpiritDetail = useAppStore(s => s.openSpiritDetail)
  const discoveredSpiritIds = useAppStore(s => s.discoveredSpiritIds)
  const acknowledgeBookNotifications = useAppStore(s => s.acknowledgeBookNotifications)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const tabs = ['전체', '발견', '미발견'] as const
  const [tab, setTab] = useState<(typeof tabs)[number]>('전체')

  useEffect(() => {
    acknowledgeBookNotifications()
  }, [acknowledgeBookNotifications])

  const cardFrameByRarity: Record<SpiritRarity, string> = {
    common: 'assets/codex/card_common.png',
    rare: 'assets/codex/card_rare.png',
    epic: 'assets/codex/card_epic.png',
    legendary: 'assets/codex/card_lezendary.png',
  }

  type Card = { id: string; name: string; img: string; discovered: boolean; rarity?: SpiritRarity }
  const baseOrder = sortSpiritsByDiscoveryOrder(SPIRITS)
  const latestFirstOrder = [...discoveredSpiritIds].reverse()
  const latestRank = new Map(latestFirstOrder.map((id, index) => [id, index]))

  const discoveredSpirits: Card[] = [...baseOrder]
    .sort((a, b) => {
      const aRank = latestRank.get(a.id)
      const bRank = latestRank.get(b.id)

      const aDiscovered = aRank !== undefined
      const bDiscovered = bRank !== undefined

      if (aDiscovered && bDiscovered) return aRank - bRank
      if (aDiscovered) return -1
      if (bDiscovered) return 1
      return 0
    })
    .map((spirit) => ({
    rarity: (SPIRIT_DETAIL_META[spirit.id] ?? DEFAULT_SPIRIT_DETAIL_META).rarityKey,
    id: spirit.id,
    name: spirit.name,
    img: getSpiritArtworkPath(spirit.id),
    discovered: discoveredSpiritIds.includes(spirit.id),
  }))
  const baseDiscovered: readonly Card[] = [
    ...discoveredSpirits,
    { id: 'spirit_unknown_1', name: '???', img: '', discovered: false },
    { id: 'spirit_unknown_2', name: '???', img: '', discovered: false },
    { id: 'spirit_unknown_3', name: '???', img: '', discovered: false },
  ] as const
  const totalCount = 80
  const fillers: Card[] = Array.from({ length: totalCount - baseDiscovered.length }, (_, idx) => ({
    id: `spirit_unknown_filler_${idx + 1}`,
    name: '???',
    img: '',
    discovered: false,
  }))
  const allCards: Card[] = [...baseDiscovered, ...fillers]
  const discoveredCount = allCards.reduce((acc, c) => acc + (c.discovered ? 1 : 0), 0)
  const undiscoveredCount = allCards.length - discoveredCount
  const filteredCards: Card[] = tab === '발견'
    ? allCards.filter((c) => c.discovered)
    : tab === '미발견'
      ? allCards.filter((c) => !c.discovered)
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
        <div className="mt-[20px] mb-2 flex items-center gap-2">
          {tabs.map((t) => (
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
              {t}({t === '전체' ? allCards.length : t === '발견' ? discoveredCount : undiscoveredCount})
            </button>
          ))}
        </div>
      </div>

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* content (grid scroll area) */}
      <div className="absolute inset-0 z-[6] p-5 pt-[240px] overflow-y-auto book-scroll">
        {/* top overlay image moved outside scroll; keep spacer if needed */}

        {/* 3-col grid placeholder: positioned well under the top overlay */}
        <div className="grid grid-cols-3 gap-3 mt-[10px] pb-6 relative z-[1]">
          {filteredCards.map((c) => (
              (() => {
                const spiritFrames = c.discovered ? getSpiritAnimationFrames(c.id) : []
                const hasAnimatedFrames = spiritFrames.length === 3
                return (
              <motion.button
                key={c.id}
                type="button"
                onClick={() => {
                  if (!c.discovered) return
                  openSpiritDetail(c.id)
                }}
                whileTap={{ scale: 0.96, y: 1 }}
                className="relative rounded-xl aspect-[3/4] overflow-hidden block w-full bg-transparent border-0 p-0 select-none focus:outline-none cursor-pointer"
                aria-label={c.discovered ? c.name : '미발견 슬롯'}
              >
              {/* card frame background */}
              <img
                aria-hidden
                src={a(c.discovered && c.rarity ? cardFrameByRarity[c.rarity] : 'assets/codex/card.PNG')}
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              {/* creature artwork */}
              {c.discovered ? hasAnimatedFrames ? (
                <div className="absolute inset-[8%]">
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.3, 0.2] }}
                    transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity }}
                    style={{
                      background: 'radial-gradient(circle, rgba(255,229,176,0.36) 0%, rgba(255,229,176,0.08) 52%, rgba(255,229,176,0) 74%)',
                    }}
                  />

                  <motion.div
                    className="relative z-[1] w-full h-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
                  >
                    <motion.img
                      src={a(spiritFrames[0])}
                      alt={`${c.name} 프레임 1`}
                      className="absolute left-1/2 top-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                      draggable={false}
                      animate={{ opacity: [1, 0, 0, 0, 1] }}
                      transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                    />
                    <motion.img
                      src={a(spiritFrames[1])}
                      alt={`${c.name} 프레임 2`}
                      className="absolute left-1/2 top-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                      draggable={false}
                      animate={{ opacity: [0, 1, 0, 1, 0] }}
                      transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                    />
                    <motion.img
                      src={a(spiritFrames[2])}
                      alt={`${c.name} 프레임 3`}
                      className="absolute left-1/2 top-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                      draggable={false}
                      animate={{ opacity: [0, 0, 1, 0, 0] }}
                      transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                    />
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  className="absolute inset-[8%]"
                  animate={{ y: [0, -9, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
                >
                  <img
                    src={a(c.img)}
                    alt=""
                    className="absolute left-1/2 top-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                    draggable={false}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement
                      // fallback to placeholder once
                      if (!el.dataset.fallback) {
                        el.dataset.fallback = '1'
                        el.src = a('assets/codex/unknown.png')
                        el.className = 'absolute left-1/2 top-1/2 w-[78%] h-[78%] -translate-x-1/2 -translate-y-1/2 object-contain select-none'
                      } else {
                        el.style.display = 'none'
                      }
                    }}
                  />
                </motion.div>
              ) : (
                <img
                  src={a('assets/codex/unknown.png')}
                  alt=""
                  className="absolute left-1/2 top-1/2 w-[78%] h-[78%] -translate-x-1/2 -translate-y-1/2 object-contain select-none"
                  draggable={false}
                />
              )}

              <div
                aria-hidden
                className="absolute left-[1px] right-[1px] bottom-0 h-[37%] z-[1] pointer-events-none"
                style={{
                  opacity: 0.75,
                  background: 'linear-gradient(to bottom, rgba(72,53,74,0) 0%, rgba(72,53,74,1) 100%)',
                }}
              />

              {/* name label */}
              <div className="absolute bottom-[18px] left-0 right-0 z-[2] text-center">
                <span
                  className={
                    `inline-block text-[17px] font-semibold drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] ` +
                    (c.discovered ? 'text-[#feecbd]' : 'text-[#695369]')
                  }
                >
                  {c.discovered ? c.name : '???'}
                </span>
              </div>
              </motion.button>
                )
              })()
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
