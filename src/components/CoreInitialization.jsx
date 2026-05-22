import { useRef, useEffect, useState, useMemo } from 'react'
import gsap from 'gsap'
import '../styles/CoreInitialization.css'

const LOG_QUEUE = [
  '[SYSTEM] Initializing Agentic AI Core...',
  '[PROCESS] Loading neural network architecture...',
  '[MODULE] PyTorch engine: ✓ ACTIVE',
  '[MODULE] LangChain framework: ✓ READY',
  '[AGENT] Multi-agent orchestration: ✓ ONLINE',
  '[WORKFLOW] Automation pipeline: ✓ DEPLOYED',
  '[STATUS] All systems nominal. Ready for execution.',
]

export default function CoreInitialization() {
  const containerRef = useRef(null)
  const coreRef = useRef(null)
  const particlesRef = useRef([])
  const canvasRef = useRef(null)
  const [systemLogs, setSystemLogs] = useState([])
  const totalLogs = useMemo(() => LOG_QUEUE.length, [])

  // System Log Typewriter Effect
  useEffect(() => {
    const typeLogs = () => {
      LOG_QUEUE.forEach((log, idx) => {
        setTimeout(() => {
          setSystemLogs((prev) => [...prev, log])
        }, 300 * idx)
      })
    }
    typeLogs()
  }, [])

  // Animate Core
  useEffect(() => {
    const core = coreRef.current
    if (!core) return

    gsap.to(core, {
      rotationX: 360,
      rotationY: 360,
      duration: 20,
      repeat: -1,
      ease: 'none',
    })

    // Mouse interaction
    const handleMouseMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height

      gsap.to(core, {
        rotationY: x * 15,
        rotationX: y * 15,
        duration: 0.5,
        overwrite: 'auto',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Particle system
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight

    // Create particles around core
    particlesRef.current = Array.from({ length: 40 }, () => ({
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: Math.random() * Math.PI * 2,
      distance: Math.random() * 80 + 40,
      speed: Math.random() * 0.02 + 0.01,
      size: Math.random() * 2 + 1,
      color: ['#00e5ff', '#a855f7', '#f472b6'][Math.floor(Math.random() * 3)],
    }))

    let animationFrameId

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 0.6

      particlesRef.current.forEach((p) => {
        p.angle += p.speed
        const x = canvas.width / 2 + Math.cos(p.angle) * p.distance
        const y = canvas.height / 2 + Math.sin(p.angle) * p.distance

        ctx.fillStyle = p.color
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fill()

        // Draw lines to center
        ctx.strokeStyle = p.color
        ctx.globalAlpha = 0.2
        ctx.lineWidth = 0.5
        ctx.beginPath()
        ctx.moveTo(canvas.width / 2, canvas.height / 2)
        ctx.lineTo(x, y)
        ctx.stroke()
        ctx.globalAlpha = 0.6
      })

      ctx.globalAlpha = 1
      animationFrameId = requestAnimationFrame(drawParticles)
    }

    drawParticles()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <section className="core-initialization">
      <div ref={containerRef} className="core-container">
        <canvas ref={canvasRef} className="core-particles-canvas" />

        <div className="core-visual" ref={coreRef}>
          <div className="core-sphere">
            <div className="core-inner">
              <span className="core-text">AI</span>
            </div>
            <div className="core-ring ring-1" />
            <div className="core-ring ring-2" />
            <div className="core-ring ring-3" />
          </div>
        </div>

        <div className="core-content">
          <h1 className="core-title">
            <span className="title-prefix">System Initialized:</span>
            <br />
            <span className="title-main">Waleed Hassan</span>
            <span className="title-role">Agentic AI Developer</span>
          </h1>
        </div>

        <div className="system-logs">
          {systemLogs.map((log, idx) => (
            <div key={idx} className={`log-line ${log.includes('✓') ? 'success' : ''}`}>
              <span className="log-prefix">{log.includes('[') ? log.split(']')[0] + ']' : '>'}</span>
              <span className="log-text">{log}</span>
            </div>
          ))}
          {systemLogs.length < totalLogs && <div className="log-cursor" />}
        </div>

        <div className="core-bottom-text">
          <p>Exploring the intersection of AI research, autonomous agents, and intelligent automation.</p>
          <p><strong>Status:</strong> <span className="status-active">ACTIVE</span></p>
        </div>
      </div>
    </section>
  )
}
