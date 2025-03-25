# Stage 1: Base
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install

# Stage 2: Development
FROM base AS development
ENV NODE_ENV=development
VOLUME /app/src
VOLUME /app/public
EXPOSE 3000

# Install watchman for file watching
RUN apk add --no-cache watchman

CMD ["npm", "run", "start"]

# Stage 3: Build
FROM base AS build
COPY . .
RUN npm run build

# Stage 4: Production
FROM nginx:alpine AS production
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]