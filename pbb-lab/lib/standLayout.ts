/** Illustrative stand layout with the user-requested nose-to-road clearance. */
import { technicalConfig } from './technicalConfig.ts';
const { aircraftNoseZ, roadWidth, noseToRoad } = technicalConfig.stand;
const roadCenterZ = aircraftNoseZ - noseToRoad - roadWidth / 2;
export const standLayout = {
  terminalFaceZ: roadCenterZ - 5,
  roadCenterZ,
  roadWidth,
  aircraftNoseZ,
  bridgeLength: technicalConfig.stand.bridgeLength,
  bridgeCenterZ: roadCenterZ - 1,
  rotundaX: technicalConfig.stand.rotundaX,
  rotundaZ: roadCenterZ + 4.7,
} as const;
export const standClearances = {
  noseToRoad: standLayout.aircraftNoseZ - (standLayout.roadCenterZ + standLayout.roadWidth / 2),
  noseToTerminal: standLayout.aircraftNoseZ - standLayout.terminalFaceZ,
};
