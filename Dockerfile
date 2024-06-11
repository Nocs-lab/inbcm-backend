FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apt-get update -qq && apt-get install -qy \
  ca-certificates \
  bzip2 \
  curl \
  libfontconfig \
  --no-install-recommends \
  && curl -SL https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2 > phantom.tar.bz2 \
  && bzip2 -d ./phantom.tar.bz2 \
  && tar -xvf ./phantom.tar -C /usr/local/ --strip-components=1 \
  && rm phantom.tar \
  && apt-get -qy remove bzip2 curl \
  && rm -rf /var/lib/apt/lists/*
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
EXPOSE 3000
CMD [ "pnpm", "start" ]
