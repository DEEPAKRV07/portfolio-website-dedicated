"""Safe, fast-forward-only replacement of the public portfolio. Run locally with Git auth."""
from pathlib import Path
import argparse, subprocess, tempfile, shutil, sys
ROOT=Path(__file__).resolve().parents[1]
REMOTE='https://github.com/DEEPAKRV07/portfolio-website-dedicated.git'
BASE='5a76662c054a911692426e7144b3e5a17b9fd00d'
BACKUP='backup/pre-coreworld-2026-11-19'
BRANCH='coreworld/v22-migration'

def git(*args,cwd=None):
    return subprocess.check_output(['git',*args],cwd=cwd,text=True).strip()
def files():
    for p in sorted(ROOT.rglob('*')):
        rel=p.relative_to(ROOT)
        if p.is_file() and not any(i in {'.git','dist','__pycache__','node_modules'} for i in rel.parts) and rel.as_posix() not in {'launch.html','read.html'} and not p.name.startswith('.env'):
            yield p,rel

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--publish',action='store_true',help='Also fast-forward main, starting the Pages workflow');ap.add_argument('--check-source',action='store_true',help='Validate and list the clean build payload without touching GitHub');args=ap.parse_args()
    subprocess.run([sys.executable,'tools/build-release.py'],cwd=ROOT,check=True)
    payload=list(files());assert any(r.as_posix()=='.github/workflows/deploy.yml' for _,r in payload)
    if args.check_source:
        print(f'{len(payload)} source files ready. No GitHub changes made.');return
    refs=git('ls-remote',REMOTE,'refs/heads/main',f'refs/heads/{BACKUP}')
    mapping={line.split()[1]:line.split()[0] for line in refs.splitlines() if line.strip()}
    if mapping.get('refs/heads/main')!=BASE or mapping.get(f'refs/heads/{BACKUP}')!=BASE:
        raise SystemExit('ABORT: main or backup has changed. Review current remote commits; no replacement was performed.')
    with tempfile.TemporaryDirectory(prefix='rvd-coreworld-migration-') as tmp:
        repo=Path(tmp)/'repo';git('clone','--branch','main','--single-branch',REMOTE,str(repo));assert git('rev-parse','HEAD',cwd=repo)==BASE
        git('switch','-c',BRANCH,cwd=repo);git('rm','-r','--ignore-unmatch','--','.',cwd=repo)
        for p,rel in payload:
            target=repo/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,target)
        git('add','-A',cwd=repo);git('commit','-m','Migrate portfolio to RVD COREWORLD v22 with Pages CI/CD',cwd=repo)
        print('New commit:',git('rev-parse','HEAD',cwd=repo));print(git('push','origin',f'HEAD:refs/heads/{BRANCH}',cwd=repo))
        if args.publish:
            print(git('push','origin','HEAD:refs/heads/main',cwd=repo));print('Main updated; check GitHub Actions for actual deployment status.')
        else: print('Staging branch pushed. Review and merge it into main to deploy.')
if __name__=='__main__':main()
