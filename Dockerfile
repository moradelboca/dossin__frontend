# Etapa 1: Construcción
FROM node:20.16.0 AS builder

# Define las variables de entorno durante la construcción
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de package.json y package-lock.json (o yarn.lock)
COPY package.json ./
COPY package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación React
RUN npm run build

# Etapa 2: Servir la aplicación
FROM node:20.16.0 AS runner

WORKDIR /app

# Copia los archivos generados en la etapa de construcción
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public

# Instala solo las dependencias de producción
RUN npm install --only=production

# Expone el puerto en el que correrá la aplicación
EXPOSE 5173

# Comando para iniciar la aplicación
CMD ["npm", "start"]

