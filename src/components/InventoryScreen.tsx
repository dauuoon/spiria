import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import TopBar from './TopBar'
import ParticlesCanvas from './ParticlesCanvas'
import { ITEMS } from '../data/items'
import useAppStore from '../lib/store'

type ItemRarity = '일반' | '레어' | '에픽' | '전설'

const ITEM_DESCRIPTION_BY_ID: Record<string, string> = {
  soul: '정령의 힘이 응축된 조각입니다. 강한 기운이 느껴집니다.',
  forest_trace: '숲 지역을 탐험하며 남긴 흔적입니다.',
  wind_trace: '바람 지역의 정령 기운이 담긴 흔적입니다.',
  lake_trace: '설원 지역에서 발견되는 차가운 기억의 흔적입니다.',
  ruins_trace: '화염 지역의 잔재가 굳어진 흔적입니다.',
  final_trace: '어둠 지역의 깊은 기운을 머금은 흔적입니다.',
}

const RARITY_META: Record<ItemRarity, { badgeClass: string; titleClass: string }> = {
  일반: {
    badgeClass: 'text-[#d7dbe1] bg-[#d7dbe1]/12 border-[#d7dbe1]/35',
    titleClass: 'text-[#d7dbe1]',
  },
  레어: {
    badgeClass: 'text-[#9ef1d6] bg-[#9ef1d6]/12 border-[#9ef1d6]/35',
    titleClass: 'text-[#9ef1d6]',
  },
  에픽: {
    badgeClass: 'text-[#c592ff] bg-[#c592ff]/12 border-[#c592ff]/35',
    titleClass: 'text-[#c592ff]',
  },
  전설: {
    badgeClass: 'text-[#f4dc84] bg-[#f4dc84]/12 border-[#f4dc84]/35',
    titleClass: 'text-[#f4dc84]',
  },
}

const ITEM_BG_BY_RARITY: Record<ItemRarity, string> = {
  일반: 'assets/background/item_common_bg.png',
  레어: 'assets/background/item_rare_bg.png',
  에픽: 'assets/background/item_epic_bg.png',
  전설: 'assets/background/item_lehendary_bg.png',
}

export default function InventoryScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^[\/]?/, '')}`
  const inventory = useAppStore(s => s.inventory)
  const filters = ['전체','재료','기타'] as const
  const [tab, setTab] = useState<(typeof filters)[number]>('전체')
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const getCategory = (id: string): '재료' | '기타' => ITEMS.find((it) => it.id === id)?.category ?? '재료'
  const getRarity = (id: string): ItemRarity => {
    const category = getCategory(id)
    if (category === '재료') return '일반'
    if (id === 'soul' || id === 'final_trace') return '전설'
    if (id === 'forest_trace' || id === 'wind_trace') return '레어'
    if (id === 'lake_trace' || id === 'ruins_trace') return '에픽'
    return '일반'
  }
  const getDescription = (id: string): string => {
    const fixed = ITEM_DESCRIPTION_BY_ID[id]
    if (fixed) return fixed
    return getCategory(id) === '재료'
      ? '정령 제작에 사용하는 기본 재료입니다.'
      : '탐험을 통해 얻을 수 있는 특별한 아이템입니다.'
  }

  const selectedItem = useMemo(
    () => ITEMS.find((it) => it.id === selectedItemId) ?? null,
    [selectedItemId],
  )
  const selectedCount = selectedItem ? (inventory[selectedItem.id] ?? 0) : 0
  const selectedCategory = selectedItem ? getCategory(selectedItem.id) : null
  const selectedRarity = selectedItem ? getRarity(selectedItem.id) : null
  const selectedDescription = selectedItem ? getDescription(selectedItem.id) : null

  const visibleItems = useMemo(() => {
    const owned = ITEMS.filter((it) => (inventory[it.id] ?? 0) > 0)
    return tab === '전체' ? owned : owned.filter((it) => getCategory(it.id) === tab)
  }, [tab, inventory])
  
  // owned counts per category and total (types owned with count > 0)
  const ownedCounts = useMemo(() => {
    let mat = 0, etc = 0, total = 0
    for (const it of ITEMS) {
      const cnt = inventory[it.id] ?? 0
      if (cnt > 0) {
        const cat = getCategory(it.id)
        if (cat === '재료') mat++
        else etc++
        total++
      }
    }
    return { total, '재료': mat, '기타': etc } as const
  }, [inventory])

  return (
    <div className="relative w-full h-full bg-black">
      {/* background (match Book) */}
      <img
        src={a('assets/background/book.png')}
        alt="Inventory background"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = a('assets/background/main_back_em.png')
        }}
      />

      {/* particles */}
      <div className="absolute inset-0 z-[3] opacity-55 pointer-events-none">
        <ParticlesCanvas density={0.00006} baseAlpha={0.18} swingAlpha={0.65} sizeScale={1.2} />
      </div>

      {/* top book overlay image (prevents scroll-over) */}
      <div className="absolute top-0 left-0 right-0 z-[12] pointer-events-none">
        <img
          src={a('assets/background/book_top.png')}
          alt=""
          className="block w-full h-auto object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      </div>
      {/* solid gradient mask under the overlay to fully block items */}
      <div
        className="absolute top-0 left-0 right-0 h-[220px] z-[11] pointer-events-none bg-gradient-to-b from-[rgba(10,12,30,0.98)] via-[rgba(10,12,30,0.92)] to-[rgba(10,12,30,0)]"
      />

      {/* top bar */}
      <TopBar />

      {/* header like Book (정령 도감) + tabs placed at top */}
      <div className="absolute left-5 right-5 top-[70px] z-[20]">
        <div className="mb-2">
          <h2 className="text-[#b78960] text-[26px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">아이템 가방</h2>
          <p className="mt-[6px] text-[#b78960] text-[12px] drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]">
            재료와 기타 아이템을 확인할 수 있습니다.
          </p>
        </div>
        {/* filters: moved to header top region */}
        <div className="mt-[20px] mb-1 flex items-center gap-2">
          {filters.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={
                `px-4 py-2 rounded-full text-[12px] transition-colors border ` +
                (tab === t
                  ? 'text-white bg-[linear-gradient(180deg,#6F49C6_0%,#8C66E8_100%)] border-white/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_18px_rgba(78,41,141,0.45)]'
                  : 'text-[#E3BD87]/80 bg-white/[0.04] border-[#6A59A8]/30 hover:bg-white/[0.08]')
              }
            >
              {t}{'('}{t === '전체' ? ownedCounts.total : ownedCounts[t]}{')'}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div className="absolute inset-0 z-[6] pt-[260px] pb-6 px-5 overflow-y-auto book-scroll">
        <motion.div layout className="grid grid-cols-4 gap-x-3 gap-y-4">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleItems.map((it) => {
              const count = inventory[it.id] ?? 0
              const iconSrc = a(it.icon ?? `assets/item/it/it_${it.id}.png`)
              const rarity = getRarity(it.id)
              return (
                <motion.button
                  key={it.id}
                  layout
                  type="button"
                  onClick={() => {
                    setSelectedItemId((prev) => (prev === it.id ? null : it.id))
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="select-none bg-transparent border-0 p-0 text-left"
                >
                  <div
                    className="relative w-full h-[86px] overflow-visible bg-center bg-cover bg-no-repeat flex items-center justify-center"
                    style={{ backgroundImage: `url(${a(ITEM_BG_BY_RARITY[rarity])})` }}
                  >
                    <img
                      src={iconSrc}
                      alt={it.name}
                      className="w-[62px] h-[62px] object-contain pointer-events-none select-none"
                      draggable={false}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                      }}
                    />
                    <span className="absolute left-1/2 -bottom-[2px] -translate-x-1/2 min-w-[38px] px-2.5 h-[20px] rounded-full border border-[#b7afe1]/25 bg-[rgba(10,12,30,0.82)] text-[12px] font-semibold text-[#ebc8ab] leading-[18px] text-center pointer-events-none select-none tabular-nums">
                      {count}
                    </span>
                  </div>
                  <div className="mt-[4px] text-center">
                    <span className="text-[14px] font-semibold text-[#ebc8ab] drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] leading-tight">{it.name}</span>
                  </div>
                </motion.button>
              )
            })}
          </AnimatePresence>
          {visibleItems.length === 0 && (
            <div className="col-span-4 py-10 text-center text-white/60 text-[13px]">표시할 아이템이 없습니다.</div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedItem && selectedCategory && selectedRarity && selectedDescription && (
          <motion.div
            className="absolute inset-0 z-[40]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onPointerDown={() => setSelectedItemId(null)}
          >
            <motion.div
              initial={{ y: 220, opacity: 0.96 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 220, opacity: 0.96 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              className="absolute left-0 right-0 bottom-0 h-[150px] rounded-t-[18px] border-t border-white/15 bg-[linear-gradient(180deg,rgb(26_22_42_/_90%)_0%,rgb(9_11_26_/_90%)_100%)] shadow-[0_-14px_36px_rgba(0,0,0,0.45)] px-4 py-4"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setSelectedItemId(null)}
                className="absolute right-4 top-3 w-7 h-7 rounded-full border border-white/20 text-white/80 text-[12px] hover:bg-white/10"
                aria-label="닫기"
              >
                X
              </button>

              <div className="flex items-start gap-3 pr-9">
                <img
                  src={a(selectedItem.icon ?? `assets/item/it/it_${selectedItem.id}.png`)}
                  alt={selectedItem.name}
                  className="w-[64px] h-[64px] object-contain"
                  draggable={false}
                />
                <div className="min-w-0">
                  <div className={`text-[17px] font-semibold truncate ${RARITY_META[selectedRarity].titleClass}`}>
                    {selectedItem.name} ({selectedCount})
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[12px]">
                    <span className="px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white/80">
                      {selectedCategory}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border ${RARITY_META[selectedRarity].badgeClass}`}>
                      {selectedRarity}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/80">
                    {selectedDescription}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
