export type Point={x:number,y:number};
/** Map one complete DOM menu plane to the projected corners of its 3D board. */
export function menuPlaneMatrix(width:number,height:number,corners:Point[]):number[]{
  const source=[[0,0],[width,0],[width,height],[0,height]];
  const rows:number[][]=[];
  source.forEach(([x,y],i)=>{const u=corners[i].x,v=corners[i].y;rows.push([x,y,1,0,0,0,-u*x,-u*y,u]);rows.push([0,0,0,x,y,1,-v*x,-v*y,v])});
  for(let c=0;c<8;c++){let best=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[best][c]))best=r;[rows[c],rows[best]]=[rows[best],rows[c]];const pivot=rows[c][c];if(Math.abs(pivot)<1e-10)return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];for(let j=c;j<9;j++)rows[c][j]/=pivot;for(let r=0;r<8;r++){if(r===c)continue;const f=rows[r][c];for(let j=c;j<9;j++)rows[r][j]-=f*rows[c][j]}}
  const h=rows.map(r=>r[8]);return [h[0],h[3],0,h[6],h[1],h[4],0,h[7],0,0,1,0,h[2],h[5],0,1];
}
