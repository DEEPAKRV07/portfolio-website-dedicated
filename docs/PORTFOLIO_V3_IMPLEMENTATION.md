# Portfolio V3 implementation record

## Baseline audit — 20 October 2026

The supplied workspace was an empty Git repository with no commits or remote. All seven remote branches and the release tag were fetched from `DEEPAKRV07/portfolio-website-dedicated`; no user files were present to overwrite. The newest V2 integration is `origin/feature/inner-glb-world-integration`, commit `37eba928e4bb047617f74bb52bd0792ac70dc560`, ahead of main `0ff6447`. History includes V2.1 skill selection, contact routing, GLB animation lifecycle, per-world camera and label fixes. Existing checkpoints and assets are retained.

- Working branch: `codex/portfolio-v3`.
- Recovery tag: `checkpoint/v2-before-v3-20261020`.
- Original app remains in `src/main.js`, `src/style.css`, `src/three/`, and `legacy.html`.
- Audited: package/lockfile, all source module responsibilities, central portfolio data, original HTML/mobile content, public assets, GitHub Pages workflow and remote Pages settings.
- No AGENTS.md or existing test runner was found.
- Baseline `npm ci` and `npm run build`: PASS. Vite 8.2.1; JS 870.27 kB / 226.92 kB gzip. Large-chunk warning and a high-severity `source-map-js` development dependency advisory existed beforehand.
- Baseline dev server starts at the repository base path. Browser inspection showed the original narrow-screen textual layout. It is superseded deliberately by a real interactive mobile scene, as explicitly requested.
- Six retained GLBs total approximately 1.45 MB; original eager loader and per-world hardcoded mappings are unsuitable as the extensible V3 content model.
- Actual hosting: public GitHub Pages, workflow deployment, `/portfolio-website-dedicated/` base.

## Architecture decisions

Retain Vite and vanilla JavaScript/Three.js. V3 is a separate entry while V2 stays recoverable and runnable. Three parallel modules have explicit interfaces: versioned content/persistence, procedural scene engine, and Studio. The public interface consumes the same records and engine as Studio.

1. `src/v3/data.js` migrates actual V2 content and reconciles the latest supplied resume. No invented dates or media.
2. `src/v3/schema.js` validates content, safe URLs, graph integrity and supported configuration. Data cannot execute code.
3. `src/v3/store.js` separates draft/published/history. Supabase authentication, owner authorization, REST persistence and storage support shared publication. Without service configuration, development offers an explicitly labelled local workspace; production serves the bundled snapshot and locks editing.
4. `src/v3/engine/` owns renderer, geometry/material reuse, layouts, curves, labels, input, animation, camera, quality and disposal. GLBs are optional. Both desktop and mobile render real 3D when supported.
5. `src/v3/studio.js` offers structured content/media forms and the real scene preview, graph editing, undo/redo, draft, import/export, publication and history.
6. Public hash routes support static-host deep links and back/forward. Existing path routes are mapped on arrival. Semantic content and accessible detail dialogs supplement spatial discovery.

## Art direction and reference review

The initial observatory direction was superseded by the user's neural-network correction. The current implementation uses a central identity, connected sections and semantic Skills branches. Reference access, observed behaviors and inspection limits are recorded precisely in [the correction audit](NEURAL_DESIGN_CORRECTION.md). The later realistic still guides materials and depth, while actual Three.js geometry, real relationships and the existing editor remain the implementation.

Reference URLs: https://experience2026.funtech.inc/ ; https://bruno-simon.com/ ; https://www.landing.love/sites/thebluedesert/

## Execution checklist

- [x] Audit repository/history, retain V2 and record baseline checks.
- [x] Isolated branch and recoverable checkpoint.
- [x] Define architecture, shared interfaces, content schema and visual direction.
- [x] Procedural geometry, layouts, edges, input, camera, animation and cleanup.
- [x] Migrate data and latest resume; validate records/relationships.
- [x] Functional local Studio, real scene editing and media workflows.
- [x] Public home, projects, skills, experience, education, about and contact.
- [x] Shared mobile/tablet/desktop 3D, reduced motion and readable fallback.
- [x] Local drafts, publication and version recovery; remote adapter mock tests.
- [ ] Live Supabase authentication/RLS/storage/publication: owner requested setup documentation because no project exists.
- [x] Automated unit/integration/browser tests and screenshot capture; see current results in VERIFICATION.md.
- [x] Renderer resource measurements, deferred loading and dependency audit.
- [ ] Live deployment and final release: follow the verified release gate and main-only Pages policy.

## Verification strategy and initial budgets

Use Node's test runner for schemas/layouts/state transitions and Playwright for actual browser journeys, screenshots, overflow, console/network faults and axe accessibility. Test portrait/landscape mobile, tablet and desktop. Record observed timings and renderer resource counts instead of claiming device-independent FPS. Targets: zero unexpected errors in core journeys, no page overflow, retained GLB loading with procedural fallback, bounded active-world GPU resources, deferred Studio loading, and responsive canvas controls. Adjust quality based on actual frame samples.

## External dependencies

No Supabase service/account configuration has been provided. The owner explicitly requested setup documentation. Live owner authentication, cross-device cloud publication and storage remain unverified until a service is configured. No credentials are fabricated. GitHub access is available; Pages permits deployment only from main. Keep that restriction and use the normal verified release path.
