import tsconfigPaths from "vite-tsconfig-paths";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["./tsconfig.json", "./tests/tsconfig.json"],
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "e2e/**"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      include: ["src/**/*.{js,mjs,cjs,jsx,ts,mts,cts,tsx}"],
    },
  },
});
