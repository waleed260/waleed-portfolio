import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ───────────────────────── emotion tokens ───────────────────────── */
const EMOTIONS = {
  calm:      { body: '#4d7cff', emissive: '#1a3a7a', eye: '#ffffff', mouth: 'smile',    emoji: '😌', label: 'Calm' },
  happy:     { body: '#ffd600', emissive: '#7a6500', eye: '#ffffff', mouth: 'grin',     emoji: '😄', label: 'Happy' },
  excited:   { body: '#ff3d3d', emissive: '#7a1a1a', eye: '#ffffff', mouth: 'open',     emoji: '🤩', label: 'Excited' },
  thinking:  { body: '#a855f7', emissive: '#4a2070', eye: '#ffffff', mouth: 'neutral',  emoji: '🤔', label: 'Thinking' },
  love:      { body: '#f472b6', emissive: '#7a2050', eye: '#ffffff', mouth: 'heart',    emoji: '🥰', label: 'Love' },
}

const EMOTION_KEYS = Object.keys(EMOTIONS)

/* ─────────────────── helpers – lerp color ─────────────────── */
function lerpColor(a, b, t) {
  const c1 = new THREE.Color(a)
  const c2 = new THREE.Color(b)
  return c1.lerp(c2, t)
}

/* ─────────────────── Mouth shapes (simple curve via points) ─────────────────── */
function MouthShape({ emotion, color }) {
  const meshRef = useRef()
  const points = useMemo(() => {
    switch (emotion) {
      case 'smile':
        return [new THREE.Vector3(-0.12, 0, 0), new THREE.Vector3(0, -0.06, 0), new THREE.Vector3(0.12, 0, 0)]
      case 'grin':
        return [new THREE.Vector3(-0.15, 0, 0), new THREE.Vector3(0, -0.1, 0), new THREE.Vector3(0.15, 0, 0)]
      case 'open':
        return [new THREE.Vector3(-0.12, 0.03, 0), new THREE.Vector3(0, -0.12, 0), new THREE.Vector3(0.12, 0.03, 0)]
      case 'neutral':
        return [new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.1, 0, 0)]
      case 'heart':
        return [new THREE.Vector3(-0.12, 0, 0), new THREE.Vector3(0, -0.08, 0), new THREE.Vector3(0.12, 0, 0)]
      default:
        return [new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.1, 0, 0)]
    }
  }, [emotion])

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]), [points])

  return (
    <mesh ref={meshRef} position={[0, -0.22, 0.42]}>
      <tubeGeometry args={[curve, 12, 0.018, 8, false]} />
      <meshStandardMaterial color={color || '#ffffff'} emissive={color || '#ffffff'} emissiveIntensity={0.5} />
    </mesh>
  )
}

/* ─────────────────── Eye with pupil & blink ─────────────────── */
function Eye({ side, eyeColor, pupilColor }) {
  const groupRef = useRef()
  const pupilRef = useRef()
  const blinkRef = useRef()
  const [blink, setBlink] = useState(false)

  useFrame(({ clock }) => {
    // Random blink every ~3-5 seconds
    const t = clock.getElapsedTime()
    const shouldBlink = Math.sin(t * 0.7 + side * 10) > 0.98
    if (shouldBlink !== blink) setBlink(shouldBlink)

    if (blinkRef.current) {
      blinkRef.current.scale.y = THREE.MathUtils.lerp(blinkRef.current.scale.y, blink ? 0.1 : 1, 0.3)
    }
    // Subtle eye movement toward center
    if (pupilRef.current) {
      pupilRef.current.position.x = THREE.MathUtils.lerp(pupilRef.current.position.x, side * 0.02, 0.05)
    }
  })

  const xPos = side * 0.22

  return (
    <group ref={groupRef} position={[xPos, 0.15, 0.35]}>
      {/* White of eye */}
      <mesh ref={blinkRef}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.3} />
      </mesh>
      {/* Pupil */}
      <mesh ref={pupilRef} position={[side * 0.04, 0, 0.08]}>
        <sphereGeometry args={[0.07, 32, 32]} />
        <meshStandardMaterial color={pupilColor} />
      </mesh>
      {/* Eye highlight */}
      <mesh position={[side * 0.06, 0.06, 0.1]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/* ─────────────────── Antenna with sway ─────────────────── */
function Antenna({ color }) {
  const groupRef = useRef()
  const tipRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 1.5) * 0.15
    }
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = 1.5 + Math.sin(t * 3) * 0.8
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.72, 0]}>
      {/* Stem */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#888888" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tip ball */}
      <mesh ref={tipRef} position={[0, 0.22, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/* ─────────────────── Stubby arm ─────────────────── */
function Arm({ side, bodyColor, wave }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      const waveAmount = wave ? Math.sin(t * 6) * 0.6 : Math.sin(t * 1.2 + side) * 0.1
      groupRef.current.rotation.z = side * (0.3 + waveAmount)
    }
  })

  return (
    <group ref={groupRef} position={[side * 0.55, -0.05, 0]}>
      {/* Arm */}
      <mesh position={[side * 0.15, -0.05, 0]} rotation={[0, 0, side * 0.3]}>
        <cylinderGeometry args={[0.06, 0.07, 0.3, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Hand */}
      <mesh position={[side * 0.28, -0.18, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ─────────────────── Stubby leg ─────────────────── */
function Leg({ side, bodyColor, bounce }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      const bounceAmount = bounce ? Math.abs(Math.sin(t * 4)) * 0.08 : 0
      groupRef.current.position.y = -bounceAmount
    }
  })

  return (
    <group ref={groupRef} position={[side * 0.22, -0.55, 0]}>
      {/* Leg */}
      <mesh position={[0, -0.08, 0]}>
        <cylinderGeometry args={[0.07, 0.08, 0.2, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Foot */}
      <mesh position={[0, -0.22, 0.04]}>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ─────────────────── Shadow disc ─────────────────── */
function Shadow({ opacity }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
      <circleGeometry args={[0.6, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={opacity} />
    </mesh>
  )
}

/* ─────────────────── Emotion bubble ─────────────────── */
function EmotionBubble({ emotion, position }) {
  const ref = useRef()
  const e = EMOTIONS[emotion]

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(clock.getElapsedTime() * 2) * 0.05
    }
  })

  return (
    <group ref={ref} position={position}>
      {/* Bubble */}
      <mesh>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {/* Emoji rendered as a simple colored sphere with label */}
      <mesh position={[0, 0, 0.15]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color={e.body} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════  MAIN ROBOT  ═══════════════════════════ */
function RobotModel({ mousePos, scrollProgress, emotion }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const currentColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const targetColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const currentEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))
  const targetEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))
  const [waveArms, setWaveArms] = useState(false)
  const [bounce, setBounce] = useState(false)

  const e = EMOTIONS[emotion] || EMOTIONS.calm

  useEffect(() => {
    targetColor.current.set(e.body)
    targetEmissive.current.set(e.emissive)
    // Trigger wave when emotion changes to happy or love
    setWaveArms(emotion === 'happy' || emotion === 'love')
    setBounce(emotion === 'excited')
    const timer = setTimeout(() => {
      setWaveArms(false)
      setBounce(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [emotion])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      // Smooth color transition
      currentColor.current.lerp(targetColor.current, 0.04)
      currentEmissive.current.lerp(targetEmissive.current, 0.04)

      // Mouse following (smooth)
      const targetX = mousePos.x * 0.5
      const targetY = mousePos.y * 0.3
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05)
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05)

      // Gentle rotation
      groupRef.current.rotation.y = Math.sin(t * 0.5) * 0.2

      // Bounce on scroll
      const scrollBounce = Math.sin(t * 2) * scrollProgress * 0.15
      groupRef.current.position.y += scrollBounce

      // Idle bob
      groupRef.current.position.y += Math.sin(t * 1.2) * 0.02
    }

    if (bodyRef.current) {
      bodyRef.current.material.color.copy(currentColor.current)
      bodyRef.current.material.emissive.copy(currentEmissive.current)
      bodyRef.current.material.emissiveIntensity = 0.3 + Math.sin(t * 2) * 0.1
    }
  })

  const bodyColor = currentColor.current.clone()

  return (
    <group ref={groupRef}>
      {/* Ambient + directional lights */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <pointLight position={[-3, 3, 2]} intensity={0.5} color={e.body} />
      <pointLight position={[3, -2, 2]} intensity={0.3} color={e.body} />

      {/* ── Main body (sphere) ── */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.55, 64, 64]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} emissive={bodyColor} emissiveIntensity={0.3} />
      </mesh>

      {/* Inner glow layer */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.57, 64, 64]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={0.08} side={THREE.BackSide} />
      </mesh>

      {/* ── Eyes ── */}
      <Eye side={-1} eyeColor={e.eye} pupilColor="#111111" />
      <Eye side={1} eyeColor={e.eye} pupilColor="#111111" />

      {/* ── Mouth ── */}
      <MouthShape emotion={e.mouth} color={e.eye} />

      {/* ── Antenna ── */}
      <Antenna color={e.body} />

      {/* ── Arms ── */}
      <Arm side={-1} bodyColor={bodyColor} wave={waveArms} />
      <Arm side={1} bodyColor={bodyColor} wave={waveArms} />

      {/* ── Legs ── */}
      <Leg side={-1} bodyColor={bodyColor} bounce={bounce} />
      <Leg side={1} bodyColor={bodyColor} bounce={bounce} />

      {/* ── Shadow ── */}
      <Shadow opacity={0.25 + scrollProgress * 0.15} />

      {/* ── Sparkle particles ── */}
      <Sparkles count={20} scale={2.5} size={3} speed={0.4} color={e.body} />
    </group>
  )
}

/* ═══════════════════════════  CANVAS WRAPPER  ═══════════════════════════ */
export default function Robot3D() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const [emotion, setEmotion] = useState('calm')
  const [showEmoji, setShowEmoji] = useState(false)
  const [currentEmoji, setCurrentEmoji] = useState('😌')
  const [robotPosition, setRobotPosition] = useState({ x: 0, y: 0 })

  // Mouse tracking
  useEffect(() => {
    const handler = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handler, { passive: true })
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  // Scroll tracking
  useEffect(() => {
    const handler = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      setScrollProgress(progress)

      // Change emotion based on scroll position
      const idx = Math.min(Math.floor(progress * EMOTION_KEYS.length), EMOTION_KEYS.length - 1)
      const newEmotion = EMOTION_KEYS[idx]
      setEmotion(newEmotion)
      setCurrentEmoji(EMOTIONS[newEmotion].emoji)
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Periodic emotion cycling when idle
  useEffect(() => {
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % EMOTION_KEYS.length
      setEmotion(EMOTION_KEYS[idx])
      setCurrentEmoji(EMOTIONS[EMOTION_KEYS[idx]].emoji)
      setShowEmoji(true)
      setTimeout(() => setShowEmoji(false), 2000)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  // Position robot on screen
  useEffect(() => {
    const handler = () => {
      const x = mousePos.x * 40
      const y = mousePos.y * 20
      setRobotPosition({ x, y })
    }
    handler()
  }, [mousePos])

  // Click interaction
  const handleClick = useCallback(() => {
    const randomEmotion = EMOTION_KEYS[Math.floor(Math.random() * EMOTION_KEYS.length)]
    setEmotion(randomEmotion)
    setCurrentEmoji(EMOTIONS[randomEmotion].emoji)
    setShowEmoji(true)
    setTimeout(() => setShowEmoji(false), 2500)
  }, [])

  return (
    <div
      className="robot-container"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '200px',
        height: '200px',
        zIndex: 9999,
        pointerEvents: 'auto',
        transform: `translate(${robotPosition.x * 0.1}px, ${robotPosition.y * 0.1}px)`,
        transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      }}
      onClick={handleClick}
      onMouseEnter={() => {
        setShowEmoji(true)
        setEmotion('happy')
        setCurrentEmoji('😄')
      }}
      onMouseLeave={() => setShowEmoji(false)}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <RobotModel mousePos={mousePos} scrollProgress={scrollProgress} emotion={emotion} />
      </Canvas>

      {/* Emoji bubble overlay */}
      {showEmoji && (
        <div
          className="robot-emoji-bubble"
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '28px',
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(10px)',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            animation: 'emojiPop 0.3s ease-out',
            pointerEvents: 'none',
          }}
        >
          {currentEmoji}
        </div>
      )}

      {/* Emotion label */}
      <div
        className="robot-emotion-label"
        style={{
          position: 'absolute',
          bottom: '-8px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: EMOTIONS[emotion].body,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: `1px solid ${EMOTIONS[emotion].body}40`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 0.5s ease, border-color 0.5s ease',
        }}
      >
        {EMOTIONS[emotion].label}
      </div>

      {/* Click hint */}
      <div
        className="robot-hint"
        style={{
          position: 'absolute',
          bottom: '-24px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '9px',
          color: 'rgba(255, 255, 255, 0.4)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        click me!
      </div>
    </div>
  )
}
