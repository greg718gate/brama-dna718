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
    const y = 1 - (i / (count - 1)) * 2; // -1 to 1
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
  focusIntensity: number; // 0–1 from WillPowerController
  isCollapsed: boolean;   // freeze into symmetry
}

/** The main particle system */
function PhotonCloud({ coherence, isPhotonic, focusIntensity, isCollapsed }: PhotonCloudProps) {
  const pointsRef = useRef<THREE.Points>(null!);
  const mouseRef = useRef(new THREE.Vector2(0, 0));
  const { viewport } = useThree();
  const collapseTimeRef = useRef<number | null>(null);

  const basePositions = useMemo(() => fibonacciSphere(PARTICLE_COUNT, 2.5), []);

  // Colors
  const colors = useMemo(() => {
    const arr = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      if (isPhotonic) {
        // Gold-white: randomize between gold and white
        const mix = Math.random() * 0.6 + 0.4;
        arr[i * 3] = 1.0;
        arr[i * 3 + 1] = 0.84 * mix + (1 - mix);
        arr[i * 3 + 2] = 0.2 * mix + (1 - mix) * 0.9;
      } else {
        // Emerald: varying shades
        const mix = Math.random() * 0.5 + 0.5;
        arr[i * 3] = 0.1 * mix;
        arr[i * 3 + 1] = 0.6 + 0.3 * mix;
        arr[i * 3 + 2] = 0.3 * mix;
      }
    }
    return arr;
  }, [isPhotonic]);

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

    // Track collapse animation progress
    if (isCollapsed && !collapseTimeRef.current) {
      collapseTimeRef.current = t;
    } else if (!isCollapsed) {
      collapseTimeRef.current = null;
    }
    const collapseProgress = isCollapsed && collapseTimeRef.current
      ? Math.min(1, (t - collapseTimeRef.current) / 1.5)
      : 0;

    // Focus: squash Y axis to create lens shape (sphere → disc)
    const lensSquash = 1 - focusIntensity * 0.85; // 1.0 → 0.15
    const lensExpand = 1 + focusIntensity * 0.3;   // radial expansion

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      // Observer effect
      const mx = mouseRef.current.x * 0.8;
      const my = mouseRef.current.y * 0.8;
      const distToMouse = Math.sqrt(
        (bx / 2.5 - mx) ** 2 + (by / 2.5 - my) ** 2
      );
      const influence = Math.max(0, 1 - distToMouse) * 0.6 * (1 - collapseProgress);

      if (isCollapsed) {
        // COLLAPSE: lerp from current chaotic position to perfect icosahedron-like symmetry
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        const yTarget = (1 - (i / (PARTICLE_COUNT - 1)) * 2) * 2.0;
        const rTarget = Math.sqrt(Math.max(0, 1 - (yTarget / 2.0) ** 2)) * 2.0;
        const thetaTarget = goldenAngle * i;
        const xTarget = Math.cos(thetaTarget) * rTarget;
        const zTarget = Math.sin(thetaTarget) * rTarget;

        // Smooth ease-out lerp
        const ease = 1 - Math.pow(1 - collapseProgress, 3);
        const cx = bx + (xTarget - bx) * ease;
        const cy = by + (yTarget - by) * ease;
        const cz = bz + (zTarget - bz) * ease;

        pos.setXYZ(i, cx, cy, cz);

        // Shift to cyan-white during collapse
        const cMix = ease;
        col.setXYZ(
          i,
          0.2 + 0.6 * cMix,
          0.8 * cMix + 0.5 * (1 - cMix),
          0.9 * cMix + 0.3 * (1 - cMix)
        );
      } else if (isPhotonic) {
        // EXPLOSION with focus-based damping
        const dampedChaos = 1 - focusIntensity * 0.7;
        const pulse = Math.sin(t * 3 + i * 0.1) * 0.4 * dampedChaos;
        const chaos = Math.sin(t * 7 + i * PHI) * 0.15 * dampedChaos;
        const scale = 1 + pulse + chaos;

        pos.setXYZ(
          i,
          bx * scale * lensExpand + Math.sin(t * 2 + i) * 0.15 * dampedChaos + mx * influence,
          by * scale * lensSquash + Math.cos(t * 3 + i * 0.7) * 0.15 * dampedChaos + my * influence,
          bz * scale * lensExpand + Math.sin(t * 1.5 + i * 1.3) * 0.1 * dampedChaos
        );

        const flash = Math.sin(t * 5 + i * 0.3) * 0.3 + 0.7;
        // Shift towards purple at high focus
        const focusColor = focusIntensity * 0.4;
        col.setXYZ(
          i,
          1.0 - focusColor * 0.3,
          0.85 * flash + 0.15 - focusColor * 0.2,
          flash * 0.5 + 0.5 + focusColor * 0.3
        );
      } else {
        // GEOMETRIC ORDER with lens effect
        const angle = t * 0.3 + i * 0.001;
        const breathe = Math.sin(t * 0.5 + i * 0.02) * 0.05;
        const r = 1 + breathe;

        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const rx = (bx * cos - bz * sin) * lensExpand;
        const rz = (bx * sin + bz * cos) * lensExpand;

        pos.setXYZ(
          i,
          rx * r + mx * influence * 0.3,
          by * r * lensSquash + my * influence * 0.3,
          rz * r
        );
      }
    }

    pos.needsUpdate = true;
    col.needsUpdate = true;

    // Slow rotation
    const rotSpeed = isCollapsed ? 0.0005 : isPhotonic ? 0.003 : 0.001;
    pointsRef.current.rotation.y += rotSpeed;
  });

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
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={isPhotonic ? 0.08 : 0.05}
        vertexColors
        transparent
        opacity={isPhotonic ? 0.95 : 0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/** Glow sphere for photonic phase */
function GlowSphere({ isPhotonic }: { isPhotonic: boolean }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame(({ clock }) => {
    if (!ref.current || !isPhotonic) return;
    const t = clock.getElapsedTime();
    const scale = 1 + Math.sin(t * 2) * 0.15;
    ref.current.scale.setScalar(scale);
    (ref.current.material as THREE.MeshBasicMaterial).opacity =
      0.06 + Math.sin(t * 3) * 0.03;
  });

  if (!isPhotonic) return null;

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

  return (
    <Card
      className={`overflow-hidden border ${
        isPhotonic ? "border-amber-400/30" : "border-emerald-500/30"
      }`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-mono flex items-center gap-2">
          <Sparkles
            className={`w-5 h-5 ${
              isPhotonic ? "text-amber-400" : "text-emerald-400"
            }`}
          />
          {pl ? "Geometria Fotonowa — Sfera Fibonacciego" : "Photon Geometry — Fibonacci Sphere"}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isPhotonic
            ? pl
              ? "FAZA EKSPLOZJI: Cząsteczki pulsują chaotycznie — światło manifestuje się w materii"
              : "EXPLOSION PHASE: Particles pulse chaotically — light manifests into matter"
            : pl
            ? "Koherentny porządek geometryczny — ruch myszki zakrzywia tor fotonów (Efekt Obserwatora)"
            : "Coherent geometric order — mouse movement curves photon paths (Observer Effect)"}
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[350px] w-full bg-[hsl(220,25%,4%)] rounded-b-lg">
          <Canvas
            camera={{ position: [0, 0, 6], fov: 60 }}
            gl={{ antialias: true, alpha: false }}
            style={{ background: "hsl(220, 25%, 4%)" }}
          >
            <ambientLight intensity={0.2} />
            <PhotonCloud coherence={coherence} isPhotonic={isPhotonic} focusIntensity={focusIntensity} isCollapsed={isCollapsed} />
            <GlowSphere isPhotonic={isPhotonic} />
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              autoRotate
              autoRotateSpeed={isPhotonic ? 2 : 0.5}
            />
          </Canvas>
        </div>
        <div className="px-4 py-2 text-center">
          <span className="text-[10px] font-mono text-muted-foreground">
            {pl
              ? `Koherencja: ${(coherence * 100).toFixed(1)}% | Cząsteczki: ${PARTICLE_COUNT} | Rozkład: Sfera φ`
              : `Coherence: ${(coherence * 100).toFixed(1)}% | Particles: ${PARTICLE_COUNT} | Distribution: φ Sphere`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
