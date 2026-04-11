import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ────────────────────── emotion tokens (theme colors) ────────────────────── */
const EMOTIONS = {
  calm:     { body: '#4d7cff', emissive: '#1a3a7a', eye: '#e0e8ff', mouthShape: 'smile',    label: 'Calm' },
  happy:    { body: '#00e5ff', emissive: '#004455', eye: '#e0fffc', mouthShape: 'grin',     label: 'Happy' },
  excited:  { body: '#f472b6', emissive: '#55203a', eye: '#ffe0f0', mouthShape: 'open',     label: 'Excited' },
  thinking: { body: '#a855f7', emissive: '#3a1560', eye: '#f0e0ff', mouthShape: 'neutral',  label: 'Thinking' },
}

const EMOTION_KEYS = Object.keys(EMOTIONS)

/* ────────────────────── visible mouth (lips + inner) ────────────────────── */
function MouthShape({ emotion, color }) {
  const points = useMemo(() => {
    switch (emotion) {
      case 'smile':
        return [new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0, -0.05, 0), new THREE.Vector3(0.1, 0, 0)]
      case 'grin':
        return [new THREE.Vector3(-0.13, 0, 0), new THREE.Vector3(0, -0.09, 0), new THREE.Vector3(0.13, 0, 0)]
      case 'open':
        return [new THREE.Vector3(-0.1, 0.02, 0), new THREE.Vector3(0, -0.1, 0), new THREE.Vector3(0.1, 0.02, 0)]
      case 'neutral':
        return [new THREE.Vector3(-0.08, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, 0, 0)]
      default:
        return [new THREE.Vector3(-0.08, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.08, 0, 0)]
    }
  }, [emotion])

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(points[0], points[1], points[2]), [points])

  return (
    <group position={[0, -0.2, 0.44]}>
      {/* Outer lips — thicker tube */}
      <mesh>
        <tubeGeometry args={[curve, 16, 0.025, 8, false]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.1} />
      </mesh>
      {/* Inner mouth (visible when open) */}
      {emotion === 'open' && (
        <mesh position={[0, -0.02, -0.01]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial color="#2a1020" emissive="#441122" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  )
}

/* ────────────────────── Eye with pupil & slow blink ────────────────────── */
function Eye({ side, eyeColor, pupilColor }) {
  const groupRef = useRef()
  const pupilRef = useRef()
  const blinkRef = useRef()
  const [blink, setBlink] = useState(false)

  useFrame(({ clock }) => {
    // Blink every ~4 seconds (slower)
    const t = clock.getElapsedTime()
    const shouldBlink = Math.sin(t * 0.4 + side * 10) > 0.97
    if (shouldBlink !== blink) setBlink(shouldBlink)

    if (blinkRef.current) {
      blinkRef.current.scale.y = THREE.MathUtils.lerp(blinkRef.current.scale.y, blink ? 0.08 : 1, 0.2)
    }
    // Subtle pupil movement
    if (pupilRef.current) {
      pupilRef.current.position.x = THREE.MathUtils.lerp(pupilRef.current.position.x, side * 0.015, 0.03)
    }
  })

  const xPos = side * 0.2

  return (
    <group ref={groupRef} position={[xPos, 0.12, 0.38]}>
      {/* White */}
      <mesh ref={blinkRef}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.2} />
      </mesh>
      {/* Pupil */}
      <mesh ref={pupilRef} position={[side * 0.03, 0, 0.08]}>
        <sphereGeometry args={[0.065, 32, 32]} />
        <meshStandardMaterial color={pupilColor} />
      </mesh>
      {/* Highlight */}
      <mesh position={[side * 0.05, 0.05, 0.1]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

/* ────────────────────── Slow swaying antenna ────────────────────── */
function Antenna({ color }) {
  const groupRef = useRef()
  const tipRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.12
    }
    if (tipRef.current) {
      tipRef.current.material.emissiveIntensity = 1.2 + Math.sin(t * 1.5) * 0.5
    }
  })

  return (
    <group ref={groupRef} position={[0, 0.68, 0]}>
      <mesh position={[0, 0.09, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.18, 8]} />
        <meshStandardMaterial color="#6a6a80" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={tipRef} position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/* ────────────────────── Slow-swinging arm ────────────────────── */
function Arm({ side, bodyColor }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.rotation.z = side * (0.25 + Math.sin(t * 0.8 + side * 2) * 0.08)
    }
  })

  return (
    <group ref={groupRef} position={[side * 0.52, -0.05, 0]}>
      <mesh position={[side * 0.14, -0.04, 0]} rotation={[0, 0, side * 0.3]}>
        <cylinderGeometry args={[0.055, 0.065, 0.28, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[side * 0.26, -0.16, 0]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ────────────────────── Leg ────────────────────── */
function Leg({ side, bodyColor }) {
  const groupRef = useRef()

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.7 + side) * 0.008
    }
  })

  return (
    <group ref={groupRef} position={[side * 0.2, -0.52, 0]}>
      <mesh position={[0, -0.07, 0]}>
        <cylinderGeometry args={[0.065, 0.075, 0.18, 8]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.2, 0.035]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ────────────────────── Shadow ────────────────────── */
function Shadow({ opacity }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.15, 0]}>
      <circleGeometry args={[0.55, 32]} />
      <meshBasicMaterial color="#000000" transparent opacity={opacity} />
    </mesh>
  )
}

/* ═══════════════════════════  MAIN ROBOT MODEL  ═══════════════════════════ */
function RobotModel({ emotion }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const currentColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const targetColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const currentEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))
  const targetEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))

  const e = EMOTIONS[emotion] || EMOTIONS.calm

  useEffect(() => {
    targetColor.current.set(e.body)
    targetEmissive.current.set(e.emissive)
  }, [emotion])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    if (groupRef.current) {
      // Slow color transition
      currentColor.current.lerp(targetColor.current, 0.02)
      currentEmissive.current.lerp(targetEmissive.current, 0.02)

      // Very gentle rotation
      groupRef.current.rotation.y = Math.sin(t * 0.25) * 0.15
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.05

      // Subtle idle float
      groupRef.current.position.y = Math.sin(t * 0.6) * 0.02
    }

    if (bodyRef.current) {
      bodyRef.current.material.color.copy(currentColor.current)
      bodyRef.current.material.emissive.copy(currentEmissive.current)
      bodyRef.current.material.emissiveIntensity = 0.2 + Math.sin(t * 1) * 0.08
    }
  })

  const bodyColor = currentColor.current.clone()

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <pointLight position={[-3, 3, 2]} intensity={0.4} color={e.body} />
      <pointLight position={[3, -2, 2]} intensity={0.25} color={e.body} />

      {/* Main body */}
      <mesh ref={bodyRef} position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.52, 64, 64]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.3} emissive={bodyColor} emissiveIntensity={0.2} />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.54, 64, 64]} />
        <meshStandardMaterial color={bodyColor} transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Eyes */}
      <Eye side={-1} eyeColor={e.eye} pupilColor="#0d0d1a" />
      <Eye side={1} eyeColor={e.eye} pupilColor="#0d0d1a" />

      {/* Mouth */}
      <MouthShape emotion={e.mouthShape} color={e.eye} />

      {/* Antenna */}
      <Antenna color={e.body} />

      {/* Arms */}
      <Arm side={-1} bodyColor={bodyColor} />
      <Arm side={1} bodyColor={bodyColor} />

      {/* Legs */}
      <Leg side={-1} bodyColor={bodyColor} />
      <Leg side={1} bodyColor={bodyColor} />

      {/* Shadow */}
      <Shadow opacity={0.22} />

      {/* Sparkles */}
      <Sparkles count={15} scale={2.2} size={2.5} speed={0.25} color={e.body} />
    </group>
  )
}

/* ═══════════════════════════  DRAGGABLE WRAPPER  ═══════════════════════════ */
export default function Robot3D() {
  const containerRef = useRef(null)
  const [emotion, setEmotion] = useState('calm')
  const [dragging, setDragging] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [pos, setPos] = useState(() => {
    const saved = localStorage.getItem('robot-pos')
    if (saved) return JSON.parse(saved)
    return { x: window.innerWidth - 220, y: window.innerHeight - 220 }
  })

  // Scroll-based emotion
  useEffect(() => {
    const handler = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0
      const idx = Math.min(Math.floor(progress * EMOTION_KEYS.length), EMOTION_KEYS.length - 1)
      setEmotion(EMOTION_KEYS[idx])
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Idle emotion cycling (slow — every 12s)
  useEffect(() => {
    let idx = 0
    const timer = setInterval(() => {
      idx = (idx + 1) % EMOTION_KEYS.length
      setEmotion(EMOTION_KEYS[idx])
    }, 12000)
    return () => clearInterval(timer)
  }, [])

  // Save position on change
  useEffect(() => {
    localStorage.setItem('robot-pos', JSON.stringify(pos))
  }, [pos])

  /* ── Drag handlers ── */
  const onPointerDown = useCallback((e) => {
    e.preventDefault()
    setDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    setOffset({ x: clientX - pos.x, y: clientY - pos.y })
  }, [pos])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX
      const clientY = e.touches ? e.touches[0].clientY : e.clientY
      setPos({ x: clientX - offset.x, y: clientY - offset.y })
    }
    const onUp = () => setDragging(false)

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [dragging, offset])

  return (
    <div
      ref={containerRef}
      className="robot-container"
      style={{
        position: 'fixed',
        left: `${pos.x}px`,
        top: `${pos.y}px`,
        width: '180px',
        height: '180px',
        zIndex: 9999,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
    >
      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <RobotModel emotion={emotion} />
      </Canvas>

      {/* Emotion label */}
      <div
        className="robot-emotion-label"
        style={{
          position: 'absolute',
          bottom: '0px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: EMOTIONS[emotion].body,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          padding: '2px 10px',
          borderRadius: '10px',
          border: `1px solid ${EMOTIONS[emotion].body}40`,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          transition: 'color 0.8s ease, border-color 0.8s ease',
        }}
      >
        {EMOTIONS[emotion].label}
      </div>
    </div>
  )
}
