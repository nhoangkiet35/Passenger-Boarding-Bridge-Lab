import assert from 'node:assert/strict';
import { initial, command, tick, PARK, CONNECTION, CABIN_OFFSET, cabinView, cabinFrame, aligned, metrics, moving } from '../lib/simulation.ts';
let count=0;
const check=(ok,label)=>{assert.ok(ok,label);count++;console.log('PASS console: '+label);};
const ready=()=>{let s=initial();for(const c of [{type:'power',on:true},{type:'area',value:true},{type:'authorize',value:true}])s=command(s,c);return s;};
const run=(s,seconds=1)=>{for(let i=0;i<seconds*60;i++)s=tick(s,1/60);return s;};
let s=command(initial(),{type:'jog',axes:{length:1}});check(!s.jog,'joystick requires power');
s=command(initial(),{type:'power',on:true});s=command(s,{type:'jog',axes:{length:1}});check(!s.jog,'joystick requires both clearance checks');
s=command(ready(),{type:'mode',mode:'guide'});s=command(s,{type:'jog',axes:{length:1}});check(!s.jog,'AUTO blocks manual joystick');
s=command(ready(),{type:'move',key:'height',value:4});s=command(s,{type:'jog',axes:{length:1,angle:.5}});s=run(s);
check(s.pose.length>PARK.length+.4&&s.pose.angle>PARK.angle+.9&&s.pose.height===3,'proportional jog moves two axes and cancels previous targets');
s=command(s,{type:'haltJog'});let held=structuredClone(s.pose);s=run(s);check(JSON.stringify(s.pose)===JSON.stringify(held)&&!moving(s),'release stops exactly without coasting');
for(const action of [{type:'emergency'},{type:'power',on:false},{type:'area',value:false},{type:'authorize',value:false},{type:'pause'},{type:'mode',mode:'guide'}]){
  let n=run(command(ready(),{type:'jog',axes:{height:1}}),.2);n=command(n,action);const pose=structuredClone(n.pose);n=run(n);check(!n.jog&&JSON.stringify(n.pose)===JSON.stringify(pose),action.type+' clears held control');
}
s=ready();s.pose={...CONNECTION};s.target={...s.pose};s=command(s,{type:'canopy',open:true});s=run(s,2);s=command(s,{type:'jog',axes:{cabYaw:1}});check(!s.jog&&s.pose.cabYaw===CONNECTION.cabYaw,'deployed canopy locks cabin rotation');
s=ready();s=command(s,{type:'jog',axes:{floorTilt:1}});s=run(s,10);check(s.pose.floorTilt===3&&!s.jog,'floor stops at mechanical range');
let p={...CONNECTION};check(aligned(p),'standard connection pose remains valid');check(!aligned({...p,floorTilt:1}),'tilted floor blocks canopy deployment');
const before=cabinView(p),rotated=cabinView({...p,cabYaw:CONNECTION.cabYaw+10}),raised=cabinView({...p,height:4});
check(Math.abs(raised.position[1]-before.position[1]-(4-CONNECTION.height))<1e-9,'CCTV rises with cabin');
const rotatedFrame=cabinFrame({...p,cabYaw:CONNECTION.cabYaw+10}),baseFrame=cabinFrame(p);
check(rotated.target[2]>before.target[2]&&Math.abs((rotatedFrame.x-CABIN_OFFSET*Math.cos(rotatedFrame.heading))-(baseFrame.x-CABIN_OFFSET*Math.cos(baseFrame.heading)))<1e-9&&Math.abs((rotatedFrame.z-CABIN_OFFSET*Math.sin(rotatedFrame.heading))-(baseFrame.z-CABIN_OFFSET*Math.sin(baseFrame.heading)))<1e-9,'CCTV and offset cabin turn around a stationary bridge pivot');
check(Math.abs(before.target[2]-before.position[2])<1e-9&&rotated.target[2]-rotated.position[2]>0,'fixed camera orientation, no aircraft auto-tracking');
s=ready();s.pose={...p,length:CONNECTION.length-.05};s.target={...s.pose};s=command(s,{type:'jog',axes:{cabYaw:1}});s=run(s,10);check(metrics(s.pose).clearance>=.02&&!s.jog,'rotating cabin corner cannot cross safety plane');
s=ready();s=command(s,{type:'aux',key:'aircon'});s=run(s,10);check(s.temperature<27&&s.aux.aircon,'air conditioning changes simulated temperature');s=command(s,{type:'reset'});check(!s.aux.aircon&&s.temperature===27&&s.pose.cabYaw===0,'full reset includes all console equipment');
console.log(`${count} console/camera checks passed.`);
