import { create } from 'zustand'
import { ITEMS } from '../data/items'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag' | 'profile' | 'map1' | 'map2'

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
  inventory: Object.fromEntries(ITEMS.map(it => [it.id, 0])),
  setItemCount: (id, count) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, Math.floor(count)) } })),
  addItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) + delta) } })),
  consumeItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) - delta) } })),
}))

export default useAppStore
