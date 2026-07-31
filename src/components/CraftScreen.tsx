import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import SoftGlow from './SoftGlow'
import ParticlesCanvas from './ParticlesCanvas'
import TopBar from './TopBar'

// Inventory counts are TBD; UI focuses on selection layout (3x4 grid)
// When counts become available, wire them from store/state.

export default function CraftScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [selected, setSelected] = useState<string[]>([])
  const [questIndex, setQuestIndex] = useState(0)
  const bubblingRef = useRef<HTMLAudioElement | null>(null)
  const PAPER_SFX_PATH = 'assets/sound/paper.mp3'
  const BUBBLING_SFX_PATH = 'assets/sound/bubbling.mp3'

  const questPages = [
    '밤 안개 속에서 길을 잃은 이들을 위해, 은은하게 빛나는 등불이 되어줄 정령이 필요해요.',
    '깊은 숲의 균열에서 새어 나오는 냉기를 잠재울 수 있는 정령이 필요해요.',
    '메마른 들판에 다시 숨결이 돌 수 있도록 따뜻한 기운의 정령을 빚어 주세요.',
  ] as const

  const craftMaterials = [
    { id: 'flower', name: '꽃' },
    { id: 'leaf', name: '잎' },
    { id: 'soil', name: '흙' },
    { id: 'water', name: '물' },
    { id: 'fire', name: '불' },
    { id: 'wind', name: '바람' },
    { id: 'star', name: '별' },
    { id: 'moon', name: '달' },
    { id: 'light', name: '태양' },
    { id: 'magic', name: '마법' },
    { id: 'ether', name: '에테르' },
    { id: 'gem', name: '보석' },
  ] as const

  const canCraft = selected.length === 3
  const matItems = craftMaterials

  const slots = useMemo(() => [0, 1, 2].map((i) => selected[i] ?? null), [selected])

  const toggle = (id: string) => {
    setSelected((cur) => {
      const has = cur.includes(id)
      if (has) return cur.filter((x) => x !== id)
      if (cur.length >= 3) return cur // limit 3
      return [...cur, id]
    })
  }

  const resetSelected = () => setSelected([])

  const playPaperSfx = () => {
    try {
      const audio = new Audio(a(PAPER_SFX_PATH))
      audio.volume = 0.85
      void audio.play()
    } catch {
      // ignore audio failures
    }
  }

  const goPrevQuest = () => {
    playPaperSfx()
    setQuestIndex((i) => (i - 1 + questPages.length) % questPages.length)
  }

  const goNextQuest = () => {
    playPaperSfx()
    setQuestIndex((i) => (i + 1) % questPages.length)
  }

  useEffect(() => {
    const audio = new Audio(`${import.meta.env.BASE_URL}${BUBBLING_SFX_PATH}`)
    audio.loop = true
    audio.volume = 0.32
    bubblingRef.current = audio

    const tryPlay = async () => {
      try {
        await audio.play()
      } catch {
        const resume = async () => {
          try {
            await audio.play()
          } catch {
            // ignore audio failures
          } finally {
            window.removeEventListener('pointerdown', resume)
            window.removeEventListener('keydown', resume)
          }
        }
        window.addEventListener('pointerdown', resume, { once: true })
        window.addEventListener('keydown', resume, { once: true })
      }
    }

    void tryPlay()

    return () => {
      audio.pause()
      audio.src = ''
      bubblingRef.current = null
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/make_back.png')}
        alt="Craft background"
        className="absolute inset-0 w-full h-full object-cover"
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

      {/* subtle particles like main */}
      <div className="absolute inset-0 z-[3] opacity-60 pointer-events-none">
        <ParticlesCanvas density={0.00007} baseAlpha={0.2} swingAlpha={0.7} sizeScale={1.35} />
      </div>

      {/* quest letter + slots */}
      <div className="absolute inset-0 z-[6] p-4 pt-16">
        {/* quest letter panel */}
        <div className="absolute left-[-11px] top-[68px] w-[calc(68%+6px)] max-w-[330px] text-[rgb(55,42,36)] shadow-[0_12px_40px_rgba(0,0,0,0.35)] text-center -rotate-[2deg]">
          <img
            src={a('assets/background/paper_bg_light_l.png')}
            alt="의뢰서 배경"
            className="block w-full h-auto object-contain pointer-events-none select-none"
            draggable={false}
          />
          <div className="absolute inset-0 px-4 py-3 translate-y-[8px]">
            <div className="relative z-[1] mb-1 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={goPrevQuest}
                className="w-5 h-5 -translate-y-[3px] rounded border border-[#d4bb8e] bg-[#41333d] text-[#d4bb8e] text-[15px] font-extrabold leading-none flex items-center justify-center"
                aria-label="이전 의뢰"
              >
                {'<'}
              </button>
              <div className="text-[14px] font-extrabold">정령 의뢰서 ({questIndex + 1}/{questPages.length})</div>
              <button
                type="button"
                onClick={goNextQuest}
                className="w-5 h-5 -translate-y-[3px] rounded border border-[#d4bb8e] bg-[#41333d] text-[#d4bb8e] text-[15px] font-extrabold leading-none flex items-center justify-center"
                aria-label="다음 의뢰"
              >
                {'>'}
              </button>
            </div>
            <div className="relative z-[1] h-[1px] bg-[rgba(0,0,0,0.1)] my-2" />
            <p className="relative z-[1] text-[14px] leading-5 whitespace-pre-line [word-break:keep-all]">
              {questPages[questIndex]}
            </p>
            <div className="relative z-[1] mt-2 text-[11px] text-[rgb(110,90,80)]">- 별빛 마을의 여행자 -</div>
          </div>
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94, y: 1 }}
          onClick={() => setScreen('expedition')}
          className="absolute right-[-18px] top-[34px] w-[156px] h-[156px] z-[7] rotate-[7deg]"
          aria-label="탐험 페이지 이동"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-3 rounded-full bg-[radial-gradient(closest-side,rgba(255,223,88,0.72),rgba(255,223,88,0)_72%)] blur-[16px]"
          />
          <motion.img
            src={a('assets/particle/ex_go.png')}
            alt="탐험 이동"
            className="relative w-full h-full object-contain drop-shadow-[0_0_20px_rgba(8,10,22,0.6)] origin-top"
            animate={{ rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
            draggable={false}
          />
        </motion.button>

        {/* 재료 12개 (4x3) */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[43%] translate-y-[35px] relative w-[390px]">
          <button
            type="button"
            onClick={resetSelected}
            className="absolute right-0 -top-[40px] w-8 h-8 rounded-full overflow-hidden border-[2px] border-[#caa56e]/70 shadow-[0_8px_20px_rgba(0,0,0,0.35)] active:scale-95"
            aria-label="선택 재료 초기화"
          >
            <img
              src={a('assets/particle/btn_bg_brown.png')}
              alt="초기화 버튼 배경"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            <span className="relative z-[1] inline-block -translate-y-[2px] text-[#d4bb8e] text-[14px] font-extrabold leading-none">↺</span>
          </button>

          <div className="grid grid-cols-4 gap-2.5">
              {matItems.map((it) => {
                const active = selected.includes(it.id)
                return (
                  <motion.button
                    key={it.id}
                    type="button"
                    whileTap={{ scale: 0.9, y: 3, filter: 'brightness(0.82)' }}
                    onClick={() => toggle(it.id)}
                    className="relative p-0 w-[90px] h-[90px] overflow-hidden transition-transform"
                  >
                    {active && (
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-2 z-0 rounded-full bg-[radial-gradient(closest-side,rgba(183,175,225,0.5),rgba(183,175,225,0)_72%)] blur-[10px] animate-pulse"
                      />
                    )}
                    <img
                      src={a(`assets/item/in_${it.id}_${active ? 'on' : 'off'}.png`)}
                      alt={it.name}
                      className="relative z-10 w-full h-full object-cover"
                      draggable={false}
                    />
                    <span className="absolute z-20 left-1/2 bottom-[4px] -translate-x-1/2 text-[14px] font-semibold text-[#ebc8ab] drop-shadow-[0_2px_5px_rgba(0,0,0,0.7)] pointer-events-none select-none">
                      {it.name}
                    </span>
                    {active && (
                      <span className="absolute z-30 -top-[2px] right-[1px] w-[23px] h-[23px] rounded-full bg-[#A894FF] text-[14px] text-black font-black flex items-center justify-center">{selected.indexOf(it.id) + 1}</span>
                    )}
                  </motion.button>
                )
              })}
          </div>
        </div>

        {/* 조합식 + 정령빚기 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[74%] w-[92%] flex items-stretch gap-5 translate-y-[110px]">
          <div className="flex-1 rounded-2xl bg-[rgba(10,12,30,0.50)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),_0_16px_32px_rgba(0,0,0,0.45)] px-4 h-[76px] flex items-center justify-center gap-4">
            {slots.map((s, i) => (
              <div key={i} className="relative w-12 h-12 rounded-full border border-white/15 bg-black/30 flex items-center justify-center text-white/70">
                {s ? (
                  <span className="text-[10px] font-semibold text-center leading-tight px-1">{craftMaterials.find((it) => it.id === s)?.name}</span>
                ) : (
                  <span className="text-[18px]">+</span>
                )}
              </div>
            ))}
            <div className="text-white/60 text-[18px]">→</div>
            <div className="w-12 h-12 rounded-xl bg-[rgba(100,80,160,0.3)] border border-white/15 flex items-center justify-center text-white/80">?</div>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            disabled={!canCraft}
            className={`relative w-[76px] h-[76px] rounded-2xl overflow-hidden border-[2px] border-[#a894ff] text-white ${canCraft ? 'cursor-pointer shadow-[0_0_10px_rgba(168,148,255,0.35)]' : 'opacity-60 cursor-not-allowed'}`}
            onClick={() => alert('프로토타입: 정령을 빚었습니다!')}
          >
            <img
              src={a('assets/particle/btn_bg_purple.png')}
              alt="정령 빚기 버튼 배경"
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
            {canCraft && (
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,0.22)_48%,transparent_72%)] animate-pulse"
              />
            )}
            <span className="relative z-[1] whitespace-pre-line text-[16px] font-extrabold leading-[1.05] text-[#b7afe1]">
              {'정령\n빚기'}
            </span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
