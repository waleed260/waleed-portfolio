import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Text } from '@react-three/drei';
import * as THREE from 'three';

// Skill Module Component - represents a skill as a 3D node
const SkillModule = ({ position, skill, color, scale = 1 }) => {
  const groupRef = useRef();
  const [hovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating and rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Scale on hover
      const targetScale = hovered ? 1.2 : 1.0;
      groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      {/* Outer glowing ring */}
      <mesh>
        <torusGeometry args={[0.8, 0.05, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>

      {/* Inner cube representing the skill */}
      <mesh>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.3}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* Corner markers for tech aesthetic */}
      <mesh position={[0.6, 0.6, 0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[-0.6, -0.6, -0.6]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* Label */}
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.3}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxK.woff2"
      >
        {skill.name}
      </Text>

      {/* Connection points */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 1.5,
            0,
            Math.sin((i / 6) * Math.PI * 2) * 1.5
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

// Connection Lines between related skills
const SkillConnection = ({ start, end, color, active }) => {
  const distance = useMemo(() => {
    const dx = start[0] - end[0];
    const dy = start[1] - end[1];
    const dz = start[2] - end[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, [start, end]);

  const midPoint = useMemo(() => [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ], [start, end]);

  return (
    <group position={midPoint}>
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, distance, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={active ? 0.8 : 0.3}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
};

// Main Toolkit Architecture Component
export default function ToolkitArchitecture() {
  const groupRef = useRef();

  // Skills data
  const skills = useMemo(() => [
    { name: 'Python', level: 95, color: new THREE.Color('#e0e0e0'), position: [0, 0, 0] },
    { name: 'PyTorch', level: 88, color: new THREE.Color('#b0b0b0'), position: [2.5, 1.5, 0] },
    { name: 'FastAPI', level: 90, color: new THREE.Color('#a0a0a0'), position: [-2.5, 1.5, 0] },
    { name: 'Django', level: 82, color: new THREE.Color('#c0c0c0'), position: [0, 3, 0] },
    { name: 'n8n', level: 92, color: new THREE.Color('#d0d0d0'), position: [4, 0, 0] },
    { name: 'Zapier', level: 88, color: new THREE.Color('#b0b0b0'), position: [5, 2, 0] },
    { name: 'Make.com', level: 85, color: new THREE.Color('#a0a0a0'), position: [4, -2, 0] },
    { name: 'LangChain', level: 90, color: new THREE.Color('#c0c0c0'), position: [-4, 0, 0] },
    { name: 'Docker', level: 85, color: new THREE.Color('#b0b0b0'), position: [-2.5, -1.5, 0] },
    { name: 'AWS', level: 78, color: new THREE.Color('#a0a0a0'), position: [-4, -2.5, 0] },
  ], []);

  // Create connections based on skill relationships
  const connections = useMemo(() => {
    const conns = [];
    const relationships = [
      [0, 1], [0, 2], [0, 3], // Python connected to ML frameworks
      [4, 5], [4, 6], // n8n connected to other automation tools
      [0, 7], // Python to LangChain
      [1, 7], // PyTorch to LangChain
      [0, 8], // Python to Docker
      [8, 9], // Docker to AWS
    ];

    relationships.forEach(([i, j]) => {
      conns.push({
        id: `${i}-${j}`,
        start: skills[i].position,
        end: skills[j].position,
        color: skills[i].color,
        active: true
      });
    });

    return conns;
  }, [skills]);

  useFrame((state) => {
    if (groupRef.current) {
      // Slow rotation of entire architecture
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <div className="toolkit-architecture-container">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        dpr={[1, 2]}
      >
        <group ref={groupRef}>
          {/* Background glow */}
          <mesh scale={[15, 15, 1]}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              color="#e0e0e0"
              transparent
              opacity={0.03}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Skill modules */}
          {skills.map((skill) => (
            <SkillModule
              key={skill.name}
              position={skill.position}
              skill={skill}
              color={skill.color}
            />
          ))}

          {/* Connection lines */}
          {connections.map((conn) => (
            <SkillConnection
              key={conn.id}
              start={conn.start}
              end={conn.end}
              color={conn.color}
              active={conn.active}
            />
          ))}

          {/* Central hub - main skill */}
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[0, 0, 0]} scale={[1.5, 1.5, 1.5]}>
              <octahedronGeometry args={[0.8, 0]} />
              <meshStandardMaterial
                color="#e0e0e0"
                emissive="#e0e0e0"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
              />
            </mesh>
          </Float>

          {/* Ambient lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={0.8} color="#a855f7" />
          <pointLight position={[-5, -5, -5]} intensity={0.5} color="#e0e0e0" />
        </group>

        <OrbitControls makeDefault enableZoom={true} enablePan={false} minDistance={5} maxDistance={20} />
        <fog attach="fog" args={['#070707', 10, 25]} />
      </Canvas>

      <div className="toolkit-architecture-overlay">
        <h2 className="toolkit-title">ARCHITECTURE</h2>
        <p className="toolkit-subtitle">INTERCONNECTED SYSTEMS</p>
      </div>
    </div>
  );
}
