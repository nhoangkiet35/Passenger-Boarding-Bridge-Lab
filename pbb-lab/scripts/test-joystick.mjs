import assert from 'node:assert/strict';
import { joystickAxes } from '../lib/joystick.ts';

// Every integer angle, including the eight boundaries. Cardinal bands own boundaries.
for (let degrees = 0; degrees < 360; degrees++) {
  const radians = degrees * Math.PI / 180;
  const axes = joystickAxes(Math.sin(radians), -Math.cos(radians));
  let expected;
  if (degrees <= 30 || degrees >= 330) expected = [0, 1];
  else if (degrees >= 60 && degrees <= 120) expected = [1, 0];
  else if (degrees >= 150 && degrees <= 210) expected = [0, -1];
  else if (degrees >= 240 && degrees <= 300) expected = [-1, 0];
  else if (degrees < 60) expected = [1, 1];
  else if (degrees < 150) expected = [-1, -1];
  else if (degrees < 240) expected = [1, -1];
  else expected = [-1, 1];
  assert.deepEqual([Math.sign(axes.angle), Math.sign(axes.length)], expected, `${degrees}°`);
}
assert.deepEqual(joystickAxes(0, 0), { angle: 0, length: 0 });
assert.deepEqual(joystickAxes(.05, 0), { angle: 0, length: 0 });
assert.deepEqual(joystickAxes(0, -.4), { angle: 0, length: .4 });
assert.deepEqual(joystickAxes(2, 0), { angle: 1, length: 0 });
console.log('PASS all clock sectors, reverse diagonal steering, boundaries, dead zone and strength');
