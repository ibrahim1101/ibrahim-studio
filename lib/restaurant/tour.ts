/** The tour follows the centre aisle through the open front door. */
export const TABLES = [
  { id: 'T1', capacity: 2, x: -3.35, z: -3.5, name: 'Window for two' },
  { id: 'T2', capacity: 2, x: 3.35, z: -3.5, name: 'Quiet corner' },
  { id: 'T3', capacity: 4, x: -3.35, z: -8, name: 'Garden view' },
  { id: 'T4', capacity: 4, x: 3.35, z: -8, name: 'The central table' },
  { id: 'T5', capacity: 6, x: -3.35, z: -13, name: 'Friends & family' },
  { id: 'T6', capacity: 8, x: 3.35, z: -13, name: 'The gathering' },
];
export type Pose = { position: number[]; target: number[] };
// Exterior, threshold, reception, dining aisle. Eye-level interior views.
const stops: Pose[] = [
  { position: [12, 5.1, 26], target: [0, 2.6, 4] },
  { position: [0, 2.25, 11.8], target: [0, 2.1, 3] },
  { position: [0, 1.95, 4.8], target: [-1.8, 1.6, -.5] },
  { position: [0, 2.1, -1.5], target: [0, 1.65, -10] },
];
// Shape-preserving cubic interpolation keeps speed continuous through chapter boundaries.
function curve(values:number[],i:number,t:number){const delta=values.slice(1).map((v,j)=>v-values[j]);const tangent=(j:number)=>j===0?delta[0]:j===3?delta[2]:delta[j-1]*delta[j]<=0?0:2*delta[j-1]*delta[j]/(delta[j-1]+delta[j]);const a=values[i],b=values[i+1],m=tangent(i),n=tangent(i+1),t2=t*t,t3=t2*t;return (2*t3-3*t2+1)*a+(t3-2*t2+t)*m+(-2*t3+3*t2)*b+(t3-t2)*n}
export function tourPose(progress:number):Pose{const p=Math.max(0,Math.min(3,Number.isFinite(progress)?progress:0)),i=Math.min(2,Math.floor(p)),t=p-i;return {position:[0,1,2].map(j=>curve(stops.map(s=>s.position[j]),i,t)),target:[0,1,2].map(j=>curve(stops.map(s=>s.target[j]),i,t))}}
export function tablePose(id: string, angle = 0): Pose {
  const table = TABLES.find(t => t.id === id) || TABLES[0];
  const side = table.x < 0 ? 1 : -1;
  return {
    position: [table.x + side * (2.1 + Math.sin(angle) * .6), 2.2, table.z + 2.6 + Math.cos(angle) * .2],
    target: [table.x, 1.25, table.z],
  };
}
