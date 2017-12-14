FROM node:6-alpine
MAINTAINER OpusCapita

WORKDIR /home/node/styles

ARG PORT=3000

ENV HOST=0.0.0.0
ENV PORT=$PORT

COPY . .

RUN npm set progress=false && npm install ; npm cache clean

USER node

EXPOSE $PORT

CMD npm start