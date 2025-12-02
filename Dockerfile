# ---------- Etapa 1: Build ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar dependencias e instalar
COPY package*.json ./
RUN npm install

# Copiar el resto del proyecto
COPY . .

# RUN npx prisma generate --schema=prisma/dev_app/schema.prisma
# RUN npx prisma generate --schema=prisma/dev_auto_storage/schema.prisma

# Compilar Next.js (usa turbopack)
RUN npm run build

# ---------- Etapa 2: Runtime ----------
FROM node:22-alpine AS runner

WORKDIR /app

# Copiar solo los archivos necesarios
COPY --from=builder /app ./

# Configurar variables de entorno del contenedor
ENV NODE_ENV=production
ENV PORT=3017

EXPOSE 3015

# Ejecutar la app
CMD ["npm", "start"]