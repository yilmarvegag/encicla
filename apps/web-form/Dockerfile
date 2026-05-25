# apps/web-form/Dockerfile
FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copiar archivos de configuración
COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

# Copiar la aplicación específica
COPY apps/web-form ./apps/web-form

# Instalar dependencias y build
RUN pnpm install --frozen-lockfile

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

RUN cd apps/web-form && pnpm build

# Cambiar al directorio de trabajo correcto
WORKDIR /app/apps/web-form

# Exponer puerto
EXPOSE 3000

# Comando corregido - usar pnpm start directamente
CMD ["pnpm", "start"]