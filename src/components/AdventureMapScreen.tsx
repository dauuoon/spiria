import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import useAppStore from '../lib/store'
import TopBar from './TopBar'
import { DUNGEONS } from '../data/dungeons'
import ParticlesCanvas from './ParticlesCanvas'
import SoftGlow from './SoftGlow'
import { ITEMS, MATERIAL_ITEM_IDS, TRACE_ITEM_BY_STAGE } from '../data/items'
import { EXPEDITION_REWARD_DRAFT } from '../data/drops'
import { SPIRIT_FRAGMENT_ITEM_BY_STAGE } from '../data/progression'
import { getRarityByItemId, RESULT_RARITY_UI, SPIRIT_RARITY_TOKENS } from '../data/rarity'
import type { SpiritRarity } from '../types/game'

type AdventureMapScreenProps = {
  stage: 1 | 2 | 3 | 4 | 5
  backgroundSrc: string
  circleSrc: string
  footstepSrc: string
}

type ExploreResult = {
  exp: number
  gold: number
  materials: number
  mana: number
  etcRewards: Array<{ id: string; name: string; count: number; iconSrc: string; rarity: SpiritRarity }>
  itemRewards: Array<{ id: string; name: string; count: number; iconSrc: string; category: '재료' | '기타'; rarity: SpiritRarity }>
}

const TOTAL_EXPLORES = 10

const TAP_SFX_PATH = 'assets/sound/tap.mp3'
const RESULT_POP_SFX_PATH = 'assets/sound/ex_resgult.mp3'
const RESULT_COUNT_SFX_PATH = 'assets/sound/num_coin.mp3'


function playSfx(path: string, volume = 0.75) {
  try {
    const src = `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
    const audio = new Audio(src)
    audio.volume = volume
    void audio.play()
  } catch {
    // ignore audio failures
  }
}

export default function AdventureMapScreen({
  stage,
  backgroundSrc,
  circleSrc,
  footstepSrc,
}: AdventureMapScreenProps) {
  const setScreen = useAppStore((s) => s.setScreen)
  const addItem = useAppStore((s) => s.addItem)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  const [used, setUsed] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<ExploreResult | null>(null)
  const resultTimerRef = useRef<number | null>(null)

  const remaining = Math.max(0, TOTAL_EXPLORES - used)
  const bgControls = useAnimation()
  const circleControls = useAnimation()

  const dungeon = DUNGEONS[stage - 1]
  const mapTitle = dungeon?.name ?? `Map${stage}`
  const getItemDef = useCallback((id: string) => ITEMS.find((it) => it.id === id), [])

  const buildResult = useCallback((): ExploreResult => {
    const baseExp = dungeon?.baseExp ?? 25
    const baseGold = dungeon?.goldReward ?? 20
    const baseMat = dungeon?.materialDropCount ?? 1
    const materialTotal = baseMat * TOTAL_EXPLORES + Math.floor(Math.random() * (4 + stage))
    const matId = MATERIAL_ITEM_IDS[Math.floor(Math.random() * MATERIAL_ITEM_IDS.length)]
    const matDef = getItemDef(matId)

    const traceItemId = TRACE_ITEM_BY_STAGE[stage]
    const traceDef = getItemDef(traceItemId)
    const fragmentItemId = SPIRIT_FRAGMENT_ITEM_BY_STAGE[stage]
    const fragmentDef = getItemDef(fragmentItemId)

    const traceCount = EXPEDITION_REWARD_DRAFT.traceDropAmountMin + Math.floor(Math.random() * (EXPEDITION_REWARD_DRAFT.traceDropAmountMax - EXPEDITION_REWARD_DRAFT.traceDropAmountMin + 1))
    const fragmentCount = Math.random() < EXPEDITION_REWARD_DRAFT.spiritFragmentDropChance
      ? EXPEDITION_REWARD_DRAFT.spiritFragmentDropAmountMin + Math.floor(Math.random() * (EXPEDITION_REWARD_DRAFT.spiritFragmentDropAmountMax - EXPEDITION_REWARD_DRAFT.spiritFragmentDropAmountMin + 1))
      : 0

    const etcRewards: ExploreResult['etcRewards'] = []
    if (traceDef) {
      etcRewards.push({
        id: traceDef.id,
        name: traceDef.name,
        count: traceCount,
        iconSrc: a(traceDef.icon ?? `assets/item/it/it_${traceDef.id}.png`),
        rarity: getRarityByItemId(traceDef.id, '기타'),
      })
    }
    if (fragmentDef && fragmentCount > 0) {
      etcRewards.push({
        id: fragmentDef.id,
        name: fragmentDef.name,
        count: fragmentCount,
        iconSrc: a(fragmentDef.icon ?? 'assets/item/it/it_soul.png'),
        rarity: getRarityByItemId(fragmentDef.id, '기타'),
      })
    }

    const itemRewards: ExploreResult['itemRewards'] = []
    if (matDef) {
      itemRewards.push({
        id: matDef.id,
        name: matDef.name,
        count: materialTotal,
        iconSrc: a(`assets/item/it/it_${matDef.id}.png`),
        category: '재료',
        rarity: getRarityByItemId(matDef.id, '재료'),
      })
    }
    for (const reward of etcRewards) {
      itemRewards.push({
        id: reward.id,
        name: reward.name,
        count: reward.count,
        iconSrc: reward.iconSrc,
        category: '기타',
        rarity: reward.rarity,
      })
    }

    return {
      exp: baseExp * TOTAL_EXPLORES + Math.floor(Math.random() * (12 + stage * 3)),
      gold: baseGold * TOTAL_EXPLORES + Math.floor(Math.random() * (30 + stage * 8)),
      materials: materialTotal,
      mana: EXPEDITION_REWARD_DRAFT.manaRewardMin + Math.floor(Math.random() * (EXPEDITION_REWARD_DRAFT.manaRewardMax - EXPEDITION_REWARD_DRAFT.manaRewardMin + 1)),
      etcRewards,
      itemRewards,
    }
  }, [a, dungeon, getItemDef, stage])

  const randomAngle = () => (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.35)

  const onExploreTap = useCallback(() => {
    if (remaining <= 0 || showExitConfirm || showResult) return

    try {
      const audio = new Audio(a(footstepSrc))
      audio.volume = 0.72
      void audio.play()
    } catch {
      // ignore audio failures
    }

    const ang = randomAngle()
    void bgControls.start({
      scale: [1, 1.06, 1, 1.03, 1],
      rotateZ: [0, ang, 0, -ang, 0],
      transition: { duration: 0.62, times: [0, 0.25, 0.5, 0.75, 1], ease: 'easeInOut' },
    })
    void circleControls.start({
      y: [0, -10, 0],
      transition: { duration: 0.28, ease: 'easeOut' },
    })

    setUsed((prev) => {
      const next = Math.min(TOTAL_EXPLORES, prev + 1)
      if (next >= TOTAL_EXPLORES && prev < TOTAL_EXPLORES) {
        const nextResult = buildResult()
        nextResult.itemRewards.forEach((reward) => addItem(reward.id, reward.count))
        if (resultTimerRef.current !== null) {
          window.clearTimeout(resultTimerRef.current)
        }
        resultTimerRef.current = window.setTimeout(() => {
          setResult(nextResult)
          setShowResult(true)
          resultTimerRef.current = null
        }, EXPEDITION_REWARD_DRAFT.resultRevealDelayMs)
      }
      return next
    })
  }, [remaining, showExitConfirm, showResult, a, footstepSrc, bgControls, circleControls, buildResult, addItem])

  const progressTokens = useMemo(
    () => Array.from({ length: TOTAL_EXPLORES }, (_, i) => i < remaining),
    [remaining],
  )

  useEffect(() => {
    return () => {
      if (resultTimerRef.current !== null) {
        window.clearTimeout(resultTimerRef.current)
        resultTimerRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      <motion.img
        animate={bgControls}
        src={a(backgroundSrc)}
        alt={`${mapTitle} background`}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      <div className="absolute inset-0 z-[4] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-60">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-45 scale-90">
          <SoftGlow />
        </div>
      </div>

      <div className="absolute inset-0 bg-black/20" />

      <TopBar onBack={() => setShowExitConfirm(true)} title={mapTitle} />

      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      <div
        className="absolute inset-0 z-[6]"
        data-suppress-tap-sfx="true"
        onPointerDown={onExploreTap}
      />

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
              src={a(circleSrc)}
              alt="magic circle"
              className="w-full h-auto"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              draggable={false}
            />
          </motion.div>
        </div>
      </div>

      <div
        className="absolute left-3 bottom-3 z-[8] w-[260px] max-w-[62vw] select-none pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-[rgba(10,12,30,0.45)] backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.35)] p-3">
          <div className="text-white/85 text-[12px] font-semibold">탐험 진행 ({remaining} / {TOTAL_EXPLORES})</div>
          <div className="mt-2 flex items-center gap-2">
            {progressTokens.map((filled, i) => (
              <img
                key={i}
                src={a(filled ? 'assets/particle/map_gem_on.png' : 'assets/particle/map_gem_off.png')}
                alt={filled ? 'progress filled' : 'progress empty'}
                className={`w-4 h-4 rounded-full object-cover ${filled ? 'opacity-100' : 'opacity-55'}`}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>

      {showExitConfirm && (
        <ExitConfirmModal
          a={a}
          onCancel={() => setShowExitConfirm(false)}
          onExit={() => {
            setShowExitConfirm(false)
            setScreen('expedition')
          }}
        />
      )}

      {showResult && result && (
        <ResultModal
          a={a}
          result={result}
          onGoCraft={() => {
            setShowResult(false)
            setScreen('craft')
          }}
          onBackToExpedition={() => {
            setShowResult(false)
            setScreen('expedition')
          }}
        />
      )}
    </div>
  )
}

function ExitConfirmModal({
  a,
  onCancel,
  onExit,
}: {
  a: (path: string) => string
  onCancel: () => void
  onExit: () => void
}) {
  return (
    <div className="absolute inset-0 z-[40] bg-black/65 backdrop-blur-[2px] flex items-center justify-center px-5">
      <div className="relative w-full max-w-[426px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] text-center">
        <img
          src={a('assets/background/paper_bg_dark_l.png')}
          alt="중단 확인 배경"
          className="block w-full h-auto"
          draggable={false}
        />
        <div className="absolute inset-0 px-5 py-4 flex flex-col justify-center translate-y-[8px]">
          <div className="text-white text-[21px] font-medium">탐색을 중단하시겠습니까?</div>
          <p className="mt-0 mb-[20px] text-white/70 text-[13px] leading-relaxed">
            진행하던 탐색이 종료되고 탐험 맵으로 돌아갑니다.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              playSfx(TAP_SFX_PATH, 0.85)
              onCancel()
            }}
            data-suppress-tap-sfx="true"
            className="relative h-11 w-[124px] rounded-lg overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-white transition-transform duration-100 active:scale-95"
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
              playSfx(TAP_SFX_PATH, 0.85)
              onExit()
            }}
            data-suppress-tap-sfx="true"
            className="relative h-11 w-[124px] rounded-lg overflow-hidden border border-red-300/45 bg-[rgba(160,36,44,0.55)] text-white transition-transform duration-100 active:scale-95"
          >
            <img
              src={a('assets/particle/btn_bg_red.png')}
              alt="종료 버튼 이미지"
              className="absolute inset-0 w-full h-full object-cover opacity-65"
              draggable={false}
            />
            <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide">종료하기</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ResultModal({
  a,
  result,
  onGoCraft,
  onBackToExpedition,
}: {
  a: (path: string) => string
  result: ExploreResult
  onGoCraft: () => void
  onBackToExpedition: () => void
}) {
  const [selectedLootId, setSelectedLootId] = useState<string | null>(null)

  useEffect(() => {
    playSfx(RESULT_POP_SFX_PATH, 0.9)
  }, [])

  const rows: Array<{ label: string; value: number; iconSrc?: string; rarity?: SpiritRarity }> = [
    { label: '경험치', value: result.exp, iconSrc: a('assets/particle/exp.png') },
    { label: '골드', value: result.gold, iconSrc: a('assets/particle/money.png') },
    { label: '마나', value: result.mana, iconSrc: a('assets/particle/gem.png') },
    { label: '재료', value: result.materials, iconSrc: a('assets/particle/in_icon.png') },
    ...result.etcRewards.map((reward) => ({
      label: `[${SPIRIT_RARITY_TOKENS[reward.rarity].ko}]${reward.name}`,
      value: reward.count,
      iconSrc: undefined,
      rarity: reward.rarity,
    })),
  ]
  const lootRows = result.itemRewards

  return (
    <div className="absolute inset-0 z-[42] bg-black/70 backdrop-blur-[2px] flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: -120, scale: 0.93 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20, mass: 1.15 }}
        className="relative w-full max-w-[436px] shadow-[0_20px_50px_rgba(0,0,0,0.55)] text-center"
      >
        <img
          src={a('assets/background/paper_bg_dark_v.png')}
          alt="탐색 결과 배경"
          className="block w-full h-auto"
          draggable={false}
        />

        <div className="absolute inset-0 p-5 flex flex-col items-center justify-center">
          <div className="relative z-[1] text-[#efd8ab] text-[18px] font-extrabold tracking-wide">탐색 결과</div>

          <div className="relative z-[1] mt-[10px] w-full max-w-[360px] space-y-2 text-[14px]">
            {rows.map((row: { label: string; value: number; iconSrc?: string; rarity?: SpiritRarity }, idx) => (
              <AnimatedResultRow
                key={row.label}
                label={row.label}
                targetValue={row.value}
                iconSrc={row.iconSrc}
                rarity={row.rarity}
                delay={idx * 0.18}
              />
            ))}
          </div>
          <div className="relative z-[1] mt-2 w-full max-w-[360px] rounded-md border border-white/20 bg-black/20 p-2">
            <div className="grid grid-cols-6 gap-1.5">
              {lootRows.map((loot) => (
                <button
                  key={`${loot.id}`}
                  type="button"
                  onClick={() => {
                    playSfx(TAP_SFX_PATH, 0.78)
                    setSelectedLootId((current) => (current === loot.id ? null : loot.id))
                  }}
                  className={`relative aspect-square rounded-sm px-1 py-1 flex items-center justify-center bg-center bg-cover bg-no-repeat ${RESULT_RARITY_UI[loot.rarity].lootClass}`}
                  style={{
                    backgroundImage: `url(${a('assets/background/item_bg.png')})`,
                    borderColor: RESULT_RARITY_UI[loot.rarity].borderColor,
                  }}
                  aria-label={`${loot.name} 상세 보기`}
                >
                  {selectedLootId === loot.id && (
                    <div className="absolute left-1/2 bottom-[calc(100%+6px)] z-[3] -translate-x-1/2 whitespace-nowrap rounded-md border border-[#ead7ae]/35 bg-[rgba(9,10,24,0.94)] px-2.5 py-1 text-[11px] font-semibold text-[#f2dfb2] shadow-[0_10px_24px_rgba(0,0,0,0.38)]">
                      {loot.name}
                    </div>
                  )}
                  <img
                    src={loot.iconSrc}
                    alt=""
                    className="w-[40px] h-[40px] object-contain"
                    draggable={false}
                    onError={(e) => {
                      const el = e.currentTarget as HTMLImageElement
                      el.style.display = 'none'
                    }}
                  />
                  <span className="absolute right-[4px] bottom-[4px] min-w-[16px] px-1 h-[14px] rounded-full border border-[#b7afe1]/25 bg-[rgba(10,12,30,0.82)] text-[9px] font-semibold text-[#ebc8ab] leading-[12px] text-center pointer-events-none select-none tabular-nums">
                    {loot.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative z-[1] mt-3 w-full max-w-[360px] flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                playSfx(TAP_SFX_PATH, 0.85)
                onGoCraft()
              }}
              data-suppress-tap-sfx="true"
              className="relative h-11 w-[176px] max-w-full rounded-xl overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-[#d5dae6] transition-transform duration-100 active:scale-95"
            >
              <img
                src={a('assets/particle/btn_bg_sliver.png')}
                alt="정령 빚기 버튼 이미지"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                draggable={false}
              />
              <span className="relative z-[1] inline-block -translate-y-[3px] text-[15px] font-bold tracking-wide">정령 빚기</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx(TAP_SFX_PATH, 0.85)
                onBackToExpedition()
              }}
              data-suppress-tap-sfx="true"
              className="relative h-11 w-[176px] max-w-full rounded-xl overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
            >
              <img
                src={a('assets/particle/btn_bg_brown.png')}
                alt="돌아가기 버튼 이미지"
                className="absolute inset-0 w-full h-full object-cover opacity-62"
                draggable={false}
              />
              <span className="relative z-[1] inline-block -translate-y-[3px] text-[15px] font-bold tracking-wide">돌아가기</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AnimatedResultRow({
  label,
  targetValue,
  iconSrc,
  rarity,
  delay,
}: {
  label: string
  targetValue: number
  iconSrc?: string
  rarity?: SpiritRarity
  delay: number
}) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  useEffect(() => {
    timeoutRef.current = window.setTimeout(() => {
      playSfx(RESULT_COUNT_SFX_PATH, 0.78)
      const startAt = performance.now()
      const duration = 820
      const startValue = 0

      const step = (now: number) => {
        const t = Math.min(1, (now - startAt) / duration)
        const eased = 1 - Math.pow(1 - t, 3)
        const next = Math.round(startValue + (targetValue - startValue) * eased)
        setValue(next)
        if (t < 1) {
          rafRef.current = requestAnimationFrame(step)
        }
      }

      rafRef.current = requestAnimationFrame(step)
    }, Math.max(0, delay * 1000))

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [delay, targetValue])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut', delay }}
      className={`flex items-center justify-between rounded-lg px-3 py-2 ${rarity ? RESULT_RARITY_UI[rarity].rowClass : 'bg-white/[0.04] border border-white/10'}`}
    >
      <span className={`flex items-center gap-1.5 ${rarity ? RESULT_RARITY_UI[rarity].textClass : 'text-white'}`}>
        {iconSrc && <img src={iconSrc} alt="" className="w-4 h-4" draggable={false} />}
        {label}
      </span>
      <span className={`font-bold tabular-nums ${rarity ? RESULT_RARITY_UI[rarity].valueClass : 'text-white'}`}>+{value}</span>
    </motion.div>
  )
}
