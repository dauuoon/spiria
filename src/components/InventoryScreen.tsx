import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import TopBar from './TopBar'
import ParticlesCanvas from './ParticlesCanvas'
import { ITEMS } from '../data/items'
import useAppStore from '../lib/store'

export default function InventoryScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^[\/]?/, '')}`
  const inventory = useAppStore(s => s.inventory)
  const filters = ['전체','재료','기타'] as const
  const [tab, setTab] = useState<(typeof filters)[number]>('전체')
  const getCategory = (id: string): '재료' | '기타' => '재료'
  const visibleItems = useMemo(() => (
    tab === '전체' ? ITEMS : ITEMS.filter(it => getCategory(it.id) === tab)
  ), [tab])
  
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
        {/* grid 5 columns; each cell shows image tile with name below (no overlaps) */}
        <div className="grid grid-cols-5 gap-x-3 gap-y-4">
          {visibleItems.map((it) => {
            const count = inventory[it.id] ?? 0
            const dimmed = count <= 0
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className={`select-none ${dimmed ? 'opacity-50' : ''}`}
              >
                <div
                  className="relative w-full aspect-square rounded-[14px] overflow-hidden bg-center bg-cover bg-no-repeat ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_6px_18px_rgba(0,0,0,0.45)]"
                  style={{ backgroundImage: `url(${a('assets/particle/bag_item.png')})` }}
                >
                  {it.icon && (
                    <img
                      src={a(it.icon)}
                      alt=""
                      className="absolute left-1/2 top-1/2 w-[70%] h-[70%] -translate-x-1/2 -translate-y-1/2 object-contain pointer-events-none select-none"
                      draggable={false}
                      onError={(e) => {
                        const el = e.currentTarget as HTMLImageElement
                        el.style.display = 'none'
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2 px-2 py-[2px] rounded-full bg-[rgba(10,12,30,0.66)] border border-white/10 text-[11px] text-white/85 tabular-nums">
                    x{count}
                  </div>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[12px] text-white/85 font-medium leading-tight">{it.name}</span>
                </div>
              </motion.div>
            )
          })}
          {visibleItems.length === 0 && (
            <div className="col-span-5 py-10 text-center text-white/60 text-[13px]">표시할 아이템이 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  )
}
