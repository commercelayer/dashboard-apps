// @ts-check
import react from "@vitejs/plugin-react"
import externalGlobals from "rollup-plugin-external-globals"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

// https://vitejs.dev/config/
export default defineConfig(() => {
  const basePath = "/"

  return {
    plugins: [react(), tsconfigPaths()],
    envPrefix: "PUBLIC_",
    base: basePath,
    build: {
      modulePreload: false,
      rollupOptions: {
        external: ["react", "react-dom"],
        plugins: [
          externalGlobals({
            react: "React",
            "react-dom": "ReactDOM",
          }),
        ],
      },
      manifest: "manifest.json",
    },
    test: {
      globals: true,
      environment: "jsdom",
    },
  }
})
