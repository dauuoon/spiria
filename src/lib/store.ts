import { create } from 'zustand'
import { ITEMS } from '../data/items'

type Screen = 'loading' | 'main' | 'expedition' | 'book' | 'craft' | 'bag'

type AppState = {
  progress: number
  setProgress: (v: number) => void
  screen: Screen
  setScreen: (s: Screen) => void
  inventory: Record<string, number>
  setItemCount: (id: string, count: number) => void
  addItem: (id: string, delta?: number) => void
  consumeItem: (id: string, delta?: number) => void
}

const useAppStore = create<AppState>((set) => ({
  progress: 0,
  setProgress: (v) => set({ progress: v }),
  screen: 'loading',
  setScreen: (s) => set({ screen: s }),
  inventory: Object.fromEntries(ITEMS.map(it => [it.id, 0])),
  setItemCount: (id, count) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, Math.floor(count)) } })),
  addItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) + delta) } })),
  consumeItem: (id, delta = 1) => set((st) => ({ inventory: { ...st.inventory, [id]: Math.max(0, (st.inventory[id] ?? 0) - delta) } })),
}))

export default useAppStore
