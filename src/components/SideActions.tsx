import { motion } from 'framer-motion'
import { useNotifications } from '../state/notifications'
import useAppStore from '../lib/store'

type ActionItem = {
  id: string
  label: string
  icon: string
  badge?: boolean
}

const items: ActionItem[] = [
  { id: 'order', label: '의뢰서', icon: 'assets/particle/order_icon.png', badge: true },
  { id: 'book', label: '도감', icon: 'assets/particle/book_icon.png', badge: false },
  { id: 'bag', label: '가방', icon: 'assets/particle/inven_icon.png', badge: false },
  { id: 'expedition', label: '탐험', icon: 'assets/particle/dun_icon.png', badge: false },
]

export default function SideActions() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const badges = useNotifications((s) => s.badges)
  const setScreen = useAppStore(s => s.setScreen)

  return (
    <div className="absolute left-[13px] top-[109px] z-10 pointer-events-none">
      <div className="rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_32px_rgba(0,0,0,0.45)] px-3 py-3.5">
        <div className="flex flex-col items-center gap-3">
          {items.map((it) => (
            <motion.button
              key={it.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              className="group flex flex-col items-center gap-0.5 pointer-events-auto select-none"
              aria-label={it.label}
              onClick={
                it.id === 'book'
                  ? () => setScreen('book')
                  : it.id === 'expedition'
                  ? () => setScreen('expedition')
                  : it.id === 'order'
                  ? () => setScreen('craft')
                  : it.id === 'bag'
                  ? () => setScreen('bag')
                  : undefined
              }
            >
              <span className="relative w-[46px] h-[46px] rounded-full bg-transparent flex items-center justify-center">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-full bg-[radial-gradient(closest-side,rgba(8,10,22,0.95),rgba(8,10,22,0)_70%)] blur-[12px]"
                />
                {(badges[it.id] ?? it.badge) && (
                  <span
                    aria-hidden
                    className="absolute top-[4px] right-[3px] w-[16px] h-[16px] rounded-full bg-[#DE4E57] flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.5)] z-10 transform-gpu will-change-transform origin-top animate-[bell7_7s_ease-in-out_infinite]"
                  >
                    <span className="text-white text-[10px] font-extrabold leading-none">!</span>
                  </span>
                )}
                <img
                  src={a(it.icon)}
                  alt={it.label}
                  className="w-9 h-9 object-contain drop-shadow-[0_0_14px_rgba(8,10,22,0.6)]"
                  draggable={false}
                />
              </span>
              <span className="text-[#ac8a7a] text-[14px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                {it.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
