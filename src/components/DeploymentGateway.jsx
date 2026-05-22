import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import '../styles/DeploymentGateway.css'

export default function DeploymentGateway() {
  const gatewayRef = useRef(null)
  const terminalRef = useRef(null)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [isDeployed, setIsDeployed] = useState(false)
  const [terminalLines, setTerminalLines] = useState([
    '[GATEWAY] Deployment Interface Online',
    '[STATUS] Awaiting connection...',
  ])

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    addTerminalLine(`[INPUT] ${name}: "${value}"`)
  }

  // Add terminal line
  const addTerminalLine = (line) => {
    setTerminalLines((prev) => [...prev, line])
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    addTerminalLine('[DEPLOY] Initializing connection protocol...')
    addTerminalLine('[HANDSHAKE] Authenticating sender...')
    await new Promise((r) => setTimeout(r, 500))

    addTerminalLine(`[CONNECT] Name: ${formData.name}`)
    addTerminalLine(`[CONNECT] Email: ${formData.email}`)
    await new Promise((r) => setTimeout(r, 300))

    addTerminalLine('[TRANSMIT] Message encoding...')
    await new Promise((r) => setTimeout(r, 400))

    addTerminalLine('[DEPLOY] Sending deployment signal...')
    await new Promise((r) => setTimeout(r, 600))

    addTerminalLine('[SUCCESS] Deployment complete! ✓')
    addTerminalLine('[GATEWAY] Message received. Standing by for response.')

    setIsDeployed(true)
    gsap.to('.deploy-button', {
      background: 'rgba(200, 200, 200, 0.2)',
      borderColor: 'rgba(200, 200, 200, 0.6)',
      duration: 0.5,
    })

    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setIsDeployed(false)
      setTerminalLines(['[GATEWAY] Deployment Interface Online', '[STATUS] Awaiting connection...'])
    }, 3000)
  }

  // Animate gateway on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.to(gatewayRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
          })
        }
      },
      { threshold: 0.2 }
    )

    if (gatewayRef.current) {
      observer.observe(gatewayRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={gatewayRef} className="deployment-gateway" style={{ opacity: 0, y: 40 }}>
      <div className="gateway-header">
        <h2>Deployment Gateway</h2>
        <p>Execute collaboration protocol</p>
      </div>

      <div className="gateway-grid">
        {/* Terminal Interface */}
        <div className="gateway-terminal">
          <div className="terminal-header">
            <span className="terminal-title">deployment.log</span>
            <div className="terminal-controls">
              <div className="terminal-dot dot-1" />
              <div className="terminal-dot dot-2" />
              <div className="terminal-dot dot-3" />
            </div>
          </div>
          <div ref={terminalRef} className="terminal-output">
            {terminalLines.map((line, idx) => (
              <div key={idx} className="terminal-line">
                <span className={`line-prefix ${line.includes('[SUCCESS]') ? 'success' : ''}`}>
                  {line.includes('[') ? line.split(']')[0] + ']' : '>'}
                </span>
                <span className="line-text">{line}</span>
              </div>
            ))}
            {!isDeployed && <div className="line-cursor" />}
          </div>
        </div>

        {/* Deployment Form */}
        <form onSubmit={handleSubmit} className="gateway-form">
          <div className="form-field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your identity"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="contact@example.com"
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Describe your collaboration intent..."
              rows="5"
              required
            />
          </div>

          <button type="submit" className="deploy-button" disabled={isDeployed}>
            <span className="button-text">Execute Deployment</span>
            <span className="button-glow" />
          </button>
        </form>
      </div>

      <div className="gateway-footer">
        <p>
          <strong>Alternative Channels:</strong> Email me at{' '}
          <a href="mailto:vkdeku20@gmail.com">vkdeku20@gmail.com</a> or connect on{' '}
          <a href="https://linkedin.com/in/waleed-hassan-20438b3a8/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </p>
      </div>
    </div>
  )
}
