FROM node:alpine AS builder
WORKDIR /app
RUN apk add protoc
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn build

FROM node:alpine AS runner
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn --production
COPY --from=builder /app/dist ./dist
COPY . .
USER node
EXPOSE 8080
CMD node /app/dist/main
