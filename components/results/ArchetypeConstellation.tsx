"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import type { ArchetypeResult, ClusterMatch } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";

// HORIZONTAL helix:
//   - The spine runs along the X axis, strands spiral around it
//   - 6 rungs total: top 3 Olympic on the right, top 3 Paralympic on the left
//   - Olympic labels float ABOVE the helix, Paralympic labels float BELOW
//     (so labels live in open space and never overlap the strands)
//   - Top match sits closest to the center user-orb

const OLYMPIC_COLOR = "#3b7afe";
const PARALYMPIC_COLOR = "#ff3148";
const USER_COLOR = "#f5b50a";

const HELIX_LENGTH = 14; // X-axis extent
const HELIX_RADIUS = 2.4;
const HELIX_TURNS = 1.6;

class HelixCurve extends THREE.Curve<THREE.Vector3> {
  offset: number;
  constructor(offset: number) {
    super();
    this.offset = offset;
  }
  getPoint(t: number, target: THREE.Vector3 = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2 * HELIX_TURNS + this.offset;
    const x = (t - 0.5) * HELIX_LENGTH;
    return target.set(
      x,
      Math.cos(angle) * HELIX_RADIUS,
      Math.sin(angle) * HELIX_RADIUS,
    );
  }
}

function helixPoint(t: number, offset: number): THREE.Vector3 {
  const angle = t * Math.PI * 2 * HELIX_TURNS + offset;
  const x = (t - 0.5) * HELIX_LENGTH;
  return new THREE.Vector3(
    x,
    Math.cos(angle) * HELIX_RADIUS,
    Math.sin(angle) * HELIX_RADIUS,
  );
}

function HelixStrand({ offset, color }: { offset: number; color: string }) {
  const curve = useMemo(() => new HelixCurve(offset), [offset]);
  return (
    <mesh>
      <tubeGeometry args={[curve, 220, 0.06, 16, false]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.85}
        metalness={0.6}
        roughness={0.18}
      />
    </mesh>
  );
}

function CohortRung({
  m,
  t,
  color,
  side, // "olympic" → label floats above; "paralympic" → label floats below
  isTop,
  onHover,
}: {
  m: ClusterMatch;
  t: number;
  color: string;
  side: "olympic" | "paralympic";
  isTop: boolean;
  onHover: (m: ClusterMatch | null) => void;
}) {
  const orbRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const a = useMemo(() => helixPoint(t, 0), [t]);
  const b = useMemo(() => helixPoint(t, Math.PI), [t]);
  const mid = useMemo(() => a.clone().lerp(b, 0.5), [a, b]);
  const direction = useMemo(() => b.clone().sub(a).normalize(), [a, b]);
  const length = useMemo(() => a.distanceTo(b), [a, b]);
  const quaternion = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
    return q;
  }, [direction]);

  const sportLabel = clusterDisplaySport(m.cluster.sport, m.cluster.representativeEvents);
  const matchPct = Math.round(m.similarity * 100);
  const radius = isTop ? 0.4 : 0.26;
  // Olympic labels above (+Y), Paralympic labels below (-Y) — keeps them in open
  // air outside the helix cylinder (radius=2.4) so they can't overlap strands.
  const labelY = side === "olympic" ? HELIX_RADIUS + 1.3 : -(HELIX_RADIUS + 1.3);

  useFrame((state) => {
    if (orbRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.4 + t * 10) * (isTop ? 0.09 : 0.04);
      orbRef.current.scale.set(pulse, pulse, pulse);
    }
    if (haloRef.current) {
      haloRef.current.lookAt(state.camera.position);
    }
  });

  return (
    <group>
      {/* Rung between strands */}
      <mesh position={mid} quaternion={quaternion}>
        <cylinderGeometry args={[0.045, 0.045, length, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTop ? 1.2 : 0.6}
          metalness={0.55}
          roughness={0.22}
        />
      </mesh>

      {/* Cohort orb */}
      <mesh
        ref={orbRef}
        position={mid}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(m);
        }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTop ? 2.2 : 1.1}
          metalness={0.4}
          roughness={0.18}
        />
      </mesh>

      {/* Halo for top match */}
      {isTop && (
        <mesh ref={haloRef} position={mid}>
          <ringGeometry args={[radius * 1.55, radius * 1.85, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Connector line from orb to label so the eye traces between them */}
      <Connector from={[mid.x, mid.y, mid.z]} to={[mid.x, labelY * 0.85, mid.z]} color={color} />

      {/* Floating label in open space above (Olympic) or below (Paralympic) the helix */}
      <Html
        position={[mid.x, labelY, mid.z]}
        center
        distanceFactor={11}
        occlude={false}
        zIndexRange={[10, 0]}
      >
        <div className="pointer-events-none whitespace-nowrap text-center select-none">
          <div
            className={isTop ? "text-[14px] font-semibold tracking-tight" : "text-[12.5px] font-medium tracking-tight"}
            style={{ color, textShadow: "0 1px 8px rgba(0,0,0,0.85)" }}
          >
            {sportLabel}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/75 font-mono mt-0.5">
            {m.cluster.decade}s · {matchPct}% · n={m.cluster.count}
          </div>
        </div>
      </Html>
    </group>
  );
}

function Connector({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to],
  );
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.35 }),
    [color],
  );
  return <primitive object={new THREE.Line(geometry, material)} />;
}

function UserAxis() {
  const orbRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (orbRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.1;
      orbRef.current.scale.set(pulse, pulse, pulse);
    }
    if (haloRef.current) haloRef.current.lookAt(state.camera.position);
  });

  return (
    <group>
      {/* Horizontal spine cylinder along the X axis */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, HELIX_LENGTH * 1.05, 16]} />
        <meshStandardMaterial
          color={USER_COLOR}
          emissive={USER_COLOR}
          emissiveIntensity={2.4}
          metalness={0.3}
          roughness={0.1}
        />
      </mesh>
      {/* Center "you" orb */}
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[0.6, 1]} />
        <meshStandardMaterial
          color={USER_COLOR}
          emissive={USER_COLOR}
          emissiveIntensity={2.8}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>
      <mesh ref={haloRef}>
        <ringGeometry args={[0.95, 1.18, 96]} />
        <meshBasicMaterial
          color={USER_COLOR}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function FloorReflection() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -(HELIX_RADIUS + 2.5), 0]}>
      <circleGeometry args={[12, 64]} />
      <meshStandardMaterial
        color="#03040a"
        metalness={0.6}
        roughness={0.55}
        emissive="#0a0c1a"
        emissiveIntensity={0.4}
      />
    </mesh>
  );
}

function Scene({
  result,
  onHover,
}: {
  result: ArchetypeResult;
  onHover: (m: ClusterMatch | null) => void;
}) {
  // Top 3 each side. Top match closest to center; #2 and #3 toward extremes.
  // Olympic on right (positive X / t > 0.5), Paralympic on left (t < 0.5).
  const olympic = result.olympicMatches.slice(0, 3);
  const paralympic = result.paralympicMatches.slice(0, 3);
  const olympicTs = [0.6, 0.78, 0.94]; // top match closer to center
  const paralympicTs = [0.4, 0.22, 0.06];

  return (
    <group>
      <ambientLight intensity={0.5} />
      <pointLight position={[8, 9, 8]} intensity={2.4} color="#ffffff" />
      <pointLight position={[8, 6, -3]} intensity={1.6} color={OLYMPIC_COLOR} />
      <pointLight position={[-8, -6, -3]} intensity={1.6} color={PARALYMPIC_COLOR} />
      <pointLight position={[0, 0, 6]} intensity={1.3} color={USER_COLOR} />

      <Stars radius={80} depth={60} count={2200} factor={3.6} saturation={0} fade speed={0.35} />
      <Sparkles count={140} scale={[18, 8, 8]} size={2.6} speed={0.3} color={USER_COLOR} opacity={0.5} />

      <FloorReflection />
      <UserAxis />
      <HelixStrand offset={0} color={OLYMPIC_COLOR} />
      <HelixStrand offset={Math.PI} color={PARALYMPIC_COLOR} />

      {olympic.map((m, i) => (
        <CohortRung
          key={`oly-${m.cluster.id}`}
          m={m}
          t={olympicTs[i]}
          color={OLYMPIC_COLOR}
          side="olympic"
          isTop={i === 0}
          onHover={onHover}
        />
      ))}
      {paralympic.map((m, i) => (
        <CohortRung
          key={`para-${m.cluster.id}`}
          m={m}
          t={paralympicTs[i]}
          color={PARALYMPIC_COLOR}
          side="paralympic"
          isTop={i === 0}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

export default function ArchetypeConstellation({ result }: { result: ArchetypeResult }) {
  const [hovered, setHovered] = useState<ClusterMatch | null>(null);
  // Hold the helix front-on for the first ~3.5s so the user takes in the full
  // shape before auto-rotate kicks in.
  const [autoRotate, setAutoRotate] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAutoRotate(true), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] rounded-3xl overflow-hidden glass">
      <Canvas
        camera={{ position: [0, 3, 15], fov: 44 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#03040a", 18, 38]} />
        <Scene result={result} onHover={setHovered} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={autoRotate}
          autoRotateSpeed={0.32}
          minPolarAngle={Math.PI / 3.4}
          maxPolarAngle={(Math.PI * 5) / 8}
          rotateSpeed={0.4}
          target={[0, 0, 0]}
        />
        <EffectComposer>
          <Bloom intensity={1.0} luminanceThreshold={0.18} luminanceSmoothing={0.4} radius={0.75} />
        </EffectComposer>
      </Canvas>

      {/* Header overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-xs pointer-events-none">
        <div className="space-y-1.5">
          <div className="font-mono uppercase tracking-[0.18em] text-muted-soft">
            Athlete DNA helix
          </div>
          <div className="flex gap-3 items-center flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: USER_COLOR }} />
              You · the spine
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: OLYMPIC_COLOR }} />
              Olympic top 3 (above)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full" style={{ background: PARALYMPIC_COLOR }} />
              Paralympic top 3 (below)
            </span>
          </div>
        </div>
      </div>

      {hovered && (
        <div
          className="absolute bottom-14 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl text-xs pointer-events-none whitespace-nowrap z-20 max-w-[90%]"
          style={{
            background: "#03040a",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.6)",
          }}
        >
          <div className="font-semibold tracking-tight">
            {clusterDisplaySport(hovered.cluster.sport, hovered.cluster.representativeEvents)} · {hovered.cluster.decade}s · {hovered.cluster.sex === "M" ? "Men" : "Women"}
          </div>
          <div className="text-muted-soft mt-0.5">
            {hovered.cluster.count} athletes · {Math.round(hovered.similarity * 100)}% match
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4 right-4 text-[11px] text-muted-soft font-mono flex justify-between items-end">
        <span>Cohorts pair around your archetype like base pairs on a strand.</span>
        <span className="hidden sm:inline opacity-70">Drag to rotate · auto-orbits</span>
      </div>
    </div>
  );
}
