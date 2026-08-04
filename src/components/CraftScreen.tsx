import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'
import { CRAFT_HINT_COSTS, getSpiritCraftCostByLevel, QUEST_REJECT_PENALTY_GOLD } from '../data/economy'
import { QUEST_REWARDS } from '../data/quests'
import { RECIPES } from '../data/recipes'
import { DEFAULT_SPIRIT_DETAIL_META, SPIRIT_DETAIL_META } from '../data/spiritDetails'
import { SPIRIT_REQUEST_PAGES, type SpiritRequestPage } from '../data/spiritRequests'
import { buildOrderedRecipe } from '../lib/crafting'

// Inventory counts are TBD; UI focuses on selection layout (3x4 grid)
// When counts become available, wire them from store/state.

const ACTIVE_REQUEST_COUNT = 4
const HINT_STATE_STORAGE_KEY = 'spiria.craft-hint-state.v1'
const CRAFT_BOARD_STATE_STORAGE_KEY = 'spiria.craft-board-state.v1'

type CraftSlots = [string | null, string | null, string | null]

type QuestHintState = {
  hintCount: number
  revealedSlots: number[]
}

type HintStateByQuestId = Record<string, QuestHintState>

type CraftBoardState = {
  activeQuestIds: string[]
  queueQuestIds: string[]
  questIndex: number
  acceptedQuestId: string | null
}

function loadHintStateByQuestId(): HintStateByQuestId {
  try {
    const raw = localStorage.getItem(HINT_STATE_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as HintStateByQuestId
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed
  } catch {
    return {}
  }
}

function saveHintStateByQuestId(state: HintStateByQuestId) {
  try {
    localStorage.setItem(HINT_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

function buildQuestMap() {
  return Object.fromEntries(SPIRIT_REQUEST_PAGES.map((quest) => [quest.id, quest])) as Record<string, SpiritRequestPage>
}

function loadCraftBoardState(): CraftBoardState | null {
  try {
    const raw = localStorage.getItem(CRAFT_BOARD_STATE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CraftBoardState
    if (!parsed || typeof parsed !== 'object') return null
    if (!Array.isArray(parsed.activeQuestIds) || !Array.isArray(parsed.queueQuestIds)) return null
    return {
      activeQuestIds: parsed.activeQuestIds.filter((id) => typeof id === 'string'),
      queueQuestIds: parsed.queueQuestIds.filter((id) => typeof id === 'string'),
      questIndex: Math.max(0, Math.floor(parsed.questIndex ?? 0)),
      acceptedQuestId: typeof parsed.acceptedQuestId === 'string' ? parsed.acceptedQuestId : null,
    }
  } catch {
    return null
  }
}

function saveCraftBoardState(state: CraftBoardState) {
  try {
    localStorage.setItem(CRAFT_BOARD_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

function toCraftSlots(next: Array<string | null>): CraftSlots {
  return [next[0] ?? null, next[1] ?? null, next[2] ?? null]
}

function isSlotLocked(slotIndex: number, revealedSlots: number[]) {
  return revealedSlots.includes(slotIndex)
}

function shuffleRequests<T>(items: readonly T[]): T[] {
  const next = [...items]
  for (let index = next.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = next[index]
    next[index] = next[randomIndex]
    next[randomIndex] = current
  }
  return next
}

function parseMatchRatePercent(raw: string): number | null {
  const found = String(raw).match(/\d+(?:\.\d+)?/)
  if (!found) return null
  const value = Number(found[0])
  if (Number.isNaN(value)) return null
  return Math.max(0, value)
}

function resolveQuestMatchRate(quest: SpiritRequestPage, craftedSpiritId: string): number | null {
  const explicitRate = quest.candidateMatchRates?.[craftedSpiritId]
  if (typeof explicitRate === 'number' && !Number.isNaN(explicitRate)) {
    return Math.max(0, explicitRate)
  }
  if (!quest.candidateSpiritIds.includes(craftedSpiritId)) return null

  // Fallback: use each candidate spirit's own baseline match rate metadata.
  const candidateMeta = SPIRIT_DETAIL_META[craftedSpiritId] ?? DEFAULT_SPIRIT_DETAIL_META
  const candidateRate = parseMatchRatePercent(candidateMeta.requestMatchRate)
  if (candidateRate !== null) return candidateRate

  const requestedMeta = SPIRIT_DETAIL_META[quest.spiritId] ?? DEFAULT_SPIRIT_DETAIL_META
  return parseMatchRatePercent(requestedMeta.requestMatchRate)
}

function resolveBestHintSpiritId(quest: SpiritRequestPage): string | null {
  let bestSpiritId: string | null = null
  let bestRate = -1

  for (const candidateId of quest.candidateSpiritIds) {
    const rate = resolveQuestMatchRate(quest, candidateId)
    if (rate === null) continue
    if (rate > bestRate) {
      bestRate = rate
      bestSpiritId = candidateId
      continue
    }
    // Tie-breaker: prefer quest representative spirit.
    if (rate === bestRate && candidateId === quest.spiritId) {
      bestSpiritId = candidateId
    }
  }

  if (bestSpiritId) return bestSpiritId
  return quest.candidateSpiritIds[0] ?? null
}

export default function CraftScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const openCraftResult = useAppStore(s => s.openCraftResult)
  const inventory = useAppStore(s => s.inventory)
  const coins = useAppStore(s => s.coins)
  const level = useAppStore(s => s.level)
  const consumeItem = useAppStore(s => s.consumeItem)
  const spendCoins = useAppStore(s => s.spendCoins)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [selectedSlots, setSelectedSlots] = useState<CraftSlots>([null, null, null])
  const [questIndex, setQuestIndex] = useState(0)
  const [acceptedQuestId, setAcceptedQuestId] = useState<string | null>(null)
  const [isCraftStartPending, setIsCraftStartPending] = useState(false)
  const [isHintApplyPending, setIsHintApplyPending] = useState(false)
  const [hintStateByQuestId, setHintStateByQuestId] = useState<HintStateByQuestId>(() => loadHintStateByQuestId())
  const [systemNotice, setSystemNotice] = useState<{ title: string; message: string } | null>(null)
  const hintApplyLockRef = useRef(false)
  const bubblingRef = useRef<HTMLAudioElement | null>(null)
  const PAPER_SFX_PATH = 'assets/sound/paper.mp3'
  const BUBBLING_SFX_PATH = 'assets/sound/bubbling.mp3'
  const COIN_PENALTY_SFX_PATH = 'assets/sound/num_coin.mp3'

  const [questBoard, setQuestBoard] = useState<{ active: SpiritRequestPage[]; queue: SpiritRequestPage[] }>(() => {
    const saved = loadCraftBoardState()
    if (!saved) {
      const shuffledRequests = shuffleRequests(SPIRIT_REQUEST_PAGES)
      return {
        active: [...shuffledRequests.slice(0, ACTIVE_REQUEST_COUNT)],
        queue: [...shuffledRequests.slice(ACTIVE_REQUEST_COUNT)],
      }
    }

    const questMap = buildQuestMap()
    const active = saved.activeQuestIds
      .map((id) => questMap[id])
      .filter((quest): quest is SpiritRequestPage => Boolean(quest))
    const queue = saved.queueQuestIds
      .map((id) => questMap[id])
      .filter((quest): quest is SpiritRequestPage => Boolean(quest))

    const existingIds = new Set([...active, ...queue].map((quest) => quest.id))
    const missing = SPIRIT_REQUEST_PAGES.filter((quest) => !existingIds.has(quest.id))
    const nextActive = [...active]
    const nextQueue = [...queue, ...missing]

    while (nextActive.length < ACTIVE_REQUEST_COUNT && nextQueue.length > 0) {
      const pulled = nextQueue.shift()
      if (pulled) nextActive.push(pulled)
    }

    return {
      active: nextActive,
      queue: nextQueue,
    }
  })

  useEffect(() => {
    const saved = loadCraftBoardState()
    if (!saved) return
    setQuestIndex(saved.questIndex)
    setAcceptedQuestId(saved.acceptedQuestId)
  }, [])

  const craftMaterials = [
    { id: 'flower', name: '꽃' },
    { id: 'leaf', name: '잎' },
    { id: 'soil', name: '흙' },
    { id: 'water', name: '물' },
    { id: 'fire', name: '불' },
    { id: 'wind', name: '바람' },
    { id: 'star', name: '별' },
    { id: 'moon', name: '달' },
    { id: 'light', name: '태양' },
    { id: 'magic', name: '마법' },
    { id: 'ether', name: '에테르' },
    { id: 'gem', name: '보석' },
  ] as const

  const matItems = craftMaterials
  const craftBgColors = [
    '#4E5EEA',
    '#79D8C6',
    '#E5C466',
    '#B8BEC9',
    '#866BFF',
    '#6EBEFF',
    '#8ED46B',
    '#A894FF',
    '#6A46E8',
    '#F6E7A8',
  ]

  const slots = selectedSlots
  const craftCost = useMemo(() => getSpiritCraftCostByLevel(level), [level])
  const activeQuest = questBoard.active[questIndex] ?? null
  const activeHintSpiritId = useMemo(() => {
    if (!activeQuest) return null
    return resolveBestHintSpiritId(activeQuest)
  }, [activeQuest])
  const activeQuestRecipe = useMemo(() => {
    if (!activeQuest) return null
    return RECIPES.find((recipe) => recipe.resultItemId === activeHintSpiritId)
      ?? activeQuest.candidateSpiritIds
        .map((candidateId) => RECIPES.find((recipe) => recipe.resultItemId === candidateId) ?? null)
        .find((recipe): recipe is (typeof RECIPES)[number] => Boolean(recipe))
      ?? null
  }, [activeHintSpiritId, activeQuest])
  const activeHintState = useMemo<QuestHintState>(() => {
    if (!activeQuest) return { hintCount: 0, revealedSlots: [] }
    return hintStateByQuestId[activeQuest.id] ?? { hintCount: 0, revealedSlots: [] }
  }, [activeQuest, hintStateByQuestId])
  const lockedSlots = activeHintState.revealedSlots
  const nextHintCost = CRAFT_HINT_COSTS[activeHintState.hintCount] ?? null
  const activeQuestRewardGold = useMemo(() => {
    if (!activeQuest) return 0
    const reward = QUEST_REWARDS.find((entry) => entry.tier === activeQuest.tier)
    return reward?.gold ?? 0
  }, [activeQuest])
  const acceptedQuest = useMemo(
    () => (acceptedQuestId ? questBoard.active.find((q) => q.id === acceptedQuestId) ?? null : null),
    [questBoard.active, acceptedQuestId],
  )
  const hasAcceptedQuest = Boolean(acceptedQuest)
  const isViewingAcceptedQuest = Boolean(acceptedQuest && activeQuest && acceptedQuest.id === activeQuest.id)
  const canNavigateQuests = questBoard.active.length > 0 && !acceptedQuest
  const canUseHint = Boolean(activeQuest && activeQuestRecipe && acceptedQuest && acceptedQuest.id === activeQuest.id)

  const selectedMaterialIds = useMemo(
    () => selectedSlots.filter((slot): slot is string => Boolean(slot)),
    [selectedSlots],
  )
  const selectedShortageIds = useMemo(
    () => selectedMaterialIds.filter((id) => (inventory[id] ?? 0) < craftCost.requiredPerMaterial),
    [selectedMaterialIds, inventory, craftCost.requiredPerMaterial],
  )
  const canCraft = selectedMaterialIds.length === craftCost.selectedMaterialKinds && selectedShortageIds.length === 0 && !isCraftStartPending

  const toggle = (id: string) => {
    setSelectedSlots((cur) => {
      const next = [...cur]
      const currentIndex = next.findIndex((slotId, index) => slotId === id && !isSlotLocked(index, lockedSlots))
      if (currentIndex >= 0) {
        next[currentIndex] = null
        return toCraftSlots(next)
      }

      if (next.includes(id)) return cur

      const firstEmptyUnlockedIndex = next.findIndex((slotId, index) => !slotId && !isSlotLocked(index, lockedSlots))
      if (firstEmptyUnlockedIndex < 0) return cur

      next[firstEmptyUnlockedIndex] = id
      return toCraftSlots(next)
    })
  }

  const resetSelected = () => {
    setSelectedSlots((cur) => toCraftSlots(cur.map((slotId, index) => (isSlotLocked(index, lockedSlots) ? slotId : null))))
  }

  useEffect(() => {
    if (!activeQuest) {
      setSelectedSlots([null, null, null])
      return
    }

    setSelectedSlots(() => {
      const next: Array<string | null> = [null, null, null]
      if (activeQuestRecipe) {
        for (const slotIndex of lockedSlots) {
          next[slotIndex] = activeQuestRecipe.ingredientIds[slotIndex]
        }
      }
      return toCraftSlots(next)
    })
  }, [activeQuest?.id])

  useEffect(() => {
    if (!activeQuestRecipe) return
    if (lockedSlots.length === 0) return

    setSelectedSlots((cur) => {
      const next = [...cur]
      for (const slotIndex of lockedSlots) {
        next[slotIndex] = activeQuestRecipe.ingredientIds[slotIndex]
      }
      return toCraftSlots(next)
    })
  }, [activeQuestRecipe, lockedSlots])

  const requestCraftStart = async (_recipe: { materialIds: [string, string, string]; recipeKey: string }) => {
    await new Promise((resolve) => window.setTimeout(resolve, 120))
    return true
  }

  const openSystemNotice = (message: string, title = '시스템 알림') => {
    setSystemNotice({ title, message })
  }

  const removeQuestAndFill = (questId: string) => {
    setQuestBoard((prev) => {
      const nextActive = prev.active.filter((quest) => quest.id !== questId)
      const nextQueue = [...prev.queue]
      if (nextQueue.length > 0) {
        const nextQuest = nextQueue.shift()
        if (nextQuest) nextActive.push(nextQuest)
      }
      return { active: nextActive, queue: nextQueue }
    })
  }

  const persistHintStateForQuest = (questId: string, nextState: QuestHintState) => {
    setHintStateByQuestId((prev) => {
      const next = {
        ...prev,
        [questId]: nextState,
      }
      saveHintStateByQuestId(next)
      return next
    })
  }

  const clearHintStateForQuest = (questId: string) => {
    setHintStateByQuestId((prev) => {
      if (!prev[questId]) return prev
      const next = { ...prev }
      delete next[questId]
      saveHintStateByQuestId(next)
      return next
    })
  }

  const playCoinSfx = () => {
    try {
      const audio = new Audio(a(COIN_PENALTY_SFX_PATH))
      audio.volume = 0.86
      void audio.play()
    } catch {
      // ignore audio failures
    }
  }

  const handleUseHint = () => {
    if (!activeQuest || !activeQuestRecipe || isHintApplyPending || hintApplyLockRef.current) return
    if (!acceptedQuest || acceptedQuest.id !== activeQuest.id) {
      openSystemNotice('의뢰서를 수락해야 힌트를 사용할 수 있어요.', '힌트 안내')
      return
    }
    if (activeHintState.hintCount >= CRAFT_HINT_COSTS.length) return

    const hintCost = CRAFT_HINT_COSTS[activeHintState.hintCount]
    if (coins < hintCost) {
      openSystemNotice('골드가 부족합니다.', '힌트 안내')
      return
    }

    const availableSlots = [0, 1, 2].filter((slotIndex) => !activeHintState.revealedSlots.includes(slotIndex))
    if (availableSlots.length === 0) return

    hintApplyLockRef.current = true
    setIsHintApplyPending(true)
    const spent = spendCoins(hintCost)
    if (spent < hintCost) {
      hintApplyLockRef.current = false
      setIsHintApplyPending(false)
      openSystemNotice('골드가 부족합니다.', '힌트 안내')
      return
    }

    const randomIndex = Math.floor(Math.random() * availableSlots.length)
    const revealedSlot = availableSlots[randomIndex]
    const nextRevealedSlots = [...activeHintState.revealedSlots, revealedSlot].sort((a, b) => a - b)
    const nextHintState: QuestHintState = {
      hintCount: Math.min(CRAFT_HINT_COSTS.length, activeHintState.hintCount + 1),
      revealedSlots: nextRevealedSlots,
    }

    persistHintStateForQuest(activeQuest.id, nextHintState)
    setSelectedSlots((cur) => {
      const next = [...cur]
      next[revealedSlot] = activeQuestRecipe.ingredientIds[revealedSlot]
      return toCraftSlots(next)
    })
    playCoinSfx()
    hintApplyLockRef.current = false
    setIsHintApplyPending(false)
  }

  const startCraft = async () => {
    if (!canCraft || isCraftStartPending) return
    if (questBoard.active.length > 0 && !acceptedQuest) {
      openSystemNotice('먼저 의뢰를 수락해 주세요.', '의뢰 안내')
      return
    }

    if (!selectedSlots[0] || !selectedSlots[1] || !selectedSlots[2]) return

    const orderedMaterialIds = [selectedSlots[0], selectedSlots[1], selectedSlots[2]] as [string, string, string]
    const recipe = buildOrderedRecipe(orderedMaterialIds)
    const targetQuest = acceptedQuest
    setIsCraftStartPending(true)
    try {
      const started = await requestCraftStart(recipe)
      if (!started) return

      const currentInventory = useAppStore.getState().inventory
      const hasEnough = orderedMaterialIds.every((id) => (currentInventory[id] ?? 0) >= craftCost.requiredPerMaterial)
      if (!hasEnough) return

      orderedMaterialIds.forEach((id) => {
        consumeItem(id, craftCost.requiredPerMaterial)
      })

      const craftedRecipe = RECIPES.find((entry) => entry.ingredientIds.join('>') === recipe.recipeKey)
      const craftedSpiritId = craftedRecipe?.resultItemId ?? null

      if (targetQuest) {
        const isSuccess = craftedSpiritId !== null && targetQuest.candidateSpiritIds.includes(craftedSpiritId)
        const resolvedMatchRate = isSuccess && craftedSpiritId
          ? resolveQuestMatchRate(targetQuest, craftedSpiritId)
          : 0
        if (isSuccess) {
          clearHintStateForQuest(targetQuest.id)
          removeQuestAndFill(targetQuest.id)
          setAcceptedQuestId(null)
        }
        openCraftResult({
          spiritId: craftedSpiritId,
          requestText: targetQuest.text,
          success: isSuccess,
          candidateSpiritIds: targetQuest.candidateSpiritIds,
          materialIds: orderedMaterialIds,
          matchRate: resolvedMatchRate,
          resultMode: 'craft',
        })
      } else {
        openCraftResult({
          spiritId: craftedSpiritId,
          requestText: '',
          success: craftedSpiritId !== null,
          candidateSpiritIds: [],
          materialIds: orderedMaterialIds,
          matchRate: craftedSpiritId !== null ? 100 : 0,
          resultMode: 'craft',
        })
      }
      setSelectedSlots([null, null, null])
    } catch {
      // do not consume materials when start request fails
    } finally {
      setIsCraftStartPending(false)
    }
  }

  const playPaperSfx = () => {
    try {
      const audio = new Audio(a(PAPER_SFX_PATH))
      audio.volume = 0.85
      void audio.play()
    } catch {
      // ignore audio failures
    }
  }

  const goPrevQuest = () => {
    if (!canNavigateQuests) return
    playPaperSfx()
    setQuestIndex((i) => (i - 1 + questBoard.active.length) % questBoard.active.length)
  }

  const goNextQuest = () => {
    if (!canNavigateQuests) return
    playPaperSfx()
    setQuestIndex((i) => (i + 1) % questBoard.active.length)
  }

  const acceptQuest = () => {
    if (!activeQuest) return
    playPaperSfx()
    setAcceptedQuestId(activeQuest.id)
    openSystemNotice('의뢰가 수락되었습니다. 제작을 시작하세요.', '의뢰 수락')
  }

  const rejectQuest = () => {
    if (!activeQuest) return
    playPaperSfx()
    const rejected = activeQuest
    removeQuestAndFill(rejected.id)
    clearHintStateForQuest(rejected.id)
    if (acceptedQuestId === rejected.id) {
      setAcceptedQuestId(null)
    }
    const spent = spendCoins(QUEST_REJECT_PENALTY_GOLD)
    playCoinSfx()
    openSystemNotice(`의뢰를 거절했습니다. (코인 -${spent.toLocaleString()})`, '의뢰 거절')
  }

  const cancelAcceptedQuest = () => {
    if (!acceptedQuest) return
    playPaperSfx()
    setAcceptedQuestId(null)
    openSystemNotice('의뢰 수락을 취소했습니다.', '의뢰 취소')
  }

  useEffect(() => {
    if (questBoard.active.length === 0) {
      setQuestIndex(0)
      setAcceptedQuestId(null)
      return
    }
    setQuestIndex((prev) => Math.min(prev, questBoard.active.length - 1))
  }, [questBoard.active])

  useEffect(() => {
    saveCraftBoardState({
      activeQuestIds: questBoard.active.map((quest) => quest.id),
      queueQuestIds: questBoard.queue.map((quest) => quest.id),
      questIndex,
      acceptedQuestId,
    })
  }, [acceptedQuestId, questBoard.active, questBoard.queue, questIndex])

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}${BUBBLING_SFX_PATH}`)
    audio.loop = true
    audio.volume = 0.32
    bubblingRef.current = audio

    const tryPlay = async () => {
      try {
        await audio.play()
      } catch {
        const resume = async () => {
          try {
            await audio.play()
          } catch {
            // ignore audio failures
          } finally {
            window.removeEventListener('pointerdown', resume)
            window.removeEventListener('keydown', resume)
          }
        }
        window.addEventListener('pointerdown', resume, { once: true })
        window.addEventListener('keydown', resume, { once: true })
      }
    }

    void tryPlay()

    return () => {
      audio.pause()
      audio.src = ''
      bubblingRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: craftBgColors }}
        transition={{ duration: 40, repeat: Infinity, repeatType: 'mirror', ease: 'linear' }}
      />

      {/* background */}
      <img
        src={a('assets/background/make_back.png')}
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

      {/* quest letter + slots */}
      <div className="absolute inset-0 z-[6] p-4 pt-16">
        {/* quest letter panel */}
        <div className="absolute left-[-11px] top-[38px] w-[calc(68%+26px)] max-w-[350px] text-[rgb(55,42,36)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-center -rotate-[2deg]">
          <img
            src={a('assets/background/paper_bg_light_l.png')}
            alt="의뢰서 배경"
            className="block w-full h-[228px] object-fill pointer-events-none select-none"
            draggable={false}
          />
          <div className="absolute inset-0 px-4 py-3 translate-y-[8px]">
            <div className="relative z-[1] mb-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goPrevQuest}
                disabled={!canNavigateQuests}
                className="w-5 h-5 translate-y-[1px] rounded border border-[#d4bb8e] bg-[#41333d] text-[#d4bb8e] text-[15px] font-extrabold leading-none flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed"
                aria-label="이전 의뢰"
              >
                {'<'}
              </button>
              <div className="text-[14px] font-extrabold">정령 의뢰서 ({questBoard.active.length === 0 ? 0 : questIndex + 1}/{questBoard.active.length})</div>
              <button
                type="button"
                onClick={goNextQuest}
                disabled={!canNavigateQuests}
                className="w-5 h-5 translate-y-[1px] rounded border border-[#d4bb8e] bg-[#41333d] text-[#d4bb8e] text-[15px] font-extrabold leading-none flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed"
                aria-label="다음 의뢰"
              >
                {'>'}
              </button>
            </div>
            <div className="relative z-[1] h-[1px] bg-[rgba(0,0,0,0.1)] my-2" />
            <p className="relative z-[1] text-[14px] leading-5 whitespace-pre-line [word-break:keep-all]">
              {activeQuest ? activeQuest.text : '현재 진행 가능한 의뢰가 없습니다.'}
            </p>
            <div className="relative z-[1] mt-[17px] px-2 py-1 rounded-md border border-[rgb(95,76,67)]/35 bg-[rgba(95,76,67,0.12)] text-[11px] text-[rgb(95,76,67)] font-semibold text-center">
              {acceptedQuest ? '의뢰 수락됨 (제작 시 완료 처리)' : '수락 후 제작 시 완료 처리'}
            </div>

            <div className="relative z-[1] mt-[17px] flex items-start justify-center gap-2">
              <div className="relative">
                {!hasAcceptedQuest && (
                  <div className="absolute z-[30] left-1/2 -translate-x-1/2 -top-[12px] h-[18px] px-2 rounded-md border border-red-300/40 bg-[rgb(90,22,28)] text-[11px] font-semibold text-[#ffd6d9] inline-flex items-center justify-center gap-1 whitespace-nowrap">
                    <img src={a('assets/particle/money.png')} alt="coin" className="w-3.5 h-3.5 object-contain" draggable={false} />
                    -{QUEST_REJECT_PENALTY_GOLD}
                  </div>
                )}
                <button
                  type="button"
                  onClick={hasAcceptedQuest ? cancelAcceptedQuest : rejectQuest}
                  disabled={!activeQuest && !acceptedQuest}
                  className={`relative h-8 w-[92px] rounded-lg overflow-hidden text-white disabled:opacity-60 disabled:cursor-not-allowed ${hasAcceptedQuest ? 'border border-slate-200/45 bg-[rgba(130,140,150,0.35)]' : 'border border-red-300/45 bg-[rgba(160,36,44,0.55)]'}`}
                >
                  <img
                    src={a(hasAcceptedQuest ? 'assets/particle/btn_bg_sliver.png' : 'assets/particle/btn_bg_red.png')}
                    alt={hasAcceptedQuest ? '취소 버튼 배경' : '거절 버튼 배경'}
                    className={`absolute inset-0 w-full h-full object-cover ${hasAcceptedQuest ? 'opacity-60' : 'opacity-65'}`}
                    draggable={false}
                  />
                  <span className={`relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide ${hasAcceptedQuest ? 'text-[#d5dae6]' : 'text-[#e4b4b4]'}`}>{hasAcceptedQuest ? '취소' : '거절'}</span>
                </button>
              </div>
              <div className="relative">
                <div className="absolute z-[30] left-1/2 -translate-x-1/2 -top-[12px] h-[18px] px-2 rounded-md border border-[#e7d2a9]/40 bg-[rgb(71,49,20)] text-[11px] font-semibold text-[#fbe2b7] inline-flex items-center justify-center gap-1 whitespace-nowrap">
                  <img src={a('assets/particle/money.png')} alt="coin" className="w-3.5 h-3.5 object-contain" draggable={false} />
                  +{activeQuestRewardGold}
                </div>
                <button
                  type="button"
                  onClick={acceptQuest}
                  disabled={!activeQuest || hasAcceptedQuest}
                  className="relative h-8 w-[92px] rounded-lg overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <img
                    src={a('assets/particle/btn_bg_brown.png')}
                    alt="수락 버튼 배경"
                    className="absolute inset-0 w-full h-full object-cover opacity-62"
                    draggable={false}
                  />
                  <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide text-[#f9e0b5]">수락</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94, y: 1 }}
          onClick={() => setScreen('expedition')}
          className="absolute right-[-18px] top-[34px] w-[156px] h-[156px] z-[7] rotate-[7deg]"
          aria-label="탐험 페이지 이동"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgba(255,223,88,0.72),rgba(255,223,88,0)_72%)] blur-[16px]"
          />
          <motion.img
            src={a('assets/particle/ex_go.png')}
            alt="탐험 이동"
            className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(8,10,22,0.6)] origin-top"
            animate={{ rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        </motion.button>

        {/* 재료 12개 (4x3) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[43%] translate-y-[19px] relative w-[390px]">
          <button
            type="button"
            onClick={handleUseHint}
            disabled={!activeQuest || !activeQuestRecipe || activeHintState.hintCount >= CRAFT_HINT_COSTS.length || isHintApplyPending}
            className={`absolute left-0 -top-[40px] inline-flex h-8 items-center gap-2 rounded-full border border-[#d6b88f]/45 px-3 text-[12px] font-semibold text-[#f5e2c7] disabled:cursor-not-allowed disabled:opacity-60 ${canUseHint ? 'bg-[rgb(90,66,34)] opacity-100' : 'bg-[rgba(90,66,34,0.55)]'}`}
          >
            {activeHintState.hintCount >= CRAFT_HINT_COSTS.length ? (
              <span>힌트 모두 확인</span>
            ) : (
              <>
                <span>힌트 보기</span>
                <span className="inline-flex items-center gap-1">
                  <img src={a('assets/particle/money.png')} alt="coin" className="h-3.5 w-3.5 object-contain" draggable={false} />
                  <span>{nextHintCost ?? 0}</span>
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetSelected}
            className="absolute right-0 -top-[40px] w-8 h-8 rounded-full overflow-hidden border-[2px] border-[#caa56e]/70 shadow-[0_8px_20px_rgba(0,0,0,0.35)] active:scale-95"
            aria-label="선택 재료 초기화"
          >
            <img
              src={a('assets/particle/btn_bg_brown.png')}
              alt="초기화 버튼 배경"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            <span className="relative z-[1] inline-block -translate-y-[2px] text-[#d4bb8e] text-[14px] font-extrabold leading-none">↺</span>
          </button>

          <div className="grid grid-cols-4 gap-x-2.5 gap-y-[18px]">
              {matItems.map((it) => {
                const itemCount = inventory[it.id] ?? 0
                const isSelectable = itemCount > 0
                const active = isSelectable && selectedMaterialIds.includes(it.id)
                const isShortage = active && itemCount < craftCost.requiredPerMaterial
                const shortageAmount = Math.max(0, craftCost.requiredPerMaterial - itemCount)
                const itemState = itemCount <= 0 ? 'dis' : active ? 'on' : 'off'
                const activeOrder = selectedSlots.findIndex((slotId) => slotId === it.id)
                return (
                  <motion.button
                    key={it.id}
                    type="button"
                    disabled={!isSelectable}
                    whileTap={{ scale: 0.9, y: 3, filter: 'brightness(0.82)' }}
                    onClick={() => {
                      if (!isSelectable) return
                      toggle(it.id)
                    }}
                    className={`relative p-0 w-[90px] h-[90px] overflow-visible transition-transform ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-2 z-0 rounded-full bg-[radial-gradient(closest-side,rgba(183,175,225,0.5),rgba(183,175,225,0)_72%)] blur-[10px] animate-pulse"
                      />
                    )}
                    <img
                      src={a(`assets/item/in_${it.id}_${itemState}.png`)}
                      alt={it.name}
                      className={`relative z-10 w-full h-full object-cover ${isShortage ? 'brightness-[0.85]' : ''}`}
                      draggable={false}
                    />
                    {isShortage && (
                      <span className="absolute z-30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 min-w-[48px] rounded-full bg-[rgba(120,20,30,0.92)] border border-red-300/60 px-3 h-[20px] text-[12px] leading-[18px] font-extrabold text-[#ffd6d9] shadow-[0_6px_18px_rgba(0,0,0,0.35)] text-center whitespace-nowrap inline-flex items-center justify-center">
                        부족 {shortageAmount}
                      </span>
                    )}
                    <span className="absolute z-20 left-1/2 bottom-[6px] -translate-x-1/2 text-[14px] font-semibold text-[#ebc8ab] drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] pointer-events-none select-none">
                      {it.name}
                    </span>
                    <span className="absolute z-20 left-1/2 -bottom-[10px] -translate-x-1/2 min-w-[30px] px-2 h-[16px] rounded-full border border-[#b7afe1]/25 bg-[rgba(10,12,30,0.82)] text-[10px] font-semibold text-[#ebc8ab] leading-[14px] text-center pointer-events-none select-none">
                      {itemCount}
                    </span>
                    {active && (
                      <span className="absolute z-30 -top-[2px] right-[1px] w-[23px] h-[23px] rounded-full bg-[#A894FF] text-[14px] text-black font-black flex items-center justify-center">{activeOrder + 1}</span>
                    )}
                  </motion.button>
                )
              })}
          </div>
        </div>

        {/* 조합식 + 정령빚기 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[74%] w-[92%] flex items-stretch gap-5 translate-y-[110px]">
          <div className="w-[calc(100%-91px)] rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_16px_32px_rgba(0,0,0,0.45)] px-4 h-[88px] flex flex-col justify-center">
            <div className="flex items-center justify-center gap-2">
            {slots.map((s, i) => (
              <div key={i} className="relative w-12 h-[64px] flex flex-col items-center">
                {isSlotLocked(i, lockedSlots) && (
                  <>
                    <span className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(closest-side,rgba(206,181,124,0.42),rgba(206,181,124,0)_72%)] blur-[10px]" />
                    <span className="absolute z-30 -top-[6px] right-0 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#e2c792]/55 bg-[rgba(66,48,22,0.92)] px-1 text-[10px] font-extrabold text-[#f7ddb2]">🔒</span>
                  </>
                )}
                {s ? (
                  <>
                    {(() => {
                      const owned = inventory[s] ?? 0
                      const ratio = Math.max(0, Math.min(1, owned / craftCost.requiredPerMaterial))
                      const isEnough = owned >= craftCost.requiredPerMaterial
                      return (
                        <>
                          <div className="relative w-12 h-12 rounded-full border border-white/20 bg-black/30 overflow-hidden flex items-center justify-center">
                            <div
                              className={`absolute left-0 bottom-0 w-full ${isEnough ? 'bg-[rgba(168,148,255,0.30)]' : 'bg-[rgba(160,70,88,0.30)]'}`}
                              style={{ height: `${ratio * 100}%` }}
                            />
                            <span className="relative z-[1] text-[13px] font-bold text-center leading-tight px-1 text-[#ebc8ab]">{craftMaterials.find((it) => it.id === s)?.name}</span>
                          </div>
                          <span className={`mt-[-3px] min-w-[30px] px-2 h-[16px] rounded-full border text-[10px] font-semibold leading-[14px] text-center pointer-events-none select-none ${isEnough ? 'border-[#a894ff]/40 bg-[rgba(52,34,90,0.88)] text-[#e2d7ff]' : 'border-[#c77a86]/40 bg-[rgba(58,22,30,0.88)] text-[#ffd2d8]'}`}>
                            {owned}/{craftCost.requiredPerMaterial}
                          </span>
                        </>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full border border-white/15 bg-black/30 flex items-center justify-center text-white/70">
                      <span className="text-[18px] -translate-y-[3px]">+</span>
                    </div>
                    <span className="mt-[-3px] min-w-[30px] px-2 h-[16px] rounded-full border border-white/20 bg-[rgba(10,12,30,0.72)] text-[10px] font-semibold leading-[14px] text-center text-white/70 pointer-events-none select-none">
                      0/{craftCost.requiredPerMaterial}
                    </span>
                  </>
                )}
              </div>
            ))}
            <div className="text-white/60 text-[18px]">→</div>
            <img
              src={a('assets/codex/make_unknown.png')}
              alt="미확인 정령"
              className="w-14 h-14 object-contain"
              draggable={false}
            />
            </div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={!canCraft}
            className={`relative w-[91px] h-[88px] rounded-2xl overflow-hidden border-[2px] text-white ${canCraft ? 'border-[#a894ff] cursor-pointer shadow-[0_0_10px_rgba(168,148,255,0.35)]' : 'border-slate-300/40 cursor-not-allowed'}`}
            onClick={startCraft}
          >
            <img
              src={a(canCraft ? 'assets/particle/btn_bg_purple.png' : 'assets/particle/btn_bg_sliver.png')}
              alt="정령 빚기 버튼 배경"
              className={`absolute inset-0 w-full h-full object-cover ${canCraft ? '' : 'opacity-78'}`}
              draggable={false}
            />
            {canCraft && (
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.22)_48%,transparent_72%)] animate-pulse"
              />
            )}
            <span className={`relative z-[1] whitespace-pre-line text-[16px] font-extrabold leading-[1.05] ${canCraft ? 'text-white' : 'text-[#d5dae6]'}`}>
              {'정령\n빚기'}
            </span>
          </motion.button>
        </div>
      </div>

      {systemNotice && (
        <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/55 px-6">
          <div className="w-full max-w-[320px] rounded-2xl border border-[#e3cfa9]/35 bg-[rgba(14,12,18,0.94)] px-5 py-5 text-center shadow-[0_18px_45px_rgba(0,0,0,0.55)]">
            <div className="text-[13px] tracking-[0.15em] text-[#e8d5b3]/80">{systemNotice.title}</div>
            <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.65] text-[#f1e4cd]">{systemNotice.message}</p>
            <button
              type="button"
              onClick={() => setSystemNotice(null)}
              className="mt-5 inline-flex h-10 min-w-[110px] items-center justify-center rounded-full border border-[#d6b88f]/45 bg-[rgba(104,78,44,0.56)] px-5 text-[13px] font-semibold text-[#f8e4c3]"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
