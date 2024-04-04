FROM oven/bun:latest

WORKDIR /next-app

COPY package.json /next-app
COPY bun.lockb /next-app

RUN bun install

COPY . /next-app

RUN bun prisma generate

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at run time
ENV NEXT_TELEMETRY_DISABLED 1

# for deploting the build version

# RUN bun next build
# and
# CMD bun next start

# OR for sart Next.js in development, comment above two lines and uncomment below line

CMD ["bun","run","dev"]