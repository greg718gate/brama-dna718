import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

// Obliczenia matrycy
const phi = (1 + Math.sqrt(5)) / 2;
const gamma = 1 / phi;
const alpha = Math.sqrt((1 - gamma ** 2) / 2);
const beta = Math.sqrt((1 - gamma ** 2) / 2);
const M = new THREE.Vector3(alpha, beta, gamma);

const Sphere = () => {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#00bfff" transparent opacity={0.3} />
    </mesh>
  );
};

const Axes = () => {
  return (
    <>
      {/* α - Słońce (czerwona) */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.2, 0xff0000, 0.2, 0.1]} />
      <Text position={[1.4, 0, 0]} fontSize={0.15} color="red">
        α (Słońce)
      </Text>

      {/* β - Ziemia (zielona) */}
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.2, 0x00ff00, 0.2, 0.1]} />
      <Text position={[0, 1.4, 0]} fontSize={0.15} color="green">
        β (Ziemia)
      </Text>

      {/* γ - Człowiek (niebieska) */}
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.2, 0x0000ff, 0.2, 0.1]} />
      <Text position={[0, 0, 1.4]} fontSize={0.15} color="blue">
        γ (Człowiek)
      </Text>
    </>
  );
};

const VectorM = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <>
      {/* Punkt M */}
      <mesh ref={meshRef} position={[M.x, M.y, M.z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
      </mesh>

      {/* Linia od początku do M */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, M.x, M.y, M.z])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffd700" linewidth={2} />
      </line>

      {/* Etykieta M */}
      <Text position={[M.x + 0.2, M.y + 0.2, M.z]} fontSize={0.15} color="gold">
        M ({alpha.toFixed(3)}, {beta.toFixed(3)}, {gamma.toFixed(3)})
      </Text>
    </>
  );
};

const RotatingCamera = () => {
  useFrame(({ camera, clock }) => {
    const time = clock.getElapsedTime() * 0.2;
    camera.position.x = Math.cos(time) * 3;
    camera.position.z = Math.sin(time) * 3;
    camera.position.y = 1.5;
    camera.lookAt(0, 0, 0);
  });
  return null;
};

export const PentagramSphere = () => {
  return (
    <div className="w-full h-[600px] bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          PENTAGRAM PRAWDY – Wektor M na Sferze Jednostkowej
        </h2>
        <p className="text-muted-foreground mt-2">
          α = β = {alpha.toFixed(6)}, γ = 1/φ = {gamma.toFixed(6)}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Normalizacja: α² + β² + γ² = {(alpha ** 2 + beta ** 2 + gamma ** 2).toFixed(6)} ≈ 1
        </p>
      </div>
      <Canvas camera={{ position: [3, 1.5, 0], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />
        
        <Sphere />
        <Axes />
        <VectorM />
        <RotatingCamera />
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          autoRotate={false}
        />
        
        <gridHelper args={[4, 8, "#444444", "#222222"]} />
      </Canvas>
    </div>
  );
};
