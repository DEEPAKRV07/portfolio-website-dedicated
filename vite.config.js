import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      ignored: ['**/refimgs/**', '**/.git/**', '**/*.zip', '**/public/fonts/**', '**/*.otf', '**/*.ttf'],
    },
  },
});
