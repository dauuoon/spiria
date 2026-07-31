import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import { formatLevelNumber, getLevelTitle } from '../data/levelTitles'
import { LEVEL_COLORS } from '../data/levels'

export type UserProfileProps = {
  name?: string
  level?: number
  xp?: number
  maxXp?: number
  avatar?: string // relative to BASE_URL or absolute
}

export default function UserProfile({
  name = '정령 소환사',
  level = 12,
  xp = 1250,
  maxXp = 3000,
  avatar,
}: UserProfileProps) {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const pct = Math.min(100, Math.max(0, Math.round((xp / maxXp) * 100)))
  const levelColor = LEVEL_COLORS[level ?? 1] || '#A894FF'
  const setScreen = useAppStore(s => s.setScreen)

  return (
    <div className="absolute top-[32px] left-[16px] z-10 pointer-events-auto">
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setScreen('profile')}
          aria-label="프로필 열기"
          title="프로필 열기"
          className="relative w-[52px] h-[52px] rounded-full overflow-hidden border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.35)] cursor-pointer"
        >
          {avatar ? (
            <img
              src={avatar.startsWith('http') ? avatar : a(avatar)}
              alt="avatar"
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,226,188,0.15),rgba(70,60,130,0.5)_60%,rgba(10,12,30,0.8))]" />
          )}
        </motion.button>

        {/* Name + XP */}
        <div className="min-w-[180px] max-w-[64vw]">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[#ac8a7a] text-[16px] leading-tight font-semibold truncate">{getLevelTitle(level)}</h2>
          </div>

          {/* XP level indicator + bar (reduced size, bar overlaps under level) */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="relative z-10 flex items-center justify-center w-[22px] h-[22px] rounded-full text-black text-[12px] font-extrabold select-none"
                 style={{ background: levelColor, boxShadow: `0 2px 10px ${levelColor}55` }}>{formatLevelNumber(level)}</div>
            <div className="relative -ml-[7px] h-[7px] w-[min(18vw,70px)] rounded-full bg-black/35 shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_8px_20px_rgba(0,0,0,0.35)]">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 70, damping: 18 }}
                style={{ background: levelColor, boxShadow: `0 0 10px ${levelColor}66` }}
              />
              {/* highlight removed per request */}
            </div>
          </div>
          {/* XP text removed on main per request */}
        </div>
      </div>
    </div>
  )
}
