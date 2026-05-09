"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Sparkles, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { ArchetypeResult, ClusterMatch } from "@/lib/types";
import { clusterDisplaySport } from "@/lib/sport-discipline";

const OLYMPIC_COLOR = "#4983ff";
const PARALYMPIC_COLOR = "#ef3a47";
const USER_COLOR = "#f5b50a";

// Sport-to-power axis lookup, kept simple — coarse mapping is fine for
// visual layout, the matcher does the precise scoring elsewhere.
function sportPowerAxis(sport: string): number {
  const lower = sport.toLowerCase();
  if (lower.includes("athletics")) return 0.7;
  if (lower.includes("swim")) return 0.7;
  if (lower.includes("weight") || lower.includes("powerlift")) return 1.0;
  if (lower.includes("wrestl") || lower.includes("box")) return 0.95;
  if (lower.includes("gymnast")) return 0.85;
  if (lower.includes("row") || lower.includes("triathlon") || lower.includes("cycl") || lower.includes("cross-country")) return 0.55;
  if (lower.includes("archer") || lower.includes("shoot")) return 0.3;
  if (lower.includes("ski") || lower.includes("snowboard") || lower.includes("skat")) return 0.65;
  return 0.6;
}

function matchPosition(m: ClusterMatch, idx: number, sideHint: 1 | -1): [number, number, number] {
  const c = m.cluster;
  // Olympic clusters spread to the right, Paralympic to the left.
  // Vertical position spreads by rank so the top-3 form a clear arc, not a flat row.
  // Z-depth tracks era — older cohorts sit further back, recent ones come forward.
  const sideX = sideHint * (3.6 + idx * 0.55);
  const verticalOffset = (1 - idx) * 1.7; // idx=0 → +1.7 (up), idx=1 → 0, idx=2 → -1.7 (down)
  const heightTilt = c.avgHeightCm ? (c.avgHeightCm - 178) / 18 : 0;
  const y = verticalOffset + heightTilt;
  // Era axis: 1900s → -3.5, 2020s → +3.5 (newer in front)
  const z = ((c.decade - 1960) / 60) * 3.5;
  return [sideX, y, z];
}

function MatchNode({
  m,
  position,
  variant,
  isTop,
  onHover,
}: {
  m: ClusterMatch;
  position: [number, number, number];
  variant: "olympic" | "paralympic";
  isTop: boolean;
  onHover: (m: ClusterMatch | null) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const color = variant === "olympic" ? OLYMPIC_COLOR : PARALYMPIC_COLOR;
  const radius = Math.min(0.55, 0.22 + Math.log10(m.cluster.count + 1) * 0.18);
  const labelOffsetY = radius + 0.55;
  const sportLabel = clusterDisplaySport(m.cluster.sport, m.cluster.representativeEvents);
  const matchPct = Math.round(m.similarity * 100);

  // Halo billboards (always faces camera) so the ring reads as a glow around
  // the sphere, not a detached object. Tiny pulsing scale keeps it alive.
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.lookAt(state.camera.position);
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.08;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); onHover(m); }}
        onPointerOut={() => onHover(null)}
      >
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isTop ? 1.4 : 0.7}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>
      {/* Concentric glow halo — sits flat to camera (Billboard-like) so it always
          reads as a halo around the sphere instead of a stray detached ring. */}
      {isTop && (
        <mesh ref={ringRef} renderOrder={1}>
          <ringGeometry args={[radius * 1.25, radius * 1.55, 64]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.45}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
      <Html position={[0, labelOffsetY, 0]} center distanceFactor={9} occlude={false} zIndexRange={[10, 0]}>
        <div className="pointer-events-none whitespace-nowrap text-center select-none">
          <div
            className="text-[13px] font-semibold tracking-tight"
            style={{ color, textShadow: "0 1px 8px rgba(0,0,0,0.65)" }}
          >
            {sportLabel}
          </div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-mono mt-0.5">
            {m.cluster.decade}s · {matchPct}% · n={m.cluster.count}
          </div>
        </div>
      </Html>
    </group>
  );
}

function ConnectionLine({
  from,
  to,
  variant,
}: {
  from: [number, number, number];
  to: [number, number, number];
  variant: "olympic" | "paralympic";
}) {
  const color = variant === "olympic" ? OLYMPIC_COLOR : PARALYMPIC_COLOR;
  const points = useMemo(
    () => [new THREE.Vector3(...from), new THREE.Vector3(...to)],
    [from, to],
  );
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const material = useMemo(
    () => new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 }),
    [color],
  );
  // eslint-disable-next-line react/no-unknown-property
  return <primitive object={new THREE.Line(geometry, material)} />;
}

function UserOrb() {
  const ref = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.01;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.06;
      ref.current.scale.set(pulse, pulse, pulse);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z += 0.003;
      haloRef.current.rotation.y -= 0.005;
    }
  });
  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.7, 1]} />
        <meshStandardMaterial
          color={USER_COLOR}
          emissive={USER_COLOR}
          emissiveIntensity={1.6}
          metalness={0.6}
          roughness={0.15}
          wireframe={false}
        />
      </mesh>
      <mesh ref={haloRef}>
        <torusGeometry args={[1.3, 0.015, 16, 96]} />
        <meshBasicMaterial color={USER_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.55, 0.01, 16, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.18} />
      </mesh>
    </group>
  );
}

function GlobeFrame() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.0006;
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[8.5, 2]} />
      <meshBasicMaterial color="#4983ff" wireframe transparent opacity={0.06} />
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
  const olympicNodes = result.olympicMatches.map((m, i) => ({
    m,
    pos: matchPosition(m, i, 1),
    variant: "olympic" as const,
  }));
  const paralympicNodes = result.paralympicMatches.map((m, i) => ({
    m,
    pos: matchPosition(m, i, -1),
    variant: "paralympic" as const,
  }));
  const allNodes = [...olympicNodes, ...paralympicNodes];

  return (
    <group>
      <ambientLight intensity={0.45} />
      <pointLight position={[10, 10, 8]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-10, -2, -6]} intensity={1.4} color={OLYMPIC_COLOR} />
      <pointLight position={[10, -2, -6]} intensity={1.4} color={PARALYMPIC_COLOR} />
      <pointLight position={[0, -8, 5]} intensity={0.7} color={USER_COLOR} />

      <Stars radius={70} depth={50} count={1800} factor={3.5} saturation={0} fade speed={0.5} />
      <Sparkles count={120} scale={[22, 16, 22]} size={2.4} speed={0.3} color={USER_COLOR} opacity={0.6} />

      <GlobeFrame />
      <UserOrb />

      {allNodes.map(({ m, pos, variant }, i) => (
        <ConnectionLine key={`l-${m.cluster.id}-${i}`} from={[0, 0, 0]} to={pos} variant={variant} />
      ))}
      {allNodes.map(({ m, pos, variant }, i) => (
        <MatchNode
          key={m.cluster.id}
          m={m}
          position={pos}
          variant={variant}
          isTop={i === 0 || i === olympicNodes.length}
          onHover={onHover}
        />
      ))}
    </group>
  );
}

export default function ArchetypeConstellation({ result }: { result: ArchetypeResult }) {
  const [hovered, setHovered] = useState<ClusterMatch | null>(null);

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] rounded-3xl overflow-hidden glass">
      <Canvas
        camera={{ position: [2.5, 3.5, 13], fov: 48 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <fog attach="fog" args={["#03040a", 16, 32]} />
        <Scene result={result} onHover={setHovered} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.6}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={(Math.PI * 2) / 3}
          rotateSpeed={0.5}
        />
      </Canvas>

      {/* Hover tooltip rendered as plain HTML overlay so it can't escape the canvas frame. */}
      {hovered && (
        <div className="absolute bottom-14 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-xl glass-strong text-xs pointer-events-none whitespace-nowrap z-20 max-w-[90%]">
          <div className="font-semibold tracking-tight">
            {hovered.cluster.sport} · {hovered.cluster.decade}s · {hovered.cluster.sex === "M" ? "Men" : "Women"}
          </div>
          <div className="text-muted-soft mt-0.5">
            {hovered.cluster.count} athletes · {Math.round(hovered.similarity * 100)}% match
          </div>
        </div>
      )}

      {/* Static legend / context overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between text-xs pointer-events-none">
        <div className="space-y-1.5">
          <div className="font-mono uppercase tracking-[0.18em] text-muted-soft">
            Archetype constellation
          </div>
          <div className="flex gap-3 items-center">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--accent-gold)]" /> You
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--olympic)]" /> Olympic cohorts
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[var(--paralympic)]" /> Paralympic cohorts
            </span>
          </div>
        </div>
        <div className="text-right text-muted-soft hidden sm:block">
          <div>X axis · cohort layout</div>
          <div>Y axis · avg height</div>
          <div>Z axis · era depth</div>
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-[11px] text-muted-soft font-mono flex justify-between items-end">
        <span>Distance to a node ≈ how far your build is from that cohort.</span>
        <span className="hidden sm:inline opacity-70">Drag to rotate · auto-orbits</span>
      </div>
    </div>
  );
}
