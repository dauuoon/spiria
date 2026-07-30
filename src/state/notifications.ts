import { create } from 'zustand'

export type NotificationId = 'order' | 'book' | 'bag' | 'expedition' | (string & {})

export type NotificationsState = {
  badges: Record<string, boolean>
  setBadge: (id: NotificationId, value: boolean) => void
  clearBadge: (id: NotificationId) => void
  setBadges: (map: Partial<Record<NotificationId, boolean>>) => void
}

export const useNotifications = create<NotificationsState>((set) => ({
  badges: {
    // default: all off — toggle from screens when new content arrives
  },
  setBadge: (id, value) => set((s) => ({ badges: { ...s.badges, [id]: value } })),
  clearBadge: (id) => set((s) => {
    const next = { ...s.badges }
    delete next[id]
    return { badges: next }
  }),
  setBadges: (map) => set((s) => ({ badges: { ...s.badges, ...map } })),
}))
