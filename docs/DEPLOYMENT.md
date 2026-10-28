# Deployment and recovery

## Working copy

Continue from `D:\Portfolio-V3`. The original C: folder is retained as a recovery copy. The migration avoided the C: write blocks without changing Windows security settings. Runtime dependencies and all new edits are in D:.

## Production build

```sh
npm ci
npm test
npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1 --port 4173
```

The application base is `/portfolio-website-dedicated/`. Use hash URLs such as `#/projects/sightmate` and `#/admin` on static hosting. The retained `404.html` maps old path URLs back to the app. Do not change the Vite base without also reviewing canonical/Open Graph URLs and the redirect.

The output is `dist/`. Source maps are not public. Studio and the 3D renderer are deferred modules. Original GLBs load by world and supply the authored nuclei/entrances; failed assets retain procedural geometry. `legacy.html` is also included for V2 recovery.

## GitHub Pages

Repository: `DEEPAKRV07/portfolio-website-dedicated`. Existing Pages URL: https://deepakrv07.github.io/portfolio-website-dedicated/ . The workflow uses GitHub's OIDC Pages integration. The inspected `github-pages` environment permits **main only**. A feature-branch dispatch cannot deploy under that rule. Preserve the environment protection; merge a verified release through the normal main path before deployment.

```sh
git push -u origin codex/portfolio-v3
git push origin checkpoint/v2-before-v3-20261020
gh run list --workflow deploy.yml --branch main
```

Check the actual run conclusion and deployed site; a successful local build is not deployment evidence. Do not dispatch a release while the visual/functional gate is unresolved. No branch-protection or environment rule needs to be relaxed.

## Optional cloud editing

No Supabase project exists yet; the owner requested setup documentation on 26 October 2026. The production site serves bundled public data and locks owner editing until configuration is supplied. Local development supports browser-only drafts/publications.

Follow [data and publishing](DATA_AND_PUBLISHING.md), apply the SQL migration, create the owner membership, and set these **public** build variables in GitHub repository Actions variables:

- `VITE_SUPABASE_URL`: the HTTPS project origin.
- `VITE_SUPABASE_ANON_KEY`: the public publishable/anon key. Never put service-role or secret keys into Vite.

Rebuild after changes. Live acceptance must cover owner login, anonymous/non-owner write rejection, private drafts/history, storage upload, publication from a separate browser, logout and rollback. The current mocked integration tests do not replace that verification.

## Recovery

V2 is preserved by `checkpoint/v2-before-v3-20261020` at `37eba928e4bb047617f74bb52bd0792ac70dc560`, the unchanged original source modules and GLBs, and the original C: copy. To inspect V2 safely, create a separate Git worktree at the checkpoint; do not reset the V3 working directory. Its existing Pages workflow can deploy the checkpoint's source after explicit selection.

Studio version history restores a snapshot into the draft; review and publish to perform content rollback. Export JSON regularly, keep original local media separately, and use hosted media URLs for portable backups. Clearing browser storage deletes local drafts/media. Supabase should have its own database/storage backup policy before it becomes the authoritative store.
