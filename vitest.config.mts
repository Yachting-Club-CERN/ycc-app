import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "tests/*"],
    coverage: {
      include: ["src/**/*.{js,ts,jsx,tsx,cjs,cts,mjs,mts}"],
    },
  },
});
