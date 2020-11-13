FROM node:10-slim

ENV REGISTRY=https://registry.npmjs.org/

COPY ./ /opt/server

RUN cd /opt/server \
    && npm install --production --registry=$REGISTRY

EXPOSE 7001

CMD [ "npm", "start:docker" ]
