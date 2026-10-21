"use client";
/* eslint-disable react-hooks/immutability -- three.js scene objects (camera, lights) are updated imperatively inside frame loops */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import {
  BoxGeometry,
  CylinderGeometry,
  IcosahedronGeometry,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
  type DirectionalLight,
  type Group,
  type HemisphereLight,
  type OrthographicCamera,
  type PointLight,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type V3 = [number, number, number];
export type Live = {
  fb: number; // continuous chapter position 0..2
  ch: number;
  item: number; // -1 = overview
};
type Props = {
  live: RefObject<Live>;
  running: boolean;
  small: boolean;
  onFailure: () => void;
};

const GAP = 19; // distance between the three rooms along x
const clamp = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Where the camera looks inside each room for [overview, item 0, item 1, item 2].
const FOCUS: { x: number; z: number; zoom: number }[][] = [
  [
    { x: 0, z: 0, zoom: 1 },
    { x: -2.1, z: 0.2, zoom: 1.32 },
    { x: 3.2, z: -1.4, zoom: 1.5 },
    { x: 3.2, z: 1.7, zoom: 1.5 },
  ],
  [
    { x: 0, z: 0, zoom: 1 },
    { x: -3, z: -1.3, zoom: 1.5 },
    { x: 1.5, z: -1.6, zoom: 1.4 },
    { x: 3.2, z: 1.2, zoom: 1.55 },
  ],
  [
    { x: 0, z: 0, zoom: 1 },
    { x: -3.2, z: -1.1, zoom: 1.5 },
    { x: 3, z: -1.4, zoom: 1.42 },
    { x: -0.4, z: 2, zoom: 1.35 },
  ],
];

function makeMaterials() {
  const std = (color: string, roughness = 0.7, metalness = 0) =>
    new MeshStandardMaterial({ color, roughness, metalness });
  const glow = (color: string, intensity: number) =>
    new MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: intensity,
      roughness: 0.4,
    });
  return {
    geo: {
      box: new BoxGeometry(1, 1, 1),
      round: new RoundedBoxGeometry(1, 1, 1, 3, 0.14),
      cyl: new CylinderGeometry(1, 1, 1, 20),
      ball: new SphereGeometry(1, 20, 14),
      ring: new TorusGeometry(1, 0.035, 8, 64),
      ico: new IcosahedronGeometry(1, 1),
    },
    ink: std("#103b3b"),
    deep: std("#0b292b", 0.85),
    teal: std("#267372", 0.75),
    bright: std("#3b928c", 0.7),
    mint: std("#b6d4ca", 0.7),
    bone: std("#f2f0e9", 0.8),
    oak: std("#cda16e", 0.55),
    edge: std("#e6c498", 0.5),
    black: std("#1b2423", 0.85),
    metal: std("#303c3a", 0.3, 0.75),
    plant: std("#4f7a4a", 0.9),
    glow: glow("#b6d4ca", 1.7),
    glowBright: glow("#3b928c", 2.4),
    lamp: glow("#fff2ce", 2),
    holo: new MeshStandardMaterial({
      color: "#b6d4ca",
      emissive: "#b6d4ca",
      emissiveIntensity: 2.2,
      wireframe: true,
    }),
    glass: new MeshStandardMaterial({
      color: "#b6d4ca",
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      depthWrite: false,
    }),
    beam: new MeshStandardMaterial({
      color: "#b6d4ca",
      emissive: "#b6d4ca",
      emissiveIntensity: 0.9,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    }),
  };
}
type Mats = ReturnType<typeof makeMaterials>;
type Finish = Exclude<keyof Mats, "geo">;
const Materials = createContext<Mats | null>(null);
const Time = createContext<RefObject<number>>({ current: 1 });
const LiveCtx = createContext<RefObject<Live>>({
  current: { fb: 0, ch: 0, item: -1 },
});

function Block({
  at = [0, 0, 0],
  size,
  finish = "oak",
  rounded = false,
  rotation = [0, 0, 0],
  shadow = true,
}: {
  at?: V3;
  size: V3;
  finish?: Finish;
  rounded?: boolean;
  rotation?: V3;
  shadow?: boolean;
}) {
  const m = useContext(Materials)!;
  return (
    <mesh
      position={at}
      scale={size}
      rotation={rotation}
      geometry={rounded ? m.geo.round : m.geo.box}
      material={m[finish]}
      castShadow={shadow}
      receiveShadow
    />
  );
}
function Cyl({
  at,
  r,
  h,
  finish = "metal",
  rotation = [0, 0, 0],
  shadow = true,
}: {
  at: V3;
  r: number;
  h: number;
  finish?: Finish;
  rotation?: V3;
  shadow?: boolean;
}) {
  const m = useContext(Materials)!;
  return (
    <mesh
      position={at}
      scale={[r, h, r]}
      rotation={rotation}
      geometry={m.geo.cyl}
      material={m[finish]}
      castShadow={shadow}
      receiveShadow
    />
  );
}
function Ball({
  at,
  r,
  finish = "mint",
}: {
  at: V3;
  r: number;
  finish?: Finish;
}) {
  const m = useContext(Materials)!;
  return (
    <mesh
      position={at}
      scale={r}
      geometry={m.geo.ball}
      material={m[finish]}
      castShadow
    />
  );
}

// A piece that flies in when its room is "built" (Time goes 0 -> 1) and out again when it is left.
function Piece({
  start,
  duration = 0.16,
  offset = [0, 0.6, 0],
  children,
}: {
  start: number;
  duration?: number;
  offset?: V3;
  children: ReactNode;
}) {
  const g = useRef<Group>(null);
  const time = useContext(Time);
  useFrame(() => {
    if (!g.current) return;
    const t = clamp((time.current - start) / duration);
    const e = t * t * (3 - 2 * t);
    g.current.visible = t > 0.003;
    g.current.position.set(
      offset[0] * (1 - e),
      offset[1] * (1 - e),
      offset[2] * (1 - e),
    );
    g.current.scale.setScalar(0.9 + 0.1 * e);
  });
  return (
    <group ref={g} visible={false}>
      {children}
    </group>
  );
}

// Lifts and brightens slightly when its item is the active one (or hovered).
function Item({
  room,
  index,
  children,
}: {
  room: number;
  index: number;
  children: ReactNode;
}) {
  const g = useRef<Group>(null);
  const live = useContext(LiveCtx);
  const hover = useRef(false);
  useFrame((_, dt) => {
    if (!g.current) return;
    const l = live.current;
    const on = hover.current || (Math.round(l.fb) === room && l.item === index);
    const y = on ? 0.09 : 0;
    g.current.position.y +=
      (y - g.current.position.y) * (1 - Math.exp(-dt * 7));
  });
  return (
    <group
      ref={g}
      onPointerOver={(e) => {
        e.stopPropagation();
        hover.current = true;
      }}
      onPointerOut={() => (hover.current = false)}
    >
      {children}
    </group>
  );
}

function Shell({
  floor,
  wall,
  trim,
}: {
  floor: Finish;
  wall: Finish;
  trim: Finish;
}) {
  return (
    <>
      <Block at={[0, -0.1, 0]} size={[10.8, 0.2, 7]} finish={floor} />
      <Block
        at={[0, -0.02, 3.5]}
        size={[10.8, 0.06, 0.04]}
        finish="glow"
        shadow={false}
      />
      <Piece start={0.04} duration={0.22} offset={[0, -0.9, -0.2]}>
        <Block at={[0, 1.8, -3.35]} size={[10.8, 3.6, 0.16]} finish={wall} />
        <Block at={[-5.35, 1.8, -1.6]} size={[0.14, 3.6, 3.5]} finish={wall} />
        <Block at={[0, 0.1, -3.22]} size={[10.7, 0.2, 0.1]} finish={trim} />
      </Piece>
    </>
  );
}

/* ------------------------------ Room 1: Learning ------------------------------ */
function Desk({ x, z, tone }: { x: number; z: number; tone: Finish }) {
  return (
    <group position={[x, 0, z]}>
      <Block at={[0, 0.72, 0]} size={[1, 0.06, 0.62]} finish="edge" />
      {[-0.44, 0.44].flatMap((lx) =>
        [-0.25, 0.25].map((lz) => (
          <Block
            key={`${lx}${lz}`}
            at={[lx, 0.35, lz]}
            size={[0.05, 0.7, 0.05]}
            finish="metal"
          />
        )),
      )}
      <Block
        at={[0, 0.45, 0.66]}
        size={[0.46, 0.06, 0.44]}
        finish={tone}
        rounded
      />
      <Block
        at={[0, 0.76, 0.86]}
        size={[0.46, 0.4, 0.05]}
        finish={tone}
        rounded
      />
      {[-0.19, 0.19].flatMap((lx) =>
        [0.5, 0.82].map((lz) => (
          <Block
            key={`c${lx}${lz}`}
            at={[lx, 0.22, lz]}
            size={[0.035, 0.44, 0.035]}
            finish="metal"
          />
        )),
      )}
    </group>
  );
}
const BOOKS: Finish[] = [
  "teal",
  "mint",
  "bone",
  "ink",
  "bright",
  "teal",
  "bone",
];
function Shelf({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      {[-1.1, 0, 1.1].map((sx) => (
        <Block
          key={sx}
          at={[sx, 1.05, 0]}
          size={[0.06, 2.1, 0.55]}
          finish="oak"
        />
      ))}
      {[0.08, 0.7, 1.32, 1.95].map((y) => (
        <Block key={y} at={[0, y, 0]} size={[2.3, 0.06, 0.58]} finish="edge" />
      ))}
      {[0.1, 0.72, 1.34].flatMap((y, row) =>
        Array.from({ length: 12 }, (_, i) => (
          <Block
            key={`${row}-${i}`}
            at={[-1.02 + i * 0.18 + (row % 2) * 0.03, y + 0.28, 0]}
            size={[0.11, 0.42 + ((i + row) % 3) * 0.06, 0.34]}
            finish={BOOKS[(i + row * 2) % BOOKS.length]}
          />
        )),
      )}
    </group>
  );
}
function Laptop({ at, rot = 0 }: { at: V3; rot?: number }) {
  return (
    <group position={at} rotation={[0, rot, 0]}>
      <Block at={[0, 0.015, 0]} size={[0.5, 0.03, 0.34]} finish="metal" />
      <Block
        at={[0, 0.2, -0.16]}
        size={[0.5, 0.34, 0.02]}
        finish="black"
        rotation={[-0.2, 0, 0]}
      />
      <Block
        at={[0, 0.2, -0.145]}
        size={[0.44, 0.28, 0.01]}
        finish="glow"
        rotation={[-0.2, 0, 0]}
        shadow={false}
      />
    </group>
  );
}
function LearningRoom() {
  return (
    <>
      <Shell floor="oak" wall="teal" trim="edge" />
      <Piece start={0.2} duration={0.14} offset={[0, 0.5, 0]}>
        <Block at={[-1.9, 2.05, -3.22]} size={[4, 1.5, 0.06]} finish="bone" />
        <Block
          at={[-1.9, 1.25, -3.18]}
          size={[3.8, 0.07, 0.12]}
          finish="edge"
        />
      </Piece>
      <Item room={0} index={0}>
        {[-3.6, -2.1, -0.6].flatMap((x, c) =>
          [-1.5, 0.2, 1.9].map((z, r) => (
            <Piece
              key={`${x}${z}`}
              start={0.26 + (c + r) * 0.045}
              duration={0.14}
              offset={[0, 0.6, 0.2]}
            >
              <Desk x={x} z={z} tone={(c + r) % 2 ? "bright" : "teal"} />
            </Piece>
          )),
        )}
        <Piece start={0.34} duration={0.14} offset={[-0.4, 0.4, 0]}>
          <Block
            at={[-4.6, 0.55, -2.5]}
            size={[1.3, 0.08, 0.7]}
            finish="edge"
          />
          <Block at={[-4.6, 0.28, -2.5]} size={[1.2, 0.5, 0.6]} finish="teal" />
        </Piece>
      </Item>
      <Item room={0} index={1}>
        <Piece start={0.4} duration={0.18} offset={[0.4, 0.3, 0]}>
          <Shelf x={3.3} z={-2.95} />
        </Piece>
        <Piece start={0.5} duration={0.16} offset={[0, 0.7, 0]}>
          <Block at={[3.3, 0.74, -0.7]} size={[2, 0.07, 0.9]} finish="edge" />
          {[-0.9, 0.9].map((x) => (
            <Block
              key={x}
              at={[3.3 + x, 0.36, -0.7]}
              size={[0.06, 0.72, 0.7]}
              finish="metal"
            />
          ))}
          <Laptop at={[2.7, 0.78, -0.7]} rot={0.2} />
          <Laptop at={[3.9, 0.78, -0.7]} rot={-0.25} />
        </Piece>
        <Piece start={0.58} duration={0.14} offset={[0, 0.9, 0]}>
          {[2.7, 3.9].map((x) => (
            <group key={x}>
              <Cyl
                at={[x, 3.1, -0.7]}
                r={0.01}
                h={1}
                finish="metal"
                shadow={false}
              />
              <Cyl at={[x, 2.55, -0.7]} r={0.3} h={0.28} finish="bone" />
              <Cyl
                at={[x, 2.4, -0.7]}
                r={0.2}
                h={0.03}
                finish="lamp"
                shadow={false}
              />
            </group>
          ))}
        </Piece>
      </Item>
      <Item room={0} index={2}>
        <Piece start={0.62} duration={0.14} offset={[0, 0.8, 0]}>
          {(["mint", "teal", "bone", "bright"] as Finish[]).map((f, i) => (
            <Cyl
              key={f}
              at={[2.2 + (i % 2) * 0.55, 0.22 + Math.floor(i / 2) * 0.46, 1.2]}
              r={0.24}
              h={0.42}
              finish={f}
            />
          ))}
        </Piece>
        <Piece start={0.68} duration={0.14} offset={[0, 0.8, 0.3]}>
          <Block
            at={[3.7, 0.28, 1.4]}
            size={[1.5, 0.5, 0.7]}
            finish="bright"
            rounded
          />
          <Block
            at={[3.7, 0.62, 1.1]}
            size={[1.5, 0.45, 0.2]}
            finish="teal"
            rounded
          />
        </Piece>
        <Piece start={0.74} duration={0.14} offset={[0.3, 0.7, 0]}>
          <Block at={[3.3, 0.95, 2.6]} size={[1.7, 0.06, 0.8]} finish="edge" />
          <Block
            at={[3.3, 0.48, 2.6]}
            size={[0.08, 0.95, 0.08]}
            finish="metal"
          />
          <Block at={[3.3, 0.02, 2.6]} size={[0.9, 0.04, 0.5]} finish="metal" />
          <Block
            at={[3.3, 1.04, 2.6]}
            size={[0.5, 0.04, 0.36]}
            finish="black"
          />
        </Piece>
        <Piece start={0.78} duration={0.14} offset={[0, 0.5, 0]}>
          {[0, 1, 2].map((i) => (
            <Block
              key={i}
              at={[4.75, 0.28 + i * 0.5, 2.1]}
              size={[0.6, 0.46, 0.6]}
              finish={i % 2 ? "mint" : "bone"}
              rounded
            />
          ))}
        </Piece>
      </Item>
    </>
  );
}

/* ------------------------------ Room 2: Technology ------------------------------ */
function Atom({ at }: { at: V3 }) {
  const g = useRef<Group>(null);
  const m = useContext(Materials)!;
  useFrame((_, dt) => {
    if (g.current) {
      g.current.rotation.y += dt * 0.7;
      g.current.rotation.x += dt * 0.25;
    }
  });
  return (
    <group position={at}>
      <Ball at={[0, 0, 0]} r={0.16} finish="glow" />
      <group ref={g}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            geometry={m.geo.ring}
            material={m.glowBright}
            scale={0.62}
            rotation={[(i * Math.PI) / 3, (i * Math.PI) / 5, 0]}
          />
        ))}
      </group>
    </group>
  );
}
function Net() {
  const nodes = useMemo(() => {
    const out: [number, number][] = [];
    const cols = [0.15, 0.4, 0.65, 0.9];
    cols.forEach((cx, c) => {
      const n = c === 0 || c === 3 ? 3 : 4;
      for (let k = 0; k < n; k++) out.push([cx, (k + 0.5) / n]);
    });
    return out;
  }, []);
  const edges = useMemo(() => {
    const e: [number, number][] = [];
    nodes.forEach((a, i) =>
      nodes.forEach((b, j) => {
        if (Math.abs(b[0] - a[0] - 0.25) < 0.02) e.push([i, j]);
      }),
    );
    return e;
  }, [nodes]);
  const W = 4.2;
  const H = 2.1;
  const pos = (n: [number, number]): [number, number] => [
    (n[0] - 0.5) * W,
    (n[1] - 0.5) * H,
  ];
  return (
    <group>
      {edges.map(([i, j], k) => {
        const a = pos(nodes[i]);
        const b = pos(nodes[j]);
        const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
        return (
          <Block
            key={k}
            at={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0.02]}
            size={[len, 0.012, 0.012]}
            rotation={[0, 0, ang]}
            finish="glowBright"
            shadow={false}
          />
        );
      })}
      {nodes.map((n, i) => {
        const p = pos(n);
        return <Ball key={i} at={[p[0], p[1], 0.03]} r={0.07} finish="glow" />;
      })}
    </group>
  );
}
function RobotArm({ at }: { at: V3 }) {
  const a = useRef<Group>(null);
  const b = useRef<Group>(null);
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (a.current) a.current.rotation.z = -0.5 + Math.sin(t * 0.9) * 0.35;
    if (b.current) b.current.rotation.z = 1.1 + Math.sin(t * 1.3 + 1) * 0.4;
  });
  return (
    <group position={at}>
      <Cyl at={[0, 0.1, 0]} r={0.45} h={0.2} finish="metal" />
      <Block at={[0, 0.4, 0]} size={[0.3, 0.4, 0.3]} finish="teal" rounded />
      <group ref={a} position={[0, 0.6, 0]}>
        <Block at={[0, 0.5, 0]} size={[0.2, 1, 0.2]} finish="bone" rounded />
        <group ref={b} position={[0, 1, 0]}>
          <Ball at={[0, 0, 0]} r={0.15} finish="glowBright" />
          <Block
            at={[0, 0.45, 0]}
            size={[0.16, 0.9, 0.16]}
            finish="mint"
            rounded
          />
          <Block at={[0, 0.95, 0]} size={[0.3, 0.1, 0.2]} finish="metal" />
        </group>
      </group>
    </group>
  );
}
function Holo({ at }: { at: V3 }) {
  const g = useRef<Group>(null);
  const m = useContext(Materials)!;
  useFrame((_, dt) => {
    if (g.current) {
      g.current.rotation.y += dt * 0.6;
      g.current.rotation.x += dt * 0.3;
      g.current.position.y = at[1] + Math.sin(performance.now() / 700) * 0.06;
    }
  });
  return (
    <group ref={g} position={at}>
      <mesh scale={0.62} geometry={m.geo.ico} material={m.holo} />
    </group>
  );
}
function TechRoom() {
  return (
    <>
      <Shell floor="black" wall="deep" trim="glowBright" />
      {Array.from({ length: 9 }, (_, i) => (
        <Block
          key={i}
          at={[-4.4 + i * 1.1, 0.005, 0]}
          size={[0.02, 0.01, 6.8]}
          finish="glowBright"
          shadow={false}
        />
      ))}
      <Item room={1} index={0}>
        <Piece start={0.22} duration={0.16} offset={[-0.5, 0.4, 0]}>
          <Block at={[-3, 0.45, -1.6]} size={[3.8, 0.9, 1.1]} finish="metal" />
          <Block at={[-3, 0.93, -1.6]} size={[3.9, 0.07, 1.2]} finish="mint" />
          {[-1.3, -0.5, 0.4, 1.2].map((x, i) => (
            <group key={x}>
              <Cyl
                at={[-3 + x, 1.2, -1.6]}
                r={0.17}
                h={0.45}
                finish="glass"
                shadow={false}
              />
              <Cyl
                at={[-3 + x, 1.08, -1.6]}
                r={0.15}
                h={0.2}
                finish={i % 2 ? "glow" : "glowBright"}
                shadow={false}
              />
            </group>
          ))}
          <Block
            at={[-3.6, 1.25, -1.7]}
            size={[0.25, 0.5, 0.25]}
            finish="black"
          />
        </Piece>
        <Piece start={0.34} duration={0.14} offset={[0, 0.8, 0]}>
          <Atom at={[-3, 2.2, -1.6]} />
        </Piece>
        <Piece start={0.4} duration={0.14} offset={[0, 0.4, 0.2]}>
          {[1.8, 2.5].map((y) => (
            <Block
              key={y}
              at={[-3, y, -3.12]}
              size={[3.4, 0.05, 0.3]}
              finish="metal"
            />
          ))}
          {Array.from({ length: 6 }, (_, i) => (
            <Cyl
              key={i}
              at={[-4.3 + i * 0.5, 2.0 + (i % 2) * 0.7, -3.1]}
              r={0.11}
              h={0.3}
              finish={i % 2 ? "glass" : "glowBright"}
              shadow={false}
            />
          ))}
        </Piece>
      </Item>
      <Item room={1} index={1}>
        <Piece start={0.46} duration={0.18} offset={[0, 0.6, 0]}>
          <Block at={[1.5, 2.1, -3.2]} size={[4.6, 2.4, 0.08]} finish="black" />
          <group position={[1.5, 2.1, -3.15]}>
            <Net />
          </group>
        </Piece>
        <Piece start={0.58} duration={0.16} offset={[0, 0.7, 0]}>
          <RobotArm at={[0.6, 0, -1.2]} />
        </Piece>
        <Piece start={0.64} duration={0.14} offset={[0.5, 0.2, 0]}>
          <Block at={[2.9, 0.4, -0.9]} size={[1.6, 0.8, 0.8]} finish="metal" />
          <Block at={[2.9, 0.82, -0.9]} size={[1.7, 0.05, 0.9]} finish="mint" />
          <Block
            at={[2.9, 1.05, -0.95]}
            size={[0.8, 0.45, 0.04]}
            finish="glowBright"
            shadow={false}
          />
        </Piece>
      </Item>
      <Item room={1} index={2}>
        <Piece start={0.7} duration={0.14} offset={[0, -0.5, 0]}>
          <Cyl at={[3.3, 0.06, 1.2]} r={1.5} h={0.12} finish="metal" />
          <mesh
            position={[3.3, 0.14, 1.2]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={1.35}
          >
            <torusGeometry args={[1, 0.03, 8, 64]} />
            <meshStandardMaterial
              color="#b6d4ca"
              emissive="#b6d4ca"
              emissiveIntensity={2}
            />
          </mesh>
        </Piece>
        <Piece start={0.76} duration={0.14} offset={[0, 0.8, 0]}>
          <Holo at={[3.3, 1.55, 1.2]} />
          <Cyl
            at={[3.3, 0.8, 1.2]}
            r={0.5}
            h={1.5}
            finish="beam"
            shadow={false}
          />
        </Piece>
        <Piece start={0.8} duration={0.14} offset={[0, 0.6, 0.3]}>
          {[-0.7, 0.7].map((dx) => (
            <group key={dx}>
              <Block
                at={[2.4 + dx * 0.4, 0.55, 2.7]}
                size={[0.06, 1.1, 0.06]}
                finish="metal"
              />
              <Block
                at={[2.4 + dx * 0.4, 1.12, 2.7]}
                size={[0.4, 0.2, 0.26]}
                finish="bone"
                rounded
              />
              <Block
                at={[2.4 + dx * 0.4, 1.12, 2.58]}
                size={[0.3, 0.12, 0.02]}
                finish="glowBright"
                shadow={false}
              />
            </group>
          ))}
        </Piece>
      </Item>
    </>
  );
}

/* ------------------------------ Room 3: Creative & social ------------------------------ */
function Keys({ at }: { at: V3 }) {
  const n = 14;
  return (
    <group position={at}>
      {Array.from({ length: n }, (_, i) => (
        <Block
          key={i}
          at={[-1.1 + i * 0.17, 0, 0]}
          size={[0.15, 0.05, 0.6]}
          finish="bone"
          shadow={false}
        />
      ))}
      {Array.from({ length: n - 1 }, (_, i) =>
        [2, 6, 9, 13].includes(i + 1) ? null : (
          <Block
            key={i}
            at={[-1.1 + i * 0.17 + 0.085, 0.05, -0.12]}
            size={[0.09, 0.05, 0.34]}
            finish="black"
            shadow={false}
          />
        ),
      )}
    </group>
  );
}
function Seat({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <Block at={[0, 0.32, 0]} size={[0.5, 0.1, 0.5]} finish="bright" rounded />
      <Block
        at={[0, 0.62, 0.22]}
        size={[0.5, 0.5, 0.08]}
        finish="bright"
        rounded
      />
      <Block at={[0, 0.14, 0]} size={[0.08, 0.28, 0.08]} finish="metal" />
    </group>
  );
}
function CreativeRoom() {
  return (
    <>
      <Shell floor="bone" wall="bright" trim="mint" />
      <Item room={2} index={0}>
        <Piece start={0.2} duration={0.15} offset={[-0.4, 0.6, 0]}>
          <Block
            at={[-3.7, 1.05, -2.2]}
            size={[1.5, 1.2, 0.06]}
            finish="bone"
          />
          {[
            [-4.1, 1.3, 0.5, 0.45, "teal"],
            [-3.6, 1.05, 0.55, 0.6, "mint"],
            [-3.3, 1.35, 0.4, 0.35, "deep"],
            [-4.0, 0.85, 0.7, 0.25, "bright"],
          ].map(([x, y, w, h, f], i) => (
            <Block
              key={i}
              at={[x as number, y as number, -2.16]}
              size={[w as number, h as number, 0.03]}
              finish={f as Finish}
              shadow={false}
            />
          ))}
          {[-0.65, 0.65].map((dx) => (
            <Block
              key={dx}
              at={[-3.7 + dx, 0.5, -2.1]}
              size={[0.06, 1.7, 0.06]}
              finish="oak"
              rotation={[0.12, 0, 0]}
            />
          ))}
          {(["teal", "mint", "bone"] as Finish[]).map((f, i) => (
            <Cyl
              key={f}
              at={[-2.7 + i * 0.3, 0.12, -1.6]}
              r={0.11}
              h={0.24}
              finish={f}
            />
          ))}
        </Piece>
        <Piece start={0.32} duration={0.16} offset={[0, 0.8, 0]}>
          <Block at={[-1.5, 0.72, -2.3]} size={[2.5, 0.06, 0.8]} finish="oak" />
          {[-1.1, 1.1].map((dx) => (
            <Block
              key={dx}
              at={[-1.5 + dx, 0.36, -2.3]}
              size={[0.06, 0.72, 0.7]}
              finish="metal"
            />
          ))}
          <Keys at={[-1.5, 0.78, -2.3]} />
        </Piece>
        <Piece start={0.42} duration={0.14} offset={[0, 0.6, 0]}>
          {[-3, 0.15].map((x) => (
            <group key={x}>
              <Block
                at={[x, 0.55, -3.0]}
                size={[0.5, 1.1, 0.4]}
                finish="deep"
                rounded
              />
              <Cyl
                at={[x, 0.78, -2.79]}
                r={0.14}
                h={0.03}
                finish="metal"
                rotation={[Math.PI / 2, 0, 0]}
              />
              <Cyl
                at={[x, 0.36, -2.79]}
                r={0.09}
                h={0.03}
                finish="metal"
                rotation={[Math.PI / 2, 0, 0]}
              />
            </group>
          ))}
        </Piece>
      </Item>
      <Item room={2} index={1}>
        <Piece start={0.46} duration={0.16} offset={[0, -0.4, -0.4]}>
          <Block at={[3.0, 0.2, -1.7]} size={[3.4, 0.4, 2.2]} finish="teal" />
          <Block
            at={[3.0, 0.42, -1.7]}
            size={[3.4, 0.04, 2.2]}
            finish="mint"
            shadow={false}
          />
        </Piece>
        <Piece start={0.56} duration={0.16} offset={[0, 0.9, 0]}>
          {[-1.45, 1.45].map((dx) => (
            <Block
              key={dx}
              at={[3.0 + dx, 1.9, -2.6]}
              size={[0.5, 3.0, 0.4]}
              finish="deep"
              rounded
            />
          ))}
          <Block at={[3.0, 3.15, -2.7]} size={[3.4, 0.4, 0.3]} finish="deep" />
          <Block
            at={[3.0, 2.0, -2.95]}
            size={[2.3, 1.5, 0.05]}
            finish="glowBright"
            shadow={false}
          />
        </Piece>
        <Piece start={0.64} duration={0.14} offset={[0, 0.8, 0]}>
          {[2.2, 3.0, 3.8].map((x) => (
            <group key={x} position={[x, 3.3, -1.5]}>
              <Cyl at={[0, 0, 0]} r={0.1} h={0.3} finish="black" />
              <Cyl
                at={[0, -1.5, 0]}
                r={0.22}
                h={3}
                finish="beam"
                shadow={false}
              />
            </group>
          ))}
        </Piece>
        <Piece start={0.7} duration={0.14} offset={[0, 0.5, 0.3]}>
          {[0, 1].flatMap((row) =>
            [2.0, 2.7, 3.4, 4.1].map((x) => (
              <Seat key={`${row}${x}`} x={x} z={0.3 + row * 0.9} />
            )),
          )}
        </Piece>
      </Item>
      <Item room={2} index={2}>
        <Piece start={0.72} duration={0.15} offset={[-0.4, 0.6, 0]}>
          <Block
            at={[-3.6, 0.28, 2.3]}
            size={[2.1, 0.5, 0.9]}
            finish="mint"
            rounded
          />
          <Block
            at={[-3.6, 0.7, 2.6]}
            size={[2.1, 0.5, 0.25]}
            finish="mint"
            rounded
          />
          <Block
            at={[-4.6, 0.28, 1.2]}
            size={[0.9, 0.5, 2.3]}
            finish="mint"
            rounded
          />
          {(["teal", "deep", "bone"] as Finish[]).map((f, i) => (
            <Cyl
              key={f}
              at={[-2.2 + i * 0.7, 0.2, 2.9 - (i % 2) * 0.5]}
              r={0.32}
              h={0.36}
              finish={f}
            />
          ))}
        </Piece>
        <Piece start={0.8} duration={0.15} offset={[0, 0.8, 0]}>
          <Block at={[0.9, 0.78, 2.0]} size={[2.2, 0.06, 1.2]} finish="teal" />
          <Block
            at={[0.9, 0.8, 2.0]}
            size={[0.02, 0.01, 1.2]}
            finish="bone"
            shadow={false}
          />
          <Block
            at={[0.9, 0.96, 2.0]}
            size={[0.03, 0.3, 1.3]}
            finish="bone"
            shadow={false}
          />
          {[-0.95, 0.95].flatMap((dx) =>
            [-0.5, 0.5].map((dz) => (
              <Block
                key={`${dx}${dz}`}
                at={[0.9 + dx, 0.38, 2.0 + dz]}
                size={[0.06, 0.76, 0.06]}
                finish="metal"
              />
            )),
          )}
          <Ball at={[1.2, 0.9, 1.9]} r={0.05} finish="bone" />
        </Piece>
        <Piece start={0.86} duration={0.12} offset={[0, 0.5, 0]}>
          {[-2.6, 3.6].map((x, i) => (
            <group key={x} position={[x, 0, i ? 3.0 : 0.4]}>
              <Cyl at={[0, 0.2, 0]} r={0.2} h={0.4} finish="bone" />
              <Ball at={[0, 0.65, 0]} r={0.3} finish="plant" />
              <Ball at={[0.16, 0.95, 0.05]} r={0.2} finish="plant" />
            </group>
          ))}
        </Piece>
      </Item>
    </>
  );
}

function Room({ k, children }: { k: number; children: ReactNode }) {
  const g = useRef<Group>(null);
  const live = useContext(LiveCtx);
  const time = useRef(0);
  useFrame((_, dt) => {
    const near = Math.abs(live.current.fb - k);
    if (g.current) g.current.visible = near < 1.3;
    const target = near < 0.55 ? 1 : 0;
    time.current +=
      (target - time.current) * (1 - Math.exp(-Math.min(dt, 0.06) * 2.6));
  });
  return (
    <group ref={g} position={[k * GAP, 0, 0]}>
      <Time.Provider value={time}>{children}</Time.Provider>
    </group>
  );
}

function Rig({ small }: { small: boolean }) {
  const { camera, size, pointer } = useThree();
  const live = useContext(LiveCtx);
  const sun = useRef<DirectionalLight>(null);
  const amb = useRef<HemisphereLight>(null);
  const tech = useRef<PointLight>(null);
  const cam = useRef({ x: 0, z: 0, zoom: 1 });
  // The canvas itself is placed beside the text column (see .spx-3d), so the room fills it.
  const base = useMemo(
    () => Math.min((size.width * 0.92) / 12.4, (size.height * 0.94) / 6.8),
    [size, small],
  );
  useFrame((_, dt) => {
    const l = live.current;
    const a = Math.floor(l.fb);
    const b = Math.min(2, a + 1);
    const m = l.fb - a;
    const f = (room: number) => FOCUS[room][room === l.ch ? l.item + 1 : 0];
    const fa = f(a);
    const fb = FOCUS[b][0];
    const tx = a * GAP + lerp(fa.x, b * GAP - a * GAP + fb.x, m);
    const tz = lerp(fa.z, fb.z, m);
    const tz2 = lerp(fa.zoom, fb.zoom, m);
    const k = 1 - Math.exp(-dt * 3.2);
    cam.current.x += (tx - cam.current.x) * k;
    cam.current.z += (tz - cam.current.z) * k;
    cam.current.zoom += (tz2 - cam.current.zoom) * k;
    const view = camera as OrthographicCamera;
    const px = small ? 0 : pointer.x * 0.9;
    const py = small ? 0 : pointer.y * 0.5;
    view.position.set(cam.current.x + 6 + px, 5.1 + py, cam.current.z + 13);
    view.lookAt(cam.current.x, 1.35, cam.current.z);
    view.zoom = base * cam.current.zoom;
    view.updateProjectionMatrix();
    if (sun.current) {
      sun.current.position.set(cam.current.x - 3, 8, cam.current.z + 6);
      sun.current.target.position.set(cam.current.x, 0, cam.current.z);
      sun.current.target.updateMatrixWorld();
    }
    // Technology reads as night: dim the daylight, let the room's own lights carry it.
    const night = clamp(1 - Math.abs(l.fb - 1) * 1.6);
    if (amb.current) amb.current.intensity = lerp(1.7, 0.45, night);
    if (sun.current) sun.current.intensity = lerp(3, 0.9, night);
    if (tech.current) {
      tech.current.intensity = night * 55;
      tech.current.position.set(GAP + 0.5, 3.2, 0.5);
    }
  });
  return (
    <>
      <hemisphereLight ref={amb} args={["#fff3d9", "#43655d", 1.7]} />
      <ambientLight intensity={0.55} />
      <directionalLight
        ref={sun}
        intensity={3}
        color="#ffedcf"
        castShadow={!small}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-normalBias={0.04}
      />
      <pointLight ref={tech} color="#b6d4ca" distance={18} decay={1.6} />
    </>
  );
}

function Scene({ live, small, onFailure }: Omit<Props, "running">) {
  const mats = useMemo(() => makeMaterials(), []);
  const { gl } = useThree();
  useEffect(() => {
    const lost = (e: Event) => {
      e.preventDefault();
      onFailure();
    };
    const el = gl.domElement;
    el.addEventListener("webglcontextlost", lost);
    return () => el.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(
    () => () => {
      Object.values(mats.geo).forEach((g) => g.dispose());
      Object.entries(mats).forEach(([key, value]) => {
        if (key !== "geo") (value as MeshStandardMaterial).dispose();
      });
    },
    [mats],
  );
  return (
    <LiveCtx.Provider value={live}>
      <Materials.Provider value={mats}>
        <Rig small={small} />
        <Room k={0}>
          <LearningRoom />
        </Room>
        <Room k={1}>
          <TechRoom />
        </Room>
        <Room k={2}>
          <CreativeRoom />
        </Room>
      </Materials.Provider>
    </LiveCtx.Provider>
  );
}

export default function SpacesRooms(props: Props) {
  return (
    <Canvas
      orthographic
      camera={{ position: [6, 5.1, 13], zoom: 60, near: 0.1, far: 80 }}
      shadows={!props.small}
      dpr={props.small ? 1 : [1, 1.5]}
      frameloop={props.running ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Scene
        live={props.live}
        small={props.small}
        onFailure={props.onFailure}
      />
    </Canvas>
  );
}
