# Portfolio V3 verification — 28 October 2026

## A. Completion status

The public application and local owner workflows are implemented. The release checks below distinguish browser evidence from external services that do not exist yet. The active checkout is `D:\Portfolio-V3`, repository `DEEPAKRV07/portfolio-website-dedicated`, branch `codex/portfolio-v3`. V2 remains recoverable at `checkpoint/v2-before-v3-20261020` (`37eba928e4bb047617f74bb52bd0792ac70dc560`).

Release commit and live deployment evidence are recorded in the release pull request and the final delivery message; do not treat a local build as a deployment. Supabase activation is deferred at the owner's request because no project exists.

## B. Delivered features

- Central identity and six connected sections; real raycast selection, accessible labels, orbit, zoom, reset, Home/Escape navigation, camera easing and contextual content.
- Deterministic input → hidden synthesis → output Home graph: Education/Experience/Skills → Deepak → About/Projects/Contact. The same seven stable identities and six directed relationships adapt from columns to stacked layers on phones. This is an information-structure analogy, not a trained ANN.
- Shared near-black/emerald/mint/cyan tokens, the existing exact Deltha font, readable body labels, and Home navigation replacing the old Index control.
- Procedural layered nuclei, distinctive section frames, shared materials, instanced structural members, directional signals and boundary ports. Existing GLBs supply authored nuclei and entrance clips; original asset bytes are preserved. Runtime normalization fixes their authored zero-scale/transform differences.
- Meaningful Skills hierarchy: identity → six domains → 23 technologies/capabilities → documented project applications. Stable IDs, deterministic branch positions, responsive projections, ancestor/application highlighting and dimming of unrelated paths.
- Resume-backed projects, experience, education, biography and direct Contact destinations. Latest resume download is byte-identical to the supplied PDF.
- Studio content/media/graph editing, automatic/manual positioning, material/geometry/animation settings, validation, draft autosave, undo/redo, publication history and JSON import/export.
- One renderer, schema and navigation model across desktop/tablet/mobile; readable fallback, reduced motion, keyboard controls, quality settings, lazy modules/assets and renderer cleanup.
- Normal wheel/swipe page scrolling, deliberate 3D gesture mode, Alt-wheel zoom, right-drag pan and touch pinch. Detail panels have pinned close controls and independently scrollable bodies.
- Real local PDF/DOCX resume exploration reuses the same engine, responsive layers and contextual panels. Text extraction and literal-term grouping create validated, source-backed nodes; cancel, clear, errors and return-to-portfolio are implemented. Files are neither uploaded nor persisted, and cannot overwrite the published portfolio.
- Local development persistence is verified. Supabase client, SQL/RLS and setup instructions exist; live cloud editing is **not** verified.

## C. Content-management verification

The browser suite creates a project with story text and links, uploads/reorders two PNGs and a playable WebM, chooses a cover, adds a related skill, creates and manually positions a node, changes geometry/material, adds a ribbon edge, saves/publishes, opens the public case study and reloads it with media intact. It also creates an experience and skill, archives/restores/deletes/undoes edits, exercises redo, creates a custom section, exports/imports a JSON backup, and restores/publishes an earlier version.

A separate workflow creates a technology in Computer Vision, explicitly relates it to SightMate, creates its node, publishes, selects it in the public branch and verifies its related-project link. No verification fixture is included in the public seed. Local JSON exports contain media references, not binary backups.

## D. Tests and measured conditions

| Command / workflow | Result and scope |
| --- | --- |
| `npm test` | 38 tests pass: schema/import safety, publishing filters, local history, mocked remote authorization, layouts, endpoints, semantic Skills relationships, owner-added domain spacing and real resume graph rules. |
| `npm run test:e2e` | 38/38 pass in the complete 28 October release run (3.2 minutes, one worker, no retries). Coverage includes every section and Skills branch, Studio/media/history, real PDF/DOCX parsing, scrolling, explicit gestures, pointer/touch/keyboard controls, rapid navigation and delayed renderer loading. The release CI reruns the complete suite on Linux Chromium. |
| `npm run build` | Pass. Vite reports the retained shared Three.js/GLTF chunk above 500 kB (788.08 kB, 201.40 kB gzip); warning is retained, not suppressed. |
| `npm audit --audit-level=high` | Zero reported vulnerabilities at verification time. |
| `node tests/deployment.mjs` | Final production-preview checks pass: renderer, bundled PDF/DOCX workers with real files, temporary graph/clear, deep-link reload, locked unconfigured Studio, latest resume, phone overflow, GLBs and no unexpected console/HTTP errors. Live deployment evidence is recorded separately after release. |
| Browser / device conditions | Headless Microsoft Edge on Windows, real WebGL and CDP touch events; emulated 1440×960, 1280×800, 768×1024, 390×844, 320×720 and 844×390 viewports. CI uses Chromium on Linux. These are not physical-phone performance measurements. |

Renderer evidence is in [engine-measurements.json](engine-measurements.json). The current seven-node/six-edge Home renders with 211 draw calls and 104,278 triangles. Earlier instancing reduced the former thirteen-edge graph from 296 to 226 draw calls; the final layer correction changes that topology, so these are not identical-scene performance comparisons. The warm-world disposal test returns to the same geometry/texture counts after five full navigation cycles, and engine disposal leaves no scheduled frame, nodes or listeners. FPS values are machine-specific samples, not a supported mobile FPS claim.

Failure injection deliberately produces a WebGL creation error to test fallback. Edge's GPU compiler emits X4122 precision warnings on this host; those are distinguished from application errors. Normal world journeys assert no unexpected errors or failed HTTP assets.

The final public-control pass also verified quality choices, keyboard orbit/reset and restoring motion. One local Studio run was interrupted while source formatting triggered a development reload; its clean rerun passed all four Studio tests with no source changes. No retries are configured to conceal CI failures.

Linux CI exposed real navigation races: Home used the prior rendered route before `hashchange`; a same-world branch route could open a generic category dialog while the renderer import was pending; and returning Home before the destination rendered could leave the camera in a transient node focus. Current-URL navigation, shared scene initialization and explicit transient-focus reset fix these cases, each with a regression test. Camera/GLB timing follows elapsed wall time rather than a capped simulation delta. Fast DOCX processing also exposed a zero-size hidden canvas and stale camera projection: framing now waits for visible dimensions and updates the camera matrix before projecting labels. Hidden/pending nodes are excluded from raycasting. Verification runs on pull requests; main deployment also runs the suite, without duplicate push/PR jobs for the same feature commit.

The automatic Skills overview now derives angular spacing from the actual domain count instead of assuming six. A seventh owner-created domain no longer overlaps the first; the original six-domain composition is unchanged. The added layout test and both complete desktop/phone Skills journeys pass.

## E. Visual inspection

Real browser screenshots are in `docs/screenshots/`. `baseline-live-home.png` and `baseline-v2-home.png` preserve the comparison points. The `release-<world>-<device>.png` files cover all seven worlds at desktop, tablet and phone widths; detail variants cover contextual panels. `skills-branch-<domain>-<device>.png` covers every domain on desktop and phone. Contact sheets summarize these captures without replacing individual inspection.

The latest Home composition, all seven section contact sheets, resume network/card captures and overflowing Education panels were inspected at desktop, tablet and phone sizes. The Home introduction now has its own band, projected layer headings follow graph bounds, and the mobile resume scene uses a shorter dedicated frame. `resume-network-*`, `resume-details-*` and `scroll-education-*` record the new flows. The supplied final screenshot was used for color and font only, as requested.

Corrections made during inspection include overexposed nuclei, vanishing reduced-motion GLBs, Home restoring an intermediate camera, oversized Experience spacing, Contact/HUD collisions, label/geometry overlap, mobile label enter/leave jitter, overly prominent floor lines, asymmetric single-technology branches and curves outside the camera bounds. Camera framing now incorporates connection samples as well as node dimensions. Labels use stable priorities and displaced-label leaders; hover does not reorder them.

Reference access and its limits are documented in [NEURAL_DESIGN_CORRECTION.md](NEURAL_DESIGN_CORRECTION.md). FunTech's post-boot experience, Bruno's driving controls and the full YouTube video were not verified; no claim is made that they were.

## F. Changed architecture

`src/v3/engine/` owns reusable procedural geometry, retained models, layout, curves, interaction, framing and cleanup. `skillsGraph.js` defines actual domain/project relationships and synchronizes owner edits. `main.js`, `public.css`, `router.js` and `media.js` provide shared public presentation and safe media. `studio.js`/`studio.css` provide the owner interface using the same renderer. `schema.js`, `store.js` and `localMedia.js` provide validation, draft/published separation and persistence. `data.js` reconciles V2 content with the supplied resume. `supabase/migrations/` contains the optional backend migration.

`computationGraph.js` provides the layered Home and resume layouts; `theme.js` shares presentation tokens. `resumeUpload.js`, `resumeParser.js`, `docx.worker.js` and `resumeGraph.js` handle local input, lazy PDF.js/fflate extraction, cancellation and source-backed graph construction. The temporary graph lives only in memory. Existing saved owner snapshots are preserved; Studio exposes Home layer/order settings without silently resetting saved work. See [RESUME_EXPLORER.md](RESUME_EXPLORER.md).

The V3 entry replaces the default HTML entry, while `legacy.html` and original source/GLBs retain V2. Tests, workflows and owner documentation accompany the implementation. No Git history was reset or rewritten.

## G. Deployment and configuration

Run `npm ci`, `npm test`, `npm run test:e2e`, `npm run build`, then `npm run preview -- --host 127.0.0.1 --port 4173`. GitHub Pages deploys `dist/` from the verified main branch using the existing protected `github-pages` environment. Base path is `/portfolio-website-dedicated/`; static-host routes use hashes. CI verifies unit/browser/build checks.

For shared owner editing, create Supabase, apply the SQL migration and authorize the owner UUID. Set **public** `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` build variables, rebuild, and verify live auth/RLS/storage/publication from separate sessions. Never put a service-role/secret key in Vite. See [deployment](DEPLOYMENT.md), [Studio](STUDIO.md), and [data/publishing](DATA_AND_PUBLISHING.md).

## H. Genuine limitations

- No Supabase project exists. Live owner authentication, RLS, uploads and cross-device publication require that external setup. Production owner writes remain locked until configuration is present.
- No physical Android/iOS hardware, Safari or Firefox was tested. Adaptive quality and touch controls were tested in Edge emulation; device-specific performance remains unverified.
- Actual project screenshots/video were not supplied. Media workflows use isolated test fixtures; the public content does not invent visual evidence.
- The 3D shared chunk still triggers Vite's size warning. Geometry is instanced and modules/models are deferred, but low-end physical hardware needs a separate performance pass.
- Resume parsing supports text-based PDF/DOCX up to 5 MB, PDF up to 20 pages. Scanned PDFs need OCR elsewhere; encrypted/malformed/oversized documents fail clearly. English headings and literal terms drive grouping, not semantic qualification assessment. Unusual layouts need source review. Lazy PDF.js/worker assets add download cost only when a resume is read.

## I. Acceptance checklist

| Requirement | Status |
| --- | --- |
| Existing identity, six sections, authored assets and recovery | PASS |
| Reference palette, actual Deltha font and removal of Index UI | PASS |
| Deterministic input/hidden/output graph with named directed relationships | PASS |
| Real interactive geometry, selected paths, meaningful Skills relationships | PASS |
| Every section/domain/technology, Home, Contact, dialogs and editor workflow | PASS in browser tests |
| Desktop/tablet/phone composition and connection framing | PASS — screenshots, overlap checks and all six phone branch curve bounds verified |
| One responsive architecture, touch/keyboard/reduced-motion/fallback | PASS in tested browser conditions |
| Local drafts/media/publication/reload/history | PASS |
| Ordinary page scrolling, explicit 3D gestures and scrollable detail cards | PASS in desktop/tablet/touch browser tests |
| Real local PDF/DOCX extraction, temporary graph, cancellation and portfolio isolation | PASS in browser and production-preview tests |
| Live Supabase owner editing and shared publication | BLOCKED — project has not been created; setup documented as requested |
| Production bundle | PASS — final build and production preview verified |
| GitHub Pages release | PARTIAL at source-report time — remote CI/deployment results follow in the release PR and final delivery |
| Physical-device/cross-browser performance | PARTIAL — emulation and renderer measurements only |
