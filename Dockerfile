FROM node:20.16.0 AS builder

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
ARG VITE_AUTH_URL
ENV VITE_AUTH_URL=${VITE_AUTH_URL}
ARG VITE_DASHBOARD_URL
ENV VITE_DASHBOARD_URL=${VITE_DASHBOARD_URL}
ARG VITE_STAGE
ENV VITE_STAGE=${VITE_STAGE}

WORKDIR /

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20.16.0 AS runner

WORKDIR /

COPY --from=builder /dist ./dist
COPY --from=builder /package.json ./
COPY --from=builder /public ./public

RUN npm install --omit=dev

RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
