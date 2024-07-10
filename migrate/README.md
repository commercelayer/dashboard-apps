# Migrate to mono-repository

```sh
npm --prefix migrate install
npm --prefix migrate start

# --- --- --- --- --- --- --- --- --- --- --- --- ---

pnpm i

pnpm --filter app-elements build

pnpm --filter app-elements exec vite build --watch
pnpm dev
```

## TODO

- update all deps to latest
- circleci deploy
- netlify deploy
- vercel deploy
