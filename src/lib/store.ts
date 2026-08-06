import { create } from 'zustand'
import { DUNGEONS } from '../data/dungeons'
import { ITEMS } from '../data/items'
import { CRAFTING_MATERIALS } from '../data/items'
import { INITIAL_MANA, LEGACY_ENERGY_STORAGE_KEY, MANA_REGEN_MS, MANA_STORAGE_KEY, MAX_MANA, MANA_PER_EXPLORE } from '../data/constants'
import { EXP_TO_NEXT } from '../data/levels'
import { getLevelUpRewardsForLevel } from '../data/economy'
import { getLevelTitle } from '../data/levelTitles'
import { REGIONS } from '../data/regions'
import { SPIRITS } from '../data/spirits'
import { clearSpiritSummonHistory } from './spiritSummonHistory'
import { PROFILE_NICKNAME_STORAGE_KEY } from './profile'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'craftResult' | 'bag' | 'profile' | 'license' | 'map1' | 'map2' | 'map3' | 'map4' | 'map5' | 'spiritDetail' | 'exchange'

export const EXCHANGE_CYCLE_MS = 20 * 60 * 1000
export const EXCHANGE_REFRESH_COSTS = [30, 60, 90] as const
export const EXCHANGE_MAX_REFRESH_PER_CYCLE = EXCHANGE_REFRESH_COSTS.length
export const SPIRIT_COMMUNICATION_DAILY_LIMIT = 3

type ExchangeOfferKind = 'material' | 'fragment'

export type ExchangeOffer = {
  id: string
  kind: ExchangeOfferKind
  receiveItemId: string
  receiveAmount: number
  costCoins: number
  purchased: boolean
}

export type ExchangeState = {
  cycleStartedAt: number
  cycleEndsAt: number
  refreshUsedCount: number
  offers: ExchangeOffer[]
}

export type ExchangeActionResult = {
  ok: boolean
  reason?: 'notFound' | 'alreadyPurchased' | 'insufficientCoins' | 'limitReached'
  cost?: number
}

type SpiritCommunicationRewardState = {
  dayKey: string
  claimedCountBySpiritId: Record<string, number>
}

export type SpiritCommunicationRewardResult = {
  granted: boolean
  rewardType: 'gold' | 'mana' | 'exp' | null
  amount: number
  remaining: number
}

type CraftResult = {
  spiritId: string | null
  requestText: string
  success: boolean
  candidateSpiritIds: string[]
  materialIds: [string, string, string]
  matchRate?: number | null
  resultMode?: 'craft' | 'awakening'
  questRewardGold?: number
}

type PersistedGameState = {
  level: number
  expInLevel: number
  coins: number
  inventory: Record<string, number>
  mana: number
  manaUpdatedAt: number | null
}

type PersistedNotificationSeenState = {
  seenDiscoveredSpiritCount: number
  seenOwnedItemTypeCount: number
  seenUnlockedStageCount: number
  seenDiscoveredSpiritIds: string[]
  seenOwnedItemIds: string[]
}

type PendingLevelUp = {
  previousLevel: number
  newLevel: number
  title: string
  titleChanged: boolean
  rewards: {
    gold: number
    mana: number
    newTitle?: string
    unlockedRegions: string[]
  }
  popupKey: string
}

type ExplorationProgress = {
  materialDiscovered: number
  spiritDiscovered: number
  regionalEventDiscovered: number
  treasureDiscovered: number
}

type ExplorationProgressByStage = Record<1 | 2 | 3 | 4 | 5, ExplorationProgress>
type HiddenStageFirstClearByRegion = Record<string, boolean>
type StageId = 1 | 2 | 3 | 4 | 5

type AppState = {
  progress: number
  setProgress: (v: number) => void
  screen: Screen
  setScreen: (s: Screen) => void
  activeHiddenStage: StageId | null
  setActiveHiddenStage: (stage: StageId | null) => void
  pendingHiddenStageJump: StageId | null
  requestHiddenStageJump: (stage: StageId) => void
  clearPendingHiddenStageJump: () => void
  hiddenStageFirstClearByRegion: HiddenStageFirstClearByRegion
  markHiddenStageFirstClear: (regionId: string) => void
  selectedSpiritId: string | null
  openSpiritDetail: (id: string) => void
  discoveredSpiritIds: string[]
  markSpiritDiscovered: (id: string) => boolean
  seenDiscoveredSpiritCount: number
  seenOwnedItemTypeCount: number
  seenUnlockedStageCount: number
  seenDiscoveredSpiritIds: string[]
  seenOwnedItemIds: string[]
  acknowledgeBookNotifications: () => void
  acknowledgeBagNotifications: () => void
  acknowledgeExpeditionMapUnlockNotifications: () => void
  craftResult: CraftResult | null
  openCraftResult: (payload: CraftResult) => void
  clearCraftResult: () => void
  pendingLevelUp: PendingLevelUp | null
  showLevelUpPopup: boolean
  dismissLevelUpPopup: () => void
  claimPendingLevelUpRewards: () => void
  level: number
  setLevel: (n: number) => void
  expInLevel: number
  setExpInLevel: (n: number) => void
  gainExp: (delta: number) => PendingLevelUp | null
  explorationProgressByStage: ExplorationProgressByStage
  markExplorationDiscovery: (stage: 1 | 2 | 3 | 4 | 5, kind: 'material' | 'spirit' | 'regional' | 'treasure') => void
  mana: number
  maxMana: number
  manaRegenMs: number
  manaUpdatedAt: number | null
  addMana: (n?: number) => void
  spendMana: (n?: number) => boolean
  recomputeMana: () => void
  inventory: Record<string, number>
  setItemCount: (id: string, count: number) => void
  addItem: (id: string, delta?: number) => void
  consumeItem: (id: string, delta?: number) => void
  coins: number
  addCoins: (delta?: number) => void
  spendCoins: (delta?: number) => number
  exchange: ExchangeState
  ensureExchangeCycle: () => void
  refreshExchangeOffers: () => ExchangeActionResult
  buyExchangeOffer: (offerId: string) => ExchangeActionResult
  spiritCommunicationRewards: SpiritCommunicationRewardState
  claimSpiritCommunicationReward: (spiritId: string) => SpiritCommunicationRewardResult
  resetGameData: () => void
}

const loadMana = () => {
  try {
    const currentRaw = localStorage.getItem(MANA_STORAGE_KEY)
    if (currentRaw) {
      return JSON.parse(currentRaw) as { mana: number; manaUpdatedAt: number | null }
    }

    const legacyRaw = localStorage.getItem(LEGACY_ENERGY_STORAGE_KEY)
    if (!legacyRaw) return null
    const legacy = JSON.parse(legacyRaw) as { energy?: number; nextRegenAt?: number | null }
    const migrated = {
      mana: Math.max(0, Math.floor(legacy.energy ?? INITIAL_MANA)),
      manaUpdatedAt: legacy.nextRegenAt ?? null,
    }
    localStorage.setItem(MANA_STORAGE_KEY, JSON.stringify(migrated))
    return migrated
  } catch {
    return null
  }
}

const saveMana = (mana: number, manaUpdatedAt: number | null) => {
  try {
    localStorage.setItem(MANA_STORAGE_KEY, JSON.stringify({ mana, manaUpdatedAt }))
  } catch {
    // ignore
  }
}

const GAME_STATE_STORAGE_KEY = 'spiria.game-state.v1'
const DISCOVERED_SPIRITS_STORAGE_KEY = 'spiria.discovered-spirits.v1'
const HIDDEN_STAGE_FIRST_CLEAR_STORAGE_KEY = 'spiria.hidden-stage-first-clear.v1'
const NOTIFICATION_SEEN_STORAGE_KEY = 'spiria.notification-seen.v1'
const EXCHANGE_STORAGE_KEY = 'spiria.exchange.v1'
const SPIRIT_COMM_REWARD_STORAGE_KEY = 'spiria.spirit-communication-reward.v1'
const INITIAL_LEVEL = 1
const INITIAL_COINS = 1250

const countOwnedItemType = (inventory: Record<string, number>) => (
  ITEMS.reduce((count, item) => count + ((inventory[item.id] ?? 0) > 0 ? 1 : 0), 0)
)

const getOwnedItemIds = (inventory: Record<string, number>) => (
  ITEMS.filter((item) => (inventory[item.id] ?? 0) > 0).map((item) => item.id)
)

const getUnlockedStageCount = (level: number) => (
  DUNGEONS.reduce((count, dungeon) => count + (level >= dungeon.unlockLv ? 1 : 0), 0)
)

const loadGameState = (): PersistedGameState | null => {
  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedGameState>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      level: Math.max(1, Math.floor(parsed.level ?? INITIAL_LEVEL)),
      expInLevel: Math.max(0, Math.floor(parsed.expInLevel ?? 0)),
      coins: Math.max(0, Math.floor(parsed.coins ?? INITIAL_COINS)),
      inventory: parsed.inventory ?? {},
      mana: Math.max(0, Math.floor(parsed.mana ?? INITIAL_MANA)),
      manaUpdatedAt: parsed.manaUpdatedAt ?? null,
    }
  } catch {
    return null
  }
}

const saveGameState = (state: PersistedGameState) => {
  try {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const loadDiscoveredSpiritIds = (): string[] => {
  try {
    const raw = localStorage.getItem(DISCOVERED_SPIRITS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((item): item is string => typeof item === 'string')
  } catch {
    return []
  }
}

const saveDiscoveredSpiritIds = (spiritIds: string[]) => {
  try {
    localStorage.setItem(DISCOVERED_SPIRITS_STORAGE_KEY, JSON.stringify(spiritIds))
  } catch {
    // ignore
  }
}

const createInitialInventory = () => {
  const base = Object.fromEntries(ITEMS.map(it => [it.id, 0])) as Record<string, number>

  // Keep a richer local test state so bag UI/filters can be verified quickly.
  if (import.meta.env.DEV) {
    Object.assign(base, {
      flower: 5,
      leaf: 3,
      water: 4,
      fire: 2,
      gem: 1,
      fragment_spirit_soyo: 6,
      forest_trace: 2,
      wind_trace: 1,
    })
  }

  return base
}

const createFreshGameState = (): PersistedGameState => ({
  level: INITIAL_LEVEL,
  expInLevel: 0,
  coins: INITIAL_COINS,
  inventory: Object.fromEntries(ITEMS.map((it) => [it.id, 0])) as Record<string, number>,
  mana: INITIAL_MANA,
  manaUpdatedAt: null,
})

const createEmptyExplorationProgress = (): ExplorationProgress => ({
  materialDiscovered: 0,
  spiritDiscovered: 0,
  regionalEventDiscovered: 0,
  treasureDiscovered: 0,
})

const createInitialExplorationProgressByStage = (): ExplorationProgressByStage => ({
  1: createEmptyExplorationProgress(),
  2: createEmptyExplorationProgress(),
  3: createEmptyExplorationProgress(),
  4: createEmptyExplorationProgress(),
  5: createEmptyExplorationProgress(),
})

const createInitialHiddenStageFirstClearByRegion = (): HiddenStageFirstClearByRegion => (
  REGIONS.reduce<HiddenStageFirstClearByRegion>((acc, region) => {
    acc[region.id] = false
    return acc
  }, {})
)

const loadHiddenStageFirstClearByRegion = (): HiddenStageFirstClearByRegion => {
  const defaults = createInitialHiddenStageFirstClearByRegion()
  try {
    const raw = localStorage.getItem(HIDDEN_STAGE_FIRST_CLEAR_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed || typeof parsed !== 'object') return defaults
    const next = { ...defaults }
    for (const regionId of Object.keys(defaults)) {
      next[regionId] = parsed[regionId] === true
    }
    return next
  } catch {
    return defaults
  }
}

const saveHiddenStageFirstClearByRegion = (value: HiddenStageFirstClearByRegion) => {
  try {
    localStorage.setItem(HIDDEN_STAGE_FIRST_CLEAR_STORAGE_KEY, JSON.stringify(value))
  } catch {
    // ignore
  }
}

const loadNotificationSeenState = (defaults: PersistedNotificationSeenState): PersistedNotificationSeenState => {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SEEN_STORAGE_KEY)
    if (!raw) return defaults
    const parsed = JSON.parse(raw) as Partial<PersistedNotificationSeenState>
    if (!parsed || typeof parsed !== 'object') return defaults

    const parsedSeenDiscoveredSpiritIds = Array.isArray(parsed.seenDiscoveredSpiritIds)
      ? parsed.seenDiscoveredSpiritIds.filter((value): value is string => typeof value === 'string')
      : defaults.seenDiscoveredSpiritIds

    const parsedSeenOwnedItemIds = Array.isArray(parsed.seenOwnedItemIds)
      ? parsed.seenOwnedItemIds.filter((value): value is string => typeof value === 'string')
      : defaults.seenOwnedItemIds

    return {
      seenDiscoveredSpiritCount: Math.max(0, Math.floor(parsed.seenDiscoveredSpiritCount ?? defaults.seenDiscoveredSpiritCount)),
      seenOwnedItemTypeCount: Math.max(0, Math.floor(parsed.seenOwnedItemTypeCount ?? defaults.seenOwnedItemTypeCount)),
      seenUnlockedStageCount: Math.max(0, Math.floor(parsed.seenUnlockedStageCount ?? defaults.seenUnlockedStageCount)),
      seenDiscoveredSpiritIds: parsedSeenDiscoveredSpiritIds,
      seenOwnedItemIds: parsedSeenOwnedItemIds,
    }
  } catch {
    return defaults
  }
}

const saveNotificationSeenState = (state: PersistedNotificationSeenState) => {
  try {
    localStorage.setItem(NOTIFICATION_SEEN_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const getTodayLocalKey = (now = new Date()) => {
  const year = now.getFullYear()
  const month = `${now.getMonth() + 1}`.padStart(2, '0')
  const day = `${now.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min

const weightedPickIndex = (weights: readonly number[]) => {
  const total = weights.reduce((sum, weight) => sum + Math.max(0, weight), 0)
  if (total <= 0) return 0
  let cursor = Math.random() * total
  for (let index = 0; index < weights.length; index += 1) {
    cursor -= Math.max(0, weights[index])
    if (cursor <= 0) return index
  }
  return Math.max(0, weights.length - 1)
}

const pickUniqueWeighted = <T,>(entries: readonly T[], weightOf: (entry: T) => number, count: number): T[] => {
  const pool = [...entries]
  const picked: T[] = []
  while (pool.length > 0 && picked.length < count) {
    const index = weightedPickIndex(pool.map(weightOf))
    const [item] = pool.splice(index, 1)
    if (item) picked.push(item)
  }
  return picked
}

const createMaterialOffer = (itemId: string, category: 'nature' | 'element' | 'sky' | 'mystic', slot: number): ExchangeOffer => {
  const amountRangeByCategory = {
    nature: { min: 4, max: 7 },
    element: { min: 3, max: 6 },
    sky: { min: 3, max: 5 },
    mystic: { min: 2, max: 4 },
  } as const
  const costMultiplierByCategory = {
    nature: 1,
    element: 1.15,
    sky: 1.35,
    mystic: 1.8,
  } as const
  const range = amountRangeByCategory[category]
  const amount = randomInt(range.min, range.max)
  const cost = Math.max(20, Math.round(amount * 9 * costMultiplierByCategory[category]))
  return {
    id: `material-${slot}`,
    kind: 'material',
    receiveItemId: itemId,
    receiveAmount: amount,
    costCoins: cost,
    purchased: false,
  }
}

const createFragmentOffer = (spiritId: string, spiritRarity: string | undefined, slot: number): ExchangeOffer => {
  const amount = randomInt(2, 5)
  const rarityBonus = spiritRarity === 'legendary'
    ? 50
    : spiritRarity === 'epic'
      ? 30
      : spiritRarity === 'rare'
        ? 20
        : 10
  const cost = amount * 25 + rarityBonus
  return {
    id: `fragment-${slot}`,
    kind: 'fragment',
    receiveItemId: `fragment_${spiritId}`,
    receiveAmount: amount,
    costCoins: cost,
    purchased: false,
  }
}

const generateExchangeOffers = (): ExchangeOffer[] => {
  const materialWeightsByCategory = {
    nature: 1.8,
    element: 1.3,
    sky: 1.0,
    mystic: 0.55,
  } as const
  const materialPicks = pickUniqueWeighted(
    CRAFTING_MATERIALS,
    (item) => materialWeightsByCategory[item.materialCategory],
    3,
  )
  const materialOffers = materialPicks.map((item, index) => createMaterialOffer(item.id, item.materialCategory, index + 1))

  const spiritPool = SPIRITS.filter((spirit) => ITEMS.some((item) => item.id === `fragment_${spirit.id}`))
  const fragmentPicks = pickUniqueWeighted(
    spiritPool,
    (spirit) => spirit.rarity === 'legendary' ? 0.55 : spirit.rarity === 'epic' ? 0.8 : spirit.rarity === 'rare' ? 1.15 : 1.4,
    3,
  )
  const fragmentOffers = fragmentPicks.map((spirit, index) => createFragmentOffer(spirit.id, spirit.rarity, index + 1))

  return [...materialOffers, ...fragmentOffers]
}

const createExchangeState = (startedAt = Date.now()): ExchangeState => ({
  cycleStartedAt: startedAt,
  cycleEndsAt: startedAt + EXCHANGE_CYCLE_MS,
  refreshUsedCount: 0,
  offers: generateExchangeOffers(),
})

const loadExchangeState = (): ExchangeState | null => {
  try {
    const raw = localStorage.getItem(EXCHANGE_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<ExchangeState>
    if (!parsed || typeof parsed !== 'object') return null
    if (typeof parsed.cycleStartedAt !== 'number' || typeof parsed.cycleEndsAt !== 'number') return null
    if (!Array.isArray(parsed.offers) || parsed.offers.length !== 6) return null
    return {
      cycleStartedAt: parsed.cycleStartedAt,
      cycleEndsAt: parsed.cycleEndsAt,
      refreshUsedCount: Math.max(0, Math.min(EXCHANGE_MAX_REFRESH_PER_CYCLE, Math.floor(parsed.refreshUsedCount ?? 0))),
      offers: parsed.offers.map((offer, index) => ({
        id: typeof offer.id === 'string' ? offer.id : `offer-${index + 1}`,
        kind: offer.kind === 'fragment' ? 'fragment' : 'material',
        receiveItemId: typeof offer.receiveItemId === 'string' ? offer.receiveItemId : 'flower',
        receiveAmount: Math.max(1, Math.floor(offer.receiveAmount ?? 1)),
        costCoins: Math.max(1, Math.floor(offer.costCoins ?? 1)),
        purchased: offer.purchased === true,
      })),
    }
  } catch {
    return null
  }
}

const saveExchangeState = (state: ExchangeState) => {
  try {
    localStorage.setItem(EXCHANGE_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const ensureExchangeStateFresh = (state: ExchangeState, now = Date.now()): ExchangeState => {
  if (now < state.cycleEndsAt) return state
  return createExchangeState(now)
}

const loadSpiritCommunicationRewardState = (): SpiritCommunicationRewardState => {
  const defaultState: SpiritCommunicationRewardState = {
    dayKey: getTodayLocalKey(),
    claimedCountBySpiritId: {},
  }
  try {
    const raw = localStorage.getItem(SPIRIT_COMM_REWARD_STORAGE_KEY)
    if (!raw) return defaultState
    const parsed = JSON.parse(raw) as Partial<SpiritCommunicationRewardState & { claimedCount?: number }>
    if (!parsed || typeof parsed !== 'object' || typeof parsed.dayKey !== 'string') return defaultState
    if (parsed.dayKey !== defaultState.dayKey) return defaultState

    const nextClaimedCountBySpiritId: Record<string, number> = {}
    const rawCounts = parsed.claimedCountBySpiritId
    if (rawCounts && typeof rawCounts === 'object') {
      for (const [spiritId, count] of Object.entries(rawCounts)) {
        nextClaimedCountBySpiritId[spiritId] = Math.max(0, Math.min(SPIRIT_COMMUNICATION_DAILY_LIMIT, Math.floor(Number(count) || 0)))
      }
    }

    return {
      dayKey: parsed.dayKey,
      claimedCountBySpiritId: nextClaimedCountBySpiritId,
    }
  } catch {
    return defaultState
  }
}

const saveSpiritCommunicationRewardState = (state: SpiritCommunicationRewardState) => {
  try {
    localStorage.setItem(SPIRIT_COMM_REWARD_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

const persistedGameState = loadGameState()
const persistedDiscoveredSpiritIds = loadDiscoveredSpiritIds()
const persistedHiddenStageFirstClearByRegion = loadHiddenStageFirstClearByRegion()
const persistedInventory = persistedGameState?.inventory ?? {}
const initialInventory = createInitialInventory()
const initialInventoryWithPersisted = { ...initialInventory, ...persistedInventory }
const loadedExchangeState = loadExchangeState()
const initialExchangeState = ensureExchangeStateFresh(loadedExchangeState ?? createExchangeState())
const initialSpiritCommunicationRewards = loadSpiritCommunicationRewardState()
const initialNotificationSeenState = loadNotificationSeenState({
  seenDiscoveredSpiritCount: persistedDiscoveredSpiritIds.length,
  seenOwnedItemTypeCount: countOwnedItemType(initialInventoryWithPersisted),
  seenUnlockedStageCount: getUnlockedStageCount(persistedGameState?.level ?? INITIAL_LEVEL),
  seenDiscoveredSpiritIds: [...persistedDiscoveredSpiritIds],
  seenOwnedItemIds: getOwnedItemIds(initialInventoryWithPersisted),
})

const useAppStore = create<AppState>((set, get) => ({
  progress: 0,
  setProgress: (v) => set({ progress: v }),
  screen: 'loading',
  setScreen: (s) => set((state) => ({
    screen: s,
    activeHiddenStage: s === 'expedition' ? null : state.activeHiddenStage,
    showLevelUpPopup: state.pendingLevelUp !== null && s !== state.screen && !state.showLevelUpPopup ? true : state.showLevelUpPopup,
  })),
  activeHiddenStage: null,
  setActiveHiddenStage: (stage) => set({ activeHiddenStage: stage }),
  pendingHiddenStageJump: null,
  requestHiddenStageJump: (stage) => set({ pendingHiddenStageJump: stage }),
  clearPendingHiddenStageJump: () => set({ pendingHiddenStageJump: null }),
  hiddenStageFirstClearByRegion: persistedHiddenStageFirstClearByRegion,
  markHiddenStageFirstClear: (regionId) => set((state) => {
    if (!regionId || state.hiddenStageFirstClearByRegion[regionId]) return state
    const next = {
      ...state.hiddenStageFirstClearByRegion,
      [regionId]: true,
    }
    saveHiddenStageFirstClearByRegion(next)
    return { hiddenStageFirstClearByRegion: next }
  }),
  selectedSpiritId: null,
  openSpiritDetail: (id) => set({ selectedSpiritId: id, screen: 'spiritDetail' }),
  discoveredSpiritIds: persistedDiscoveredSpiritIds,
  markSpiritDiscovered: (id) => {
    const current = get().discoveredSpiritIds
    if (current.includes(id)) return false
    const next = [...current, id]
    saveDiscoveredSpiritIds(next)
    set({ discoveredSpiritIds: next })
    return true
  },
  seenDiscoveredSpiritCount: initialNotificationSeenState.seenDiscoveredSpiritCount,
  seenOwnedItemTypeCount: initialNotificationSeenState.seenOwnedItemTypeCount,
  seenUnlockedStageCount: initialNotificationSeenState.seenUnlockedStageCount,
  seenDiscoveredSpiritIds: initialNotificationSeenState.seenDiscoveredSpiritIds,
  seenOwnedItemIds: initialNotificationSeenState.seenOwnedItemIds,
  acknowledgeBookNotifications: () => set((state) => {
    const nextSeenDiscoveredSpiritCount = state.discoveredSpiritIds.length
    const nextSeenDiscoveredSpiritIds = [...state.discoveredSpiritIds]
    if (
      nextSeenDiscoveredSpiritCount === state.seenDiscoveredSpiritCount
      && nextSeenDiscoveredSpiritIds.length === state.seenDiscoveredSpiritIds.length
    ) return state
    const nextSeenState = {
      seenDiscoveredSpiritCount: nextSeenDiscoveredSpiritCount,
      seenOwnedItemTypeCount: state.seenOwnedItemTypeCount,
      seenUnlockedStageCount: state.seenUnlockedStageCount,
      seenDiscoveredSpiritIds: nextSeenDiscoveredSpiritIds,
      seenOwnedItemIds: state.seenOwnedItemIds,
    }
    saveNotificationSeenState(nextSeenState)
    return nextSeenState
  }),
  acknowledgeBagNotifications: () => set((state) => {
    const nextSeenOwnedItemTypeCount = countOwnedItemType(state.inventory)
    const nextSeenOwnedItemIds = getOwnedItemIds(state.inventory)
    if (
      nextSeenOwnedItemTypeCount === state.seenOwnedItemTypeCount
      && nextSeenOwnedItemIds.length === state.seenOwnedItemIds.length
    ) return state
    const nextSeenState = {
      seenDiscoveredSpiritCount: state.seenDiscoveredSpiritCount,
      seenOwnedItemTypeCount: nextSeenOwnedItemTypeCount,
      seenUnlockedStageCount: state.seenUnlockedStageCount,
      seenDiscoveredSpiritIds: state.seenDiscoveredSpiritIds,
      seenOwnedItemIds: nextSeenOwnedItemIds,
    }
    saveNotificationSeenState(nextSeenState)
    return nextSeenState
  }),
  acknowledgeExpeditionMapUnlockNotifications: () => set((state) => {
    const nextSeenUnlockedStageCount = getUnlockedStageCount(state.level)
    if (nextSeenUnlockedStageCount === state.seenUnlockedStageCount) return state
    const nextSeenState = {
      seenDiscoveredSpiritCount: state.seenDiscoveredSpiritCount,
      seenOwnedItemTypeCount: state.seenOwnedItemTypeCount,
      seenUnlockedStageCount: nextSeenUnlockedStageCount,
      seenDiscoveredSpiritIds: state.seenDiscoveredSpiritIds,
      seenOwnedItemIds: state.seenOwnedItemIds,
    }
    saveNotificationSeenState(nextSeenState)
    return nextSeenState
  }),
  craftResult: null,
  openCraftResult: (payload) => set({ craftResult: payload, screen: 'craftResult' }),
  clearCraftResult: () => set({ craftResult: null }),
  pendingLevelUp: null,
  showLevelUpPopup: false,
  dismissLevelUpPopup: () => set({ pendingLevelUp: null, showLevelUpPopup: false }),
  claimPendingLevelUpRewards: () => {
    const pending = get().pendingLevelUp
    if (!pending) return

    set((state) => {
      const nextCoins = state.coins + pending.rewards.gold
      const nextMana = Math.min(MAX_MANA, state.mana + pending.rewards.mana)
      const nextManaUpdatedAt = nextMana >= MAX_MANA ? null : state.manaUpdatedAt
      saveMana(nextMana, nextManaUpdatedAt)
      saveGameState({
        level: state.level,
        expInLevel: state.expInLevel,
        coins: nextCoins,
        inventory: state.inventory,
        mana: nextMana,
        manaUpdatedAt: nextManaUpdatedAt,
      })
      return {
        coins: nextCoins,
        mana: nextMana,
        manaUpdatedAt: nextManaUpdatedAt,
        pendingLevelUp: null,
        showLevelUpPopup: false,
      }
    })
  },
  level: persistedGameState?.level ?? INITIAL_LEVEL,
  setLevel: (n) => {
    const nextLevel = Math.max(1, Math.floor(n))
    set((state) => ({
      level: nextLevel,
      expInLevel: state.level === nextLevel ? state.expInLevel : 0,
    }))
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  expInLevel: persistedGameState?.expInLevel ?? 0,
  setExpInLevel: (n) => {
    set({ expInLevel: Math.max(0, Math.floor(n)) })
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  explorationProgressByStage: createInitialExplorationProgressByStage(),
  markExplorationDiscovery: (stage, kind) => set((state) => {
    const key = kind === 'material'
      ? 'materialDiscovered'
      : kind === 'spirit'
        ? 'spiritDiscovered'
        : kind === 'regional'
          ? 'regionalEventDiscovered'
          : 'treasureDiscovered'
    const currentStage = state.explorationProgressByStage[stage]
    return {
      explorationProgressByStage: {
        ...state.explorationProgressByStage,
        [stage]: {
          ...currentStage,
          [key]: currentStage[key] + 1,
        },
      },
    }
  }),
  gainExp: (delta) => {
    const amount = Math.max(0, Math.floor(delta))
    if (amount <= 0) return null
    let levelUpInfo: PendingLevelUp | null = null
    set((state) => {
      const nextLevel = state.level
      const nextExp = state.expInLevel + amount
      if (nextLevel >= 99) {
        return { level: 99, expInLevel: 0 }
      }

      let currentLevel = nextLevel
      let currentExp = nextExp
      while (currentExp >= (EXP_TO_NEXT[currentLevel] ?? 0) && currentLevel < 99) {
        const needed = EXP_TO_NEXT[currentLevel] ?? 0
        if (needed <= 0) break
        currentExp -= needed
        currentLevel += 1
      }

      const leveledUp = currentLevel > nextLevel
      if (!leveledUp) {
        return {
          level: currentLevel,
          expInLevel: currentLevel >= 99 ? 0 : currentExp,
        }
      }

      const crossedLevels = Array.from({ length: currentLevel - nextLevel }, (_, idx) => nextLevel + idx + 1)
      const rewardSummary = crossedLevels.reduce(
        (sum, reachedLevel) => {
          const reward = getLevelUpRewardsForLevel(reachedLevel)
          return {
            gold: sum.gold + reward.gold,
            mana: sum.mana + reward.mana,
          }
        },
        { gold: 0, mana: 0 },
      )
      const rewardGold = rewardSummary.gold
      const rewardMana = rewardSummary.mana
      const titleChanged = getLevelTitle(nextLevel) !== getLevelTitle(currentLevel)
      const unlockedRegions = [
        ...DUNGEONS.filter((dungeon) => nextLevel < dungeon.unlockLv && currentLevel >= dungeon.unlockLv).map((dungeon) => dungeon.name),
        ...REGIONS.filter((region) => nextLevel < region.unlockLevel && currentLevel >= region.unlockLevel).map((region) => region.name),
      ]
      const uniqueUnlockedRegions = Array.from(new Set(unlockedRegions))
      const newTitle = titleChanged ? getLevelTitle(currentLevel) : undefined
      levelUpInfo = {
        previousLevel: nextLevel,
        newLevel: currentLevel,
        title: getLevelTitle(currentLevel),
        titleChanged,
        rewards: {
          gold: rewardGold,
          mana: rewardMana,
          newTitle,
          unlockedRegions: uniqueUnlockedRegions,
        },
        popupKey: `${nextLevel}-${currentLevel}-${Date.now()}`,
      }

      const nextPendingLevelUp = state.pendingLevelUp
        ? {
            previousLevel: state.pendingLevelUp.previousLevel,
            newLevel: levelUpInfo.newLevel,
            title: getLevelTitle(levelUpInfo.newLevel),
            titleChanged:
              state.pendingLevelUp.titleChanged
              || getLevelTitle(state.pendingLevelUp.previousLevel) !== getLevelTitle(levelUpInfo.newLevel),
            rewards: {
              gold: state.pendingLevelUp.rewards.gold + levelUpInfo.rewards.gold,
              mana: state.pendingLevelUp.rewards.mana + levelUpInfo.rewards.mana,
              newTitle:
                (state.pendingLevelUp.titleChanged
                  || getLevelTitle(state.pendingLevelUp.previousLevel) !== getLevelTitle(levelUpInfo.newLevel))
                  ? getLevelTitle(levelUpInfo.newLevel)
                  : undefined,
              unlockedRegions: Array.from(new Set([
                ...state.pendingLevelUp.rewards.unlockedRegions,
                ...levelUpInfo.rewards.unlockedRegions,
              ])),
            },
            popupKey: `${state.pendingLevelUp.previousLevel}-${levelUpInfo.newLevel}-${Date.now()}`,
          }
        : levelUpInfo

      levelUpInfo = nextPendingLevelUp

      const nextState = {
        level: currentLevel,
        expInLevel: currentLevel >= 99 ? 0 : currentExp,
        pendingLevelUp: nextPendingLevelUp,
      }
      saveGameState({
        level: nextState.level,
        expInLevel: nextState.expInLevel,
        coins: state.coins,
        inventory: state.inventory,
        mana: state.mana,
        manaUpdatedAt: state.manaUpdatedAt,
      })
      return nextState
    })
    return levelUpInfo
  },
  mana: (() => {
    const loaded = loadMana()
    return loaded?.mana ?? (persistedGameState?.mana ?? INITIAL_MANA)
  })(),
  maxMana: MAX_MANA,
  manaRegenMs: MANA_REGEN_MS,
  manaUpdatedAt: (() => {
    const loaded = loadMana()
    return loaded?.manaUpdatedAt ?? (persistedGameState?.manaUpdatedAt ?? null)
  })(),
  addMana: (n = 0) => {
    const amount = Math.max(0, Math.floor(n))
    if (amount <= 0) return
    const st = get()
    const nextMana = Math.min(st.maxMana, st.mana + amount)
    const nextManaUpdatedAt = nextMana >= st.maxMana ? null : st.manaUpdatedAt
    saveMana(nextMana, nextManaUpdatedAt)
    set({ mana: nextMana, manaUpdatedAt: nextManaUpdatedAt })
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  spendMana: (n = MANA_PER_EXPLORE) => {
    const st = get()
    if (st.mana < n) return false
    const now = Date.now()
    const wasMax = st.mana === st.maxMana
    const mana = st.mana - n
    const manaUpdatedAt = wasMax ? now + st.manaRegenMs : st.manaUpdatedAt
    saveMana(mana, manaUpdatedAt ?? null)
    set({ mana, manaUpdatedAt: manaUpdatedAt ?? null })
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
    return true
  },
  recomputeMana: () => {
    const st = get()
    if (st.mana >= st.maxMana || !st.manaUpdatedAt) return
    const now = Date.now()
    if (now < st.manaUpdatedAt) return
    const elapsed = now - st.manaUpdatedAt
    const gained = Math.floor(elapsed / st.manaRegenMs) + 1
    const nextMana = Math.min(st.maxMana, st.mana + gained)
    const stillMissing = st.maxMana - nextMana
    const manaUpdatedAt = stillMissing > 0 ? st.manaUpdatedAt + gained * st.manaRegenMs : null
    saveMana(nextMana, manaUpdatedAt)
    set({ mana: nextMana, manaUpdatedAt })
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  coins: persistedGameState?.coins ?? INITIAL_COINS,
  addCoins: (delta = 0) => {
    set((st) => ({ coins: Math.max(0, st.coins + Math.max(0, Math.floor(delta))) }))
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  spendCoins: (delta = 0) => {
    const amount = Math.max(0, Math.floor(delta))
    const current = get().coins
    const spent = Math.min(current, amount)
    set({ coins: current - spent })
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
    return spent
  },
  exchange: initialExchangeState,
  ensureExchangeCycle: () => set((state) => {
    const next = ensureExchangeStateFresh(state.exchange)
    if (next === state.exchange) return state
    saveExchangeState(next)
    return { exchange: next }
  }),
  refreshExchangeOffers: () => {
    const { exchange, coins } = get()
    const current = ensureExchangeStateFresh(exchange)
    if (current !== exchange) {
      saveExchangeState(current)
      set({ exchange: current })
    }
    if (current.refreshUsedCount >= EXCHANGE_MAX_REFRESH_PER_CYCLE) {
      return { ok: false, reason: 'limitReached' }
    }
    const refreshCost = EXCHANGE_REFRESH_COSTS[current.refreshUsedCount]
    if (coins < refreshCost) {
      return { ok: false, reason: 'insufficientCoins', cost: refreshCost }
    }
    get().spendCoins(refreshCost)
    const next: ExchangeState = {
      ...current,
      refreshUsedCount: current.refreshUsedCount + 1,
      offers: generateExchangeOffers(),
    }
    saveExchangeState(next)
    set({ exchange: next })
    return { ok: true, cost: refreshCost }
  },
  buyExchangeOffer: (offerId) => {
    const { exchange, coins } = get()
    const current = ensureExchangeStateFresh(exchange)
    if (current !== exchange) {
      saveExchangeState(current)
      set({ exchange: current })
    }
    const target = current.offers.find((offer) => offer.id === offerId)
    if (!target) return { ok: false, reason: 'notFound' }
    if (target.purchased) return { ok: false, reason: 'alreadyPurchased' }
    if (coins < target.costCoins) return { ok: false, reason: 'insufficientCoins' }

    get().spendCoins(target.costCoins)
    get().addItem(target.receiveItemId, target.receiveAmount)

    const next: ExchangeState = {
      ...current,
      offers: current.offers.map((offer) => (
        offer.id === offerId
          ? { ...offer, purchased: true }
          : offer
      )),
    }
    saveExchangeState(next)
    set({ exchange: next })
    return { ok: true }
  },
  spiritCommunicationRewards: initialSpiritCommunicationRewards,
  claimSpiritCommunicationReward: (spiritId) => {
    const normalizedSpiritId = String(spiritId ?? '').trim()
    if (!normalizedSpiritId) {
      return {
        granted: false,
        rewardType: null,
        amount: 0,
        remaining: 0,
      }
    }

    const today = getTodayLocalKey()
    const current = get().spiritCommunicationRewards
    const normalized = current.dayKey === today
      ? current
      : {
        dayKey: today,
        claimedCountBySpiritId: {},
      }

    const claimedCountForSpirit = normalized.claimedCountBySpiritId[normalizedSpiritId] ?? 0

    if (claimedCountForSpirit >= SPIRIT_COMMUNICATION_DAILY_LIMIT) {
      if (normalized !== current) {
        saveSpiritCommunicationRewardState(normalized)
        set({ spiritCommunicationRewards: normalized })
      }
      return {
        granted: false,
        rewardType: null,
        amount: 0,
        remaining: 0,
      }
    }

    const rewardRoll = Math.random()
    const rewardType: 'gold' | 'mana' | 'exp' = rewardRoll < (1 / 3)
      ? 'gold'
      : rewardRoll < (2 / 3)
        ? 'mana'
        : 'exp'
    const amount = rewardType === 'gold'
      ? randomInt(40, 120)
      : rewardType === 'mana'
        ? randomInt(1, 3)
        : randomInt(10, 50)

    if (rewardType === 'gold') {
      get().addCoins(amount)
    } else if (rewardType === 'mana') {
      get().addMana(amount)
    } else {
      get().gainExp(amount)
    }

    const nextCount = claimedCountForSpirit + 1
    const next = {
      dayKey: today,
      claimedCountBySpiritId: {
        ...normalized.claimedCountBySpiritId,
        [normalizedSpiritId]: nextCount,
      },
    }
    saveSpiritCommunicationRewardState(next)
    set({ spiritCommunicationRewards: next })
    return {
      granted: true,
      rewardType,
      amount,
      remaining: Math.max(0, SPIRIT_COMMUNICATION_DAILY_LIMIT - nextCount),
    }
  },
  resetGameData: () => {
    const fresh = createFreshGameState()
    try {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY)
      localStorage.removeItem(MANA_STORAGE_KEY)
      localStorage.removeItem(LEGACY_ENERGY_STORAGE_KEY)
      localStorage.removeItem(DISCOVERED_SPIRITS_STORAGE_KEY)
      localStorage.removeItem(HIDDEN_STAGE_FIRST_CLEAR_STORAGE_KEY)
      localStorage.removeItem(NOTIFICATION_SEEN_STORAGE_KEY)
      localStorage.removeItem('spiria.craft-hint-state.v1')
      localStorage.removeItem('spiria.craft-board-state.v1')
      localStorage.removeItem(EXCHANGE_STORAGE_KEY)
      localStorage.removeItem(SPIRIT_COMM_REWARD_STORAGE_KEY)
      localStorage.removeItem(PROFILE_NICKNAME_STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
    clearSpiritSummonHistory()
    const refreshedExchange = createExchangeState()
    const refreshedCommunicationRewards = {
      dayKey: getTodayLocalKey(),
      claimedCountBySpiritId: {},
    }
    saveMana(fresh.mana, fresh.manaUpdatedAt)
    saveGameState(fresh)
    saveExchangeState(refreshedExchange)
    saveSpiritCommunicationRewardState(refreshedCommunicationRewards)
    const freshNotificationSeenState = {
      seenDiscoveredSpiritCount: 0,
      seenOwnedItemTypeCount: countOwnedItemType(fresh.inventory),
      seenUnlockedStageCount: getUnlockedStageCount(fresh.level),
      seenDiscoveredSpiritIds: [] as string[],
      seenOwnedItemIds: getOwnedItemIds(fresh.inventory),
    }
    saveNotificationSeenState(freshNotificationSeenState)
    set({
      progress: 0,
      screen: 'loading',
      craftResult: null,
      pendingLevelUp: null,
      showLevelUpPopup: false,
      pendingHiddenStageJump: null,
      level: fresh.level,
      expInLevel: fresh.expInLevel,
      coins: fresh.coins,
      exchange: refreshedExchange,
      spiritCommunicationRewards: refreshedCommunicationRewards,
      inventory: fresh.inventory,
      mana: fresh.mana,
      manaUpdatedAt: fresh.manaUpdatedAt,
      discoveredSpiritIds: [],
      seenDiscoveredSpiritCount: freshNotificationSeenState.seenDiscoveredSpiritCount,
      seenOwnedItemTypeCount: freshNotificationSeenState.seenOwnedItemTypeCount,
      seenUnlockedStageCount: freshNotificationSeenState.seenUnlockedStageCount,
      seenDiscoveredSpiritIds: freshNotificationSeenState.seenDiscoveredSpiritIds,
      seenOwnedItemIds: freshNotificationSeenState.seenOwnedItemIds,
      hiddenStageFirstClearByRegion: createInitialHiddenStageFirstClearByRegion(),
      explorationProgressByStage: createInitialExplorationProgressByStage(),
    })
  },
  inventory: initialInventoryWithPersisted,
  setItemCount: (id, count) => {
    set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, Math.floor(count)) } }))
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  addItem: (id, delta = 1) => {
    set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) + delta) } }))
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
  consumeItem: (id, delta = 1) => {
    set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) - delta) } }))
    saveGameState({
      level: get().level,
      expInLevel: get().expInLevel,
      coins: get().coins,
      inventory: get().inventory,
      mana: get().mana,
      manaUpdatedAt: get().manaUpdatedAt,
    })
  },
}))

export default useAppStore
