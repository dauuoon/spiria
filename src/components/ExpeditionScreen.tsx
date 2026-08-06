import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import { DUNGEONS } from '../data/dungeons'
import { REGIONS } from '../data/regions'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'
import { useEffect, useMemo, useRef, useState } from 'react'
import { MANA_PER_EXPLORE } from '../data/constants'
import { TRACE_ITEM_BY_STAGE } from '../data/items'
import { HIDDEN_STAGE_BALANCE } from '../data/hiddenStage'

type MapScreen = 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type EntryTarget = {
  stage: 1 | 2 | 3 | 4 | 5
  screen: MapScreen
  hiddenAvailable: boolean
  hiddenTraceItemId: string
  hiddenTraceRequired: number
}

const TAP_SFX_PATH = 'assets/sound/tap.mp3'

function playTapSfx() {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}${TAP_SFX_PATH}`)
    audio.volume = 0.85
    void audio.play()
  } catch {
    // ignore audio failures
  }
}

export default function ExpeditionScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const level = useAppStore(s => s.level)
  const mana = useAppStore(s => s.mana)
  const maxMana = useAppStore(s => s.maxMana)
  const manaUpdatedAt = useAppStore(s => s.manaUpdatedAt)
  const inventory = useAppStore(s => s.inventory)
  const recomputeMana = useAppStore(s => s.recomputeMana)
  const spendMana = useAppStore(s => s.spendMana)
  const consumeItem = useAppStore(s => s.consumeItem)
  const setActiveHiddenStage = useAppStore(s => s.setActiveHiddenStage)
  const pendingHiddenStageJump = useAppStore(s => s.pendingHiddenStageJump)
  const clearPendingHiddenStageJump = useAppStore(s => s.clearPendingHiddenStageJump)
  const acknowledgeExpeditionMapUnlockNotifications = useAppStore(s => s.acknowledgeExpeditionMapUnlockNotifications)
  const [entryTarget, setEntryTarget] = useState<EntryTarget | null>(null)
  const [isViewportHeight800, setIsViewportHeight800] = useState(false)
  const entryActionLockRef = useRef(false)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const isUnlocked = (stage: number) => level >= DUNGEONS[stage - 1]?.unlockLv
  const hasMana = mana > 0
  const playLockSfx = () => {
    try {
      const audio = new Audio(a('assets/sound/lock.mp3'))
      audio.volume = 0.8
      void audio.play()
    } catch {
      // ignore
    }
  }

  const hiddenTraceInfoByStage = useMemo(() => {
    return {
      1: {
        itemId: TRACE_ITEM_BY_STAGE[1],
        required: REGIONS[0]?.hiddenStageRequiredAmount ?? HIDDEN_STAGE_BALANCE.entryTraceCost,
      },
      2: {
        itemId: TRACE_ITEM_BY_STAGE[2],
        required: REGIONS[1]?.hiddenStageRequiredAmount ?? HIDDEN_STAGE_BALANCE.entryTraceCost,
      },
      3: {
        itemId: TRACE_ITEM_BY_STAGE[3],
        required: REGIONS[2]?.hiddenStageRequiredAmount ?? HIDDEN_STAGE_BALANCE.entryTraceCost,
      },
      4: {
        itemId: TRACE_ITEM_BY_STAGE[4],
        required: REGIONS[3]?.hiddenStageRequiredAmount ?? HIDDEN_STAGE_BALANCE.entryTraceCost,
      },
      5: {
        itemId: TRACE_ITEM_BY_STAGE[5],
        required: REGIONS[4]?.hiddenStageRequiredAmount ?? HIDDEN_STAGE_BALANCE.entryTraceCost,
      },
    } as const
  }, [])

  const canEnterHiddenStage = (stage: 1 | 2 | 3 | 4 | 5) => {
    const info = hiddenTraceInfoByStage[stage]
    const owned = inventory[info.itemId] ?? 0
    return owned >= info.required
  }

  const requestEnter = (stage: 1 | 2 | 3 | 4 | 5, screen: MapScreen) => {
    if (!isUnlocked(stage)) { playLockSfx(); return }
    if (!hasMana) { playLockSfx(); return }
    const info = hiddenTraceInfoByStage[stage]
    setEntryTarget({
      stage,
      screen,
      hiddenAvailable: canEnterHiddenStage(stage),
      hiddenTraceItemId: info.itemId,
      hiddenTraceRequired: info.required,
    })
  }

  const confirmNormalEnter = () => {
    if (!entryTarget) return
    if (entryActionLockRef.current) return
    entryActionLockRef.current = true
    const manaCost = DUNGEONS[entryTarget.stage - 1]?.manaCost ?? MANA_PER_EXPLORE
    const ok = spendMana(manaCost)
    if (ok) {
      setActiveHiddenStage(null)
      setScreen(entryTarget.screen)
      setEntryTarget(null)
    } else {
      playLockSfx()
      entryActionLockRef.current = false
    }
  }

  const confirmHiddenEnter = () => {
    if (!entryTarget) return
    if (entryActionLockRef.current) return
    entryActionLockRef.current = true
    const owned = inventory[entryTarget.hiddenTraceItemId] ?? 0
    if (owned < entryTarget.hiddenTraceRequired) {
      playLockSfx()
      entryActionLockRef.current = false
      return
    }

    consumeItem(entryTarget.hiddenTraceItemId, entryTarget.hiddenTraceRequired)
    setActiveHiddenStage(entryTarget.stage)
    setScreen(entryTarget.screen)
    setEntryTarget(null)
  }

  useEffect(() => {
    acknowledgeExpeditionMapUnlockNotifications()
  }, [acknowledgeExpeditionMapUnlockNotifications])

  useEffect(() => {
    const check = () => setIsViewportHeight800(window.innerHeight === 800)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])

  useEffect(() => {
    if (!entryTarget) {
      entryActionLockRef.current = false
    }
  }, [entryTarget])

  useEffect(() => {
    if (!pendingHiddenStageJump) return

    const stage = pendingHiddenStageJump
    const targetScreen: Record<1 | 2 | 3 | 4 | 5, MapScreen> = {
      1: 'map1',
      2: 'map2',
      3: 'map3',
      4: 'map4',
      5: 'map5',
    }
    clearPendingHiddenStageJump()
    requestEnter(stage, targetScreen[stage])
  }, [pendingHiddenStageJump, clearPendingHiddenStageJump, requestEnter])

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/map_back.png')}
        alt="Expedition background"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = a('assets/background/main_back_em.png')
        }}
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

      {/* map nodes (temporary placement with press effect) */}
      <div className="absolute inset-0 z-[6] pointer-events-auto select-none">
        {/* 1단계: 좌상단 숲 */}
        <motion.button
          type="button"
          aria-label="1단계"
          className="absolute left-[10%] top-[26%] w-[48%] max-w-none cursor-pointer"
          style={{ x: -25, y: -25 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(1, 'map1')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map1.png')}
              alt="1단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a('assets/particle/ok1.png')}
              alt="1단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '100px', left: 'calc(50% + 35px)' }}
            />
              {canEnterHiddenStage(1) && <HiddenReadyBadge moveLeft={10} moveUp={15} />}
          </motion.div>
        </motion.button>

        {/* 2단계: 우상단 결정 산맥 */}
        <motion.button
          type="button"
          aria-label="2단계"
          className="absolute right-[8%] top-[30%] w-[51%] max-w-none cursor-pointer"
          style={{ x: isViewportHeight800 ? 26 : 65, y: isViewportHeight800 ? -14 : -30 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(2, 'map2')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map2.png')}
              alt="2단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(2) ? 'assets/particle/ok2.png' : 'assets/particle/no2.png')}
              alt="2단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '75px', left: 'calc(50% + 25px)' }}
            />
              {canEnterHiddenStage(2) && <HiddenReadyBadge moveLeft={10} moveUp={15} />}
          </motion.div>
        </motion.button>

        {/* 3단계: 우중단 빙설 */}
        <motion.button
          type="button"
          aria-label="3단계"
          className="absolute left-[6%] top-[56%] w-[56%] max-w-none cursor-pointer"
          style={{ x: isViewportHeight800 ? 146 : 200, y: isViewportHeight800 ? -74 : -95 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(3, 'map3')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map3.png')}
              alt="3단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(3) ? 'assets/particle/ok3.png' : 'assets/particle/no3.png')}
              alt="3단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '60px', left: 'calc(50% - 30px)' }}
            />
              {canEnterHiddenStage(3) && <HiddenReadyBadge moveLeft={15} moveUp={0} />}
          </motion.div>
        </motion.button>

        {/* 4단계: 좌중단 화산 */}
        <motion.button
          type="button"
          aria-label="4단계"
          className="absolute right-[6%] top-[55%] w-[56%] max-w-none cursor-pointer"
          style={{ x: -180, y: -75 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(4, 'map4')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map4.png')}
              alt="4단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(4) ? 'assets/particle/ok4.png' : 'assets/particle/no4.png')}
              alt="4단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '80px', left: 'calc(50% + 35px)' }}
            />
              {canEnterHiddenStage(4) && <HiddenReadyBadge moveLeft={25} moveUp={25} />}
          </motion.div>
        </motion.button>

        {/* 5단계: 하단 중앙 슬라임 */}
        <motion.button
          type="button"
          aria-label="5단계"
          className="absolute left-1/2 -translate-x-1/2 w-[68%] max-w-none cursor-pointer"
          style={{ bottom: 'calc(7% + 20px)', x: -75, y: -75 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(5, 'map5')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map5.png')}
              alt="5단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(5) ? 'assets/particle/ok5.png' : 'assets/particle/no5.png')}
              alt="5단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '5px', left: 'calc(50% + 65px)' }}
            />
              {canEnterHiddenStage(5) && <HiddenReadyBadge moveLeft={15} moveUp={0} />}
          </motion.div>
        </motion.button>
      </div>
      {/* bottom overlays: mana count and timer */}
      <EnergyOverlays
        a={a}
        mana={mana}
        maxMana={maxMana}
        manaUpdatedAt={manaUpdatedAt}
        onTick={recomputeMana}
        isViewportHeight800={isViewportHeight800}
      />

      {entryTarget && (
        <MapEntryModal
          a={a}
          mapName={DUNGEONS[entryTarget.stage - 1]?.name ?? `${entryTarget.stage}단계`}
          manaCost={DUNGEONS[entryTarget.stage - 1]?.manaCost ?? MANA_PER_EXPLORE}
          hiddenAvailable={entryTarget.hiddenAvailable}
          hiddenTraceItemId={entryTarget.hiddenTraceItemId}
          hiddenTraceRequired={entryTarget.hiddenTraceRequired}
          onCancel={() => setEntryTarget(null)}
          onConfirmNormal={confirmNormalEnter}
          onConfirmHidden={confirmHiddenEnter}
        />
      )}
    </div>
  )
}

function HiddenReadyBadge({ moveLeft = 0, moveUp = 0 }: { moveLeft?: number; moveUp?: number }) {
  return (
    <motion.div
      className="absolute left-1/2 top-1/2 z-[20] -translate-x-1/2 -translate-y-1/2"
      style={{ x: -moveLeft, y: -moveUp }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.95, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#de4e57] text-[18px] font-black text-white shadow-[0_8px_18px_rgba(0,0,0,0.42)] drop-shadow-[0_2px_6px_rgba(0,0,0,0.38)]">
        !
      </div>
    </motion.div>
  )
}

function MapEntryModal({
  a,
  mapName,
  manaCost,
  hiddenAvailable,
  hiddenTraceItemId,
  hiddenTraceRequired,
  onCancel,
  onConfirmNormal,
  onConfirmHidden,
}: {
  a: (p: string) => string
  mapName: string
  manaCost: number
  hiddenAvailable: boolean
  hiddenTraceItemId: string
  hiddenTraceRequired: number
  onCancel: () => void
  onConfirmNormal: () => void
  onConfirmHidden: () => void
}) {
  const traceIconSrc = {
    forest_trace: 'assets/item/it/it_forestmap.png',
    wind_trace: 'assets/item/it/it_windmap.png',
    lake_trace: 'assets/item/it/it_lakemap.png',
    ruins_trace: 'assets/item/it/it_ruinsmap.png',
    final_trace: 'assets/item/it/it_finalmap.png',
  }[hiddenTraceItemId] ?? 'assets/item/it/it_forestmap.png'

  return (
    <div className="absolute inset-0 z-[40] bg-black/65 backdrop-blur-[2px] flex items-center justify-center px-5">
      <div className="relative w-full max-w-[426px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] text-center">
        <img
          src={a('assets/background/paper_bg_dark_l.png')}
          alt="입장 확인 배경"
          className="block w-full h-auto"
          draggable={false}
        />
        <div className="absolute inset-0 px-6 py-5 flex flex-col items-center justify-center">
          <div className="text-white text-[21px] font-medium leading-tight">{hiddenAvailable ? '숨겨진 장소에 들어가시겠습니까?' : '정말 입장하시겠습니까?'}</div>
          {hiddenAvailable ? (
            <p className="mt-2 text-white/75 text-[14px] leading-relaxed">
              <span className="text-[#efdcaf] font-semibold">{mapName}</span>에서 숨겨진 장소의 기운이 느껴집니다.
            </p>
          ) : (
            <>
              <p className="mt-1 text-white/75 text-[14px] leading-relaxed">
                <span className="text-[#efdcaf] font-semibold">{mapName}</span> 입장 시 아래 비용이 소요됩니다.
              </p>
              <div className="mt-3 mb-5 flex items-center justify-center gap-2 text-[#877cf1] font-bold text-[16px] -translate-x-[2px]">
                <img src={a('assets/particle/gem.png')} alt="마나" className="w-4 h-4 translate-y-[2px]" draggable={false} />
                <span>-{manaCost}개</span>
              </div>
            </>
          )}

          <div className="mt-2 flex items-center justify-center gap-3">
            {hiddenAvailable ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    playTapSfx()
                    onConfirmNormal()
                  }}
                  data-suppress-tap-sfx="true"
                  className="relative h-12 w-[138px] rounded-lg overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-white transition-transform duration-100 active:scale-95"
                >
                  <img
                    src={a('assets/particle/btn_bg_sliver.png')}
                    alt="아니요 버튼 이미지"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    draggable={false}
                  />
                  <span className="relative z-[1] inline-flex items-center gap-1.5 -translate-y-[1px] text-[14px] font-bold tracking-[0.01em]">
                    기존 맵
                    <img src={a('assets/particle/gem.png')} alt="마나" className="h-4 w-4 shrink-0 object-contain" draggable={false} />
                    <span>-{manaCost}</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTapSfx()
                    onConfirmHidden()
                  }}
                  data-suppress-tap-sfx="true"
                  className="relative h-12 w-[138px] rounded-lg overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
                >
                  <img
                    src={a('assets/particle/btn_bg_brown.png')}
                    alt="네 버튼 이미지"
                    className="absolute inset-0 w-full h-full object-cover opacity-62"
                    draggable={false}
                  />
                  <span className="relative z-[1] inline-flex items-center gap-1.5 -translate-y-[1px] text-[14px] font-bold tracking-[0.01em]">
                    히든 맵
                    <img src={a(traceIconSrc)} alt="지역의 흔적" className="h-4 w-4 shrink-0 object-contain" draggable={false} />
                    <span>-{hiddenTraceRequired}</span>
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    playTapSfx()
                    onCancel()
                  }}
                  data-suppress-tap-sfx="true"
                  className="relative h-11 w-[132px] rounded-lg overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-white transition-transform duration-100 active:scale-95"
                >
                  <img
                    src={a('assets/particle/btn_bg_sliver.png')}
                    alt="취소 버튼 이미지"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                    draggable={false}
                  />
                  <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide">취소하기</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playTapSfx()
                    onConfirmNormal()
                  }}
                  data-suppress-tap-sfx="true"
                  className="relative h-11 w-[132px] rounded-lg overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
                >
                  <img
                    src={a('assets/particle/btn_bg_brown.png')}
                    alt="입장하기 버튼 이미지"
                    className="absolute inset-0 w-full h-full object-cover opacity-62"
                    draggable={false}
                  />
                  <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide">입장하기</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function EnergyOverlays({ a, mana, maxMana, manaUpdatedAt, onTick, isViewportHeight800 }: {
  a: (p: string) => string
  mana: number
  maxMana: number
  manaUpdatedAt: number | null
  onTick: () => void
  isViewportHeight800: boolean
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
      onTick()
    }, 1000)
    return () => clearInterval(id)
  }, [onTick])

  const timeLeftMs = useMemo(() => {
    if (!manaUpdatedAt || mana >= maxMana) return 0
    return Math.max(0, manaUpdatedAt - now)
  }, [manaUpdatedAt, now, mana, maxMana])

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const hh = Math.floor(s / 3600)
    const mm = Math.floor((s % 3600) / 60)
    const ss = s % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`
  }

  return (
    <div className="absolute inset-0 z-[8] pointer-events-none select-none">
      {/* count panel - bottom left */}
      <div className="absolute left-4 bottom-12 w-[215px] max-w-[46vw]">
        <div className="relative">
          <img src={a('assets/particle/possiblenum.png')} alt="탐험 가능 횟수 패널" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col justify-center pl-20 pr-8 translate-y-[17px] rotate-[8deg] origin-left">
            <div className={`text-[#000000] drop-shadow-sm leading-none opacity-90 ${isViewportHeight800 ? 'text-[12px]' : 'text-[14px]'}`}>탐험 가능 횟수</div>
            <div className="mt-1 flex items-center gap-1">
              <img src={a('assets/particle/gem.png')} alt="마나" className="w-4 h-4" draggable={false} />
              <div className={`text-black font-semibold tracking-wide ${isViewportHeight800 ? 'text-[18px]' : 'text-xl'}`}>{mana}/{maxMana}</div>
            </div>
          </div>
        </div>
      </div>

      {/* timer panel - bottom center */}
      <div className="absolute left-1/2 -translate-x-10 bottom-12 ml-[50px] w-[250px] max-w-[60vw]">
        <div className="relative">
          <img src={a('assets/particle/time.png')} alt="마력 회복 타이머" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-0.9">
            <div className={`text-[#EDE7FF] opacity-90 ${isViewportHeight800 ? 'text-[12px]' : 'text-[14px]'}`}>마력 회복까지</div>
            <div className={`mt-0.5 text-white font-semibold tracking-wide ${isViewportHeight800 ? 'text-[18px]' : 'text-xl'}`}>
              {mana >= maxMana ? 'MAX' : fmt(timeLeftMs)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
