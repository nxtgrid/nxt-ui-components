import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [ vue() ],
  css: {
    preprocessorOptions: {
      api: 'modern',
      scss: {
        additionalData: `
          @use "/shared/styles/modules/variables" as *;
          @use "/shared/styles/modules/mixins" as *;
        `,
      },
    },
  },
});
