FROM node:alpine AS builder
WORKDIR /app
RUN apk add protoc
COPY package.json yarn.lock ./
RUN yarn
COPY . .
RUN yarn protoc
RUN yarn build
USER node
EXPOSE 8080
WORKDIR /app
CMD node /app/dist/main