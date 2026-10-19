/* Isolated 3D study companion. Inspired by the selected Three.js robot demo's interaction approach; original geometry to avoid copying unverified-licence assets. */
(function(){
 'use strict';
 const instances=new WeakMap();
 let threePromise=null;
 function loadThree(){
  if(window.THREE)return Promise.resolve(window.THREE);
  if(!threePromise)threePromise=new Promise((resolve,reject)=>{
   const script=document.createElement('script');
   script.src='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
   script.async=true;
   script.onload=()=>window.THREE?resolve(window.THREE):reject(new Error('Three.js did not load'));
   script.onerror=()=>reject(new Error('Three.js CDN unavailable'));
   document.head.appendChild(script);
  });
  return threePromise;
 }
 function unmount(el){
  const x=instances.get(el); if(!x)return;
  cancelAnimationFrame(x.frame); window.removeEventListener('resize',x.resize);
  x.scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){for(const m of (Array.isArray(o.material)?o.material:[o.material]))m.dispose();}});
  x.renderer.dispose(); if(x.renderer.domElement.parentNode)x.renderer.domElement.parentNode.removeChild(x.renderer.domElement);
  instances.delete(el);
 }
 async function mount(el){
  if(!el||instances.has(el))return;
  try{
   const THREE=await loadThree();
   if(!el.isConnected||instances.has(el))return;
   const w=Math.max(70,el.clientWidth||100),h=Math.max(80,el.clientHeight||110);
   const scene=new THREE.Scene();
   const camera=new THREE.PerspectiveCamera(34,w/h,.1,100);
   camera.position.set(0,2.1,7.8);camera.lookAt(0,1.25,0);
   const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));renderer.setSize(w,h,false);
   renderer.setClearColor(0x000000,0);
   if('outputEncoding' in renderer)renderer.outputEncoding=THREE.sRGBEncoding;
   renderer.domElement.setAttribute('aria-label','رفيق روبوت ثلاثي الأبعاد');
   renderer.domElement.style.cssText='display:block;width:100%;height:100%;pointer-events:none';
   el.appendChild(renderer.domElement);
   scene.add(new THREE.HemisphereLight(0xeaf8ff,0x37483d,1.45));
   const key=new THREE.DirectionalLight(0xffffff,2.1);key.position.set(4,7,5);scene.add(key);
   const rim=new THREE.PointLight(0x72e7e2,1.8,14);rim.position.set(-3,3,2);scene.add(rim);
   const steel=new THREE.MeshStandardMaterial({color:0x9aa99f,metalness:.72,roughness:.34});
   const dark=new THREE.MeshStandardMaterial({color:0x34454a,metalness:.58,roughness:.3});
   const green=new THREE.MeshStandardMaterial({color:0x687e68,metalness:.38,roughness:.48});
   const eye=new THREE.MeshStandardMaterial({color:0x75f5ec,emissive:0x29d9cf,emissiveIntensity:1.4,roughness:.18});
   const amber=new THREE.MeshStandardMaterial({color:0xd6a45e,metalness:.45,roughness:.35});
   const robot=new THREE.Group();scene.add(robot);
   const torso=new THREE.Group();torso.position.y=1.65;robot.add(torso);
   const body=new THREE.Mesh(new THREE.BoxGeometry(1.02,1.24,.62),steel);body.castShadow=true;torso.add(body);
   const chest=new THREE.Mesh(new THREE.BoxGeometry(.62,.35,.045),green);chest.position.set(0,.16,.337);torso.add(chest);
   const core=new THREE.Mesh(new THREE.SphereGeometry(.105,16,12),eye);core.position.set(0,.16,.38);torso.add(core);
   const neck=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.22,12),dark);neck.position.y=.72;torso.add(neck);
   const headPivot=new THREE.Group();headPivot.position.set(0,.92,0);torso.add(headPivot);
   const head=new THREE.Mesh(new THREE.SphereGeometry(.53,24,18),steel);head.scale.set(1.02,.86,.82);headPivot.add(head);
   const face=new THREE.Mesh(new THREE.BoxGeometry(.72,.31,.12),dark);face.position.set(0,-.03,.405);headPivot.add(face);
   [-.19,.19].forEach(x=>{const e=new THREE.Mesh(new THREE.SphereGeometry(.075,16,12),eye);e.position.set(x,-.03,.48);headPivot.add(e)});
   const earMat=green;
   [-1,1].forEach(side=>{const ear=new THREE.Mesh(new THREE.BoxGeometry(.12,.24,.18),earMat);ear.position.set(side*.52,.04,0);headPivot.add(ear)});
   const antenna=new THREE.Group();antenna.position.set(0,.47,0);headPivot.add(antenna);
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.38,8),dark);stem.position.y=.18;antenna.add(stem);
   const tip=new THREE.Mesh(new THREE.SphereGeometry(.09,14,10),amber);tip.position.y=.39;antenna.add(tip);
   const arms=[],legs=[];
   [-1,1].forEach(side=>{
    const arm=new THREE.Group();arm.position.set(side*.62,.42,0);torso.add(arm);
    const shoulder=new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),green);arm.add(shoulder);
    const upper=new THREE.Mesh(new THREE.CylinderGeometry(.12,.14,.48,10),steel);upper.position.y=-.3;arm.add(upper);
    const elbow=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),dark);elbow.position.y=-.57;arm.add(elbow);
    const fore=new THREE.Mesh(new THREE.CylinderGeometry(.105,.12,.43,10),steel);fore.position.y=-.79;arm.add(fore);
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.13,12,10),green);hand.position.y=-1.02;arm.add(hand);arms.push(arm);
    const leg=new THREE.Group();leg.position.set(side*.31,.98,0);robot.add(leg);
    const thigh=new THREE.Mesh(new THREE.CylinderGeometry(.16,.19,.48,10),dark);thigh.position.y=-.22;leg.add(thigh);
    const knee=new THREE.Mesh(new THREE.SphereGeometry(.15,12,10),green);knee.position.y=-.48;leg.add(knee);
    const shin=new THREE.Mesh(new THREE.CylinderGeometry(.12,.15,.4,10),steel);shin.position.y=-.69;leg.add(shin);
    const foot=new THREE.Mesh(new THREE.BoxGeometry(.34,.16,.48),green);foot.position.set(0,-.92,.11);leg.add(foot);legs.push(leg);
   });
   const state={renderer,scene,resize:null,frame:0};
   state.resize=()=>{if(!el.isConnected)return;const nw=Math.max(70,el.clientWidth||100),nh=Math.max(80,el.clientHeight||110);camera.aspect=nw/nh;camera.updateProjectionMatrix();renderer.setSize(nw,nh,false)};
   window.addEventListener('resize',state.resize);
   const start=performance.now();
   const animate=now=>{
    if(!el.isConnected){unmount(el);return}
    const t=(now-start)/1000;
    torso.position.y=1.65+Math.sin(t*2.1)*.035;
    torso.rotation.y=Math.sin(t*.7)*.11;
    headPivot.rotation.y=Math.sin(t*1.1)*.2;
    headPivot.rotation.x=Math.sin(t*.8)*.035;
    arms[0].rotation.z=Math.sin(t*2.4)*.11+.04;
    arms[1].rotation.z=-Math.sin(t*2.4)*.11-.04;
    legs[0].rotation.z=Math.sin(t*2.4)*.035;
    legs[1].rotation.z=-Math.sin(t*2.4)*.035;
    tip.scale.setScalar(.9+Math.sin(t*3.2)*.12);
    renderer.render(scene,camera);state.frame=requestAnimationFrame(animate);
   };
   instances.set(el,state);state.frame=requestAnimationFrame(animate);
  }catch(err){
   el.textContent='🤖';el.setAttribute('aria-label','تعذر تحميل عرض الروبوت ثلاثي الأبعاد');el.style.display='grid';el.style.placeItems='center';
   console.warn('Study companion 3D robot unavailable:',err);
  }
 }
 window.StudentGuideRobot3D={mount,unmount};
})();