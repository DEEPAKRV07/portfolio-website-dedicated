import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
async function field(page,name,value){const target=page.getByLabel(name,{exact:true});await target.fill(value);await target.press('Tab');}
async function publish(page){await page.locator('[data-action="save"]').click();await expect(page.locator('[data-save-state]')).toHaveText('Draft saved');await page.locator('[data-action="publish"]').click();await expect(page.getByRole('heading',{name:'Publish to this browser?'})).toBeVisible();await page.locator('[data-action="confirm-publish"]').click();await expect(page.locator('[data-save-state]')).toHaveText('Published successfully');}
async function create(page,type,title,slug){await page.locator(`[data-action="collection"][data-type="${type}"]`).click();await page.locator('[data-action="new"]').click();await field(page,'Title',title);await field(page,'URL slug',slug);await field(page,'Summary',`Verification content for ${title}.`);await page.getByLabel('Publication status',{exact:true}).selectOption('published');}
test('complete local Studio creation, media, graph, publish, reload and rollback',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('./#/admin');
 await create(page,'project','Verification Project','verification-project');await field(page,'Tags / technologies','Python, Three.js');await field(page,'Your role','Engineer');
 await page.locator('[data-action="add-section"]').click();await field(page,'Heading','Approach');await field(page,'Content','A test case created entirely through Portfolio Studio.');
 await page.locator('[data-action="add-link"]').click();await field(page,'Label','Repository');await field(page,'URL','https://github.com/DEEPAKRV07');
 await page.locator('[data-tab="media"]').click();
 const png=await fs.readFile('public/favicon.png');
 await page.locator('[data-media-file]').setInputFiles([{name:'first.png',mimeType:'image/png',buffer:png},{name:'second.png',mimeType:'image/png',buffer:png}]);
 await expect(page.locator('.studio-media-card')).toHaveCount(2);await expect(page.locator('.studio-media-preview img').first()).toHaveJSProperty('complete',true);
 await page.locator('[data-scope="media"][data-field="alt"]').first().fill('First verification image');await page.locator('[data-scope="media"][data-field="alt"]').first().press('Tab');
 await page.locator('[data-action="media-up"]').nth(1).click();await page.locator('[data-action="cover-media"]').first().click();
 const videoFixture=await fs.readFile('tests/fixtures/verification.webm');
 await page.locator('[data-media-file]').setInputFiles({name:'clip.webm',mimeType:'video/webm',buffer:videoFixture});await expect(page.locator('.studio-media-card')).toHaveCount(3);
 await page.locator('[data-tab="relations"]').click();await page.locator('[data-related-record]').selectOption({label:'Skill · Machine Learning'});await page.locator('[data-action="add-relation"]').click();
 await page.locator('[data-action="add-record-node"]').click();await page.locator('[data-action="open-node"]').click();await expect(page.locator('.studio-scene-canvas canvas')).toBeVisible();
 await page.getByLabel('X',{exact:true}).fill('8');await page.getByLabel('X',{exact:true}).press('Tab');await page.getByLabel('Geometry',{exact:true}).selectOption('monolith');await page.getByLabel('Material',{exact:true}).selectOption('glass');
 await page.locator('[data-action="add-edge"]').click();await page.locator('[data-action="confirm-add-edge"]').click();await expect(page.locator('.studio-edge-card')).toHaveCount(1);await page.getByLabel('Style',{exact:true}).selectOption('ribbon');
 await page.screenshot({path:'docs/screenshots/studio-graph.png'});await publish(page);
 await page.locator('[data-action="exit"]').click();await page.goto('./#/projects/verification-project');await expect(page.locator('#detail-title')).toHaveText('Verification Project');await expect(page.locator('.detail-dialog .media-item')).toHaveCount(3);await page.locator('.detail-dialog .media-item video').scrollIntoViewIfNeeded();await page.locator('.detail-dialog .media-item video').evaluate(v=>v.play());await expect.poll(()=>page.locator('.detail-dialog .media-item video').evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);await expect(page.locator('.related-links')).toContainText('Machine Learning');
 await page.reload();await expect(page.locator('#detail-title')).toHaveText('Verification Project');await expect(page.locator('.detail-dialog .media-item img').first()).toHaveJSProperty('complete',true);await page.screenshot({path:'docs/screenshots/project-media.png'});
 await page.goto('./#/admin');await create(page,'experience','Verification Experience','verification-experience');await field(page,'Role','Research Engineer');await field(page,'Company / organization','Test organization');await field(page,'Start date','2025-01');await field(page,'End date (YYYY-MM or blank)','2025-02');
 await create(page,'skill','Verification Skill','verification-skill');await page.getByLabel('Category',{exact:true}).selectOption('cv-category');
 await page.locator('[data-action="archive"]').click();await page.locator('[data-action="restore-record"]').click();await page.getByLabel('Publication status',{exact:true}).selectOption('published');
 await page.locator('[data-action="delete-record"]').click();await page.locator('[data-action="confirm-delete-record"]').click();await page.locator('[data-action="undo"]').click();await expect(page.getByLabel('Title',{exact:true})).toHaveValue('Verification Skill');
 await field(page,'Title','Verification Skill edited');await page.locator('[data-action="undo"]').click();await expect(page.getByLabel('Title',{exact:true})).toHaveValue('Verification Skill');await page.locator('[data-action="redo"]').click();await expect(page.getByLabel('Title',{exact:true})).toHaveValue('Verification Skill edited');
 await create(page,'section','Verification Section','verification-section');await page.locator('[data-tab="relations"]').click();await page.locator('[data-action="add-record-node"]').click();await publish(page);
 const downloadPromise=page.waitForEvent('download');await page.locator('[data-action="export"]').click();const download=await downloadPromise;const backup=await fs.readFile(await download.path(),'utf8');expect(JSON.parse(backup).records.some(r=>r.slug==='verification-experience')).toBeTruthy();expect(backup).not.toContain('data:image/');
 await page.locator('[data-import-file]').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});await page.locator('[data-action="confirm-import"]').click();await publish(page);
 await page.locator('[data-action="exit"]').click();await page.goto('./#/experience/verification-experience');await expect(page.locator('#detail-title')).toHaveText('Verification Experience');await page.goto('./#/skills/verification-skill');await expect(page.locator('#detail-title')).toHaveText('Verification Skill edited');await page.goto('./#/section/verification-section');await expect(page.locator('#detail-title')).toHaveText('Verification Section');
 await page.goto('./#/admin');await page.locator('[data-action="versions"]').click();await page.locator('[data-action="restore-version"]').last().click();await publish(page);await page.locator('[data-action="exit"]').click();await page.goto('./#/experience/verification-experience');await expect(page.getByRole('alert')).toContainText('Entry not found');expect(errors).toEqual([]);
});
test('Studio mobile layout and invalid import',async({page})=>{await page.setViewportSize({width:390,height:844});await page.goto('./#/admin');await expect(page.getByRole('heading',{name:'Projects6'})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();await page.locator('[data-import-file]').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{bad')});await expect(page.locator('.studio-toast')).toContainText('not valid JSON');await page.screenshot({path:'docs/screenshots/studio-mobile.png',fullPage:true});});

test('Studio skill domain, scene node and documented project stay synchronized after publishing',async({page})=>{
 await page.goto('./#/admin');await create(page,'skill','Verification Technology','verification-technology');await page.getByLabel('Category',{exact:true}).selectOption('vision-geometry');
 await page.locator('[data-tab="relations"]').click();await page.locator('[data-related-record]').selectOption('sightmate');await page.locator('[data-action="add-relation"]').click();
 await page.locator('[data-action="add-record-node"]').click();await publish(page);await page.locator('[data-action="exit"]').click();
 await page.goto('./#/skills/vision-geometry');await expect(page.getByRole('button',{name:'Explore Verification Technology',exact:true})).toBeVisible();await page.getByRole('button',{name:'Explore Verification Technology',exact:true}).click();
 await expect(page.locator('#detail-title')).toHaveText('Verification Technology');await expect(page.getByRole('dialog').getByRole('link',{name:'SightMate — AI Navigation Assistant ↗',exact:true})).toBeVisible();
});


test('Studio keyboard tabs and accessibility',async({page})=>{
 const {default:AxeBuilder}=await import('@axe-core/playwright');
 await page.goto('./#/admin');
 await page.getByRole('tab',{name:'Details',exact:true}).focus();await page.keyboard.press('ArrowRight');
 await expect(page.getByRole('tab',{name:'Media (0)',exact:true})).toBeFocused();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(axe.violations).toEqual([]);
});
