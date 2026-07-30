import { motion } from 'framer-motion'
import TopBar from './TopBar'
import ParticlesCanvas from './ParticlesCanvas'
import { ITEMS } from '../data/items'
import useAppStore from '../lib/store'

export default function InventoryScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^[\/]?/, '')}`
  const inventory = useAppStore(s => s.inventory)

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

      {/* top bar */}
      <TopBar />

      {/* header like Book (정령 도감) */}
      <div className="absolute left-5 right-5 top-[70px] z-[20]">
        <div className="mb-3">
          <h2 className="text-[#b78960] text-[26px] font-medium drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">가방</h2>
        </div>
      </div>

      {/* content */}
      <div className="absolute inset-0 z-[6] pt-[240px] pb-6 px-5">
        <div className="h-[calc(100%_-_50px)] w-full rounded-2xl bg-[rgba(16,18,32,0.72)] border border-white/10 backdrop-blur-md p-4 shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-y-auto book-scroll">
          {/* summary row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-[13px]">보유 재료</span>
              <span className="text-white/50 text-[12px]">{Object.values(inventory).reduce((a,b)=>a+(b>0?1:0),0)}/{ITEMS.length}</span>
            </div>
          </div>

          {/* grid 3 x 4 */}
          <div className="grid grid-cols-3 gap-3">
            {ITEMS.map((it) => {
              const count = inventory[it.id] ?? 0
              const dimmed = count <= 0
              return (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`relative rounded-xl border border-white/10 bg-[rgba(22,24,40,0.72)] p-3 select-none ${dimmed ? 'opacity-50' : ''}`}
                >
                  {/* count badge */}
                  <div className="absolute top-2 right-2 px-2 py-[2px] rounded-full bg-[rgba(10,12,30,0.66)] border border-white/10 text-[11px] text-white/85 tabular-nums">
                    x{count}
                  </div>

                  {/* icon placeholder */}
                  <div className="relative w-full aspect-square flex items-center justify-center">
                    <span aria-hidden className="absolute w-[72%] h-[72%] rounded-full bg-[radial-gradient(closest-side,rgba(255,223,88,0.28),rgba(255,223,88,0)_75%)] blur-[12px]" />
                    <div className="relative w-[60%] h-[60%] rounded-2xl border border-white/10 bg-[rgba(12,14,26,0.6)] flex items-center justify-center shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
                      <span className="text-[15px] text-[#ac8a7a] font-semibold">{it.name}</span>
                    </div>
                  </div>

                  {/* label */}
                  <div className="mt-2 text-center">
                    <span className="text-[13px] text-white/85 font-medium">{it.name}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
