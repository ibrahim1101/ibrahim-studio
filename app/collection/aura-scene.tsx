'use client';
import {useEffect,useRef} from 'react';
import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {auraUsesCutaway,auraExteriorFace} from '../../lib/collection/aura-feature';
import {auraPose} from '../../lib/collection/aura';
import {auraLook,auraDrag,auraOrbit} from '../../lib/collection/aura-look';

type Props={progress:number,motion:boolean,mode:string,light:string,floor:string,resetView:number,onStatus:(s:string)=>void,onFeature:(s:string|null)=>void};
const wallNames=new Set(['low_walls','top_walls','walls']);
const ceilingNames=new Set(['top_ceiling1','top_ceiling2','PREVIEW','ceiling1','ceiling2']);
function featureFor(name:string){
 if(/bedroom|BEDROOM|CAJONES|border/.test(name))return 'Primary suite';
 if(/bathroom|shower|CERAMIC|ceramic|grifo|mirror|espejo|TAPON/.test(name))return 'Bathing spaces';
 if(/COCINA|MARMOL|nevera|MATE\.001/.test(name))return 'Kitchen & appliances';
 if(/stairs|pilar/.test(name))return 'Sculptural staircase';
 if(/BILLAR|pantallas|ESQUINA/.test(name))return 'Upper lounge';
 if(/sofa|mesa|screen|ALTAVOZ|lamp|cajon_mesita/.test(name))return 'Living & media';
 if(/madera|WINDOWS/.test(name))return 'Balcony & glazing';
 return 'Architecture & finishes';
}
export default function AuraScene(props:Props){
 const host=useRef<HTMLDivElement>(null),state=useRef(props);useEffect(()=>{state.current=props},[props]);
 useEffect(()=>{
  const el=host.current;if(!el)return;
  let renderer:T.WebGLRenderer|undefined,frame=0,dead=false,visible=true,loaded=false,door:T.Mesh|undefined,doorOpen=0;
  const resources={geometries:new Set<T.BufferGeometry>(),materials:new Set<T.Material>(),textures:new Set<T.Texture>()};
  let cleanup=()=>{};
  try{
   renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
   const r=renderer;r.setPixelRatio(Math.min(devicePixelRatio,1.5));r.outputColorSpace=T.SRGBColorSpace;
   // The artist's textures already contain indirect light and contact shadows.
   // Basic materials display those lightmaps without double-lighting the scene.
   r.toneMapping=T.NoToneMapping;r.localClippingEnabled=true;
   const canvas=r.domElement;canvas.tabIndex=0;canvas.style.touchAction='pan-y';
   canvas.setAttribute('aria-label','Furnished two-level residence. Hold left mouse and drag to look around. Arrow keys look; Escape resets. In dollhouse view, drag to orbit.');
   el.appendChild(canvas);
   const scene=new T.Scene();scene.background=new T.Color('#d3d8cf');
   const camera=new T.PerspectiveCamera(63,1,.04,550),first=auraPose(state.current.progress);
   camera.position.fromArray(first.position);const look=new T.Vector3().fromArray(first.target);
   const objects:{mesh:T.Mesh,material:T.MeshBasicMaterial,name:string,base:T.Color,upper:boolean}[]=[];
   const upperCut=new T.Plane(new T.Vector3(0,-1,0),3.05),lowerCut=new T.Plane(new T.Vector3(0,-1,0),.32);
   const groundOnly=new T.Plane(new T.Vector3(0,-1,0),1.48),upperOnly=new T.Plane(new T.Vector3(0,1,0),-1.57);
   const disposeObject=(root:T.Object3D)=>root.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose()}}});
   new GLTFLoader().loadAsync('/models/aura/residence.glb').then(gltf=>{
    if(dead){disposeObject(gltf.scene);return}
    gltf.scene.updateMatrixWorld(true);
    const converted=new Map<T.Material,T.MeshBasicMaterial>();
    const exteriorMeshes:T.Mesh[]=[];
    gltf.scene.traverse(o=>{
     if(o instanceof T.Light){o.visible=false;return}if(!(o instanceof T.Mesh))return;
     const original=o.material as T.MeshStandardMaterial,name=original.name;
     resources.geometries.add(o.geometry);resources.materials.add(original);
     for(const v of Object.values(original))if(v instanceof T.Texture){v.anisotropy=Math.min(8,r.capabilities.getMaxAnisotropy());resources.textures.add(v)}
     if(name==='city'){o.visible=false;return}
     // One material per source material preserves the authored texture/UV layout.
     let material=converted.get(original);
     if(!material){material=new T.MeshBasicMaterial({name,color:original.color,map:original.map,alphaMap:original.alphaMap,transparent:original.transparent,opacity:original.opacity,alphaTest:original.alphaTest,side:T.DoubleSide});converted.set(original,material);resources.materials.add(material)}
     o.material=material;o.userData.feature=featureFor(name);if(o.userData.slidingDoor)door=o;
     // Paint only outward faces of the exact source shell: its baked atlas is
     // unlit/black outside. Interior UVs, dimensions and openings stay intact.
     if(wallNames.has(name)&&o.geometry.index){
      const geometry=o.geometry,positions=geometry.attributes.position,normals=geometry.attributes.normal,indices=geometry.index.array,outside:number[]=[],inside:number[]=[];
      const a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3(),normal=new T.Vector3(),center=new T.Vector3();
      for(let i=0;i<indices.length;i+=3){const ids=[indices[i],indices[i+1],indices[i+2]];a.fromBufferAttribute(positions,ids[0]);b.fromBufferAttribute(positions,ids[1]);c.fromBufferAttribute(positions,ids[2]);center.copy(a).add(b).add(c).multiplyScalar(1/3);normal.copy(b).sub(a).cross(c.clone().sub(a)).normalize();(auraExteriorFace(name,center.toArray(),normal.toArray())?outside:inside).push(...ids)}
      if(outside.length){
       const g=new T.BufferGeometry();g.setAttribute('position',positions);g.setIndex(outside);
       const colors=new Float32Array(positions.count*3),sun=new T.Vector3(.35,.8,.45).normalize();
       for(let i=0;i<positions.count;i++){normal.fromBufferAttribute(normals,i).normalize();const shade=.72+.28*Math.max(0,normal.dot(sun));colors.set([shade,shade,shade],i*3)}
       g.setAttribute('color',new T.BufferAttribute(colors,3));geometry.setIndex(inside);
       const m=new T.MeshBasicMaterial({color:'#d3ccbd',vertexColors:true,side:T.DoubleSide}),exterior=new T.Mesh(g,m);exterior.name='Exterior_'+o.name;exterior.userData.feature='Architecture & finishes';exteriorMeshes.push(exterior);resources.geometries.add(g);resources.materials.add(m);
       objects.push({mesh:exterior,material:m,name,base:m.color.clone(),upper:name==='top_walls'});
      }
     }

     const box=new T.Box3().setFromObject(o);objects.push({mesh:o,material,name,base:original.color.clone(),upper:box.min.y>1.55});
    });
    gltf.scene.add(...exteriorMeshes);scene.add(gltf.scene);loaded=true;state.current.onStatus('ready');
   }).catch(()=>{if(!dead)state.current.onStatus('asset-error')});

   let yaw=0,pitch=0,dragging=false,dragged=false,pointerId=-1,px=0,py=0,travel=0;
   let lastReset=state.current.resetView,lastProgress=state.current.progress,lastMode=state.current.mode,lastAppearance='';
   const resetLook=()=>{yaw=0;pitch=0};
   const ray=new T.Raycaster(),pointer=new T.Vector2();
   const pick=(e:PointerEvent)=>{
    const b=canvas.getBoundingClientRect();pointer.set((e.clientX-b.left)/b.width*2-1,-(e.clientY-b.top)/b.height*2+1);ray.setFromCamera(pointer,camera);
    const hit=ray.intersectObjects(scene.children,true).find(h=>{
     let o:T.Object3D|null=h.object;while(o){if(!o.visible)return false;o=o.parent}
     const m=(h.object as T.Mesh).material as T.MeshBasicMaterial;
     if(m.transparent&&m.opacity<.3)return false;
     return [...r.clippingPlanes,...(m.clippingPlanes||[])].every(p=>p.distanceToPoint(h.point)>=0);
    });state.current.onFeature(hit?.object.userData.feature||null);
   };
   const down=(e:PointerEvent)=>{
    if(e.button!==0||!e.isPrimary)return;dragging=true;dragged=false;travel=0;pointerId=e.pointerId;px=e.clientX;py=e.clientY;
    canvas.setPointerCapture(pointerId);canvas.dataset.dragging='true';canvas.focus({preventScroll:true});state.current.onFeature(null);
   };
   const move=(e:PointerEvent)=>{
    if(dragging){const dx=e.clientX-px,dy=e.clientY-py;px=e.clientX;py=e.clientY;travel+=Math.hypot(dx,dy);dragged=travel>4;({yaw,pitch}=auraDrag(yaw,pitch,dx,dy));return}
    if(!e.buttons&&e.pointerType==='mouse')pick(e);
   };
   const end=(e:PointerEvent)=>{
    if(e.pointerId!==pointerId)return;dragging=false;canvas.dataset.dragging='false';pointerId=-1;
    if(canvas.hasPointerCapture(e.pointerId))canvas.releasePointerCapture(e.pointerId);
    if(!dragged&&e.type==='pointerup')pick(e);
   };
   const leave=(e:PointerEvent)=>{const next=e.relatedTarget;if(!dragging&&!(next instanceof Element&&next.closest('.aura-feature-card')))state.current.onFeature(null)};
   const key=(e:KeyboardEvent)=>{
    const keys:Record<string,number[]>={ArrowLeft:[-25,0],ArrowRight:[25,0],ArrowUp:[0,-20],ArrowDown:[0,20]};
    if(e.key==='Escape'){resetLook();e.preventDefault()}else if(keys[e.key]){const [dx,dy]=keys[e.key];({yaw,pitch}=auraDrag(yaw,pitch,dx,dy));e.preventDefault()}
   };
   const lost=(e:Event)=>{e.preventDefault();cancelAnimationFrame(frame);state.current.onStatus('unavailable')};
   canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);canvas.addEventListener('pointerleave',leave);canvas.addEventListener('keydown',key);canvas.addEventListener('webglcontextlost',lost);
   const ro=new ResizeObserver(()=>{const b=el.getBoundingClientRect();r.setSize(Math.max(1,b.width),Math.max(1,b.height),false);camera.aspect=b.width/Math.max(1,b.height);camera.updateProjectionMatrix()});ro.observe(el);
   const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting});io.observe(el);
   let last=performance.now();
   function loop(now:number){
    if(dead)return;frame=requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(!visible||!loaded)return;
    const s=state.current,doll=auraUsesCutaway(s.mode),pose=auraPose(s.progress);
    if(s.resetView!==lastReset||s.mode!==lastMode||Math.abs(s.progress-lastProgress)>.035){resetLook();lastReset=s.resetView;lastMode=s.mode;lastProgress=s.progress}
    const appearance=[doll,s.floor,s.light].join('|');
    if(appearance!==lastAppearance){
     lastAppearance=appearance;r.clippingPlanes=doll?(s.floor==='ground'?[groundOnly]:s.floor==='upper'?[upperOnly]:[]):[];
     objects.forEach(({mesh,material,name,base,upper})=>{
      mesh.visible=!(ceilingNames.has(name)&&doll);
      material.clippingPlanes=doll&&wallNames.has(name)?[upper||name==='top_walls'?upperCut:lowerCut]:[];
      material.color.copy(base);if(s.light==='evening')material.color.multiply(new T.Color('#ffe2c6'));
      material.needsUpdate=true;
     });
    }
    if(door){const target=!doll&&s.progress>.3?1:0;doorOpen+=(target-doorOpen)*(s.motion?1-Math.exp(-dt*7):1);door.position.set(.02*doorOpen,0,2.85*doorOpen)}
    const target=doll?[-2,s.floor==='upper'?2.8:s.floor==='ground'?.5:1.3,1.8]:pose.target;
    const eye=doll?auraOrbit([14,13,18],target,yaw,pitch):pose.position,f=s.motion?1-Math.exp(-dt*6):1;
    camera.position.lerp(new T.Vector3().fromArray(eye),f);look.lerp(new T.Vector3().fromArray(target),f);
    camera.lookAt(new T.Vector3().fromArray(doll?look.toArray():auraLook(camera.position.toArray(),look.toArray(),yaw,pitch)));
    r.render(scene,camera);canvas.dataset.chapter=s.progress.toFixed(2);canvas.dataset.mode=s.mode;canvas.dataset.yaw=yaw.toFixed(3);
   }
   frame=requestAnimationFrame(loop);
   cleanup=()=>{ro.disconnect();io.disconnect();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',end);canvas.removeEventListener('pointercancel',end);canvas.removeEventListener('lostpointercapture',end);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('keydown',key);canvas.removeEventListener('webglcontextlost',lost)};
  }catch{state.current.onStatus('unavailable')}
  return()=>{dead=true;cancelAnimationFrame(frame);cleanup();resources.geometries.forEach(g=>g.dispose());resources.materials.forEach(m=>m.dispose());resources.textures.forEach(t=>t.dispose());renderer?.dispose();renderer?.domElement.remove()};
 },[]);
 return <div className="aura-canvas" ref={host}/>;
}
