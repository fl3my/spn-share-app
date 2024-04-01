# Use Node.js 21.6.2 image as the base image
FROM node:21.6.2-alpine

# Set the working directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the source code
COPY . .

# Compile the typescript to javascript
RUN npm run build

# Set environment variables
ENV HOST=0.0.0.0
ENV PORT=80

# Expose the port
EXPOSE 80

# Start the application
CMD ["node", "dist/index.js"]