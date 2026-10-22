// Tiny isometric projection helpers shared by the illustrated sections.
export type V3 = [number, number, number];
export type V2 = [number, number];
export type IsoBox = { t: string; l: string; r: string };

const fmt = (p: V2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;

export function makeIso(ox: number, oy: number, k: number) {
  // x runs down-right, y runs down-left, z is up
  const P = (x: number, y: number, z: number): V2 => [
    ox + (x - y) * 0.866 * k,
    oy + (x + y) * 0.5 * k - z * k,
  ];
  const quad = (...v: V3[]) => "M" + v.map((p) => fmt(P(...p))).join("L") + "Z";
  const line = (...v: V3[]) => "M" + v.map((p) => fmt(P(...p))).join("L");
  // faces the viewer sees: top, the +y side (l) and the +x side (r)
  const box = (x: number, y: number, z: number, w: number, d: number, h: number): IsoBox => ({
    t: quad([x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]),
    l: quad([x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]),
    r: quad([x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]),
  });
  // a circle lying on a horizontal plane becomes this ellipse
  const ell = (x: number, y: number, z: number, r: number) => {
    const c = P(x, y, z);
    return { cx: c[0], cy: c[1], rx: 1.2247 * r * k, ry: 0.7071 * r * k };
  };
  return { P, quad, line, box, ell };
}
