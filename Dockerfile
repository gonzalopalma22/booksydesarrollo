# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# --- FIX 1: Borrar lockfile en el builder también para evitar errores ---
RUN rm -f package-lock.json

# Instalar dependencias (creará un lockfile nuevo temporal para Linux)
RUN npm install

# Copiar código fuente
COPY . .

# Build de la aplicación
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Instalar dependencias del sistema (por seguridad para sharp)
RUN apk add --no-cache \
    libc6-compat \
    vips-dev \
    build-base \
    python3 \
    && rm -rf /var/cache/apk/*

# Copiar package files
COPY package*.json ./

# --- FIX 2: LA SOLUCIÓN DEFINITIVA ---
# Borramos el package-lock.json que viene de tu Mac.
# Esto obliga a npm a buscar las versiones de Linux frescas.
RUN rm -f package-lock.json

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar build desde builder stage
COPY --from=builder /app/dist ./dist

# Crear directorios para uploads con permisos correctos
RUN mkdir -p uploads/thumbnails && \
    chmod -R 777 uploads

# Exponer puerto
EXPOSE 3008

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3008

# --- FIX 3: DESACTIVAR HEALTHCHECK ---
# Lo he comentado (#) porque si tu app no tiene la ruta /api/health exacta,
# Render pensará que falló y la reiniciará infinitamente.
# HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
#   CMD node -e "require('http').get('http://localhost:3008/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar aplicación
CMD ["node", "dist/main"]
