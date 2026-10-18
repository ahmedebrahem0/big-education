"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  MeshStandardMaterial,
  Shape,
  SRGBColorSpace,
  type Group,
  type OrthographicCamera,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

type V3 = [number, number, number];
type Props = {
  progress: RefObject<number>;
  running: boolean;
  complete: boolean;
  onFailure: () => void;
};
const Time = createContext<RefObject<number>>({ current: 0 });
const clamp = (n: number) => Math.max(0, Math.min(1, n));

// All chairs share their manufactured geometry and finishes.
function resources() {
  const profile = new Shape();
  profile.moveTo(-0.34, 0);
  profile.lineTo(0.19, 0);
  profile.quadraticCurveTo(0.36, 0, 0.38, 0.17);
  profile.lineTo(0.45, 0.7);
  profile.lineTo(0.4, 0.7);
  profile.lineTo(0.33, 0.18);
  profile.quadraticCurveTo(0.31, 0.05, 0.19, 0.05);
  profile.lineTo(-0.34, 0.05);
  profile.closePath();
  const shell = new ExtrudeGeometry(profile, {
    depth: 0.64,
    bevelEnabled: true,
    bevelSize: 0.015,
    bevelThickness: 0.015,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 12,
  });
  return {
    box: new BoxGeometry(1, 1, 1),
    round: new RoundedBoxGeometry(1, 1, 1, 3, 0.12),
    shell,
    cylinder: new CylinderGeometry(1, 1, 1, 12),
    oak: new MeshStandardMaterial({ color: "#cda16e", roughness: 0.55 }),
    edge: new MeshStandardMaterial({ color: "#e6c498", roughness: 0.52 }),
    black: new MeshStandardMaterial({ color: "#202a29", roughness: 0.85 }),
    metal: new MeshStandardMaterial({
      color: "#303c3a",
      roughness: 0.3,
      metalness: 0.75,
    }),
    teal: new MeshStandardMaterial({ color: "#075650", roughness: 0.8 }),
    ivory: new MeshStandardMaterial({ color: "#eee4cf", roughness: 0.8 }),
    green: new MeshStandardMaterial({ color: "#567747", roughness: 0.9 }),
    light: new MeshStandardMaterial({
      color: "#fff2ce",
      emissive: "#ffdca0",
      emissiveIntensity: 2,
    }),
  };
}
type Resources = ReturnType<typeof resources>;
const Materials = createContext<Resources | null>(null);
function Block({
  at = [0, 0, 0],
  size,
  finish = "oak",
  rounded = false,
  rotation = [0, 0, 0],
  castShadow = true,
}: {
  at?: V3;
  size: V3;
  finish?:
    "oak" | "edge" | "black" | "metal" | "teal" | "ivory" | "green" | "light";
  rounded?: boolean;
  rotation?: V3;
  castShadow?: boolean;
}) {
  const r = useContext(Materials)!;
  return (
    <mesh
      position={at}
      scale={size}
      rotation={rotation}
      geometry={rounded ? r.round : r.box}
      material={r[finish]}
      castShadow={castShadow}
      receiveShadow
    />
  );
}
function Piece({
  start,
  duration = 0.15,
  offset = [0, 0.5, 0],
  twist = 0.06,
  children,
}: {
  start: number;
  duration?: number;
  offset?: V3;
  twist?: number;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const time = useContext(Time);
  useFrame(() => {
    if (!group.current) return;
    const t = clamp((time.current - start) / duration);
    const eased = t * t * (3 - 2 * t);
    group.current.visible = t > 0.002;
    group.current.position.set(
      offset[0] * (1 - eased),
      offset[1] * (1 - eased),
      offset[2] * (1 - eased),
    );
    group.current.rotation.y = twist * (1 - eased);
    group.current.scale.setScalar(0.88 + 0.12 * eased);
  });
  return (
    <group ref={group} visible={false}>
      {children}
    </group>
  );
}
function Chair({ x, z, index }: { x: number; z: number; index: number }) {
  const r = useContext(Materials)!;
  const delay = index * 0.005;
  return (
    <group position={[x, 0.08, z]} rotation={[0, -0.18, 0]}>
      <Piece start={0.015 + delay} duration={0.1} offset={[0, 0.12, 0.08]}>
        {[-0.31, 0.31].map((x) => (
          <Block
            key={x}
            at={[x, 0.025, 0.02]}
            size={[0.1, 0.06, 0.79]}
            finish="black"
            rounded
          />
        ))}
      </Piece>
      <Piece start={0.12 + delay} offset={[0, 0.3, -0.12]}>
        {[-0.29, 0.29].map((x) => (
          <group key={x}>
            <Block
              at={[x, 0.075, 0]}
              size={[0.045, 0.045, 0.72]}
              finish="metal"
              rounded
            />
            <Block
              at={[x, 0.36, -0.33]}
              size={[0.045, 0.58, 0.045]}
              finish="metal"
              rotation={[0.1, 0, 0]}
              rounded
            />
            <Block
              at={[x, 0.65, 0]}
              size={[0.045, 0.045, 0.7]}
              finish="metal"
              rounded
            />
          </group>
        ))}
        <Block at={[0, 0.63, -0.27]} size={[0.59, 0.04, 0.04]} finish="metal" />
      </Piece>
      <Piece start={0.26 + delay} offset={[0, 0.45, 0.12]}>
        <mesh
          position={[0.32, 0.65, 0]}
          rotation={[0, -Math.PI / 2, 0]}
          geometry={r.shell}
          material={r.edge}
          castShadow
          receiveShadow
        />
      </Piece>
      <Piece start={0.32 + delay} offset={[0, 0.3, 0]}>
        <Block
          at={[0, 0.73, -0.035]}
          size={[0.62, 0.095, 0.59]}
          finish="black"
          rounded
        />
      </Piece>
      <Piece start={0.38 + delay} offset={[0.22, 0.1, 0]}>
        <Block
          at={[-0.38, 0.89, 0.05]}
          size={[0.045, 0.52, 0.045]}
          finish="metal"
        />
        <Block
          at={[-0.25, 1.13, -0.1]}
          size={[0.3, 0.045, 0.045]}
          finish="metal"
        />
      </Piece>
      <Piece start={0.43 + delay} offset={[0, 0.27, -0.13]}>
        <Block
          at={[-0.15, 1.17, -0.23]}
          size={[0.73, 0.045, 0.43]}
          finish="black"
          rounded
        />
      </Piece>
    </group>
  );
}

function Signage() {
  const [texture, setTexture] = useState<CanvasTexture | null>(null);
  useEffect(() => {
    let disposed = false;
    let result: CanvasTexture | undefined;
    const image = new Image();
    image.onload = () => {
      if (disposed) return;
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 420;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = "brightness(0) invert(1)";
      ctx.drawImage(image, 262, 0, 500, 252);
      ctx.filter = "none";
      ctx.fillStyle = "#f3efdf";
      ctx.textAlign = "center";
      ctx.font = "600 39px sans-serif";
      ctx.fillText("WE BUILD EDUCATION..", 512, 306);
      ctx.font = "24px sans-serif";
      ctx.fillText("WHERE THE WORLD NEEDS IT MOST", 512, 352);
      result = new CanvasTexture(canvas);
      result.colorSpace = SRGBColorSpace;
      setTexture(result);
    };
    image.src = "/brand/logo.svg";
    return () => {
      disposed = true;
      result?.dispose();
    };
  }, []);
  return texture ? (
    <mesh position={[0.1, 2.45, -2.95]}>
      <planeGeometry args={[4.5, 1.85]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  ) : null;
}

function RoomContents() {
  const r = useContext(Materials)!;
  return (
    <group>
      <Block at={[0, -0.08, 0]} size={[11.4, 0.16, 6.6]} finish="oak" />
      {Array.from({ length: 22 }, (_, i) => (
        <Block
          key={i}
          at={[-5.48 + i * 0.52, 0.006, 0]}
          size={[0.012, 0.006, 6.5]}
          finish="edge"
        />
      ))}
      <Block at={[0, -0.02, 3.3]} size={[11.4, 0.09, 0.035]} finish="light" />
      {Array.from({ length: 12 }, (_, index) => (
        <Chair
          key={index}
          index={index}
          x={-1.9 + (index % 4) * 1.6}
          z={-1.55 + Math.floor(index / 4) * 1.7}
        />
      ))}
      <group position={[-4.1, 0, 0.15]}>
        <Piece start={0.52} offset={[-0.4, 0.2, 0]}>
          <Block at={[-0.85, 0.62, 0]} size={[0.1, 1.24, 1]} />
          <Block at={[0.85, 0.62, 0]} size={[0.1, 1.24, 1]} />
        </Piece>
        <Piece start={0.56} offset={[0, 0.2, 0.4]}>
          <Block at={[0, 0.64, 0.36]} size={[1.65, 1.07, 0.08]} finish="teal" />
        </Piece>
        <Piece start={0.59} offset={[0, 0.6, 0]}>
          <Block at={[0, 1.28, 0]} size={[2.05, 0.09, 1.18]} finish="edge" />
        </Piece>
        <Piece start={0.7} offset={[0, 0.25, 0]}>
          <Block at={[0, 1.35, 0]} size={[0.6, 0.035, 0.4]} finish="metal" />
          <Block
            at={[0, 1.55, -0.19]}
            size={[0.6, 0.4, 0.025]}
            finish="black"
            rotation={[-0.15, 0, 0]}
          />
        </Piece>
      </group>
      <group position={[4.55, 0, -2.45]}>
        <Piece start={0.55} offset={[0.3, 0.15, 0]}>
          {[-0.72, 0, 0.72].map((x) => (
            <Block key={x} at={[x, 0.97, 0]} size={[0.065, 1.94, 0.72]} />
          ))}
        </Piece>
        <Piece start={0.6} offset={[0, 0.35, 0]}>
          {[0.1, 0.95, 1.5, 1.94].map((y) => (
            <Block key={y} at={[0, y, 0]} size={[1.5, 0.06, 0.76]} />
          ))}
        </Piece>
        <Piece start={0.66} offset={[0, 0.12, 0.45]}>
          {[-0.36, 0.36].map((x) => (
            <group key={x}>
              <Block
                at={[x, 0.52, 0.39]}
                size={[0.65, 0.8, 0.04]}
                finish={x < 0 ? "teal" : "edge"}
              />
              <Block
                at={[x + 0.2, 0.62, 0.43]}
                size={[0.025, 0.18, 0.025]}
                finish="metal"
              />
            </group>
          ))}
        </Piece>
        <Piece start={0.73}>
          {Array.from({ length: 7 }, (_, i) => (
            <Block
              key={i}
              at={[-0.52 + i * 0.09, 1.19, 0.06]}
              size={[0.06, 0.38 + (i % 3) * 0.03, 0.31]}
              finish={i % 2 ? "ivory" : "teal"}
            />
          ))}
          <Block
            at={[0.35, 2.1, 0]}
            size={[0.25, 0.28, 0.25]}
            finish="ivory"
            rounded
          />
          {[-0.2, 0, 0.2].map((angle) => (
            <Block
              key={angle}
              at={[0.35 + angle / 2, 2.38, 0]}
              size={[0.07, 0.42, 0.1]}
              finish="green"
              rotation={[0, 0, angle * 2]}
              rounded
            />
          ))}
        </Piece>
      </group>
      <Piece start={0.7} duration={0.18} offset={[0, -0.7, -0.12]} twist={0}>
        <Block at={[0, 1.95, -3.07]} size={[11.4, 3.9, 0.15]} finish="teal" />
        <Block at={[-5.65, 1.95, -1.4]} size={[0.12, 3.9, 3.4]} finish="teal" />
        <Block at={[5.65, 0.14, -1.4]} size={[0.12, 0.28, 3.4]} finish="teal" />
        <Block at={[0, 0.11, -2.95]} size={[11.3, 0.2, 0.08]} finish="edge" />
        <Signage />
      </Piece>
      {Array.from({ length: 12 }, (_, i) => (
        <Piece
          key={i}
          start={0.73 + i * 0.005}
          duration={0.12}
          offset={[0, 0.5, 0]}
          twist={0}
        >
          <Block
            at={[-5.35 + i * 0.13, 1.95, -2.88]}
            size={[0.065, 3.85, 0.18]}
            finish="edge"
          />
        </Piece>
      ))}
      <Piece start={0.79} duration={0.12} offset={[0, 0.25, 0]} twist={0}>
        <Block
          at={[0, 3.85, -1.75]}
          size={[10.6, 0.055, 0.065]}
          finish="metal"
          castShadow={false}
        />
        {[-4.7, -3.1, -1.55, 0, 1.55, 3.1, 4.7].map((x) => (
          <group key={x} position={[x, 3.7, -1.75]}>
            <mesh
              geometry={r.cylinder}
              material={r.black}
              scale={[0.065, 0.24, 0.065]}
              rotation={[0.25, 0, 0]}
            />
            <Block
              at={[0, -0.12, -0.03]}
              size={[0.085, 0.02, 0.085]}
              finish="light"
              castShadow={false}
            />
          </group>
        ))}
        <Block
          at={[-4.85, 2.25, -2.73]}
          size={[1.03, 0.75, 0.06]}
          finish="black"
        />
        <Block
          at={[-4.85, 2.25, -2.69]}
          size={[0.94, 0.65, 0.02]}
          finish="teal"
        />
        <group position={[5.12, 0, -0.75]} rotation={[0, -0.35, 0]}>
          {[-0.23, 0.23].map((x) => (
            <Block
              key={x}
              at={[x, 0.85, 0]}
              size={[0.035, 1.7, 0.035]}
              finish="metal"
              rotation={[0.1, 0, 0]}
            />
          ))}
          {[0.4, 0.85, 1.3].map((y) => (
            <group key={y}>
              <Block
                at={[0, y, 0.06]}
                size={[0.55, 0.3, 0.05]}
                finish="black"
              />
              <Block
                at={[0, y + 0.04, 0.1]}
                size={[0.4, 0.29, 0.015]}
                finish="ivory"
              />
              <Block
                at={[0, y + 0.1, 0.115]}
                size={[0.32, 0.07, 0.01]}
                finish="teal"
              />
            </group>
          ))}
        </group>
      </Piece>
    </group>
  );
}

function Scene({ progress, complete, onFailure }: Omit<Props, "running">) {
  const time = useRef(complete ? 1 : progress.current);
  const r = useMemo(() => resources(), []);
  const { camera, size, gl } = useThree();
  useEffect(() => {
    const view = camera as OrthographicCamera;
    view.position.set(6, 5.1, 13);
    view.lookAt(0, 1.55, 0);
    // Three cameras are imperative scene objects; resize updates their projection.
    // eslint-disable-next-line react-hooks/immutability
    view.zoom = Math.min(size.width / 13.3, size.height / 7.4);
    view.updateProjectionMatrix();
  }, [camera, size]);
  useEffect(() => {
    const lost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", lost);
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onFailure]);
  useEffect(
    () => () => {
      Object.values(r).forEach((resource) => resource.dispose());
    },
    [r],
  );
  useFrame((_, delta) => {
    const target = complete ? 1 : progress.current;
    time.current +=
      (target - time.current) * (1 - Math.exp(-Math.min(delta, 0.06) * 9));
  }, -1);
  return (
    <Time.Provider value={time}>
      <Materials.Provider value={r}>
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#fff3d9", "#43655d", 1.6]} />
        <directionalLight
          position={[-3, 8, 6]}
          intensity={3}
          color="#ffedcf"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-8}
          shadow-camera-right={8}
          shadow-camera-top={7}
          shadow-camera-bottom={-7}
          shadow-normalBias={0.04}
        />
        <directionalLight
          position={[5, 4, -1]}
          intensity={1.4}
          color="#a5d8d1"
        />
        <RoomContents />
      </Materials.Provider>
    </Time.Provider>
  );
}

export default function AssemblyRoom(props: Props) {
  return (
    <Canvas
      orthographic
      camera={{ position: [6, 5.1, 13], zoom: 65, near: 0.1, far: 60 }}
      shadows
      dpr={[1, 1.5]}
      frameloop={props.running ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <Scene
        progress={props.progress}
        complete={props.complete}
        onFailure={props.onFailure}
      />
    </Canvas>
  );
}
