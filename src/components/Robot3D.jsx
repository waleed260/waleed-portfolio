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
      [side === 'left' ? 'left' : 'right']: '22%',
      top: '26%',
      width: 24,
      height: blink ? 2 : 24,
      borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 0 10px rgba(255,255,255,0.7), inset 0 -2px 4px rgba(0,0,0,0.1)',
      transition: 'height 0.12s ease',
      overflow: 'hidden',
      zIndex: 3,
    }}>
      {!blink && (
        <div style={{
          position: 'absolute',
          [side === 'left' ? 'right' : 'left']: 2,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 12,
          height: 12,
          borderRadius: '50%',
          background: '#0d0d1a',
          boxShadow: 'inset 0 1px 3px rgba(255,255,255,0.1)',
        }}>
          <div style={{
            position: 'absolute',
            top: 1,
            [side === 'left' ? 'left' : 'right']: 1,
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: '#fff',
            boxShadow: '0 0 3px rgba(255,255,255,0.8)',
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

  useEffect(() => {
    const h = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setEmotion(KEYS[Math.min(Math.floor(p * KEYS.length), KEYS.length - 1)])
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

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

  const sparkles = useMemo(() =>
    Array.from({ length: 10 }, (_, i) => ({
      angle: (i / 10) * 360,
      dist: 48 + Math.random() * 16,
      size: 2.5 + Math.random() * 2.5,
      speed: 1.2 + Math.random() * 1,
    })), [])

  return (
    <div style={{
      position: 'fixed',
      right: 14,
      bottom: 14,
      zIndex: 9999,
      pointerEvents: 'none',
      perspective: '600px',
    }}>
      <div style={{
        width: 90,
        height: 90,
        position: 'relative',
        animation: dancing ? 'robotDance 1.2s ease-in-out' : 'robotFloat3D 3s ease-in-out infinite',
        transformStyle: 'preserve-3d',
      }}>
        {/* outer glow */}
        <div style={{
          position: 'absolute',
          inset: -14,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${c}22 0%, transparent 70%)`,
          animation: 'robotPulse 2s ease-in-out infinite',
        }} />

        {/* shadow disc */}
        <div style={{
          position: 'absolute',
          left: '10%',
          right: '10%',
          bottom: -14,
          height: 10,
          borderRadius: '50%',
          background: `radial-gradient(ellipse, ${c}33 0%, transparent 70%)`,
          filter: 'blur(3px)',
          animation: 'shadowPulse 3s ease-in-out infinite',
        }} />

        {/* 3D body — front hemisphere */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `
            radial-gradient(ellipse at 30% 20%, ${c}55 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${c} 40%, ${c}aa 70%, ${c}66 100%)
          `,
          boxShadow: `
            0 0 30px ${c}66,
            0 0 60px ${c}33,
            0 0 100px ${c}1a,
            inset 0 -12px 24px rgba(0,0,0,0.35),
            inset 0 6px 12px rgba(255,255,255,0.15)
          `,
          zIndex: 1,
        }} />

        {/* 3D highlight rim — top edge */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 35% 15%, rgba(255,255,255,0.25) 0%, transparent 55%)`,
          zIndex: 2,
        }} />

        {/* 3D shadow rim — bottom edge */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: `radial-gradient(ellipse at 50% 90%, rgba(0,0,0,0.3) 0%, transparent 50%)`,
          zIndex: 2,
        }} />

        {/* blush cheeks */}
        <div style={{ position: 'absolute', left: '14%', top: '50%', width: 16, height: 11, borderRadius: '50%', background: 'rgba(255,107,138,0.35)', zIndex: 3, boxShadow: '0 0 6px rgba(255,107,138,0.2)' }} />
        <div style={{ position: 'absolute', right: '14%', top: '50%', width: 16, height: 11, borderRadius: '50%', background: 'rgba(255,107,138,0.35)', zIndex: 3, boxShadow: '0 0 6px rgba(255,107,138,0.2)' }} />

        {/* mouth */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '60%',
          transform: 'translateX(-50%)',
          width: 22,
          height: emotion === 'excited' ? 12 : 6,
          borderBottomLeftRadius: emotion === 'excited' ? 10 : 3,
          borderBottomRightRadius: emotion === 'excited' ? 10 : 3,
          background: '#1a1a2e',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          zIndex: 3,
        }} />

        {/* eyes */}
        <Eye side="left" />
        <Eye side="right" />

        {/* antenna */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: -20,
          transform: 'translateX(-50%)',
          animation: 'antennaWiggle 2s ease-in-out infinite',
          transformOrigin: 'bottom center',
          zIndex: 4,
          filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.3))',
        }}>
          <div style={{
            width: 3,
            height: 18,
            background: 'linear-gradient(to top, #5a5a70, #8a8aa0)',
            borderRadius: 2,
            boxShadow: '0 0 4px rgba(0,0,0,0.3), inset 0 0 2px rgba(255,255,255,0.1)',
          }} />
          <div style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, #fff4, ${c})`,
            boxShadow: `0 0 10px ${c}cc, 0 0 20px ${c}66, 0 0 30px ${c}33, inset 0 -2px 4px rgba(0,0,0,0.3)`,
            margin: '0 auto',
            animation: 'antennaGlow 1.5s ease-in-out infinite',
          }} />
        </div>

        {/* left arm */}
        <div style={{
          position: 'absolute',
          left: -10,
          top: '40%',
          width: 14,
          height: 24,
          borderRadius: 7,
          background: `linear-gradient(135deg, ${c}88, ${c})`,
          boxShadow: `0 0 8px ${c}44, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)`,
          transformOrigin: 'top center',
          animation: dancing ? 'armWave 0.3s ease-in-out infinite alternate' : 'armSway 3s ease-in-out infinite',
          zIndex: 0,
        }}>
          {/* hand */}
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${c}88, ${c})`,
            boxShadow: `0 0 6px ${c}33, inset 0 -2px 3px rgba(0,0,0,0.2)`,
          }} />
        </div>

        {/* right arm */}
        <div style={{
          position: 'absolute',
          right: -10,
          top: '40%',
          width: 14,
          height: 24,
          borderRadius: 7,
          background: `linear-gradient(135deg, ${c}88, ${c})`,
          boxShadow: `0 0 8px ${c}44, inset 0 -3px 6px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.1)`,
          transformOrigin: 'top center',
          animation: dancing ? 'armWave 0.3s ease-in-out infinite alternate-reverse' : 'armSway 3s ease-in-out infinite 0.5s',
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${c}88, ${c})`,
            boxShadow: `0 0 6px ${c}33, inset 0 -2px 3px rgba(0,0,0,0.2)`,
          }} />
        </div>

        {/* left leg */}
        <div style={{
          position: 'absolute',
          left: '28%',
          bottom: -10,
          width: 14,
          height: 18,
          borderRadius: 7,
          background: `linear-gradient(to bottom, ${c}, ${c}aa)`,
          boxShadow: `0 0 8px ${c}33, inset 0 -3px 5px rgba(0,0,0,0.25)`,
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: 10,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 30%, ${c}88, ${c})`,
            boxShadow: `0 0 6px ${c}33, inset 0 -2px 3px rgba(0,0,0,0.2)`,
          }} />
        </div>

        {/* right leg */}
        <div style={{
          position: 'absolute',
          right: '28%',
          bottom: -10,
          width: 14,
          height: 18,
          borderRadius: 7,
          background: `linear-gradient(to bottom, ${c}, ${c}aa)`,
          boxShadow: `0 0 8px ${c}33, inset 0 -3px 5px rgba(0,0,0,0.25)`,
          zIndex: 0,
        }}>
          <div style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 14,
            height: 10,
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 30%, ${c}88, ${c})`,
            boxShadow: `0 0 6px ${c}33, inset 0 -2px 3px rgba(0,0,0,0.2)`,
          }} />
        </div>

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
            boxShadow: `0 0 ${s.size * 3}px ${c}88, 0 0 ${s.size * 6}px ${c}44`,
            animation: `sparkleFloat ${s.speed}s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.2}s`,
            zIndex: 5,
          }} />
        ))}
      </div>

      {/* label */}
      <div style={{
        textAlign: 'center',
        fontSize: 8,
        fontWeight: 600,
        color: c,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        padding: '3px 10px',
        borderRadius: 8,
        border: `1px solid ${c}44`,
        marginTop: 6,
        transition: 'color 0.6s, border-color 0.6s',
        boxShadow: `0 2px 8px ${c}22`,
        letterSpacing: '0.5px',
      }}>
        {e.label}
      </div>
    </div>
  )
}
