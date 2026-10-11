/** All numeric defaults below are simulation assumptions unless explicitly sourced.
 * World: metres, +Y up, +X from rotunda toward parked bridge, +Z along apron.
 * length is horizontal rotunda-to-cabin-pivot reach, not tunnel slant length.
 */
export const technicalConfig = {
    stand: { aircraftNoseZ: -7, roadWidth: 3.8, noseToRoad: 7.5, bridgeLength: 8, rotundaX: -12 },
    limits: { angle: [-87.5, 87.5], length: [12, 28], height: [2, 5.4], cabYaw: [-65, 65], floorTilt: [-3, 3] },
    rates: { angle: 8, length: 1.3, height: .35, canopy: .65, cabYaw: 5, floorTilt: 1.5 },
    jogRates: { angle: 2, length: .45, height: .15, cabYaw: 3, floorTilt: 1 },
    rotundaHeight: 3, cabinOffset: 1.785, carriageOffset: 1.9,
    aircraftDoor: {
        width: .9, height: 1.78, sill: 3.4, slide: 1.05,
        closedX: -2.04, outwardTravel: .12, panelOffsetX: -.02, panelThickness: .07,
        windowOffsetX: -.04, windowThickness: .075,
    },
    doorClearance: { rear: .16, front: 2.25, halfWidth: 1.24, ceiling: 2.29, floorMargin: .05 },
    autoLevelSensor: { radius: .075, side: -1.48, height: .18, mountX: .9, deployedReach: .32, retractedReach: .08 },
    tunnelSegment: 10, minimumOverlap: .8, maxSlope: 12,
    docking: { gap: .025, minimumClearance: .025, sillHeight: 3.4, floorDrop: .15, cabinPassageOffset: .505 },
    bumperProjection: .025, warningDistance: .65, nearDoorSpeed: .08,
    alignment: { maximumGap: .05, heightTolerance: .05, floorTolerance: 2 },
    wheelRadius: .45,
    autoLevel: { rate: .08, deadband: .002, maxError: .18, maxAircraftShift: .3 },
    // 97 km/h is a manual caution about autolevel performance, NOT a site wind cut-off.
    windCautionKmh: 97,
    wheelSteeringLimit: 87.5, // Model steering limit.
} as const;
