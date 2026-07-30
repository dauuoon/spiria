import { motion } from 'framer-motion'

export default function SoftGlow() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full"
        style={{
          background: 'radial-gradient(closest-side, rgba(109,91,208,0.35), rgba(109,91,208,0))',
          filter: 'blur(16px)'
        }}
        animate={{ scale: [0.95, 1.05, 0.95], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[-5rem] right-[-5rem] w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(closest-side, rgba(217,179,108,0.25), rgba(217,179,108,0))',
          filter: 'blur(20px)'
        }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 0.95, 0.7] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Subtle central moonlight pulse */}
      <motion.div
        className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2 ml-[-70px] mt-[70px] w-36 h-36 rounded-full mix-blend-screen"
        style={{
          background: 'radial-gradient(closest-side, rgba(227,189,135,0.28), rgba(227,189,135,0))',
          filter: 'blur(12px)'
        }}
        animate={{ scale: [0.96, 1.04, 0.96], opacity: [0.65, 0.92, 0.65] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}
