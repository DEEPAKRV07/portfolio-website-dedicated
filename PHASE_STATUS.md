# RVD COREWORLD 4.0 — development checkpoint

## 1 — Performance foundation (implemented)
- Preserved v3 source and original résumé/evidence data.
- Reduced fallback tessellation; reduced repeated circuit detail and monitor complexity.
- Static face attributes precomputed; backface and viewport rejection; sorted static projection cached.
- Cached raster for stationary overview; dirty region compositing; separate UI and demo cadence.
- Frame pacing and background tab pause, DPR and pixel-area cap, GPU adaptive resolution on sustained active workload, quality toggle.
- Native WebGL retained as primary; CPU perspective path retained for unsupported browsers.

## 2 — Original model kit and studio appearance (implemented, first visual pass)
Five original editable/exportable glTF 2.0 binary meshes are integrated: CORE-01 probe, stereo camera, server racks, SoC processor and legacy modernization gantry. The authoring script creates the GLBs and embedded offline JS data. This is an original low-poly asset workflow, NOT Unity modeling or a full PBR/Three.js migration. The browser consumes the generated mesh attributes through an intentionally limited local GLB reader, not a general glTF loader. The original GLBs contain a standard satin PBR material for import into compatible authoring tools; the current website shades vertex colors using its own lighting approximation.
Lighter architectural palette, smaller physical screens, clearer typography, education quick navigation, and real scene FPS HUD. Existing v3 evidence and learning demos retained.

## 3 — Next development phase (not done)
- Rebuild selected station interiors and architecture with more realistic assets, materials and contact shadows. Evaluate Three.js/PBR versus the lightweight renderer in a GPU-capable browser, using the same scene and measured budgets. Keep offline and reading fallback.
- Improve spatial composition and navigation, especially mobile fallback, and validate all remaining stations/controls. Expand project simulations and evidence only with original shareable files.
- Physical GPU/mobile testing, network load metrics, accessibility audit, and deployment preparation remain open. Unity/Blender are not installed in this environment. No deployment or original repository changes made.

## Resume
Start with this directory, `PHASE_STATUS.md`, and `TESTING.md`; preserve v3. Use `python build.py` to regenerate launch.html; `node tools/author-assets.cjs` to rebuild the five original GLBs and their embedded runtime bundle. The website is fully static; use local HTTP hosting if direct file opening is blocked.

# v5 checkpoint — Phase 3 architectural pass
- Implemented four original architectural meshes as actual reusable GLBs: open pavilion, console/display, library unit, engineering desk. Six station pavilions installed. Original five models retained and new 160-triangle probe LOD added (860-triangle full-detail probe still included).
- Reworked shared station bases, contact-shadow geometry, warm studio palette, overview framing and labels; retained station interaction bounds and screen anchors. Native GPU shader now uses a direct-light microfacet approximation; physically correct environment reflections, real SSAO and GPU testing remain pending.
- Phase 3 is a working architectural first pass, not a photorealistic Unity/Three.js implementation. Unity, Blender and browser hardware WebGL are not available here. CPU painter can exhibit depth-order artifacts; the existing readable mode remains available.
- Next: Phase 4 — real local interactive CV/tracking/data-pipeline experiments, then camera/post-processing and production polish. Preserve current v5 build; no deployment or private material publication. Resume from this folder and use `node tools/author-assets.cjs` then `python build.py`.

# v6 checkpoint — Phase 4 interactive laboratories
- Replaced four decorative project inspector animations with deterministic local experiments (`lab-engine.js`, `lab-ui.js`). Vision uses synthetic obstacle metadata and confidence/clearance logic. Football performs nearest-neighbor association, speed and possession calculations with a simulated camera drift toggle. Data Exchange processes synthetic records via a bounded virtual scheduler, validation, deduplication and retry. Legacy Forge exposes an interactive example compatibility checklist, not a real Unity build or APK audit.
- All demonstrations explicitly identify their limitations. Existing public evidence links, project details, neural training, assets, and navigational mechanisms retained. No external runtime or model download added.
- Browser tests passed in headless CPU perspective mode at 1440×900 and 390×844. Unit suites passed; see TESTING.md. No new hardware rendering benchmark; premium PBR, genuine Unity/Blender authoring, cinematic polish and production verification remain open.
- Next: Phase 5 — improve camera transitions, idle rendering, lighting and responsive composition; validate hardware WebGL before claiming premium GPU results. Resume from v6; preserve the v5 package. Run `node tools/lab-test.cjs`, `python build.py`, then `python tools/lab-browser.py`.

# v7 checkpoint — Phase 5 camera and studio refinement
- Time-based ease-in/ease-out flight, smooth yaw, skip and cancel controls, keyboard cancellation and reduced-motion direct docking. Idle auto-focus now converges and stops; no adjustment during active travel or reading. Original station hit areas and laboratory interactions retained.
- CPU perspective renderer caches stationary views beyond overview, slows ambient refresh and suspends unchanged docked scene paints. Native HTML/canvas laboratory computations remain active. Boot waits without continuous scene redraw. GPU atlas updates use sub-image uploads after initial allocation; no new dependencies.
- Softer world-space projected studio grounding shadow (CPU), contrast refinements, analytical specular rim/softbox lighting (GPU source only), and lower-cost inspector styling. These are approximations, not full HDRI/PBR/SSAO or a Unity authoring pass.
- Next: phase 6 production polish, GPU/device tests, final architecture/model/detail assessment, asset loading and accessibility checks. Preserve v7 before further edits. See TESTING.md for measured results and limits.

## Phase 6.5 / V8 checkpoint
- Premium-production pass continued: comfort-focused navigation, responsive HUD refinement and additional render-budget reductions.
- Not final production yet; next phase should focus on asset polish, final QA and deployment hardening.

# v9 checkpoint — editorial, performance and responsive pass
Implemented new Drone/code sculpture, steady-camera caching, runtime legacy mesh exclusion, restrained studio HUD, settings drawer, phone/landscape/tablet inspector layout. All prior labs retained. See TESTING.md for exact benchmark scope. Next: improve architectural model fidelity and GPU rendering, test physical mobile/desktop devices and deployment behavior, verify project media, then address production readiness. Preserve this ZIP as the current checkpoint; do not overwrite earlier builds.


## Phase 7 / v10 drone swap
- User-requested navigation redesign implemented: the roaming medium is now a professional quad-drone with a small camera below for visual simulation.
- Performance profile intentionally kept close to v9 by avoiding heavy imported runtime assets for the drone itself.
- Continue next with production polish, final mobile cleanup and deployment hardening.

## v11 checkpoint — ongoing design development
Completed original drone asset / detail variants; lightweight architectural embellishment, viewport refinement and CPU cache optimization. Next: redesign the repetitive station architecture into more distinctive spatial spaces, add purposeful animations and project presentation, verify WebGL on hardware and physical phones. Do not label this production-ready. Preserve prior projects and evidence.

## Phase 12 completed: architectural districts
- Six original GLB designs authored and integrated; old shared pavilion retired from embedded runtime.
- Warm campus podium, linked walkways, arrival plaza and benches; stable station IDs/anchors preserved.
- CPU geometry budget: 24,236 → 17,792 triangles in matching steady-camera runs. Six responsive viewport checks and four lab engine suites passed.
- Next (13): purposeful lightweight ambient motion, local activity and interaction details; maintain steady-camera comfort. Later: richer spatial presentation and materials, physical GPU/device validation, production readiness. No deployment performed.

## Phase 13 checkpoint — living campus
Completed campus data-route activity, selected-station monitor previews, flight cues, motion toggle and pause conditions. Existing model/evidence assets and professional content retained. Next phase 14: redesign spatial project presentation with better case-study hierarchy, real project evidence access, adaptive inspection composition, and polish the mobile reading experience. Phase 15: materials and lighting. Phase 16: final hardening and device verification. Physical GPU and phone testing, perspective overlay occlusion at unusual angles, and final hosting remain open. No deployment performed.

## Phase 14 — spatial case-study workspace
Implemented an exhibit-focused 3D camera, an adaptive light editorial case-study panel, an expand/restore control, project architecture flows, direct workbench access, keyboard-operable tabs, lazy-loading evidence viewer with source links and failure fallback, and a reading-mode index. Existing drone, campus motion and laboratories preserved. Six viewport checks and two focused browser tests passed in CPU fallback. Four lab unit suites and 132 route checks passed. The full legacy lab browser run did not finish within the available execution window; repeat it before release. Evidence viewer tested with synthetic image fixtures and a forced failure, not a live GitHub network verification. No hardware or physical device verification. Next: Phase 15 lighting/materials and actual WebGL validation; phase 16 production hardening and deployment review.

## Phase 15 — architectural studio lighting
Implemented a geometry-derived baked shadow atlas (two receiving elevations), material-aware shading, analytical softbox highlights in the native WebGL shader, a refined neutral palette and subtle floor details. Preserved all core sections and drone behavior. This is still stylized low-poly 3D with approximated materials; no Unity/Blender authoring, HDRI, SSAO or physically accurate reflection pipeline was executed. Actual GPU performance and physical-device checks remain open. Next Phase 16: address residual mobile interaction/regression coverage, accessibility, renderer failure handling, hosting/security review and final deployment packaging. Do not label the release production-ready until remaining verification is complete.

## Phase 16 — production-hardening checkpoint
Recovered Phase 15 and implemented the fallback, reading edition, start-up access, keyboard/focus improvements and nine-stop guided tour. Browser checks passed at six emulated viewport sizes, including desktop/mobile case-study and laboratory checks. The full HTTP test is blocked by the environment's localhost policy; inline-document equivalent passed, including the simulated renderer failure and no-JS reader. Unit tests passed. The release candidate still requires physical mobile/GPU verification, live evidence/network validation and a deployed-site test. Continue from this checkpoint; do not mark as fully production-ready. See DEPLOYMENT.md and TESTING.md.

## Phase 17 — Detailed campus checkpoint
Six new original GLBs integrated; existing stations, drone navigation and labs retained. On the same 1280×800 CPU-fallback benchmark: v16 movement callbacks 60.23/s, first v17 pass 48.74/s, final v17 55.59/s. Final v17 rendered scene 20,496 triangles (v16 18,368). Added regional static face indexing, but v17 still incurs a measurable performance cost. All six viewport checks passed after optimization. Phase 18 (drone physics and camera transitions) next. Physical GPU/device performance, realistic material pipeline, hosting and evidence verification remain open.

## v18 corrective checkpoint — visual quality first
Pause planned further art/physics phases until the owner reviews this restored camera behavior and clarity on the actual GPU. Preserve earlier interaction and functional features. Future performance adjustments must be compared at equivalent camera/viewport/quality settings and must not degrade display resolution, station visibility or the front-facing inspection experience. Pending: physical WebGL and touch validation, all-station visual checks and full regression suite. The current build is not a production release.

## v19 corrective checkpoint — station-specific content
Continue from v18 visual restoration, not older performance-first branches. Content now uses a project whitelist and distinct professional/technical station views; preserve these boundaries. All 12 stations and reader verified on desktop and portrait mobile at reduced motion; desktop cinematic movement and physical-screen inspection verified separately. Future changes must pass these regression checks and preserve clarity, front-facing monitors, functioning section-specific controls and comfortable camera behavior. No production, physical-device or hardware GPU verification yet. Next: further design detail and functional drone/gimbal refinements only after testing on the actual machine; measure equivalent cinematic settings, not steady-camera callback rates.


## Phase 20 / UI refinement checkpoint
- Continued from the restored contextual build instead of changing the concept again.
- Refined box radii and card treatments across station views while preserving monitor-based interaction and section relevance.
- Next recommended work: subtle premium motion polish and more front-facing monitor/camera micro-adjustments without sacrificing readability.

## Phase 21 checkpoint
Preserve this version and v19/v20 as rollback references. No changes to campus layout, station content data, lighting or monitor architecture. Next: verify on physical hardware, improve moving-frame render performance without reducing sharpness, and test mobile gestures and camera interruption. Keep context-specific fields and regression gates.

## Phase 22 checkpoint
Flight motion refinement and release tooling. Preserve contextual stations, clear monitors and full fidelity. Next: environmental microanimations, then rendering quality/performance and device QA.

## Phase 23 checkpoint
Preserve v22 layout, cinematic and contextual interaction. Phase 23 upgrades physical screen activity with bounded local simulations and selected-station approach lights. Next: moving-frame optimization without lowering visual fidelity and comprehensive device QA.

## Phase 24 checkpoint
Static projection reuse and source-region texture drawing implemented. CPU browser regression passed; first short movement benchmark was flat. Experimental indexed WebGL requires physical GPU testing. Next: Phase 25 cross-device and visual regression QA.
