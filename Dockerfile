# Use official Node image
FROM node:24.6.0-alpine

# Set working directory
WORKDIR /app

# Copy only package.json first
COPY package*.json ./
RUN npm ci --only=production
RUN npm install pm2 -g
# Install dependencies inside the container
RUN npm install

# Copy the rest of the app
COPY . .

# Expose the port your app runs on
EXPOSE 8000

# Start app with PM2
CMD ["pm2-runtime", "start", "npm", "--", "--name", "next_event-backend", "--", "start"]
