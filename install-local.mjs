// @ts-check

/**
 * Installs the workspace against a local @commercelayer/app-elements checkout,
 * instead of the published version pinned in every package.json.
 *
 * The checkout path is asked for once and remembered in `.app-elements-local`
 * (gitignored), so later runs need no arguments and no exported env var.
 *
 * The install runs with `--no-lockfile`: pnpm neither reads nor writes
 * `pnpm-lock.yaml`, so switching to local development leaves it untouched and the
 * committed lockfile keeps matching the published versions. `pnpm install` on its
 * own always installs what package.json asks for.
 *
 * @example pnpm install:local
 * @example pnpm install:local ../app-elements/packages/app-elements
 */

import { spawnSync } from "node:child_process"
import {
  existsSync,
  readdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from "node:fs"
import { createInterface } from "node:readline/promises"
import { isAbsolute, join, resolve } from "node:path"

const PACKAGE = "@commercelayer/app-elements"
const CONFIG_FILE = ".app-elements-local"
const DEFAULT_GUESS = "../app-elements/packages/app-elements"

/**
 * Whether the given directory really is the app-elements package.
 * @param {string} path
 * @returns {boolean}
 */
function isAppElements(path) {
  const manifest = join(path, "package.json")
  if (!existsSync(manifest)) {
    return false
  }
  try {
    return JSON.parse(readFileSync(manifest, "utf8")).name === PACKAGE
  } catch {
    return false
  }
}

/** @param {string} path */
function absolute(path) {
  return isAbsolute(path) ? path : resolve(process.cwd(), path)
}

/**
 * The remembered path, if it is still a valid checkout.
 * @returns {string | undefined}
 */
function readSavedPath() {
  if (!existsSync(CONFIG_FILE)) {
    return undefined
  }
  const saved = readFileSync(CONFIG_FILE, "utf8").trim()
  if (saved === "") {
    return undefined
  }
  if (!isAppElements(saved)) {
    console.log(
      `⚠ ${CONFIG_FILE} points at ${saved}, which is not ${PACKAGE} any more.`,
    )
    return undefined
  }
  return saved
}

/**
 * Ask for the checkout path, re-asking until it is a real one.
 * @returns {Promise<string>}
 */
async function askForPath() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const suggestion = absolute(DEFAULT_GUESS)
  const hasSuggestion = isAppElements(suggestion)

  try {
    while (true) {
      const answer = (
        await rl.question(
          hasSuggestion
            ? `Path to your ${PACKAGE} checkout [${suggestion}]: `
            : `Path to your ${PACKAGE} checkout: `,
        )
      ).trim()

      const candidate = absolute(answer === "" ? suggestion : answer)

      if (isAppElements(candidate)) {
        return candidate
      }

      console.log(
        `✗ ${candidate} is not a ${PACKAGE} checkout (no package.json with that name).`,
      )
    }
  } finally {
    rl.close()
  }
}

/**
 * Every workspace package that declares a dependency on app-elements.
 * @returns {string[]} directories, relative to the repo root
 */
function packagesDependingOnAppElements() {
  return ["apps", "packages"]
    .filter((group) => existsSync(group))
    .flatMap((group) =>
      readdirSync(group, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => join(group, entry.name)),
    )
    .filter((dir) => {
      const manifest = join(dir, "package.json")
      if (!existsSync(manifest)) {
        return false
      }
      try {
        const pkg = JSON.parse(readFileSync(manifest, "utf8"))
        return (
          pkg.dependencies?.[PACKAGE] != null ||
          pkg.devDependencies?.[PACKAGE] != null
        )
      } catch {
        return false
      }
    })
}

/**
 * Where each of those packages actually resolves app-elements after the install.
 *
 * Worth checking rather than trusting the exit code: the install succeeds all the
 * same when the override never gets applied, and would quietly keep using the
 * published build.
 *
 * @param {string} expected the checkout path
 * @returns {{ linked: string[], notLinked: string[] }}
 */
function verifyResolution(expected) {
  const target = realpathSync(expected)
  const linked = []
  const notLinked = []

  for (const dir of packagesDependingOnAppElements()) {
    const link = join(dir, "node_modules", PACKAGE)
    let resolved
    try {
      resolved = realpathSync(link)
    } catch {
      resolved = undefined
    }
    if (resolved === target) {
      linked.push(dir)
    } else {
      notLinked.push(dir)
    }
  }

  return { linked, notLinked }
}

/** @returns {Promise<string>} */
async function resolvePath() {
  // an explicit argument wins, then the env var, then what was remembered
  const fromArgv = process.argv[2]
  if (fromArgv != null && fromArgv !== "") {
    const candidate = absolute(fromArgv)
    if (!isAppElements(candidate)) {
      console.error(`✗ ${candidate} is not a ${PACKAGE} checkout.`)
      process.exit(1)
    }
    return candidate
  }

  const fromEnv = process.env.APP_ELEMENTS_LOCAL
  if (fromEnv != null && fromEnv !== "" && isAppElements(absolute(fromEnv))) {
    return absolute(fromEnv)
  }

  return readSavedPath() ?? (await askForPath())
}

const path = await resolvePath()

if (readSavedPath() !== path) {
  writeFileSync(CONFIG_FILE, `${path}\n`)
  console.log(`✓ remembered in ${CONFIG_FILE}`)
}

console.log(`→ installing against ${path}`)

// `.pnpmfile.cjs` turns this env var into a pnpm override, which is what actually
// redirects every package to the checkout
const { status } = spawnSync("pnpm", ["install", "--no-lockfile"], {
  stdio: "inherit",
  env: { ...process.env, APP_ELEMENTS_LOCAL: path },
})

if (status !== 0) {
  process.exit(status ?? 1)
}

const { linked, notLinked } = verifyResolution(path)

if (notLinked.length > 0) {
  const total = linked.length + notLinked.length

  // all of them means the override never applied; only some means pnpm considered
  // node_modules current and skipped the work, so a full install has to run first
  const cause =
    linked.length === 0
      ? `Is \`.pnpmfile.cjs\` present and intact? Its \`updateConfig\` hook is what turns
  APP_ELEMENTS_LOCAL into a pnpm override — without it this install silently
  reinstalls the published version.`
      : `node_modules looks stale: pnpm skips work it believes is already done.
  Run \`pnpm install\` first, then \`pnpm install:local\` again.`

  console.error(`
✗ the install finished, but ${notLinked.length} of ${total} packages are still not
  resolving ${PACKAGE} from the checkout:

${notLinked.map((dir) => `    ${dir}`).join("\n")}

  ${cause}`)
  process.exit(1)
}

console.log(`
✓ all ${linked.length} packages now resolve ${PACKAGE} from ${path}
  pnpm-lock.yaml was not touched.

  Run \`pnpm build:watch\` in the checkout to have your edits picked up,
  and plain \`pnpm install\` to go back to the published version.`)
