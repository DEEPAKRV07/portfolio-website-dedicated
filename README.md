# Portfolio V3

An interactive Three.js neural-network portfolio for Deepak R V, with one shared desktop/mobile scene engine and an owner content/graph editor.

Working directory: `D:\Portfolio-V3`. The previous C: workspace remains as a recovery copy. Branch: `codex/portfolio-v3`. V2 recovery tag: `checkpoint/v2-before-v3-20261020`.

## Run

```sh
npm ci
npm run dev -- --host 127.0.0.1
npm test
npm run test:e2e
npm run build
npm run preview -- --host 127.0.0.1
```

Open the printed URL including `/portfolio-website-dedicated/`. Studio is `#/admin`. Automated browser tests use installed Microsoft Edge on Windows; CI uses Playwright Chromium (`npx playwright install --with-deps chromium`). The browser suite starts its own dev server, or reuses an existing local one. Browser tests create isolated local test data and never publish to a live service.

## Publishing model

Without Supabase, the public production build reads the bundled resume-backed content and disables editor writes. The **development** Studio supports persistent browser drafts, media in IndexedDB, local publication, version history, import/export and recovery. Local publication does not update other visitors. Configure Supabase for authenticated owner editing and cross-device publication; see [data and publishing](docs/DATA_AND_PUBLISHING.md).

## Architecture

- `src/v3/main.js`, `router.js`, `dom.js`, `media.js`, `public.css`: public navigation, readable content, safe media, accessible detail dialogs and responsive presentation.
- `src/v3/engine/`: shared procedural renderer, cached geometry/materials, connections, deterministic layout, optional models, interaction, labels and cleanup.
- `src/v3/data.js`, `schema.js`: content migration, latest resume reconciliation, versioned data and relationship validation.
- `src/v3/neuralGraph.js`, `skillsGraph.js`: stable portfolio identities, meaningful domain/technology/project relationships, responsive branch layouts and editor synchronization.
- `src/v3/store.js`, `localMedia.js`: draft/published separation, storage, owner authentication, publication history and binary assets.
- `src/v3/studio.js`, `studio.css`: content and graph editing using the same engine as the public portfolio.
- `supabase/migrations/`: database validation, owner authorization, RLS and atomic publishing.

The original V2 source and GLBs remain untouched apart from allowing the central data import in Node tests. `legacy.html` runs the prior app locally. Checkpoint directories and Git history provide recovery; they are not the V3 runtime.

See [implementation audit](docs/PORTFOLIO_V3_IMPLEMENTATION.md), [Studio guide](docs/STUDIO.md), [deployment](docs/DEPLOYMENT.md), and [verification report](docs/VERIFICATION.md) for exact status and limitations.

The optional [local resume explorer](docs/RESUME_EXPLORER.md) accepts PDF/DOCX and builds a temporary source-backed graph in the same renderer. No resume is uploaded, saved, or published. Home uses deterministic input → identity synthesis → output layers; owner layer/order settings are available in Studio.
