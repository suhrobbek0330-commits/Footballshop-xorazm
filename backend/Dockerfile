# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Expose port (Backend port 5000 as seen in previous logs)
EXPOSE 5000

# Start command
CMD ["npm", "start"]
