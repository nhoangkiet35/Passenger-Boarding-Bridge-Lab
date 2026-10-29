import {Group,Vector3} from 'three';
import {applyBridgeVisualPose} from '../lib/bridgeVisualMotion.ts';
import {CABIN_OFFSET} from '../lib/simulation.ts';
import {groundDeviceBlocked} from '../lib/groundDevice.ts';
import assert from 'node:assert/strict';
import {groundGuide} from '../lib/groundGuide.ts';
import {groundInteraction} from '../lib/groundInteraction.ts';
import { newMission, stage, groundConfig, serviceAction, serviceMount, advanceMission, secureBridge, finishMission, handover, walkFloor, consolePosition, stairConfig, stairFrame, stairWorld, stairDoorPosition, stairPassable, toggleStairDoor, atStairBottom, wheelCompass, mobileStepsAction } from '../lib/groundOps.ts';
import {mobileHandle,mobileBrake,mobileWorld,mobileReady,mobileStepsConfig,moveMobile,onMobilePlatform} from '../lib/mobileSteps.ts';
import { command, tick, CONNECTION, aligned } from '../lib/simulation.ts';
import { standLayout } from '../lib/standLayout.ts';
let m=newMission();
assert.equal(stage(m),0);
assert.equal(serviceAction(m,'GPU','unit',[-3.5,0,-4]).services.GPU,'idle');
m.started=true;m.checks.fill(true);
for(const c of [{type:'area',value:true},{type:'authorize',value:true},{type:'power',on:true}])m.bridge=command(m.bridge,c);
assert.equal(secureBridge(m).docked,false);
assert.equal(toggleStairDoor(m,stairWorld(0,stairFrame(m).height,.5,m)).stairDoorOpen,true,'stationary parked bridge allows service-door access before docking');
// Walk the entire parked bridge without a gap between tunnel, swivel and cabin.
let y=3;
for(let x=-12;x<consolePosition(m)[0];x+=.045){const floor=walkFloor(x,standLayout.rotundaZ,y,m);assert.notEqual(floor,null,`walkway gap x=${x}`);y=floor;}
// Use the existing production integrator to approach and connect, no guide-mode completion.
for(const key of ['angle','cabYaw','height','length']){
 m.bridge=command(m.bridge,{type:'move',key,value:CONNECTION[key]});
 for(let i=0;i<1600;i++)m.bridge=tick(m.bridge,.05);
 assert.equal(m.bridge.fault,null);
}
assert.ok(aligned(m.bridge.pose));
m.bridge=command(m.bridge,{type:'canopy',open:true});
for(let i=0;i<100;i++)m.bridge=tick(m.bridge,.05);
m=secureBridge(m);assert.equal(m.docked,true);
// Door collision is tested on both sides; only an open, centered doorway is passable.
const frame=stairFrame(m),c=stairConfig;
const inside=stairWorld(0,frame.height,c.doorSide-.1,m),outside=stairWorld(0,frame.height,c.doorSide+.1,m);
assert.equal(stairPassable(inside,outside,m),false);
assert.equal(stairPassable(outside,inside,m),false);
m=toggleStairDoor(m,stairWorld(0,frame.height,.5,m));assert.equal(m.stairDoorOpen,true);
assert.equal(stairPassable(inside,outside,m),true);
assert.equal(stairPassable(stairWorld(.9,frame.height,.9,m),stairWorld(.9,frame.height,1.4,m),m),false);
assert.equal(toggleStairDoor(m,inside).stairDoorOpen,true,'cannot close onto player');
// Walk through the doorway, across the landing and down all steps in the rotated bridge frame.
y=frame.height;
for(let z=.5;z<c.side;z+=.035){const p=stairWorld(0,y,z,m),floor=walkFloor(p[0],p[2],y,m);assert.notEqual(floor,null,`landing gap z=${z}`);y=floor;}
for(let x=0;x> -c.landingBack-c.run-.2;x-=.035){const p=stairWorld(x,y,c.side,m),floor=walkFloor(p[0],p[2],y,m);assert.notEqual(floor,null,`stair gap x=${x}`);y=floor;}
assert.equal(y,0);
assert.equal(atStairBottom(stairWorld(-c.landingBack-c.run,0,c.side,m),m),true);
const offStair=stairWorld(-3,frame.height*.7,c.side+1,m);assert.equal(walkFloor(offStair[0],offStair[2],offStair[1],m),null);
m=toggleStairDoor(m,stairWorld(0,frame.height,2,m));assert.equal(m.stairDoorOpen,false);
// Access follows extension, yaw and height instead of remaining at the old rotunda stairs.
for(const angle of [-60,0,60]){const shifted={...m,bridge:{...m.bridge,pose:{...m.bridge.pose,angle,length:24,height:4.5}}};const f=stairFrame(shifted);assert.ok(Math.abs(f.height-(3+1.5*(24-c.setback)/24))<1e-8);const p=stairDoorPosition(shifted);assert.ok(Math.hypot(p[0]+12,p[2]-standLayout.rotundaZ)>20);}
assert.deepEqual(wheelCompass(0,0),{steering:0,heading:90});
assert.deepEqual(wheelCompass(30,45),{steering:45,heading:165});
assert.deepEqual(wheelCompass(-80,-90),{steering:-90,heading:280});
assert.equal(wheelCompass(0,180).steering,90);
m.descended=true;assert.equal(stage(m),4);
for(const id of ['GPU','PCA','PWS']){
 const c=groundConfig.services[id],mount=serviceMount(m,id),unit=[mount.control[0]-.8,0,mount.control[2]];
 let socket=[c.socket[0]-.7,0,c.socket[2]];
 if(id==='PWS'){
  m=mobileStepsAction(m,'handle',mobileHandle(m.mobileSteps));assert.equal(m.mobileSteps.phase,'pushing');
  const dt=.05,turn=Math.PI/2/mobileStepsConfig.turnRate;
  m.mobileSteps=moveMobile(m.mobileSteps,0,1,turn);
  for(let i=0;i<256;i++)m.mobileSteps=moveMobile(m.mobileSteps,1,0,dt);
  m.mobileSteps=moveMobile(m.mobileSteps,0,-1,turn);
  for(let i=0;i<225;i++)m.mobileSteps=moveMobile(m.mobileSteps,1,0,dt);
  assert.ok(mobileReady(m.mobileSteps));m=mobileStepsAction(m,'handle',mobileHandle(m.mobileSteps));
  const brake=mobileBrake(m.mobileSteps);m=mobileStepsAction(m,'brake',[brake[0],0,brake[2]]);assert.equal(m.mobileSteps.phase,'locked');
  let height=0;
  for(let x=-3.7;x<.1;x+=.035){const p=mobileWorld(m.mobileSteps,x,height,0),floor=walkFloor(p[0],p[2],height,m);assert.notEqual(floor,null);height=floor;}
  socket=mobileWorld(m.mobileSteps,0,height,0);assert.ok(onMobilePlatform(m.mobileSteps,socket));m.mobileSteps.climbed=true;
 }
 m=serviceAction(m,id,'unit',unit);assert.equal(m.services[id],'inspected');
 const invalid=serviceAction(m,id,'unit',unit); // pickup still doesn't supply power
 assert.equal(invalid.services[id],'carrying');m=invalid;
 const returned=serviceAction(m,id,'unit',unit);assert.equal(returned.services[id],'inspected');assert.deepEqual(returned.cableRoutes[id],[]);
 m=serviceAction(returned,id,'unit',unit);assert.equal(m.services[id],'carrying');
 if(id==='PWS'){m=serviceAction(m,id,'socket',socket);assert.equal(m.waterPanel,true);assert.equal(m.services.PWS,'carrying');}
 const missed=serviceAction(m,id,'socket',socket,false);assert.equal(missed.services[id],'carrying');
 m=serviceAction(m,id,'socket',socket,true);assert.equal(m.services[id],'connected');
 assert.equal(serviceAction(m,id,'unit',unit).services[id],'connected');
 m=serviceAction(m,id,'socket',socket);assert.equal(m.services[id],'locked');
 m=serviceAction(m,id,'unit',unit);assert.equal(m.services[id],'active');
 if(id==='PWS'){
  assert.equal(serviceAction(m,id,'unit',unit).services[id],'active');
  m=advanceMission(m,groundConfig.waterSeconds);assert.equal(m.water,1);
  m=serviceAction(m,id,'unit',unit);assert.equal(m.services[id],'complete');
 }
}
assert.equal(stage(m),7);assert.equal(finishMission(m,handover,false).complete,false);
m=finishMission(m,handover,true);assert.equal(m.complete,true);assert.equal(stage(m),8);
assert.equal(advanceMission(m,100).elapsed,m.elapsed);
assert.equal(newMission().waterPanel,false);
console.log('PASS Ground Operations: bridge approach, canopy/autolevel, continuous bridge/stairs, all service interlocks, PWS panel/fill/stop, handover, reset.');

// Every service action shown by the HUD is reachable through the interaction resolver.
let flow=newMission();flow.started=true;flow.checks.fill(true);flow.docked=true;flow.descended=true;flow.bridge={...flow.bridge,pose:{...CONNECTION,canopy:1},target:{...CONNECTION,canopy:1},autoLevel:true};
for(const id of ['GPU','PCA','PWS']){
 const at=serviceMount(flow,id).control,unit=[at[0]-2.2,0,at[2]];
 if(id==='PWS'){flow.mobileSteps={...flow.mobileSteps,x:mobileStepsConfig.target[0],z:mobileStepsConfig.target[2],phase:'locked',climbed:true};}
 assert.match(groundGuide(flow).title,new RegExp(id));
 const target=groundInteraction({mission:flow,player:unit,operating:false});
 assert.equal(target?.kind,'unit');assert.equal(target?.id,id);
 flow=serviceAction(flow,id,'unit',unit);assert.equal(flow.services[id],'inspected','visible pickup hint agrees with action range');
 flow=serviceAction(flow,id,'unit',unit);
 const socket=id==='PWS'?mobileWorld(flow.mobileSteps,0,1.5,0):[groundConfig.services[id].socket[0]-.7,0,groundConfig.services[id].socket[2]];
 assert.equal(groundInteraction({mission:flow,player:socket,operating:false})?.kind,'socket');
 if(id==='PWS')flow=serviceAction(flow,id,'socket',socket);
 flow=serviceAction(flow,id,'socket',socket);assert.equal(flow.services[id],'connected');
 assert.match(groundGuide(flow).title,/khóa đầu nối/);
 flow=serviceAction(flow,id,'socket',socket);
 assert.match(groundGuide(flow).title,/trở lại thiết bị/);
 flow=serviceAction(flow,id,'unit',unit);assert.equal(flow.services[id],'active');
 if(id==='PWS'){flow=advanceMission(flow,12);assert.match(groundGuide(flow).detail,/120 L/);flow=serviceAction(flow,id,'unit',unit);}
}
assert.deepEqual(groundGuide(flow).at,handover);
console.log('PASS HUD mission guidance and interaction ranges across all service transitions.');

assert.equal(groundDeviceBlocked('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Mobile',5),true);
assert.equal(groundDeviceBlocked('Mozilla/5.0 (Linux; Android 15; Tablet)',5),true);
assert.equal(groundDeviceBlocked('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15)',5),true,'iPad desktop mode');
assert.equal(groundDeviceBlocked('Mozilla/5.0 (Windows NT 10.0; Win64; x64)',10),false,'touchscreen laptop remains supported');
assert.equal(groundDeviceBlocked('Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0)',0),false);
assert.equal(groundDeviceBlocked('Mozilla/5.0 (X11; Linux x86_64)',0),false);
console.log('PASS desktop-only gate: phone, Android tablet, desktop-mode iPad blocked; Windows touch laptop, Mac and Linux allowed.');

// The cabin and operator must agree on every display frame, even between HUD commits.
for(const fps of [30,60,144]){
 const root=new Group(),rotunda=new Group(),slopeNode=new Group(),cabin=new Group(),yaw=new Group(),carriage=new Group(),tunnels=[new Group(),new Group(),new Group()];
 root.position.set(standLayout.rotundaX,0,standLayout.rotundaZ);root.add(rotunda,slopeNode,cabin);slopeNode.add(...tunnels);cabin.add(yaw,carriage);
 const consoleNode=new Group();consoleNode.position.set(CABIN_OFFSET-.5,0,0);yaw.add(consoleNode);
 let drive=newMission();drive.started=true;drive.checks.fill(true);
 for(const c of [{type:'area',value:true},{type:'authorize',value:true},{type:'power',on:true}])drive.bridge=command(drive.bridge,c);
 drive.bridge=command(drive.bridge,{type:'jog',axes:{length:.6,angle:.4,height:.2,cabYaw:.1}});
 let rendered={...drive.bridge.pose};
 for(let frame=0;frame<fps*2;frame++){
  drive.bridge=tick(drive.bridge,1/fps);assert.equal(drive.bridge.fault,null);
  if(frame%Math.max(1,Math.round(fps/20))===0)rendered={...drive.bridge.pose};
  applyBridgeVisualPose({root,rotunda,slope:slopeNode,tunnels,cabin,yaw,carriage},drive.bridge.pose,rendered);root.updateMatrixWorld(true);
  const actual=consoleNode.getWorldPosition(new Vector3()),expected=consolePosition(drive);
  assert.ok(actual.distanceTo(new Vector3(...expected))<1e-9,'no camera/cabin mismatch between HUD updates at '+fps+' FPS');
  assert.ok(Math.abs(root.rotation.y+rotunda.rotation.y)<1e-12,'rotunda remains stationary');
 }
 const snapshot=JSON.stringify(drive.bridge.pose);applyBridgeVisualPose({root,rotunda,slope:slopeNode,tunnels,cabin,yaw,carriage},drive.bridge.pose,rendered);assert.equal(JSON.stringify(drive.bridge.pose),snapshot,'visual update cannot alter safety pose');
}
console.log('PASS frame-synchronized bridge: cabin/camera agreement at 30/60/144 FPS with 20 Hz HUD, fixed rotunda and unchanged physics.');
