import { create } from 'zustand'
import { DUNGEONS } from '../data/dungeons'
import { ITEMS } from '../data/items'
import { INITIAL_MANA, LEGACY_ENERGY_STORAGE_KEY, MANA_REGEN_MS, MANA_STORAGE_KEY, MAX_MANA, MANA_PER_EXPLORE } from '../data/constants'
import { EXP_TO_NEXT } from '../data/levels'
import { getLevelTitle } from '../data/levelTitles'
import { REGIONS } from '../data/regions'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile' | 'license' | 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type PersistedGameState = {
  level: number
  expInLevel: number
  coins: number
  inventory: Record<string, number>
  mana: number
  manaUpdatedAt: number | null
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

type AppState = {
  progress: number
  setProgress: (v: number) => void
  screen: Screen
  setScreen: (s: Screen) => void
  pendingLevelUp: PendingLevelUp | null
  showLevelUpPopup: boolean
  dismissLevelUpPopup: () => void
  claimPendingLevelUpRewards: () => void
  level: number
  setLevel: (n: number) => void
  expInLevel: number
  setExpInLevel: (n: number) => void
  gainExp: (delta: number) => PendingLevelUp | null
  explorationProgress: {
    materialDiscovered: number
    spiritDiscovered: number
    regionalEventDiscovered: number
    treasureDiscovered: number
  }
  markExplorationDiscovery: (kind: 'material' | 'spirit' | 'regional' | 'treasure') => void
  mana: number
  maxMana: number
  manaRegenMs: number
  manaUpdatedAt: number | null
  spendMana: (n?: number) => boolean
  recomputeMana: () => void
  inventory: Record<string, number>
  setItemCount: (id: string, count: number) => void
  addItem: (id: string, delta?: number) => void
  consumeItem: (id: string, delta?: number) => void
  coins: number
  addCoins: (delta?: number) => void
  spendCoins: (delta?: number) => number
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
const INITIAL_LEVEL = 1
const INITIAL_COINS = 1250

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

const persistedGameState = loadGameState()
const persistedInventory = persistedGameState?.inventory ?? {}
const initialInventory = createInitialInventory()
const initialInventoryWithPersisted = { ...initialInventory, ...persistedInventory }

const useAppStore = create<AppState>((set, get) => ({
  progress: 0,
  setProgress: (v) => set({ progress: v }),
  screen: 'loading',
  setScreen: (s) => set((state) => ({
    screen: s,
    showLevelUpPopup: state.pendingLevelUp !== null && s !== state.screen && !state.showLevelUpPopup ? true : state.showLevelUpPopup,
  })),
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
  explorationProgress: {
    materialDiscovered: 0,
    spiritDiscovered: 0,
    regionalEventDiscovered: 0,
    treasureDiscovered: 0,
  },
  markExplorationDiscovery: (kind) => set((state) => ({
    explorationProgress: {
      ...state.explorationProgress,
      [kind === 'material' ? 'materialDiscovered' : kind === 'spirit' ? 'spiritDiscovered' : kind === 'regional' ? 'regionalEventDiscovered' : 'treasureDiscovered']: state.explorationProgress[kind === 'material' ? 'materialDiscovered' : kind === 'spirit' ? 'spiritDiscovered' : kind === 'regional' ? 'regionalEventDiscovered' : 'treasureDiscovered'] + 1,
    },
  })),
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

      const crossedThresholds = Array.from({ length: currentLevel - nextLevel }, (_, idx) => nextLevel + idx + 1)
        .filter((level) => level > 0 && level % 10 === 0)
      const rewardGold = crossedThresholds.reduce((sum, level) => sum + (level / 10) * 100, 0)
      const rewardMana = 1
      const titleChanged = getLevelTitle(nextLevel) !== getLevelTitle(currentLevel)
      const unlockedRegions = [
        ...DUNGEONS.filter((dungeon) => nextLevel < dungeon.unlockLv && currentLevel >= dungeon.unlockLv).map((dungeon) => dungeon.name),
        ...REGIONS.filter((region) => nextLevel < region.unlockLevel && currentLevel >= region.unlockLevel).map((region) => region.name),
      ]
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
          unlockedRegions,
        },
        popupKey: `${nextLevel}-${currentLevel}-${Date.now()}`,
      }

      const nextState = {
        level: currentLevel,
        expInLevel: currentLevel >= 99 ? 0 : currentExp,
        pendingLevelUp: levelUpInfo,
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
  resetGameData: () => {
    const fresh = createFreshGameState()
    try {
      localStorage.removeItem(GAME_STATE_STORAGE_KEY)
      localStorage.removeItem(MANA_STORAGE_KEY)
      localStorage.removeItem(LEGACY_ENERGY_STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
    saveMana(fresh.mana, fresh.manaUpdatedAt)
    saveGameState(fresh)
    set({
      progress: 0,
      screen: 'loading',
      pendingLevelUp: null,
      showLevelUpPopup: false,
      level: fresh.level,
      expInLevel: fresh.expInLevel,
      coins: fresh.coins,
      inventory: fresh.inventory,
      mana: fresh.mana,
      manaUpdatedAt: fresh.manaUpdatedAt,
      explorationProgress: {
        materialDiscovered: 0,
        spiritDiscovered: 0,
        regionalEventDiscovered: 0,
        treasureDiscovered: 0,
      },
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
