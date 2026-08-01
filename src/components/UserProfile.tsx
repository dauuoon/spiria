import { motion } from 'framer-motion'
import useAppStore from '../lib/store'
import { formatLevelNumber, getLevelTitle } from '../data/levelTitles'
import { EXP_TO_NEXT, LEVEL_COLORS } from '../data/levels'

export type UserProfileProps = {
  name?: string
  level?: number
  xp?: number
  maxXp?: number
  avatar?: string // relative to BASE_URL or absolute
}

export default function UserProfile({
  name = '정령 소환사',
  level,
  xp,
  maxXp,
  avatar,
}: UserProfileProps) {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const storeLevel = useAppStore(s => s.level)
  const storeExpInLevel = useAppStore(s => s.expInLevel)
  const resolvedLevel = level ?? storeLevel
  const resolvedXp = xp ?? storeExpInLevel
  const expToNext = EXP_TO_NEXT[resolvedLevel ?? 1] ?? 0
  const resolvedMaxXp = maxXp ?? Math.max(1, expToNext)
  const pct = Math.min(100, Math.max(0, Math.round((resolvedXp / resolvedMaxXp) * 100)))
  const levelColor = LEVEL_COLORS[resolvedLevel ?? 1] || '#A894FF'
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
            <img
              src={a('assets/particle/default_profile.png')}
              alt="default profile"
              className="w-full h-full object-cover"
              draggable={false}
            />
          )}
        </motion.button>

        {/* Name + XP */}
        <div className="min-w-[180px] max-w-[64vw]">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[#ac8a7a] text-[16px] leading-tight font-semibold truncate">{getLevelTitle(resolvedLevel)}</h2>
          </div>

          {/* XP level indicator + bar (reduced size, bar overlaps under level) */}
          <div className="mt-1.5 flex items-center gap-1">
            <div className="relative z-10 flex items-center justify-center w-[22px] h-[22px] rounded-full text-black text-[12px] font-extrabold select-none"
                 style={{ background: levelColor, boxShadow: `0 2px 10px ${levelColor}55` }}>{formatLevelNumber(resolvedLevel)}</div>
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
