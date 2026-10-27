import assert from 'node:assert/strict';
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
