from playwright.sync_api import sync_playwright
import sys,time,json
path=sys.argv[1]; out=sys.argv[2]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl'])
 for i,(w,h) in enumerate([(1440,900),(390,844)]):
  pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=i==1,is_mobile=i==1);err=[];pg.on('pageerror',lambda e:err.append(str(e)))
  pg.set_content(open(path).read(),wait_until='domcontentloaded'); pg.locator('#bootEnter').click();pg.wait_for_timeout(2000)
  print('overview',w,pg.locator('#world').evaluate('(x)=>({...x.dataset})'),flush=True);pg.screenshot(path=out+('mobile.png' if i else 'overview.png'))
  pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text='SightMate').click();pg.wait_for_function("document.querySelector('#world').dataset.docked==='sight'",timeout=20000);pg.wait_for_timeout(900);pg.screenshot(path=out+('mobile-inspect.png' if i else 'inspect.png'))
  print('inspect',w,pg.locator('#world').evaluate('(x)=>({...x.dataset})'),pg.evaluate('document.documentElement.scrollWidth'),flush=True)
  pg.locator('[data-dock-tab="evidence"]').click(); print('proof count',pg.locator('#dockBody .proofMedia').count(),flush=True)
  pg.locator('#exitDock').click();pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text='Neural lab').click();pg.wait_for_function("document.querySelector('#world').dataset.docked==='lab'",timeout=20000);pg.wait_for_timeout(500);print('lab',pg.locator('#dockBody').inner_text()[:300],flush=True);print('ERRORS',err,flush=True);pg.close()
 b.close()
