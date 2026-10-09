import assert from 'node:assert/strict';
import {initial,command,tick,moving,parked,aligned,metrics,passengerAccess,PARK,CONNECTION} from '../lib/simulation.ts';
const settle=s=>{for(let i=0;i<6000&&moving(s);i++)s=tick(s,1/60);assert.ok(!moving(s),'movement reaches target');return s;};
let checks=0;const check=(value,label)=>{assert.ok(value,label);checks++;console.log('PASS '+label);};
let s=initial();s=command(s,{type:'move',key:'length',value:15});check(s.target.length===PARK.length,'power-off blocks movement');
s=command(s,{type:'power'});s=command(s,{type:'move',key:'length',value:15});check(s.target.length===PARK.length,'unconfirmed aircraft blocks approach');
s=command(s,{type:'area',value:true});s=command(s,{type:'authorize',value:true});s=command(s,{type:'canopy',open:true});check(s.target.canopy===0,'canopy blocked far from door');
s=command(s,{type:'move',key:'length',value:15.6});s=tick(s,.05);check(s.pose.length>PARK.length,'real animated movement');
s=command(s,{type:'emergency'});const frozen={...s.pose};for(let i=0;i<60;i++)s=tick(s,.05);check(JSON.stringify(s.pose)===JSON.stringify(frozen),'emergency freezes all axes immediately');
s=command(s,{type:'resetEmergency'});s=tick(s,.05);check(!moving(s),'emergency reset never resumes stale command');
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

const access=initial();access.area=true;access.authorized=true;access.pose={...CONNECTION,canopy:.95};
assert.equal(passengerAccess(access),false,'partial canopy cannot open aircraft door');
access.pose.canopy=1;assert.equal(passengerAccess(access),true,'completed aligned connection enables passengers');
access.pose.height=4;assert.equal(passengerAccess(access),false,'misaligned bridge cannot open door');
access.pose.height=3.4;access.serviceEnded=true;assert.equal(passengerAccess(access),false,'end of service closes passenger access');

assert.ok(CONNECTION.angle>30&&CONNECTION.cabYaw< -30,'diagonal tunnel and counter-rotated cabin');
assert.ok(aligned(CONNECTION),'diagonal pose seals at L1');
assert.ok(!aligned({...CONNECTION,cabYaw:0}),'canopy blocked without counter-rotation');

let directPark=initial();directPark.power=true;directPark.area=true;directPark.authorized=true;directPark.pose={...CONNECTION};directPark.target={...CONNECTION};
directPark=command(directPark,{type:'park'});assert.equal(directPark.target.angle,CONNECTION.angle,'retract before rotating back');directPark=settle(directPark);assert.ok(parked(directPark),'direct parking from diagonal connection completes');

assert.ok(Math.abs(metrics(CONNECTION).gap-.025)<1e-9,'requested 2.5 cm gap');assert.ok(Math.abs(3.4-CONNECTION.height-.15)<1e-9,'requested 15 cm sill-to-floor drop');

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
