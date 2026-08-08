import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      ignored: [
        '**/refimgs/**',
        '**/.git/**',
        '**/*.zip',
        '**/public/**',
        '**/*.otf',
        '**/*.ttf',
        '**/*.png',
        '**/*.jpg',
      ],
    },
  },
});
