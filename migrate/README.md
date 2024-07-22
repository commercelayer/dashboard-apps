# Migrate to mono-repository

```sh
npm --prefix migrate install
npm --prefix migrate start

# --- --- --- --- --- --- --- --- --- --- --- --- ---

pnpm i
pnpm update

pnpm lint --fix
pnpm test
pnpm ts:check

pnpm build:apps

pnpm --filter app-orders --filter app-promotions build

# pnpm --filter app-elements exec vite build --watch
pnpm dev
```
