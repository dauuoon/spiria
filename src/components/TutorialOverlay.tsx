import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { TUTORIAL_STEPS, type TutorialStep } from '../data/tutorial'
import useAppStore from '../lib/store'

type Props = {
  onComplete: () => void
}

export default function TutorialOverlay({ onComplete }: Props) {
  const a = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`
  const setScreen = useAppStore(s => s.setScreen)
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)
  const [isExiting, setIsExiting] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const step = TUTORIAL_STEPS[currentStep]
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1

  const containerHeight = containerRef.current?.offsetHeight ?? 800
  // Dialog goes to top when target occupies the lower portion of the screen, but not for craft-slots (small circles)
  const dialogAtTop = highlightRect !== null && highlightRect.top > containerHeight * 0.5 && step.target !== 'craft-slots' && step.target !== 'ingredient-grid' && step.target !== 'ingredient-row1'

  // Re-query highlight after screen transition animation completes
  useEffect(() => {
    const queryElement = () => {
      if (step.target === 'none') {
        setHighlightRect(null)
        return
      }

      const selectorMap: Record<string, string> = {
        quest: '[data-tutorial-target="quest"]',
        hint: '[data-tutorial-target="hint"]',
        explore: '.main-dungeon-cta',
        materials: '[data-tutorial-target="materials"]',
        'craft-slots': '[data-tutorial-target="craft-slots"]',
        'ingredient-grid': '[data-tutorial-target="ingredient-grid"]',
        'ingredient-row1': '[data-tutorial-target="ingredient-row1"]',
        workshop: '[data-tutorial-target="workshop"]',
        exchange: '[data-tutorial-target="exchange"]',
        codex: '[data-tutorial-target="codex"]',
      }

      const element = document.querySelector(selectorMap[step.target] ?? '') as HTMLElement | null
      if (element && containerRef.current) {
        const elRect = element.getBoundingClientRect()
        const containerRect = containerRef.current.getBoundingClientRect()
        // For ingredient-row1: expand width to full grid row using parent grid element
        const gridRect = step.target === 'ingredient-row1'
          ? (element.parentElement?.getBoundingClientRect() ?? elRect)
          : elRect
        setHighlightRect({
          left: gridRect.left - containerRect.left,
          top: elRect.top - containerRect.top,
          right: gridRect.right - containerRect.left,
          width: gridRect.width,
          height: elRect.height,
          bottom: elRect.bottom - containerRect.top,
          x: gridRect.x - containerRect.x,
          y: elRect.y - containerRect.y,
          toJSON: elRect.toJSON.bind(elRect),
        })
      } else {
        setHighlightRect(null)
      }
    }

    // Delay to allow AnimatePresence screen transition to finish
    const timer = setTimeout(queryElement, 400)
    window.addEventListener('resize', queryElement)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', queryElement)
    }
  }, [currentStep])

  const handleNext = () => {
    if (isLastStep) {
      setIsExiting(true)
      // Wait for exit animation, then complete
      setTimeout(() => {
        onComplete()
      }, 600)
    } else {
      const nextStep = currentStep + 1
      const nextStepData = TUTORIAL_STEPS[nextStep]
      
      // If the next step requires a different screen, navigate there
      if (nextStepData && nextStepData.screen !== step.screen) {
        setScreen(nextStepData.screen)
      }
      
      setCurrentStep(nextStep)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      const prevStepData = TUTORIAL_STEPS[prevStep]
      
      // If the previous step requires a different screen, navigate there
      if (prevStepData && prevStepData.screen !== step.screen) {
        setScreen(prevStepData.screen)
      }
      
      setCurrentStep(prevStep)
    }
  }

  return (
    <div ref={containerRef} className="absolute inset-0 z-[100] pointer-events-none">
      {/* Dark overlay with spotlight cutout */}
      {highlightRect && !isExiting ? (
        // Spotlight: transparent cutout with outward box-shadow creating the dark overlay
        <motion.div
          key="spotlight"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: 0.3 }}
          className="absolute pointer-events-auto"
          style={{
            left: Math.max(0, highlightRect.left - 10),
            top: highlightRect.top - 10,
            width: Math.min(containerRef.current?.offsetWidth ?? window.innerWidth, highlightRect.right + 10) - Math.max(0, highlightRect.left - 10),
            height: highlightRect.height + 20,
            borderRadius: '10px',
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(255,223,88,0.9), 0 0 24px 8px rgba(255,223,88,0.55)',
          }}
        />
      ) : (
        // Full dark overlay when no spotlight target
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: isExiting ? 0 : 1 }}
          transition={{ duration: isExiting ? 0.5 : 0.3 }}
          className="absolute inset-0 bg-black/70 pointer-events-auto"
        />
      )}

      {/* Spirit Guardian - sequential image animation with actual spirit motion structure */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 0.3 : 1,
          y: isExiting ? 120 : 0,
        }}
        transition={{ duration: isExiting ? 0.6 : 0.6, ease: isExiting ? 'easeIn' : 'easeOut' }}
        className="absolute pointer-events-none"
        style={{
          left: 'calc(50% - 60px)',
          top: '50%',
        }}
      >
        {/* Glow aura - pulse effect like spirits */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full"
          animate={{ scale: [1, 1.06, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 3.4, ease: 'easeInOut', repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle, rgba(187,152,255,0.3) 0%, rgba(187,152,255,0.1) 54%, rgba(187,152,255,0) 74%)',
          }}
        />

        {/* Main spirit container with bobbing motion */}
        <motion.div
          className="relative w-32 h-32"
          animate={{ y: [20, 17, 20] }}
          transition={{ duration: 2.8, ease: 'easeInOut', repeat: Infinity }}
        >
          {/* Image 1 - tu1.png */}
          <motion.img
            src={a('assets/particle/tu1.png')}
            alt="spirit"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
            draggable={false}
            animate={{ opacity: [1, 0.35, 0.35, 0.35, 1] }}
            transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
          />

          {/* Image 2 - tu2.png */}
          <motion.img
            src={a('assets/particle/tu2.png')}
            alt="spirit"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
            draggable={false}
            animate={{ opacity: [0.35, 1, 0.35, 1, 0.35] }}
            transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
          />

          {/* Image 3 - tu3.png */}
          <motion.img
            src={a('assets/particle/tu3.png')}
            alt="spirit"
            className="absolute inset-0 w-full h-full object-contain drop-shadow-lg"
            draggable={false}
            animate={{ opacity: [0.35, 0.35, 1, 0.35, 0.35] }}
            transition={{ duration: 2.8, ease: 'linear', repeat: Infinity, times: [0, 0.25, 0.5, 0.75, 1] }}
          />
        </motion.div>
      </motion.div>

      {/* Dialog box — flips to top when target is in lower half */}
      <motion.div
        initial={{ opacity: 0, y: dialogAtTop ? -20 : 20 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          y: isExiting ? (dialogAtTop ? -40 : 40) : 0,
        }}
        transition={{ duration: isExiting ? 0.4 : 0.4, delay: isExiting ? 0 : 0.3 }}
        className={`absolute left-0 right-0 pointer-events-auto mx-4 max-w-md mx-auto ${
          dialogAtTop ? 'top-0 mt-6' : 'bottom-0 mb-6'
        }`}
      >
        {/* Paper-like dialog box with similar style to existing UI */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Background texture */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#F8F5FF] to-[#F5EEFF] shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.6)]" />
          
          {/* Content */}
          <div className="relative px-6 py-6 md:px-8 md:py-7">
            {/* Text content */}
            <p className="text-[#4A3A6F] text-center text-base md:text-lg leading-relaxed font-medium whitespace-pre-line">
              {step.text}
            </p>

            {/* Button group */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {/* Previous button */}
              <motion.button
                type="button"
                whileHover={currentStep > 0 && !isExiting ? { scale: 1.05 } : {}}
                whileTap={currentStep > 0 && !isExiting ? { scale: 0.95 } : {}}
                onClick={handlePrevious}
                disabled={isExiting || currentStep === 0}
                className={`px-5 py-2 rounded-lg font-bold text-sm md:text-base transition-shadow ${
                  currentStep === 0
                    ? 'bg-gradient-to-b from-[#D0D0D8] to-[#C0C0C8] text-gray-500 shadow-[0_4px_12px_rgba(150,150,160,0.2)] opacity-60'
                    : 'bg-gradient-to-b from-[#9B8FCC] to-[#8B7FBC] text-white shadow-[0_4px_12px_rgba(91,79,140,0.4)] hover:shadow-[0_6px_16px_rgba(91,79,140,0.5)]'
                }`}
              >
                {'< 이전'}
              </motion.button>

              {/* Next button */}
              <motion.button
                type="button"
                whileHover={!isExiting ? { scale: 1.05 } : {}}
                whileTap={!isExiting ? { scale: 0.95 } : {}}
                onClick={handleNext}
                disabled={isExiting}
                className="px-5 py-2 rounded-lg bg-gradient-to-b from-[#6B5F9C] to-[#5B4F8C] text-white font-bold text-sm md:text-base shadow-[0_4px_12px_rgba(91,79,140,0.5)] hover:shadow-[0_6px_16px_rgba(91,79,140,0.6)] transition-shadow disabled:opacity-60"
              >
                {isLastStep ? '시작하기' : '다음 >'}
              </motion.button>
            </div>

            {/* Step indicator */}
            <div className="mt-7 flex items-center justify-center gap-1.5">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-[#5B4F8C] w-6'
                      : 'bg-[#9B8FCC] w-1.5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
