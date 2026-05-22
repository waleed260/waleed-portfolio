import { useEffect, useState } from 'react'
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
          <div className="loading-ring" />
          <div className="loading-core" />
        </div>
        <p className="loading-subtitle">Initializing...</p>
        <div className="loading-progress-bar">
          <div className="loading-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
    </div>
  )
}

/* ──────────── Navigation ──────────── */
function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = ['Home', 'Stack', 'Experience', 'Process', 'Contact']

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo">WH<span className="logo-dot">.</span></a>
      <button
        className={`nav-toggle ${menuOpen ? 'open' : ''}`}
        aria-label="Menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span /><span /><span />
      </button>
      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase()}`} onClick={() => setMenuOpen(false)}>{l}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ──────────── Hero ──────────── */
function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <div className="hero-visual">
          <div className="hero-avatar">WH</div>
        </div>
        <div className="hero-text">
          <h1>AI Agent Architect &amp; Systems Builder</h1>
          <p>
            I design and build autonomous AI systems that don&apos;t just respond — they plan,
            orchestrate, and execute complex workflows. From multi-agent orchestration to
            advanced RAG pipelines, every system I build starts with a question:
            <em> &ldquo;What would a truly capable digital teammate look like?&rdquo;</em>
          </p>
          <div className="hero-actions">
            <a href="/resume.pdf" className="btn" target="_blank" rel="noopener noreferrer">My Resume</a>
            <a href="#contact" className="btn btn-outline">Let&apos;s Talk</a>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ──────────── Tech Stack ──────────── */
const techItems = [
  { label: 'Python', icon: 'Py' },
  { label: 'LangChain', icon: 'LC' },
  { label: 'PyTorch', icon: 'PT' },
  { label: 'FastAPI', icon: 'FA' },
  { label: 'Docker', icon: 'Dk' },
  { label: 'PostgreSQL', icon: 'PQ' },
  { label: 'React', icon: 'Rc' },
  { label: 'Node.js', icon: 'Nj' },
  { label: 'n8n', icon: 'n8' },
  { label: 'AWS', icon: 'AW' },
  { label: 'Git', icon: 'Gi' },
  { label: 'Linux', icon: 'Lx' },
]

function TechStack() {
  return (
    <section id="stack" className="section">
      <div className="section-inner">
        <div className="section-label">Technologies</div>
        <h2 className="section-title">Stack</h2>
        <p className="section-desc">The tools I use to build production-grade AI systems.</p>
        <div className="tech-grid">
          {techItems.map(t => (
            <div key={t.label} className="tech-card">
              <span className="tech-icon">{t.icon}</span>
              <span className="tech-label">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────── Experience ──────────── */
const experienceData = [
  {
    company: 'Freelance AI Engineering',
    role: 'Autonomous AI Agent Architect',
    period: '2024 — Present',
    desc: 'Building custom autonomous AI agents and multi-agent orchestration systems for clients. Designing advanced RAG pipelines with retrieval, re-ranking, and synthesis. Developing visual automation workflows using n8n, Zapier, and Make.com.',
  },
  {
    company: 'Independent R&D',
    role: 'AI Systems Researcher',
    period: '2023 — 2024',
    desc: 'Deep-dived into LLMs, prompt engineering, and agentic patterns. Explored neural architecture design with PyTorch. Built experimental agent memory systems and self-improving workflows.',
  },
  {
    company: 'Open-Source Contributions',
    role: 'AI/ML Contributor',
    period: '2022 — 2023',
    desc: 'Contributed to open-source AI frameworks and tooling. Built toolkits for rapid deep learning experimentation. Published research on agent orchestration patterns.',
  },
]

function Experience() {
  const [openIdx, setOpenIdx] = useState(null)

  return (
    <section id="experience" className="section">
      <div className="section-inner">
        <div className="section-label">Career</div>
        <h2 className="section-title">Experience</h2>
        <p className="section-desc">The path from first prompt to production-grade AI orchestration.</p>
        <div className="exp-list">
          {experienceData.map((e, i) => (
            <div
              key={i}
              className={`exp-card ${openIdx === i ? 'expanded' : ''}`}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div className="exp-header">
                <div className="exp-avatar">{e.company.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div className="exp-meta">
                  <h3>{e.role}</h3>
                  <p>{e.company} &middot; {e.period}</p>
                </div>
                <span className="exp-chevron">{openIdx === i ? '−' : '+'}</span>
              </div>
              {openIdx === i && (
                <div className="exp-body">
                  <p>{e.desc}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────── Process ──────────── */
const steps = [
  { num: '01', title: 'Analyze', desc: 'Understand the problem domain, data landscape, and desired outcomes. Define success criteria and system boundaries.' },
  { num: '02', title: 'Architect', desc: 'Design the agent topology — which models, tools, and memory systems to use. Map out orchestration flow and fallback logic.' },
  { num: '03', title: 'Build', desc: 'Develop the core agent logic, RAG pipelines, and tool integrations. Implement orchestration layers and monitoring.' },
  { num: '04', title: 'Deploy', desc: 'Containerize, deploy, and connect to production data sources. Set up CI/CD for continuous improvement.' },
  { num: '05', title: 'Evolve', desc: 'Monitor performance, gather feedback, and iteratively improve. Agents should learn and adapt over time.' },
]

function Process() {
  return (
    <section id="process" className="section">
      <div className="section-inner">
        <div className="section-label">Methodology</div>
        <h2 className="section-title">My Design Process</h2>
        <p className="section-desc">How I take an idea from concept to production-ready AI system.</p>
        <div className="process-grid">
          {steps.map(s => (
            <div key={s.num} className="process-card">
              <span className="process-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ──────────── Contact / CTA ──────────── */
function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="section-inner">
        <div className="contact-card">
          <p className="contact-avail">Available for work</p>
          <h2>Let&apos;s build your next AI system.</h2>
          <a href="mailto:vkdeku20@gmail.com" className="btn btn-contact">Contact Me</a>
        </div>
      </div>
    </section>
  )
}

/* ──────────── Footer ──────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <p>&copy; 2024–2026 Waleed Hassan. All rights reserved.</p>
        <div className="footer-socials">
          <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:vkdeku20@gmail.com">Email</a>
        </div>
      </div>
    </footer>
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
          <Nav />
          <Hero />
          <TechStack />
          <Experience />
          <Process />
          <Contact />
          <Footer />
        </div>
      )}
    </>
  )
}
