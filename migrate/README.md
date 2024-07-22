# Migrate to mono-repository

```sh
npm --prefix migrate install
npm --prefix migrate start

# --- --- --- --- --- --- --- --- --- --- --- --- ---

pnpm i
pnpm update

pnpm build:apps-multi

pnpm --filter app-orders --filter app-promotions build

# pnpm --filter app-elements exec vite build --watch
pnpm dev
```
