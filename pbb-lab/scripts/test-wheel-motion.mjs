import assert from 'node:assert/strict';
import { initial, command, tick, wheelMotion, wheelCommandLights } from '../lib/simulation.ts';
for (const sign of [-1,1]) {
 const start={...initial(),power:true,area:true,authorized:true};
 const steered=tick(command(start,{type:'jog',axes:{angle:sign}}),10);
 assert.equal(steered.wheelRotation,sign*90);
 assert.deepEqual(steered.pose,start.pose);
 assert.equal(steered.wheelTravel,0);
 assert.equal(steered.actualSpeed,0);
 assert.equal(wheelMotion(steered).direction,0);
 const released=command(steered,{type:'haltJog'});
 assert.equal(released.wheelRotation,sign*90);
 for(const drive of [-1,1]) {
  const moved=tick(command(released,{type:'jog',axes:{length:drive}}),1);
  assert.ok((moved.pose.angle-released.pose.angle)*sign*drive>0);
  assert.equal(wheelMotion(moved).direction,drive);
  const steeringOnly=tick(command(moved,{type:'jog',axes:{angle:-sign}}),.2);
  assert.deepEqual(steeringOnly.pose,moved.pose);
  for(const action of [{type:'haltJog'},{type:'emergency'},{type:'power',on:false},{type:'area',value:false}]) {
   const stopped=command(moved,action);
   assert.deepEqual(tick(stopped,1).pose,stopped.pose);
   assert.equal(wheelMotion(stopped).direction,0);
  }
 }
}
console.log('PASS steering-only ±90°, zero travel, retained heading, forward/reverse and interlocks');
let reversing={...initial(),power:true,area:true,authorized:true};
reversing=tick(command(reversing,{type:'jog',axes:{length:1}}),4);
reversing=command(reversing,{type:'jog',axes:{length:-1}});
reversing=tick(reversing,3);
assert(reversing.jog,'crossing zero speed must not cancel held joystick');
assert(reversing.jogVelocity.length<0,'reverse drive resumes after braking through zero');
const reverseLength=reversing.pose.length;
reversing=tick(reversing,1);
assert(reversing.pose.length<reverseLength,'bridge actually retracts while the reverse input stays held');
let fine={...initial(),power:true,area:true,authorized:true};
fine=command(fine,{type:'jog',axes:{length:.1}});
fine=tick(fine,1/120+1e-9);
assert(fine.jog,'tiny integration remainder is not a false travel limit');
fine=tick(fine,1);assert(fine.pose.length>initial().pose.length);
const stop=command({...initial(),power:true,area:true,authorized:true},{type:'jog',axes:{length:-1}});
assert.equal(tick(stop,.1).jog,null,'actual mechanical limit still stops drive');
console.log('PASS joystick reversal through zero, fine control and actual mechanical limits');
for(const sign of [-1,1]) {
 let steering={...initial(),power:true,area:true,authorized:true};
 steering=tick(command(steering,{type:'jog',axes:{angle:sign}}),1);
 assert.ok(Math.abs(steering.wheelRotation-sign*10)<1e-8,'steering turns slowly at 10 degrees/second');
 const lights=wheelCommandLights(steering);
 assert.deepEqual(lights,{forward:false,reverse:false,left:sign<0,right:sign>0});
 const next=tick(steering,1);assert.ok(Math.abs(next.wheelRotation-steering.wheelRotation-sign*10)<1e-8,'steering remains uniform');
 assert.deepEqual(wheelCommandLights(command(next,{type:'haltJog'})),{forward:false,reverse:false,left:false,right:false});
}
for(const sign of [-1,1]) {
 let drive={...initial(),power:true,area:true,authorized:true};drive.pose.length=13;drive.target={...drive.pose};
 drive=tick(command(drive,{type:'jog',axes:{length:sign}}),.5);
 assert.deepEqual(wheelCommandLights(drive),{forward:sign>0,reverse:sign<0,left:false,right:false});
 assert.deepEqual(wheelCommandLights(command(drive,{type:'emergency'})),{forward:false,reverse:false,left:false,right:false});
}
console.log('PASS uniform slow steering and four direction lamps, release and emergency');
