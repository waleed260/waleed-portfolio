import { useEffect, useRef, useState, useMemo } from 'react'
import LightRays from './LightRays'
import MagicBento from './MagicBento'
import Robot3D from './components/Robot3D'
import './App.css'

/* ──────────── helpers ──────────── */
function useInView(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

function useMouseParallax(strength = 0.02) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e) => setOffset({ x: (e.clientX - window.innerWidth / 2) * strength, y: (e.clientY - window.innerHeight / 2) * strength })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [strength])
  return offset
}

/* ──────────── Custom Cursor (optimized) ──────────── */
function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const pos = useRef({ x: 0, y: 0 })
  const ringPos = useRef({ x: 0, y: 0 })
  const hovering = useRef(false)
  const lastHoverState = useRef(null)
  let rafId = null

  useEffect(() => {
    const move = (e) => {
      pos.current = { x: e.clientX, y: e.clientY }
      const isHover = e.target.matches('a,button,[data-hover]')
      if (hovering.current !== isHover) {
        hovering.current = isHover
      }
    }
    window.addEventListener('mousemove', move, { passive: true })

    const animate = () => {
      // Smooth ring follow
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.15
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.15

      const isHover = hovering.current
      const stateChanged = lastHoverState.current !== isHover

      if (dot.current) {
        dot.current.style.transform = `translate(${pos.current.x - 4}px, ${pos.current.y - 4}px)`
        if (stateChanged) {
          dot.current.style.width = isHover ? '16px' : '8px'
          dot.current.style.height = isHover ? '16px' : '8px'
          dot.current.style.background = isHover ? 'var(--pink)' : 'var(--cyan)'
        }
      }
      if (ring.current) {
        ring.current.style.transform = `translate(${ringPos.current.x - 18}px, ${ringPos.current.y - 18}px)`
        if (stateChanged) {
          ring.current.style.width = isHover ? '52px' : '36px'
          ring.current.style.height = isHover ? '52px' : '36px'
          ring.current.style.borderColor = isHover ? 'rgba(244, 114, 182, 0.5)' : 'rgba(168, 85, 247, 0.5)'
          ring.current.style.background = isHover ? 'rgba(244, 114, 182, 0.06)' : 'transparent'
        }
      }
      lastHoverState.current = isHover
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', move)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  return <><div ref={dot} className="cursor-dot" /><div ref={ring} className="cursor-ring" /></>
}

/* ──────────── Particles ──────────── */
function Particles({ count = 80 }) {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf
    const resize = () => { canvas.width = window.innerWidth; canvas.height = document.body.scrollHeight }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.5 + 0.1,
      color: ['#00e5ff', '#a855f7', '#f472b6', '#4d7cff'][Math.floor(Math.random() * 4)],
    }))

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.o
        ctx.fill()
      })
      // draw connecting lines
      ctx.globalAlpha = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = particles[i].color
            ctx.globalAlpha = (1 - dist / 120) * 0.12
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [count])
  return <canvas ref={canvasRef} className="particles-canvas" />
}

/* ──────────── Floating 3D Orbs ──────────── */
function FloatingOrbs() {
  const offset = useMouseParallax(0.015)
  return (
    <div className="floating-orbs" style={{ transform: `translate(${offset.x}px,${offset.y}px)` }}>
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  )
}

/* ──────────── Nav ──────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  const links = useMemo(() => ['About', 'Projects', 'Journey', 'Collaboration'], [])
  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo" data-hover>WH<span className="logo-dot">.</span></a>
      <button className="nav-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen(!menuOpen)}>
        <span className={menuOpen ? 'open' : ''}><span /><span /><span /></span>
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map((l) => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`} className="nav-link-3d" data-hover onClick={() => setMenuOpen(false)}>
              <span className="nav-link-border" />
              <span className="nav-link-text">{l}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ──────────── Section wrapper ──────────── */
function Section({ id, className = '', children }) {
  const [ref, vis] = useInView()
  return (
    <section id={id} ref={ref} className={`section section-transition section-glass ${className} ${vis ? 'in-view' : ''}`}>
      <div className="section-bg-blur" />
      <div className="section-inner section-inner-animated">
        {vis ? children : null}
      </div>
    </section>
  )
}

/* ──────────── GlowDivider ──────────── */
function GlowDivider() {
  return <div className="glow-divider" />
}

/* ──────────── HERO ──────────── */
function Hero() {
  const offset = useMouseParallax(0.03)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setTimeout(() => setLoaded(true), 100) }, [])
  return (
    <section id="hero" className="hero-section">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={0.8}
        lightSpread={0.6}
        rayLength={3}
        followMouse={true}
        mouseInfluence={0.15}
        noiseAmount={0}
        distortion={0}
        pulsating={true}
        fadeDistance={1.2}
        saturation={1.2}
      />
      <Particles count={90} />
      <FloatingOrbs />
      <div className="hero-grid" style={{ transform: `translate(${offset.x * 0.5}px,${offset.y * 0.5}px)` }}>
        <div className="hero-content">
          <p className={`hero-greeting ${loaded ? 'fade-up' : ''}`}>Hello, I'm</p>
          <div className="hero-intro-3d">
            <span className="intro-full-name">Waleed Hassan</span>
          </div>
          <p className={`hero-intro-tagline ${loaded ? 'fade-up' : ''}`}>
            I build intelligent AI systems, multi-agent workflows, and automation solutions — where code meets intelligence, motion, and design.
          </p>
          <div className={`hero-socials ${loaded ? 'fade-up' : ''}`}>
            <a href="https://www.linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener" className="social-btn" data-hover aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              <span>LinkedIn</span>
            </a>
            <a href="https://instagram.com/waleed__o16" target="_blank" rel="noopener" className="social-btn" data-hover aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              <span>Instagram</span>
            </a>
            <a href="mailto:vkdeku20@gmail.com" className="social-btn" data-hover aria-label="Email">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 010 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/></svg>
              <span>Email</span>
            </a>
          </div>
          <div className={`hero-ctas ${loaded ? 'fade-up' : ''}`}>
            <a href="#projects" className="btn btn-primary" data-hover>View Projects</a>
          </div>
          <div className={`hero-stats ${loaded ? 'fade-up' : ''}`}>
            <div className="stat"><span className="stat-num">10+</span><span className="stat-label">Projects</span></div>
            <div className="stat"><span className="stat-num">15+</span><span className="stat-label">Technologies</span></div>
            <div className="stat"><span className="stat-num">∞</span><span className="stat-label">Curiosity</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-3d-scene">
            <div className="scene-ring ring-1" />
            <div className="scene-ring ring-2" />
            <div className="scene-ring ring-3" />
            <div className="scene-core">
              <span className="core-letter">AI</span>
            </div>
            <div className="orbit-dot dot-1" />
            <div className="orbit-dot dot-2" />
            <div className="orbit-dot dot-3" />
            <div className="code-panel panel-left">
              <code><span className="code-key">agent</span>.<span className="code-fn">run</span>()</code>
            </div>
            <div className="code-panel panel-right">
              <code><span className="code-key">workflow</span>.<span className="code-fn">deploy</span>()</code>
            </div>
          </div>
        </div>
      </div>
      <div className="scroll-indicator">
        <span>Scroll</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  )
}

/* ──────────── ABOUT ──────────── */
function About() {
  const [ref, vis] = useInView()
  return (
    <Section id="about">
      <div className="section-inner" ref={ref}>
        <div className={`about-grid ${vis ? 'in-view' : ''}`}>
          <div className="about-text">
            <p className="section-label">About Me</p>
            <h2 className="section-heading">Turning complex workflows into<br /><span className="gradient-text">elegant AI-powered experiences</span></h2>
            <p>
              I'm <strong>Waleed Hassan</strong> — a developer deeply fascinated by the intersection of artificial intelligence, automation, and human-centered design. I'm currently working on <strong>Building Agentic AI systems and visual automation workflows</strong>.
            </p>
            <p>
              I specialize in <strong>advanced RAG pipelines</strong>, <strong>multi-agent orchestration</strong>, <strong>visual automation workflows</strong> (n8n, Zapier, Make.com), and <strong>advanced PyTorch</strong> models. I'm currently learning agentic workflows and advanced PyTorch.
            </p>
            <p>
              I'm looking to collaborate on open-source Agentic AI frameworks, data-driven Python projects, and low-code workflows. Beyond code, I'm passionate about Ubuntu/Linux ecosystems and pushing the boundaries of what autonomous AI systems can achieve.
            </p>
            <div className="about-quote">
              <span className="quote-icon">⚡</span>
              <p><em>I can set up a full development environment in the terminal faster than most people can open a browser.</em></p>
            </div>
            <div className="about-tags">
              {['Agentic AI', 'Multi-Agent Systems', 'Advanced RAG', 'Python', 'PyTorch', 'n8n', 'Zapier', 'Make.com', 'Vapi', 'Ubuntu/Linux', 'Docker', 'AWS'].map(t => (
                <span key={t} className="about-tag">{t}</span>
              ))}
            </div>
          </div>
          <div className="about-visual">
            <div className="about-avatar-ring">
              <div className="avatar-inner">
                <span className="avatar-initials">WH</span>
              </div>
            </div>
            <div className="about-floating-cards">
              <div className="float-card fc-1"><span>🤖</span> AI Agents</div>
              <div className="float-card fc-2"><span>⚡</span> Automation</div>
              <div className="float-card fc-3"><span>🧠</span> Deep Learning</div>
              <div className="float-card fc-4"><span>🔗</span> Workflows</div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ──────────── TECH STACK (3D Shield Badges) ──────────── */
const techStackData = [
  {
    category: 'Languages',
    items: [
      { name: 'Python', badge: 'https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54' },
      { name: 'HTML5', badge: 'https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white' },
      { name: 'CSS3', badge: 'https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white' },
      { name: 'Markdown', badge: 'https://img.shields.io/badge/markdown-%23000000.svg?style=for-the-badge&logo=markdown&logoColor=white' },
    ],
  },
  {
    category: 'Frameworks & Libraries',
    items: [
      { name: 'Flask', badge: 'https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white' },
      { name: 'FastAPI', badge: 'https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi' },
      { name: 'Django', badge: 'https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white' },
      { name: 'Node.js', badge: 'https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white' },
      { name: 'PyTorch', badge: 'https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=PyTorch&logoColor=white' },
      { name: 'TensorFlow', badge: 'https://img.shields.io/badge/TensorFlow-%23FF6F00.svg?style=for-the-badge&logo=TensorFlow&logoColor=white' },
      { name: 'Pandas', badge: 'https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white' },
      { name: 'scikit-learn', badge: 'https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white' },
    ],
  },
  {
    category: 'Databases',
    items: [
      { name: 'PostgreSQL', badge: 'https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white' },
      { name: 'MySQL', badge: 'https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white' },
      { name: 'MongoDB', badge: 'https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white' },
      { name: 'SQLite', badge: 'https://img.shields.io/badge/sqlite-%2307405e.svg?style=for-the-badge&logo=sqlite&logoColor=white' },
      { name: 'Supabase', badge: 'https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white' },
      { name: 'Firebase', badge: 'https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase' },
      { name: 'Oracle', badge: 'https://img.shields.io/badge/Oracle-F80000?style=for-the-badge&logo=oracle&logoColor=white' },
    ],
  },
  {
    category: 'Cloud & DevOps',
    items: [
      { name: 'AWS', badge: 'https://img.shields.io/badge/AWS-%23FF9900.svg?style=for-the-badge&logo=amazon-aws&logoColor=white' },
      { name: 'Vercel', badge: 'https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white' },
      { name: 'Docker', badge: 'https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white' },
      { name: 'Git', badge: 'https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white' },
      { name: 'GitHub', badge: 'https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white' },
    ],
  },
  {
    category: 'Design & Tools',
    items: [
      { name: 'Photoshop', badge: 'https://img.shields.io/badge/adobe%20photoshop-%2331A8FF.svg?style=for-the-badge&logo=adobe%20photoshop&logoColor=white' },
      { name: 'Adobe', badge: 'https://img.shields.io/badge/adobe-%23FF0000.svg?style=for-the-badge&logo=adobe&logoColor=white' },
      { name: 'Blender', badge: 'https://img.shields.io/badge/blender-%23F5792A.svg?style=for-the-badge&logo=blender&logoColor=white' },
      { name: 'Canva', badge: 'https://img.shields.io/badge/Canva-%2300C4CC.svg?style=for-the-badge&logo=Canva&logoColor=white' },
      { name: 'Power BI', badge: 'https://img.shields.io/badge/power_bi-F2C811?style=for-the-badge&logo=powerbi&logoColor=black' },
      { name: 'Postman', badge: 'https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white' },
      { name: 'Playwright', badge: 'https://img.shields.io/badge/-playwright-%232EAD33?style=for-the-badge&logo=playwright&logoColor=white' },
      { name: 'Jira', badge: 'https://img.shields.io/badge/jira-%230A0FFF.svg?style=for-the-badge&logo=jira&logoColor=white' },
    ],
  },
]

function TechStack() {
  const [ref, vis] = useInView()
  return (
    <Section id="techstack">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Tech Stack</p>
        <h2 className="section-heading">Technologies & <span className="gradient-text">tools I work with</span></h2>
        <div className={`techstack-grid-3d ${vis ? 'in-view' : ''}`}>
          {techStackData.map((group, gi) => (
            <div className="techstack-group-3d" key={group.category} style={{ transitionDelay: `${gi * 0.1}s` }}>
              <h3 className="techstack-group-title">{group.category}</h3>
              <div className="techstack-badges">
                {group.items.map((t) => (
                  <div className="tech-badge-3d" key={t.name} data-hover>
                    <img
                      src={t.badge}
                      alt={t.name}
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="badge-3d-glow" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ──────────── DEV QUOTE ──────────── */
const DEV_QUOTES = [
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson" },
  { text: "The best way to predict the future is to invent it.", author: "Alan Kay" },
  { text: "Any sufficiently advanced technology is indistinguishable from magic.", author: "Arthur C. Clarke" },
  { text: "I can set up a full development environment in the terminal faster than most people can open a browser.", author: "Waleed Hassan" },
  { text: "The future belongs to those who understand that doing more with less is compassionate, prosperous, and enduring.", author: "Paul Hawken" },
  { text: "AI is not just a tool. It's a catalyst for redefining what's possible.", author: "Waleed Hassan" },
]

function DevQuote() {
  const [ref, vis] = useInView()
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setIdx(i => (i + 1) % DEV_QUOTES.length), 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <Section id="quote">
      <div className="section-inner" ref={ref}>
        <div className={`dev-quote-wrapper ${vis ? 'in-view' : ''}`}>
          <p className="section-label">Inspiration</p>
          <h2 className="section-heading">Words that <span className="gradient-text">drive innovation</span></h2>
          <div className="quote-frame">
            <div className="quote-content">
              <div className="quote-mark">"</div>
              <div className="quote-text-container">
                {DEV_QUOTES.map((q, i) => (
                  <p key={i} className={`quote-text ${i === idx ? 'active' : ''}`}>
                    {q.text}
                  </p>
                ))}
              </div>
              <div className="quote-author">
                <div className="quote-author-line" />
                <span className="quote-author-name">{DEV_QUOTES[idx].author}</span>
              </div>
            </div>
            <div className="quote-dots">
              {DEV_QUOTES.map((_, i) => (
                <button
                  key={i}
                  className={`quote-dot ${i === idx ? 'active' : ''}`}
                  onClick={() => setIdx(i)}
                  aria-label={`Quote ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ──────────── PROJECTS ──────────── */
const projectsData = [
  {
    title: 'Agentic AI Research Assistant',
    desc: 'Multi-agent system that performs literature review, summarization, and knowledge graph construction using advanced RAG and LLM orchestration.',
    tags: ['Multi-Agent', 'RAG', 'Python', 'LangChain'],
    gradient: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(77,124,255,0.15))',
    glow: 'var(--glow-cyan)',
  },
  {
    title: 'Intelligent Automation Hub',
    desc: 'Visual workflow platform connecting n8n, Zapier, and custom Python microservices for end-to-end business process automation.',
    tags: ['n8n', 'FastAPI', 'Docker', 'PostgreSQL'],
    gradient: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(244,114,182,0.15))',
    glow: 'var(--glow-purple)',
  },
  {
    title: 'Voice AI Agent Platform',
    desc: 'Conversational AI system powered by Vapi with custom intent recognition, context management, and seamless handoff to human agents.',
    tags: ['Vapi', 'Python', 'AI', 'Voice'],
    gradient: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(0,229,255,0.15))',
    glow: 'var(--glow-cyan)',
  },
  {
    title: 'Deep Learning Pipeline Toolkit',
    desc: 'PyTorch-based toolkit for rapid prototyping of neural architectures with automated hyperparameter tuning and experiment tracking.',
    tags: ['PyTorch', 'Python', 'MLOps', 'Docker'],
    gradient: 'linear-gradient(135deg, rgba(77,124,255,0.15), rgba(168,85,247,0.15))',
    glow: 'var(--glow-purple)',
  },
  {
    title: 'Sales Analytics Dashboard',
    desc: 'Real-time Amazon sales analytics with predictive modeling, anomaly detection, and automated reporting via scheduled workflows.',
    tags: ['Django', 'PostgreSQL', 'Analytics', 'Automation'],
    gradient: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15))',
    glow: 'var(--glow-cyan)',
  },
  {
    title: 'Document Intelligence System',
    desc: 'AI-powered document processing pipeline with OCR, entity extraction, semantic search, and automated classification using advanced RAG.',
    tags: ['RAG', 'OCR', 'Python', 'AI'],
    gradient: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(77,124,255,0.15))',
    glow: 'var(--glow-purple)',
  },
]

function Projects() {
  const [ref, vis] = useInView()
  const [tilt, setTilt] = useState({})
  const handleTilt = (e, idx) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12
    setTilt(prev => ({ ...prev, [idx]: { x, y } }))
  }
  const resetTilt = (idx) => setTilt(prev => ({ ...prev, [idx]: { x: 0, y: 0 } }))
  return (
    <Section id="projects">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Projects</p>
        <h2 className="section-heading">Intelligent systems in <span className="gradient-text">action</span></h2>
        <div className={`projects-grid ${vis ? 'in-view' : ''}`}>
          {projectsData.map((p, i) => {
            const t = tilt[i] || { x: 0, y: 0 }
            return (
              <div
                className="project-card"
                key={p.title}
                style={{
                  transform: `perspective(800px) rotateX(${t.y}deg) rotateY(${t.x}deg)`,
                  background: p.gradient,
                  boxShadow: t.x !== 0 ? p.glow : 'none',
                  transitionDelay: `${i * 0.08}s`,
                }}
                onMouseMove={(e) => handleTilt(e, i)}
                onMouseLeave={() => resetTilt(i)}
                data-hover
              >
                <div className="project-card-header">
                  <span className="project-icon-3d">
                    {['🧠', '⚡', '🎙️', '🔬', '📊', '📄'][i]}
                  </span>
                  <div className="project-glow-orb" />
                </div>
                <h3 className="project-title">{p.title}</h3>
                <p className="project-desc">{p.desc}</p>
                <div className="project-tags">
                  {p.tags.map(tg => <span key={tg} className="project-tag">{tg}</span>)}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

/* ──────────── COLLABORATION ──────────── */
function Collaboration() {
  const [ref, vis] = useInView()
  return (
    <Section id="collaboration">
      <div className="section-inner" ref={ref}>
        <div className={`collab-wrapper ${vis ? 'in-view' : ''}`}>
          <div className="collab-panel">
            <div className="collab-glow-bg" />
            <p className="section-label">Collaboration</p>
            <h2 className="section-heading">Let's build something <span className="gradient-text">intelligent together</span></h2>
            <p className="collab-text">
              I'm actively open to collaborating on open-source frameworks, low-code workflow tools, and data-driven Python projects. Whether you're building an agentic system, designing a multi-agent architecture, or creating the next automation platform — let's connect.
            </p>
            <div className="collab-areas">
              {[
                { icon: '🌐', label: 'Open-Source AI Frameworks' },
                { icon: '⚙️', label: 'Low-Code Workflow Design' },
                { icon: '📈', label: 'Data-Driven Python Projects' },
                { icon: '🤖', label: 'Multi-Agent System Architecture' },
                { icon: '🔬', label: 'Advanced RAG Research' },
                { icon: '🚀', label: 'Scalable AI Product Development' },
              ].map(area => (
                <div className="collab-area" key={area.label} data-hover>
                  <span className="collab-area-icon">{area.icon}</span>
                  <span>{area.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ──────────── JOURNEY / TIMELINE ──────────── */
const timelineData = [
  {
    year: '2024',
    title: 'The AI Awakening',
    desc: 'Dove deep into LLMs, prompt engineering, and building AI-powered applications. Started exploring agentic patterns and autonomous AI behaviors.',
    tags: ['LLMs', 'Prompt Engineering', 'AI Apps'],
  },
  {
    year: '2025',
    title: 'Agentic Systems & Multi-Agent Orchestration',
    desc: 'Architected multi-agent systems with LangChain and custom orchestration layers. Built advanced RAG pipelines with retrieval, re-ranking, and synthesis.',
    tags: ['LangChain', 'Multi-Agent', 'Advanced RAG'],
  },
  {
    year: '2025',
    title: 'Visual Automation & Low-Code Mastery',
    desc: 'Mastered n8n, Zapier, and Make.com for rapid workflow automation. Integrated voice AI agents using Vapi for conversational experiences.',
    tags: ['n8n', 'Zapier', 'Make.com', 'Vapi'],
  },
  {
    year: '2025–2026',
    title: 'Advanced PyTorch & Deep Learning',
    desc: 'Exploring neural architecture design, transfer learning, and building PyTorch-based toolkits for rapid deep learning experimentation.',
    tags: ['PyTorch', 'Deep Learning', 'Neural Architectures'],
  },
  {
    year: 'Now',
    title: 'Autonomous AI Systems & Beyond',
    desc: 'Building fully autonomous AI systems that can plan, execute, and learn. Pushing boundaries in agent memory, tool use, and self-improving workflows.',
    tags: ['Autonomous Agents', 'Tool Use', 'Self-Improving Systems'],
  },
]

function Journey() {
  const [ref, vis] = useInView()
  return (
    <Section id="journey">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Learning Journey</p>
        <h2 className="section-heading">The path from <span className="gradient-text">curiosity to capability</span></h2>
        <div className={`timeline ${vis ? 'in-view' : ''}`}>
          {timelineData.map((item, i) => (
            <div className="timeline-item" key={item.title} style={{ transitionDelay: `${i * 0.15}s` }}>
              <div className="timeline-node">
                <span className="timeline-year">{item.year}</span>
                <div className="timeline-dot" />
              </div>
              <div className="timeline-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="timeline-tags">
                  {item.tags.map(t => <span key={t} className="timeline-tag">{t}</span>)}
                </div>
              </div>
            </div>
          ))}
          <div className="timeline-line" />
        </div>
      </div>
    </Section>
  )
}

/* ──────────── FOOTER ──────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <h3 className="footer-logo">WH<span className="logo-dot">.</span></h3>
          <p className="footer-tagline">AI Automation Engineer & Agentic Systems Builder</p>
        </div>
        <div className="footer-contact">
          <h4 className="footer-heading">Get in Touch</h4>
          <a href="mailto:vkdeku20@gmail.com" className="footer-link" data-hover>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            vkdeku20@gmail.com
          </a>
          <a href="https://github.com/waleed260" target="_blank" rel="noopener" className="footer-link" data-hover>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            @waleed260
          </a>
          <a href="https://www.linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener" className="footer-link" data-hover>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            Waleed Hassan
          </a>
          <a href="https://instagram.com/waleed__o16" target="_blank" rel="noopener" className="footer-link" data-hover>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            @waleed__o16
          </a>
        </div>
        <div className="footer-socials">
          <h4 className="footer-heading">Follow Me</h4>
          <div className="footer-social-icons">
            <a href="https://github.com/waleed260" target="_blank" rel="noopener" className="footer-social-icon" data-hover aria-label="GitHub">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener" className="footer-social-icon" data-hover aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://instagram.com/waleed__o16" target="_blank" rel="noopener" className="footer-social-icon" data-hover aria-label="Instagram">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
            <a href="mailto:vkdeku20@gmail.com" className="footer-social-icon" data-hover aria-label="Email">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>Designed & built by <strong>Waleed Hassan</strong> — AI Automation Engineer</p>
        <p className="footer-year">© 2026 — Where code meets intelligence.</p>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════ APP ═══════════════════════════════════════ */
export default function App() {
  return (
    <>
      {/* Fixed LightRays Background */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}>
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={0.5}
          lightSpread={0.4}
          rayLength={4}
          followMouse={true}
          mouseInfluence={0.08}
          noiseAmount={0}
          distortion={0}
          pulsating={true}
          fadeDistance={1.5}
          saturation={1.1}
        />
      </div>
      
      {/* Content sits above the background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Cursor />
        <Nav />
        <Hero />
        <GlowDivider />
        <About />
        <section className="section section-transition section-glass in-view" style={{ padding: '1.5rem 2rem', marginBottom: '0' }}>
          <div className="section-bg-blur" />
          <div className="section-inner section-inner-animated" style={{ gap: '0.5rem' }}>
            <p className="section-label" style={{ textAlign: 'center', display: 'block', marginBottom: '0.25rem' }}>My Toolkit</p>
            <h2 className="section-heading" style={{ textAlign: 'center', marginBottom: '0.5rem', fontSize: '1.75rem' }}>Technologies & Tools I <span className="gradient-text">Work With</span></h2>
          </div>
        </section>
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={400}
          particleCount={12}
          glowColor="132, 0, 255"
          disableAnimations={false}
        />
        <GlowDivider />
        <DevQuote />
        <GlowDivider />
        <Projects />
        <GlowDivider />
        <Journey />
        <GlowDivider />
        <Collaboration />
        <Footer />
      </div>
      {/* 3D Ball Robot - follows user across all pages */}
      <Robot3D />
    </>
  )
}
