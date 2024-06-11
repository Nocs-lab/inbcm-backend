FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base as deps
COPY package.json pnpm-lock.yaml /app/
RUN pnpm fetch --store-dir=/pnpm/store

FROM deps AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod

FROM deps AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
COPY . /app
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "start" ]
