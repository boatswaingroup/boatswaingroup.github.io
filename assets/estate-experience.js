import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';
import { VRButton } from 'https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/webxr/VRButton.js';

const mount = document.querySelector('#estate3dCanvas');
if (mount) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#dce9df');
  scene.fog = new THREE.Fog('#dce9df', 34, 92);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 180);
  camera.position.set(17, 19, 25);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = true;
  mount.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight('#f5fff7', '#71836d', 2.1));
  const sun = new THREE.DirectionalLight('#fff2d3', 2.5);
  sun.position.set(-12, 24, 15); sun.castShadow = true; scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(64, 54), new THREE.MeshStandardMaterial({color:'#a9c69b', roughness:1}));
  ground.rotation.x = -Math.PI/2; ground.position.y = -0.08; ground.receiveShadow = true; scene.add(ground);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 48), new THREE.MeshStandardMaterial({color:'#c5b99c'}));
  road.rotation.x=-Math.PI/2; road.position.set(0,0.01,0); scene.add(road);
  const plots = [];
  const plotGroup = new THREE.Group(); scene.add(plotGroup);
  const colors = {available:'#e8d9a5', selected:'#e0a83f', reserved:'#d98e76', allocated:'#87a9a0'};
  const plotMaterial = new THREE.MeshStandardMaterial({color:colors.available, roughness:.85});
  for(let row=0;row<5;row++) for(let col=0;col<6;col++) {
    if(col===2 && row!==2) continue;
    const x=(col-2.5)*4.2, z=(row-2)*4.0;
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(3.75,.22,3.55),plotMaterial.clone());
    mesh.position.set(x,.08,z); mesh.castShadow=true;mesh.receiveShadow=true;
    mesh.userData={code:`P-${String(row+1).padStart(2,'0')}-${String(col+1).padStart(2,'0')}`, status:(row===0&&col===0)?'reserved':'available'};
    if(mesh.userData.status==='reserved')mesh.material.color.set(colors.reserved);
    plotGroup.add(mesh);plots.push(mesh);
    const border=new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry),new THREE.LineBasicMaterial({color:'#647d63'}));
    border.position.copy(mesh.position);plotGroup.add(border);
  }
  const buildingMat=new THREE.MeshStandardMaterial({color:'#eee9d9'});
  function building(x,z,w=3.2,d=2.6,h=1.8){
    const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMat);b.position.set(x,h/2,z);b.castShadow=true;scene.add(b);
    const roof=new THREE.Mesh(new THREE.ConeGeometry(Math.max(w,d)*.72,.9,4),new THREE.MeshStandardMaterial({color:'#805746'}));roof.position.set(x,h+.4,z);roof.rotation.y=Math.PI/4;scene.add(roof);
  }
  building(-13,-12,5,4,2.4);building(13,-12,4,3.5,2);building(13,12,3.5,3,1.8);
  const treeMat=new THREE.MeshStandardMaterial({color:'#39734d'});
  for(let i=0;i<28;i++){
    const x=(i%7-3)*7.4-2,z=(Math.floor(i/7)-1.5)*13;
    if(Math.abs(x)<5)continue;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.13,.2,1.3,7),new THREE.MeshStandardMaterial({color:'#75553c'}));trunk.position.set(x,.65,z);scene.add(trunk);
    const crown=new THREE.Mesh(new THREE.SphereGeometry(1.05,9,7),treeMat);crown.position.set(x,1.85,z);crown.scale.y=1.2;scene.add(crown);
  }
  // Farm zone: crop rows, a pond, and simple low-poly livestock markers.
  const farm=new THREE.Group();farm.position.set(-22,0,0);scene.add(farm);
  for(let r=0;r<7;r++)for(let c=0;c<5;c++){
    const crop=new THREE.Mesh(new THREE.ConeGeometry(.22,.95,5),new THREE.MeshStandardMaterial({color:r%2?'#5d8b48':'#779c4f'}));
    crop.position.set(c*.85,.48,r*1.35-4);crop.rotation.z=(c%2)*.12;farm.add(crop);
  }
  const pond=new THREE.Mesh(new THREE.CircleGeometry(2.2,32),new THREE.MeshStandardMaterial({color:'#6daeb5',roughness:.25,metalness:.12}));
  pond.rotation.x=-Math.PI/2;pond.position.set(6,.02,6);farm.add(pond);
  const animalMat=new THREE.MeshStandardMaterial({color:'#f0e8d8'});
  for(let i=0;i<4;i++){
    const body=new THREE.Mesh(new THREE.BoxGeometry(.9,.55,.48),animalMat);body.position.set(7+i*1.25,.5,-5);farm.add(body);
    const head=new THREE.Mesh(new THREE.SphereGeometry(.24,8,6),animalMat);head.position.set(7.48+i*1.25,.72,-5);farm.add(head);
  }

  const raycaster=new THREE.Raycaster(), pointer=new THREE.Vector2();
  let selected=null, stage=0, dragging=false, lastX=0, lastY=0, orbit=0, tilt=.62, distance=34;
  const detail=document.querySelector('#estatePlotSelection');
  function choose(mesh){
    if(selected)selected.material.color.set(selected.userData.status==='reserved'?colors.reserved:colors.available);
    selected=mesh;selected.material.color.set(colors.selected);
    if(detail)detail.textContent=`${mesh.userData.code} · ${mesh.userData.status==='reserved'?'Reserved in this demonstration':'Available in this demonstration'} · Select a verified plot in the inventory below to make a real reservation.`;
  }
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;});
  window.addEventListener('pointerup',()=>dragging=false);
  window.addEventListener('pointermove',e=>{
    if(!dragging||renderer.xr.isPresenting)return;
    const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;
    if(e.buttons===1){orbit-=dx*.006;tilt=Math.max(.2,Math.min(1.2,tilt+dy*.004));}
  });
  renderer.domElement.addEventListener('click',e=>{
    const rect=renderer.domElement.getBoundingClientRect();pointer.x=((e.clientX-rect.left)/rect.width)*2-1;pointer.y=-((e.clientY-rect.top)/rect.height)*2+1;
    raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(plots)[0];if(hit)choose(hit.object);
  });
  const stageNames=['Natural site','Roads & infrastructure','Estate plots','Homes & community'];
  function setStage(value){
    stage=Number(value);document.querySelector('#estateStageLabel').textContent=stageNames[stage];
    plotGroup.visible=stage>=2;
    road.visible=stage>=1;
    scene.children.forEach(obj=>{if(obj.geometry?.type==='BoxGeometry'&&obj!==road)obj.visible=stage>=3||!plots.includes(obj)});
  }
  document.querySelector('#estateStage')?.addEventListener('input',e=>setStage(e.target.value));
  document.querySelector('#estateViewReset')?.addEventListener('click',()=>{orbit=0;tilt=.62;distance=34;setStage(2)});
  document.querySelector('#estateViewPlots')?.addEventListener('click',()=>{setStage(2);document.querySelector('#estateStage').value='2'});
  const vrHost=document.querySelector('#estateVrButton');
  if(navigator.xr&&vrHost){
    try{vrHost.append(VRButton.createButton(renderer));}
    catch{vrHost.textContent='VR unavailable in this browser';}
  }else if(vrHost){vrHost.textContent='VR requires a compatible headset and WebXR browser';vrHost.setAttribute('aria-disabled','true');}
  function resize(){const w=mount.clientWidth||800,h=mount.clientHeight||470;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
  new ResizeObserver(resize).observe(mount);resize();
  renderer.setAnimationLoop(()=>{
    const target=new THREE.Vector3(0,0,0);
    if(!renderer.xr.isPresenting){
      camera.position.set(Math.sin(orbit)*Math.cos(tilt)*distance,Math.sin(tilt)*distance,Math.cos(orbit)*Math.cos(tilt)*distance);
      camera.lookAt(target);
    }
    renderer.render(scene,camera);
  });
  setStage(2);
}
