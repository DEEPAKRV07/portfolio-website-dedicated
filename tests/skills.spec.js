import {test,expect} from '@playwright/test';
import {SKILL_DOMAINS} from '../src/v3/skillsGraph.js';
import {createSeed} from '../src/v3/data.js';
const seed=createSeed();
for(const [device,width,height]of[['desktop',1440,960],['mobile',390,844]])test(`${device}: semantic skill branches and every technology`,async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('./#/skills');await expect(page.locator('canvas')).toBeVisible({timeout:20000});await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0);
 await page.screenshot({path:`docs/screenshots/skills-overview-${device}.png`});
 for(const[id,title,children]of SKILL_DOMAINS){
  await expect(page.locator(`.v3-scene-label[data-node-id="${id}"]`)).not.toHaveClass(/is-occluded/);
  await page.locator(`.v3-scene-label[data-node-id="${id}"]`).click();await expect(page.locator('.network-context h2')).toHaveText(title);
  await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0);await page.waitForTimeout(150);
  await page.screenshot({path:`docs/screenshots/skills-branch-${id}-${device}.png`,fullPage:false});
  const overlap=await page.locator('.v3-scene-label:not(.is-occluded):not(.is-entering)').evaluateAll(labels=>{const a=labels.map(l=>l.getBoundingClientRect());return a.some((r,i)=>a.slice(i+1).some(s=>r.left<s.right&&r.right>s.left&&r.top<s.bottom&&r.bottom>s.top))});expect(overlap,title).toBeFalsy();
  for(const child of children){
   const record=seed.records.find(r=>r.id===child);await page.locator(`.v3-scene-label[data-node-id="${child}"]`).click();await expect(page.locator('#detail-title')).toHaveText(record.title);
   await expect(page.getByRole('dialog').getByRole('link',{name:`${title} ↗`,exact:true})).toBeVisible();
   for(const related of record.relatedIds){const r=seed.records.find(r=>r.id===related);await expect(page.getByRole('dialog').getByRole('link',{name:`${r.title} ↗`,exact:true})).toHaveCount(1);}
   await page.getByRole('button',{name:'Close details'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
  }
  await page.getByRole('link',{name:'← All domains',exact:true}).click();await expect(page).toHaveURL(/#\/skills$/);
 }
 await page.getByRole('button',{name:'Explore Deepak R V',exact:true}).click();await expect(page).toHaveURL(/#\/home$/);expect(errors).toEqual([]);
});
