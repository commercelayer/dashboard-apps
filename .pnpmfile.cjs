// Opt-in local development against a sibling app-elements checkout.
//
// Every package here depends on the published `@commercelayer/app-elements`. To
// test local changes to it, set this env var instead of editing the dependency
// in ~20 `package.json` files:
//
//   APP_ELEMENTS_LOCAL=/absolute/path/to/app-elements/packages/app-elements pnpm install
//
// and to go back to the published build:
//
//   pnpm install && git checkout pnpm-lock.yaml
//
// Injecting an override (rather than rewriting each dependency) switches *every*
// package at once, which matters: a workspace where some packages resolve the
// checkout and others the published build ends up with two copies of
// app-elements, and therefore two React context sets.
//
// No `package.json` is touched; only `pnpm-lock.yaml` records the switch.
//
// Note on the hook used: `readPackage` cannot do this. As of pnpm 11 it runs for
// dependency manifests only, never for the workspace projects' own manifests, so
// it cannot change what an app depends on. `updateConfig` reaches the resolved
// pnpm config, where an override does apply to workspace projects.

const PACKAGE = "@commercelayer/app-elements"

module.exports = {
  hooks: {
    updateConfig(config) {
      const localPath = process.env.APP_ELEMENTS_LOCAL

      if (localPath == null || localPath === "") {
        return config
      }

      config.overrides = {
        ...config.overrides,
        // absolute, so it does not depend on how deeply the consuming package sits
        [PACKAGE]: `link:${localPath}`,
      }

      return config
    },
  },
}
