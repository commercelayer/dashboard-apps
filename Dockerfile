# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app
ENV CI=true
RUN corepack enable

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY apps ./apps

# Base router path for the project
ENV PUBLIC_PROJECT_PATH=""

# When set it defines the slug for the self hosted version of the project
ENV PUBLIC_SELF_HOSTED_SLUG=""

RUN pnpm install --frozen-lockfile
RUN pnpm --sequential --color --filter "app-*" build

FROM nginx:1.29-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
