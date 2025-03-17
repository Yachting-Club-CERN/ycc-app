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
