# Migrate to mono-repository

```sh
npm --prefix migrate install
npm --prefix migrate start

# --- --- --- --- --- --- --- --- --- --- --- --- ---

pnpm i
pnpm update

pnpm build:elements
pnpm build:apps

pnpm --filter app-elements exec vite build --watch
pnpm dev
```
