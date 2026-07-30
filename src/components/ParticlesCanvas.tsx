import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

export default function ParticlesCanvas({ density = 0.00006 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null)
  const anim = useRef<number>()

  useEffect(() => {
    const canvas = ref.current!
    const ctx = canvas.getContext('2d')!
    let particles: Particle[] = []

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const { clientWidth, clientHeight } = canvas
      canvas.width = Math.floor(clientWidth * dpr)
      canvas.height = Math.floor(clientHeight * dpr)
      ctx.scale(dpr, dpr)

      const count = Math.floor(clientWidth * clientHeight * density)
      particles = Array.from({ length: count }, () => spawn(clientWidth, clientHeight))
    }

    const spawn = (w: number, h: number): Particle => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      size: Math.random() * 0.9 + 0.4,
      life: 0,
      maxLife: 260 + Math.random() * 240,
    })

    let w = 0, h = 0
    const draw = () => {
      const cw = canvas.clientWidth
      const ch = canvas.clientHeight
      if (cw !== w || ch !== h) {
        w = cw; h = ch
        ctx.setTransform(1,0,0,1,0,0)
        const dpr = window.devicePixelRatio || 1
        canvas.width = Math.floor(cw * dpr)
        canvas.height = Math.floor(ch * dpr)
        ctx.scale(dpr, dpr)
      }

      ctx.clearRect(0, 0, cw, ch)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++
        if (p.x < 0) p.x = cw
        if (p.x > cw) p.x = 0
        if (p.y < 0) p.y = ch
        if (p.y > ch) p.y = 0
        if (p.life > p.maxLife) particles[i] = spawn(cw, ch)

        const alpha = 0.1 + 0.4 * Math.sin((p.life / p.maxLife) * Math.PI)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        gradient.addColorStop(0, `rgba(255, 230, 180, ${alpha})`)
        gradient.addColorStop(1, 'rgba(255, 230, 180, 0)')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      anim.current = requestAnimationFrame(draw)
    }

    resize()
    draw()
    window.addEventListener('resize', resize)
    return () => {
      if (anim.current) cancelAnimationFrame(anim.current)
      window.removeEventListener('resize', resize)
    }
  }, [density])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />
}
