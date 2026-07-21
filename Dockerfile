# Stage 1: DEPS
FROM node:24-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 2: BUILDER
FROM node:24-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG DATABASE_URL
ARG DIRECT_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG ADMIN_USER_ID
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=CLERK_SECRET_KEY
ENV ADMIN_USER_ID=$ADMIN_USER_ID
RUN npm run build

# Stage 3: RUNNER
FROM node:24-slim AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["npm", "dev"]