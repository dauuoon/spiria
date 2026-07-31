import { create } from 'zustand'
import { ITEMS } from '../data/items'
import { INITIAL_MANA, LEGACY_ENERGY_STORAGE_KEY, MANA_REGEN_MS, MANA_STORAGE_KEY, MAX_MANA } from '../data/constants'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile' | 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type AppState = {
  progress: number
  setProgress: (v: number) => void
  screen: Screen
  setScreen: (s: Screen) => void
  level: number
  setLevel: (n: number) => void
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

const INITIAL_COINS = 1250

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

const useAppStore = create<AppState>((set, get) => ({
  progress: 0,
  setProgress: (v) => set({ progress: v }),
  screen: 'loading',
  setScreen: (s) => set({ screen: s }),
  level: 12,
  setLevel: (n) => set({ level: Math.max(1, Math.floor(n)) }),
  mana: (() => {
    const loaded = loadMana()
    return loaded?.mana ?? INITIAL_MANA
  })(),
  maxMana: MAX_MANA,
  manaRegenMs: MANA_REGEN_MS,
  manaUpdatedAt: (() => {
    const loaded = loadMana()
    return loaded?.manaUpdatedAt ?? null
  })(),
  spendMana: (n = 1) => {
    const st = get()
    if (st.mana < n) return false
    const now = Date.now()
    const wasMax = st.mana === st.maxMana
    const mana = st.mana - n
    const manaUpdatedAt = wasMax ? now + st.manaRegenMs : st.manaUpdatedAt
    saveMana(mana, manaUpdatedAt ?? null)
    set({ mana, manaUpdatedAt: manaUpdatedAt ?? null })
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
  },
  coins: INITIAL_COINS,
  addCoins: (delta = 0) => set((st) => ({ coins: Math.max(0, st.coins + Math.max(0, Math.floor(delta))) })),
  spendCoins: (delta = 0) => {
    const amount = Math.max(0, Math.floor(delta))
    const current = get().coins
    const spent = Math.min(current, amount)
    set({ coins: current - spent })
    return spent
  },
  inventory: createInitialInventory(),
  setItemCount: (id, count) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, Math.floor(count)) } })),
  addItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) + delta) } })),
  consumeItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) - delta) } })),
}))

export default useAppStore
