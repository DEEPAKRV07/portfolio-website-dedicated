# Portfolio V3 verification — 28 October 2026

## A. Completion status

The public application and local owner workflows are implemented. The release checks below distinguish browser evidence from external services that do not exist yet. The active checkout is `D:\Portfolio-V3`, repository `DEEPAKRV07/portfolio-website-dedicated`, branch `codex/portfolio-v3`. V2 remains recoverable at `checkpoint/v2-before-v3-20261020` (`37eba928e4bb047617f74bb52bd0792ac70dc560`).

Release commit and live deployment evidence are recorded in the release pull request and the final delivery message; do not treat a local build as a deployment. Supabase activation is deferred at the owner's request because no project exists.

## B. Delivered features

- Central identity and six connected sections; real raycast selection, accessible labels, orbit, zoom, reset, Home/Escape navigation, camera easing and contextual content.
- Procedural layered nuclei, distinctive section frames, shared materials, instanced structural members, directional signals and boundary ports. Existing GLBs supply authored nuclei and entrance clips; original asset bytes are preserved. Runtime normalization fixes their authored zero-scale/transform differences.
- Meaningful Skills hierarchy: identity → six domains → 23 technologies/capabilities → documented project applications. Stable IDs, deterministic branch positions, responsive projections, ancestor/application highlighting and dimming of unrelated paths.
- Resume-backed projects, experience, education, biography and direct Contact destinations. Latest resume download is byte-identical to the supplied PDF.
- Studio content/media/graph editing, automatic/manual positioning, material/geometry/animation settings, validation, draft autosave, undo/redo, publication history and JSON import/export.
- One renderer, schema and navigation model across desktop/tablet/mobile; readable fallback, reduced motion, keyboard controls, quality settings, lazy modules/assets and renderer cleanup.
- Local development persistence is verified. Supabase client, SQL/RLS and setup instructions exist; live cloud editing is **not** verified.

## C. Content-management verification

The browser suite creates a project with story text and links, uploads/reorders two PNGs and a playable WebM, chooses a cover, adds a related skill, creates and manually positions a node, changes geometry/material, adds a ribbon edge, saves/publishes, opens the public case study and reloads it with media intact. It also creates an experience and skill, archives/restores/deletes/undoes edits, exercises redo, creates a custom section, exports/imports a JSON backup, and restores/publishes an earlier version.

A separate workflow creates a technology in Computer Vision, explicitly relates it to SightMate, creates its node, publishes, selects it in the public branch and verifies its related-project link. No verification fixture is included in the public seed. Local JSON exports contain media references, not binary backups.

## D. Tests and measured conditions

| Command / workflow | Result and scope |
| --- | --- |
| `npm test` | 34 tests pass: schema/import safety, publishing filters, local history, mocked remote authorization, layouts, endpoints and semantic Skills relationships. |
| `npm run test:e2e` | 26/26 browser tests pass in the complete 28 October rerun, including immediate Home navigation, delayed renderer loading and low-frame-rate entrances. The release CI reruns the complete suite on Linux Chromium. |
| `npm run build` | Pass. Vite reports the retained shared Three.js/GLTF chunk above 500 kB (788.08 kB, 201.40 kB gzip); warning is retained, not suppressed. |
| `npm audit --audit-level=high` | Zero reported vulnerabilities at verification time. |
| `node tests/deployment.mjs` | Final production-preview checks pass: renderer, deep-link reload, locked unconfigured Studio, latest resume, phone overflow, GLBs and no unexpected console/HTTP errors. Live deployment evidence is recorded separately after release. |
| Browser / device conditions | Headless Microsoft Edge on Windows, real WebGL and CDP touch events; emulated 1440×960, 1280×800, 768×1024, 390×844, 320×720 and 844×390 viewports. CI uses Chromium on Linux. These are not physical-phone performance measurements. |

Renderer evidence is in [engine-measurements.json](engine-measurements.json). Before/after instancing reduced the Home draw calls from 296 to 226 while preserving 107,030 rendered triangles. The warm-world disposal test returns to the same geometry/texture counts after five full navigation cycles, and engine disposal leaves no scheduled frame, nodes or listeners. FPS values are machine-specific samples, not a supported mobile FPS claim.

Failure injection deliberately produces a WebGL creation error to test fallback. Edge's GPU compiler emits X4122 precision warnings on this host; those are distinguished from application errors. Normal world journeys assert no unexpected errors or failed HTTP assets.

The final public-control pass also verified quality choices, keyboard orbit/reset and restoring motion. One local Studio run was interrupted while source formatting triggered a development reload; its clean rerun passed all four Studio tests with no source changes. No retries are configured to conceal CI failures.

The first Linux CI runs exposed two real races: Home used the prior rendered route before `hashchange`, and a same-world branch route could render a generic category dialog while the renderer import was pending. Both were reproduced locally by immediate key dispatch and delayed module loading, then corrected with current-URL navigation and shared scene initialization. Camera/GLB timing also now follows elapsed wall time rather than a capped simulation delta, with a slow-frame regression test. These bring the complete browser suite to 26 scenarios. Verification runs on pull requests; main deployment also runs the suite, without duplicate push/PR jobs for the same feature commit.

## E. Visual inspection

Real browser screenshots are in `docs/screenshots/`. `baseline-live-home.png` and `baseline-v2-home.png` preserve the comparison points. The `release-<world>-<device>.png` files cover all seven worlds at desktop, tablet and phone widths; detail variants cover contextual panels. `skills-branch-<domain>-<device>.png` covers every domain on desktop and phone. Contact sheets summarize these captures without replacing individual inspection.

Corrections made during inspection include overexposed nuclei, vanishing reduced-motion GLBs, Home restoring an intermediate camera, oversized Experience spacing, Contact/HUD collisions, label/geometry overlap, mobile label enter/leave jitter, overly prominent floor lines, asymmetric single-technology branches and curves outside the camera bounds. Camera framing now incorporates connection samples as well as node dimensions. Labels use stable priorities and displaced-label leaders; hover does not reorder them.

Reference access and its limits are documented in [NEURAL_DESIGN_CORRECTION.md](NEURAL_DESIGN_CORRECTION.md). FunTech's post-boot experience, Bruno's driving controls and the full YouTube video were not verified; no claim is made that they were.

## F. Changed architecture

`src/v3/engine/` owns reusable procedural geometry, retained models, layout, curves, interaction, framing and cleanup. `skillsGraph.js` defines actual domain/project relationships and synchronizes owner edits. `main.js`, `public.css`, `router.js` and `media.js` provide shared public presentation and safe media. `studio.js`/`studio.css` provide the owner interface using the same renderer. `schema.js`, `store.js` and `localMedia.js` provide validation, draft/published separation and persistence. `data.js` reconciles V2 content with the supplied resume. `supabase/migrations/` contains the optional backend migration.

The V3 entry replaces the default HTML entry, while `legacy.html` and original source/GLBs retain V2. Tests, workflows and owner documentation accompany the implementation. No Git history was reset or rewritten.

## G. Deployment and configuration

Run `npm ci`, `npm test`, `npm run test:e2e`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4173`. GitHub Pages deploys `dist/` from the verified main branch using the existing protected `github-pages` environment. Base path is `/portfolio-website-dedicated/`; static-host routes use hashes. CI verifies unit/browser/build checks.

For shared owner editing, create Supabase, apply the SQL migration and authorize the owner UUID. Set **public** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` build variables, rebuild, and verify live auth/RLS/storage/publication from separate sessions. Never put a service-role/secret key in Vite. See [deployment](DEPLOYMENT.md), [Studio](STUDIO.md), and [data/publishing](DATA_AND_PUBLISHING.md).

## H. Genuine limitations

- No Supabase project exists. Live owner authentication, RLS, uploads and cross-device publication require that external setup. Production owner writes remain locked until configuration is present.
- No physical Android/iOS hardware, Safari or Firefox was tested. Adaptive quality and touch controls were tested in Edge emulation; device-specific performance remains unverified.
- Actual project screenshots/video were not supplied. Media workflows use isolated test fixtures; the public content does not invent visual evidence.
- The 3D shared chunk still triggers Vite's size warning. Geometry is instanced and modules/models are deferred, but low-end physical hardware needs a separate performance pass.

## I. Acceptance checklist

| Requirement | Status |
| --- | --- |
| Existing identity, six sections, authored assets and recovery | PASS |
| Real interactive geometry, selected paths, meaningful Skills relationships | PASS |
| Every section/domain/technology, Home, Contact, dialogs and editor workflow | PASS in browser tests |
| Desktop/tablet/phone composition and connection framing | PASS — screenshots, overlap checks and all six phone branch curve bounds verified |
| One responsive architecture, touch/keyboard/reduced-motion/fallback | PASS in tested browser conditions |
| Local drafts/media/publication/reload/history | PASS |
| Live Supabase owner editing and shared publication | BLOCKED — project has not been created; setup documented as requested |
| Production bundle | PASS — final build and production preview verified |
| GitHub Pages release | PARTIAL at source-report time — remote CI/deployment results follow in the release PR and final delivery |
| Physical-device/cross-browser performance | PARTIAL — emulation and renderer measurements only |
