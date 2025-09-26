# Etapa de build
FROM node:20-alpine AS builder
WORKDIR /app

# Copia archivos de pnpm desde la raíz
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./

# Copia el frontend específico y sus dependencias
COPY apps/web-admin ./apps/web-admin

# Instala dependencias con pnpm (sin --frozen-lockfile para depurar)
RUN corepack enable && pnpm install --prod

# Build del frontend
WORKDIR /app/apps/web-admin
RUN pnpm build

# Etapa final (runtime)
FROM node:20-alpine AS runner
WORKDIR /app/apps/web-admin

ENV NODE_ENV=production
ENV PORT=3000

# Copia el build y las dependencias necesarias
COPY --from=builder /app/apps/web-admin/.next ./.next
COPY --from=builder /app/apps/web-admin/package.json ./
COPY --from=builder /app/apps/web-admin/node_modules ./node_modules
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml

# Instala solo dependencias de producción (sin --frozen-lockfile)
RUN corepack enable && pnpm install --prod

# Expone puerto
EXPOSE 3000

# Comando para iniciar el servidor Next.js
CMD ["pnpm", "start"]