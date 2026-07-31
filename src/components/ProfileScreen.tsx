import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import TopBar from './TopBar'
import { formatLevelNumber, getLevelTitle } from '../data/levelTitles'
import { LEVEL_COLORS } from '../data/levels'

const PROFILE_NICKNAME_STORAGE_KEY = 'spiria.profile.nickname' as const
const DEFAULT_NICKNAME = '오늘도 가보자'

function getProfileIllustrationSrc(level: number): string {
  const lv = Math.max(1, Math.min(99, Math.floor(level)))

  if (lv >= 99) return 'assets/level/lv99.png'
  if (lv >= 90) return 'assets/level/lv90.png'
  if (lv >= 80) return 'assets/level/lv80.png'
  if (lv >= 70) return 'assets/level/lv70.png'
  if (lv >= 60) return 'assets/level/lv60.png'
  if (lv >= 50) return 'assets/level/lv50.png'
  if (lv >= 40) return 'assets/level/lv40.png'
  if (lv >= 30) return 'assets/level/lv30.png'
  if (lv >= 20) return 'assets/level/lv20.png'
  if (lv >= 10) return 'assets/level/lv10.png'
  return 'assets/level/lv1.png'
}

export default function ProfileScreen() {
  const setScreen = useAppStore(s => s.setScreen)
  const level = useAppStore(s => s.level)
  const inventory = useAppStore(s => s.inventory)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const [nickname, setNickname] = useState(() => {
    try {
      const raw = localStorage.getItem(PROFILE_NICKNAME_STORAGE_KEY)
      const parsed = raw ? JSON.parse(raw) : null
      const saved = typeof parsed === 'string' ? parsed.trim() : ''
      return saved || DEFAULT_NICKNAME
    } catch {
      return DEFAULT_NICKNAME
    }
  })
  const [isNicknameModalOpen, setIsNicknameModalOpen] = useState(false)
  const [nicknameDraft, setNicknameDraft] = useState(nickname)
  const [glowPulseKey, setGlowPulseKey] = useState(0)
  const xp = 1250
  const maxXp = 3000
  const pct = Math.min(100, Math.max(0, Math.round((xp / maxXp) * 100)))
  const levelTitle = getLevelTitle(level)
  const illustrationSrc = a(getProfileIllustrationSrc(level))
  const levelColor = LEVEL_COLORS[level] || '#A894FF'
  const discoveredSpiritCount = 6
  const totalSpiritCount = 220
  const totalItemCount = useMemo(() => Object.values(inventory).reduce((sum, count) => sum + Math.max(0, count), 0), [inventory])

  const openNicknameModal = () => {
    setNicknameDraft(nickname)
    setIsNicknameModalOpen(true)
  }

  const saveNickname = () => {
    const next = nicknameDraft.trim().slice(0, 14) || DEFAULT_NICKNAME
    setNickname(next)
    try {
      localStorage.setItem(PROFILE_NICKNAME_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
    setIsNicknameModalOpen(false)
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* background */}
      <img
        src={a('assets/background/profile_back.png')}
        alt="Profile background"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* top bar */}
      <TopBar onBack={() => setScreen('main')} />

      <div className="absolute inset-0 z-[6] px-6 pt-[112px] pb-10 flex flex-col items-center justify-start text-center translate-y-[20px]">
        <div className="w-full max-w-[440px] flex flex-col items-center">
          <div className="flex items-center justify-center gap-2">
            <div
              className="text-[24px] font-bold tracking-[0.02em] drop-shadow-[0_4px_14px_rgba(0,0,0,0.34)]"
              style={{ color: levelColor }}
            >
              {nickname}
            </div>
            <button
              type="button"
              onClick={openNicknameModal}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full border border-white/20 bg-[rgba(8,10,24,0.5)] text-white/90 active:scale-95"
              aria-label="닉네임 수정"
              title="닉네임 수정"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
              </svg>
            </button>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <div
              className="relative z-10 translate-x-[5px] flex items-center justify-center w-[30px] h-[30px] rounded-full text-black text-[14px] font-extrabold select-none"
              style={{ background: levelColor, boxShadow: `0 2px 12px ${levelColor}66` }}
            >
              {formatLevelNumber(level)}
            </div>
            <div className="relative -ml-[8px] h-[10px] w-[min(42vw,172px)] rounded-full bg-black/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.35)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ width: `${pct}%`, background: levelColor, boxShadow: `0 0 10px ${levelColor}66` }}
              />
            </div>
          </div>

          <div className="mt-2 text-[13px] font-semibold text-[#e7d3a4] drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            현재 경험치 {xp.toLocaleString()} / {maxXp.toLocaleString()}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setGlowPulseKey((k) => k + 1)}
            className="relative mt-7 w-[55vw] max-w-[284px] aspect-square"
            aria-label="프로필 일러스트"
          >
            <motion.div
              aria-hidden="true"
              className="absolute inset-[9%] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${levelColor}99 0%, ${levelColor}22 52%, rgba(0,0,0,0) 78%)`,
                filter: 'blur(11px)',
              }}
              animate={{ opacity: [0.42, 0.82, 0.42], scale: [0.94, 1.04, 0.94] }}
              transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              key={glowPulseKey}
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: [0, 0.72, 0], scale: [0.82, 1, 1.1] }}
              transition={{ duration: 0.62, ease: 'easeOut' }}
              className="absolute inset-[7%] rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${levelColor}AA 0%, ${levelColor}33 48%, rgba(0,0,0,0) 80%)`,
                filter: 'blur(8px)',
              }}
            />
            <img
              src={illustrationSrc}
              alt={`${levelTitle} 일러스트`}
              className="relative z-[1] w-full h-full object-contain drop-shadow-[0_22px_48px_rgba(0,0,0,0.42)]"
              draggable={false}
            />
          </motion.button>

          <div className="mt-7 w-[calc(100%+30px)] -mx-[15px] grid grid-cols-2 gap-4">
            <div className="relative h-[130px]">
              <img
                src={a('assets/background/profile_box_bg.png')}
                alt="정령 도감 박스 배경"
                className="absolute left-1/2 top-1/2 w-[112%] h-[112%] -translate-x-1/2 -translate-y-1/2 object-contain rotate-0 pointer-events-none"
                draggable={false}
              />
              <div className="relative z-[1] h-full flex flex-col items-center justify-center text-center px-2 pointer-events-none">
                <div className="text-[15px] font-bold text-[#efd8ab]">정령 도감</div>
                <div className="mt-1 text-[12px] font-semibold text-[#e8dcbc]/90">({discoveredSpiritCount} / {totalSpiritCount})</div>
              </div>
            </div>

            <div className="relative h-[130px]">
              <img
                src={a('assets/background/profile_box_bg.png')}
                alt="아이템 박스 배경"
                className="absolute left-1/2 top-1/2 w-[112%] h-[112%] -translate-x-1/2 -translate-y-1/2 object-contain rotate-0 pointer-events-none"
                draggable={false}
              />
              <div className="relative z-[1] h-full flex flex-col items-center justify-center text-center px-2 pointer-events-none">
                <div className="text-[15px] font-bold text-[#efd8ab]">아이템</div>
                <div className="mt-1 text-[12px] font-semibold text-[#e8dcbc]/90">({totalItemCount})</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {isNicknameModalOpen && (
        <div className="absolute inset-0 z-[40] bg-black/65 backdrop-blur-[2px] flex items-center justify-center px-6">
          <div className="w-full max-w-[360px] rounded-2xl border border-white/15 bg-[rgba(12,14,34,0.96)] p-5 shadow-[0_18px_46px_rgba(0,0,0,0.48)]">
            <div className="text-[18px] font-extrabold text-[#efd8ab]">닉네임 수정</div>
            <input
              autoFocus
              value={nicknameDraft}
              maxLength={14}
              onChange={(e) => setNicknameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveNickname()
              }}
              className="mt-3 w-full h-11 rounded-lg border border-white/20 bg-black/30 px-3 text-white outline-none focus:border-[#c8b08c]"
              placeholder="닉네임을 입력하세요"
            />
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsNicknameModalOpen(false)}
                className="h-10 px-4 rounded-lg border border-white/15 bg-white/5 text-white/85 font-semibold active:scale-95"
              >
                취소
              </button>
              <button
                type="button"
                onClick={saveNickname}
                className="h-10 px-4 rounded-lg border border-[#e4cda1]/45 bg-[rgba(132,99,56,0.48)] text-[#f0dfbe] font-semibold active:scale-95"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
