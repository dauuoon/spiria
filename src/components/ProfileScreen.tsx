import useAppStore from '../lib/store'
import TopBar from './TopBar'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'

export default function ProfileScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

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
      <div className="absolute inset-0 z-[6] p-4 pt-16 flex items-start justify-center">
        <div className="mt-6 w-[88%] max-w-[360px] rounded-2xl bg-[rgba(10,12,30,0.55)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_16px_36px_rgba(0,0,0,0.45)] p-4 text-white/90">
          <div className="text-[16px] font-extrabold mb-3">프로필</div>
          <div className="flex items-center gap-3">
            <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
              <img
                src={a('assets/logo/avatar_default.png')}
                alt="avatar"
                className="w-full h-full object-cover"
                draggable={false}
              />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold text-[#ac8a7a]">정령 소환사</div>
              <div className="mt-1 text-[12px] text-white/80">Lv. 12 · 모험가</div>
            </div>
          </div>
          <div className="mt-4 h-[1px] bg-white/10" />
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px] text-white/80">
            <div>탐험 횟수: —</div>
            <div>보유 코인: —</div>
            <div>다음 칭호: —</div>
            <div>수집 도감: —</div>
          </div>
        </div>
      </div>
    </div>
  )
}
