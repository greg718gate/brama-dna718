import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { useLanguage } from "@/contexts/LanguageContext";

// Obliczenia matrycy
const phi = (1 + Math.sqrt(5)) / 2;
const gamma = 1 / phi;
const alpha = Math.sqrt((1 - gamma ** 2) / 2);
const beta = Math.sqrt((1 - gamma ** 2) / 2);
const M = new THREE.Vector3(alpha, beta, gamma);

// Dane rezonansów
const resonances = [
  { name: "Ziemia 7.83 Hz", nameEn: "Earth 7.83 Hz", vec: new THREE.Vector3(0, 1, 0), color: "#32CD32", freq: 7.83 },
  { name: "Modulacja 18.6 Hz", nameEn: "Modulation 18.6 Hz", vec: new THREE.Vector3(0, 0, 1), color: "#9932CC", freq: 18.6 },
  { name: "Brama DNA 718 Hz", nameEn: "DNA Gate 718 Hz", vec: new THREE.Vector3(alpha * 1.05, beta * 1.05, gamma * 1.05), color: "#FFA500", freq: 718 },
];

const Sphere = () => {
  return (
    <mesh>
      <sphereGeometry args={[1.3, 48, 48]} />
      <meshStandardMaterial 
        color="#00CED1" 
        transparent 
        opacity={0.08} 
        wireframe={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

const SphereWireframe = () => {
  return (
    <mesh>
      <sphereGeometry args={[1.3, 24, 24]} />
      <meshBasicMaterial 
        color="#4a5568" 
        transparent 
        opacity={0.15} 
        wireframe={true}
      />
    </mesh>
  );
};

const Axes = ({ language }: { language: string }) => {
  const labels = {
    pl: { sun: "α (Słońce)", earth: "β (Ziemia)", human: "γ (Człowiek)" },
    en: { sun: "α (Sun)", earth: "β (Earth)", human: "γ (Human)" }
  };
  const t = language === "pl" ? labels.pl : labels.en;

  return (
    <>
      {/* α - Słońce (czerwona) */}
      <arrowHelper args={[new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1.5, 0xff4444, 0.12, 0.08]} />
      <Text position={[1.7, 0, 0]} fontSize={0.12} color="#ff4444" anchorX="left">
        {t.sun}
      </Text>

      {/* β - Ziemia (zielona) */}
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x44ff44, 0.12, 0.08]} />
      <Text position={[0, 1.7, 0]} fontSize={0.12} color="#44ff44" anchorX="center">
        {t.earth}
      </Text>

      {/* γ - Człowiek (niebieska) */}
      <arrowHelper args={[new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, 0), 1.5, 0x4488ff, 0.12, 0.08]} />
      <Text position={[0, 0, 1.7]} fontSize={0.12} color="#4488ff" anchorX="center">
        {t.human}
      </Text>
    </>
  );
};

const ResonanceVectors = ({ language }: { language: string }) => {
  return (
    <>
      {resonances.map((res, index) => {
        const normalizedVec = res.vec.clone().normalize().multiplyScalar(1.4);
        const labelPos = res.vec.clone().normalize().multiplyScalar(1.6);
        const name = language === "pl" ? res.name : res.nameEn;
        
        return (
          <group key={index}>
            <Line
              points={[[0, 0, 0], [normalizedVec.x, normalizedVec.y, normalizedVec.z]]}
              color={res.color}
              lineWidth={3}
            />
            <mesh position={[normalizedVec.x, normalizedVec.y, normalizedVec.z]}>
              <coneGeometry args={[0.05, 0.12, 8]} />
              <meshStandardMaterial color={res.color} emissive={res.color} emissiveIntensity={0.3} />
            </mesh>
            <Text 
              position={[labelPos.x, labelPos.y + 0.1, labelPos.z]} 
              fontSize={0.09} 
              color={res.color}
              anchorX="center"
            >
              {name}
            </Text>
          </group>
        );
      })}
    </>
  );
};

const VectorM = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const t = clock.getElapsedTime();
      
      // Kombinacja pulsacji z różnymi częstotliwościami (skalowane dla wizualizacji)
      const pulse18 = 1 + 0.15 * Math.sin(2 * Math.PI * 18.6 * t / 50);
      const pulse718 = 1 + 0.08 * Math.sin(2 * Math.PI * 718 * t / 500);
      const combinedPulse = pulse18 * pulse718;
      
      meshRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse);
      glowRef.current.scale.set(combinedPulse * 1.5, combinedPulse * 1.5, combinedPulse * 1.5);
      
      // Pulsacja jasności
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 3);
    }
  });

  return (
    <>
      {/* Glow effect */}
      <mesh ref={glowRef} position={[M.x, M.y, M.z]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.3} 
          transparent 
          opacity={0.3} 
        />
      </mesh>

      {/* Punkt M */}
      <mesh ref={meshRef} position={[M.x, M.y, M.z]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial 
          color="#ffd700" 
          emissive="#ffd700" 
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Linia od początku do M */}
      <Line
        points={[[0, 0, 0], [M.x, M.y, M.z]]}
        color="#ffd700"
        lineWidth={2}
        dashed
        dashSize={0.1}
        dashScale={10}
      />

      {/* Etykieta M */}
      <Text 
        position={[M.x + 0.15, M.y + 0.2, M.z + 0.1]} 
        fontSize={0.1} 
        color="#ffd700"
        anchorX="left"
      >
        M ({alpha.toFixed(3)}, {beta.toFixed(3)}, {gamma.toFixed(3)})
      </Text>
    </>
  );
};

const Legend = ({ language }: { language: string }) => {
  const items = [
    { color: "#ff4444", label: language === "pl" ? "α (Słońce)" : "α (Sun)" },
    { color: "#44ff44", label: language === "pl" ? "β (Ziemia)" : "β (Earth)" },
    { color: "#4488ff", label: language === "pl" ? "γ (Człowiek)" : "γ (Human)" },
    { color: "#ffd700", label: `M (φ⁻¹ = ${gamma.toFixed(4)})` },
    { color: "#32CD32", label: language === "pl" ? "Ziemia 7.83 Hz" : "Earth 7.83 Hz" },
    { color: "#9932CC", label: language === "pl" ? "Modulacja 18.6 Hz" : "Modulation 18.6 Hz" },
    { color: "#FFA500", label: language === "pl" ? "Brama DNA 718 Hz" : "DNA Gate 718 Hz" },
  ];

  return (
    <div className="absolute top-4 left-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-xs space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full border border-border" 
            style={{ backgroundColor: item.color }}
          />
          <span className="text-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};

export const PentagramSphere = () => {
  const { t, language } = useLanguage();
  
  return (
    <div className="w-full h-[650px] bg-gradient-to-b from-background to-card rounded-lg border border-border overflow-hidden relative">
      <div className="p-6 border-b border-border bg-card/50">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {t('pentagramSphere.title')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('pentagramSphere.description')}
        </p>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          <span>φ = {phi.toFixed(6)}</span>
          <span>γ = φ⁻¹ = {gamma.toFixed(6)}</span>
          <span>α = β = {alpha.toFixed(6)}</span>
        </div>
      </div>
      
      <Legend language={language} />
      
      <div className="h-[calc(100%-130px)]">
        <Canvas camera={{ position: [3.5, 2, 2], fov: 45 }}>
          <color attach="background" args={['#0a0a0a']} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4488ff" />
          <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffd700" />
          
          <Sphere />
          <SphereWireframe />
          <Axes language={language} />
          <ResonanceVectors language={language} />
          <VectorM />
          
          <OrbitControls
            enableZoom={true}
            enablePan={true}
            enableRotate={true}
            autoRotate={true}
            autoRotateSpeed={1.5}
            minDistance={2}
            maxDistance={8}
          />
        </Canvas>
      </div>
    </div>
  );
};
