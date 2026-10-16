// @ts-check

/**
 * Prints the pnpm `--filter` flags that select the apps CI checks, builds and publishes for a tag.
 *
 * - Release tag created by `lerna version` (`v` + lerna.json version): only the apps lerna bumped.
 * - Any other tag (staging or feature, created by hand): all apps, since no version is bumped and
 *   these tags often only bump shared dependencies in the pnpm catalog.
 *
 * The tag is read from `CIRCLE_TAG`, or from the first argument when run locally:
 * `node latest-pnpm-filters.cjs v6.2.0-stg.0`
 */

const { readFileSync, readdirSync, existsSync } = require("node:fs")
const { resolve } = require("node:path")

const tag = process.argv[2] ?? process.env.CIRCLE_TAG

const { version: lernaVersion } = JSON.parse(
  readFileSync(resolve(__dirname, "lerna.json"), "utf-8"),
)
const isLernaRelease = tag == null || tag === `v${lernaVersion}`

if (!isLernaRelease && /^v\d+\.\d+\.\d+$/.test(tag)) {
  console.error(
    `Tag ${tag} looks like a production release but lerna.json is at ${lernaVersion}. Production tags must be created with \`pnpm lerna version\`.`,
  )
  process.exit(1)
}

const appsPath = resolve(__dirname, "apps")
const apps = readdirSync(appsPath, { recursive: false, withFileTypes: true })

const filters = apps
  .filter((directory) => directory.isDirectory())
  .map((directory) => {
    const appPackageJsonPath = resolve(appsPath, directory.name, "package.json")
    if (!existsSync(appPackageJsonPath)) {
      return null
    }

    const { name, version } = JSON.parse(
      readFileSync(appPackageJsonPath, "utf-8"),
    )
    return { name, version }
  })
  .filter((app) => {
    return app !== null && (!isLernaRelease || app.version === lernaVersion)
  })

if (filters.length === 0) {
  console.error(`No app found with version ${lernaVersion} for tag ${tag}.`)
  process.exit(1)
}

console.log(
  `--filter ${filters.map((filter) => filter?.name).join(" --filter ")}`,
)
