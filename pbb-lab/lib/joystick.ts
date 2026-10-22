/** Clock sectors, measured clockwise from 12; screen y grows downwards. */
export function joystickAxes(x: number, y: number) {
  const strength = Math.min(1, Math.hypot(x, y));
  if (strength < .10) return { angle: 0, length: 0 };
  // Remove floating-point noise at exact clock boundaries.
  const degrees = Math.round(((Math.atan2(x, -y) * 180 / Math.PI + 360) % 360) * 1e9) / 1e9;
  if (degrees <= 30 || degrees >= 330) return { angle: 0, length: strength };
  if (degrees >= 150 && degrees <= 210) return { angle: 0, length: -strength };
  if (degrees >= 60 && degrees <= 120) return { angle: strength, length: 0 };
  if (degrees >= 240 && degrees <= 300) return { angle: -strength, length: 0 };
  if (degrees < 60) return { angle: strength, length: strength };
  if (degrees < 150) return { angle: -strength, length: -strength };
  if (degrees < 240) return { angle: strength, length: -strength };
  return { angle: -strength, length: strength };
}
