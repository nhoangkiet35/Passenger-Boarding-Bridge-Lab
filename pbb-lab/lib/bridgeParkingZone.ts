import { standLayout } from './standLayout.ts';
import { technicalConfig } from './technicalConfig.ts';

/** Restore a tapered apron bay. Keep the actual PARK wheel marker inside the hatch,
 * and leave the service road free of the former L-shaped painted strip. */
const x=standLayout.rotundaX,z=standLayout.rotundaZ;
const roadEdge=standLayout.roadCenterZ+standLayout.roadWidth/2;
export const bridgeParkingZone:[number,number][]=[
 [x-7.5,roadEdge+.25],
 [x+technicalConfig.limits.length[0]+technicalConfig.cabinOffset+1.25,roadEdge+.25],
 [x+technicalConfig.limits.length[0]+technicalConfig.cabinOffset+1.25,z+5.7],
 [x+5.5,z+5.7],
];

export function insideBridgeParking(x:number,z:number){
 let inside=false;
 for(let i=0,j=bridgeParkingZone.length-1;i<bridgeParkingZone.length;j=i++){
  const a=bridgeParkingZone[i],b=bridgeParkingZone[j];
  if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside;
 }
 return inside;
}
