import { create } from 'zustand'

type AppState = {
  progress: number
  setProgress: (v: number) => void
}

const useAppStore = create<AppState>((set) => ({
  progress: 0,
  setProgress: (v) => set({ progress: v })
}))

export default useAppStore
