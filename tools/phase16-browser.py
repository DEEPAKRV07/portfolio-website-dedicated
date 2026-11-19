from pathlib import Path
from playwright.sync_api import sync_playwright
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
import sys
inline="--inline" in sys.argv
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root
http=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)))
Thread(target=http.serve_forever,daemon=True).start(); url=f'http://127.0.0.1:{http.server_port}/'
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h in [(1440,900),(390,844)]:
  pg=b.new_page(viewport={'width':w,'height':h},has_touch=w<500,is_mobile=w<500,reduced_motion='reduce'); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_default_timeout(7000)
  (pg.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded') if inline else pg.goto(url,wait_until='domcontentloaded'));pg.locator('#bootEnter').click()
  for name,id in [('SightMate','sight'),('Tracking arena','football'),('Data exchange','leads'),('Legacy forge','unity'),('Neural lab','lab')]:
   if pg.locator('#exitDock').is_visible():pg.locator('#exitDock').click()
   pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text=name).click();pg.locator('#dock').wait_for(state='visible')
   if id=='sight':
    pg.locator('#labThreshold').evaluate('(e)=>{e.value=.99;e.dispatchEvent(new Event("input"))}');assert '0/3' in pg.locator('#labOut').inner_text()
   elif id=='football':
    assert 'Tracks: 8' in pg.locator('#labOut').inner_text();pg.locator('#labAlt').evaluate('(e)=>e.click()');assert 'disabled' in pg.locator('#labOut').inner_text()
   elif id=='leads':
    pg.locator('#labRun').evaluate('(e)=>e.click()');pg.wait_for_function("document.getElementById('labOut').textContent.includes('Exported 6/8')",timeout=18000)
   elif id=='unity':
    for x in pg.locator('[data-config]').all():x.evaluate('(e)=>e.click()')
    assert '4/4' in pg.locator('#labOut').inner_text()
   else:
    pg.locator('#trainReset').evaluate('(e)=>e.click()');pg.locator('#trainStep').evaluate('(e)=>e.click()');pg.wait_for_function("document.querySelector('#demoOut').textContent.includes('Epoch 100')")
   print(w,id,'PASS',flush=True)
  pg.locator('#exitDock').click();pg.locator('#world').dispatch_event('webglcontextlost');assert pg.locator('#reader').is_visible();assert pg.locator('#exitRead').is_disabled();assert pg.locator('#safeReadLink').is_visible();assert not errors,errors;pg.close()
  # No-JS reading page is served over HTTP, with actual anchors.
  pg=b.new_page(viewport={'width':w,'height':h},java_script_enabled=False);(pg.set_content((root/'read.html').read_text().replace('<link rel="stylesheet" href="read.css">','<style>'+ (root/'read.css').read_text()+'</style>')) if inline else pg.goto(url+'read.html#sight'));assert pg.locator('h1').inner_text()=='Deepak R V.';assert pg.locator('main .record').count()==11;assert pg.locator('#sight').is_visible();pg.screenshot(path=str(out/f'v16-{w}-reader.png'));(pg.set_content((root/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+ (root/'style.css').read_text()+'</style>')) if inline else pg.goto(url));assert pg.locator('a.fastReader').is_visible();assert pg.locator('a.fastReader').get_attribute('href')=='read.html';
  if not inline:pg.locator('a.fastReader').click();assert pg.url.endswith('read.html')
  pg.close();print(w,'renderer-loss, no-JS reader PASS', '(inline document; HTTP navigation unverified)' if inline else '(HTTP)',flush=True)
 b.close()
http.shutdown()
