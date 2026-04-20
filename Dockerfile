# ========================
# 1. Base
# ========================
FROM node:24-alpine

WORKDIR /app

# 🔥 WAJIB untuk native deps + prisma
RUN apk add --no-cache libc6-compat openssl python3 make g++

# ========================
# 2. Install deps
# ========================
COPY package*.json ./

# gunakan npm ci kalau ada lock file
RUN npm ci || npm install

# ========================
# 3. Copy source
# ========================
COPY . .

# ========================
# 4. Prisma
# ========================
RUN npx prisma generate

# ========================
# 5. Build Next.js
# ========================
RUN npm run build

# ========================
# 6. Run
# ========================
EXPOSE 3000

CMD ["npm", "start"]