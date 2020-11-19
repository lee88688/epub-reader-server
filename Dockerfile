FROM node:10-slim

ENV REGISTRY=https://registry.npm.taobao.org
ENV ASAR_DIR=/opt/asar

COPY ./ /opt/server

RUN cd /opt/server \
    && npm install --production --registry=$REGISTRY

EXPOSE 7001

WORKDIR /opt/server

CMD [ "npm","run", "start:docker" ]
