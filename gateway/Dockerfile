FROM node:alpine

RUN apk --no-cache add --virtual native-deps \
  g++ gcc libgcc libstdc++ linux-headers autoconf automake make nasm python git && \
  npm install --quiet node-gyp -g

WORKDIR /gateway

COPY package.json .
COPY package-lock.json .
COPY config.json .
COPY build/app.js .

RUN npm install --production

EXPOSE 3050

CMD node app