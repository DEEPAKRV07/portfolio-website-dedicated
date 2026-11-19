from pathlib import Path
from playwright.sync_api import sync_playwright
import json,sys
root=Path(__file__).resolve().parent.parent; out=root.parent; html=(root/'launch.html').read_text()
name=sys.argv[1] if len(sys.argv)>1 else 'desktop-webgl'
flags,w,h,reduce={'desktop-webgl':(['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'],1440,900,False),'mobile':(['--disable-webgl'],390,844,True),'desktop-fallback':(['--disable-webgl'],1440,900,False)}[name]
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage']+flags)
 pg=b.new_page(viewport={'width':w,'height':h},device_scale_factor=1,has_touch=w<500,is_mobile=w<500,reduced_motion='reduce' if reduce else 'no-preference'); pg.set_default_timeout(18000);errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
 pg.set_content(html,wait_until='domcontentloaded');pg.locator('#bootEnter').click(); pg.wait_for_timeout(1200);pg.screenshot(path=str(out/f'{name}-overview.png'))
 canvas=pg.locator('#world');info=lambda:canvas.evaluate('(e)=>({...e.dataset,width:e.width,height:e.height})')
 print('overview',info(),flush=True)
 pg.locator('#start').click();pg.wait_for_timeout(1800);pg.screenshot(path=str(out/f'{name}-explore.png'));print('explore',info(),flush=True)
 if not reduce:
  before=info();pg.keyboard.down('w');pg.wait_for_timeout(1100);pg.keyboard.up('w');pg.wait_for_timeout(450);after=info();print('move',after,flush=True);assert before['cameraTarget']!=after['cameraTarget'],(before,after)
 pg.locator('#directory').click();pg.locator('#directoryGrid .dir').filter(has_text='SightMate').click();pg.locator('#dock').wait_for(state='visible',timeout=18000);pg.wait_for_timeout(1200);pg.screenshot(path=str(out/f'{name}-inspect.png'));print('inspect',info(),pg.locator('#dock').bounding_box(),flush=True)
 assert info()['docked']=='sight';assert pg.locator('#labCanvas').count()==1;assert pg.locator('#dock').is_visible(); assert pg.evaluate('document.documentElement.scrollWidth')==w
 pg.locator('[data-dock-tab="evidence"]').click();assert pg.locator('#dockBody .proofMedia').count()==4
 if w>1024:
  assert pg.locator('#dock').evaluate("e=>e.classList.contains('monitorDock')")
  pg.locator('#expandCase').click();assert pg.locator('body').evaluate("e=>e.classList.contains('caseExpanded')")
 pg.locator('#exitDock').click();pg.locator('#readMode').click();assert pg.locator('#reader').is_visible();pg.locator('#exitRead').click();assert not errs,errs
 print('PASS',name,flush=True);pg.close();b.close()
