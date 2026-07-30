import { useEffect, useState } from 'react'
import LoadingScreen from './components/LoadingScreen'
import MainScreen from './components/MainScreen'
import DevRemote from './components/DevRemote'
import BgmPlayer from './components/BgmPlayer'
import useAppStore from './lib/store'

export default function App() {
  const setProgress = useAppStore(s => s.setProgress)
  const [screen, setScreen] = useState<'loading' | 'main'>('loading')

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
        {screen === 'loading' ? (
          <LoadingScreen />
        ) : (
          <MainScreen />
        )}
      </div>

      {/* DEV-only floating remote outside the mobile frame */}
      {import.meta.env.DEV && (
        <DevRemote screen={screen} onSelect={setScreen} />
      )}

      {/* Background music player (DEV toggle visible; plays on user gesture) */}
      <BgmPlayer />
    </div>
  )
}
