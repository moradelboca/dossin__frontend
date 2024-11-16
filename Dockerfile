FROM node:20.16.0 AS builder

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}

WORKDIR /

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20.16.0 AS runner

WORKDIR /

COPY --from=builder /build ./build
COPY --from=builder /package.json ./

RUN npm install --omit=dev

RUN npm install -g serve
EXPOSE 5173
CMD ["serve", "-s", "build", "-l", "5173"]
