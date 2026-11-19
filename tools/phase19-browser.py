from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
root=Path(__file__).resolve().parent.parent; out=root.parent; html=(root/'launch.html').read_text()
projects={'sight','football','leads','unity'}
checks={'about':'.screenLinks','experience':'.careerTimeline','skills':'.skillGroups','education':'.academicRecord','contact':'.contactActions','lab':'#trainStep','workspace':'#termIn','secret':'#termIn'}
w,h=map(int,sys.argv[1:3]) if len(sys.argv)>2 else (1440,900)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl']);pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=w<500,is_mobile=w<500,reduced_motion='reduce');pg.set_default_timeout(12000);errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 pg.set_content(html,wait_until='domcontentloaded');pg.locator('#bootEnter').click();pg.wait_for_timeout(300)
 for id in ['about','experience','sight','football','leads','unity','skills','education','contact','lab','workspace']:
  pg.evaluate('(id)=>window.coreNavigate(byId[id])',id);pg.locator('#dock').wait_for(state='visible');pg.wait_for_function('(id)=>document.querySelector("#world").dataset.docked===id',arg=id);d=pg.locator('#dockBody');assert d.locator('[data-dock-tab=evidence]').count()==(1 if id in projects else 0),id;assert d.locator('.dockTabs').count()==(1 if id in projects else 0),id
  if id in projects:
   assert d.locator('.caseFlow').count()==1;assert d.locator('#labCanvas, .labPanel').count()>0;d.locator('[data-dock-tab=evidence]').click();assert d.locator('.proof').is_visible();d.locator('[data-dock-tab=overview]').click()
  else: assert d.locator(checks[id]).count()>0 and not d.locator('.proof').count(),id
  box=pg.locator('#dock').bounding_box();assert box and min(box['x'],box['y'])>=-1 and box['x']+box['width']<=w+1 and box['y']+box['height']<=h+1,(id,box)
  assert pg.evaluate('document.documentElement.scrollWidth')==w,id
  if id in ['about','contact','experience','sight','skills']:pg.screenshot(path=str(out/f'v19-{w}-{id}.png'))
  if id=='workspace':
   d.locator('#termIn').fill('proof about');d.locator('#termRun').evaluate('(e)=>e.click()');assert 'Project evidence is available' in d.locator('#termOut').inner_text()
  print(w,id,'PASS',flush=True)
 pg.evaluate("found.add('observe');found.add('isolate');found.add('verify');sync();window.coreNavigate(byId.secret)");pg.wait_for_function("document.querySelector('#world').dataset.docked==='secret'");assert pg.locator('#dockBody #termIn').count()==1;assert pg.locator('#dockBody .proof').count()==0
 pg.locator('#exitDock').click();pg.locator('#readMode').click();assert pg.locator('#reader').is_visible();assert pg.locator('#reader .proof').count()==4;assert pg.locator('#read-contact .contactActions a').count()==4;assert not errors,errors;print(w,'secret, reader, no errors PASS',flush=True);b.close()
