import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import LaserFlow from './LaserFlow'
import MagicBento from './MagicBento'
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
  const links = useMemo(() => ['About', 'Skills', 'Projects', 'Collaboration', 'Journey', 'Contact'], [])
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
    <section id={id} ref={ref} className={`section section-transition ${className} ${vis ? 'in-view' : ''}`}>
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
      <Particles count={90} />
      <FloatingOrbs />
      <div className="hero-grid" style={{ transform: `translate(${offset.x * 0.5}px,${offset.y * 0.5}px)` }}>
        <div className="hero-content">
          <p className={`hero-greeting ${loaded ? 'fade-up' : ''}`}>Hello, I'm</p>
          <div className={`hero-intro-3d ${loaded ? 'fade-up' : ''}`}>
            <span className="intro-full-name">Waleed Hassan</span>
          </div>
          <p className={`hero-intro-tagline ${loaded ? 'fade-up' : ''}`}>
            Building Agentic AI systems and visual automation workflows. Where code meets intelligence, motion, and design.
          </p>
          <p className={`hero-tagline ${loaded ? 'fade-up' : ''}`}>
            AI Automation Engineer · Agentic Systems Builder · Python Developer
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
            <a href="#contact" className="btn btn-outline" data-hover>Get in Touch</a>
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

/* ──────────── SKILLS ──────────── */
const skillsData = [
  { category: 'Languages & Frameworks', items: [
    { name: 'Python', level: 95, icon: '🐍' },
    { name: 'PyTorch', level: 88, icon: '🔥' },
    { name: 'FastAPI', level: 90, icon: '⚡' },
    { name: 'Django', level: 82, icon: '🎯' },
  ]},
  { category: 'Infrastructure & Cloud', items: [
    { name: 'Docker', level: 85, icon: '🐳' },
    { name: 'AWS', level: 78, icon: '☁️' },
    { name: 'PostgreSQL', level: 80, icon: '🗄️' },
    { name: 'Firebase', level: 75, icon: '🔥' },
  ]},
  { category: 'Automation & Low-Code', items: [
    { name: 'n8n', level: 92, icon: '🔗' },
    { name: 'Zapier', level: 88, icon: '⚙️' },
    { name: 'Make.com', level: 85, icon: '🧩' },
    { name: 'Vapi', level: 80, icon: '📞' },
  ]},
  { category: 'Platforms', items: [
    { name: 'Ubuntu / Linux', level: 90, icon: '🐧' },
    { name: 'Git / GitHub', level: 88, icon: '📦' },
    { name: 'CLI / Bash', level: 85, icon: '💻' },
    { name: 'CI/CD', level: 76, icon: '🔄' },
  ]},
]

function Skills() {
  const [ref, vis] = useInView()
  return (
    <Section id="skills">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Skills</p>
        <h2 className="section-heading">Developer of agentic systems,<br /><span className="gradient-text">low-code automation, and scalable AI tools</span></h2>
        <div className={`skills-grid ${vis ? 'in-view' : ''}`}>
          {skillsData.map((group, gi) => (
            <div className="skill-group" key={group.category} style={{ transitionDelay: `${gi * 0.1}s` }}>
              <h3 className="skill-group-title">{group.category}</h3>
              {group.items.map((s, si) => (
                <div className="skill-item" key={s.name} style={{ transitionDelay: `${(gi * 0.1) + (si * 0.06)}s` }} data-hover>
                  <div className="skill-header">
                    <span className="skill-icon">{s.icon}</span>
                    <span className="skill-name">{s.name}</span>
                    <span className="skill-level">{s.level}%</span>
                  </div>
                  <div className="skill-bar-bg">
                    <div className="skill-bar-fill" style={vis ? { width: `${s.level}%` } : { width: '0%' }} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  )
}

/* ──────────── TECH STACK (3D muted theme) ──────────── */
const techStackData = [
  {
    category: 'Languages',
    items: [
      { name: 'Python', color: '#3670A0', logo: 'python' },
      { name: 'HTML5', color: '#E34F26', logo: 'html5' },
      { name: 'CSS3', color: '#1572B6', logo: 'css3' },
      { name: 'Markdown', color: '#000000', logo: 'markdown' },
    ],
  },
  {
    category: 'Frameworks & Libraries',
    items: [
      { name: 'Flask', color: '#000', logo: 'flask' },
      { name: 'FastAPI', color: '#005571', logo: 'fastapi' },
      { name: 'Django', color: '#092E20', logo: 'django' },
      { name: 'Node.js', color: '#6DA55F', logo: 'node.js' },
      { name: 'PyTorch', color: '#EE4C2C', logo: 'pytorch' },
      { name: 'TensorFlow', color: '#FF6F00', logo: 'tensorflow' },
      { name: 'Pandas', color: '#150458', logo: 'pandas' },
      { name: 'scikit-learn', color: '#F7931E', logo: 'scikit-learn' },
    ],
  },
  {
    category: 'Databases',
    items: [
      { name: 'PostgreSQL', color: '#316192', logo: 'postgresql' },
      { name: 'MySQL', color: '#4479A1', logo: 'mysql' },
      { name: 'MongoDB', color: '#4ea94b', logo: 'mongodb' },
      { name: 'SQLite', color: '#07405e', logo: 'sqlite' },
      { name: 'Supabase', color: '#3ECF8E', logo: 'supabase' },
      { name: 'Firebase', color: '#039BE5', logo: 'firebase' },
      { name: 'Oracle', color: '#F80000', logo: 'oracle' },
    ],
  },
  {
    category: 'Cloud & DevOps',
    items: [
      { name: 'AWS', color: '#FF9900', logo: 'amazon-aws' },
      { name: 'Vercel', color: '#000', logo: 'vercel' },
      { name: 'Docker', color: '#0db7ed', logo: 'docker' },
      { name: 'Git', color: '#F05033', logo: 'git' },
      { name: 'GitHub', color: '#121011', logo: 'github' },
    ],
  },
  {
    category: 'Design & Tools',
    items: [
      { name: 'Photoshop', color: '#31A8FF', logo: 'adobe photoshop' },
      { name: 'Blender', color: '#F5792A', logo: 'blender' },
      { name: 'Canva', color: '#00C4CC', logo: 'canva' },
      { name: 'Power BI', color: '#F2C811', logo: 'powerbi' },
      { name: 'Postman', color: '#FF6C37', logo: 'postman' },
      { name: 'Playwright', color: '#2EAD33', logo: 'playwright' },
      { name: 'Jira', color: '#0A0FFF', logo: 'jira' },
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
        <div className={`techstack-grid ${vis ? 'in-view' : ''}`}>
          {techStackData.map((group, gi) => (
            <div className="techstack-group" key={group.category} style={{ transitionDelay: `${gi * 0.1}s` }}>
              <h3 className="techstack-group-title">{group.category}</h3>
              <div className="techstack-logos">
                {group.items.map((t) => (
                  <div className="tech-logo-card" key={t.name} data-hover>
                    <img
                      src={`https://img.shields.io/badge/${t.name.replace(/ /g, '%20')}-${t.color.replace('#', '')}?style=for-the-badge&logo=${t.logo}&logoColor=white&labelColor=${t.color.replace('#', '')}`}
                      alt={t.name}
                      loading="lazy"
                    />
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
function DevQuote() {
  const [ref, vis] = useInView()
  return (
    <Section id="quote">
      <div className="section-inner" ref={ref}>
        <div className={`dev-quote-wrapper ${vis ? 'in-view' : ''}`}>
          <p className="section-label">Inspiration</p>
          <h2 className="section-heading">A <span className="gradient-text">daily dose</span> of dev wisdom</h2>
          <div className="quote-frame">
            <img
              src="https://quotes-github-readme.vercel.app/api?type=horizontal&theme=radical"
              alt="Random Dev Quote"
              loading="lazy"
              className="quote-img"
            />
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

/* ──────────── LaserFlow Showcase Section ──────────── */
function LaserFlowShowcase() {
  const [ref, vis] = useInView()
  const revealRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: -9999, y: -9999 })

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setMousePos({ x, y: y + rect.height * 0.5 })
    if (revealRef.current) {
      revealRef.current.style.setProperty('--mx', `${x}px`)
      revealRef.current.style.setProperty('--my', `${y + rect.height * 0.5}px`)
    }
  }

  const handleMouseLeave = () => {
    setMousePos({ x: -9999, y: -9999 })
    if (revealRef.current) {
      revealRef.current.style.setProperty('--mx', '-9999px')
      revealRef.current.style.setProperty('--my', '-9999px')
    }
  }

  return (
    <Section id="interactive">
      <div className="section-inner" ref={ref}>
        <p className="section-label">Interactive 3D</p>
        <h2 className="section-heading">Experience the <span className="gradient-text">LaserFlow</span> effect</h2>
        <div className={`laserflow-showcase ${vis ? 'in-view' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', height: '400px', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
        >
          {/* Background LaserFlow */}
          <LaserFlow
            horizontalBeamOffset={0.1}
            verticalBeamOffset={0.0}
            color="#CF9EFF"
            horizontalSizing={0.5}
            verticalSizing={2}
            wispDensity={1}
            wispSpeed={15}
            wispIntensity={5}
            flowSpeed={0.35}
            flowStrength={0.25}
            fogIntensity={0.45}
            fogScale={0.3}
            fogFallSpeed={0.6}
            decay={1.1}
            falloffStart={1.2}
          />

          {/* Reveal Layer */}
          <div
            ref={revealRef}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 5,
              pointerEvents: 'none',
              '--mx': '-9999px',
              '--my': '-9999px',
              WebkitMaskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              maskImage: 'radial-gradient(circle at var(--mx) var(--my), rgba(255,255,255,1) 0px, rgba(255,255,255,0.95) 60px, rgba(255,255,255,0.6) 120px, rgba(255,255,255,0.25) 180px, rgba(255,255,255,0) 240px)',
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(168,85,247,0.15), rgba(244,114,182,0.15))',
              mixBlendMode: 'screen',
            }}
          />

          {/* Content Overlay */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '86%',
            height: '60%',
            backgroundColor: 'rgba(6, 0, 16, 0.85)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            border: '2px solid #FF79C6',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 6,
            padding: '1.5rem',
            boxShadow: '0 0 40px rgba(255, 121, 198, 0.3)'
          }}>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', textAlign: 'center' }}>
              <span className="gradient-text">Move your mouse</span> to reveal
            </h3>
            <p style={{ fontSize: '1.125rem', color: '#9a96b0', textAlign: 'center', maxWidth: '600px' }}>
              Interactive LaserFlow reveal effect with radial mask. The hidden layer appears as you hover, creating a futuristic reveal animation.
            </p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.3)', borderRadius: '20px', fontSize: '0.875rem', color: '#00e5ff' }}>WebGL Shader</div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '20px', fontSize: '0.875rem', color: '#a855f7' }}>Three.js</div>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(244,114,182,0.1)', border: '1px solid rgba(244,114,182,0.3)', borderRadius: '20px', fontSize: '0.875rem', color: '#f472b6' }}>React</div>
            </div>
          </div>

          {/* Mouse Position Indicator */}
          <div style={{
            position: 'absolute',
            left: mousePos.x - 20,
            top: mousePos.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '2px solid #CF9EFF',
            boxShadow: '0 0 20px #CF9EFF, 0 0 40px #CF9EFF',
            pointerEvents: 'none',
            zIndex: 10,
            opacity: mousePos.x > 0 ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }} />
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
            <a href="#contact" className="btn btn-primary btn-lg" data-hover>Start a Conversation</a>
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

/* ──────────── CONTACT ──────────── */
function Contact() {
  const [ref, vis] = useInView()
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const handleSubmit = (e) => { e.preventDefault(); setSent(true); setTimeout(() => setSent(false), 3000) }
  return (
    <Section id="contact">
      <div className="section-inner" ref={ref}>
        <div className={`contact-grid ${vis ? 'in-view' : ''}`}>
          <div className="contact-info">
            <p className="section-label">Contact</p>
            <h2 className="section-heading">Let's create something <span className="gradient-text">extraordinary</span></h2>
            <p className="contact-text">
              Whether you have a project in mind, want to collaborate on open-source AI systems, or just want to say hello — my inbox is always open.
            </p>
            <div className="contact-links">
              <a href="mailto:waleed@example.com" className="contact-link-item" data-hover>
                <span className="contact-icon-wrap">📧</span>
                <span>waleed@example.com</span>
              </a>
              <a href="https://linkedin.com/in/waleed" target="_blank" rel="noopener" className="contact-link-item" data-hover>
                <span className="contact-icon-wrap">💼</span>
                <span>LinkedIn</span>
              </a>
              <a href="https://instagram.com/waleed" target="_blank" rel="noopener" className="contact-link-item" data-hover>
                <span className="contact-icon-wrap">📸</span>
                <span>Instagram</span>
              </a>
              <a href="https://github.com/waleed" target="_blank" rel="noopener" className="contact-link-item" data-hover>
                <span className="contact-icon-wrap">🐙</span>
                <span>GitHub</span>
              </a>
            </div>
          </div>
          <div className="contact-form-wrapper">
            <div className="contact-form-glow" />
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="cf-name">Name</label>
                <input id="cf-name" type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required data-hover />
              </div>
              <div className="form-group">
                <label htmlFor="cf-email">Email</label>
                <input id="cf-email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required data-hover />
              </div>
              <div className="form-group">
                <label htmlFor="cf-msg">Message</label>
                <textarea id="cf-msg" rows="5" placeholder="Tell me about your project or idea..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required data-hover />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-block" data-hover>
                {sent ? '✦ Message Sent!' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Section>
  )
}

/* ──────────── FOOTER ──────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
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
      {/* Fixed 3D LaserFlow Background */}
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
        <LaserFlow
          horizontalBeamOffset={0.1}
          verticalBeamOffset={0.0}
          color="#CF9EFF"
          horizontalSizing={0.5}
          verticalSizing={2}
          wispDensity={1}
          wispSpeed={15}
          wispIntensity={5}
          flowSpeed={0.35}
          flowStrength={0.25}
          fogIntensity={0.45}
          fogScale={0.3}
          fogFallSpeed={0.6}
          decay={1.1}
          falloffStart={1.2}
        />
      </div>
      
      {/* Content sits above the background */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <Cursor />
        <Nav />
        <Hero />
        <GlowDivider />
        <About />
        <GlowDivider />
        <Skills />
        <GlowDivider />
        <TechStack />
        <GlowDivider />
        <DevQuote />
        <GlowDivider />
        <Projects />
        <GlowDivider />
        <Collaboration />
        <GlowDivider />
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
        <Journey />
        <GlowDivider />
        <Contact />
        <Footer />
      </div>
    </>
  )
}
