'use client';
import {lazy,Suspense,useEffect,useMemo,useRef,useState} from 'react';
import {getWorld,money} from '../../lib/collection/data';
import {createAuraFeatureHover} from '../../lib/collection/aura-feature';
import {AURA_ROOMS,auraProgress} from '../../lib/collection/aura';
const Scene=lazy(()=>import('./aura-scene'));
const details:Record<string,string>={
 'Architecture & finishes':'A complete artist-built, two-level apartment with authored wall, floor and ceiling textures. The same geometry is used for the interior tour and dollhouse.',
 'Living & media':'Fitted lounge seating, individual cushions, a coffee table, media equipment, speakers and a table lamp. All are included in the residence model.',
 'Kitchen & appliances':'A full kitchen assembly with a refrigerator, island cabinetry, hob, oven, sink, tap, drawers and handles.',
 'Sculptural staircase':'The camera follows the two actual stair flights and landing. Drag to inspect the supports, treads and surrounding space.',
 'Primary suite':'The upper bedroom includes a bed, built-in furniture, storage, bedside details and a media display.',
 'Bathing spaces':'The model includes furnished bathrooms with sanitary fittings, sinks, taps, mirrors and a shower enclosure.',
 'Upper lounge':'The upper floor includes a recreation area with fitted furniture and a billiards table.',
 'Balcony & glazing':'The lower living area opens onto the balcony. The city backdrop is omitted so the residence remains the focus.'
};
const roomFeatures=['Architecture & finishes','Living & media','Kitchen & appliances','Balcony & glazing','Sculptural staircase','Primary suite','Bathing spaces'];
export default function AuraTour({initialProperty='loft'}:{initialProperty?:string}){
 const world=getWorld('real-estate')!,root=useRef<HTMLElement>(null),stage=useRef<HTMLDivElement>(null),motionRef=useRef(true);
 const [property,setProperty]=useState(initialProperty),[progress,setProgress]=useState(0),[chapter,setChapter]=useState(0),[motion,setMotion]=useState(true),[mode,setMode]=useState('walk'),[light,setLight]=useState('day'),[floor,setFloor]=useState('all'),[plan,setPlan]=useState(false),[planFloor,setPlanFloor]=useState('ground'),[status,setStatus]=useState('loading'),[feature,setFeature]=useState<string|null>(null),[resetView,setResetView]=useState(0),[focus,setFocus]=useState(false);
 const featureHover=useMemo(()=>createAuraFeatureHover(setFeature),[]);
 useEffect(()=>()=>featureHover.dispose(),[featureHover]);
 const item=world.items.find(i=>i.id===property)||world.items[0],room=AURA_ROOMS[chapter];
 useEffect(()=>{const m=matchMedia('(prefers-reduced-motion: reduce)');motionRef.current=!m.matches;setMotion(!m.matches)},[]);
 useEffect(()=>{motionRef.current=motion},[motion]);
 useEffect(()=>{
  let frame=0,last=performance.now(),p=0,previous=-1,visible=true;const el=root.current;if(!el)return;
  const io=new IntersectionObserver(es=>{visible=es[0].isIntersecting});io.observe(el);
  function loop(now:number){const dt=Math.min(.05,(now-last)/1000);last=now;if(visible){const rect=el!.getBoundingClientRect(),target=auraProgress(rect.top,el!.clientHeight,stage.current?.clientHeight||innerHeight);p=motionRef.current?p+(target-p)*(1-Math.exp(-dt*7)):target;if(Math.abs(p-target)<.0001)p=target;setProgress(p);const next=Math.min(6,Math.floor(p+.5));if(next!==previous){previous=next;setChapter(next);featureHover.dismiss()}}frame=requestAnimationFrame(loop)}
  frame=requestAnimationFrame(loop);return()=>{cancelAnimationFrame(frame);io.disconnect()};
 },[]);
 function seek(index:number){
  setResetView(v=>v+1);setMode('walk');featureHover.dismiss();setPlan(false);
  const el=root.current;if(!el)return;const y=scrollY+el.getBoundingClientRect().top+(el.clientHeight-(stage.current?.clientHeight||innerHeight))*Math.max(0,Math.min(6,index))/6;window.scrollTo({top:y,behavior:motion?'smooth':'instant'});
 }
 function dollhouse(){setResetView(v=>v+1);setMode(v=>v==='walk'?'dollhouse':'walk');featureHover.dismiss()}
 const planStops=planFloor==='ground'?[1,2,3]:[4,5,6];
 return <section className={'aura-tour'+(focus?' aura-focus':'')} ref={root} id="aura-journey" aria-label="AURA furnished residence walkthrough" onKeyDown={e=>{if(e.key==='Escape'){setPlan(false);featureHover.dismiss();setFocus(false)}}}>
  <div className="aura-stage" ref={stage} onPointerLeave={()=>featureHover.hover(null)}>
   <Suspense fallback={<p className="aura-loading">Preparing the full residence…</p>}><Scene progress={progress} motion={motion} mode={mode} light={light} floor={floor} resetView={resetView} onStatus={setStatus} onFeature={featureHover.hover}/></Suspense>
   {status!=='ready'&&<div className="aura-fallback"><img src="/models/aura/residence-preview.jpg" alt="Artist preview of the furnished VR Apartment model by FDU_oficial"/><div><strong>{status==='loading'?'Loading the furnished residence…':status==='asset-error'?'The model could not load. Reload to retry.':'Interactive 3D needs WebGL on this device.'}</strong><p>Static artist preview of the actual model. Room details and viewing requests remain available.</p></div></div>}
   <div className="aura-tour-shade"/>
   {status==='ready'&&<div className="aura-look-hint">{mode==='dollhouse'?'Hold + drag to orbit the whole home':'Hold left mouse + drag to look around · Arrow keys also work'}</div>}
   <div className="aura-tour-top"><span>AURA / THE COMPLETE RESIDENCE</span><label>Viewing enquiry for<select value={property} onChange={e=>setProperty(e.target.value)}>{world.items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label></div>
   <div className={"aura-tour-caption"+(chapter>0||mode==='dollhouse'?' aura-room-caption':'')} aria-live="polite"><span className="aura-eyebrow">{mode==='dollhouse'?'MODEL / DOLLHOUSE':`0${chapter+1} / ${room.area.toUpperCase()}`}</span><h1>{mode==='dollhouse'?'The whole picture.':room.title}</h1><p>{mode==='dollhouse'?'The same detailed architecture and furnishings, viewed from outside. Choose a level and drag to orbit.':room.note}</p><div><button onClick={()=>{setPlan(false);featureHover.pin(roomFeatures[chapter])}}>Room details +</button><button onClick={()=>setPlan(!plan)} aria-expanded={plan}>{plan?'Close floor plan ×':'Explore floor plan ↗'}</button><a href={'/demos/real-estate/3d/book?item='+item.id}>Arrange this viewing ↗</a></div></div>
   <details className="aura-mobile-actions"><summary>Room options +</summary><div><button onClick={()=>{setPlan(false);featureHover.pin(roomFeatures[chapter])}}>Room details</button><button onClick={()=>setPlan(!plan)}>Floor plan</button><a href={'/demos/real-estate/3d/book?item='+item.id}>Arrange viewing ↗</a></div></details>
   <div className="aura-residence"><small>YOUR VIEWING ENQUIRY</small><strong>{item.name}</strong><span>{item.capacity} bedrooms · {item.specs.find(s=>s[0]==='Area')?.[1]}</span><span>{money(item.price)} · sample listing price</span><p>The 3D apartment is an independent architectural showcase, not a scan or floor plan of this sample listing.</p><a href="/models/aura/LICENSE.txt" target="_blank" rel="noreferrer">VR Apartment · FDU_oficial · CC BY 4.0 ↗</a></div>
   {feature&&<aside className="aura-feature-card" onPointerEnter={()=>featureHover.hold()} onPointerLeave={()=>featureHover.release()} onFocus={()=>featureHover.hold()} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))featureHover.release()}}><button aria-label="Close feature details" onClick={()=>featureHover.dismiss()}>×</button><span className="aura-eyebrow">RESIDENCE / DETAIL</span><h2>{feature}</h2><p>{details[feature]||details['Architecture & finishes']}</p></aside>}
   {plan&&<div className="aura-plan-panel" role="region" aria-label="Residence floor plan"><div><span className="aura-eyebrow">EXPLORE THE MODEL'S TWO LEVELS</span><button onClick={()=>setPlan(false)}>Close ×</button></div><div className="aura-plan-tabs"><button aria-pressed={planFloor==='ground'} onClick={()=>setPlanFloor('ground')}>Ground level</button><button aria-pressed={planFloor==='upper'} onClick={()=>setPlanFloor('upper')}>Upper level</button></div><div className="aura-actual-plan"><img src={'/models/aura/'+planFloor+'-plan.png'} alt={planFloor==='ground'?'Ground level: kitchen and bathroom to the left, lounge and balcony to the right.':'Upper level: bedroom and bathroom to the left, stair hall and recreation area to the right.'}/>{planStops.map(index=>{const r=AURA_ROOMS[index];return <button key={r.id} aria-current={chapter===index?'step':undefined} onClick={()=>seek(index)} style={{left:((r.position[0]+13.5)/23.333*100)+'%',top:((r.position[2]+5.3)/14.166*100)+'%'}}>{r.name}<span>↗</span></button>})}</div><p>Orientation diagram derived from the model geometry. This is a showcase residence, not a listing survey or certified plan.</p><button className="aura-dollhouse" aria-pressed={mode==='dollhouse'} onClick={dollhouse}>{mode==='walk'?'Inspect the complete dollhouse ↗':'Return to walking view ↗'}</button></div>}
   <div className="aura-tour-bottom"><nav aria-label="Architectural tour rooms">{AURA_ROOMS.map((r,i)=><button key={r.id} aria-current={chapter===i?'step':undefined} onClick={()=>seek(i)}><small>0{i+1}</small>{r.name}</button>)}</nav><div className="aura-view-controls"><div><button disabled={chapter===0} aria-label="Previous room" onClick={()=>seek(chapter-1)}>←</button><button disabled={chapter===6} aria-label="Next room" onClick={()=>seek(chapter+1)}>→</button><button aria-pressed={mode==='dollhouse'} onClick={dollhouse}>Dollhouse</button>{mode==='dollhouse'&&<select aria-label="Dollhouse level" value={floor} onChange={e=>setFloor(e.target.value)}><option value="all">Both levels</option><option value="ground">Ground level</option><option value="upper">Upper level</option></select>}<button aria-pressed={light==='evening'} onClick={()=>setLight(light==='day'?'evening':'day')}>{light==='day'?'Warm tone':'Original tone'}</button><button onClick={()=>setResetView(v=>v+1)}>Reset view</button><button aria-pressed={focus} onClick={()=>{setFocus(!focus);featureHover.dismiss();setPlan(false)}}>{focus?'Show interface':'Focus view'}</button><button aria-pressed={!motion} onClick={()=>setMotion(!motion)}>{motion?'Reduce motion':'Smooth motion'}</button></div><span>HOLD + DRAG TO LOOK · SCROLL TO MOVE</span></div><div className="aura-progress"><i style={{width:(progress/6*100)+'%'}}/></div></div>
  </div>
 </section>;
}
