// vite.config.ts
import react from "file:///Users/marcomontalbano/Projects/cl/dashboard-apps/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@5.3.4_@types+node@20.14.11_terser@5.31.3_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { resolve } from "path";
import dts from "file:///Users/marcomontalbano/Projects/cl/dashboard-apps/node_modules/.pnpm/vite-plugin-dts@3.9.1_@types+node@20.14.11_rollup@4.18.1_typescript@5.5.3_vite@5.3.4_@types+node@20.14.11_terser@5.31.3_/node_modules/vite-plugin-dts/dist/index.mjs";
import { defineConfig } from "file:///Users/marcomontalbano/Projects/cl/dashboard-apps/node_modules/.pnpm/vitest@2.0.3_@types+node@20.14.11_jsdom@24.1.0_terser@5.31.3/node_modules/vitest/dist/config.js";

// package.json
var package_default = {
  name: "@commercelayer/app-elements",
  version: "2.1.1",
  type: "module",
  license: "MIT",
  files: [
    "dist"
  ],
  module: "./dist/main.js",
  types: "./dist/main.d.ts",
  exports: {
    ".": {
      import: "./dist/main.js"
    },
    "./style.css": {
      import: "./dist/style.css"
    },
    "./vendor.css": {
      import: "./dist/vendor.css"
    },
    "./tailwind.config": {
      require: "./dist/tailwind.config.js"
    }
  },
  engines: {
    node: ">=18",
    pnpm: ">=7"
  },
  scripts: {
    build: "tsc && vite build && pnpm build:css-vendor && pnpm build:tailwind-cfg",
    "build:tailwind-cfg": "cp ./tailwind.config.cjs ./dist/tailwind.config.js",
    "build:css-vendor": "pnpm dlx tailwindcss -i ./src/styles/vendor.css -o ./dist/vendor.css --minify",
    lint: "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    test: "vitest run",
    "test:watch": "vitest",
    "ts:check": "tsc --noEmit"
  },
  dependencies: {
    "@commercelayer/sdk": "6.10.0",
    "@types/lodash": "^4.17.7",
    "@types/react": "^18.3.3",
    "@types/react-datepicker": "^6.2.0",
    "@types/react-dom": "^18.3.0",
    classnames: "^2.5.1",
    "jwt-decode": "^4.0.0",
    lodash: "^4.17.21",
    pluralize: "^8.0.0",
    "query-string": "^9.0.0",
    react: "^18.3.1",
    "react-currency-input-field": "^3.8.0",
    "react-datepicker": "^7.3.0",
    "react-dom": "^18.3.1",
    "react-hook-form": "^7.52.1",
    "react-select": "^5.8.0",
    "react-tooltip": "^5.27.1",
    swr: "^2.2.5",
    "ts-invariant": "^0.10.3",
    "type-fest": "^4.22.1",
    zod: "^3.23.8"
  },
  devDependencies: {
    "@commercelayer/eslint-config-ts-react": "^1.4.5",
    "@hookform/resolvers": "^3.9.0",
    "@phosphor-icons/react": "v2.1.7",
    "@tailwindcss/forms": "^0.5.7",
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@types/node": "^20.14.11",
    "@types/pluralize": "^0.0.33",
    "@types/react-gtm-module": "^2.0.3",
    "@types/testing-library__jest-dom": "^5.14.9",
    "@vitejs/plugin-react": "^4.3.1",
    autoprefixer: "^10.4.19",
    "cross-fetch": "^4.0.0",
    "date-fns": "^3.6.0",
    "date-fns-tz": "^3.1.3",
    eslint: "^8.57.0",
    jsdom: "^24.1.0",
    msw: "^2.3.2",
    postcss: "^8.4.39",
    "react-gtm-module": "^2.0.11",
    tailwindcss: "^3.4.6",
    typescript: "^5.5.3",
    vite: "^5.3.4",
    "vite-plugin-dts": "^3.9.1",
    vitest: "^2.0.3",
    wouter: "^3.3.1"
  },
  peerDependencies: {
    "@commercelayer/sdk": "^6.x",
    "query-string": "^8.2.x",
    react: "^18.2.x",
    "react-dom": "^18.2.x",
    "react-gtm-module": "^2.x",
    "react-hook-form": "^7.50.x",
    wouter: "^3.x"
  }
};

// vite.config.ts
var __vite_injected_original_dirname = "/Users/marcomontalbano/Projects/cl/dashboard-apps/packages/app-elements";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ["src"]
    })
  ],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__vite_injected_original_dirname, "src/main.ts"),
      name: "Blocks",
      // the proper extensions will be added
      fileName: "main",
      formats: ["es"]
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: Object.keys(package_default.peerDependencies),
      output: {
        banner: `'use client';`,
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      }
    }
  },
  resolve: {
    alias: {
      "#providers": resolve(__vite_injected_original_dirname, "./src/providers"),
      "#ui": resolve(__vite_injected_original_dirname, "./src/ui"),
      "#styles": resolve(__vite_injected_original_dirname, "./src/styles"),
      "#utils": resolve(__vite_injected_original_dirname, "./src/utils"),
      "#helpers": resolve(__vite_injected_original_dirname, "./src/helpers"),
      "#hooks": resolve(__vite_injected_original_dirname, "./src/hooks"),
      "#dictionaries": resolve(__vite_injected_original_dirname, "./src/dictionaries")
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [
      "./react-testing-library.config.js",
      "./src/mocks/setup.ts",
      "./src/mocks/stubs.ts"
    ]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAicGFja2FnZS5qc29uIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL21hcmNvbW9udGFsYmFuby9Qcm9qZWN0cy9jbC9kYXNoYm9hcmQtYXBwcy9wYWNrYWdlcy9hcHAtZWxlbWVudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9Vc2Vycy9tYXJjb21vbnRhbGJhbm8vUHJvamVjdHMvY2wvZGFzaGJvYXJkLWFwcHMvcGFja2FnZXMvYXBwLWVsZW1lbnRzL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9tYXJjb21vbnRhbGJhbm8vUHJvamVjdHMvY2wvZGFzaGJvYXJkLWFwcHMvcGFja2FnZXMvYXBwLWVsZW1lbnRzL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgZHRzIGZyb20gJ3ZpdGUtcGx1Z2luLWR0cydcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGVzdC9jb25maWcnXG5pbXBvcnQgcGtnIGZyb20gJy4vcGFja2FnZS5qc29uJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZHRzKHtcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgICBpbmNsdWRlOiBbJ3NyYyddXG4gICAgfSlcbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIC8vIENvdWxkIGFsc28gYmUgYSBkaWN0aW9uYXJ5IG9yIGFycmF5IG9mIG11bHRpcGxlIGVudHJ5IHBvaW50c1xuICAgICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCAnc3JjL21haW4udHMnKSxcbiAgICAgIG5hbWU6ICdCbG9ja3MnLFxuICAgICAgLy8gdGhlIHByb3BlciBleHRlbnNpb25zIHdpbGwgYmUgYWRkZWRcbiAgICAgIGZpbGVOYW1lOiAnbWFpbicsXG4gICAgICBmb3JtYXRzOiBbJ2VzJ11cbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIC8vIG1ha2Ugc3VyZSB0byBleHRlcm5hbGl6ZSBkZXBzIHRoYXQgc2hvdWxkbid0IGJlIGJ1bmRsZWRcbiAgICAgIC8vIGludG8geW91ciBsaWJyYXJ5XG4gICAgICBleHRlcm5hbDogT2JqZWN0LmtleXMocGtnLnBlZXJEZXBlbmRlbmNpZXMpLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGJhbm5lcjogYCd1c2UgY2xpZW50JztgLFxuICAgICAgICAvLyBQcm92aWRlIGdsb2JhbCB2YXJpYWJsZXMgdG8gdXNlIGluIHRoZSBVTUQgYnVpbGRcbiAgICAgICAgLy8gZm9yIGV4dGVybmFsaXplZCBkZXBzXG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICcjcHJvdmlkZXJzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9wcm92aWRlcnMnKSxcbiAgICAgICcjdWknOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL3VpJyksXG4gICAgICAnI3N0eWxlcyc6IHJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvc3R5bGVzJyksXG4gICAgICAnI3V0aWxzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy91dGlscycpLFxuICAgICAgJyNoZWxwZXJzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9oZWxwZXJzJyksXG4gICAgICAnI2hvb2tzJzogcmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9ob29rcycpLFxuICAgICAgJyNkaWN0aW9uYXJpZXMnOiByZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2RpY3Rpb25hcmllcycpXG4gICAgfVxuICB9LFxuICB0ZXN0OiB7XG4gICAgZ2xvYmFsczogdHJ1ZSxcbiAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICBzZXR1cEZpbGVzOiBbXG4gICAgICAnLi9yZWFjdC10ZXN0aW5nLWxpYnJhcnkuY29uZmlnLmpzJyxcbiAgICAgICcuL3NyYy9tb2Nrcy9zZXR1cC50cycsXG4gICAgICAnLi9zcmMvbW9ja3Mvc3R1YnMudHMnXG4gICAgXVxuICB9XG59KVxuIiwgIntcbiAgXCJuYW1lXCI6IFwiQGNvbW1lcmNlbGF5ZXIvYXBwLWVsZW1lbnRzXCIsXG4gIFwidmVyc2lvblwiOiBcIjIuMS4xXCIsXG4gIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxuICBcImxpY2Vuc2VcIjogXCJNSVRcIixcbiAgXCJmaWxlc1wiOiBbXG4gICAgXCJkaXN0XCJcbiAgXSxcbiAgXCJtb2R1bGVcIjogXCIuL2Rpc3QvbWFpbi5qc1wiLFxuICBcInR5cGVzXCI6IFwiLi9kaXN0L21haW4uZC50c1wiLFxuICBcImV4cG9ydHNcIjoge1xuICAgIFwiLlwiOiB7XG4gICAgICBcImltcG9ydFwiOiBcIi4vZGlzdC9tYWluLmpzXCJcbiAgICB9LFxuICAgIFwiLi9zdHlsZS5jc3NcIjoge1xuICAgICAgXCJpbXBvcnRcIjogXCIuL2Rpc3Qvc3R5bGUuY3NzXCJcbiAgICB9LFxuICAgIFwiLi92ZW5kb3IuY3NzXCI6IHtcbiAgICAgIFwiaW1wb3J0XCI6IFwiLi9kaXN0L3ZlbmRvci5jc3NcIlxuICAgIH0sXG4gICAgXCIuL3RhaWx3aW5kLmNvbmZpZ1wiOiB7XG4gICAgICBcInJlcXVpcmVcIjogXCIuL2Rpc3QvdGFpbHdpbmQuY29uZmlnLmpzXCJcbiAgICB9XG4gIH0sXG4gIFwiZW5naW5lc1wiOiB7XG4gICAgXCJub2RlXCI6IFwiPj0xOFwiLFxuICAgIFwicG5wbVwiOiBcIj49N1wiXG4gIH0sXG4gIFwic2NyaXB0c1wiOiB7XG4gICAgXCJidWlsZFwiOiBcInRzYyAmJiB2aXRlIGJ1aWxkICYmIHBucG0gYnVpbGQ6Y3NzLXZlbmRvciAmJiBwbnBtIGJ1aWxkOnRhaWx3aW5kLWNmZ1wiLFxuICAgIFwiYnVpbGQ6dGFpbHdpbmQtY2ZnXCI6IFwiY3AgLi90YWlsd2luZC5jb25maWcuY2pzIC4vZGlzdC90YWlsd2luZC5jb25maWcuanNcIixcbiAgICBcImJ1aWxkOmNzcy12ZW5kb3JcIjogXCJwbnBtIGRseCB0YWlsd2luZGNzcyAtaSAuL3NyYy9zdHlsZXMvdmVuZG9yLmNzcyAtbyAuL2Rpc3QvdmVuZG9yLmNzcyAtLW1pbmlmeVwiLFxuICAgIFwibGludFwiOiBcImVzbGludCBzcmMgLS1leHQgLnRzLC50c3hcIixcbiAgICBcImxpbnQ6Zml4XCI6IFwiZXNsaW50IHNyYyAtLWV4dCAudHMsLnRzeCAtLWZpeFwiLFxuICAgIFwidGVzdFwiOiBcInZpdGVzdCBydW5cIixcbiAgICBcInRlc3Q6d2F0Y2hcIjogXCJ2aXRlc3RcIixcbiAgICBcInRzOmNoZWNrXCI6IFwidHNjIC0tbm9FbWl0XCJcbiAgfSxcbiAgXCJkZXBlbmRlbmNpZXNcIjoge1xuICAgIFwiQGNvbW1lcmNlbGF5ZXIvc2RrXCI6IFwiNi4xMC4wXCIsXG4gICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTcuN1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0XCI6IFwiXjE4LjMuM1wiLFxuICAgIFwiQHR5cGVzL3JlYWN0LWRhdGVwaWNrZXJcIjogXCJeNi4yLjBcIixcbiAgICBcIkB0eXBlcy9yZWFjdC1kb21cIjogXCJeMTguMy4wXCIsXG4gICAgXCJjbGFzc25hbWVzXCI6IFwiXjIuNS4xXCIsXG4gICAgXCJqd3QtZGVjb2RlXCI6IFwiXjQuMC4wXCIsXG4gICAgXCJsb2Rhc2hcIjogXCJeNC4xNy4yMVwiLFxuICAgIFwicGx1cmFsaXplXCI6IFwiXjguMC4wXCIsXG4gICAgXCJxdWVyeS1zdHJpbmdcIjogXCJeOS4wLjBcIixcbiAgICBcInJlYWN0XCI6IFwiXjE4LjMuMVwiLFxuICAgIFwicmVhY3QtY3VycmVuY3ktaW5wdXQtZmllbGRcIjogXCJeMy44LjBcIixcbiAgICBcInJlYWN0LWRhdGVwaWNrZXJcIjogXCJeNy4zLjBcIixcbiAgICBcInJlYWN0LWRvbVwiOiBcIl4xOC4zLjFcIixcbiAgICBcInJlYWN0LWhvb2stZm9ybVwiOiBcIl43LjUyLjFcIixcbiAgICBcInJlYWN0LXNlbGVjdFwiOiBcIl41LjguMFwiLFxuICAgIFwicmVhY3QtdG9vbHRpcFwiOiBcIl41LjI3LjFcIixcbiAgICBcInN3clwiOiBcIl4yLjIuNVwiLFxuICAgIFwidHMtaW52YXJpYW50XCI6IFwiXjAuMTAuM1wiLFxuICAgIFwidHlwZS1mZXN0XCI6IFwiXjQuMjIuMVwiLFxuICAgIFwiem9kXCI6IFwiXjMuMjMuOFwiXG4gIH0sXG4gIFwiZGV2RGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjb21tZXJjZWxheWVyL2VzbGludC1jb25maWctdHMtcmVhY3RcIjogXCJeMS40LjVcIixcbiAgICBcIkBob29rZm9ybS9yZXNvbHZlcnNcIjogXCJeMy45LjBcIixcbiAgICBcIkBwaG9zcGhvci1pY29ucy9yZWFjdFwiOiBcInYyLjEuN1wiLFxuICAgIFwiQHRhaWx3aW5kY3NzL2Zvcm1zXCI6IFwiXjAuNS43XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L2plc3QtZG9tXCI6IFwiXjYuNC42XCIsXG4gICAgXCJAdGVzdGluZy1saWJyYXJ5L3JlYWN0XCI6IFwiXjE2LjAuMFwiLFxuICAgIFwiQHR5cGVzL25vZGVcIjogXCJeMjAuMTQuMTFcIixcbiAgICBcIkB0eXBlcy9wbHVyYWxpemVcIjogXCJeMC4wLjMzXCIsXG4gICAgXCJAdHlwZXMvcmVhY3QtZ3RtLW1vZHVsZVwiOiBcIl4yLjAuM1wiLFxuICAgIFwiQHR5cGVzL3Rlc3RpbmctbGlicmFyeV9famVzdC1kb21cIjogXCJeNS4xNC45XCIsXG4gICAgXCJAdml0ZWpzL3BsdWdpbi1yZWFjdFwiOiBcIl40LjMuMVwiLFxuICAgIFwiYXV0b3ByZWZpeGVyXCI6IFwiXjEwLjQuMTlcIixcbiAgICBcImNyb3NzLWZldGNoXCI6IFwiXjQuMC4wXCIsXG4gICAgXCJkYXRlLWZuc1wiOiBcIl4zLjYuMFwiLFxuICAgIFwiZGF0ZS1mbnMtdHpcIjogXCJeMy4xLjNcIixcbiAgICBcImVzbGludFwiOiBcIl44LjU3LjBcIixcbiAgICBcImpzZG9tXCI6IFwiXjI0LjEuMFwiLFxuICAgIFwibXN3XCI6IFwiXjIuMy4yXCIsXG4gICAgXCJwb3N0Y3NzXCI6IFwiXjguNC4zOVwiLFxuICAgIFwicmVhY3QtZ3RtLW1vZHVsZVwiOiBcIl4yLjAuMTFcIixcbiAgICBcInRhaWx3aW5kY3NzXCI6IFwiXjMuNC42XCIsXG4gICAgXCJ0eXBlc2NyaXB0XCI6IFwiXjUuNS4zXCIsXG4gICAgXCJ2aXRlXCI6IFwiXjUuMy40XCIsXG4gICAgXCJ2aXRlLXBsdWdpbi1kdHNcIjogXCJeMy45LjFcIixcbiAgICBcInZpdGVzdFwiOiBcIl4yLjAuM1wiLFxuICAgIFwid291dGVyXCI6IFwiXjMuMy4xXCJcbiAgfSxcbiAgXCJwZWVyRGVwZW5kZW5jaWVzXCI6IHtcbiAgICBcIkBjb21tZXJjZWxheWVyL3Nka1wiOiBcIl42LnhcIixcbiAgICBcInF1ZXJ5LXN0cmluZ1wiOiBcIl44LjIueFwiLFxuICAgIFwicmVhY3RcIjogXCJeMTguMi54XCIsXG4gICAgXCJyZWFjdC1kb21cIjogXCJeMTguMi54XCIsXG4gICAgXCJyZWFjdC1ndG0tbW9kdWxlXCI6IFwiXjIueFwiLFxuICAgIFwicmVhY3QtaG9vay1mb3JtXCI6IFwiXjcuNTAueFwiLFxuICAgIFwid291dGVyXCI6IFwiXjMueFwiXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVksT0FB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
