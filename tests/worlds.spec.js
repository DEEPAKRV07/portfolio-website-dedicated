import {test,expect} from '@playwright/test';
import {createSeed} from '../src/v3/data.js';
const seed=createSeed();
const worlds=['home','about','projects','skills','experience','education','contact'];
for(const [device,width,height] of [['desktop',1440,960],['tablet',768,1024],['mobile',390,844]]){
 test(`${device}: every network world, contextual content and root return`,async({page})=>{
  test.setTimeout(90000);const errors=[],missing=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});
  await page.addInitScript(()=>{window.openedDestinations=[];window.open=(url)=>{openedDestinations.push(url);return null}});
  for(const world of worlds){
   await page.goto(`./#/${world}`);await expect(page.locator('canvas')).toBeVisible();
   await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0);await page.waitForTimeout(200);
   const overlap=await page.locator('.v3-scene-label:not(.is-occluded):not(.is-entering)').evaluateAll(labels=>{const a=labels.map(l=>l.getBoundingClientRect());return a.some((r,i)=>a.slice(i+1).some(s=>r.left<s.right&&r.right>s.left&&r.top<s.bottom&&r.bottom>s.top))});expect(overlap,`${world} label overlap`).toBeFalsy();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${world} overflow`).toBeTruthy();
   if(width<=800)expect(await page.locator('.hero').evaluate(hero=>{const a=hero.querySelector('.v3-scene-legend').getBoundingClientRect();return [...hero.querySelector('.hero-copy').children].some(el=>{const b=el.getBoundingClientRect();return b.height>0&&a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top})}),`${world} hint overlaps text`).toBeFalsy();
   await page.screenshot({path:`docs/screenshots/release-${world}-${device}.png`});
   if(world==='home')continue;
   const node=seed.nodes.find(n=>n.world===world&&!n.id.endsWith('_root')&&seed.records.some(r=>r.id===n.contentId&&r.status==='published'));
   const record=seed.records.find(r=>r.id===node.contentId);
   await page.locator(`.v3-scene-label[data-node-id="${node.id}"]`).click();
   if(world==='contact'){expect(await page.evaluate(()=>openedDestinations.at(-1))).toBe('mailto:deepakvetrivelan@gmail.com');await page.goto(`./#/contact/${record.slug}`);await expect(page.locator('#detail-title')).toHaveText(record.title);await page.screenshot({path:`docs/screenshots/release-contact-detail-${device}.png`});await page.getByRole('button',{name:'Close details'}).click();await page.getByRole('link',{name:'⌂ Main core',exact:true}).click();continue;}
   if(world==='skills'){
    await expect(page.locator('.network-context h2')).toHaveText(record.title);await page.getByRole('button',{name:'Explore Machine Learning',exact:true}).click();
    await expect(page.locator('#detail-title')).toHaveText('Machine Learning');
   }else
   await expect(page.locator('#detail-title')).toHaveText(record.title);await page.screenshot({path:`docs/screenshots/release-${world}-detail-${device}.png`});
   await page.getByRole('button',{name:'Close details'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
   await page.getByRole('link',{name:'⌂ Main core',exact:true}).click();await expect(page).toHaveURL(/#\/home$/);
  }
  for(const world of worlds.filter(w=>w!=='home')){
   await page.getByRole('button',{name:`Explore ${world[0].toUpperCase()+world.slice(1)}`,exact:true}).click();await expect(page).toHaveURL(new RegExp(`#/${world}$`));
   await page.keyboard.press('Home');await expect(page).toHaveURL(/#\/home$/);
  }
  expect(errors).toEqual([]);expect(missing).toEqual([]);
 });
}

test('phone skills use readable category navigation and camera controls',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/skills');
 await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0);
 await expect(page.locator('.v3-scene-label[data-node-id="skills_root"]')).not.toHaveClass(/is-occluded/);
 await expect(page.getByRole('button',{name:'Explore Machine Learning',exact:true})).toHaveClass(/is-occluded/);
 await page.getByRole('button',{name:'Explore AI / ML',exact:true}).click();await expect(page.locator('.network-context h2')).toHaveText('AI / ML');
 await page.getByRole('button',{name:'Explore Machine Learning',exact:true}).click();await expect(page.locator('#detail-title')).toHaveText('Machine Learning');
 await page.getByRole('button',{name:'Close details'}).click();
 const before=await page.locator('.v3-scene-label[data-node-id="skills_root"]').boundingBox();
 await page.getByRole('button',{name:'Zoom in',exact:true}).click({clickCount:3});
 await expect.poll(async()=>{const after=await page.locator('.v3-scene-label[data-node-id="skills_root"]').boundingBox();return Math.abs(after.y-before.y)}).toBeGreaterThan(1);
 await page.getByRole('button',{name:'Reset view',exact:true}).click();
 await page.getByRole('link',{name:'← All domains',exact:true}).click();
 await expect(page.getByRole('button',{name:'Explore Machine Learning',exact:true})).toHaveClass(/is-occluded/);
});

test('authored entrance gates labels and failed GLB keeps procedural navigation',async({page})=>{
 await page.goto('./');await expect(page.locator('canvas')).toBeVisible();await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0,{timeout:15000});
 await page.route('**/models/*.glb',route=>route.abort());await page.reload();
 await expect(page.getByRole('button',{name:'Explore Projects',exact:true})).not.toHaveClass(/is-entering/,{timeout:15000});
 await page.getByRole('button',{name:'Explore Projects',exact:true}).click();await expect(page).toHaveURL(/#\/projects$/);
});

test('Contact geometry preserves direct destinations and latest resume',async({page,request})=>{
 await page.addInitScript(()=>{window.openedDestinations=[];window.open=(url,target)=>{openedDestinations.push({url,target});return null}});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/contact');
 for(const[id,url]of [['email','mailto:deepakvetrivelan@gmail.com'],['linkedin','https://www.linkedin.com/in/deepakrv07/'],['github','https://github.com/DEEPAKRV07'],['resume','/portfolio-website-dedicated/my_resume.pdf']]){
  await page.getByRole('button',{name:'Reset view',exact:true}).click();await page.locator(`.v3-scene-label[data-node-id="contact_${id}"]`).click();expect(await page.evaluate(()=>openedDestinations.at(-1).url)).toBe(url);await expect(page).toHaveURL(/#\/contact$/);
 }
 const resume=await request.get('./my_resume.pdf');expect(resume.ok()).toBeTruthy();expect((await resume.body()).length).toBe(129159);
});
