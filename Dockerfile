# scratch is a reserved name that refers to an empty image
# define base image
# FROM scratch
FROM node:24-alpine3.21

COPY package.json package-lock.json /usr/local/bin/

WORKDIR /usr/local/bin

RUN npm install

COPY . /usr/local/bin/

# ENV PORT=3000 // not best practice environment variable

# ADD /usr/local/bin/logs

# ENTRYPOINT [ "executable" ]

CMD ["npm", "start"]