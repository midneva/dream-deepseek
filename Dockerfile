FROM node:18
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install
COPY . .
CMD ["node", "server/server.js"]
