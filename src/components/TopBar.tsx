import { motion } from 'framer-motion'
import useAppStore from '../lib/store'

type Props = {
  onBack?: () => void
  title?: string
}

export default function TopBar({ onBack, title }: Props) {
  const setScreen = useAppStore((s) => s.setScreen)
  const energy = useAppStore((s) => s.energy)
  const coins = useAppStore((s) => s.coins)
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`

  const handleBack = onBack ?? (() => setScreen('main'))

  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          className="relative inline-flex items-center justify-center w-[48px] h-[48px] p-0 bg-transparent border-0 text-white shadow-none"
          aria-label="뒤로"
        >
          <span aria-hidden className="pointer-events-none absolute -inset-1 rounded-full bg-[radial-gradient(closest-side,rgba(227,189,135,0.45),rgba(227,189,135,0)_75%)] blur-[12px]" />
          <img src={a('assets/particle/back.png')} alt="뒤로" className="w-[48px] h-[48px] object-contain" draggable={false} />
        </motion.button>
        {title && (
          <div className="text-[#d5bd8a] text-[16px] font-extrabold tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.35)]">
            {title}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
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
          <span className="text-white/90 text-[14px] font-semibold tabular-nums">{coins.toLocaleString()}</span>
        </motion.button>

        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-[rgba(10,12,30,0.55)] border border-white/10 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_6px_24px_rgba(0,0,0,0.25)]"
          aria-label="보석"
        >
          <span className="relative inline-flex w-5 h-5 items-center justify-center">
            <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(155,203,255,0.5),rgba(155,203,255,0)_70%)] blur-[6px]" />
            <img src={a('assets/particle/gem.png')} alt="gem" className="relative w-5 h-5 drop-shadow-[0_0_8px_rgba(155,203,255,0.35)]" />
          </span>
          <span className="text-white/90 text-[14px] font-semibold tabular-nums">{energy}</span>
        </motion.button>
      </div>
    </div>
  )
}
