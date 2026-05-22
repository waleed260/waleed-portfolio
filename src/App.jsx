import { useEffect, useRef, useState } from 'react'
import './App.css'

const BASE = import.meta.env.BASE_URL

/* ─── Reveal on Scroll ─── */
function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShow(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${show ? 'reveal-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

const techStack = [
  { name: 'Python', icon: 'python' },
  { name: 'LangChain', icon: 'langchain' },
  { name: 'PyTorch', icon: 'pytorch' },
  { name: 'FastAPI', icon: 'fastapi' },
  { name: 'Docker', icon: 'docker' },
  { name: 'PostgreSQL', icon: 'postgresql' },
  { name: 'React', icon: 'react' },
  { name: 'Node.js', icon: 'nodedotjs' },
  { name: 'n8n', icon: 'n8n' },
  { name: 'AWS', icon: 'amazonwebservices' },
  { name: 'Git', icon: 'git' },
  { name: 'Linux', icon: 'linux' },
  { name: 'Make.com', icon: 'make' },
  { name: 'Vapi', icon: 'vapi' },
  { name: 'Zapier', icon: 'zapier' },
]

function LoadingScreen({ done }) {
  const [progress, setProgress] = useState(0)
  const [fade, setFade] = useState(false)

  useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(t); setFade(true); setTimeout(done, 600); return 100 }
        return p + Math.random() * 15 + 5
      })
    }, 200)
    return () => clearInterval(t)
  }, [done])

  return (
    <div className={`loading ${fade ? 'fade' : ''}`}>
      <div className="loading-ring" />
      <p>Initializing</p>
      <div className="loading-bar"><div className="loading-fill" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const links = ['Home', 'Stack', 'Process', 'Contact']

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <a href="#hero" className="nav-logo">WH<span className="dot">.</span></a>
      <button className={`nav-toggle ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
        <span /><span /><span />
      </button>
      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(l => (
          <li key={l}><a href={`#${l.toLowerCase()}`} onClick={() => setOpen(false)}>{l}</a></li>
        ))}
      </ul>
    </nav>
  )
}

function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero-inner">
        <Reveal className="hero-left">
          <img src={`${BASE}profile.png`} alt="Waleed Hassan" className="hero-avatar" />
        </Reveal>
        <div className="hero-right">
          <Reveal delay={100}><p className="hero-greeting">Hi, I&apos;m</p></Reveal>
          <Reveal delay={200}><h1 className="hero-name">Waleed Hassan</h1></Reveal>
          <Reveal delay={300}><p className="hero-roles">
            <span>Agentic AI Developer</span>
            <span className="hero-sep">|</span>
            <span>Digital FTE Creator</span>
            <span className="hero-sep">|</span>
            <span>AI Automation Expert</span>
          </p></Reveal>
          <Reveal delay={400}><p className="hero-bio">
            I design and build autonomous AI systems that don&apos;t just respond — they plan,
            orchestrate, and execute. From multi-agent swarms to intelligent automation workflows,
            every system I build transforms complexity into capability at scale.
          </p></Reveal>
          <Reveal delay={500}><div className="hero-btns">
            <a href="#contact" className="btn">Let&apos;s Talk</a>
            <a href={`${BASE}resume.pdf`} className="btn btn-outline" target="_blank" rel="noreferrer">My Resume</a>
          </div></Reveal>
        </div>
      </div>
      <div className="tech-marquee">
        <div className="tech-track">
          {[...techStack, ...techStack].map((t, i) => (
            <span key={i} className="tech-chip">
              <img src={`https://cdn.simpleicons.org/${t.icon}`} alt="" className="tech-logo" />
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

const experienceData = [
  {
    role: 'Autonomous AI Agent Architect',
    company: 'Freelance Engineering',
    period: '2024 — Present',
    desc: 'Building custom autonomous AI agents and multi-agent orchestration systems. Designing advanced RAG pipelines with retrieval, re-ranking, and synthesis. Developing visual automation workflows using n8n, Make.com, and Zapier.',
  },
  {
    role: 'AI Systems Researcher',
    company: 'Independent R&D',
    period: '2023 — 2024',
    desc: 'Deep-dived into LLMs, prompt engineering, and agentic patterns. Built agent memory systems, tool-use frameworks, and self-improving workflows. Explored neural architecture design with PyTorch.',
  },
  {
    role: 'AI/ML Contributor',
    company: 'Open Source',
    period: '2022 — 2023',
    desc: 'Contributed to open-source AI tooling and frameworks. Built toolkits for rapid deep learning experimentation. Published research on agent orchestration and multi-agent communication patterns.',
  },
]

function Experience() {
  const [idx, setIdx] = useState(null)

  return (
    <section id="stack" className="section">
      <div className="sec-inner">
        <Reveal className="sec-side">
          <p className="sec-label shimmer-text">CAREER</p>
          <h2>Experience</h2>
          <p className="sec-desc">The path from first prompt to production-grade AI orchestration.</p>
        </Reveal>
        <div className="sec-main">
          <div className="exp-list">
            {experienceData.map((e, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className={`exp-card ${idx === i ? 'open' : ''}`} onClick={() => setIdx(idx === i ? null : i)}>
                  <div className="exp-top">
                    <div className="exp-icon">{e.company.split(' ').map(w => w[0]).join('')}</div>
                    <div className="exp-info">
                      <h3>{e.role}</h3>
                      <p>{e.company} &middot; {e.period}</p>
                    </div>
                    <span className="exp-chev">{idx === i ? '−' : '+'}</span>
                  </div>
                  {idx === i && <div className="exp-body"><p>{e.desc}</p></div>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const steps = [
  { num: '01', title: 'Analyze', desc: 'Understand the problem domain, data landscape, and desired outcomes. Define success criteria and system boundaries.' },
  { num: '02', title: 'Architect', desc: 'Design the agent topology — models, tools, memory systems. Map orchestration flow and fallback logic.' },
  { num: '03', title: 'Build', desc: 'Develop core agent logic, RAG pipelines, and tool integrations. Implement orchestration layers and monitoring.' },
  { num: '04', title: 'Deploy', desc: 'Containerize, deploy, and connect to production data sources. Set up CI/CD for continuous improvement.' },
  { num: '05', title: 'Evolve', desc: 'Monitor performance, gather feedback, and iteratively improve. Agents should learn and adapt over time.' },
]

function Process() {
  return (
    <section id="process" className="section">
      <div className="sec-inner">
        <Reveal>
          <p className="sec-label shimmer-text">STEPS I FOLLOW</p>
          <h2>My Design Process</h2>
          <p className="sec-desc">How I take an idea from concept to production-ready AI system.</p>
        </Reveal>
        <div className="process-grid">
          {steps.map((s, i) => (
            <Reveal key={s.num} delay={i * 80}>
              <div className="step-card">
                <span className="step-num">{s.num}</span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="sec-inner">
        <Reveal>
          <p className="sec-label shimmer-text">GET IN TOUCH</p>
          <h2 className="contact-heading">
            Have a project, an idea, or a problem that needs <span className="text-highlight">intelligent automation?</span>
          </h2>
          <p className="contact-desc">
            I&apos;m always open to collaborating on ambitious AI projects, discussing agentic systems,
            or exploring how autonomous workflows can transform your business. Whether you need a
            custom RAG pipeline, a multi-agent orchestrator, or an end-to-end automation strategy —
            let&apos;s talk.
          </p>
          <div className="contact-details">
            <div className="contact-item">
              <span className="contact-label">Email</span>
              <a href="mailto:vkdeku20@gmail.com" className="contact-value">vkdeku20@gmail.com</a>
            </div>
            <div className="contact-item">
              <span className="contact-label">LinkedIn</span>
              <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noreferrer" className="contact-value">Waleed Hassan</a>
            </div>
            <div className="contact-item">
              <span className="contact-label">GitHub</span>
              <a href="https://github.com/waleed260" target="_blank" rel="noreferrer" className="contact-value">waleed260</a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <Reveal>
        <div className="cta">
          <p className="cta-avail shimmer-text">Available for work</p>
          <h2>Let&apos;s build your next AI system.</h2>
          <a href="mailto:vkdeku20@gmail.com" className="btn">Contact Me</a>
        </div>
      </Reveal>
      <div className="footer-bottom">
        <p>&copy; 2024–2026 Waleed Hassan. All rights reserved.</p>
        <div className="socials">
          <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="https://github.com/waleed260" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="mailto:vkdeku20@gmail.com">Email</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2800)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      {!ready && <LoadingScreen done={() => setReady(true)} />}
      {ready && (
        <div className="app">
          <Nav />
          <Hero />
          <Experience />
          <Process />
          <Contact />
          <Footer />
        </div>
      )}
    </>
  )
}
