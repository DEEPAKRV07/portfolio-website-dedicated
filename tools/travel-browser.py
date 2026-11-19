from playwright.sync_api import sync_playwright
from pathlib import Path
import sys
root=Path(__file__).resolve().parent.parent;out=Path(sys.argv[1]) if len(sys.argv)>1 else root
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h,mobile in [(1440,900,False),(390,844,True)]:
  pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=mobile,is_mobile=mobile); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content((root/'launch.html').read_text());pg.locator('#bootEnter').click();pg.wait_for_timeout(1400);pg.screenshot(path=str(out/('rvd-v7-mobile.png' if mobile else 'rvd-v7-overview.png')))
  def navigate(name):
   pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text=name).click();pg.locator('#skipFlight').wait_for(state='visible')
  navigate('SightMate');pg.locator('#skipFlight').click();pg.wait_for_function("document.querySelector('#world').dataset.docked==='sight'");pg.locator('#dock').wait_for(state='visible');pg.wait_for_timeout(1100);pg.screenshot(path=str(out/('rvd-v7-mobile-inspect.png' if mobile else 'rvd-v7-inspect.png')))
  pg.wait_for_timeout(1500);print(w,'docked fps',pg.locator('#world').evaluate('(e)=>e.dataset.renderFps'),flush=True)
  assert pg.locator('#labCanvas').count()==1;pg.locator('#exitDock').click();navigate('Data exchange');pg.locator('#cancelFlight').click();pg.wait_for_timeout(2800);assert not pg.locator('#exitDock').is_visible();assert not pg.locator('#skipFlight').is_visible();navigate('Neural lab');pg.wait_for_function("document.querySelector('#world').dataset.docked==='lab'",timeout=15000);pg.locator('#dock').wait_for(state='visible');pg.locator('#exitDock').click();pg.locator('#cameraReset').click();pg.wait_for_timeout(1600)
  if not mobile:
   pg.locator('#mapView').click();pg.wait_for_timeout(1200);pg.screenshot(path=str(out/'rvd-v7-explore.png'))
   navigate('Tracking arena');pg.keyboard.press('Escape');pg.wait_for_timeout(2700);assert not pg.locator('#exitDock').is_visible()
  assert pg.evaluate('document.documentElement.scrollWidth')==w;assert not errors,errors;print(w,h,'skip/cancel/normal flight/recenter passed; no errors',flush=True);pg.close()
 pg=b.new_page(viewport={'width':1280,'height':800},reduced_motion='reduce');pg.set_content((root/'launch.html').read_text());pg.locator('#bootEnter').click();pg.locator('#quickProfile').click();pg.wait_for_function("document.querySelector('#world').dataset.docked==='about'",timeout=2500);assert not pg.locator('#skipFlight').is_visible();print('reduced motion direct docking passed',flush=True);pg.close();b.close()
