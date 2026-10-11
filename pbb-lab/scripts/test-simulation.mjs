import assert from 'node:assert/strict';
import {technicalConfig} from '../lib/technicalConfig.ts';
import {standLayout} from '../lib/standLayout.ts';
import {cabinCurtainPanels,CABIN_SWIVEL_RADIUS} from '../lib/cabinCurtainGeometry.ts';
import {initial,command,tick,moving,parked,aligned,metrics,passengerAccess,cabinFrame,DOCKING,PARK,CONNECTION,bridgeMessages} from '../lib/simulation.ts';
const settle=s=>{for(let i=0;i<6000&&moving(s);i++)s=tick(s,1/60);assert.ok(!moving(s),'movement reaches target');return s;};
let checks=0;const check=(value,label)=>{assert.ok(value,label);checks++;console.log('PASS '+label);};
let s=initial();s=command(s,{type:'move',key:'length',value:15});check(s.target.length===PARK.length,'power-off blocks movement');
s=command(s,{type:'power'});s=command(s,{type:'move',key:'length',value:15});check(s.target.length===PARK.length,'unconfirmed aircraft blocks approach');
s=command(s,{type:'area',value:true});s=command(s,{type:'authorize',value:true});s=command(s,{type:'canopy',open:true});check(s.target.canopy===0,'canopy blocked far from door');
s=command(s,{type:'move',key:'length',value:15.6});s=tick(s,.05);check(s.pose.length>PARK.length,'real animated movement');
s=command(s,{type:'emergency'});const frozen={...s.pose};for(let i=0;i<60;i++)s=tick(s,.05);check(JSON.stringify(s.pose)===JSON.stringify(frozen),'emergency freezes all axes immediately');
s=command(s,{type:'resetEmergency'});s=tick(s,.05);check(!moving(s)&&!s.power,'emergency reset never resumes stale command');s=command(s,{type:'power',on:true});
s=command(s,{type:'move',key:'angle',value:CONNECTION.angle});s=settle(s);s=command(s,{type:'move',key:'cabYaw',value:CONNECTION.cabYaw});s=settle(s);s=command(s,{type:'move',key:'height',value:CONNECTION.height});s=settle(s);s=command(s,{type:'move',key:'length',value:CONNECTION.length});s=settle(s);check(aligned(s.pose),'manual alignment reaches door');
s=command(s,{type:'canopy',open:true});s=tick(s,.05);const before=s.target.length;s=command(s,{type:'move',key:'length',value:14});check(s.target.length===before,'partially deployed canopy locks bridge');s=settle(s);check(s.pose.canopy===1,'manual connection complete');
s=command(s,{type:'canopy',open:false});check(s.target.canopy===1,'end service required before canopy retract');
s=command(s,{type:'service'});s=command(s,{type:'canopy',open:false});s=settle(s);s=command(s,{type:'move',key:'length',value:14});s=settle(s);s=command(s,{type:'park'});s=settle(s);check(parked(s),'manual departure reaches parking');
s=command(initial(),{type:'guide'});for(let i=0;i<10000&&s.step!==5;i++)s=tick(s,1/60);check(s.step===5&&s.pose.canopy===1&&s.paused,'guided approach completes and pauses for explanation');
s=command(s,{type:'guide',departure:true});for(let i=0;i<10000&&s.step!==10;i++)s=tick(s,1/60);check(s.step===10&&parked(s)&&!s.power,'guided departure completes and powers off');
s=initial();for(const c of [{type:'power'},{type:'area',value:true},{type:'authorize',value:true},{type:'move',key:'angle',value:0}])s=command(s,c);s=settle(s);s=command(s,{type:'move',key:'length',value:100});s=settle(s);check(metrics(s.pose).gap>=.02,'overshoot clamped before aircraft safety plane');
s=command(s,{type:'move',key:'length',value:12});s=command(s,{type:'pause'});const p={...s.pose};s=tick(s,.05);check(JSON.stringify(p)===JSON.stringify(s.pose),'pause freezes motion');s=command(s,{type:'pause'});s=settle(s);check(s.pose.length===12,'resume reaches target');
s=command(s,{type:'move',key:'length',value:15});s=command(s,{type:'authorize',value:false});check(!moving(s),'revoking clearance aborts motion');
s=command(s,{type:'reset'});check(parked(s)&&!s.power&&!s.authorized,'full reset restores lesson');
console.log(`${checks} behavioral checks passed.`);
// Tiny remainder must finish exactly: a partially retracted canopy must not lock forever.
let residual=initial();residual.power=true;residual.pose.canopy=.0002;residual.target.canopy=0;
residual=tick(residual,.016);assert.equal(residual.pose.canopy,0);console.log('PASS canopy sub-millimetre remainder finishes exactly');

await import('./test-console.mjs');

const access=initial();access.power=true;access.area=true;access.authorized=true;access.pose={...CONNECTION,canopy:.95};
assert.equal(passengerAccess(access),false,'partial canopy cannot open aircraft door');
access.pose.canopy=1;assert.equal(passengerAccess(access),true,'completed aligned connection enables passengers');
access.pose.height=4;assert.equal(passengerAccess(access),false,'misaligned bridge cannot open door');
access.pose.height=3.4;access.serviceEnded=true;assert.equal(passengerAccess(access),false,'end of service closes passenger access');

assert.ok(CONNECTION.angle>30&&CONNECTION.cabYaw< -30,'diagonal tunnel and counter-rotated cabin');
assert.ok(aligned(CONNECTION),'diagonal pose seals at L1');
assert.ok(aligned({...CONNECTION,height:3.20}),'lower height boundary accepted');
assert.ok(aligned({...CONNECTION,height:3.30}),'upper height boundary accepted');
assert.ok(!aligned({...CONNECTION,height:3.31}),'excessive height error rejected');
const offMessages=bridgeMessages(initial());
assert.ok(offMessages.some(m=>m.text.includes('chưa hoạt động')),'unpowered sensors do not claim live readings');
assert.ok(!offMessages.some(m=>/PLC STOP|PARK IN|GUIDE MODE|BRIDGE READY/.test(m.text)),'message panel excludes mode lamp statuses');
const sensorState={...initial(),power:true,area:true,authorized:true,pose:{...CONNECTION},target:{...CONNECTION}};
assert.ok(bridgeMessages(sensorState).some(m=>m.text.includes('Đường mở cửa')&&!m.alarm),'clear door path reports sensor clearance');
assert.ok(bridgeMessages({...sensorState,pose:{...CONNECTION,length:CONNECTION.length+.1}}).some(m=>m.alarm&&m.text.includes('CHẠM THÂN')),'unsafe aircraft clearance shows alarm');
assert.ok(bridgeMessages({...sensorState,emergency:true})[0].text.includes('DỪNG KHẨN CẤP'),'emergency takes message priority');
for(const [gap,accepted] of [[.025,true],[.05,true],[.024,false],[.051,false]]) {
  const x=5-1-technicalConfig.cabinOffset-gap-standLayout.rotundaX;
  const z=-DOCKING.cabinPassageOffset-standLayout.rotundaZ;
  const angle=Math.atan2(z,x)*180/Math.PI;
  const pose={...CONNECTION,angle,cabYaw:-angle,length:Math.hypot(x,z)};
  const state={...initial(),power:true,area:true,authorized:true,pose,target:{...pose}};
  assert.equal(command(state,{type:'canopy',open:true}).target.canopy,accepted?1:0,`canopy gap boundary ${gap} m`);
}
// A lateral offset alone no longer prevents manual canopy deployment.
const lateralX=CONNECTION.length*Math.cos(CONNECTION.angle*Math.PI/180);
const lateralZ=CONNECTION.length*Math.sin(CONNECTION.angle*Math.PI/180)-.1;
const lateralAngle=Math.atan2(lateralZ,lateralX)*180/Math.PI;
const lateralPose={...CONNECTION,angle:lateralAngle,cabYaw:-lateralAngle,length:Math.hypot(lateralX,lateralZ)};
assert.ok(Math.abs(metrics(lateralPose).offset)>.05,'fixture exceeds former lateral limit');
assert.ok(aligned(lateralPose),'lateral offset does not block alignment');
const lateralState={...initial(),power:true,area:true,authorized:true,pose:{...lateralPose},target:{...lateralPose}};
assert.equal(command(lateralState,{type:'canopy',open:true}).target.canopy,1,'manual canopy accepts lateral offset');
assert.equal(command({...lateralState,pose:{...lateralPose,height:3.32},target:{...lateralPose,height:3.32}},{type:'canopy',open:true}).target.canopy,0,'excessive height error still blocks canopy');
assert.equal(command({...lateralState,pose:{...lateralPose,height:3.27},target:{...lateralPose,height:3.27}},{type:'canopy',open:true}).target.canopy,1,'moderate height error accepted with clear door path');
assert.ok(!aligned({...CONNECTION,cabYaw:0}),'unsafe cabin geometry still blocks canopy');
const heading=.4*Math.PI/180;
const safeX=5-Math.cos(heading)-.04;
const pivotX=safeX-technicalConfig.cabinOffset*Math.cos(heading)-standLayout.rotundaX;
const pivotZ=-DOCKING.cabinPassageOffset-technicalConfig.cabinOffset*Math.sin(heading)-standLayout.rotundaZ;
const safeAngle=Math.atan2(pivotZ,pivotX)*180/Math.PI;
const safeYawPose={...CONNECTION,angle:safeAngle,cabYaw:.4-safeAngle,length:Math.hypot(pivotX,pivotZ)};
assert.ok(aligned(safeYawPose),'safe door opening accepts heading above former 0.3 degree limit');
const unsafeLateral={...lateralPose,angle:CONNECTION.angle,cabYaw:CONNECTION.cabYaw,length:CONNECTION.length};
const collisionZ=CONNECTION.length*Math.sin(CONNECTION.angle*Math.PI/180)+.4;
unsafeLateral.angle=Math.atan2(collisionZ,lateralX)*180/Math.PI;
unsafeLateral.cabYaw=-unsafeLateral.angle;
unsafeLateral.length=Math.hypot(lateralX,collisionZ);
assert.equal(command({...lateralState,pose:unsafeLateral,target:{...unsafeLateral}},{type:'canopy',open:true}).target.canopy,0,'door path crossing canopy side blocks deployment');

let directPark=initial();directPark.power=true;directPark.area=true;directPark.authorized=true;directPark.pose={...CONNECTION};directPark.target={...CONNECTION};
directPark=command(directPark,{type:'park'});assert.equal(directPark.target.angle,CONNECTION.angle,'retract before rotating back');directPark=settle(directPark);assert.ok(parked(directPark),'direct parking from diagonal connection completes');

assert.ok(Math.abs(metrics(CONNECTION).gap-.025)<1e-9,'requested 2.5 cm gap');assert.ok(Math.abs(3.4-CONNECTION.height-.15)<1e-9,'requested 15 cm sill-to-floor drop');
const connectedFrame=cabinFrame(CONNECTION);
assert.ok(Math.abs(connectedFrame.z+DOCKING.cabinPassageOffset)<1e-9,'aircraft L1 aligns with right-hand glass-door passage');
assert.ok(Math.abs(metrics(CONNECTION).offset)<1e-9,'alignment measures passenger passage rather than cabin center');
for(const opening of [0,.2,.5,1]) {
  const doorCenter=-technicalConfig.aircraftDoor.slide*Math.max(0,(opening-.2)/.8);
  const left=doorCenter-technicalConfig.aircraftDoor.width/2-connectedFrame.z,right=doorCenter+technicalConfig.aircraftDoor.width/2-connectedFrame.z;
  assert.ok(left>=-1.24&&right<=1.24,'entire aircraft door panel stays within canopy width throughout opening');
}
console.log('PASS right-hand glass-door alignment and aircraft door canopy clearance');
for(const yaw of [-65,-38,0,38,65]){
  const panels=cabinCurtainPanels(yaw),a=yaw*Math.PI/180;
  assert.equal(panels.length,64,'two continuous circular bellows strips');
  for(const panel of panels) for(const point of [panel.from,panel.to]) {
    const radius=Math.hypot(...point);
    assert.ok(radius>=CABIN_SWIVEL_RADIUS-1e-9&&radius<=CABIN_SWIVEL_RADIUS+.035+1e-9,'pleats remain around the vertical pivot');
  }
  for(const start of [0,32]) {
    const end=panels[start+31].to;
    const tunnelZ=end[0]*Math.sin(a)+end[1]*Math.cos(a);
    assert.ok(Math.abs(Math.abs(tunnelZ)-1.27)<1e-9,'rear attachment remains fixed to tunnel');
    const front=panels[start].from;
    assert.ok(Math.abs(Math.abs(front[1])-1.39)<1e-9,'front attachment follows cabin frame');
    for(let i=start;i<start+31;i++)assert.deepEqual(panels[i].to,panels[i+1].from,'bellows have no gaps');
  }
}
console.log('PASS cylindrical cabin curtain at full yaw range');

// Configured travel stops apply to both target inputs and held console controls.
for (const [axis, low, high] of [['height',2,5.4],['angle',-87.5,87.5],['cabYaw',-65,65]]) {
  for (const [requested, expected] of [[low-10,low],[high+10,high]]) {
    const ready=initial();ready.power=true;ready.area=true;ready.authorized=true;
    const moved=command(ready,{type:'move',key:axis,value:requested});
    assert.equal(moved.target[axis],expected,`${axis} target clamps at travel stop`);
    const held=initial();held.power=true;held.area=true;held.authorized=true;
    held.pose[axis]=expected;held.target={...held.pose};
    const jogging=command(held,{type:'jog',axes:{[axis]:requested<low?-1:1}});
    assert.equal(tick(jogging,.05).pose[axis],expected,`${axis} jog cannot pass travel stop`);
  }
}
console.log('PASS cabin height, rotunda and cabin rotation travel stops');
