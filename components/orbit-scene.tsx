"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Component, useRef, type ReactNode } from "react";
import type { Group } from "three";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="orbit-fallback" />
    ) : (
      this.props.children
    );
  }
}

function LearningSpace({ active }: { active: number }) {
  const scene = useRef<Group>(null);
  const assembly = useRef<Group>(null);
  useFrame((state, delta) => {
    const ease = Math.min(delta * 3, 1);
    if (scene.current)
      scene.current.rotation.y +=
        (state.pointer.x * 0.2 - 0.3 - scene.current.rotation.y) * ease;
    if (assembly.current) {
      const target = active === 2 ? 0.7 : 0;
      assembly.current.position.y +=
        (target - assembly.current.position.y) * ease;
    }
  });
  const wireframe = active < 2;
  const table = (x: number, z: number, key: string) => (
    <group key={key} position={[x, 0, z]}>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.35, 0.13, 0.85]} />
        <meshStandardMaterial color="#D8B5A3" wireframe={wireframe} />
      </mesh>
      {[-0.52, 0.52].flatMap((a) =>
        [-0.3, 0.3].map((b) => (
          <mesh key={a + ":" + b} position={[a, -0.5, b]}>
            <boxGeometry args={[0.06, 1, 0.06]} />
            <meshStandardMaterial color="#769897" wireframe={wireframe} />
          </mesh>
        )),
      )}
      <group position={[0, -0.5, 0.8]}>
        <mesh>
          <boxGeometry args={[0.55, 0.08, 0.5]} />
          <meshStandardMaterial color="#3B928C" wireframe={wireframe} />
        </mesh>
        <mesh position={[0, 0.3, 0.2]}>
          <boxGeometry args={[0.55, 0.55, 0.06]} />
          <meshStandardMaterial color="#3B928C" wireframe={wireframe} />
        </mesh>
        {[-0.22, 0.22].flatMap((a) =>
          [-0.2, 0.2].map((b) => (
            <mesh key={a + ":" + b} position={[a, -0.25, b]}>
              <boxGeometry args={[0.04, 0.5, 0.04]} />
              <meshStandardMaterial color="#769897" wireframe={wireframe} />
            </mesh>
          )),
        )}
      </group>
    </group>
  );
  return (
    <group ref={scene}>
      <mesh position={[0, -1.1, 0]}>
        <boxGeometry args={[5, 0.08, 3.8]} />
        <meshStandardMaterial
          color="#267372"
          transparent
          opacity={0.35}
          wireframe={active === 0}
        />
      </mesh>
      <gridHelper
        args={[5, 10, "#769897", "#267372"]}
        position={[0, -1.04, 0]}
      />
      <group ref={assembly}>
        {table(-1, 0, "first")}
        {active >= 3 && table(1, 0, "second")}
        {active === 2 && (
          <mesh position={[1, 0.1, 0]} rotation={[0, 0, 0.15]}>
            <boxGeometry args={[1.35, 0.13, 0.85]} />
            <meshStandardMaterial color="#D8B5A3" />
          </mesh>
        )}
      </group>
      {active >= 3 && (
        <mesh position={[0, 0.05, -1.65]}>
          <boxGeometry args={[3.8, 2.2, 0.1]} />
          <meshStandardMaterial
            color="#769897"
            metalness={0.1}
            roughness={0.7}
          />
        </mesh>
      )}
      {active === 4 && (
        <mesh position={[0, 0.1, -1.55]}>
          <boxGeometry args={[2.8, 1.3, 0.04]} />
          <meshStandardMaterial
            color="#b6d4ca"
            emissive="#267372"
            emissiveIntensity={0.65}
          />
        </mesh>
      )}
    </group>
  );
}
export default function OrbitScene({ active }: { active: number }) {
  return (
    <SceneBoundary>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [4, 3.3, 6], fov: 44 }}
        gl={{ alpha: true, antialias: true }}
        fallback={<div className="orbit-fallback" />}
      >
        <ambientLight intensity={1.8} />
        <directionalLight position={[3, 5, 4]} intensity={3} />
        <pointLight position={[-3, 2, 3]} color="#D8B5A3" intensity={12} />
        <LearningSpace active={active} />
      </Canvas>
    </SceneBoundary>
  );
}
