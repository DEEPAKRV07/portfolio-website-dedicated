from pathlib import Path
from playwright.sync_api import sync_playwright
import sys, json
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h in [(1440,900),(390,844),(320,568),(844,390),(768,1024),(1920,1080)]:
  pg=b.new_page(viewport={'width':w,'height':h},has_touch=w<1000,is_mobile=w<1000,reduced_motion='reduce'); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content((root/'launch.html').read_text(),wait_until="domcontentloaded");pg.locator('#bootEnter').click();pg.wait_for_timeout(300)
  assert pg.locator('#world').evaluate('(e)=>e.dataset.renderer')=='canvas-perspective'
  assert pg.evaluate('document.documentElement.scrollWidth')==w
  pg.locator('#start').click();pg.locator('#zoomIn').click();pg.wait_for_timeout(250)
  if w in [1440,390]: pg.screenshot(path=str(out/f'v11-{w}-explore.png'))
  pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text='SightMate').click();pg.locator('#dock').wait_for(state='visible');assert pg.locator('#labCanvas').count()==1
  bounds=pg.locator('#dock').bounding_box();assert bounds['x']>=0 and bounds['y']>=0 and bounds['x']+bounds['width']<=w+1 and bounds['y']+bounds['height']<=h+1,bounds
  if w in [1440,390]:pg.screenshot(path=str(out/f'v11-{w}-inspect.png'))
  pg.locator('[data-dock-tab="evidence"]').click();assert pg.locator('#dockBody .proofMedia').count()==4
  pg.locator('#exitDock').click();pg.locator('#readMode').click();assert pg.locator('#reader').is_visible();pg.locator('#exitRead').click();assert not errors,errors
  print(f'{w}x{h}: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS',flush=True);pg.close()
 b.close()
