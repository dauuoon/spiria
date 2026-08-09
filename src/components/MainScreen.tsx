import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import SideActions from './SideActions'
import ParticlesCanvas from './ParticlesCanvas'
import UserProfile from './UserProfile'
import useRandomWiggle from '../lib/useRandomWiggle'

export default function MainScreen() {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const setScreen = useAppStore(s => s.setScreen)
  const setProgress = useAppStore(s => s.setProgress)
  const coins = useAppStore(s => s.coins)
  const mana = useAppStore(s => s.mana)
  const recomputeMana = useAppStore(s => s.recomputeMana)
  const resetGameData = useAppStore(s => s.resetGameData)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  // Keep mana display in sync on main screen as well.
  useEffect(() => {
    const id = setInterval(() => recomputeMana(), 1000)
    return () => clearInterval(id)
  }, [recomputeMana])

  return (
    <div className="relative w-full h-full bg-black">
      {/* background image */}
      <img
        src={a('assets/background/main_back_em.png')}
        alt="Main background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* glow overlay similar to splash */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-70">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-50 scale-90">
          <SoftGlow />
        </div>
      </div>

      {/* left vertical actions */}
      <SideActions />

      {/* right-side single settings icon */}
      <div className="absolute right-[13px] top-[109px] z-20 pointer-events-auto">
        <div ref={menuRef} className="relative inline-block w-[46px]">
          <motion.button type="button" whileTap={{ scale: 0.96 }} aria-label="설정" className="group relative w-[46px] h-[46px]" onClick={() => setMenuOpen(v => !v)}>
            <span className="relative w-full h-full rounded-full bg-transparent flex items-center justify-center">
              <span aria-hidden className="pointer-events-none absolute -inset-2 rounded-full bg-[radial-gradient(closest-side,rgba(8,10,22,0.95),rgba(8,10,22,0)_72%)] blur-[16px]" />
              <img src={a('assets/particle/set_icon.png')} alt="설정" className="w-9 h-9 object-contain drop-shadow-[0_0_14px_rgba(8,10,22,0.6)]" draggable={false} />
            </span>
          </motion.button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-[130px] rounded-lg bg-[rgba(10,12,30,0.85)] border border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setScreen('license')
                }}
                className="w-full text-center px-3 py-2 text-[14px] text-[#cfd3db] hover:bg-white/10"
              >
                라이선스
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  setProgress(0)
                  setScreen('loading')
                }}
                className="w-full text-center px-3 py-2 text-[14px] text-[#cfd3db] hover:bg-white/10"
              >
                재시작
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  window.close()
                }}
                className="w-full text-center px-3 py-2 text-[14px] text-red-400 hover:bg-white/10"
              >
                게임종료
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  const confirmed = window.confirm('데이터를 초기화하고 처음부터 다시 시작할까요?')
                  if (!confirmed) return
                  resetGameData()
                }}
                className="w-full text-center px-3 py-2 text-[14px] text-[#cfd3db] hover:bg-white/10"
              >
                데이터초기화
              </button>
            </div>
          )}
        </div>
      </div>

      {/* dim overlay for readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Top-right currency badges (coin + mana), no plus button */}
      <div className="absolute top-[32px] right-[17px] z-10 flex items-center gap-2 max-[360px]:top-[28px] max-[360px]:right-[14px]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-[rgba(10,12,30,0.55)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_24px_rgba(0,0,0,0.25)]"
          aria-label="코인"
        >
          <span className="relative inline-flex w-5 h-5 items-center justify-center">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(255,214,99,0.55),rgba(255,214,99,0)_70%)] blur-[6px]" />
            <img src={a('assets/particle/money.png')} alt="coin" className="relative w-5 h-5 drop-shadow-[0_0_8px_rgba(227,189,135,0.35)]" />
          </span>
          <span className="text-white/90 text-[14px] font-semibold tabular-nums max-[360px]:text-[12px]">{coins.toLocaleString()}</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-[rgba(10,12,30,0.55)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_24px_rgba(0,0,0,0.25)]"
          aria-label="마나"
        >
          <span className="relative inline-flex w-5 h-5 items-center justify-center">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(155,203,255,0.5),rgba(155,203,255,0)_70%)] blur-[6px]" />
            <img src={a('assets/particle/gem.png')} alt="mana" className="relative w-5 h-5 drop-shadow-[0_0_8px_rgba(155,203,255,0.35)]" />
          </span>
          <span className="text-white/90 text-[14px] font-semibold tabular-nums max-[360px]:text-[12px]">{mana}</span>
        </motion.button>
      </div>

      {/* Top-left user profile */}
      <UserProfile />

      {/* subtle particles like loading screen (lower density) */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* main interactive buildings (1차 배치) */}
      <div className="absolute inset-0 z-[6] pointer-events-auto select-none">
        {/* 공방 (좌측) */}
        <motion.button
          type="button"
          aria-label="공방"
          whileTap={{ scale: 0.9, y: 2 }}
          className="absolute left-[calc(2%-70px)] bottom-[calc(18%-505px)] w-[70%] max-w-none z-[8] cursor-pointer relative overflow-visible max-[360px]:left-[calc(3%-54px)] max-[360px]:w-[66%] max-[360px]:bottom-[calc(18%-470px)]"
          onClick={() => setScreen('exchange')}
          data-tutorial-target="exchange"
        >
          <Wiggly>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[18px] -z-10 bg-[radial-gradient(closest-side,rgba(255,223,88,0.55),rgba(255,223,88,0)_70%)] animate-[glowFlicker_2400ms_ease-in-out_infinite]"
            />
            <img
              src={a('assets/particle/home.png')}
              alt="공방"
              className="block w-full h-auto object-contain"
              draggable={false}
            />

            {/* 공방 앞 라벨 + 텍스트 */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(-5%+170px)] z-[3] w-[46%] max-w-none ml-[70px]">
              <img
                src={a('assets/particle/M_brown.png')}
                alt="라벨"
                className="w-full h-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="-translate-y-[2px] inline-block text-[clamp(12px,3vw,15px)] font-semibold tracking-wide text-[#ac8a7a] max-[360px]:text-[12px]">
                  교환소 가기
                </span>
              </div>
            </div>
          </Wiggly>
        </motion.button>

        {/* 던전 (우측) */}
        <motion.button
          type="button"
          aria-label="던전"
          whileTap={{ scale: 0.9, y: 2 }}
          className="main-dungeon-cta absolute right-[calc(3%-238px)] bottom-[calc(20%-166px)] w-[72%] max-w-none z-[9] cursor-pointer relative overflow-visible max-[360px]:right-[calc(4%-190px)] max-[360px]:w-[66%] max-[360px]:bottom-[calc(20%-154px)]"
          onClick={() => setScreen('expedition')}
        >
          <Wiggly>
            <span
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full blur-[18px] -z-10 bg-[radial-gradient(closest-side,rgba(255,223,88,0.5),rgba(255,223,88,0)_70%)] animate-[glowFlicker_2600ms_ease-in-out_infinite]"
            />
            <img
              src={a('assets/particle/dun.png')}
              alt="던전"
              className="block w-full h-auto object-contain"
              draggable={false}
            />

            {/* 던전 앞 라벨 + 텍스트 */}
            <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(-5%+220px)] z-[3] w-[46%] max-w-none ml-[-5px]">
              <img
                src={a('assets/particle/M_brown.png')}
                alt="라벨"
                className="w-full h-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
                draggable={false}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="-translate-y-[2px] inline-block text-[clamp(12px,3vw,15px)] font-semibold tracking-wide text-[#ac8a7a] max-[360px]:text-[12px]">
                  탐험 가기
                </span>
              </div>
            </div>
          </Wiggly>
        </motion.button>

        {/* 솥 (가운데, 최상단) - 래퍼로 위치 고정하여 클릭 시 이동 버그 방지 */}
        <div className="absolute left-1/2 -translate-x-1/2 ml-0 bottom-[calc(12%+30px)] w-[calc(54%+35px)] z-[12] max-[360px]:w-[calc(52%+24px)] max-[360px]:bottom-[calc(12%+20px)]" data-tutorial-target="workshop">
          <motion.button
            type="button"
            aria-label="솥"
            whileTap={{ scale: 0.9, y: 2 }}
            className="relative block w-full cursor-pointer overflow-visible"
            onClick={() => setScreen('craft')}
          >
            <Wiggly strength="pot">
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[88%] h-[88%] rounded-full blur-[22px] -z-10 bg-[radial-gradient(closest-side,rgba(255,223,88,0.6),rgba(255,223,88,0)_72%)] animate-[glowFlicker_2200ms_ease-in-out_infinite]"
              />
              <img
                src={a('assets/particle/pot.png')}
                alt="솥"
                className="block w-full h-auto object-contain"
                draggable={false}
              />

              {/* 솥 앞 라벨 + 텍스트 */}
              <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[-6%] z-[3] w-[56%] max-w-none">
                <img
                  src={a('assets/particle/L_purple.png')}
                  alt="라벨"
                  className="w-full h-auto object-contain drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)]"
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="-translate-y-[2px] inline-block text-[clamp(13px,3.2vw,16px)] font-semibold tracking-wide text-[#fff1b3] max-[360px]:text-[13px]">
                    정령 빚기
                  </span>
                </div>
              </div>
            </Wiggly>
          </motion.button>
        </div>
      </div>

    </div>
  )
}

function Wiggly({ children, strength }: { children: React.ReactNode, strength?: 'pot' | 'default' }) {
  const controls = useRandomWiggle(
    4200 + Math.random() * 1500,
    8800 + Math.random() * 1800,
    strength === 'pot' ? 1.4 : 0.9,
    0.72,
  )
  return (
    <motion.div
      animate={controls}
      style={{ transformOrigin: '50% 85%' }}
      transition={{ duration: 0.72, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
