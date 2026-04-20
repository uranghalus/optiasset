FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++

# copy semua file langsung (hindari cache issue)
COPY . .

# install deps setelah semua file masuk
RUN npm install

# pastikan prisma schema terbaca
RUN ls prisma

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]