import type { Group } from 'three';
import { geometry } from './bridgeGeometry.ts';
import type { Pose } from './simulationTypes.ts';

export type BridgeVisualNodes = {
 root:Group|null; rotunda:Group|null; slope:Group|null;
 tunnels:(Group|null)[]; cabin:Group|null; yaw:Group|null; carriage:Group|null;
};

/** Apply the authoritative pose after simulation, before drawing either camera.
 * Geometry can rebuild at HUD cadence; moving frames must not wait for React. */
export function applyBridgeVisualPose(nodes:BridgeVisualNodes,pose:Pose,rendered:Pose) {
 const angle=pose.angle*Math.PI/180,shape=geometry(pose);
 if(nodes.root)nodes.root.rotation.y=-angle;
 if(nodes.rotunda)nodes.rotunda.rotation.y=angle;
 if(nodes.slope)nodes.slope.rotation.z=Math.atan2(pose.height-3,pose.length);
 nodes.tunnels.forEach((node,i)=>{if(node)node.position.x=shape.centres[i];});
 if(nodes.cabin)nodes.cabin.position.set(pose.length,pose.height,0);
 if(nodes.yaw)nodes.yaw.rotation.y=-pose.cabYaw*Math.PI/180;
 // Carriage geometry was built at the rendered deck height: keep its wheels grounded.
 if(nodes.carriage)nodes.carriage.position.y=geometry(rendered).columnDeckHeight-pose.height;
}
