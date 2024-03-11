# Use the official Node.js 14 image as the base image
FROM node:14

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to work directory
COPY src/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY src .

# Expose port 3000 on the container
EXPOSE 3000

# Command to run your app
CMD ["node", "app.js"]
