# COREWORLD 3.0 — validation report (17 November 2026)

## Passing

- `node --check app.js`, `node --check evidence-data.js`, `node --check resume-data.js`, `python build.py` passed.
- Headless Chromium (rendered via **CPU perspective fallback**) on 1440 × 900: boot, overview, direct dock onto SightMate physical screen, three inspector tabs, four SightMate proof tiles, neural lab objective change (AND) and training control, developer terminal telemetry all worked; no JS page errors.
- Separate guided tour smoke test: tour starts at 1/8, `Continue guided route` transitions to 2/8 and corresponding experience panel, with no JS page errors.
- Headless Chromium 390 × 844 touchscreen viewport: overview, dock and Evidence tab rendered; 4 proof tiles present, layout reported 390 px document width for 390 px viewport and no horizontal document overflow; no JS page errors.
- Evidence links and public/private repo visibility were checked against the connected GitHub account. Public screenshots were identified by path; SightMate media was also visually inspected and labeled as UI/development screenshots. They are not fabricated demonstrations.

## Known limitations / verification still needed

- The browser environment **did not provide a WebGL context**, including software SwiftShader attempts. Actual hardware GPU shader output, performance, external browser compatibility and device thermals cannot be certified from these tests. The screenshots show the CPU-rendered mode.
- External GitHub screenshots load only on explicit user interaction and require internet. They are not bundled for offline viewing, and their source server can change.
- No real output MP4s were provided for SightMate, Football, Punch Hero, Lead Generator or the employer/client projects. They are not falsely represented as implemented demos.
- CPU fallback is potentially slower than WebGL. No final real-phone FPS or memory audit was run.
- Auto-navigation was exercised as part of a guided route smoke test; exhaustive joystick, all 11 zones, Easter egg unlock and multi-browser regression are still pending.
- Deltha's local font discovery is implemented; the actual binary cannot be redistributed here. Visual fallback is intentional.
- This is a static site. There is no server authentication, physical XR backend, AI API, live computer-vision inference, external data scraping, analytics tracking, or deployment pipeline.

## Reproduce locally

1. Run `python build.py`.
2. Open `launch.html` and verify the boot screen and world render; for browser inspection, serve with `python -m http.server 8000`.
3. Press Guided tour; advance between stops. Verify SightMate Evidence screenshots load when you explicitly open their tiles while online.
4. In Neural Lab, switch between XOR, AND and OR; train 100+ epochs and inspect outputs.
5. Visit Dev Workspace and run `help`, `telemetry`, `proof sight`, `tour`, and `find vision`.
6. Test mobile joystick, index route and read mode on a physical device.

# COREWORLD 4.0 phase validation (19 November 2026)
Headless Chromium, same 1280×800 viewport, CPU fallback (`--disable-webgl`), animation callback sampling windows ~1.8–1.9 seconds. Actual scene paint-rate counter sampled from the new HUD. Measurements are approximate, environment-dependent, and represent a synthetic test, not hardware device verification.

| Measure | Original v3 | v4 |
| --- | ---: | ---: |
| Browser animation callbacks/sec, stationary | 5.17 | 45.03 |
| Browser animation callbacks/sec, holding W | 5.45 | 17.22 |
| Scene paints/sec, stationary | ~5.17 (every callback painted) | 11.6 (paced/cached) |
| Scene paints/sec during movement, sampled counter | ~5.45 | 15.7 |
| Triangles at end of movement test | 41,368 | 26,372 |

Desktop 1440×900 and emulated touch 390×844: boot, directory navigation to SightMate, physical dock, Evidence tab (four media tiles), return, Neural Lab dock, no JS page errors, no document overflow. Source GLB files independently parsed with trimesh; all five contained nonempty mesh geometry, expected bounds, and no decoder errors. `node --check` and offline HTML build passed. Existing external evidence is not packaged, loaded on demand only. GPU WebGL context still unavailable in this container and SwiftShader attempts fell back to CPU; no physical-device FPS or full network measurement. Remaining CPU painter sorting/visual accuracy limitations and full regression coverage are open.

# COREWORLD 5.0 phase 3 validation (19 November 2026)
- `node --check app.js`, author asset script and offline build passed. All ten GLBs independently opened using trimesh and contain nonempty meshes with bounds. Probe full detail 860 triangles; simplified model 160 triangles, used by CPU fallback, overview and eco mode.
- Final Chrome headless smoke test (CPU perspective fallback), desktop 1440×900 and emulated touch 390×844: boot, directory to SightMate, evidence (4 tiles), undock, Neural Lab dock. Zero JavaScript page errors. Document width matched each viewport. Capture and inspect overview and inspector screenshots; explore motion separately exercised.
- GPU context unavailable after SwiftShader attempt. The new WebGL shader is JS source-syntax checked only, not GPU-compiled or performance-tested here. No physical mobile verification.
- Comparison below captures a short CPU fallback run, same 1280×800 viewport, sequential tests. Callback rate is not actual rendered FPS; results are synthetic and geometry/camera differ slightly between versions.
/mnt/data/rvd-phase4/RVD-CoreWorld-v4/launch.html {'fps': 42.53203711886986, 'ms': 1810.3999999999533, 'render': '11.8'} {'fps': 16.22102454083956, 'ms': 1911.1000000000931, 'render': '16.5'} {'renderer': 'canvas-perspective', 'x': '-16.02', 'z': '7.42', 'docked': '', 'triangles': '26372', 'renderScale': '0.86', 'renderFps': '16.5'} []
launch.html {'fps': 46.86994935890293, 'ms': 1856.2000000000935, 'render': '12.0'} {'fps': 15.081387487648131, 'ms': 1922.9000000000933, 'render': '13.8'} {'renderer': 'canvas-perspective', 'x': '-14.40', 'z': '7.90', 'docked': '', 'triangles': '27076', 'renderScale': '0.86', 'renderFps': '16.0'} []

# COREWORLD 6.0 phase 4 validation (19 November 2026)
- `node --check app.js`, `node --check lab-engine.js`, `node --check lab-ui.js`, `python build.py`: passed.
- `node tools/lab-test.cjs`: passed four suites; nine vision scene variants with accepted/rejected confidence thresholds; eight stable tracking IDs over 120 ticks, positive calculated speed and both teams' possession; 1/3/4 virtual worker slots, each ending with 6 exports, 1 duplicate, 1 invalid and 10 total attempts; compatibility rule counts 0/4 and 4/4.
- `python tools/lab-browser.py /mnt/data`: headless Chromium with WebGL disabled, desktop 1440×900 and touch emulation 390×844. Both passed with no uncaught page errors or horizontal document overflow. Desktop: station navigation, changing SightMate confidence, scene changes, evidence tile count, tracking compensation toggle, complete lead batch, compatibility checklist, neural training 100 epochs, reading fallback. Mobile: SightMate confidence and scene changes, four evidence tiles and responsive inspector. Screenshot review performed for SightMate desktop and mobile.
- Browser test used embedded launch.html contents (local file navigation prohibited by container policy). External proof assets and physical devices not retested. No new FPS claims; prior geometry and GPU constraints remain. These are toy demonstrations using synthetic data, not actual YOLO inference, ByteTrack, real scraper workers, or legacy Unity device tests.

# COREWORLD 7.0 phase 5 validation
- Node syntax, four laboratory-engine suites, and offline build: PASS. Desktop 1440×900 and emulated touch 390×844 lab-browser regression: PASS, zero uncaught page errors, no horizontal overflow. All four interactive simulations, neural training, proof tiles and reading mode exercised as in v6.
- New travel-browser.py: desktop skip, cancel, normal flight, recenter and Escape cancellation passed; mobile skip and dock idle verified; the combined long test timed out after mobile dock. A separate targeted mobile run verified cancel, normal arrival and undock (no physical device); reduced-motion immediate docking passed in a separate headless context. Mobile recenter was visible but not successfully verified through the combined timed-out test.
- Comparable short synthetic CPU fallback benchmarks, 1280×800, same test script: v6 idle scene paint counter 12.0/s vs v7 5.8/s; moving callback rate 15.73/s vs 17.07/s; moving scene paint counter 16.5/s vs 17.4/s. Stationary docked scene counter reached 0.0/s on desktop and mobile while HTML laboratory UI remained available. Intentional idle paint suppression is not a claim of faster physical GPU frame rate. Short samples, not sustained benchmarks.
- Native WebGL path shader changes not GPU-tested here; no actual HDRI, real SSAO, photorealism, Unity editor or physical phone verification. External evidence still on-demand and requires network. Long mobile combined test timeout remains documented.

## v9 verification
- Node syntax check, offline build, and four lab engine suites passed. Browser lab regression passed at 1440×900 and 390×844, zero page errors.
- Headless Chromium CPU fallback, same short 1280×800 benchmark: v8 9.6 animation callbacks/s and 9.5 scene paints/s while holding W; v9 57.6 callbacks/s and 60.0 sampled scene paints/s with default steady camera. Earlier v8 run measured 16.1 callbacks/s and 15.7 paints/s. Different camera behavior is intentional; this is not an equal-workload renderer benchmark, nor physical GPU testing.
- Responsive station/evidence/read-mode checks passed at 1440×900, 390×844, 320×568, 844×390, 768×1024 and 1920×1080; inspected screenshots, then refined phone headline spacing, camera margin and bottom control collision. Final syntax/build and unit suite passed after refinements.
- Hardware WebGL, physical touch devices, external proof URLs and full deployment validation remain unverified. No guarantee of eliminating motion sickness. Follow camera may remain slower on CPU fallback.

## v11 verification
Node syntax and four lab-engine suites passed. Headless Chromium CPU fallback, 1280×800: v10 59.2 and v11 60.3 movement rAF callbacks/sec in short runs; actual scene paint telemetry 60.0/sec in both. Not a statistically significant speedup or a GPU benchmark. Six viewport tests: 320×568, 390×844, 844×390, 768×1024, 1440×900, 1920×1080; reduced-motion entry, zoom, directory, SightMate docking and evidence, reading mode and inspector bounds. Tests use injected standalone HTML because file:// navigation is blocked by this browser environment. Original GPU hardware and actual phone testing pending.

## v12 test results (CPU fallback)
`node tools/lab-test.cjs`: 4 suites passed. `node --check app.js`: passed. `python build.py`: passed.
`python tools/phase12-browser.py`: six viewport checks; reduced-motion emulation; entry, zoom, directory, direct docking, SightMate evidence, reader and bounds all passed with no page errors.
1440x900: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS
390x844: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS
320x568: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS
844x390: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS
768x1024: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS
1920x1080: entry, zoom, directory, direct docking, evidence, reading, viewport bounds PASS

Matched short Chromium CPU fallback benchmark, WebGL disabled, 1280×800, steady camera, W held for ~1.9 seconds:
/mnt/data/rvd-phase11/RVD-CoreWorld-v11/launch.html {'fps': 60.18109540637899, 'ms': 1811.1999999994414, 'render': '0.0'} {'fps': 60.27885522593233, 'ms': 1907.7999999994408, 'render': '60.0'} {'renderer': 'canvas-perspective', 'x': '-12.20', 'z': '11.04', 'docked': '', 'triangles': '24236', 'renderScale': '0.82', 'camera': 'steady', 'renderFps': '60.0'} []
launch.html {'fps': 60.07495590828924, 'ms': 1814.4, 'render': '0.0'} {'fps': 60.25358901811083, 'ms': 1908.6000000005588, 'render': '60.0'} {'renderer': 'canvas-perspective', 'x': '-12.20', 'z': '11.04', 'docked': '', 'triangles': '17792', 'renderScale': '0.82', 'camera': 'steady', 'renderFps': '60.0'} []

These are animation callback rates, not guarantees of GPU FPS or physical-device results. Static scene intentionally idles. New models programmatically authored, not Unity/Blender. Physical hardware and photorealism remain unverified.

## v13 validation
- JavaScript syntax and offline build passed; four lab engine suites passed; 132 ordered campus route unit cases passed (endpoints, orthogonal aisle routing, interpolation).
- Six viewport regressions passed at 1440×900, 390×844, 320×568, 844×390, 768×1024, 1920×1080 on reduced-motion CPU fallback; new desktop/mobile activity tests also passed (1440×900, 390×844), including visible animated pixels, explicit toggle, travel state, pause during docking, reading and directory, and OS reduced-motion. A targeted desktop SightMate hover produced preview=sight and links=2 without uncaught errors. All previews are synthetic; the overlay is projected, not a depth-buffered mesh.
- Matched short Chromium animation callback benchmark with steady camera, 1280×800, W held for approximately 1.9 seconds: v12 60.30 callbacks/sec, v13 60.20 callbacks/sec, both 60.0 sampled scene paints/sec; 17,792 scene triangles in both. No significant performance improvement or regression demonstrated by this short sample. Overlay updates are independent of scene paint telemetry.
- Attempted Chromium ANGLE/SwiftShader WebGL initialization; environment still returned canvas-perspective fallback. Native WebGL rendering, actual devices, real asset evidence endpoints and hosting remain unverified.

### v14 verification
- Node syntax check and standalone build passed.
- `node tools/lab-test.cjs`: four suites passed. `node tools/campus-motion-test.cjs`: 132 routes passed.
- `python tools/phase13-viewports.py`: all six CPU-fallback viewport checks passed (1440×900, 390×844, 320×568, 844×390, 768×1024, 1920×1080).
- `python tools/phase14-browser.py`: desktop and portrait mobile passed exhibit, panel expand, live lab threshold, keyboard tab selection, on-demand evidence, viewer cycling, forced unavailable image, Escape and reader index checks. Image requests intercepted with test fixtures; no live image verification.
- Full legacy `lab-browser.py` suite timed out in this execution window. Physical mobile and real GPU performance unverified; no new FPS claim.

## v15 verification
- `node --check app.js`, `node --check studio-light.js`, `python build.py`: passed.
- `node tools/studio-test.cjs`: receiver, projection, material and shading assertions passed. `node tools/lab-test.cjs`: four suites; `node tools/campus-motion-test.cjs`: 132 route checks passed.
- Final browser checks: 1440×900, 390×844, 320×568, 844×390, 768×1024 and 1920×1080 passed entry, zoom, directory, direct docking, evidence, reading and inspector bounds. Desktop and portrait-mobile focused case-study tests passed, including tab keyboard controls, expand, live lab threshold, image fixtures, viewer cycling, forced unavailable image fallback, Escape and reader index.
- Matched brief CPU-fallback movement benchmark using the steady camera at 1280×800: v14 60.46 and v15 60.22 animation callbacks/sec, both 60.0 sampled scene paints/sec. Geometry: 17,792 → 18,368 triangles. No meaningful speed improvement claimed; measurements are not a hardware GPU or physical mobile benchmark.
- Runtime shadow atlas created with 38,483 projected triangle contributions across both layers and passes (not unique geometry). Runtime WebGL/SwiftShader attempt returned Canvas fallback; shader runtime behavior remains unverified. No live GitHub image availability verification; no physical-device test or deployment. Full legacy lab-browser regression not rerun in this phase.

## v16 verification
- Node syntax check and offline build passed. Four lab engine suites, 132 campus routes and 12 studio assertions passed.
- All six responsive browser checks passed (1440×900, 390×844, 320×568, 844×390, 768×1024, 1920×1080). Desktop and portrait mobile case-study/evidence fixture tests passed.
- New Phase 16 browser suite passed using the inline document: all five interactive station checks on desktop and portrait mobile (SightMate, tracking, data, Unity compatibility, neural training); simulated context loss and JavaScript-disabled reading edition passed at both sizes. Some laboratory input events are programmatically triggered; this is not physical touch verification.
- HTTP navigation attempt failed with Chromium net::ERR_BLOCKED_BY_ADMINISTRATOR at localhost. Restricted-environment alternative used instead. Live public image availability, production hosting, hardware WebGL, real GPU loss, physical devices and fresh performance measurements remain unverified. No new FPS claim.

## v17 verification
- Node syntax check, four lab engine suites, 132 campus route checks and 12 studio assertions passed.
- Final inline Chromium CPU-fallback checks passed at 1440×900, 390×844, 320×568, 844×390, 768×1024, 1920×1080: entry, zoom, directory, docking, evidence UI, reading mode and viewport bounds.
- Short 1280×800 steady-camera CPU benchmark: v16 60.23 movement callbacks/s, initial v17 48.74, final v17 55.59; scene metadata 20,496 triangles, scale 0.82. Not a physical GPU or mobile benchmark. Lab regression was unit-level in this phase; only SightMate inspection was covered by the final viewport script.

## v18 fidelity restoration
- User recording reviewed: distant/soft overview, static exploration, rear-facing display inspection. Code review confirmed steady default, disabled auto-focus, strong adaptive downscaling and rear-facing inspector.
- `node --check app.js` passed; offline `python build.py` succeeded.
- Four lab engine suites, 132 route assertions, 12 studio assertions passed.
- Chromium at 1440×900: entry, full-resolution scene, cinematic drone-follow, keyboard movement, SightMate front-facing monitor, evidence tab, expanded case mode and reading mode passed without page errors. Sampled CPU fallback moving scene paint rate was about 8 FPS; not a hardware-WebGL benchmark.
- Chromium at 390×844 with reduced-motion: entry, direct docking, front-facing elevated exhibit, evidence and reading mode passed without page errors; canvas at 390×844 and sheet within viewport.
- Chromium WebGL/SwiftShader attempt selected the Canvas fallback. Actual hardware accelerated tests, mobile touch navigation in cinematic mode, hosted verification and live external links remain pending. No claim of 60 FPS.
- Reproduce with `python tools/restoration-browser.py desktop-fallback` and `python tools/restoration-browser.py mobile`.

## v19 regression results
- `node --check app.js`, `node tools/static-reader.cjs`, `python build.py`: passed. Four lab-engine suites, 132 route checks, 12 studio assertions passed.
- `python tools/phase19-browser.py 1440 900` and `python tools/phase19-browser.py 390 844`: all 11 public stations plus unlocked archive, project-specific tabs, nonproject layout, terminal guard, reading-mode evidence scope and viewport bounds passed; no uncaught JavaScript errors. Automated Chromium Canvas fallback, reduced-motion emulation, direct navigation; not physical touch or hardware GPU.
- `python tools/restoration-browser.py desktop-fallback`: cinematic default, changed camera target on keyboard movement, front-facing SightMate inspection at 1440×900 full canvas resolution, evidence, expand and reader passed. A short sampled moving scene paint rate of 11.6 FPS in CPU fallback is not a controlled benchmark or a hardware GPU result.
- External media responses, physical WebGL/mobile testing, full live hosting verification, and a separate animated drone-gimbal model are not verified/completed. No new production readiness claim.


### Ongoing regression rule
Before each new phase, verify: (1) section content is still context-specific, (2) camera/monitor alignment has not regressed, (3) no sharp utility boxes or accidental styling drift were introduced where premium rounded cards are expected.

## v21 verification
- Node syntax, offline build, four lab-engine suites, 132 route assertions, 12 studio assertions and static reader generation passed.
- Chromium Canvas fallback at 1440×900 and 390×844, reduced motion: all 11 public stations plus archive; section-specific evidence, station header radius, viewport bounds and reader passed without uncaught page errors.
- Chromium Canvas fallback 1440×900, ordinary motion: cinematic entry, movement, camera focus, front-facing SightMate dock, evidence, expansion and reader passed. Short observed movement scene rate 7.9 FPS; not a controlled comparison or GPU benchmark.
- Independent camera gimbal model integrated in both render paths; telemetry angles changed during movement. No hardware GPU, live hosting or physical mobile tests.

## Phase 22 regression (2026-11-19)
- Local JS syntax and release allow-list checks passed; 4 lab suites, 132 route checks, 12 lighting checks, 1,001 flight samples and banking/transform checks passed.
- Chromium inline fallback: all 12 station content checks at 1440×900 and 390×844, animated flight/docking, and no-JS reading checks passed. Direct HTTP navigation was blocked by the environment; the CI workflow runs the served-page version. Hardware GPU and physical-device validation remain pending.
- GitHub backup branch created; complete replacement and Pages deployment pending authenticated local push. The migration helper passed its source-validation mode only, not a remote push.

## Phase 25 interaction QA
Baseline: six viewport checks (320×568 through 1920×1080). After fixes: build, all four lab suites, 132 routes, 12 studio assertions, 1001 drone samples, 24 station visits, animated docking, no-JS edition, and dedicated interaction checks passed. Local Chromium ran the inlined build with WebGL disabled; HTTP loopback was blocked by environment policy. CI runs the HTTP regression. Physical GPU/device validation remains outstanding.
