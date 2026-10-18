"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Edges } from "@react-three/drei";
import {
  Component,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CanvasTexture,
  SRGBColorSpace,
  type Group,
  type MeshStandardMaterial,
  type OrthographicCamera,
  type Texture,
} from "three";
import { RoomStatic as StaticRoom } from "./room-static";

type V3 = [number, number, number];
const Stage = createContext({ active: 0, reduced: false });
const oak = "#ddbd86";
const ink = "#202725";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error) {
    console.error("BIG room renderer:", error);
  }
  render() {
    return this.state.failed ? <StaticRoom /> : this.props.children;
  }
}

// One persistent assembly: stages change finishes and offsets, never the subject.
function Part({
  children,
  at = [0, 0, 0],
  explode = [0, 0, 0],
  wall = false,
}: {
  children: ReactNode;
  at?: V3;
  explode?: V3;
  wall?: boolean;
}) {
  const ref = useRef<Group>(null);
  const { active, reduced } = useContext(Stage);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 6);
    const spread = active === 2 ? 1 : 0;
    ref.current.position.x +=
      (at[0] + explode[0] * spread - ref.current.position.x) * ease;
    ref.current.position.y +=
      (at[1] + explode[1] * spread - ref.current.position.y) * ease;
    ref.current.position.z +=
      (at[2] + explode[2] * spread - ref.current.position.z) * ease;
    ref.current.scale.y +=
      ((wall && active === 0 ? 0.84 : 1) - ref.current.scale.y) * ease;
  });
  return (
    <group ref={ref} position={at}>
      {children}
    </group>
  );
}

function Finish({
  color,
  map,
  architectural = false,
  luminous = false,
}: {
  color: string;
  map?: Texture | null;
  architectural?: boolean;
  luminous?: boolean;
}) {
  const ref = useRef<MeshStandardMaterial>(null);
  const { active, reduced } = useContext(Stage);
  useFrame((_, delta) => {
    if (!ref.current) return;
    const ease = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 6);
    const opacity = architectural
      ? active === 0
        ? 0.35
        : active === 1
          ? 0.58
          : 1
      : 1;
    ref.current.opacity += (opacity - ref.current.opacity) * ease;
    ref.current.emissiveIntensity +=
      ((luminous && active === 4 ? 0.8 : 0) - ref.current.emissiveIntensity) *
      ease;
  });
  return (
    <meshStandardMaterial
      ref={ref}
      onUpdate={(material) => {
        material.needsUpdate = true;
      }}
      color={color}
      map={map}
      transparent={architectural}
      roughness={0.78}
      metalness={0.04}
      emissive={luminous ? "#a7e5d4" : "#000000"}
      emissiveIntensity={0}
    />
  );
}

function Box({
  at,
  size,
  color = oak,
  map,
  outline = false,
  architectural = false,
  rotation,
}: {
  at: V3;
  size: V3;
  color?: string;
  map?: Texture | null;
  outline?: boolean;
  architectural?: boolean;
  rotation?: V3;
}) {
  return (
    <mesh position={at} rotation={rotation}>
      <boxGeometry args={size} />
      <Finish color={color} map={map} architectural={architectural} />
      {outline && (
        <Edges threshold={20} color="#c7dcc8" transparent opacity={0.32} />
      )}
    </mesh>
  );
}

function useRoomTextures() {
  const [textures, setTextures] = useState<{
    wood: Texture;
    slogan: Texture;
    logo: Texture;
    screen: Texture;
  } | null>(null);
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let cancelled = false;
    const owned: Texture[] = [];
    function canvasTexture(
      width: number,
      height: number,
      draw: (ctx: CanvasRenderingContext2D) => void,
    ) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      draw(ctx);
      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.anisotropy = 4;
      owned.push(texture);
      return texture;
    }
    const wood = canvasTexture(1024, 256, (ctx) => {
      ctx.fillStyle = "#e5c998";
      ctx.fillRect(0, 0, 1024, 256);
      for (let i = 0; i < 420; i++) {
        const y = (i * 19.37) % 256;
        ctx.strokeStyle = i % 3 ? "#97713b25" : "#fff7d34a";
        ctx.lineWidth = i % 4 === 0 ? 1.7 : 0.6;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= 1024; x += 32)
          ctx.lineTo(x, y + Math.sin(x * 0.014 + i) * (1 + (i % 3)));
        ctx.stroke();
      }
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = "#755b3530";
        ctx.fillRect(0, i * 32, 1024, 1);
        ctx.fillRect((i * 317) % 1024, i * 32, 1, 32);
      }
    });
    const slogan = canvasTexture(1536, 256, (ctx) => {
      ctx.fillStyle = "#f5f4e9";
      ctx.font = "bold 83px sans-serif";
      ctx.fillText("WE BUILD EDUCATION..", 8, 105);
      ctx.font = "44px sans-serif";
      ctx.fillText("WHERE THE WORLD NEEDS IT MOST", 8, 174);
    });
    const screen = canvasTexture(1024, 576, (ctx) => {
      ctx.fillStyle = "#163e43";
      ctx.fillRect(0, 0, 1024, 576);
      ctx.fillStyle = "#307d79";
      for (let i = 0; i < 6; i++)
        ctx.fillRect(55 + i * 162, 55, 110, 310 - i * 30);
      ctx.fillStyle = "#e8e9d8";
      ctx.font = "bold 58px sans-serif";
      ctx.fillText("A SPACE TO LEARN.", 55, 450);
      ctx.font = "24px sans-serif";
      ctx.fillText("BIG EDUCATION", 58, 502);
    });
    const logo = canvasTexture(1200, 600, () => {});
    const image = new Image();
    const publish = () => {
      if (!cancelled) {
        setTextures({ wood, slogan, logo, screen });
        invalidate();
      }
    };
    image.onload = () => {
      if (cancelled) return;
      const ctx = (logo.image as HTMLCanvasElement).getContext("2d")!;
      ctx.drawImage(image, 0, 0, 1200, 600);
      ctx.globalCompositeOperation = "source-in";
      ctx.fillStyle = "#f8f5e7";
      ctx.fillRect(0, 0, 1200, 600);
      logo.needsUpdate = true;
      publish();
    };
    image.onerror = publish;
    image.src = "/brand/logo.svg";
    return () => {
      cancelled = true;
      image.onload = null;
      image.onerror = null;
      owned.forEach((texture) => texture.dispose());
    };
  }, [invalidate]);
  return textures;
}

function Decal({
  at,
  size,
  map,
  rotation,
}: {
  at: V3;
  size: [number, number];
  map?: Texture;
  rotation?: V3;
}) {
  if (!map) return null;
  return (
    <mesh position={at} rotation={rotation} renderOrder={3}>
      <planeGeometry args={size} />
      <meshBasicMaterial
        map={map}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}

function Stool({ at, angle, index }: { at: V3; angle: number; index: number }) {
  return (
    <Part
      at={at}
      explode={[(index % 2 ? 1 : -1) * 0.16, 0.1 + index * 0.06, 0.24]}
    >
      <group rotation={[0, angle, 0]}>
        <mesh position={[0, 0.98, 0]}>
          <cylinderGeometry args={[0.245, 0.23, 0.07, 32]} />
          <Finish color={oak} />
        </mesh>
        <Box
          at={[0, 1.14, -0.17]}
          size={[0.43, 0.28, 0.055]}
          color={ink}
          rotation={[-0.18, 0, 0]}
        />
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Box
              key={`${x}:${z}`}
              at={[x * 0.18, 0.49, z * 0.18]}
              size={[0.038, 0.95, 0.038]}
              color={ink}
              rotation={[z * -0.1, 0, x * 0.1]}
            />
          )),
        )}
        <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.24, 0.015, 6, 32]} />
          <Finish color={ink} />
        </mesh>
      </group>
    </Part>
  );
}

function Room() {
  const textures = useRoomTextures();
  const { active, reduced } = useContext(Stage);
  const root = useRef<Group>(null);
  const screen = useRef<MeshStandardMaterial>(null);
  useFrame((state, delta) => {
    const ease = reduced ? 1 : 1 - Math.exp(-Math.min(delta, 0.05) * 4);
    if (root.current) {
      root.current.rotation.y +=
        ((reduced ? 0 : state.pointer.x * 0.045) - root.current.rotation.y) *
        ease;
      root.current.rotation.x +=
        ((reduced ? 0 : state.pointer.y * -0.018) - root.current.rotation.x) *
        ease;
    }
    if (screen.current)
      screen.current.opacity +=
        ((active === 4 ? 1 : 0) - screen.current.opacity) * ease;
  });
  return (
    <group ref={root} position={[0, -1.6, 0]}>
      <Part explode={[0, -0.18, 0]}>
        <Box
          at={[0, -0.11, 0]}
          size={[8.1, 0.18, 3.9]}
          color="#535e8d"
          outline
        />
        <Part explode={[0, 0.28, 0]}>
          <Box
            at={[0, 0, 0]}
            size={[8.1, 0.12, 3.9]}
            color={textures ? "#ffffff" : oak}
            map={textures?.wood}
            outline
          />
        </Part>
      </Part>
      <Part explode={[0, 0.4, -0.5]} wall>
        <Part explode={[0, 0, -0.18]}>
          <Box
            at={[0, 1.85, -1.99]}
            size={[8.1, 3.7, 0.04]}
            color={oak}
            architectural
          />
        </Part>
        <Box
          at={[0, 1.85, -1.9]}
          size={[8.1, 3.7, 0.13]}
          color="#2b7b79"
          architectural
          outline
        />
        <Box at={[0, 3.72, -1.9]} size={[8.14, 0.045, 0.17]} />
        <Box at={[4.04, 1.85, -1.9]} size={[0.06, 3.7, 0.18]} />
        <Decal
          at={[-0.95, 2.91, -1.826]}
          size={[2.45, 1.23]}
          map={textures?.logo}
        />
        <Decal
          at={[0.75, 0.87, -1.82]}
          size={[4.8, 0.8]}
          map={textures?.slogan}
        />
        <Part at={[1.65, 2.05, -1.76]} explode={[0.1, 0.08, 0.28]}>
          <Box at={[0, 0, 0]} size={[2.12, 1.22, 0.095]} color="#111c1d" />
          <Box at={[0, 0, 0.054]} size={[2.02, 1.12, 0.012]} color="#414746" />
          <mesh position={[0, 0, 0.064]}>
            <planeGeometry args={[2.02, 1.12]} />
            <meshStandardMaterial
              ref={screen}
              onUpdate={(material) => {
                material.needsUpdate = true;
              }}
              map={textures?.screen}
              emissiveMap={textures?.screen}
              emissive="#ffffff"
              emissiveIntensity={0.7}
              transparent
              opacity={0}
            />
          </mesh>
          <mesh position={[0.91, -0.57, 0.068]}>
            <sphereGeometry args={[0.014, 8, 8]} />
            <Finish color="#94b8a0" luminous />
          </mesh>
        </Part>
        {[-0.2, 1.05, 2.3, 3.5].map((x) => (
          <Lamp key={x} at={[x, 3.57, -1.71]} />
        ))}
      </Part>
      <Part explode={[-0.4, 0.4, 0]} wall>
        <Box
          at={[-4, 1.85, 0]}
          size={[0.12, 3.7, 3.8]}
          color="#205e5b"
          architectural
          outline
        />
        <Box at={[-4, 3.72, 0]} size={[0.17, 0.045, 3.85]} />
        <Box at={[-4, 1.85, 1.9]} size={[0.17, 3.7, 0.065]} />
        <Decal
          at={[-3.932, 2.91, 0.38]}
          size={[2.4, 1.2]}
          map={textures?.logo}
          rotation={[0, Math.PI / 2, 0]}
        />
        <Decal
          at={[-3.93, 0.84, 0.2]}
          size={[3.1, 0.52]}
          map={textures?.slogan}
          rotation={[0, Math.PI / 2, 0]}
        />
        {[-0.7, 0.9].map((z) => (
          <group
            key={z}
            position={[-3.84, 3.57, z]}
            rotation={[0, Math.PI / 2, 0]}
          >
            <Lamp at={[0, 0, 0]} />
          </group>
        ))}
      </Part>
      {Array.from({ length: 10 }, (_, i) => (
        <Part
          key={i}
          at={[-3.84 + i * 0.168, 0, -1.76]}
          explode={[0, 0.28 + (i % 3) * 0.09, 0.45 + i * 0.018]}
        >
          <Box
            at={[0, 1.86, 0]}
            size={[0.076, 3.68, 0.095]}
            color="#f4dbac"
            map={textures?.wood}
          />
        </Part>
      ))}
      <Part at={[-2.55, 0, -0.15]} explode={[0, 0, 0.16]}>
        <Part explode={[0, 0.43, 0]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 0.075, 64]} />
            <Finish color="#302e27" />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.025, 48]} />
            <Finish color={oak} />
          </mesh>
        </Part>
        {[-1, 1].flatMap((x) =>
          [-1, 1].map((z) => (
            <Box
              key={`${x}:${z}`}
              at={[x * 0.19, 0.74, z * 0.19]}
              size={[0.045, 1.44, 0.045]}
              rotation={[-z * 0.12, 0, x * 0.12]}
              color={oak}
            />
          )),
        )}
        <mesh position={[0, 0.46, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.018, 8, 40]} />
          <Finish color={ink} />
        </mesh>
      </Part>
      <Stool at={[-3.32, 0.07, 0.35]} angle={-0.6} index={0} />
      <Stool at={[-2.8, 0.07, -0.9]} angle={0.3} index={1} />
      <Stool at={[-2.05, 0.07, 0.77]} angle={-0.3} index={2} />
      <Stool at={[-1.48, 0.07, -0.05]} angle={0.5} index={3} />
      <Part at={[3.48, 0.07, -1.05]} explode={[0.2, 0.12, 0.32]}>
        <Box at={[0, 0.025, 0]} size={[0.57, 0.05, 0.5]} color={ink} />
        <Box
          at={[0, 1.03, -0.1]}
          size={[0.045, 2.05, 0.04]}
          color={ink}
          rotation={[-0.13, 0, 0]}
        />
        {[0, 1, 2, 3].map((i) => (
          <group
            key={i}
            position={[0, 0.3 + i * 0.49, -i * 0.06]}
            rotation={[-0.13, 0, 0]}
          >
            <Box
              at={[0, 0, 0]}
              size={[0.4, 0.44, 0.03]}
              color={i % 2 ? "#ede8d8" : "#83b4a4"}
            />
            <Decal
              at={[0, 0.07, 0.02]}
              size={[0.38, 0.19]}
              map={textures?.logo}
            />
            {[0, 1, 2].map((line) => (
              <Box
                key={line}
                at={[0, -0.07 - line * 0.04, 0.02]}
                size={[0.26 - line * 0.04, 0.012, 0.006]}
                color="#346d68"
              />
            ))}
            <Box at={[0, -0.22, 0.035]} size={[0.43, 0.025, 0.1]} color={ink} />
          </group>
        ))}
      </Part>
    </group>
  );
}

function Lamp({ at }: { at: V3 }) {
  return (
    <group position={at}>
      <Box at={[0, 0.07, -0.02]} size={[0.18, 0.025, 0.12]} color={ink} />
      <Box at={[0, 0.01, 0.06]} size={[0.025, 0.1, 0.025]} color={ink} />
      <mesh position={[0, -0.04, 0.09]} rotation={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.037, 0.047, 0.11, 12]} />
        <Finish color={ink} />
      </mesh>
      <mesh position={[0, -0.095, 0.068]} rotation={[0.45, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.008, 12]} />
        <Finish color="#e6daba" luminous />
      </mesh>
    </group>
  );
}

function Framing() {
  const { camera, size, invalidate } = useThree();
  const { active } = useContext(Stage);
  useLayoutEffect(() => {
    const orthographic = camera as OrthographicCamera;
    // Three cameras are mutable scene objects; resizing must update projection.
    // eslint-disable-next-line react-hooks/immutability
    orthographic.zoom = Math.min(size.width / 10.6, size.height / 6.8);
    orthographic.lookAt(0, 0.22, 0);
    orthographic.updateProjectionMatrix();
    invalidate();
  }, [camera, size, invalidate, active]);
  return null;
}

function ContextHealth({ onLost }: { onLost: () => void }) {
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    const lost = (event: Event) => {
      event.preventDefault();
      onLost();
    };
    canvas.addEventListener("webglcontextlost", lost);
    // Remove before Fiber disposes the old context during unmount / hot reload.
    return () => canvas.removeEventListener("webglcontextlost", lost);
  }, [gl, onLost]);
  return null;
}

export default function OrbitScene({
  active,
  reduced = false,
}: {
  active: number;
  reduced?: boolean;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [lost, setLost] = useState(false);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: "80px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={host}
      className="room-renderer"
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <SceneBoundary>
        {lost ? (
          <StaticRoom />
        ) : (
          <Canvas
            orthographic
            dpr={[1, 1.5]}
            camera={{ position: [9, 6.4, 12], near: 0.1, far: 80 }}
            frameloop={!visible ? "never" : reduced ? "demand" : "always"}
            gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}
            fallback={<StaticRoom />}
          >
            <Stage.Provider value={{ active, reduced }}>
              <ContextHealth onLost={() => setLost(true)} />
              <ambientLight intensity={1.65} />
              <directionalLight
                position={[1, 7, 5]}
                intensity={2.5}
                color="#fff0d7"
              />
              <directionalLight
                position={[-5, 3, 2]}
                intensity={0.65}
                color="#b6ded7"
              />
              <Framing />
              <Room />
            </Stage.Provider>
          </Canvas>
        )}
      </SceneBoundary>
    </div>
  );
}
