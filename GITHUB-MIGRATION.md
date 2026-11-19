# GitHub migration — RVD COREWORLD v22

The backup branch `backup/pre-coreworld-2026-11-19` preserves the old main commit `5a76662c054a911692426e7144b3e5a17b9fd00d`. Do not delete it. The old live site remains untouched until the complete replacement is transferred. The archive includes all editable source, original models and regression tests; the deployment artifact includes only browser runtime files.

## Windows / local terminal

Install Git, Python 3 and Node.js 22 (or compatible), authenticate Git with GitHub (e.g. `gh auth login` with Git credentials enabled), extract the source archive, open PowerShell in `RVD-CoreWorld-v22`, and run:

```powershell
python tools/migrate-github.py --publish
```

The script builds and validates locally, checks that main and the remote backup still match the audited commit, makes a fresh temporary clone, removes obsolete tracked files from the new commit only, adds the complete source, pushes `coreworld/v22-migration`, then fast-forwards main. It never force-pushes, deletes old branches or edits an existing local clone. Without `--publish`, it pushes only the review branch. If GitHub rejects the workflow-file change, authenticate using credentials allowed to update GitHub Actions workflows; never paste your token into the chat. If main changed, review the newer work before repeating the migration.

The workflow builds a fresh `dist/`, tests the browser, and uploads a Pages artifact on main only. The repository's Settings → Pages source should remain GitHub Actions. Monitor Actions for a green deployment before judging the live site. The previous Vite build and obsolete authoring/reference files disappear from active main only after the replacement commit; they remain recoverable in Git history and the backup branch.

Expected live address: https://deepakrv07.github.io/portfolio-website-dedicated/

The local environment could not establish a direct Git push or HTTP browser test. The migration still needs to be run on an authenticated machine; no claim of a successful live deployment is made.
