from playwright.sync_api import sync_playwright
from pathlib import Path
import sys
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h,mobile in [(1440,900,False),(390,844,True)]:
  page=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=mobile,is_mobile=mobile);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded');page.locator('#bootEnter').click();page.wait_for_timeout(500)
  def dock(name,id):
   if page.locator('#exitDock').is_visible(): page.locator('#exitDock').click()
   page.locator('#directory').click();page.locator('#directoryGrid .dir').filter(has_text=name).click();page.wait_for_function(f"document.querySelector('#world').dataset.docked==='{id}'",timeout=25000);page.locator('#dock').wait_for(state='visible');page.locator('#labCanvas' if id!='lab' else '#demo').scroll_into_view_if_needed()
  dock('SightMate','sight');assert '3/3' in page.locator('#labOut').inner_text();page.locator('#labThreshold').evaluate('(e)=>{e.value=.99;e.dispatchEvent(new Event("input"))}');assert '0/3' in page.locator('#labOut').inner_text();page.locator('#labThreshold').evaluate('(e)=>{e.value=.55;e.dispatchEvent(new Event("input"))}');page.locator('#labStep').click();page.locator('#labCanvas').scroll_into_view_if_needed();page.screenshot(path=str(out/('rvd-v6-mobile.png' if mobile else 'rvd-v6-sight.png')))
  page.locator('[data-dock-tab="evidence"]').click();assert page.locator('#dockBody .proofMedia').count()==4;page.locator('[data-dock-tab="overview"]').click()
  if not mobile:
   dock('Tracking arena','football');page.wait_for_timeout(700);assert 'Tracks: 8' in page.locator('#labOut').inner_text();page.locator('#labAlt').click();assert 'disabled' in page.locator('#labOut').inner_text();page.locator('#labAlt').click();page.locator('#labCanvas').scroll_into_view_if_needed();page.screenshot(path=str(out/'rvd-v6-football.png'))
   dock('Data exchange','leads');page.locator('#labRun').click();page.wait_for_function("document.getElementById('labOut').textContent.includes('Exported 6/8')",timeout=20000);page.locator('#labCanvas').scroll_into_view_if_needed();page.screenshot(path=str(out/'rvd-v6-leads.png'));assert 'duplicates 1' in page.locator('#labOut').inner_text();assert 'invalid 1' in page.locator('#labOut').inner_text()
   dock('Legacy forge','unity');assert '0/4' in page.locator('#labOut').inner_text();[i.check() for i in page.locator('[data-config]').all()];assert '4/4' in page.locator('#labOut').inner_text();page.locator('#labCanvas').scroll_into_view_if_needed();page.screenshot(path=str(out/'rvd-v6-unity.png'))
   dock('Neural lab','lab');page.locator('#trainStep').click();page.wait_for_function("document.querySelector('#demoOut').textContent.includes('Epoch 100')");page.locator('#exitDock').click();page.locator('#readMode').click();assert page.locator('#reader').is_visible()
  assert page.evaluate('document.documentElement.scrollWidth')==w;assert not errors, errors;print(f'{w}x{h} passed; CPU perspective renderer; zero page errors',flush=True);page.close()
 b.close()
