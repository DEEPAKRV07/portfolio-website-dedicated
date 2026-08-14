import { defineConfig } from 'vite';

export default defineConfig({
  base: '/portfolio-website-dedicated/',
  server: {
    watch: {
      ignored: [
        '**/refimgs/**',
        '**/.git/**',
        '**/*.zip',
        '**/updated-3d-assets/**',
        '**/3D-assets/**',
        '**/checkpoints/**',
        '**/*.py',
        '**/*.blend',
      ],
    },
  },
});
