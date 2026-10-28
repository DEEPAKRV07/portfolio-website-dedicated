import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

test('camera and authored entrances finish on time after a slow frame',async({page})=>{
 await page.goto('./tests/fixtures/engine.html');await page.waitForFunction(()=>window.ready&&[...engine.nodes.values()].every(e=>!e.assetPending));
 const result=await page.evaluate(()=>{
  engine.stop();engine.motion=true;
  for(const e of engine.nodes.values()){e.created=engine.clock;e.authored?.mixer.setTime(0);}
  const target=engine.controls.target.clone().add(new THREE.Vector3(1,0,0)),position=engine.camera.position.clone().add(new THREE.Vector3(1,0,0));
  engine.moveCamera(position,target);engine.stop();engine.lastFrameTime=1000;
  const gap=Math.max(3,...[...engine.nodes.values()].map(e=>e.authored?.duration||0))+1;
  engine.render(1000+gap*1000);engine.stop();
  return{complete:[...engine.nodes.values()].every(e=>e.introComplete),cameraDone:engine.cameraTransition===null,position:engine.camera.position.toArray(),expected:position.toArray()};
 });expect(result.complete).toBeTruthy();expect(result.cameraDone).toBeTruthy();result.position.forEach((value,i)=>expect(value).toBeCloseTo(result.expected[i],10));
});

test('renderer, retained GLBs, camera, connections and cleanup',async({page})=>{
 test.setTimeout(90000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./tests/fixtures/engine.html');await page.waitForFunction(()=>window.ready);
 await page.waitForFunction(()=>[...engine.nodes.values()].every(e=>!e.assetPending&&e.introComplete));
 const home=await page.evaluate(()=>engine.stats());expect(home.webgl).toBeTruthy();expect(home.edges).toBe(6);
 const assetCount=await page.evaluate(()=>[...engine.nodes.values()].filter(e=>e.authored).length);expect(assetCount).toBe(6);
 await page.evaluate(()=>{window.activations=[];engine.onSelect=id=>activations.push(id)});
 const point=await page.evaluate(()=>{const p=engine.nodes.get('projects').group.position.clone().project(engine.camera);return{x:(p.x+1)*innerWidth/2,y:(1-p.y)*innerHeight/2}});
 await page.mouse.click(point.x,point.y);expect(await page.evaluate(()=>activations)).toEqual(['projects']);
 await page.mouse.move(point.x,point.y);await page.mouse.down();await page.mouse.move(point.x+90,point.y+15,{steps:6});await page.mouse.up();expect(await page.evaluate(()=>activations)).toEqual(['projects']);
 await page.evaluate(()=>engine.setMotion(false));
 for(let i=0;i<3;i++){await page.evaluate(()=>engine.resetCamera(true));await page.waitForTimeout(50)}
 const renderedNuclei=await page.evaluate(()=>[...engine.nodes.values()].filter(e=>e.authored).map(e=>new THREE.Box3().setFromObject(e.authored.wrapper).getSize(new THREE.Vector3()).length()));expect(renderedNuclei.every(size=>size>.2)).toBeTruthy();
 const worlds=['projects','skills','experience','education','contact','about','home'];const stats=[];
 for(const world of worlds){await page.evaluate(w=>{engine.setWorld(w);engine.resetCamera(true)},world);await page.waitForFunction(()=>[...engine.nodes.values()].every(e=>!e.assetPending));await page.waitForTimeout(80);stats.push(await page.evaluate(()=>engine.stats()));}
 const warmed=await page.evaluate(()=>engine.stats());
 for(let i=0;i<5;i++)for(const world of worlds){await page.evaluate(w=>engine.setWorld(w),world);await page.waitForTimeout(50)}
 const repeated=await page.evaluate(()=>engine.stats());expect(repeated.geometries).toBeLessThanOrEqual(warmed.geometries+3);expect(repeated.textures).toBe(warmed.textures);
 const beforeFocus=await page.evaluate(()=>engine.camera.position.toArray());await page.evaluate(()=>engine.focus('projects'));expect(await page.evaluate(()=>engine.camera.position.toArray())).not.toEqual(beforeFocus);
 await page.evaluate(()=>engine.resetCamera(true));const beforeZoom=await page.evaluate(()=>engine.camera.position.distanceTo(engine.controls.target));await page.evaluate(()=>engine.zoom(.8));expect(await page.evaluate(()=>engine.camera.position.distanceTo(engine.controls.target))).toBeCloseTo(beforeZoom*.8);
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>engine.setWorld('skills'));await page.waitForFunction(()=>[...engine.nodes.values()].every(e=>!e.assetPending));await page.waitForTimeout(150);await page.screenshot({path:'docs/screenshots/skills-engine-mobile.png'});
 const overlaps=await page.locator('.v3-scene-label:not(.is-occluded):not(.is-entering)').evaluateAll(labels=>{const rects=labels.map(x=>x.getBoundingClientRect());return rects.flatMap((a,i)=>rects.slice(i+1).filter(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)).length});expect(overlaps).toBe(0);
 const link=await page.evaluate(()=>{const entry=[...engine.nodes.values()].find(e=>e.node.id==='yolov8');engine.updateNodePosition(entry.node.id,[1,2,3]);const edge=[...engine.edges.values()].find(e=>e.edge.target===entry.node.id);return {moved:engine.positions.get(entry.node.id),end:edge.curve.getPoint(1).toArray(),radius:entry.radius};});expect(link.moved).toEqual([1,2,3]);expect(Math.hypot(...link.end.map((v,i)=>v-link.moved[i]))).toBeCloseTo(link.radius);
 const frames=await page.evaluate(()=>engine.stats().frames);await page.waitForTimeout(250);expect(await page.evaluate(()=>engine.stats().frames)).toBeLessThanOrEqual(frames+2);
 await page.evaluate(()=>engine.dispose());await expect(page.locator('canvas')).toHaveCount(0);const disposed=await page.evaluate(()=>({frame:engine.frame,listeners:engine.listeners.length,nodes:engine.nodes.size}));expect(disposed).toEqual({frame:null,listeners:0,nodes:0});expect(errors).toEqual([]);
 await fs.writeFile('docs/engine-measurements.json',JSON.stringify({browser:'Headless Microsoft Edge on Windows; emulated viewport, not a physical mobile device',home,assetCount,renderedNuclei,worlds:stats,warmed,repeated,disposed},null,2));
});

test('Skills branch highlights documented paths and pulses follow rendered directed curves',async({page})=>{
 await page.goto('./tests/fixtures/engine.html');await page.waitForFunction(()=>window.ready);
 await page.evaluate(()=>{engine.setWorld('skills');engine.setBranch('vision-geometry');engine.select('ml-kit');engine.setMotion(true)});
 await page.waitForFunction(()=>[...engine.nodes.values()].every(e=>!e.assetPending&&e.introComplete));
 const first=await page.evaluate(()=>{
  const e=engine.edges.get('edge-ml-kit-skills-project-football'),t=(engine.clock*.16-e.flowLevel*.22+1)%1;
  return{position:e.pulse.position.toArray(),expected:e.curve.getPoint(t).toArray(),active:e.material.opacity,unrelated:engine.edges.get('edge-vision-geometry-camera-calibration').material.opacity,ids:[...engine.relatedNodes]};
 });expect(first.position).toEqual(first.expected);expect(first.active).toBeGreaterThan(first.unrelated);expect(first.ids).toEqual(expect.arrayContaining(['skills_root','vision-geometry','ml-kit','skills-project-football','skills-project-sightmate']));
 await page.waitForTimeout(180);expect(await page.evaluate(()=>engine.edges.get('edge-ml-kit-skills-project-football').pulse.position.toArray())).not.toEqual(first.position);
 await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
 expect(await page.evaluate(()=>engine.positions.get('skills_root')[1])).toBe(12);
 await page.evaluate(()=>engine.setMotion(false));const paused=await page.evaluate(()=>engine.edges.get('edge-ml-kit-skills-project-football').pulse.position.toArray());await page.waitForTimeout(200);expect(await page.evaluate(()=>engine.edges.get('edge-ml-kit-skills-project-football').pulse.position.toArray())).toEqual(paused);
 for(const branch of ['cv-category','systems-category','vision-geometry','dl-category','engineering-practice','lang-category']){
  const outside=await page.evaluate(id=>{engine.setBranch(id);engine.resetCamera(true);engine.camera.updateMatrixWorld();return [...engine.edges.values()].flatMap(e=>e.curve.getPoints(40)).filter(p=>{p.project(engine.camera);return Math.abs(p.x)>.95||Math.abs(p.y)>.95||Math.abs(p.z)>1}).length},branch);
  expect(outside,`${branch} connection bounds on phone`).toBe(0);
 }
});

test('real wheel zoom, pointer pan and touch pinch follow the explicit input policy',async({page,browser})=>{
 await page.goto('./tests/fixtures/engine.html');await page.waitForFunction(()=>window.ready&&[...engine.nodes.values()].every(e=>!e.assetPending&&e.introComplete));await page.evaluate(()=>{engine.setMotion(false);window.activations=[];engine.onSelect=id=>activations.push(id)});
 const hiddenHit=await page.evaluate(()=>{const entry=engine.nodes.get('projects'),p=entry.group.position.clone().project(engine.camera),event={clientX:(p.x+1)*innerWidth/2,clientY:(1-p.y)*innerHeight/2};entry.group.visible=false;const hidden=engine.hit(event);entry.group.visible=true;entry.introComplete=false;const entering=engine.hit(event);entry.introComplete=true;return{hidden,entering};});expect(hiddenHit).toEqual({hidden:null,entering:null});
 const distance=()=>page.evaluate(()=>engine.camera.position.distanceTo(engine.controls.target));const before=await distance();await page.mouse.move(300,300);await page.mouse.wheel(0,-200);expect(await distance()).toBeCloseTo(before,8);
 await page.keyboard.down('Alt');await page.mouse.wheel(0,-200);await page.keyboard.up('Alt');await expect.poll(distance).toBeLessThan(before-1);
 const target=await page.evaluate(()=>engine.controls.target.toArray());await page.mouse.down({button:'right'});await page.mouse.move(380,330,{steps:6});await page.mouse.up({button:'right'});expect(await page.evaluate(()=>engine.controls.target.toArray())).not.toEqual(target);expect(await page.evaluate(()=>activations)).toEqual([]);
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),phone=await context.newPage();await phone.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:5173/portfolio-website-dedicated/')+'tests/fixtures/engine.html');await phone.waitForFunction(()=>window.ready);await phone.getByRole('button',{name:'Enable 3D gestures',exact:true}).tap();
 const initial=await phone.evaluate(()=>engine.camera.position.distanceTo(engine.controls.target)),cdp=await context.newCDPSession(phone);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:160,y:420,id:1},{x:230,y:420,id:2}]});
 for(let step=1;step<=6;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:160-step*8,y:420,id:1},{x:230+step*8,y:420,id:2}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect.poll(()=>phone.evaluate(()=>engine.camera.position.distanceTo(engine.controls.target))).toBeLessThan(initial-1);await context.close();
});
