import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

// Neural Network Node Component
const NeuralNode = ({ position, color, size = 0.15, pulseSpeed = 1 }) => {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * pulseSpeed + position[0]) * 0.1;

      // Pulsing effect on hover
      const scale = hovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={hovered ? 0.8 : 0.3}
        roughness={0.2}
        metalness={0.8}
      />
      {hovered && (
        <pointLight
          position={position}
          intensity={2}
          distance={3}
          color={color}
        />
      )}
    </mesh>
  );
};

// Connection Line Component
const NeuralConnection = ({ start, end, color, opacity = 0.4 }) => {
  const lineRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Calculate line properties
  const distance = useMemo(() => {
    const dx = start[0] - end[0];
    const dy = start[1] - end[1];
    const dz = start[2] - end[2];
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }, [start, end]);

  const direction = useMemo(() => {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const dz = end[2] - start[2];
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return [dx / len, dy / len, dz / len];
  }, [start, end]);

  const angle = useMemo(() => {
    const [, dy, dz] = direction;
    return Math.atan2(dy, dz);
  }, [direction]);

  const midPoint = useMemo(() => [
    (start[0] + end[0]) / 2,
    (start[1] + end[1]) / 2,
    (start[2] + end[2]) / 2
  ], [start, end]);

  useFrame((state) => {
    if (lineRef.current) {
      // Pulsing effect on the line
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7;
      lineRef.current.material.opacity = hovered ? 1 : opacity * pulse;
    }
  });

  return (
    <group position={midPoint} rotation={[0, 0, angle]}>
      <mesh
        ref={lineRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.02, 0.02, distance, 8]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={hovered ? 1 : opacity}
          roughness={0.1}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
};

// Core System Component - Main 3D Scene
const NeuralCoreSystem = ({ mousePosition }) => {
  const groupRef = useRef();

  // Generate neural network nodes in a sphere pattern
  const nodes = useMemo(() => {
    const nodeCount = 48;
    const nodes = [];
    const radius = 3;

    for (let i = 0; i < nodeCount; i++) {
      // Fibonacci sphere distribution
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;

      const x = radius * Math.cos(theta) * Math.sin(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(phi);

      // Assign colors based on position
      const hue = (i / nodeCount) * 0.3 + 0.5; // Cyan to purple range
      const color = new THREE.Color().setHSL(hue, 0.8, 0.6);

      nodes.push({
        id: i,
        position: [x, y, z],
        color: color,
        size: 0.12 + ((i * 7 + 3) % 100) * 0.0008,
        pulseSpeed: 1 + ((i * 13 + 5) % 100) * 0.02
      });
    }
    return nodes;
  }, []);

  // Generate connections between nearby nodes
  const connections = useMemo(() => {
    const conns = [];
    const maxDistance = 2.5;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].position[0] - nodes[j].position[0];
        const dy = nodes[i].position[1] - nodes[j].position[1];
        const dz = nodes[i].position[2] - nodes[j].position[2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const hue = (i / nodes.length) * 0.3 + 0.5;
          const color = new THREE.Color().setHSL(hue, 0.7, 0.5);
          conns.push({
            id: `${i}-${j}`,
            start: nodes[i].position,
            end: nodes[j].position,
            color: color,
            opacity: 1 - dist / maxDistance
          });
        }
      }
    }
    return conns;
  }, [nodes]);

  // Animate the entire system
  useFrame(() => {
    if (groupRef.current) {
      const targetRotationX = mousePosition.y * 0.5;
      const targetRotationY = mousePosition.x * 0.5;

      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;

      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer glowing sphere */}
      <mesh scale={[3.5, 3.5, 3.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.05}
          wireframe
        />
      </mesh>

      {/* Inner core */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color="#00e5ff"
          emissive="#00e5ff"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Connection lines */}
      {connections.map((conn) => (
        <NeuralConnection
          key={conn.id}
          start={conn.start}
          end={conn.end}
          color={conn.color}
          opacity={conn.opacity * 0.6}
        />
      ))}

      {/* Nodes */}
      {nodes.map((node) => (
        <NeuralNode
          key={node.id}
          position={node.position}
          color={node.color}
          size={node.size}
          pulseSpeed={node.pulseSpeed}
        />
      ))}

    </group>
  );
};

// Main Component
export default function NeuralNetworkCore() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -((e.clientY / window.innerHeight) * 2 - 1);
      setMousePosition({ x, y });
    };

    if (!isMobile) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  if (isMobile) {
    return (
      <div className="neural-core-mobile">
        <div className="neural-core-placeholder">
          <div className="neural-core-glow" />
          <div className="neural-core-text">Neural Core</div>
        </div>
      </div>
    );
  }

  return (
    <div className="neural-core-container">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 50 }}
        dpr={[1, 2]}
      >
        <NeuralCoreSystem mousePosition={mousePosition} />

        {/* OrbitControls outside the rotating group */}
        <OrbitControls makeDefault enableZoom={false} enablePan={false} />

        {/* Ambient lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />

        {/* Particles in background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Fog for depth */}
        <fog attach="fog" args={['#07060b', 10, 30]} />
      </Canvas>

      {/* Overlay text */}
      <div className="neural-core-overlay">
        <div className="neural-core-title">SYSTEM INITIALIZED</div>
        <div className="neural-core-subtitle">AGENTIC AI ARCHITECTURE</div>
      </div>
    </div>
  );
}
