// Tiny projection helpers shared by the illustrated sections.
// Default axes give a classic isometric view; other axes give e.g. a broadside oblique view.
export type V3 = [number, number, number];
export type V2 = [number, number];
export type IsoBox = { t: string; l: string; r: string };

const fmt = (p: V2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

export function makeIso(
  ox: number,
  oy: number,
  k: number,
  ax: V2 = [0.866, 0.5], // screen direction of +x (right-down)
  ay: V2 = [-0.866, 0.5], // screen direction of +y (towards the viewer)
) {
  const P = (x: number, y: number, z: number): V2 => [
    ox + (x * ax[0] + y * ay[0]) * k,
    oy + (x * ax[1] + y * ay[1]) * k - z * k,
  ];
  const quad = (...v: V3[]) => "M" + v.map((p) => fmt(P(...p))).join("L") + "Z";
  const line = (...v: V3[]) => "M" + v.map((p) => fmt(P(...p))).join("L");
  // faces the viewer sees: top, the +y side (l) and the +x side (r)
  const box = (x: number, y: number, z: number, w: number, d: number, h: number): IsoBox => ({
    t: quad([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]),
    l: quad([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]),
    r: quad([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]),
  });
  // a circle lying on a horizontal plane becomes (about) this ellipse
  const rx = Math.hypot(ax[0], ay[0]);
  const ry = Math.hypot(ax[1], ay[1]);
  const ell = (x: number, y: number, z: number, r: number) => {
    const c = P(x, y, z);
    return { cx: c[0], cy: c[1], rx: rx * r * k, ry: ry * r * k };
  };
  return { P, quad, line, box, ell };
}
export type Iso = ReturnType<typeof makeIso>;
