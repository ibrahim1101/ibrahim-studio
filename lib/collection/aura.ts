import type {Item} from './data';
export const AURA_ROOMS=[
{id:'overview',name:'Residence',title:'A complete home. From the outside in.',note:'Begin outside the enclosed residence. Scroll towards the balcony entrance and into the furnished rooms.',position:[19,4.6,12],target:[-2,1.3,1.8],area:'Complete residence'},
{id:'living',name:'Living',title:'Make yourself at home.',note:'Look around the lounge, media wall and fitted furniture, all part of the same detailed model.',position:[2.8,.72,0],target:[1.5,.02,2.1],area:'Ground level · lounge'},
{id:'kitchen',name:'Kitchen',title:'The details of daily life.',note:'A fitted kitchen with appliances, island storage, a sink and individual fixtures.',position:[-3.2,.72,1.1],target:[-3.6,-.05,2.7],area:'Ground level · kitchen'},
{id:'balcony',name:'Balcony',title:'A little space outside.',note:'Step out to the apartment balcony, connected directly to the living area.',position:[6.8,.72,1.9],target:[0,.45,1.7],area:'Ground level · balcony'},
{id:'stairs',name:'Upper hall',title:'A different perspective.',note:'Follow the actual stair flights to the upper floor and recreation area.',position:[.2,3.48,-3],target:[2.6,2.8,-2.4],area:'Upper level · hall'},
{id:'bedroom',name:'Bedroom',title:'Room for a slower morning.',note:'A furnished bedroom with built-in storage, bedside details and a media wall.',position:[-6.6,3.48,3.8],target:[-9.5,2.6,2.0],area:'Upper level · bedroom'},
{id:'bathroom',name:'Bathroom',title:'Considered, down to the fixtures.',note:'Explore the upper bathroom, with its shower, vanity, mirror and sanitary fittings.',position:[-6.8,3.48,-.9],target:[-8.3,2.7,-2.2],area:'Upper level · bathroom'}];
const bridges=[
[[19,4.6,12],[13,3.2,8],[8,1.3,3.5],[6.7,.72,1.9],[4.1,.72,1.9],[4.1,.72,0],[2.8,.72,0]],
[[2.8,.72,0],[0,.72,-.2],[-1.8,.72,.8],[-3.2,.72,1.1]],
[[-3.2,.72,1.1],[-1.5,.72,.6],[0,.72,0],[4.1,.72,0],[4.1,.72,1.9],[6.8,.72,1.9]],
[[6.8,.72,1.9],[4.1,.72,1.9],[4.1,.72,0],[0,.72,0],[-2,.72,.7],[-4.2,.72,.65],[-4.2,1.95,-2],[-4.2,2.12,-2.7],[-2.9,2.12,-3],[-.45,3.48,-3],[.2,3.48,-3]],
[[.2,3.48,-3],[-.2,3.48,-1],[-.2,3.48,3.8],[-6.6,3.48,3.8]],
[[-6.6,3.48,3.8],[-7.5,3.48,3.8],[-7.5,3.48,.7],[-7.5,3.48,-.9],[-6.8,3.48,-.9]]];
const mix=(a:number[],b:number[],t:number)=>a.map((n,i)=>n+(b[i]-n)*t);
export function auraPose(progress:number){const p=Math.max(0,Math.min(AURA_ROOMS.length-1,Number.isFinite(progress)?progress:0)),i=Math.min(AURA_ROOMS.length-2,Math.floor(p)),t=p-i,s=t*t*(3-2*t),path=bridges[i],lengths=path.slice(1).map((q,k)=>Math.hypot(...q.map((v,j)=>v-path[k][j]))),distance=lengths.reduce((a,b)=>a+b,0)*s;let d=distance,segment=0;while(segment<lengths.length-1&&d>lengths[segment])d-=lengths[segment++];return {position:mix(path[segment],path[segment+1],lengths[segment]?d/lengths[segment]:0),target:mix(AURA_ROOMS[i].target,AURA_ROOMS[i+1].target,s)}}
export function auraProgress(top:number,height:number,viewport:number){return Math.max(0,Math.min(6,-top/Math.max(1,height-viewport)*6))}
export function auraMatches(items:Item[],budget:number,beds:number,type:string){return items.filter(i=>i.price<=budget&&i.capacity>=beds&&(type==='All'||i.tag===type))}
export function auraArea(item:Item){return Number(item.specs.find(s=>s[0]==='Area')?.[1].replace(/[^0-9.]/g,'')||0)}
