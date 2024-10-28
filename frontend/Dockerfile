# Use the official Node.js runtime as the base image
FROM node:lts-alpine as build

# Set build-time environment variables
ARG AUTH_AUTHORITY=https://keyloak:8080/auth/realms/master
ARG AUTH_CLIENT_ID=client_id

# Set environment variables
ENV AUTH_AUTHORITY=$AUTH_AUTHORITY
ENV AUTH_CLIENT_ID=$AUTH_CLIENT_ID

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the entire application code to the container
COPY . .

# Build the React app for production
RUN npm run build

# Use Nginx as the production server
FROM nginx:stable-alpine-slim

# Copy the built React app to Nginx's web server directory
COPY --from=build /app/build/client /usr/share/nginx/html

COPY config/nginx.conf /etc/nginx/nginx.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]
