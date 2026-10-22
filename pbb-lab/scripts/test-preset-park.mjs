import assert from 'node:assert/strict';
import {initial,command,tick,PARK,CONNECTION,parked,moving} from '../lib/simulation.ts';
const ready=()=>({...initial(),power:true,area:true,authorized:true,pose:{...CONNECTION},target:{...CONNECTION}});
let s=command(ready(),{type:'park',held:true});
assert(s.presetPark);
const start={...s.pose};s=tick(s,1);
assert(s.pose.length<start.length);assert.equal(s.pose.angle,start.angle,'retract before swinging away');
assert(s.actualSpeed<=.35001);
s=command(s,{type:'haltPresetPark'});const released={...s.pose};s=tick(s,10);
assert.deepEqual(s.pose,released);assert(!moving(s));assert(!s.presetPark);
s=command(s,{type:'park',held:true});
for(let i=0;i<2400&&s.presetPark;i++)s=tick(s,.1);
assert(parked(s));assert.deepEqual(s.pose,PARK);assert(!s.presetPark);assert.equal(s.wheelRotation,0);
for(const action of [{type:'haltJog'},{type:'emergency'},{type:'power',on:false},{type:'area',value:false},{type:'authorize',value:false},{type:'pause'},{type:'mode',mode:'manual'}]) {
 let n=tick(command(ready(),{type:'park',held:true}),.4);n=command(n,action);const pose={...n.pose};n=tick(n,2);assert.deepEqual(n.pose,pose,action.type+' stops preset');assert(!n.presetPark);
}
for(const override of [{power:false},{area:false},{authorized:false},{emergency:true},{autoLevel:true}])assert(!command({...ready(),...override},{type:'park',held:true}).presetPark);
const canopy=ready();canopy.pose.canopy=1;canopy.target.canopy=1;assert(!command(canopy,{type:'park',held:true}).presetPark);
assert(!command({...initial(),power:true,area:true,authorized:true},{type:'park',held:true}).presetPark,'already parked stays still');
let other=command(ready(),{type:'jog',axes:{length:-1}});other=command(other,{type:'haltPresetPark'});assert(other.jog,'stale preset release cannot cancel joystick');
console.log('PASS preset park: hold/release/resume, slow retract then park, exact preset, safety interlocks and focus-loss halt.');
