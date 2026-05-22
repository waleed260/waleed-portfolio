import { useEffect, useRef, useState, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { GridPattern } from './components/ui/grid-pattern'
import { Radar } from './components/ui/radar-effect'
import CoreInitialization from './components/CoreInitialization'
import NodeBasedArchitecture from './components/NodeBasedArchitecture'
import TimelineVisualization from './components/TimelineVisualization'
import DeploymentGateway from './components/DeploymentGateway'
import './App.css'

/* ──────────── Loading Screen ──────────── */
function LoadingScreen({ onLoadComplete }) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setFadeOut(true)
          setTimeout(() => onLoadComplete(), 800)
          return 100
        }
        return prev + Math.random() * 15 + 5
      })
    }, 200)

    return () => clearInterval(interval)
  }, [onLoadComplete])

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-content">
        <div className="loading-logo">
          <div className="loading-ring"></div>
          <div className="loading-core"></div>
        </div>
        <h1 className="loading-title">
          <span className="loading-text-word">Initializing</span>
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </h1>
        <div className="loading-progress-bar">
          <div className="loading-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }}></div>
        </div>
        <p className="loading-subtitle">Preparing intelligent systems...</p>
      </div>
    </div>
  )
}

/* ──────────── Custom Cursor ──────────── */
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const hovering = useRef(false)
  const rafId = useRef(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isMobile) return

    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      hovering.current = e.target.matches('a,button,[data-hover]')
    }

    window.addEventListener('mousemove', move, { passive: true })

    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.2
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.2

      if (dot.current) {
        dot.current.style.transform = `translate3d(${pos.current.x - 4}px, ${pos.current.y - 4}px, 0)`
        dot.current.style.background = hovering.current ? '#d0d0d0' : '#e0e0e0'
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px, 0)`
        ring.current.style.borderColor = hovering.current ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.5)'
      }

      rafId.current = requestAnimationFrame(animate)
    }
    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', move)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [isMobile])

  if (isMobile) return null

  return <>
    <div ref={dot} className="cursor-dot" />
    <div ref={ring} className="cursor-ring" />
  </>
}

/* ──────────── Navigation ──────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    let timeoutId = null
    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setScrolled(window.scrollY > 60)
      }, 16)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [])

  const links = useMemo(() => ['Origin', 'Craft', 'Journey', 'Connect'], [])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo" data-hover>WH<span className="logo-dot">.</span></a>
      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
      >
        <span className={menuOpen ? 'open' : ''}><span /><span /><span /></span>
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <li key={l}>
            <a
              href={`#${l.toLowerCase()}`}
              className="nav-link-3d"
              data-hover
              onClick={() => setMenuOpen(false)}
            >
              <span className="nav-link-border" />
              <span className="nav-link-text">{l}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ──────────── Section Wrapper ──────────── */
function Section({ id, className = '', children }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id={id}
      ref={ref}
      className={`section section-transition ${className}`}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? 'translateY(0)' : 'translateY(40px)',
        transition: 'opacity 0.8s ease, transform 0.8s ease',
      }}
    >
      <div className="section-inner">
        {children}
      </div>
    </section>
  )
}

/* ──────────── Origin Story Section ──────────── */
function Origin() {
  const skills = useMemo(() => [
    { name: 'Autonomous AI Agents', level: 95 },
    { name: 'Multi-Agent Orchestration', level: 92 },
    { name: 'Advanced RAG Systems', level: 88 },
    { name: 'Visual Automation Workflows', level: 95 },
  ], [])
  const [activeSkill, setActiveSkill] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkill((prev) => (prev + 1) % skills.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [skills.length])

  return (
    <Section id="origin" className="about-section">
      <div className="about-grid">
        <div className="about-text">
          <h2 className="section-heading">The Origin</h2>
          <p>
            I still remember the moment it clicked. Large language models could
            <strong> reason</strong> — but they couldn&apos;t <strong>act</strong>.
            That gap between thought and execution is where I live.
          </p>
          <p>
            I build <strong>autonomous AI agents</strong> that don&apos;t just
            respond — they plan, orchestrate, and execute complex workflows.
            From multi-agent systems that coordinate like swarms, to RAG
            pipelines that know when to retrieve and when to trust their own
            knowledge, every system I design starts with a question:
            <em> &ldquo;What would a truly capable digital teammate look like?&rdquo;</em>
          </p>
          <p>
            The answer lives at the intersection of <strong>LangChain</strong>,
            <strong> vector reasoning</strong>, and <strong>visual automation</strong>.
            Production-ready. Built to scale.
          </p>

          <div className="origin-radar">
            <Radar />
          </div>

          <div className="about-skills">
            {skills.map((skill, i) => (
              <div
                key={skill.name}
                className={`skill-item ${i === activeSkill ? 'active' : ''}`}
                onMouseEnter={() => setActiveSkill(i)}
              >
                <span className="skill-level">{skill.level}%</span>
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="about-visual">
          <NodeBasedArchitecture />
        </div>
      </div>
    </Section>
  )
}

/* ──────────── Craft Section ──────────── */
function Craft() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <Section id="craft" className="craft-section">
      <div ref={ref} className="craft-content">
        <h2 className="section-heading">The Architecture</h2>
        <p className="craft-subtitle">
          Every system is a story. Here&apos;s how the pieces fit together.
        </p>
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={isInView ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <CoreInitialization />
        </motion.div>
      </div>
    </Section>
  )
}

/* ──────────── Journey Section ──────────── */
function Journey() {
  return (
    <Section id="journey" className="journey-section">
      <div className="journey-header">
        <h2>The Journey</h2>
        <p>From first prompt to production-grade AI orchestration</p>
      </div>
      <TimelineVisualization />
    </Section>
  )
}

/* ────────────── Connect Section ──────────── */
function Connect() {
  return (
    <Section id="connect" className="collaboration-section">
      <DeploymentGateway />
    </Section>
  )
}

/* ──────────── Main App ──────────── */
export default function App() {
  const [showApp, setShowApp] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowApp(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {!showApp && <LoadingScreen onLoadComplete={() => setShowApp(true)} />}
      {showApp && (
        <div className="app">
          <Cursor />
          <Nav />

          <div className="fixed-bg">
            <GridPattern
              width={60}
              height={60}
              className="opacity-[0.12]"
              strokeDasharray="2 2"
            />
          </div>

          <Origin />
          <Craft />
          <Journey />
          <Connect />

          <footer className="footer">
            <div className="footer-content">
              <p>&copy; 2024–2026 Waleed Hassan. Building the future of AI.</p>
              <div className="footer-links">
                <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="mailto:vkdeku20@gmail.com">Email</a>
              </div>
            </div>
          </footer>
        </div>
      )}
    </>
  )
}
