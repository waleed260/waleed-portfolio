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
  'Python', 'LangChain', 'PyTorch', 'FastAPI', 'Docker',
  'PostgreSQL', 'React', 'Node.js', 'n8n',
  'Git', 'Linux', 'Make.com', 'Vapi', 'Zapier',
]

function TechIcon({ name }) {
  const devicon = {
    Python: 'python/python-original',
    PyTorch: 'pytorch/pytorch-original',
    FastAPI: 'fastapi/fastapi-original',
    Docker: 'docker/docker-original',
    PostgreSQL: 'postgresql/postgresql-original',
    React: 'react/react-original',
    'Node.js': 'nodejs/nodejs-original',
    Git: 'git/git-original',
    Linux: 'linux/linux-original',
  }
  const dev = devicon[name]
  if (dev) {
    return <img className="tech-logo" src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${dev}.svg`} alt="" />
  }
  if (name === 'LangChain') {
    return <img className="tech-logo" src="https://cdn.simpleicons.org/langchain" alt="" />
  }
  if (name === 'n8n') {
    return <img className="tech-logo" src="https://cdn.simpleicons.org/n8n" alt="" />
  }
  if (name === 'Make.com') {
    return <img className="tech-logo" src="https://cdn.simpleicons.org/make" alt="" />
  }
  if (name === 'Zapier') {
    return <img className="tech-logo" src="https://cdn.simpleicons.org/zapier" alt="" />
  }
  if (name === 'Vapi') {
    return <span className="tech-initial" style={{ background: '#7c3aed' }}>Vp</span>
  }
  return null
}

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
              <TechIcon name={t} />
              {t}
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
            <a href="mailto:vkdeku20@gmail.com" className="contact-icon" target="_blank" rel="noreferrer">
              <svg className="contact-logo" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" className="contact-icon" target="_blank" rel="noreferrer">
              <svg className="contact-logo" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a href="https://github.com/waleed260" className="contact-icon" target="_blank" rel="noreferrer">
              <svg className="contact-logo" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
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
