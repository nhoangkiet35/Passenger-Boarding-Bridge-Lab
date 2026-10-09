import { BufferGeometry, Float32BufferAttribute, Shape } from 'three';

// Local z points aft. Preserve the existing L1 sill and docking plane.
export function aircraftHull() {
  const geometry = new BufferGeometry(), vertices: number[] = [], colors: number[] = [];
  const low = Math.asin(-.7 / 2), high = Math.asin(1.18 / 2);
  const angles = [low, high, ...Array.from({ length: 97 }, (_, i) => high + i * (Math.PI * 2 + low - high) / 96)];
  const stations = [-15,-14.8,-14,-13,-12,-10.5,-8.5,-7.5,22,23.5,25.5,27.5,29.5];
  const radii = [.015,.35,.95,1.5,1.8,2,2,2,2,1.82,1.25,.65,.015];
  for (let j = 0; j < stations.length - 1; j++) for (let i = 0; i < angles.length - 1; i++) {
    if (stations[j] === -8.5 && i === 0) continue; // Actual opening, rather than a painted door.
    const a = angles[i], b = angles[i + 1], front = stations[j], back = stations[j + 1];
    const points = [[a, front], [b, front], [b, back], [a, front], [b, back], [a, back]];
    for (const [angle, z] of points) {
      const radius = z === front ? radii[j] : radii[j+1];
      vertices.push(-radius * Math.cos(angle), 4.1 + radius * Math.sin(angle), z);
      const y = Math.sin(angle);
      colors.push(...(y < -.32 ? [.94, .93, .87] : y < -.26 ? [.88, .72, .19] : [0, .43, .52]));
    }
  }
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  return geometry;
}
export function aircraftSurface(points: [number, number][]) {
  const shape = new Shape();
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return shape;
}
