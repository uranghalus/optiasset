FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++

# 1. Copy HANYA file package dan folder prisma terlebih dahulu
COPY package.json package-lock.json ./
COPY prisma ./prisma/

# 2. Install dependencies (Langkah ini akan di-cache oleh Docker!)
RUN npm install

# 3. Generate Prisma Client
RUN npx prisma generate

# 4. Copy sisa kode aplikasi (Setelah dependencies aman di-cache)
COPY . .

# 5. Build Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]