import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import LoadingScreen from './components/LoadingScreen'
import MainScreen from './components/MainScreen'
import DevRemote from './components/DevRemote'
import BgmPlayer from './components/BgmPlayer'
import TapSfx from './components/TapSfx'
import useAppStore from './lib/store'
import { LEVEL_COLORS } from './data/levels'

const ExpeditionScreen = lazy(() => import('./components/ExpeditionScreen'))
const CraftScreen = lazy(() => import('./components/CraftScreen'))
const CraftResultScreen = lazy(() => import('./components/CraftResultScreen'))
const BookScreen = lazy(() => import('./components/BookScreen'))
const InventoryScreen = lazy(() => import('./components/InventoryScreen'))
const ProfileScreen = lazy(() => import('./components/ProfileScreen'))
const LicenseScreen = lazy(() => import('./components/LicenseScreen'))
const Map1Screen = lazy(() => import('./components/Map1Screen'))
const Map2Screen = lazy(() => import('./components/Map2Screen'))
const Map3Screen = lazy(() => import('./components/Map3Screen'))
const Map4Screen = lazy(() => import('./components/Map4Screen'))
const Map5Screen = lazy(() => import('./components/Map5Screen'))
const SpiritDetailScreen = lazy(() => import('./components/SpiritDetailScreen'))
const ExchangeScreen = lazy(() => import('./components/ExchangeScreen'))

const LEVEL_UP_PARTICLES = [
  { x: -84, y: -46, size: 10, delay: 0 },
  { x: -58, y: -72, size: 8, delay: 0.03 },
  { x: -18, y: -92, size: 7, delay: 0.06 },
  { x: 24, y: -88, size: 9, delay: 0.09 },
  { x: 62, y: -68, size: 8, delay: 0.12 },
  { x: 88, y: -34, size: 10, delay: 0.15 },
  { x: -92, y: 8, size: 8, delay: 0.18 },
  { x: 92, y: 12, size: 7, delay: 0.21 },
  { x: -48, y: 42, size: 9, delay: 0.24 },
  { x: 0, y: 56, size: 8, delay: 0.27 },
  { x: 46, y: 40, size: 9, delay: 0.3 },
  { x: 0, y: -118, size: 11, delay: 0.33 },
] as const

const TAB_SESSION_RESET_FLAG_KEY = 'spiria.tab-session-reset.v1'

export default function App() {
  const setProgress = useAppStore(s => s.setProgress)
  const screen = useAppStore(s => s.screen)
  const setScreen = useAppStore(s => s.setScreen)
  const resetGameData = useAppStore(s => s.resetGameData)
  const pendingLevelUp = useAppStore(s => s.pendingLevelUp)
  const showLevelUpPopup = useAppStore(s => s.showLevelUpPopup)
  const claimPendingLevelUpRewards = useAppStore(s => s.claimPendingLevelUpRewards)
  const warmedUpScreenChunksRef = useRef(false)

  useEffect(() => {
    let shouldReset = true
    try {
      shouldReset = sessionStorage.getItem(TAB_SESSION_RESET_FLAG_KEY) !== '1'
    } catch {
      shouldReset = true
    }

    if (!shouldReset) return

    resetGameData()
    try {
      sessionStorage.setItem(TAB_SESSION_RESET_FLAG_KEY, '1')
    } catch {
      // ignore storage errors
    }
  }, [resetGameData])

  // Preload critical startup assets and reflect real progress on loading screen.
  useEffect(() => {
    const criticalAssets = [
      'assets/background/loading.png',
      'assets/logo/logo.png',
      'assets/background/main_back_em.png',
      'assets/background/book.png',
      'assets/background/book_top.png',
      'assets/background/profile_back.png',
      'assets/background/make_back.png',
      'assets/background/map_back.png',
      'assets/particle/light.png',
      'assets/particle/btn_bg_brown.png',
      'assets/particle/btn_bg_sliver.png',
      'assets/codex/unknown.png',
      'assets/codex/card_common.png',
      'assets/codex/card_rare.png',
      'assets/codex/card_epic.png',
      'assets/codex/card_lezendary.png',
    ] as const

    let cancelled = false
    const base = import.meta.env.BASE_URL
    let loadedCount = 0

    const update = () => {
      const ratio = loadedCount / criticalAssets.length
      const pct = Math.round(Math.max(0, Math.min(1, ratio)) * 100)
      setProgress(pct)
    }

    update()

    const loadOne = (relativePath: string) => new Promise<void>((resolve) => {
      const img = new Image()
      img.decoding = 'async'
      img.onload = () => resolve()
      img.onerror = () => resolve()
      img.src = `${base}${relativePath.replace(/^\//, '')}`
    })

    ;(async () => {
      for (const asset of criticalAssets) {
        if (cancelled) return
        await loadOne(asset)
        loadedCount += 1
        update()
      }
      if (!cancelled) setProgress(100)
    })()

    return () => {
      cancelled = true
    }
  }, [setProgress])

  // Warm up frequently used screen chunks after initial loading to reduce first-navigation delay.
  useEffect(() => {
    if (screen === 'loading' || warmedUpScreenChunksRef.current) return
    warmedUpScreenChunksRef.current = true

    const timer = window.setTimeout(() => {
      void Promise.allSettled([
        import('./components/ExpeditionScreen'),
        import('./components/CraftScreen'),
        import('./components/CraftResultScreen'),
        import('./components/BookScreen'),
        import('./components/InventoryScreen'),
        import('./components/ProfileScreen'),
        import('./components/SpiritDetailScreen'),
        import('./components/ExchangeScreen'),
      ])
    }, 800)

    return () => window.clearTimeout(timer)
  }, [screen])

  return (
    <MotionConfig reducedMotion="never">
      <div className="min-h-screen bg-black flex items-center justify-center">
        {/* Mobile viewport (9:20) */}
        <div className="aspect-[9/20] w-[min(45dvh,calc(100vw-2rem))] max-h-[92dvh] rounded-3xl overflow-hidden shadow-soft border border-white/5 relative">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={screen}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <Suspense fallback={<LoadingScreen />}>
                {screen === 'loading' ? (
                  <LoadingScreen />
                ) : screen === 'expedition' ? (
                  <ExpeditionScreen />
                ) : screen === 'book' ? (
                  <BookScreen />
                ) : screen === 'craft' ? (
                  <CraftScreen />
                ) : screen === 'craftResult' ? (
                  <CraftResultScreen />
                ) : screen === 'bag' ? (
                  <InventoryScreen />
                ) : screen === 'profile' ? (
                  <ProfileScreen />
                ) : screen === 'license' ? (
                  <LicenseScreen />
                ) : screen === 'map1' ? (
                  <Map1Screen />
                ) : screen === 'map2' ? (
                  <Map2Screen />
                ) : screen === 'map3' ? (
                  <Map3Screen />
                ) : screen === 'map4' ? (
                  <Map4Screen />
                ) : screen === 'map5' ? (
                  <Map5Screen />
                ) : screen === 'spiritDetail' ? (
                  <SpiritDetailScreen />
                ) : screen === 'exchange' ? (
                  <ExchangeScreen />
                ) : (
                  <MainScreen />
                )}
              </Suspense>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* DEV floating remote (temporarily visible in production per request) */}
        <DevRemote screen={screen} onSelect={setScreen} />

        {/* Background music player (DEV toggle visible; plays on user gesture) */}
        <BgmPlayer />

        {/* Global tap SFX (plays on pointerdown / Enter / Space) */}
        <TapSfx />

        {showLevelUpPopup && pendingLevelUp && (
          <LevelUpPopup levelUp={pendingLevelUp} onClose={claimPendingLevelUpRewards} />
        )}

        {/* Resolution guard overlay (height <= 874px) */}
        <ResolutionOverlay />
      </div>
    </MotionConfig>
  )
}

function LevelUpPopup({
  levelUp,
  onClose,
}: {
  levelUp: NonNullable<ReturnType<typeof useAppStore.getState>['pendingLevelUp']>
  onClose: () => void
}) {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [isVisible, setIsVisible] = useState(false)
  const newLevelColor = LEVEL_COLORS[levelUp.newLevel] || '#f2d68f'

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 1000)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!isVisible) return
    try {
      const audio = new Audio(a('assets/sound/levelup.mp3'))
      audio.volume = 0.9
      void audio.play()
    } catch {
      // ignore
    }
  }, [a, isVisible])

  const handleClose = () => {
    try {
      const audio = new Audio(a('assets/sound/num_coin.mp3'))
      audio.volume = 0.9
      void audio.play()
    } catch {
      // ignore
    }
    onClose()
  }

  if (!isVisible) return null

  return (
    <div className="absolute inset-0 z-[999] bg-black/70 backdrop-blur-[2px] flex items-center justify-center px-5">
      <div className="relative w-full max-w-[396px] text-center">
        <div
          className="absolute left-1/2 top-0 z-[2] h-[92px] w-[92px] -translate-x-1/2 -translate-y-[42%]"
          style={{ backgroundColor: newLevelColor, maskImage: `url(${a('assets/particle/level_star.svg')})`, WebkitMaskImage: `url(${a('assets/particle/level_star.svg')})`, maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat', maskPosition: 'center', WebkitMaskPosition: 'center', maskSize: 'contain', WebkitMaskSize: 'contain' }}
        >
          <div className="flex h-full w-full items-center justify-center pt-1 text-[29px] font-black text-black">
            <CountUpNumber value={levelUp.newLevel} start={levelUp.previousLevel} durationMs={860} />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-0 z-[4] h-0 w-0 overflow-visible -translate-x-1/2 translate-y-[30px]">
          {LEVEL_UP_PARTICLES.map((particle, index) => (
            <motion.span
              key={`${particle.x}-${particle.y}-${index}`}
              className="absolute left-0 top-0 rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                background: `radial-gradient(circle, rgba(255,255,255,1) 0%, ${newLevelColor} 34%, rgba(255,255,255,0) 76%)`,
                boxShadow: `0 0 18px ${newLevelColor}`,
              }}
              initial={{ x: -particle.size / 2, y: -particle.size / 2, opacity: 0, scale: 0.2 }}
              animate={{ x: [ -particle.size / 2, particle.x, particle.x * 1.08 ], y: [ -particle.size / 2, particle.y, particle.y * 1.08 ], opacity: [0, 1, 0], scale: [0.2, 1, 0.45] }}
              transition={{ duration: 1.35, delay: 0.2 + particle.delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 1.8 }}
            />
          ))}
        </div>

        <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.55)] text-center">
          <img
            src={a('assets/background/paper_bg_dark_v_m.png')}
            alt="레벨업 배경"
            className="block w-full h-auto"
            draggable={false}
          />

          <div className="absolute inset-0 px-5 pb-6 pt-[82px] flex flex-col items-center justify-start">
            <div className="text-[32px] font-black tracking-[0.12em]" style={{ color: newLevelColor }}>·LEVEL UP·</div>

            <div
              className="mt-3 inline-flex min-h-[20px] items-center justify-center rounded-[999px] px-4 py-1 text-[13px] font-bold text-black"
              style={{ backgroundColor: newLevelColor }}
            >
              {levelUp.title}
            </div>

            <motion.div
              className="mt-3 flex items-center justify-center gap-2 whitespace-nowrap text-[16px] tracking-wide"
              animate={{ opacity: [1, 0.5, 1, 0.5] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="font-medium text-white/50">Lv.{levelUp.previousLevel}</span>
              <span className="text-[15px] text-white/50">&gt;&gt;&gt;</span>
              <span className="font-black" style={{ color: newLevelColor }}>Lv.<CountUpNumber value={levelUp.newLevel} start={levelUp.previousLevel} durationMs={860} /></span>
            </motion.div>

            <div className="mt-6 w-full max-w-[328px] rounded-[12px] bg-[rgba(255,255,255,0.07)] p-3 text-white">
              <div className="text-center text-[13px] font-semibold text-white">획득 보상</div>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-[15px] font-semibold text-white">
                <span className="flex items-center gap-1.5"><img src={a('assets/particle/money.png')} alt="gold" className="h-5 w-5 object-contain" draggable={false} />골드 +<CountUpNumber value={levelUp.rewards.gold} durationMs={920} /></span>
                <span className="flex items-center gap-1.5"><img src={a('assets/particle/gem.png')} alt="mana" className="h-5 w-5 object-contain" draggable={false} />마나 +<CountUpNumber value={levelUp.rewards.mana} durationMs={720} /></span>
              </div>
              {(levelUp.rewards.newTitle || levelUp.rewards.unlockedRegions.length > 0) && (
                <div className="mt-3 rounded-[10px] border border-white/10 bg-[rgba(0,0,0,0.2)] px-3 py-2 text-center text-[12px] leading-relaxed text-white/92">
                  <motion.div
                    className="space-y-1.5"
                    animate={{ opacity: [1, 0.55, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {levelUp.rewards.newTitle && (
                      <div>새로운 칭호를 획득! [<span className="font-bold text-white">{levelUp.rewards.newTitle}</span>]</div>
                    )}
                    {levelUp.rewards.unlockedRegions.map((regionName) => (
                      <div key={regionName}>새로운 맵 잠금 해제! [<span className="font-bold text-white">{regionName}</span>]</div>
                    ))}
                  </motion.div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="mt-6 h-11 w-full max-w-[328px] rounded-xl px-3 text-[15px] font-extrabold text-black shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]"
              style={{
                border: `1px solid ${newLevelColor}`,
                backgroundColor: `${newLevelColor}99`,
                boxShadow: `0 10px 28px ${newLevelColor}33, inset 0 0 0 1px rgba(255,255,255,0.12)`,
              }}
            >
              보상받기
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function CountUpNumber({
  value,
  start = 0,
  durationMs = 900,
}: {
  value: number
  start?: number
  durationMs?: number
}) {
  const [displayValue, setDisplayValue] = useState(start)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    setDisplayValue(start)
    const startedAt = performance.now()

    const step = (now: number) => {
      const elapsed = now - startedAt
      const progress = Math.min(1, elapsed / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      const nextValue = Math.round(start + (value - start) * eased)
      setDisplayValue(nextValue)

      if (progress < 1) {
        rafRef.current = window.requestAnimationFrame(step)
      }
    }

    rafRef.current = window.requestAnimationFrame(step)

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [durationMs, start, value])

  return <>{displayValue}</>
}

function ResolutionOverlay() {
  const [tooSmall, setTooSmall] = useState(false)
  useEffect(() => {
    const check = () => setTooSmall(window.innerHeight <= 874)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])
  if (!tooSmall) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-[1px] flex items-center justify-center select-none">
      <div className="text-center px-6">
        <p className="text-white text-[16px] sm:text-[18px] font-semibold tracking-wide">해상도가 제한됩니다.</p>
      </div>
    </div>
  )
}
