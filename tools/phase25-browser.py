"""Phase 25: keyboard escape, evidence intent, reading isolation and compact settings."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
import os, shutil, sys
root=Path(__file__).resolve().parents[1]
inline='--inline' in sys.argv
http=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root/'dist')))
Thread(target=http.serve_forever,daemon=True).start();url=f'http://127.0.0.1:{http.server_port}/'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(headless=True,executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
  pg=b.new_page(viewport={'width':1440,'height':900});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.set_default_timeout(25000)
  def load(page):
   if inline:page.set_content((root/'launch.html').read_text(encoding='utf8'),wait_until='domcontentloaded')
   else:page.goto(url,wait_until='domcontentloaded')
   page.locator('#bootEnter').click()
  load(pg);pg.locator('#quickProof').click();pg.locator('#cancelFlight').wait_for(state='visible');pg.locator('#cancelFlight').click()
  pg.evaluate('window.coreNavigate(byId.sight)');pg.locator('#skipFlight').click();pg.locator('#dock').wait_for(state='visible');assert pg.locator('[data-dock-tab=overview]').get_attribute('aria-selected')=='true'
  pg.keyboard.press('Escape');assert not pg.locator('#dock').is_visible();assert pg.evaluate('document.activeElement.id')=='directory'
  pg.locator('#quickProof').click();pg.locator('#skipFlight').click();pg.locator('#dock').wait_for(state='visible');assert pg.locator('[data-dock-tab=evidence]').get_attribute('aria-selected')=='true'
  pg.keyboard.press('Escape');pg.locator('#settingsToggle').click();pg.keyboard.press('Escape');assert pg.locator('#settingsToggle').get_attribute('aria-expanded')=='false';assert pg.evaluate('document.activeElement.id')=='settingsToggle'
  pg.evaluate('window.coreNavigate(byId.football)');pg.locator('#readMode').click();assert pg.locator('#reader').is_visible();assert pg.evaluate('document.getElementById("top").inert');pg.keyboard.press('Escape');assert not pg.locator('#reader').is_visible();assert not pg.evaluate('document.getElementById("top").inert');assert pg.evaluate('document.activeElement.id')=='readMode';assert not pg.locator('#travelActions').is_visible();assert not errors,errors;pg.close()
  pg=b.new_page(viewport={'width':844,'height':390},reduced_motion='reduce');load(pg);pg.locator('#settingsToggle').click();box=pg.locator('#systemStrip').bounding_box();assert box['y']+box['height']<=391,box;pg.close();b.close()
 print('Phase 25: cancelled and explicit evidence navigation, Escape focus, reader isolation, compact settings PASS')
finally:http.shutdown()
