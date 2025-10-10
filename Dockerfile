FROM node:24-bookworm AS builder

COPY package.json package-lock.json /usr/local/app/

COPY prisma /usr/local/app/prisma/

WORKDIR /usr/local/app

RUN npm install && \
    npx prisma generate

COPY . .

RUN npm run build

FROM node:24-alpine3.21 AS runner
# node is user, node is group
COPY --from=builder --chown=node:node /usr/local/app/package*.json ./
COPY --from=builder --chown=node:node /usr/local/app/dist ./dist
COPY --from=builder --chown=node:node /usr/local/app/prisma ./prisma
COPY --from=builder --chown=node:node /usr/local/app/generated ./generated
COPY --from=builder --chown=node:node /usr/local/app/node_modules ./node_modules

EXPOSE 3000

# create a non-root user to run our application
# RUN useradd --user-group --create-home --shell /bin/false nodes

# use non-root user to run our application
USER node

ENTRYPOINT [ "npm" ]

CMD ["run", "start:prod"]