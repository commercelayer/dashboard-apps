// @ts-check

/**
 * This script replaces @commercelayer/app-elements versions across all package.json files.
 * It supports two modes:
 * - preview: Replace with a pkg.pr.new preview URL using a commit hash
 * - bump: Replace with a production version
 *
 * @example pnpm elements:preview 085e9c3
 * @example pnpm elements:bump 6.10.2
 * @example pnpm elements:bump latest
 */

import { readFileSync, readdirSync } from "fs";
import { get } from "https";
import { join } from "path";
import { replaceInFileSync } from "replace-in-file";

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

    // Get current app-elements value from packages/index/package.json (read fresh from disk)
    const indexPackageJsonPath = "./packages/index/package.json";
    const packageJson = JSON.parse(readFileSync(indexPackageJsonPath, "utf-8"));
    const currentValue =
      packageJson.dependencies["@commercelayer/app-elements"];

    if (!currentValue) {
      console.error(
        "❌ Could not find @commercelayer/app-elements in packages/index/package.json",
      );
      process.exit(1);
    }

    /**
     * Count package.json files containing the current app-elements value
     * @param {string} dir - Directory to scan (apps or packages)
     * @returns {number} Count of files containing the dependency
     */
    function countFilesWithDependency(dir) {
      let count = 0;
      try {
        const subdirs = readdirSync(dir, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name);

        for (const subdir of subdirs) {
          const pkgPath = join(dir, subdir, "package.json");
          try {
            const content = readFileSync(pkgPath, "utf-8");
            if (
              content.includes("@commercelayer/app-elements") &&
              content.includes(currentValue)
            ) {
              count++;
            }
          } catch {
            // Skip if package.json doesn't exist
          }
        }
      } catch (error) {
        console.error(`Error scanning ${dir}:`, error);
      }
      return count;
    }

    // Count files before replacement
    const appsCount = countFilesWithDependency("./apps");
    const packagesCount = countFilesWithDependency("./packages");

    // Display what we found
    const displayValue = currentValue.startsWith("https://")
      ? currentValue.split("@").pop() // Extract hash from URL
      : currentValue;

    console.log(
      `📦 app-elements ${displayValue} found in ${appsCount} apps and ${packagesCount} packages\n`,
    );

    // Build the search pattern - need to match the full dependency line
    // Current value could be either a version or a URL
    let fromPattern;
    if (currentValue.startsWith("https://")) {
      // Escape special regex characters in URL
      const escapedUrl = currentValue.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      fromPattern = new RegExp(
        `("@commercelayer/app-elements":\\s*)"${escapedUrl}"`,
        "g",
      );
    } else {
      fromPattern = new RegExp(
        `("@commercelayer/app-elements":\\s*)"${currentValue}"`,
        "g",
      );
    }

    // Build the replacement string
    const toValue =
      mode === "preview"
        ? `$1"https://pkg.pr.new/commercelayer/app-elements/@commercelayer/app-elements@${finalValue}"`
        : `$1"${finalValue}"`;

    const results = replaceInFileSync({
      files: ["./apps/**/package.json", "./packages/**/package.json"],
      ignore: ["**/node_modules/**"],
      from: fromPattern,
      to: toValue,
      countMatches: true,
    });

    // Separate results by directory
    const changedFiles = results.filter((r) => r.hasChanged);
    const appsUpdated = changedFiles.filter((r) =>
      r.file.startsWith("apps/"),
    ).length;
    const packagesUpdated = changedFiles.filter((r) =>
      r.file.startsWith("packages/"),
    ).length;

    // Display results
    if (changedFiles.length > 0) {
      console.log("✅ Replacement completed:");
      console.log(`   - Updated ${appsUpdated} of 18 apps`);
      console.log(`   - Updated ${packagesUpdated} of 3 packages`);
      console.log("");
      console.log("💡 Now run pnpm install to proceed");
    } else {
      console.log(
        "⚠️  No files were updated. The version might already be set.",
      );
    }
  } catch (error) {
    console.error("❌ Error occurred:", error);
    process.exit(1);
  }
})();
