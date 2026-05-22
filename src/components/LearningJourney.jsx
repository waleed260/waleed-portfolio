import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Timeline Node Component - represents a milestone
const TimelineNode = ({ position, year, title, color, isLeft = false }) => {
  const groupRef = useRef();
  const [hovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5 + position[0]) * 0.1;

      // Scale on hover
      const targetScale = hovered ? 1.1 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Connection point */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>

      {/* Year marker */}
      <Text
        position={[0, -0.5, 0]}
        fontSize={0.4}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2"
      >
        {year}
      </Text>

      {/* Label on side */}
      <group position={[isLeft ? -2.5 : 2.5, 0.5, 0]}>
        <mesh>
          <boxGeometry args={[2, 1, 0.2]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.2}
            roughness={0.1}
          />
        </mesh>
        <Text
          position={[0, 0, 0.15]}
          fontSize={0.3}
          color="#fff"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2"
        >
          {title}
        </Text>
      </group>

      {/* Decorative elements */}
      <mesh position={[isLeft ? -0.8 : 0.8, 0.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
    </group>
  );
};

// Pipeline Track - the main timeline path
const PipelineTrack = ({ points, color }) => {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(points.flat(), 3))
    return g
  }, [points])

  return (
    <group>
      {/* Main track line */}
      <line geometry={geometry}>
        <lineBasicMaterial color={color} />
      </line>

      {/* Glowing track */}
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.3} />
      </line>

      {/* Data particles along the track */}
      {points.map((point, i) => (
        <mesh key={i} position={point}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} opacity={0.5} transparent />
        </mesh>
      ))}
    </group>
  );
};

// Main Timeline Component
export default function LearningJourney() {
  const groupRef = useRef();
  const trackRef = useRef();

  // Timeline data
  const milestones = useMemo(() => [
    {
      year: '2024',
      title: 'AI AWAKENING',
      desc: 'LLMs, Prompt Engineering, AI Apps',
      color: new THREE.Color('#00e5ff'),
      position: [0, 4, 0],
      isLeft: false
    },
    {
      year: '2025',
      title: 'AGENTIC SYSTEMS',
      desc: 'LangChain, Multi-Agent, Advanced RAG',
      color: new THREE.Color('#10b981'),
      position: [0, 2, 0],
      isLeft: true
    },
    {
      year: '2025',
      title: 'VISUAL AUTOMATION',
      desc: 'n8n, Zapier, Make.com, Vapi',
      color: new THREE.Color('#a855f7'),
      position: [0, 0, 0],
      isLeft: false
    },
    {
      year: '2025-26',
      title: 'ADVANCED PYTORCH',
      desc: 'Neural Architectures, Deep Learning',
      color: new THREE.Color('#4d7cff'),
      position: [0, -2, 0],
      isLeft: true
    },
    {
      year: 'NOW',
      title: 'AUTONOMOUS AGENTS',
      desc: 'Tool Use, Self-Improving Systems',
      color: new THREE.Color('#f472b6'),
      position: [0, -4, 0],
      isLeft: false
    }
  ], []);

  // Generate track points (zigzag pattern)
  const trackPoints = useMemo(() => {
    const points = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const y = 4 - t * 8;
      const x = Math.sin(t * Math.PI * 4) * 1.5;
      points.push([x, y, 0]);
    }
    return points;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }

    if (trackRef.current) {
      // Pulse effect on track
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.8;
      trackRef.current.material.opacity = pulse;
    }
  });

  return (
    <div className="learning-journey-container">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 2]}
      >
        <group ref={groupRef}>
          {/* Background grid */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
            <planeGeometry args={[20, 20, 10, 10]} />
            <meshBasicMaterial
              color="#00e5ff"
              wireframe
              transparent
              opacity={0.1}
            />
          </mesh>

          {/* Pipeline track */}
          <group ref={trackRef}>
            <PipelineTrack points={trackPoints} color="#00e5ff" />
          </group>

          {/* Timeline nodes */}
          {milestones.map((milestone) => (
            <TimelineNode
              key={milestone.year}
              position={milestone.position}
              year={milestone.year}
              title={milestone.title}
              color={milestone.color}
              isLeft={milestone.isLeft}
            />
          ))}

          {/* Central hub */}
          <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <mesh position={[0, 0, 0]}>
              <octahedronGeometry args={[0.6, 0]} />
              <meshStandardMaterial
                color="#fff"
                emissive="#00e5ff"
                emissiveIntensity={0.5}
                roughness={0.2}
              />
            </mesh>
          </Float>

          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.6} color="#a855f7" />
          <pointLight position={[-5, -5, -5]} intensity={0.4} color="#00e5ff" />
        </group>

        <OrbitControls makeDefault enableZoom={true} enablePan={false} minDistance={8} maxDistance={20} />
        <fog attach="fog" args={['#07060b', 10, 25]} />
      </Canvas>

      <div className="learning-journey-overlay">
        <h2 className="journey-title">EXECUTION LOGS</h2>
        <p className="journey-subtitle">SYSTEM UPDATES & MILESTONES</p>
      </div>
    </div>
  );
}
