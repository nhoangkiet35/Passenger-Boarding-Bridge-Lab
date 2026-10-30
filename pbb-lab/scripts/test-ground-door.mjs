import assert from 'node:assert/strict';
import {newMission,toggleStairDoor,stairWorld,stairFrame,stairDoorPosition,stairDoorBlockReason,nearStairDoor,leaveGroundConsole,stage,consolePosition,restartGroundDocking,stairConfig} from '../lib/groundOps.ts';
import {groundInteraction} from '../lib/groundInteraction.ts';
import {command,tick,CONNECTION,geometry} from '../lib/simulation.ts';
let m=newMission();m.started=true;
const inside=()=>stairWorld(0,stairFrame(m).height,.5,m);
assert.equal(m.docked,false);
let prompt=groundInteraction({mission:m,player:inside(),operating:false});assert.equal(prompt.kind,'stairDoor');assert.equal(prompt.key,'E');
m=toggleStairDoor(m,inside());assert.equal(m.stairDoorOpen,true,'E at stationary parked bridge must open without completing docking');assert.equal(stage(m),1,'opening door does not skip mission');
assert.match(groundInteraction({mission:m,player:inside(),operating:false}).label,/Đóng/);
m=toggleStairDoor(m,stairDoorPosition(m));assert.equal(m.stairDoorOpen,true,'cannot close onto player in doorway');
m=toggleStairDoor(m,stairWorld(0,stairFrame(m).height,2,m));assert.equal(m.stairDoorOpen,false,'close from landing');
assert.equal(nearStairDoor(m,[stairDoorPosition(m)[0],0,stairDoorPosition(m)[2]]),false,'do not interact through floor from apron');
assert.equal(toggleStairDoor(m,[-30,0,-10]).stairDoorOpen,false);
for(const c of [{type:'area',value:true},{type:'authorize',value:true},{type:'power',on:true}])m.bridge=command(m.bridge,c);
m.bridge=command(m.bridge,{type:'jog',axes:{length:1}});m.bridge=tick(m.bridge,.3);
assert.ok(stairDoorBlockReason(m));assert.equal(toggleStairDoor(m,inside()).stairDoorOpen,false,'moving bridge locks door');
const errors=m.errors;m=leaveGroundConsole(m);assert.equal(m.bridge.jog,null);assert.equal(m.bridge.actualSpeed,0);assert.equal(m.errors,errors,'leaving console is not an operation error');
assert.equal(stairDoorBlockReason(m),null);m=toggleStairDoor(m,inside());assert.equal(m.stairDoorOpen,true,'Tab stop then E opens door');
assert.equal(groundInteraction({mission:m,player:consolePosition(m),operating:true}).kind,'console','operator mode retains console actions');
// A physically completed connection is recognized on exit without a second hidden confirmation.
let served=newMission();served.started=true;served.checks.fill(true);served.bridge={...served.bridge,pose:{...CONNECTION,canopy:1},target:{...CONNECTION,canopy:1},power:true,area:true,authorized:true,autoLevel:true};
served=leaveGroundConsole(served);assert.equal(served.docked,true);assert.equal(stage(served),3);
assert.equal(toggleStairDoor(served,stairWorld(0,stairFrame(served).height,.5,served)).stairDoorOpen,true);
const fault={...served,bridge:{...served.bridge,fault:'Test fault'}};assert.equal(toggleStairDoor(fault,stairDoorPosition(fault)).stairDoorOpen,false);
console.log('PASS stair door regression: E prompt and open/close before docking, landing access, movement lock, Tab halt/exit, no hidden confirmation, threshold/floor/fault checks.');

// Dock -> leave -> re-enter -> retract -> drive -> dock again, without resetting the mission.
let repeat={...served,checks:[true,true,true,true],stairDoorOpen:false,descended:true,bridge:{...served.bridge,connectedOnce:true}};
assert.equal(groundInteraction({mission:repeat,player:consolePosition(repeat),operating:false}).kind,'console');
assert.equal(groundInteraction({mission:repeat,player:consolePosition(repeat),operating:true}).key,'C');
for(let cycle=0;cycle<2;cycle++){
 repeat=restartGroundDocking(repeat,consolePosition(repeat));
 assert.equal(repeat.docked,false);assert.equal(repeat.descended,false);assert.equal(stage(repeat),2);
 assert.equal(repeat.bridge.autoLevel,false);assert.equal(repeat.bridge.target.canopy,0);
 assert.equal(command(repeat.bridge,{type:'jog',axes:{length:-1}}).jog,null,'canopy must fully retract before motion');
 for(let i=0;i<200;i++)repeat.bridge=tick(repeat.bridge,.05);
 assert.equal(repeat.bridge.pose.canopy,0);
 repeat.bridge=command(repeat.bridge,{type:'jog',axes:{length:-1}});assert.ok(repeat.bridge.jog);
 repeat.bridge=tick(repeat.bridge,.1);repeat.bridge=command(repeat.bridge,{type:'haltJog'});
 assert.equal(repeat.bridge.fault,null);
 repeat.bridge=command(repeat.bridge,{type:'move',key:'length',value:CONNECTION.length});
 for(let i=0;i<200;i++)repeat.bridge=tick(repeat.bridge,.05);
 repeat.bridge=command(repeat.bridge,{type:'canopy',open:true});
 for(let i=0;i<200;i++)repeat.bridge=tick(repeat.bridge,.05);
 repeat=leaveGroundConsole(repeat);assert.equal(repeat.docked,true,'second approach can be secured again');
 assert.ok(repeat.checks.every(Boolean),'safety checks are preserved');
}
for(const id of ['GPU','PCA','PWS'])for(const phase of ['carrying','connected','locked','active','complete']){
 const busy={...repeat,services:{...repeat.services,[id]:phase}};
 const blocked=restartGroundDocking(busy,consolePosition(busy));assert.equal(blocked.docked,true);assert.equal(blocked.bridge,busy.bridge,'connected services must not detach');
}
const open={...repeat,stairDoorOpen:true};assert.equal(restartGroundDocking(open,consolePosition(open)).docked,true);
assert.equal(restartGroundDocking(repeat,[-30,0,30]).docked,true);
console.log('PASS re-entry/redocking: repeat approaches, full canopy retraction, restored controls and safety checks, door/service interlocks.');

for(const length of [12,18,28])for(const height of [2,3.25,5.4]){
 const mission=newMission();mission.bridge.pose={...mission.bridge.pose,length,height};
 const frame=stairFrame(mission),slope=Math.atan2(height-3,length),shape=geometry(mission.bridge.pose);
 const local=frame.along/Math.cos(slope)-shape.centres[2];
 assert.ok(Math.abs(local)+stairConfig.halfDoor<5,'door fully inside the first tunnel behind cabin');
 assert.ok(frame.along+stairConfig.halfDoor<length-1.7,'opening stays clear of cabin interface');
 assert.equal(frame.along,length-2.9,'door and stair landing share cabin-side mount');
 assert.ok(frame.along+stairConfig.halfDoor<length-1.9-.19-.15,'door leaves clearance behind the lift column');
}
console.log('PASS service door located in cabin-side first tunnel across length/height travel.');
