FROM node:14.15.1-alpine3.10
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*"]
RUN npm install --production
COPY . .
CMD [ "node", "index.js" ]