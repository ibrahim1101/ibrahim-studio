export const RESORT_CHAPTERS=['Arrival','Lobby','Corridors','Your suite','Bedroom','Living room','Bathroom','Terrace'];
export function resortProgress(top:number,height:number,viewport:number,count=8){return Math.max(0,Math.min(count-1,-top/Math.max(1,height-viewport)*(count-1)))}
export function photoBlend(progress:number,count:number){const p=Math.max(0,Math.min(count-1,progress)),from=Math.floor(p),to=Math.min(count-1,from+1),t=p-from;const x=Math.max(0,Math.min(1,(t-.25)/.65));return {from,to,mix:x*x*(3-2*x),travel:t}}

export const SUITE_LAYOUTS=[{id:'garden',side:-1,z:-18},{id:'ocean',side:1,z:-18},{id:'family',side:-1,z:-36},{id:'pool',side:1,z:-36}];
export function resortCameraPose(progress:number,id='ocean',roomOnly=false){
 const s=SUITE_LAYOUTS.find(s=>s.id===id)||SUITE_LAYOUTS[1],x=(v:number)=>v*s.side,z=s.z;
 const poses=[
 {at:0,position:[0,10,60],target:[0,3,-2]},
 {at:.4,position:[0,3.2,28],target:[0,2,8]},
 {at:.75,position:[0,1.8,14],target:[0,1.8,0]},
 {at:1,position:[0,1.7,5],target:[0,1.7,-6]},
 {at:2,position:[0,1.7,z+6],target:[x(5),1.7,z]},
 {at:2.45,position:[0,1.7,z],target:[x(8),1.7,z]},
 {at:3,position:[x(5),1.7,z],target:[x(11),1.4,z+2]},
 {at:4,position:[x(9),1.7,z-2],target:[x(12),1.1,z+3]},
 {at:5,position:[x(14),1.7,z-2],target:[x(16),1.2,z+2]},
 {at:5.5,position:[x(11),1.7,z-4],target:[x(6),1.2,z-8]},
 {at:6,position:[x(11),1.7,z-7],target:[x(6),1.1,z-7]},
 {at:6.5,position:[x(17),1.7,z-4.8],target:[x(24),1.6,z-4.8]},
 {at:6.75,position:[x(20),1.7,z-4.8],target:[x(40),1.8,z-15]},
 {at:7,position:[x(22),1.75,z-5],target:[x(70),2.3,z-25]}
 ];
 const p=Math.max(0,Math.min(7,(Number.isFinite(progress)?progress:0)+(roomOnly?3:0))),i=Math.max(0,poses.findIndex((v,n)=>n<poses.length-1&&p>=v.at&&p<=poses[n+1].at)),a=poses[i],b=poses[i+1],t=Math.max(0,Math.min(1,(p-a.at)/(b.at-a.at))),u=t*t*(3-2*t);
 return {position:a.position.map((v,j)=>v+(b.position[j]-v)*u),target:a.target.map((v,j)=>v+(b.target[j]-v)*u)};
}
