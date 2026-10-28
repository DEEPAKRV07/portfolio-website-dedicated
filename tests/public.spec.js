import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('Home interrupts navigation before the next hashchange render',async({page})=>{
 await page.goto('./#/home');await expect(page.locator('canvas')).toBeVisible();
 await page.evaluate(()=>{location.hash='#/about';document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Home',bubbles:true}));});
 await expect(page).toHaveURL(/#\/home$/);await expect(page.locator('.hero')).toHaveAttribute('data-world','home');
});
test('a branch deep link waits for a delayed scene module',async({page})=>{
 await page.route('**/src/v3/engine/SceneEngine.js',async route=>{await new Promise(resolve=>setTimeout(resolve,1500));await route.continue();});
 await page.goto('./#/skills',{waitUntil:'commit'});await expect(page.locator('.scene-loading')).toBeVisible();
 await page.evaluate(()=>{location.hash='#/skills/vision-geometry'});
 await expect(page.locator('.network-context h2')).toHaveText('Computer Vision');await expect(page.getByRole('dialog')).not.toBeVisible();
 await expect(page.getByRole('button',{name:'Explore Camera Calibration',exact:true})).not.toHaveClass(/is-occluded|is-entering/);
});
const errorsFor = page => { const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});return errors; };
for (const [name,width,height] of [['desktop',1440,960],['laptop',1280,800],['tablet',768,1024],['mobile',390,844],['small-mobile',320,720],['landscape',844,390]]) {
 test(`${name}: real 3D, navigation and readable content`,async({page})=>{
  const errors=errorsFor(page);await page.setViewportSize({width,height});await page.goto('./');
  await expect(page.locator('canvas')).toBeVisible();await expect(page.getByRole('heading',{name:/Intelligence.*Connected/})).toBeVisible();
  await page.getByRole('button',{name:'Reduce motion',exact:true}).click();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.screenshot({path:`docs/screenshots/home-${name}.png`,fullPage:name==='mobile'});
  await page.getByRole('button',{name:'Explore Projects',exact:true}).click();
  await expect(page).toHaveURL(/#\/projects$/);await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('link',{name:'SightMate — AI Navigation Assistant',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();await expect(page.locator('#detail-title')).toContainText('SightMate');
  await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goBack();await expect(page.getByRole('dialog')).toBeVisible();await page.goForward();await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.goto('./#/skills');await expect(page.locator('.type-skill')).toHaveCount(23);await page.getByRole('link',{name:'Machine Learning',exact:true}).click();
  await expect(page.locator('#detail-title')).toContainText('Machine Learning');await expect(page.getByRole('heading',{name:'Connected work & technologies'})).toBeVisible();
  await page.goto('./#/experience');await expect(page.getByRole('link',{name:'Computer Vision / AI R&D Intern',exact:true})).toBeVisible();
  await page.goto('./#/education');await page.locator('.card-link').first().click();await expect(page.getByRole('dialog')).toContainText('7.99');
  await page.goto('./#/contact');await expect(page.locator('a[href="mailto:deepakvetrivelan@gmail.com"]').first()).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();expect(errors).toEqual([]);
 });
}
test('deep link, search, keyboard, reading mode, resume and accessibility',async({page,request})=>{
 const errors=errorsFor(page);await page.goto('./#/projects/sightmate');await expect(page.getByRole('dialog')).toBeVisible();await page.reload();await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('button',{name:'Close details'}).click();await page.getByRole('searchbox').fill('nonexistentzz');await expect(page.getByText('No matches. Try another title or technology.')).toBeVisible();
 await page.getByRole('searchbox').fill('');await page.getByRole('button',{name:'Reading mode',exact:true}).click();await expect(page.locator('canvas')).toHaveCount(0);await page.getByRole('button',{name:'Show 3D',exact:true}).click();await expect(page.locator('canvas')).toBeVisible();
 for(const quality of ['low','high','auto']){await page.getByRole('combobox',{name:'Rendering quality'}).selectOption(quality);expect(await page.evaluate(()=>localStorage.getItem('portfolio.quality'))).toBe(quality);}
 await page.getByRole('button',{name:'Reduce motion',exact:true}).click();await expect(page.locator('.v3-scene-label.is-entering')).toHaveCount(0);
 const beforeOrbit=await page.locator('.v3-scene-label[data-node-id="sightmate"]').boundingBox();await page.locator('canvas').focus();await page.keyboard.press('ArrowRight');
 await expect.poll(async()=>{const after=await page.locator('.v3-scene-label[data-node-id="sightmate"]').boundingBox();return Math.abs(after.x-beforeOrbit.x)+Math.abs(after.y-beforeOrbit.y)}).toBeGreaterThan(1);await page.keyboard.press('r');
 await page.getByRole('button',{name:'Enable motion',exact:true}).click();await expect(page.getByRole('button',{name:'Reduce motion',exact:true})).toBeVisible();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);
 const resume=await request.get('./my_resume.pdf');expect(resume.ok()).toBeTruthy();expect(resume.headers()['content-type']).toContain('pdf');expect(errors).toEqual([]);
});
test('WebGL failure, reduced motion, not found and legacy path restoration',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args)}});
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/skills');await expect(page.locator('.v3-scene-fallback')).toBeVisible();await expect(page.locator('.type-skill')).toHaveCount(23);await page.getByRole('button',{name:'Explore Machine Learning',exact:true}).click();await expect(page.getByRole('dialog')).toBeVisible();
 await page.goto('./not-a-page');await expect(page.getByRole('heading',{name:'A little off the map.'})).toBeVisible();
 await page.goto('./?p=projects/sightmate');await expect(page.getByRole('dialog')).toBeVisible();expect(errors).toEqual([]);
});

test('touch phone: orbit, scene selection and navigation menu', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const page = await context.newPage(); const errors = errorsFor(page);
  await page.goto((process.env.TEST_BASE_URL || 'http://127.0.0.1:5173/portfolio-website-dedicated/') + '#/home');
  await expect(page.locator('canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Reduce motion', exact: true }).tap();
  await page.locator('canvas').scrollIntoViewIfNeeded();
  const before = await page.getByRole('button', { name: 'Explore Projects', exact: true }).boundingBox();
  const canvas = await page.locator('canvas').boundingBox();
  const cdp = await context.newCDPSession(page);
  const {x,y} = await page.locator('canvas').evaluate(canvas=>{const r=canvas.getBoundingClientRect();for(const fy of [.25,.35,.5,.7])for(const fx of [.12,.25,.45]){const x=r.x+r.width*fx,y=r.y+r.height*fy;if([0,30,60,90].every(dx=>document.elementFromPoint(x+dx,y)===canvas))return{x,y};}throw new Error('No clear touch-drag area');});
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + step * 15, y }] });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await expect.poll(async () => { const after = await page.getByRole('button', { name: 'Explore Projects', exact: true }).boundingBox(); return Math.abs(after.x - before.x) + Math.abs(after.y - before.y); }).toBeGreaterThan(3);
  await page.getByRole('button', { name: 'Explore Projects', exact: true }).tap();
  await expect(page).toHaveURL(/#\/projects$/);
  await page.getByRole('button', { name: 'Open navigation' }).tap();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Contact', exact: true }).tap();
  await expect(page).toHaveURL(/#\/contact$/); expect(errors).toEqual([]);
  await context.close();
});
