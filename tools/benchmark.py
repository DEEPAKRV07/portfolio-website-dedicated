from playwright.sync_api import sync_playwright
import sys,json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--disable-dev-shm-usage','--disable-webgl'])
 for path in sys.argv[1:]:
  page=b.new_page(viewport={'width':1280,'height':800}); errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.set_content(open(path).read(),wait_until='domcontentloaded');page.locator('#bootEnter').click();page.wait_for_timeout(1200)
  a=page.evaluate('''async()=>{let a=performance.now(),n=0;return await new Promise(r=>{function f(t){n++;if(t-a>1800)r({fps:n*1000/(t-a),ms:t-a,render:document.querySelector('#world').dataset.renderFps});else requestAnimationFrame(f)}requestAnimationFrame(f)})}''')
  page.keyboard.down('w'); mv=page.evaluate('''async()=>{let a=performance.now(),n=0;return await new Promise(r=>{function f(t){n++;if(t-a>1900)r({fps:n*1000/(t-a),ms:t-a,render:document.querySelector('#world').dataset.renderFps});else requestAnimationFrame(f)}requestAnimationFrame(f)})}''');page.keyboard.up('w');page.wait_for_timeout(180);print(path,a,mv,page.locator('#world').evaluate('(a)=>({...a.dataset})'),errors,flush=True)
  # Optional: save a screenshot locally with page.screenshot(path="explore.png").
  page.close()
 b.close()
