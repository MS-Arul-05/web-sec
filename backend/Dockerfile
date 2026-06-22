# ---- Build stage ----
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# npm ci triggers the postinstall "prisma generate" (schema already present).
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ---- Runtime stage ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
COPY prisma ./prisma
# npm ci triggers postinstall "prisma generate" (schema already present).
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
EXPOSE 4000
# Apply schema to the database, then start the API.
CMD ["sh", "-c", "npx prisma db push --skip-generate && node dist/server.js"]
