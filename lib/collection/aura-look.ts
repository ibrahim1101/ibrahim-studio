/** Mouse/keyboard look offsets preserve the guided camera position. */
export function auraLook(position:number[],target:number[],yaw:number,pitch:number){
 const [dx,dy,dz]=target.map((n,i)=>n-position[i]),distance=Math.hypot(dx,dy,dz)||1;
 const azimuth=Math.atan2(dx,dz)+yaw,elevation=Math.max(-Math.PI*.46,Math.min(Math.PI*.46,Math.asin(Math.max(-1,Math.min(1,dy/distance)))+pitch));
 return [position[0]+Math.sin(azimuth)*Math.cos(elevation)*distance,position[1]+Math.sin(elevation)*distance,position[2]+Math.cos(azimuth)*Math.cos(elevation)*distance];
}
export function auraDrag(yaw:number,pitch:number,dx:number,dy:number){return {yaw:yaw-dx*.004,pitch:Math.max(-1.4,Math.min(1.4,pitch-dy*.004))}}
export function auraOrbit(position:number[],target:number[],yaw:number,pitch:number){
 const v=position.map((n,i)=>n-target[i]),r=Math.hypot(...v),theta=Math.atan2(v[0],v[2])+yaw,phi=Math.max(.12,Math.min(Math.PI*.47,Math.acos(v[1]/r)-pitch));
 return [target[0]+r*Math.sin(phi)*Math.sin(theta),target[1]+r*Math.cos(phi),target[2]+r*Math.sin(phi)*Math.cos(theta)];
}
