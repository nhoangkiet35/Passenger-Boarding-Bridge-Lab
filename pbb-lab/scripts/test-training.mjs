import assert from 'node:assert/strict';
import { command, initial, tick, CONNECTION, geometry, moving, passengerAccess, metrics, limits } from '../lib/simulation.ts';
import { collision, bridgeVolumes } from '../lib/collision.ts';
import { technicalConfig as c } from '../lib/technicalConfig.ts';
let checks=0;
const check=(ok,name)=>{assert.ok(ok,name);checks++;console.log('PASS training: '+name);};
const ready=()=>{let s=initial();for(const cmd of [{type:'power',on:true},{type:'area',value:true},{type:'authorize',value:true}])s=command(s,cmd);return s;};
const run=(s,seconds,fps=60)=>{for(let i=0;i<Math.round(seconds*fps);i++)s=tick(s,1/fps);return s;};
const docked=()=>{const s=ready();s.pose={...CONNECTION};s.target={...s.pose};return command(s,{type:'autolevel',on:true});};
for(const fps of [15,60,144]){
  let manual=ready();manual.pose={...CONNECTION};manual.target={...manual.pose};
  manual=command(manual,{type:'canopy',open:true});
  manual=run(manual,.5,fps);
  check(!manual.autoLevel&&manual.pose.canopy<.999,`partial canopy does not activate autolevel at ${fps} FPS`);
  manual=run(manual,2,fps);
  check(manual.autoLevel&&manual.pose.canopy===1,`manual canopy automatically activates autolevel at ${fps} FPS`);
  const activation=manual.pose.height;
  manual=run(manual,3,fps);
  check(manual.passengerLoadDeflection>0&&Math.abs(manual.pose.height-activation)>1e-8,`passenger load produces corrected height movement at ${fps} FPS`);
  check(!manual.fault&&Math.abs(metrics(manual.pose,manual.aircraftShift).heightError)<=c.autoLevel.deadband+.000001&&passengerAccess(manual),`load compensation preserves door access and height at ${fps} FPS`);
  check(command(manual,{type:'autolevel',on:false}).autoLevel,'active passenger service cannot disable height protection');
  manual=command(manual,{type:'service'});
  check(!manual.autoLevel&&!passengerAccess(manual),'end of service retracts sensor and closes access');
  const unloaded=manual.passengerLoadDeflection;
  manual=run(manual,1,fps);
  check(manual.passengerLoadDeflection===unloaded,'passenger loading stops after service');
}
for(const fps of [15,30,60,144]){
  let s=command(ready(),{type:'move',key:'length',value:13.5});s=run(s,1,fps);
  check(Math.abs(s.pose.length-13.3)<1e-9,`time integration at ${fps} FPS`);
}
let s=docked();check(s.autoLevel,'autolevel enabled only after alignment');
for(const cmd of [{type:'move',key:'height',value:4},{type:'move',key:'cabYaw',value:0},{type:'jog',axes:{length:1}},{type:'park'}])check(!moving(command(s,cmd)),`autolevel locks ${cmd.type} ${cmd.key??''}`);
s=command(s,{type:'canopy',open:true});s=run(s,2);check(s.pose.canopy===1,'canopy deployment allowed after autolevel activation');
s=command(s,{type:'aircraftShift',value:.1});s=run(s,2);check(Math.abs(metrics(s.pose,s.aircraftShift).heightError)<=c.autoLevel.deadband+.000001,'autolevel preserves initial level difference');
check(passengerAccess(s),'passenger access after autolevel settles');
s=command(s,{type:'aircraftShift',value:-.3});s=tick(s,1/60);check(!!s.fault&&!s.power&&!s.autoLevel,'tracking error stops and latches fault');
const p={...s.pose};s=run(s,2);check(JSON.stringify(p)===JSON.stringify(s.pose),'fault prevents drift');
for(const key of ['obstacle','autolevelFault','powerLoss','wind','auxDeployed']){
  let f=command(ready(),{type:'move',key:'length',value:16});f=command(f,{type:'scenario',key,active:true});
  check(!!f.fault&&!moving(f)&&!f.power,`${key} aborts commands`);
  check(!!command(f,{type:'resetFault'}).fault,`${key} cannot reset while cause remains`);
  f=command(f,{type:'scenario',key,active:false});f=command(f,{type:'resetFault'});
  check(!f.fault&&!f.power&&!moving(f),`${key} clear never restarts old motion`);
}
for(let l=limits.length[0];l<=limits.length[1];l+=.5)for(const h of [2,3,5.4])for(const angle of [-87.5,0,87.5]){
  const p={...CONNECTION,length:l,height:h,angle};const g=geometry(p);
  assert.ok(g.overlap>=c.minimumOverlap);
  assert.ok(Math.abs(g.centres[0]-c.tunnelSegment/2)<1e-10);
  assert.ok(Math.abs(g.centres[2]+c.tunnelSegment/2-g.slant)<1e-10);
  assert.equal(g.wheel.y,0);
  assert.ok(Math.abs(g.columnDeckHeight-(3+(h-3)*(l-c.carriageOffset)/l))<1e-10);
}
check(true,'297 full-travel geometry poses: tunnel endpoints, overlap, wheel ground, lift height');
s=ready();const w=geometry(s.pose).wheel;s=command(s,{type:'obstacle',obstacle:{id:'person',kind:'person',x:w.x+2,z:w.z,radius:.35,height:1.8}});s=command(s,{type:'move',key:'length',value:16});s=run(s,3,15);check(!!s.fault&&!moving(s),'swept substeps stop before person at low FPS');
s=command(s,{type:'clearObstacles'});s=command(s,{type:'resetFault'});check(!s.fault&&!s.power,'collision recovery requires new power and command');
check(collision({...CONNECTION,angle:-87.5,length:28},[])?.includes('nhà ga'),'terminal collision volume');
check(bridgeVolumes(CONNECTION).some(v=>v.part==='Tunnel'),'tunnel has independent collision volumes');
s=command(ready(),{type:'move',key:'height',value:5.4});s=run(s,10);check(geometry(s.pose).valid,'height movement respects slope');
s=command(docked(),{type:'emergency'});s=command(s,{type:'resetEmergency'});check(!s.power&&!s.autoLevel&&!moving(s),'emergency reset preserves power-off and stopped autolevel');
check(s.log.length>0,'commands recorded in bounded log');
check(command(initial(),{type:'aircraftShift',value:NaN}).aircraftShift===0,'invalid training input rejected');
console.log(`${checks} new training checks passed.`);
