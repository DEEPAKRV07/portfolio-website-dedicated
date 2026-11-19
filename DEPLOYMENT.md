# RVD COREWORLD 18 — deployment candidate

## Local preview
Extract the complete source archive and open `launch.html` in Chrome or Edge. Keep `read.html`, `read.css` and `assets/` alongside it. `read.html` is the browser-native reading edition and requires no JS or GPU. The evidence viewer requests original public GitHub images only when opened; internet is necessary for those images.

## Static hosting
Extract the separate deployment archive into an empty directory. Upload its contents (not the ZIP itself) to a static host with HTTPS. The entry point is `index.html`; no server, npm install, database or credentials are required. `read.html#sight`, `read.html#experience` and `read.html#contact` are shareable non-3D links. For GitHub Pages, publish the files at the site root or project subpath. For Netlify, the `_headers` file provides baseline security and cache headers; other hosts may ignore it. No deployment was performed. Review résumé/contact publication permissions, private-project disclosures and all media before publishing.

## Regenerate after source edits
From the complete source tree with Python and Node installed:

```sh
node tools/static-reader.cjs
python build.py
node tools/lab-test.cjs
node tools/campus-motion-test.cjs
node tools/studio-test.cjs
```

Browser checks require Python Playwright and Chromium. Run `python tools/phase16-browser.py` on a machine where localhost HTTP is allowed (adjust the Chromium executable path if necessary). `--inline` runs the restricted-environment alternative. The deployment archive contains the runtime files and résumé only; GLB sources, offline bundle and test scripts remain in the complete source archive. Do not upload source archives, checkpoints or unrelated private files to the public host.

## Release gate
Test on actual Android/iOS and hardware-accelerated desktop WebGL, check network transfer/first-load and frame times, verify all public URLs and evidence permissions, and run the hosted browser test. This is a release candidate, not a verified production deployment. The scene remains a stylized native WebGL/Canvas experience, not a Unity-authored photorealistic world. A simulated context-loss event was tested, not a physical GPU reset.
