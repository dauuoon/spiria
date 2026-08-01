import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import { DUNGEONS } from '../data/dungeons'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'
import { useEffect, useMemo, useState } from 'react'
import { MANA_PER_EXPLORE } from '../data/constants'

type MapScreen = 'map1' | 'map2' | 'map3' | 'map4' | 'map5'

type EntryTarget = {
  stage: number
  screen: MapScreen
}

const TAP_SFX_PATH = 'assets/sound/tap.mp3'

function playTapSfx() {
  try {
    const audio = new Audio(`${import.meta.env.BASE_URL}${TAP_SFX_PATH}`)
    audio.volume = 0.85
    void audio.play()
  } catch {
    // ignore audio failures
  }
}

export default function ExpeditionScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const level = useAppStore(s => s.level)
  const mana = useAppStore(s => s.mana)
  const maxMana = useAppStore(s => s.maxMana)
  const manaUpdatedAt = useAppStore(s => s.manaUpdatedAt)
  const recomputeMana = useAppStore(s => s.recomputeMana)
  const spendMana = useAppStore(s => s.spendMana)
  const [entryTarget, setEntryTarget] = useState<EntryTarget | null>(null)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const isUnlocked = (stage: number) => level >= DUNGEONS[stage - 1]?.unlockLv
  const hasMana = mana > 0
  const playLockSfx = () => {
    try {
      const audio = new Audio(a('assets/sound/lock.mp3'))
      audio.volume = 0.8
      void audio.play()
    } catch {
      // ignore
    }
  }

  const requestEnter = (stage: number, screen: MapScreen) => {
    if (!isUnlocked(stage)) { playLockSfx(); return }
    if (!hasMana) { playLockSfx(); return }
    setEntryTarget({ stage, screen })
  }

  const confirmEnter = () => {
    if (!entryTarget) return
    const manaCost = DUNGEONS[entryTarget.stage - 1]?.manaCost ?? MANA_PER_EXPLORE
    const ok = spendMana(manaCost)
    if (ok) {
      setScreen(entryTarget.screen)
      setEntryTarget(null)
    } else {
      playLockSfx()
    }
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/map_back.png')}
        alt="Expedition background"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = a('assets/background/main_back_em.png')
        }}
      />

      {/* subtle glow accents */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        <div className="absolute left-0 top-0 ml-[-70px] mt-[70px] opacity-60">
          <SoftGlow />
        </div>
        <div className="absolute right-3 bottom-20 opacity-45 scale-90">
          <SoftGlow />
        </div>
      </div>

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/28" />

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      {/* subtle particles like main */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* map nodes (temporary placement with press effect) */}
      <div className="absolute inset-0 z-[6] pointer-events-auto select-none">
        {/* 1단계: 좌상단 숲 */}
        <motion.button
          type="button"
          aria-label="1단계"
          className="absolute left-[10%] top-[26%] w-[48%] max-w-none cursor-pointer"
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(1, 'map1')
          }}
        >
          <motion.div className="relative w-full h-full" style={{ x: -25, y: -25 }} whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map1.png')}
              alt="1단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a('assets/particle/ok1.png')}
              alt="1단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '100px', left: 'calc(50% + 35px)' }}
            />
          </motion.div>
        </motion.button>

        {/* 2단계: 우상단 결정 산맥 */}
        <motion.button
          type="button"
          aria-label="2단계"
          className="absolute right-[8%] top-[30%] w-[51%] max-w-none cursor-pointer"
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(2, 'map2')
          }}
        >
          <motion.div className="relative w-full h-full" style={{ x: 65, y: -30 }} whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map2.png')}
              alt="2단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(2) ? 'assets/particle/ok2.png' : 'assets/particle/no2.png')}
              alt="2단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '75px', left: 'calc(50% + 25px)' }}
            />
          </motion.div>
        </motion.button>

        {/* 3단계: 우중단 빙설 */}
        <motion.button
          type="button"
          aria-label="3단계"
          className="absolute left-[6%] top-[56%] w-[56%] max-w-none cursor-pointer"
          style={{ x: 200, y: -95 }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(3, 'map3')
          }}
        >
          <motion.div className="relative w-full h-full" whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map3.png')}
              alt="3단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(3) ? 'assets/particle/ok3.png' : 'assets/particle/no3.png')}
              alt="3단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '60px', left: 'calc(50% - 30px)' }}
            />
          </motion.div>
        </motion.button>

        {/* 4단계: 좌중단 화산 */}
        <motion.button
          type="button"
          aria-label="4단계"
          className="absolute right-[6%] top-[55%] w-[56%] max-w-none cursor-pointer"
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(4, 'map4')
          }}
        >
          <motion.div className="relative w-full h-full" style={{ x: -180, y: -75 }} whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map4.png')}
              alt="4단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(4) ? 'assets/particle/ok4.png' : 'assets/particle/no4.png')}
              alt="4단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '80px', left: 'calc(50% + 35px)' }}
            />
          </motion.div>
        </motion.button>

        {/* 5단계: 하단 중앙 슬라임 */}
        <motion.button
          type="button"
          aria-label="5단계"
          className="absolute left-1/2 -translate-x-1/2 w-[68%] max-w-none cursor-pointer"
          style={{ bottom: 'calc(7% + 20px)' }}
          data-suppress-tap-sfx="true"
          onClick={() => {
            requestEnter(5, 'map5')
          }}
        >
          <motion.div className="relative w-full h-full" style={{ x: 65, y: -75 }} whileTap={{ scale: 1.06 }}>
            <img
              src={a('assets/particle/map5.png')}
              alt="5단계"
              className="block w-full h-auto object-contain"
              draggable={false}
            />
            <img
              src={a(isUnlocked(5) ? 'assets/particle/ok5.png' : 'assets/particle/no5.png')}
              alt="5단계 해금"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-10 pointer-events-none"
              draggable={false}
              style={{ top: '5px', left: 'calc(50% + 65px)' }}
            />
          </motion.div>
        </motion.button>
      </div>
      {/* bottom overlays: mana count and timer */}
      <EnergyOverlays
        a={a}
        mana={mana}
        maxMana={maxMana}
        manaUpdatedAt={manaUpdatedAt}
        onTick={recomputeMana}
      />

      {entryTarget && (
        <MapEntryModal
          a={a}
          mapName={DUNGEONS[entryTarget.stage - 1]?.name ?? `${entryTarget.stage}단계`}
          manaCost={DUNGEONS[entryTarget.stage - 1]?.manaCost ?? MANA_PER_EXPLORE}
          onCancel={() => setEntryTarget(null)}
          onConfirm={confirmEnter}
        />
      )}
    </div>
  )
}

function MapEntryModal({
  a,
  mapName,
  manaCost,
  onCancel,
  onConfirm,
}: {
  a: (p: string) => string
  mapName: string
  manaCost: number
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="absolute inset-0 z-[40] bg-black/65 backdrop-blur-[2px] flex items-center justify-center px-5">
      <div className="relative w-full max-w-[426px] shadow-[0_18px_50px_rgba(0,0,0,0.45)] text-center">
        <img
          src={a('assets/background/paper_bg_dark_l.png')}
          alt="입장 확인 배경"
          className="block w-full h-auto"
          draggable={false}
        />
        <div className="absolute inset-0 p-5">
          <div className="text-white text-[21px] font-medium">정말 입장하시겠습니까?</div>
          <p className="mt-0 text-white/75 text-[13px] leading-relaxed">
            <span className="text-[#efdcaf] font-semibold">{mapName}</span> 입장 시 아래 비용이 소요됩니다.
          </p>
          <div className="mt-2 mb-[20px] flex items-center justify-center gap-2 text-[#877cf1] font-bold text-[14px] -translate-x-[5px]">
            <img src={a('assets/particle/gem.png')} alt="마나" className="w-4 h-4 translate-y-[2px]" draggable={false} />
            <span>-{manaCost}개</span>
          </div>

          <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTapSfx()
              onCancel()
            }}
            data-suppress-tap-sfx="true"
            className="relative h-11 w-[132px] rounded-lg overflow-hidden border border-slate-200/45 bg-[rgba(130,140,150,0.35)] text-white transition-transform duration-100 active:scale-95"
          >
            <img
              src={a('assets/particle/btn_bg_sliver.png')}
              alt="취소 버튼 이미지"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              draggable={false}
            />
            <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide">취소하기</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapSfx()
              onConfirm()
            }}
            data-suppress-tap-sfx="true"
            className="relative h-11 w-[132px] rounded-lg overflow-hidden border border-[#e4cda1]/40 bg-[rgba(132,99,56,0.45)] text-white transition-transform duration-100 active:scale-95"
          >
            <img
              src={a('assets/particle/btn_bg_brown.png')}
              alt="입장하기 버튼 이미지"
              className="absolute inset-0 w-full h-full object-cover opacity-62"
              draggable={false}
            />
            <span className="relative z-[1] inline-block -translate-y-[3px] text-[13px] font-bold tracking-wide">입장하기</span>
          </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function EnergyOverlays({ a, mana, maxMana, manaUpdatedAt, onTick }: {
  a: (p: string) => string
  mana: number
  maxMana: number
  manaUpdatedAt: number | null
  onTick: () => void
}) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now())
      onTick()
    }, 1000)
    return () => clearInterval(id)
  }, [onTick])

  const timeLeftMs = useMemo(() => {
    if (!manaUpdatedAt || mana >= maxMana) return 0
    return Math.max(0, manaUpdatedAt - now)
  }, [manaUpdatedAt, now, mana, maxMana])

  const fmt = (ms: number) => {
    const s = Math.floor(ms / 1000)
    const hh = Math.floor(s / 3600)
    const mm = Math.floor((s % 3600) / 60)
    const ss = s % 60
    const pad = (n: number) => n.toString().padStart(2, '0')
    return hh > 0 ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`
  }

  return (
    <div className="absolute inset-0 z-[8] pointer-events-none select-none">
      {/* count panel - bottom left */}
      <div className="absolute left-4 bottom-12 w-[215px] max-w-[46vw]">
        <div className="relative">
          <img src={a('assets/particle/possiblenum.png')} alt="탐험 가능 횟수 패널" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col justify-center pl-20 pr-8 translate-y-[17px] rotate-[8deg] origin-left">
            <div className="text-[#000000] drop-shadow-sm text-[14px] leading-none opacity-90">탐험 가능 횟수</div>
            <div className="mt-1 flex items-center gap-1">
              <img src={a('assets/particle/gem.png')} alt="마나" className="w-4 h-4" draggable={false} />
              <div className="text-black text-xl font-semibold tracking-wide">{mana}/{maxMana}</div>
            </div>
          </div>
        </div>
      </div>

      {/* timer panel - bottom center */}
      <div className="absolute left-1/2 -translate-x-10 bottom-12 ml-[50px] w-[250px] max-w-[60vw]">
        <div className="relative">
          <img src={a('assets/particle/time.png')} alt="마력 회복 타이머" className="w-full h-auto" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pb-0.9">
            <div className="text-[#EDE7FF] text-[14px] opacity-90">마력 회복까지</div>
            <div className="mt-0.5 text-white text-xl font-semibold tracking-wide">
              {mana >= maxMana ? 'MAX' : fmt(timeLeftMs)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
