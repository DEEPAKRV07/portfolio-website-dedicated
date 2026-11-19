from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 for mode,flags in [('CPU fallback',['--disable-webgl']),('SwiftShader attempt',['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])]:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage']+flags)
  page=browser.new_page(viewport={'width':1280,'height':800},reduced_motion='reduce');errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.set_content((root/'launch.html').read_text(),wait_until='domcontentloaded');page.locator('#bootEnter').click(timeout=15000);page.wait_for_timeout(400)
  result=page.locator('#world').evaluate('(el)=>({...el.dataset})');assert result['studioShadow']=='baked-two-level' and int(result['shadowCasters'])>0
  assert not errors,errors
  print(mode,result,flush=True);browser.close()
