FROM node:8
WORKDIR User/telegram-contest
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
