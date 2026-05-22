import { useRef, useEffect, useState } from 'react'
import gsap from 'gsap'
import '../styles/NodeBasedArchitecture.css'

export default function NodeBasedArchitecture() {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const nodesRef = useRef([])
  const [isExpanded, setIsExpanded] = useState(false)

  const nodes = [
    { id: 'core', label: 'AI Core', icon: '🤖', color: '#00e5ff', x: 0.5, y: 0.5, size: 60 },
    { id: 'python', label: 'Python', icon: '🐍', color: '#a855f7', x: 0.2, y: 0.25, size: 45 },
    { id: 'pytorch', label: 'PyTorch', icon: '🔥', color: '#f472b6', x: 0.8, y: 0.25, size: 45 },
    { id: 'langchain', label: 'LangChain', icon: '🔗', color: '#10b981', x: 0.15, y: 0.75, size: 45 },
    { id: 'n8n', label: 'n8n', icon: '⚙️', color: '#f59e0b', x: 0.5, y: 0.85, size: 45 },
    { id: 'langgraph', label: 'LangGraph', icon: '📊', color: '#06b6d4', x: 0.85, y: 0.75, size: 45 },
  ]

  // Initialize nodes
  useEffect(() => {
    nodesRef.current = nodes.map((node) => ({
      ...node,
      vx: 0,
      vy: 0,
      px: node.x,
      py: node.y,
    }))
  }, [])

  // Draw network
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = containerRef.current?.getBoundingClientRect()
    canvas.width = rect?.width || 400
    canvas.height = rect?.height || 500

    const ctx = canvas.getContext('2d')
    let animationId

    const drawNetwork = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const nodes = nodesRef.current

      // Draw connections
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)'
      ctx.lineWidth = 1.5
      nodes.forEach((node, i) => {
        nodes.forEach((other, j) => {
          if (i < j) {
            const dx = (other.x - node.x) * canvas.width
            const dy = (other.y - node.y) * canvas.height
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 300) {
              ctx.globalAlpha = 1 - dist / 300
              ctx.beginPath()
              ctx.moveTo(node.x * canvas.width, node.y * canvas.height)
              ctx.lineTo(other.x * canvas.width, other.y * canvas.height)
              ctx.stroke()
            }
          }
        })
      })
      ctx.globalAlpha = 1

      // Draw nodes
      nodes.forEach((node) => {
        const x = node.x * canvas.width
        const y = node.y * canvas.height

        // Glow effect
        const grad = ctx.createRadialGradient(x, y, 0, x, y, node.size * 2)
        grad.addColorStop(0, node.color + '40')
        grad.addColorStop(1, node.color + '00')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(x, y, node.size * 2, 0, Math.PI * 2)
        ctx.fill()

        // Node circle
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, node.size, 0, Math.PI * 2)
        ctx.stroke()

        // Node fill
        ctx.fillStyle = node.color + '20'
        ctx.fill()

        // Text
        ctx.fillStyle = '#fff'
        ctx.font = '16px Monaco'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(node.icon, x, y)
      })

      animationId = requestAnimationFrame(drawNetwork)
    }

    drawNetwork()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Expand animation
  useEffect(() => {
    if (!isExpanded) return

    nodesRef.current.forEach((node, idx) => {
      const targetNode = nodes[idx]
      gsap.to(node, {
        x: targetNode.x,
        y: targetNode.y,
        duration: 1.2,
        ease: 'elastic.out(1, 0.75)',
        delay: idx * 0.1,
      })
    })
  }, [isExpanded])

  const handleScroll = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const isVisible = rect.top < window.innerHeight * 0.7
      setIsExpanded(isVisible)
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div ref={containerRef} className="node-based-architecture">
      <canvas ref={canvasRef} className="network-canvas" />
      <div className="node-labels">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`node-label ${isExpanded ? 'visible' : ''}`}
            style={{
              '--delay': `${nodes.indexOf(node) * 0.08}s`,
            }}
          >
            <div className="label-dot" style={{ borderColor: node.color }} />
            <span>{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
