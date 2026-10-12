// @ts-check

/**
 * This script sets the @commercelayer/app-elements version in the pnpm-workspace.yaml
 * catalog, which every package.json points to with `catalog:`.
 * It supports two modes:
 * - preview: Replace with a pkg.pr.new preview URL using a commit hash
 * - bump: Replace with a production version
 *
 * @example pnpm elements:preview 085e9c3
 * @example pnpm elements:bump 6.10.2
 * @example pnpm elements:bump latest
 */

import { get } from "https";
import { readCatalogEntry, writeCatalogEntry } from "./workspace-catalog.mjs";

/**
 * Fetch the latest version from npm registry
 * @param {string} packageName - The package name to fetch
 * @returns {Promise<string>} The latest version
 */
async function fetchLatestVersion(packageName) {
  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${packageName}/latest`;

    get(url, (res) => {
      let data = "";

      if (res.statusCode !== 200) {
        reject(new Error(`Failed to fetch package info: ${res.statusCode}`));
        return;
      }

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          resolve(json.version);
        } catch (error) {
          reject(new Error("Failed to parse npm registry response"));
        }
      });
    }).on("error", (error) => {
      reject(new Error(`Network error: ${error.message}`));
    });
  });
}

// Parse CLI arguments
const [, , mode, value] = process.argv;

if (!mode || !value) {
  console.error(
    "❌ Usage: node replace-app-elements.mjs <preview|bump> <value>",
  );
  console.error("   Examples:");
  console.error("   - node replace-app-elements.mjs preview 085e9c3");
  console.error("   - node replace-app-elements.mjs bump 6.10.2");
  console.error("   - node replace-app-elements.mjs bump latest");
  process.exit(1);
}

// Validate mode
if (mode !== "preview" && mode !== "bump") {
  console.error(`❌ Invalid mode: "${mode}". Must be "preview" or "bump"`);
  process.exit(1);
}

// Validate value based on mode
if (mode === "preview") {
  // Commit hash should be at least 7 alphanumeric characters
  if (!/^[a-zA-Z0-9]{7,}$/.test(value)) {
    console.error(
      `❌ Invalid commit hash: "${value}". Must be at least 7 alphanumeric characters`,
    );
    process.exit(1);
  }
} else if (mode === "bump") {
  // Version should match semver format (e.g., 6.10.1, 6.10.1-beta.1) or be "latest"
  if (value !== "latest" && !/^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$/.test(value)) {
    console.error(
      `❌ Invalid version: "${value}". Must be a valid semver (e.g., 6.10.1) or "latest"`,
    );
    process.exit(1);
  }
}

// Main execution
(async () => {
  try {
    let finalValue = value;

    // Fetch latest version if requested
    if (mode === "bump" && value === "latest") {
      console.log("📦 Fetching latest version from npm...");
      try {
        finalValue = await fetchLatestVersion("@commercelayer/app-elements");
        console.log(`   Found: ${finalValue}\n`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`❌ ${message}`);
        process.exit(1);
      }
    }

    const currentValue = readCatalogEntry("@commercelayer/app-elements");
    const toValue =
      mode === "preview"
        ? `https://pkg.pr.new/commercelayer/app-elements/@commercelayer/app-elements@${finalValue}`
        : finalValue;

    // Show the hash for a preview url, not the whole url
    const display = (/** @type {string} */ v) =>
      v.startsWith("https://") ? v.split("@").pop() : v;

    if (currentValue === toValue) {
      console.log(
        `⚠️  app-elements is already ${display(toValue)}, nothing to update.`,
      );
      return;
    }

    writeCatalogEntry("@commercelayer/app-elements", toValue);

    console.log(
      `✅ app-elements ${display(currentValue)} → ${display(toValue)} in the pnpm-workspace.yaml catalog`,
    );
    console.log("");
    console.log("💡 Now run pnpm install to proceed");
  } catch (error) {
    console.error("❌ Error occurred:", error);
    process.exit(1);
  }
})();
