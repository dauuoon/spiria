import { useMemo } from 'react'
import { motion } from 'framer-motion'
import ParticlesCanvas from './ParticlesCanvas'
import SoftGlow from './SoftGlow'
import useAppStore from '../lib/store'

export default function LoadingScreen() {
  const progress = useAppStore(s => s.progress)
  const setScreen = useAppStore(s => s.setScreen)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const tips = useMemo(
    () => [
      '탐험은 재료를 모으고, 조합은 이야기를 만듭니다.',
      '정령은 기억보다 감정을 더 오래 간직합니다.',
      '새로운 조합을 많이 시도할수록 도감이 빠르게 채워집니다.',
      '모든 정령은 누군가의 작은 소원에서 태어났습니다.',
      '가장 평범한 재료 세 개가 가장 특별한 정령을 만들기도 합니다.',
      '의뢰서의 문장을 자세히 읽어보세요.',
      '같은 재료라도 조합에 따라 전혀 다른 정령이 탄생할 수 있습니다.'
    ],
    []
  )
  const selectedTip = useMemo(() => tips[Math.floor(Math.random() * tips.length)], [tips])
  const done = Math.floor(progress) >= 100

  return (
    <div className="relative w-full h-full">
      {/* background image */}
      <img
        src={a('assets/background/loading.png')}
        alt="Loading background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* dim overlay */}
      <div className="absolute inset-0 bg-black/30" />

      {/* soft animated glow */}
      <SoftGlow />

      {/* particles */}
      <ParticlesCanvas density={0.00005} />

      {/* content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-6">
        <motion.img
          src={a('assets/logo/logo.png')}
          alt="Spiria logo"
          className="w-[17rem] -mt-[410px] drop-shadow-[0_6px_24px_rgba(217,179,108,0.35)]"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        <motion.div
          className="mt-4 text-white/90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-sm text-[#E3BD87] font-medium">소원이 깃드는 따뜻한 정령의 이야기</p>
        </motion.div>

        {/* Tip above the loading bar */}
        <motion.div
          className="absolute bottom-[94px] left-0 right-0 mx-auto text-[11px] text-white/60"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          Tip: {selectedTip}
        </motion.div>

        {/* Progress bar below Tip */}
        <div className="absolute bottom-[54px] left-0 right-0 mx-auto w-64 max-w-[75%]">
          <div className="flex items-center justify-center gap-2">
            {/* Wrapper to position icon outside of clipped bar */}
            <div className="relative flex-1">
              {/* Bar container (clip shine only) */}
              <div className="h-2 rounded-full bg-white/15 overflow-hidden">
                {/* Filled part */}
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary-600 to-gold relative overflow-hidden shadow-[0_0_12px_2px_rgba(217,179,108,0.4)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(100, Math.floor(progress))}%` }}
                  transition={{ type: 'spring', stiffness: 60, damping: 16 }}
                >
                  {/* Shine sweep (hidden when progress is tiny) */}
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 w-16 -skew-x-12"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))'
                    }}
                    initial={{ left: '-10%' }}
                    animate={{ left: '110%', opacity: progress > 4 ? 1 : 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </motion.div>
              </div>

              {/* Leading icon follows the fill head, placed above bar */}
              <motion.img
                src={a('assets/particle/light.png')}
                alt="loading icon"
                className="absolute top-1/2 -translate-y-1/2 mt-[1px] -translate-x-1/2 w-6 h-6 pointer-events-none drop-shadow-[0_0_12px_rgba(227,189,135,0.85)]"
                initial={{ left: '0%' }}
                animate={{ left: `${Math.min(100, Math.floor(progress))}%`, opacity: progress > 0 ? 1 : 0 }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
              />
            </div>
          </div>

          <div className="mt-2 text-xs text-white/70 text-center">
            {Math.min(100, Math.floor(progress))}%
          </div>
        </div>
      </div>
      {/* start overlay when done */}
      {done && (
        <div
          className="absolute inset-0 z-20"
          onClick={() => setScreen('main')}
          onPointerDown={() => setScreen('main')}
          role="button"
          aria-label="터치하여 시작하기"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="text-white/85 text-[12px] tracking-wide"
              animate={{ opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            >
              터치하여 시작하기
            </motion.div>
          </div>
        </div>
      )}
    </div>
  )
}
