/** Illustrative stand layout with the user-requested nose-to-road clearance. */
const aircraftNoseZ = -7;
const roadWidth = 3.8;
const noseToRoad = 7.5;
const roadCenterZ = aircraftNoseZ - noseToRoad - roadWidth / 2;
export const standLayout = {
  terminalFaceZ: roadCenterZ - 5,
  roadCenterZ,
  roadWidth,
  aircraftNoseZ,
  bridgeLength: 8,
  bridgeCenterZ: roadCenterZ - 1,
  rotundaX: -12,
  rotundaZ: roadCenterZ + 4.7,
} as const;
export const standClearances = {
  noseToRoad: standLayout.aircraftNoseZ - (standLayout.roadCenterZ + standLayout.roadWidth / 2),
  noseToTerminal: standLayout.aircraftNoseZ - standLayout.terminalFaceZ,
};
