import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: { plugins: ["@emotion/babel-plugin"] },
    }),
    tsconfigPaths(),
    // See stats.html for chunk details (after running pnpm build)
    visualizer(),
  ],
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "@mui/material",
      "@mui/icons-material",
      "@mui/x-data-grid",
      "@mui/x-date-pickers",
      "react-hook-mui-form",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Some notes as quite bit of time was sent here:
          // - Big chunks cause very slow loading on mobile devices
          // - Tried to use a function, but it is error-prone that something get's package into the wrong location
          // - This way Rollup.js is able to optimize the chunks better
          // - Surprisingly as of 2025-03 react-router-dom actually get's packaged with the app into index*.js
          oh: [
            "axios",
            "html-react-parser",
            "keycloak-js",
            "react",
            "react-dom",
            "react-error-boundary",
            "react-hook-form",
            "react-router-dom",
            "zod",
          ],
          no: ["@mui/material", "@mui/icons-material"],
          nerd: ["@mui/x-data-grid"],
          alert: ["@mui/x-date-pickers", "react-hook-form-mui"],
        },
      },
    },
  },
  server: {
    open: true,
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
