import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Group, CylinderGeometry, BoxGeometry } from 'three';
import { newMission, serviceMount, serviceIds, groundConfig, heldConnector, cableControlPoints, cableLength, serviceAction } from '../lib/groundOps.ts';
import { CONNECTION, cabinFrame } from '../lib/simulation.ts';
import { planCable, pullCableRoute, cableCurve, clearCableSegment } from '../lib/groundCable.ts';
import {mobileStepsConfig,mobileTreads,mobileWorld} from '../lib/mobileSteps.ts';
const m=newMission();m.started=true;m.checks.fill(true);m.docked=true;m.descended=true;m.bridge.pose={...CONNECTION};
for(const id of serviceIds){
 const mount=serviceMount(m,id),cfg=groundConfig.services[id];
 assert.ok(mount.anchor[1]>1,'anchor must be on existing bridge equipment');
 assert.ok(mount.pickup[1]<=1.1,'pickup must be reachable from apron');
 const plan=planCable(m,id,cfg.socket,()=>true);assert.ok(plan,`${id} must reach aircraft from bridge`);
 assert.ok(plan.length<cfg.maxLength);assert.ok(plan.curve.getPoints(50).every(p=>p.y>=.15));
 const points=cableControlPoints(m,id,cfg.socket,plan.route);assert.deepEqual(points[0],mount.anchor);assert.deepEqual(points.at(-1),cfg.socket);
 const tooFar=[mount.guide[0]+cfg.maxLength+5,1,mount.guide[2]];assert.equal(planCable(m,id,tooFar,()=>true),null);
 const raised={...m,bridge:{...m.bridge,pose:{...m.bridge.pose,height:4.5,angle:m.bridge.pose.angle+10,cabYaw:20,length:24}}};
 assert.notDeepEqual(serviceMount(raised,id).anchor,mount.anchor,`${id} must follow bridge pose`);
 if(id==='PWS')assert.equal(serviceMount(raised,id).anchor[1],1.3,'PWS cabinet stays at carriage ground height');
}
const f=cabinFrame(CONNECTION),gpu=serviceMount(m,'GPU');
assert.ok(Math.abs(gpu.anchor[0]-(f.x+.83))<1e-8);assert.ok(Math.abs(gpu.anchor[2]-(f.z+.7))<1e-8);
// Pull around a rectangular obstacle, keep the bend, and shorten it once clear.
const clear=(a,b)=>{for(let i=0;i<=100;i++){const x=a[0]+(b[0]-a[0])*i/100,z=a[2]+(b[2]-a[2])*i/100;if(x>1&&x<2&&Math.abs(z)<1)return false;}return true;};
const guide=[0,.16,0];let route=[];
for(const p of [[0,1.1,2],[3,1.1,2],[3,1.1,0]]){route=pullCableRoute(route,guide,p,clear);assert.ok(route);}
assert.ok(route.length>=3,'must retain the bends around the obstacle');
for(let i=1;i<route.length;i++)assert.ok(clear(route[i-1],route[i]));
const short=pullCableRoute(route,guide,[0,1.1,.2],clear);assert.equal(short.length,2);
assert.equal(pullCableRoute([guide],guide,[1.5,1,0],clear),null);
const hand=heldConnector([1,0,2],0);assert.ok(hand[2]<2&&hand[1]>1&&hand[0]>1);
// A cable already connected may not be energized before locking; wrong types remain rejected.
let mission={...m,services:{GPU:'carrying',PCA:'idle',PWS:'idle'}};
const wrong=serviceAction(mission,'PCA','socket',[4,0,2]);assert.equal(wrong.services.PCA,'idle');
const curve=cableCurve([[0,2,0],[0,.16,0],[2,.16,0],[2,1,0]]);
assert.ok(curve.getLength()<=cableLength([[0,2,0],[0,.16,0],[2,.16,0],[2,1,0]]));
assert.deepEqual(newMission().cableRoutes,{GPU:[],PCA:[],PWS:[]});
// Check the same rounded cable paths against the actual rendered aircraft hull mesh.
const hooks=registerHooks({resolve(specifier,context,next){return next(specifier.startsWith('@/')?new URL('../'+specifier.slice(2)+'.ts',import.meta.url).href:specifier,context);}});
const {aircraftHull}=await import('../components/pbb/aircraftGeometry.ts');hooks.deregister();
const hull=new Mesh(aircraftHull(),new MeshBasicMaterial({side:DoubleSide}));hull.position.set(7,0,8);hull.updateMatrixWorld(true);
const ray=new Raycaster();
for(const id of serviceIds){const cfg=groundConfig.services[id];assert.ok(planCable(m,id,cfg.socket,(a,b)=>clearCableSegment(a,b,hull,ray,cfg.radius)),`${id} path to underside port must clear the actual hull`);}
assert.equal(clearCableSegment([4,4,2],[10,4,2],hull,ray,.04),false,'reject cable through fuselage');
const apron=new Group();apron.add(hull);
for(const x of [4.29,4.91]){const wheel=new Mesh(new CylinderGeometry(.52,.52,.32,32),new MeshBasicMaterial({side:DoubleSide}));wheel.rotation.z=Math.PI/2;wheel.position.set(x,.52,15.1);apron.add(wheel);}
apron.updateMatrixWorld(true);
const waterClear=(a,b)=>clearCableSegment(a,b,apron,ray,groundConfig.services.PWS.radius);
assert.equal(planCable(m,'PWS',groundConfig.services.PWS.socket,waterClear),null,'straight PWS path must not pass through main landing gear');
const walking={...m,cableRoutes:{...m.cableRoutes,PWS:[]}};
for(let z=serviceMount(m,'PWS').guide[2];z<=22;z+=.4){const pulled=planCable(walking,'PWS',[2.5,1.15,z],waterClear);assert.ok(pulled,`PWS can be pulled around gear at z=${z}`);walking.cableRoutes.PWS=pulled.route;}
const connected=planCable(walking,'PWS',groundConfig.services.PWS.socket,waterClear);assert.ok(connected,'PWS connects after walking around landing gear');assert.ok(connected.route.length>2,'keep bends around gear after connection');
// Walk up the actual shared tread geometry while holding PWS; keep the hose outside the stair frame.
walking.mobileSteps={...walking.mobileSteps,x:mobileStepsConfig.target[0],z:mobileStepsConfig.target[2],phase:'locked',climbed:true};
const ladderMesh=new Group();ladderMesh.position.set(walking.mobileSteps.x,0,walking.mobileSteps.z);
for(const tread of mobileTreads()){const mesh=new Mesh(new BoxGeometry(...tread.size),new MeshBasicMaterial({side:DoubleSide}));mesh.position.set(...tread.at);ladderMesh.add(mesh);}
apron.add(ladderMesh);apron.updateMatrixWorld(true);
for(let x=-3.8;x<=0;x+=.12){const floor=Math.max(0,Math.min(1.5,1.5*Math.ceil((x+3.6)/.3)/10)),p=mobileWorld(walking.mobileSteps,x,floor,0),hand=heldConnector(p,-Math.PI/2);const climbed=planCable(walking,'PWS',hand,waterClear);assert.ok(climbed,`hose clears mobile treads at x=${x}`);walking.cableRoutes.PWS=climbed.route;}
assert.ok(planCable(walking,'PWS',groundConfig.services.PWS.socket,waterClear),'hose reaches tail port from locked platform without cutting through treads');
apron.remove(ladderMesh);ladderMesh.children.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});
apron.children.filter(child=>child!==hull).forEach(wheel=>{wheel.geometry.dispose();wheel.material.dispose();});
hull.geometry.dispose();hull.material.dispose();
console.log('PASS bridge-mounted leads: exact GPU/PCA/PWS transforms, apron pickups, reach/length limits, rounded tubes, hand position, obstacle bends, wrong connector and reset.');
