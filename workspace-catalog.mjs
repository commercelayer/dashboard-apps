// @ts-check

/**
 * Read entries of the default `catalog:` in `pnpm-workspace.yaml`,
 * where the versions shared by more than one package.json live (the package.json
 * files only say `catalog:`).
 *
 * The catalog is a flat `name: version` map, so it is handled line by line: no
 * YAML library needed.
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const WORKSPACE_FILE = fileURLToPath(
  new URL("./pnpm-workspace.yaml", import.meta.url),
)

/** @param {string} name */
function entryPattern(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`^(  ['"]?${escaped}['"]?:\\s*)(.+)$`, "m")
}

/**
 * Lines of the `catalog:` block only, so a same-named key elsewhere in the file
 * is never matched.
 * @param {string} content
 */
function catalogBounds(content) {
  const start = content.search(/^catalog:\s*$/m)
  if (start === -1) {
    throw new Error("No `catalog:` found in pnpm-workspace.yaml")
  }
  const rest = content.slice(start).split("\n")
  let end = start + rest[0].length + 1
  for (const line of rest.slice(1)) {
    if (line !== "" && !line.startsWith("  ")) break
    end += line.length + 1
  }
  return { start, end: Math.min(end, content.length) }
}

/**
 * @param {string} name
 * @returns {string} the version (or url) set in the catalog
 */
export function readCatalogEntry(name) {
  const content = readFileSync(WORKSPACE_FILE, "utf8")
  const { start, end } = catalogBounds(content)
  const match = content.slice(start, end).match(entryPattern(name))
  if (match == null) {
    throw new Error(`${name} is not in the pnpm-workspace.yaml catalog`)
  }
  return match[2].trim().replace(/^(['"])(.*)\1$/, "$2")
}
