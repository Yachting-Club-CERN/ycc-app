// eslint-disable-next-line node/no-unpublished-import
import react from '@vitejs/plugin-react';
// eslint-disable-next-line node/no-unpublished-import
import {defineConfig} from 'vite';
// eslint-disable-next-line node/no-unpublished-import
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {plugins: ['@emotion/babel-plugin']},
    }),
    tsconfigPaths(),
  ],
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
