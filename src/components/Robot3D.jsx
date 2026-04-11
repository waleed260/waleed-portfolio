import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

/* ───── emotion tokens (website theme colors) ───── */
const EMOTIONS = {
  calm:     { body: '#4d7cff', emissive: '#1a3a7a', eye: '#e0e8ff', mouth: 'smile',    label: 'Calm' },
  happy:    { body: '#00e5ff', emissive: '#004455', eye: '#e0fffc', mouth: 'grin',     label: 'Happy' },
  excited:  { body: '#f472b6', emissive: '#55203a', eye: '#ffe0f0', mouth: 'open',     label: 'Excited' },
  thinking: { body: '#a855f7', emissive: '#3a1560', eye: '#f0e0ff', mouth: 'pout',     label: 'Thinking' },
}
const EMOTION_KEYS = Object.keys(EMOTIONS)

/* ───── cute mouth ───── */
function Mouth({ shape, color }) {
  const pts = useMemo(() => {
    switch (shape) {
      case 'smile':
        return [new THREE.Vector3(-0.08, 0, 0), new THREE.Vector3(0, -0.04, 0), new THREE.Vector3(0.08, 0, 0)]
      case 'grin':
        return [new THREE.Vector3(-0.1, 0, 0), new THREE.Vector3(0, -0.07, 0), new THREE.Vector3(0.1, 0, 0)]
      case 'open':
        return [new THREE.Vector3(-0.08, 0.02, 0), new THREE.Vector3(0, -0.08, 0), new THREE.Vector3(0.08, 0.02, 0)]
      case 'pout':
        return [new THREE.Vector3(-0.06, -0.01, 0), new THREE.Vector3(0, -0.01, 0), new THREE.Vector3(0.06, -0.01, 0)]
      default:
        return [new THREE.Vector3(-0.06, 0, 0), new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.06, 0, 0)]
    }
  }, [shape])

  const curve = useMemo(() => new THREE.QuadraticBezierCurve3(pts[0], pts[1], pts[2]), [pts])

  return (
    <group position={[0, -0.16, 0.38]}>
      <mesh>
        <tubeGeometry args={[curve, 12, 0.02, 8, false]} />
        <meshStandardMaterial color="#1a1a2e" emissive="#1a1a2e" emissiveIntensity={0.1} />
      </mesh>
      {shape === 'open' && (
        <mesh position={[0, -0.02, -0.01]}>
          <circleGeometry args={[0.045, 16]} />
          <meshStandardMaterial color="#2a1020" emissive="#441122" emissiveIntensity={0.3} />
        </mesh>
      )}
    </group>
  )
}

/* ───── big cute eyes ───── */
function Eye({ side, eyeColor }) {
  const blinkRef = useRef()
  const [blink, setBlink] = useState(false)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const should = Math.sin(t * 0.35 + side * 8) > 0.97
    if (should !== blink) setBlink(should)
    if (blinkRef.current) {
      blinkRef.current.scale.y = THREE.MathUtils.lerp(blinkRef.current.scale.y, blink ? 0.06 : 1, 0.25)
    }
  })

  return (
    <group position={[side * 0.18, 0.1, 0.32]}>
      <mesh ref={blinkRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[side * 0.025, 0, 0.07]}>
        <sphereGeometry args={[0.055, 32, 32]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>
      <mesh position={[side * 0.045, 0.045, 0.09]}>
        <sphereGeometry args={[0.018, 16, 16]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  )
}

/* ───── tiny antenna ───── */
function Antenna({ color }) {
  const g = useRef()
  const tip = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) g.current.rotation.z = Math.sin(t * 0.6) * 0.1
    if (tip.current) tip.current.material.emissiveIntensity = 1.2 + Math.sin(t * 1.2) * 0.4
  })
  return (
    <group ref={g} position={[0, 0.58, 0]}>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.15, 8]} />
        <meshStandardMaterial color="#6a6a80" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh ref={tip} position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

/* ───── tiny arms ───── */
function Arm({ side, color, wave }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      const w = wave ? Math.sin(t * 7) * 0.5 : Math.sin(t * 0.6 + side * 2) * 0.06
      g.current.rotation.z = side * (0.22 + w)
    }
  })
  return (
    <group ref={g} position={[side * 0.46, -0.04, 0]}>
      <mesh position={[side * 0.12, -0.03, 0]} rotation={[0, 0, side * 0.3]}>
        <cylinderGeometry args={[0.045, 0.055, 0.22, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[side * 0.22, -0.13, 0]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ───── tiny legs ───── */
function Leg({ side, color, bounce }) {
  const g = useRef()
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (g.current) {
      const b = bounce ? Math.abs(Math.sin(t * 5)) * 0.08 : Math.sin(t * 0.5 + side) * 0.006
      g.current.position.y = b
    }
  })
  return (
    <group ref={g} position={[side * 0.18, -0.46, 0]}>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.055, 0.065, 0.15, 8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.17, 0.03]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ───── shadow ───── */
function Shadow() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.95, 0]}>
      <circleGeometry args={[0.45, 32]} />
      <meshBasicMaterial color="#000" transparent opacity={0.18} />
    </mesh>
  )
}

/* ══════════ ROBOT MODEL ══════════ */
function RobotModel({ emotion }) {
  const groupRef = useRef()
  const bodyRef = useRef()
  const curColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const curEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))
  const tgtColor = useRef(new THREE.Color(EMOTIONS.calm.body))
  const tgtEmissive = useRef(new THREE.Color(EMOTIONS.calm.emissive))
  const [dancing, setDancing] = useState(false)
  const e = EMOTIONS[emotion] || EMOTIONS.calm

  useEffect(() => { tgtColor.current.set(e.body); tgtEmissive.current.set(e.emissive) }, [emotion])

  // Periodic cute dance every 8s
  useEffect(() => {
    const t = setInterval(() => {
      setDancing(true)
      setTimeout(() => setDancing(false), 1500)
    }, 8000)
    return () => clearInterval(t)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    curColor.current.lerp(tgtColor.current, 0.02)
    curEmissive.current.lerp(tgtEmissive.current, 0.02)
    if (bodyRef.current) {
      bodyRef.current.material.color.copy(curColor.current)
      bodyRef.current.material.emissive.copy(curEmissive.current)
      bodyRef.current.material.emissiveIntensity = 0.18 + Math.sin(t) * 0.06
    }
    if (groupRef.current) {
      // Idle bob + hop
      const hop = dancing ? Math.abs(Math.sin(t * 5)) * 0.12 : 0
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.025 + hop
      // Slight tilt
      const tilt = dancing ? Math.sin(t * 6) * 0.15 : 0
      groupRef.current.rotation.z = tilt
      // Gentle sway
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08
    }
  })

  const bc = curColor.current.clone()

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 4, 4]} intensity={0.8} />
      <pointLight position={[-2, 2, 2]} intensity={0.35} color={e.body} />
      <pointLight position={[2, -1, 2]} intensity={0.2} color={e.body} />

      {/* Body */}
      <mesh ref={bodyRef} position={[0, 0, 0]}>
        <sphereGeometry args={[0.46, 64, 64]} />
        <meshStandardMaterial color={bc} metalness={0.5} roughness={0.3} emissive={bc} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.48, 64, 64]} />
        <meshStandardMaterial color={bc} transparent opacity={0.05} side={THREE.BackSide} />
      </mesh>

      {/* Cute blush cheeks */}
      <mesh position={[-0.3, -0.05, 0.25]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ff6b8a" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0.3, -0.05, 0.25]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ff6b8a" transparent opacity={0.35} />
      </mesh>

      {/* Face */}
      <Eye side={-1} eyeColor={e.eye} />
      <Eye side={1} eyeColor={e.eye} />
      <Mouth shape={e.mouth} color={e.eye} />

      {/* Parts */}
      <Antenna color={e.body} />
      <Arm side={-1} color={bc} wave={dancing} />
      <Arm side={1} color={bc} wave={dancing} />
      <Leg side={-1} color={bc} bounce={dancing} />
      <Leg side={1} color={bc} bounce={dancing} />

      <Shadow />
      <Sparkles count={dancing ? 20 : 12} scale={dancing ? 2.2 : 1.8} size={dancing ? 3 : 2} speed={0.2} color={e.body} />
    </group>
  )
}

/* ══════════ FIXED SIDEBAR WIDGET ══════════ */
export default function Robot3D() {
  const [emotion, setEmotion] = useState('calm')

  useEffect(() => {
    const handler = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      setEmotion(EMOTION_KEYS[Math.min(Math.floor(p * EMOTION_KEYS.length), EMOTION_KEYS.length - 1)])
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    let i = 0
    const t = setInterval(() => { i = (i + 1) % EMOTION_KEYS.length; setEmotion(EMOTION_KEYS[i]) }, 12000)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{
      position: 'fixed',
      right: 12,
      bottom: 12,
      width: 140,
      height: 140,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      <Canvas camera={{ position: [0, 0, 2.8], fov: 50 }} style={{ background: 'transparent' }} dpr={[1, 2]}>
        <RobotModel emotion={emotion} />
      </Canvas>
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, color: EMOTIONS[emotion].body, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)', padding: '1px 8px', borderRadius: 8,
        border: `1px solid ${EMOTIONS[emotion].body}35`, whiteSpace: 'nowrap',
        transition: 'color 0.8s, border-color 0.8s', pointerEvents: 'none',
      }}>
        {EMOTIONS[emotion].label}
      </div>
    </div>
  )
}
