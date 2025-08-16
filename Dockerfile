FROM node:22-bookworm AS builder

WORKDIR /usr/local/app

COPY package*.json ./

COPY prisma ./prisma/

RUN npm install --only-production && \
    npx prisma generate

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

COPY --from=builder --chown=node:node  /usr/local/app/package*.json ./
COPY --from=builder --chown=node:node /usr/local/app/dist ./dist
COPY --from=builder --chown=node:node /usr/local/app/prisma ./prisma
COPY --from=builder --chown=node:node /usr/local/app/generated ./generated
COPY --from=builder --chown=node:node /usr/local/app/node_modules ./node_modules

EXPOSE 3000

USER node

ENTRYPOINT [ "npm" ]

CMD [ "run", "start:prod" ]