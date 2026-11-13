from node:18-alpine
workdir /app
copy package*.jsson ./
run npm install
copy . .
expose 3000
cmd ["npm", "start"]