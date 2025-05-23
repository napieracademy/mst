FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Aggiungo le variabili d'ambiente necessarie per il build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_TMDB_API_KEY
ARG RESEND_API_KEY

# Imposta nuovamente le variabili d'ambiente per la fase di build
RUN echo "Creating .env.production file with required variables"
RUN echo "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL" > .env.production
RUN echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY" >> .env.production
RUN echo "NEXT_PUBLIC_TMDB_API_KEY=$NEXT_PUBLIC_TMDB_API_KEY" >> .env.production
RUN echo "NEXT_PUBLIC_SITE_URL=https://mastroianni.app" >> .env.production
RUN echo "NEXT_PUBLIC_API_URL=https://mastroianni.app" >> .env.production
RUN echo "OMDB_API_KEY=e039393b" >> .env.production
RUN echo "RESEND_API_KEY=$RESEND_API_KEY" >> .env.production
RUN echo "Creating .env file for backward compatibility"
RUN cp .env.production .env
RUN cat .env

RUN echo "Starting build process..." && \
    env && \
    npm run build || { echo "Build failed with error code $?"; exit 1; }

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Debug: List files to check if server.js exists
RUN ls -la /app

USER nextjs

EXPOSE 10000

ENV PORT=10000
ENV HOSTNAME="0.0.0.0"

# Fallback to starting Next.js directly if server.js doesn't exist
CMD ["sh", "-c", "if [ -f server.js ]; then node server.js; else node node_modules/next/dist/bin/next start; fi"] 