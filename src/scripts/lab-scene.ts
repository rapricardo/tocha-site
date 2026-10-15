import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

type Marker = { x: number; y: number; visible: boolean };
export function createScene(host: HTMLElement, initialPaused: boolean, onMarkers: (markers: Marker[]) => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog('#143b33', 45, 105);
  const camera = new THREE.PerspectiveCamera(43, 1, .1, 160);
  scene.add(new THREE.HemisphereLight('#f0f4cd', '#163a35', 2.4));
  const sun = new THREE.DirectionalLight('#fff0c9', 3); sun.position.set(-12, 24, 18); scene.add(sun);
  const rim = new THREE.DirectionalLight('#90e8c3', 1.8); rim.position.set(12, 8, -30); scene.add(rim);
  const mat = (color: string) => new THREE.MeshToonMaterial({ color });
  const dark = mat('#153e37'), green = mat('#48846d'), mint = mat('#a9c9a5'), cream = mat('#d5d8b7');
  const gold = mat('#c9a26a'), coral = mat('#b97759'), blue = mat('#548f98');
  const black = mat('#102b28'), glow = new THREE.MeshBasicMaterial({ color: '#dcf8a6' });
  const yellow = new THREE.MeshBasicMaterial({ color: '#ffd45a' });
  const line = new THREE.LineBasicMaterial({ color: '#12352f', transparent: true, opacity: .55 });
  const textures: THREE.Texture[] = [];
  function mesh(g: THREE.BufferGeometry, m: THREE.Material, p: THREE.Object3D, x=0,y=0,z=0, edge=false) {
    const o = new THREE.Mesh(g,m); o.position.set(x,y,z); p.add(o);
    if(edge) o.add(new THREE.LineSegments(new THREE.EdgesGeometry(g,30),line));
    return o;
  }
  function box(w:number,h:number,d:number,m:THREE.Material,p:THREE.Object3D,x=0,y=0,z=0) {
    return mesh(new RoundedBoxGeometry(w,h,d,2,.06),m,p,x,y,z,true);
  }
  function cyl(r:number,h:number,m:THREE.Material,p:THREE.Object3D,x=0,y=0,z=0,segments=48) {
    return mesh(new THREE.CylinderGeometry(r,r,h,segments),m,p,x,y,z,true);
  }
  function group(x=0,z=0) { const g = new THREE.Group(); g.position.set(x,0,z); scene.add(g); return g; }
  function tube(a:THREE.Vector3,b:THREE.Vector3,r:number,m:THREE.Material,p:THREE.Object3D) {
    const o=cyl(r,a.distanceTo(b),m,p); o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize()); return o;
  }
  function ring(r:number,t:number,m:THREE.Material,p:THREE.Object3D,x=0,y=0,z=0) { return mesh(new THREE.TorusGeometry(r,t,8,64),m,p,x,y,z,true); }
  function textScreen(label:string,w:number,h:number,p:THREE.Object3D,x:number,y:number,z:number,diagram=0) {
    const c=document.createElement('canvas'); c.width=768; c.height=480; const ctx=c.getContext('2d')!;
    ctx.fillStyle='#132f2d';ctx.fillRect(0,0,768,480);
    ctx.strokeStyle='#315e53';ctx.lineWidth=1;
    for(let i=40;i<768;i+=40){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,480);ctx.stroke();}
    for(let i=40;i<480;i+=40){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(768,i);ctx.stroke();}
    ctx.fillStyle='#d6efb4';ctx.font='38px monospace';ctx.fillText(label,40,64);
    ctx.strokeStyle='#c1db9f';ctx.lineWidth=3;
    if(diagram===1){
      for(let i=0;i<3;i++){const xx=65+(i%2)*215, yy=120+i*85;ctx.strokeRect(xx,yy,340,56);ctx.fillRect(xx+20,yy+23,160+i*24,4);}
    }else if(diagram===2){
      const pts=[[160,180],[380,135],[580,220],[380,340],[140,340]];
      ctx.beginPath();pts.forEach(([xx,yy],i)=>i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy));ctx.closePath();ctx.stroke();
      pts.forEach(([xx,yy],i)=>{ctx.fillStyle=i===2?'#f6c64f':'#9fceb5';ctx.beginPath();ctx.arc(xx,yy,20,0,Math.PI*2);ctx.fill();});
    }else{
      for(let i=0;i<6;i++){ctx.fillStyle=i===3?'#f6c64f':'#7eae97';ctx.fillRect(65+i*105,320-(i%3)*50,50,60+(i%3)*50);}
      ctx.strokeStyle='#f0d085';ctx.beginPath();ctx.moveTo(60,250);ctx.bezierCurveTo(220,390,350,80,690,140);ctx.stroke();
    }
    if(label==='RT / LAB'){ctx.fillStyle='#132f2d';ctx.fillRect(0,0,768,480);ctx.fillStyle='#e2e7bd';ctx.font='bold 112px monospace';ctx.fillText('RT / LAB',106,280);}
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture);
    return mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:texture}),p,x,y,z);
  }
  function monitor(p:THREE.Object3D,x:number,y:number,z:number,w:number,label:string,color:THREE.Material=cream,diagram=0) {
    const g=new THREE.Group();g.position.set(x,y,z);p.add(g);
    box(w,w*.65,.28,color,g);box(w-.18,w*.65-.18,.07,black,g,0,0,.17);
    textScreen(label,w-.32,w*.65-.32,g,0,0,.22,diagram);
    box(.16,.7,.16,dark,g,0,-w*.32-.25);box(w*.55,.1,.6,color,g,0,-w*.32-.6);
    return g;
  }
  function floor(p:THREE.Object3D,r:number,color:THREE.Material) {
    cyl(r,.6,dark,p,0,-.5,0,8);cyl(r-.15,.16,color,p,0,-.13,0,8);
    const border=ring(r-.7,.035,glow,p,0,0,0);border.rotation.x=-Math.PI/2;
  }
  function wall(p:THREE.Object3D,color:THREE.Material,width=12) {
    box(width,4.6,.3,color,p,0,2.2,-5.8);
    box(width,.13,.6,gold,p,0,4.55,-5.8);
    for(let i=0;i<4;i++)box(.09,4.4,.1,dark,p,-width/2+.4+i*(width-.8)/3,2.2,-5.6);
  }
  function plant(p:THREE.Object3D,x:number,z:number) {
    cyl(.45,.7,cream,p,x,.35,z,8);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;const leaf=mesh(new THREE.SphereGeometry(.35,8,6),i%2?mint:green,p,x+Math.cos(a)*.25,1+i*.08,z+Math.sin(a)*.25);leaf.scale.set(.65,2,.4);leaf.rotation.set(Math.sin(a)*.6,0,Math.cos(a)*.6);
    }
  }
  const centers=[new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,0),new THREE.Vector3(19,0,-4),new THREE.Vector3(18,0,-26),new THREE.Vector3(-4,0,-28),new THREE.Vector3(-21,0,-8)];
  function corridor(a:THREE.Vector3,b:THREE.Vector3) {
    const delta=b.clone().sub(a); const g=group((a.x+b.x)/2,(a.z+b.z)/2);g.rotation.y=Math.atan2(delta.x,delta.z);
    box(3,.3,delta.length(),dark,g,0,-.25);
    for(const x of [-1.25,1.25])box(.045,.02,delta.length(),glow,g,x,-.08);
  }
  for(let i=2;i<6;i++)corridor(centers[1],centers[i]);

  // The entrance and the lobby share space; the camera passes through the sliding door.
  const lobby=group();floor(lobby,9,mint);wall(lobby,green,14);
  for(const x of [-7.3,7.3]){box(.45,4.8,12,green,lobby,x,2.25,0);box(.5,.13,12,gold,lobby,x,4.7,0);}
  const entrance=new THREE.Group();lobby.add(entrance);entrance.position.z=7.4;
  for(const x of [-4.9,4.9]){box(3.3,6.1,1.3,cream,entrance,x,2.8);box(.13,5.3,1.4,gold,entrance,x+(x<0?1.3:-1.3),2.8);}
  box(13.2,1.3,1.4,mint,entrance,0,6.1);
  box(5.1,.35,.15,dark,entrance,0,6.05,.8);
  textScreen('RT / LAB',3.4,.8,entrance,0,6.1,.89,2);
  const doors=[box(3.1,5.4,.26,dark,entrance,-1.57,2.65,.15),box(3.1,5.4,.26,dark,entrance,1.57,2.65,.15)];
  doors.forEach((door,i)=>{box(.06,4.7,.12,yellow,door,i? -1.4:1.4,0,.2);for(let j=0;j<3;j++)box(2.3,.09,.08,green,door,0,j*.35-.35,.2);});
  for(const x of [-5,5]){box(2.1,2.4,.12,black,entrance,x,3.2,.72);for(let i=0;i<6;i++)box(1.65,.12,.05,i===1?yellow:green,entrance,x,2.35+i*.32,.81);}
  for(let i=0;i<4;i++){box(8+i*.5,.18,1.1,cream,lobby,0,-.15-i*.08,8.3+i*.9);}
  // A partial roof and ventilation give the outside a recognizable building silhouette.
  box(14.8,.45,4.1,mint,lobby,0,4.8,-4.2);
  for(let i=0;i<5;i++)box(1.4,.3,2.4,dark,lobby,-4.6+i*2.3,5.16,-4.2);
  const antenna=group(-5,-4);cyl(.1,2,gold,antenna,0,6);const aerial=ring(.65,.09,gold,antenna,0,7);aerial.rotation.y=.4;
  cyl(1.7,.5,cream,lobby,0,.25,-1);cyl(1.25,.9,dark,lobby,0,.9,-1);
  const hubRing=ring(1.15,.1,gold,lobby,0,2,-1);hubRing.rotation.x=Math.PI/2;
  const hubCore=mesh(new THREE.IcosahedronGeometry(.65,0),gold,lobby,0,2.1,-1,true);
  const markerPositions:THREE.Vector3[]=[];
  [[-4.8,-4.1],[-1.7,-4.4],[2,-4.4],[5,-3.5]].forEach(([x,z],i)=>{
    box(2.2,2.7,.3,[gold,blue,mint,coral][i],lobby,x,1.8,z);
    box(1.85,2.35,.1,black,lobby,x,1.8,z+.2);
    textScreen(`0${i+2}`,1.55,1,lobby,x,2.25,z+.28,2);
    box(1.5,.06,.1,glow,lobby,x,.85,z+.3);
    markerPositions.push(new THREE.Vector3(x,3.65,z));
  });
  plant(lobby,-5.5,3.8);plant(lobby,5.5,3.8);

  // Work: a bench, articulated arms and components moving through the assembly.
  const work=group(19,-4);floor(work,7.4,cream);wall(work,mint);
  box(8,.45,3.5,gold,work,0,1.5);for(const x of [-3.5,3.5])box(.5,1.6,2.6,dark,work,x,.6);
  box(7.6,.12,2.5,dark,work,0,1.8);
  const conveyor:THREE.Mesh[]=[];
  for(let i=0;i<7;i++){const o=cyl(.2,2.2,mint,work,-3+i,1.9);o.rotation.x=Math.PI/2;conveyor.push(o);}
  const components:THREE.Mesh[]=[];
  for(let i=0;i<3;i++)components.push(box(.65,.65,.65,[cream,coral,gold][i],work,-2+i*2,2.4));
  const arms:THREE.Group[]=[];
  for(const x of [-2.5,2.5]){
    const arm=new THREE.Group();arm.position.set(x,0,-1.9);work.add(arm);cyl(.65,.5,dark,arm,0,1.9);cyl(.4,.8,gold,arm,0,2.5);
    tube(new THREE.Vector3(0,2.7,0),new THREE.Vector3(.5,4.1,0),.22,cream,arm);
    mesh(new THREE.SphereGeometry(.35,12,8),gold,arm,.5,4.1);
    tube(new THREE.Vector3(.5,4.1,0),new THREE.Vector3(.7,3.2,1.5),.17,cream,arm);
    box(.8,.16,.5,dark,arm,.7,3.15,1.5);for(const dx of [-.3,.3])box(.1,.5,.15,gold,arm,.7+dx,2.9,1.5);
    arms.push(arm);
  }
  monitor(work,0,3.35,-5.45,4.3,'RT',gold,2);
  for(const x of [-4.5,4.5]){box(1.5,2.8,1.1,green,work,x,1.4,-4.5);for(let j=0;j<4;j++)box(1.2,.04,.1,glow,work,x,.6+j*.5,-3.9);}

  // Athena: multiple conversation screens linked to one analysis console.
  const athena=group(18,-26);floor(athena,7.4,blue);wall(athena,dark);
  const athenaScreens:THREE.Group[]=[];
  for(let i=0;i<3;i++){const g=monitor(athena,(i-1)*3.8,3.3,i===1?-4.1:-3.2,3.5,i===1?'Athena':'',cream,i===1?2:i===0?1:0);g.rotation.y=(1-i)*.2;athenaScreens.push(g);}
  box(8,.35,2.8,cream,athena,0,1.3,-.2);for(const x of [-3,3])box(.35,1.3,1.9,dark,athena,x,.6);
  for(let i=0;i<3;i++){const desk=monitor(athena,(i-1)*2.2,2.2,0,1.7,'',mint,i);desk.rotation.x=-.1;}
  const analysis=ring(1.4,.065,glow,athena,0,5,-2.8);analysis.rotation.x=.45;
  const analysisCore=mesh(new THREE.OctahedronGeometry(.5),gold,athena,0,5,-2.8,true);
  for(const x of [-5.3,5.3]){box(1.2,3.4,1.5,dark,athena,x,1.7,-3);for(let i=0;i<6;i++)box(.75,.12,.05,i%2?glow:blue,athena,x,.4+i*.5,-2.2);}

  // Method: six stations around a shared worktable. Selection lights the corresponding station.
  const method=group(-4,-28);floor(method,7.4,mint);wall(method,green);
  cyl(3.5,.3,cream,method,0,1.15);cyl(.8,1.15,dark,method,0,.55);
  const methodNodes:THREE.Mesh[]=[];const methodRings:THREE.Mesh[]=[];
  for(let i=0;i<6;i++){
    const a=i*Math.PI/3, x=Math.sin(a)*2.65,z=Math.cos(a)*2.65;
    cyl(.65,.18,gold,method,x,1.42,z);
    methodNodes.push(mesh(new THREE.OctahedronGeometry(.36),i===0?yellow:green,method,x,1.95,z,true));
    const r=ring(.78,.035,i===0?yellow:glow,method,x,1.5,z);r.rotation.x=Math.PI/2;methodRings.push(r);
    tube(new THREE.Vector3(x,1.5,z),new THREE.Vector3(0,1.5,0),.025,gold,method);
  }
  const methodCore=mesh(new THREE.IcosahedronGeometry(.65,1),gold,method,0,2.3,0,true);
  for(let i=0;i<3;i++){box(2.7,1.65,.12,cream,method,(i-1)*3.5,3.2,-5.55);for(let j=0;j<3;j++)box(1.8-j*.25,.09,.05,green,method,(i-1)*3.5,3.65-j*.4,-5.45);}

  // Contact: an open meeting area, with two chairs and a shared table.
  const contact=group(-21,-8);floor(contact,7.4,cream);wall(contact,coral);
  cyl(2.5,.25,gold,contact,0,1.5);cyl(.35,1.5,dark,contact,0,.7);
  for(const x of [-3.5,3.5]){
    box(1.6,.32,1.6,mint,contact,x,.8);box(.3,1.8,1.7,green,contact,x+(x<0?-.65:.65),1.5);for(const z of [-.5,.5])box(.13,.7,.13,gold,contact,x,.35,z);
  }
  const notebook=box(1.2,.05,.9,cream,contact,0,1.68,.3);notebook.rotation.y=-.3;
  for(const x of [-1.4,1.4]){cyl(.2,.35,cream,contact,x,1.8);ring(.14,.035,gold,contact,x+.22,1.8);}
  for(const x of [-4.8,4.8])plant(contact,x,-3.5);
  const windowRing=ring(1.65,.16,gold,contact,0,3,-5.5);
  mesh(new THREE.CircleGeometry(1.5,64),new THREE.MeshBasicMaterial({color:'#bcd9b4'}),contact,0,3,-5.55);
  for(let i=0;i<3;i++)box(.06,2.5,.1,cream,contact,(i-1)*.8,3,-5.3);
  cyl(1.25,.2,gold,contact,0,4.9);cyl(.06,1.8,dark,contact,0,5.9);

  // Camera positions are in the same connected model, rather than moving the model behind the text.
  const vec=(a:number[])=>new THREE.Vector3(...a as [number,number,number]);
  const positions=[[19,13,27],[6.5,6.4,6.6],[29,9,8],[28,8.5,-14],[5.5,9,-16],[-11,8,4]].map(vec);
  const targets=[[0,2,1],[0,1.8,-2],[19,1.8,-2.5],[18,2,-26],[-4,1.6,-28],[-21,1.6,-8]].map(vec);
  const position=positions[0].clone(), target=targets[0].clone(), cameraTarget=new THREE.Vector3();
  const projected=new THREE.Vector3();
  let active=0, paused=initialPaused, lost=false, disposed=false, frame=0,last=0,time=0,mobile=false,doorOpen=0;
  let pointerX=0,pointerY=0;
  let travel: {path:THREE.CatmullRomCurve3; look:THREE.CatmullRomCurve3; elapsed:number; duration:number; fov:number; finish:()=>void}|undefined;
  function finishTravel(){
    if(!travel)return;const done=travel.finish;travel=undefined;position.copy(positions[active]);target.copy(targets[active]);camera.fov=active===1?55:43;doorOpen=active===0?0:1;done();
  }
  function render(){
    if(lost||disposed)return;
    camera.position.copy(position);
    if(!paused&&!travel){camera.position.x+=pointerX*.18;camera.position.y+=pointerY*.12;}
    cameraTarget.copy(target);camera.lookAt(cameraTarget);camera.updateProjectionMatrix();
    doors.forEach((door,i)=>door.position.x=(i?1:-1)*(1.57+doorOpen*2.9));
    hubCore.rotation.set(time*.2,time*.4,0);hubCore.position.y=2.2+Math.sin(time)*.08;hubRing.rotation.z=time*.2;
    aerial.rotation.y=time*.25;
    components.forEach((o,i)=>{o.position.x=((i*2+time*.5)%6)-3;o.rotation.y=time*.25;});
    arms.forEach((o,i)=>o.rotation.y=Math.sin(time*.7+i)*.12);
    conveyor.forEach(o=>o.rotation.y=time*.4);
    analysis.rotation.z=time*.13;analysisCore.rotation.y=time*.35;
    methodCore.rotation.set(time*.15,time*.3,0);methodNodes.forEach((o,i)=>{o.rotation.y=time*.4+i;});
    renderer.render(scene,camera);
    if(active===1&&!travel){
      camera.updateMatrixWorld();
      onMarkers(markerPositions.map(point=>{projected.copy(point).project(camera);return{x:THREE.MathUtils.clamp((projected.x*.5+.5)*host.clientWidth,32,host.clientWidth-32),y:(-.5*projected.y+.5)*host.clientHeight,visible:projected.z<1&&Math.abs(projected.y)<.94&&!mobile};}));
    }
  }
  function tick(stamp:number){
    frame=0;if(document.hidden||lost||disposed)return;
    if(stamp-last>=32){
      const dt=Math.min((stamp-last)/1000,.065);last=stamp;
      if(!paused)time+=dt;
      if(travel){
        travel.elapsed+=dt;const t=Math.min(travel.elapsed/travel.duration,1);const ease=t*t*(3-2*t);
        position.copy(travel.path.getPoint(ease));target.copy(travel.look.getPoint(ease));camera.fov=THREE.MathUtils.lerp(travel.fov,active===1?55:43,ease);
        doorOpen=active===0?1-ease:Math.min(1,t*5);
        if(t===1)finishTravel();
      }
      render();
    }
    if(!paused||travel)frame=requestAnimationFrame(tick);
  }
  function start(){if(!frame&&!disposed&&!lost&&!document.hidden&&(!paused||travel)){last=performance.now();frame=requestAnimationFrame(tick);}}
  function stop(){cancelAnimationFrame(frame);frame=0;}
  function resize(){
    const w=host.clientWidth,h=host.clientHeight;mobile=w<800;camera.aspect=w/h;
    camera.setViewOffset(w,h,mobile?0:-w*.19,0,w,h);camera.updateProjectionMatrix();renderer.setSize(w,h);render();
  }
  function pointer(e:PointerEvent){if(e.pointerType!=='touch'&&!paused){pointerX=(e.clientX/innerWidth-.5)*2;pointerY=(.5-e.clientY/innerHeight)*2;}}
  function visibility(){if(document.hidden)stop();else start();}
  const observer=new ResizeObserver(resize);observer.observe(host);
  document.addEventListener('pointermove',pointer,{passive:true});document.addEventListener('visibilitychange',visibility);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;stop();finishTravel();host.classList.remove('is-rendered');host.closest<HTMLElement>('.lab-home')!.dataset.render='static';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.classList.add('is-rendered');host.closest<HTMLElement>('.lab-home')!.dataset.render='webgl';render();start();});
  renderer.domElement.setAttribute('aria-hidden','true');host.appendChild(renderer.domElement);resize();host.classList.add('is-rendered');start();
  window.addEventListener('pagehide',e=>{
    stop();if(e.persisted)return;disposed=true;observer.disconnect();document.removeEventListener('pointermove',pointer);document.removeEventListener('visibilitychange',visibility);
    const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
    scene.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer.dispose();
  });
  window.addEventListener('pageshow',()=>start());
  return {
    goTo(index:number,instant:boolean,onDone:()=>void){
      const entering=active===0&&index===1;active=index;
      if(instant||paused||lost){travel=undefined;position.copy(positions[index]);target.copy(targets[index]);camera.fov=index===1?55:43;doorOpen=index===0?0:1;render();onDone();return;}
      const midpoint=position.clone().lerp(positions[index],.5);midpoint.y=Math.max(position.y,positions[index].y)+4;
      const route=entering?[position.clone(),vec([4,7,19]),vec([0,3.1,10.8]),vec([0,3,3.5]),positions[index].clone()]:[position.clone(),midpoint,positions[index].clone()];
      const lookRoute=entering?[target.clone(),vec([0,2.6,5]),vec([0,2.2,0]),targets[index].clone()]:[target.clone(),target.clone().lerp(targets[index],.5),targets[index].clone()];
      travel={path:new THREE.CatmullRomCurve3(route),look:new THREE.CatmullRomCurve3(lookRoute),elapsed:0,duration:entering?3.1:2.1,fov:camera.fov,finish:onDone};start();
    },
    setMethod(index:number){methodNodes.forEach((o,i)=>o.material=i===index?yellow:green);methodRings.forEach((o,i)=>o.material=i===index?yellow:glow);render();},
    setMotion(value:boolean){paused=value;if(paused){stop();finishTravel();pointerX=pointerY=0;render();}else start();},
  };
}
