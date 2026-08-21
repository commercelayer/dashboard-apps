// @ts-check

/**
 * Lets a dashboard shell mount the apps in this repo straight from `pnpm dev`
 * instead of from a build.
 *
 * The router dev server already bundles every app (see `src/apps.ts`), so it can
 * also serve them under the same `/<appSlug>/` paths the hosted apps use: one
 * dev server for all of them, no port per app.
 *
 * It answers the two requests the shell makes:
 *
 * 1. `manifest.json`: the shell finds an app by fetching
 *    `<appsBaseUrl>/<appSlug>/manifest.json` and reading `["index.html"].file`,
 *    which Vite only writes on `build`. Left alone, this request falls through
 *    to the SPA fallback and returns `index.html`: a 200 that fails to parse as
 *    JSON, surfacing as "could not retrieve remote app script".
 *
 * 2. `dev-entry.js`: the shell injects the entry as a bare `<script>`, so the
 *    React Refresh preamble that `@vitejs/plugin-react` normally puts in
 *    `index.html` never runs, and every component module then throws "can't
 *    detect preamble". The entry imports the preamble module first and the app
 *    second, both statically: a static graph is fully evaluated before the
 *    script's `load` event, which is where the shell looks for the registered
 *    app. A dynamic `await import()` would fire `load` too early and the shell
 *    would silently mount nothing.
 */

import fs from "node:fs"
import path from "node:path"
import { searchForWorkspaceRoot } from "vite"

/** Dev-only entry the manifest points at. Not a real file on disk. */
const devEntryFile = "dev-entry.js"
/** Dev-only module that installs the React Refresh preamble. Not on disk. */
const devPreambleFile = "dev-preamble.js"

/**
 * @param {object} options
 * @param {string} options.appsDir Folder holding one directory per app.
 * @returns {import('vite').Plugin}
 */
export const devManifest = ({ appsDir }) => {
  /**
   * The app source for a slug, or `null` when there is no such app, which
   * leaves the request to Vite, so unrelated paths behave as usual.
   * @param {string} slug
   * @returns {string | null}
   */
  const appEntryUrl = (slug) => {
    const entry = path.join(appsDir, slug, "src", "main.tsx")
    // `/@fs/` because the apps live outside this package's root
    return fs.existsSync(entry) ? `/@fs${entry}` : null
  }

  return {
    name: "dev-manifest",
    apply: "serve",

    /**
     * The apps sit outside this package, so they are served over `/@fs/` and
     * have to be on the serving allow list. Declared here rather than in the
     * config, because anything that sets `server.fs.allow` replaces the default
     * instead of adding to it, and every app entry then 403s with "outside of
     * Vite serving allow list".
     *
     * The workspace root goes back in alongside it: that is exactly what Vite
     * would have defaulted to, and dropping it would 403 the dependencies and
     * the router page instead.
     */
    config() {
      return {
        server: {
          fs: { allow: [searchForWorkspaceRoot(process.cwd()), appsDir] },
        },
      }
    },

    /**
     * Drops an app's own app-elements stylesheets, which a build never puts on
     * the page either: `vite build` emits them as a separate file that the
     * manifest lists under `css`, and a host only ever loads `file`.
     *
     * Keeping them in dev puts a second, independently generated Tailwind build
     * in the same document as the host's. Tailwind is mobile-first: `.hidden`
     * is a plain rule while `.md\:flex` sits in a `@media` block, and media
     * queries add no specificity, so whichever stylesheet comes last wins the
     * tie and desktop layouts collapse to their mobile variant.
     *
     * Scoped to importers inside `appsDir`: this package's own entry keeps its
     * stylesheets, so the router UI is styled as usual, and an embedded app
     * inherits the host's, exactly as in production.
     */
    resolveId(source, importer) {
      const isAppElementsCss =
        /@commercelayer\/app-elements\/(style|vendor)\.css$/.test(source)

      if (!isAppElementsCss || importer == null) {
        return null
      }

      return importer.startsWith(appsDir) ? "\0dev-manifest:empty" : null
    },

    load(id) {
      return id === "\0dev-manifest:empty" ? "export default undefined" : null
    },

    configureServer(server) {
      // Registered in the hook body, not in a returned callback, so it runs
      // *before* Vite's own middlewares: the html fallback would otherwise
      // answer first.
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0] ?? ""
        const match = pathname.match(
          new RegExp(
            `^/(?:.*/)?([^/]+)/(manifest\\.json|${devEntryFile}|${devPreambleFile})$`,
          ),
        )

        if (match == null) {
          next()
          return
        }

        const [, slug, file] = match

        if (slug == null) {
          next()
          return
        }

        const entry = appEntryUrl(slug)

        if (entry == null) {
          next()
          return
        }

        // the shell fetches these cross-origin, from its own port
        res.setHeader("Access-Control-Allow-Origin", req.headers.origin ?? "*")

        if (file === "manifest.json") {
          res.setHeader("Content-Type", "application/json")
          res.end(
            JSON.stringify({
              "index.html": {
                // relative, because the shell joins it onto the app base URL
                file: devEntryFile,
                src: "index.html",
                isEntry: true,
              },
            }),
          )
          return
        }

        res.setHeader("Content-Type", "text/javascript")

        if (file === devPreambleFile) {
          res.end(
            [
              'import RefreshRuntime from "/@react-refresh"',
              "RefreshRuntime.injectIntoGlobalHook(window)",
              "window.$RefreshReg$ = () => {}",
              "window.$RefreshSig$ = () => (type) => type",
              "window.__vite_plugin_react_preamble_installed__ = true",
            ].join("\n"),
          )
          return
        }

        res.end(
          [`import "./${devPreambleFile}"`, `import "${entry}"`].join("\n"),
        )
      })
    },
  }
}
