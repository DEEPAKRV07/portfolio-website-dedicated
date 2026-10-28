import { defineConfig } from 'vite';

export default defineConfig({
  base: '/portfolio-website-dedicated/',
  server: {
    watch: {
      ignored: [
        '**/refimgs/**',
        '**/.git/**',
        '**/*.zip',
      ],
    },
  },
});
