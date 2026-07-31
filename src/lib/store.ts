import { create } from 'zustand'
import { ITEMS } from '../data/items'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile' | 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type AppState = {
  progress: number
  setProgress: (v: number) => void
  screen: Screen
  setScreen: (s: Screen) => void
  level: number
  setLevel: (n: number) => void
  energy: number
  energyMax: number
  energyRegenMs: number
  nextRegenAt: number | null
  spendEnergy: (n?: number) => boolean
  recomputeEnergy: () => void
  inventory: Record<string, number>
  setItemCount: (id: string, count: number) => void
  addItem: (id: string, delta?: number) => void
  consumeItem: (id: string, delta?: number) => void
  coins: number
  addCoins: (delta?: number) => void
  spendCoins: (delta?: number) => number
}

const loadEnergy = () => {
  try {
    const raw = localStorage.getItem('spiria.energy')
    if (!raw) return null
    return JSON.parse(raw) as { energy: number; nextRegenAt: number | null }
  } catch {
    return null
  }
}

const saveEnergy = (energy: number, nextRegenAt: number | null) => {
  try {
    localStorage.setItem('spiria.energy', JSON.stringify({ energy, nextRegenAt }))
  } catch {
    // ignore
  }
}

const ENERGY_MAX = 5
const ENERGY_REGEN_MS = 20 * 60 * 1000
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
      soul: 6,
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
  energy: (() => {
    const loaded = loadEnergy()
    return loaded?.energy ?? ENERGY_MAX
  })(),
  energyMax: ENERGY_MAX,
  energyRegenMs: ENERGY_REGEN_MS,
  nextRegenAt: (() => {
    const loaded = loadEnergy()
    return loaded?.nextRegenAt ?? null
  })(),
  spendEnergy: (n = 1) => {
    const st = get()
    if (st.energy < n) return false
    const now = Date.now()
    const wasMax = st.energy === st.energyMax
    const energy = st.energy - n
    const nextRegenAt = wasMax ? now + st.energyRegenMs : st.nextRegenAt
    saveEnergy(energy, nextRegenAt ?? null)
    set({ energy, nextRegenAt: nextRegenAt ?? null })
    return true
  },
  recomputeEnergy: () => {
    const st = get()
    if (st.energy >= st.energyMax || !st.nextRegenAt) return
    const now = Date.now()
    if (now < st.nextRegenAt) return
    const elapsed = now - st.nextRegenAt
    const gained = Math.floor(elapsed / st.energyRegenMs) + 1
    const newEnergy = Math.min(st.energyMax, st.energy + gained)
    const stillMissing = st.energyMax - newEnergy
    const nextRegenAt = stillMissing > 0 ? st.nextRegenAt + gained * st.energyRegenMs : null
    saveEnergy(newEnergy, nextRegenAt)
    set({ energy: newEnergy, nextRegenAt })
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
