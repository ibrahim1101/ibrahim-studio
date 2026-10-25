'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import FoodCard from './restaurant-menu-card';
import {menuPlaneMatrix} from '../lib/restaurant/projection';
import { TABLES, tourPose, tablePose } from '../lib/restaurant/tour';
import {DISHES, MENU_WALL, MENU_CAMERA, menuRowCenter, menuPageItems, menuPageCount, normalizeMenuPage, MENU_PAGE_SIZE} from '../lib/restaurant/menu';

type Props = {
  progress: number;
  table: string;
  motion: boolean;
  inspect: boolean;
  menuView: boolean;
  onSupport: (supported: boolean) => void;
  onSelect: (id: string) => void;
};

export default function Scene({ progress, table, motion, inspect, menuView, onSupport, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const state = useRef({ progress, table, motion, inspect, menuView, onSelect });
  const boardRef=useRef<HTMLDivElement>(null);
  const activeDishRef=useRef<number|null>(null);
  const menuButtons = useRef<(HTMLButtonElement|null)[]>([]);
  const [menuPage,setMenuPage]=useState(0);
  const menuPageRef=useRef(0);useEffect(()=>{menuPageRef.current=menuPage},[menuPage]);
  const paginationRef=useRef<HTMLDivElement>(null);
  const [activeDish,setActiveDish] = useState<number|null>(null);activeDishRef.current=activeDish;
  useEffect(()=>{if(!menuView)setActiveDish(null)},[menuView]);
  function changePage(delta:number){setMenuPage(page=>normalizeMenuPage(page+delta));setActiveDish(null)}
  function selectDish(index:number){setMenuPage(Math.floor(index/MENU_PAGE_SIZE));setActiveDish(index)}
  const support = useRef(onSupport);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>('loading');
  useEffect(() => { state.current = { progress, table, motion, inspect, menuView, onSelect }; }, [progress, table, motion, inspect, menuView, onSelect]);
  useEffect(() => { support.current = onSupport; }, [onSupport]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let renderer: THREE.WebGLRenderer | undefined;
    let frame = 0;
    let disposed = false;
    const textures: THREE.Texture[] = [];
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    const cleanupListeners: (() => void)[] = [];
    const fail = (reason: unknown) => {
      if (disposed) return;
      console.warn('Ember Table 3D renderer unavailable:', reason);
      cancelAnimationFrame(frame);
      setStatus('fallback');
      support.current(false);
    };
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.35));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute('aria-label', 'Interactive Ember Table restaurant. Select tables with the seating controls or click a table in the dining room.');
      renderer.domElement.style.display = 'block';
      el.appendChild(renderer.domElement);
      const lost = (event: Event) => { event.preventDefault(); fail('Graphics context lost'); };
      renderer.domElement.addEventListener('webglcontextlost', lost);
      cleanupListeners.push(() => renderer?.domElement.removeEventListener('webglcontextlost', lost));
      const scene = new THREE.Scene();
      scene.background = new THREE.Color('#17242a');
      scene.fog = new THREE.FogExp2('#17242a', .006);
      const environment=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const reflection=pmrem.fromScene(environment,.04);scene.environment=reflection.texture;scene.environmentIntensity=.4;cleanupListeners.push(()=>{reflection.dispose();environment.dispose();pmrem.dispose()});
      const camera = new THREE.PerspectiveCamera(47, 1, .08, 150);
      const firstPose = tourPose(state.current.progress);
      camera.position.fromArray(firstPose.position);
      const lookingAt = new THREE.Vector3().fromArray(firstPose.target);
      camera.lookAt(lookingAt);
      scene.add(new THREE.HemisphereLight('#d4dfec', '#75533b', 1.5));
      const moon = new THREE.DirectionalLight('#c5d8ed', 2.2);
      moon.position.set(-15, 22, 15);
      moon.castShadow = true;
      moon.shadow.mapSize.set(1024, 1024);
      Object.assign(moon.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, near: .5, far: 70 });
      moon.shadow.bias = -.0004;
      scene.add(moon);
      const interiorFill = new THREE.PointLight('#ffcd91', 100, 28, 1.6);
      interiorFill.position.set(0, 4, -7);
      scene.add(interiorFill);
      const lobbyFill = new THREE.PointLight('#ffcf9f', 55, 16, 1.6);
      lobbyFill.position.set(0, 3.6, 3.5);
      scene.add(lobbyFill);
      let seed = 1497;
      const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
      function surface(kind: 'stone' | 'wood' | 'floor') {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Texture canvas unavailable');
        ctx.fillStyle = kind === 'wood' ? '#76513b' : kind === 'floor' ? '#a99b83' : '#cfbda0';
        ctx.fillRect(0, 0, 512, 512);
        for (let i = 0; i < 6000; i++) {
          ctx.fillStyle = `rgba(${kind === 'wood' ? '33,16,8' : '60,47,31'},${random() * .12})`;
          const x = random() * 512, y = random() * 512;
          ctx.fillRect(x, y, kind === 'wood' ? 1 + random() * 2 : random() * 4, kind === 'wood' ? 20 + random() * 130 : random() * 4);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = kind === 'wood' ? '#25180b35' : '#6b604c40';
        const spacing = kind === 'wood' ? 64 : 128;
        for (let i = 0; i < 512; i += spacing) {
          ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
          if (kind !== 'wood') { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke(); }
        }
        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(kind === 'wood' ? 2 : 3, kind === 'wood' ? 2 : 3);
        tex.anisotropy = Math.min(renderer!.capabilities.getMaxAnisotropy(), 4);
        textures.push(tex);
        return tex;
      }
      const stoneTexture = surface('stone'), woodTexture = surface('wood'), floorTexture = surface('floor');
      const mat = {
        stone: new THREE.MeshStandardMaterial({ color: '#dac9a8', map: stoneTexture, bumpMap:stoneTexture,bumpScale:.022,roughness: .82 }),
        floor: new THREE.MeshStandardMaterial({ color: '#b5a58b', map: floorTexture, roughness: .48 }),
        walnut: new THREE.MeshStandardMaterial({ color: '#8a654a', map: woodTexture,bumpMap:woodTexture,bumpScale:.014,roughness: .4 }),
        darkWood: new THREE.MeshStandardMaterial({ color: '#342b22', map: woodTexture, roughness: .6 }),
        sage: new THREE.MeshStandardMaterial({ color: '#4d5945', roughness: .96 }),
        charcoal: new THREE.MeshStandardMaterial({ color: '#252b29', roughness: .85 }),
        brass: new THREE.MeshStandardMaterial({ color: '#baa06d', metalness: .75, roughness: .35 }),
        linen: new THREE.MeshStandardMaterial({ color: '#ece2ce', roughness: .98 }),
        porcelain: new THREE.MeshStandardMaterial({ color: '#f5eee0', roughness: .2 }),
        glass: new THREE.MeshPhysicalMaterial({ color: '#d8e2df', metalness: 0, roughness: .08, transparent: true, opacity: .3, depthWrite: false }),
        glow: new THREE.MeshStandardMaterial({ color: '#ffdc9e', emissive: '#ffc06a', emissiveIntensity: 3 }),
        green: new THREE.MeshStandardMaterial({ color: '#34432a', roughness: .9, side: THREE.DoubleSide }),
        leafLight: new THREE.MeshStandardMaterial({ color: '#65704a', roughness: .9, side: THREE.DoubleSide }),
        water: new THREE.MeshStandardMaterial({ color: '#1b3839', roughness: .13, metalness: .5 }),
      };
      Object.values(mat).forEach(m => materials.add(m));
      function mesh(geometry: THREE.BufferGeometry, material: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
        geometries.add(geometry); materials.add(material);
        const m = new THREE.Mesh(geometry, material);
        m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
      }
      function box(w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = scene) {
        const radius=Math.min(.055,w*.16,h*.16,d*.16);
        return mesh(new RoundedBoxGeometry(w,h,d,2,radius), material, x, y, z, parent);
      }
      function cylinder(rt: number, rb: number, h: number, x: number, y: number, z: number, material: THREE.Material, parent: THREE.Object3D = scene) {
        return mesh(new THREE.CylinderGeometry(rt, rb, h, 32), material, x, y, z, parent);
      }
      // Entirely original architecture: a travertine pavilion, open centre door and glazed arches.
      box(110, .3, 100, 0, -.5, 0, mat.charcoal);
      box(17, .24, 28, 0, -.1, -5, mat.floor);
      box(18, .12, 13, 0, -.15, 14, mat.stone);
      for (let z = 9; z < 22; z += 1.15) box(4.4, .07, .9, 0, -.02, z, mat.floor);
      for (const x of [-5.9, 5.9]) {
        box(4, .35, 10, x, -.1, 14, mat.darkWood);
        box(3.5, .08, 9.5, x, .1, 14, mat.water);
        for (let z = 10; z < 20; z += 2.3) cylinder(.09, .09, .1, x + (x > 0 ? -1.5 : 1.5), .21, z, mat.glow);
      }
      // Rear and side walls, ceiling and fine walnut ceiling ribs.
      box(.4, 5.7, 25, -7.9, 2.8, -5.4, mat.stone);
      box(.4, 5.7, 25, 7.9, 2.8, -5.4, mat.stone);
      box(16, 5.7, .35, 0, 2.8, -17.8, mat.sage);
      box(16.3, .25, 25.6, 0, 5.7, -5.4, mat.darkWood);
      for (let x = -7.7; x <= 7.8; x += .38) box(.065, .11, 25, x, 5.5, -5.4, mat.walnut);
      for (const x of [-7.63, 7.63]) {
        box(.08, .5, 24, x, .25, -5.3, mat.darkWood);
        for (let z = -16; z < 6; z += 3.8) {
          box(.12, 2.6, 2.6, x, 2.8, z, mat.darkWood);
          box(.14, 2.35, 2.35, x + (x < 0 ? .08 : -.08), 2.8, z, mat.sage);
          cylinder(.05, .05, 1.0, x + (x < 0 ? .25 : -.25), 2.6, z, mat.glow);
        }
      }
      // Front facade has three true arched apertures, not a solid wall over the camera path.
      function arch(cx: number, width: number, height: number, isDoor: boolean) {
        const radius = width / 2, spring = height - radius;
        const shape = new THREE.Shape();
        shape.moveTo(-radius - .28, 0); shape.lineTo(radius + .28, 0); shape.lineTo(radius + .28, height + .3);
        shape.lineTo(-radius - .28, height + .3); shape.closePath();
        const opening = new THREE.Path();
        opening.moveTo(-radius, 0); opening.lineTo(-radius, spring); opening.absarc(0, spring, radius, Math.PI, 0, true); opening.lineTo(radius, 0); opening.closePath();
        shape.holes.push(opening);
        mesh(new THREE.ExtrudeGeometry(shape, { depth: .5, bevelEnabled: false, curveSegments: 28 }), mat.stone, cx, 0, 7);
        const archCurve = new THREE.EllipseCurve(0, spring, radius, radius, 0, Math.PI, false, 0);
        const points = archCurve.getPoints(36).map(p => new THREE.Vector3(p.x, p.y, 0));
        mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 36, .045, 8, false), mat.brass, cx, 0, 7.56);
        box(.07, spring, .07, cx - radius, spring / 2, 7.55, mat.brass);
        box(.07, spring, .07, cx + radius, spring / 2, 7.55, mat.brass);
        if (!isDoor) {
          const glassShape = new THREE.Shape(); glassShape.moveTo(-radius, 0); glassShape.lineTo(radius, 0); glassShape.lineTo(radius, spring); glassShape.absarc(0, spring, radius, 0, Math.PI, false); glassShape.closePath();
          mesh(new THREE.ShapeGeometry(glassShape), mat.glass, cx, 0, 7.25);
          box(.04, height - .05, .05, cx, height / 2, 7.5, mat.brass);
          box(width, .04, .05, cx, spring * .6, 7.5, mat.brass);
        }
      }
      arch(-5.2, 3.7, 4.65, false); arch(0, 3.4, 4.65, true); arch(5.2, 3.7, 4.65, false);
      for (const x of [-8, -2.55, 2.55, 8]) box(.65, 5.55, .85, x, 2.75, 7.2, mat.stone);
      box(17.2, .8, 1.25, 0, 5.35, 7.2, mat.stone);
      box(18, .18, 2.0, 0, 5.86, 7.5, mat.darkWood);
      // Open timber-and-glass double doors frame the threshold without blocking the tour.
      for(const side of [-1,1]){const door=new THREE.Group();door.position.set(side*1.65,0,7.2);door.rotation.y=side*1.04;scene.add(door);const dx=-side*.78;box(1.56,4,.07,dx,2,0,mat.glass,door);for(const edge of [0,-side*1.56])box(.075,4.1,.09,edge,2,0,mat.darkWood,door);for(const y of [.08,4.02])box(1.56,.075,.09,dx,y,0,mat.darkWood,door);box(.04,.48,.08,-side*1.25,1.8,.09,mat.brass,door)}
      // Fine stone courses and warm linear light give the facade depth at dusk.
      for(const y of [1.1,2.2,3.3,4.45])for(const x of [-8,-2.55,2.55,8])box(.66,.012,.012,x,y,7.635,mat.darkWood);
      box(16.9,.035,.03,0,5.76,7.83,mat.glow);
      for(const x of [-6.8,6.8])box(.025,.025,22,x,5.38,-4.7,mat.glow);
      // Original textured plaster art panels in the lobby.
      for(const side of [-1,1]){const artCanvas=document.createElement('canvas');artCanvas.width=artCanvas.height=256;const ctx=artCanvas.getContext('2d');if(ctx){ctx.fillStyle='#bda682';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#75674c';ctx.lineWidth=2;for(let i=0;i<8;i++){ctx.beginPath();ctx.arc(128,148,28+i*12,Math.PI,Math.PI*2);ctx.stroke()}ctx.fillStyle='#716c47';ctx.fillRect(114,155,28,56);const texture=new THREE.CanvasTexture(artCanvas);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);const frame=box(.09,1.9,1.4,side*7.6,2.5,3.5,mat.brass);const art=mesh(new THREE.PlaneGeometry(1.3,1.8),new THREE.MeshStandardMaterial({map:texture,roughness:.9}),side*7.53,2.5,3.5);art.rotation.y=-side*Math.PI/2;void frame}}
      // A quiet brass restaurant wordmark, baked into a transparent canvas texture.
      const signCanvas = document.createElement('canvas'); signCanvas.width = 1024; signCanvas.height = 160;
      const signCtx = signCanvas.getContext('2d');
      if (signCtx) {
        signCtx.font = '52px Georgia'; signCtx.textAlign = 'center'; signCtx.fillStyle = '#f0cf94';
        signCtx.fillText('E M B E R   T A B L E', 512, 100);
        const tex = new THREE.CanvasTexture(signCanvas); tex.colorSpace = THREE.SRGBColorSpace; textures.push(tex);
        mesh(new THREE.PlaneGeometry(5.7, .85), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), 0, 5.28, 7.86);
      }
      for (const x of [-2.5, 2.5, -8, 8]) {
        box(.16, .85, .18, x, 2.8, 7.73, mat.brass);
        box(.12, .64, .2, x, 2.8, 7.84, mat.glow);
        const light = new THREE.PointLight('#ffbb70', 12, 6, 1.8); light.position.set(x, 3, 8.2); scene.add(light);
      }
      // Reception with ribbed walnut base, sculptural flower arrangement and upholstered bench.
      box(2.8, 1.08, 1.05, -3.65, .54, 3.7, mat.darkWood);
      box(3, .13, 1.2, -3.65, 1.14, 3.7, mat.stone);
      for (let x = -5; x < -2.3; x += .12) box(.04, .95, .1, x, .57, 4.24, mat.walnut);
      cylinder(.13, .23, .42, -4.2, 1.4, 3.7, mat.brass);
      for (let i = 0; i < 7; i++) {
        const flower = mesh(new THREE.SphereGeometry(.11, 8, 8), mat.linen, -4.2 + (random() - .5) * .5, 1.8 + random() * .25, 3.7 + (random() - .5) * .4);
        flower.scale.y = .6;
      }
      box(2.8, .28, .85, 4.1, .55, 3.8, mat.sage); box(2.8, .8, .18, 4.1, .94, 3.45, mat.sage);
      for (const x of [2.9, 5.3]) for (const z of [3.5, 4.1]) cylinder(.035, .035, .45, x, .22, z, mat.brass);
      // A framed, backlit seasonal menu on the actual rear wall.
      const [mx,my,mz]=MENU_WALL.position;
      box(MENU_WALL.width+.22,MENU_WALL.height+.22,.12,mx,my,mz-.04,mat.darkWood);
      box(MENU_WALL.width,MENU_WALL.height,.05,mx,my,mz+.045,mat.charcoal);
      for(const x of [mx-MENU_WALL.width/2,mx+MENU_WALL.width/2])box(.035,MENU_WALL.height,.055,x,my,mz+.09,mat.brass);
      for(const y of [my-MENU_WALL.height/2,my+MENU_WALL.height/2])box(MENU_WALL.width,.035,.055,mx,y,mz+.09,mat.brass);

      // Bake all visible lettering into the WebGL plane. DOM remains an accessible hit surface.
      const menuCanvas=document.createElement('canvas');menuCanvas.width=1600;menuCanvas.height=1846;
      const menuCtx=menuCanvas.getContext('2d');
      const menuTexture=new THREE.CanvasTexture(menuCanvas);menuTexture.colorSpace=THREE.SRGBColorSpace;textures.push(menuTexture);
      mesh(new THREE.PlaneGeometry(MENU_WALL.width,MENU_WALL.height),new THREE.MeshBasicMaterial({map:menuTexture,toneMapped:false}),mx,my,mz+.17);
      let printedPage=-1,printedActive:number|null=-1;
      function paintMenu(page:number,active:number|null){if(!menuCtx)return;const c=menuCtx;c.setTransform(2,0,0,2,0,0);c.fillStyle='#182b23';c.fillRect(0,0,800,923);c.textAlign='center';c.fillStyle='#d7c49e';c.font='18px Arial';c.fillText('EMBER TABLE',400,105);c.font='italic 55px Georgia';c.fillText('The seasonal menu',400,175);menuPageItems(page).forEach((dish,i)=>{const y=230+i*140;c.fillStyle=active===page*MENU_PAGE_SIZE+i?'#f6dba0':'#f5ead4';c.textAlign='left';c.font='32px Georgia';c.fillText(dish.name,58,y+78,565);c.textAlign='right';c.font='23px Arial';c.fillText('₹'+dish.price,742,y+78);c.strokeStyle='#a9936955';c.lineWidth=1;c.beginPath();c.moveTo(50,y+140);c.lineTo(750,y+140);c.stroke()});c.strokeStyle='#bba477';c.strokeRect(50,815,72,60);c.strokeRect(678,815,72,60);c.textAlign='center';c.fillStyle='#f5e3bc';c.font='38px Arial';c.fillText('←',86,858);c.fillText('→',714,858);c.font='22px Arial';c.fillText(String(page+1).padStart(2,'0')+' / '+String(menuPageCount()).padStart(2,'0'),400,852);menuTexture.needsUpdate=true}
      const boardLight=new THREE.SpotLight('#ffdba8',24,9,.6,.7,1.5);boardLight.position.set(mx,5.2,mz+1.6);boardLight.target.position.set(mx,my,mz);scene.add(boardLight,boardLight.target);
      box(.12,.09,.5,mx,4.99,mz+.2,mat.brass);box(.4,.07,.18,mx,4.92,mz+.4,mat.glow);
      // Layered planter beds and a timber garden screen add depth around the pavilion.
      for(const x of [-11.8,11.8]){box(1.8,.55,25,x,.15,-2,mat.stone);for(let z=-13;z<10;z+=.38)box(.09,2.6,.09,x,1.6,z,mat.darkWood);for(let z=-12;z<8;z+=4)oliveDetail(x,z)}
      function oliveDetail(x:number,z:number){cylinder(.1,.13,1.6,x,1.1,z,mat.darkWood);for(let j=0;j<9;j++){const a=j*.7;const leaf=mesh(new THREE.SphereGeometry(.28,8,6),mat.green,x+Math.sin(a)*.3,1.8+Math.cos(a)*.5,z+Math.cos(a)*.3);leaf.scale.set(1,.5,.6)}}
      // Low upholstered banquettes create a layered dining room silhouette.
      for(const x of [-6.8,6.8]){box(.65,.32,10,x,.58,-7.7,mat.sage);box(.18,.85,10,x+(x<0?-.28:.28),.98,-7.7,mat.sage);for(let z=-12;z<-3;z+=.6)box(.015,.48,.025,x+(x<0?-.17:.17),1,z,mat.brass)}
      // Rear bar: lit shelving, bottles, marble worktop and stools.
      box(8, 1.15, 1.3, 1.2, .57, -16.5, mat.darkWood); box(8.3, .14, 1.5, 1.2, 1.2, -16.5, mat.stone);
      for (const y of [2.2, 3.3, 4.4]) {
        box(8, .10, .6, 1.2, y, -17.45, mat.walnut); box(7.8, .035, .04, 1.2, y - .08, -17.15, mat.glow);
        for (let x = -2.5; x < 4.9; x += .5) {
          const bottle = new THREE.MeshStandardMaterial({ color: random() > .5 ? '#4c5029' : '#6a3721', roughness: .3 });
          cylinder(.09, .1, .4, x, y + .25, -17.4, bottle); cylinder(.035, .035, .18, x, y + .53, -17.4, mat.brass);
        }
      }
      const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=128;const sc=shadowCanvas.getContext('2d');let contactTexture:THREE.CanvasTexture|undefined;
      if(sc){const g=sc.createRadialGradient(64,64,8,64,64,64);g.addColorStop(0,'rgba(17,12,5,.65)');g.addColorStop(.5,'rgba(17,12,5,.3)');g.addColorStop(1,'rgba(17,12,5,0)');sc.fillStyle=g;sc.fillRect(0,0,128,128);contactTexture=new THREE.CanvasTexture(shadowCanvas);textures.push(contactTexture)}
      // Tall pleated curtains, stone planter rims and layered interior planting.
      for(const side of [-1,1]){for(let z=-15;z<0;z+=5){for(let j=0;j<9;j++){const fold=cylinder(.06,.065,3.6,side*(7.58-(j%2)*.045),2.2,z+j*.075,mat.linen);fold.scale.x=.6}}}
      const pickable: THREE.Mesh[] = [];
      const selectedRings: THREE.Mesh[] = [];
      const tabletopMaterials: THREE.MeshStandardMaterial[] = [];
      const tableLabels: THREE.Sprite[] = [];
      TABLES.forEach((t, index) => {
        const group = new THREE.Group(); group.position.set(t.x, 0, t.z); scene.add(group);
        if(contactTexture){const shadow=mesh(new THREE.PlaneGeometry(3.7,3.7),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,depthWrite:false,opacity:.65}),0,.009,0,group);shadow.rotation.x=-Math.PI/2}
        const radius = t.capacity <= 2 ? .77 : t.capacity <= 4 ? .95 : 1.18;
        const topMat = mat.walnut.clone(); materials.add(topMat); tabletopMaterials.push(topMat);
        const top = cylinder(radius, radius, .11, 0, 1.03, 0, topMat, group);
        top.userData.tableId = t.id; pickable.push(top);
        cylinder(.12, .17, .98, 0, .49, 0, mat.brass, group);
        cylinder(.47, .53, .07, 0, .055, 0, mat.charcoal, group);
        const runner = box(radius * .7, .012, radius * 1.85, 0, 1.095, 0, mat.linen, group); runner.rotation.y = .12;
        for (let j = 0; j < t.capacity; j++) {
          const a = j / t.capacity * Math.PI * 2;
          const distance = radius + .46;
          const chair = new THREE.Group(); chair.position.set(Math.sin(a) * distance, 0, Math.cos(a) * distance); chair.rotation.y = a; group.add(chair);
          // Padded, round chair seat and curved backrest instead of box stools.
          cylinder(.29, .29, .11, 0, .55, 0, mat.sage, chair);
          const backShape = new THREE.TorusGeometry(.31, .045, 6, 22, Math.PI);
          const back = mesh(backShape, mat.darkWood, 0, .99, .05, chair); back.rotation.x = Math.PI / 2;
          const fabricBack = mesh(new THREE.CylinderGeometry(.3, .3, .37, 24, 1, true, -Math.PI / 2, Math.PI), mat.sage, 0, .8, .05, chair);
          fabricBack.rotation.y = Math.PI / 2; fabricBack.material = mat.sage;
          for (const x of [-.19, .19]) for (const z of [-.19, .19]) cylinder(.022, .032, .5, x, .25, z, mat.darkWood, chair);
          const px = Math.sin(a) * radius * .65, pz = Math.cos(a) * radius * .65;
          cylinder(.18, .18, .018, px, 1.11, pz, mat.porcelain, group);
          cylinder(.13, .13, .01, px, 1.125, pz, mat.porcelain, group);
          cylinder(.04, .04, .01, px + .2, 1.12, pz, mat.brass, group);
          cylinder(.012, .012, .13, px + .2, 1.19, pz, mat.glass, group);
          const goblet = mesh(new THREE.SphereGeometry(.07, 12, 12), mat.glass, px + .2, 1.29, pz, group); goblet.scale.y = 1.2;
          const fork = box(.018, .012, .21, px - .23, 1.12, pz, mat.brass, group); fork.rotation.y = a;
        }
        cylinder(.065, .09, .2, 0, 1.23, 0, mat.brass, group);
        cylinder(.055, .055, .045, 0, 1.35, 0, mat.glow, group);
        const shade = cylinder(.32, .58, .23, 0, 3.4, 0, mat.brass, group);
        cylinder(.54, .54, .02, 0, 3.285, 0, mat.glow, group);
        cylinder(.012, .012, 2, 0, 4.5, 0, mat.brass, group);
        const light = new THREE.PointLight('#ffd497', 20, 7, 1.8); light.position.set(t.x, 2.9, t.z); scene.add(light);
        const ringMat = new THREE.MeshBasicMaterial({ color: '#e7c88e', transparent: true, opacity: .6, depthWrite: false });
        const ring = mesh(new THREE.RingGeometry(radius + .58, radius + .61, 64), ringMat, 0, .015, 0, group); ring.rotation.x = -Math.PI / 2; ring.visible = false; selectedRings.push(ring);
        const labelCanvas = document.createElement('canvas'); labelCanvas.width = 256; labelCanvas.height = 96;
        const context = labelCanvas.getContext('2d');
        if (context) {
          context.fillStyle = '#1c271ee8'; context.fillRect(0, 0, 256, 96); context.strokeStyle = '#c8ae7b'; context.strokeRect(1, 1, 254, 94);
          context.fillStyle = '#efe1c3'; context.font = '22px Arial'; context.textAlign = 'center'; context.fillText(`${t.id}  ·  ${t.capacity} SEATS`, 128, 57);
          const texture = new THREE.CanvasTexture(labelCanvas); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture);
          const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }); materials.add(material);
          const label = new THREE.Sprite(material); label.position.set(t.x, 1.9, t.z); label.scale.set(1.3, .49, 1); label.visible = false; scene.add(label); tableLabels.push(label);
        }
        void shade; void index;
      });
      // Lightweight instanced leaves, rather than low-poly green spheres.
      function oliveTree(x: number, z: number, scale = 1) {
        cylinder(.48 * scale, .38 * scale, .72 * scale, x, .36 * scale, z, mat.stone);
        cylinder(.055 * scale, .10 * scale, 2.4 * scale, x, 1.7 * scale, z, mat.darkWood);
        const leafGeometry = new THREE.SphereGeometry(.11, 5, 4); geometries.add(leafGeometry);
        const leaves = new THREE.InstancedMesh(leafGeometry, mat.leafLight, 110);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < 110; i++) {
          const a = random() * Math.PI * 2, r = Math.sqrt(random()) * .85 * scale;
          dummy.position.set(x + Math.cos(a) * r, 2.3 * scale + (random() - .5) * 1.6 * scale, z + Math.sin(a) * r);
          dummy.scale.set(.4 * scale, 1.8 * scale, .7 * scale); dummy.rotation.set(random(), random() * Math.PI, random()); dummy.updateMatrix(); leaves.setMatrixAt(i, dummy.matrix);
        }
        leaves.castShadow = true; scene.add(leaves);
      }
      for (const x of [-9.7, 9.7]) for (const z of [7.5, 17.5]) oliveTree(x, z, 1.2);
      for (const x of [-6.4, 6.4]) oliveTree(x, .6, .75);
      // Human-scale finishing: linen runners, framed art, skirting and a reception rug.
      const fabricCanvas=document.createElement('canvas');fabricCanvas.width=fabricCanvas.height=128;const fabricCtx=fabricCanvas.getContext('2d');if(fabricCtx){fabricCtx.fillStyle='#b3a58d';fabricCtx.fillRect(0,0,128,128);for(let i=0;i<128;i+=3){fabricCtx.strokeStyle=i%2?'#d2c4aa55':'#655a4540';fabricCtx.beginPath();fabricCtx.moveTo(i,0);fabricCtx.lineTo(i,128);fabricCtx.stroke();fabricCtx.beginPath();fabricCtx.moveTo(0,i);fabricCtx.lineTo(128,i);fabricCtx.stroke()}}const fabric=new THREE.CanvasTexture(fabricCanvas);fabric.colorSpace=THREE.SRGBColorSpace;fabric.wrapS=fabric.wrapT=THREE.RepeatWrapping;fabric.repeat.set(5,5);textures.push(fabric);const woven=new THREE.MeshStandardMaterial({color:'#d1c1a2',map:fabric,bumpMap:fabric,bumpScale:.008,roughness:1});materials.add(woven);
      box(3.3,.018,3.4,0,.04,4.3,woven);
      for(const side of [-1,1]){box(.07,.14,18,side*7.6,.1,-8.3,mat.darkWood);for(const z of [-5.5,-10.5]){box(.1,1.65,1.3,side*7.48,2.55,z,mat.brass);box(.11,1.48,1.14,side*7.4,2.55,z,mat.linen);const art=mesh(new THREE.CircleGeometry(.39,40),mat.sage,side*7.32,2.6,z);art.rotation.y=side*Math.PI/2;art.scale.x=1.25}}
      TABLES.forEach(t=>{const runner=box(.38,.014,1.25,t.x,1.125,t.z,woven);runner.rotation.y=.2;for(let j=0;j<2;j++){cylinder(.045,.055,.13,t.x+.25+j*.15,1.18,t.z-.17,mat.porcelain)}});
      const pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster();
      let pointerStart = { x: 0, y: 0 }, dragging = false, inspectAngle = 0;
      const down = (event: PointerEvent) => { pointerStart = { x: event.clientX, y: event.clientY }; dragging = true; };
      const move = (event: PointerEvent) => {
        if (dragging && state.current.inspect && !state.current.menuView && state.current.motion) inspectAngle = THREE.MathUtils.clamp((event.clientX - pointerStart.x) / 250, -1, 1);
      };
      const up = (event: PointerEvent) => {
        const distance = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y); dragging = false;
        if (distance > 8 || state.current.progress < 2.5 || state.current.menuView) return;
        const rect = renderer!.domElement.getBoundingClientRect();
        pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1);
        raycaster.setFromCamera(pointer, camera);
        const hit = raycaster.intersectObjects(pickable)[0];
        if (hit) state.current.onSelect(hit.object.userData.tableId);
      };
      el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      cleanupListeners.push(() => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); });
      // Never derive projection dimensions from a potentially zero-height canvas wrapper.
      const resize = () => {
        const rect = el.getBoundingClientRect();
        const width = Math.max(1, rect.width || window.innerWidth), height = Math.max(1, rect.height || window.innerHeight);
        renderer!.setSize(width, height, false);
        renderer!.domElement.style.width = '100%'; renderer!.domElement.style.height = '100%';
        camera.aspect = width / height; camera.updateProjectionMatrix();
      };
      const observer = new ResizeObserver(resize); observer.observe(el); resize();
      cleanupListeners.push(() => observer.disconnect());
      let smoothedProgress=state.current.progress;
      let last = performance.now(), displayed = false, tableBlend = 0, menuBlend = 0, lastProbe=0,flatFrames=0;
      const desiredPosition = new THREE.Vector3(), desiredTarget = new THREE.Vector3();
      const render = (now: number) => {
        if (disposed) return;
        try {
          const dt = Math.min(Math.max((now - last) / 1000, .001), .05); last = now;
          const s = state.current;
          smoothedProgress=s.motion?THREE.MathUtils.damp(smoothedProgress,s.progress,7,dt):s.progress;
          const pose = tourPose(smoothedProgress);
          const shouldInspect = s.inspect && !s.menuView && s.progress >= 2.8;
          const showMenu=s.menuView && s.progress>=2.85;
          menuBlend=s.motion?THREE.MathUtils.damp(menuBlend,showMenu?1:0,4,dt):(showMenu?1:0);
          tableBlend = s.motion ? THREE.MathUtils.damp(tableBlend, shouldInspect ? 1 : 0, 3, dt) : (shouldInspect ? 1 : 0);
          const selected = tablePose(s.table, inspectAngle);
          desiredPosition.fromArray(pose.position).lerp(new THREE.Vector3().fromArray(selected.position), tableBlend);
          desiredTarget.fromArray(pose.target).lerp(new THREE.Vector3().fromArray(selected.target), tableBlend);
          desiredPosition.lerp(new THREE.Vector3().fromArray(MENU_CAMERA.position),menuBlend);
          desiredTarget.lerp(new THREE.Vector3().fromArray(MENU_CAMERA.target),menuBlend);
          const factor = s.motion ? 1 - Math.exp(-dt * 5) : 1;
          camera.position.lerp(desiredPosition, factor); lookingAt.lerp(desiredTarget, factor); camera.lookAt(lookingAt);
          camera.updateMatrixWorld();
          if(printedPage!==menuPageRef.current||printedActive!==activeDishRef.current){printedPage=menuPageRef.current;printedActive=activeDishRef.current;paintMenu(printedPage,printedActive)}
          // Project accessible controls to the same board; visible text is baked above.
          const board=boardRef.current;if(board){const rect=el.getBoundingClientRect();const [x,y,z]=MENU_WALL.position;const corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([sx,sy])=>{const p=new THREE.Vector3(x+sx*MENU_WALL.width/2,y+sy*MENU_WALL.height/2,z+.16).project(camera);return {x:(p.x+1)*rect.width/2,y:(1-p.y)*rect.height/2}});board.style.transform='matrix3d('+menuPlaneMatrix(800,923,corners).join(',')+')';board.style.visibility=menuBlend>.92?'visible':'hidden'}
          selectedRings.forEach((ring, i) => { ring.visible = !s.menuView && s.progress > 2.6 && TABLES[i].id === s.table; });
          tableLabels.forEach((label, i) => { label.visible = !s.menuView && s.progress > 2.6 && (!shouldInspect || TABLES[i].id === s.table); });
          tabletopMaterials.forEach((m, i) => { m.emissive.set(TABLES[i].id === s.table && shouldInspect ? '#6a3e15' : '#000000'); m.emissiveIntensity = .15; });
          renderer!.render(scene, camera);
          if (!displayed && renderer!.info.render.calls > 0) {
            const gl = renderer!.getContext();
            if (gl.isContextLost()) throw new Error('Graphics context lost before the first frame');
            // A context can exist while drawing only a flat clear colour. Detect that before revealing it.
            const samples: number[][] = [];
            for (const [x, y] of [[.2,.3],[.5,.3],[.8,.3],[.2,.6],[.5,.6],[.8,.6]]) {
              const pixel = new Uint8Array(4);
              gl.readPixels(Math.floor(gl.drawingBufferWidth*x), Math.floor(gl.drawingBufferHeight*y), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
              samples.push(Array.from(pixel));
            }
            const varied = samples.some(pixel => pixel.slice(0,3).some((value, channel) => Math.abs(value-samples[0][channel]) > 5));
            if (!varied) throw new Error('The first 3D frame was blank');
            displayed = true; setStatus('ready'); support.current(true);
          }
          if(displayed&&now-lastProbe>1800){lastProbe=now;const gl=renderer!.getContext();const colors:number[][]=[];for(const [x,y]of [[.2,.3],[.5,.3],[.8,.3],[.2,.6],[.5,.6],[.8,.6]]){const p=new Uint8Array(4);gl.readPixels(Math.floor(gl.drawingBufferWidth*x),Math.floor(gl.drawingBufferHeight*y),1,1,gl.RGBA,gl.UNSIGNED_BYTE,p);colors.push(Array.from(p))}const varied=colors.some(p=>p.slice(0,3).some((v,j)=>Math.abs(v-colors[0][j])>5));flatFrames=varied?0:flatFrames+1;if(flatFrames>=3)throw new Error('Restaurant frame remained blank after navigation')}
          frame = requestAnimationFrame(render);
        } catch (error) { fail(error); }
      };
      // First draw is synchronous. A render error cannot leave an apparently ready blank canvas.
      render(performance.now());
      cleanupListeners.push(() => { geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose()); });
    } catch (error) { fail(error); }
    return () => {
      disposed = true; cancelAnimationFrame(frame);
      cleanupListeners.forEach(fn => fn());
      renderer?.dispose(); renderer?.domElement.remove();
    };
  }, []);

  return <div className={'restaurant-stage '+status+(menuView?' showing-menu':'')} data-render-state={status} data-camera-progress={progress.toFixed(3)} data-camera-view={menuView?'menu':inspect?'table':'tour'}>
    {status !== 'ready' && <div className="scene-poster" aria-hidden="true"/>}
    <div ref={host} className="scene-canvas" style={{ opacity: status === 'ready' ? 1 : 0 }}/>
    {menuView&&<div ref={boardRef} className={'wall-menu-hotspots '+(status==='fallback'?'flat-menu':'')} aria-label="Seasonal wall menu" onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();changePage(1)}if(e.key==='ArrowLeft'){e.preventDefault();changePage(-1)}}}><div className="flat-menu-title"><small>EMBER TABLE</small><span>The seasonal menu</span></div>{menuPageItems(menuPage).map((dish,i)=>{const index=menuPage*MENU_PAGE_SIZE+i;return <button type="button" key={dish.id} ref={el=>{menuButtons.current[i]=el}} className={activeDish===index?'wall-dish active':'wall-dish'} onPointerEnter={e=>{if(e.pointerType==='mouse')setActiveDish(index)}} onFocus={()=>setActiveDish(index)} onKeyDown={e=>{if(e.key==='Escape')setActiveDish(null)}} onClick={()=>setActiveDish(index)} aria-expanded={activeDish===index} aria-controls="wall-food-card"><span>{dish.name}</span><small>₹{dish.price}</small></button>})}<div ref={paginationRef} className="wall-menu-pagination"><button type="button" aria-label="Previous menu page" onClick={()=>changePage(-1)}>←</button><span aria-live="polite">{String(menuPage+1).padStart(2,'0')} <i>/</i> {String(menuPageCount()).padStart(2,'0')}</span><button type="button" aria-label="Next menu page" onClick={()=>changePage(1)}>→</button></div></div>}
    {menuView&&activeDish!==null&&<FoodCard key={activeDish} index={activeDish} onSelect={selectDish} onClose={()=>setActiveDish(null)}/>}
    {status === 'loading' && <div className="render-notice" role="status">Preparing the restaurant…</div>}
    {status === 'fallback' && <div className="render-notice" role="status">Photography preview · 3D is unavailable on this browser. <a href="#reserve">Choose a table ↓</a></div>}
  </div>;
}
