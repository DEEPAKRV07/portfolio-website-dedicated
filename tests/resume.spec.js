import {test,expect} from '@playwright/test';
import {zipSync,strToU8} from 'fflate';
const docx=(text)=>Buffer.from(zipSync({'[Content_Types].xml':strToU8('<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="xml" ContentType="application/xml"/></Types>'),'word/document.xml':strToU8(`<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${text.split('\n').map(s=>`<w:p><w:r><w:t>${s.replaceAll('&','&amp;').replaceAll('<','&lt;')}</w:t></w:r></w:p>`).join('')}</w:body></w:document>`)}));
const fixture={name:'sample.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:docx('Sample Candidate\nEducation\nBSc Computer Science at Example College\nSkills\nPython, React, TensorFlow\nExperience\nBuilt React interfaces at Example Company\nProjects\nTensorFlow and Python classification experiment\nCertifications\nExample course completion')};
for(const [device,width,height]of [['desktop',1440,960],['tablet',768,1024],['mobile',390,844]]){
 test(`${device}: real PDF extraction, graph exploration and original portfolio recovery`,async({page})=>{
  test.setTimeout(90000);await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});const errors=[],writes=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')writes.push(r.url());if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1'))external.push(r.url());});
  await page.goto('./#/resume');const storage=await page.evaluate(()=>JSON.stringify(localStorage));
  await page.locator('#resume-file').setInputFiles('public/my_resume.pdf');await expect(page.locator('.resume-result')).toContainText('source sections',{timeout:45000});
  await expect(page.getByRole('button',{name:'Explore Document profile',exact:true})).not.toHaveClass(/is-entering/);
  await page.locator('.hero').scrollIntoViewIfNeeded();await page.screenshot({path:`docs/screenshots/resume-network-${device}.png`});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
  await page.getByRole('button',{name:'Explore Document profile',exact:true}).click();await expect(page.locator('#detail-title')).toHaveText('Document profile');
  await expect(page.locator('.detail-body')).toContainText('DEEPAK R V');await expect(page.locator('.detail-body')).toContainText('S.A. Engineering');
  const bounds=await page.getByRole('dialog').boundingBox();expect(bounds.y).toBeGreaterThanOrEqual(0);expect(bounds.y+bounds.height).toBeLessThanOrEqual(height);
  await page.locator('.detail-body').focus();await page.keyboard.press('End');await expect.poll(()=>page.locator('.detail-body').evaluate(e=>e.scrollTop+e.clientHeight>=e.scrollHeight-2)).toBeTruthy();
  await page.screenshot({path:`docs/screenshots/resume-details-${device}.png`});await page.getByRole('button',{name:'Close details'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(await page.evaluate(()=>JSON.stringify(localStorage))).toBe(storage);expect(writes).toEqual([]);expect(external).toEqual([]);
  await page.getByRole('link',{name:'← Return to Deepak’s portfolio'}).click();await expect(page.getByRole('button',{name:'Explore Projects',exact:true})).toBeVisible();await page.getByRole('button',{name:'Explore Projects',exact:true}).click();await expect(page).toHaveURL(/#\/projects$/);expect(errors).toEqual([]);
 });
}

test('DOCX, drop, failed parsing, cancellation, clear and reload keep the public content intact',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/resume');
 // A real DOCX archive, dropped through the browser's file API.
 await page.locator('.resume-dropzone').evaluate((zone,{bytes,name,type})=>{const transfer=new DataTransfer();transfer.items.add(new File([new Uint8Array(bytes)],name,{type}));zone.dispatchEvent(new DragEvent('drop',{bubbles:true,dataTransfer:transfer}));},{bytes:[...fixture.buffer],name:fixture.name,type:fixture.mimeType});
 await expect(page.locator('.resume-result')).toContainText('6 source sections');await page.getByRole('button',{name:'Explore Software terms',exact:true}).click();await expect(page.locator('.detail-body')).toContainText('React');await expect(page.locator('.detail-body')).not.toContainText('Unity');await page.keyboard.press('Escape');
 await page.locator('#resume-file').setInputFiles({name:'bad.pdf',mimeType:'application/pdf',buffer:Buffer.from('not a pdf')});await expect(page.getByRole('alert')).toContainText('not a valid PDF');await expect(page.locator('.resume-result')).toContainText('sample.docx');
 await page.locator('#resume-file').setInputFiles({name:'empty.docx',mimeType:fixture.mimeType,buffer:docx('')});await expect(page.getByRole('alert')).toContainText('No readable resume text');
 await page.locator('#resume-file').setInputFiles({name:'resume.exe',mimeType:'application/octet-stream',buffer:Buffer.from('anything')});await expect(page.getByRole('alert')).toContainText('PDF or DOCX');
 await page.getByRole('button',{name:'Clear resume',exact:true}).click();await expect(page.locator('.resume-result')).toHaveCount(0);
 await page.route('**/docx.worker.js*',async route=>{await new Promise(r=>setTimeout(r,1000));await route.continue().catch(()=>{});});
 await page.locator('#resume-file').setInputFiles(fixture);await page.getByRole('button',{name:'Cancel reading',exact:true}).click();await expect(page.locator('.resume-progress')).toContainText('cancelled');await expect(page.locator('.resume-result')).toHaveCount(0);
 await page.unroute('**/docx.worker.js*');await page.locator('#resume-file').setInputFiles(fixture);await expect(page.locator('.resume-result')).toBeVisible();await page.reload();await expect(page.locator('.resume-result')).toHaveCount(0);
});

for(const [device,width,height]of [['desktop',1440,960],['tablet',768,1024],['mobile',390,844]]){
 test(`${device}: wheel passes through canvas and long panels scroll within the viewport`,async({page})=>{
  await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('./#/home');await expect(page.locator('canvas')).toBeVisible();
  await expect(page.getByRole('link',{name:'Index',exact:true})).toHaveCount(0);expect(await page.evaluate(()=>document.fonts.check('16px Deltha'))).toBeTruthy();
  const canvas=await page.locator('canvas').boundingBox();await page.mouse.move(canvas.x+canvas.width*.7,canvas.y+canvas.height*.45);await page.mouse.wheel(0,350);await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(50);
  await page.goto('./#/education');await page.locator('.card-link').first().click();await expect(page.getByRole('dialog')).toBeVisible();
  const panel=page.locator('.detail-body'),bar=await page.locator('.detail-topbar').boundingBox();const scroll=await page.evaluate(()=>scrollY);
  await panel.hover();await page.mouse.wheel(0,650);await expect.poll(()=>panel.evaluate(e=>e.scrollTop)).toBeGreaterThan(0);expect(await page.evaluate(()=>scrollY)).toBe(scroll);expect((await page.locator('.detail-topbar').boundingBox()).y).toBe(bar.y);
  await panel.focus();await page.keyboard.press('End');await expect.poll(()=>panel.evaluate(e=>e.scrollTop+e.clientHeight>=e.scrollHeight-2)).toBeTruthy();
  const bounds=await page.getByRole('dialog').boundingBox();expect(bounds.y+bounds.height).toBeLessThanOrEqual(height);
  await page.screenshot({path:`docs/screenshots/scroll-education-${device}.png`});await page.getByRole('button',{name:'Close details'}).click();await expect(page.getByRole('dialog')).not.toBeVisible();
 });
}

test('touch defaults to page scrolling and returns to it after explicit 3D gestures',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto((process.env.TEST_BASE_URL||'http://127.0.0.1:5173/portfolio-website-dedicated/')+'#/home');await expect(page.getByRole('button',{name:'Explore About',exact:true})).not.toHaveClass(/is-entering/);
 const cdp=await context.newCDPSession(page),label=page.getByRole('button',{name:'Explore About',exact:true});
 const swipe=async()=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:374,y:430}]});for(let step=1;step<=8;step++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:374,y:430-step*22}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 const before=await label.getAttribute('style');await swipe();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(60);expect(await label.getAttribute('style')).toBe(before);await expect(page).toHaveURL(/#\/home$/);
 await page.evaluate(()=>scrollTo(0,0));await page.getByRole('button',{name:'Enable 3D gestures',exact:true}).tap();expect(await page.locator('canvas').evaluate(e=>getComputedStyle(e).touchAction)).toBe('none');
 await page.getByRole('button',{name:'Exit 3D gestures',exact:true}).tap();expect(await page.locator('canvas').evaluate(e=>getComputedStyle(e).touchAction)).toBe('pan-y');await swipe();await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(60);
 await context.close();
});

test('cancelling before the lazy parser loads gives an immediate cancelled state',async({page})=>{
 await page.route('**/src/v3/resumeParser.js',async route=>{await new Promise(r=>setTimeout(r,1200));await route.continue().catch(()=>{});});await page.goto('./#/resume');await page.locator('#resume-file').setInputFiles(fixture);await page.getByRole('button',{name:'Cancel reading',exact:true}).click();await expect(page.locator('.resume-progress')).toContainText('cancelled');await expect(page.locator('.resume-result')).toHaveCount(0);await expect(page.locator('#resume-file')).toBeEnabled();
});

test('fast DOCX extraction before renderer initialization frames the visible graph correctly',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.route('**/src/v3/engine/SceneEngine.js*',async route=>{await new Promise(r=>setTimeout(r,1500));await route.continue();});await page.goto('./#/resume');await page.locator('#resume-file').setInputFiles(fixture);await expect(page.locator('.resume-result')).toBeVisible();
 await page.locator('.hero').scrollIntoViewIfNeeded();const label=page.getByRole('button',{name:'Explore Software terms',exact:true});await expect(label).not.toHaveClass(/is-entering|is-occluded/);await label.click();await expect(page.locator('#detail-title')).toHaveText('Software terms');
});
