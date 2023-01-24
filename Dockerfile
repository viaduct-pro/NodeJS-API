FROM node:14-alpine

RUN apk update

RUN apk add  --no-cache ffmpeg

WORKDIR /usr/src/app

COPY ./package.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 80

CMD ["npm", "run", "start:prod"]