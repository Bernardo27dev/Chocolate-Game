FROM node:16

WORKDIR /Downloads

COPY backend/package.json ./
RUN npm install

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]