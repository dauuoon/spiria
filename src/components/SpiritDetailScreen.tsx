import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import TopBar from './TopBar'
import useAppStore from '../lib/store'
import { getSpiritArtworkPath, SPIRITS } from '../data/spirits'
import { DEFAULT_SPIRIT_DETAIL_META, SPIRIT_DETAIL_META } from '../data/spiritDetails'
import { SPIRIT_RARITY_TOKENS } from '../data/rarity'
import { getSpiritSummonHistory } from '../lib/spiritSummonHistory'

export default function SpiritDetailScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const selectedSpiritId = useAppStore((s) => s.selectedSpiritId)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  const spirit = SPIRITS.find((s) => s.id === selectedSpiritId) ?? SPIRITS[0]
  const meta = SPIRIT_DETAIL_META[spirit.id] ?? DEFAULT_SPIRIT_DETAIL_META
  const summonHistory = getSpiritSummonHistory(spirit.id)
  const isSoyo = spirit.id === 'spirit_soyo'
  const [isHistoryOpen, setIsHistoryOpen] = useState(true)

  const themePalette: Record<string, { overlay: string; glow: string; accent: string }> = {
    '따뜻한 골드': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(255, 215, 150, 0.26), rgba(11, 11, 11, 0.72) 60%)',
      glow: 'radial-gradient(circle, rgba(255,215,150,0.34) 0%, rgba(255,215,150,0.10) 54%, rgba(255,215,150,0) 74%)',
      accent: '#e7b96e',
    },
    '차가운 푸른빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(140, 199, 255, 0.24), rgba(10, 18, 28, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(140,199,255,0.30) 0%, rgba(140,199,255,0.10) 54%, rgba(140,199,255,0) 74%)',
      accent: '#8ec7ff',
    },
    '보라빛 신비': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(187, 152, 255, 0.24), rgba(22, 14, 32, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(187,152,255,0.30) 0%, rgba(187,152,255,0.10) 54%, rgba(187,152,255,0) 74%)',
      accent: '#b99cff',
    },
    '붉은 불빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(255, 151, 94, 0.24), rgba(34, 14, 10, 0.76) 60%)',
      glow: 'radial-gradient(circle, rgba(255,151,94,0.30) 0%, rgba(255,151,94,0.10) 54%, rgba(255,151,94,0) 74%)',
      accent: '#ff9d63',
    },
    '푸릇한 그린빛': {
      overlay: 'radial-gradient(circle at 50% 35%, rgba(140, 225, 140, 0.24), rgba(10, 24, 14, 0.74) 60%)',
      glow: 'radial-gradient(circle, rgba(140,225,140,0.30) 0%, rgba(140,225,140,0.10) 54%, rgba(140,225,140,0) 74%)',
      accent: '#7fda7f',
    },
  }
  const themeStyle = themePalette[meta.themeLabel] ?? themePalette['따뜻한 골드']
  const accentColor = isSoyo ? '#eaa49a' : themeStyle.accent
  const summonCountText = summonHistory ? `${summonHistory.craftCount}회` : meta.craftCount
  const firstMetDateText = summonHistory?.firstMetDate ?? meta.firstMetDate
  const detailRarityColorByKey: Record<typeof meta.rarityKey, string> = {
    common: '#C2C7D1',
    rare: '#A894FF',
    epic: '#5FBFFF',
    legendary: '#F6E7A8',
  }
  const detailRarityColor = detailRarityColorByKey[meta.rarityKey]

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <img
        src={a('assets/background/book.png')}
        alt="정령 상세 배경"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: themeStyle.overlay }} />

      <TopBar onBack={() => setScreen('book')} />

      <div className="absolute inset-0 z-10 overflow-y-auto px-5 pt-[90px] pb-24">
        <div className="mx-auto w-full max-w-[360px] text-center">
          <div className="text-[#d4b183] font-semibold tracking-wide" style={{ fontSize: '36px', lineHeight: '1.2' }}>{spirit.name}</div>

          <div className="mt-2 flex items-center justify-center gap-2 text-[14px]">
            <span className="px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/80">
              {meta.typeLabel}
            </span>
            <span
              className="px-2 py-0.5 rounded-full border text-white/80"
              style={{
                color: detailRarityColor,
                borderColor: detailRarityColor,
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              {meta.rarityLabel}
            </span>
          </div>

          <div className="relative mt-4 h-[300px] flex items-center justify-center">
            <motion.div
              className="absolute w-[270px] h-[270px] rounded-full"
              animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.3, 0.2] }}
              transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity }}
              style={{
                background: themeStyle.glow,
              }}
            />

            <motion.div
              className="relative z-10 w-[260px] h-[260px]"
              animate={{ y: [20, 12, 20] }}
              transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
            >
              {isSoyo ? (
                <>
                  <motion.img
                    src={a('assets/spirt/soyo1.png')}
                    alt="소요 기본상태 1"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [1, 0, 0, 0, 1] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a('assets/spirt/soyo2.png')}
                    alt="소요 기본상태 2"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [0, 1, 0, 1, 0] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a('assets/spirt/soyo3.png')}
                    alt="소요 입벌림"
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [0, 0, 1, 0, 0] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                </>
              ) : (
                <img
                  src={a(getSpiritArtworkPath(spirit.id))}
                  alt={spirit.name}
                  className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                  draggable={false}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = a('assets/codex/unknown.png')
                  }}
                />
              )}
            </motion.div>
          </div>

          <div className="mt-[28px] text-center">
            <div
              className="rounded-[16px] px-6 py-3"
              style={{ backgroundColor: isSoyo ? 'rgba(69, 47, 44, 0.5)' : 'rgba(8,10,20,0.5)' }}
            >
              <p className="whitespace-pre-line text-[15px] leading-[1.7] text-white/90 break-words overflow-wrap-anywhere">
                {meta.story}
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {meta.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="h-[20px] rounded-full bg-transparent px-1 text-[12px] leading-[20px]"
                    style={{
                      color: accentColor,
                      fontWeight: 600,
                      letterSpacing: '0.02em',
                    }}
                  >
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div
            className="my-8 h-px w-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 50%, transparent 100%)`,
              opacity: 0.75,
            }}
          />

          <div className="text-left">
            <button
              type="button"
              onClick={() => setIsHistoryOpen((prev) => !prev)}
              className="mb-2 flex w-full items-center justify-between gap-2 text-[15px] font-semibold tracking-wide text-[#c8c3b8]"
            >
              <span className="flex items-center gap-2">
                <img src={a('assets/particle/history.png')} alt="" className="h-4 w-4 object-contain" />
                <span>정령 소환 기록</span>
              </span>
              <img
                src={a(`assets/particle/${isHistoryOpen ? 'arrow_up.svg' : 'arrow_down.svg'}`)}
                alt=""
                className="h-4 w-4 object-contain"
              />
            </button>
            <AnimatePresence initial={false}>
              {isHistoryOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="mt-1 overflow-hidden rounded-[14px] bg-[rgba(255,255,255,0.03)] px-3 py-2.5 text-[13px] leading-[1.75] text-[#d7d2c8]"
                >
                  <div><span className="text-[#b8b1a4]">소환 횟수</span>: <span className="font-semibold text-[#e8e3d7]">{summonCountText}</span></div>
                  <div><span className="text-[#b8b1a4]">최고 일치율</span>: <span className="font-semibold text-[#e8e3d7]">{meta.requestMatchRate}</span></div>
                  <div><span className="text-[#b8b1a4]">첫 소환일</span>: <span className="font-semibold text-[#e8e3d7]">{firstMetDateText}</span></div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
