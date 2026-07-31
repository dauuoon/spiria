import { useEffect, useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import MainScreen from './components/MainScreen'
import ExpeditionScreen from './components/ExpeditionScreen'
import CraftScreen from './components/CraftScreen'
import BookScreen from './components/BookScreen'
import InventoryScreen from './components/InventoryScreen'
import ProfileScreen from './components/ProfileScreen'
import Map1Screen from './components/Map1Screen'
import Map2Screen from './components/Map2Screen'
import DevRemote from './components/DevRemote'
import BgmPlayer from './components/BgmPlayer'
import TapSfx from './components/TapSfx'
import useAppStore from './lib/store'
import { AnimatePresence, motion } from 'framer-motion'

export default function App() {
  const setProgress = useAppStore(s => s.setProgress)
  const screen = useAppStore(s => s.screen)
  const setScreen = useAppStore(s => s.setScreen)

  // Fake loading progress for now
  useEffect(() => {
    let p = 0
    const id = setInterval(() => {
      p = Math.min(100, p + Math.random() * 8 + 2)
      setProgress(p)
    }, 300)
    return () => clearInterval(id)
  }, [setProgress])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      {/* Mobile viewport (9:20) */}
      <div className="aspect-[9/20] w-[min(45dvh,calc(100vw-2rem))] max-h-[92dvh] rounded-3xl overflow-hidden shadow-soft border border-white/5 relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screen}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {screen === 'loading' ? (
              <LoadingScreen />
            ) : screen === 'expedition' ? (
              <ExpeditionScreen />
            ) : screen === 'book' ? (
              <BookScreen />
            ) : screen === 'craft' ? (
              <CraftScreen />
            ) : screen === 'bag' ? (
              <InventoryScreen />
            ) : screen === 'profile' ? (
              <ProfileScreen />
            ) : screen === 'map1' ? (
              <Map1Screen />
            ) : screen === 'map2' ? (
              <Map2Screen />
            ) : (
              <MainScreen />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* DEV floating remote (temporarily visible in production per request) */}
      <DevRemote screen={screen} onSelect={setScreen} />

      {/* Background music player (DEV toggle visible; plays on user gesture) */}
      <BgmPlayer />

      {/* Global tap SFX (plays on pointerdown / Enter / Space) */}
      <TapSfx />

      {/* Resolution guard overlay (height <= 874px) */}
      <ResolutionOverlay />
    </div>
  )
}

function ResolutionOverlay() {
  const [tooSmall, setTooSmall] = useState(false)
  useEffect(() => {
    const check = () => setTooSmall(window.innerHeight <= 874)
    check()
    window.addEventListener('resize', check)
    window.addEventListener('orientationchange', check)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('orientationchange', check)
    }
  }, [])
  if (!tooSmall) return null
  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-[1px] flex items-center justify-center select-none">
      <div className="text-center px-6">
        <p className="text-white text-[16px] sm:text-[18px] font-semibold tracking-wide">해상도가 제한됩니다.</p>
      </div>
    </div>
  )
}
