/** Stabilizes raycast hover intent and keeps an open card interactive. */
export function createAuraFeatureHover(emit:(value:string|null)=>void,schedule:(fn:()=>void,ms:number)=>unknown=(fn,ms)=>setTimeout(fn,ms),cancel:(id:unknown)=>void=id=>clearTimeout(id as ReturnType<typeof setTimeout>)){
 let current:string|null=null,pending:string|null=null,timer:unknown,pinned=false,held=false;
 const stop=()=>{if(timer!==undefined)cancel(timer);timer=undefined;pending=null};
 const show=(value:string|null)=>{if(value!==current){current=value;emit(value)}};
 const hover=(value:string|null)=>{
  if(pinned||held)return;
  if(value===current){stop();return}if(timer!==undefined&&pending===value)return;
  stop();pending=value;timer=schedule(()=>{timer=undefined;pending=null;if(!pinned&&!held)show(value)},value?140:240);
 };
 return {hover,hold(){held=true;stop()},release(){held=false;hover(null)},pin(value:string){stop();held=false;pinned=true;show(value)},dismiss(){stop();held=false;pinned=false;show(null)},dispose:stop};
}
export function auraUsesCutaway(mode:string){return mode==='dollhouse'}
/** Exterior faces of the existing shell; inward faces keep their baked finish. */
export function auraExteriorFace(role:string,p:number[],n:number[]){
 if(role!=='top_walls'&&role!=='low_walls'&&role!=='walls')return false;
 const upper=role==='top_walls';
 return p[0]<(upper?-11.65:-11.55)&&n[0]<-.7||p[0]>(upper?4.7:4.65)&&n[0]>.7||p[2]<(upper?-4.31:-4.21)&&n[2]<-.7||p[2]>(upper?5.45:5.3)&&n[2]>.7;
}
