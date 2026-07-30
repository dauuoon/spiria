import { useEffect } from 'react'
import LoadingScreen from './components/LoadingScreen'
import MainScreen from './components/MainScreen'
import ExpeditionScreen from './components/ExpeditionScreen'
import CraftScreen from './components/CraftScreen'
import BookScreen from './components/BookScreen'
import InventoryScreen from './components/InventoryScreen'
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
    </div>
  )
}
