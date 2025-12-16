# --- Etapa de Construcción (Builder) ---
FROM node:20-slim AS builder

WORKDIR /app

# Copiamos los archivos de configuración
COPY package*.json ./

# 1. Borramos el package-lock de Mac para evitar conflictos
RUN rm -f package-lock.json

# 2. Instalamos todas las dependencias (generará un lockfile nuevo para Linux)
RUN npm install

# Copiamos el resto del código
COPY . .

# Construimos la aplicación
RUN npm run build

# --- Etapa de Producción ---
FROM node:20-slim

WORKDIR /app

# 3. Instalamos dependencias del sistema necesarias para Sharp (versión Debian)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiamos los json
COPY package*.json ./

# 4. Borramos de nuevo el lockfile para asegurar instalación limpia
RUN rm -f package-lock.json

# 5. Instalamos SOLO producción (Sharp descargará el binario correcto de Linux aquí)
RUN npm install --only=production

# Copiamos la carpeta 'dist' creada en la etapa anterior
COPY --from=builder /app/dist ./dist

# Crear carpetas de subida
RUN mkdir -p uploads/thumbnails && \
    chmod -R 777 uploads

# Configuración de puerto y entorno
ENV NODE_ENV=production
ENV PORT=3008
EXPOSE 3008

# Sin Healthcheck para evitar esperas infinitas
# HEALTHCHECK ... (Desactivado)

# Arrancar la app
CMD ["node", "dist/main"]
