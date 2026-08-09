import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import { DUNGEONS } from '../data/dungeons'
import { ITEMS, TRACE_ITEM_BY_STAGE } from '../data/items'
import { REGIONS } from '../data/regions'

type ActionItem = {
  id: string
  label: string
  icon: string
}

const items: ActionItem[] = [
  { id: 'order', label: '의뢰서', icon: 'assets/particle/order_icon.png' },
  { id: 'book', label: '도감', icon: 'assets/particle/book_icon.png' },
  { id: 'bag', label: '가방', icon: 'assets/particle/inven_icon.png' },
  { id: 'expedition', label: '탐험', icon: 'assets/particle/dun_icon.png' },
]

export default function SideActions() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const setScreen = useAppStore(s => s.setScreen)
  const discoveredSpiritIds = useAppStore(s => s.discoveredSpiritIds)
  const seenDiscoveredSpiritCount = useAppStore(s => s.seenDiscoveredSpiritCount)
  const seenDiscoveredSpiritIds = useAppStore(s => s.seenDiscoveredSpiritIds)
  const inventory = useAppStore(s => s.inventory)
  const seenOwnedItemTypeCount = useAppStore(s => s.seenOwnedItemTypeCount)
  const seenOwnedItemIds = useAppStore(s => s.seenOwnedItemIds)
  const level = useAppStore(s => s.level)
  const seenUnlockedStageCount = useAppStore(s => s.seenUnlockedStageCount)

  const ownedItemTypeCount = ITEMS.reduce((count, item) => count + ((inventory[item.id] ?? 0) > 0 ? 1 : 0), 0)
  const ownedItemIds = ITEMS.filter((item) => (inventory[item.id] ?? 0) > 0).map((item) => item.id)
  const seenDiscoveredSpiritIdSet = new Set(seenDiscoveredSpiritIds)
  const seenOwnedItemIdSet = new Set(seenOwnedItemIds)
  const hasNewDiscoveredSpirit = discoveredSpiritIds.some((id) => !seenDiscoveredSpiritIdSet.has(id))
  const hasNewOwnedItemType = ownedItemIds.some((id) => !seenOwnedItemIdSet.has(id))
  const unlockedStageCount = DUNGEONS.reduce((count, dungeon) => count + (level >= dungeon.unlockLv ? 1 : 0), 0)
  const hasHiddenReadyStage = ([1, 2, 3, 4, 5] as const).some((stage) => {
    const region = REGIONS[stage - 1]
    if (!region) return false
    if (level < region.unlockLevel) return false
    const traceItemId = TRACE_ITEM_BY_STAGE[stage]
    return (inventory[traceItemId] ?? 0) >= region.hiddenStageRequiredAmount
  })

  const badges: Record<string, boolean> = {
    order: true,
    book: hasNewDiscoveredSpirit || discoveredSpiritIds.length > seenDiscoveredSpiritCount,
    bag: hasNewOwnedItemType || ownedItemTypeCount > seenOwnedItemTypeCount,
    expedition: unlockedStageCount > seenUnlockedStageCount || hasHiddenReadyStage,
  }

  return (
    <div className="absolute left-[13px] top-[109px] z-10 pointer-events-none max-[360px]:left-[10px] max-[360px]:top-[100px]">
      <div className="rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_32px_rgba(0,0,0,0.45)] px-3 py-3.5 max-[360px]:px-2.5 max-[360px]:py-3">
        <div className="flex flex-col items-center gap-3 max-[360px]:gap-2.5">
          {items.map((it) => (
            <motion.button
              key={it.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              className="group flex flex-col items-center gap-0.5 pointer-events-auto select-none"
              aria-label={it.label}
              data-tutorial-target={it.id === 'book' ? 'codex' : undefined}
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
              <span className="relative w-[46px] h-[46px] rounded-full bg-transparent flex items-center justify-center max-[360px]:w-[42px] max-[360px]:h-[42px]">
                <span
                  aria-hidden
                  className="pointer-events-none absolute -inset-1 rounded-full bg-[radial-gradient(closest-side,rgba(8,10,22,0.95),rgba(8,10,22,0)_70%)] blur-[12px]"
                />
                {badges[it.id] && (
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
                  className="w-9 h-9 object-contain drop-shadow-[0_0_14px_rgba(8,10,22,0.6)] max-[360px]:w-8 max-[360px]:h-8"
                  draggable={false}
                />
              </span>
              <span className="text-[#ac8a7a] text-[14px] font-semibold leading-none drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] max-[360px]:text-[13px]">
                {it.label}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
