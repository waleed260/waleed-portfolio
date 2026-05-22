import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import '../styles/TimelineVisualization.css'

gsap.registerPlugin(ScrollTrigger)

const timelineEvents = [
  {
    year: '2024',
    title: 'The AI Awakening',
    desc: 'Deep dive into LLMs, prompt engineering, and AI-powered applications. Started exploring agentic patterns.',
    side: 'left',
    icon: '⚡',
  },
  {
    year: '2025',
    title: 'Multi-Agent Orchestration',
    desc: 'Architected advanced multi-agent systems with LangChain and custom layers. Built RAG pipelines.',
    side: 'right',
    icon: '🔗',
  },
  {
    year: '2025',
    title: 'Visual Automation Mastery',
    desc: 'Mastered n8n, Zapier, Make.com for rapid automation. Integrated voice AI agents with Vapi.',
    side: 'left',
    icon: '⚙️',
  },
  {
    year: '2026',
    title: 'Advanced Deep Learning',
    desc: 'Exploring neural architecture design, transfer learning, and PyTorch-based toolkits.',
    side: 'right',
    icon: '🧠',
  },
]

export default function TimelineVisualization() {
  const containerRef = useRef(null)
  const trackRef = useRef(null)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Handle scroll for camera panning effect
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const sectionTop = rect.top
      const sectionHeight = rect.height

      // Calculate progress (0 to 1)
      const progress =
        1 -
        Math.max(
          0,
          Math.min(
            1,
            (sectionTop - window.innerHeight * 0.3) / (sectionHeight - window.innerHeight * 0.6)
          )
        )

      setScrollProgress(progress)

      // Camera pan effect
      if (trackRef.current) {
        trackRef.current.style.transform = `translateZ(${progress * 100}px) scaleY(${0.8 + progress * 0.2})`
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Stagger animation for events
  useEffect(() => {
    const events = containerRef.current?.querySelectorAll('.timeline-event')
    if (!events) return

    events.forEach((event, idx) => {
      gsap.from(event, {
        scrollTrigger: {
          trigger: event,
          start: 'top center+=100',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        x: idx % 2 === 0 ? -50 : 50,
        duration: 0.8,
        ease: 'power3.out',
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <div ref={containerRef} className="timeline-visualization">
      <div className="timeline-track" ref={trackRef}>
        {/* Center pipeline */}
        <div className="pipeline-center">
          <div className="pipeline-line" />
          <div className="pipeline-glow" />
        </div>

        {/* Timeline events */}
        <div className="timeline-events">
          {timelineEvents.map((event, idx) => (
            <div
              key={idx}
              className={`timeline-event event-${event.side}`}
              style={{ '--event-index': idx }}
            >
              <div className="event-marker">
                <div className="marker-icon">{event.icon}</div>
                <div className="marker-year">{event.year}</div>
              </div>

              <div className="event-content">
                <h3 className="event-title">{event.title}</h3>
                <p className="event-desc">{event.desc}</p>
              </div>

              <div className="event-connector" />
            </div>
          ))}
        </div>
      </div>

      {/* Scroll progress indicator */}
      <div className="timeline-progress">
        <div
          className="progress-bar"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>
    </div>
  )
}
