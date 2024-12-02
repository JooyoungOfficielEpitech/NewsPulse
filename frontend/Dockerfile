# Use a lightweight Node.js image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy only the package.json and yarn.lock first for dependency installation
COPY package.json yarn.lock ./

# Install dependencies using Yarn
RUN yarn install

# Copy the rest of the application code
COPY . .

# Build the application for production
RUN yarn build

# Install a lightweight HTTP server to serve the built app
RUN yarn global add serve

# Expose the port used by the server
EXPOSE 3000

# Use the HTTP server to serve the built files on 0.0.0.0
CMD ["serve", "-s", "dist", "-l", "3000"]
