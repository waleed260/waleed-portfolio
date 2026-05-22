import { useEffect, useState } from 'react'
import './App.css'

const techStack = [
  'Python', 'LangChain', 'PyTorch', 'FastAPI', 'Docker',
  'PostgreSQL', 'React', 'Node.js', 'n8n', 'AWS',
  'Git', 'Linux', 'Make.com', 'Vapi', 'Zapier',
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
        <div className="hero-left">
          <img src="/profile.png" alt="Waleed Hassan" className="hero-avatar" />
        </div>
        <div className="hero-right">
          <p className="hero-greeting">Hi, I&apos;m</p>
          <h1 className="hero-name">Waleed Hassan</h1>
          <p className="hero-roles">
            <span>Agentic AI Developer</span>
            <span className="hero-sep">|</span>
            <span>Digital FTE Creator</span>
            <span className="hero-sep">|</span>
            <span>AI Automation Expert</span>
          </p>
          <p className="hero-bio">
            I design and build autonomous AI systems that don&apos;t just respond — they plan,
            orchestrate, and execute. From multi-agent swarms to intelligent automation workflows,
            every system I build transforms complexity into capability at scale.
          </p>
          <div className="hero-btns">
            <a href="#contact" className="btn">Let&apos;s Talk</a>
            <a href="/resume.pdf" className="btn btn-outline" target="_blank">My Resume</a>
          </div>
        </div>
      </div>
      <div className="tech-marquee">
        <div className="tech-track">
          {[...techStack, ...techStack].map((t, i) => (
            <span key={i} className="tech-chip">{t}</span>
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
        <div className="sec-side">
          <p className="sec-label">CAREER</p>
          <h2>Experience</h2>
          <p className="sec-desc">The path from first prompt to production-grade AI orchestration.</p>
        </div>
        <div className="sec-main">
          <div className="exp-list">
            {experienceData.map((e, i) => (
              <div key={i} className={`exp-card ${idx === i ? 'open' : ''}`} onClick={() => setIdx(idx === i ? null : i)}>
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
        <p className="sec-label">STEPS I FOLLOW</p>
        <h2>My Design Process</h2>
        <p className="sec-desc">How I take an idea from concept to production-ready AI system.</p>
        <div className="process-grid">
          {steps.map(s => (
            <div key={s.num} className="step-card">
              <span className="step-num">{s.num}</span>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const communityOffers = [
  { title: 'Mentoring', desc: 'Get connected with a mentor to help pave your AI engineering career path.' },
  { title: 'Opportunities', desc: 'Access internships, freelance gigs, and job opportunities in AI and automation.' },
  { title: 'Free Resources', desc: 'Get free resources on AI agents, RAG systems, and workflow automation.' },
  { title: 'Help & Reviews', desc: 'Get your AI projects and portfolios reviewed by industry experts.' },
]

function Community() {
  return (
    <section id="contact" className="section">
      <div className="sec-inner community-layout">
        <div className="community-cards">
          {communityOffers.map((c, i) => (
            <div key={i} className="community-card">
              <h5>{c.title}</h5>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
        <div className="community-text">
          <p className="sec-label">COMMUNITY WORK</p>
          <h2>Building an AI Engineering Community</h2>
          <p className="sec-desc">
            I&apos;m building a community of AI engineers, automation experts, and creators who share
            knowledge, resources, and opportunities. Let&apos;s grow together.
          </p>
          <div className="stats">
            <div><span>500+</span><p>Community Members</p></div>
            <div><span>20+</span><p>Events Conducted</p></div>
            <div><span>3</span><p>Years Active</p></div>
          </div>
          <a href="mailto:vkdeku20@gmail.com" className="btn">Join Community</a>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer>
      <div className="cta">
        <p className="cta-avail">Available for work</p>
        <h2>Let&apos;s build your next AI system.</h2>
        <a href="mailto:vkdeku20@gmail.com" className="btn">Contact Me</a>
      </div>
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
          <Community />
          <Footer />
        </div>
      )}
    </>
  )
}
