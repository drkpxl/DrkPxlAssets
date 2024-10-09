FROM node:20.18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

CMD ["node", "src/app.js"]

