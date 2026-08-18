// @ts-check
import fs from "node:fs"
import path from "node:path"
import react from "@vitejs/plugin-react"
import externalGlobals from "rollup-plugin-external-globals"
import tsconfigPaths from "vite-tsconfig-paths"
import { defineConfig } from "vitest/config"

/**
 * Detect a locally linked `@commercelayer/app-elements`, i.e. a dependency
 * declared as `link:../app-elements/packages/app-elements` instead of a published
 * version. Every pnpm dependency is a symlink, but only a linked checkout
 * resolves to a path outside of any `node_modules` directory.
 *
 * Returns `null` for regular installs, so this is a no-op in CI and for anyone
 * not doing local app-elements development.
 * @returns {{ repoRoot: string, peerDependencies: string[] } | null}
 */
const detectLinkedAppElements = () => {
  try {
    const packageDir = fs.realpathSync(
      path.join(
        process.cwd(),
        "node_modules",
        "@commercelayer",
        "app-elements",
      ),
    )

    if (packageDir.includes(`${path.sep}node_modules${path.sep}`)) {
      return null
    }

    const pkg = JSON.parse(
      fs.readFileSync(path.join(packageDir, "package.json"), "utf8"),
    )

    return {
      // the sibling repo root, so Vite may also serve app-elements' own deps
      repoRoot: path.resolve(packageDir, "..", ".."),
      // Only the peers this package installs itself: those are the ones that
      // would otherwise be loaded twice. Deduping a peer it does not have would
      // instead make it unresolvable (app-elements keeps its own copy).
      peerDependencies: Object.keys(pkg.peerDependencies ?? {}).filter((dep) =>
        fs.existsSync(path.join(process.cwd(), "node_modules", dep)),
      ),
    }
  } catch {
    return null
  }
}

// https://vitejs.dev/config/
export default defineConfig(() => {
  const basePath = "/"
  const linkedAppElements = detectLinkedAppElements()

  return {
    plugins: [react(), tsconfigPaths()],
    envPrefix: "PUBLIC_",
    base: basePath,
    // Local app-elements development: run `pnpm build:watch` in
    // app-elements/packages/app-elements and its `dist` is rebuilt on save,
    // which this dev server picks up right away.
    ...(linkedAppElements != null
      ? {
          resolve: {
            // a linked package resolves from its real path, so it would
            // otherwise load its own copy of these singletons (two Reacts =>
            // "Cannot read properties of null (reading 'useContext')")
            dedupe: linkedAppElements.peerDependencies,
          },
          optimizeDeps: {
            exclude: ["@commercelayer/app-elements"],
          },
          server: {
            allowedHosts: [".commercelayer.dev"],
            fs: {
              allow: [process.cwd(), linkedAppElements.repoRoot],
            },
          },
        }
      : {}),
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
