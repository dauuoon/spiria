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
import { HIDDEN_STAGE_BALANCE } from '../data/hiddenStage'
import { SPIRIT_FRAGMENT_ITEM_BY_STAGE } from '../data/progression'
import { getRarityByItemId, RESULT_RARITY_UI, SPIRIT_RARITY_TOKENS } from '../data/rarity'
import { SPIRITS } from '../data/spirits'
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

const HIDDEN_BACKGROUND_BY_STAGE: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'assets/background/map1_back_hidden.png',
  2: 'assets/background/map2_back_hidden.png',
  3: 'assets/background/map3_back_hidden.png',
  4: 'assets/background/map4_back_hidden.png',
  5: 'assets/background/map5_back_hidden.png',
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
const SOUL_EVENT_SFX_PATH = 'assets/sound/soul_event.mp3'
const REGIONAL_PICK_SFX_PATH = 'assets/sound/regions_pick.mp3'
const ALL_MAPS_100_SFX_PATH = 'assets/sound/percent.mp3'
const CARD_FLIP_SFX_PATH = 'assets/sound/cardsw.mp3'
const GAME_SUCCESS_SFX_PATH = 'assets/sound/gamesuccess.mp3'
const GAME_FAIL_SFX_PATH = 'assets/sound/gamefail.mp3'
const MATCHING_MAX_MISTAKES = 4
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

const SPIRIT_MINI_GAMES: Record<string, SpiritMiniGameSpec> = {
  spirit_withered_starflower: {
    eventId: 'spirit_withered_starflower',
    mode: 'timing',
    title: '시든 별꽃 곁의 정령',
    description: '별꽃이 시들어 정령이 힘을 잃고 있습니다.\n빛이 하나로 모이는 순간 별꽃을 깨워주세요',
    imagePath: 'assets/map/forest_wreath2.png',
    actionLabel: '빛 깨우기',
    successText: '별빛이 모였어요!',
    failText: '빛이 흩어졌어요.',
    clearText: '시든 별꽃이 다시 빛나기 시작했습니다.',
  },
  spirit_leaf_hidden: {
    eventId: 'spirit_leaf_hidden',
    mode: 'matching',
    title: '낙엽 아래 숨은 정령',
    description: '낙엽 사이에 흩어진 같은 문양을 찾아\n정령이 숨은 곳을 밝혀 주세요.',
    imagePath: 'assets/map/forest_wreath3.png',
    actionLabel: '카드 맞추기',
    successText: '같은 문양을 찾았어요!',
    failText: '문양이 달라 빛이 흩어졌어요.',
    clearText: '낙엽 아래 숨어 있던 정령을 발견했습니다.',
  },
  spirit_sleeping_forest: {
    eventId: 'spirit_sleeping_forest',
    mode: 'fortune',
    title: '잠든 숲의 정령',
    description: '잠든 정령이 자신을 깨울 빛을 기다리고 있습니다.',
    imagePath: 'assets/map/forest_wreath4.png',
    actionLabel: '빛 선택하기',
    choiceLabels: ['달빛', '햇빛', '별빛'],
    successText: '정령이 당신의 빛에 응답했습니다.',
    failText: '빛이 닿지 않았습니다.',
    clearText: '잠든 숲의 정령이 천천히 눈을 떴습니다.',
  },
  spirit_lost_vortex: {
    eventId: 'spirit_lost_vortex',
    mode: 'fortune',
    title: '길을 잃은 바람의 정령',
    description: '작은 회오리가 길을 잃었습니다.\n바람이 불어갈 방향을 선택해 주세요.',
    imagePath: 'assets/map/wind_wreath1.png',
    actionLabel: '방향 선택하기',
    choiceLabels: ['←', '↑', '→'],
    successText: '바람의 길을 찾았어요!',
    failText: '바람이 흩어졌어요.',
    clearText: '길을 잃은 바람의 정령이 흐름을 되찾았습니다.',
  },
  spirit_broken_windmill: {
    eventId: 'spirit_broken_windmill',
    mode: 'timing',
    title: '멈춘 바람 풍차',
    description: '멈춘 풍차에 다시 바람을 불어넣어 주세요.\n가장 강한 바람의 순간을 맞춰 보세요.',
    imagePath: 'assets/map/wind_wreath3.png',
    actionLabel: '바람 불어넣기',
    successText: '강한 바람이 불어왔어요!',
    failText: '바람이 약해졌어요.',
    clearText: '풍차가 다시 힘차게\n돌기 시작했습니다.',
  },
  spirit_cloud_above: {
    eventId: 'spirit_cloud_above',
    mode: 'matching',
    title: '구름 위의 정령',
    description: '흩어진 구름 조각을 찾아\n정령의 쉼터를 완성해 주세요.',
    imagePath: 'assets/map/wind_wreath2.png',
    actionLabel: '조각 맞추기',
    successText: '구름 조각을 찾았어요!',
    failText: '구름 조각이 흩어졌어요.',
    clearText: '정령의 쉼터가 다시 완성되었습니다.',
  },
  spirit_lost_snowflower: {
    eventId: 'spirit_lost_snowflower',
    mode: 'fortune',
    title: '길 잃은 눈꽃 정령',
    description: '눈보라가 정령의 발자국을 지웠습니다.\n눈보라가 잠잠해질 방향을 선택해 주세요.',
    imagePath: 'assets/map/snow_wreath2.png',
    actionLabel: '바람 선택하기',
    choiceLabels: ['북풍', '서풍', '남풍'],
    successText: '눈보라가 잠잠해졌어요!',
    failText: '눈보라가 더 거세졌어요.',
    clearText: '길 잃은 눈꽃 정령이 발자국을 되찾았습니다.',
  },
  spirit_frozen_moon: {
    eventId: 'spirit_frozen_moon',
    mode: 'timing',
    title: '얼어붙은 달의 정령',
    description: '차가운 눈보라가 정령의 빛을 얼리고 있습니다.\n가장 따뜻한 순간에 달빛을 비춰 주세요.',
    imagePath: 'assets/map/snow_wreath1.png',
    actionLabel: '달빛 비추기',
    successText: '따뜻한 빛이 닿았어요!',
    failText: '한기가 더 짙어졌어요.',
    clearText: '얼어붙은 달의 정령이 다시 빛나기 시작했습니다.',
  },
  spirit_sleeping_lake: {
    eventId: 'spirit_sleeping_lake',
    mode: 'matching',
    title: '잠든 설원의 정령',
    description: '흩어진 얼음 조각을 찾아\n잠든 정령의 호수를 완성해 주세요.',
    imagePath: 'assets/map/snow_wreath3.png',
    actionLabel: '조각 맞추기',
    successText: '얼음 조각을 찾았어요!',
    failText: '얼음 조각이 갈라졌어요.',
    clearText: '잠든 설원의 정령이 눈을 떴습니다.',
  },
  spirit_sun_core: {
    eventId: 'spirit_sun_core',
    mode: 'fortune',
    title: '태양의 정령',
    description: '태양의 힘이 세 갈래로 흩어졌습니다.\n정령에게 가장 강한 태양의 빛을 전해 주세요.',
    imagePath: 'assets/map/fire_wreath2.png',
    actionLabel: '빛 선택하기',
    choiceLabels: ['새벽의 빛', '한낮의 빛', '황혼의 빛'],
    successText: '강한 태양빛이 모였어요!',
    failText: '빛이 약해졌어요.',
    clearText: '태양의 정령이 다시 강렬해졌습니다.',
  },
  spirit_fading_flame: {
    eventId: 'spirit_fading_flame',
    mode: 'timing',
    title: '꺼져가는 불꽃 정령',
    description: '작은 불꽃이 점점 꺼져가고 있습니다.\n가장 뜨거운 순간에 불꽃을 되살려 주세요.',
    imagePath: 'assets/map/fire_wreath1.png',
    actionLabel: '불꽃 되살리기',
    successText: '불꽃이 다시 타올랐어요!',
    failText: '불꽃이 더 약해졌어요.',
    clearText: '꺼져가던 불꽃 정령이 힘을 되찾았습니다.',
  },
  spirit_lava_trapped: {
    eventId: 'spirit_lava_trapped',
    mode: 'matching',
    title: '용암에 갇힌 정령',
    description: '흩어진 용암 조각을 찾아\n정령이 갇힌 틈을 열어 주세요.',
    imagePath: 'assets/map/fire_wreath3.png',
    actionLabel: '조각 맞추기',
    successText: '용암 조각을 찾았어요!',
    failText: '용암 조각이 어긋났어요.',
    clearText: '정령이 갇힌 틈이 열렸습니다.',
  },
  spirit_lost_shadow: {
    eventId: 'spirit_lost_shadow',
    mode: 'fortune',
    title: '길 잃은 그림자 정령',
    description: '짙은 안개가 정령의 감각을 가리고 있습니다.\n정령을 이끌 신호를 선택해 주세요.',
    imagePath: 'assets/map/dark_wreath2.png',
    actionLabel: '신호 선택하기',
    choiceLabels: ['달의\n그림자', '고대의\n속삭임', '푸름\n불빛'],
    successText: '신호가 정령에게 닿았어요!',
    failText: '신호가 안개에 가려졌어요.',
    clearText: '길 잃은 그림자 정령이 길을 찾았습니다.',
  },
  spirit_sleeping_ancient: {
    eventId: 'spirit_sleeping_ancient',
    mode: 'timing',
    title: '잠든 고대 정령',
    description: '오랜 잠에 빠진 고대 정령의 빛이 희미하게 깜박이고 있습니다.\n빛이 가장 강해지는 순간 정령을 깨워 주세요.',
    imagePath: 'assets/map/dark_wreath1.png',
    actionLabel: '정령 깨우기',
    successText: '고대의 빛이 깨어났어요!',
    failText: '빛이 다시 잠들었어요.',
    clearText: '잠든 고대 정령이 천천히 깨어났습니다.',
  },
  spirit_fading_memory: {
    eventId: 'spirit_fading_memory',
    mode: 'matching',
    title: '사라지는 기억의 정령',
    description: '흩어진 기억 조각의 짝을 찾아\n정령의 기억을 되돌려 주세요.',
    imagePath: 'assets/map/dark_wreath3.png',
    actionLabel: '기억 맞추기',
    successText: '기억 조각이 이어졌어요!',
    failText: '기억이 더 흐려졌어요.',
    clearText: '사라지던 기억이 다시 이어졌습니다.',
  },
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

type SpiritMiniGameMode = 'timing' | 'matching' | 'fortune'

type SpiritMiniGameSpec = {
  eventId: string
  mode: SpiritMiniGameMode
  title: string
  description: string
  imagePath: string
  actionLabel: string
  choiceLabels?: [string, string, string]
  successText: string
  failText: string
  clearText: string
}

type ExplorationSpiritPlan = {
  spiritCount: number
  spiritStepTemplateByIndex: Record<number, { templateId: string; gameKey: string }>
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
  const activeHiddenStage = useAppStore((s) => s.activeHiddenStage)
  const addItem = useAppStore((s) => s.addItem)
  const addCoins = useAppStore((s) => s.addCoins)
  const addMana = useAppStore((s) => s.addMana)
  const gainExp = useAppStore((s) => s.gainExp)
  const discoveredSpiritIds = useAppStore((s) => s.discoveredSpiritIds)
  const hiddenStageFirstClearByRegion = useAppStore((s) => s.hiddenStageFirstClearByRegion)
  const markHiddenStageFirstClear = useAppStore((s) => s.markHiddenStageFirstClear)
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
  const [activeSpiritMiniGameId, setActiveSpiritMiniGameId] = useState<string | null>(null)
  const resultTimerRef = useRef<number | null>(null)
  const emptyEventDismissTimerRef = useRef<number | null>(null)
  const floatingToastQueueRef = useRef<FloatingRewardToast[]>([])
  const floatingToastTimerRef = useRef<number | null>(null)
  const floatingToastGapTimerRef = useRef<number | null>(null)
  const floatingToastRunningRef = useRef(false)
  const showResultRef = useRef(false)
  const treasureChestEventIdRef = useRef<string | null>(null)
  const spiritEventIdRef = useRef<string | null>(null)
  const explorationRewardPlanRef = useRef<ExplorationRewardPlan | null>(null)
  const pendingSpiritRewardStepRef = useRef<number | null>(null)
  const pendingRegionalRewardStepRef = useRef<number | null>(null)
  const pendingTreasureRewardStepRef = useRef<number | null>(null)
  const exploreTapCooldownUntilRef = useRef(0)
  const pendingFinalResultRef = useRef(false)
  const allMapsCompleteRef = useRef<boolean | null>(null)
  const regionalPressTimerRef = useRef<number | null>(null)
  const spiritMiniGameSuccessTimerRef = useRef<number | null>(null)
  const spiritPlanRef = useRef<ExplorationSpiritPlan | null>(null)
  const eventKindHistoryRef = useRef<ActiveEventState['kind'][]>([])
  const hiddenResultGrantLockRef = useRef(false)

  const remaining = Math.max(0, TOTAL_EXPLORES - used)
  const isHiddenStage = activeHiddenStage === stage
  const activeBackgroundSrc = isHiddenStage ? HIDDEN_BACKGROUND_BY_STAGE[stage] : backgroundSrc
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
  const displayMapTitle = isHiddenStage ? `${mapTitle}(히든맵)` : mapTitle
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
    if (activeEvent?.kind === 'spirit' && !activeEvent.resolved) {
      if (spiritEventIdRef.current !== activeEvent.id) {
        spiritEventIdRef.current = activeEvent.id
        playSfx(SOUL_EVENT_SFX_PATH, 0.82)
      }
      return
    }

    spiritEventIdRef.current = null
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

  const buildExplorationSpiritPlan = useCallback((): ExplorationSpiritPlan => {
    const spiritTemplates = (region?.eventTemplates ?? []).filter((template) => template.kind === 'spirit')
    if (spiritTemplates.length === 0) {
      return {
        spiritCount: 0,
        spiritStepTemplateByIndex: {},
      }
    }

    const roll = Math.random()
    let requestedSpiritCount = 0
    if (roll < 0.02) requestedSpiritCount = 0
    else if (roll < 0.22) requestedSpiritCount = 1
    else if (roll < 0.66) requestedSpiritCount = 2
    else requestedSpiritCount = 3

    const groupedByGameKey = new Map<string, typeof spiritTemplates>()
    for (const template of spiritTemplates) {
      const gameKey = template.gameType ?? template.id
      const bucket = groupedByGameKey.get(gameKey)
      if (bucket) {
        bucket.push(template)
      } else {
        groupedByGameKey.set(gameKey, [template])
      }
    }

    const availableGameKeys = Array.from(groupedByGameKey.keys())
    const targetSpiritCount = Math.min(requestedSpiritCount, availableGameKeys.length)
    if (targetSpiritCount <= 0) {
      return {
        spiritCount: 0,
        spiritStepTemplateByIndex: {},
      }
    }

    const shuffledGameKeys = [...availableGameKeys]
    for (let i = shuffledGameKeys.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffledGameKeys[i]
      shuffledGameKeys[i] = shuffledGameKeys[j]
      shuffledGameKeys[j] = temp
    }
    const selectedGameKeys = shuffledGameKeys.slice(0, targetSpiritCount)

    const selectedTemplates = selectedGameKeys.map((gameKey) => {
      const candidates = groupedByGameKey.get(gameKey) ?? []
      return candidates[Math.floor(Math.random() * candidates.length)]
    }).filter((template): template is NonNullable<typeof template> => !!template)

    const selectedCount = selectedTemplates.length
    if (selectedCount <= 0) {
      return {
        spiritCount: 0,
        spiritStepTemplateByIndex: {},
      }
    }

    const allStepIndices = Array.from({ length: TOTAL_EXPLORES }, (_, idx) => idx)
    let selectedStepIndices: number[] = []

    if (selectedCount === 1) {
      const picked = allStepIndices[Math.floor(Math.random() * allStepIndices.length)]
      selectedStepIndices = [picked]
    } else {
      const shuffledSteps = [...allStepIndices]
      for (let i = shuffledSteps.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1))
        const temp = shuffledSteps[i]
        shuffledSteps[i] = shuffledSteps[j]
        shuffledSteps[j] = temp
      }
      selectedStepIndices = shuffledSteps.slice(0, selectedCount)
    }

    const selectedTemplatesShuffled = [...selectedTemplates]
    for (let i = selectedTemplatesShuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = selectedTemplatesShuffled[i]
      selectedTemplatesShuffled[i] = selectedTemplatesShuffled[j]
      selectedTemplatesShuffled[j] = temp
    }

    const spiritStepTemplateByIndex: ExplorationSpiritPlan['spiritStepTemplateByIndex'] = {}
    selectedStepIndices.forEach((stepIndex, idx) => {
      const template = selectedTemplatesShuffled[idx]
      if (!template) return
      spiritStepTemplateByIndex[stepIndex] = {
        templateId: template.id,
        gameKey: template.gameType ?? template.id,
      }
    })

    return {
      spiritCount: Object.keys(spiritStepTemplateByIndex).length,
      spiritStepTemplateByIndex,
    }
  }, [region])

  const ensureSpiritPlan = useCallback(() => {
    if (spiritPlanRef.current) return spiritPlanRef.current
    const plan = buildExplorationSpiritPlan()
    spiritPlanRef.current = plan
    return plan
  }, [buildExplorationSpiritPlan])

  const pickNonSpiritEventTemplate = useCallback((blockedKinds?: Array<'regional' | 'treasure'>) => {
    const blocked = new Set(blockedKinds ?? [])
    const templates = (region?.eventTemplates ?? []).filter((template) => (
      template.kind !== 'spirit' && !blocked.has(template.kind)
    ))
    if (templates.length === 0) return null

    const noneChance = EXPEDITION_REWARD_DRAFT.eventProbabilities.none
    if (Math.random() < noneChance) return null

    return templates[Math.floor(Math.random() * templates.length)] ?? null
  }, [region])

  const buildEventState = useCallback((stepIndex: number): ActiveEventState => {
    if (!region) {
      return buildEmptyEventState()
    }

    const history = eventKindHistoryRef.current
    const prev1 = history[history.length - 1]
    const prev2 = history[history.length - 2]
    const blockSpirit = prev1 === 'spirit' && prev2 === 'spirit'
    const blockRegional = prev1 === 'regional' && prev2 === 'regional'

    const spiritPlan = ensureSpiritPlan()
    const plannedSpiritTemplateMeta = spiritPlan.spiritStepTemplateByIndex[stepIndex]

    let template = null
    if (plannedSpiritTemplateMeta && !blockSpirit) {
      template = (region.eventTemplates ?? []).find((it) => it.id === plannedSpiritTemplateMeta.templateId) ?? null
    }
    if (!template) {
      template = pickNonSpiritEventTemplate(blockRegional ? ['regional'] : undefined)
    }

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
  }, [buildEmptyEventState, ensureSpiritPlan, pickNonSpiritEventTemplate, region])

  useEffect(() => {
    spiritPlanRef.current = buildExplorationSpiritPlan()
  }, [buildExplorationSpiritPlan])

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
  }, [a, dungeon, getItemDef, region?.dropTable, stage])

  const randomIntInclusive = useCallback((min: number, max: number) => {
    if (max <= min) return min
    return min + Math.floor(Math.random() * (max - min + 1))
  }, [])

  const buildHiddenStageRewardResult = useCallback((isFirstClear: boolean): ExploreResult => {
    const profile = isFirstClear ? HIDDEN_STAGE_BALANCE.firstClear : HIDDEN_STAGE_BALANCE.repeatClear

    const fragmentItemBySpiritId = new Map(
      ITEMS
        .filter((item) => item.id.startsWith('fragment_spirit_'))
        .map((item) => [item.id.replace(/^fragment_/, ''), item] as const),
    )

    const validSpiritIds = SPIRITS
      .map((spirit) => spirit.id)
      .filter((spiritId) => fragmentItemBySpiritId.has(spiritId))

    const undiscoveredSpiritIds = validSpiritIds.filter((spiritId) => !discoveredSpiritIds.includes(spiritId))
    const candidateSpiritIds = undiscoveredSpiritIds.length > 0 ? undiscoveredSpiritIds : validSpiritIds
    const selectedSpiritId = candidateSpiritIds[Math.floor(Math.random() * candidateSpiritIds.length)]
    const selectedFragmentItem = selectedSpiritId ? fragmentItemBySpiritId.get(selectedSpiritId) ?? null : null

    const materialTotal = randomIntInclusive(profile.materialTotalMin, profile.materialTotalMax)
    const materialCounts = new Map<string, number>()
    for (let i = 0; i < materialTotal; i += 1) {
      const randomMaterialId = MATERIAL_ITEM_IDS[Math.floor(Math.random() * MATERIAL_ITEM_IDS.length)]
      materialCounts.set(randomMaterialId, (materialCounts.get(randomMaterialId) ?? 0) + 1)
    }

    const materialRewards: ExploreResult['itemRewards'] = Array.from(materialCounts.entries()).map(([materialId, count]) => {
      const materialDef = getItemDef(materialId)
      return {
        id: materialId,
        name: materialDef?.name ?? materialId,
        count,
        iconSrc: a(`assets/item/it/it_${materialId}.png`),
        category: '재료' as const,
        rarity: getRarityByItemId(materialId, '재료'),
      }
    })

    const fragmentRewards: ExploreResult['itemRewards'] = selectedFragmentItem
      ? [{
          id: selectedFragmentItem.id,
          name: selectedFragmentItem.name,
          count: profile.fragmentAmount,
          iconSrc: a(selectedFragmentItem.icon ?? 'assets/item/it/it_soul.png'),
          category: '기타' as const,
          rarity: getRarityByItemId(selectedFragmentItem.id, '기타'),
        }]
      : []

    const mana = Math.random() < HIDDEN_STAGE_BALANCE.manaBonusChance ? HIDDEN_STAGE_BALANCE.manaBonusAmount : 0

    return {
      exp: profile.exp,
      gold: profile.gold,
      materials: materialTotal,
      mana,
      etcRewards: fragmentRewards.map((reward) => ({
        id: reward.id,
        name: reward.name,
        count: reward.count,
        iconSrc: reward.iconSrc,
        rarity: reward.rarity,
      })),
      itemRewards: [...materialRewards, ...fragmentRewards],
    }
  }, [a, discoveredSpiritIds, getItemDef, randomIntInclusive])

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
    if (isHiddenStage) return

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
  }, [addCoins, addItem, addMana, gainExp, getRarityToastColors, initializeExplorationRewardPlan, isHiddenStage, markExplorationDiscovery, showFloatingRewardToasts, stage])

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

    if (isHiddenStage) {
      if (hiddenResultGrantLockRef.current) return
      hiddenResultGrantLockRef.current = true

      const regionId = region?.id
      const isFirstClear = regionId ? !hiddenStageFirstClearByRegion[regionId] : false
      const hiddenResult = buildHiddenStageRewardResult(isFirstClear)

      const levelUpInfo = gainExp(hiddenResult.exp)
      if (levelUpInfo) {
        setShowLevelUpBadge(true)
        window.setTimeout(() => setShowLevelUpBadge(false), 900)
      }
      addCoins(hiddenResult.gold)
      if (hiddenResult.mana > 0) addMana(hiddenResult.mana)

      for (const reward of hiddenResult.itemRewards) {
        addItem(reward.id, reward.count)
        if (reward.category === '재료') markExplorationDiscovery(stage, 'material')
        if (reward.id.startsWith('fragment_')) markExplorationDiscovery(stage, 'spirit')
      }

      if (isFirstClear && regionId) {
        markHiddenStageFirstClear(regionId)
      }

      if (resultTimerRef.current !== null) {
        window.clearTimeout(resultTimerRef.current)
      }
      resultTimerRef.current = window.setTimeout(() => {
        setResult(hiddenResult)
        setShowResult(true)
        explorationRewardPlanRef.current = null
        resultTimerRef.current = null
      }, EXPEDITION_REWARD_DRAFT.resultRevealDelayMs)
      return
    }

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
  }, [
    addCoins,
    addItem,
    addMana,
    buildHiddenStageRewardResult,
    buildResultFromPlan,
    gainExp,
    getRarityToastColors,
    hiddenStageFirstClearByRegion,
    initializeExplorationRewardPlan,
    isHiddenStage,
    markExplorationDiscovery,
    markHiddenStageFirstClear,
    region?.id,
    showFloatingRewardToasts,
    stage,
  ])

  const handleEventInteraction = useCallback((action: 'help' | 'pass' | 'click', options?: { suppressNoRewardToast?: boolean }) => {
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
        if (!options?.suppressNoRewardToast) {
          showFloatingRewardToasts([{ text: '획득 없음', colors: FLOATING_TOAST_COLORS.none }])
        }
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

  const handleTreasureTap = useCallback(() => {
    if (!activeEvent || activeEvent.kind !== 'treasure' || activeEvent.resolved) return
    if (!treasureChestOpened) {
      playSfx(TREASURE_CLOSE_SFX_PATH, 0.86)
      setTreasureChestOpened(true)
    } else {
      playSfx(TREASURE_OPEN_SFX_PATH, 0.86)
    }
    handleEventInteraction('click')
  }, [activeEvent, handleEventInteraction, treasureChestOpened])

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
      } else if (activeEvent.kind === 'treasure') {
        const now = Date.now()
        if (now < exploreTapCooldownUntilRef.current) {
          return
        }
        exploreTapCooldownUntilRef.current = now + EXPLORE_TAP_COOLDOWN_MS
        handleTreasureTap()
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

    ensureSpiritPlan()

    const nextEvent = activeEvent && !activeEvent.resolved ? activeEvent : buildEventState(used)
    setActiveEvent(nextEvent)
    eventKindHistoryRef.current.push(nextEvent.kind)
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
  }, [activeEvent, remaining, showExitConfirm, showResult, a, footstepSrc, bgControls, circleControls, buildEventState, ensureSpiritPlan, finalizeExploreResult, handleEventInteraction, showFloatingRewardToasts, used, applyExploreStepRewards, stage, triggerRegionalPressFeedback, handleTreasureTap])

  const progressTokens = useMemo(
    () => Array.from({ length: TOTAL_EXPLORES }, (_, i) => i < remaining),
    [remaining],
  )

  const activeRegionalAsset = useMemo(() => {
    if (!activeEvent || activeEvent.kind !== 'regional' || activeEvent.resolved) return null
    return REGIONAL_EVENT_ASSET_BY_ID[activeEvent.id] ?? null
  }, [activeEvent])
  const activeSpiritMiniGameSpec = useMemo(() => {
    if (!activeEvent || activeEvent.kind !== 'spirit' || activeEvent.resolved) return null
    if (activeSpiritMiniGameId !== activeEvent.id) return null
    return SPIRIT_MINI_GAMES[activeEvent.id] ?? null
  }, [activeEvent, activeSpiritMiniGameId])
  const activeSpiritGuideImagePath = useMemo(() => {
    if (!activeEvent || activeEvent.kind !== 'spirit' || activeEvent.resolved) return null
    const spec = SPIRIT_MINI_GAMES[activeEvent.id]
    if (stage === 1 && spec) {
      if (spec.mode === 'matching') return 'assets/map/forest_event_illust1.png'
      if (spec.mode === 'timing') return 'assets/map/forest_event_illust2.png'
      if (spec.mode === 'fortune') return 'assets/map/forest_event_illust3.png'
    }
    if (stage === 2 && spec) {
      if (spec.mode === 'matching') return 'assets/map/wind_event_illust3.png'
      if (spec.mode === 'timing') return 'assets/map/wind_event_illust2.png'
      if (spec.mode === 'fortune') return 'assets/map/wind_event_illust1.png'
    }
    if (stage === 3 && spec) {
      if (spec.mode === 'matching') return 'assets/map/snow_event_illust1.png'
      if (spec.mode === 'timing') return 'assets/map/snow_event_illust3.png'
      if (spec.mode === 'fortune') return 'assets/map/snow_event_illust2.png'
    }
    if (stage === 4 && spec) {
      if (spec.mode === 'matching') return 'assets/map/fire_event_illust3.png'
      if (spec.mode === 'timing') return 'assets/map/fire_event_illust1.png'
      if (spec.mode === 'fortune') return 'assets/map/fire_event_illust2.png'
    }
    if (stage === 5 && spec) {
      if (spec.mode === 'matching') return 'assets/map/soul_event_illust3.png'
      if (spec.mode === 'timing') return 'assets/map/soul_event_illust2.png'
      if (spec.mode === 'fortune') return 'assets/map/soul_event_illust1.png'
    }
    return spec?.imagePath ?? circleSrc
  }, [activeEvent, circleSrc, stage])
  const spiritPopupTheme = useMemo(() => {
    if (stage === 2) {
      return {
        borderColor: '#634A6E',
        textColor: '#F2CBF4',
        bgImagePath: 'assets/background/wind_event_bg.png',
        helpButtonBgColor: 'rgba(78,68,119,0.5)',
        helpButtonBorderColor: '#af9eba',
        helpButtonTextColor: '#F2CBF4',
        glowMainGradient: 'radial-gradient(circle, rgba(212,154,255,0.5) 0%, rgba(136,82,201,0.3) 46%, rgba(28,20,40,0) 78%)',
        glowSubGradient: 'radial-gradient(circle, rgba(187,121,246,0.34) 0%, rgba(187,121,246,0.14) 52%, rgba(187,121,246,0) 84%)',
        particleBaseColor: '#D9A9FF',
        particleAltColor: '#C77BFF',
        particleSoftColor: '#ECD2FF',
        particleMidColor: '#CF97FF',
        particleLightColor: '#F6E8FF',
      }
    }
    if (stage === 3) {
      return {
        borderColor: '#4A4E6E',
        textColor: '#B4BFEA',
        bgImagePath: 'assets/background/snow_event_bg.png',
        helpButtonBgColor: 'rgba(73,88,136,0.5)',
        helpButtonBorderColor: '#9ea3ba',
        helpButtonTextColor: '#B4BFEA',
        glowMainGradient: 'radial-gradient(circle, rgba(175,247,232,0.5) 0%, rgba(92,201,180,0.28) 46%, rgba(20,42,40,0) 78%)',
        glowSubGradient: 'radial-gradient(circle, rgba(146,235,216,0.34) 0%, rgba(146,235,216,0.14) 52%, rgba(146,235,216,0) 84%)',
        particleBaseColor: '#B7F6E7',
        particleAltColor: '#8EEFD9',
        particleSoftColor: '#D8FFF4',
        particleMidColor: '#9DECD9',
        particleLightColor: '#ECFFF9',
      }
    }
    if (stage === 4) {
      return {
        borderColor: '#583949',
        textColor: '#FAB7B8',
        bgImagePath: 'assets/background/fire_event_bg.png',
        helpButtonBgColor: 'rgba(136,73,74,0.5)',
        helpButtonBorderColor: '#BA9EAB',
        helpButtonTextColor: '#FAB7B8',
        glowMainGradient: 'radial-gradient(circle, rgba(255,210,154,0.46) 0%, rgba(232,143,95,0.25) 46%, rgba(56,24,18,0) 76%)',
        glowSubGradient: 'radial-gradient(circle, rgba(255,189,131,0.3) 0%, rgba(255,189,131,0.12) 52%, rgba(255,189,131,0) 82%)',
        particleBaseColor: '#FFD9A8',
        particleAltColor: '#FFC48E',
        particleSoftColor: '#FFE6C5',
        particleMidColor: '#FFCF9C',
        particleLightColor: '#FFF1DE',
      }
    }
    if (stage === 5) {
      return {
        borderColor: '#503E6D',
        textColor: '#BAA2E1',
        bgImagePath: 'assets/background/soul_event_bg.png',
        helpButtonBgColor: 'rgba(131,73,136,0.5)',
        helpButtonBorderColor: '#Ba9eb9',
        helpButtonTextColor: '#BAA2E1',
        glowMainGradient: 'radial-gradient(circle, rgba(255,196,236,0.46) 0%, rgba(225,132,193,0.24) 46%, rgba(48,20,44,0) 76%)',
        glowSubGradient: 'radial-gradient(circle, rgba(244,170,220,0.3) 0%, rgba(244,170,220,0.12) 52%, rgba(244,170,220,0) 82%)',
        particleBaseColor: '#FFD0EC',
        particleAltColor: '#F7B4DF',
        particleSoftColor: '#FFE2F4',
        particleMidColor: '#F9C3E7',
        particleLightColor: '#FFF0FA',
      }
    }
    return {
      borderColor: '#426166',
      textColor: '#CBF4ED',
      bgImagePath: 'assets/background/forest_event_bg.png',
      helpButtonBgColor: 'rgba(68,119,102,0.5)',
      helpButtonBorderColor: '#9ebab5',
      helpButtonTextColor: '#CBF4ED',
      glowMainGradient: 'radial-gradient(circle, rgba(255,240,184,0.45) 0%, rgba(232,201,112,0.22) 46%, rgba(44,38,20,0) 76%)',
      glowSubGradient: 'radial-gradient(circle, rgba(255,226,136,0.28) 0%, rgba(255,226,136,0.1) 52%, rgba(255,226,136,0) 82%)',
      particleBaseColor: '#FFF0B5',
      particleAltColor: '#FFE7A0',
      particleSoftColor: '#FFF6CF',
      particleMidColor: '#FFEBAE',
      particleLightColor: '#FFFBE6',
    }
  }, [stage])
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

  const openSpiritMiniGame = useCallback(() => {
    if (!activeEvent || activeEvent.kind !== 'spirit' || activeEvent.resolved) return
    if (SPIRIT_MINI_GAMES[activeEvent.id]) {
      setActiveSpiritMiniGameId(activeEvent.id)
      return
    }
    handleEventInteraction('help')
  }, [activeEvent, handleEventInteraction])

  const handleSpiritMiniGameSuccess = useCallback(() => {
    showFloatingRewardToasts([
      {
        text: '성공',
        colors: {
          textColor: '#C9DCFF',
          borderColor: '#7CA6FFAA',
          bgColor: 'rgba(32,52,108,0.82)',
        },
        playSound: false,
      },
    ], { durationMs: 520, gapMs: 40 })

    if (spiritMiniGameSuccessTimerRef.current !== null) {
      window.clearTimeout(spiritMiniGameSuccessTimerRef.current)
    }
    spiritMiniGameSuccessTimerRef.current = window.setTimeout(() => {
      handleEventInteraction('help')
      spiritMiniGameSuccessTimerRef.current = null
    }, 620)
  }, [handleEventInteraction, showFloatingRewardToasts])

  const handleSpiritMiniGameFailure = useCallback(() => {
    setActiveSpiritMiniGameId(null)
    showFloatingRewardToasts([
      {
        text: '실패',
        colors: {
          textColor: '#FFC7D1',
          borderColor: '#FF7E97AA',
          bgColor: 'rgba(104,28,40,0.82)',
        },
        playSound: false,
      },
    ], { durationMs: 520, gapMs: 40 })
    handleEventInteraction('pass', { suppressNoRewardToast: true })
  }, [handleEventInteraction, showFloatingRewardToasts])

  useEffect(() => {
    if (!activeEvent || activeEvent.kind !== 'spirit' || activeEvent.resolved) {
      setActiveSpiritMiniGameId(null)
    }
  }, [activeEvent])

  useEffect(() => {
    return () => {
      if (spiritMiniGameSuccessTimerRef.current !== null) {
        window.clearTimeout(spiritMiniGameSuccessTimerRef.current)
        spiritMiniGameSuccessTimerRef.current = null
      }
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      <motion.img
        animate={bgControls}
        src={a(activeBackgroundSrc)}
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

      <TopBar onBack={() => setShowExitConfirm(true)} title={displayMapTitle} />

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
          {!activeSpiritMiniGameSpec && (
            <motion.div
              className="mt-5 text-white/85 text-[14px] tracking-wide"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              아무 곳이나 터치해 탐색하세요.
            </motion.div>
          )}
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
        {activeSpiritMiniGameSpec && (
          <SpiritMiniGameModal
            key={`spirit-mini-game-${activeSpiritMiniGameSpec.eventId}`}
            a={a}
            spec={activeSpiritMiniGameSpec}
            stage={stage}
            guideImagePath={activeSpiritGuideImagePath ?? undefined}
            onSuccess={handleSpiritMiniGameSuccess}
            onFail={handleSpiritMiniGameFailure}
          />
        )}

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
                onClick={handleTreasureTap}
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
                  animate={{ rotate: [-2.4, 2.4] }}
                  transition={{ duration: 1.55, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }}
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
        ) : activeEvent && !(activeSpiritMiniGameSpec && activeEvent.kind === 'spirit') ? (
          <motion.div
            key={`event-${activeEvent.id}-${activeEvent.kind}`}
            className="absolute inset-x-0 bottom-[190px] z-[9] px-3 pointer-events-none"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <div
              className={`mx-auto w-full rounded-[20px] bg-[rgba(6,8,18,0.75)] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.35)] text-center ${activeEvent.kind === 'spirit' && !activeEvent.resolved ? 'pointer-events-auto relative flex flex-col h-[460px] overflow-hidden border p-4 pb-5' : 'pointer-events-none'}`}
              style={activeEvent.kind === 'spirit' && !activeEvent.resolved ? { borderColor: spiritPopupTheme.borderColor } : undefined}
              onPointerDown={(e) => {
                if (activeEvent.kind === 'spirit' && !activeEvent.resolved) {
                  e.stopPropagation()
                }
              }}
            >
              {activeEvent.kind === 'spirit' && !activeEvent.resolved && (
                <img
                  src={a(spiritPopupTheme.bgImagePath)}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                  draggable={false}
                />
              )}

              <div className={`relative z-[1] flex items-center justify-center text-[12px] text-white ${activeEvent.kind === 'empty' ? 'font-normal' : 'font-medium'} ${activeEvent.kind === 'spirit' && !activeEvent.resolved ? 'mt-[15px]' : ''}`}>
                <span
                  className={activeEvent.kind === 'spirit' && !activeEvent.resolved ? 'text-[20px] font-bold' : ''}
                  style={activeEvent.kind === 'spirit' && !activeEvent.resolved ? { color: spiritPopupTheme.textColor } : undefined}
                >
                  {activeEvent.title}
                </span>
                {activeEvent.kind !== 'empty' && activeEvent.kind !== 'spirit' && !activeEvent.resolved && (
                  <span className="ml-2 text-[11px] text-white/70">{activeEvent.clickCount}/{activeEvent.targetClicks}</span>
                )}
              </div>
              <div
                className={`relative z-[1] mt-1 whitespace-pre-line text-white ${activeEvent.kind === 'spirit' && !activeEvent.resolved ? 'min-h-[42px] text-[14px] leading-[1.45] font-normal' : 'text-[15px] leading-relaxed font-semibold'}`}
                style={activeEvent.kind === 'spirit' && !activeEvent.resolved ? { color: spiritPopupTheme.textColor } : undefined}
              >
                {activeEvent.description}
              </div>

              {activeEvent.kind === 'spirit' && !activeEvent.resolved && activeSpiritGuideImagePath && (
                <div className="relative z-[1] mt-3 mb-4 flex items-center justify-center">
                  <motion.div
                    className="pointer-events-none absolute z-[2] h-[280px] w-[280px] rounded-full"
                    style={{
                      background: spiritPopupTheme.glowMainGradient,
                      filter: 'blur(18px)',
                    }}
                    animate={{ opacity: [0.45, 0.88, 0.45], scale: [0.94, 1.07, 0.94] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.div
                    className="pointer-events-none absolute z-[1] h-[320px] w-[320px] rounded-full"
                    style={{
                      background: spiritPopupTheme.glowSubGradient,
                      filter: 'blur(24px)',
                    }}
                    animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.96, 1.03, 0.96] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-96px)] top-[calc(50%-74px)] h-[8px] w-[8px] rounded-full"
                    style={{ backgroundColor: spiritPopupTheme.particleBaseColor, boxShadow: `0 0 14px ${spiritPopupTheme.particleBaseColor}` }}
                    animate={{ y: [0, -15, 0], opacity: [0.22, 1, 0.22], scale: [0.9, 1.12, 0.9] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%+64px)] top-[calc(50%-86px)] h-[7px] w-[7px] rounded-full"
                    style={{ backgroundColor: spiritPopupTheme.particleAltColor, boxShadow: `0 0 12px ${spiritPopupTheme.particleAltColor}` }}
                    animate={{ y: [0, -18, 0], opacity: [0.18, 0.94, 0.18], scale: [0.92, 1.1, 0.92] }}
                    transition={{ duration: 1.95, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-42px)] top-[calc(50%+84px)] h-[6px] w-[6px] rounded-full"
                    style={{ backgroundColor: spiritPopupTheme.particleSoftColor, boxShadow: `0 0 10px ${spiritPopupTheme.particleSoftColor}` }}
                    animate={{ y: [0, -13, 0], opacity: [0.15, 0.86, 0.15], scale: [0.9, 1.08, 0.9] }}
                    transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-10px)] top-[calc(50%-108px)] h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: spiritPopupTheme.particleMidColor, boxShadow: `0 0 11px ${spiritPopupTheme.particleMidColor}` }}
                    animate={{ y: [0, -16, 0], opacity: [0.14, 0.9, 0.14], scale: [0.88, 1.12, 0.88] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.42 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%+86px)] top-[calc(50%+28px)] h-[4px] w-[4px] rounded-full"
                    style={{ backgroundColor: spiritPopupTheme.particleLightColor, boxShadow: `0 0 9px ${spiritPopupTheme.particleLightColor}` }}
                    animate={{ y: [0, -12, 0], opacity: [0.12, 0.82, 0.12], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.55, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  />

                  <img
                    src={a(activeSpiritGuideImagePath)}
                    alt={activeEvent.title}
                    className="relative z-[10] w-[245px] h-[245px] object-cover"
                    draggable={false}
                  />
                </div>
              )}

                {activeEvent.kind === 'regional' && !activeEvent.resolved && (
                  <RegionalProgressGauge
                    current={activeEvent.clickCount}
                    total={activeEvent.targetClicks}
                    accentColor={regionalAccentColor}
                    className="mt-2"
                  />
                )}
              {activeEvent.kind === 'spirit' && !activeEvent.resolved && (
                <div className="relative z-[1] mt-auto flex items-center justify-center gap-[10px]">
                  <button
                    type="button"
                    onClick={() => handleEventInteraction('pass')}
                    className="h-[50px] w-[165px] rounded-[10px] border text-[16px] font-semibold"
                    style={{
                      backgroundColor: 'rgba(120,120,120,0.5)',
                      borderColor: '#878787',
                      color: '#d2d2d2',
                    }}
                  >
                    <span className="inline-block -translate-y-[2px]">지나간다</span>
                  </button>
                  <button
                    type="button"
                    onClick={openSpiritMiniGame}
                    className="h-[50px] w-[165px] rounded-[10px] border text-[16px] font-semibold"
                    style={{
                      backgroundColor: spiritPopupTheme.helpButtonBgColor,
                      borderColor: spiritPopupTheme.helpButtonBorderColor,
                      color: spiritPopupTheme.helpButtonTextColor,
                    }}
                  >
                    <span className="inline-block -translate-y-[2px]">도와준다</span>
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

function SpiritMiniGameModal({
  a,
  spec,
  stage,
  guideImagePath,
  onSuccess,
  onFail,
}: {
  a: (path: string) => string
  spec: SpiritMiniGameSpec
  stage: 1 | 2 | 3 | 4 | 5
  guideImagePath?: string
  onSuccess: () => void
  onFail: () => void
}) {
  const [status, setStatus] = useState<'playing' | 'failed' | 'cleared'>('playing')
  const [feedbackText, setFeedbackText] = useState('')
  const failTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  const resolveSuccess = useCallback((clearMessage?: string) => {
    if (status !== 'playing') return
    playSfx(GAME_SUCCESS_SFX_PATH, 0.88)

    setStatus('cleared')
    setFeedbackText(clearMessage ?? spec.clearText)

    if (spec.mode === 'timing' || spec.mode === 'fortune' || spec.mode === 'matching') {
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current)
      }
      clearTimerRef.current = window.setTimeout(() => {
        onSuccess()
        clearTimerRef.current = null
      }, 2000)
    }
  }, [onSuccess, spec.clearText, spec.mode, status])

  const resolveFailure = useCallback((failMessage?: string) => {
    if (status !== 'playing') return
    playSfx(GAME_FAIL_SFX_PATH, 0.88)
    setStatus('failed')
    setFeedbackText(failMessage ?? spec.failText)
    if (failTimerRef.current !== null) {
      window.clearTimeout(failTimerRef.current)
    }
    failTimerRef.current = window.setTimeout(() => {
      onFail()
      failTimerRef.current = null
    }, spec.mode === 'timing' || spec.mode === 'fortune' || spec.mode === 'matching' ? 2000 : 640)
  }, [onFail, spec.failText, status])

  useEffect(() => {
    return () => {
      if (failTimerRef.current !== null) {
        window.clearTimeout(failTimerRef.current)
        failTimerRef.current = null
      }
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current)
        clearTimerRef.current = null
      }
    }
  }, [])

  const timingVisualTheme = useMemo(() => {
    if (stage === 2) {
      return {
        glowMainGradient: 'radial-gradient(circle, rgba(212,154,255,0.5) 0%, rgba(136,82,201,0.3) 46%, rgba(28,20,40,0) 78%)',
        glowSubGradient: 'radial-gradient(circle, rgba(187,121,246,0.34) 0%, rgba(187,121,246,0.14) 52%, rgba(187,121,246,0) 84%)',
        particleBaseColor: '#D9A9FF',
        particleAltColor: '#C77BFF',
        particleSoftColor: '#ECD2FF',
        particleMidColor: '#CF97FF',
        particleLightColor: '#F6E8FF',
      }
    }
    if (stage === 3) {
      return {
        glowMainGradient: 'radial-gradient(circle, rgba(175,247,232,0.5) 0%, rgba(92,201,180,0.28) 46%, rgba(20,42,40,0) 78%)',
        glowSubGradient: 'radial-gradient(circle, rgba(146,235,216,0.34) 0%, rgba(146,235,216,0.14) 52%, rgba(146,235,216,0) 84%)',
        particleBaseColor: '#B7F6E7',
        particleAltColor: '#8EEFD9',
        particleSoftColor: '#D8FFF4',
        particleMidColor: '#9DECD9',
        particleLightColor: '#ECFFF9',
      }
    }
    if (stage === 4) {
      return {
        glowMainGradient: 'radial-gradient(circle, rgba(255,210,154,0.46) 0%, rgba(232,143,95,0.25) 46%, rgba(56,24,18,0) 76%)',
        glowSubGradient: 'radial-gradient(circle, rgba(255,189,131,0.3) 0%, rgba(255,189,131,0.12) 52%, rgba(255,189,131,0) 82%)',
        particleBaseColor: '#FFD9A8',
        particleAltColor: '#FFC48E',
        particleSoftColor: '#FFE6C5',
        particleMidColor: '#FFCF9C',
        particleLightColor: '#FFF1DE',
      }
    }
    if (stage === 5) {
      return {
        glowMainGradient: 'radial-gradient(circle, rgba(255,196,236,0.46) 0%, rgba(225,132,193,0.24) 46%, rgba(48,20,44,0) 76%)',
        glowSubGradient: 'radial-gradient(circle, rgba(244,170,220,0.3) 0%, rgba(244,170,220,0.12) 52%, rgba(244,170,220,0) 82%)',
        particleBaseColor: '#FFD0EC',
        particleAltColor: '#F7B4DF',
        particleSoftColor: '#FFE2F4',
        particleMidColor: '#F9C3E7',
        particleLightColor: '#FFF0FA',
      }
    }
    return {
      glowMainGradient: 'radial-gradient(circle, rgba(255,240,184,0.45) 0%, rgba(232,201,112,0.22) 46%, rgba(44,38,20,0) 76%)',
      glowSubGradient: 'radial-gradient(circle, rgba(255,226,136,0.28) 0%, rgba(255,226,136,0.1) 52%, rgba(255,226,136,0) 82%)',
      particleBaseColor: '#FFF0B5',
      particleAltColor: '#FFE7A0',
      particleSoftColor: '#FFF6CF',
      particleMidColor: '#FFEBAE',
      particleLightColor: '#FFFBE6',
    }
  }, [stage])

  const isTimingStyleMiniGame = spec.mode === 'timing' || spec.mode === 'fortune'
  const showMatchingResultBox = spec.mode === 'matching' && status !== 'playing'
  const matchingActionTheme = useMemo(() => {
    if (stage === 2) return { buttonBg: '#1B1B2A', buttonBorder: '#634A6E', buttonGlow: 'rgba(203,165,255,0.62)' }
    if (stage === 3) return { buttonBg: '#1E1F36', buttonBorder: '#4A4E6E', buttonGlow: 'rgba(138,215,255,0.62)' }
    if (stage === 4) return { buttonBg: '#351E2A', buttonBorder: '#583949', buttonGlow: 'rgba(255,210,123,0.62)' }
    if (stage === 5) return { buttonBg: '#261D35', buttonBorder: '#503E6D', buttonGlow: 'rgba(224,146,255,0.62)' }
    return { buttonBg: '#1B2829', buttonBorder: '#426166', buttonGlow: 'rgba(133,240,177,0.62)' }
  }, [stage])
  const displayDescription = useMemo(() => {
    if (spec.mode !== 'fortune') return spec.description
    if (spec.description.includes('\n')) return spec.description

    const words = spec.description.trim().split(/\s+/)
    if (words.length <= 2) return spec.description
    const mid = Math.ceil(words.length / 2)
    return `${words.slice(0, mid).join(' ')}\n${words.slice(mid).join(' ')}`
  }, [spec.description, spec.mode])

  return (
    <motion.div
      className="absolute inset-0 z-[35] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 18, opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative z-[1] w-[94vw] max-w-[420px] p-2"
      >
        {spec.mode !== 'matching' && !isTimingStyleMiniGame && (
          <div className="relative z-[1] text-center">
            <div className="text-[14px] text-white font-bold">{spec.title}</div>
            <p className="mt-1 text-[12px] leading-relaxed text-white/80">{spec.description}</p>
          </div>
        )}

        {(isTimingStyleMiniGame || showMatchingResultBox) && (
          <div className="relative z-[90] text-center min-h-[42px]">
            <div
              className={`relative z-[80] top-[125px] mx-auto rounded-xl px-2.5 py-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md ${spec.mode === 'timing' && status !== 'playing' ? 'w-[310px] max-w-[310px]' : ''}`}
              style={(isTimingStyleMiniGame || showMatchingResultBox) && status !== 'playing'
                ? status === 'cleared'
                  ? { backgroundColor: 'rgba(56,92,170,0.72)' }
                  : { backgroundColor: 'rgba(140,40,52,0.78)' }
                : { border: '1px solid rgba(255,255,255,0.10)', backgroundColor: 'rgba(8,11,24,0.37)' }}
            >
              <p className={`whitespace-pre-line break-words leading-[1.45] font-medium ${((isTimingStyleMiniGame || showMatchingResultBox) && status !== 'playing') ? 'text-[18px] text-white font-semibold' : 'text-[15px] text-white/90'}`}>
                <span style={((isTimingStyleMiniGame || showMatchingResultBox) && status !== 'playing') ? { textWrap: 'balance' } : undefined}>
                  {((isTimingStyleMiniGame || showMatchingResultBox) && status !== 'playing') ? feedbackText : displayDescription}
                </span>
              </p>
            </div>
          </div>
        )}

        <div className="relative z-[1] mt-3 p-0 flex flex-col items-center">
          {spec.mode === 'matching' && status === 'playing' && (
            <motion.div
              className="mb-2 text-center text-[13px] font-medium text-[#c2c5cb]"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              카드를 뒤집어 짝을 맞춰주세요. (오답 4회 시 실패)
            </motion.div>
          )}

          {spec.mode !== 'matching' && (
            <div className={`mt-3 flex items-center justify-center ${isTimingStyleMiniGame ? 'relative min-h-[310px]' : ''}`}>
              {isTimingStyleMiniGame && (
                <>
                  <motion.div
                    className="pointer-events-none absolute z-[2] h-[280px] w-[280px] rounded-full"
                    style={{
                      background: timingVisualTheme.glowMainGradient,
                      filter: 'blur(18px)',
                    }}
                    animate={{ opacity: [0.45, 0.88, 0.45], scale: [0.94, 1.07, 0.94] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.div
                    className="pointer-events-none absolute z-[1] h-[320px] w-[320px] rounded-full"
                    style={{
                      background: timingVisualTheme.glowSubGradient,
                      filter: 'blur(24px)',
                    }}
                    animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.96, 1.03, 0.96] }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-96px)] top-[calc(50%-74px)] h-[8px] w-[8px] rounded-full"
                    style={{ backgroundColor: timingVisualTheme.particleBaseColor, boxShadow: `0 0 14px ${timingVisualTheme.particleBaseColor}` }}
                    animate={{ y: [0, -15, 0], opacity: [0.22, 1, 0.22], scale: [0.9, 1.12, 0.9] }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%+64px)] top-[calc(50%-86px)] h-[7px] w-[7px] rounded-full"
                    style={{ backgroundColor: timingVisualTheme.particleAltColor, boxShadow: `0 0 12px ${timingVisualTheme.particleAltColor}` }}
                    animate={{ y: [0, -18, 0], opacity: [0.18, 0.94, 0.18], scale: [0.92, 1.1, 0.92] }}
                    transition={{ duration: 1.95, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-42px)] top-[calc(50%+84px)] h-[6px] w-[6px] rounded-full"
                    style={{ backgroundColor: timingVisualTheme.particleSoftColor, boxShadow: `0 0 10px ${timingVisualTheme.particleSoftColor}` }}
                    animate={{ y: [0, -13, 0], opacity: [0.15, 0.86, 0.15], scale: [0.9, 1.08, 0.9] }}
                    transition={{ duration: 1.65, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%-10px)] top-[calc(50%-108px)] h-[5px] w-[5px] rounded-full"
                    style={{ backgroundColor: timingVisualTheme.particleMidColor, boxShadow: `0 0 11px ${timingVisualTheme.particleMidColor}` }}
                    animate={{ y: [0, -16, 0], opacity: [0.14, 0.9, 0.14], scale: [0.88, 1.12, 0.88] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.42 }}
                  />
                  <motion.span
                    className="pointer-events-none absolute z-[20] left-[calc(50%+86px)] top-[calc(50%+28px)] h-[4px] w-[4px] rounded-full"
                    style={{ backgroundColor: timingVisualTheme.particleLightColor, boxShadow: `0 0 9px ${timingVisualTheme.particleLightColor}` }}
                    animate={{ y: [0, -12, 0], opacity: [0.12, 0.82, 0.12], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 1.55, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  />
                </>
              )}
              <motion.img
                src={a((isTimingStyleMiniGame && guideImagePath) ? guideImagePath : spec.imagePath)}
                alt={spec.title}
                className={isTimingStyleMiniGame ? 'relative z-[10] w-[292px] h-[292px] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]' : 'w-[180px] h-[180px] object-contain'}
                draggable={false}
                animate={status === 'cleared'
                  ? { filter: ['brightness(1) saturate(1)', 'brightness(1.28) saturate(1.25)', 'brightness(1.14) saturate(1.15)'] }
                  : { filter: 'brightness(1) saturate(1)' }}
                transition={status === 'cleared'
                  ? { duration: 0.55, ease: 'easeOut' }
                  : { duration: 0.2 }}
              />
            </div>
          )}

          {spec.mode === 'timing' && (
            <TimingTapGame
              stage={stage}
              disabled={status !== 'playing'}
              onSuccess={() => resolveSuccess(spec.clearText)}
              onFail={() => resolveFailure(spec.failText)}
              actionLabel={spec.actionLabel}
            />
          )}

          {spec.mode === 'matching' && (
            <>
              {status === 'playing' ? (
                <MatchingCardGame
                  a={a}
                  stage={stage}
                  disabled={status !== 'playing'}
                  onStatusText={setFeedbackText}
                  onClear={() => resolveSuccess(spec.clearText)}
                  onFail={() => resolveFailure(spec.failText)}
                />
              ) : (
                <div className="mt-3 flex items-center justify-center">
                  <motion.img
                    src={a(guideImagePath ?? spec.imagePath)}
                    alt={spec.title}
                    className="relative z-[10] w-[292px] h-[292px] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.35)]"
                    draggable={false}
                    animate={status === 'cleared'
                      ? { filter: ['brightness(1) saturate(1)', 'brightness(1.28) saturate(1.25)', 'brightness(1.14) saturate(1.15)'] }
                      : { filter: 'brightness(1) saturate(1)' }}
                    transition={status === 'cleared'
                      ? { duration: 0.55, ease: 'easeOut' }
                      : { duration: 0.2 }}
                  />
                </div>
              )}

              {status === 'playing' && (
                <button
                  type="button"
                  disabled={status !== 'playing'}
                  onClick={() => resolveFailure(spec.failText)}
                  className="mt-3 mx-auto block h-[54px] w-[140px] rounded-full border px-[15px] text-[15px] font-bold text-white disabled:opacity-50"
                  style={{
                    backgroundColor: matchingActionTheme.buttonBg,
                    borderColor: matchingActionTheme.buttonBorder,
                    boxShadow: `0 0 14px ${matchingActionTheme.buttonGlow}`,
                  }}
                >
                  <span className="inline-block">포기하기</span>
                </button>
              )}
            </>
          )}

          {spec.mode === 'fortune' && (
            <FortuneChoiceGame
              a={a}
              stage={stage}
              disabled={status !== 'playing'}
              choiceLabels={spec.choiceLabels}
              onSuccess={() => resolveSuccess(spec.clearText)}
              onFail={() => resolveFailure('빛이 닿지 않았습니다.')}
            />
          )}

          {spec.mode !== 'matching' && spec.mode !== 'fortune' && spec.mode !== 'timing' && (
            <div className="mt-3 text-center text-[12px] leading-relaxed text-white/75 min-h-[32px]">{feedbackText}</div>
          )}
        </div>

        <div className="relative z-[1] mt-3 flex gap-2">
          {status === 'failed' && spec.mode !== 'timing' && spec.mode !== 'fortune' && spec.mode !== 'matching' ? (
            <button
              type="button"
              disabled
              className="w-full h-11 rounded-lg border border-black/20 bg-black/5 text-[13px] font-semibold text-black/70"
            >
              실패 처리 중...
            </button>
          ) : status === 'cleared' && spec.mode !== 'timing' && spec.mode !== 'fortune' && spec.mode !== 'matching' ? (
            <button
              type="button"
              onClick={onSuccess}
              className="w-full h-11 rounded-lg border border-[#46654f]/35 bg-[rgba(164,191,172,0.55)] text-[13px] font-semibold text-black"
            >
              정령을 깨운다
            </button>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )

}

function TimingTapGame({
  stage,
  disabled,
  onSuccess,
  onFail,
  actionLabel,
}: {
  stage: 1 | 2 | 3 | 4 | 5
  disabled: boolean
  onSuccess: () => void
  onFail: () => void
  actionLabel: string
}) {
  const [pointer, setPointer] = useState(0.5)
  const directionRef = useRef(1)

  useEffect(() => {
    if (disabled) return
    directionRef.current = 1
    const interval = window.setInterval(() => {
      setPointer((prev) => {
        const next = prev + (0.016 * directionRef.current)
        if (next >= 1) {
          directionRef.current = -1
          return 1
        }
        if (next <= 0) {
          directionRef.current = 1
          return 0
        }
        return next
      })
    }, 16)

    return () => window.clearInterval(interval)
  }, [disabled])

  const successStart = 0.42
  const successEnd = 0.58

  const stageTheme = useMemo(() => {
    if (stage === 2) {
      return {
        trackGradient: 'linear-gradient(90deg, rgba(142,215,255,0.95) 0%, rgba(126,74,236,1) 50%, rgba(142,215,255,0.95) 100%)',
        pointerColor: '#462E70',
        pointerGlow: 'rgba(70,46,112,0.98)',
        buttonBg: '#1B1B2A',
        buttonBorder: '#634A6E',
        buttonGlow: 'rgba(203,165,255,0.62)',
      }
    }
    if (stage === 3) {
      return {
        trackGradient: 'linear-gradient(90deg, rgba(122,187,255,0.95) 0%, rgba(240,204,68,1) 50%, rgba(122,187,255,0.95) 100%)',
        pointerColor: '#1F5A86',
        pointerGlow: 'rgba(31,90,134,0.98)',
        buttonBg: '#1E1F36',
        buttonBorder: '#4A4E6E',
        buttonGlow: 'rgba(138,215,255,0.62)',
      }
    }
    if (stage === 4) {
      return {
        trackGradient: 'linear-gradient(90deg, rgba(255,233,140,0.95) 0%, rgba(236,78,12,1) 50%, rgba(255,233,140,0.95) 100%)',
        pointerColor: '#853415',
        pointerGlow: 'rgba(133,52,21,0.98)',
        buttonBg: '#351E2A',
        buttonBorder: '#583949',
        buttonGlow: 'rgba(255,210,123,0.62)',
      }
    }
    if (stage === 5) {
      return {
        trackGradient: 'linear-gradient(90deg, rgba(182,142,255,0.95) 0%, rgba(232,62,172,1) 50%, rgba(182,142,255,0.95) 100%)',
        pointerColor: '#5B216A',
        pointerGlow: 'rgba(91,33,106,0.98)',
        buttonBg: '#261D35',
        buttonBorder: '#503E6D',
        buttonGlow: 'rgba(224,146,255,0.62)',
      }
    }
    return {
      trackGradient: 'linear-gradient(90deg, rgba(251,232,137,0.95) 0%, rgba(63,206,52,1) 50%, rgba(251,232,137,0.95) 100%)',
      pointerColor: '#1E6447',
      pointerGlow: 'rgba(30,100,71,0.98)',
      buttonBg: '#1B2829',
      buttonBorder: '#426166',
      buttonGlow: 'rgba(133,240,177,0.62)',
    }
  }, [stage])

  return (
    <div className="mt-[12px]">
      <div
        className="relative mx-auto h-[30px] w-[280px] overflow-hidden rounded-full border-[2px] border-white/95"
        style={{ background: stageTheme.trackGradient }}
      >
        <div
          className="absolute top-0 h-full bg-black/20"
          style={{
            left: `${successStart * 100}%`,
            width: `${(successEnd - successStart) * 100}%`,
          }}
        />
        <div
          className="absolute top-1/2 h-[22px] w-[22px] -translate-y-1/2 rounded-full border-[2px] border-white/90"
          style={{
            left: `calc(${pointer * 100}% - 11px)`,
            backgroundColor: '#0c0c13',
            boxShadow: `0 0 16px ${stageTheme.pointerGlow}`,
          }}
        />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          const ok = pointer >= successStart && pointer <= successEnd
          if (ok) onSuccess()
          else onFail()
        }}
        className="mt-3 mx-auto block h-[54px] w-[140px] rounded-full border px-[15px] text-[15px] font-bold text-white disabled:opacity-50"
        style={{
          backgroundColor: stageTheme.buttonBg,
          borderColor: stageTheme.buttonBorder,
          boxShadow: `0 0 14px ${stageTheme.buttonGlow}`,
        }}
      >
        <span className="inline-block">{actionLabel}</span>
      </button>
    </div>
  )
}

type MatchingCard = {
  id: number
  key: string
  iconPath: string
}

function MatchingCardGame({
  a,
  stage,
  disabled,
  onStatusText,
  onClear,
  onFail,
}: {
  a: (path: string) => string
  stage: 1 | 2 | 3 | 4 | 5
  disabled: boolean
  onStatusText: (text: string) => void
  onClear: () => void
  onFail: () => void
}) {
  const cardBackPath = useMemo(() => {
    if (stage === 2) return 'assets/map/wind_cardback.png'
    if (stage === 3) return 'assets/map/snow_cardback.png'
    if (stage === 4) return 'assets/map/fire_cardback.png'
    if (stage === 5) return 'assets/map/soul_cardback.png'
    return 'assets/map/forest_cardback.png'
  }, [stage])

  const cardBackCenterPath = useMemo(() => {
    if (stage === 2) return 'assets/map/wind_cardbackcenter.png'
    if (stage === 3) return 'assets/map/snow_cardbackcenter.png'
    if (stage === 4) return 'assets/map/fire_cardbackcenter.png'
    if (stage === 5) return 'assets/map/soul_cardbackcenter.png'
    return 'assets/map/forest_cardbackcenter.png'
  }, [stage])

  const cardFaceTheme = useMemo(() => {
    if (stage === 2) return { bg: '#1B1B2A', border: '#634A6E' }
    if (stage === 3) return { bg: '#1E1F36', border: '#4A4E6E' }
    if (stage === 4) return { bg: '#351E2A', border: '#583949' }
    if (stage === 5) return { bg: '#261D35', border: '#503E6D' }
    return { bg: '#1B2829', border: '#426166' }
  }, [stage])

  const closedCardBg = useMemo(() => {
    if (stage === 2) return '#D0A9B3'
    if (stage === 3) return '#CBCBFB'
    if (stage === 4) return '#DA9461'
    if (stage === 5) return '#B789A3'
    return '#A7C8A3'
  }, [stage])

  const cards = useMemo<MatchingCard[]>(() => {
    const symbols = ['flower', 'leaf', 'star', 'magic']
    const raw = symbols.flatMap((key) => ([
      { id: 0, key, iconPath: `assets/item/it/it_${key}.png` },
      { id: 0, key, iconPath: `assets/item/it/it_${key}.png` },
    ]))

    const shuffled = [...raw]
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1))
      const temp = shuffled[i]
      shuffled[i] = shuffled[j]
      shuffled[j] = temp
    }

    return shuffled.map((card, idx) => ({ ...card, id: idx }))
  }, [])

  const [firstSelectedId, setFirstSelectedId] = useState<number | null>(null)
  const [secondSelectedId, setSecondSelectedId] = useState<number | null>(null)
  const [matchedIds, setMatchedIds] = useState<number[]>([])
  const [isJudging, setIsJudging] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [mistakeCount, setMistakeCount] = useState(0)
  const judgeTimerRef = useRef<number | null>(null)
  const clearTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (firstSelectedId === null || secondSelectedId === null) return
    setIsJudging(true)

    judgeTimerRef.current = window.setTimeout(() => {
      const first = cards[firstSelectedId]
      const second = cards[secondSelectedId]
      const isMatch = first.key === second.key

      if (isMatch) {
        playSfx(CARD_FLIP_SFX_PATH, 0.82)
        const nextMatched = [...matchedIds, firstSelectedId, secondSelectedId]
        setMatchedIds(nextMatched)
        setFirstSelectedId(null)
        setSecondSelectedId(null)
        setIsJudging(false)
        onStatusText('같은 문양을 찾았어요!')

        if (nextMatched.length === cards.length) {
          setIsCompleted(true)
          onClear()
        }
      } else {
        const nextMistakeCount = mistakeCount + 1
        const remainingChances = MATCHING_MAX_MISTAKES - nextMistakeCount
        setFirstSelectedId(null)
        setSecondSelectedId(null)
        setIsJudging(false)
        setMistakeCount(nextMistakeCount)

        if (remainingChances <= 0) {
          setIsCompleted(true)
          onStatusText(`문양이 모두 흐려졌어요. (${MATCHING_MAX_MISTAKES}회 실패)`)
          onFail()
        } else {
          onStatusText(`문양이 달라 빛이 흩어졌어요. (남은 기회 ${remainingChances}/${MATCHING_MAX_MISTAKES})`)
        }
      }

      judgeTimerRef.current = null
    }, 500)

    return () => {
      if (judgeTimerRef.current !== null) {
        window.clearTimeout(judgeTimerRef.current)
        judgeTimerRef.current = null
      }
    }
  }, [cards, firstSelectedId, matchedIds, mistakeCount, onClear, onFail, onStatusText, secondSelectedId])

  useEffect(() => {
    return () => {
      if (judgeTimerRef.current !== null) {
        window.clearTimeout(judgeTimerRef.current)
      }
      if (clearTimerRef.current !== null) {
        window.clearTimeout(clearTimerRef.current)
      }
    }
  }, [])

  return (
    <div className="mt-2">
      <div className="w-full grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, slotIndex) => {
          if (slotIndex === 4) {
            return (
              <div
                key="center-spirit-tile"
                className="relative aspect-square w-full overflow-hidden rounded-lg border border-black/15 bg-black/5 flex items-center justify-center"
                style={closedCardBg ? { backgroundColor: closedCardBg } : undefined}
              >
                <img
                  src={a(cardBackCenterPath)}
                  alt="정령 흔적"
                  className="absolute left-1/2 top-1/2 h-[108%] w-[108%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-90"
                  draggable={false}
                />
              </div>
            )
          }

          const cardIndex = slotIndex > 4 ? slotIndex - 1 : slotIndex
          const card = cards[cardIndex]
          if (!card) return <div key={`empty-${slotIndex}`} className="aspect-square w-full" />

          const isMatched = matchedIds.includes(card.id)
          const isOpen = card.id === firstSelectedId || card.id === secondSelectedId
          const canSelect = !disabled && !isJudging && !isMatched && !isCompleted

          return (
            <button
              key={card.id}
              type="button"
              disabled={!canSelect}
              onClick={() => {
                if (!canSelect) return
                if (firstSelectedId === null) {
                  setFirstSelectedId(card.id)
                  return
                }
                if (firstSelectedId === card.id) return
                if (secondSelectedId === null) {
                  setSecondSelectedId(card.id)
                }
              }}
              className={`relative aspect-square w-full rounded-lg transition ${isMatched ? 'opacity-0 pointer-events-none scale-90' : !isOpen ? 'border border-black/15 bg-black/5' : 'border-0'}`}
              style={isOpen
                ? {
                    backgroundColor: cardFaceTheme.bg,
                    borderColor: cardFaceTheme.border,
                  }
                : closedCardBg
                  ? { backgroundColor: closedCardBg }
                  : undefined}
            >
              {isOpen ? (
                <img
                  src={a(card.iconPath)}
                  alt={card.key}
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[105%] w-[105%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
                  draggable={false}
                />
              ) : (
                <img src={a(cardBackPath)} alt="카드 뒷면" className="h-full w-full object-contain p-1 opacity-90" draggable={false} />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-2 text-center text-[12px] font-medium text-white/75">
        실수 {mistakeCount}/{MATCHING_MAX_MISTAKES}
      </div>

    </div>
  )
}

function FortuneChoiceGame({
  a,
  stage,
  disabled,
  choiceLabels,
  onSuccess,
  onFail,
}: {
  a: (path: string) => string
  stage: 1 | 2 | 3 | 4 | 5
  disabled: boolean
  choiceLabels?: [string, string, string]
  onSuccess: () => void
  onFail: () => void
}) {
  const defaultLabels: [string, string, string] = ['별빛', '달빛', '햇빛']
  const labels = choiceLabels ?? defaultLabels
  const fallbackIconPaths = ['assets/item/it/it_star.png', 'assets/item/it/it_moon.png', 'assets/item/it/it_light.png']

  const resolveIconPathByLabel = useCallback((label: string, idx: number) => {
    const normalized = label.replace(/\s+/g, '')
    if (normalized.includes('별')) return 'assets/item/it/it_star.png'
    if (normalized.includes('달')) return 'assets/item/it/it_moon.png'
    if (normalized.includes('햇빛') || normalized.includes('태양') || normalized.includes('sun')) return 'assets/item/it/it_light.png'
    return fallbackIconPaths[idx] ?? fallbackIconPaths[0]
  }, [])

  const choices = useMemo(() => labels.map((name, idx) => ({
    id: `choice-${idx}`,
    name,
    iconPath: resolveIconPathByLabel(name, idx),
  })), [labels, resolveIconPathByLabel])

  const choiceTheme = useMemo(() => {
    if (stage === 2) return { bg: '#1B1B2A', border: '#634A6E' }
    if (stage === 3) return { bg: '#1E1F36', border: '#4A4E6E' }
    if (stage === 4) return { bg: '#351E2A', border: '#583949' }
    if (stage === 5) return { bg: '#261D35', border: '#503E6D' }
    return { bg: '#1B2829', border: '#426166' }
  }, [stage])

  const answerIndex = useMemo(() => Math.floor(Math.random() * choices.length), [choices.length])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [resolved, setResolved] = useState(false)
  const settleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current)
        settleTimerRef.current = null
      }
    }
  }, [])

  const isSuccess = selectedIndex !== null && selectedIndex === answerIndex
  const guideMessageTheme = useMemo(() => {
    if (!resolved) {
      return {
        text: '빛을 하나 선택해 주세요.',
        textClass: 'text-white/50',
        bgClass: 'bg-[rgba(10,12,26,0.25)]',
      }
    }

    if (isSuccess) {
      return {
        text: '성공!',
        textClass: 'text-[#B7C8FF]',
        bgClass: 'bg-[rgba(44,54,98,0.42)]',
      }
    }

    return {
      text: '실패!',
      textClass: 'text-[#FF7B92]',
      bgClass: 'bg-[rgba(96,30,44,0.42)]',
    }
  }, [isSuccess, resolved])

  return (
    <div className="mt-2">
      <div className={`mx-auto mb-2 w-[310px] rounded-full border-0 px-3 py-2 text-center text-[13px] font-semibold ${guideMessageTheme.textClass} ${guideMessageTheme.bgClass}`}>
        {guideMessageTheme.text}
      </div>

      <div className="mx-auto grid w-[310px] grid-cols-3 gap-2">
        {choices.map((choice, idx) => {
          const isSelected = selectedIndex === idx
          const isAnswer = resolved && idx === answerIndex
          return (
            <button
              key={choice.id}
              type="button"
              disabled={disabled || selectedIndex !== null}
              onClick={() => {
                if (disabled || selectedIndex !== null) return
                setSelectedIndex(idx)
                setResolved(true)
                if (idx === answerIndex) {
                  onSuccess()
                } else {
                  onFail()
                }
              }}
              className="flex h-[126px] min-w-[44px] flex-col items-center justify-center rounded-[15px] border px-1 text-[17px] font-medium text-white transition"
              style={{
                backgroundColor: choiceTheme.bg,
                borderColor: choiceTheme.border,
                opacity: 1,
              }}
            >
              <img src={a(choice.iconPath)} alt={choice.name} className="h-10 w-10 object-contain" draggable={false} />
              <div className="mt-[3px] w-full break-words whitespace-pre-line px-1 text-center text-[18px] leading-[1.22]">{choice.name}</div>
            </button>
          )
        })}
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
          alt="탐험 결과 배경"
          className="block w-full h-auto"
          draggable={false}
        />

        <div className="absolute inset-0 p-5 flex flex-col items-center justify-center">
          <div className="relative z-[1] text-[#efd8ab] text-[18px] font-extrabold tracking-wide">탐험 결과</div>

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
