import assert from 'node:assert/strict';
import { initial, command, wheelMotion } from '../lib/simulation.ts';
const base = { ...initial(), power: true, area: true, authorized: true, pose: { ...initial().pose, length: 16 }, target: { ...initial().pose, length: 16 } };
for (const [axes, angle, direction] of [
  [{ length: 1 }, 0, 1], [{ length: -1 }, 0, -1],
  [{ angle: -1 }, -90, 1], [{ angle: 1 }, 90, 1],
]) {
  const state = command(base, { type: 'jog', axes });
  assert.deepEqual(wheelMotion(state), { angle, direction });
  console.log('PASS wheel direction', JSON.stringify(axes));
}
for (let x = -1; x <= 1; x += .25) for (let y = -1; y <= 1; y += .25) {
  const state = command(base, { type: 'jog', axes: { angle: x, length: y } });
  const wheel = wheelMotion(state);
  assert.ok(wheel.angle >= -90 && wheel.angle <= 90);
  if (x || y) {
    const rad = wheel.angle * Math.PI / 180;
    assert.equal(Math.sign(wheel.direction * Math.sin(rad)) || 0, Math.sign(x) || 0);
    if (y) assert.equal(Math.sign(wheel.direction * Math.cos(rad)), Math.sign(y));
  }
}
console.log('PASS 81 joystick directions within 180-degree steering range');
const turning = command(base, { type: 'jog', axes: { angle: .5, length: .6 } });
for (const cmd of [{ type: 'haltJog' }, { type: 'emergency' }, { type: 'power', on: false }, { type: 'pause' }, { type: 'area', value: false }]) {
  const stopped = command(turning, cmd);
  assert.equal(wheelMotion(stopped).direction, 0);
  assert.equal(wheelMotion(stopped).angle, wheelMotion(turning).angle);
}
console.log('PASS stop, emergency, power-off, pause and lost clearance hide arrow and retain steering');
const atStop = command({ ...base, pose: { ...base.pose, length: 12 } }, { type: 'jog', axes: { length: -1 } });
assert.equal(wheelMotion(atStop).direction, 0);
console.log('PASS mechanical travel stop hides movement arrow');
