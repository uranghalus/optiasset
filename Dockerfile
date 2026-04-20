# ========================
# 1. Base image + deps
# ========================
FROM node:20-alpine AS base

WORKDIR /app

# 🔥 penting untuk prisma & native deps
RUN apk add --no-cache libc6-compat openssl

# ========================
# 2. Install dependencies
# ========================
FROM base AS deps

COPY package.json ./

# 🔥 gunakan npm ci (lebih stabil dari npm install)
RUN npm install

# ========================
# 3. Build
# ========================
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# prisma generate
RUN npx prisma generate

RUN npm run build

# ========================
# 4. Production
# ========================
FROM base AS runner

ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["npm", "start"]