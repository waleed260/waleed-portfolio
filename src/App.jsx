import { useEffect, useRef, useState, useMemo } from 'react'
import { PrismaHero } from './components/ui/prisma-hero'
import CoreInitialization from './components/CoreInitialization'
import NodeBasedArchitecture from './components/NodeBasedArchitecture'
import TimelineVisualization from './components/TimelineVisualization'
import DeploymentGateway from './components/DeploymentGateway'
import './App.css'

/* ──────────── Utilities ──────────── */
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  
  return [ref, visible]
}

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
        dot.current.style.background = hovering.current ? 'var(--pink)' : 'var(--cyan)'
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px, 0)`
        ring.current.style.borderColor = hovering.current ? 'rgba(244, 114, 182, 0.5)' : 'rgba(20, 184, 166, 0.5)'
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

  const links = useMemo(() => ['About', 'Journey', 'Collaboration'], [])

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
  const [ref, vis] = useInView(0.2)
  
  return (
    <section 
      id={id} 
      ref={ref} 
      className={`section section-transition ${className} ${vis ? 'in-view' : ''}`}
    >
      <div className="section-inner">
        {children}
      </div>
    </section>
  )
}

/* ──────────── About Section (New) ──────────── */
function About() {
  const [activeSkill, setActiveSkill] = useState(0)
  const skills = useMemo(() => [
    { name: 'Autonomous AI Agents', level: 95, icon: '🤖' },
    { name: 'Multi-Agent Orchestration', level: 92, icon: '🔗' },
    { name: 'Advanced RAG Systems', level: 88, icon: '🧠' },
    { name: 'Visual Automation Workflows', level: 95, icon: '⚙️' }
  ], [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSkill((prev) => (prev + 1) % skills.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [skills.length])

  return (
    <Section id="about" className="about-section">
      <div className="about-grid">
        <div className="about-text">
          <h2 className="section-heading">Autonomous AI Systems Architect</h2>
          <p>
            I design and build <strong>autonomous AI agents</strong> that think, plan, and execute complex workflows. Specializing in <strong>multi-agent orchestration</strong>, <strong>advanced RAG pipelines</strong>, and <strong>intelligent automation</strong>.
          </p>
          <p>
            From <strong>LangChain</strong> frameworks to <strong>n8n visual workflows</strong>, I transform cutting-edge AI research into production-ready systems.
          </p>
          
          <div className="about-skills">
            {skills.map((skill, i) => (
              <div
                key={skill.name}
                className={`skill-item ${i === activeSkill ? 'active' : ''}`}
                onMouseEnter={() => setActiveSkill(i)}
              >
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-name">{skill.name}</span>
                <span className="skill-level">{skill.level}%</span>
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

/* ──────────── Journey Section ──────────── */
function Journey() {
  return (
    <Section id="journey" className="journey-section">
      <div className="journey-header">
        <h2>Learning Journey</h2>
        <p>From LLMs to Production AI Systems</p>
      </div>
      <TimelineVisualization />
    </Section>
  )
}

/* ──────────── Collaboration Section ──────────── */
function Collaboration() {
  return (
    <Section id="collaboration" className="collaboration-section">
      <DeploymentGateway />
    </Section>
  )
}

/* ──────────── Main App ──────────── */
export default function App() {
  const [showApp, setShowApp] = useState(false)

  useEffect(() => {
    // Simulate resource loading
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
          
          {/* PrismaHero - Feature Hero */}
          <PrismaHero />

          {/* Hero Section with Core Initialization */}
          <CoreInitialization />
          
          {/* About Section with Node Architecture */}
          <About />
          
          {/* Journey Timeline */}
          <Journey />
          
          {/* Collaboration/Contact Gateway */}
          <Collaboration />
          
          {/* Footer */}
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
