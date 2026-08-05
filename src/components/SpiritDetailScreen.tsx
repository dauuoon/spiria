import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import TopBar from './TopBar'
import useAppStore, { SPIRIT_COMMUNICATION_DAILY_LIMIT } from '../lib/store'
import { getSpiritAnimationFrames, getSpiritArtworkPath, SPIRITS } from '../data/spirits'
import { DEFAULT_SPIRIT_DETAIL_META, SPIRIT_DETAIL_META } from '../data/spiritDetails'
import { SPIRIT_RARITY_TOKENS } from '../data/rarity'
import { getSpiritSummonHistory } from '../lib/spiritSummonHistory'

function getTodayLocalKey(now = new Date()) {
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function SpiritDetailScreen() {
  const setScreen = useAppStore((s) => s.setScreen)
  const selectedSpiritId = useAppStore((s) => s.selectedSpiritId)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const claimSpiritCommunicationReward = useAppStore((s) => s.claimSpiritCommunicationReward)
  const spiritCommunicationRewards = useAppStore((s) => s.spiritCommunicationRewards)

  const playRewardSfx = () => {
    try {
      const audio = new Audio(a('assets/sound/num_coin.mp3'))
      void audio.play()
    } catch {
      // ignore sound playback errors
    }
  }

  const spirit = SPIRITS.find((s) => s.id === selectedSpiritId) ?? SPIRITS[0]
  const meta = SPIRIT_DETAIL_META[spirit.id] ?? DEFAULT_SPIRIT_DETAIL_META
  const summonHistory = getSpiritSummonHistory(spirit.id)
  const spiritFrames = getSpiritAnimationFrames(spirit.id)
  const hasAnimatedFrames = spiritFrames.length === 3
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
  const accentColor = themeStyle.accent
  const summonCountText = summonHistory ? `${summonHistory.craftCount}회` : meta.craftCount
  const firstMetDateText = summonHistory?.firstMetDate ?? meta.firstMetDate
  const detailRarityColorByKey: Record<typeof meta.rarityKey, string> = {
    common: '#C2C7D1',
    rare: '#A894FF',
    epic: '#5FBFFF',
    legendary: '#F6E7A8',
  }
  const detailRarityColor = detailRarityColorByKey[meta.rarityKey]
  const conversationLines = meta.conversationLines?.length === 3
    ? meta.conversationLines
    : DEFAULT_SPIRIT_DETAIL_META.conversationLines
  const [isTalkOpen, setIsTalkOpen] = useState(false)
  const [talkLineIndex, setTalkLineIndex] = useState(0)
  const [typedTalkText, setTypedTalkText] = useState('')
  const [talkFeedback, setTalkFeedback] = useState<string | null>(null)
  const [todayKey, setTodayKey] = useState(() => getTodayLocalKey())
  const activeTalkLine = conversationLines[talkLineIndex] ?? ''
  const todayClaimedCount = spiritCommunicationRewards.dayKey === todayKey
    ? spiritCommunicationRewards.claimedCount
    : 0
  const isDailyTalkLimitReached = todayClaimedCount >= SPIRIT_COMMUNICATION_DAILY_LIMIT

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTodayKey(getTodayLocalKey())
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!isTalkOpen) {
      setTypedTalkText('')
      return
    }
    let index = 0
    setTypedTalkText('')
    const timer = window.setInterval(() => {
      index += 1
      setTypedTalkText(activeTalkLine.slice(0, index))
      if (index >= activeTalkLine.length) {
        window.clearInterval(timer)
      }
    }, 42)
    return () => window.clearInterval(timer)
  }, [activeTalkLine, isTalkOpen])

  const triggerSpiritTalk = () => {
    if (isDailyTalkLimitReached) {
      setIsTalkOpen(true)
      setTalkFeedback('오늘의 정령 소통 보상은 전체 합산 3회를 모두 받았습니다.')
      return
    }

    let nextIndex = 0
    if (conversationLines.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * conversationLines.length)
      } while (conversationLines.length > 1 && nextIndex === talkLineIndex)
    }
    setTalkLineIndex(nextIndex)
    setIsTalkOpen(true)

    const reward = claimSpiritCommunicationReward()
    if (reward.granted) {
      playRewardSfx()
      const rewardLabel = reward.rewardType === 'gold' ? `골드 +${reward.amount}` : `마나 +${reward.amount}`
      setTalkFeedback(`${rewardLabel} · 오늘 남은 소통 ${reward.remaining}회`)
      return
    }
    setTalkFeedback('오늘의 소통 보상은 모두 받았습니다.')
  }

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
              animate={{ y: [20, 17, 20] }}
              transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
            >
              {hasAnimatedFrames ? (
                <>
                  <motion.img
                    src={a(spiritFrames[0])}
                    alt={`${spirit.name} 프레임 1`}
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [1, 0.15, 0.15, 0.15, 1] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a(spiritFrames[1])}
                    alt={`${spirit.name} 프레임 2`}
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [0.15, 1, 0.15, 1, 0.15] }}
                    transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
                  />
                  <motion.img
                    src={a(spiritFrames[2])}
                    alt={`${spirit.name} 프레임 3`}
                    className="absolute inset-0 w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                    draggable={false}
                    animate={{ opacity: [0.15, 0.15, 1, 0.15, 0.15] }}
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

          <div className="-mt-[20px]">
            <button
              type="button"
              onClick={triggerSpiritTalk}
              disabled={isDailyTalkLimitReached}
              title={`말풍선 소통 (전체 ${todayClaimedCount}/${SPIRIT_COMMUNICATION_DAILY_LIMIT})`}
              aria-label={`말풍선 소통 (전체 ${todayClaimedCount}/${SPIRIT_COMMUNICATION_DAILY_LIMIT})`}
              className={`relative z-10 inline-flex h-12 w-12 items-center justify-center transition-opacity ${isDailyTalkLimitReached ? 'opacity-45 cursor-not-allowed' : 'opacity-100'}`}
            >
              <img src={a('assets/particle/talk.png')} alt="" aria-hidden className="h-12 w-12 object-contain" draggable={false} />
            </button>
            <AnimatePresence initial={false}>
              {isTalkOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -4, height: 0 }}
                  transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-0 mt-[-13px] w-full overflow-hidden rounded-[16px] bg-[rgba(0,0,0,0.5)] px-6 py-3 text-center"
                >
                  <p className="min-h-[30px] whitespace-pre-line text-[14px] leading-[1.6]" style={{ color: accentColor }}>
                    {typedTalkText}
                    {typedTalkText.length < activeTalkLine.length && <span className="ml-0.5 animate-pulse">|</span>}
                  </p>
                  {talkFeedback && (
                    <p className="mt-0.5 text-[12px] text-white/50">{talkFeedback}</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-[12px] text-center">
            <div
              className="rounded-[16px] px-6 py-3"
              style={{ backgroundColor: meta.storyBoxColor || 'rgba(8,10,20,0.5)' }}
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
