from pathlib import Path
from playwright.sync_api import sync_playwright
import sys,base64
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root
out.mkdir(parents=True,exist_ok=True)
# A tiny fixture is used only to test loading, image cycling and failure handling.
png=base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLbtAAAAABJRU5ErkJggg==')
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h in [(1440,900),(390,844)]:
  pg=b.new_page(viewport={'width':w,'height':h},has_touch=w<500,is_mobile=w<500,reduced_motion='reduce'); errors=[]; requests=[]
  pg.on('pageerror',lambda e:errors.append(str(e)))
  def route(r):
   requests.append(r.request.url)
   if 'ocr.png' in r.request.url:r.abort()
   else:r.fulfill(status=200,content_type='image/png',body=png)
  pg.route('https://raw.githubusercontent.com/**',route)
  pg.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded');pg.locator('#bootEnter').click();pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text='SightMate').click();pg.locator('#dock').wait_for(state='visible');pg.wait_for_timeout(300)
  assert pg.locator('#exhibitBar').is_visible(); assert not requests
  pg.screenshot(path=str(out/f'v14-{w}-case.png'))
  bounds=pg.locator('#dock').bounding_box();pg.locator('#expandCase').click();assert pg.locator('#dock').bounding_box()['height']>bounds['height'];assert pg.locator('#expandCase').get_attribute('aria-pressed')=='true'
  pg.locator('#tryCase').click();assert pg.locator('#labCanvas').is_visible();pg.locator('#labThreshold').evaluate('(e)=>{e.value=.99;e.dispatchEvent(new Event("input"))}');assert '0/3' in pg.locator('#labOut').inner_text();pg.locator('#labThreshold').evaluate('(e)=>{e.value=.55;e.dispatchEvent(new Event("input"))}');pg.screenshot(path=str(out/f'v14-{w}-workbench.png'))
  t=pg.locator('[data-dock-tab="overview"]');t.scroll_into_view_if_needed();t.focus();pg.keyboard.press('ArrowRight');assert pg.locator('[data-dock-tab="evidence"]').get_attribute('aria-selected')=='true';assert not requests
  pg.locator('#dockBody .proofMedia summary').first.click();pg.locator('#dockBody .proofImage img').first.scroll_into_view_if_needed();pg.wait_for_function("document.querySelector('#dockBody .proofImage img').hasAttribute('src') && document.querySelector('#dockBody .proofImage img').complete");assert any('object_detection.png' in u for u in requests)
  pg.locator('#dockBody .proofZoom').first.click();assert pg.locator('#proofViewer').is_visible();assert pg.locator('#proofCount').inner_text()=='1 / 4';assert pg.locator('#proofPrev').is_disabled();pg.locator('#proofNext').click();pg.locator('#proofError').wait_for(state='visible');assert pg.locator('#proofCount').inner_text()=='2 / 4';pg.keyboard.press('Escape');assert not pg.locator('#proofViewer').is_visible();assert pg.locator('#dock').is_visible();pg.locator('#dockBody .proofMedia summary').first.click();pg.locator('[data-dock-tab="evidence"]').scroll_into_view_if_needed();pg.screenshot(path=str(out/f'v14-{w}-evidence.png'))
  pg.locator('#expandCase').click();pg.locator('#exitDock').click();pg.locator('#readMode').click();pg.locator('.readerIndex [data-read-id="contact"]').click();assert pg.locator('#read-contact').is_visible();pg.locator('#exitRead').click();assert not errors,errors
  print(f'{w}x{h}: spatial exhibit, expand, workbench, tab keyboard, lazy image, viewer navigation, failure fallback, Escape, reader index PASS',flush=True);pg.close()
 b.close()
