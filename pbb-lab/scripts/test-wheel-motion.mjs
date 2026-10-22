import assert from 'node:assert/strict';
import { initial, command, tick, wheelMotion } from '../lib/simulation.ts';
for (const sign of [-1,1]) {
 const start={...initial(),power:true,area:true,authorized:true};
 const steered=tick(command(start,{type:'jog',axes:{angle:sign}}),6);
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
