# Migrate to mono-repository

```sh
pnpm --filter migrate start

pnpm i

pnpm --filter app-elements build

pnpm dev
pnpm --filter app-elements exec vite build --watch
```
