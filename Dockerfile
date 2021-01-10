FROM alpine:latest
MAINTAINER Chance Hudson

ENV CHROME_BIN="/usr/bin/chromium-browser" \
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
RUN set -x \
    && apk update \
    && apk upgrade \
    && apk add --no-cache \
    nodejs-npm \
    udev \
    ttf-freefont \
    chromium

COPY . /src
WORKDIR /src

RUN npm ci

CMD ["node", "/src"]
