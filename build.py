from pathlib import Path
root = Path(__file__).resolve().parent
html = (root / 'index.html').read_text(encoding='utf-8')
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>\n' + (root / 'style.css').read_text(encoding='utf-8') + '\n</style>')
for name in ('resume-data.js', 'geometry.js', 'evidence-data.js', 'asset-kit.js', 'lab-engine.js', 'lab-ui.js', 'campus-motion.js', 'studio-light.js', 'drone-motion.js', 'app.js'):
    html = html.replace(f'<script defer src="{name}"></script>', '<script>\n' + (root / name).read_text(encoding='utf-8') + '\n</script>')
(root / 'launch.html').write_text(html, encoding='utf-8')
print('Generated launch.html')
