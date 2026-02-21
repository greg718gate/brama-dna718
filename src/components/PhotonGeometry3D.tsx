import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles } from "lucide-react";

const PHI = (1 + Math.sqrt(5)) / 2;
const PARTICLE_COUNT = 800;

/** Generate Fibonacci sphere positions */
function fibonacciSphere(count: number, radius: number): Float32Array {
  const positions = new Float32Array(count * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    positions[i * 3] = Math.cos(theta) * radiusAtY * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * radius;
  }
  return positions;
}

interface PhotonCloudProps {
  coherence: number;
  isPhotonic: boolean;
  focusIntensity: number;
  isCollapsed: boolean;
}

/** The main particle system — now with DRAMATIC differences */
function PhotonCloud({ coherence, isPhotonic, focusIntensity, isCollapsed }: PhotonCloudProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const collapseTimeRef = useRef<number | null>(null);

  const basePositions = useMemo(() => fibonacciSphere(PARTICLE_COUNT, 2.5), []);

  // Track mouse for observer effect
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const col = geo.attributes.color as THREE.BufferAttribute;
    const t = clock.getElapsedTime();

    // Track collapse animation
    if (isCollapsed && !collapseTimeRef.current) {
      collapseTimeRef.current = t;
    } else if (!isCollapsed) {
      collapseTimeRef.current = null;
    }
    const collapseProgress = isCollapsed && collapseTimeRef.current
      ? Math.min(1, (t - collapseTimeRef.current) / 1.5)
      : 0;

    // === FOCUS EFFECTS (dramatic!) ===
    // Focus squashes sphere into disc AND changes particle speed/density
    const focusSq = focusIntensity * focusIntensity; // quadratic for dramatic effect
    const lensSquash = 1 - focusSq * 0.92;          // sphere → paper-thin disc
    const lensExpand = 1 + focusSq * 0.6;            // radial expansion
    const focusSpeed = 1 - focusSq * 0.8;            // slow down particles at high focus
    const focusGlow = focusSq;                       // glow intensity

    // === COHERENCE-BASED BEHAVIOR ===
    // Make coherence produce VERY different visuals
    // Low coherence (<0.5): chaotic, explosive, fast, warm colors
    // High coherence (>0.7): orderly, slow, geometric, cool colors
    const chaos = Math.max(0, 1 - coherence * 1.5);  // 0 at 0.67+, 1 at 0
    const order = Math.max(0, coherence * 1.5 - 0.5); // 0 at 0.33-, 1 at 1.0
    
    const mx = mouseRef.current.x * 0.8;
    const my = mouseRef.current.y * 0.8;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Observer effect (mouse)
      const distToMouse = Math.sqrt(
        (bx / 2.5 - mx) ** 2 + (by / 2.5 - my) ** 2
      );
      const influence = Math.max(0, 1 - distToMouse) * 0.6 * (1 - collapseProgress);

      if (isCollapsed) {
        // COLLAPSE: lerp to perfect symmetry
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const yTarget = (1 - (i / (PARTICLE_COUNT - 1)) * 2) * 2.0;
        const rTarget = Math.sqrt(Math.max(0, 1 - (yTarget / 2.0) ** 2)) * 2.0;
        const thetaTarget = goldenAngle * i;
        const xTarget = Math.cos(thetaTarget) * rTarget;
        const zTarget = Math.sin(thetaTarget) * rTarget;

        const ease = 1 - Math.pow(1 - collapseProgress, 3);
        pos.setXYZ(i, 
          bx + (xTarget - bx) * ease,
          by + (yTarget - by) * ease,
          bz + (zTarget - bz) * ease
        );

        // Cyan-white during collapse
        col.setXYZ(i, 0.2 + 0.6 * ease, 0.5 + 0.3 * ease, 0.3 + 0.6 * ease);
      } else {
        // === DYNAMIC MOTION based on coherence + focus ===
        
        // Chaotic component: pulsing, random, explosive
        const chaosSpeed = (3 + chaos * 8) * focusSpeed;
        const chaosPulse = Math.sin(t * chaosSpeed + i * 0.1) * 0.5 * chaos;
        const chaosRandom = Math.sin(t * 7 + i * PHI) * 0.3 * chaos;
        const chaosScale = 1 + chaosPulse + chaosRandom;
        
        // Ordered component: slow rotation, breathing
        const orderAngle = t * 0.3 * focusSpeed + i * 0.001;
        const orderBreathe = Math.sin(t * 0.5 + i * 0.02) * 0.05 * order;
        const orderR = 1 + orderBreathe;
        
        // Blend chaotic and ordered motion
        const blendChaos = chaos * (1 - focusSq * 0.5); // focus reduces chaos
        const blendOrder = order + focusSq * 0.5;         // focus adds order
        
        // Chaotic position
        const cx = bx * chaosScale + Math.sin(t * 2 + i) * 0.2 * blendChaos;
        const cy = by * chaosScale + Math.cos(t * 3 + i * 0.7) * 0.2 * blendChaos;
        const cz = bz * chaosScale + Math.sin(t * 1.5 + i * 1.3) * 0.15 * blendChaos;
        
        // Ordered position (rotated)
        const cos = Math.cos(orderAngle);
        const sin = Math.sin(orderAngle);
        const ox = (bx * cos - bz * sin) * orderR;
        const oy = by * orderR;
        const oz = (bx * sin + bz * cos) * orderR;
        
        // Final blend
        const totalBlend = blendChaos + blendOrder;
        const chaosW = blendChaos / Math.max(totalBlend, 0.01);
        const orderW = blendOrder / Math.max(totalBlend, 0.01);
        
        let fx = (cx * chaosW + ox * orderW) * lensExpand;
        let fy = (cy * chaosW + oy * orderW) * lensSquash;
        let fz = (cz * chaosW + oz * orderW) * lensExpand;
        
        // Mouse influence
        fx += mx * influence * 0.3;
        fy += my * influence * 0.3;
        
        pos.setXYZ(i, fx, fy, fz);
        
        // === COLORS: dramatically different per coherence + focus ===
        const iNorm = i / PARTICLE_COUNT;
        
        if (coherence < 0.3) {
          // LOW COHERENCE: Gold/amber/white — explosive fire
          const flash = Math.sin(t * 5 + i * 0.3) * 0.3 + 0.7;
          col.setXYZ(i,
            1.0,
            0.7 * flash + 0.15,
            0.1 + flash * 0.3
          );
        } else if (coherence < 0.6) {
          // MEDIUM COHERENCE: Purple/blue — transitional
          const wave = Math.sin(t * 2 + i * 0.2) * 0.2 + 0.5;
          col.setXYZ(i,
            0.4 + wave * 0.3,
            0.2 + wave * 0.2,
            0.7 + wave * 0.3
          );
        } else if (coherence < 0.85) {
          // HIGH COHERENCE: Emerald/teal — stable
          const breathe = Math.sin(t * 1 + i * 0.05) * 0.1 + 0.8;
          col.setXYZ(i,
            0.05,
            0.5 + breathe * 0.3,
            0.3 + breathe * 0.1
          );
        } else {
          // VERY HIGH: Cyan/white — crystalline
          const pulse = Math.sin(t * 0.7 + i * 0.03) * 0.1 + 0.9;
          col.setXYZ(i,
            0.5 + pulse * 0.3,
            0.8 + pulse * 0.15,
            0.9 + pulse * 0.1
          );
        }
        
        // Focus tints towards violet at high intensity
        if (focusIntensity > 0.3) {
          const currentR = col.getX(i);
          const currentG = col.getY(i);
          const currentB = col.getZ(i);
          const fMix = (focusIntensity - 0.3) / 0.7; // 0-1 above threshold
          col.setXYZ(i,
            currentR + (0.6 - currentR) * fMix * 0.5,
            currentG + (0.2 - currentG) * fMix * 0.3,
            currentB + (1.0 - currentB) * fMix * 0.4
          );
        }
      }
    }

    pos.needsUpdate = true;
    col.needsUpdate = true;

    // Rotation speed varies with coherence
    const rotSpeed = isCollapsed ? 0.0005 : 0.001 + chaos * 0.004;
    pointsRef.current.rotation.y += rotSpeed * focusSpeed;
  });

  // Particle size: bigger for chaotic, smaller for ordered, bigger for focus
  const particleSize = isPhotonic ? 0.09 : 0.04 + (1 - coherence) * 0.05 + focusIntensity * 0.03;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={new Float32Array(basePositions)}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={new Float32Array(PARTICLE_COUNT * 3).fill(0.5)}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Glow sphere — adapts to coherence level */
function GlowSphere({ coherence, focusIntensity }: { coherence: number; focusIntensity: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const baseScale = 1 + (1 - coherence) * 0.5; // bigger glow for low coherence
    const pulse = Math.sin(t * (1 + (1 - coherence) * 3)) * 0.2;
    const focusScale = 1 + focusIntensity * 0.3;
    ref.current.scale.setScalar((baseScale + pulse) * focusScale);
    
    const mat = ref.current.material as THREE.MeshBasicMaterial;
    mat.opacity = 0.04 + (1 - coherence) * 0.06 + focusIntensity * 0.03;
    
    // Color shifts with coherence
    if (coherence < 0.3) {
      mat.color.setHSL(0.12, 0.9, 0.5); // gold
    } else if (coherence < 0.6) {
      mat.color.setHSL(0.75, 0.7, 0.4); // purple
    } else {
      mat.color.setHSL(0.45, 0.8, 0.4); // emerald
    }
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[3.2, 32, 32]} />
      <meshBasicMaterial
        color="#FFD700"
        transparent
        opacity={0.06}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

interface PhotonGeometry3DProps {
  coherence: number;
  focusIntensity?: number;
  isCollapsed?: boolean;
}

export const PhotonGeometry3D = ({ coherence, focusIntensity = 0, isCollapsed = false }: PhotonGeometry3DProps) => {
  const { language } = useLanguage();
  const pl = language === "pl";
  const isPhotonic = coherence < 0.3;

  // Phase label based on coherence
  const phaseLabel = coherence < 0.3
    ? (pl ? "FAZA EKSPLOZJI — chaos fotonowy" : "EXPLOSION PHASE — photon chaos")
    : coherence < 0.6
    ? (pl ? "FAZA PRZEJŚCIOWA — superpozycja" : "TRANSITION PHASE — superposition")
    : coherence < 0.85
    ? (pl ? "FAZA KOHERENTNA — porządek geometryczny" : "COHERENT PHASE — geometric order")
    : (pl ? "FAZA KRYSTALICZNA — pełna symetria" : "CRYSTALLINE PHASE — full symmetry");

  // Focus label
  const focusLabel = focusIntensity > 0.7
    ? (pl ? "Soczewka skupiająca aktywna" : "Focus lens active")
    : focusIntensity > 0.3
    ? (pl ? "Zagęszczanie chmury" : "Cloud condensing")
    : (pl ? "Chmura swobodna" : "Cloud free");

  return (
    <Card
      className={`overflow-hidden border ${
        coherence < 0.3
          ? "border-amber-400/30"
          : coherence < 0.6
          ? "border-purple-400/30"
          : coherence < 0.85
          ? "border-emerald-500/30"
          : "border-cyan-400/30"
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Sparkles
            className={`w-5 h-5 ${
              coherence < 0.3
                ? "text-amber-400"
                : coherence < 0.6
                ? "text-purple-400"
                : coherence < 0.85
                ? "text-emerald-400"
                : "text-cyan-400"
            }`}
          />
          {pl ? "Geometria Fotonowa — Sfera Fibonacciego" : "Photon Geometry — Fibonacci Sphere"}
        </CardTitle>
        <p className="text-xs text-muted-foreground font-mono">
          {phaseLabel}
        </p>
        {focusIntensity > 0 && (
          <p className="text-[10px] text-purple-400/80 font-mono">
            ⟐ {focusLabel} ({(focusIntensity * 100).toFixed(0)}%)
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] w-full bg-[hsl(220,25%,4%)] rounded-b-lg">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: "hsl(220, 25%, 4%)" }}
          >
            <ambientLight intensity={0.2} />
            <PhotonCloud
              coherence={coherence}
              isPhotonic={isPhotonic}
              focusIntensity={focusIntensity}
              isCollapsed={isCollapsed}
            />
            <GlowSphere coherence={coherence} focusIntensity={focusIntensity} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={isPhotonic ? 2 : 0.5 + (1 - coherence) * 1.5}
            />
          </Canvas>
        </div>
        <div className="px-4 py-2 text-center space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground block">
            {pl
              ? `Koherencja: ${(coherence * 100).toFixed(1)}% | Cząsteczki: ${PARTICLE_COUNT} | Rozkład: Sfera φ`
              : `Coherence: ${(coherence * 100).toFixed(1)}% | Particles: ${PARTICLE_COUNT} | Distribution: φ Sphere`}
          </span>
          {isCollapsed && (
            <span className="text-[10px] font-mono text-cyan-400 block">
              {pl ? "⚛ KOLAPS AKTYWNY — geometria zamrożona" : "⚛ COLLAPSE ACTIVE — geometry frozen"}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
