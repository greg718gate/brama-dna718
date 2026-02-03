import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useLanguage } from "@/contexts/LanguageContext";
import { useResonance } from "@/contexts/ResonanceContext";

// Obliczenia matrycy
const phi = (1 + Math.sqrt(5)) / 2;
const gamma = 1 / phi;
const alpha = Math.sqrt((1 - gamma ** 2) / 2);
const beta = Math.sqrt((1 - gamma ** 2) / 2);
const M = new THREE.Vector3(alpha, beta, gamma);

// Kolory efektów
const GOLDEN_COLOR = "#FFD700";
const ALIGNED_COLOR = "#00FF88";

// Dane rezonansów - dynamiczna częstotliwość DNA Gate
const getResonances = (tunedFreq: number) => [
  { name: "Ziemia 7.83 Hz", nameEn: "Earth 7.83 Hz", vec: new THREE.Vector3(0, 1, 0), color: "#32CD32", freq: 7.83 },
  { name: "Modulacja 18.6 Hz", nameEn: "Modulation 18.6 Hz", vec: new THREE.Vector3(0, 0, 1), color: "#9932CC", freq: 18.6 },
  { name: `Brama DNA ${tunedFreq.toFixed(2)} Hz`, nameEn: `DNA Gate ${tunedFreq.toFixed(2)} Hz`, vec: new THREE.Vector3(alpha * 1.05, beta * 1.05, gamma * 1.05), color: "#FFA500", freq: tunedFreq },
];

interface ResonanceEffectState {
  isAligned: boolean;
  intensity: number;
  isGoldenPulse: boolean;
}

const Sphere = ({ resonanceEffect }: { resonanceEffect: ResonanceEffectState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      if (resonanceEffect.isGoldenPulse) {
        // Złoty Błysk - pulsacja kolorem złotym
        const pulseIntensity = Math.sin(clock.getElapsedTime() * 8) * 0.5 + 0.5;
        material.color.setStyle(GOLDEN_COLOR);
        material.opacity = 0.1 + pulseIntensity * resonanceEffect.intensity * 0.2;
        material.emissive = new THREE.Color(GOLDEN_COLOR);
        material.emissiveIntensity = pulseIntensity * resonanceEffect.intensity * 0.3;
      } else if (resonanceEffect.isAligned) {
        // Stabilizacja przy wysokiej koherencji
        material.color.setStyle(ALIGNED_COLOR);
        material.opacity = 0.12;
        material.emissive = new THREE.Color(ALIGNED_COLOR);
        material.emissiveIntensity = 0.1;
      } else {
        // Stan domyślny
        material.color.setStyle("#00CED1");
        material.opacity = 0.08;
        material.emissive = new THREE.Color("#000000");
        material.emissiveIntensity = 0;
      }
    }
  });

  return (
    <mesh ref={meshRef}>
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

      {/* β - Ziemia (cyjan - odróżnienie od rezonansu) */}
      <arrowHelper args={[new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 0), 1.5, 0x00CED1, 0.12, 0.08]} />
      <Text position={[0, 1.7, 0]} fontSize={0.12} color="#00CED1" anchorX="center">
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

const ResonanceVectors = ({ language, tunedFrequency }: { language: string; tunedFrequency: number }) => {
  // Offsety dla etykiet, żeby nie nakładały się na osie
  const labelOffsets = [
    { x: 0.25, y: 0, z: 0.1 },   // Ziemia 7.83 Hz - przesunięta w prawo
    { x: 0.15, y: 0.1, z: 0 },   // Modulacja 18.6 Hz - przesunięta w górę
    { x: 0, y: 0.15, z: 0 },     // Brama DNA - lekko w górę
  ];

  const resonances = getResonances(tunedFrequency);

  return (
    <>
      {resonances.map((res, index) => {
        const normalizedVec = res.vec.clone().normalize().multiplyScalar(1.4);
        const offset = labelOffsets[index];
        const labelPos = new THREE.Vector3(
          normalizedVec.x * 1.15 + offset.x,
          normalizedVec.y * 1.15 + offset.y,
          normalizedVec.z * 1.15 + offset.z
        );
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
              position={[labelPos.x, labelPos.y, labelPos.z]} 
              fontSize={0.09} 
              color={res.color}
              anchorX="left"
            >
              {name}
            </Text>
          </group>
        );
      })}
    </>
  );
};

const VectorM = ({ resonanceEffect }: { resonanceEffect: ResonanceEffectState }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const orbitControlsRef = useRef<any>(null);

  useFrame(({ clock }) => {
    if (meshRef.current && glowRef.current) {
      const t = clock.getElapsedTime();
      
      // Kombinacja pulsacji z różnymi częstotliwościami (skalowane dla wizualizacji)
      let pulse18 = 1 + 0.15 * Math.sin(2 * Math.PI * 18.6 * t / 50);
      let pulse718 = 1 + 0.08 * Math.sin(2 * Math.PI * 718 * t / 500);
      
      // Efekt Złotego Błysku - wzmocniona pulsacja
      if (resonanceEffect.isGoldenPulse) {
        const goldenPulse = 1 + 0.5 * Math.sin(t * 10) * resonanceEffect.intensity;
        pulse18 *= goldenPulse;
        pulse718 *= goldenPulse;
        
        // Zmiana koloru na złoty
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.color.setStyle(GOLDEN_COLOR);
        material.emissive = new THREE.Color(GOLDEN_COLOR);
        material.emissiveIntensity = 0.8 + 0.2 * Math.sin(t * 15);
        
        const glowMaterial = glowRef.current.material as THREE.MeshStandardMaterial;
        glowMaterial.color.setStyle(GOLDEN_COLOR);
        glowMaterial.emissive = new THREE.Color(GOLDEN_COLOR);
        glowMaterial.emissiveIntensity = 0.5 * resonanceEffect.intensity;
      } else {
        // Przywróć domyślny kolor
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.color.setStyle("#ffd700");
        material.emissive = new THREE.Color("#ffd700");
        material.emissiveIntensity = 0.5;
        
        const glowMaterial = glowRef.current.material as THREE.MeshStandardMaterial;
        glowMaterial.color.setStyle("#ffd700");
        glowMaterial.emissive = new THREE.Color("#ffd700");
        glowMaterial.emissiveIntensity = 0.3;
      }
      
      const combinedPulse = pulse18 * pulse718;
      
      meshRef.current.scale.set(combinedPulse, combinedPulse, combinedPulse);
      glowRef.current.scale.set(combinedPulse * 1.5, combinedPulse * 1.5, combinedPulse * 1.5);
      
      // Pulsacja jasności
      const material = glowRef.current.material as THREE.MeshStandardMaterial;
      if (!resonanceEffect.isGoldenPulse) {
        material.emissiveIntensity = 0.3 + 0.2 * Math.sin(t * 3);
      }
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

// Komponent efektu stabilizacji geometrii
const StabilizationEffect = ({ isAligned, intensity }: { isAligned: boolean; intensity: number }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (ringRef.current && isAligned) {
      const t = clock.getElapsedTime();
      // Powolna rotacja przy stabilizacji
      ringRef.current.rotation.z = t * 0.5;
      ringRef.current.rotation.x = Math.sin(t * 0.3) * 0.1;
      
      const material = ringRef.current.material as THREE.MeshStandardMaterial;
      material.opacity = 0.2 + intensity * 0.3;
    }
  });
  
  if (!isAligned) return null;
  
  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[1.5, 0.02, 16, 100]} />
      <meshStandardMaterial 
        color={ALIGNED_COLOR}
        emissive={ALIGNED_COLOR}
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

const Legend = ({ language, resonanceEffect, tunedFrequency }: { language: string; resonanceEffect: ResonanceEffectState; tunedFrequency: number }) => {
  const axisItems = [
    { color: "#ff4444", label: language === "pl" ? "α (Słońce)" : "α (Sun)" },
    { color: "#00CED1", label: language === "pl" ? "β (Ziemia)" : "β (Earth)" },
    { color: "#4488ff", label: language === "pl" ? "γ (Człowiek)" : "γ (Human)" },
    { color: "#ffd700", label: `M (φ⁻¹)` },
  ];

  const resonanceItems = [
    { color: "#32CD32", label: "7.83 Hz" },
    { color: "#9932CC", label: "18.6 Hz" },
    { color: "#FFA500", label: `${tunedFrequency.toFixed(2)} Hz` },
  ];

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] md:text-xs">
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {axisItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {resonanceItems.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
      
      {/* Status rezonansu */}
      {resonanceEffect.isGoldenPulse && (
        <div className="w-full mt-2 flex items-center gap-2 text-[#FFD700] animate-pulse">
          <div className="w-3 h-3 rounded-full bg-[#FFD700] animate-ping" />
          <span className="font-semibold">
            {language === "pl" ? "ZŁOTY REZONANS AKTYWNY" : "GOLDEN RESONANCE ACTIVE"}
          </span>
          <span className="text-xs">({(resonanceEffect.intensity * 100).toFixed(0)}%)</span>
        </div>
      )}
      
      {resonanceEffect.isAligned && !resonanceEffect.isGoldenPulse && (
        <div className="w-full mt-2 flex items-center gap-2 text-[#00FF88]">
          <div className="w-3 h-3 rounded-full bg-[#00FF88]" />
          <span className="font-medium">
            {language === "pl" ? "Geometria ustabilizowana" : "Geometry Stabilized"}
          </span>
        </div>
      )}
    </div>
  );
};

// Komponent sceny z efektami rezonansu
const Scene = ({ language, resonanceEffect, tunedFrequency }: { language: string; resonanceEffect: ResonanceEffectState; tunedFrequency: number }) => {
  const controlsRef = useRef<any>(null);
  
  // Stabilizacja geometrii - zatrzymanie rotacji przy wysokiej koherencji
  useFrame(() => {
    if (controlsRef.current) {
      if (resonanceEffect.isAligned && resonanceEffect.intensity > 0.8) {
        // Stopniowe zatrzymanie przy bardzo wysokiej koherencji
        controlsRef.current.autoRotateSpeed = 0.3;
      } else if (resonanceEffect.isGoldenPulse) {
        // Przyspieszenie przy Złotym Błysku
        controlsRef.current.autoRotateSpeed = 3 + resonanceEffect.intensity * 2;
      } else {
        // Normalna prędkość
        controlsRef.current.autoRotateSpeed = 1.5;
      }
    }
  });
  
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4488ff" />
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#ffd700" />
      
      {/* Dodatkowe światło przy Złotym Błysku */}
      {resonanceEffect.isGoldenPulse && (
        <pointLight 
          position={[M.x * 3, M.y * 3, M.z * 3]} 
          intensity={resonanceEffect.intensity * 2} 
          color={GOLDEN_COLOR} 
        />
      )}
      
      <Sphere resonanceEffect={resonanceEffect} />
      <SphereWireframe />
      <Axes language={language} />
      <ResonanceVectors language={language} tunedFrequency={tunedFrequency} />
      <VectorM resonanceEffect={resonanceEffect} />
      <StabilizationEffect isAligned={resonanceEffect.isAligned} intensity={resonanceEffect.intensity} />
      
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={1.5}
        minDistance={2}
        maxDistance={8}
      />
    </>
  );
};

export const PentagramSphere = () => {
  const { t, language } = useLanguage();
  const { activeEffect, state, tunedFrequency } = useResonance();
  
  // Stan efektów rezonansu oparty na kontekście
  const resonanceEffect: ResonanceEffectState = {
    isAligned: state.isAligned,
    intensity: state.coherenceLevel,
    isGoldenPulse: activeEffect?.type === "GOLDEN_RESONANCE" || activeEffect?.type === "TUNED",
  };
  
  return (
    <div className="w-full h-[600px] md:h-[650px] bg-gradient-to-b from-background to-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border bg-card/50">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          {t('pentagramSphere.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {t('pentagramSphere.description')}
        </p>
        <div className="flex flex-wrap gap-2 md:gap-4 mt-2 text-xs md:text-sm text-muted-foreground">
          <span>φ = {phi.toFixed(4)}</span>
          <span>γ = {gamma.toFixed(4)}</span>
          <span className="text-amber-500 font-mono">f = {tunedFrequency.toFixed(4)} Hz</span>
        </div>
        <Legend language={language} resonanceEffect={resonanceEffect} tunedFrequency={tunedFrequency} />
      </div>
      
      <div className="h-[calc(100%-160px)] md:h-[calc(100%-150px)]">
        <Canvas camera={{ position: [3.5, 2, 2], fov: 45 }}>
          <Scene language={language} resonanceEffect={resonanceEffect} tunedFrequency={tunedFrequency} />
        </Canvas>
      </div>
    </div>
  );
};
