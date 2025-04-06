import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { Environment, parseEnvironment } from "./src/environment";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const environment = parseEnvironment(env.VITE_APP_ENVIRONMENT);
  const app_name =
    !environment || environment === Environment.PRODUCTION
      ? "YCC App"
      : `YCC App ${environment}`;

  let app_short_name;
  if (!environment || environment === Environment.PRODUCTION) {
    app_short_name = "YCC";
  } else if (environment === Environment.DEVELOPMENT) {
    app_short_name = "YCC DEV";
  } else {
    app_short_name = `YCC ${environment}`;
  }

  return {
    plugins: [
      react({
        jsxImportSource: "@emotion/react",
        babel: { plugins: ["@emotion/babel-plugin"] },
      }),
      tsconfigPaths(),
      // See stats.html for chunk details (after running pnpm build)
      visualizer(),

      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico", "robots.txt"],
        devOptions: { enabled: true },
        manifest: {
          name: app_name,
          short_name: app_short_name,
          description: "Your digital YCC companion.",
          start_url: `/`,
          shortcuts: [
            {
              name: "Helper Tasks",
              short_name: "Tasks",
              url: "/helpers",
            },
            {
              name: "Member List",
              short_name: "Members",
              url: "/members",
            },
          ],
          display: "standalone",
          theme_color: "#1976d2", // MUI
          background_color: "#ffffff",
          icons: [
            {
              src: "favicon.ico",
              sizes: "64x64 32x32 24x24 16x16",
              type: "image/x-icon",
            },
            {
              src: "logo192.png",
              type: "image/png",
              sizes: "192x192",
            },
            {
              src: "logo512.png",
              type: "image/png",
              sizes: "512x512",
            },
            {
              src: "logo1024.png",
              type: "image/png",
              sizes: "1024x1024",
            },
            {
              src: "logo.svg",
              type: "image/svg+xml",
            },
          ],
        },
      }),
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
        "mui-tiptap",
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
            exclamationMark: ["mui-tiptap"],
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
  };
});
