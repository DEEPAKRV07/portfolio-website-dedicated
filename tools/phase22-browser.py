"""Check deployed files over a local HTTP server, on desktop/mobile and reduced motion."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import os, shutil, sys
inline="--inline" in sys.argv
root=Path(__file__).resolve().parents[1];dist=root/'dist'
http=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(dist)))
Thread(target=http.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{http.server_port}/'
try:
 with sync_playwright() as p:
  exe=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium')
  b=p.chromium.launch(headless=True,executable_path=exe,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
  for w,h in [(1440,900),(390,844)]:
   page=b.new_page(viewport={'width':w,'height':h},has_touch=w<500,is_mobile=w<500,reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_default_timeout(20000)
   (page.set_content((root/'launch.html').read_text(encoding='utf8'),wait_until='domcontentloaded') if inline else page.goto(url,wait_until='domcontentloaded'));page.locator('#bootEnter').click()
   for key in ['about','experience','sight','football','leads','unity','skills','education','contact','lab','workspace']:
    page.evaluate('(id)=>window.coreNavigate(byId[id])',key)
    page.wait_for_function('(id)=>document.querySelector("#world").dataset.docked===id',arg=key)
    page.locator('#dock').wait_for(state='visible');d=page.locator('#dockBody');project=key in ['sight','football','leads','unity'];assert d.locator('[data-dock-tab=evidence]').count()==int(project),key
    if project:
     d.locator('[data-dock-tab=evidence]').click();assert d.locator('.proof').is_visible();d.locator('[data-dock-tab=overview]').click()
    else: assert d.locator('.proof').count()==0,key
    assert page.evaluate('document.documentElement.scrollWidth')==w,key
   page.evaluate("found.add('observe');found.add('isolate');found.add('verify');sync();window.coreNavigate(byId.secret)");page.wait_for_function("document.querySelector('#world').dataset.docked==='secret'");assert page.locator('#dockBody .proof').count()==0
   assert not errors,errors;page.close();print(w,'all 12 stations PASS',flush=True)
  page=b.new_page(viewport={'width':1000,'height':720},reduced_motion='no-preference');errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_default_timeout(25000);(page.set_content((root/'launch.html').read_text(encoding='utf8'),wait_until='domcontentloaded') if inline else page.goto(url,wait_until='domcontentloaded'));page.locator('#bootEnter').click();page.evaluate('window.coreNavigate(byId.sight)');page.wait_for_function("Number(document.querySelector('#world').dataset.altitude)>8");page.wait_for_function("document.querySelector('#world').dataset.docked==='sight'");assert page.locator('#dock').is_visible();assert not errors,errors;page.close();print('Animated flight and docking PASS',flush=True)
  page=b.new_page(java_script_enabled=False);(page.set_content((dist/'read.html').read_text(encoding='utf8')) if inline else page.goto(url+'read.html'));assert page.locator('main .record').count()==11;assert page.locator('a[href="assets/RVD-Resume.pdf"]').count()>0;assert (dist/'assets/RVD-Resume.pdf').is_file() if inline else page.request.get(url+'assets/RVD-Resume.pdf').ok;page.close();b.close();print('No-JS reading and résumé PASS',flush=True)
finally: http.shutdown()
