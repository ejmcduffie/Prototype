FROM node:18-alpine

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./
COPY contracts/ ./contracts/
COPY scripts/ ./scripts/

# Install dependencies
RUN npm install

# Expose Hardhat node port
EXPOSE 8545

# Start Hardhat node
CMD ["npx", "hardhat", "node", "--hostname", "0.0.0.0"]
