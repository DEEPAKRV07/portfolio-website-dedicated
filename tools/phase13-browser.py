from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
root=Path(__file__).resolve().parent.parent
out=Path(sys.argv[1]) if len(sys.argv)>1 else root
out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for w,h in [(1440,900),(390,844)]:
  pg=b.new_page(viewport={'width':w,'height':h},has_touch=w<500,is_mobile=w<500); errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
  pg.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded');pg.locator('#bootEnter').click();pg.locator('#start').click();pg.locator('#zoomIn').click();
  sig=pg.locator('#campusSignals');pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'true'");frames=int(sig.get_attribute('data-frames'));pg.wait_for_timeout(400);assert int(sig.get_attribute('data-frames'))>frames
  assert sig.evaluate("c=>c.getContext('2d').getImageData(0,0,c.width,c.height).data.some((v,i)=>i%4===3&&v>0)")
  assert pg.evaluate('document.documentElement.scrollWidth')==w
  pg.screenshot(path=str(out/f'v13-{w}-campus.png'))
  if w==1440:
   label=pg.locator('#labels .label').filter(has_text='SightMate').first
   if label.is_visible():
    # actual world hover, rather than clicking the label; dispatch over its projected station center
    r=label.bounding_box();pg.mouse.move(r['x']+r['width']/2,r['y']+r['height']+28);pg.wait_for_timeout(400)
  pg.locator('#settingsToggle').click();pg.locator('#activityToggle').click();pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'false'");f=sig.get_attribute('data-frames');pg.wait_for_timeout(300);assert sig.get_attribute('data-frames')==f
  pg.locator('#activityToggle').click();pg.locator('#settingsToggle').click();pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'true'");
  pg.locator('#directory').click();pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'false'");pg.locator('#directoryGrid .dir').filter(has_text='SightMate').click();pg.wait_for_function("document.querySelector('#campusSignals').dataset.mode === 'flight'");pg.screenshot(path=str(out/f'v13-{w}-flight.png'));pg.locator('#skipFlight').click();pg.locator('#dock').wait_for(state='visible');assert pg.locator('#labCanvas').count()==1
  pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'false'");pg.locator('#exitDock').click();pg.locator('#readMode').click();pg.wait_for_function("document.querySelector('#campusSignals').dataset.active === 'false'");pg.locator('#exitRead').click();assert not errors,errors
  print(f'{w}x{h}: signals visible and animated, activity toggle, travel state, dock and reading pause, no uncaught errors PASS',flush=True);pg.close()
 pg=b.new_page(viewport={'width':390,'height':844},reduced_motion='reduce',has_touch=True,is_mobile=True);pg.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded');pg.locator('#bootEnter').click();pg.locator('#settingsToggle').click();assert pg.locator('#activityToggle').is_disabled();assert not pg.locator('#campusSignals').is_visible();print('Reduced motion: activity disabled and invisible PASS',flush=True);b.close()
