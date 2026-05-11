"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, Trail } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Cohort motif scenes — each sport family gets a cinematic stage-set with a
// glowing motion-trail that suggests an athlete's path through the event.
// No humanoid figures (procedural rigs land in uncanny territory); the trail
// IS the athlete. Each scene owns its own camera + lighting + ground.
// ---------------------------------------------------------------------------

type Family =
  | "aquatic"
  | "track"
  | "court"
  | "ice"
  | "mountain"
  | "rotational"
  | "combat"
  | "field"
  | "cycle"
  | "default";

export function familyFromSport(sport: string): Family {
  const s = sport.toLowerCase();
  if (s.includes("swim") || s.includes("surf") || s.includes("water polo") || s.includes("diving") || s.includes("row") || s.includes("canoe") || s.includes("sail")) return "aquatic";
  if (s.includes("athletics") || s.includes("track") || s.includes("speed skating")) return "track";
  if (s.includes("basketball") || s.includes("volleyball") || s.includes("tennis") || s.includes("badminton") || s.includes("table tennis") || s.includes("handball")) return "court";
  if (s.includes("hockey") || s.includes("figure skating") || s.includes("short track")) return "ice";
  if (s.includes("ski") || s.includes("snowboard") || s.includes("climb") || s.includes("luge") || s.includes("bobsled") || s.includes("biathlon")) return "mountain";
  if (s.includes("gymnast") || s.includes("synchronized") || s.includes("artistic")) return "rotational";
  if (s.includes("wrestl") || s.includes("box") || s.includes("judo") || s.includes("taekwondo") || s.includes("fencing")) return "combat";
  if (s.includes("shoot") || s.includes("archer") || s.includes("weightlift") || s.includes("powerlift")) return "field";
  if (s.includes("cycl") || s.includes("triathlon")) return "cycle";
  return "default";
}

const OLYMPIC_COLOR = "#3b7afe";
const PARALYMPIC_COLOR = "#ff3148";
const GOLD = "#f5b50a";

export default function CohortMotif({
  sport,
  events = [],
  variant,
}: {
  sport: string;
  events?: string[];
  variant: "olympic" | "paralympic";
}) {
  const accent = variant === "olympic" ? OLYMPIC_COLOR : PARALYMPIC_COLOR;
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
      <Motif sport={sport} events={events} accent={accent} />
      <EffectComposer>
        <Bloom intensity={1.05} luminanceThreshold={0.18} luminanceSmoothing={0.4} radius={0.75} />
      </EffectComposer>
    </Canvas>
  );
}

// Sport-keyed router. Specific sport scenes win over the family fallback —
// as I migrate each sport to its own purpose-built scene I add a case here.
// Sports not yet migrated still get the family-based motif so nothing breaks.
function Motif({ sport, events, accent }: { sport: string; events: string[]; accent: string }) {
  // Specific-sport scenes (Phase 1+2)
  if (sport === "Diving") return <DivingMotif accent={accent} />;
  if (sport === "Weightlifting") return <WeightliftingMotif accent={accent} />;
  if (sport === "Judo") return <JudoMotif accent={accent} />;
  if (sport === "Football") return <FootballMotif accent={accent} />;
  if (sport === "Hockey") return <FieldHockeyMotif accent={accent} />;
  if (sport === "Tennis") return <TennisMotif accent={accent} />;
  if (sport === "Volleyball") return <VolleyballMotif accent={accent} />;
  if (sport === "Beach Volleyball") return <BeachVolleyballMotif accent={accent} />;
  if (sport === "Basketball" || sport === "Wheelchair Basketball") return <BasketballMotif accent={accent} />;
  if (sport === "Baseball" || sport === "Softball") return <BaseballMotif accent={accent} />;
  if (sport === "Rowing") return <RowingMotif accent={accent} />;
  if (sport === "Sailing") return <SailingMotif accent={accent} />;
  if (sport === "Canoeing") return <CanoeingMotif accent={accent} />;
  if (sport === "Speed Skating" || sport === "Short Track Speed Skating") return <SpeedSkatingMotif accent={accent} />;
  if (sport === "Bobsleigh" || sport === "Luge" || sport === "Skeleton") return <SledTrackMotif accent={accent} />;
  if (sport === "Equestrianism" || sport === "Para Equestrian") return <EquestrianMotif accent={accent} />;
  if (sport === "Boxing") return <BoxingMotif accent={accent} />;
  if (sport === "Wrestling") return <WrestlingMotif accent={accent} />;
  if (sport === "Fencing") return <FencingMotif accent={accent} />;
  if (sport === "Archery" || sport === "Para Archery") return <ArcheryMotif accent={accent} />;
  if (sport === "Shooting") return <ShootingMotif accent={accent} />;
  if (sport === "Ski Jumping") return <SkiJumpingMotif accent={accent} />;
  if (sport === "Snowboarding" || sport === "Snowboard") return <SnowboardMotif accent={accent} />;
  if (sport === "Curling") return <CurlingMotif accent={accent} />;
  if (sport === "Triathlon" || sport === "Para Triathlon") return <TriathlonMotif accent={accent} />;
  if (sport === "Biathlon") return <BiathlonMotif accent={accent} />;
  if (sport === "Modern Pentathlon") return <PentathlonMotif accent={accent} />;
  if (sport === "Ice Hockey") return <IceHockeyMotif accent={accent} />;
  if (sport === "Water Polo") return <WaterPoloMotif accent={accent} />;
  if (sport === "Handball") return <HandballMotif accent={accent} />;
  if (sport === "Goalball") return <GoalballMotif accent={accent} />;
  if (sport === "Sitting Volleyball") return <SittingVolleyballMotif accent={accent} />;
  if (sport === "Wheelchair Rugby") return <WheelchairRugbyMotif accent={accent} />;
  if (sport === "Rugby" || sport === "Rugby Sevens") return <RugbyMotif accent={accent} />;
  if (sport === "Surfing") return <SurfingMotif accent={accent} />;
  if (sport === "Sport Climbing") return <ClimbingMotif accent={accent} />;
  if (sport === "Golf") return <GolfMotif accent={accent} />;
  if (sport === "Table Tennis" || sport === "Para Table Tennis") return <TableTennisMotif accent={accent} />;
  if (sport === "Badminton") return <BadmintonMotif accent={accent} />;
  if (sport === "Taekwondo") return <TaekwondoMotif accent={accent} />;
  if (sport === "Tug-Of-War") return <TugOfWarMotif accent={accent} />;
  if (sport === "Trampolining") return <TrampolineMotif accent={accent} />;
  if (sport === "Rhythmic Gymnastics") return <RhythmicGymnasticsMotif accent={accent} />;
  if (sport === "Synchronized Swimming") return <SyncSwimMotif accent={accent} />;
  if (sport === "Polo") return <PoloMotif accent={accent} />;

  // Fallback: family-based router (legacy, replaces sport-by-sport over time)
  const family = familyFromSport(sport);
  switch (family) {
    case "aquatic":
      return <AquaticMotif accent={accent} />;
    case "track":
      return <TrackMotif accent={accent} />;
    case "court":
      return <CourtMotif accent={accent} />;
    case "ice":
      return <IceMotif accent={accent} />;
    case "mountain":
      return <MountainMotif accent={accent} />;
    case "rotational":
      return <RotationalMotif accent={accent} />;
    case "combat":
      return <CombatMotif accent={accent} />;
    case "field":
      return <FieldMotif accent={accent} />;
    case "cycle":
      return <CycleMotif accent={accent} />;
    default:
      return <DefaultMotif accent={accent} />;
  }
}

// --- Reusable trail head ---------------------------------------------------
// A small glowing sphere that drives a drei <Trail>. Rendered with no real
// material so only the trail itself shows in the scene — the bright head
// blooms into a velocity-style streak.
function TrailHead({
  ref,
  color,
  size = 0.08,
}: {
  ref: React.RefObject<THREE.Mesh | null>;
  color: string;
  size?: number;
}) {
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}

// --- TRACK -----------------------------------------------------------------
// Camera at runner's-eye height, looking down a straight stretch of track.
// A gold streak sprints toward the camera in the center lane and resets.
function TrackMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.18) % 1;
    head.current.position.set(0, 0.3, -7 + lap * 10);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.85, 3.3]} fov={42} near={0.1} far={40} />
      <fog attach="fog" args={["#03040a", 4, 13]} />
      <ambientLight intensity={0.32} />
      <spotLight position={[0, 5, 1]} angle={0.55} penumbra={0.7} intensity={3.4} color="#ffffff" />
      <pointLight position={[0, 1.2, -4]} intensity={2.2} color={accent} />

      {/* Track surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5.6, 16]} />
        <meshStandardMaterial color="#0a0c14" metalness={0.3} roughness={0.85} />
      </mesh>
      {/* Lane stripes */}
      {[-2.0, -1.2, -0.4, 0.4, 1.2, 2.0].map((x) => (
        <mesh key={x} position={[x, 0.005, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 16]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}
      {/* Finish line */}
      <mesh position={[0, 0.006, 1.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.4, 0.08]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Horizon glow */}
      <mesh position={[0, 0.5, -7.5]}>
        <planeGeometry args={[10, 1.2]} />
        <meshBasicMaterial color={accent} transparent opacity={0.28} toneMapped={false} />
      </mesh>

      <Trail width={1.6} length={5.5} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- AQUATIC ---------------------------------------------------------------
// Pool lane viewed from a slightly elevated camera at the start block. A
// glowing wake-streak surges down the lane, with two parallel lane ropes.
function AquaticMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.16) % 1;
    head.current.position.set(0, 0.04, -6 + lap * 9);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.5]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#031a30", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 2]} intensity={2.4} color="#cfe4ff" />
      <pointLight position={[0, 1, -4]} intensity={2.2} color={accent} />

      {/* Pool surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[4.2, 14]} />
        <meshStandardMaterial color="#0b3460" metalness={0.7} roughness={0.18} />
      </mesh>
      {/* Lane ropes — beaded floats */}
      {[-1.0, 1.0].map((x) => (
        <group key={x} position={[x, 0.06, -2]}>
          {Array.from({ length: 36 }).map((_, i) => (
            <mesh key={i} position={[0, 0, -7 + (i * 14) / 36]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={i % 4 < 2 ? "#ef3a47" : "#f4ead0"} emissiveIntensity={0.4} emissive={i % 4 < 2 ? "#ef3a47" : "#f4ead0"} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Far wall touchpad */}
      <mesh position={[0, 0.4, -7]} rotation={[0, 0, 0]}>
        <planeGeometry args={[2.2, 0.6]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
      </mesh>

      <Trail width={1.8} length={5} color={"#cfe4ff"} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={"#cfe4ff"} size={0.08} />
      </Trail>
    </>
  );
}

// --- COURT -----------------------------------------------------------------
// Indoor court floor with painted lines. A bouncing-ball trail arcs across
// the camera frame, suggesting a possession in motion.
function CourtMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.32) % 1;
    // Move forward and bounce vertically
    const x = -2 + lap * 4;
    const y = 0.2 + Math.abs(Math.sin(lap * Math.PI * 4)) * 0.9;
    head.current.position.set(x, y, -1.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.1, 3.7]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#0c0a06", 5, 14]} />
      <ambientLight intensity={0.42} />
      <spotLight position={[0, 5, 2]} angle={0.65} penumbra={0.5} intensity={3} color="#fff8e6" />
      <pointLight position={[0, 1, -3]} intensity={1.8} color={accent} />

      {/* Court floor — warm wood */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial color="#3a2412" metalness={0.18} roughness={0.7} />
      </mesh>
      {/* Court line markings */}
      {[
        // outer rect
        { x: 0, z: -2, w: 7.6, h: 0.06, depth: false },
        { x: 0, z: -7.96, w: 7.6, h: 0.06, depth: true },
        // half-court line
        { x: 0, z: -2, w: 7.6, h: 0.06, depth: true },
      ].map((l, i) => (
        <mesh key={i} position={[l.x, 0.005, l.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={l.depth ? [l.w, l.h] : [l.h, 11.6]} />
          <meshBasicMaterial color="#f4ead0" transparent opacity={0.65} />
        </mesh>
      ))}
      {/* Free-throw circle */}
      <mesh position={[0, 0.005, -2.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.05, 48]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      <Trail width={1.4} length={3.5} color={GOLD} attenuation={(t) => t * t} decay={1.8}>
        <TrailHead ref={head} color={GOLD} size={0.09} />
      </Trail>
    </>
  );
}

// --- ICE -------------------------------------------------------------------
// Pale blue rink, the trail carves an elegant figure-eight across the ice.
function IceMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = t * 0.55;
    // Lemniscate (figure-eight) — stable centered loop
    const denom = 1 + Math.sin(cyc) * Math.sin(cyc);
    const x = (2.2 * Math.cos(cyc)) / denom;
    const z = -2 + (1.4 * Math.sin(cyc) * Math.cos(cyc)) / denom;
    head.current.position.set(x, 0.06, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.2]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#06192a", 5, 13]} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 3, 2]} intensity={2.2} color="#dcefff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />

      {/* Ice surface — bright, reflective */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[7, 10]} />
        <meshStandardMaterial color="#cfe4f5" metalness={0.6} roughness={0.22} />
      </mesh>
      {/* Center face-off circle */}
      <mesh position={[0, 0.005, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.3, 1.36, 64]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.005, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.12, 24]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      {/* Far blue line */}
      <mesh position={[0, 0.005, -5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 0.08]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      <Trail width={1.2} length={4.5} color={GOLD} attenuation={(t) => t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- MOUNTAIN --------------------------------------------------------------
// Downhill slope tilted toward camera. Snow-particle-feeling streak carves a
// serpentine path from far ridge to foreground.
function MountainMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.18) % 1;
    // Path goes forward (z grows toward camera) with sinusoidal x carve.
    const z = -6 + lap * 9;
    const x = Math.sin(lap * Math.PI * 5) * 1.6;
    const y = 0.08 - lap * 0.1; // gently descending in absolute terms
    head.current.position.set(x, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a1626", 5, 14]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 2, -4]} intensity={2.0} color={accent} />

      {/* Slope plane — tilted toward camera */}
      <mesh rotation={[-Math.PI / 2.4, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[10, 14, 24, 24]} />
        <meshStandardMaterial color="#dde6f0" metalness={0.05} roughness={0.95} />
      </mesh>
      {/* Mogul ridges — small triangular bumps on the slope */}
      {[-2.5, -0.8, 0.8, 2.5].map((x, i) => (
        <mesh key={i} position={[x, 0.16, -3 - i * 0.4]} rotation={[-Math.PI / 2.4, 0, 0]}>
          <coneGeometry args={[0.35, 0.28, 4]} />
          <meshStandardMaterial color="#c5d2e0" metalness={0.05} roughness={0.95} />
        </mesh>
      ))}
      {/* Distant peaks */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={i} position={[x, 1.0 + i * 0.1, -7]}>
          <coneGeometry args={[0.7, 1.4 + i * 0.15, 4]} />
          <meshStandardMaterial color="#3a4858" metalness={0.2} roughness={0.7} />
        </mesh>
      ))}

      <Trail width={1.8} length={4.5} color={"#ffffff"} attenuation={(t) => t * t * t} decay={1.6}>
        <TrailHead ref={head} color={"#ffffff"} size={0.08} />
      </Trail>
    </>
  );
}

// --- ROTATIONAL ------------------------------------------------------------
// Gymnast-aerial: a glowing ribbon traces a continuous spiral / aerial twist
// in dark space. No floor — stage is pure light + spotlight cone.
function RotationalMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    // Spiral around a vertical axis with elevation swing
    const cyc = t * 1.2;
    const r = 1.5;
    const x = Math.cos(cyc) * r;
    const y = Math.sin(cyc * 0.5) * 1.2;
    const z = Math.sin(cyc) * r - 0.5;
    head.current.position.set(x, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 4.2]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#03040a", 6, 14]} />
      <ambientLight intensity={0.25} />
      <spotLight position={[0, 4, 2]} angle={0.7} penumbra={0.6} intensity={2.8} color="#ffffff" />
      <pointLight position={[2, 0, 0]} intensity={1.2} color={accent} />
      <pointLight position={[-2, 0, 0]} intensity={0.8} color={GOLD} />

      {/* Floor disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, -0.5]}>
        <circleGeometry args={[2.2, 64]} />
        <meshStandardMaterial color="#0d1422" metalness={0.4} roughness={0.6} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.595, -0.5]}>
        <ringGeometry args={[2.0, 2.05, 64]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>

      <Trail width={2.2} length={6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.09} />
      </Trail>
    </>
  );
}

// --- COMBAT ----------------------------------------------------------------
// Two streaks converge and part on a circular mat under a hot spotlight —
// suggests opposing athletes engaging without depicting them.
function CombatMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t * 1.5;
    const r = 0.9 + Math.sin(cyc * 0.6) * 0.4; // breath in/out
    if (a.current) a.current.position.set(Math.cos(cyc) * r, 0.4, Math.sin(cyc) * r - 0.5);
    if (b.current) b.current.position.set(-Math.cos(cyc) * r, 0.4, -Math.sin(cyc) * r - 0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.2]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 5, 0]} angle={0.55} penumbra={0.45} intensity={3.4} color="#fff" />
      <pointLight position={[2, 1, -1]} intensity={1.6} color={accent} />
      <pointLight position={[-2, 1, -1]} intensity={1.2} color={GOLD} />

      {/* Circular mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color="#1a0a0a" metalness={0.25} roughness={0.7} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]}>
        <ringGeometry args={[2.2, 2.26, 64]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]}>
        <ringGeometry args={[1.0, 1.04, 64]} />
        <meshBasicMaterial color={GOLD} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      <Trail width={1.0} length={3} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.08} />
      </Trail>
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- FIELD -----------------------------------------------------------------
// Archery / shooting / weightlift range. Concentric target rings at the back;
// a glowing projectile streaks from the foreground to the center bullseye
// and resets.
function FieldMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.4) % 1;
    head.current.position.set(0, 0.4, 3 - lap * 9);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 3.3]} fov={42} near={0.1} far={40} />
      <fog attach="fog" args={["#08080a", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={2.2} color="#fff8e6" />
      <pointLight position={[0, 0.6, -5]} intensity={1.8} color={accent} />

      {/* Range floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[8, 14]} />
        <meshStandardMaterial color="#0c1018" metalness={0.2} roughness={0.85} />
      </mesh>
      {/* Concentric target rings at the back wall */}
      {[1.6, 1.2, 0.8, 0.4].map((r, i) => (
        <mesh key={r} position={[0, 0.6, -6]}>
          <ringGeometry args={[r - 0.08, r, 48]} />
          <meshBasicMaterial color={i % 2 === 0 ? accent : GOLD} side={THREE.DoubleSide} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, -6.001]}>
        <circleGeometry args={[0.14, 32]} />
        <meshBasicMaterial color={GOLD} />
      </mesh>

      <Trail width={1.0} length={3.5} color={GOLD} attenuation={(t) => t * t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.06} />
      </Trail>
    </>
  );
}

// --- CYCLE -----------------------------------------------------------------
// A road stretching forward with center stripes. The trail threads a curve
// in and out of the lane, suggesting peloton-cam motion.
function CycleMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const lap = (t * 0.22) % 1;
    const z = -7 + lap * 10;
    const x = Math.sin(lap * Math.PI * 3) * 0.5;
    head.current.position.set(x, 0.28, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.95, 3.4]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#06080c", 4, 14]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} color="#ffe8c4" />
      <pointLight position={[0, 1, -4]} intensity={2.0} color={accent} />

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[3.2, 16]} />
        <meshStandardMaterial color="#0e1018" metalness={0.18} roughness={0.78} />
      </mesh>
      {/* Center dashed stripe */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} position={[0, 0.005, -7 + i * 1.0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.06, 0.5]} />
          <meshBasicMaterial color="#f4ead0" transparent opacity={0.55} />
        </mesh>
      ))}
      {/* Edge lines */}
      {[-1.5, 1.5].map((x) => (
        <mesh key={x} position={[x, 0.005, -2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.05, 16]} />
          <meshBasicMaterial color="#f4ead0" transparent opacity={0.4} />
        </mesh>
      ))}

      <Trail width={1.3} length={4} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- DEFAULT ---------------------------------------------------------------
// Catch-all: a slow orbital trail in dark space — works for any sport that
// doesn't classify into the others.
function DefaultMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = t * 0.7;
    head.current.position.set(Math.cos(cyc) * 1.5, Math.sin(cyc * 1.3) * 0.6, Math.sin(cyc) * 1.5 - 0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#03040a", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 3]} intensity={1.8} color="#ffffff" />
      <pointLight position={[-2, -1, -2]} intensity={1.4} color={accent} />

      {/* Faint disc beneath */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.4, -0.5]}>
        <circleGeometry args={[2, 64]} />
        <meshStandardMaterial color="#0a0e18" metalness={0.4} roughness={0.55} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.395, -0.5]}>
        <ringGeometry args={[1.85, 1.92, 64]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>

      <Trail width={1.4} length={5} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// ===========================================================================
// SPORT-SPECIFIC SCENES (Phase 1)
// Each scene is a hand-built environment that reads as the actual sport.
// As more sports get migrated, the family-based fallbacks above are retired.
// ===========================================================================

// --- DIVING ----------------------------------------------------------------
// Side-view of a diving platform. The diver is a glowing trail that pops up
// off the board, rotates through a tuck/twist arc, plunges down, hits the
// water with a splash burst, then resets.
function DivingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  const splashRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    // 4-second loop: 0-3.4s = dive arc, 3.4-4 = reset off-screen
    const cyc = (t % 4) / 4;
    let x: number, y: number;
    if (cyc < 0.85) {
      const u = cyc / 0.85;
      // From board (x=-1.4, y=2) → arc up to apex → plunge into water at (x≈0.6, y≈0)
      // Parametric: x slides forward; y rises then falls (parabola).
      x = -1.4 + u * 2.0;
      y = 2.0 + Math.sin(u * Math.PI) * 0.7 - u * 2.0; // peaks at u≈0.5
    } else {
      // off-screen reset — hidden below water
      x = -1.4;
      y = -2;
    }
    head.current.position.set(x, y, -0.5);
    // Splash: pulse a sphere at the entry point right after impact
    if (splashRef.current) {
      const splashPhase = cyc > 0.85 && cyc < 0.97 ? (cyc - 0.85) / 0.12 : 0;
      splashRef.current.position.set(0.6, 0.05, -0.5);
      splashRef.current.scale.setScalar(splashPhase > 0 ? 0.1 + splashPhase * 1.6 : 0.0001);
      const mat = splashRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = splashPhase > 0 ? 1 - splashPhase : 0;
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[2.4, 1.2, 3.6]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#021022", 5, 14]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[-2, 4, 2]} angle={0.55} penumbra={0.6} intensity={2.6} color="#ffffff" />
      <pointLight position={[1, 0.4, -3]} intensity={1.8} color={accent} />

      {/* Water surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#08305a" metalness={0.7} roughness={0.18} />
      </mesh>
      {/* Subtle pool tile lines */}
      {[-1, 0, 1].map((z) => (
        <mesh key={z} position={[0, 0.005, -0.5 + z * 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[7, 0.04]} />
          <meshBasicMaterial color="#1d6dbf" transparent opacity={0.45} />
        </mesh>
      ))}
      {/* Diving tower — vertical pillar + cantilevered platform */}
      <mesh position={[-1.9, 1.0, -0.5]}>
        <boxGeometry args={[0.18, 2.1, 0.28]} />
        <meshStandardMaterial color="#cfd6e0" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[-1.55, 2.0, -0.5]}>
        <boxGeometry args={[0.95, 0.07, 0.42]} />
        <meshStandardMaterial color="#f4ead0" metalness={0.3} roughness={0.45} />
      </mesh>
      {/* Platform-edge accent */}
      <mesh position={[-1.1, 2.04, -0.5]}>
        <boxGeometry args={[0.08, 0.02, 0.42]} />
        <meshBasicMaterial color={accent} />
      </mesh>

      <Trail width={1.4} length={4.5} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>

      {/* Splash burst — a quick expanding ring on water entry */}
      <mesh ref={splashRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.26, 32]} />
        <meshBasicMaterial color={"#cfe4ff"} transparent opacity={0} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
    </>
  );
}

// --- WEIGHTLIFTING ---------------------------------------------------------
// Front view of a lifting platform. A barbell (a thin metal bar between two
// big weight-plate cylinders) cycles through the snatch sequence: rests on
// floor → pulls to knee → explosive snatch overhead → holds → drops.
function WeightliftingMotif({ accent }: { accent: string }) {
  const bar = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!bar.current) return;
    const t = state.clock.elapsedTime;
    // 4-second loop: floor (0.5s) → pull (1.0s) → drive (1.0s) → overhead hold (1.0s) → drop (0.5s)
    const cyc = t % 4;
    let y: number;
    if (cyc < 0.5) y = 0.18; // on floor
    else if (cyc < 1.5) {
      // pull from floor to hip
      const u = (cyc - 0.5) / 1.0;
      y = 0.18 + u * 0.8;
    } else if (cyc < 2.5) {
      // explosive: hip to overhead
      const u = (cyc - 1.5) / 1.0;
      y = 0.98 + Math.pow(u, 0.65) * 1.6; // ease-out fast pop
    } else if (cyc < 3.5) {
      // overhead hold — micro-bob to suggest stabilizing
      y = 2.58 + Math.sin((cyc - 2.5) * 6) * 0.025;
    } else {
      // drop
      const u = (cyc - 3.5) / 0.5;
      y = 2.58 - u * 2.4;
    }
    bar.current.position.y = y;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.3, 4.0]} fov={45} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0a10", 5, 14]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 2]} angle={0.45} penumbra={0.55} intensity={3.4} color="#ffffff" />
      <pointLight position={[0, 1.4, -3]} intensity={1.8} color={accent} />
      <pointLight position={[-2, 0.6, 1]} intensity={0.6} color={GOLD} />

      {/* Lifting platform — square mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial color="#0c1018" metalness={0.18} roughness={0.78} />
      </mesh>
      {/* Platform border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.4]}>
        <ringGeometry args={[1.55, 1.6, 4]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      {/* Backdrop wall — implied stage */}
      <mesh position={[0, 1.6, -3]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color="#070a12" metalness={0.2} roughness={0.85} />
      </mesh>
      {/* Sponsor-bar accent line on the backdrop */}
      <mesh position={[0, 0.2, -2.99]}>
        <planeGeometry args={[10, 0.04]} />
        <meshBasicMaterial color={accent} transparent opacity={0.55} />
      </mesh>

      {/* Barbell */}
      <group ref={bar} position={[0, 0.18, -0.4]}>
        {/* The bar itself */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 2.4, 16]} />
          <meshStandardMaterial color="#d6dbe2" metalness={0.85} roughness={0.18} emissive="#404550" emissiveIntensity={0.4} />
        </mesh>
        {/* Two big weight plates (cylinders) at the ends — competition red */}
        {[-1.0, 1.0].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.32, 0.32, 0.16, 36]} />
              <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} emissive={GOLD} emissiveIntensity={0.5} />
            </mesh>
            {/* Inner collar ring */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[x > 0 ? -0.13 : 0.13, 0, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.07, 18]} />
              <meshStandardMaterial color="#aab1bd" metalness={0.7} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}

// --- JUDO ------------------------------------------------------------------
// Judo tatami mat: square panels with the contrasting safety-zone border
// that's universal at IJF events. Two streaks circle, engage at the center
// in a throw (one streak arcs up and slams down), then reset.
function JudoMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 4s loop: 2s circling, 1s throw, 1s reset
    const cyc = t % 4;
    if (cyc < 2.0) {
      // Circling phase — opponents face off, walking around center
      const u = cyc / 2.0;
      const angle = u * Math.PI * 1.4;
      const r = 0.75;
      if (a.current) a.current.position.set(Math.cos(angle) * r, 0.5, Math.sin(angle) * r - 0.4);
      if (b.current) b.current.position.set(-Math.cos(angle) * r, 0.5, -Math.sin(angle) * r - 0.4);
    } else if (cyc < 3.0) {
      // Throw phase — A slams B: B arcs up + over + down
      const u = (cyc - 2.0) / 1.0;
      // A holds at center
      if (a.current) a.current.position.set(-0.15, 0.5, -0.4);
      // B: pulled in, lifted high, slammed down
      if (b.current) {
        const x = 0.15 - u * 0.4;
        const y = 0.5 + Math.sin(u * Math.PI) * 1.6 - u * 0.4;
        const z = -0.4 + u * 0.3;
        b.current.position.set(x, Math.max(0.05, y), z);
      }
    } else {
      // Reset
      const u = (cyc - 3.0) / 1.0;
      if (a.current) a.current.position.set(-0.15 - u * 0.6, 0.5, -0.4);
      if (b.current) b.current.position.set(-0.25 + u * 0.6, 0.5, -0.4);
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 5, 0]} angle={0.55} penumbra={0.5} intensity={3.4} color="#ffffff" />
      <pointLight position={[2, 1, -1]} intensity={1.2} color={accent} />
      <pointLight position={[-2, 1, -1]} intensity={1.0} color={GOLD} />

      {/* Tatami — main competition area: pale yellow square with darker safety zone around */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.4]}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshStandardMaterial color="#3a2a16" metalness={0.1} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.4]}>
        <planeGeometry args={[3.0, 3.0]} />
        <meshStandardMaterial color="#c9a157" metalness={0.05} roughness={0.85} />
      </mesh>
      {/* Tatami panel grid lines (white) */}
      {[-1.0, -0.33, 0.33, 1.0].map((v) => (
        <mesh key={`h${v}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -0.4 + v]}>
          <planeGeometry args={[3.0, 0.025]} />
          <meshBasicMaterial color="#f4ead0" transparent opacity={0.35} />
        </mesh>
      ))}
      {[-1.0, -0.33, 0.33, 1.0].map((v) => (
        <mesh key={`v${v}`} rotation={[-Math.PI / 2, 0, 0]} position={[v, 0.008, -0.4]}>
          <planeGeometry args={[0.025, 3.0]} />
          <meshBasicMaterial color="#f4ead0" transparent opacity={0.35} />
        </mesh>
      ))}

      <Trail width={1.0} length={2.6} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.08} />
      </Trail>
      <Trail width={1.0} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// ===========================================================================
// PHASE 2 — sport-specific scenes for high-frequency sports.
// ===========================================================================

// --- FOOTBALL (Soccer) -----------------------------------------------------
// Wide pitch with a goal at the back. A gold ball-streak threads in from
// midfield and curls into the side-netting.
function FootballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.45) % 1;
    // Bend it like Beckham — sweep across the pitch with a curve, rising then dipping into the net
    const z = 3 - cyc * 9;
    const x = Math.sin(cyc * Math.PI * 1.6) * 1.2;
    const y = 0.2 + Math.sin(cyc * Math.PI) * 0.7 - Math.pow(cyc, 3) * 0.4;
    head.current.position.set(x, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#031208", 5, 14]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[3, 6, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -5]} intensity={2.0} color={accent} />
      {/* Pitch */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[10, 14]} />
        <meshStandardMaterial color="#0a3318" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Mowing-pattern stripes */}
      {[-3, -1.5, 0, 1.5, 3].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -2 + z]}>
          <planeGeometry args={[10, 1.4]} />
          <meshBasicMaterial color={i % 2 ? "#0c3a1c" : "#0d4220"} />
        </mesh>
      ))}
      {/* Center circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2]}>
        <ringGeometry args={[1.2, 1.24, 64]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} transparent opacity={0.7} />
      </mesh>
      {/* Goal frame at the back */}
      <group position={[0, 0, -6]}>
        <mesh position={[-1.4, 0.7, 0]}>
          <boxGeometry args={[0.06, 1.4, 0.06]} />
          <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[1.4, 0.7, 0]}>
          <boxGeometry args={[0.06, 1.4, 0.06]} />
          <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[2.86, 0.06, 0.06]} />
          <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.25} />
        </mesh>
        {/* Net */}
        <mesh position={[0, 0.7, -0.4]}>
          <planeGeometry args={[2.8, 1.4]} />
          <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.45} />
        </mesh>
      </group>
      <Trail width={1.0} length={3.5} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- FIELD HOCKEY ----------------------------------------------------------
// Distinct from ice hockey: blue turf field with white circle and a ball
// arcing toward the goal-cage at the back.
function FieldHockeyMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.4) % 1;
    const z = 2 - cyc * 8;
    const x = Math.sin(cyc * Math.PI * 2) * 0.9;
    head.current.position.set(x, 0.12, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#021428", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 2]} intensity={2.4} color="#ffffff" />
      <pointLight position={[0, 1, -5]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial color="#093a78" metalness={0.15} roughness={0.85} />
      </mesh>
      {/* Shooting circle (D) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -4.5]}>
        <ringGeometry args={[1.6, 1.65, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} />
      </mesh>
      {/* Goal cage */}
      <mesh position={[0, 0.4, -6]}>
        <boxGeometry args={[2.0, 0.8, 0.08]} />
        <meshStandardMaterial color="#f4ead0" wireframe />
      </mesh>
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.06} />
      </Trail>
    </>
  );
}

// --- TENNIS ----------------------------------------------------------------
// Hard court with net, ball volleys back-and-forth in a rally pattern.
function TennisMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 1.1) % 1; // 4 hits per period
    // Volley: oscillate z near-far, parabolic y on each hit
    const phase = cyc * 4; // 0..4
    const seg = Math.floor(phase) % 2; // 0 = far→near, 1 = near→far
    const u = phase - Math.floor(phase);
    const zNear = 1.5;
    const zFar = -4.5;
    const z = seg === 0 ? zFar + (zNear - zFar) * u : zNear + (zFar - zNear) * u;
    const y = 0.15 + Math.sin(u * Math.PI) * 0.9;
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#1a0c06", 5, 12]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 2]} intensity={1.4} color="#fff8e6" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5, 12]} />
        <meshStandardMaterial color="#1f4f8a" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Court lines */}
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, -2]}>
          <planeGeometry args={[0.05, 12]} />
          <meshBasicMaterial color="#f4ead0" />
        </mesh>
      ))}
      {/* Service line + center service */}
      {[-3.6, -0.4].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[4.8, 0.04]} />
          <meshBasicMaterial color="#f4ead0" />
        </mesh>
      ))}
      {/* Net at center */}
      <mesh position={[0, 0.4, -2]}>
        <planeGeometry args={[5, 0.8]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 0.78, -2]}>
        <boxGeometry args={[5, 0.04, 0.04]} />
        <meshBasicMaterial color="#f4ead0" />
      </mesh>
      <Trail width={0.8} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={2.0}>
        <TrailHead ref={head} color={GOLD} size={0.06} />
      </Trail>
    </>
  );
}

// --- VOLLEYBALL ------------------------------------------------------------
// Indoor court with high net. Ball arcs over the net, gets spiked back.
function VolleyballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.7) % 1;
    const phase = cyc * 2;
    const seg = Math.floor(phase) % 2;
    const u = phase - Math.floor(phase);
    const z = seg === 0 ? -3.5 + u * 4 : 0.5 - u * 4;
    const y = 0.4 + Math.sin(u * Math.PI) * 1.5;
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0c0a06", 5, 12]} />
      <ambientLight intensity={0.45} />
      <spotLight position={[0, 6, 2]} angle={0.55} penumbra={0.5} intensity={3} color="#fff8e6" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      {/* Hardwood floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color="#7a4a20" metalness={0.18} roughness={0.55} />
      </mesh>
      {/* Court boundary */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -2]}>
        <ringGeometry args={[2.95, 3.0, 4]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} />
      </mesh>
      {/* Net */}
      <mesh position={[0, 1.6, -1.5]}>
        <planeGeometry args={[5.4, 0.9]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 2.05, -1.5]}>
        <boxGeometry args={[5.4, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <Trail width={1.0} length={2.5} color={GOLD} attenuation={(t) => t * t} decay={1.8}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- BEACH VOLLEYBALL ------------------------------------------------------
// Sand variant — same net but warm light + sand floor.
function BeachVolleyballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.6) % 1;
    const phase = cyc * 2;
    const seg = Math.floor(phase) % 2;
    const u = phase - Math.floor(phase);
    const z = seg === 0 ? -3.5 + u * 4 : 0.5 - u * 4;
    const y = 0.4 + Math.sin(u * Math.PI) * 1.4;
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#1a1206", 5, 14]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 3]} intensity={2.0} color="#ffe8b4" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[6, 10, 12, 12]} />
        <meshStandardMaterial color="#d2a86a" metalness={0.05} roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.6, -1.5]}>
        <planeGeometry args={[5.0, 0.9]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.55} />
      </mesh>
      <Trail width={1.0} length={2.3} color={GOLD} attenuation={(t) => t * t} decay={1.8}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- BASKETBALL ------------------------------------------------------------
// Court with a hoop at the back. Ball arcs from foreground to the rim and
// drops through the net.
function BasketballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.4) % 1;
    // Arc from (0, 0.6, 2) to rim at (0, 1.7, -4): parabolic up to apex 2.4 then drop
    const x = 0;
    const z = 2 - cyc * 6;
    const y = 0.6 + Math.sin(cyc * Math.PI) * 1.6 - cyc * 0.4;
    head.current.position.set(x, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0c0a06", 5, 14]} />
      <ambientLight intensity={0.42} />
      <spotLight position={[0, 5, 2]} angle={0.6} penumbra={0.5} intensity={3.0} color="#fff8e6" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color="#7a4a20" metalness={0.15} roughness={0.6} />
      </mesh>
      {/* Free-throw circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -3]}>
        <ringGeometry args={[1.0, 1.04, 48]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} />
      </mesh>
      {/* Backboard + rim */}
      <mesh position={[0, 2.0, -4.4]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.25} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.6, -4.2]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.025, 12, 32]} />
        <meshStandardMaterial color={"#ff5a1a"} emissive={"#ff5a1a"} emissiveIntensity={1.0} />
      </mesh>
      <Trail width={1.2} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.7}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- BASEBALL --------------------------------------------------------------
// Diamond seen from above-home-plate angle. Ball arcs from pitcher's mound
// past the strike zone and out into the field.
function BaseballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.45) % 1;
    // Pitch (0..0.4): mound to plate; hit (0.4..1): arcs out to right field
    if (cyc < 0.4) {
      const u = cyc / 0.4;
      head.current.position.set(0, 1.1 - u * 0.4, -2 + u * 1.6);
    } else {
      const u = (cyc - 0.4) / 0.6;
      const x = u * 3;
      const y = 0.7 + Math.sin(u * Math.PI) * 1.2;
      const z = -0.4 + u * -3;
      head.current.position.set(x, y, z);
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a1206", 5, 14]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      {/* Outfield grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial color="#1d4a20" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Infield dirt — diamond rotated 45° */}
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[0, 0.005, -2]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial color="#a87248" metalness={0.05} roughness={0.95} />
      </mesh>
      {/* Bases */}
      {[
        [0, 0.01, 0], // home (camera-side)
        [1.6, 0.01, -2], // first
        [0, 0.01, -3.6], // second
        [-1.6, 0.01, -2], // third
      ].map(([x, y, z], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, Math.PI / 4]} position={[x, y, z]}>
          <planeGeometry args={[0.32, 0.32]} />
          <meshBasicMaterial color="#f4ead0" />
        </mesh>
      ))}
      {/* Pitcher's mound */}
      <mesh position={[0, 0.06, -2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.12, 24]} />
        <meshStandardMaterial color="#a87248" metalness={0.05} roughness={0.95} />
      </mesh>
      <Trail width={0.7} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={1.8}>
        <TrailHead ref={head} color={GOLD} size={0.05} />
      </Trail>
    </>
  );
}

// --- ROWING ----------------------------------------------------------------
// Lane on still water, a long sleek shell glides down with rhythmic stroke
// pulses. The boat is rendered (a long thin form) with a trail.
function RowingMotif({ accent }: { accent: string }) {
  const boat = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!boat.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.15) % 1;
    boat.current.position.set(0, 0.06, 3 - cyc * 9);
    // Subtle bob from stroke rate
    boat.current.position.y = 0.06 + Math.sin(t * 4) * 0.018;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[1.5, 0.9, 3.4]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#021a30", 5, 14]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 5, 3]} intensity={1.4} color="#cfe4ff" />
      <pointLight position={[0, 1, -4]} intensity={1.8} color={accent} />
      {/* Water */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[8, 14]} />
        <meshStandardMaterial color="#0a3a6a" metalness={0.7} roughness={0.18} />
      </mesh>
      {/* Lane buoys */}
      {[-1.2, 1.2].map((x) => (
        <group key={x} position={[x, 0.06, -2]}>
          {Array.from({ length: 28 }).map((_, i) => (
            <mesh key={i} position={[0, 0, -7 + (i * 14) / 28]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={i % 2 ? "#f4ead0" : "#ef3a47"} emissive={i % 2 ? "#f4ead0" : "#ef3a47"} emissiveIntensity={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Shell + oars */}
      <group ref={boat}>
        <mesh rotation={[0, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.05, 1.8, 12]} />
          <meshStandardMaterial color="#f4ead0" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Two oars splayed out */}
        <mesh position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2.8]}>
          <cylinderGeometry args={[0.012, 0.012, 1.4, 8]} />
          <meshStandardMaterial color="#a8b6c6" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2.8]}>
          <cylinderGeometry args={[0.012, 0.012, 1.4, 8]} />
          <meshStandardMaterial color="#a8b6c6" metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </>
  );
}

// --- SAILING ---------------------------------------------------------------
// Open water, a sailboat heels into the breeze with a triangular sail.
function SailingMotif({ accent }: { accent: string }) {
  const boat = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!boat.current) return;
    const t = state.clock.elapsedTime;
    boat.current.position.x = Math.sin(t * 0.3) * 0.8;
    boat.current.position.z = -1 + Math.cos(t * 0.3) * 0.4;
    boat.current.rotation.z = Math.sin(t * 0.5) * 0.12;
    boat.current.rotation.y = Math.sin(t * 0.3 + 0.5) * 0.4;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#062845", 6, 16]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 6, 3]} intensity={2} color="#ffe8b4" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      {/* Open ocean */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[14, 14, 24, 24]} />
        <meshStandardMaterial color="#0a3a6a" metalness={0.7} roughness={0.22} />
      </mesh>
      {/* Horizon glow */}
      <mesh position={[0, 0.6, -7]}>
        <planeGeometry args={[14, 1.8]} />
        <meshBasicMaterial color={accent} transparent opacity={0.35} toneMapped={false} />
      </mesh>
      {/* Boat */}
      <group ref={boat}>
        {/* Hull */}
        <mesh position={[0, 0.06, 0]}>
          <coneGeometry args={[0.18, 1.0, 4]} />
          <meshStandardMaterial color="#f4ead0" metalness={0.4} roughness={0.4} />
        </mesh>
        {/* Mast */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.4, 8]} />
          <meshStandardMaterial color="#cfd6e0" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Mainsail (triangle) */}
        <mesh position={[0.32, 0.85, 0]} rotation={[0, Math.PI / 2, 0]}>
          <coneGeometry args={[0.55, 1.2, 3]} />
          <meshStandardMaterial color="#ffffff" metalness={0.05} roughness={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </>
  );
}

// --- CANOEING (kayak/canoe/slalom) ----------------------------------------
// Kayak slicing through whitewater. Simpler than rowing — single craft, two
// alternating paddle strokes.
function CanoeingMotif({ accent }: { accent: string }) {
  const kayak = useRef<THREE.Group>(null);
  const paddleL = useRef<THREE.Mesh>(null);
  const paddleR = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (kayak.current) {
      const cyc = (t * 0.18) % 1;
      kayak.current.position.set(Math.sin(t * 0.5) * 0.4, 0.06, 3 - cyc * 9);
      kayak.current.rotation.z = Math.sin(t * 0.5) * 0.06;
    }
    if (paddleL.current) paddleL.current.rotation.x = Math.sin(t * 5) * 0.7;
    if (paddleR.current) paddleR.current.rotation.x = Math.sin(t * 5 + Math.PI) * 0.7;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#062840", 5, 14]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.4} color="#cfe4ff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      {/* Whitewater plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[6, 14, 16, 16]} />
        <meshStandardMaterial color="#1a4a78" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Slalom gate poles — one red one green */}
      {[
        { x: -0.6, z: -3, c: "#ef3a47" },
        { x: 0.6, z: -3, c: "#3aef58" },
      ].map((p, i) => (
        <mesh key={i} position={[p.x, 0.4, p.z]}>
          <cylinderGeometry args={[0.018, 0.018, 0.8, 8]} />
          <meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.7} />
        </mesh>
      ))}
      <group ref={kayak}>
        {/* Hull — pointed both ends */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 1.0, 12]} />
          <meshStandardMaterial color="#f4ead0" metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Paddle as a rotating bar */}
        <group position={[0, 0.18, 0]}>
          <mesh ref={paddleL} position={[-0.3, 0, 0]} rotation={[0, 0, 0.4]}>
            <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
            <meshStandardMaterial color="#cfd6e0" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh ref={paddleR} position={[0.3, 0, 0]} rotation={[0, 0, -0.4]}>
            <cylinderGeometry args={[0.012, 0.012, 0.5, 8]} />
            <meshStandardMaterial color="#cfd6e0" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      </group>
    </>
  );
}

// --- SPEED SKATING ---------------------------------------------------------
// Banked oval ice ring viewed from low angle. Skater streak hugs the
// inside, leaning into the corner.
function SpeedSkatingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.32) % 1;
    const angle = cyc * Math.PI * 2;
    head.current.position.set(Math.cos(angle) * 2.2, 0.06, Math.sin(angle) * 1.2 - 1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.2]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#06192a", 5, 13]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3, 2]} intensity={2.2} color="#dcefff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#cfe4f5" metalness={0.65} roughness={0.18} />
      </mesh>
      {/* Inner & outer track lines (oval) */}
      {[2.0, 2.4].map((rx, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -1]}>
          <ringGeometry args={[rx, rx + 0.04, 64, 1, 0, Math.PI * 2]} />
          <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} transparent opacity={0.55} />
        </mesh>
      ))}
      <Trail width={1.4} length={4.5} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- SLED-TRACK (Bobsleigh / Luge / Skeleton) ------------------------------
// A banked ice tube viewed from above-rear. A sled-shaped streak rockets
// along the tube, banking through curves.
function SledTrackMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.25) % 1;
    // S-curve: oscillate x sinusoidally as z advances
    const z = 3 - cyc * 9;
    const x = Math.sin(cyc * Math.PI * 3) * 0.9;
    head.current.position.set(x, 0.18, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#06192a", 4, 12]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 6, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      {/* Ice tube floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[3.6, 14]} />
        <meshStandardMaterial color="#dcefff" metalness={0.6} roughness={0.2} />
      </mesh>
      {/* Banked walls — two angled side panels */}
      {[-1.8, 1.8].map((x) => (
        <mesh key={x} position={[x, 0.5, -2]} rotation={[0, 0, x > 0 ? -Math.PI / 6 : Math.PI / 6]}>
          <planeGeometry args={[1.2, 14]} />
          <meshStandardMaterial color="#cfe4f5" metalness={0.6} roughness={0.25} side={THREE.DoubleSide} />
        </mesh>
      ))}
      <Trail width={1.6} length={4.5} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.09} />
      </Trail>
    </>
  );
}

// --- EQUESTRIAN -----------------------------------------------------------
// Show-jumping arena with a single rail jump. Horse-and-rider trail gallops
// in, lifts over the jump, lands and continues.
function EquestrianMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.22) % 1;
    const z = 3 - cyc * 9;
    // Galloping bob + jump-arc when crossing z ≈ -1
    const bob = Math.abs(Math.sin(t * 6)) * 0.04;
    let y = 0.45 + bob;
    if (z > -1.8 && z < -0.2) {
      const u = (z + 1.8) / 1.6;
      y += Math.sin(u * Math.PI) * 1.2;
    }
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[2, 1.2, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#1a0f06", 5, 14]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} color="#ffe8b4" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      {/* Sand arena */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[8, 14]} />
        <meshStandardMaterial color="#a87248" metalness={0.05} roughness={0.95} />
      </mesh>
      {/* Jump rails */}
      <group position={[0, 0, -1]}>
        {/* Two standards */}
        {[-0.6, 0.6].map((x) => (
          <mesh key={x} position={[x, 0.5, 0]}>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
            <meshStandardMaterial color="#f4ead0" />
          </mesh>
        ))}
        {/* Rail */}
        <mesh position={[0, 0.85, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 1.3, 12]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} />
        </mesh>
      </group>
      <Trail width={1.6} length={3.5} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.1} />
      </Trail>
    </>
  );
}

// --- BOXING ----------------------------------------------------------------
// Squared ring with corner posts and ring ropes. Two streaks orbit each
// other, one snaps a jab toward the other and recovers.
function BoxingMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t * 1.4;
    const r = 0.7;
    if (a.current) a.current.position.set(Math.cos(cyc) * r, 0.55, Math.sin(cyc) * r * 0.5 - 0.5);
    if (b.current) {
      // Jab forward and back rapidly
      const jab = Math.max(0, Math.sin(t * 4)) * 0.3;
      b.current.position.set(-Math.cos(cyc) * r + jab, 0.55, -Math.sin(cyc) * r * 0.5 - 0.5);
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 6, 0]} angle={0.5} penumbra={0.45} intensity={3.6} color="#ffffff" />
      <pointLight position={[2, 1, -1]} intensity={1.4} color={accent} />
      <pointLight position={[-2, 1, -1]} intensity={1.0} color={GOLD} />
      {/* Square canvas */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[3.2, 3.2]} />
        <meshStandardMaterial color="#1a0a0a" metalness={0.18} roughness={0.7} />
      </mesh>
      {/* Corner posts + ropes */}
      {[
        [-1.6, 0.6, -2.1],
        [1.6, 0.6, -2.1],
        [-1.6, 0.6, 1.1],
        [1.6, 0.6, 1.1],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.07, 1.2, 0.07]} />
          <meshStandardMaterial color={i < 2 ? accent : GOLD} emissive={i < 2 ? accent : GOLD} emissiveIntensity={0.5} />
        </mesh>
      ))}
      {/* Three ropes */}
      {[0.4, 0.7, 1.0].map((y, i) => (
        <group key={i}>
          <mesh position={[0, y, -2.1]}>
            <boxGeometry args={[3.2, 0.025, 0.025]} />
            <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.3} />
          </mesh>
          <mesh position={[0, y, 1.1]}>
            <boxGeometry args={[3.2, 0.025, 0.025]} />
            <meshStandardMaterial color="#f4ead0" emissive="#f4ead0" emissiveIntensity={0.3} />
          </mesh>
        </group>
      ))}
      <Trail width={0.9} length={2.4} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.07} />
      </Trail>
      <Trail width={0.9} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- WRESTLING -------------------------------------------------------------
// Circular mat with the classic circle-in-circle markings. Two streaks
// engage low (grappling style — hips-level, close-in).
function WrestlingMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t * 1.3;
    if (a.current) a.current.position.set(Math.cos(cyc) * 0.5, 0.25, Math.sin(cyc) * 0.5 - 0.4);
    if (b.current) b.current.position.set(-Math.cos(cyc) * 0.5, 0.25, -Math.sin(cyc) * 0.5 - 0.4);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.2]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.3} />
      <spotLight position={[0, 5, 0]} angle={0.6} penumbra={0.5} intensity={3.4} color="#ffffff" />
      <pointLight position={[1.5, 1, -1]} intensity={1.2} color={accent} />
      {/* Circular mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color="#a83a44" metalness={0.05} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]}>
        <circleGeometry args={[1.6, 64]} />
        <meshStandardMaterial color="#3a72c0" metalness={0.05} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -0.5]}>
        <ringGeometry args={[0.5, 0.55, 64]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} />
      </mesh>
      <Trail width={0.7} length={1.6} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.06} />
      </Trail>
      <Trail width={0.7} length={1.6} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.06} />
      </Trail>
    </>
  );
}

// --- FENCING ---------------------------------------------------------------
// Fencing strip (piste) viewed from the side. Two streaks lunge along the
// linear strip — quick advance/retreat motion.
function FencingMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const lunge = Math.sin(t * 2) * 0.4;
    if (a.current) a.current.position.set(-1 + lunge, 0.5, -0.5);
    if (b.current) b.current.position.set(1 - lunge, 0.5, -0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 1]} angle={0.55} penumbra={0.5} intensity={3.0} color="#ffffff" />
      <pointLight position={[0, 0.6, -2]} intensity={1.4} color={accent} />
      {/* Piste — long narrow strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[5.5, 1.2]} />
        <meshStandardMaterial color="#cfd6e0" metalness={0.5} roughness={0.35} />
      </mesh>
      {/* Center line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.5]}>
        <planeGeometry args={[0.04, 1.2]} />
        <meshBasicMaterial color="#0a0508" />
      </mesh>
      {/* En-garde lines */}
      {[-1.0, 1.0].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.005, -0.5]}>
          <planeGeometry args={[0.04, 1.2]} />
          <meshBasicMaterial color="#0a0508" />
        </mesh>
      ))}
      <Trail width={0.6} length={1.8} color={accent} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={a} color={accent} size={0.06} />
      </Trail>
      <Trail width={0.6} length={1.8} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={b} color={GOLD} size={0.06} />
      </Trail>
    </>
  );
}

// --- ARCHERY ---------------------------------------------------------------
// Tournament-style: full-color FITA target (yellow center, red, blue, black,
// white rings) at the back. Arrow streaks from foreground into bullseye.
function ArcheryMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.5) % 1;
    head.current.position.set(0, 0.6, 3 - cyc * 9);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.7, 3.2]} fov={42} near={0.1} far={40} />
      <fog attach="fog" args={["#08080a", 5, 14]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 3, 0]} intensity={2.0} color="#fff8e6" />
      <pointLight position={[0, 0.6, -5]} intensity={1.6} color={accent} />
      {/* Range floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[6, 14]} />
        <meshStandardMaterial color="#1a4828" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* FITA target rings */}
      {[
        { r: 1.4, c: "#ffffff" },
        { r: 1.15, c: "#080808" },
        { r: 0.92, c: "#3a72c0" },
        { r: 0.69, c: "#ef3a47" },
        { r: 0.46, c: "#f5b50a" },
        { r: 0.18, c: "#f5b50a" },
      ].map((ring, i) => (
        <mesh key={i} position={[0, 0.6, -6.2 + i * 0.001]}>
          <circleGeometry args={[ring.r, 48]} />
          <meshBasicMaterial color={ring.c} />
        </mesh>
      ))}
      {/* Target stand */}
      <mesh position={[0, -0.1, -6.3]}>
        <boxGeometry args={[1.5, 0.1, 0.08]} />
        <meshStandardMaterial color="#3a2a16" />
      </mesh>
      <Trail width={0.7} length={3.5} color={GOLD} attenuation={(t) => t * t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.04} />
      </Trail>
    </>
  );
}

// --- SHOOTING --------------------------------------------------------------
// 10m air-rifle / pistol style: simpler black-ring target on a lit range. A
// thin bright streak crosses extremely fast.
function ShootingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.85) % 1;
    head.current.position.set(0, 0.85, 3 - cyc * 10);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.95, 3.0]} fov={42} near={0.1} far={40} />
      <fog attach="fog" args={["#08080a", 4, 12]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 2, 0]} intensity={2.0} color="#fff8e6" />
      <pointLight position={[0, 0.85, -5]} intensity={2.0} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#0c1018" metalness={0.2} roughness={0.85} />
      </mesh>
      {/* Concentric black-ring target */}
      {[1.0, 0.78, 0.56, 0.34, 0.12].map((r, i) => (
        <mesh key={r} position={[0, 0.85, -6.2 + i * 0.001]}>
          <ringGeometry args={[r - 0.05, r, 48]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
      ))}
      <mesh position={[0, 0.85, -6.198]}>
        <circleGeometry args={[0.07, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Trail width={0.4} length={4} color={"#fff8e6"} attenuation={(t) => Math.pow(t, 5)} decay={1.6}>
        <TrailHead ref={head} color={"#fff8e6"} size={0.025} />
      </Trail>
    </>
  );
}

// --- SKI JUMPING -----------------------------------------------------------
// In-run + lip + landing slope viewed from the side. Streak accelerates
// down the in-run, launches off the lip, soars in flight, lands.
function SkiJumpingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.32) % 1;
    let x: number, y: number;
    if (cyc < 0.3) {
      // In-run: slide down the ramp
      const u = cyc / 0.3;
      x = -2.6 + u * 2.0;
      y = 2.6 - u * 1.6;
    } else if (cyc < 0.85) {
      // Flight: parabolic forward arc
      const u = (cyc - 0.3) / 0.55;
      x = -0.6 + u * 3.6;
      y = 1.0 + Math.sin(u * Math.PI) * 0.6 - u * 0.9;
    } else {
      // Landing: glide on landing slope
      const u = (cyc - 0.85) / 0.15;
      x = 3.0 + u * 1.0;
      y = 0.1 - u * 0.05;
    }
    head.current.position.set(x, y, -1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 4.2]} fov={55} near={0.1} far={40} />
      <fog attach="fog" args={["#0a1626", 5, 14]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 3]} intensity={1.4} color="#ffffff" />
      <pointLight position={[2, 1, -3]} intensity={1.6} color={accent} />
      {/* In-run ramp */}
      <mesh position={[-1.8, 1.7, -1]} rotation={[0, 0, -0.5]}>
        <planeGeometry args={[2.6, 0.8]} />
        <meshStandardMaterial color="#dde6f0" metalness={0.05} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Landing slope */}
      <mesh position={[2.5, -0.4, -1]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[3.5, 0.8]} />
        <meshStandardMaterial color="#dde6f0" metalness={0.05} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <Trail width={1.4} length={4} color={"#ffffff"} attenuation={(t) => t * t * t} decay={1.6}>
        <TrailHead ref={head} color={"#ffffff"} size={0.07} />
      </Trail>
    </>
  );
}

// --- SNOWBOARD (halfpipe) --------------------------------------------------
// Halfpipe seen from a front-3/4 angle showing the U-profile. An actual
// snowboard (flat plank with two bindings) launches off the lip, spins a
// 360, and lands back inside the pipe. Snow particle puff at the lip on
// every air.
function SnowboardMotif({ accent }: { accent: string }) {
  const board = useRef<THREE.Group>(null);
  const puff = useRef<THREE.Mesh>(null);
  // Build the U-profile cross-section as an extruded shape so it actually
  // reads as a halfpipe rather than two flat ramps.
  const pipeGeom = useMemo(() => {
    const shape = new THREE.Shape();
    const w = 2.6;
    const h = 1.4;
    const r = 1.0;
    shape.moveTo(-w, h);
    shape.lineTo(-w, h - 0.4);
    shape.lineTo(-r, 0); // left arc start
    shape.absarc(0, 0, r, Math.PI, 0, true); // half-circle bottom
    shape.lineTo(w, h - 0.4);
    shape.lineTo(w, h);
    shape.lineTo(-w, h);
    return new THREE.ExtrudeGeometry(shape, { depth: 10, bevelEnabled: false });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t % 4;
    if (board.current) {
      // 0-1.4s wall transit + air, 1.4-2s land; 2-3.4s other side; 3.4-4 land
      let x: number, y: number, rotY: number;
      if (cyc < 1.4) {
        const u = cyc / 1.4;
        // Right wall: ride up curve, launch, spin
        x = -Math.cos(u * Math.PI) * 1.6;
        y = 0.4 + Math.sin(u * Math.PI) * 1.6 + (u > 0.4 && u < 0.6 ? 0.5 : 0);
        rotY = u > 0.45 ? (u - 0.45) * Math.PI * 4 : 0;
      } else if (cyc < 2.0) {
        const u = (cyc - 1.4) / 0.6;
        x = 1.6 - u * 0.4;
        y = 0.6 - u * 0.3;
        rotY = Math.PI * 1.5;
      } else if (cyc < 3.4) {
        const u = (cyc - 2.0) / 1.4;
        x = Math.cos(u * Math.PI) * 1.6;
        y = 0.4 + Math.sin(u * Math.PI) * 1.6 + (u > 0.4 && u < 0.6 ? 0.5 : 0);
        rotY = Math.PI * 1.5 + (u > 0.45 ? (u - 0.45) * Math.PI * 4 : 0);
      } else {
        const u = (cyc - 3.4) / 0.6;
        x = -1.6 + u * 0.4;
        y = 0.6 - u * 0.3;
        rotY = 0;
      }
      board.current.position.set(x, y, -1);
      board.current.rotation.y = rotY;
      board.current.rotation.z = Math.sin(t * 2) * 0.06;
    }
    // Snow puff appears briefly when the board crosses the lip
    if (puff.current) {
      const phase = cyc < 0.6 || (cyc >= 2.0 && cyc < 2.6) ? Math.max(0, Math.sin((cyc % 2) * Math.PI / 0.6)) : 0;
      puff.current.scale.setScalar(phase * 0.7 + 0.001);
      const mat = puff.current.material as THREE.MeshBasicMaterial;
      mat.opacity = phase * 0.6;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 4.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a1626", 5, 14]} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1.2, -3]} intensity={1.4} color={accent} />

      {/* Halfpipe — extruded U-profile into z */}
      <mesh geometry={pipeGeom} position={[0, 0, -6]}>
        <meshStandardMaterial color="#dde6f0" metalness={0.05} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Lip stripes (orange) */}
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.4, -1]}>
          <boxGeometry args={[0.12, 0.04, 10]} />
          <meshStandardMaterial color="#ff7a1a" emissive="#ff7a1a" emissiveIntensity={0.6} />
        </mesh>
      ))}

      {/* The snowboard — flat plank with two bindings */}
      <group ref={board}>
        <mesh>
          <boxGeometry args={[0.18, 0.04, 1.0]} />
          <meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} />
        </mesh>
        {/* Bindings */}
        <mesh position={[0, 0.04, -0.25]}>
          <boxGeometry args={[0.14, 0.05, 0.16]} />
          <meshStandardMaterial color="#1a1f28" metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.04, 0.25]}>
          <boxGeometry args={[0.14, 0.05, 0.16]} />
          <meshStandardMaterial color="#1a1f28" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Snow puff at lip */}
      <mesh ref={puff} position={[0, 1.4, -1]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshBasicMaterial color={"#ffffff"} transparent opacity={0} toneMapped={false} />
      </mesh>

      <Trail width={0.5} length={1.5} color={"#ffffff"} attenuation={(t) => t * t} decay={1.5}>
        <mesh visible={false}>
          <sphereGeometry args={[0.001, 4, 4]} />
          <meshBasicMaterial color={"#ffffff"} />
        </mesh>
      </Trail>
    </>
  );
}

// --- CURLING ---------------------------------------------------------------
// Sheet of ice with the house (target rings) at the far end. A stone slides
// from foreground toward the button.
function CurlingMotif({ accent }: { accent: string }) {
  const stone = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!stone.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.22) % 1;
    stone.current.position.set(0, 0.07, 2.5 - cyc * 8);
    stone.current.rotation.y = t * 0.6;
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.4]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#06192a", 5, 14]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3, 1]} intensity={2.0} color="#dcefff" />
      <pointLight position={[0, 1, -5]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[3.2, 14]} />
        <meshStandardMaterial color="#cfe4f5" metalness={0.6} roughness={0.18} />
      </mesh>
      {/* House: 4 nested circles */}
      {[
        { r: 1.0, c: "#3a72c0" },
        { r: 0.7, c: "#f4ead0" },
        { r: 0.4, c: "#ef3a47" },
        { r: 0.12, c: "#f5b50a" },
      ].map((ring, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005 + i * 0.001, -5.5]}>
          <circleGeometry args={[ring.r, 48]} />
          <meshBasicMaterial color={ring.c} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* Stone */}
      <mesh ref={stone}>
        <cylinderGeometry args={[0.16, 0.16, 0.1, 24]} />
        <meshStandardMaterial color="#1a1f28" metalness={0.6} roughness={0.3} emissive={GOLD} emissiveIntensity={0.4} />
      </mesh>
    </>
  );
}

// --- TRIATHLON -------------------------------------------------------------
// Triple-trail composite: blue swim wake + gold cyclist + ivory runner all
// running along three parallel paths (suggests swim → bike → run flow).
function TriathlonMotif({ accent }: { accent: string }) {
  const swim = useRef<THREE.Mesh>(null);
  const bike = useRef<THREE.Mesh>(null);
  const run = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (swim.current) swim.current.position.set(-1.2, 0.04, 3 - ((t * 0.16) % 1) * 9);
    if (bike.current) bike.current.position.set(0, 0.18, 3 - ((t * 0.22) % 1) * 9);
    if (run.current) run.current.position.set(1.2, 0.18, 3 - ((t * 0.18) % 1) * 9);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#031428", 5, 14]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      {/* Three lanes — water, road, track */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.2, 0, -2]}>
        <planeGeometry args={[1.4, 14]} />
        <meshStandardMaterial color="#0a3a6a" metalness={0.7} roughness={0.18} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[1.4, 14]} />
        <meshStandardMaterial color="#0e1018" metalness={0.18} roughness={0.78} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.2, 0, -2]}>
        <planeGeometry args={[1.4, 14]} />
        <meshStandardMaterial color="#0a0c14" metalness={0.3} roughness={0.85} />
      </mesh>
      <Trail width={1.0} length={3} color={"#cfe4ff"} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={swim} color={"#cfe4ff"} size={0.06} />
      </Trail>
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={bike} color={GOLD} size={0.06} />
      </Trail>
      <Trail width={1.0} length={3} color={"#f4ead0"} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={run} color={"#f4ead0"} size={0.06} />
      </Trail>
    </>
  );
}

// --- BIATHLON --------------------------------------------------------------
// Cross-country ski + a row of small black target circles on a board ahead.
// Skier streak passes through, "shooting" pulses light up the targets.
function BiathlonMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.24) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI * 4) * 0.9, 0.08, 2.5 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a1626", 5, 14]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -5]} intensity={1.4} color={accent} />
      {/* Snow trail */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#dde6f0" metalness={0.05} roughness={0.95} />
      </mesh>
      {/* Five black target dots on a board */}
      <mesh position={[0, 1.0, -6]}>
        <planeGeometry args={[2.4, 0.7]} />
        <meshStandardMaterial color="#1a1f28" metalness={0.4} roughness={0.4} />
      </mesh>
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x) => (
        <mesh key={x} position={[x, 1.0, -5.99]}>
          <circleGeometry args={[0.12, 24]} />
          <meshBasicMaterial color="#0a0a0a" />
        </mesh>
      ))}
      <Trail width={1.2} length={3.5} color={"#ffffff"} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={"#ffffff"} size={0.07} />
      </Trail>
    </>
  );
}

// --- MODERN PENTATHLON -----------------------------------------------------
// Composite scene: five pillars rising in a row (one per discipline) — fence
// strip, swim lane mark, ride jump rail, run track, pistol target. A trail
// orbits past them all.
function PentathlonMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.4) % 1;
    head.current.position.set(-2.5 + cyc * 5, 0.6, -1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0c1a", 5, 14]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[7, 6]} />
        <meshStandardMaterial color="#0c1020" metalness={0.2} roughness={0.7} />
      </mesh>
      {/* Five icon pillars */}
      {[
        { x: -2, c: accent }, // fencing
        { x: -1, c: "#3a72c0" }, // swimming
        { x: 0, c: "#a87248" }, // riding
        { x: 1, c: GOLD }, // pistol
        { x: 2, c: "#f4ead0" }, // running
      ].map((p, i) => (
        <mesh key={i} position={[p.x, 0.5, -1]}>
          <boxGeometry args={[0.16, 1.0, 0.16]} />
          <meshStandardMaterial color={p.c} emissive={p.c} emissiveIntensity={0.45} />
        </mesh>
      ))}
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- ICE HOCKEY ------------------------------------------------------------
// Rink with goal at the back. Puck-streak slap-shoots from blue line to net.
function IceHockeyMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.5) % 1;
    head.current.position.set(0, 0.04, 2 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#06192a", 5, 14]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3, 2]} intensity={2.4} color="#dcefff" />
      <pointLight position={[0, 1, -5]} intensity={2.0} color={accent} />
      {/* Rink ice */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[7, 14]} />
        <meshStandardMaterial color="#dcefff" metalness={0.6} roughness={0.18} />
      </mesh>
      {/* Center face-off */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -2]}>
        <ringGeometry args={[1.0, 1.05, 48]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -2]}>
        <circleGeometry args={[0.1, 24]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      {/* Blue lines */}
      {[-4, 0].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[7, 0.08]} />
          <meshBasicMaterial color={i === 0 ? accent : "#ef3a47"} />
        </mesh>
      ))}
      {/* Goal at the back */}
      <mesh position={[0, 0.45, -6]}>
        <boxGeometry args={[1.4, 0.8, 0.05]} />
        <meshBasicMaterial color="#ef3a47" wireframe />
      </mesh>
      <Trail width={0.8} length={3.5} color={GOLD} attenuation={(t) => t * t * t} decay={1.4}>
        <TrailHead ref={head} color={GOLD} size={0.05} />
      </Trail>
    </>
  );
}

// --- WATER POLO ------------------------------------------------------------
// Pool with floating goal. Ball arcs across water toward the cage.
function WaterPoloMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.45) % 1;
    head.current.position.set(0, 0.4 + Math.sin(cyc * Math.PI) * 1.0, 2 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#021a30", 5, 14]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 3, 2]} intensity={2.2} color="#cfe4ff" />
      <pointLight position={[0, 1, -4]} intensity={1.8} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5, 14]} />
        <meshStandardMaterial color="#0a3a6a" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Floating goal at the back */}
      <mesh position={[0, 0.35, -5.6]}>
        <boxGeometry args={[1.6, 0.7, 0.06]} />
        <meshBasicMaterial color="#f4ead0" wireframe />
      </mesh>
      <Trail width={0.9} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.7}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- HANDBALL --------------------------------------------------------------
// Indoor court with a 6m arc and a goal at the back.
function HandballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.5) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI) * 1.2, 0.6 + Math.sin(cyc * Math.PI) * 0.6, 2 - cyc * 7);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.4]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#06090a", 5, 14]} />
      <ambientLight intensity={0.45} />
      <spotLight position={[0, 5, 2]} angle={0.55} penumbra={0.5} intensity={3} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5.5, 12]} />
        <meshStandardMaterial color="#3a8a4a" metalness={0.05} roughness={0.85} />
      </mesh>
      {/* 6m arc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -5]}>
        <ringGeometry args={[1.6, 1.66, 32, 1, 0, Math.PI]} />
        <meshBasicMaterial color="#f4ead0" side={THREE.DoubleSide} />
      </mesh>
      {/* Goal */}
      <mesh position={[0, 0.5, -6]}>
        <boxGeometry args={[1.6, 0.9, 0.05]} />
        <meshBasicMaterial color="#f4ead0" wireframe />
      </mesh>
      <Trail width={0.9} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- GOALBALL --------------------------------------------------------------
// Paralympic blindfold sport — two goals at each end, ball rolling along
// the ground (no aerial). Tactile-rope court markings.
function GoalballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.4) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI) * 0.4, 0.06, 2.5 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.2]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a060a", 5, 12]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 4, 1]} angle={0.6} penumbra={0.6} intensity={2.6} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[3.6, 11]} />
        <meshStandardMaterial color="#1a3018" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Tactile lines (raised stripes) */}
      {[-3, -1.5, 0, 1.5, 3].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -2 + z]}>
          <planeGeometry args={[3.6, 0.04]} />
          <meshBasicMaterial color={GOLD} />
        </mesh>
      ))}
      {/* Two goals */}
      {[-5.5, 1.5].map((z) => (
        <mesh key={z} position={[0, 0.3, z]}>
          <boxGeometry args={[3.4, 0.6, 0.04]} />
          <meshBasicMaterial color="#f4ead0" wireframe />
        </mesh>
      ))}
      <Trail width={0.8} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- SITTING VOLLEYBALL ----------------------------------------------------
// Lower-net variant. Standard volleyball court with the net at floor-near
// height — ~1 m vs 2.43 m.
function SittingVolleyballMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.7) % 1;
    const phase = cyc * 2;
    const seg = Math.floor(phase) % 2;
    const u = phase - Math.floor(phase);
    const z = seg === 0 ? -3.5 + u * 4 : 0.5 - u * 4;
    const y = 0.2 + Math.sin(u * Math.PI) * 1.0;
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0c0a06", 5, 12]} />
      <ambientLight intensity={0.45} />
      <spotLight position={[0, 5, 2]} angle={0.55} penumbra={0.5} intensity={3} color="#fff8e6" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[5, 9]} />
        <meshStandardMaterial color="#7a4a20" metalness={0.18} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.6, -1.5]}>
        <planeGeometry args={[4.6, 0.5]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.55} />
      </mesh>
      <Trail width={1.0} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={1.7}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- WHEELCHAIR RUGBY ------------------------------------------------------
// Aggressive court sport — basketball-court size with goal lines at each
// end. Two streaks collide.
function WheelchairRugbyMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t * 1.0;
    if (a.current) a.current.position.set(Math.sin(cyc) * 1.2, 0.25, Math.cos(cyc) * 0.6 - 1);
    if (b.current) b.current.position.set(-Math.sin(cyc) * 1.2, 0.25, -Math.cos(cyc) * 0.6 - 1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0a10", 5, 12]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 2]} angle={0.55} penumbra={0.5} intensity={3} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -1]}>
        <planeGeometry args={[5, 8]} />
        <meshStandardMaterial color="#7a4a20" metalness={0.18} roughness={0.55} />
      </mesh>
      {/* Goal lines */}
      {[-4, 2].map((z) => (
        <mesh key={z} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, z]}>
          <planeGeometry args={[5, 0.06]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      ))}
      <Trail width={0.9} length={2.4} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.07} />
      </Trail>
      <Trail width={0.9} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- RUGBY (15s and 7s) ----------------------------------------------------
function RugbyMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.4) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI * 2) * 1.4, 0.4 + Math.sin(cyc * Math.PI) * 0.5, 2 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.2, 4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#031208", 5, 14]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 6, 3]} intensity={1.6} color="#ffffff" />
      <pointLight position={[0, 1, -5]} intensity={1.6} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[10, 14]} />
        <meshStandardMaterial color="#0a3318" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Goal posts (H-shape) */}
      <group position={[0, 0, -6]}>
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 1.2, 0]}>
            <boxGeometry args={[0.06, 2.4, 0.06]} />
            <meshStandardMaterial color="#f4ead0" />
          </mesh>
        ))}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[1.46, 0.06, 0.06]} />
          <meshStandardMaterial color="#f4ead0" />
        </mesh>
      </group>
      <Trail width={1.2} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- SURFING ---------------------------------------------------------------
// A wave's crest curling across the frame. Surfer-streak rides the face.
function SurfingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.3) % 1;
    const x = -2.8 + cyc * 5.6;
    const y = 0.25 + Math.sin(cyc * Math.PI * 3) * 0.15;
    head.current.position.set(x, y, -1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.3, 3.4]} fov={56} near={0.1} far={40} />
      <fog attach="fog" args={["#062840", 5, 14]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 5, 3]} intensity={1.6} color="#ffe8b4" />
      <pointLight position={[0, 1, -3]} intensity={1.6} color={accent} />
      {/* Wave face — undulating tube */}
      <mesh position={[0, 0.5, -1.5]} rotation={[-Math.PI / 2.5, 0, 0]}>
        <planeGeometry args={[7, 2.2, 24, 8]} />
        <meshStandardMaterial color="#0a4a8a" metalness={0.6} roughness={0.25} side={THREE.DoubleSide} />
      </mesh>
      {/* Foam cap line */}
      <mesh position={[0, 1.6, -1.5]} rotation={[-Math.PI / 2.6, 0, 0]}>
        <planeGeometry args={[7, 0.12, 24, 2]} />
        <meshBasicMaterial color="#f4ead0" />
      </mesh>
      <Trail width={1.1} length={2.4} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- SPORT CLIMBING --------------------------------------------------------
// Vertical wall with holds. Climber-streak ascends in a zig-zag route.
function ClimbingMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.18) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI * 3) * 0.8, -1.5 + cyc * 4, -1);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.4, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#1a1006", 5, 14]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]} intensity={1.6} color="#fff8e6" />
      <pointLight position={[0, 1, -3]} intensity={1.4} color={accent} />
      {/* Wall */}
      <mesh position={[0, 0.5, -1.5]}>
        <planeGeometry args={[5, 5]} />
        <meshStandardMaterial color="#3a2a16" metalness={0.05} roughness={0.95} />
      </mesh>
      {/* Holds — random colored bumps */}
      {[
        [-1.5, -1, 0],
        [0.6, -0.4, 0],
        [-0.8, 0.2, 0],
        [1.2, 0.8, 0],
        [-1.0, 1.4, 0],
        [0.4, 2.0, 0],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, -1.4 + z]}>
          <icosahedronGeometry args={[0.18, 0]} />
          <meshStandardMaterial color={i % 2 ? accent : GOLD} emissive={i % 2 ? accent : GOLD} emissiveIntensity={0.45} />
        </mesh>
      ))}
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- GOLF ------------------------------------------------------------------
// Green with a flagstick. Ball arcs from foreground onto the green and
// rolls toward the hole.
function GolfMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.3) % 1;
    if (cyc < 0.55) {
      const u = cyc / 0.55;
      head.current.position.set(0, 0.4 + Math.sin(u * Math.PI) * 1.6, 2 - u * 7);
    } else {
      const u = (cyc - 0.55) / 0.45;
      head.current.position.set(0, 0.06, -5 + Math.cos(u * Math.PI) * 0.4);
    }
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#031208", 5, 14]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} color="#ffe8b4" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[8, 14]} />
        <meshStandardMaterial color="#1a4a20" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Green */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -5]}>
        <circleGeometry args={[1.4, 48]} />
        <meshStandardMaterial color="#3a8a4a" metalness={0.05} roughness={0.85} />
      </mesh>
      {/* Flagstick + flag */}
      <mesh position={[0, 0.7, -5]}>
        <cylinderGeometry args={[0.018, 0.018, 1.4, 8]} />
        <meshStandardMaterial color="#f4ead0" />
      </mesh>
      <mesh position={[0.18, 1.2, -5]}>
        <planeGeometry args={[0.36, 0.22]} />
        <meshStandardMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      <Trail width={0.7} length={2.4} color={"#f4ead0"} attenuation={(t) => t * t} decay={1.6}>
        <TrailHead ref={head} color={"#f4ead0"} size={0.05} />
      </Trail>
    </>
  );
}

// --- TABLE TENNIS ----------------------------------------------------------
// Blue table with white edge lines + net. Tiny ball volleys back and forth.
function TableTennisMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 1.6) % 1;
    const phase = cyc * 2;
    const seg = Math.floor(phase) % 2;
    const u = phase - Math.floor(phase);
    const z = seg === 0 ? -2.2 + u * 2.4 : 0.2 - u * 2.4;
    const y = 0.5 + Math.sin(u * Math.PI) * 0.25;
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.0]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#070912", 5, 12]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 4, 2]} intensity={2.0} color="#ffffff" />
      <pointLight position={[0, 1, -3]} intensity={1.4} color={accent} />
      {/* Table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.4, -1]}>
        <planeGeometry args={[1.5, 2.6]} />
        <meshStandardMaterial color="#0c2a4a" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Edge line + center line */}
      {[-0.74, 0.74].map((x) => (
        <mesh key={x} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.405, -1]}>
          <planeGeometry args={[0.04, 2.6]} />
          <meshBasicMaterial color="#f4ead0" />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.405, -1]}>
        <planeGeometry args={[1.5, 0.04]} />
        <meshBasicMaterial color="#f4ead0" />
      </mesh>
      {/* Net */}
      <mesh position={[0, 0.55, -1]}>
        <planeGeometry args={[1.5, 0.18]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.6} />
      </mesh>
      <Trail width={0.4} length={1.4} color={GOLD} attenuation={(t) => t * t} decay={2.0}>
        <TrailHead ref={head} color={GOLD} size={0.025} />
      </Trail>
    </>
  );
}

// --- BADMINTON -------------------------------------------------------------
// Court with high net. Shuttle has a quick rise + slow fall (different from tennis ball arc).
function BadmintonMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.85) % 1;
    const phase = cyc * 2;
    const seg = Math.floor(phase) % 2;
    const u = phase - Math.floor(phase);
    const z = seg === 0 ? -3.5 + u * 4 : 0.5 - u * 4;
    // Rise fast, fall slowly (shuttle physics)
    const y = 0.6 + (u < 0.5 ? Math.sin(u * Math.PI) * 1.6 : Math.sin(u * Math.PI) * 1.0);
    head.current.position.set(0, y, z);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.6]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0c14", 5, 12]} />
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 5, 2]} intensity={2.6} color="#ffffff" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[4, 10]} />
        <meshStandardMaterial color="#3a2a16" metalness={0.18} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.55, -1.5]}>
        <planeGeometry args={[3.6, 0.3]} />
        <meshBasicMaterial color="#f4ead0" wireframe transparent opacity={0.55} />
      </mesh>
      <mesh position={[0, 1.7, -1.5]}>
        <boxGeometry args={[3.6, 0.04, 0.04]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <Trail width={0.5} length={2.0} color={"#f4ead0"} attenuation={(t) => t * t} decay={1.9}>
        <TrailHead ref={head} color={"#f4ead0"} size={0.035} />
      </Trail>
    </>
  );
}

// --- TAEKWONDO -------------------------------------------------------------
// Octagonal mat with two streaks throwing high kicks (vertical motion).
function TaekwondoMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const cyc = t * 1.6;
    if (a.current) a.current.position.set(-0.8, 0.5 + Math.max(0, Math.sin(cyc)) * 0.7, -0.5);
    if (b.current) b.current.position.set(0.8, 0.5 + Math.max(0, Math.sin(cyc + Math.PI)) * 0.7, -0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.0]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0508", 5, 12]} />
      <ambientLight intensity={0.35} />
      <spotLight position={[0, 5, 0]} angle={0.55} penumbra={0.5} intensity={3} color="#ffffff" />
      <pointLight position={[0, 1, -3]} intensity={1.4} color={accent} />
      {/* Octagonal mat */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <circleGeometry args={[2.0, 8]} />
        <meshStandardMaterial color="#3a72c0" metalness={0.05} roughness={0.85} />
      </mesh>
      <Trail width={0.9} length={2.2} color={accent} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={a} color={accent} size={0.07} />
      </Trail>
      <Trail width={0.9} length={2.2} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={b} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- TUG OF WAR ------------------------------------------------------------
// Single rope across the screen with two streaks at each end straining.
function TugOfWarMotif({ accent }: { accent: string }) {
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const sway = Math.sin(t * 1.2) * 0.3;
    if (a.current) a.current.position.set(-1.6 + sway, 0.5, -0.5);
    if (b.current) b.current.position.set(1.6 + sway, 0.5, -0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.0]} fov={50} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0a0a", 5, 12]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={2.0} color="#fff8e6" />
      <pointLight position={[0, 1, -3]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.5]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color="#1a2818" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Rope — thick horizontal cylinder */}
      <mesh position={[0, 0.5, -0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 4, 8]} />
        <meshStandardMaterial color="#a87248" metalness={0.05} roughness={0.6} />
      </mesh>
      {/* Center marker — red flag */}
      <mesh position={[0, 0.62, -0.5]}>
        <boxGeometry args={[0.08, 0.18, 0.04]} />
        <meshBasicMaterial color={accent} />
      </mesh>
      <Trail width={0.8} length={1.6} color={accent} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={a} color={accent} size={0.07} />
      </Trail>
      <Trail width={0.8} length={1.6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={b} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

// --- TRAMPOLINE ------------------------------------------------------------
// Single trampoline bed in the middle, streak bouncing very high (vertical).
function TrampolineMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    head.current.position.set(0, 0.5 + Math.abs(Math.sin(t * 1.6)) * 2.2, -0.5);
    head.current.rotation.x = t * 4; // somersaulting
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.4, 3.4]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a0a14", 5, 12]} />
      <ambientLight intensity={0.4} />
      <spotLight position={[0, 5, 0]} angle={0.55} penumbra={0.55} intensity={2.8} color="#ffffff" />
      <pointLight position={[0, 1, -3]} intensity={1.4} color={accent} />
      {/* Trampoline frame */}
      <mesh position={[0, 0.4, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.1, 32]} />
        <meshStandardMaterial color="#cfd6e0" metalness={0.6} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>
      {/* Bed */}
      <mesh position={[0, 0.4, -0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.0, 32]} />
        <meshStandardMaterial color="#1a1f28" metalness={0.4} roughness={0.5} />
      </mesh>
      <Trail width={1.4} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.08} />
      </Trail>
    </>
  );
}

// --- RHYTHMIC GYMNASTICS ---------------------------------------------------
// Single performer — long ribbon trail spiraling in elegant patterns.
function RhythmicGymnasticsMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = t * 1.4;
    head.current.position.set(Math.sin(cyc) * 1.2, 1.0 + Math.sin(cyc * 0.7) * 0.8, Math.cos(cyc * 1.1) * 0.8 - 0.5);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.6, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a060a", 5, 14]} />
      <ambientLight intensity={0.32} />
      <spotLight position={[0, 5, 1]} angle={0.55} penumbra={0.55} intensity={2.8} color="#ffffff" />
      <pointLight position={[2, 1, 0]} intensity={1.0} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, -0.5]}>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color="#1a1228" metalness={0.4} roughness={0.5} />
      </mesh>
      <Trail width={3.0} length={8} color={accent} attenuation={(t) => t} decay={1.2}>
        <TrailHead ref={head} color={accent} size={0.09} />
      </Trail>
    </>
  );
}

// --- SYNCHRONIZED SWIMMING -------------------------------------------------
// Top-down-ish view of a circular pool patch. Four swimmer-streaks form a
// rotating petal pattern — they orbit a common center while each does a
// tight inner loop, suggesting the layered choreography.
function SyncSwimMotif({ accent }: { accent: string }) {
  const headA = useRef<THREE.Mesh>(null);
  const headB = useRef<THREE.Mesh>(null);
  const headC = useRef<THREE.Mesh>(null);
  const headD = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const orbit = t * 0.45;
    const inner = t * 1.6;
    const ringR = 1.2;
    const innerR = 0.35;
    const set = (mesh: THREE.Mesh | null, phase: number) => {
      if (!mesh) return;
      const cx = Math.cos(orbit + phase) * ringR;
      const cy = Math.sin(orbit + phase) * ringR;
      // Add an inner loop centered on each swimmer's orbit position
      const ix = Math.cos(inner + phase) * innerR;
      const iy = Math.sin(inner + phase) * innerR;
      mesh.position.set(cx + ix, 0.06, cy + iy - 0.3);
    };
    set(headA.current, 0);
    set(headB.current, Math.PI / 2);
    set(headC.current, Math.PI);
    set(headD.current, (3 * Math.PI) / 2);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.0, 3.0]} fov={48} near={0.1} far={40} />
      <fog attach="fog" args={["#021a30", 5, 14]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[0, 3, 2]} intensity={2.4} color="#cfe4ff" />
      <pointLight position={[0, 0.6, -3]} intensity={1.4} color={accent} />
      {/* Round pool patch — circular framing reads better than a rectangle from this angle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.3]}>
        <circleGeometry args={[2.0, 64]} />
        <meshStandardMaterial color="#0a3a6a" metalness={0.7} roughness={0.18} />
      </mesh>
      {/* Pool edge ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -0.3]}>
        <ringGeometry args={[1.95, 2.05, 64]} />
        <meshBasicMaterial color={accent} side={THREE.DoubleSide} />
      </mesh>
      <Trail width={0.6} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={headA} color={GOLD} size={0.05} />
      </Trail>
      <Trail width={0.6} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={headB} color={GOLD} size={0.05} />
      </Trail>
      <Trail width={0.6} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={headC} color={GOLD} size={0.05} />
      </Trail>
      <Trail width={0.6} length={2.6} color={GOLD} attenuation={(t) => t * t} decay={1.4}>
        <TrailHead ref={headD} color={GOLD} size={0.05} />
      </Trail>
    </>
  );
}

// --- POLO ------------------------------------------------------------------
// Open field with a goal at each end, ball-trail dribbled at a gallop.
function PoloMotif({ accent }: { accent: string }) {
  const head = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!head.current) return;
    const t = state.clock.elapsedTime;
    const cyc = (t * 0.3) % 1;
    head.current.position.set(Math.sin(cyc * Math.PI * 2) * 1.4, 0.18 + Math.abs(Math.sin(t * 6)) * 0.06, 2 - cyc * 8);
  });
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.3, 3.6]} fov={52} near={0.1} far={40} />
      <fog attach="fog" args={["#0a2810", 5, 14]} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 3]} intensity={1.6} color="#ffe8b4" />
      <pointLight position={[0, 1, -4]} intensity={1.4} color={accent} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -2]}>
        <planeGeometry args={[10, 14]} />
        <meshStandardMaterial color="#0a4a20" metalness={0.05} roughness={0.92} />
      </mesh>
      {/* Goal posts at far end */}
      {[-1.2, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.6, -6]}>
          <boxGeometry args={[0.06, 1.2, 0.06]} />
          <meshStandardMaterial color="#f4ead0" />
        </mesh>
      ))}
      <Trail width={1.0} length={3} color={GOLD} attenuation={(t) => t * t} decay={1.5}>
        <TrailHead ref={head} color={GOLD} size={0.07} />
      </Trail>
    </>
  );
}

export const _useMemoIgnore = useMemo;
