# Neural-network correction — 26 October 2026

## Evidence and architectural correction

The live main site was inspected in Edge and captured in `screenshots/baseline-live-home.png`. The preserved V2 integration was run at `legacy.html` and captured in `screenshots/baseline-v2-home.png`. They are not identical: live main uses a root with section spokes and a cross-linked outer network, while the latest GLB integration has a root above a row of sections. Education is already a navigation destination; the corrected V3 exposes it as a connected section node too.

The earlier V3 observatory platform, portal composition, absent inner-world roots and conventional half-page hero did not meet the clarified requirement. They are no longer the public default. Useful content, Studio, schemas, persistence, responsive controls and tests are retained. No reset or removal of the V2 source/assets was performed.

The current public composition uses the original central neural graph, section spokes and live-main cross-links. Original GLB keys are mapped explicitly, including `hero` to the live-main `core`, `football-analysis` to its existing `football` content ID, and `kaatchi-media` to `kaatchi`. All inner worlds have a root and a Home return. New resume-backed nodes extend the graph. Skill categories retain their child relationships. The default layout presents the graph in an upright plane with shallow depth; automatic cluster spacing supplements the authored anchors.

The scene remains a real Three.js network. Procedural bevelled frames, segmented contacts, layered shells and distinct section signatures surround the retained authored nuclei. The dark field/grid preserves the original setting. The platform builder is retained as unused code for recovery, not rendered. A selection focuses the node, highlights related connections, and then exposes its actual content. Desktop details leave the graph interactive; phone details use a closable native sheet. DOM navigation and reading mode remain available.

## Why Blender and the old website differ

`glb-audit.json` was extracted from the six actual GLB files; `src/v3/legacyGraph.js` records their identities, positions, edges and clip durations. No `.blend` scene or Blender render was supplied, so exact parity with the original Blender world/compositor cannot be verified.

Confirmed causes in the files and old runtime:

- Node containers begin at scale zero and have animation tracks that grow them. Evaluating only the initial frame gives degenerate bounds.
- Some `_core`/`_shell` meshes also have zero scale but **no** animation track that restores it. `LegacyNeuralAssets` repairs only these degenerate unanimated mesh scales. Other transforms remain authored.
- V2's `_setupWorldGeometry` resets core/shell translations, sets edge scales to one, applies global Skills size overrides, and replaces authored materials. Those operations can change the relative proportions and PBR appearance.
- Blender lighting/world settings and the site's lighting, environment, exposure, camera and tone mapping are different. A GLB is not a Blender render. V3 uses PBR lighting, reflections and desktop shadows. Runtime material clones reduce the exported emission, calibrate core color/metalness/roughness and expose the shell as a transparent wire cage. Source material definitions and GLB bytes remain unchanged.

V3 evaluates the authored animation to its final pose for bounds, then uses a single uniform fit wrapper for each nucleus. The internal hierarchy and animation tracks are retained; display material adjustments are isolated on disposable clones. A cache loads only needed world files; late loads and failed assets cannot replace a newer node. A procedural nucleus is the fallback. Entrance completion gates labels, and reduced motion evaluates the final pose once instead of replaying clamped actions.

## Reference inspection and honest limits

Both reference URLs returned HTTP 200 and rendered a canvas in Edge. Evidence is in `reference-inspection.json`, `reference-interactions.json`, and the `reference-*.png` captures.

- FunTech: the staged terminal-style loading, explicit boot interaction and progress feedback were observed. The boot button remained disabled during the bounded inspection; post-boot worlds and camera choreography were not verified. V3 adopts honest loading/ready states and geometry-before-label sequencing, not a fake terminal or unobserved behavior.
- Bruno Simon: the spatial start composition, clear start affordance, perspective depth and environmental lighting were observed. Initial click/key/wheel exploration did not reach a verified driving state in that inspection. No claim of reproducing driving physics or inspecting every area is made. The applicable design principles are a world-first viewport, clear spatial landmarks, coherent camera focus and visible controls.

Neither reference supplies copied artwork, models or surface styling. Portfolio navigation remains neural-node exploration rather than a vehicle game or unrelated world.

Additional direct inspections: Pyae Sone's neural portfolio returned HTTP 200 and displayed its layered network/onboarding and Forward Pass/Path Tracer/Timeline controls. The inspected session did not establish successful forward-pass playback. Green Code's YouTube page returned HTTP 200 and showed the requested title and 9:14 duration; the video was not watched or transcribed. See `additional-reference-inspection.json`. The supplied realistic still guides material depth, restrained green/cyan signals and the central identity composition; it is not used as a background image or substituted for geometry.

## Skills hierarchy correction — 27 October 2026

`skillsGraph.js` explicitly classifies all 23 existing skill records into six supported domains: AI/ML, Software Development, Computer Vision, Generative AI, Automation & Engineering, Mobile & XR. Stable record and asset IDs remain intact, even where historical identifiers such as `yolov8` now display Machine Learning in the original source. Relationships are interpreted by their actual content, not those misleading asset names. The Skills root is the professional identity, Deepak R V.

Inherited GLB lines are replaced in Skills by validated identity→domain, domain→technology/capability, and technology→project edges. Every project edge is backed by that skill's existing content relation. The unsubstantiated Generative AI→Maps and Three.js→FORCRUX associations were removed. No fabricated performance metrics or qualification claims were added.

The overview exposes the six domain branches and their connected technology geometry. Selecting a domain opens the same graph in a focused, deterministic hierarchy: left-to-right on desktop and top-to-bottom on narrow screens. Technology labels and evidenced projects appear in that branch. The concise branch context provides an overview return; individual technologies open actual details and related content. The visual flow is explanatory, not a running trained model.

Pulses follow each rendered edge in source-to-target order with phase delays by graph layer. Ancestors, descendants and evidenced relations respond to selection; unrelated labels and edges dim. Desktop detail framing reserves room for the panel. Mobile curves use side ports and outer routing lanes. Domain selection and project associations in Studio synchronize the same graph, with validation against missing parents or unsupported edges.

## Verification requirements after this correction

Retest all Home section nodes, section roots, contact destinations, skill selection, GLB load/animation/label order, node focus, repeated-world cleanup, keyboard/touch orbit and reset, responsive layouts, WebGL fallback, reduced motion and Studio publishing. Prior observatory screenshots and measurements are historical evidence only; final results must identify the corrected build.
