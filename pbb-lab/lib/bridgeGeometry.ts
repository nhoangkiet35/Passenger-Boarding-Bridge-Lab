import { technicalConfig as config } from './technicalConfig.ts';
import { standLayout } from './standLayout.ts';
import type { Pose, State } from './simulationTypes.ts';
export const PARK: Pose = { angle: 0, length: config.limits.length[0], height: config.rotundaHeight, canopy: 0, cabYaw: 0, floorTilt: 0 };
export const DOCKING = config.docking;
export const CABIN_OFFSET = config.cabinOffset;
const connectionX = 5 - 1 - CABIN_OFFSET - DOCKING.gap - standLayout.rotundaX;
const connectionZ = -DOCKING.cabinPassageOffset - standLayout.rotundaZ;
const dockAngle = Math.atan2(connectionZ, connectionX) * 180 / Math.PI;
export const CONNECTION: Pose = { angle: dockAngle, length: Math.hypot(connectionX, connectionZ), height: DOCKING.sillHeight - DOCKING.floorDrop, canopy: 0, cabYaw: -dockAngle, floorTilt: 0 };
// Height from ground to cabin floor; configured travel limits supplied for this PBB.
export const limits = config.limits;
export const GEOMETRY_EPSILON = 1e-9;
export const radians = (degrees: number) => degrees * Math.PI / 180;
/** Rotating bridge-frame mount below the rotunda end of tunnel A. */
export const APRON_CAMERA_MOUNT = [.85, -.55, 1.15] as const;
export function apronView(p: Pose) {
    const slope = Math.atan2(p.height - 3, p.length), angle = radians(p.angle);
    const world = (x: number, y: number, z: number): [number, number, number] => {
        const along = x * Math.cos(slope) - y * Math.sin(slope);
        return [standLayout.rotundaX + along * Math.cos(angle) - z * Math.sin(angle),
            3 + x * Math.sin(slope) + y * Math.cos(slope),
            standLayout.rotundaZ + along * Math.sin(angle) + z * Math.cos(angle)];
    };
    return { position: world(...APRON_CAMERA_MOUNT), target: world(12.6, -3.15, 3.3) };
}
export const cctvView = (s: State, selected: 'apron' | 'cabin' | null = null) => !s.area ? 'apron' : selected ?? 'cabin';
export function cabinFrame(p: Pose) {
    const a = radians(p.angle), heading = radians(p.angle + p.cabYaw);
    return { x: standLayout.rotundaX + p.length * Math.cos(a) + CABIN_OFFSET * Math.cos(heading), z: standLayout.rotundaZ + p.length * Math.sin(a) + CABIN_OFFSET * Math.sin(heading), heading };
}
/** Wide interior view behind the glazing: console, doors, floor and front threshold. */
export function cabinView(p: Pose) {
    const f = cabinFrame(p), dx = Math.cos(f.heading), dz = Math.sin(f.heading);
    const position: [number, number, number] = [f.x - 1.1 * dx, p.height + 1.85, f.z - 1.1 * dz];
    const target: [number, number, number] = [position[0] + 4 * dx, position[1] - 1.6, position[2] + 4 * dz];
    return { position, target };
}
export function metrics(p: Pose, aircraftShift = 0) {
    const f = cabinFrame(p), gap = 5 - f.x - Math.cos(f.heading);
    return {
        gap, clearance: gap - 1.375 * Math.abs(Math.sin(f.heading)),
        offset: f.z + Math.sin(f.heading) + DOCKING.cabinPassageOffset * Math.cos(f.heading),
        heightError: p.height + Math.sin(radians(p.floorTilt)) - CONNECTION.height - aircraftShift,
    };
}
export function aligned(p: Pose, aircraftShift = 0) {
    const m = metrics(p, aircraftShift);
    return m.gap >= DOCKING.minimumClearance - GEOMETRY_EPSILON && m.gap <= config.alignment.maximumGap + GEOMETRY_EPSILON && m.clearance >= DOCKING.minimumClearance - GEOMETRY_EPSILON &&
        Math.abs(m.heightError) <= config.alignment.heightTolerance + GEOMETRY_EPSILON && Math.abs(p.floorTilt) <= config.alignment.floorTolerance && aircraftDoorClear(p, aircraftShift);
}
/** Conservative swept envelope of the rendered sliding aircraft door, including its window.
 * Keep the complete opening path inside the clear front cabin/canopy cavity.
 * The cavity excludes the partition, floor, roof, side walls and rear bridge equipment.
 */
export function aircraftDoorClear(p: Pose, aircraftShift = 0) {
    const f = cabinFrame(p), c = Math.cos(f.heading), s = Math.sin(f.heading);
    const door = config.aircraftDoor, cavity = config.doorClearance;
    const bottom = door.sill + aircraftShift - p.height, top = door.sill + door.height + aircraftShift - p.height;
    if (top >= cavity.ceiling)
        return false;
    // Door first moves outward 12 cm, then slides along the fuselage.
    // This bounding envelope contains all intermediate poses (no temporal sampling).
    const minX = 7 + door.closedX - door.outwardTravel + door.windowOffsetX - door.windowThickness / 2;
    const maxX = 7 + door.closedX + door.panelOffsetX + door.panelThickness / 2;
    for (const x of [minX, maxX])
        for (const z of [-door.slide - door.width / 2, door.width / 2]) {
            const dx = x - f.x, dz = z - f.z;
            const localX = dx * c + dz * s, localZ = -dx * s + dz * c;
            if (localX <= cavity.rear || localX >= cavity.front || Math.abs(localZ) >= cavity.halfWidth)
                return false;
            if (bottom <= cavity.floorMargin + Math.max(0, localX * Math.tan(radians(p.floorTilt))))
                return false;
        }
    return true;
}
/** Cosmetic roller extension, bounded by the aircraft skin; not a sensor signal. */
export function autoLevelSensorGeometry(p: Pose, deployed: boolean, aircraftShift = 0) {
    const frame = cabinFrame(p), sensor = config.autoLevelSensor;
    const heightOffset = Math.max(0, Math.abs(p.height + sensor.height - aircraftShift - 4.1) - sensor.radius);
    const skinX = 7 - Math.sqrt(Math.max(.01, 4 - heightOffset ** 2));
    const heading = Math.cos(frame.heading);
    const clearance = heading > .25
        ? (skinX - frame.x + sensor.side * Math.sin(frame.heading) - sensor.radius) / heading - sensor.mountX
        : 0;
    const reach = Math.max(0, Math.min(deployed ? sensor.deployedReach : sensor.retractedReach, clearance));
    return { ...sensor, reach };
}
/** Shared kinematics: these positions also drive rendering and validation. */
export function geometry(p: Pose) {
    const slope = Math.atan2(p.height - config.rotundaHeight, p.length) * 180 / Math.PI;
    const slant = Math.hypot(p.length, p.height - config.rotundaHeight);
    const spacing = (slant - config.tunnelSegment) / 2;
    const overlap = config.tunnelSegment - spacing;
    const a = radians(p.angle), r = p.length - config.carriageOffset;
    return { slope, slant, overlap, centres: [5, 5 + spacing, 5 + 2 * spacing],
        wheel: { x: standLayout.rotundaX + r * Math.cos(a), y: 0, z: standLayout.rotundaZ + r * Math.sin(a) },
        columnDeckHeight: config.rotundaHeight + (p.height - config.rotundaHeight) * r / p.length,
        valid: Math.abs(slope) <= config.maxSlope && overlap >= config.minimumOverlap };
}
