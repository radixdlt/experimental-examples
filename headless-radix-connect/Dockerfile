FROM node:20 as base

WORKDIR /home/node/app

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD npm run dev