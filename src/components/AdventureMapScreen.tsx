import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion'
import useAppStore from '../lib/store'
import TopBar from './TopBar'
import { DUNGEONS } from '../data/dungeons'
import { REGIONS } from '../data/regions'
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
const REGIONAL_ACCENT_BY_STAGE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: '#fcd98b',
  2: '#cd9881',
  3: '#9fc9e4',
  4: '#ffbe9f',
  5: '#d39ee0',
}

type ExploreResult = {
  exp: number
  gold: number
  materials: number
  mana: number
  etcRewards: Array<{ id: string; name: string; count: number; iconSrc: string; rarity: SpiritRarity }>
  itemRewards: Array<{ id: string; name: string; count: number; iconSrc: string; category: '재료' | '기타'; rarity: SpiritRarity }>
}

type ActiveEventState = {
  id: string
  kind: 'spirit' | 'regional' | 'treasure' | 'empty'
  title: string
  description: string
  clickCount: number
  targetClicks: number
  resolved: boolean
  rewardText: string
}

type FloatingRewardToast = {
  id: string
  text: string
  iconSrc?: string
  textColor: string
  borderColor: string
  bgColor?: string
  playSound?: boolean
  durationMs: number
  gapMs: number
}

type FloatingToastColors = {
  textColor: string
  borderColor: string
  bgColor?: string
}

const TOTAL_EXPLORES = EXPEDITION_REWARD_DRAFT.exploreSteps

const TAP_SFX_PATH = 'assets/sound/tap.mp3'
const RESULT_POP_SFX_PATH = 'assets/sound/ex_resgult.mp3'
const RESULT_COUNT_SFX_PATH = 'assets/sound/num_coin.mp3'
const REWARD_TOAST_SFX_PATH = 'assets/sound/reward_toast.mp3'
const TREASURE_SPAWN_SFX_PATH = 'assets/sound/thud.mp3'
const TREASURE_CLOSE_SFX_PATH = 'assets/sound/chest1.mp3'
const TREASURE_OPEN_SFX_PATH = 'assets/sound/chest2.mp3'
const REGIONAL_PICK_SFX_PATH = 'assets/sound/regions_pick.mp3'
const ALL_MAPS_100_SFX_PATH = 'assets/sound/percent.mp3'
const EXPLORE_TAP_COOLDOWN_MS = 400
const EMPTY_EVENT_DISMISS_MS = 4000
const FLOATING_TOAST_LIFETIME_MS = 450
const FLOATING_TOAST_GAP_MS = 50
const FAST_FLOATING_TOAST_LIFETIME_MS = FLOATING_TOAST_LIFETIME_MS / 2.5
const FAST_FLOATING_TOAST_GAP_MS = FLOATING_TOAST_GAP_MS / 2.5

const FLOATING_TOAST_COLORS = {
  default: {
    textColor: '#F4E1B4',
    borderColor: '#FFFFFF33',
    bgColor: 'rgba(8,10,24,0.75)',
  },
  none: {
    textColor: '#C5CBD6',
    borderColor: '#A6AFBF88',
    bgColor: 'rgba(8,10,24,0.72)',
  },
  exp: {
    textColor: '#87D5FF',
    borderColor: '#6FC2FF88',
    bgColor: 'rgba(8,10,24,0.75)',
  },
  gold: {
    textColor: '#F3D274',
    borderColor: '#E8C157AA',
    bgColor: 'rgba(8,10,24,0.75)',
  },
  mana: {
    textColor: '#C7A6FF',
    borderColor: '#A780F6AA',
    bgColor: 'rgba(8,10,24,0.75)',
  },
} as const

const REGIONAL_EVENT_ASSET_BY_ID: Record<string, { imagePath: string; label: string }> = {
  // 별빛 숲속
  regional_glowing_mushroom: { imagePath: 'assets/map/forest_wreath1.png', label: '빛나는 버섯' },
  regional_starfruit: { imagePath: 'assets/map/forest_wreath2.png', label: '별빛 열매' },
  regional_fallen_tree: { imagePath: 'assets/map/forest_wreath3.png', label: '쓰러진 어린 나무' },
  regional_resting_place: { imagePath: 'assets/map/forest_wreath4.png', label: '숲의 휴식처' },

  // 바람의 협곡
  regional_rattling_windmill: { imagePath: 'assets/map/wind_wreath1.png', label: '흔들리는 풍차' },
  regional_flying_feather: { imagePath: 'assets/map/wind_wreath2.png', label: '하늘을 나는 깃털' },
  regional_wind_bell: { imagePath: 'assets/map/wind_wreath3.png', label: '바람 종' },
  regional_overlook: { imagePath: 'assets/map/wind_wreath4.png', label: '협곡 전망대' },

  // 얼어붙은 설원
  regional_ice_crystal: { imagePath: 'assets/map/snow_wreath1.png', label: '얼음 결정' },
  regional_snowflake_cluster: { imagePath: 'assets/map/snow_wreath2.png', label: '눈꽃 송이' },
  regional_frozen_spring: { imagePath: 'assets/map/snow_wreath3.png', label: '얼어붙은 샘' },
  regional_warm_campfire: { imagePath: 'assets/map/snow_wreath4.png', label: '따뜻한 모닥불' },

  // 화염의 산맥
  regional_erupting_lava: { imagePath: 'assets/map/fire_wreath1.png', label: '분출하는 용암' },
  regional_sun_crystal: { imagePath: 'assets/map/fire_wreath2.png', label: '불의 보석' },
  regional_volcanic_hot_spring: { imagePath: 'assets/map/fire_wreath3.png', label: '화산 온천' },
  regional_rest_camp: { imagePath: 'assets/map/fire_wreath4.png', label: '쉼터 캠프' },

  // 어둠의 습지
  regional_soul_lantern: { imagePath: 'assets/map/dark_wreath1.png', label: '영혼의 등불' },
  regional_black_lotus: { imagePath: 'assets/map/dark_wreath2.png', label: '검은 연꽃' },
  regional_quiet_swamp: { imagePath: 'assets/map/dark_wreath3.png', label: '고요한 늪' },
  regional_forgotten_altar: { imagePath: 'assets/map/dark_wreath4.png', label: '잊혀진 제단' },
}

type FloatingRewardToastEntry = {
  text: string
  iconPath?: string
  iconSrc?: string
  colors?: FloatingToastColors
  playSound?: boolean
}

type FloatingToastTimingOptions = {
  durationMs?: number
  gapMs?: number
}

type ExplorationRewardPlanItem = ExploreResult['itemRewards'][number] & {
  countsByStep: number[]
}

type ExplorationRewardPlan = {
  result: ExploreResult
  expByStep: number[]
  goldByStep: number[]
  manaByStep: number[]
  items: ExplorationRewardPlanItem[]
}

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
  const addCoins = useAppStore((s) => s.addCoins)
  const addMana = useAppStore((s) => s.addMana)
  const gainExp = useAppStore((s) => s.gainExp)
  const markExplorationDiscovery = useAppStore((s) => s.markExplorationDiscovery)
  const explorationProgress = useAppStore((s) => s.explorationProgressByStage[stage])
  const explorationProgressByStage = useAppStore((s) => s.explorationProgressByStage)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  const [used, setUsed] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [result, setResult] = useState<ExploreResult | null>(null)
  const [activeEvent, setActiveEvent] = useState<ActiveEventState | null>(null)
  const [showLevelUpBadge, setShowLevelUpBadge] = useState(false)
  const [floatingRewardToasts, setFloatingRewardToasts] = useState<FloatingRewardToast[]>([])
  const [treasureChestOpened, setTreasureChestOpened] = useState(false)
  const [isRegionalPressing, setIsRegionalPressing] = useState(false)
  const resultTimerRef = useRef<number | null>(null)
  const emptyEventDismissTimerRef = useRef<number | null>(null)
  const floatingToastQueueRef = useRef<FloatingRewardToast[]>([])
  const floatingToastTimerRef = useRef<number | null>(null)
  const floatingToastGapTimerRef = useRef<number | null>(null)
  const floatingToastRunningRef = useRef(false)
  const showResultRef = useRef(false)
  const treasureChestEventIdRef = useRef<string | null>(null)
  const explorationRewardPlanRef = useRef<ExplorationRewardPlan | null>(null)
  const pendingSpiritRewardStepRef = useRef<number | null>(null)
  const pendingRegionalRewardStepRef = useRef<number | null>(null)
  const pendingTreasureRewardStepRef = useRef<number | null>(null)
  const exploreTapCooldownUntilRef = useRef(0)
  const pendingFinalResultRef = useRef(false)
  const allMapsCompleteRef = useRef<boolean | null>(null)
  const regionalPressTimerRef = useRef<number | null>(null)

  const remaining = Math.max(0, TOTAL_EXPLORES - used)
  const bgControls = useAnimation()
  const circleControls = useAnimation()

  const dungeon = DUNGEONS[stage - 1]
  const region = REGIONS[stage - 1]

  const explorationRate = useMemo(() => {
    const totals = region?.discoveryTotals ?? { material: 1, spirit: 1, regional: 1, treasure: 1 }
    const weights = region?.explorationRateWeights ?? { material: 30, spirit: 30, regional: 30, treasure: 10 }
    const materialRatio = Math.min(1, explorationProgress.materialDiscovered / Math.max(1, totals.material))
    const spiritRatio = Math.min(1, explorationProgress.spiritDiscovered / Math.max(1, totals.spirit))
    const regionalRatio = Math.min(1, explorationProgress.regionalEventDiscovered / Math.max(1, totals.regional))
    const treasureRatio = Math.min(1, explorationProgress.treasureDiscovered / Math.max(1, totals.treasure))
    const rate = (materialRatio * weights.material) + (spiritRatio * weights.spirit) + (regionalRatio * weights.regional) + (treasureRatio * weights.treasure)
    return Math.round(rate)
  }, [explorationProgress, region])
  const mapTitle = dungeon?.name ?? region?.name ?? `Map${stage}`
  const getItemDef = useCallback((id: string) => ITEMS.find((it) => it.id === id), [])

  const isAllMapsExplorationComplete = useMemo(() => {
    return REGIONS.every((_, idx) => {
      const stageKey = (idx + 1) as 1 | 2 | 3 | 4 | 5
      const progress = explorationProgressByStage[stageKey]
      const totals = REGIONS[idx].discoveryTotals
      return (
        progress.materialDiscovered >= totals.material &&
        progress.spiritDiscovered >= totals.spirit &&
        progress.regionalEventDiscovered >= totals.regional &&
        progress.treasureDiscovered >= totals.treasure
      )
    })
  }, [explorationProgressByStage])

  const getRarityToastColors = useCallback((rarity: SpiritRarity): FloatingToastColors => {
    const token = SPIRIT_RARITY_TOKENS[rarity]
    return {
      textColor: token.mainColor,
      borderColor: `${token.borderColor}AA`,
      bgColor: 'rgba(8,10,24,0.75)',
    }
  }, [])

  const stopFloatingRewardToasts = useCallback(() => {
    floatingToastQueueRef.current = []
    floatingToastRunningRef.current = false
    setFloatingRewardToasts([])
    if (floatingToastTimerRef.current !== null) {
      window.clearTimeout(floatingToastTimerRef.current)
      floatingToastTimerRef.current = null
    }
    if (floatingToastGapTimerRef.current !== null) {
      window.clearTimeout(floatingToastGapTimerRef.current)
      floatingToastGapTimerRef.current = null
    }
  }, [])

  const showNextFloatingRewardToast = useCallback(() => {
    if (showResultRef.current) {
      stopFloatingRewardToasts()
      return
    }

    const next = floatingToastQueueRef.current.shift()
    if (!next) {
      floatingToastRunningRef.current = false
      setFloatingRewardToasts([])
      return
    }

    floatingToastRunningRef.current = true
    setFloatingRewardToasts([next])
    if (next.playSound !== false) {
      playSfx(REWARD_TOAST_SFX_PATH, 0.82)
    }

    if (floatingToastTimerRef.current !== null) {
      window.clearTimeout(floatingToastTimerRef.current)
      floatingToastTimerRef.current = null
    }
    if (floatingToastGapTimerRef.current !== null) {
      window.clearTimeout(floatingToastGapTimerRef.current)
      floatingToastGapTimerRef.current = null
    }

    floatingToastTimerRef.current = window.setTimeout(() => {
      if (showResultRef.current) {
        stopFloatingRewardToasts()
        return
      }
      setFloatingRewardToasts([])
      floatingToastTimerRef.current = null

      floatingToastGapTimerRef.current = window.setTimeout(() => {
        if (showResultRef.current) {
          stopFloatingRewardToasts()
          return
        }
        floatingToastGapTimerRef.current = null
        showNextFloatingRewardToast()
      }, next.gapMs)
    }, next.durationMs)
  }, [stopFloatingRewardToasts])

  const showFloatingRewardToasts = useCallback((entries: FloatingRewardToastEntry[], options?: FloatingToastTimingOptions) => {
    if (entries.length === 0 || showResultRef.current) return
    const durationMs = options?.durationMs ?? FLOATING_TOAST_LIFETIME_MS
    const gapMs = options?.gapMs ?? FLOATING_TOAST_GAP_MS

    const prepared = entries.map((entry, idx) => ({
      id: `${Date.now()}-${Math.random()}-${idx}`,
      text: entry.text,
      iconSrc: entry.iconSrc ?? (entry.iconPath ? a(entry.iconPath) : undefined),
      textColor: entry.colors?.textColor ?? FLOATING_TOAST_COLORS.default.textColor,
      borderColor: entry.colors?.borderColor ?? FLOATING_TOAST_COLORS.default.borderColor,
      bgColor: entry.colors?.bgColor ?? FLOATING_TOAST_COLORS.default.bgColor ?? 'rgba(8,10,24,0.9)',
      playSound: entry.playSound,
      durationMs,
      gapMs,
    }))

    floatingToastQueueRef.current.push(...prepared)
    if (!floatingToastRunningRef.current) {
      showNextFloatingRewardToast()
    }
  }, [a, showNextFloatingRewardToast])

  useEffect(() => {
    showResultRef.current = showResult
    if (showResult) {
      stopFloatingRewardToasts()
    }
  }, [showResult, stopFloatingRewardToasts])

  useEffect(() => {
    if (allMapsCompleteRef.current === null) {
      allMapsCompleteRef.current = isAllMapsExplorationComplete
      return
    }

    if (!allMapsCompleteRef.current && isAllMapsExplorationComplete) {
      playSfx(ALL_MAPS_100_SFX_PATH, 0.9)
    }

    allMapsCompleteRef.current = isAllMapsExplorationComplete
  }, [isAllMapsExplorationComplete])

  useEffect(() => {
    if (activeEvent?.kind === 'treasure') {
      if (treasureChestEventIdRef.current !== activeEvent.id) {
        treasureChestEventIdRef.current = activeEvent.id
        setTreasureChestOpened(false)
        playSfx(TREASURE_SPAWN_SFX_PATH, 0.8)
      }
      return
    }

    treasureChestEventIdRef.current = null
    setTreasureChestOpened(false)
  }, [activeEvent])

  useEffect(() => {
    if (emptyEventDismissTimerRef.current !== null) {
      window.clearTimeout(emptyEventDismissTimerRef.current)
      emptyEventDismissTimerRef.current = null
    }

    if (activeEvent?.kind !== 'empty' || !activeEvent.resolved) {
      return
    }

    emptyEventDismissTimerRef.current = window.setTimeout(() => {
      setActiveEvent((current) => (current?.kind === 'empty' ? null : current))
      emptyEventDismissTimerRef.current = null
    }, EMPTY_EVENT_DISMISS_MS)

    return () => {
      if (emptyEventDismissTimerRef.current !== null) {
        window.clearTimeout(emptyEventDismissTimerRef.current)
        emptyEventDismissTimerRef.current = null
      }
    }
  }, [activeEvent])

  const buildEmptyEventState = useCallback((): ActiveEventState => {
    const emptyTexts = region?.emptyEventTexts ?? []
    return {
      id: 'empty',
      kind: 'empty',
      title: '아무 일도 없었다.',
      description: emptyTexts[Math.floor(Math.random() * (emptyTexts.length || 1))] ?? '아무 일도 일어나지 않았습니다.',
      clickCount: 0,
      targetClicks: 0,
      resolved: true,
      rewardText: '',
    }
  }, [region])

  const pickEventTemplate = useCallback(() => {
    const templates = region?.eventTemplates ?? []
    if (templates.length === 0) return null

    const noneChance = EXPEDITION_REWARD_DRAFT.eventProbabilities.none
    if (Math.random() < noneChance) return null

    return templates[Math.floor(Math.random() * templates.length)] ?? null
  }, [region])

  const buildEventState = useCallback((): ActiveEventState => {
    if (!region) {
      return buildEmptyEventState()
    }

    const template = pickEventTemplate()
    if (!template) {
      return buildEmptyEventState()
    }

    const targetClicks = template.kind === 'treasure' ? 2 : template.kind === 'regional' ? 3 : 1

    return {
      id: template.id,
      kind: template.kind,
      title: template.title,
      description: template.description,
      clickCount: 0,
      targetClicks,
      resolved: false,
      rewardText: template.kind === 'spirit'
        ? '정령을 도와주면 보상을 받습니다.'
        : template.kind === 'treasure'
          ? '상자를 2회 클릭해 열어보세요.'
          : '오브젝트를 3번 클릭해 지역의 기운을 모아보세요.',
    }
  }, [buildEmptyEventState, pickEventTemplate, region])

  const buildResult = useCallback((): ExploreResult => {
    const baseExp = dungeon?.baseExp ?? 25
    const baseGold = dungeon?.goldReward ?? 20
    const baseMat = dungeon?.materialDropCount ?? 1
    const regionDrop = region?.dropTable ?? []
    const materialTotal = baseMat * TOTAL_EXPLORES + Math.floor(Math.random() * (4 + stage))
    const selectedDrop = regionDrop.length > 0
      ? regionDrop[Math.floor(Math.random() * regionDrop.length)]
      : undefined
    const matId = selectedDrop?.itemId ?? MATERIAL_ITEM_IDS[Math.floor(Math.random() * MATERIAL_ITEM_IDS.length)]
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
      exp: EXPEDITION_REWARD_DRAFT.baseExpMin + Math.floor(Math.random() * (EXPEDITION_REWARD_DRAFT.baseExpMax - EXPEDITION_REWARD_DRAFT.baseExpMin + 1)) + baseExp,
      gold: EXPEDITION_REWARD_DRAFT.baseGoldMin + Math.floor(Math.random() * (EXPEDITION_REWARD_DRAFT.baseGoldMax - EXPEDITION_REWARD_DRAFT.baseGoldMin + 1)) + baseGold,
      materials: materialTotal,
      mana: Math.random() < EXPEDITION_REWARD_DRAFT.manaSingleDropChancePerExpedition ? 1 : 0,
      etcRewards,
      itemRewards,
    }
  }, [a, dungeon, getItemDef, stage])

  const randomAngle = () => (Math.random() < 0.5 ? -1 : 1) * (0.35 + Math.random() * 0.35)

  const distributeAmountBySteps = useCallback((total: number, steps: number) => {
    const safeSteps = Math.max(1, steps)
    const buckets = Array.from({ length: safeSteps }, () => 0)
    let remaining = Math.max(0, Math.floor(total))
    for (let i = 0; i < safeSteps; i += 1) {
      const stepsLeft = safeSteps - i
      if (stepsLeft <= 0) break
      const base = Math.floor(remaining / stepsLeft)
      const bonus = remaining % stepsLeft > 0 && Math.random() < 0.5 ? 1 : 0
      const take = Math.min(remaining, base + bonus)
      buckets[i] = take
      remaining -= take
    }
    if (remaining > 0) {
      buckets[safeSteps - 1] += remaining
    }
    return buckets
  }, [])

  const initializeExplorationRewardPlan = useCallback((): ExplorationRewardPlan => {
    const plannedResult = buildResult()
    return {
      result: plannedResult,
      expByStep: distributeAmountBySteps(plannedResult.exp, TOTAL_EXPLORES),
      goldByStep: distributeAmountBySteps(plannedResult.gold, TOTAL_EXPLORES),
      manaByStep: distributeAmountBySteps(plannedResult.mana, TOTAL_EXPLORES),
      items: plannedResult.itemRewards.map((reward) => ({
        ...reward,
        countsByStep: distributeAmountBySteps(reward.count, TOTAL_EXPLORES),
      })),
    }
  }, [buildResult, distributeAmountBySteps])

  const applyExploreStepRewards = useCallback((stepIndex: number, options?: { skipAll?: boolean }) => {
    const safeStepIndex = Math.max(0, Math.min(TOTAL_EXPLORES - 1, stepIndex))
    if (!explorationRewardPlanRef.current) {
      explorationRewardPlanRef.current = initializeExplorationRewardPlan()
    }

    const plan = explorationRewardPlanRef.current
    if (!plan) return

    if (options?.skipAll) {
      plan.expByStep[safeStepIndex] = 0
      plan.goldByStep[safeStepIndex] = 0
      plan.manaByStep[safeStepIndex] = 0
      for (const item of plan.items) {
        item.countsByStep[safeStepIndex] = 0
      }
      return
    }

    const expGain = plan.expByStep[safeStepIndex] ?? 0
    const goldGain = plan.goldByStep[safeStepIndex] ?? 0
    const manaGain = plan.manaByStep[safeStepIndex] ?? 0

    const toastEntries: FloatingRewardToastEntry[] = []

    if (expGain > 0) {
      const levelUpInfo = gainExp(expGain)
      if (levelUpInfo) {
        setShowLevelUpBadge(true)
        window.setTimeout(() => setShowLevelUpBadge(false), 900)
      }
      toastEntries.push({
        text: `경험치 +${expGain}`,
        iconPath: 'assets/particle/exp.png',
        colors: FLOATING_TOAST_COLORS.exp,
      })
    }

    if (goldGain > 0) {
      addCoins(goldGain)
      toastEntries.push({
        text: `골드 +${goldGain}`,
        iconPath: 'assets/particle/money.png',
        colors: FLOATING_TOAST_COLORS.gold,
      })
    }

    if (manaGain > 0) {
      addMana(manaGain)
      toastEntries.push({
        text: `마나 +${manaGain}`,
        iconPath: 'assets/particle/gem.png',
        colors: FLOATING_TOAST_COLORS.mana,
      })
    }

    for (const item of plan.items) {
      if (item.category !== '재료') continue
      const amount = item.countsByStep[safeStepIndex] ?? 0
      if (amount <= 0) continue
      addItem(item.id, amount)
      toastEntries.push({
        text: `${item.name} +${amount}`,
        iconSrc: item.iconSrc,
        colors: getRarityToastColors(item.rarity),
      })
      markExplorationDiscovery(stage, 'material')
      if (item.id === 'gem' || item.id === 'gold') markExplorationDiscovery(stage, 'treasure')
    }

    if (toastEntries.length > 0) {
      showFloatingRewardToasts(toastEntries)
    }
  }, [addCoins, addItem, addMana, gainExp, getRarityToastColors, initializeExplorationRewardPlan, markExplorationDiscovery, showFloatingRewardToasts, stage])

  const buildResultFromPlan = useCallback((plan: ExplorationRewardPlan): ExploreResult => {
    const itemRewards = plan.items
      .map((item) => ({
        id: item.id,
        name: item.name,
        count: item.countsByStep.reduce((sum, n) => sum + n, 0),
        iconSrc: item.iconSrc,
        category: item.category,
        rarity: item.rarity,
      }))
      .filter((item) => item.count > 0)

    const etcRewards = itemRewards
      .filter((item) => item.category === '기타')
      .map((item) => ({
        id: item.id,
        name: item.name,
        count: item.count,
        iconSrc: item.iconSrc,
        rarity: item.rarity,
      }))

    const materialTotal = itemRewards
      .filter((item) => item.category === '재료')
      .reduce((sum, item) => sum + item.count, 0)

    return {
      exp: plan.expByStep.reduce((sum, n) => sum + n, 0),
      gold: plan.goldByStep.reduce((sum, n) => sum + n, 0),
      mana: plan.manaByStep.reduce((sum, n) => sum + n, 0),
      materials: materialTotal,
      etcRewards,
      itemRewards,
    }
  }, [])

  const finalizeExploreResult = useCallback(() => {
    pendingFinalResultRef.current = false
    if (!explorationRewardPlanRef.current) {
      explorationRewardPlanRef.current = initializeExplorationRewardPlan()
    }
    const plan = explorationRewardPlanRef.current
    if (!plan) return

    const deferredEtcEntries: FloatingRewardToastEntry[] = []
    for (const item of plan.items) {
      if (item.category !== '기타') continue
      const totalDeferredAmount = item.countsByStep.reduce((sum, n) => sum + n, 0)
      if (totalDeferredAmount <= 0) continue
      addItem(item.id, totalDeferredAmount)
      deferredEtcEntries.push({
        text: `${item.name} +${totalDeferredAmount}`,
        iconSrc: item.iconSrc,
        colors: getRarityToastColors(item.rarity),
      })
      if (item.id.includes('fragment_')) markExplorationDiscovery(stage, 'spirit')
      if (item.id.includes('trace')) markExplorationDiscovery(stage, 'regional')
    }

    const pendingToastCountBeforeResult = floatingToastQueueRef.current.length + (floatingToastRunningRef.current ? 1 : 0)
    if (deferredEtcEntries.length > 0) {
      showFloatingRewardToasts(deferredEtcEntries, {
        durationMs: FAST_FLOATING_TOAST_LIFETIME_MS,
        gapMs: FAST_FLOATING_TOAST_GAP_MS,
      })
    }

    const nextResult = buildResultFromPlan(plan)
    const totalToastCountBeforeResultModal = pendingToastCountBeforeResult + deferredEtcEntries.length
    const toastSequenceMs = totalToastCountBeforeResultModal > 0
      ? (pendingToastCountBeforeResult * (FLOATING_TOAST_LIFETIME_MS + FLOATING_TOAST_GAP_MS))
        + (deferredEtcEntries.length * (FAST_FLOATING_TOAST_LIFETIME_MS + FAST_FLOATING_TOAST_GAP_MS))
      : 0
    const revealDelayMs = Math.max(EXPEDITION_REWARD_DRAFT.resultRevealDelayMs, toastSequenceMs + 180)
    if (resultTimerRef.current !== null) {
      window.clearTimeout(resultTimerRef.current)
    }
    resultTimerRef.current = window.setTimeout(() => {
      setResult(nextResult)
      setShowResult(true)
      explorationRewardPlanRef.current = null
      resultTimerRef.current = null
    }, revealDelayMs)
  }, [addItem, buildResultFromPlan, getRarityToastColors, initializeExplorationRewardPlan, markExplorationDiscovery, showFloatingRewardToasts, stage])

  const handleEventInteraction = useCallback((action: 'help' | 'pass' | 'click') => {
    if (!activeEvent) return

    const current = activeEvent
    let nextState = current
    const pendingSpiritStep = pendingSpiritRewardStepRef.current

    if (current.kind === 'spirit') {
      if (action === 'help') {
        if (pendingSpiritStep !== null) {
          applyExploreStepRewards(pendingSpiritStep)
          pendingSpiritRewardStepRef.current = null
        }
        markExplorationDiscovery(stage, 'spirit')
        nextState = { ...current, resolved: true, rewardText: '정령을 돕고 보상을 받았습니다.' }
      } else {
        if (pendingSpiritStep !== null) {
          applyExploreStepRewards(pendingSpiritStep, { skipAll: true })
          pendingSpiritRewardStepRef.current = null
        }
        showFloatingRewardToasts([{ text: '획득 없음', colors: FLOATING_TOAST_COLORS.none }])
        nextState = { ...current, resolved: true, rewardText: '정령은 지나가게 두었습니다.' }
      }
    }

    if (current.kind === 'regional') {
      const nextCount = current.clickCount + 1
      if (nextCount >= current.targetClicks) {
        const pendingRegionalStep = pendingRegionalRewardStepRef.current
        if (pendingRegionalStep !== null) {
          applyExploreStepRewards(pendingRegionalStep)
          pendingRegionalRewardStepRef.current = null
        }
        markExplorationDiscovery(stage, 'regional')
        nextState = { ...current, clickCount: nextCount, resolved: true, rewardText: '지역 이벤트를 해결했습니다.' }
      } else {
        nextState = { ...current, clickCount: nextCount }
      }
    }

    if (current.kind === 'treasure') {
      const nextCount = current.clickCount + 1
      if (nextCount >= current.targetClicks) {
        const pendingTreasureStep = pendingTreasureRewardStepRef.current
        if (pendingTreasureStep !== null) {
          applyExploreStepRewards(pendingTreasureStep)
          pendingTreasureRewardStepRef.current = null
        }
        markExplorationDiscovery(stage, 'treasure')
        nextState = { ...current, clickCount: nextCount, resolved: true, rewardText: '상자를 열고 보물을 얻었습니다.' }
      } else {
        nextState = { ...current, clickCount: nextCount }
      }
    }

    if (nextState.resolved && nextState.kind !== 'empty') {
      setActiveEvent(null)
    } else {
      setActiveEvent(nextState)
    }

    if (nextState.resolved && pendingFinalResultRef.current) {
      pendingFinalResultRef.current = false
      finalizeExploreResult()
    }
  }, [activeEvent, applyExploreStepRewards, finalizeExploreResult, markExplorationDiscovery, showFloatingRewardToasts, stage])

  const triggerRegionalPressFeedback = useCallback(() => {
    setIsRegionalPressing(true)
    if (regionalPressTimerRef.current !== null) {
      window.clearTimeout(regionalPressTimerRef.current)
    }
    regionalPressTimerRef.current = window.setTimeout(() => {
      setIsRegionalPressing(false)
      regionalPressTimerRef.current = null
    }, 160)
  }, [])

  useEffect(() => {
    return () => {
      if (regionalPressTimerRef.current !== null) {
        window.clearTimeout(regionalPressTimerRef.current)
        regionalPressTimerRef.current = null
      }
    }
  }, [])

  const onExploreTap = useCallback(() => {
    if (showExitConfirm || showResult) return

    if (activeEvent && !activeEvent.resolved) {
      if (activeEvent.kind === 'regional') {
        const now = Date.now()
        if (now < exploreTapCooldownUntilRef.current) {
          return
        }
        exploreTapCooldownUntilRef.current = now + EXPLORE_TAP_COOLDOWN_MS
        triggerRegionalPressFeedback()
        playSfx(REGIONAL_PICK_SFX_PATH, 0.86)
        handleEventInteraction('click')
      }
      return
    }

    if (remaining <= 0) return

    const now = Date.now()
    if (now < exploreTapCooldownUntilRef.current) {
      return
    }
    exploreTapCooldownUntilRef.current = now + EXPLORE_TAP_COOLDOWN_MS

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

    const nextEvent = activeEvent && !activeEvent.resolved ? activeEvent : buildEventState()
    setActiveEvent(nextEvent)
    if (nextEvent.kind === 'empty') {
      showFloatingRewardToasts([{ text: '획득 없음', colors: FLOATING_TOAST_COLORS.none }])
    }

    const nextUsed = Math.min(TOTAL_EXPLORES, used + 1)
    setUsed(nextUsed)
    if (nextEvent.kind === 'spirit' && !nextEvent.resolved) {
      pendingSpiritRewardStepRef.current = nextUsed - 1
      pendingRegionalRewardStepRef.current = null
      pendingTreasureRewardStepRef.current = null
    } else if (nextEvent.kind === 'regional' && !nextEvent.resolved) {
      pendingRegionalRewardStepRef.current = nextUsed - 1
      pendingSpiritRewardStepRef.current = null
      pendingTreasureRewardStepRef.current = null
    } else if (nextEvent.kind === 'treasure' && !nextEvent.resolved) {
      pendingTreasureRewardStepRef.current = nextUsed - 1
      pendingSpiritRewardStepRef.current = null
      pendingRegionalRewardStepRef.current = null
    } else if (nextEvent.kind === 'empty') {
      applyExploreStepRewards(nextUsed - 1, { skipAll: true })
      pendingSpiritRewardStepRef.current = null
      pendingRegionalRewardStepRef.current = null
      pendingTreasureRewardStepRef.current = null
    } else {
      applyExploreStepRewards(nextUsed - 1)
      pendingSpiritRewardStepRef.current = null
      pendingRegionalRewardStepRef.current = null
      pendingTreasureRewardStepRef.current = null
    }
    if (nextUsed >= TOTAL_EXPLORES && used < TOTAL_EXPLORES) {
      pendingFinalResultRef.current = true
      if (nextEvent.resolved) {
        pendingFinalResultRef.current = false
        finalizeExploreResult()
      }
    }
  }, [activeEvent, remaining, showExitConfirm, showResult, a, footstepSrc, bgControls, circleControls, buildEventState, finalizeExploreResult, handleEventInteraction, showFloatingRewardToasts, used, applyExploreStepRewards, stage, triggerRegionalPressFeedback])

  const progressTokens = useMemo(
    () => Array.from({ length: TOTAL_EXPLORES }, (_, i) => i < remaining),
    [remaining],
  )

  const activeRegionalAsset = useMemo(() => {
    if (!activeEvent || activeEvent.kind !== 'regional' || activeEvent.resolved) return null
    return REGIONAL_EVENT_ASSET_BY_ID[activeEvent.id] ?? null
  }, [activeEvent])
  const regionalAccentColor = REGIONAL_ACCENT_BY_STAGE[stage]

  const isRegionalEventActive = !!(activeEvent && activeEvent.kind === 'regional' && !activeEvent.resolved)

  const handleRegionalObjectClick = useCallback(() => {
    if (!activeEvent || activeEvent.kind !== 'regional' || activeEvent.resolved || !activeRegionalAsset) return
    const now = Date.now()
    if (now < exploreTapCooldownUntilRef.current) {
      return
    }
    exploreTapCooldownUntilRef.current = now + EXPLORE_TAP_COOLDOWN_MS
    triggerRegionalPressFeedback()
    playSfx(REGIONAL_PICK_SFX_PATH, 0.86)
    handleEventInteraction('click')
  }, [activeEvent, activeRegionalAsset, handleEventInteraction, triggerRegionalPressFeedback])

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
        className={`absolute inset-0 z-[6] ${isRegionalEventActive ? 'cursor-pointer' : ''}`}
        data-suppress-tap-sfx="true"
        onPointerDown={onExploreTap}
      />

      <div className="absolute inset-0 z-[7] flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center text-center">
          <motion.div
            className="mt-5 text-white/85 text-[14px] tracking-wide"
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
        className="absolute left-3 right-3 bottom-3 z-[8] select-none pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="rounded-2xl bg-[rgba(10,12,30,0.45)] backdrop-blur-md shadow-[0_10px_32px_rgba(0,0,0,0.35)] px-3.5 py-3">
          <div className="text-white/90 text-[14px] font-bold">탐색 횟수 ({remaining} / {TOTAL_EXPLORES})</div>
          <div className="mt-2.5 flex w-full items-center justify-between">
            {progressTokens.map((filled, i) => (
              <img
                key={i}
                src={a(filled ? 'assets/particle/map_gem_on.png' : 'assets/particle/map_gem_off.png')}
                alt={filled ? 'progress filled' : 'progress empty'}
                className={`w-[19px] h-[19px] rounded-full object-cover ${filled ? 'opacity-100' : 'opacity-55'}`}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </div>

      <div
        className="absolute right-4 top-[74px] z-[8] w-[135px] max-w-[44vw] select-none pointer-events-auto"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="rounded-xl border border-white/10 bg-[rgba(8,11,24,0.37)] backdrop-blur-md px-2.5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
          <div className="relative left-[-2px] flex items-center gap-1.5 text-[#f2d68f]">
            <img src={a('assets/particle/magnific_icon.png')} alt="탐색률 아이콘" className="w-3 h-3 object-contain" draggable={false} />
            <span className="text-[13px] font-medium whitespace-nowrap">탐색률</span>
            <span
              aria-hidden
              className="flex-1 h-px mx-0.5"
              style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(242,214,143,0.55) 0 2px, transparent 2px 5px)' }}
            />
            <span className="text-[14px] font-bold">{explorationRate}%</span>
          </div>
          <div className="mt-1.5 space-y-0.5 text-[13px] text-white/80">
            <div className="flex items-center gap-1">
              <span>재료</span>
              <span
                aria-hidden
                className="flex-1 h-px mx-1"
                style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.4) 0 2px, transparent 2px 5px)' }}
              />
              <span className="font-bold text-white/95">{Math.min(explorationProgress.materialDiscovered, region?.discoveryTotals?.material ?? 0)}/{region?.discoveryTotals?.material ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>정령</span>
              <span
                aria-hidden
                className="flex-1 h-px mx-1"
                style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.4) 0 2px, transparent 2px 5px)' }}
              />
              <span className="font-bold text-white/95">{Math.min(explorationProgress.spiritDiscovered, region?.discoveryTotals?.spirit ?? 0)}/{region?.discoveryTotals?.spirit ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>지역</span>
              <span
                aria-hidden
                className="flex-1 h-px mx-1"
                style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.4) 0 2px, transparent 2px 5px)' }}
              />
              <span className="font-bold text-white/95">{Math.min(explorationProgress.regionalEventDiscovered, region?.discoveryTotals?.regional ?? 0)}/{region?.discoveryTotals?.regional ?? 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>보물</span>
              <span
                aria-hidden
                className="flex-1 h-px mx-1"
                style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(255,255,255,0.4) 0 2px, transparent 2px 5px)' }}
              />
              <span className="font-bold text-white/95">{Math.min(explorationProgress.treasureDiscovered, region?.discoveryTotals?.treasure ?? 0)}/{region?.discoveryTotals?.treasure ?? 0}</span>
            </div>
          </div>
        </div>

        <div className="mt-[10px] w-full pointer-events-none">
          <AnimatePresence mode="wait">
            {floatingRewardToasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 12, scale: 0.98, filter: 'blur(4px)' }}
                animate={{ opacity: 0.8, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(4px)' }}
                transition={{ duration: 0.28, ease: [0.25, 0.7, 0.2, 1] }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-[12px] font-semibold shadow-[0_8px_22px_rgba(0,0,0,0.35)]"
                style={{
                  color: toast.textColor,
                  borderColor: toast.borderColor,
                  backgroundColor: toast.bgColor ?? 'rgba(8,10,24,0.75)',
                }}
              >
                {toast.iconSrc && <img src={toast.iconSrc} alt="" className="w-3.5 h-3.5 object-contain" draggable={false} />}
                <span className="truncate">{toast.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {activeEvent && activeEvent.kind === 'treasure' && !activeEvent.resolved ? (
          <motion.div
            key={`treasure-${activeEvent.id}`}
            className="absolute inset-0 z-[9] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center translate-y-[34px]">
              <motion.button
                type="button"
                whileTap={{ scale: 0.92, y: 3 }}
                animate={{ y: [0, -7, 0, -4, 0], scale: [1, 1.02, 1, 1.01, 1] }}
                transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                onClick={() => {
                  if (!treasureChestOpened) {
                    playSfx(TREASURE_CLOSE_SFX_PATH, 0.86)
                    setTreasureChestOpened(true)
                  } else {
                    playSfx(TREASURE_OPEN_SFX_PATH, 0.86)
                  }
                  handleEventInteraction('click')
                }}
                className="pointer-events-auto relative flex items-center justify-center"
                aria-label={treasureChestOpened ? '열린 보물 상자' : '닫힌 보물 상자'}
              >
                <img
                  src={a(treasureChestOpened ? 'assets/particle/chest_open.png' : 'assets/particle/chest_close.png')}
                  alt="보물 상자"
                  className="w-[294px] h-[294px] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
              </motion.button>
              <div className="mt-3 w-[max-content] max-w-[92vw] rounded-3xl border border-white/10 bg-black/80 px-5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] text-center -translate-y-[60px]">
                {treasureChestOpened ? (
                  <span className="text-[15px] font-semibold text-[#cd9881] tracking-wide">
                    한 번 더 눌러 보상을 받으세요.
                  </span>
                ) : (
                  <span className="text-[15px] font-semibold text-[#cd9881] tracking-wide">
                    ··· 상자를 눌러 열어보세요 ···
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ) : activeEvent && activeRegionalAsset ? (
          <motion.div
            key={`regional-${activeEvent.id}`}
            className="absolute inset-0 z-[9] pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div className="flex flex-col items-center translate-y-[84px]">
              <motion.button
                type="button"
                onPointerDown={() => triggerRegionalPressFeedback()}
                animate={{ scale: isRegionalPressing ? 0.91 : 1, y: isRegionalPressing ? 3 : 0 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                onClick={handleRegionalObjectClick}
                data-suppress-tap-sfx="true"
                className="pointer-events-auto relative flex -translate-y-[40px] items-center justify-center"
                style={{ transformOrigin: '50% 50%' }}
                aria-label={activeRegionalAsset.label}
              >
                <motion.div
                  animate={isRegionalPressing ? { rotate: 0 } : { rotate: [-2.4, 2.4] }}
                  transition={isRegionalPressing
                    ? { duration: 0.1, ease: 'easeOut' }
                    : { duration: 1.55, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
                  style={{ transformOrigin: '50% 6%' }}
                >
                  <img
                    src={a(activeRegionalAsset.imagePath)}
                    alt={activeRegionalAsset.label}
                    className="w-[294px] h-[294px] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                    draggable={false}
                  />
                </motion.div>
              </motion.button>
              <div className="mt-[22px] mb-[10px] w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] rounded-[19px] border border-white/10 bg-black/75 backdrop-blur-[2px] px-5 py-[16px] shadow-[0_10px_24px_rgba(0,0,0,0.28)] text-center -translate-y-[60px]">
                <span className="text-[15px] font-semibold tracking-wide" style={{ color: regionalAccentColor }}>
                  <span>{activeRegionalAsset.label}을(를)</span><br />
                  <span className="font-normal">아무 곳이나 3번 눌러 기운을 모아보세요.</span>
                </span>
                <RegionalProgressGauge
                  current={activeEvent.clickCount}
                  total={activeEvent.targetClicks}
                  accentColor={regionalAccentColor}
                  className="mt-2"
                />
              </div>
            </div>
          </motion.div>
        ) : activeEvent ? (
          <motion.div
            key={`event-${activeEvent.id}-${activeEvent.kind}`}
            className="absolute inset-x-0 bottom-[190px] z-[9] px-3 pointer-events-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div
              className={`mx-auto w-full max-w-[360px] rounded-[20px] bg-[rgba(6,8,18,0.75)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.35)] text-center ${activeEvent.kind === 'spirit' && !activeEvent.resolved ? 'pointer-events-auto' : 'pointer-events-none'}`}
              onPointerDown={(e) => {
                if (activeEvent.kind === 'spirit' && !activeEvent.resolved) {
                  e.stopPropagation()
                }
              }}
            >
              <div className="flex items-center justify-center text-[12px] font-medium text-white">
                <span>{activeEvent.title}</span>
                {activeEvent.kind !== 'empty' && !activeEvent.resolved && (
                  <span className="ml-2 text-[11px] text-white/70">{activeEvent.clickCount}/{activeEvent.targetClicks}</span>
                )}
              </div>
              <div className="mt-1 text-[15px] leading-relaxed font-semibold text-white">{activeEvent.description}</div>
                {activeEvent.kind === 'regional' && !activeEvent.resolved && (
                  <RegionalProgressGauge
                    current={activeEvent.clickCount}
                    total={activeEvent.targetClicks}
                    accentColor={regionalAccentColor}
                    className="mt-2"
                  />
                )}
              {activeEvent.kind === 'spirit' && !activeEvent.resolved && (
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEventInteraction('pass')}
                    className="flex-1 rounded-lg border border-white/15 bg-[rgba(90,95,115,0.6)] px-2 py-2 text-[12px] font-semibold text-white/90"
                  >
                    지나간다
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEventInteraction('help')}
                    className="flex-1 rounded-lg border border-[#8fc7a5]/30 bg-[rgba(44,74,61,0.8)] px-2 py-2 text-[12px] font-semibold text-[#ecf9f0]"
                  >
                    도와주기
                  </button>
                </div>
              )}
              {(activeEvent.kind === 'regional' || activeEvent.kind === 'treasure') && !activeEvent.resolved && (
                <div className="mt-3 text-center text-[15px] font-semibold text-white">
                  {activeEvent.kind === 'treasure'
                    ? '화면 아무 곳이나 탭해 상자를 열어보세요.'
                    : activeRegionalAsset
                      ? '오브젝트를 3번 클릭해 지역 기운을 모아보세요.'
                      : '화면 아무 곳이나 3번 탭해 지역 기운을 모아보세요.'}
                </div>
              )}
              {activeEvent.resolved && activeEvent.kind === 'empty' && (
                <div className="mt-2 text-[15px] font-semibold text-white">{activeEvent.rewardText}</div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {showLevelUpBadge && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.95 }}
          animate={{ opacity: [0, 1, 0], y: [6, 0, -8], scale: [0.95, 1, 1] }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute left-3 top-20 z-[12] flex items-center gap-2 rounded-full border border-[#f2d68f]/35 bg-[rgba(10,12,30,0.9)] px-3 py-2 text-[12px] font-semibold text-[#f2d68f]"
        >
          <img src={a('assets/particle/levelup_icon.png')} alt="level up" className="w-5 h-5 object-contain" draggable={false} />
          <span>레벨업!</span>
        </motion.div>
      )}

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
          showLevelUpBadge={showLevelUpBadge}
          onGoMain={() => {
            setShowResult(false)
            setScreen('main')
          }}
          onGoExpeditionMap={() => {
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

function RegionalProgressGauge({
  current,
  total,
  accentColor,
  className = '',
}: {
  current: number
  total: number
  accentColor: string
  className?: string
}) {
  const safeTotal = Math.max(1, total)
  const ratio = Math.max(0, Math.min(1, current / safeTotal))

  return (
    <div className={`mx-auto w-full max-w-[220px] ${className}`.trim()}>
      <div
        className="relative h-[7px] overflow-hidden rounded-full border bg-[rgba(168,175,188,0.2)]"
        style={{ borderColor: hexToRgba(accentColor, 0.5) }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accentColor} 0%, ${hexToRgba(accentColor, 0.78)} 52%, ${accentColor} 100%)`,
            boxShadow: `0 0 8px ${hexToRgba(accentColor, 0.55)}, 0 0 14px ${hexToRgba(accentColor, 0.45)}`,
          }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        />
      </div>
      <div className="mt-1 text-center text-[11px] font-medium" style={{ color: hexToRgba(accentColor, 0.85) }}>
        {Math.min(current, safeTotal)}/{safeTotal}
      </div>
    </div>
  )
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.trim().replace('#', '')
  if (normalized.length !== 6) {
    return `rgba(205, 152, 129, ${alpha})`
  }

  const intValue = Number.parseInt(normalized, 16)
  const r = (intValue >> 16) & 255
  const g = (intValue >> 8) & 255
  const b = intValue & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function ResultModal({
  a,
  result,
  showLevelUpBadge,
  onGoMain,
  onGoExpeditionMap,
}: {
  a: (path: string) => string
  result: ExploreResult
  showLevelUpBadge: boolean
  onGoMain: () => void
  onGoExpeditionMap: () => void
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
                a={a}
                label={row.label}
                targetValue={row.value}
                showLevelUpBadge={showLevelUpBadge && row.label === '경험치'}
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
                onGoMain()
              }}
              data-suppress-tap-sfx="true"
              className="relative h-11 w-[176px] max-w-full rounded-xl overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-[#d5dae6] transition-transform duration-100 active:scale-95"
            >
              <img
                src={a('assets/particle/btn_bg_sliver.png')}
                alt="메인 버튼 이미지"
                className="absolute inset-0 w-full h-full object-cover opacity-60"
                draggable={false}
              />
              <span className="relative z-[1] inline-block -translate-y-[3px] text-[15px] font-bold tracking-wide">메인으로</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playSfx(TAP_SFX_PATH, 0.85)
                onGoExpeditionMap()
              }}
              data-suppress-tap-sfx="true"
              className="relative h-11 w-[176px] max-w-full rounded-xl overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
            >
              <img
                src={a('assets/particle/btn_bg_brown.png')}
                alt="탐험 맵 버튼 이미지"
                className="absolute inset-0 w-full h-full object-cover opacity-62"
                draggable={false}
              />
              <span className="relative z-[1] inline-block -translate-y-[3px] text-[15px] font-bold tracking-wide">탐험 맵으로</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function AnimatedResultRow({
  a,
  label,
  targetValue,
  iconSrc,
  rarity,
  delay,
  showLevelUpBadge,
}: {
  a: (path: string) => string
  label: string
  targetValue: number
  iconSrc?: string
  rarity?: SpiritRarity
  delay: number
  showLevelUpBadge?: boolean
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
        {showLevelUpBadge && (
          <motion.img
            src={a('assets/particle/levelup_icon.png')}
            alt="level up"
            className="w-4 h-4 object-contain"
            animate={{ opacity: [0.35, 1, 0.35], scale: [0.92, 1.05, 0.92] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        )}
      </span>
      <span className={`font-bold tabular-nums ${rarity ? RESULT_RARITY_UI[rarity].valueClass : 'text-white'}`}>+{value}</span>
    </motion.div>
  )
}
