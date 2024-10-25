# Fase de build
FROM node:16-alpine AS build

WORKDIR /app

# Copiar los archivos necesarios para la construcción
COPY package.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto del código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Fase de producción
FROM nginx:alpine

# Copiar los archivos de build a Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Exponer el puerto 5173 para el tráfico HTTP
EXPOSE 5173

# Comando por defecto para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]