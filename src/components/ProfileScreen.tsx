import useAppStore from '../lib/store'
import TopBar from './TopBar'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import { getLevelTitle, formatLevelNumber } from '../data/levelTitles'
import { LEVEL_COLORS } from '../data/levels'

export default function ProfileScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const level = useAppStore(s => s.level)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  // Placeholder XP values; replace with real state when available
  const xp = 1250
  const maxXp = 3000
  const pct = Math.min(100, Math.max(0, Math.round((xp / maxXp) * 100)))
  const levelColor = LEVEL_COLORS[level] || '#A894FF'

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/profile_back.png')}
        alt="Profile background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* glow accents */}
      <div className="absolute inset-0 z-[4] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-60">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-45 scale-90">
          <SoftGlow />
        </div>
      </div>

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/25" />

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* subtle particles */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* content */}
      <div className="absolute inset-0 z-[6] pt-16 px-4 flex flex-col items-center text-center text-white/90">
        {/* 레벨 명칭 크게, 중앙 정렬 (금빛 톤) */}
        <h1 className="mt-4 text-[26px] sm:text-[28px] font-extrabold tracking-wide text-[#d5bd8a] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
          {getLevelTitle(level)}
        </h1>

        {/* Lv.(레벨) + 경험치 바 (메인 프로필 영역 재구성) */}
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-white/80 text-[12px] font-semibold">Lv.</span>
          <div
            className="flex items-center justify-center w-[28px] h-[28px] rounded-full text-black text-[13px] font-extrabold select-none"
            style={{ background: levelColor, boxShadow: `0 2px 12px ${levelColor}66` }}
          >
            {formatLevelNumber(level)}
          </div>
          <div className="relative -ml-[6px] h-[8px] w-[min(45vw,120px)] rounded-full bg-black/35 border border-white/10 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.35)] overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ width: `${pct}%`, background: levelColor, boxShadow: `0 0 10px ${levelColor}66` }}
            />
          </div>
        </div>

        {/* 중앙 원형 큰 일러스트 (이중 링 + 상단 다이아) */}
        <div className="relative mt-6 w-[72%] max-w-[420px] pb-[72%] sm:aspect-square sm:pb-0 select-none">
          {/* 바깥 링 */}
          <div className="absolute inset-0 rounded-full border-[6px] border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]" />
          {/* 안쪽 링 */}
          <div className="absolute inset-[10px] rounded-full border-[4px] border-white/10" />
          {/* 상단 다이아 포인트 */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-[12px] h-[12px] rotate-45 bg-[rgba(205,176,122,0.95)] shadow-[0_2px_8px_rgba(205,176,122,0.5)]" />
          {/* 내용 영역 */}
          <div className="absolute inset-[18px] rounded-full bg-[rgba(10,12,30,0.50)] border border-white/10 flex items-center justify-center text-white/40">
            일러스트 자리
          </div>
        </div>

        {/* 네임 플레이트 */}
        <div className="mt-4 px-5 py-2 rounded-xl border border-[rgba(205,176,122,0.45)] bg-[rgba(205,176,122,0.08)] text-[14px] font-semibold text-[#e7d3a4] shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
          정령 소환사
        </div>

        {/* 하단 네모 정방형 박스 4개: 자리만 */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[480px] grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border border-white/12 bg-[rgba(10,12,30,0.50)] backdrop-blur-[1px] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_14px_28px_rgba(0,0,0,0.45)]"
            />
          ))}
        </div>
      </div>
    </div>
  )
}
