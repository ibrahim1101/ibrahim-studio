import {test} from 'node:test';
import assert from 'node:assert/strict';
import {worlds,getWorld,nightsBetween,cartTotal} from '../lib/collection/data.ts';
test('all four new categories contain unique usable catalogues',()=>{assert.equal(worlds.length,4);for(const w of worlds){assert.equal(getWorld(w.id),w);assert.equal(w.items.length,4);assert.equal(new Set(w.items.map(i=>i.id)).size,4);for(const i of w.items){assert.ok(i.price>0);assert.ok(i.specs.length>=4);assert.ok(i.image.startsWith('photo-'));assert.ok(i.capacity>=1)}}assert.equal(getWorld('missing'),undefined)});
test('hotel nights use calendar days independently of local DST',()=>{assert.equal(nightsBetween('2026-11-17','2026-11-20'),3);assert.equal(nightsBetween('2026-11-17','2026-11-17'),0);assert.equal(nightsBetween('2026-11-20','2026-11-17'),0);assert.equal(nightsBetween('',''),0)});
test('cart discounts and delivery match displayed rules',()=>{assert.deepEqual(cartTotal([]),{subtotal:0,saving:0,shipping:0,total:0});assert.deepEqual(cartTotal([{price:12500,qty:1}],true),{subtotal:12500,saving:1250,shipping:350,total:11600});assert.deepEqual(cartTotal([{price:8900,qty:2}]),{subtotal:17800,saving:0,shipping:0,total:17800})});

test('resort walkthrough clamps scroll and blends consecutive photographic chapters',async()=>{const {resortProgress,photoBlend,RESORT_CHAPTERS}=await import('../lib/collection/resort-tour.ts');assert.equal(RESORT_CHAPTERS.length,8);assert.equal(resortProgress(0,8000,1000),0);assert.equal(resortProgress(-7000,8000,1000),7);assert.equal(resortProgress(-9000,8000,1000),7);assert.equal(resortProgress(400,8000,1000),0);for(let p=0;p<=7;p+=.01){const b=photoBlend(p,8);assert.ok(b.from>=0&&b.to<=7);assert.ok(b.mix>=0&&b.mix<=1);assert.ok(b.to-b.from<=1)}assert.equal(photoBlend(1,8).mix,0);assert.equal(photoBlend(1.9,8).mix,1)});

test('connected resort cameras travel from common lobby through distinct suite doorways',async()=>{const {resortCameraPose,SUITE_LAYOUTS}=await import('../lib/collection/resort-tour.ts');const entries=new Set();for(const suite of SUITE_LAYOUTS){assert.deepEqual(resortCameraPose(1,suite.id).position,[0,1.7,5]);assert.deepEqual(resortCameraPose(3,suite.id).position,[5*suite.side,1.7,suite.z]);entries.add(JSON.stringify(resortCameraPose(3,suite.id).position));assert.deepEqual(resortCameraPose(0,suite.id,true),resortCameraPose(3,suite.id));let prev=resortCameraPose(0,suite.id).position;for(let p=.001;p<7;p+=.001){const point=resortCameraPose(p,suite.id).position;assert.ok(point.every(Number.isFinite));assert.ok(Math.hypot(...point.map((v,i)=>v-prev[i]))<.2);assert.ok(point[1]>=1.65);prev=point}assert.equal(resortCameraPose(7,suite.id).position[0],22*suite.side)}assert.equal(entries.size,4)});

test('interactive stay planner prices experiences once per guest',async()=>{const {stayTotal}=await import('../lib/collection/stay-planner.ts');assert.deepEqual(stayTotal(22000,3,4,['spa','breakfast']),{room:66000,experiences:9600,total:75600});assert.deepEqual(stayTotal(8500,2,2,['spa','shore']),{room:17000,experiences:14400,total:31400});assert.deepEqual(stayTotal(8500,2,2,['breakfast']),{room:17000,experiences:0,total:17000})});


test('resort entrance and terrace route clear the wall openings and keep the horizon in view',async()=>{const {resortCameraPose,SUITE_LAYOUTS}=await import('../lib/collection/resort-tour.ts');for(const suite of SUITE_LAYOUTS){
 // At the front facade the camera must remain in the central portal, below its header.
 for(let p=.4;p<=1;p+=.001){const [x,y,z]=resortCameraPose(p,suite.id).position;if(z>9.5&&z<10.5){assert.ok(Math.abs(x)<3);assert.ok(y<3)}}
 // Corridor side walls have a doorway only around the suite centreline.
 for(let p=2;p<3;p+=.001){const [x,,z]=resortCameraPose(p,suite.id).position;if(Math.abs(Math.abs(x)-3)<.2)assert.ok(Math.abs(z-suite.z)<2)}
 // Terrace glazing has a real door opening from z-6.5 to z-3.5.
 for(let p=6;p<=7;p+=.001){const [x,,z]=resortCameraPose(p,suite.id).position;if(Math.abs(Math.abs(x)-19.5)<.15)assert.ok(z>suite.z-6.5&&z<suite.z-3.5)}
 const end=resortCameraPose(7,suite.id);assert.ok(Math.abs(end.target[0])>Math.abs(end.position[0])+30);assert.ok(end.target[1]>end.position[1]);
}});
