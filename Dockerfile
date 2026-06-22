# Root Dockerfile — builds the BACKEND from the repo root context.
# Lets Render (or any Docker host) deploy the API without setting a Root Directory.
# (The per-service Dockerfiles in backend/ and frontend/ are used by docker-compose.)

# ---- Build stage ----
FROM node:22-slim AS build
WORKDIR /app
# OpenSSL is required by Prisma's engines.
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
COPY backend/prisma ./prisma
# npm ci triggers postinstall "prisma generate" (schema already present).
RUN npm ci
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY backend/package*.json ./
# Reuse the build's node_modules (Prisma client + engines already generated for this platform).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist
EXPOSE 4000
# Apply the Prisma schema to the database, then start the API.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
