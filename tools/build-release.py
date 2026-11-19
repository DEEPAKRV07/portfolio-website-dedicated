"""Create a fresh, allow-listed static site; never publish authoring files."""
from pathlib import Path
import shutil, subprocess, sys, re
ROOT=Path(__file__).resolve().parents[1]
FILES=('index.html','style.css','read.html','read.css','resume-data.js','geometry.js','evidence-data.js','asset-kit.js','lab-engine.js','lab-ui.js','campus-motion.js','studio-light.js','drone-motion.js','app.js','assets/RVD-Resume.pdf')
def run(*args): subprocess.run(args,cwd=ROOT,check=True)
for test in ('lab','campus-motion','studio','drone-motion'): run('node',f'tools/{test}-test.cjs')
for f in FILES:
    if f.endswith('.js'): run('node','--check',f)
run('node','tools/static-reader.cjs');run(sys.executable,'build.py')
out=ROOT/'dist'
if out.exists(): shutil.rmtree(out)
for name in FILES:
    f=out/name;f.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/name,f)
(out/'.nojekyll').touch()
for name in ('index.html','read.html'):
    html=(out/name).read_text(encoding='utf-8')
    for href in re.findall(r'(?:href|src)="([^"]+)"',html):
        if href.startswith(('https:','http:','mailto:','#','data:')): continue
        assert (out/href.split('#')[0]).is_file(),(name,href)
assert (out/'assets/RVD-Resume.pdf').read_bytes().startswith(b'%PDF')
print('Release verified:',len(FILES),'runtime files,',sum(p.stat().st_size for p in out.rglob('*') if p.is_file()),'bytes')
