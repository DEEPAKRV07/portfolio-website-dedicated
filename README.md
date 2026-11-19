# RVD COREWORLD 12.0 — Engineering Campus

**New in v5:** modular architectural GLB pavilions, archive and desk assets, reusable display consoles, a lightweight dynamic probe LOD, a warmer studio palette and revised overview camera. See `PHASE_STATUS.md` for the development checkpoint and `TESTING.md` for evidence.

An original interactive native-WebGL 3D portfolio for **Deepak R V**, a software developer and AI/ML engineer. The visual language is a spatial engineering campus, navigated by a camera-equipped quadcopter (visual simulation only).

## Start

**Simplest:** Extract the complete ZIP, keep the folder structure intact, and open **`launch.html`** in a modern Chrome or Edge browser. The interactive scene, shaders, data, and UI are inlined in this standalone launch page. Project screenshots load from public GitHub only if you expand their evidence tiles, and therefore require internet access. The résumé link refers to `assets/RVD-Resume.pdf` in the same extracted directory.

**For development:** `python -m http.server 8000` in this directory, then visit `http://localhost:8000/index.html`. After changing `app.js`, `geometry.js`, `resume-data.js`, `evidence-data.js`, `index.html`, or `style.css`, run `python build.py` to regenerate the self-contained HTML. No npm or CDN is required.

## Interaction model

- **Boot:** Enter COREWORLD or choose accessible Read mode. This is a cinematic presentation, **not** real authentication; there is no backend or login.
- **Direct explore:** Click any 3D monument, station label or minimap tile for auto-navigation. Drag to orbit; scroll/pinch where supported to zoom. WASD/arrow keys move the hovering processor probe; `E` inspects the active station. A station is also active while flying above its physical interaction zone, not only inside a small ring.
- **Guided recruiter tour:** The `Guided tour` header button, hero button or `Index → Take guided recruiter route` covers eight destinations in order: Profile → Experience → SightMate → Football → Lead Generator → Unity → Skills → Contact. Each stop has an explicit Next button; no auto-advancing narration.
- **Spatial inspection:** Inspection moves the camera onto the station's 3D screen. Three tabs organize **Explore** (interactive technical exhibit), **Evidence** (public source-backed artifacts) and **Connect** (dependency links). Escape/Undock returns to the world.
- **Evidence:** Public repo screenshots and training curves are linked by source URL and only load when expanded. All procedural CV/LLM/Unity demos are **illustrative**, not recordings from the original projects.
- **Developer workspace:** `help`, `status`, `telemetry`, `stack`, `experience`, `repos`, `find <term>`, `open <module>`, `source <module>`, `proof <module>`, `tour`, `hint` and `clear` operate on a local portfolio simulation. Commands never execute a real system shell.
- **Neural lab:** Choose **XOR / AND / OR**, adjust learning rate, toggle binary inputs, step training or auto-train a real tiny 2–4–1 JavaScript classifier with gradient descent. Model and example are educational; no model performance is claimed for the résumé.
- **Easter eggs:** Recover three world fragments to unlock a separate simulated debugging exercise. No private material is exposed.
- **Read mode:** All core résumé sections, workbench repositories and evidence are available in an accessible ordered text layout.

## Content provenance

Résumé was provided by the portfolio owner. Public GitHub repository inventory was inspected through the owner's connected account on **17 November 2026**. Verified public paths include four SightMate UI/development screenshots; the Football Analysis output screenshot and training curve image; the Lead Generator public validation report, dashboard source, and README. These are original repository artifacts, not independently reproduced runtime demonstrations. The repo-reported Football metrics and Lead Generator performance are explicitly labeled as such. The private Punch Hero and FORCRUX repositories were **not** copied or published.

The public LinkedIn profile at `linkedin.com/in/deepakrv07` is linked. Detailed company/client footage and endorsements are omitted until publication permission is supplied. Public credential identifiers are intentionally excluded.

## Files

- `index.html`, `style.css` — entry screen, responsive HUD, evidence inspector, accessible text mode
- `app.js` — native WebGL renderer and CPU fallback, shaders, animated data displays, path navigation, interactions, labs, terminal and tour
- `geometry.js` — procedural 3D primitives and matrix math
- `resume-data.js` — résumé-backed sections
- `evidence-data.js` — proof manifest, exact source URLs and secondary public workbench
- `assets/RVD-Resume.pdf` — owner's provided résumé, unmodified
- `build.py` — rebuild the fully inlined `launch.html`
- `EVIDENCE_REQUEST.md` — remaining original video/screenshots requiring approval
- `TESTING.md` — tested paths and limitations

## Render quality and performance

The implementation uses **native WebGL**, not Three.js. It contains procedural bevels, shader-based lighting, animated 3D CPU/GPU geometry, screen textures, surface shading, dim perimeter grid/fog framing, and additive emissive sprites. The WebGL shader includes a direct-light microfacet BRDF approximation (GGX distribution, Smith-style visibility, Schlick Fresnel) and a simple analytic studio highlight; metallic/roughness parameters are inferred from palette colors. It is not a full HDRI/PMREM/SSAO/bloom/DOF implementation, and cannot be GPU-verified in the current environment. Contact-shadow geometry approximates ambient occlusion; CPU fallback uses directional diffuse shading and painter sorting. On systems without WebGL, a CPU perspective renderer provides a visual fallback, with potential performance limitations. Viewport resolution is capped and animated effects can be disabled in the HUD. `prefers-reduced-motion` suppresses auto-recentering and nonessential animation behaviors.

No external fonts are distributed in this bundle. Deltha is preferred only when it is installed locally; otherwise a carefully selected humanist fallback is used. Include a licensed Deltha webfont yourself only if its redistribution terms allow it.

## Publication safety

Public source URLs are attributed; no customer contact exports, logins, confidential BOA XR data, private repositories, copyrighted game APKs, or Unity assets are bundled. Review the included résumé before deploying publicly, as it contains your contact information. The experience shown is a portfolio, not a guarantee that any externally linked project is currently running live.

## v6 interactive laboratories
Open `launch.html` or serve this directory over HTTP. Open a station from Index. SightMate allows confidence filtering and scene switching, Tracking Arena calculates nearest-neighbour associations and possession, Data Exchange runs a bounded virtual processing queue, and Legacy Forge validates an example compatibility configuration. All use synthetic local data; project evidence remains separate. No additional packages are needed to use the website. For development, run `node tools/lab-test.cjs`, `python build.py` and (with Chromium and Playwright installed) `python tools/lab-browser.py`. See `PHASE_STATUS.md` for the next development phase.

## v8: drone navigation, comfort and responsive production pass
Extract the complete ZIP and open `launch.html` (offline build) or serve this directory with `python -m http.server 8000`. Select any station from Index, optionally skip or cancel the animated journey, then explore its inspector. Auto focus can be toggled; reduced-motion visitors dock directly. The background scene sleeps when docked but active demos continue. Native WebGL changes require hardware verification; the included tests ran the CPU fallback. See PHASE_STATUS.md and TESTING.md.


V8 replaces the chip-like roaming probe with a gyroscopic navigation drone, reduces motion intensity, defaults compact devices to eco rendering, collapses the map on phones, and tightens responsive controls for smoother production-oriented use across viewports.

## v9: Drone / steady camera
Open `launch.html` after extracting the whole archive. Use Explore or Index. The Drone is an original spatial cursor, not a vehicle. Settings exposes steady/follow camera, auto focus, quality and recenter. Steady is the default for comfort and CPU rendering efficiency; manual orbit and zoom still work. Mobile uses a compact header and touch controls. Browser FPS is measured locally; static scene idle is intentional. See TESTING.md and PHASE_STATUS.md for limitations and continuation. For deployment, serve the directory over HTTPS with `index.html` as entry; review personal résumé and public evidence before publication. No deployment was performed.


## v10: drone navigation refresh
The roaming guide is now a lightweight quad-drone with a mini camera gimbal below it. This keeps the experience more software-vision focused and less hardware-chip-like while preserving the higher-FPS comfort work introduced in v9.

## v11: RVD aerial survey / comfort build
The original four-rotor drone now uses authored GLB meshes, with a 600-triangle overview version and a 988-triangle close-view shell (96 animated rotor triangles in balanced WebGL follow mode). The camera is a visual object only, not a real camera or feed. New landscape planters, pinch/zoom controls, mobile label decluttering and CPU screen projection caching are included. Open launch.html after extraction.

## Version 12 — Architectural districts
Original lightweight GLB architectural shells differentiate the vision studio, data exchange, neural forum, career gallery and warm workshop/archive structures. Continuous pedestrian paths, an arrival plaza and seating replace much of the old motherboard aesthetic. Drone, stationary-camera mode, labs and evidence remain intact. The geometry is stylized low-poly, not photorealistic. See TESTING.md for current measured results.

## Phase 13 — Living engineering campus
Open the bundled `launch.html` or serve this directory and open `index.html`. Settings → Campus activity toggles the independent projected data-route layer. Hover a station or fly near its interaction area to see simulated dependency routes; automatic drone travel displays a destination cue. On CPU fallback, a selected SightMate, Football or Data Exchange monitor can display a locally computed lab preview when its front face is visible and large enough. These are illustrative simulations, not live network traffic or footage from the drone. Motion pauses in the inspector, directory, reading mode, and hidden tabs; OS reduced-motion disables the campus activity. The overlay renders at approximately 12–18 updates per second independently of the main scene. No new textures, libraries or 3D assets were added. The existing GLB drone, camera gimbal and all project evidence are retained.

## v14: spatial case studies
Use Index or navigate the drone to a station. A dedicated 3D exhibit view sits above a responsive native case study. Choose Expand details for reading, Try the interactive workbench for a simulation, Evidence for original-source links and on-demand images, or Related to explore connected sections. Within the evidence image viewer use arrows to browse and Escape to close. Restore the 3D exhibit at any time. No new external dependency was added. This is a development build; see PHASE_STATUS.md and TESTING.md.

## v15 — studio lighting
Open `launch.html` after unzipping, or serve the project and use `index.html`. `studio-light.js` builds a 512 × 1024 procedural shadow atlas from the campus mesh once at startup; its two layers represent the station floor and exhibit plinth. The Canvas path composites floor shadows with the cached scene; the native WebGL path samples the atlas and uses analytical material highlights. This is a lightweight approximation rather than a complete physically based renderer. No new texture downloads or third-party runtime packages are required. Run `node tools/studio-test.cjs`, `python tools/studio-browser.py`, and the existing test scripts to verify local behavior. See TESTING.md for measured scope and limitations.

## v16: release candidate
Open `launch.html` from the extracted complete source folder, or `read.html` for the independent 2D edition. The separate deploy archive is a stripped static-hosting package using `index.html`. See DEPLOYMENT.md for setup, regeneration, and remaining verification. No Unity runtime or additional libraries were added in this phase.

## v17 — Detailed campus
The architectural kit introduces rear façades, a curved arrival portal, a timber archive roof, trees and path lights without changing the navigation grid. These meshes are procedural, editable GLBs, not photorealistic Unity assets. The fallback renderer uses 72-pixel screen-space bins when replaying the region touched by the drone. Phase 18 should focus on drone flight physics and camera transitions.

## v18 — Visual fidelity restoration (current checkpoint)
This corrective release preserves the v17 campus, assets, labs and evidence navigation. Cinematic drone-follow and auto-focus are enabled by default for visitors without a reduced-motion preference. Steady view remains available in Settings. Desktop project inspection returns to the physical front display; compact viewports retain the readable case-study panel with an elevated front-facing exhibit. The full scene remains sharp: monitor atlas is 2048 × 1024 and native WebGL targets at least 1 scene pixel per CSS pixel within the 4.2-megapixel budget. Higher display density, effects and idle rendering are bounded; there is no added depth-of-field blur. Open `launch.html` after extraction.

This is a corrective checkpoint, not a new artistic direction. CPU fallback tests passed on desktop and a reduced-motion mobile emulation. Physical GPU performance remains unverified; the software renderer cannot sustain high frame rates while the camera is moving. Use steady camera or reading mode on low-power devices. Do not trade legibility or monitor placement for artificially high idle FPS.

## v19: relevant content, preserved visual style
Open `launch.html` for the offline interactive version or serve `index.html` for the hosted version. Project evidence is limited to the four actual project stations; Arrival, Experience, Skills, Education, Contact, Neural Lab and Developer Workspace now show only contextual content. The original 3D monitor inspection, drone follow, orbit/zoom and optional steady mode remain. Re-run `tools/phase19-browser.py` for desktop and mobile and `tools/restoration-browser.py desktop-fallback` for cinematic inspection before future changes. See TESTING.md for remaining hardware/device/network limitations.


## v20 focus
This pass intentionally stays close to v19/v18 behavior. It improves the station-view feel with rounder cards and pills, while preserving contextual section content and avoiding concept drift.

## v21: motion and fidelity refinement
Open launch.html from the extracted source folder or serve index.html. Keeps the original architecture and section-specific presentation. Cinematic mode uses a short station-focus dwell, an independently turning simulated camera gimbal and smoothed lens transition. Steady camera and reduced motion are still available. See TESTING.md for verified scope.

## v22
Open launch.html for the offline edition; run `python tools/build-release.py` for a minimal static deployment. GitHub Actions validates builds and deploys only from main. `tools/migrate-github.py` is the safe migration helper (see GITHUB-MIGRATION.md).

## v23
The physical project monitors display locally computed illustrative previews; these are not evidence of actual models. Campus activity and reduced-motion settings pause previews. No external rendering dependencies.

## v24 performance
Rendering fidelity is preserved. An experimental indexed WebGL path is available using `?indexed=1` when WebGL is available; the default GPU draw path is unchanged pending validation.
