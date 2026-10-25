import {test} from 'node:test';
import assert from 'node:assert/strict';
import {tourPose, tablePose, TABLES} from '../lib/restaurant/tour.ts';
test('tour camera stays finite and passes through the entrance corridor',()=>{
  for(let p=0;p<=3;p+=.01){const pose=tourPose(p);assert.ok([...pose.position,...pose.target].every(Number.isFinite));if(p>=1)assert.ok(Math.abs(pose.position[0])<1.2);assert.ok(pose.position[1]>=1.9);}
});
test('tour clamps out-of-range and invalid progress',()=>{assert.deepEqual(tourPose(-4),tourPose(0));assert.deepEqual(tourPose(90),tourPose(3));assert.deepEqual(tourPose(NaN),tourPose(0));});
test('every table has a distinct camera target matching its scene position',()=>{for(const t of TABLES)assert.deepEqual(tablePose(t.id).target,[t.x,1.25,t.z]);assert.equal(new Set(TABLES.map(t=>JSON.stringify(tablePose(t.id).target))).size,6)});
test('table inspection stays inside the dining room',()=>{for(const t of TABLES)for(let a=-1;a<=1;a+=.1){const p=tablePose(t.id,a).position;assert.ok(Math.abs(p[0])<7);assert.ok(p[2]>-17&&p[2]<1);}});

test('menu camera faces a real board with ordered, distinct dish targets',async()=>{
  const {DISHES,MENU_CAMERA,MENU_WALL,menuRowCenter}=await import('../lib/restaurant/menu.ts');
  assert.equal(DISHES.length,8);assert.equal(new Set(DISHES.map(d=>d.id)).size,8);
  assert.ok(MENU_CAMERA.position[2]>MENU_WALL.position[2]);
  let lastY=Infinity;for(let i=0;i<4;i++){const p=menuRowCenter(i);assert.ok(p[1]<lastY);lastY=p[1];assert.ok(Math.abs(p[0]-MENU_WALL.position[0])<MENU_WALL.width/2);assert.ok(Math.abs(p[1]-MENU_WALL.position[1])<MENU_WALL.height/2);assert.ok(DISHES[i].price>0&&DISHES[i].allergen.length>0)}
});

test('menu pages cover every dish exactly once and wrap in both directions',async()=>{const {DISHES,menuPageItems,menuPageCount,normalizeMenuPage,nextDishIndex}=await import('../lib/restaurant/menu.ts');assert.equal(menuPageCount(),2);const ids=Array.from({length:menuPageCount()},(_,p)=>menuPageItems(p)).flat().map(d=>d.id);assert.deepEqual(ids,DISHES.map(d=>d.id));assert.equal(normalizeMenuPage(-1),1);assert.equal(normalizeMenuPage(2),0);assert.equal(nextDishIndex(0,-1),7);assert.equal(nextDishIndex(7,1),0)});

test('menu plane keeps every corner on the physical board perspective',async()=>{const {menuPlaneMatrix}=await import('../lib/restaurant/projection.ts');for(const points of [[{x:80,y:90},{x:700,y:115},{x:680,y:850},{x:95,y:830}],[{x:10,y:10},{x:810,y:10},{x:810,y:933},{x:10,y:933}]]){const m=menuPlaneMatrix(800,923,points);[[0,0],[800,0],[800,923],[0,923]].forEach(([x,y],i)=>{const w=m[3]*x+m[7]*y+m[15];assert.ok(Math.abs((m[0]*x+m[4]*y+m[12])/w-points[i].x)<1e-6);assert.ok(Math.abs((m[1]*x+m[5]*y+m[13])/w-points[i].y)<1e-6)})}});
test('shared reservation validation rejects closed days, undersized tables and conflicts',async()=>{const {bookingError}=await import('../lib/restaurant/booking.ts');const r={date:'2026-11-17',time:'19:00',guests:4,table:'T3',requests:''};assert.equal(bookingError(r,[],null,'2026-10-23'),'');assert.match(bookingError({...r,date:'2026-11-16'},[],null,'2026-10-23'),/Mondays/);assert.match(bookingError({...r,table:'T1'},[],null,'2026-10-23'),/enough seats/);assert.match(bookingError(r,[{id:'x',...r}],null,'2026-10-23'),/already reserved/);assert.equal(bookingError(r,[{id:'x',...r}],'x','2026-10-23'),'')});

test('dish ratings aggregate actual review values and reject invalid submissions',async()=>{const {ratingSummary,sampleReviews,reviewError}=await import('../lib/restaurant/reviews.ts');const reviews=sampleReviews('burrata');assert.equal(ratingSummary(reviews).count,3);assert.equal(ratingSummary(reviews).average,14/3);assert.deepEqual(ratingSummary(reviews).distribution,[2,1,0,0,0]);assert.equal(ratingSummary([]).average,0);assert.match(reviewError(0,'A useful review here'),/rating/);assert.match(reviewError(4,'short'),/10/);assert.equal(reviewError(4,'Enjoyed the flavour of this dish.'),'');assert.equal(ratingSummary([...reviews,{stars:1}]).average,3.75)});

test('camera travel has continuous speed across chapter boundaries',()=>{const e=1e-5;for(const knot of [1,2]){const left=tourPose(knot-e),at=tourPose(knot),right=tourPose(knot+e);for(const key of ['position','target'])for(let j=0;j<3;j++){const before=(at[key][j]-left[key][j])/e,after=(right[key][j]-at[key][j])/e;assert.ok(Math.abs(before-after)<.003)}assert.ok(Math.abs((right.position[2]-left.position[2])/(2*e))>1)}});
