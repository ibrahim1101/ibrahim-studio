import fs from 'node:fs';import assert from 'node:assert/strict';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';import {Raycaster,Vector3,Box3} from 'three';import {auraPose} from '../lib/collection/aura.ts';
const source=fs.readFileSync(new URL('../public/models/aura/residence.glb',import.meta.url)),n=source.readUInt32LE(12),j=JSON.parse(source.subarray(20,20+n));
assert.equal(j.asset.extras.license,'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)');assert.equal(j.images.length,24);assert.equal(j.meshes.length,63);assert.ok(j.buffers.every(b=>!b.uri));assert.ok(j.images.every(i=>i.bufferView!==undefined));
console.log('Source:',j.asset.extras.title,'by',j.asset.extras.author,'|',j.meshes.length,'meshes,',j.images.length,'embedded textures');
// Geometry-only Node diagnostic. Runtime uses the complete original textures.
j.materials=j.materials.map(m=>({name:m.name,doubleSided:true}));j.images=[];j.textures=[];
const raw=Buffer.from(JSON.stringify(j)),json=Buffer.concat([raw,Buffer.alloc((4-raw.length%4)%4,32)]),header=Buffer.alloc(20);header.write('glTF');header.writeUInt32LE(2,4);header.writeUInt32LE(20+json.length+source.length-20-n,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);const packed=Buffer.concat([header,json,source.subarray(20+n)]);
const result=await new GLTFLoader().parseAsync(packed.buffer.slice(packed.byteOffset,packed.byteOffset+packed.byteLength),'');result.scene.updateMatrixWorld(true);
const meshes=[];result.scene.traverse(o=>{if(o.isMesh&&o.material.name!=='city'){if(o.userData.slidingDoor)o.position.set(.02,0,2.85);o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();meshes.push(o)}});
console.log('Residence:',meshes.length,'visible meshes; city backdrop excluded');
result.scene.updateMatrixWorld(true);const ray=new Raycaster(),collisions=new Map();
for(let p=.005;p<=6;p+=.005){const prev=auraPose(p-.005).position,next=auraPose(p).position;
 for(const h of [0,.6,1.25]){const a=new Vector3(...prev).sub(new Vector3(0,h,0)),b=new Vector3(...next).sub(new Vector3(0,h,0)),delta=b.clone().sub(a);ray.set(a,delta.clone().normalize());ray.far=delta.length();for(const hit of ray.intersectObjects(meshes,false)){const key=hit.object.material.name+'@'+Math.floor(p);if(!collisions.has(key))collisions.set(key,{p:+p.toFixed(3),h,name:hit.object.name,material:hit.object.material.name,point:hit.point.toArray().map(n=>+n.toFixed(3))})}}
}
console.log('Route crossings',JSON.stringify([...collisions.values()]));
assert.equal(collisions.size,0,'Guided walking path intersects geometry. Inspect the reported positions.');
for(let i=1;i<7;i++){const p=auraPose(i).position;assert.ok(new Box3().setFromObject(result.scene).containsPoint(new Vector3(...p)))}
const floors=meshes.filter(o=>['floor1','floor2','madera.003','top_floor1','top_floor2','stairs','pilar1'].includes(o.material.name));let min=Infinity,max=0;
let openRiserSamples=0;
for(let p=1;p<=6;p+=.005){const v=new Vector3(...auraPose(p).position);ray.set(v,new Vector3(0,-1,0));ray.far=8;const hit=ray.intersectObjects(floors,false)[0];const stairwell=p>3&&p<4&&v.x>-5.6&&v.x<-.6&&v.z>-4.3&&v.z<.6;if(stairwell&&(!hit||hit.distance>2.3)){openRiserSamples++;continue}assert.ok(hit,'Camera has no supporting floor at '+p);min=Math.min(min,hit.distance);max=Math.max(max,hit.distance);assert.ok(hit.distance>1.0&&hit.distance<2.3,'Unexpected eye height at '+p+': '+hit.distance)}
console.log('Open-riser gap samples on the bounded stair flights:',openRiserSamples);
console.log('Eye height over floor/stairs:',min.toFixed(2),max.toFixed(2));
console.log('PASS: complete asset parses and the camera/body route does not cross model surfaces.');
