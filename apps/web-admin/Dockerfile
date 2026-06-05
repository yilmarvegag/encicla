# apps/web-form/Dockerfile (VERSIÓN CORREGIDA)
FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

# Copiar la aplicación específica
COPY apps/web-admin ./apps/web-admin

# Instalar dependencias y build
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN cd apps/web-admin && pnpm build

# Cambiar al directorio de trabajo correcto
WORKDIR /app/apps/web-admin

# Exponer puerto
EXPOSE 3000

# Comando corregido - usar pnpm start directamente
CMD ["pnpm", "start"]