# Use official Node image
FROM node:24.6.0-alpine

# Set working directory
WORKDIR /app

# Copy only package.json first
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["npm", "run", "dev"]
