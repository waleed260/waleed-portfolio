import { useState, useEffect, useMemo } from 'react'

const EMOTIONS = {
  calm:     { body: '#00e5ff', label: 'Calm' },
  happy:    { body: '#a855f7', label: 'Happy' },
  excited:  { body: '#f472b6', label: 'Excited' },
  thinking: { body: '#4d7cff', label: 'Thinking' },
}
const KEYS = Object.keys(EMOTIONS)

function Eye({ side }) {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    const t = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3000 + Math.random() * 2000)
    return () => clearInterval(t)
  }, [])
  return (
    <div style={{
      position: 'absolute',
      [side === 'left' ? 'left' : 'right']: '24%',
      top: '28%',
      width: 20,
      height: blink ? 2 : 20,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 0 8px rgba(255,255,255,0.5)',
      transition: 'height 0.1s ease',
      overflow: 'hidden',
    }}>
      {!blink && (
        <div style={{
          position: 'absolute',
          [side === 'left' ? 'right' : 'left']: 2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: '#0d0d1a',
        }}>
          <div style={{
            position: 'absolute',
            top: 1,
            [side === 'left' ? 'left' : 'right']: 1,
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: '#fff',
          }} />
        </div>
      )}
    </div>
  )
}

export default function Robot3D() {
  const [emotion, setEmotion] = useState('calm')
  const [dancing, setDancing] = useState(false)
  const e = EMOTIONS[emotion]
  const c = e.body

  // scroll-based emotion
  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setEmotion(KEYS[Math.min(Math.floor(p * KEYS.length), KEYS.length - 1)])
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  // idle cycle + dance
  useEffect(() => {
    let i = 0
    const t = setInterval(() => {
      i = (i + 1) % KEYS.length
      setEmotion(KEYS[i])
      setDancing(true)
      setTimeout(() => setDancing(false), 1200)
    }, 8000)
    return () => clearInterval(t)
  }, [])

  // pre-compute sparkle positions (stable across renders)
  const sparkles = useMemo(() =>
    Array.from({ length: 8 }, (_, i) => ({
      angle: (i / 8) * 360,
      dist: 38 + Math.random() * 12,
      size: 2 + Math.random() * 2,
      speed: 1.5 + Math.random() * 1,
    })), [])

  return (
    <div style={{
      position: 'fixed',
      right: 14,
      bottom: 14,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {/* robot wrapper */}
      <div style={{
        width: 100,
        height: 100,
        position: 'relative',
        animation: dancing ? 'robotDance 1.2s ease-in-out' : 'robotFloat 3s ease-in-out infinite',
      }}>
        {/* outer glow */}
        <div style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c}22 0%, transparent 70%)`,
          animation: 'robotPulse 2s ease-in-out infinite',
        }} />

        {/* body */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${c}33, ${c})`,
          boxShadow: `0 0 24px ${c}44, 0 0 48px ${c}1a, inset 0 -8px 16px rgba(0,0,0,0.2)`,
        }} />

        {/* blush */}
        <div style={{ position: 'absolute', left: '16%', top: '48%', width: 14, height: 10, borderRadius: '50%', background: 'rgba(255,107,138,0.3)' }} />
        <div style={{ position: 'absolute', right: '16%', top: '48%', width: 14, height: 10, borderRadius: '50%', background: 'rgba(255,107,138,0.3)' }} />

        {/* mouth */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '58%',
          transform: 'translateX(-50%)',
          width: 18,
          height: emotion === 'excited' ? 10 : 5,
          borderBottomLeftRadius: emotion === 'excited' ? 8 : 2,
          borderBottomRightRadius: emotion === 'excited' ? 8 : 2,
          background: '#1a1a2e',
          overflow: 'hidden',
        }} />

        {/* eyes */}
        <Eye side="left" />
        <Eye side="right" />

        {/* antenna */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: -16,
          transform: 'translateX(-50%)',
          animation: 'antennaWiggle 2s ease-in-out infinite',
          transformOrigin: 'bottom center',
        }}>
          <div style={{ width: 2, height: 14, background: '#6a6a80', borderRadius: 1 }} />
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: c,
            boxShadow: `0 0 8px ${c}cc, 0 0 16px ${c}66`,
            margin: '0 auto',
            animation: 'antennaGlow 1.5s ease-in-out infinite',
          }} />
        </div>

        {/* arms */}
        <div style={{
          position: 'absolute',
          left: -7,
          top: '42%',
          width: 10,
          height: 20,
          borderRadius: 5,
          background: c,
          transformOrigin: 'top center',
          animation: dancing ? 'armWave 0.3s ease-in-out infinite alternate' : 'armSway 3s ease-in-out infinite',
          boxShadow: `0 0 6px ${c}33`,
        }} />
        <div style={{
          position: 'absolute',
          right: -7,
          top: '42%',
          width: 10,
          height: 20,
          borderRadius: 5,
          background: c,
          transformOrigin: 'top center',
          animation: dancing ? 'armWave 0.3s ease-in-out infinite alternate-reverse' : 'armSway 3s ease-in-out infinite 0.5s',
          boxShadow: `0 0 6px ${c}33`,
        }} />

        {/* legs */}
        <div style={{
          position: 'absolute',
          left: '30%',
          bottom: -7,
          width: 11,
          height: 14,
          borderRadius: 6,
          background: c,
          boxShadow: `0 0 6px ${c}33`,
        }} />
        <div style={{
          position: 'absolute',
          right: '30%',
          bottom: -7,
          width: 11,
          height: 14,
          borderRadius: 6,
          background: c,
          boxShadow: `0 0 6px ${c}33`,
        }} />

        {/* sparkles */}
        {sparkles.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `calc(50% + ${Math.cos(s.angle * Math.PI / 180) * s.dist}px)`,
            top: `calc(50% + ${Math.sin(s.angle * Math.PI / 180) * s.dist}px)`,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: c,
            boxShadow: `0 0 ${s.size * 2}px ${c}99`,
            animation: `sparkleFloat ${s.speed}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>

      {/* label */}
      <div style={{
        textAlign: 'center',
        fontSize: 9,
        color: c,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(6px)',
        padding: '2px 8px',
        borderRadius: 8,
        border: `1px solid ${c}33`,
        marginTop: 4,
        transition: 'color 0.6s, border-color 0.6s',
      }}>
        {e.label}
      </div>
    </div>
  )
}
