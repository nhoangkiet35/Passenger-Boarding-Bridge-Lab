/** Illustrative stand layout with the user-requested nose-to-road clearance. */
import { technicalConfig } from './technicalConfig.ts';
const { aircraftNoseZ, roadWidth, noseToRoad, terminalRoadSetback, rotundaZ } = technicalConfig.stand;
const roadCenterZ = aircraftNoseZ - noseToRoad - roadWidth / 2;
const terminalFaceZ=roadCenterZ-roadWidth/2-terminalRoadSetback;
const bridgeEndZ=rotundaZ-1.7;
export const terminalLayout={width:70,depth:11,levelHeight:3,levels:[0,3,6] as const,height:9};
export const standLayout = {
  terminalFaceZ,
  roadCenterZ,
  roadWidth,
  roadLength:84,
  aircraftNoseZ,
  aircraftCenterX:7,
  bridgeLength: bridgeEndZ-terminalFaceZ,
  bridgeCenterZ: (terminalFaceZ+bridgeEndZ)/2,
  bridgeSupportInset:.3,
  rotundaX: technicalConfig.stand.rotundaX,
  rotundaZ,
} as const;
export const standClearances = {
  noseToRoad: standLayout.aircraftNoseZ - (standLayout.roadCenterZ + standLayout.roadWidth / 2),
  noseToTerminal: standLayout.aircraftNoseZ - standLayout.terminalFaceZ,
};
