import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function FrequencyBars({ barCount = 64 }: { barCount?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colors = useMemo(() => {
    const arr = new Float32Array(barCount * 3);
    for (let i = 0; i < barCount; i++) {
      const t = i / barCount;
      // Green to purple gradient
      const color = new THREE.Color().setHSL(0.44 - t * 0.2, 0.8, 0.5);
      arr[i * 3] = color.r;
      arr[i * 3 + 1] = color.g;
      arr[i * 3 + 2] = color.b;
    }
    return arr;
  }, [barCount]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    for (let i = 0; i < barCount; i++) {
      const angle = (i / barCount) * Math.PI * 2;
      const radius = 2.5;
      
      // Simulated frequency data
      const freq =
        Math.sin(t * 2 + i * 0.3) * 0.4 +
        Math.sin(t * 3.5 + i * 0.15) * 0.3 +
        Math.sin(t * 1.2 + i * 0.5) * 0.2 +
        0.5;
      
      const height = Math.max(0.1, freq * 2.5);

      dummy.position.set(
        Math.cos(angle) * radius,
        height / 2,
        Math.sin(angle) * radius
      );
      dummy.scale.set(0.12, height, 0.12);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, barCount]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        vertexColors
        emissive={new THREE.Color(0x00cc88)}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0.6}
      />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colors, 3]}
      />
    </instancedMesh>
  );
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <circleGeometry args={[4, 64]} />
      <meshStandardMaterial
        color="#0a0a0f"
        roughness={0.9}
        metalness={0.1}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export default function Visualizer3D() {
  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 4, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#00cc88" />
        <pointLight position={[-5, 3, -5]} intensity={0.4} color="#8844cc" />
        <FrequencyBars />
        <Floor />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}
