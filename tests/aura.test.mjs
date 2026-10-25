import {test} from 'node:test';import assert from 'node:assert/strict';
import {AURA_ROOMS,auraPose,auraProgress,auraMatches,auraArea} from '../lib/collection/aura.ts';
import {auraLook,auraDrag,auraOrbit} from '../lib/collection/aura-look.ts';import {getWorld} from '../lib/collection/data.ts';
test('residence stations match the imported two-level apartment and clamp progress',()=>{
 assert.equal(new Set(AURA_ROOMS.map(r=>r.id)).size,7);
 for(let i=0;i<7;i++)assert.ok(auraPose(i).position.every((v,k)=>Math.abs(v-AURA_ROOMS[i].position[k])<1e-9));
 assert.deepEqual(auraPose(-4),auraPose(0));assert.deepEqual(auraPose(99),auraPose(6));assert.deepEqual(auraPose(NaN),auraPose(0));assert.equal(auraProgress(100,7000,1000),0);assert.equal(auraProgress(-6000,7000,1000),6);
 let prev=auraPose(0).position;for(let p=.001;p<6;p+=.001){const now=auraPose(p).position;assert.ok(now.every(Number.isFinite));assert.ok(Math.hypot(...now.map((v,i)=>v-prev[i]))<.15);assert.ok(now[1]>=.719);prev=now}
 for(let i=1;i<=3;i++)assert.equal(AURA_ROOMS[i].position[1],.72);for(let i=4;i<=6;i++)assert.equal(AURA_ROOMS[i].position[1],3.48);
});
test('camera ascends both stair flights continuously to the upper hall',()=>{
 let last=.72;for(let p=3;p<=4;p+=.001){const y=auraPose(p).position[1];assert.ok(y>=last-1e-10);last=y}assert.ok(last>3.479);
 assert.ok(auraPose(3.75).position[1]>.72);assert.equal(auraPose(5).position[1],3.48);
});
test('mouse look supports a full turn, clamps pitch and preserves camera position',()=>{
 const position=[2.8,.72,0],target=[1.5,.02,2.1],distance=Math.hypot(...target.map((v,i)=>v-position[i]));
 const copy=[...position];for(const yaw of [-4*Math.PI,-Math.PI,0,Math.PI,4*Math.PI])for(const pitch of [-99,0,99]){const t=auraLook(position,target,yaw,pitch);assert.ok(t.every(Number.isFinite));assert.ok(Math.abs(Math.hypot(...t.map((v,i)=>v-position[i]))-distance)<1e-9)}assert.deepEqual(position,copy);
 assert.ok(auraLook([0,0,0],[0,0,-1],auraDrag(0,0,100,0).yaw,0)[0]>0,'dragging right turns the view right');
 const turn=auraLook(position,target,Math.PI*2,0);assert.ok(turn.every((v,i)=>Math.abs(v-target[i])<1e-9));assert.equal(auraDrag(0,0,0,-99999).pitch,1.4);
});
test('dollhouse orbits preserve distance and stay above the selected floor',()=>{
 const target=[-2.7,.5,.8],eye=[17,16,21],radius=Math.hypot(...eye.map((v,i)=>v-target[i]));for(const yaw of [0,1,10,Math.PI*2])for(const pitch of [-10,0,10]){const p=auraOrbit(eye,target,yaw,pitch);assert.ok(p[1]>target[1]);assert.ok(Math.abs(Math.hypot(...p.map((v,i)=>v-target[i]))-radius)<1e-9)}
});
test('property finder combines budget, bedrooms and residence type accurately',()=>{const items=getWorld('real-estate').items;assert.deepEqual(auraMatches(items,10000000,2,'All').map(p=>p.id),['loft']);assert.deepEqual(auraMatches(items,25000000,4,'Villa').map(p=>p.id),['courtyard']);assert.equal(auraMatches(items,10000000,4,'All').length,0);assert.equal(auraArea(items[0]),3200);assert.equal(auraArea(items[1]),1450)});
