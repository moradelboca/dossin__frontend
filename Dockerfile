# Etapa 1: Construcción
FROM node:20.16.0 AS builder

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json (o yarn.lock)
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación Next.js
RUN npm run build

# Etapa 2: Servir la aplicación
FROM node:20.16.0 AS runner

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios desde la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Instala solo las dependencias de producción
RUN npm install --only=production

# Expone el puerto en el que correrá la aplicación
EXPOSE 5173

# Comando para iniciar la aplicación
CMD ["npm", "start"]
