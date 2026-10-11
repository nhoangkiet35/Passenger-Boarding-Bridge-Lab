/** All numeric defaults below are simulation assumptions unless explicitly sourced.
 * World: metres, +Y up, +X from rotunda toward parked bridge, +Z along apron.
 * length is horizontal rotunda-to-cabin-pivot reach, not tunnel slant length.
 */
export const technicalConfig = {
  stand: { aircraftNoseZ:-7, roadWidth:3.8, noseToRoad:7.5, bridgeLength:8, rotundaX:-12 },
  limits: { angle: [-87.5,87.5], length: [12,28], height: [2,5.4], cabYaw: [-65,65], floorTilt: [-3,3] },
  rates: { angle: 8, length: 1.3, height: .35, canopy: .65, cabYaw: 5, floorTilt: 1.5 },
  jogRates: { angle: 2, length: .45, height: .15, cabYaw: 3, floorTilt: 1 },
  rotundaHeight: 3, cabinOffset: 1.785, carriageOffset: 1.9,
  tunnelSegment: 10, minimumOverlap: .8, maxSlope: 12,
  docking: { gap: .025, minimumClearance: .02, sillHeight: 3.4, floorDrop: .15, cabinPassageOffset: .505 },
  bumperProjection: .025, warningDistance: .65, nearDoorSpeed: .08,
  alignment: { maximumGap:.035, lateralTolerance:.05, heightTolerance:.01, headingTolerance:.3, floorTolerance:.5 },
  wheelRadius:.45,
  autoLevel: { rate: .08, deadband: .002, maxError: .18, maxAircraftShift: .3 },
  // 97 km/h is a manual caution about autolevel performance, NOT a site wind cut-off.
  windCautionKmh: 97,
  wheelSteeringLimit: 87.5, // Model steering limit.
} as const;
